"""
OTP Model for mobile and email verification
"""
import uuid
import random
from django.db import models
from django.utils import timezone
from datetime import timedelta


class OTP(models.Model):
    OTP_TYPE = [
        ('phone', 'Phone OTP'),
        ('email', 'Email OTP'),
    ]
    PURPOSE = [
        ('login', 'Login'),
        ('register', 'Registration'),
        ('reset', 'Password Reset'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    otp_type = models.CharField(max_length=10, choices=OTP_TYPE)
    purpose = models.CharField(max_length=20, choices=PURPOSE, default='login')
    code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'otps'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone', 'otp_type']),
            models.Index(fields=['email', 'otp_type']),
        ]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_expired and not self.is_verified and self.attempts < 3

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))

    def __str__(self):
        target = self.phone or self.email
        return f"OTP[{self.otp_type}] -> {target}"
