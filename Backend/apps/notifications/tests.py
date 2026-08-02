from datetime import timedelta
from unittest.mock import patch

import httpx
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.capture.models import CapturedLink
from apps.capture.services import CaptureError
from apps.opportunities.models import Opportunity
from apps.progress.models import Goal
from apps.tasks.models import Task
from apps.travel.models import TravelPlan


SETTINGS = override_settings(
    TELEGRAM_BOT_TOKEN="test-token-never-print",
    TELEGRAM_CHAT_ID="12345",
    TELEGRAM_WEBHOOK_SECRET="test-secret-never-print",
    FRONTEND_URL="https://mehedinaeem.dev",
)


@SETTINGS
class TelegramWebhookTests(APITestCase):
    url = "/api/v1/telegram/webhook/"

    def setUp(self):
        self.user = get_user_model().objects.create_superuser("owner", "owner@example.com", "StrongPassword123!")

    def payload(self, text="/start", chat_id=12345):
        return {"update_id": 99, "message": {"message_id": 4, "chat": {"id": chat_id}, "text": text}}

    def post(self, text="/start", chat_id=12345, secret="test-secret-never-print"):
        headers = {"HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN": secret} if secret is not None else {}
        return self.client.post(self.url, self.payload(text, chat_id), format="json", **headers)

    @patch("apps.notifications.views.send_telegram_message")
    def test_valid_webhook_secret(self, send):
        response = self.post()
        self.assertEqual(response.status_code, 200)
        send.assert_called_once()

    @patch("apps.notifications.views.send_telegram_message")
    def test_invalid_webhook_secret(self, send):
        self.assertEqual(self.post(secret="wrong").status_code, 403)
        send.assert_not_called()

    def test_missing_webhook_secret(self):
        self.assertEqual(self.post(secret=None).status_code, 403)

    @patch("apps.notifications.views.send_telegram_message")
    def test_authorized_chat(self, send):
        self.assertEqual(self.post("/help").data["status"], "ok")
        self.assertEqual(send.call_args.args[0], 12345)

    @patch("apps.notifications.views.send_telegram_message")
    def test_unauthorized_chat(self, send):
        response = self.post("/goals", chat_id=999)
        self.assertEqual(response.data["status"], "ignored")
        send.assert_not_called()

    @patch("apps.notifications.views.send_telegram_message")
    @patch("apps.notifications.telegram.fetch_public_page", return_value=("https://example.com/job", "<title>Public Job</title>"))
    def test_plain_url_message(self, _, send):
        self.post("https://example.com/job")
        self.assertIn("Opportunity captured", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    @patch("apps.notifications.telegram.fetch_public_page", return_value=("https://example.com/job", "<title>Public Job</title>"))
    def test_save_command(self, _, send):
        self.post("/save https://example.com/job")
        self.assertIn("Public Job", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    @patch("apps.notifications.telegram.fetch_public_page", return_value=("https://example.com/job", "<title>Public Job</title>"))
    def test_duplicate_link(self, _, send):
        self.post("/save https://example.com/job")
        self.post("/save https://EXAMPLE.com/job#fragment")
        self.assertEqual(CapturedLink.objects.count(), 1)
        self.assertIn("already captured", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    def test_message_without_url(self, send):
        self.post("please make me a task")
        self.assertIn("not enabled", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    @patch("apps.notifications.telegram.fetch_public_page", return_value=("https://example.com/job", "<meta property='og:title' content='Research Role'><meta property='og:site_name' content='Example Org'><p>Apply by 20 August 2027</p>"))
    def test_extraction_success(self, _, send):
        self.post("/save https://example.com/job")
        reply = send.call_args.args[1]
        self.assertIn("Research Role", reply)
        self.assertIn("Example Org", reply)
        self.assertIn("Deadline not confirmed", reply)
        self.assertIn("/admin/capture/", reply)

    @patch("apps.notifications.views.send_telegram_message")
    @patch("apps.notifications.telegram.fetch_public_page", return_value=("https://facebook.com/post", "<html></html>"))
    def test_extraction_manual_fallback(self, _, send):
        self.post("https://facebook.com/post")
        self.assertIn("manual review", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    @patch("apps.notifications.telegram.fetch_public_page", side_effect=CaptureError("blocked"))
    def test_extraction_failure(self, _, send):
        self.post("https://example.com/failure")
        capture = CapturedLink.objects.get()
        self.assertEqual(capture.status, "failed")
        self.assertNotIn("blocked", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message", side_effect=RuntimeError("delivery failed"))
    def test_telegram_api_failure(self, _):
        response = self.post("/help")
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data, {"status": "delivery_failed"})

    @patch("apps.notifications.views.send_telegram_message")
    def test_today(self, send):
        Task.objects.create(owner=self.user, title="Private task", due_at=timezone.now(), status="planned")
        self.post("/today")
        self.assertIn("Private task", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    def test_goals(self, send):
        today = timezone.localdate()
        Goal.objects.create(owner=self.user, title="Daily writing", period_type="daily", category="personal", start_date=today, end_date=today, target_value=1, status="active")
        self.post("/goals")
        self.assertIn("Daily writing", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    def test_deadlines(self, send):
        Opportunity.objects.create(owner=self.user, title="Scholarship", organization="University", opportunity_type="scholarship", deadline=timezone.now() + timedelta(days=3))
        self.post("/deadlines")
        self.assertIn("Scholarship", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    def test_travel(self, send):
        TravelPlan.objects.create(owner=self.user, title="Conference trip", destination="Dhaka", purpose="conference", start_date=timezone.localdate() + timedelta(days=2), end_date=timezone.localdate() + timedelta(days=3))
        self.post("/travel")
        self.assertIn("Conference trip", send.call_args.args[1])

    @patch("apps.notifications.views.send_telegram_message")
    def test_no_private_data_leakage(self, send):
        Task.objects.create(owner=self.user, title="Highly private task", due_at=timezone.now(), status="planned")
        response = self.post("/today", chat_id=777)
        self.assertNotContains(response, "Highly private task")
        self.assertNotContains(response, "test-token-never-print")
        self.assertNotContains(response, "test-secret-never-print")
        send.assert_not_called()


@SETTINGS
class TelegramDeliveryTests(APITestCase):
    @patch("apps.notifications.telegram.httpx.post")
    def test_real_sender_hides_api_failure_details(self, post):
        from apps.notifications.telegram import send_telegram_message
        post.side_effect = httpx.ConnectError("network detail")
        with self.assertRaisesRegex(RuntimeError, "delivery failed"):
            send_telegram_message("12345", "hello")
