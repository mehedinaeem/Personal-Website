from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.progress.models import ActivityLog
from .models import Application, Opportunity

User = get_user_model()


class OpportunityTrackerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("applicant", password="test-password")
        self.other = User.objects.create_user("other-applicant", password="test-password")
        self.client.force_authenticate(self.user)

    def opportunity_data(self, **changes):
        data = {"title": "Research Internship", "organization": "Example Lab", "opportunity_type": "internship", "source_platform": "website", "work_mode": "remote", "deadline": timezone.now() + timedelta(days=7), "status": "saved", "extraction_confidence": 90}
        data.update(changes); return data

    def create_opportunity(self, owner=None, **changes):
        return Opportunity.objects.create(owner=owner or self.user, **self.opportunity_data(**changes))

    def test_01_opportunity_creation(self):
        response = self.client.post(reverse("opportunities:opportunity-list"), self.opportunity_data(), format="json")
        self.assertEqual(response.status_code, 201); self.assertEqual(Opportunity.objects.get().owner, self.user)

    def test_02_opportunity_update(self):
        item = self.create_opportunity(); response = self.client.patch(reverse("opportunities:opportunity-detail", args=[item.pk]), {"status": "reviewing"}, format="json")
        self.assertEqual(response.status_code, 200); item.refresh_from_db(); self.assertEqual(item.status, "reviewing")

    def test_03_opportunity_deletion(self):
        item = self.create_opportunity(); self.assertEqual(self.client.delete(reverse("opportunities:opportunity-detail", args=[item.pk])).status_code, 204)

    def test_04_opportunity_deadline_filtering(self):
        upcoming = self.create_opportunity(); self.create_opportunity(title="Later", deadline=timezone.now() + timedelta(days=30))
        response = self.client.get(reverse("opportunities:opportunity-list"), {"deadline_before": timezone.now() + timedelta(days=10)})
        self.assertEqual([row["id"] for row in response.data["results"]], [upcoming.id])

    def test_05_expired_opportunity_filtering(self):
        expired = self.create_opportunity(deadline=timezone.now() - timedelta(hours=1)); self.create_opportunity(title="Open")
        response = self.client.get(reverse("opportunities:opportunity-expired"))
        self.assertEqual([row["id"] for row in response.data["results"]], [expired.id]); self.assertTrue(response.data["results"][0]["is_deadline_passed"])

    def application_data(self, opportunity, **changes):
        data = {"opportunity": opportunity.id, "stage": "saved", "documents_checklist": [{"name": "CV", "completed": True}], "next_action": "Review requirements"}; data.update(changes); return data

    def test_06_application_creation(self):
        opportunity = self.create_opportunity(); response = self.client.post(reverse("applications:application-list"), self.application_data(opportunity), format="json")
        self.assertEqual(response.status_code, 201); self.assertEqual(Application.objects.get().owner, self.user)

    def test_07_application_update(self):
        application = Application.objects.create(owner=self.user, opportunity=self.create_opportunity())
        response = self.client.patch(reverse("applications:application-detail", args=[application.pk]), {"next_action": "Prepare CV"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_08_application_stage_transition(self):
        application = Application.objects.create(owner=self.user, opportunity=self.create_opportunity())
        self.client.patch(reverse("applications:application-detail", args=[application.pk]), {"stage": "interview"}, format="json")
        application.refresh_from_db(); self.assertEqual(application.stage, "interview")

    def test_09_mark_as_applied_action(self):
        opportunity = self.create_opportunity(); response = self.client.post(reverse("opportunities:opportunity-mark-applied", args=[opportunity.pk]))
        self.assertEqual(response.status_code, 200); self.assertEqual(Application.objects.get().stage, "applied")

    def test_10_duplicate_application_prevention(self):
        opportunity = self.create_opportunity(); self.client.post(reverse("applications:application-list"), self.application_data(opportunity), format="json")
        self.assertEqual(self.client.post(reverse("applications:application-list"), self.application_data(opportunity), format="json").status_code, 400)

    def test_11_opportunity_owner_validation(self):
        opportunity = self.create_opportunity(owner=self.other)
        self.assertEqual(self.client.post(reverse("applications:application-list"), self.application_data(opportunity), format="json").status_code, 400)

    def test_12_application_owner_validation(self):
        opportunity = self.create_opportunity(); response = self.client.post(reverse("applications:application-list"), {**self.application_data(opportunity), "owner": self.other.id}, format="json")
        self.assertEqual(response.status_code, 201); self.assertEqual(Application.objects.get().owner, self.user)

    def test_13_progress_analytics_integration(self):
        opportunity = self.create_opportunity(); self.client.post(reverse("opportunities:opportunity-mark-applied", args=[opportunity.pk]))
        application = Application.objects.get(); self.assertIsNotNone(application.submission_activity_id); self.assertEqual(ActivityLog.objects.get().minutes_spent, 0)
        summary = self.client.get(reverse("progress:summary"), {"period": "daily"}).data
        self.assertEqual(summary["daily_series"][0]["activities"], 1); self.assertEqual(summary["summary"]["total_work_minutes"], 0)

    def test_14_unauthenticated_access(self):
        self.client.force_authenticate(None); self.assertEqual(self.client.get(reverse("opportunities:opportunity-list")).status_code, 401); self.assertEqual(self.client.get(reverse("applications:application-list")).status_code, 401)

    def test_15_user_isolation(self):
        other_opportunity = self.create_opportunity(owner=self.other); other_application = Application.objects.create(owner=self.other, opportunity=other_opportunity)
        self.assertEqual(self.client.get(reverse("opportunities:opportunity-detail", args=[other_opportunity.pk])).status_code, 404)
        self.assertEqual(self.client.get(reverse("applications:application-detail", args=[other_application.pk])).status_code, 404)
