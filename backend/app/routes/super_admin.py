from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import bcrypt
from app.database import db, clinics_collection, patients_collection, consultations_collection
from app.schemas import ClinicSchema, SuperAdminLoginSchema

router = APIRouter()

SUPER_ADMIN_HASH = bcrypt.hashpw(b'HNRP@20067370', bcrypt.gensalt(rounds=12))

@router.post('/login')
async def super_admin_login(data: SuperAdminLoginSchema):
    if bcrypt.checkpw(data.password.encode('utf-8'), SUPER_ADMIN_HASH):
        return {'status': 'success', 'message': 'Authenticated'}
    raise HTTPException(status_code=401, detail='Unauthorized')

@router.post('/clinics')
async def register_clinic(clinic: ClinicSchema):
    existing = await clinics_collection.find_one({'clinic_id': clinic.clinic_id})
    if existing:
        raise HTTPException(status_code=400, detail='Clinic ID already exists')
    
    clinic_dict = clinic.dict(exclude_unset=True)
    if 'id' in clinic_dict:
        del clinic_dict['id']
        
    result = await clinics_collection.insert_one(clinic_dict)
    return {'status': 'success', 'message': 'Clinic registered', 'clinic_id': clinic.clinic_id}

@router.get('/clinics')
async def get_clinics():
    clinics = []
    cursor = clinics_collection.find({})
    async for document in cursor:
        document['id'] = str(document['_id'])
        del document['_id']
        clinics.append(document)
    return clinics

@router.get('/users')
async def get_global_users():
    patients = []
    cursor = patients_collection.find({})
    async for patient in cursor:
        patient['_id'] = str(patient['_id'])
        consults = []
        c_cursor = consultations_collection.find({'prn': patient.get('prn')})
        async for c in c_cursor:
            c['_id'] = str(c['_id'])
            consults.append(c)
        patient['consultations'] = consults
        patients.append(patient)
    return patients
