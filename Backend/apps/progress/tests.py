from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.learning.models import LearningItem
from apps.tasks.models import Task, TaskProgressLog
from apps.travel.models import TravelPlan
from .models import ActivityLog, Goal, ProgressReview

User = get_user_model()


class PlanningSystemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("planner", password="test-password")
        self.other = User.objects.create_user("other-planner", password="test-password")
        self.client.force_authenticate(self.user)
        self.today = timezone.localdate()

    def goal_data(self, period="daily", **changes):
        data = {"title": f"{period.title()} goal", "period_type": period, "category": "learning", "start_date": self.today, "end_date": self.today, "target_value": "2.00", "current_value": "0.00", "unit": "items", "status": "active", "priority": "high"}
        if period == "monthly": data["end_date"] = self.today + timedelta(days=29)
        if period == "yearly": data["end_date"] = self.today + timedelta(days=364)
        data.update(changes); return data

    def create_goal(self, owner=None, **changes):
        data = self.goal_data(**changes)
        return Goal.objects.create(owner=owner or self.user, **data)

    def review_data(self, period="daily", **changes):
        data = {"period_type": period, "period_start": self.today, "period_end": self.today, "summary": "Reflection", "productivity_rating": 4, "learning_rating": 4}
        if period == "monthly": data["period_end"] = self.today + timedelta(days=29)
        if period == "yearly": data["period_end"] = self.today + timedelta(days=364)
        data.update(changes); return data

    def test_01_daily_goal_creation(self): self.assertEqual(self.client.post(reverse("goals:goal-list"), self.goal_data(), format="json").status_code, 201)
    def test_02_monthly_goal_creation(self): self.assertEqual(self.client.post(reverse("goals:goal-list"), self.goal_data("monthly"), format="json").status_code, 201)
    def test_03_yearly_goal_creation(self): self.assertEqual(self.client.post(reverse("goals:goal-list"), self.goal_data("yearly"), format="json").status_code, 201)

    def test_04_goal_progress_calculation(self):
        goal = self.create_goal(target_value="10.00", current_value="12.00")
        self.assertEqual(goal.completion_percentage, 100.0)

    def test_05_goal_completion(self):
        goal = self.create_goal(current_value="2.00")
        response = self.client.post(reverse("goals:goal-complete", args=[goal.pk]))
        self.assertEqual(response.status_code, 200); goal.refresh_from_db(); self.assertIsNotNone(goal.completed_at)

    def test_06_goal_reopening(self):
        goal = self.create_goal(status="completed")
        self.client.patch(reverse("goals:goal-detail", args=[goal.pk]), {"status": "active"}, format="json")
        goal.refresh_from_db(); self.assertIsNone(goal.completed_at)

    def test_07_invalid_date_range(self):
        response = self.client.post(reverse("goals:goal-list"), self.goal_data(start_date=self.today, end_date=self.today - timedelta(days=1)), format="json")
        self.assertEqual(response.status_code, 400)

    def test_08_duplicate_progress_review(self):
        self.client.post(reverse("progress:review-list"), self.review_data(), format="json")
        self.assertEqual(self.client.post(reverse("progress:review-list"), self.review_data(), format="json").status_code, 400)

    def test_09_daily_progress_review(self): self.assertEqual(self.client.post(reverse("progress:review-list"), self.review_data(), format="json").status_code, 201)
    def test_10_monthly_progress_review(self): self.assertEqual(self.client.post(reverse("progress:review-list"), self.review_data("monthly"), format="json").status_code, 201)
    def test_11_yearly_progress_review(self): self.assertEqual(self.client.post(reverse("progress:review-list"), self.review_data("yearly"), format="json").status_code, 201)

    def test_12_activity_log_creation(self):
        response = self.client.post(reverse("progress:activity-list"), {"activity_date": self.today, "title": "Read paper", "category": "research", "activity_type": "research", "minutes_spent": 45, "progress_value": 30}, format="json")
        self.assertEqual(response.status_code, 201)

    def test_13_activity_time_validation(self):
        response = self.client.post(reverse("progress:activity-list"), {"activity_date": self.today, "title": "Invalid", "activity_type": "work", "minutes_spent": -1}, format="json")
        self.assertEqual(response.status_code, 400)

    def learning_data(self):
        return {"title": "Django course", "topic": "Django", "skill": "Backend", "learning_type": "course", "status": "in_progress", "start_date": self.today, "target_date": self.today + timedelta(days=30), "target_hours": "10.00", "confidence_before": 2}

    def test_14_learning_item_creation(self): self.assertEqual(self.client.post(reverse("learning:item-list"), self.learning_data(), format="json").status_code, 201)

    def test_15_learning_session_creation(self):
        item = LearningItem.objects.create(owner=self.user, **self.learning_data())
        response = self.client.post(reverse("learning:item-sessions", args=[item.pk]), {"session_date": self.today, "minutes_spent": 30, "topics_covered": "Serializers"}, format="json")
        self.assertEqual(response.status_code, 201)

    def test_16_learning_time_update(self):
        item = LearningItem.objects.create(owner=self.user, **self.learning_data())
        self.client.post(reverse("learning:item-sessions", args=[item.pk]), {"session_date": self.today, "minutes_spent": 30}, format="json")
        item.refresh_from_db(); self.assertEqual(item.completed_hours, Decimal("0.50"))

    def test_17_duplicate_time_update_protection(self):
        item = LearningItem.objects.create(owner=self.user, **self.learning_data())
        response = self.client.post(reverse("learning:item-sessions", args=[item.pk]), {"session_date": self.today, "minutes_spent": 60}, format="json")
        session = item.sessions.get(pk=response.data["id"]); session.save(); item.refresh_from_db(); self.assertEqual(item.completed_hours, Decimal("1.00"))

    def travel_data(self, **changes):
        data = {"title": "Dhaka conference", "destination": "Dhaka", "purpose": "conference", "status": "planning", "start_date": self.today + timedelta(days=10), "end_date": self.today + timedelta(days=12), "estimated_budget": "10000.00", "actual_cost": "0.00", "currency": "BDT"}; data.update(changes); return data

    def test_18_travel_plan_creation(self): self.assertEqual(self.client.post(reverse("travel:plan-list"), self.travel_data(), format="json").status_code, 201)
    def test_19_invalid_travel_dates(self): self.assertEqual(self.client.post(reverse("travel:plan-list"), self.travel_data(end_date=self.today), format="json").status_code, 400)

    def test_20_travel_itinerary_ownership(self):
        plan = TravelPlan.objects.create(owner=self.other, **self.travel_data())
        response = self.client.post(reverse("travel:plan-itinerary", args=[plan.pk]), {"title": "Flight", "start_at": timezone.now(), "end_at": timezone.now() + timedelta(hours=1), "item_type": "transport"}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_21_travel_checklist(self):
        plan = TravelPlan.objects.create(owner=self.user, **self.travel_data())
        response = self.client.post(reverse("travel:plan-checklist", args=[plan.pk]), {"title": "Book hotel", "category": "booking"}, format="json")
        self.assertEqual(response.status_code, 201)

    def summary(self, period): return self.client.get(reverse("progress:summary"), {"period": period, "start_date": self.today, "end_date": self.today})
    def test_22_daily_progress_summary_response(self): self.assertEqual(self.summary("daily").data["period"], "daily")
    def test_23_monthly_progress_summary_response(self): self.assertEqual(self.summary("monthly").status_code, 200)
    def test_24_yearly_progress_summary_response(self): self.assertEqual(self.summary("yearly").status_code, 200)

    def test_25_metric_calculation(self):
        task = Task.objects.create(owner=self.user, title="Done", status="completed")
        TaskProgressLog.objects.create(task=task, owner=self.user, log_date=self.today, progress_before=0, progress_after=100, minutes_spent=30)
        data = self.summary("daily").data
        self.assertEqual(data["summary"]["total_work_minutes"], 30); self.assertEqual(len(data["daily_series"]), 1)

    def test_26_double_counting_prevention(self):
        task = Task.objects.create(owner=self.user, title="Tracked")
        TaskProgressLog.objects.create(task=task, owner=self.user, log_date=self.today, progress_before=0, progress_after=20, minutes_spent=30)
        ActivityLog.objects.create(owner=self.user, activity_date=self.today, title="Mirror", activity_type="work", minutes_spent=30, related_task=task)
        self.assertEqual(self.summary("daily").data["summary"]["total_work_minutes"], 30)

    def test_27_authentication_requirement(self):
        self.client.force_authenticate(None); self.assertEqual(self.client.get(reverse("goals:goal-list")).status_code, 401)

    def test_28_user_isolation(self):
        other_goal = self.create_goal(owner=self.other)
        self.assertEqual(self.client.get(reverse("goals:goal-detail", args=[other_goal.pk])).status_code, 404)
        self.assertEqual(self.client.get(reverse("goals:goal-list")).data["count"], 0)
