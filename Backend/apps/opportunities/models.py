from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Opportunity(models.Model):
    TYPES = [(x, x.title()) for x in ("job", "internship", "scholarship", "fellowship", "conference", "competition", "volunteer", "other")]
    PLATFORMS = [(x, x.title()) for x in ("facebook", "linkedin", "website", "email", "telegram", "other")]
    WORK_MODES = [(x, x.replace("_", " ").title()) for x in ("remote", "onsite", "hybrid", "not_specified")]
    STATUSES = [(x, x.title()) for x in ("captured", "reviewing", "saved", "ignored", "expired")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="opportunities")
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    opportunity_type = models.CharField(max_length=20, choices=TYPES)
    source_platform = models.CharField(max_length=16, choices=PLATFORMS, default="website")
    source_url = models.URLField(blank=True)
    application_url = models.URLField(blank=True)
    summary = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    work_mode = models.CharField(max_length=16, choices=WORK_MODES, default="not_specified")
    deadline = models.DateTimeField(null=True, blank=True)
    eligibility = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    funding_or_salary = models.CharField(max_length=255, blank=True)
    contact_information = models.TextField(blank=True)
    extraction_confidence = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_deadline_confirmed = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=STATUSES, default="captured")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["deadline", "-created_at"]
        indexes = [models.Index(fields=["owner", "status", "deadline"]), models.Index(fields=["owner", "opportunity_type", "organization"])]

    @property
    def is_deadline_passed(self):
        return bool(self.deadline and self.deadline < timezone.now())


class Application(models.Model):
    STAGES = [(x, x.replace("_", " ").title()) for x in ("saved", "reviewing", "preparing_documents", "ready_to_apply", "applied", "assessment", "interview", "waiting_for_result", "selected", "rejected", "withdrawn", "expired")]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name="applications")
    stage = models.CharField(max_length=24, choices=STAGES, default="saved")
    applied_at = models.DateTimeField(null=True, blank=True)
    application_id = models.CharField(max_length=120, blank=True)
    account_email = models.EmailField(blank=True)
    next_action = models.TextField(blank=True)
    next_action_at = models.DateTimeField(null=True, blank=True)
    expected_result_at = models.DateTimeField(null=True, blank=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    cv_version = models.CharField(max_length=120, blank=True)
    cover_letter_reference = models.CharField(max_length=255, blank=True)
    documents_checklist = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    submission_activity = models.OneToOneField("progress.ActivityLog", null=True, blank=True, on_delete=models.SET_NULL, related_name="application_submission")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["follow_up_at", "next_action_at", "-created_at"]
        constraints = [models.UniqueConstraint(fields=["owner", "opportunity"], name="unique_application_per_opportunity_owner")]
        indexes = [models.Index(fields=["owner", "stage", "follow_up_at"]), models.Index(fields=["owner", "next_action_at"])]
