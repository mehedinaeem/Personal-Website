from django.contrib import admin
from .models import LearningItem, LearningSession
admin.site.register((LearningItem, LearningSession))
