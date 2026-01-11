"""
Views for Application CRUD operations.
Admin-only access enforced via permissions.
"""

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing applications.
    
    Provides CRUD operations:
    - list: GET /api/applications/
    - create: POST /api/applications/
    - retrieve: GET /api/applications/{id}/
    - update: PUT /api/applications/{id}/
    - partial_update: PATCH /api/applications/{id}/
    - destroy: DELETE /api/applications/{id}/
    """
    
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    # Enable filtering, searching, and ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'organization', 'notes']
    ordering_fields = ['deadline', 'created_at', 'status', 'category']
    ordering = ['deadline']  # Default ordering by nearest deadline
    
    def get_queryset(self):
        """Return all applications for admin users."""
        return Application.objects.all().order_by('deadline')
