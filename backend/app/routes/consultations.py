from fastapi import APIRouter
from app.database import consultations_collection, patients_collection
from app.schemas import Consultation

router = APIRouter()


# -----------------------------
# CREATE CONSULTATION
# -----------------------------
@router.post("/consultation")
async def create_consultation(data: Consultation):

    consultation = data.dict()

    # Ensure PRN stored as string
    prn_str = str(consultation["prn"]).strip()
    consultation["prn"] = prn_str

    result = await consultations_collection.insert_one(consultation)
    
    # Update Patient Document with new Severity Index
    severity = consultation.get("severityIndex", "normal")
    await patients_collection.update_one(
        {"prn": prn_str},
        {"$set": {"severityIndex": severity}}
    )

    return {
        "message": "Consultation saved and patient severity updated",
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