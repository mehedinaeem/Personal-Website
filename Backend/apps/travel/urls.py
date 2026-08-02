from rest_framework.routers import DefaultRouter
from .views import TravelPlanViewSet

app_name = "travel"
router = DefaultRouter()
router.register("plans", TravelPlanViewSet, basename="plan")
urlpatterns = router.urls
