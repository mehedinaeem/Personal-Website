from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class TravelPlan(models.Model):
    STATUSES = [(x, x.title()) for x in ("idea", "planning", "booked", "ongoing", "completed", "cancelled")]
    PURPOSES = [(x, x.title()) for x in ("personal", "academic", "conference", "research", "work", "family", "tourism", "other")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="travel_plans")
    title = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    purpose = models.CharField(max_length=16, choices=PURPOSES)
    status = models.CharField(max_length=16, choices=STATUSES, default="idea")
    start_date = models.DateField()
    end_date = models.DateField()
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default="BDT")
    transportation = models.TextField(blank=True)
    accommodation = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date"]
        indexes = [models.Index(fields=["owner", "status", "start_date"])]


class TravelItineraryItem(models.Model):
    TYPES = [(x, x.title()) for x in ("transport", "accommodation", "meeting", "conference", "activity", "meal", "other")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="travel_itinerary_items")
    travel_plan = models.ForeignKey(TravelPlan, on_delete=models.CASCADE, related_name="itinerary")
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    item_type = models.CharField(max_length=20, choices=TYPES)
    booking_reference = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at"]
        indexes = [models.Index(fields=["owner", "start_at"])]


class TravelChecklistItem(models.Model):
    CATEGORIES = [(x, x.title()) for x in ("documents", "booking", "packing", "finance", "academic", "work", "health", "other")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="travel_checklist_items")
    travel_plan = models.ForeignKey(TravelPlan, on_delete=models.CASCADE, related_name="checklist")
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=16, choices=CATEGORIES, default="other")
    is_completed = models.BooleanField(default=False)
    due_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["is_completed", "due_at"]
        indexes = [models.Index(fields=["owner", "is_completed", "due_at"])]
