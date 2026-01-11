"""
Cron jobs for application deadline reminders.
These functions are called by django-crontab at scheduled times.
"""

from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


def send_deadline_reminders():
    """
    Send email reminders for upcoming deadlines.
    - 3 days before deadline
    - On the deadline day
    
    Only sends reminders for applications with status 'pending' or 'applied'.
    """
    from .models import Application
    from .emails import send_reminder_email
    
    today = timezone.now().date()
    three_days_later = today + timedelta(days=3)
    
    # Get applications with deadlines today or in 3 days
    # Only for pending or applied status
    applications_today = Application.objects.filter(
        deadline=today,
        status__in=['pending', 'applied']
    )
    
    applications_3_days = Application.objects.filter(
        deadline=three_days_later,
        status__in=['pending', 'applied']
    )
    
    sent_count = 0
    
    # Send urgent reminders for today's deadlines
    for app in applications_today:
        if send_reminder_email(app, 'deadline'):
            sent_count += 1
            logger.info(f"Sent TODAY reminder for: {app.title}")
    
    # Send 3-day reminders
    for app in applications_3_days:
        if send_reminder_email(app, 'deadline'):
            sent_count += 1
            logger.info(f"Sent 3-day reminder for: {app.title}")
    
    logger.info(f"Deadline reminder job complete. Sent {sent_count} emails.")
    return sent_count


def send_result_reminders():
    """
    Send email reminders for expected result dates.
    - On the result_date day
    
    Only sends for applications with status 'applied'.
    """
    from .models import Application
    from .emails import send_reminder_email
    
    today = timezone.now().date()
    
    # Get applications with result_date today
    applications = Application.objects.filter(
        result_date=today,
        status='applied'
    )
    
    sent_count = 0
    
    for app in applications:
        if send_reminder_email(app, 'result'):
            sent_count += 1
            logger.info(f"Sent result reminder for: {app.title}")
    
    logger.info(f"Result reminder job complete. Sent {sent_count} emails.")
    return sent_count
