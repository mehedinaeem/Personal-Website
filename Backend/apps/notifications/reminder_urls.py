from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views_reminders import ReminderViewSet

router = DefaultRouter()
router.register("", ReminderViewSet, basename="reminder")
urlpatterns = [path("", include(router.urls))]
