from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)

db = client[settings.DATABASE_NAME]



patients_collection = db["patients"]
consultations_collection = db["consultations"]
doctors_collection = db["doctors"]
nurses_collection = db["nurses"]
receptionists_collection = db["receptionists"]
slots_collection = db["slots"]
tasks_collection = db["tasks"]
queries_collection = db["queries"]
clinics_collection = db["clinics"]