from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.patients.models import Patient

router = APIRouter()


class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    sex_at_birth: str
    hospital_number: str
    patient_type: str

    phone_number: str | None = None
    email_address: str | None = None
    home_address: str | None = None

    clinic_or_ward: str
    referring_clinician: str

    clinical_notes: str | None = None
    identity_verified: bool


class PatientResponse(BaseModel):
    patient_id: str
    registration_date: date
    patient: PatientCreate


@router.post("/", response_model=PatientResponse)
def register_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    patient_id = f"PT-{str(uuid4())[:8].upper()}"

    new_patient = Patient(patient_id=patient_id, **patient.model_dump())

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "patient_id": patient_id,
        "registration_date": date.today(),
        "patient": patient,
    }
