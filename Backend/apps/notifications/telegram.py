import hmac
import logging
import re
from datetime import timedelta

import httpx
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone

from apps.capture.models import CapturedLink
from apps.capture.services import CaptureError, extract_page, fetch_public_page, normalize_url, platform_for
from apps.opportunities.models import Opportunity
from apps.progress.models import Goal
from apps.tasks.models import Task
from apps.travel.models import TravelPlan

logger = logging.getLogger(__name__)
URL_RE = re.compile(r"https?://[^\s<>]+", re.IGNORECASE)
TELEGRAM_TIMEOUT = httpx.Timeout(5.0, connect=3.0)


class TelegramTemporaryError(RuntimeError):
    pass


class TelegramPermanentError(RuntimeError):
    pass


def configured_chat_id():
    return str(settings.TELEGRAM_CHAT_ID).strip()


def is_authorized_chat(chat_id):
    configured = configured_chat_id()
    return bool(configured) and hmac.compare_digest(str(chat_id), configured)


def bot_owner():
    users = get_user_model().objects.filter(is_active=True)
    return users.filter(is_superuser=True).order_by("id").first() or users.order_by("id").first()


def send_telegram_message(chat_id, text):
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        raise RuntimeError("Telegram is not configured.")
    try:
        response = httpx.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": str(chat_id), "text": text, "disable_web_page_preview": True},
            timeout=TELEGRAM_TIMEOUT,
        )
        response.raise_for_status()
    except (httpx.TimeoutException, httpx.NetworkError) as exc:
        raise TelegramTemporaryError("Telegram delivery failed temporarily.") from exc
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429 or exc.response.status_code >= 500:
            raise TelegramTemporaryError("Telegram delivery failed temporarily.") from exc
        raise TelegramPermanentError("Telegram rejected the message.") from exc
    except httpx.HTTPError as exc:
        raise TelegramTemporaryError("Telegram delivery failed temporarily.") from exc


def review_url(captured):
    root = settings.FRONTEND_URL.rstrip("/")
    return f"{root}/admin/capture/{captured.pk}"


def capture_url(owner, original_url):
    normalized = normalize_url(original_url)
    captured = CapturedLink.objects.filter(owner=owner, normalized_url=normalized).first()
    if captured:
        return captured, True
    try:
        captured = CapturedLink.objects.create(
            owner=owner, url=original_url, normalized_url=normalized,
            source_platform=platform_for(normalized), status="pending",
        )
    except IntegrityError:
        return CapturedLink.objects.get(owner=owner, normalized_url=normalized), True
    platform = captured.source_platform
    warnings = []
    try:
        final_url, html = fetch_public_page(normalized)
        data, metadata = extract_page(final_url, html)
        manual = platform in {"facebook", "linkedin"} and not (data.get("title") or data.get("summary"))
        captured.status = "manual_review_required" if manual else "extracted"
        captured.extracted_data = data
        captured.raw_metadata = metadata
        if manual:
            warnings.append("The platform did not expose enough public information.")
    except (CaptureError, ValueError):
        captured.status = "manual_review_required" if platform in {"facebook", "linkedin"} else "failed"
        captured.extracted_data = {"source_platform": platform}
        captured.error_message = "Public information could not be extracted safely."
        warnings.append("The platform did not expose enough public information." if platform in {"facebook", "linkedin"} else captured.error_message)
    captured.save()
    captured._telegram_warnings = warnings
    return captured, False


def capture_message(captured, duplicate=False):
    data = captured.extracted_data or {}
    prefix = "This link was already captured.\n\n" if duplicate else ""
    if captured.status in {"manual_review_required", "failed"}:
        detail = "The platform did not expose enough public information." if captured.status == "manual_review_required" else "Automatic extraction was unsuccessful."
        return f"{prefix}Link saved for manual review.\n\n{detail}\n\nReview:\n{review_url(captured)}"
    lines = [f"{prefix}Opportunity captured", "", f"Title: {data.get('title') or 'Not detected'}"]
    if data.get("organization"):
        lines.append(f"Organization: {data['organization']}")
    candidates = data.get("deadline_candidates") or []
    if candidates:
        candidate = candidates[0]
        lines.extend([f"Possible deadline: {candidate.get('text') or candidate.get('value')}", f"Confidence: {confidence_label(candidate.get('confidence', 0))}"])
    lines.extend(["", "Deadline not confirmed.", "", "Review and save:", review_url(captured)])
    return "\n".join(lines)


def confidence_label(value):
    if value >= 0.8:
        return "High"
    if value >= 0.5:
        return "Medium"
    return "Low"


def today_message(owner):
    today = timezone.localdate()
    tasks = Task.objects.filter(owner=owner, due_at__date=today).exclude(status__in=["completed", "cancelled"])[:10]
    return list_message("Incomplete tasks due today", tasks, lambda item: f"• {item.title} [{item.get_priority_display()}]", "No incomplete tasks are due today.")


def goals_message(owner):
    today = timezone.localdate()
    goals = Goal.objects.filter(owner=owner, status="active", period_type__in=["daily", "monthly"], start_date__lte=today, end_date__gte=today)[:10]
    return list_message("Active daily and monthly goals", goals, lambda item: f"• {item.title} ({item.completion_percentage}%)", "No active daily or monthly goals.")


def deadlines_message(owner):
    now = timezone.now()
    opportunities = Opportunity.objects.filter(owner=owner, deadline__gte=now, deadline__lte=now + timedelta(days=7)).exclude(status__in=["ignored", "expired"])[:10]
    return list_message("Opportunity deadlines in the next 7 days", opportunities, lambda item: f"• {item.title} — {timezone.localtime(item.deadline).strftime('%d %b %Y, %H:%M')}", "No opportunity deadlines in the next 7 days.")


def travel_message(owner):
    today = timezone.localdate()
    plans = TravelPlan.objects.filter(owner=owner, start_date__gte=today).exclude(status__in=["completed", "cancelled"])[:10]
    return list_message("Upcoming travel plans", plans, lambda item: f"• {item.title} — {item.destination}, {item.start_date:%d %b %Y}", "No upcoming travel plans.")


def list_message(title, queryset, formatter, empty):
    items = list(queryset)
    return f"{title}\n\n" + ("\n".join(formatter(item) for item in items) if items else empty)


HELP = "Available commands:\n/start — bot status\n/help — command list\n/today — tasks due today\n/goals — active goals\n/deadlines — next 7 days\n/travel — upcoming travel\n/save <url> — capture a public opportunity link"


def handle_text(owner, text):
    clean = (text or "").strip()
    command = clean.split(maxsplit=1)[0].split("@", 1)[0].lower() if clean else ""
    if command == "/start":
        return "Private portfolio bot is ready.\n\n" + HELP
    if command == "/help":
        return HELP
    if command == "/today":
        return today_message(owner)
    if command == "/goals":
        return goals_message(owner)
    if command == "/deadlines":
        return deadlines_message(owner)
    if command == "/travel":
        return travel_message(owner)
    matches = URL_RE.findall(clean)
    if command == "/save" or (len(matches) == 1 and clean == matches[0]):
        if len(matches) != 1:
            return "Send one public HTTP or HTTPS URL with /save."
        try:
            captured, duplicate = capture_url(owner, matches[0].rstrip(".,);]"))
            return capture_message(captured, duplicate)
        except CaptureError:
            return "That URL could not be accepted safely."
    return "Command not recognized. Use /help. Broad natural-language creation is not enabled."
