from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
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
    id: int
    patient_id: str
    registration_date: date


class PatientUpdate(BaseModel):
    model_config = {"from_attributes": True}

    first_name: str = Field(default=None)
    last_name: str = Field(default=None)
    date_of_birth: date = Field(default=None)
    sex_at_birth: str = Field(default=None)
    hospital_number: str = Field(default=None)
    patient_type: str = Field(default=None)

    phone_number: str | None = None
    email_address: str | None = None
    home_address: str | None = None

    clinic_or_ward: str = Field(default=None)
    referring_clinician: str = Field(default=None)

    clinical_notes: str | None = None
    identity_verified: bool = Field(default=None)


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


@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
):
    # Find the patient
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()

    # Check whether the patient exists
    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    # Extract only the fields supplied
    update_data = patient_data.model_dump(exclude_unset=True)

    # Apply the changes
    for field, value in update_data.items():
        setattr(patient, field, value)

    # Save changes
    try:
        db.commit()
        db.refresh(patient)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A patient with this hospital number already exists.",
        )

    # Return updated patient
    return {
        "patient_id": patient.patient_id,
        "registration_date": patient.registration_date,
        "patient": patient,
    }
