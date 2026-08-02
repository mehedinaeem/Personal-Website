from django.conf import settings
from django.db import models


class CapturedLink(models.Model):
    STATUSES = [
        ("pending", "Pending"),
        ("extracted", "Extracted"),
        ("manual_review_required", "Manual review required"),
        ("failed", "Failed"),
        ("reviewed", "Reviewed"),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="captured_links")
    url = models.URLField(max_length=2048)
    normalized_url = models.URLField(max_length=2048)
    source_platform = models.CharField(max_length=16, default="website")
    status = models.CharField(max_length=32, choices=STATUSES, default="pending")
    raw_metadata = models.JSONField(default=dict, blank=True)
    extracted_data = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_opportunity = models.OneToOneField(
        "opportunities.Opportunity", null=True, blank=True, on_delete=models.SET_NULL, related_name="captured_link"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["owner", "normalized_url"], name="unique_captured_url_per_owner")]
        indexes = [models.Index(fields=["owner", "status", "created_at"])]
