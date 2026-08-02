from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", include("apps.dashboard.health_urls")),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/tasks/", include("apps.tasks.urls")),
    path("api/v1/goals/", include("apps.progress.goal_urls")),
    path("api/v1/progress/", include("apps.progress.urls")),
    path("api/v1/learning/", include("apps.learning.urls")),
    path("api/v1/travel/", include("apps.travel.urls")),
    path("api/v1/opportunities/", include("apps.opportunities.urls")),
    path("api/v1/applications/", include("apps.opportunities.application_urls")),
    path("api/v1/capture/", include("apps.capture.urls")),
    path("api/v1/reminders/", include("apps.notifications.urls")),
    path("api/v1/dashboard/", include("apps.dashboard.urls")),
    path("api/v1/contacts/", include("apps.contacts.urls")),
    path("api/v1/portfolio/", include("apps.portfolio.urls")),
]
