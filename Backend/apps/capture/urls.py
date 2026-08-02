from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CapturedLinkViewSet

router = DefaultRouter()
router.register("", CapturedLinkViewSet, basename="captured-link")

app_name = "capture"
urlpatterns = [path("", include(router.urls))]
