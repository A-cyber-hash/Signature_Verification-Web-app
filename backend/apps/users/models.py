"""
SignaSecure Enterprise User Models
Enterprise-grade user management with RBAC, MFA, and audit trails
"""

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
import json


class Role(models.Model):
    """Role-based access control model"""
    
    ROLE_TYPES = [
        ('super_admin', 'Super Administrator'),
        ('admin', 'Administrator'), 
        ('manager', 'Manager'),
        ('analyst', 'Security Analyst'),
        ('auditor', 'Auditor'),
        ('operator', 'Operator'),
        ('user', 'Standard User'),
        ('api_user', 'API User'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    role_type = models.CharField(max_length=20, choices=ROLE_TYPES)
    description = models.TextField(blank=True)
    permissions = models.TextField(default='{}')  # JSON string
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_role_type_display()})"


class Organization(models.Model):
    """Multi-tenant organization model"""
    
    ORG_TYPES = [
        ('bank', 'Bank'),
        ('insurance', 'Insurance Company'),
        ('government', 'Government Agency'),
        ('legal', 'Legal Firm'),
        ('healthcare', 'Healthcare'),
        ('education', 'Educational Institution'),
        ('corporate', 'Corporation'),
        ('fintech', 'Financial Technology'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True)
    org_type = models.CharField(max_length=20, choices=ORG_TYPES)
    registration_number = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    
    # Contact Information
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True)
    
    # Subscription & Limits
    subscription_tier = models.CharField(max_length=20, default='trial')
    max_users = models.IntegerField(default=10)
    max_verifications_per_month = models.IntegerField(default=1000)
    storage_limit_gb = models.IntegerField(default=10)
    
    # Security Settings
    enforce_mfa = models.BooleanField(default=True)
    password_policy = models.TextField(default='{}')
    session_timeout_minutes = models.IntegerField(default=30)
    allowed_ip_ranges = models.TextField(blank=True)
    
    # Compliance
    compliance_standards = models.TextField(default='[]')  # JSON string
    data_retention_days = models.IntegerField(default=2555)  # 7 years
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organizations'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class User(AbstractUser):
    """Enhanced User model with enterprise features"""
    
    USER_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('locked', 'Locked'),
        ('pending', 'Pending Activation'),
    ]
    
    VERIFICATION_LEVELS = [
        ('basic', 'Basic'),
        ('enhanced', 'Enhanced'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    display_name = models.CharField(max_length=200, blank=True)
    
    # Contact Information
    phone = models.CharField(
        max_length=20, 
        blank=True,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Invalid phone number')]
    )
    alternate_email = models.EmailField(blank=True)
    
    # Organization & Role
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='users')
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='users')
    department = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Security
    status = models.CharField(max_length=20, choices=USER_STATUS, default='active')
    verification_level = models.CharField(max_length=20, choices=VERIFICATION_LEVELS, default='basic')
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True)
    backup_codes = models.TextField(default='[]', blank=True)  # JSON string
    
    # Login Security
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(auto_now_add=True)
    force_password_change = models.BooleanField(default=False)
    
    # Session Management
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_device = models.CharField(max_length=200, blank=True)
    current_session_key = models.CharField(max_length=40, blank=True)
    
    # Usage Statistics
    total_verifications = models.IntegerField(default=0)
    monthly_verifications = models.IntegerField(default=0)
    successful_verifications = models.IntegerField(default=0)
    fraud_detections = models.IntegerField(default=0)
    last_verification_date = models.DateTimeField(null=True, blank=True)
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(max_length=10, default='dark')
    notifications_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    
    # API Access
    api_key = models.CharField(max_length=64, blank=True, unique=True)
    api_rate_limit = models.IntegerField(default=1000)  # requests per hour
    api_enabled = models.BooleanField(default=False)
    
    # Compliance & Audit
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    privacy_policy_accepted_at = models.DateTimeField(null=True, blank=True)
    compliance_training_completed = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['role']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return full name with middle name if available"""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return ' '.join(parts)
    
    @property
    def is_locked(self):
        """Check if account is currently locked"""
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False
    
    def lock_account(self, duration_minutes=30):
        """Lock account for specified duration"""
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.status = 'locked'
        self.save()
    
    def unlock_account(self):
        """Unlock account and reset failed attempts"""
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.status = 'active'
        self.save()
    
    def can_verify_signatures(self):
        """Check if user can perform signature verification"""
        return (
            self.status == 'active' and 
            not self.is_locked and
            self.organization.is_active
        )
    
    def get_monthly_verification_limit(self):
        """Get user's monthly verification limit"""
        base_limits = {
            'basic': 100,
            'enhanced': 500,
            'premium': 2000,
            'enterprise': 10000,
        }
        return base_limits.get(self.verification_level, 100)
    
    def reset_monthly_stats(self):
        """Reset monthly statistics (called by cron job)"""
        self.monthly_verifications = 0
        self.save()


class UserSession(models.Model):
    """Track user sessions for security monitoring"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    
    # Session Details
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_type = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    
    # Location (if available)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Session Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'user_sessions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.ip_address}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def extend_session(self, minutes=30):
        """Extend session expiry"""
        self.expires_at = timezone.now() + timezone.timedelta(minutes=minutes)
        self.last_activity = timezone.now()
        self.save()


class UserProfile(models.Model):
    """Extended user profile information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Profile Picture
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    
    # Professional Information
    title = models.CharField(max_length=100, blank=True)
    professional_certifications = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    
    # Notification Preferences
    notification_preferences = models.TextField(default='{}')
    
    # Dashboard Preferences
    dashboard_layout = models.TextField(default='{}')
    favorite_features = models.TextField(default='[]')
    
    # Security Preferences
    login_notifications = models.BooleanField(default=True)
    suspicious_activity_alerts = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} Profile"


class PasswordHistory(models.Model):
    """Track password history for compliance"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_history')
    password_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'password_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.created_at}"