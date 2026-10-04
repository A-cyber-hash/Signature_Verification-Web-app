"""
OTP Service - Sends OTP via SMS (Twilio) and Email
"""
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from .models import OTP

logger = logging.getLogger(__name__)


def send_phone_otp(phone: str, purpose: str = 'login') -> OTP:
    """Send OTP to phone via Twilio SMS"""
    # Invalidate old OTPs
    OTP.objects.filter(phone=phone, otp_type='phone', is_verified=False).delete()

    code = OTP.generate_code()
    otp = OTP.objects.create(phone=phone, otp_type='phone', purpose=purpose, code=code)

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"SignaSecure OTP: {code}. Valid for 10 minutes. Do not share.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
        logger.info(f"SMS OTP sent to {phone}")
    except Exception as e:
        logger.error(f"SMS send failed for {phone}: {e}")
        # In dev/test, log the OTP
        if settings.DEBUG:
            logger.warning(f"[DEV] OTP for {phone}: {code}")

    return otp


def send_email_otp(email: str, purpose: str = 'login') -> OTP:
    """Send OTP to email"""
    OTP.objects.filter(email=email, otp_type='email', is_verified=False).delete()

    code = OTP.generate_code()
    otp = OTP.objects.create(email=email, otp_type='email', purpose=purpose, code=code)

    subject = "SignaSecure - Your Verification Code"
    message = (
        f"Your SignaSecure verification code is: {code}\n\n"
        f"This code is valid for 10 minutes.\n"
        f"Do not share this code with anyone.\n\n"
        f"If you did not request this, please ignore this email."
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"Email OTP sent to {email}")
    except Exception as e:
        logger.error(f"Email send failed for {email}: {e}")
        if settings.DEBUG:
            logger.warning(f"[DEV] OTP for {email}: {code}")

    return otp


def verify_otp(identifier: str, code: str, otp_type: str, purpose: str = 'login') -> dict:
    """Verify OTP code. Returns {'success': bool, 'message': str}"""
    filter_kwargs = {'otp_type': otp_type, 'purpose': purpose, 'is_verified': False}
    if otp_type == 'phone':
        filter_kwargs['phone'] = identifier
    else:
        filter_kwargs['email'] = identifier

    otp = OTP.objects.filter(**filter_kwargs).order_by('-created_at').first()

    if not otp:
        return {'success': False, 'message': 'No OTP found. Please request a new one.'}

    if otp.is_expired:
        return {'success': False, 'message': 'OTP has expired. Please request a new one.'}

    if otp.attempts >= 3:
        return {'success': False, 'message': 'Too many attempts. Please request a new OTP.'}

    otp.attempts += 1
    otp.save()

    if otp.code != code:
        remaining = 3 - otp.attempts
        return {'success': False, 'message': f'Invalid OTP. {remaining} attempts remaining.'}

    otp.is_verified = True
    otp.save()
    return {'success': True, 'message': 'OTP verified successfully.'}
