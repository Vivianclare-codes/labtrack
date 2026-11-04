from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.samples.models import Sample
from app.patients.models import Patient

router = APIRouter()


class SampleCreate(BaseModel):
    model_config = {"from_attributes": True}

    patient_id: int
    sample_type: str
    collection_datetime: datetime
    received_datetime: datetime
    sample_condition: str
    receiving_staff: str
    status: str


class SampleResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    sample_id: str
    patient_id: int
    sample_type: str
    collection_datetime: datetime
    received_datetime: datetime
    sample_condition: str
    receiving_staff: str
    status: str


@router.post("/", response_model=SampleResponse)
def register_sample(sample: SampleCreate, db: Session = Depends(get_db)):

    # Check whether the patient exists
    patient = db.query(Patient).filter(Patient.id == sample.patient_id).first()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    # Generate a unique sample reference
    sample_id = f"SMP-{str(uuid4())[:8].upper()}"

    # Create the sample record
    new_sample = Sample(sample_id=sample_id, **sample.model_dump())

    # Save the sample
    try:
        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not register sample due to a database conflict.",
        )

    return new_sample
