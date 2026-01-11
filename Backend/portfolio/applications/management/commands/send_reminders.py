"""
Django management command for sending application reminders.
Can be called by Render cron jobs or any scheduler.

Usage:
    python manage.py send_reminders              # Send all reminders
    python manage.py send_reminders --deadlines  # Only deadline reminders
    python manage.py send_reminders --results    # Only result reminders
"""

from django.core.management.base import BaseCommand
from applications.cron import send_deadline_reminders, send_result_reminders


class Command(BaseCommand):
    help = 'Send application deadline and result reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--deadlines',
            action='store_true',
            help='Send only deadline reminders',
        )
        parser.add_argument(
            '--results',
            action='store_true',
            help='Send only result reminders',
        )

    def handle(self, *args, **options):
        deadlines_only = options.get('deadlines', False)
        results_only = options.get('results', False)

        # If neither flag specified, run both
        run_both = not deadlines_only and not results_only

        total_sent = 0

        if run_both or deadlines_only:
            self.stdout.write('Sending deadline reminders...')
            count = send_deadline_reminders()
            total_sent += count
            self.stdout.write(
                self.style.SUCCESS(f'  ✓ Sent {count} deadline reminder(s)')
            )

        if run_both or results_only:
            self.stdout.write('Sending result reminders...')
            count = send_result_reminders()
            total_sent += count
            self.stdout.write(
                self.style.SUCCESS(f'  ✓ Sent {count} result reminder(s)')
            )

        self.stdout.write(
            self.style.SUCCESS(f'\nTotal: {total_sent} email(s) sent.')
        )
