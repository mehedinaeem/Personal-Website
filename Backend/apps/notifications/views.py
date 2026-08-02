import hmac
import logging

from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .telegram import bot_owner, handle_text, is_authorized_chat, send_telegram_message

logger = logging.getLogger(__name__)


class TelegramWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        supplied = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        expected = settings.TELEGRAM_WEBHOOK_SECRET
        if not expected or not hmac.compare_digest(supplied, expected):
            return Response({"detail": "Invalid webhook authentication."}, status=403)
        update = request.data if isinstance(request.data, dict) else {}
        message = update.get("message") or {}
        chat_id = (message.get("chat") or {}).get("id")
        if not is_authorized_chat(chat_id):
            logger.warning("Ignored unauthorized Telegram update", extra={"update_id": update.get("update_id")})
            return Response({"status": "ignored"})
        owner = bot_owner()
        text = message.get("text")
        if not owner or not isinstance(text, str):
            return Response({"status": "ignored"})
        reply = handle_text(owner, text)
        try:
            send_telegram_message(chat_id, reply)
        except RuntimeError:
            logger.error("Telegram reply delivery failed", extra={"update_id": update.get("update_id")})
            return Response({"status": "delivery_failed"}, status=502)
        logger.info("Processed authorized Telegram update", extra={"update_id": update.get("update_id")})
        return Response({"status": "ok"})
