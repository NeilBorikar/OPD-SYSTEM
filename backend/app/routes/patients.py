from fastapi import APIRouter
from app.database import patients_collection

router = APIRouter()

@router.post("/register")

async def register_patient(data: dict):

    result = await patients_collection.insert_one(data)

    return {
        "message": "Patient registered",
        "id": str(result.inserted_id)
    }
@router.get("/patient/{prn}")
async def get_patient(prn: str):

    patient = await patients_collection.find_one({"prn": prn})

    if patient:
        patient["_id"] = str(patient["_id"])
        return patient

    return {"message": "Patient not found"}