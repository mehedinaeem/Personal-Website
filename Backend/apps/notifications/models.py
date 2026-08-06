from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
import hashlib


class Reminder(models.Model):
    TYPES = [(x, x.replace("_", " ").title()) for x in (
        "task_due", "goal_due", "opportunity_deadline", "application_follow_up",
        "application_next_action", "learning_target", "travel_start", "travel_itinerary",
        "travel_checklist", "custom",
    )]
    CHANNELS = [("telegram", "Telegram"), ("email", "Email")]
    STATUSES = [(x, x.title()) for x in ("pending", "processing", "sent", "failed", "cancelled")]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reminders")
    task = models.ForeignKey("tasks.Task", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    goal = models.ForeignKey("progress.Goal", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    opportunity = models.ForeignKey("opportunities.Opportunity", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    application = models.ForeignKey("opportunities.Application", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    learning_item = models.ForeignKey("learning.LearningItem", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    travel_plan = models.ForeignKey("travel.TravelPlan", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    travel_itinerary_item = models.ForeignKey("travel.TravelItineraryItem", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    travel_checklist_item = models.ForeignKey("travel.TravelChecklistItem", null=True, blank=True, on_delete=models.CASCADE, related_name="reminders")
    reminder_type = models.CharField(max_length=32, choices=TYPES)
    scheduled_at = models.DateTimeField()
    channel = models.CharField(max_length=12, choices=CHANNELS, default="telegram")
    status = models.CharField(max_length=12, choices=STATUSES, default="pending")
    attempt_count = models.PositiveSmallIntegerField(default=0)
    last_error = models.CharField(max_length=160, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    dedupe_key = models.CharField(max_length=64, unique=True, editable=False)

    REFERENCES = ("task", "goal", "opportunity", "application", "learning_item", "travel_plan", "travel_itinerary_item", "travel_checklist_item")

    class Meta:
        ordering = ["scheduled_at"]
        indexes = [models.Index(fields=["status", "scheduled_at"]), models.Index(fields=["owner", "status", "scheduled_at"])]

    def clean(self):
        errors = {}
        references = [getattr(self, name) for name in self.REFERENCES]
        if self.reminder_type != "custom" and not any(references):
            errors["reminder_type"] = "A non-custom reminder must reference a supported object."
        for name, obj in zip(self.REFERENCES, references):
            if obj and obj.owner_id != self.owner_id:
                errors[name] = "Referenced object must belong to you."
        if self.scheduled_at and timezone.is_naive(self.scheduled_at):
            errors["scheduled_at"] = "Reminder time must include timezone information."
        if not self.pk and self.scheduled_at and self.scheduled_at <= timezone.now():
            errors["scheduled_at"] = "Reminder time must be in the future."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        values = [str(self.owner_id), self.reminder_type, self.scheduled_at.isoformat() if self.scheduled_at else "", self.channel]
        values.extend(str(getattr(self, f"{name}_id") or "") for name in self.REFERENCES)
        self.dedupe_key = hashlib.sha256("|".join(values).encode()).hexdigest()
        return super().save(*args, **kwargs)
