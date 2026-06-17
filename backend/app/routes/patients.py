from fastapi import APIRouter, HTTPException
from app.database import patients_collection, tasks_collection
from app.schemas import PatientRegisterSchema, PatientLoginSchema, TaskAssignSchema, TaskSchema
from datetime import datetime, timezone, timedelta
IST = timezone(timedelta(hours=5, minutes=30))
from typing import List

router = APIRouter()

@router.post("/register")
async def register_patient(data: PatientRegisterSchema):
    import random
    while True:
        prn_str = str(random.randint(10000000, 99999999))
        existing_patient = await patients_collection.find_one({"prn": prn_str})
        if not existing_patient:
            break
            
    patient_doc = data.dict()
    patient_doc["prn"] = prn_str
    patient_doc["active"] = True
    result = await patients_collection.insert_one(patient_doc)
    return {"message": "Patient registered", "id": str(result.inserted_id), "prn": prn_str}

@router.post("/login-patient")
async def login_patient(data: PatientLoginSchema):
    patient = await patients_collection.find_one({"prn": data.prn})
    if not patient or patient["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "patient_id": str(patient["_id"]), "prn": patient["prn"]}

@router.get("/patients/reception")
async def get_patients_for_reception():
    cursor = patients_collection.find({"active": {"$ne": False}})
    patients = []
    async for patient in cursor:
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
    return patients

@router.get("/patients/ordered")
async def get_patients_ordered():
    # Sort by severityIndex descending based on custom weights string to int
    cursor = patients_collection.find({"active": {"$ne": False}})
    patients = []
    
    # Custom severity ranking
    severity_weights = {
        "critical": 3,
        "severe": 2,
        "normal": 1,
        "none": 0
    }
    
    async for patient in cursor:
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
        
    # Sort by mapped severity weight
    patients.sort(key=lambda p: severity_weights.get(str(p.get("severityIndex") or "none").lower(), 0), reverse=True)
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
    prn_str = str(prn).strip()
    patient = await patients_collection.find_one({"prn": prn_str})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # New logic: Insert into tasks_collection for the nurse task management system
    task_doc = {
        "patient_prn": prn_str,
        "patient_name": patient.get("name", "Unknown"),
        "nurse_username": data.nurse_username,
        "task_content": data.task,
        "status": "pending",
        "created_at": datetime.now(IST).isoformat()
    }
    task_result = await tasks_collection.insert_one(task_doc)
    
    # Keep legacy list for now but with task_id
    task_entry = {
        "task_id": str(task_result.inserted_id),
        "task": data.task, 
        "nurse_username": data.nurse_username,
        "status": "pending"
    }
    await patients_collection.update_one(
        {"prn": prn_str},
        {"$push": {"tasks_for_nurse": task_entry}}
    )
    return {"message": "Task assigned successfully", "task_id": str(task_result.inserted_id)}