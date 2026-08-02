import httpx
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Register the private Telegram webhook without displaying credentials."

    def add_arguments(self, parser):
        parser.add_argument("--url", help="Public HTTPS webhook URL; defaults to https://api.mehedinaeem.dev/api/v1/telegram/webhook/")

    def handle(self, *args, **options):
        token = settings.TELEGRAM_BOT_TOKEN
        secret = settings.TELEGRAM_WEBHOOK_SECRET
        webhook_url = options["url"] or "https://api.mehedinaeem.dev/api/v1/telegram/webhook/"
        if not token or not secret:
            raise CommandError("Telegram bot token and webhook secret must be configured.")
        if not webhook_url.startswith("https://"):
            raise CommandError("The production webhook URL must use HTTPS.")
        try:
            response = httpx.post(
                f"https://api.telegram.org/bot{token}/setWebhook",
                json={"url": webhook_url, "secret_token": secret, "allowed_updates": ["message"], "drop_pending_updates": False},
                timeout=httpx.Timeout(10.0, connect=5.0),
            )
            response.raise_for_status()
            result = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise CommandError("Telegram webhook registration failed.") from exc
        if not result.get("ok"):
            raise CommandError("Telegram rejected the webhook registration request.")
        self.stdout.write(self.style.SUCCESS("Telegram webhook registered successfully."))
