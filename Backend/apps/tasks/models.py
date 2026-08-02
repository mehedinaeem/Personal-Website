from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Task(models.Model):
    class Area(models.TextChoices):
        RESEARCH = "research", "Research"
        UNIVERSITY = "university", "University"
        CAREER = "career", "Career"
        JKKNIU_RESEARCH_SOCIETY = "jkkniu_research_society", "JKKNIU Research Society"
        PROGRAMMING = "programming", "Programming"
        LEARNING = "learning", "Learning"
        TRAVEL = "travel", "Travel"
        PERSONAL = "personal", "Personal"
        OTHER = "other", "Other"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        IN_PROGRESS = "in_progress", "In progress"
        BLOCKED = "blocked", "Blocked"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    area = models.CharField(max_length=32, choices=Area.choices, default=Area.PERSONAL)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PLANNED)
    start_at = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    estimated_minutes = models.PositiveIntegerField(default=0)
    actual_minutes = models.PositiveIntegerField(default=0)
    next_action = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.CharField(max_length=255, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_at", "-priority", "-created_at"]
        indexes = [
            models.Index(fields=["owner", "status", "due_at"]),
            models.Index(fields=["owner", "area", "due_at"]),
            models.Index(fields=["owner", "created_at"]),
        ]

    def clean(self):
        errors = {}
        for field in ("start_at", "due_at", "completed_at"):
            value = getattr(self, field)
            if value is not None and timezone.is_naive(value):
                errors[field] = "Datetime values must include timezone information."
        if self.start_at and self.due_at and self.due_at < self.start_at:
            errors["due_at"] = "Due time cannot be earlier than start time."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        was_completed = False
        if self.pk:
            was_completed = type(self).objects.filter(pk=self.pk, status=self.Status.COMPLETED).exists()
        if self.status == self.Status.COMPLETED:
            self.progress_percentage = 100
            if not self.completed_at:
                self.completed_at = timezone.now()
        elif was_completed:
            self.completed_at = None
        self.full_clean()
        return super().save(*args, **kwargs)


class TaskProgressLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="progress_logs")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_progress_logs"
    )
    log_date = models.DateField(default=timezone.localdate)
    progress_before = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    progress_after = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    work_completed = models.TextField(blank=True)
    blocker = models.TextField(blank=True)
    next_step = models.TextField(blank=True)
    minutes_spent = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-log_date", "-created_at"]
        indexes = [models.Index(fields=["owner", "log_date"]), models.Index(fields=["task", "log_date"])]


class DailyReview(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_reviews")
    review_date = models.DateField(default=timezone.localdate)
    completed_today = models.TextField(blank=True)
    unfinished_work = models.TextField(blank=True)
    main_blocker = models.TextField(blank=True)
    tomorrow_priority = models.TextField(blank=True)
    productivity_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-review_date"]
        constraints = [
            models.UniqueConstraint(fields=["owner", "review_date"], name="unique_daily_review_per_owner")
        ]
        indexes = [models.Index(fields=["owner", "review_date"])]
