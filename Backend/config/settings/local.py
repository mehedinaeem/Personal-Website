from .base import *  # noqa: F403

DEBUG = True
SECRET_KEY = SECRET_KEY or "local-development-only-key-change-me"  # noqa: F405
ALLOWED_HOSTS = ALLOWED_HOSTS or ["localhost", "127.0.0.1"]  # noqa: F405
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS or ["http://localhost:5173"]  # noqa: F405
CSRF_TRUSTED_ORIGINS = CSRF_TRUSTED_ORIGINS or ["http://localhost:5173"]  # noqa: F405
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
