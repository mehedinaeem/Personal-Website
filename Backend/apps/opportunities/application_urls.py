from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet

app_name = "applications"
router = DefaultRouter()
router.register("", ApplicationViewSet, basename="application")
urlpatterns = router.urls
