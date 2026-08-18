from fastapi import APIRouter, HTTPException
from app.database import queries_collection
from app.schemas import QueryCreateSchema, QueryAnswerSchema, QueryForwardSchema
from datetime import datetime, timezone, timedelta
IST = timezone(timedelta(hours=5, minutes=30))
from typing import List
from bson import ObjectId

router = APIRouter()

@router.post("/create")
async def create_query(data: QueryCreateSchema):
    now_iso = datetime.now(IST).isoformat()
    query_doc = {
        "patient_prn": data.patient_prn,
        "patient_name": data.patient_name,
        "query_text": data.query_text,
        "created_at": now_iso,
        "status": "pending",
        "clinic_id": data.clinic_id,
        "forwarded_to_doctor": None,
        "forwarded_to_doctor_name": None,
        "forwarded_by_role": None,
        "forwarded_by_name": None,
        "forwarded_at": None,
        "answer_text": None,
        "answered_by_role": None,
        "answered_by_name": None,
        "answered_at": None
    }
    result = await queries_collection.insert_one(query_doc)
    return {"message": "Query submitted successfully", "id": str(result.inserted_id)}

@router.get("/patient/{prn}", response_model=List[dict])
async def get_patient_queries(prn: str):
    prn_str = str(prn).strip()
    cursor = queries_collection.find({"patient_prn": prn_str}).sort("created_at", -1)
    queries = []
    async for q in cursor:
        q["_id"] = str(q["_id"])
        queries.append(q)
    return queries

@router.get("/staff", response_model=List[dict])
async def get_staff_queries():
    cursor = queries_collection.find({}).sort("created_at", -1)
    queries = []
    async for q in cursor:
        q["_id"] = str(q["_id"])
        queries.append(q)
    return queries

@router.get("/doctor/{doctor_username}", response_model=List[dict])
async def get_doctor_queries(doctor_username: str):
    cursor = queries_collection.find({"forwarded_to_doctor": doctor_username}).sort("created_at", -1)
    queries = []
    async for q in cursor:
        q["_id"] = str(q["_id"])
        queries.append(q)
    return queries

@router.put("/{query_id}/answer")
async def answer_query(query_id: str, data: QueryAnswerSchema):
    if not ObjectId.is_valid(query_id):
        raise HTTPException(status_code=400, detail="Invalid Query ID")

    now_iso = datetime.now(IST).isoformat()
    result = await queries_collection.update_one(
        {"_id": ObjectId(query_id)},
        {
            "$set": {
                "answer_text": data.answer_text,
                "answered_by_role": data.answered_by_role,
                "answered_by_name": data.answered_by_name,
                "answered_at": now_iso,
                "status": "answered"
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
        
    return {"message": "Query answered successfully"}

@router.put("/{query_id}/forward")
async def forward_query(query_id: str, data: QueryForwardSchema):
    if not ObjectId.is_valid(query_id):
        raise HTTPException(status_code=400, detail="Invalid Query ID")

    now_iso = datetime.now(IST).isoformat()
    result = await queries_collection.update_one(
        {"_id": ObjectId(query_id)},
        {
            "$set": {
                "forwarded_to_doctor": data.doctor_username,
                "forwarded_to_doctor_name": data.doctor_name,
                "forwarded_by_role": data.forwarded_by_role,
                "forwarded_by_name": data.forwarded_by_name,
                "forwarded_at": now_iso,
                "status": "forwarded"
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
        
    return {"message": f"Query forwarded to Dr. {data.doctor_name} successfully"}
