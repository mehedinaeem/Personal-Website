from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import TravelPlan
from .serializers import TravelChecklistItemSerializer, TravelItineraryItemSerializer, TravelPlanSerializer


class TravelPlanViewSet(viewsets.ModelViewSet):
    serializer_class = TravelPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "destination", "transportation", "accommodation", "notes"]
    ordering_fields = ["start_date", "end_date", "estimated_budget", "actual_cost", "created_at"]

    def get_queryset(self):
        queryset = TravelPlan.objects.filter(owner=self.request.user)
        for key in ("status", "purpose"):
            if self.request.query_params.get(key): queryset = queryset.filter(**{key: self.request.query_params[key]})
        if self.request.query_params.get("start_date"): queryset = queryset.filter(end_date__gte=self.request.query_params["start_date"])
        if self.request.query_params.get("end_date"): queryset = queryset.filter(start_date__lte=self.request.query_params["end_date"])
        return queryset

    def perform_create(self, serializer): serializer.save(owner=self.request.user)

    def nested(self, request, relation, serializer_class):
        plan = self.get_object()
        if request.method == "GET":
            page = self.paginate_queryset(getattr(plan, relation).filter(owner=request.user))
            return self.get_paginated_response(serializer_class(page, many=True).data)
        serializer = serializer_class(data=request.data, context={"request": request, "travel_plan": plan})
        serializer.is_valid(raise_exception=True)
        item = serializer.save(owner=request.user, travel_plan=plan)
        return Response(serializer_class(item).data, status=201)

    @action(detail=True, methods=["get", "post"])
    def itinerary(self, request, pk=None): return self.nested(request, "itinerary", TravelItineraryItemSerializer)

    @action(detail=True, methods=["get", "post"])
    def checklist(self, request, pk=None): return self.nested(request, "checklist", TravelChecklistItemSerializer)
