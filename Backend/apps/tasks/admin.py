from django.contrib import admin

from .models import DailyReview, Task, TaskProgressLog

admin.site.register((Task, TaskProgressLog, DailyReview))
