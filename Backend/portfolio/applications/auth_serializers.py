"""
Custom JWT authentication serializers.
Allows login with email instead of username.
"""

from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that accepts email instead of username for login.
    """
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with email
        self.fields.pop('username', None)
        self.fields['email'] = serializers.EmailField(required=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Try to find user by email first (handle duplicates gracefully)
            user = User.objects.filter(email=email).first()
            if user:
                username = user.username
            else:
                # If not found by email, try username (for backwards compatibility)
                username = email
            
            # Authenticate
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError({
                    'detail': 'No active account found with the given credentials'
                })
            
            if not user.is_active:
                raise serializers.ValidationError({
                    'detail': 'This account is inactive'
                })
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.get_full_name() or user.username,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }
            }
        
        raise serializers.ValidationError({
            'detail': 'Must include "email" and "password"'
        })
