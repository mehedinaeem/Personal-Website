import ipaddress
import json
import re
import socket
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

import dateparser
import httpx
from bs4 import BeautifulSoup
from django.utils import timezone

MAX_REDIRECTS = 4
MAX_RESPONSE_BYTES = 1_500_000
TIMEOUT = httpx.Timeout(connect=5.0, read=10.0, write=5.0, pool=5.0)
USER_AGENT = "MehediNaeemOpportunityCapture/1.0 (+https://mehedinaeem.dev)"
ALLOWED_CONTENT_TYPES = ("text/html", "application/xhtml+xml", "text/plain")


class CaptureError(Exception):
    pass


class UnsafeURLError(CaptureError):
    pass


class ResponseTooLarge(CaptureError):
    pass


def normalize_url(value):
    parts = urlsplit(value.strip())
    if parts.scheme.lower() not in {"http", "https"}:
        raise UnsafeURLError("Only HTTP and HTTPS URLs are supported.")
    if parts.username or parts.password:
        raise UnsafeURLError("URLs containing credentials are not allowed.")
    if not parts.hostname:
        raise UnsafeURLError("A valid hostname is required.")
    host = parts.hostname.lower().rstrip(".")
    if host == "localhost" or host.endswith(".localhost"):
        raise UnsafeURLError("Local addresses are not allowed.")
    port = parts.port
    netloc = f"[{host}]" if ":" in host else host
    if port and not ((parts.scheme.lower() == "http" and port == 80) or (parts.scheme.lower() == "https" and port == 443)):
        netloc += f":{port}"
    path = parts.path or "/"
    query = urlencode(sorted(parse_qsl(parts.query, keep_blank_values=True)))
    return urlunsplit((parts.scheme.lower(), netloc, path, query, ""))


def validate_public_destination(url):
    normalized = normalize_url(url)
    host = urlsplit(normalized).hostname
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)}
    except socket.gaierror as exc:
        raise UnsafeURLError("The hostname could not be resolved.") from exc
    if not addresses:
        raise UnsafeURLError("The hostname could not be resolved.")
    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise UnsafeURLError("The URL resolves to a non-public network address.")
    return normalized


def fetch_public_page(url, client_factory=None):
    client_factory = client_factory or httpx.Client
    current = validate_public_destination(url)
    with client_factory(timeout=TIMEOUT, follow_redirects=False, headers={"User-Agent": USER_AGENT, "Accept": "text/html,text/plain;q=0.8"}) as client:
        for redirect_number in range(MAX_REDIRECTS + 1):
            # Resolve immediately before every request, including redirects, to reduce DNS-rebinding exposure.
            current = validate_public_destination(current)
            try:
                with client.stream("GET", current) as response:
                    if response.status_code in {301, 302, 303, 307, 308}:
                        if redirect_number == MAX_REDIRECTS:
                            raise CaptureError("Too many redirects.")
                        location = response.headers.get("location")
                        if not location:
                            raise CaptureError("The redirect destination was missing.")
                        current = validate_public_destination(urljoin(current, location))
                        continue
                    response.raise_for_status()
                    content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
                    if not any(content_type == allowed for allowed in ALLOWED_CONTENT_TYPES):
                        raise CaptureError("The URL did not return an HTML or text page.")
                    body = bytearray()
                    for chunk in response.iter_bytes():
                        body.extend(chunk)
                        if len(body) > MAX_RESPONSE_BYTES:
                            raise ResponseTooLarge("The page was too large to process safely.")
                    encoding = response.encoding or "utf-8"
                    return current, bytes(body).decode(encoding, errors="replace")
            except httpx.TimeoutException as exc:
                raise CaptureError("The page took too long to respond.") from exc
            except httpx.HTTPError as exc:
                raise CaptureError("The public page could not be fetched.") from exc
    raise CaptureError("The page could not be fetched.")


def platform_for(url):
    host = (urlsplit(url).hostname or "").lower()
    if host == "facebook.com" or host.endswith(".facebook.com") or host == "fb.watch":
        return "facebook"
    if host == "linkedin.com" or host.endswith(".linkedin.com"):
        return "linkedin"
    return "website"


def _meta(soup, key, attribute="property"):
    tag = soup.find("meta", attrs={attribute: key})
    return tag.get("content", "").strip() if tag else ""


def _jsonld(soup):
    items = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            value = json.loads(tag.string or tag.get_text())
            items.extend(value if isinstance(value, list) else [value])
        except (json.JSONDecodeError, TypeError):
            continue
    flattened = []
    for item in items:
        if isinstance(item, dict) and isinstance(item.get("@graph"), list):
            flattened.extend(x for x in item["@graph"] if isinstance(x, dict))
        elif isinstance(item, dict):
            flattened.append(item)
    return flattened


def _text(value):
    if isinstance(value, dict):
        return value.get("name") or value.get("value") or ""
    if isinstance(value, list):
        return ", ".join(filter(None, (_text(item) for item in value)))
    return str(value or "")


DEADLINE_RE = re.compile(r"(?i)(?:deadline|apply by|closing date|applications? close)[^\n.]{0,45}?(\b\d{1,2}(?:st|nd|rd|th)?[\s/-]+(?:[A-Za-z]{3,9}|\d{1,2})[\s,/-]+\d{2,4}(?:\s+(?:at\s+)?\d{1,2}:\d{2}(?:\s*[ap]m)?)?)")


def extract_page(url, html):
    soup = BeautifulSoup(html, "html.parser")
    for element in soup(["script", "style", "noscript", "svg"]):
        element.decompose()
    og = {name: _meta(soup, f"og:{name}") for name in ("title", "description", "image", "site_name")}
    title = og["title"] or _meta(soup, "twitter:title", "name") or (soup.title.get_text(strip=True) if soup.title else "")
    summary = og["description"] or _meta(soup, "description", "name") or _meta(soup, "twitter:description", "name")
    structured = _jsonld(BeautifulSoup(html, "html.parser"))
    job = next((x for x in structured if "JobPosting" in _text(x.get("@type"))), None)
    entity = job or next((x for x in structured if x.get("name") or x.get("headline")), {})
    title = title or _text(entity.get("title") or entity.get("headline") or entity.get("name"))
    summary = summary or _text(entity.get("description"))
    organization = og["site_name"] or _text((entity.get("hiringOrganization") or {}).get("name") if isinstance(entity.get("hiringOrganization"), dict) else entity.get("provider"))
    location = _text(entity.get("jobLocation"))
    application_url = _text(entity.get("url"))
    visible = "\n".join(line.strip() for line in soup.get_text("\n").splitlines() if line.strip())[:80_000]
    candidates = []
    values = []
    if entity.get("validThrough"):
        values.append((_text(entity["validThrough"]), f"Structured deadline: {_text(entity['validThrough'])}", 0.96))
    for match in DEADLINE_RE.finditer(visible):
        values.append((match.group(1), match.group(0).strip(), 0.78))
    seen = set()
    for raw, context, confidence in values:
        parsed = dateparser.parse(raw, settings={"TIMEZONE": "Asia/Dhaka", "RETURN_AS_TIMEZONE_AWARE": True, "PREFER_DATES_FROM": "future"})
        if parsed:
            value = parsed.astimezone(timezone.get_current_timezone()).isoformat()
            if value not in seen:
                candidates.append({"value": value, "text": context, "confidence": confidence})
                seen.add(value)
    lowered = f"{title} {summary} {visible[:3000]}".lower()
    opportunity_type = next((kind for kind in ("internship", "scholarship", "fellowship", "conference", "competition", "volunteer", "job") if kind in lowered), "other")
    work_mode = next((mode for mode in ("remote", "hybrid", "onsite") if mode in lowered), "not_specified")
    data = {
        "title": title[:255], "organization": organization[:255], "summary": BeautifulSoup(summary, "html.parser").get_text(" ", strip=True)[:4000],
        "opportunity_type": opportunity_type, "source_platform": platform_for(url), "application_url": application_url,
        "location": location[:255], "work_mode": work_mode, "deadline_candidates": candidates,
        "eligibility": "", "requirements": "", "funding_or_salary": _text(entity.get("baseSalary"))[:255],
        "preview_image": og["image"],
    }
    metadata = {"open_graph": {k: v for k, v in og.items() if v}, "structured_data_types": [_text(x.get("@type")) for x in structured]}
    return data, metadata
