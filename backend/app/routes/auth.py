from fastapi import APIRouter, HTTPException
from app.schemas import LoginSchema, ResetPasswordSchema
from app.database import doctors_collection

router = APIRouter()

@router.post("/login")
async def login(data: LoginSchema):
    # Find doctor in MongoDB
    doctor = await doctors_collection.find_one({"username": data.username})
    
    if doctor and data.password == doctor.get("password"):
        return {"message": "Login successful"}

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