import logging
import asyncio
from twilio.rest import Client
from app.config import settings

# Configure logging
logger = logging.getLogger("sms")

def format_phone_number(phone: str) -> str:
    """
    Normalize phone number to E.164 format.
    If it doesn't start with '+', prepends the default country code if it is 10 digits,
    or otherwise prepends '+' to make it E.164 compatible.
    """
    if not phone:
        return ""
    
    # Strip spaces, dashes, parentheses
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    
    if not cleaned.startswith("+"):
        # If it's a 10-digit number, prepend default country code (e.g., +91)
        if len(cleaned) == 10:
            country_code = settings.TWILIO_DEFAULT_COUNTRY_CODE or "+91"
            if not country_code.startswith("+"):
                country_code = "+" + country_code
            cleaned = country_code + cleaned
        else:
            # Otherwise just prepend '+' to try making it E.164
            cleaned = "+" + cleaned
            
    return cleaned

def _send_twilio_sms_sync(to_phone: str, body: str) -> bool:
    """
    Synchronous implementation of sending SMS via Twilio API.
    Runs inside a thread pool to avoid blocking the main async loop.
    """
    formatted_to = format_phone_number(to_phone)
    if not formatted_to:
        logger.error("Invalid phone number provided. SMS send aborted.")
        return False

    # Check if credentials are set
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_PHONE_NUMBER:
        logger.warning(
            "Twilio credentials not configured. SMS log fallback:\n"
            "--- SMS NOT SENT ---\n"
            f"To: {formatted_to}\n"
            f"Message: {body}\n"
            "-------------------"
        )
        return False

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        from_phone = format_phone_number(settings.TWILIO_PHONE_NUMBER)
        
        message = client.messages.create(
            body=body,
            from_=from_phone,
            to=formatted_to
        )
        logger.info(f"SMS successfully sent to {formatted_to}. SID: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS to {formatted_to} via Twilio: {e}")
        return False

async def send_sms(to_phone: str, body: str) -> bool:
    """
    Send an SMS asynchronously without blocking the async event loop.
    Uses asyncio.to_thread to delegate blocking network calls.
    """
    return await asyncio.to_thread(_send_twilio_sms_sync, to_phone, body)
