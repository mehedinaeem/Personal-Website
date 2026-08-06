from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    filterset_fields = ["status", "channel", "reminder_type"]
    ordering_fields = ["scheduled_at", "created_at"]

    def get_queryset(self):
        return Reminder.objects.filter(owner=self.request.user).select_related(*Reminder.REFERENCES)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        serializer.save(status="pending", attempt_count=0, last_error="", sent_at=None)

    def partial_update(self, request, *args, **kwargs):
        if self.get_object().status in {"sent", "cancelled"}:
            raise ValidationError("Sent or cancelled reminders cannot be reactivated.")
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        reminder = self.get_object()
        if reminder.status != "sent":
            reminder.status = "cancelled"
            reminder.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(reminder).data)
