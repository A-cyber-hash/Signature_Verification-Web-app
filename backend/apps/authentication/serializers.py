"""
Authentication Serializers
"""
from rest_framework import serializers
from apps.users.models import User


class SendPhoneOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'reset'], default='login')

    def validate_phone(self, value):
        import re
        if not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Invalid phone number format.")
        return value


class SendEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['login', 'register', 'reset'], default='login')


class VerifyPhoneOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    code = serializers.CharField(min_length=6, max_length=6)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'reset'], default='login')


class VerifyEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
    purpose = serializers.ChoiceField(choices=['login', 'register', 'reset'], default='login')


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(min_length=8, write_only=True)
    email_otp_verified = serializers.BooleanField(default=False)
    phone_otp_verified = serializers.BooleanField(default=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    code = serializers.CharField(min_length=6, max_length=6)
    otp_type = serializers.ChoiceField(choices=['phone', 'email'])


class UserTokenSerializer(serializers.ModelSerializer):
    role_type = serializers.CharField(source='role.role_type', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone',
            'role_type', 'organization_name', 'verification_level',
            'mfa_enabled', 'status'
        ]
