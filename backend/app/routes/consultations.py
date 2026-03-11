from fastapi import APIRouter
from app.database import consultations_collection
from app.schemas import Consultation

router = APIRouter()


# -----------------------------
# CREATE CONSULTATION
# -----------------------------
@router.post("/consultation")
async def create_consultation(data: Consultation):

    consultation = data.dict()

    # Ensure PRN stored as string
    consultation["prn"] = str(consultation["prn"]).strip()

    result = await consultations_collection.insert_one(consultation)

    return {
        "message": "Consultation saved",
        "id": str(result.inserted_id)
    }


# -----------------------------
# GET PATIENT HISTORY
# -----------------------------
@router.get("/consultation/{prn}")
async def get_patient_history(prn: str):

    prn = str(prn).strip()   # normalize input

    records = []

    cursor = consultations_collection.find({"prn": prn})

    async for record in cursor:
        record["_id"] = str(record["_id"])
        records.append(record)

    return records