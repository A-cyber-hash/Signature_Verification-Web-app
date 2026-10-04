"""
SignaSecure Enterprise Signature Models
Advanced signature management with AI feature extraction and metadata
"""

import uuid
import hashlib
from django.db import models
from django.utils import timezone
import json
from django.core.validators import FileExtensionValidator
from apps.users.models import User, Organization


def signature_upload_path(instance, filename):
    """Generate secure upload path for signatures"""
    return f'signatures/{instance.user.organization.slug}/{instance.user.id}/{filename}'


class SignatureTemplate(models.Model):
    """Master signature templates for users"""
    
    TEMPLATE_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('archived', 'Archived'),
        ('processing', 'Processing'),
        ('failed', 'Processing Failed'),
    ]
    
    QUALITY_LEVELS = [
        ('poor', 'Poor Quality'),
        ('fair', 'Fair Quality'),
        ('good', 'Good Quality'),
        ('excellent', 'Excellent Quality'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signature_templates')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    # Basic Information
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    template_number = models.CharField(max_length=20, unique=True, editable=False)
    
    # File Information
    original_file = models.FileField(
        upload_to=signature_upload_path,
        validators=[FileExtensionValidator(['png', 'jpg', 'jpeg', 'pdf'])]
    )
    processed_image = models.ImageField(upload_to=signature_upload_path, blank=True)
    file_size = models.IntegerField()
    file_format = models.CharField(max_length=10)
    image_hash = models.CharField(max_length=64, unique=True)
    
    # Image Properties
    width = models.IntegerField()
    height = models.IntegerField()
    dpi = models.IntegerField(null=True, blank=True)
    color_mode = models.CharField(max_length=20, blank=True)
    
    # Quality Assessment
    quality_score = models.FloatField(null=True, blank=True)
    quality_level = models.CharField(max_length=20, choices=QUALITY_LEVELS, blank=True)
    clarity_score = models.FloatField(null=True, blank=True)
    completeness_score = models.FloatField(null=True, blank=True)
    
    # AI Feature Extraction
    feature_vector = models.BinaryField(null=True, blank=True)  # Serialized numpy array
    keypoints = models.TextField(default='{}')  # JSON string
    contours = models.TextField(default='{}')  # JSON string
    geometric_features = models.TextField(default='{}')  # JSON string
    texture_features = models.TextField(default='{}')  # JSON string
    
    # Advanced Analysis
    stroke_count = models.IntegerField(null=True, blank=True)
    stroke_width_avg = models.FloatField(null=True, blank=True)
    stroke_width_variance = models.FloatField(null=True, blank=True)
    signature_complexity = models.FloatField(null=True, blank=True)
    aspect_ratio = models.FloatField(null=True, blank=True)
    
    # Statistical Features
    pixel_density = models.FloatField(null=True, blank=True)
    edge_density = models.FloatField(null=True, blank=True)
    symmetry_score = models.FloatField(null=True, blank=True)
    curvature_analysis = models.JSONField(default=dict)
    
    # Usage Statistics
    verification_count = models.IntegerField(default=0)
    match_count = models.IntegerField(default=0)
    success_rate = models.FloatField(default=0.0)
    avg_similarity_score = models.FloatField(default=0.0)
    
    # Security & Compliance
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_templates'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    compliance_flags = models.JSONField(default=list)
    
    # Status & Metadata
    status = models.CharField(max_length=20, choices=TEMPLATE_STATUS, default='processing')
    processing_errors = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'signature_templates'
        ordering = ['-created_at']
        unique_together = ['user', 'name']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['organization']),
            models.Index(fields=['image_hash']),
            models.Index(fields=['quality_score']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.user.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.template_number:
            self.template_number = self.generate_template_number()
        
        if self.original_file and not self.image_hash:
            self.image_hash = self.calculate_file_hash()
            self.file_size = self.original_file.size
        
        super().save(*args, **kwargs)
    
    def generate_template_number(self):
        """Generate unique template number"""
        import random
        import string
        
        prefix = self.organization.slug[:3].upper()
        timestamp = str(int(timezone.now().timestamp()))[-6:]
        random_suffix = ''.join(random.choices(string.digits, k=4))
        
        return f"{prefix}-{timestamp}-{random_suffix}"
    
    def calculate_file_hash(self):
        """Calculate SHA-256 hash of the file"""
        hasher = hashlib.sha256()
        for chunk in self.original_file.chunks():
            hasher.update(chunk)
        return hasher.hexdigest()
    
    def update_success_rate(self):
        """Update template success rate based on verifications"""
        if self.verification_count > 0:
            self.success_rate = (self.match_count / self.verification_count) * 100
            self.save()


class SignatureCollection(models.Model):
    """Group related signature templates"""
    
    COLLECTION_TYPES = [
        ('personal', 'Personal Collection'),
        ('department', 'Department Collection'),
        ('project', 'Project Collection'),
        ('compliance', 'Compliance Collection'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signature_collections')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    collection_type = models.CharField(max_length=20, choices=COLLECTION_TYPES, default='personal')
    
    # Collection Settings
    max_templates = models.IntegerField(default=20)
    require_approval = models.BooleanField(default=False)
    auto_archive_days = models.IntegerField(default=365)
    
    # Access Control
    is_shared = models.BooleanField(default=False)
    shared_users = models.ManyToManyField(User, blank=True, related_name='shared_collections')
    
    # Metadata
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'signature_collections'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.user.get_full_name()})"


class SignatureTemplateCollection(models.Model):
    """Many-to-many relationship between templates and collections"""
    
    template = models.ForeignKey(SignatureTemplate, on_delete=models.CASCADE)
    collection = models.ForeignKey(SignatureCollection, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'signature_template_collections'
        unique_together = ['template', 'collection']
    
    def __str__(self):
        return f"{self.template.name} in {self.collection.name}"


class SignatureAnalysis(models.Model):
    """Detailed signature analysis results"""
    
    ANALYSIS_TYPES = [
        ('enrollment', 'Enrollment Analysis'),
        ('verification', 'Verification Analysis'),
        ('forensic', 'Forensic Analysis'),
        ('quality', 'Quality Analysis'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(SignatureTemplate, on_delete=models.CASCADE, related_name='analyses')
    analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPES)
    
    # Analysis Results
    overall_score = models.FloatField()
    confidence_score = models.FloatField()
    
    # Detailed Metrics
    geometric_consistency = models.FloatField()
    stroke_consistency = models.FloatField()
    pressure_variation = models.FloatField()
    speed_variation = models.FloatField()
    
    # Advanced Features
    pen_lift_count = models.IntegerField()
    tremor_analysis = models.JSONField(default=dict)
    slant_analysis = models.JSONField(default=dict)
    loop_analysis = models.JSONField(default=dict)
    
    # Forensic Features
    forgery_indicators = models.JSONField(default=list)
    authenticity_score = models.FloatField()
    skill_level_required = models.CharField(max_length=20, blank=True)
    
    # AI Model Results
    cnn_features = models.BinaryField(null=True, blank=True)
    siamese_output = models.FloatField(null=True, blank=True)
    ensemble_prediction = models.FloatField(null=True, blank=True)
    
    # Processing Info
    processing_time = models.FloatField()  # seconds
    model_version = models.CharField(max_length=20)
    analysis_timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'signature_analyses'
        ordering = ['-analysis_timestamp']
    
    def __str__(self):
        return f"Analysis for {self.template.name} - {self.analysis_type}"


class SignatureMetrics(models.Model):
    """Aggregate metrics for signature templates"""
    
    template = models.OneToOneField(SignatureTemplate, on_delete=models.CASCADE, related_name='metrics')
    
    # Usage Metrics
    total_verifications = models.IntegerField(default=0)
    successful_matches = models.IntegerField(default=0)
    failed_matches = models.IntegerField(default=0)
    fraud_attempts = models.IntegerField(default=0)
    
    # Performance Metrics
    avg_processing_time = models.FloatField(default=0.0)
    avg_similarity_score = models.FloatField(default=0.0)
    avg_confidence_score = models.FloatField(default=0.0)
    
    # Quality Metrics
    consistency_score = models.FloatField(default=0.0)
    reliability_score = models.FloatField(default=0.0)
    
    # Time-based Metrics
    daily_usage = models.JSONField(default=dict)
    weekly_trends = models.JSONField(default=dict)
    monthly_summary = models.JSONField(default=dict)
    
    # Last Updated
    last_calculated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'signature_metrics'
    
    def __str__(self):
        return f"Metrics for {self.template.name}"
    
    def calculate_success_rate(self):
        """Calculate overall success rate"""
        if self.total_verifications > 0:
            return (self.successful_matches / self.total_verifications) * 100
        return 0.0
    
    def update_metrics(self, verification_result):
        """Update metrics with new verification result"""
        self.total_verifications += 1
        
        if verification_result['is_match']:
            self.successful_matches += 1
        else:
            self.failed_matches += 1
        
        if verification_result.get('fraud_detected'):
            self.fraud_attempts += 1
        
        # Update averages
        current_avg_similarity = self.avg_similarity_score or 0.0
        new_similarity = verification_result.get('similarity_score', 0.0)
        self.avg_similarity_score = (
            (current_avg_similarity * (self.total_verifications - 1) + new_similarity) 
            / self.total_verifications
        )
        
        current_avg_confidence = self.avg_confidence_score or 0.0
        new_confidence = verification_result.get('confidence_score', 0.0)
        self.avg_confidence_score = (
            (current_avg_confidence * (self.total_verifications - 1) + new_confidence) 
            / self.total_verifications
        )
        
        self.save()


class SignatureVersion(models.Model):
    """Version control for signature templates"""
    
    template = models.ForeignKey(SignatureTemplate, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    
    # Version Data
    file_snapshot = models.FileField(upload_to=signature_upload_path)
    features_snapshot = models.BinaryField()
    analysis_snapshot = models.JSONField(default=dict)
    
    # Change Information
    changes_made = models.TextField()
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    change_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'signature_versions'
        unique_together = ['template', 'version_number']
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.template.name} v{self.version_number}"