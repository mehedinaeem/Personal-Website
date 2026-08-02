from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import DailyReview, Task

User = get_user_model()


class TaskApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("task-owner", password="test-password")
        self.other_user = User.objects.create_user("other-owner", password="test-password")
        self.client.force_authenticate(self.user)

    def payload(self, **changes):
        values = {
            "title": "Write research notes",
            "description": "Summarize the paper",
            "area": "research",
            "priority": "high",
            "status": "planned",
            "progress_percentage": 0,
            "estimated_minutes": 60,
            "next_action": "Read section one",
            "is_recurring": False,
            "recurrence_rule": "",
        }
        values.update(changes)
        return values

    def create_task(self, owner=None, **changes):
        return Task.objects.create(owner=owner or self.user, **self.payload(**changes))

    def test_task_creation(self):
        response = self.client.post(reverse("tasks:task-list"), self.payload(), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Task.objects.get().owner, self.user)

    def test_task_update(self):
        task = self.create_task()
        response = self.client.patch(
            reverse("tasks:task-detail", args=[task.pk]), {"priority": "critical"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertEqual(task.priority, "critical")

    def test_task_deletion(self):
        task = self.create_task()
        response = self.client.delete(reverse("tasks:task-detail", args=[task.pk]))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Task.objects.filter(pk=task.pk).exists())

    def test_task_completion(self):
        task = self.create_task(progress_percentage=40)
        response = self.client.post(reverse("tasks:task-complete", args=[task.pk]))
        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertEqual(task.progress_percentage, 100)
        self.assertIsNotNone(task.completed_at)

    def test_reopening_completed_task(self):
        task = self.create_task(status="completed")
        response = self.client.patch(
            reverse("tasks:task-detail", args=[task.pk]),
            {"status": "in_progress", "progress_percentage": 80},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertIsNone(task.completed_at)
        self.assertEqual(task.progress_percentage, 80)

    def test_invalid_progress(self):
        response = self.client.post(
            reverse("tasks:task-list"), self.payload(progress_percentage=101), format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_negative_time_values(self):
        response = self.client.post(
            reverse("tasks:task-list"), self.payload(estimated_minutes=-1), format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_today_filtering(self):
        today_task = self.create_task(due_at=timezone.now() + timedelta(hours=1))
        self.create_task(title="Later", due_at=timezone.now() + timedelta(days=3))
        response = self.client.get(reverse("tasks:task-today"))
        self.assertEqual([row["id"] for row in response.data["results"]], [today_task.id])

    def test_upcoming_filtering(self):
        upcoming = self.create_task(due_at=timezone.now() + timedelta(days=2))
        self.create_task(title="Done later", status="completed", due_at=timezone.now() + timedelta(days=2))
        response = self.client.get(reverse("tasks:task-upcoming"))
        self.assertEqual([row["id"] for row in response.data["results"]], [upcoming.id])

    def test_overdue_filtering(self):
        overdue = self.create_task(due_at=timezone.now() - timedelta(hours=1))
        self.create_task(title="Old done", status="completed", due_at=timezone.now() - timedelta(days=1))
        response = self.client.get(reverse("tasks:task-overdue"))
        self.assertEqual([row["id"] for row in response.data["results"]], [overdue.id])

    def test_progress_log_creation(self):
        task = self.create_task(progress_percentage=20)
        response = self.client.post(
            reverse("tasks:task-logs", args=[task.pk]),
            {"progress_after": 50, "work_completed": "Drafted notes", "minutes_spent": 30},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["progress_before"], 20)

    def test_task_actual_time_update(self):
        task = self.create_task(actual_minutes=10)
        self.client.post(
            reverse("tasks:task-logs", args=[task.pk]),
            {"progress_after": 25, "minutes_spent": 15},
            format="json",
        )
        task.refresh_from_db()
        self.assertEqual(task.actual_minutes, 25)

    def test_duplicate_time_update_protection(self):
        task = self.create_task()
        response = self.client.post(
            reverse("tasks:task-logs", args=[task.pk]),
            {"progress_after": 10, "minutes_spent": 20},
            format="json",
        )
        task.refresh_from_db()
        log = task.progress_logs.get(pk=response.data["id"])
        log.save()
        task.refresh_from_db()
        self.assertEqual(task.actual_minutes, 20)

    def test_daily_review_uniqueness(self):
        payload = {"review_date": str(timezone.localdate()), "productivity_rating": 4}
        self.assertEqual(
            self.client.post(reverse("daily-reviews:daily-review-list"), payload).status_code, 201
        )
        self.assertEqual(
            self.client.post(reverse("daily-reviews:daily-review-list"), payload).status_code, 400
        )
        self.assertEqual(DailyReview.objects.count(), 1)

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(reverse("tasks:task-list")).status_code, 401)
        self.assertEqual(self.client.get(reverse("daily-reviews:daily-review-list")).status_code, 401)

    def test_user_isolation(self):
        own = self.create_task()
        other = self.create_task(owner=self.other_user, title="Private other task")
        response = self.client.get(reverse("tasks:task-list"))
        self.assertEqual([row["id"] for row in response.data["results"]], [own.id])
        self.assertEqual(self.client.get(reverse("tasks:task-detail", args=[other.pk])).status_code, 404)
