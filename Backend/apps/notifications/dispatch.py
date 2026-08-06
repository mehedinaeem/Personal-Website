from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import Reminder
from .telegram import TelegramPermanentError, TelegramTemporaryError, send_telegram_message

MAX_ATTEMPTS = 3
LOOKBACK = timedelta(days=7)
STALE_PROCESSING = timedelta(minutes=30)
BATCH_SIZE = 50


def claim_due_reminders(now=None):
    now = now or timezone.now()
    with transaction.atomic():
        Reminder.objects.select_for_update(skip_locked=True).filter(
            status="processing", updated_at__lte=now - STALE_PROCESSING,
        ).update(status="pending", last_error="Previous processing claim expired.", updated_at=now)
        rows = list(Reminder.objects.select_for_update(skip_locked=True).filter(
            status="pending", scheduled_at__lte=now, scheduled_at__gte=now - LOOKBACK,
            attempt_count__lt=MAX_ATTEMPTS,
        ).order_by("scheduled_at")[:BATCH_SIZE])
        ids = [row.id for row in rows]
        Reminder.objects.filter(id__in=ids, status="pending").update(status="processing", updated_at=now)
    return ids


def dispatch_due_reminders(now=None):
    sent = failed = 0
    for reminder_id in claim_due_reminders(now):
        try:
            reminder = Reminder.objects.select_related("owner", *Reminder.REFERENCES).get(pk=reminder_id, status="processing")
        except Reminder.DoesNotExist:
            continue
        try:
            deliver(reminder)
        except TelegramPermanentError:
            finish_failure(reminder_id, "Notification provider permanently rejected the message.", permanent=True)
            failed += 1
        except (TelegramTemporaryError, TimeoutError, ConnectionError):
            finish_failure(reminder_id, "Temporary notification delivery failure.")
            failed += 1
        except Exception:
            finish_failure(reminder_id, "Unexpected notification delivery failure.")
            failed += 1
        else:
            Reminder.objects.filter(pk=reminder_id, status="processing").update(
                status="sent", sent_at=timezone.now(), last_error="", attempt_count=reminder.attempt_count + 1,
            )
            sent += 1
    return sent, failed


def finish_failure(reminder_id, safe_error, permanent=False):
    with transaction.atomic():
        reminder = Reminder.objects.select_for_update().get(pk=reminder_id)
        if reminder.status != "processing":
            return
        reminder.attempt_count += 1
        reminder.status = "failed" if permanent or reminder.attempt_count >= MAX_ATTEMPTS else "pending"
        reminder.last_error = safe_error[:160]
        reminder.save(update_fields=["attempt_count", "status", "last_error", "updated_at"])


def deliver(reminder):
    message = reminder_message(reminder)
    if reminder.channel == "telegram":
        send_telegram_message(settings.TELEGRAM_CHAT_ID, message)
        return
    if not reminder.owner.email:
        raise TelegramPermanentError("No email recipient configured.")
    sent = send_mail("Portfolio reminder", message, settings.DEFAULT_FROM_EMAIL, [reminder.owner.email], fail_silently=False)
    if sent != 1:
        raise TelegramTemporaryError("Email delivery failed.")


def reminder_message(reminder):
    root = settings.FRONTEND_URL.rstrip("/")
    local = timezone.localtime(reminder.scheduled_at).strftime("%d %B %Y, %I:%M %p")
    if reminder.task:
        item = reminder.task
        return f"Task due soon\n\nTask: {item.title}\nReminder time: {local}\nProgress: {item.progress_percentage}%\nNext action: {item.next_action or 'Not set'}\n\nOpen:\n{root}/admin/tasks/{item.id}"
    if reminder.opportunity:
        item = reminder.opportunity
        application = item.applications.filter(owner=reminder.owner).first()
        return f"Opportunity deadline approaching\n\nProgram: {item.title}\nOrganization: {item.organization}\nDeadline: {timezone.localtime(item.deadline).strftime('%d %B %Y, %I:%M %p') if item.deadline else 'Not set'}\nCurrent stage: {application.get_stage_display() if application else 'Not applied'}\nNext action: {application.next_action if application and application.next_action else 'Not set'}\n\nOpen:\n{root}/admin/opportunities/{item.id}"
    if reminder.learning_item:
        item = reminder.learning_item
        return f"Learning target approaching\n\nTopic: {item.topic or item.title}\nTarget date: {item.target_date or 'Not set'}\nCompleted: {item.completed_hours} of {item.target_hours} hours\n\nOpen:\n{root}/admin/learning/{item.id}"
    if reminder.travel_plan:
        item = reminder.travel_plan
        remaining = item.checklist.filter(is_completed=False).count()
        return f"Travel plan approaching\n\nDestination: {item.destination}\nPurpose: {item.get_purpose_display()}\nStart date: {item.start_date}\nChecklist remaining: {remaining} items\n\nOpen:\n{root}/admin/travel/{item.id}"
    if reminder.goal:
        return f"Goal deadline approaching\n\nGoal: {reminder.goal.title}\nProgress: {reminder.goal.completion_percentage}%\n\nOpen:\n{root}/admin/goals/{reminder.goal.id}"
    if reminder.application:
        return f"Application action due\n\nOpportunity: {reminder.application.opportunity.title}\nNext action: {reminder.application.next_action or 'Follow up'}\n\nOpen:\n{root}/admin/applications/{reminder.application.id}"
    if reminder.travel_itinerary_item:
        item = reminder.travel_itinerary_item
        return f"Travel itinerary event approaching\n\nEvent: {item.title}\nLocation: {item.location or 'Not set'}\n\nOpen:\n{root}/admin/travel/{item.travel_plan_id}"
    if reminder.travel_checklist_item:
        item = reminder.travel_checklist_item
        return f"Travel checklist deadline\n\nItem: {item.title}\n\nOpen:\n{root}/admin/travel/{item.travel_plan_id}"
    return f"Custom reminder\n\nScheduled for: {local}\n\nOpen:\n{root}/admin/reminders"
