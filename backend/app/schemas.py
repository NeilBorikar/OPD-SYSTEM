from pydantic import BaseModel, EmailStr
from typing import List, Optional
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId, received: {v}")
        return ObjectId(v)

class Medicine(BaseModel):
    name: str
    dose: str


class Consultation(BaseModel):

    patient_name: str
    age: int
    sex: str
    prn: str

    bp: str
    pulse: str
    spo2: str
    weight: str
    height: str
    bmi: str

    complaints: str
    examination: str
    past_history: str
    allergy: str
    diagnosis: str

    medicines: List[Medicine]

    advice: str
    investigations: str
    severityIndex: Optional[str] = "normal"

class LoginSchema(BaseModel):
    username: str
    password: str


class ResetPasswordSchema(BaseModel):
    username: str
    new_password: str

class DoctorRegisterSchema(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class DoctorLoginSchema(BaseModel):
    username: str
    password: str

class DoctorSchema(BaseModel):
    id: Optional[PyObjectId] = None
    username: str
    email: str
    password: str
    full_name: str

    class Config:
        arbitrary_types_allowed = True

class NurseRegisterSchema(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class NurseLoginSchema(BaseModel):
    username: str
    password: str

class ReceptionistRegisterSchema(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class ReceptionistLoginSchema(BaseModel):
    username: str
    password: str

class PatientRegisterSchema(BaseModel):
    prn: str
    name: str
    password: str
    age: int
    sex: str  # Changed from gender to sex to match frontend
    address: Optional[str] = None
    phone: Optional[str] = None
    consultationDate: Optional[str] = None
    department: Optional[str] = None
    consultant: Optional[str] = None
    regNo: Optional[str] = None
    assigned_room: Optional[str] = None
    assigned_doctor: Optional[str] = None
    severityIndex: Optional[str] = None
    tasks_for_nurse: Optional[List[dict]] = [] # Changed to list of dicts for task objects

class PatientLoginSchema(BaseModel):
    prn: str
    password: str

class TaskAssignSchema(BaseModel):
    task: str
    nurse_username: str
