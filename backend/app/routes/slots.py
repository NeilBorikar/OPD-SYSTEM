from fastapi import APIRouter, HTTPException, Depends
from app.database import slots_collection, doctors_collection, patients_collection
from app.schemas import SlotSchema, DoctorScheduleRequest
from datetime import datetime, timedelta
from typing import List
from bson import ObjectId

router = APIRouter()

@router.get("/doctors")
async def list_doctors():
    doctors = await doctors_collection.find({}, {"username": 1, "full_name": 1}).to_list(100)
    for d in doctors:
        d["_id"] = str(d["_id"])
    return doctors

@router.post("/set-session")
async def set_doctor_session(request: DoctorScheduleRequest):
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    target_date = request.date if request.date else today_str

    # Constraint: No past dates
    if target_date < today_str:
        raise HTTPException(status_code=400, detail="Cannot set session for a past date.")

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

    # Constraint: No past times for today
    if target_date == today_str:
        if start_time.time() < now.time():
            raise HTTPException(status_code=400, detail="Start time cannot be in the past for today's session.")

    # Clear existing slots for this doctor on the target date
    await slots_collection.delete_many({"doctor_username": request.doctor_username, "date": target_date})

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
            "is_completed": False,
            "patient_prn": None,
            "date": target_date
        })
        current_time = next_time

    if slots:
        await slots_collection.insert_many(slots)
    
    return {"message": f"Generated {len(slots)} slots for {request.doctor_username} on {target_date}"}

@router.get("/", response_model=List[dict])
async def get_all_slots(date: str = None, doctor_username: str = None):
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    query = {"date": date}
    if doctor_username:
        query["doctor_username"] = doctor_username
        
    slots = await slots_collection.find(query).to_list(1000)
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
    today = datetime.now().strftime("%Y-%m-%d")
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
    # 1. Fetch current slot
    slot = await slots_collection.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # 2. Parse scheduled end time
    try:
        times = slot["time"].split(" - ")
        scheduled_end_str = times[1]
        now = datetime.now()
        # Create a datetime for today at the scheduled end HH:MM
        scheduled_end = datetime.strptime(scheduled_end_str, "%H:%M").replace(
            year=now.year, month=now.month, day=now.day
        )
    except (IndexError, ValueError):
        raise HTTPException(status_code=500, detail="Corrupt slot time format")

    # 3. Calculate delta (actual end - scheduled end)
    actual_end = now
    delta_minutes = int((actual_end - scheduled_end).total_seconds() / 60)

    # 4. Mark this slot as completed
    await slots_collection.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"is_completed": True}}
    )

    # 5. Find all subsequent slots for the same doctor/day
    doctor_username = slot["doctor_username"]
    today = slot["date"]

    future_slots_cursor = slots_collection.find({
        "doctor_username": doctor_username,
        "date": today,
        "is_completed": False,
        "_id": {"$ne": ObjectId(slot_id)}
    })
    
    future_slots = await future_slots_cursor.to_list(None)
    
    updated_count = 0
    scheduled_end_time_val = datetime.strptime(scheduled_end_str, "%H:%M").time()

    for s in future_slots:
        try:
            s_times = s["time"].split(" - ")
            s_start_dt = datetime.strptime(s_times[0], "%H:%M")
            s_end_dt = datetime.strptime(s_times[1], "%H:%M")
            
            # Only shift slots that were scheduled to start at or after our current slot's scheduled end
            if s_start_dt.time() >= scheduled_end_time_val:
                new_start = s_start_dt + timedelta(minutes=delta_minutes)
                new_end = s_end_dt + timedelta(minutes=delta_minutes)
                
                new_time_str = f"{new_start.strftime('%H:%M')} - {new_end.strftime('%H:%M')}"
                
                await slots_collection.update_one(
                    {"_id": s["_id"]},
                    {"$set": {"time": new_time_str}}
                )
                updated_count += 1
        except Exception as e:
            print(f"Error shifting slot {s['_id']}: {e}")
            continue

    return {
        "message": f"Slot completed. Shifted {updated_count} future slots by {delta_minutes} minutes.",
        "delta": delta_minutes
    }
