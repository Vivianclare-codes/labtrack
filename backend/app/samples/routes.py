from datetime import datetime
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.samples.models import Sample
from app.patients.models import Patient

router = APIRouter()

SampleStatus = Literal["Registered", "Received", "On Hold", "Cancelled"]


# REQUEST SCHEMA
class SampleCreate(BaseModel):
    model_config = {"from_attributes": True}

    patient_id: int
    sample_type: str
    collection_datetime: datetime
    received_datetime: datetime
    sample_condition: str
    receiving_staff: str
    status: SampleStatus


# RESPONSE SCHEMA
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


class SampleUpdate(BaseModel):
    status: SampleStatus


# REGISTER SAMPLE
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


# RETRIEVE ALL SAMPLES
@router.get("/", response_model=list[SampleResponse])
def get_samples(
    search: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Sample)

    if search:
        query = query.filter(
            (Sample.sample_id.ilike("%" + search + "%"))
            | (Sample.sample_type.ilike("%" + search + "%"))
        )

    samples = query.offset(skip).limit(limit).all()

    return samples


@router.get("/{sample_id}", response_model=SampleResponse)
def get_sample(sample_id: str, db: Session = Depends(get_db)):

    # Find the sample
    sample = db.query(Sample).filter(Sample.sample_id == sample_id).first()

    # Check whether the sample exists
    if sample is None:
        raise HTTPException(
            status_code=404,
            detail="Sample not found.",
        )

    return sample


@router.patch("/{sample_id}", response_model=SampleResponse)
def update_sample_status(
    sample_id: str,
    sample_data: SampleUpdate,
    db: Session = Depends(get_db),
):
    # Find the sample
    sample = db.query(Sample).filter(Sample.sample_id == sample_id).first()

    # Check whether the sample exists
    if sample is None:
        raise HTTPException(
            status_code=404,
            detail="Sample not found.",
        )

    # Update the sample status
    sample.status = sample_data.status

    # Save changes
    db.commit()
    db.refresh(sample)

    return sample
