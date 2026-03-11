from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)

db = client[settings.DATABASE_NAME]

db = client["clinic_db"]

patients_collection = db["patients"]
consultations_collection = db["consultations"]