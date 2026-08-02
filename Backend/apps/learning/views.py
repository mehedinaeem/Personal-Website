from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LearningItem
from .serializers import LearningItemSerializer, LearningSessionSerializer


class LearningItemViewSet(viewsets.ModelViewSet):
    serializer_class = LearningItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "topic", "skill", "resource_name", "notes"]
    ordering_fields = ["start_date", "target_date", "target_hours", "completed_hours", "created_at"]

    def get_queryset(self):
        queryset = LearningItem.objects.filter(owner=self.request.user)
        for key in ("status", "learning_type", "skill"):
            if self.request.query_params.get(key): queryset = queryset.filter(**{key: self.request.query_params[key]})
        if self.request.query_params.get("start_date"): queryset = queryset.filter(target_date__gte=self.request.query_params["start_date"])
        if self.request.query_params.get("end_date"): queryset = queryset.filter(start_date__lte=self.request.query_params["end_date"])
        return queryset

    def perform_create(self, serializer): serializer.save(owner=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def sessions(self, request, pk=None):
        item = self.get_object()
        if request.method == "GET":
            page = self.paginate_queryset(item.sessions.filter(owner=request.user))
            return self.get_paginated_response(LearningSessionSerializer(page, many=True).data)
        serializer = LearningSessionSerializer(data=request.data, context={"request": request, "learning_item": item})
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        return Response(LearningSessionSerializer(session).data, status=201)
