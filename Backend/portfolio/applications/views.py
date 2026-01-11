"""
Views for Application CRUD operations.
Admin-only access enforced via permissions.
"""

import os
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
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


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def trigger_reminders(request):
    """
    Endpoint for external cron services (cron-job.org) to trigger reminders.
    
    Protected by a secret token in the URL or header.
    
    Usage:
        GET /api/applications/trigger-reminders/?token=YOUR_SECRET_TOKEN
        
    Set CRON_SECRET_TOKEN in environment variables.
    """
    # Get token from query params or header
    token = request.GET.get('token') or request.headers.get('X-Cron-Token')
    expected_token = os.getenv('CRON_SECRET_TOKEN', 'your-secret-cron-token-change-me')
    
    if token != expected_token:
        return Response(
            {'error': 'Invalid or missing token'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Import and run the cron functions
    from .cron import send_deadline_reminders, send_result_reminders
    
    deadline_count = send_deadline_reminders()
    result_count = send_result_reminders()
    
    return Response({
        'success': True,
        'message': 'Reminders triggered successfully',
        'deadline_reminders_sent': deadline_count,
        'result_reminders_sent': result_count,
    })

