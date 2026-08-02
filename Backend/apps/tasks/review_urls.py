from rest_framework.routers import DefaultRouter

from .views import DailyReviewViewSet

app_name = "daily-reviews"
router = DefaultRouter()
router.register("", DailyReviewViewSet, basename="daily-review")
urlpatterns = router.urls
