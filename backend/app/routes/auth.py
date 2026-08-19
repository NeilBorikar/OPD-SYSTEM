from fastapi import APIRouter, HTTPException
from app.schemas import (LoginSchema, ResetPasswordSchema, DoctorRegisterSchema, DoctorLoginSchema, 
                         NurseRegisterSchema, NurseLoginSchema, ReceptionistRegisterSchema, ReceptionistLoginSchema)
from app.database import doctors_collection, nurses_collection, receptionists_collection
from bson import ObjectId

router = APIRouter()

@router.post("/register-doctor")
async def register_doctor(data: DoctorRegisterSchema):
    """Register a new doctor"""
    
    # Check if username already exists
    existing_doctor = await doctors_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if existing_doctor:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = await doctors_collection.find_one({"email": data.email, "clinic_id": data.clinic_id})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new doctor document
    doctor_doc = {
        "username": data.username,
        "email": data.email,
        "password": data.password,  # In production, use bcrypt hash
        "full_name": data.full_name,
        "clinic_id": data.clinic_id
    }
    
    result = await doctors_collection.insert_one(doctor_doc)
    return {"message": "Doctor registered successfully", "doctor_id": str(result.inserted_id)}

@router.post("/login")
async def login(data: LoginSchema):
    """Doctor login"""
    
    doctor = await doctors_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    
    if not doctor:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if doctor["password"] != data.password:  # In production, use bcrypt verify
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "doctor_id": str(doctor["_id"])}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordSchema):
    """Reset doctor password"""
    
    doctor = await doctors_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    
    if not doctor:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await doctors_collection.update_one(
        {"username": data.username, "clinic_id": data.clinic_id},
        {"$set": {"password": data.new_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update password")
    
    return {"message": "Password updated successfully"}

# --- Nurse Auth ---

@router.post("/register-nurse")
async def register_nurse(data: NurseRegisterSchema):
    existing_nurse = await nurses_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if existing_nurse:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    existing_email = await nurses_collection.find_one({"email": data.email, "clinic_id": data.clinic_id})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    nurse_doc = {
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "full_name": data.full_name,
        "clinic_id": data.clinic_id
    }
    
    result = await nurses_collection.insert_one(nurse_doc)
    return {"message": "Nurse registered successfully", "nurse_id": str(result.inserted_id)}

@router.post("/login-nurse")
async def login_nurse(data: NurseLoginSchema):
    nurse = await nurses_collection.find_one({"username": data.username, "clinic_id": data.clinic_id}) # Note: NurseLoginSchema does not have clinic_id yet, wait, we'll fix it in schemas or just use LoginSchema
    if not nurse or nurse["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "nurse_id": str(nurse["_id"])}


# --- Receptionist Auth ---

@router.post("/register-receptionist")
async def register_receptionist(data: ReceptionistRegisterSchema):
    existing_rec = await receptionists_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if existing_rec:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    existing_email = await receptionists_collection.find_one({"email": data.email, "clinic_id": data.clinic_id})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    rec_doc = {
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "full_name": data.full_name,
        "clinic_id": data.clinic_id
    }
    
    result = await receptionists_collection.insert_one(rec_doc)
    return {"message": "Receptionist registered successfully", "receptionist_id": str(result.inserted_id)}

@router.post("/login-receptionist")
async def login_receptionist(data: ReceptionistLoginSchema):
    rec = await receptionists_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if not rec or rec["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
# --- Unified Auth ---

@router.post("/login-unified")
async def login_unified(data: LoginSchema):
    # Check doctors
    doctor = await doctors_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if doctor and doctor["password"] == data.password:
        return {"message": "Login successful", "role": "doctor", "id": str(doctor["_id"])}
        
    # Check nurses
    nurse = await nurses_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if nurse and nurse["password"] == data.password:
        return {"message": "Login successful", "role": "nurse", "id": str(nurse["_id"])}
        
    # Check receptionists
    rec = await receptionists_collection.find_one({"username": data.username, "clinic_id": data.clinic_id})
    if rec and rec["password"] == data.password:
        return {"message": "Login successful", "role": "receptionist", "id": str(rec["_id"])}
        
    raise HTTPException(status_code=401, detail="Invalid credentials")