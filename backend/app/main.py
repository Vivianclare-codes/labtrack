from fastapi import FastAPI
from app.patients.routes import router as patient_router
from app.database import create_tables
from app.patients.models import Patient

app = FastAPI()
create_tables()

app.include_router(patient_router, prefix="/patients")


@app.get("/")
def home():
    return {"message": "Welcome to LabTrack!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "application": "LabTrack"}
