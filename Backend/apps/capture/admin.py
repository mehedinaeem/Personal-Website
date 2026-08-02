from django.contrib import admin

from .models import CapturedLink


@admin.register(CapturedLink)
class CapturedLinkAdmin(admin.ModelAdmin):
    list_display = ("url", "owner", "source_platform", "status", "created_at")
    list_filter = ("source_platform", "status")
    search_fields = ("url", "owner__username")
    readonly_fields = ("raw_metadata", "extracted_data", "created_at", "updated_at")
