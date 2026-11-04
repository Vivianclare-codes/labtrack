from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.patients.models import Patient

router = APIRouter()


class PatientCreate(BaseModel):
    model_config = {"from_attributes": True}

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
    model_config = {"from_attributes": True}

    patient_id: str
    registration_date: date
    patient: PatientCreate


class PatientListResponse(PatientCreate):
    patient_id: str
    registration_date: date


@router.post("/", response_model=PatientResponse)
def register_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    patient_id = f"PT-{str(uuid4())[:8].upper()}"

    new_patient = Patient(patient_id=patient_id, **patient.model_dump())

    try:
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A patient with this hospital number already exists.",
        )

    return {
        "patient_id": patient_id,
        "registration_date": new_patient.registration_date,
        "patient": new_patient,
    }


@router.get("/", response_model=list[PatientListResponse])
def get_patients(
    search: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Patient)

    if search:
        query = query.filter(
            (Patient.first_name.ilike("%" + search + "%"))
            | (Patient.last_name.ilike("%" + search + "%"))
            | (Patient.patient_id.ilike("%" + search + "%"))
            | (Patient.hospital_number.ilike("%" + search + "%"))
        )

    patients = query.offset(skip).limit(limit).all()

    return patients


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()

    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found.")

    return {
        "patient_id": patient.patient_id,
        "registration_date": patient.registration_date,
        "patient": patient,
    }