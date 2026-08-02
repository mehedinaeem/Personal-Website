from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from config.models import OwnedTimestampedModel

User = get_user_model()


class AuthenticationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.password = "A-strong-test-password-493!"
        self.user = User.objects.create_user(
            username="owner", email="owner@example.com", password=self.password
        )
        self.client = APIClient()

    def login(self):
        return self.client.post(
            reverse("accounts:login"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )

    def test_successful_login_sets_cookie_and_returns_access(self):
        response = self.login()

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertNotIn("refresh", response.data)
        self.assertIn(settings.AUTH_REFRESH_COOKIE_NAME, response.cookies)
        self.assertTrue(response.cookies[settings.AUTH_REFRESH_COOKIE_NAME]["httponly"])

    def test_invalid_username_or_password(self):
        response = self.client.post(
            reverse("accounts:login"),
            {"email": self.user.email, "password": "incorrect-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access", response.data)

    def test_current_user_endpoint(self):
        token = str(AccessToken.for_user(self.user))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(reverse("accounts:me"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertNotIn("password", response.data)

    def test_missing_access_token(self):
        self.assertEqual(self.client.get(reverse("accounts:me")).status_code, 401)

    def test_invalid_access_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid-token")
        self.assertEqual(self.client.get(reverse("accounts:me")).status_code, 401)

    def test_refresh_token_flow_rotates_cookie(self):
        login_response = self.login()
        old_token = login_response.cookies[settings.AUTH_REFRESH_COOKIE_NAME].value

        response = self.client.post(reverse("accounts:refresh"), {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertNotEqual(response.cookies[settings.AUTH_REFRESH_COOKIE_NAME].value, old_token)

    def test_rotated_refresh_token_is_blacklisted(self):
        old_token = self.login().cookies[settings.AUTH_REFRESH_COOKIE_NAME].value
        old_jti = RefreshToken(old_token)["jti"]

        self.assertEqual(self.client.post(reverse("accounts:refresh"), {}).status_code, 200)
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=old_jti).exists())

    def test_blacklisted_refresh_token_is_rejected(self):
        old_token = self.login().cookies[settings.AUTH_REFRESH_COOKIE_NAME].value
        self.assertEqual(self.client.post(reverse("accounts:refresh"), {}).status_code, 200)
        self.client.cookies[settings.AUTH_REFRESH_COOKIE_NAME] = old_token

        self.assertEqual(self.client.post(reverse("accounts:refresh"), {}).status_code, 401)

    def test_logout_blacklists_active_refresh_and_clears_cookie(self):
        token = self.login().cookies[settings.AUTH_REFRESH_COOKIE_NAME].value
        jti = RefreshToken(token)["jti"]

        response = self.client.post(reverse("accounts:logout"), {}, format="json")

        self.assertEqual(response.status_code, 204)
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=jti).exists())
        self.assertEqual(response.cookies[settings.AUTH_REFRESH_COOKIE_NAME]["max-age"], 0)

    def test_invalid_refresh_token(self):
        self.client.cookies[settings.AUTH_REFRESH_COOKIE_NAME] = "invalid-token"
        self.assertEqual(self.client.post(reverse("accounts:refresh"), {}).status_code, 401)

    def test_protected_endpoint_access(self):
        access = self.login().data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(self.client.get(reverse("accounts:me")).status_code, 200)

    def test_login_throttling(self):
        cache.clear()
        payload = {"email": self.user.email, "password": "wrong-password"}
        for _ in range(5):
            self.client.post(reverse("accounts:login"), payload, format="json")

        response = self.client.post(reverse("accounts:login"), payload, format="json")

        self.assertEqual(response.status_code, 429)

    def test_user_isolation_foundation_is_abstract_and_owned(self):
        self.assertTrue(OwnedTimestampedModel._meta.abstract)
        self.assertEqual(
            OwnedTimestampedModel._meta.get_field("owner").remote_field.model,
            settings.AUTH_USER_MODEL,
        )
        self.assertTrue(OwnedTimestampedModel._meta.get_field("created_at").db_index)

    @override_settings(
        AUTH_REFRESH_COOKIE_SECURE=True,
        AUTH_REFRESH_COOKIE_HTTPONLY=True,
        AUTH_REFRESH_COOKIE_SAMESITE="Lax",
        AUTH_REFRESH_COOKIE_PATH="/api/v1/auth/",
    )
    def test_secure_cookie_behavior_in_production_settings(self):
        response = self.login()
        cookie = response.cookies[settings.AUTH_REFRESH_COOKIE_NAME]

        self.assertTrue(cookie["secure"])
        self.assertTrue(cookie["httponly"])
        self.assertEqual(cookie["samesite"], "Lax")
        self.assertEqual(cookie["path"], "/api/v1/auth/")


class CsrfProtectionTests(TestCase):
    def setUp(self):
        self.password = "A-strong-test-password-493!"
        self.user = User.objects.create_user(
            username="csrf-owner", email="csrf@example.com", password=self.password
        )
        self.client = APIClient(enforce_csrf_checks=True)

    def test_login_requires_csrf_and_accepts_bootstrapped_token(self):
        payload = {"email": self.user.email, "password": self.password}
        denied = self.client.post(reverse("accounts:login"), payload, format="json")
        self.assertEqual(denied.status_code, 403)

        csrf_response = self.client.get(reverse("accounts:csrf"))
        accepted = self.client.post(
            reverse("accounts:login"),
            payload,
            format="json",
            HTTP_X_CSRFTOKEN=csrf_response.data["csrfToken"],
        )
        self.assertEqual(accepted.status_code, 200)
