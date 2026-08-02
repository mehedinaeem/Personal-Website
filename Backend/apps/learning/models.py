from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator, URLValidator
from django.db import models
from django.utils import timezone


class LearningItem(models.Model):
    TYPES = [(x, x.replace("_", " ").title()) for x in ("course", "book", "article", "research_paper", "video", "documentation", "practice", "workshop", "mentorship", "other")]
    STATUSES = [(x, x.replace("_", " ").title()) for x in ("planned", "in_progress", "completed", "paused", "dropped")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_items")
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=120, blank=True)
    skill = models.CharField(max_length=120, blank=True)
    learning_type = models.CharField(max_length=24, choices=TYPES)
    resource_name = models.CharField(max_length=255, blank=True)
    resource_url = models.URLField(blank=True, validators=[URLValidator(schemes=["https"])])
    status = models.CharField(max_length=16, choices=STATUSES, default="planned")
    start_date = models.DateField(null=True, blank=True)
    target_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    target_hours = models.DecimalField(max_digits=9, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    completed_hours = models.DecimalField(max_digits=9, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    confidence_before = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    confidence_after = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["target_date", "title"]
        indexes = [models.Index(fields=["owner", "status", "target_date"]), models.Index(fields=["owner", "skill"])]

    @property
    def completion_percentage(self):
        if not self.target_hours:
            return 0.0
        return round(min(float(self.completed_hours / self.target_hours * Decimal(100)), 100.0), 2)


class LearningSession(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_sessions")
    learning_item = models.ForeignKey(LearningItem, on_delete=models.CASCADE, related_name="sessions")
    session_date = models.DateField(default=timezone.localdate)
    minutes_spent = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    topics_covered = models.TextField(blank=True)
    new_knowledge = models.TextField(blank=True)
    practice_completed = models.TextField(blank=True)
    difficulty_rating = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-session_date", "-created_at"]
        indexes = [models.Index(fields=["owner", "session_date"]), models.Index(fields=["learning_item", "session_date"])]
