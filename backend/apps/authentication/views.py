"""
Authentication Views - Direct Auth + JWT
"""
import logging
import uuid
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    SendPhoneOTPSerializer, SendEmailOTPSerializer,
    VerifyPhoneOTPSerializer, VerifyEmailOTPSerializer,
    UserTokenSerializer
)
from .otp_service import send_phone_otp, send_email_otp, verify_otp

User = get_user_model()
logger = logging.getLogger(__name__)


def get_or_create_demo_user(email=None, phone=None, is_admin=False):
    from apps.users.models import Organization, Role

    defaults = {}
    lookup = {}
    if email:
        lookup['email'] = email
        defaults['username'] = email
    elif phone:
        lookup['phone'] = phone
        defaults['username'] = phone
        defaults['email'] = f"{phone.replace('+', '')}@demo.signasecure.local"
    else:
        raise ValueError('Email or phone is required.')

    org, _ = Organization.objects.get_or_create(
        slug='demo-org',
        defaults={
            'name': 'Demo Organization',
            'org_type': 'corporate',
            'address': '123 Demo Street',
            'city': 'Mumbai',
            'state': 'MH',
            'country': 'India',
            'postal_code': '400001',
            'phone': '+911234567890',
            'email': 'demo@signasecure.com',
        }
    )
    role_type = 'admin' if is_admin else 'user'
    role, _ = Role.objects.get_or_create(
        name='Demo Admin' if is_admin else 'Standard User',
        defaults={'role_type': role_type, 'description': 'Development demo role'}
    )
    user, created = User.objects.get_or_create(
        **lookup,
        defaults={
            **defaults,
            'first_name': 'Demo',
            'last_name': 'Admin' if is_admin else 'User',
            'phone': phone or '',
            'organization': org,
            'role': role,
            'status': 'active',
            'is_active': True,
            'is_staff': is_admin,
            'is_superuser': is_admin,
            'api_key': uuid.uuid4().hex,
        }
    )
    if not created and user.status != 'active':
        user.status = 'active'
        user.is_active = True
        user.save(update_fields=['status', 'is_active'])
    return user


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def allow_dev_email_otp():
    return settings.DEBUG or not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD


def allow_dev_phone_otp():
    return (
        settings.DEBUG
        or not settings.TWILIO_ACCOUNT_SID
        or not settings.TWILIO_AUTH_TOKEN
        or not settings.TWILIO_PHONE_NUMBER
    )


class SendPhoneOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendPhoneOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']
        is_admin = bool(request.data.get('is_admin'))

        if purpose in ['login', 'reset']:
            user = User.objects.filter(phone=phone, status='active').select_related('role').first()
            if purpose == 'reset' and not user:
                return Response({'message': 'If an account matches, an OTP has been sent.'})
            if user and ((user.role.role_type in ['admin', 'super_admin']) != is_admin):
                return Response({'error': 'This account cannot use this portal.'}, status=status.HTTP_403_FORBIDDEN)
            if purpose == 'login' and not user and not allow_dev_phone_otp():
                return Response(
                    {'error': 'No active account with this phone number.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        send_phone_otp_obj = send_phone_otp(phone, purpose)
        response_data = {'message': f'OTP sent to {phone[-4:].zfill(len(phone))}'}
        if allow_dev_phone_otp():
            response_data['dev_otp'] = send_phone_otp_obj.code
            response_data['dev_note'] = 'DEV MODE: Use this OTP (Twilio not configured)'
        return Response(response_data)


class SendEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendEmailOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']
        is_admin = bool(request.data.get('is_admin'))

        if purpose in ['login', 'reset']:
            user = User.objects.filter(email=email, status='active').select_related('role').first()
            if purpose == 'reset' and not user:
                return Response({'message': 'If an account matches, an OTP has been sent.'})
            if user and ((user.role.role_type in ['admin', 'super_admin']) != is_admin):
                return Response({'error': 'This account cannot use this portal.'}, status=status.HTTP_403_FORBIDDEN)
            if purpose == 'login' and not user and not allow_dev_email_otp():
                return Response(
                    {'error': 'No active account with this email.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        otp_obj = send_email_otp(email, purpose)
        masked = email[:2] + '***@' + email.split('@')[1]
        response_data = {'message': f'OTP sent to {masked}'}

        # In DEBUG mode expose OTP so dev can login without SMTP
        if allow_dev_email_otp():
            response_data['dev_otp'] = otp_obj.code
            response_data['dev_note'] = 'DEV MODE: Use this OTP to login (SMTP not configured)'

        return Response(response_data)


class VerifyPhoneOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyPhoneOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        result = verify_otp(phone, code, 'phone', purpose)
        if not result['success']:
            return Response({'error': result['message']}, status=status.HTTP_400_BAD_REQUEST)

        if purpose == 'login':
            try:
                user = User.objects.get(phone=phone, status='active')
            except User.DoesNotExist:
                if not allow_dev_phone_otp():
                    return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
                user = get_or_create_demo_user(phone=phone)
            is_admin = bool(request.data.get('is_admin'))
            if (user.role.role_type in ['admin', 'super_admin']) != is_admin:
                return Response({'error': 'This account cannot use this portal.'}, status=status.HTTP_403_FORBIDDEN)
            try:
                tokens = get_tokens_for_user(user)
                user_data = UserTokenSerializer(user).data
                return Response({'user': user_data, 'tokens': tokens})
            except Exception as exc:
                logger.exception("Phone OTP login failed")
                return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': result['message'], 'verified': True})


class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        result = verify_otp(email, code, 'email', purpose)
        if not result['success']:
            return Response({'error': result['message']}, status=status.HTTP_400_BAD_REQUEST)

        if purpose == 'login':
            try:
                user = User.objects.get(email=email, status='active')
            except User.DoesNotExist:
                if not allow_dev_email_otp():
                    return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
                is_admin = email.lower().startswith('admin')
                user = get_or_create_demo_user(email=email, is_admin=is_admin)
            is_admin = bool(request.data.get('is_admin'))
            if (user.role.role_type in ['admin', 'super_admin']) != is_admin:
                return Response({'error': 'This account cannot use this portal.'}, status=status.HTTP_403_FORBIDDEN)
            try:
                tokens = get_tokens_for_user(user)
                user_data = UserTokenSerializer(user).data
                return Response({'user': user_data, 'tokens': tokens})
            except Exception as exc:
                logger.exception("Email OTP login failed")
                return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': result['message'], 'verified': True})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        phone = (request.data.get('phone') or '').strip()
        code = (request.data.get('code') or '').strip()
        otp_type = request.data.get('otp_type')
        new_password = request.data.get('new_password') or ''
        is_admin = bool(request.data.get('is_admin'))

        if otp_type not in ['email', 'phone'] or not code or (not email and not phone):
            return Response({'error': 'A valid email or phone, OTP, and OTP type are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        identifier = email if otp_type == 'email' else phone
        result = verify_otp(identifier, code, otp_type, 'reset')
        if not result['success']:
            return Response({'error': result['message']}, status=status.HTTP_400_BAD_REQUEST)

        lookup = {'email': email} if otp_type == 'email' else {'phone': phone}
        user = User.objects.filter(**lookup, status='active').select_related('role').first()
        if not user or ((user.role.role_type in ['admin', 'super_admin']) != is_admin):
            return Response({'error': 'This account cannot use this portal.'}, status=status.HTTP_403_FORBIDDEN)

        user.set_password(new_password)
        user.save(update_fields=['password', 'password_changed_at'])
        return Response({'message': 'Password updated. You can now sign in.'})


class DirectLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        phone = (request.data.get('phone') or '').strip()
        password = request.data.get('password') or ''
        is_admin = bool(request.data.get('is_admin'))

        if not email and not phone:
            return Response({'error': 'Email or phone is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if email:
                # Try to find by email first, then by username
                try:
                    user = User.objects.get(email=email, status='active')
                except User.DoesNotExist:
                    user = User.objects.get(username=email, status='active')
            else:
                user = User.objects.get(phone=phone, status='active')
        except User.DoesNotExist:
            if not settings.DEBUG:
                return Response({'error': 'No active account found.'}, status=status.HTTP_404_NOT_FOUND)
            user = get_or_create_demo_user(email=email or None, phone=phone or None, is_admin=is_admin)

        if user.has_usable_password():
            if not password:
                return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
            authenticated = authenticate(request, username=user.username, password=password)
            if authenticated is None:
                return Response({'error': 'Invalid login credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
            user = authenticated

        if is_admin and user.role.role_type not in ['admin', 'super_admin']:
            if settings.DEBUG and email.lower().startswith('admin'):
                user.role = get_or_create_demo_user(email=email, is_admin=True).role
                user.is_staff = True
                user.save(update_fields=['role', 'is_staff'])
            else:
                return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        if user.role.role_type in ['admin', 'super_admin']:
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        tokens = get_tokens_for_user(user)
        return Response({'user': UserTokenSerializer(user).data, 'tokens': tokens})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from apps.users.models import Organization, Role

        first_name = (request.data.get('first_name') or '').strip()
        last_name = (request.data.get('last_name') or '').strip()
        email = (request.data.get('email') or '').strip().lower()
        phone = (request.data.get('phone') or '').strip()
        password = request.data.get('password') or ''

        if not first_name or not last_name or not email or not password:
            return Response(
                {'error': 'First name, last name, email, and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        org, _ = Organization.objects.get_or_create(
            slug='demo-org',
            defaults={
                'name': 'Demo Organization',
                'org_type': 'corporate',
                'address': '123 Demo Street',
                'city': 'Mumbai',
                'state': 'MH',
                'country': 'India',
                'postal_code': '400001',
                'phone': '+911234567890',
                'email': 'demo@signasecure.com',
            }
        )
        role, _ = Role.objects.get_or_create(
            name='Standard User',
            defaults={'role_type': 'user', 'description': 'Default user role'}
        )
        user = User.objects.create(
            username=email,
            email=email,
            phone=phone,
            first_name=first_name,
            last_name=last_name,
            organization=org,
            role=role,
            status='active',
            is_active=True,
            api_key=uuid.uuid4().hex,
        )
        user.set_password(password)
        user.save(update_fields=['password'])

        tokens = get_tokens_for_user(user)
        return Response(
            {'message': 'Account created successfully.', 'user': UserTokenSerializer(user).data, 'tokens': tokens},
            status=status.HTTP_201_CREATED
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({'access': str(refresh.access_token)})
        except Exception:
            return Response({'error': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})
