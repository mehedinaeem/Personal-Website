from datetime import datetime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.test.utils import CaptureQueriesContext
from django.db import connection
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.learning.models import LearningItem, LearningSession
from apps.tasks.models import Task, TaskProgressLog
from apps.travel.models import TravelPlan
from .models import ActivityLog, Goal


class AnalyticsTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("analytics", password="StrongPassword123!")
        self.other = get_user_model().objects.create_user("other-analytics", password="StrongPassword123!")
        self.client.force_authenticate(self.user)
        self.today = timezone.localdate()

    def completed_task(self, owner=None, title="Completed", area="research"):
        task = Task.objects.create(owner=owner or self.user, title=title, area=area, status="completed", due_at=timezone.now())
        Task.objects.filter(pk=task.pk).update(created_at=timezone.now(), completed_at=timezone.now())
        task.refresh_from_db(); return task

    def test_authentication_requirement(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/v1/progress/analytics/").status_code, 401)
        self.assertEqual(self.client.get("/api/v1/dashboard/summary/").status_code, 401)

    def test_user_isolation(self):
        self.completed_task(self.other, "Secret")
        response = self.client.get("/api/v1/progress/analytics/?period=7d")
        self.assertEqual(response.data["summary"]["completed_tasks"], 0)

    def test_daily_analytics(self):
        self.completed_task()
        data = self.client.get("/api/v1/progress/analytics/?period=7d").data
        self.assertEqual(len(data["daily_trend"]), 7); self.assertEqual(data["summary"]["completed_tasks"], 1)

    def test_monthly_analytics(self):
        self.completed_task()
        data = self.client.get(f"/api/v1/progress/analytics/?period=monthly&year={self.today.year}&month={self.today.month}").data
        self.assertTrue(data["planned_vs_completed"])

    def test_yearly_analytics(self):
        data = self.client.get(f"/api/v1/progress/analytics/?period=yearly&year={self.today.year}").data
        self.assertEqual(len(data["monthly_trend"]), 12)

    def test_custom_date_range(self):
        start = self.today - timedelta(days=2)
        data = self.client.get(f"/api/v1/progress/analytics/?period=custom&start_date={start}&end_date={self.today}").data
        self.assertEqual(len(data["daily_trend"]), 3)

    def test_activity_heatmap_values(self):
        task = self.completed_task(); TaskProgressLog.objects.create(task=task, owner=self.user, progress_before=0, progress_after=100, minutes_spent=60)
        row = self.client.get("/api/v1/progress/analytics/?period=7d").data["activity_heatmap"][-1]
        self.assertEqual(row["work_minutes"], 60); self.assertGreater(row["activity_score"], 10)

    def test_planned_vs_completed_values(self):
        self.completed_task()
        rows = self.client.get("/api/v1/progress/analytics/?period=monthly").data["planned_vs_completed"]
        self.assertEqual(sum(x["completed"] for x in rows), 1)

    def test_category_breakdown(self):
        self.completed_task(area="programming")
        rows = self.client.get("/api/v1/progress/analytics/?period=30d").data["category_breakdown"]
        self.assertEqual(next(x for x in rows if x["category"] == "programming")["completed_items"], 1)

    def learning(self):
        item = LearningItem.objects.create(owner=self.user, title="Django", topic="Django", learning_type="course", target_hours=10, completed_hours=2)
        LearningSession.objects.create(owner=self.user, learning_item=item, session_date=self.today, minutes_spent=90)
        return item

    def test_learning_cumulative_totals(self):
        self.learning(); rows = self.client.get("/api/v1/progress/analytics/?period=7d").data["learning_cumulative"]
        self.assertEqual(rows[-1]["hours"], 1.5)

    def test_learning_topic_breakdown(self):
        self.learning(); rows = self.client.get("/api/v1/progress/analytics/?period=7d").data["learning_by_topic"]
        self.assertEqual(rows[0]["topic"], "Django")

    def test_goal_progress_values(self):
        goal = Goal.objects.create(owner=self.user, title="Write", period_type="monthly", start_date=self.today, end_date=self.today + timedelta(days=5), target_value=10, current_value=4, status="active")
        row = self.client.get("/api/v1/progress/analytics/?period=30d").data["goal_progress"][0]
        self.assertEqual(row["id"], goal.id); self.assertEqual(row["percentage"], 40)

    def travel(self, title="Trip", status="planning"):
        return TravelPlan.objects.create(owner=self.user, title=title, destination="Dhaka", purpose="conference", status=status, start_date=self.today, end_date=self.today + timedelta(days=2), estimated_budget=Decimal("100"), actual_cost=Decimal("80"))

    def test_travel_timeline(self):
        self.travel(); rows = self.client.get("/api/v1/progress/analytics/?period=30d").data["travel_timeline"]
        self.assertEqual(rows[0]["destination"], "Dhaka")

    def test_travel_budget_comparison(self):
        self.travel(status="completed"); rows = self.client.get("/api/v1/progress/analytics/?period=30d").data["travel_budget_comparison"]
        self.assertEqual(rows[0]["actual"], 80)

    def test_empty_data(self):
        data = self.client.get("/api/v1/progress/analytics/?period=7d").data
        self.assertEqual(data["summary"]["completion_percentage"], 0); self.assertEqual(len(data["daily_trend"]), 7)

    def test_missing_dates(self):
        self.assertEqual(self.client.get("/api/v1/progress/analytics/?period=custom").status_code, 400)

    def test_double_counting_prevention(self):
        task = self.completed_task(); TaskProgressLog.objects.create(task=task, owner=self.user, progress_before=0, progress_after=100, minutes_spent=30)
        ActivityLog.objects.create(owner=self.user, activity_date=self.today, title="Same work", category="research", activity_type="work", minutes_spent=30, related_task=task)
        self.assertEqual(self.client.get("/api/v1/progress/analytics/?period=7d").data["summary"]["work_hours"], .5)

    @override_settings(TIME_ZONE="Asia/Dhaka")
    def test_asia_dhaka_date_boundaries(self):
        task = self.completed_task(); instant = timezone.make_aware(datetime.combine(self.today, datetime.min.time())) - timedelta(minutes=1)
        Task.objects.filter(pk=task.pk).update(completed_at=instant)
        rows = self.client.get("/api/v1/progress/analytics/?period=7d").data["daily_trend"]
        self.assertEqual(rows[-1]["completed_tasks"], 0)

    def test_csv_export(self):
        response = self.client.get("/api/v1/progress/analytics/export/?period=7d&dataset=daily_activity")
        self.assertEqual(response.status_code, 200); self.assertIn("text/csv", response["Content-Type"])

    def test_csv_injection_protection(self):
        self.travel(title="=IMPORTDATA('bad')")
        text = self.client.get("/api/v1/progress/analytics/export/?period=30d&dataset=travel_plans").content.decode()
        self.assertNotIn(",=IMPORTDATA", text); self.assertIn("'=IMPORTDATA", text)

    def test_efficient_query_behavior(self):
        with CaptureQueriesContext(connection) as queries:
            self.client.get("/api/v1/progress/analytics/?period=7d")
        self.assertLessEqual(len(queries), 35)
