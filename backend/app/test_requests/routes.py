from datetime import datetime
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, model_validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.test_requests.models import TestRequest
from app.samples.models import Sample
from app.tests.models import Test
from app.departments.models import Department

router = APIRouter()


# CREATE REQUEST SCHEMA
class TestRequestCreate(BaseModel):
    sample_id: int
    test_id: int | None = None
    department_id: int | None = None
    custom_test_name: str | None = None
    custom_test_description: str | None = None

    @model_validator(mode="after")
    def validate_request(self):
        if self.test_id is not None:
            if self.custom_test_name or self.custom_test_description:
                raise ValueError(
                    "A request cannot be both a catalogue test and a custom test."
                )

        elif not self.custom_test_name:
            raise ValueError(
                "Provide either a catalogue test ID or a custom test name."
            )

        elif self.department_id is None:
            raise ValueError("A department is required for a custom test.")

        return self


# RESPONSE SCHEMA
class TestRequestResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    request_id: str
    sample_id: int
    test_id: int | None
    department_id: int
    custom_test_name: str | None
    custom_test_description: str | None
    status: str
    requested_at: datetime


# CUSTOM TEST REVIEW SCHEMA
class CustomTestReview(BaseModel):
    decision: Literal["approve", "reject"]


# CREATE TEST REQUEST
@router.post("/", response_model=TestRequestResponse)
def create_test_request(
    request: TestRequestCreate,
    db: Session = Depends(get_db),
):
    sample = db.query(Sample).filter(Sample.id == request.sample_id).first()

    if sample is None:
        raise HTTPException(
            status_code=404,
            detail="Sample not found.",
        )

    if request.test_id is not None:
        test = db.query(Test).filter(Test.id == request.test_id).first()

        if test is None:
            raise HTTPException(
                status_code=404,
                detail="Test not found.",
            )

        if not test.is_active:
            raise HTTPException(
                status_code=400,
                detail="This test is currently inactive.",
            )

        department_id = test.department_id
        status = "Requested"

    else:
        department = (
            db.query(Department).filter(Department.id == request.department_id).first()
        )

        if department is None:
            raise HTTPException(
                status_code=404,
                detail="Department not found.",
            )

        if not department.is_active:
            raise HTTPException(
                status_code=400,
                detail="This department is inactive.",
            )

        department_id = department.id
        status = "Pending Approval"

    new_request = TestRequest(
        request_id=f"TR-{str(uuid4())[:8].upper()}",
        sample_id=request.sample_id,
        test_id=request.test_id,
        department_id=department_id,
        custom_test_name=request.custom_test_name,
        custom_test_description=request.custom_test_description,
        status=status,
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# GET ALL TEST REQUESTS
@router.get("/", response_model=list[TestRequestResponse])
def get_test_requests(
    sample_id: int | None = None,
    department_id: int | None = None,
    status: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(TestRequest)

    if sample_id is not None:
        query = query.filter(TestRequest.sample_id == sample_id)

    if department_id is not None:
        query = query.filter(TestRequest.department_id == department_id)

    if status:
        query = query.filter(TestRequest.status == status)

    return query.offset(skip).limit(limit).all()


# GET SINGLE TEST REQUEST
@router.get("/{request_id}", response_model=TestRequestResponse)
def get_test_request(
    request_id: str,
    db: Session = Depends(get_db),
):
    test_request = (
        db.query(TestRequest).filter(TestRequest.request_id == request_id).first()
    )

    if test_request is None:
        raise HTTPException(
            status_code=404,
            detail="Test request not found.",
        )

    return test_request


# UPDATE TEST REQUEST STATUS
class TestRequestStatusUpdate(BaseModel):
    status: str


@router.patch("/{request_id}/status", response_model=TestRequestResponse)
def update_test_request_status(
    request_id: str,
    request_data: TestRequestStatusUpdate,
    db: Session = Depends(get_db),
):
    test_request = (
        db.query(TestRequest).filter(TestRequest.request_id == request_id).first()
    )

    if test_request is None:
        raise HTTPException(
            status_code=404,
            detail="Test request not found.",
        )

    allowed_transitions = {
        "Pending Approval": {"Requested", "Rejected"},
        "Requested": {"Processing"},
        "Processing": {"Awaiting Review"},
        "Awaiting Review": {"Completed", "Processing", "Rejected"},
    }

    if request_data.status not in allowed_transitions.get(
        test_request.status, set()
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot change test request status from "
                f"{test_request.status} to {request_data.status}."
            ),
        )

    test_request.status = request_data.status

    db.commit()
    db.refresh(test_request)

    return test_request


# SUPERVISOR REVIEWS CUSTOM TEST REQUEST
@router.patch("/{request_id}/review", response_model=TestRequestResponse)
def review_custom_test(
    request_id: str,
    review_data: CustomTestReview,
    db: Session = Depends(get_db),
):
    test_request = (
        db.query(TestRequest).filter(TestRequest.request_id == request_id).first()
    )

    if test_request is None:
        raise HTTPException(
            status_code=404,
            detail="Test request not found.",
        )

    if test_request.test_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Only custom test requests can use this review endpoint.",
        )

    if test_request.status != "Pending Approval":
        raise HTTPException(
            status_code=400,
            detail="Only pending custom test requests can be reviewed.",
        )

    if review_data.decision == "approve":
        test_request.status = "Requested"
    else:
        test_request.status = "Rejected"

    db.commit()
    db.refresh(test_request)

    return test_request
