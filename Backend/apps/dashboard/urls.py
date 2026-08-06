from django.urls import path
from .views import summary

app_name = "dashboard"
urlpatterns = [path("summary/", summary, name="summary")]
