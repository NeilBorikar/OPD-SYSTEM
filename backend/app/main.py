from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import patients
from app.routes import consultations
from app.routes import auth
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

@app.get("/")
def home():
    return {"message": "Clinic Backend Running"}