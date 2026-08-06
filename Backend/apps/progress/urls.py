from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet, ReviewViewSet, analytics, analytics_csv, progress_summary

app_name = "progress"
router = DefaultRouter()
router.register("reviews", ReviewViewSet, basename="review")
router.register("activities", ActivityViewSet, basename="activity")
urlpatterns = [path("summary/", progress_summary, name="summary"), path("analytics/", analytics, name="analytics"), path("analytics/export/", analytics_csv, name="analytics-csv"), *router.urls]
