"""
URL configuration for portfolio project.
Includes API routes for applications and JWT authentication.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenVerifyView
from applications.auth_views import (
    EmailTokenObtainPairView,
    TokenRefreshView,
    LogoutView,
    ProfileView,
)


def health_check(request):
    """Simple health check endpoint to keep server awake."""
    return JsonResponse({'status': 'ok', 'message': 'Server is awake!'})


urlpatterns = [
    # Health check / Keep alive
    path('api/ping/', health_check, name='health-check'),
    
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
