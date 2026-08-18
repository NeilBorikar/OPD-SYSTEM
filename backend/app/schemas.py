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



class ClinicSchema(BaseModel):
    id: Optional[PyObjectId] = None
    clinic_id: str
    name: str
    address: str
    phone: str
    email: str
    verification_status: str = 'pending'
    clinic_license: Optional[str] = None
    medical_certificate: Optional[str] = None
    tax_id: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True

class SuperAdminLoginSchema(BaseModel):
    password: str

class Consultation(BaseModel):
    clinic_id: str

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
    clinic_id: str
    username: str
    password: str


class ResetPasswordSchema(BaseModel):
    username: str
    new_password: str

class DoctorRegisterSchema(BaseModel):
    clinic_id: str
    username: str
    email: str
    password: str
    full_name: str

class DoctorLoginSchema(BaseModel):
    username: str
    password: str

class DoctorSchema(BaseModel):
    clinic_id: str
    id: Optional[PyObjectId] = None
    username: str
    email: str
    password: str
    full_name: str

    class Config:
        arbitrary_types_allowed = True

class NurseRegisterSchema(BaseModel):
    clinic_id: str
    username: str
    email: str
    password: str
    full_name: str

class NurseLoginSchema(BaseModel):
    username: str
    password: str

class ReceptionistRegisterSchema(BaseModel):
    clinic_id: str
    username: str
    email: str
    password: str
    full_name: str

class ReceptionistLoginSchema(BaseModel):
    username: str
    password: str

class PatientRegisterSchema(BaseModel):
    prn: Optional[str] = None
    name: str
    password: str
    age: int
    sex: str  # Changed from gender to sex to match frontend
    address: Optional[str] = None
    phone: Optional[str] = None
    consultationDate: Optional[str] = None
    department: Optional[str] = None
    consultant: Optional[str] = None
    assigned_room: Optional[str] = None
    assigned_doctor: Optional[str] = None
    severityIndex: Optional[str] = None
    tasks_for_nurse: Optional[List[dict]] = [] # Changed to list of dicts for task objects

class PatientLoginSchema(BaseModel):
    clinic_id: str
    prn: str
    password: str

class TaskAssignSchema(BaseModel):
    clinic_id: str
    task: str
    nurse_username: str

class SlotSchema(BaseModel):
    clinic_id: str
    id: Optional[PyObjectId] = None
    doctor_username: str
    time: str  # Format: "HH:mm - HH:mm"
    is_booked: bool = False
    is_completed: bool = False
    patient_prn: Optional[str] = None
    token_number: Optional[int] = None
    date: str  # Format: "YYYY-MM-DD"

    class Config:
        arbitrary_types_allowed = True

class DoctorScheduleRequest(BaseModel):
    clinic_id: str
    doctor_username: str
    start_time: str  # Format: "HH:mm"
    end_time: str    # Format: "HH:mm"
    date: Optional[str] = None # Format: "YYYY-MM-DD"

class TaskSchema(BaseModel):
    clinic_id: str
    id: Optional[PyObjectId] = None
    patient_prn: str
    patient_name: str
    nurse_username: str
    task_content: str
    status: str = "pending" # pending, completed
    created_at: str # ISO format
    completed_at: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True

class QueryCreateSchema(BaseModel):
    clinic_id: str
    patient_prn: str
    patient_name: str
    query_text: str

class QueryAnswerSchema(BaseModel):
    answer_text: str
    answered_by_role: str
    answered_by_name: str

class QueryForwardSchema(BaseModel):
    doctor_username: str
    doctor_name: str
    forwarded_by_role: str
    forwarded_by_name: str
