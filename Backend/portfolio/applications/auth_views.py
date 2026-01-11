"""
Custom JWT views for authentication.
Handles login, logout, and token refresh with httpOnly cookies for refresh tokens.
"""

from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .auth_serializers import EmailTokenObtainPairSerializer


class EmailTokenObtainPairView(APIView):
    """
    Custom token view that uses email for authentication.
    Sets refresh token as httpOnly cookie.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailTokenObtainPairSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            data = serializer.validated_data
            response = Response({
                'access': data['access'],
                'user': data['user'],
            })
            
            # Set refresh token as httpOnly cookie
            response.set_cookie(
                key='refresh_token',
                value=data['refresh'],
                httponly=True,
                secure=not settings.DEBUG,  # Secure in production
                samesite='Lax',
                max_age=7 * 24 * 60 * 60,  # 7 days
                path='/',
            )
            
            return response
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshView(APIView):
    """
    Refresh access token using the refresh token from httpOnly cookie.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            # Rotate refresh token for security
            new_refresh = str(refresh)
            
            response = Response({'access': access_token})
            
            # Update the refresh token cookie
            response.set_cookie(
                key='refresh_token',
                value=new_refresh,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=7 * 24 * 60 * 60,
                path='/',
            )
            
            return response
            
        except TokenError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    Logout by blacklisting the refresh token and clearing the cookie.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        response = Response({'detail': 'Successfully logged out'})
        
        # Clear the refresh token cookie
        response.delete_cookie('refresh_token', path='/')
        
        # Blacklist the refresh token if it exists
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # Token already invalid, ignore
        
        return response


class ProfileView(APIView):
    """
    Get current user's profile.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })

