from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CookieTokenRefreshSerializer, LoginSerializer, UserSerializer
from .throttles import LoginRateThrottle


def set_refresh_cookie(response, token):
    response.set_cookie(
        key=settings.AUTH_REFRESH_COOKIE_NAME,
        value=token,
        max_age=settings.AUTH_REFRESH_COOKIE_MAX_AGE,
        path=settings.AUTH_REFRESH_COOKIE_PATH,
        secure=settings.AUTH_REFRESH_COOKIE_SECURE,
        httponly=settings.AUTH_REFRESH_COOKIE_HTTPONLY,
        samesite=settings.AUTH_REFRESH_COOKIE_SAMESITE,
    )


def clear_refresh_cookie(response):
    response.delete_cookie(
        settings.AUTH_REFRESH_COOKIE_NAME,
        path=settings.AUTH_REFRESH_COOKIE_PATH,
        samesite=settings.AUTH_REFRESH_COOKIE_SAMESITE,
    )


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        access, refresh = serializer.create_tokens()
        response = Response(
            {"access": access, "user": UserSerializer(serializer.validated_data["user"]).data}
        )
        set_refresh_cookie(response, refresh)
        return response


@method_decorator(csrf_protect, name="dispatch")
class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if not token:
            return Response({"detail": "Refresh token is missing."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CookieTokenRefreshSerializer(data={"refresh": token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            response = Response(
                {"detail": "Refresh token is invalid."}, status=status.HTTP_401_UNAUTHORIZED
            )
            clear_refresh_cookie(response)
            return response
        response = Response({"access": serializer.validated_data["access"]})
        rotated_token = serializer.validated_data.get("refresh")
        if rotated_token:
            set_refresh_cookie(response, rotated_token)
        return response


@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
