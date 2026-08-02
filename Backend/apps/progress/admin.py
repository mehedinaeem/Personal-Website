from django.contrib import admin
from .models import ActivityLog, Goal, ProgressReview
admin.site.register((Goal, ProgressReview, ActivityLog))
