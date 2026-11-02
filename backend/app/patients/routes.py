from datetime import date
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel

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
def register_patient(patient: PatientCreate):
    patient_id = f"PT-{str(uuid4())[:8].upper()}"

    return {
        "patient_id": patient_id,
        "registration_date": date.today(),
        "patient": patient
    }