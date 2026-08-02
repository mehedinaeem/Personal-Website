from unittest.mock import MagicMock, patch

import httpx
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase

from apps.opportunities.models import Opportunity
from .models import CapturedLink
from .services import (
    CaptureError, ResponseTooLarge, UnsafeURLError, extract_page, fetch_public_page,
    normalize_url, validate_public_destination,
)

PUBLIC_DNS = [(2, 1, 6, "", ("93.184.216.34", 0))]


class ExtractionTests(TestCase):
    def test_valid_public_page(self):
        data, _ = extract_page("https://example.com/post", "<html><title>Scholarship 2026</title><meta name='description' content='Study award'></html>")
        self.assertEqual(data["title"], "Scholarship 2026")
        self.assertEqual(data["opportunity_type"], "scholarship")

    def test_open_graph_extraction(self):
        data, metadata = extract_page("https://example.com", "<meta property='og:title' content='Research Internship'><meta property='og:description' content='Public description'><meta property='og:image' content='https://example.com/a.jpg'>")
        self.assertEqual(data["title"], "Research Internship")
        self.assertEqual(data["preview_image"], "https://example.com/a.jpg")
        self.assertIn("open_graph", metadata)

    def test_json_ld_extraction(self):
        html = '<script type="application/ld+json">{"@type":"Event","name":"Research Conference","description":"Join us"}</script>'
        data, _ = extract_page("https://example.com", html)
        self.assertEqual(data["title"], "Research Conference")

    def test_job_posting_extraction(self):
        html = '<script type="application/ld+json">{"@type":"JobPosting","title":"Engineer","hiringOrganization":{"name":"Example Ltd"},"validThrough":"2027-01-20T23:59:00+06:00"}</script>'
        data, _ = extract_page("https://example.com", html)
        self.assertEqual(data["organization"], "Example Ltd")
        self.assertEqual(len(data["deadline_candidates"]), 1)

    def test_multiple_deadline_candidates(self):
        html = "<p>Apply by 20 August 2027.</p><p>Applications close 25 August 2027.</p>"
        data, _ = extract_page("https://example.com", html)
        self.assertEqual(len(data["deadline_candidates"]), 2)


class SSRFTests(TestCase):
    def test_invalid_url(self):
        with self.assertRaises(UnsafeURLError): normalize_url("not-a-url")

    def test_unsupported_scheme(self):
        for url in ("file:///etc/passwd", "ftp://example.com/a", "data:text/plain,test"):
            with self.assertRaises(UnsafeURLError): normalize_url(url)

    def test_embedded_credentials(self):
        with self.assertRaises(UnsafeURLError): normalize_url("https://user:pass@example.com/")

    @patch("apps.capture.services.socket.getaddrinfo", return_value=[(2, 1, 6, "", ("127.0.0.1", 0))])
    def test_localhost_blocking(self, _):
        with self.assertRaises(UnsafeURLError): validate_public_destination("http://127.0.0.1")

    @patch("apps.capture.services.socket.getaddrinfo", return_value=[(2, 1, 6, "", ("10.0.0.2", 0))])
    def test_private_ip_blocking(self, _):
        with self.assertRaises(UnsafeURLError): validate_public_destination("http://private.example")

    @patch("apps.capture.services.socket.getaddrinfo", return_value=[(10, 1, 6, "", ("fd00::1", 0, 0, 0))])
    def test_ipv6_private_address_blocking(self, _):
        with self.assertRaises(UnsafeURLError): validate_public_destination("http://ipv6.example")

    @patch("apps.capture.services.socket.getaddrinfo", return_value=PUBLIC_DNS)
    @patch("apps.capture.services.httpx.Client")
    def test_oversized_response(self, client_cls, _):
        response = MagicMock(status_code=200, headers={"content-type": "text/html"}, encoding="utf-8")
        response.iter_bytes.return_value = [b"x" * 1_500_001]
        client_cls.return_value.__enter__.return_value.stream.return_value.__enter__.return_value = response
        with self.assertRaises(ResponseTooLarge): fetch_public_page("https://example.com")

    @patch("apps.capture.services.socket.getaddrinfo", return_value=PUBLIC_DNS)
    @patch("apps.capture.services.httpx.Client")
    def test_non_html_response(self, client_cls, _):
        response = MagicMock(status_code=200, headers={"content-type": "application/pdf"})
        client_cls.return_value.__enter__.return_value.stream.return_value.__enter__.return_value = response
        with self.assertRaises(CaptureError): fetch_public_page("https://example.com")

    @patch("apps.capture.services.socket.getaddrinfo", return_value=PUBLIC_DNS)
    @patch("apps.capture.services.httpx.Client")
    def test_timeout(self, client_cls, _):
        client_cls.return_value.__enter__.return_value.stream.side_effect = httpx.ReadTimeout("timeout")
        with self.assertRaisesRegex(CaptureError, "too long"): fetch_public_page("https://example.com")

    def test_redirect_to_private_ip(self):
        response = MagicMock(status_code=302, headers={"location": "http://10.0.0.1/internal"})
        client = MagicMock()
        client.__enter__.return_value.stream.return_value.__enter__.return_value = response
        def dns(host, *_args, **_kwargs):
            return [(2, 1, 6, "", ("10.0.0.1", 0))] if host == "10.0.0.1" else PUBLIC_DNS
        with patch("apps.capture.services.socket.getaddrinfo", side_effect=dns):
            with patch("apps.capture.services.httpx.Client", return_value=client):
                with self.assertRaises(UnsafeURLError): fetch_public_page("https://example.com")


class CaptureAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("capture-user", password="StrongPassword123!")
        self.other = get_user_model().objects.create_user("other-user", password="StrongPassword123!")
        self.client.force_authenticate(self.user)

    @patch("apps.capture.views.fetch_public_page", return_value=("https://facebook.com/post", "<html></html>"))
    def test_facebook_manual_fallback(self, _):
        response = self.client.post("/api/v1/capture/extract/", {"url": "https://facebook.com/post"}, format="json")
        self.assertEqual(response.data["status"], "manual_review_required")

    @patch("apps.capture.views.fetch_public_page", side_effect=CaptureError("blocked"))
    def test_linkedin_manual_fallback(self, _):
        response = self.client.post("/api/v1/capture/extract/", {"url": "https://linkedin.com/jobs/1"}, format="json")
        self.assertEqual(response.data["status"], "manual_review_required")

    @patch("apps.capture.views.fetch_public_page", return_value=("https://example.com/post", "<title>Job</title>"))
    def test_duplicate_url(self, _):
        first = self.client.post("/api/v1/capture/extract/", {"url": "https://EXAMPLE.com/post#fragment"}, format="json")
        second = self.client.post("/api/v1/capture/extract/", {"url": "https://example.com/post"}, format="json")
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(CapturedLink.objects.count(), 1)

    def test_user_isolation(self):
        capture = CapturedLink.objects.create(owner=self.other, url="https://example.com", normalized_url="https://example.com/")
        response = self.client.get(f"/api/v1/capture/{capture.id}/")
        self.assertEqual(response.status_code, 404)

    def test_authentication_requirement(self):
        self.client.force_authenticate(None)
        response = self.client.post("/api/v1/capture/extract/", {"url": "https://example.com"}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_review_links_owned_opportunity(self):
        capture = CapturedLink.objects.create(owner=self.user, url="https://example.com", normalized_url="https://example.com/")
        opportunity = Opportunity.objects.create(owner=self.user, title="Role", organization="Org", opportunity_type="job")
        response = self.client.patch(f"/api/v1/capture/{capture.id}/", {"created_opportunity": opportunity.id}, format="json")
        self.assertEqual(response.status_code, 200)
        capture.refresh_from_db()
        self.assertEqual(capture.status, "reviewed")
