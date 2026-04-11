from fastapi import APIRouter, HTTPException, Query
from app.database import tasks_collection, patients_collection
from app.schemas import TaskSchema
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

@router.post("/assign")
async def assign_task(data: TaskSchema):
    task_doc = data.dict(exclude={"id"})
    task_doc["status"] = "pending"
    task_doc["created_at"] = datetime.now().isoformat()
    result = await tasks_collection.insert_one(task_doc)
    
    # Also update the patient document for legacy compatibility
    await patients_collection.update_one(
        {"prn": data.patient_prn},
        {"$push": {"tasks_for_nurse": {
            "task_id": str(result.inserted_id),
            "task": data.task_content,
            "nurse_username": data.nurse_username,
            "status": "pending"
        }}}
    )
    
    return {"message": "Task assigned", "task_id": str(result.inserted_id)}

@router.put("/{task_id}/complete")
async def complete_task(task_id: str):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")
        
    result = await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": "completed", "completed_at": datetime.now().isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or already completed")
    
    # Sync with patient document tasks list
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if task:
        await patients_collection.update_one(
            {"prn": task["patient_prn"], "tasks_for_nurse.task_id": task_id},
            {"$set": {"tasks_for_nurse.$.status": "completed"}}
        )
    
    return {"message": "Task completed successfully"}

@router.get("/nurse/{username}")
async def get_nurse_tasks(
    username: str, 
    status: Optional[str] = Query(None), 
    date: Optional[str] = Query(None)
):
    query = {"nurse_username": username}
    if status:
        query["status"] = status
    
    if date:
        # Search in completed_at for history
        query["completed_at"] = {"$regex": f"^{date}"}
        
    cursor = tasks_collection.find(query).sort("created_at", -1)
    tasks = []
    async for t in cursor:
        t["_id"] = str(t["_id"])
        tasks.append(t)
    return tasks
