"""
Email utility functions for application reminders.
"""

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_reminder_email(application, reminder_type='warning'):
    """
    Send reminder email for an application.
    
    Args:
        application: Application model instance
        reminder_type: 'urgent' (12h left), 'warning' (3 days), or 'result'
    """
    admin_email = getattr(settings, 'ADMIN_EMAIL', settings.EMAIL_HOST_USER)
    
    if reminder_type == 'urgent':
        # 12 hours before deadline (final day)
        subject = f"🚨 URGENT: {application.title} deadline is TODAY! Only 12 hours left!"
        urgency = "TODAY - ONLY 12 HOURS LEFT"
        header_bg = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"  # Red
    elif reminder_type == 'warning':
        # 3 days before deadline
        subject = f"⏰ Reminder: {application.title} deadline in 3 days"
        urgency = "in 3 days"
        header_bg = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"  # Orange
    else:
        # Result day
        subject = f"📊 Result expected today: {application.title}"
        urgency = "Result expected today"
        header_bg = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"  # Purple
    
    # Build email content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: {header_bg}; color: white; padding: 20px; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }}
            .field {{ margin-bottom: 15px; }}
            .label {{ font-weight: bold; color: #555; }}
            .value {{ color: #333; }}
            .status {{ display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; }}
            .status-pending {{ background: #fef3c7; color: #92400e; }}
            .status-applied {{ background: #dbeafe; color: #1e40af; }}
            .status-selected {{ background: #d1fae5; color: #065f46; }}
            .status-rejected {{ background: #fee2e2; color: #991b1b; }}
            .urgency {{ font-size: 18px; color: #dc2626; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">Application Reminder</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Deadline {urgency}</p>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Title</div>
                    <div class="value" style="font-size: 18px;">{application.title}</div>
                </div>
                <div class="field">
                    <div class="label">Organization</div>
                    <div class="value">{application.organization}</div>
                </div>
                <div class="field">
                    <div class="label">Category</div>
                    <div class="value">{application.get_category_display()}</div>
                </div>
                <div class="field">
                    <div class="label">Deadline</div>
                    <div class="value urgency">{application.deadline.strftime('%B %d, %Y')}</div>
                </div>
                <div class="field">
                    <div class="label">Status</div>
                    <div class="value">
                        <span class="status status-{application.status}">{application.get_status_display()}</span>
                    </div>
                </div>
                {"<div class='field'><div class='label'>Notes</div><div class='value'>" + application.notes + "</div></div>" if application.notes else ""}
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
Application Reminder - Deadline {urgency}

Title: {application.title}
Organization: {application.organization}
Category: {application.get_category_display()}
Deadline: {application.deadline.strftime('%B %d, %Y')}
Status: {application.get_status_display()}
{"Notes: " + application.notes if application.notes else ""}

---
This is an automated reminder from your Application Tracker.
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[admin_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Sent {reminder_type} reminder for: {application.title}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email for {application.title}: {str(e)}")
        return False
