from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "is_staff")
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    default_error_messages = {"invalid_credentials": "Invalid email or password."}

    def validate(self, attrs):
        email = attrs["email"].strip()
        password = attrs["password"]
        user_record = User.objects.filter(email__iexact=email, is_active=True).only("username").first()
        user = authenticate(
            request=self.context.get("request"),
            username=user_record.username if user_record else email,
            password=password,
        )
        if user is None or not user.is_active:
            self.fail("invalid_credentials")
        attrs["user"] = user
        return attrs

    def create_tokens(self):
        refresh = RefreshToken.for_user(self.validated_data["user"])
        return str(refresh.access_token), str(refresh)


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = serializers.CharField(write_only=True)
