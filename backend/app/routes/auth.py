from fastapi import APIRouter, HTTPException
from app.schemas import LoginSchema, ResetPasswordSchema

router = APIRouter()

# Hardcoded single doctor credentials (minimal system)
doctor_credentials = {
    "username": "Dr.Rkd",
    "password": "12345"
}

@router.post("/login")
async def login(data: LoginSchema):

    if (
        data.username == doctor_credentials["username"]
        and data.password == doctor_credentials["password"]
    ):
        return {"message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/reset-password")
async def reset_password(data: ResetPasswordSchema):

    if data.username != doctor_credentials["username"]:
        raise HTTPException(status_code=404, detail="User not found")

    doctor_credentials["password"] = data.new_password

    return {"message": "Password updated successfully"}