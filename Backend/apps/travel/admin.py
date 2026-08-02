from django.contrib import admin
from .models import TravelChecklistItem, TravelItineraryItem, TravelPlan
admin.site.register((TravelPlan, TravelItineraryItem, TravelChecklistItem))
