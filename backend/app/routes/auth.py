from fastapi import APIRouter, HTTPException
from app.schemas import LoginSchema, ResetPasswordSchema
from app.database import doctors_collection

router = APIRouter()

@router.post("/login")
async def login(data: LoginSchema):
    username = data.username.strip()
    print(f"DEBUG: Login attempt for username: '{username}'")
    
    # Find doctor in MongoDB
    doctor = await doctors_collection.find_one({"username": username})
    
    if not doctor:
        print(f"DEBUG: No doctor found with username: '{data.username}'")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    db_password = doctor.get("password")
    if data.password == db_password:
        print(f"DEBUG: Login successful for '{data.username}'")
        return {"message": "Login successful"}

    print(f"DEBUG: Password mismatch for '{data.username}'. Entered: '{data.password}', DB: '{db_password}'")
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/reset-password")
async def reset_password(data: ResetPasswordSchema):
    # Check if doctor exists
    doctor = await doctors_collection.find_one({"username": data.username})
    
    if not doctor:
        raise HTTPException(status_code=404, detail="User not found")

    # Update password in MongoDB
    await doctors_collection.update_one(
        {"username": data.username},
        {"$set": {"password": data.new_password}}
    )

    return {"message": "Password updated successfully"}