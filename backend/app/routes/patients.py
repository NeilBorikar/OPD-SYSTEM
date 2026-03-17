from fastapi import APIRouter, HTTPException
from app.database import patients_collection
from app.schemas import PatientRegisterSchema, PatientLoginSchema, TaskAssignSchema
from typing import List

router = APIRouter()

@router.post("/register")
async def register_patient(data: PatientRegisterSchema):
    existing_patient = await patients_collection.find_one({"prn": data.prn})
    if existing_patient:
        raise HTTPException(status_code=400, detail="PRN already exists")
    
    patient_doc = data.dict()
    result = await patients_collection.insert_one(patient_doc)
    return {"message": "Patient registered", "id": str(result.inserted_id)}

@router.post("/login-patient")
async def login_patient(data: PatientLoginSchema):
    patient = await patients_collection.find_one({"prn": data.prn})
    if not patient or patient["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "patient_id": str(patient["_id"]), "prn": patient["prn"]}

@router.get("/patients/reception")
async def get_patients_for_reception():
    cursor = patients_collection.find({})
    patients = []
    async for patient in cursor:
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
    return patients

@router.get("/patients/ordered")
async def get_patients_ordered():
    # Sort by severityIndex descending (highest severity first)
    cursor = patients_collection.find({}).sort("severityIndex", -1)
    patients = []
    async for patient in cursor:
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
    return patients

@router.get("/patient/{prn}")
async def get_patient(prn: str):
    patient = await patients_collection.find_one({"prn": prn})
    if patient:
        patient["_id"] = str(patient["_id"])
        return patient
    return {"message": "Patient not found"}

@router.put("/patient/{prn}/update")
async def update_patient(prn: str, data: dict):
    result = await patients_collection.update_one(
        {"prn": prn}, 
        {"$set": data}
    )
    if result.modified_count == 0:
        return {"message": "No changes made or patient not found"}
    return {"message": "Patient updated successfully"}

@router.post("/patient/{prn}/assign-task")
async def assign_task(prn: str, data: TaskAssignSchema):
    patient = await patients_collection.find_one({"prn": prn})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    task_entry = {"task": data.task, "nurse_username": data.nurse_username}
    await patients_collection.update_one(
        {"prn": prn},
        {"$push": {"tasks_for_nurse": task_entry}}
    )
    return {"message": "Task assigned successfully"}