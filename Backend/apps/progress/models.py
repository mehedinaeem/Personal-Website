from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Goal(models.Model):
    PERIODS = [(x, x.title()) for x in ("daily", "weekly", "monthly", "quarterly", "yearly", "custom")]
    CATEGORIES = [(x, x.replace("_", " ").title()) for x in ("research", "university", "career", "programming", "learning", "jkkniu_research_society", "health", "travel", "personal", "financial", "other")]
    STATUSES = [(x, x.title()) for x in ("planned", "active", "completed", "paused", "cancelled")]
    PRIORITIES = [(x, x.title()) for x in ("low", "medium", "high", "critical")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    period_type = models.CharField(max_length=16, choices=PERIODS)
    category = models.CharField(max_length=32, choices=CATEGORIES, default="personal")
    start_date = models.DateField()
    end_date = models.DateField()
    target_value = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    current_value = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=16, choices=STATUSES, default="planned")
    priority = models.CharField(max_length=16, choices=PRIORITIES, default="medium")
    related_tasks = models.ManyToManyField("tasks.Task", blank=True, related_name="goals")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["end_date", "-priority"]
        indexes = [models.Index(fields=["owner", "period_type", "status", "end_date"]), models.Index(fields=["owner", "category", "start_date"])]

    @property
    def completion_percentage(self):
        target = Decimal(self.target_value)
        current = Decimal(self.current_value)
        if not target:
            return 0.0
        return round(min(float(current / target * 100), 100.0), 2)

    def save(self, *args, **kwargs):
        reopened = self.pk and type(self).objects.filter(pk=self.pk, status="completed").exists()
        if self.status == "completed":
            self.completed_at = self.completed_at or timezone.now()
        elif reopened:
            self.completed_at = None
        super().save(*args, **kwargs)


class ProgressReview(models.Model):
    PERIODS = [(x, x.title()) for x in ("daily", "weekly", "monthly", "quarterly", "yearly")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="progress_reviews")
    period_type = models.CharField(max_length=16, choices=PERIODS)
    period_start = models.DateField()
    period_end = models.DateField()
    summary = models.TextField(blank=True)
    completed_work = models.TextField(blank=True)
    important_achievements = models.TextField(blank=True)
    unfinished_work = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    lessons_learned = models.TextField(blank=True)
    next_priorities = models.TextField(blank=True)
    productivity_rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    learning_rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    wellbeing_rating = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    planned_items_count = models.PositiveIntegerField(default=0)
    completed_items_count = models.PositiveIntegerField(default=0)
    total_minutes_spent = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-period_start"]
        constraints = [models.UniqueConstraint(fields=["owner", "period_type", "period_start", "period_end"], name="unique_progress_review_period")]
        indexes = [models.Index(fields=["owner", "period_type", "period_start", "period_end"])]


class ActivityLog(models.Model):
    TYPES = [(x, x.title()) for x in ("work", "research", "study", "learning", "project", "meeting", "event", "application", "travel", "exercise", "personal", "other")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_logs")
    activity_date = models.DateField(default=timezone.localdate)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=32, default="other")
    activity_type = models.CharField(max_length=20, choices=TYPES)
    minutes_spent = models.PositiveIntegerField(default=0)
    progress_value = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    result = models.TextField(blank=True)
    challenge = models.TextField(blank=True)
    lesson_learned = models.TextField(blank=True)
    next_action = models.TextField(blank=True)
    related_task = models.ForeignKey("tasks.Task", null=True, blank=True, on_delete=models.SET_NULL, related_name="activity_logs")
    related_goal = models.ForeignKey(Goal, null=True, blank=True, on_delete=models.SET_NULL, related_name="activity_logs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-activity_date", "-created_at"]
        indexes = [models.Index(fields=["owner", "activity_date", "category"]), models.Index(fields=["owner", "activity_type", "activity_date"])]
