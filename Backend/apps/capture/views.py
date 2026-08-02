from django.db import IntegrityError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from .models import CapturedLink
from .serializers import CapturedLinkSerializer, ExtractRequestSerializer
from .services import CaptureError, extract_page, fetch_public_page, normalize_url, platform_for


class CaptureThrottle(UserRateThrottle):
    scope = "capture_extract"


class CapturedLinkViewSet(viewsets.GenericViewSet):
    serializer_class = CapturedLinkSerializer

    def get_queryset(self):
        return CapturedLink.objects.filter(owner=self.request.user).select_related("created_opportunity")

    def retrieve(self, request, *args, **kwargs):
        return Response(self.get_serializer(self.get_object()).data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["post"], throttle_classes=[CaptureThrottle])
    def extract(self, request):
        request_serializer = ExtractRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        original_url = request_serializer.validated_data["url"]
        try:
            normalized = normalize_url(original_url)
        except CaptureError as exc:
            return Response({"url": original_url, "status": "failed", "data": {}, "warnings": [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)
        existing = self.get_queryset().filter(normalized_url=normalized).first()
        if existing:
            payload = self.get_serializer(existing).data
            payload.update({"data": existing.extracted_data, "warnings": ["This URL was already captured."]})
            return Response(payload)
        platform = platform_for(normalized)
        captured = CapturedLink.objects.create(owner=request.user, url=original_url, normalized_url=normalized, source_platform=platform)
        warnings = []
        try:
            final_url, html = fetch_public_page(normalized)
            data, metadata = extract_page(final_url, html)
            manual = platform in {"facebook", "linkedin"} and not (data.get("title") or data.get("summary"))
            captured.status = "manual_review_required" if manual else "extracted"
            captured.extracted_data = data
            captured.raw_metadata = metadata
            if manual:
                warnings.append("The platform did not expose the post content publicly. Complete the information manually.")
        except (CaptureError, ValueError):
            captured.status = "manual_review_required" if platform in {"facebook", "linkedin"} else "failed"
            captured.error_message = "Public information could not be extracted safely."
            captured.extracted_data = {"source_platform": platform}
            warnings.append("The platform did not expose the post content publicly. Complete the information manually." if platform in {"facebook", "linkedin"} else captured.error_message)
        try:
            captured.save()
        except IntegrityError:
            captured = self.get_queryset().get(normalized_url=normalized)
        return Response({"id": captured.id, "url": captured.url, "status": captured.status, "data": captured.extracted_data, "warnings": warnings})
