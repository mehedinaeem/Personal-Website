from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.notifications.telegram import send_telegram_message


class Command(BaseCommand):
    help = "Send a safe Telegram configuration test."

    def handle(self, *args, **options):
        if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
            raise CommandError("Telegram bot token and chat ID must be configured.")
        try:
            send_telegram_message(settings.TELEGRAM_CHAT_ID, "Portfolio notification test succeeded.")
        except RuntimeError as exc:
            raise CommandError("Telegram test message failed.") from exc
        self.stdout.write(self.style.SUCCESS("Telegram test message sent successfully."))
