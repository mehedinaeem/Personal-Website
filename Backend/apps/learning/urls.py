from rest_framework.routers import DefaultRouter
from .views import LearningItemViewSet

app_name = "learning"
router = DefaultRouter()
router.register("items", LearningItemViewSet, basename="item")
urlpatterns = router.urls
