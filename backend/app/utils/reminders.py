import logging
from twilio.rest import Client
import aiosmtplib
from email.message import EmailMessage
from app.config import settings

logger = logging.getLogger(__name__)

async def send_sms(to: str, message: str):
    """
    Sends an SMS using Twilio.
    """
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        logger.warning("Twilio credentials not fully configured. Skipping SMS.")
        return False
    
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to
        )
        logger.info(f"SMS sent successfully to {to}. SID: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS to {to}: {str(e)}")
        return False

async def send_email(to: str, subject: str, body: str):
    """
    Sends an email using SMTP.
    """
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        logger.warning("SMTP credentials not fully configured. Skipping Email.")
        return False

    message = EmailMessage()
    message["From"] = settings.EMAILS_FROM or settings.SMTP_USER
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=(settings.SMTP_PORT == 465),
            start_tls=(settings.SMTP_PORT == 587),
        )
        logger.info(f"Email sent successfully to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {str(e)}")
        return False

async def process_reminders(db):
    """
    Scans consultations for next_visit_date occurring tomorrow and sends reminders.
    """
    from datetime import datetime, timedelta
    
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    logger.info(f"Processing reminders for date: {tomorrow}")
    
    consultations_collection = db["consultations"]
    patients_collection = db["patients"]
    
    # Find consultations with next_visit_date tomorrow
    cursor = consultations_collection.find({"next_visit_date": tomorrow})
    
    async for consultation in cursor:
        prn = consultation.get("prn")
        if not prn:
            continue
            
        # Get patient contact info
        patient = await patients_collection.find_one({"prn": prn})
        if not patient:
            logger.warning(f"Patient not found for PRN {prn} during reminder processing.")
            continue
            
        phone = patient.get("phone")
        email = patient.get("email")
        patient_name = patient.get("name", "Patient")
        
        message = f"Hello {patient_name}, this is a reminder for your follow-up visit tomorrow ({tomorrow}) at Dr. Rakesh Kumar Das's clinic. Please bring your previous records."
        
        if phone:
            await send_sms(phone, message)
        
        if email:
            await send_email(email, "Follow-up Visit Reminder", message)
