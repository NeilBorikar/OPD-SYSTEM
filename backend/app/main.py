from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import patients, consultations, slots, tasks, auth
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later we will restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(consultations.router)
app.include_router(auth.router)
app.include_router(slots.router, prefix="/slots", tags=["slots"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/")
def home():
    return {"message": "Clinic Backend Running"}