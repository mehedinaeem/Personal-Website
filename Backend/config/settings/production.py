from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403


def require_setting(name, value):
    if not value:
        raise ImproperlyConfigured(f"Required production setting {name} is missing.")
    return value


DEBUG = False
SECRET_KEY = require_setting("DJANGO_SECRET_KEY", SECRET_KEY)  # noqa: F405
DATABASE_URL = require_setting("DATABASE_URL", os.getenv("DATABASE_URL"))  # noqa: F405
DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600, conn_health_checks=True)}  # noqa: F405

ALLOWED_HOSTS = ["api.mehedinaeem.dev"]
CORS_ALLOWED_ORIGINS = ["https://mehedinaeem.dev", "https://www.mehedinaeem.dev"]
CSRF_TRUSTED_ORIGINS = [
    "https://mehedinaeem.dev",
    "https://www.mehedinaeem.dev",
    "https://api.mehedinaeem.dev",
]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
AUTH_REFRESH_COOKIE_SECURE = True
AUTH_REFRESH_COOKIE_SAMESITE = "Lax"
SECURE_HSTS_SECONDS = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
