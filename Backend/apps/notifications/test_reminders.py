from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.learning.models import LearningItem
from apps.opportunities.models import Opportunity
from apps.tasks.models import Task
from apps.travel.models import TravelPlan
from .dispatch import claim_due_reminders, dispatch_due_reminders, reminder_message
from .models import Reminder
from .reminders import create_default_opportunity_reminders
from .telegram import TelegramPermanentError, TelegramTemporaryError


@override_settings(TELEGRAM_CHAT_ID="12345", TELEGRAM_BOT_TOKEN="hidden", FRONTEND_URL="https://mehedinaeem.dev")
class DispatchTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("reminder-owner", email="owner@example.com", password="StrongPassword123!")
        self.task = Task.objects.create(owner=self.user, title="Thesis", due_at=timezone.now() + timedelta(hours=1))

    def reminder(self, **changes):
        values = dict(owner=self.user, task=self.task, reminder_type="task_due", scheduled_at=timezone.now() - timedelta(minutes=1), channel="telegram")
        values.update(changes)
        return Reminder.objects.create(**values)

    @patch("apps.notifications.dispatch.send_telegram_message")
    def test_due_reminder_selected(self, send):
        reminder = self.reminder()
        self.assertEqual(dispatch_due_reminders(), (1, 0))
        reminder.refresh_from_db(); self.assertEqual(reminder.status, "sent"); self.assertIsNotNone(reminder.sent_at); send.assert_called_once()

    @patch("apps.notifications.dispatch.send_telegram_message")
    def test_future_reminder_skipped(self, send):
        self.reminder(scheduled_at=timezone.now() + timedelta(hours=1))
        self.assertEqual(dispatch_due_reminders(), (0, 0)); send.assert_not_called()

    @patch("apps.notifications.dispatch.send_telegram_message")
    def test_sent_reminder_skipped(self, send):
        self.reminder(status="sent", sent_at=timezone.now())
        dispatch_due_reminders(); send.assert_not_called()

    @patch("apps.notifications.dispatch.send_telegram_message")
    def test_cancelled_reminder_skipped(self, send):
        self.reminder(status="cancelled")
        dispatch_due_reminders(); send.assert_not_called()

    @patch("apps.notifications.dispatch.send_telegram_message", side_effect=[TelegramTemporaryError(), None])
    def test_failed_reminder_retry(self, send):
        reminder = self.reminder(); dispatch_due_reminders(); reminder.refresh_from_db()
        self.assertEqual((reminder.status, reminder.attempt_count), ("pending", 1))
        dispatch_due_reminders(); reminder.refresh_from_db(); self.assertEqual(reminder.status, "sent"); self.assertEqual(send.call_count, 2)

    @patch("apps.notifications.dispatch.send_telegram_message", side_effect=TelegramTemporaryError())
    def test_retry_limit(self, _):
        reminder = self.reminder(attempt_count=2); dispatch_due_reminders(); reminder.refresh_from_db()
        self.assertEqual((reminder.status, reminder.attempt_count), ("failed", 3))

    @patch("apps.notifications.dispatch.send_telegram_message")
    def test_duplicate_execution_protection(self, send):
        self.reminder(); dispatch_due_reminders(); dispatch_due_reminders(); self.assertEqual(send.call_count, 1)

    def test_overlapping_execution_protection(self):
        reminder = self.reminder(); self.assertEqual(claim_due_reminders(), [reminder.id]); self.assertEqual(claim_due_reminders(), [])

    @patch("apps.notifications.dispatch.send_telegram_message")
    def test_telegram_success(self, send):
        self.reminder(); dispatch_due_reminders(); send.assert_called_once()

    @patch("apps.notifications.dispatch.send_telegram_message", side_effect=TelegramTemporaryError())
    def test_telegram_temporary_failure(self, _):
        reminder = self.reminder(); dispatch_due_reminders(); reminder.refresh_from_db()
        self.assertEqual(reminder.status, "pending"); self.assertEqual(reminder.last_error, "Temporary notification delivery failure.")

    @patch("apps.notifications.dispatch.send_telegram_message", side_effect=TelegramPermanentError())
    def test_telegram_permanent_failure(self, _):
        reminder = self.reminder(); dispatch_due_reminders(); reminder.refresh_from_db()
        self.assertEqual(reminder.status, "failed")


class ReminderAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("one", password="StrongPassword123!")
        self.other = get_user_model().objects.create_user("two", password="StrongPassword123!")
        self.client.force_authenticate(self.user)

    def test_unauthorized_object_reference(self):
        task = Task.objects.create(owner=self.other, title="Other task")
        response = self.client.post("/api/v1/reminders/", {"task": task.id, "reminder_type": "task_due", "scheduled_at": (timezone.now() + timedelta(hours=1)).isoformat(), "channel": "telegram"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_user_isolation(self):
        reminder = Reminder.objects.create(owner=self.other, reminder_type="custom", scheduled_at=timezone.now() + timedelta(hours=1))
        self.assertEqual(self.client.get(f"/api/v1/reminders/{reminder.id}/").status_code, 404)

    def test_custom_reminder(self):
        response = self.client.post("/api/v1/reminders/", {"reminder_type": "custom", "scheduled_at": (timezone.now() + timedelta(hours=1)).isoformat(), "channel": "telegram"}, format="json")
        self.assertEqual(response.status_code, 201)


class DefaultAndMessageTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("defaults", password="StrongPassword123!")

    def test_default_opportunity_reminder_creation(self):
        opportunity = Opportunity.objects.create(owner=self.user, title="Award", organization="Org", opportunity_type="scholarship", deadline=timezone.now() + timedelta(days=10), is_deadline_confirmed=True)
        self.assertEqual(len(create_default_opportunity_reminders(opportunity)), 4)

    def test_past_default_reminder_skipped(self):
        opportunity = Opportunity.objects.create(owner=self.user, title="Award", organization="Org", opportunity_type="scholarship", deadline=timezone.now() + timedelta(hours=7), is_deadline_confirmed=True)
        self.assertEqual(len(create_default_opportunity_reminders(opportunity)), 1)

    @override_settings(FRONTEND_URL="https://mehedinaeem.dev")
    def test_learning_reminder(self):
        item = LearningItem.objects.create(owner=self.user, title="DRF", topic="Django REST Framework", learning_type="course", target_hours=12, completed_hours=8)
        reminder = Reminder(owner=self.user, learning_item=item, reminder_type="learning_target", scheduled_at=timezone.now() + timedelta(hours=1))
        self.assertIn("8 of 12 hours", reminder_message(reminder))

    @override_settings(FRONTEND_URL="https://mehedinaeem.dev")
    def test_travel_reminder(self):
        plan = TravelPlan.objects.create(owner=self.user, title="Trip", destination="Dhaka", purpose="conference", start_date=timezone.localdate() + timedelta(days=5), end_date=timezone.localdate() + timedelta(days=6))
        reminder = Reminder(owner=self.user, travel_plan=plan, reminder_type="travel_start", scheduled_at=timezone.now() + timedelta(hours=1))
        self.assertIn("Destination: Dhaka", reminder_message(reminder))
