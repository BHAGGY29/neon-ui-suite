# api/utils.py

import os
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone # Added import for timezone

logger = logging.getLogger(__name__)

def send_email_notification(to_email, subject, body):
    """Sends a single email using Django's configured SMTP backend."""
    try:
        # Use settings.DEFAULT_FROM_EMAIL which is now configured for SMTP
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False # Ensure errors are propagated for debugging
        )
        logger.info(f"SOS Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.exception(f"Failed to send SOS email to {to_email}. Check SMTP configuration.", exc_info=e)
        return False


def send_sms_placeholder(phone_number, message):
    """
    Placeholder SMS sender. Replaced with Twilio/Fast2SMS implementation in production.
    """
    TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_FROM = os.getenv("TWILIO_FROM")
    
    if TWILIO_SID and TWILIO_TOKEN and TWILIO_FROM:
        try:
            # Note: Ensure twilio is installed in your virtual environment
            from twilio.rest import Client 
            client = Client(TWILIO_SID, TWILIO_TOKEN)
            client.messages.create(body=message, from_=TWILIO_FROM, to=phone_number)
            logger.info(f"SMS sent via Twilio to {phone_number}")
            return True
        except ImportError:
            logger.error("Twilio is configured but the library is not installed (pip install twilio).")
        except Exception as e:
            logger.exception("Twilio send error", exc_info=e)
            return False

    # Fallback: log to console if Twilio not configured or failed
    logger.info(f"[SMS Placeholder] To: {phone_number} Msg: {message}")
    return True


def send_push_placeholder(device_token, title, body):
    """
    Placeholder for push notifications (FCM/APNs).
    """
    logger.info(f"[PUSH Placeholder] token={device_token} title={title} body={body}")


def notify_trusted_contacts(user, contacts, latitude=None, longitude=None, message=None):
    """Coordinates sending notifications to all trusted contacts."""
    subject = "🚨 URGENT: SOS Alert from Digital Safety App"
    
    # Corrected map URL construction 
    map_link = f"https://www.google.com/maps/search/?api=1&query={latitude},{longitude}"
    location_text = f"Location Link: {map_link}" if latitude and longitude else "Location not provided"
    
    body = (
        f"The user, {user.username}, has triggered an SOS alert.\n\n"
        f"Timestamp: {timezone.now().strftime('%Y-%m-%d %H:%M:%S %Z')}\n"
        f"User Message: {message or 'No additional message provided.'}\n"
        f"{location_text}"
    )
    
    contacts_notified = 0

    # Send notifications in a loop
    for c in contacts:
        if c.email and send_email_notification(c.email, subject, body):
            contacts_notified += 1
        
        sms_body = f"SOS from {user.username}. Msg: {message or 'Alert'}. {location_text}"
        if c.phone_number: # No need for 'and send_sms_placeholder...' inside the loop control here
            send_sms_placeholder(c.phone_number, sms_body)

        # push: assumes TrustedContact may have a device token field; placeholder for now.
        # if c.device_token:
        #     send_push_placeholder(c.device_token, subject, message)
            
    return contacts_notified