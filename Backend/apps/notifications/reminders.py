from datetime import datetime, time, timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import Reminder

OPPORTUNITY_OFFSETS = (timedelta(days=7), timedelta(days=3), timedelta(days=1), timedelta(hours=6))


def create_default_opportunity_reminders(opportunity):
    if not opportunity.deadline or not opportunity.is_deadline_confirmed or not opportunity.default_reminders_enabled:
        return []
    return create_defaults(opportunity.owner, "opportunity_deadline", opportunity.deadline, OPPORTUNITY_OFFSETS, opportunity=opportunity)


def create_default_travel_reminders(plan):
    if not plan.default_reminders_enabled:
        return []
    target = timezone.make_aware(datetime.combine(plan.start_date, time(9, 0)))
    return create_defaults(plan.owner, "travel_start", target, (timedelta(days=7), timedelta(days=1)), travel_plan=plan)


def create_default_itinerary_reminder(item, enabled=True):
    if not enabled:
        return []
    return create_defaults(item.owner, "travel_itinerary", item.start_at, (timedelta(hours=2),), travel_itinerary_item=item)


def create_defaults(owner, reminder_type, target, offsets, **reference):
    created = []
    now = timezone.now()
    for offset in offsets:
        scheduled = target - offset
        if scheduled <= now:
            continue
        try:
            reminder, was_created = Reminder.objects.get_or_create(
                owner=owner, reminder_type=reminder_type, scheduled_at=scheduled,
                channel="telegram", defaults={"status": "pending"}, **reference,
            )
        except IntegrityError:
            continue
        if was_created:
            created.append(reminder)
    return created


@transaction.atomic
def cancel_defaults(instance, reference_name):
    Reminder.objects.filter(**{reference_name: instance}, status__in=["pending", "processing"]).update(status="cancelled")
