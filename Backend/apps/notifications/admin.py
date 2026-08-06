from django.contrib import admin

from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ("reminder_type", "owner", "scheduled_at", "channel", "status", "attempt_count")
    list_filter = ("reminder_type", "channel", "status")
    readonly_fields = ("attempt_count", "last_error", "sent_at", "created_at", "updated_at")
