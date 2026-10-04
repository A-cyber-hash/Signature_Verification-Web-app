"""
apps/verification/views.py
──────────────────────────
Signature verification API — backed by full ML engine.

Endpoints:
  POST /api/v1/verification/verify/          — verify captured vs template
  GET  /api/v1/verification/templates/       — list user's active templates
  POST /api/v1/verification/enroll/          — enroll new signature template
"""
import logging
import time
import uuid

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.signatures.models import SignatureTemplate
from ml_engine import verify_signatures, get_engine

logger = logging.getLogger(__name__)


class SignatureVerifyView(APIView):
    """
    POST /api/v1/verification/verify/

    Body (multipart/form-data OR application/json):
        template_id           : UUID  — enrolled template ID
        captured_image        : File  — image file (multipart)
        captured_image_base64 : str   — base64 data URL (JSON)

    Response:
        is_verified, match_score, status, breakdown, fraud signals, confidence, ...
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        template_id    = request.data.get("template_id")
        captured_image = (
            request.FILES.get("captured_image") or
            request.data.get("captured_image_base64")
        )

        if not template_id or not captured_image:
            return Response(
                {"error": "template_id and captured_image are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Load template ────────────────────────────────────────────────────
        try:
            template = SignatureTemplate.objects.get(
                id=template_id,
                user=request.user,
                status="active",
            )
        except SignatureTemplate.DoesNotExist:
            return Response(
                {"error": "Signature template not found or not active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── Run ML verification pipeline ─────────────────────────────────────
        t_start = time.perf_counter()
        try:
            result = verify_signatures(template.original_file, captured_image)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Verification engine error: {e}")
            return Response(
                {"error": "Internal verification error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        processing_time = round(time.perf_counter() - t_start, 3)

        # ── Update template statistics ───────────────────────────────────────
        template.verification_count += 1
        if result["is_verified"]:
            template.match_count += 1
        template.last_used = timezone.now()
        template.success_rate = (
            (template.match_count / template.verification_count) * 100
        )
        # Update rolling average similarity
        prev_avg = template.avg_similarity_score or 0.0
        n = template.verification_count
        template.avg_similarity_score = (
            (prev_avg * (n - 1) + result["match_score"]) / n
        )
        template.save(update_fields=[
            "verification_count", "match_count", "last_used",
            "success_rate", "avg_similarity_score",
        ])

        # ── Build response ───────────────────────────────────────────────────
        return Response({
            "template_id":          str(template.id),
            "template_name":        template.name,

            # Core result
            "is_verified":          result["is_verified"],
            "status":               result["status"],
            "match_score":          result["match_score"],
            "threshold":            result["threshold"],
            "message":              result["message"],

            # Detailed ML breakdown
            "breakdown":            result["breakdown"],
            "raw_ensemble_score":   result["raw_ensemble_score"],
            "calibrated_score":     result["calibrated_score"],

            # Confidence
            "confidence_level":     result["confidence_level"],
            "confidence_label":     result["confidence_label"],
            "metric_variance":      result["metric_variance"],

            # Fraud detection
            "fraud_flag":           result["fraud_flag"],
            "fraud_probability":    result["fraud_probability"],
            "fraud_signals":        result["fraud_signals"],

            # Insight
            "dominant_metric":      result["dominant_metric"],
            "weakest_metric":       result["weakest_metric"],
            "explanation":          result["explanation"],

            # Performance
            "processing_time_s":    processing_time,
        })


class SignatureTemplateListView(APIView):
    """GET /api/v1/verification/templates/ — list user's active templates."""

    def get(self, request):
        templates = SignatureTemplate.objects.filter(
            user=request.user, status="active"
        ).values(
            "id", "name", "created_at",
            "verification_count", "success_rate",
            "avg_similarity_score", "quality_level",
        )
        return Response({"templates": list(templates)})


class SignatureComparisonView(APIView):
    """
    POST /api/v1/verification/compare/
    
    Compare two signatures directly (without template).
    
    Body (multipart/form-data OR application/json):
        signature1_image        : File or base64 — first signature
        signature2_image        : File or base64 — second signature
        signature1_image_base64 : str — base64 data URL (JSON)
        signature2_image_base64 : str — base64 data URL (JSON)
    
    Response:
        match_score, is_match, breakdown metrics, fraud detection, ...
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        sig1_image = (
            request.FILES.get("signature1_image") or
            request.data.get("signature1_image_base64")
        )
        sig2_image = (
            request.FILES.get("signature2_image") or
            request.data.get("signature2_image_base64")
        )

        if not sig1_image or not sig2_image:
            return Response(
                {"error": "Both signature1_image and signature2_image are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Run ML comparison ────────────────────────────────────────────────
        t_start = time.perf_counter()
        try:
            result = verify_signatures(sig1_image, sig2_image)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Comparison engine error: {e}")
            return Response(
                {"error": "Internal comparison error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        processing_time = round(time.perf_counter() - t_start, 3)

        # ── Build response ──────────────────────────────────────────────────
        return Response({
            # Core result
            "is_match":             result["is_verified"],
            "match_score":          result["match_score"],
            "status":               result["status"],
            "message":              result["message"],
            "threshold":            result["threshold"],

            # Detailed ML breakdown
            "breakdown":            result["breakdown"],
            "raw_ensemble_score":   result["raw_ensemble_score"],
            "calibrated_score":     result["calibrated_score"],

            # Confidence
            "confidence_level":     result["confidence_level"],
            "confidence_label":     result["confidence_label"],
            "metric_variance":      result["metric_variance"],

            # Fraud detection
            "fraud_flag":           result["fraud_flag"],
            "fraud_probability":    result["fraud_probability"],
            "fraud_signals":        result["fraud_signals"],

            # Insight
            "dominant_metric":      result["dominant_metric"],
            "weakest_metric":       result["weakest_metric"],
            "explanation":          result["explanation"],

            # Performance
            "processing_time_s":    processing_time,
        })


class SignatureEnrollView(APIView):
    """
    POST /api/v1/verification/enroll/
    Enroll a new signature template + pre-extract ML features.

    Body (multipart/form-data):
        name         : str   — template name
        signature    : File  — signature image
        description  : str   — optional
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        name       = request.data.get("name", "").strip()
        sig_file   = request.FILES.get("signature")
        description = request.data.get("description", "")

        if not name or not sig_file:
            return Response(
                {"error": "name and signature image are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check duplicate name
        if SignatureTemplate.objects.filter(user=request.user, name=name).exists():
            return Response(
                {"error": f"A template named '{name}' already exists."},
                status=status.HTTP_409_CONFLICT,
            )

        # Pre-extract features for fast future verification
        try:
            engine = get_engine()
            feature_bytes = engine.extract_and_serialize(sig_file)
            sig_file.seek(0)
        except Exception as e:
            logger.error(f"Feature extraction failed during enroll: {e}")
            return Response(
                {"error": "Failed to process image. Ensure it is a clear signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate image hash
        import hashlib
        sig_file.seek(0)
        hasher = hashlib.sha256()
        for chunk in sig_file.chunks():
            hasher.update(chunk)
        image_hash = hasher.hexdigest()
        sig_file.seek(0)

        if SignatureTemplate.objects.filter(image_hash=image_hash).exists():
            return Response(
                {"error": "This exact signature image is already enrolled."},
                status=status.HTTP_409_CONFLICT,
            )

        # Get or create org reference
        from PIL import Image
        import io
        sig_file.seek(0)
        pil = Image.open(sig_file)
        w, h = pil.size
        sig_file.seek(0)

        template = SignatureTemplate(
            user=request.user,
            organization=request.user.organization,
            name=name,
            description=description,
            original_file=sig_file,
            file_size=sig_file.size,
            file_format=sig_file.name.split(".")[-1].lower() if sig_file.name else "png",
            image_hash=image_hash,
            width=w,
            height=h,
            feature_vector=feature_bytes,
            status="active",
        )
        template.save()

        return Response({
            "id":            str(template.id),
            "name":          template.name,
            "template_number": template.template_number,
            "status":        template.status,
            "message":       "Signature enrolled successfully.",
        }, status=status.HTTP_201_CREATED)
