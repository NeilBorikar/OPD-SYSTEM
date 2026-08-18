from fastapi import APIRouter, HTTPException, Depends
from app.database import slots_collection, doctors_collection, patients_collection
from app.schemas import SlotSchema, DoctorScheduleRequest
from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30))
from typing import List
from bson import ObjectId

router = APIRouter()

def shift_time_str(time_range_str: str, delta_minutes: int) -> str:
    start_str, end_str = time_range_str.split(" - ")
    start_dt = datetime.strptime(start_str, "%H:%M")
    end_dt = datetime.strptime(end_str, "%H:%M")
    
    new_start_dt = start_dt + timedelta(minutes=delta_minutes)
    new_end_dt = end_dt + timedelta(minutes=delta_minutes)
    
    return f"{new_start_dt.strftime('%H:%M')} - {new_end_dt.strftime('%H:%M')}"

@router.post("/set-session")
async def set_doctor_session(request: DoctorScheduleRequest):
    # Verify doctor exists
    doctor = await doctors_collection.find_one({"username": request.doctor_username, "clinic_id": request.clinic_id})
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

    # Determine session date
    current_date_str = datetime.now(IST).strftime("%Y-%m-%d")
    session_date = request.date if request.date else current_date_str

    if session_date < current_date_str:
        raise HTTPException(status_code=400, detail="Cannot set visiting hours for a past date")

    if session_date == current_date_str:
        current_time_str = datetime.now(IST).strftime("%H:%M")
        if request.start_time < current_time_str:
            raise HTTPException(status_code=400, detail="Cannot create appointments before current time")

    # Clear existing slots for this doctor on selected date
    await slots_collection.delete_many({"doctor_username": request.doctor_username,
            "clinic_id": request.clinic_id, "date": session_date})

    slots = []
    current_time = start_time
    token_counter = 1
    while current_time < end_time:
        next_time = current_time + timedelta(minutes=10)
        if next_time > end_time:
            break
            
        slot_time_str = f"{current_time.strftime('%H:%M')} - {next_time.strftime('%H:%M')}"
        slots.append({
            "doctor_username": request.doctor_username,
            "clinic_id": request.clinic_id,
            "time": slot_time_str,
            "is_booked": False,
            "is_completed": False,
            "patient_prn": None,
            "token_number": token_counter,
            "date": session_date
        })
        token_counter += 1
        current_time = next_time

    if slots:
        await slots_collection.insert_many(slots)
    
    return {"message": f"Generated {len(slots)} slots for {request.doctor_username} on {session_date}"}

@router.get("/doctors", response_model=List[dict])
async def get_all_doctors(clinic_id: str = "IR"):
    doctors = await doctors_collection.find({"clinic_id": clinic_id}, {"_id": 0, "username": 1, "full_name": 1}).to_list(1000)
    return doctors

@router.get("/", response_model=List[dict])
async def get_all_slots(date: str = None, doctor_username: str = None, clinic_id: str = "IR"):
    current_date_ist = datetime.now(IST).strftime("%Y-%m-%d")
    if not date:
        date = current_date_ist
    
    query = {"date": date, "clinic_id": clinic_id}
    if doctor_username and doctor_username not in ("null", "undefined", ""):
        query["doctor_username"] = doctor_username
        
    slots = await slots_collection.find(query).to_list(1000)
    # Convert ObjectId to str for response
    for s in slots:
        s["_id"] = str(s["_id"])
        
    # If date is today, filter out slots whose end time has already passed
    if date == current_date_ist:
        current_time_ist = datetime.now(IST).strftime("%H:%M")
        filtered_slots = []
        for s in slots:
            try:
                time_range = s.get("time", "")
                if " - " in time_range:
                    _, end_str = time_range.split(" - ")
                    if end_str > current_time_ist:
                        filtered_slots.append(s)
            except Exception:
                filtered_slots.append(s)
        return filtered_slots
        
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

@router.put("/{slot_id}/complete")
async def complete_slot(slot_id: str):
    if not ObjectId.is_valid(slot_id):
        raise HTTPException(status_code=400, detail="Invalid slot ID")

    slot = await slots_collection.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    if slot.get("is_completed"):
        raise HTTPException(status_code=400, detail="Slot is already completed")
        
    # Mark slot as completed
    await slots_collection.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"is_completed": True}}
    )
    
    # Adjust subsequent slots if this slot was booked and completed early/late
    try:
        time_range = slot.get("time", "")
        if " - " in time_range:
            start_str, end_str = time_range.split(" - ")
            now_ist = datetime.now(IST)
            current_time_str = now_ist.strftime("%H:%M")
            
            current_dt = datetime.strptime(current_time_str, "%H:%M")
            scheduled_end_dt = datetime.strptime(end_str, "%H:%M")
            
            delta_minutes = int((current_dt - scheduled_end_dt).total_seconds() / 60)
            
            if delta_minutes != 0:
                subsequent_slots = await slots_collection.find({
                    "doctor_username": slot["doctor_username"],
                    "date": slot["date"],
                    "is_completed": {"$ne": True},
                    "_id": {"$ne": ObjectId(slot_id)}
                }).to_list(1000)
                
                for s in subsequent_slots:
                    try:
                        s_time = s.get("time", "")
                        if " - " in s_time:
                            s_start, s_end = s_time.split(" - ")
                            if s_start >= end_str:
                                new_time = shift_time_str(s_time, delta_minutes)
                                await slots_collection.update_one(
                                    {"_id": s["_id"]},
                                    {"$set": {"time": new_time}}
                                )
                    except Exception as e:
                        print(f"Error shifting slot {s.get('_id')}: {e}")
    except Exception as e:
        print(f"Error during slot adjustment: {e}")
        
    return {"message": "Slot completed and subsequent slots adjusted successfully"}


@router.get("/live-queue/{prn}")
async def get_live_queue(prn: str, clinic_id: str = "IR"):
    today = datetime.now(IST).strftime("%Y-%m-%d")
    prn_str = str(prn).strip()
    
    # Find patient's active (booked and not completed) slot today
    patient_slot = await slots_collection.find_one({
        "patient_prn": prn_str,
        "clinic_id": clinic_id,
        "date": today,
        "is_booked": True,
        "is_completed": {"$ne": True}
    })
    
    if not patient_slot:
        # Check if patient completed a slot today
        completed_slot = await slots_collection.find_one({
            "patient_prn": prn_str,
        "clinic_id": clinic_id,
            "date": today,
            "is_completed": True
        })
        if completed_slot:
            return {
                "has_booking": True,
                "is_completed": True,
                "doctor_username": completed_slot.get("doctor_username"),
                "your_token": completed_slot.get("token_number") or 1,
                "current_patient": completed_slot.get("token_number") or 1,
                "estimated_wait_minutes": 0,
                "status_message": "Your consultation for today is completed."
            }
        return {"has_booking": False}
        
    doctor_username = patient_slot.get("doctor_username")
    
    # Get all slots for this doctor today sorted by time
    all_doctor_slots = await slots_collection.find({
        "doctor_username": doctor_username,
        "clinic_id": clinic_id,
        "date": today
    }).to_list(1000)
    
    all_doctor_slots.sort(key=lambda s: s.get("time", ""))
    
    for idx, s in enumerate(all_doctor_slots):
        if "token_number" not in s or s["token_number"] is None:
            s["token_number"] = idx + 1
            
    your_token = patient_slot.get("token_number")
    if not your_token:
        for idx, s in enumerate(all_doctor_slots):
            if str(s.get("_id")) == str(patient_slot.get("_id")):
                your_token = idx + 1
                break
        if not your_token:
            your_token = 1

    current_slot = None
    for s in all_doctor_slots:
        if s.get("is_booked") and not s.get("is_completed"):
            current_slot = s
            break
            
    if current_slot:
        current_token = current_slot.get("token_number", 1)
    else:
        current_token = your_token

    patients_ahead = max(0, your_token - current_token)
    
    now_ist = datetime.now(IST)
    current_time_str = now_ist.strftime("%H:%M")
    
    try:
        slot_start_str = patient_slot.get("time", "").split(" - ")[0]
        slot_start_dt = datetime.strptime(slot_start_str, "%H:%M")
        current_dt = datetime.strptime(current_time_str, "%H:%M")
        
        time_diff_mins = int((slot_start_dt - current_dt).total_seconds() / 60)
        
        if time_diff_mins > 0:
            estimated_wait = time_diff_mins
        else:
            estimated_wait = patients_ahead * 10
    except Exception:
        estimated_wait = patients_ahead * 10
        
    if your_token == current_token:
        estimated_wait = 0

    return {
        "has_booking": True,
        "is_completed": False,
        "doctor_username": doctor_username,
        "clinic_id": clinic_id,
        "slot_time": patient_slot.get("time"),
        "your_token": your_token,
        "current_patient": current_token,
        "patients_ahead": patients_ahead,
        "estimated_wait_minutes": max(0, estimated_wait)
    }



