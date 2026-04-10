from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import patients
from app.routes import consultations
from app.routes import auth
from app.database import db
from app.utils.reminders import process_reminders
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI()

# Initialize Scheduler
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    # Verify DB connection and doctor count
    try:
        doctor_count = await db["doctors"].count_documents({})
        print(f"DEBUG: Backend started. Connected to DB: '{db.name}'. Found {doctor_count} doctors.")
    except Exception as e:
        print(f"DEBUG: Database connection failed: {str(e)}")

    # Run reminders check every day at 10:00 AM
    scheduler.add_job(process_reminders, 'cron', hour=10, minute=0, args=[db])
    scheduler.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later we will restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(consultations.router)
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Clinic Backend Running"}