"""
URL configuration for portfolio project.
Includes API routes for applications and JWT authentication.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView
from applications.auth_views import (
    EmailTokenObtainPairView,
    TokenRefreshView,
    LogoutView,
    ProfileView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # JWT Authentication endpoints (using email-based login)
    path('api/auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/profile/', ProfileView.as_view(), name='profile'),
    
    # Applications API
    path('api/applications/', include('applications.urls')),
]

