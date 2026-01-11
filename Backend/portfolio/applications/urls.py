"""
URL configuration for applications API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, trigger_reminders

router = DefaultRouter()
router.register(r'', ApplicationViewSet, basename='application')

urlpatterns = [
    path('trigger-reminders/', trigger_reminders, name='trigger-reminders'),
    path('', include(router.urls)),
]
