from pydantic import BaseModel
from typing import List

class Medicine(BaseModel):
    name: str
    dose: str


class Consultation(BaseModel):

    patient_name: str
    age: int
    gender: str
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