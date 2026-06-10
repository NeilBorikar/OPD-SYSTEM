from fastapi import APIRouter, HTTPException, Depends
from app.database import slots_collection, doctors_collection, patients_collection
from app.schemas import SlotSchema, DoctorScheduleRequest
from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30))
from typing import List
from bson import ObjectId

router = APIRouter()

@router.post("/set-session")
async def set_doctor_session(request: DoctorScheduleRequest):
    # Verify doctor exists
    doctor = await doctors_collection.find_one({"username": request.doctor_username})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Parse times
    try:
        start_time = datetime.strptime(request.start_time, "%H:%M")
        end_time = datetime.strptime(request.end_time, "%H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:mm")

    if end_time <= start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    today = datetime.now(IST).strftime("%Y-%m-%d")

    # Clear existing slots for this doctor today if they want to reset? 
    # For now, let's just add. Or should we prevent duplicates?
    # Usually, a doctor sets session once.
    await slots_collection.delete_many({"doctor_username": request.doctor_username, "date": today})

    slots = []
    current_time = start_time
    while current_time < end_time:
        next_time = current_time + timedelta(minutes=10)
        if next_time > end_time:
            break
            
        slot_time_str = f"{current_time.strftime('%H:%M')} - {next_time.strftime('%H:%M')}"
        slots.append({
            "doctor_username": request.doctor_username,
            "time": slot_time_str,
            "is_booked": False,
            "patient_prn": None,
            "date": today
        })
        current_time = next_time

    if slots:
        await slots_collection.insert_many(slots)
    
    return {"message": f"Generated {len(slots)} slots for {request.doctor_username} on {today}"}

@router.get("/", response_model=List[dict])
async def get_all_slots(date: str = None):
    if not date:
        date = datetime.now(IST).strftime("%Y-%m-%d")
    
    slots = await slots_collection.find({"date": date}).to_list(1000)
    # Convert ObjectId to str for response
    for s in slots:
        s["_id"] = str(s["_id"])
    return slots

@router.post("/book")
async def book_slot(slot_id: str, patient_prn: str):
    # Verify patient exists
    patient = await patients_collection.find_one({"prn": patient_prn})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Check if patient already booked a slot today
    today = datetime.now(IST).strftime("%Y-%m-%d")
    existing_booking = await slots_collection.find_one({
        "patient_prn": patient_prn,
        "date": today,
        "is_booked": True
    })
    if existing_booking:
        raise HTTPException(status_code=400, detail="Patient has already booked a slot today")

    # Check if slot exists and is not booked
    slot = await slots_collection.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if slot["is_booked"]:
        raise HTTPException(status_code=400, detail="Slot is already booked")

    # Book the slot
    result = await slots_collection.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"is_booked": True, "patient_prn": patient_prn}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Booking failed")

    return {"message": "Slot booked successfully", "slot_time": slot["time"]}

