from django.core.management.base import BaseCommand

from apps.notifications.dispatch import dispatch_due_reminders


class Command(BaseCommand):
    help = "Safely dispatch due reminder notifications."

    def handle(self, *args, **options):
        sent, failed = dispatch_due_reminders()
        self.stdout.write(f"Notification dispatch complete: {sent} sent, {failed} failed.")
