from django.conf import settings
from django.db import models


class OwnedTimestampedModel(models.Model):
    """Abstract foundation for private, user-owned, time-queryable records."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_records",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        indexes = [
            models.Index(
                fields=["owner", "created_at"],
                name="%(app_label)s_%(class)s_oc_idx",
            )
        ]
