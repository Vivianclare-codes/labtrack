from fastapi import FastAPI
from app.patients.routes import router as patient_router

app = FastAPI()

app.include_router(patient_router, prefix="/patients")


@app.get("/")
def home():
    return {"message": "Welcome to LabTrack!"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "LabTrack"
    }