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
    
    # Ensure Patient exists in patients_collection so they show up on Dashboards
    existing_patient = await patients_collection.find_one({"prn": prn_str})
    severity = consultation.get("severityIndex", "normal")
    
    if not existing_patient:
        # Auto-create basic patient record if it doesn't exist
        new_patient = {
            "prn": prn_str,
            "name": consultation.get("patient_name", "Unknown"),
            "age": consultation.get("age", 0),
            "sex": consultation.get("sex", "Other"),
            "severityIndex": severity,
            "tasks_for_nurse": [],
            "password": "1234" # Default password
        }
        await patients_collection.insert_one(new_patient)
    else:
        # Update existing patient with latest severity
        await patients_collection.update_one(
            {"prn": prn_str},
            {"$set": {"severityIndex": severity}}
        )

    return {
        "message": "Consultation saved and patient record synced",
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