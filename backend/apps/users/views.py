from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from apps.authentication.serializers import UserTokenSerializer
from apps.users.models import User


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserTokenSerializer(request.user).data)


class UserDirectoryView(APIView):
    """Operational user directory for staff users only."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        query = request.query_params.get('search', '').strip()
        users = request.user.organization.users.select_related('role').all()

        if query:
            users = users.filter(
                Q(email__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(role__name__icontains=query)
            )

        return Response({
            'count': users.count(),
            'results': [{
                'id': str(user.id),
                'name': user.get_full_name(),
                'email': user.email,
                'role': user.role.get_role_type_display(),
                'role_type': user.role.role_type,
                'status': user.status,
                'mfa_enabled': user.mfa_enabled,
                'monthly_verifications': user.monthly_verifications,
                'last_activity': user.last_activity,
                'created_at': user.created_at,
            } for user in users.order_by('-created_at')[:100]],
        })


class UserStatusUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        target_user = get_object_or_404(
            User,
            pk=user_id,
            organization=request.user.organization,
        )

        if target_user.id == request.user.id:
            return Response(
                {'error': 'You cannot change your own account status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = (request.data.get('status') or '').strip().lower()
        valid_statuses = {value for value, _ in User.USER_STATUS}

        if new_status not in valid_statuses:
            return Response(
                {'error': 'Status must be one of: active, inactive, suspended, locked, pending.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user.status = new_status
        target_user.is_active = new_status == 'active'
        target_user.save(update_fields=['status', 'is_active'])

        return Response({
            'id': str(target_user.id),
            'name': target_user.get_full_name(),
            'email': target_user.email,
            'status': target_user.status,
            'role': target_user.role.get_role_type_display(),
            'mfa_enabled': target_user.mfa_enabled,
            'last_activity': target_user.last_activity,
        })
