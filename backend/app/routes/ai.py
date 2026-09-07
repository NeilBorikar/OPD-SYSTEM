from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import consultations_collection, patients_collection
from app.utils.ai_engine import (
    generate_timeline_narrative,
    generate_summary_narrative,
    answer_record_question,
    generate_report_narrative
)
import json
from datetime import datetime
from collections import defaultdict
from pydantic import BaseModel

router = APIRouter()

class AskRequest(BaseModel):
    prn: str
    question: str
    history: List[Dict[str, str]] = []

async def fetch_patient_and_records(prn: str):
    prn = str(prn).strip()
    patient = await patients_collection.find_one({"prn": prn})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    records = []
    cursor = consultations_collection.find({"prn": prn}).sort("_id", 1) # Chronological
    async for record in cursor:
        record["_id"] = str(record["_id"])
        records.append(record)
        
    return patient, records

@router.get("/timeline/{prn}")
async def get_health_timeline(prn: str):
    patient, records = await fetch_patient_and_records(prn)
    
    if not records:
        return {"patient_name": patient.get("name"), "timeline": []}

    records_json = json.dumps(records, default=str)
    
    # Generate timeline via Gemini
    ai_response = await generate_timeline_narrative(records_json)
    
    try:
        timeline_data = json.loads(ai_response)
    except json.JSONDecodeError:
        timeline_data = [] # Fallback if parsing fails

    return {
        "patient_name": patient.get("name"),
        "prn": prn,
        "total_visits": len(records),
        "timeline": timeline_data
    }

@router.get("/summary/{prn}")
async def get_record_summary(prn: str):
    patient, records = await fetch_patient_and_records(prn)
    
    if not records:
        return {
            "summary_text": "No medical records found.",
            "stats": {
                "total_consultations": 0,
                "total_prescriptions": 0,
                "clinics_visited": 0,
                "most_recent_visit": "None"
            }
        }

    # Compute stats
    clinics = set()
    total_meds = 0
    for r in records:
        clinics.add(r.get("clinic_id", "Unknown"))
        total_meds += len(r.get("medicines", []))
        
    stats = {
        "total_consultations": len(records),
        "total_prescriptions": total_meds,
        "clinics_visited": len(clinics),
        "most_recent_visit": records[-1].get("consultationDate", "Unknown") if records else "None"
    }
    
    records_json = json.dumps(records, default=str)
    stats_json = json.dumps(stats, default=str)
    
    summary_text = await generate_summary_narrative(records_json, stats_json)
    
    return {
        "summary_text": summary_text,
        "stats": stats
    }

@router.get("/trends/{prn}")
async def get_health_trends(prn: str):
    patient, records = await fetch_patient_and_records(prn)
    
    visits_per_month = defaultdict(int)
    medicines_per_visit = []
    vitals_over_time = {"bp": [], "pulse": [], "weight": [], "spo2": []}
    
    for r in records:
        date_str = r.get("consultationDate")
        if not date_str: continue
        
        # Visits per month
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            month_key = dt.strftime("%Y-%m")
            visits_per_month[month_key] += 1
        except:
            pass
            
        # Meds
        meds_count = len(r.get("medicines", []))
        medicines_per_visit.append({"date": date_str, "count": meds_count})
        
        # Vitals
        if r.get("bp"): vitals_over_time["bp"].append({"date": date_str, "value": r.get("bp")})
        if r.get("pulse"): vitals_over_time["pulse"].append({"date": date_str, "value": r.get("pulse")})
        if r.get("weight"): vitals_over_time["weight"].append({"date": date_str, "value": r.get("weight")})
        if r.get("spo2"): vitals_over_time["spo2"].append({"date": date_str, "value": r.get("spo2")})

    return {
        "visits_per_month": [{"month": k, "count": v} for k, v in sorted(visits_per_month.items())],
        "medicines_per_visit": medicines_per_visit,
        "vitals_over_time": vitals_over_time
    }

@router.post("/ask")
async def ask_records_question(req: AskRequest):
    patient, records = await fetch_patient_and_records(req.prn)
    records_json = json.dumps(records, default=str)
    
    answer = await answer_record_question(req.question, records_json, req.history)
    return {"answer": answer}

@router.get("/report/{prn}")
async def generate_health_report(prn: str):
    patient, records = await fetch_patient_and_records(prn)
    
    if not records:
        raise HTTPException(status_code=404, detail="No records to generate report")
        
    records_json = json.dumps(records, default=str)
    
    # Generate narrative sections via Gemini
    ai_response = await generate_report_narrative(records_json)
    
    try:
        sections = json.loads(ai_response)
    except:
        sections = {}

    return {
        "patient": {
            "name": patient.get("name"),
            "prn": patient.get("prn"),
            "age": patient.get("age"),
            "sex": patient.get("sex")
        },
        "generated_at": datetime.now().isoformat(),
        "sections": sections
    }
