from fastapi import FastAPI
from app.patients.routes import router as patient_router
from app.database import create_tables
from app.patients.models import Patient
from app.samples.models import Sample
from app.samples.routes import router as sample_router
from app.departments.models import Department
from app.departments.routes import router as department_router

app = FastAPI()
create_tables()

app.include_router(patient_router, prefix="/patients")
app.include_router(sample_router, prefix="/samples")
app.include_router(department_router, prefix="/departments")


@app.get("/")
def home():
    return {"message": "Welcome to LabTrack!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "application": "LabTrack"}
