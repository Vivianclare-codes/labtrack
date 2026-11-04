from datetime import datetime
from uuid import uuid4
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.results.models import Result
from app.test_requests.models import TestRequest

router = APIRouter()


# CREATE RESULT SCHEMA
class ResultCreate(BaseModel):
    test_request_id: int
    result_value: str
    unit: str | None = None
    reference_range: str | None = None
    interpretation: str | None = None
    comments: str | None = None
    performed_by: str


class ResultReview(BaseModel):
    decision: Literal["approve", "reject"]
    review_comments: str | None = None


class ResultUpdate(BaseModel):
    result_value: str | None = None
    unit: str | None = None
    reference_range: str | None = None
    interpretation: str | None = None
    comments: str | None = None


# RESPONSE SCHEMA
class ResultResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    result_id: str
    test_request_id: int
    result_value: str
    unit: str | None
    reference_range: str | None
    interpretation: str | None
    comments: str | None
    performed_by: str
    status: str
    created_at: datetime


# CREATE RESULT
@router.post("/", response_model=ResultResponse)
def create_result(
    result_data: ResultCreate,
    db: Session = Depends(get_db),
):
    test_request = (
        db.query(TestRequest)
        .filter(TestRequest.id == result_data.test_request_id)
        .first()
    )

    if test_request is None:
        raise HTTPException(
            status_code=404,
            detail="Test request not found.",
        )

    if test_request.status != "Processing":
        raise HTTPException(
            status_code=400,
            detail="Only test requests in Processing status can receive results.",
        )

    existing_result = (
        db.query(Result)
        .filter(Result.test_request_id == result_data.test_request_id)
        .first()
    )

    if existing_result:
        raise HTTPException(
            status_code=409,
            detail="A result already exists for this test request.",
        )

    new_result = Result(
        result_id=f"RES-{str(uuid4())[:8].upper()}",
        **result_data.model_dump(),
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return new_result


# GET ALL RESULTS
@router.get("/", response_model=list[ResultResponse])
def get_results(
    test_request_id: int | None = None,
    status: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Result)

    if test_request_id is not None:
        query = query.filter(Result.test_request_id == test_request_id)

    if status:
        query = query.filter(Result.status == status)

    return query.offset(skip).limit(limit).all()


# GET SINGLE RESULT
@router.get("/{result_id}", response_model=ResultResponse)
def get_result(
    result_id: str,
    db: Session = Depends(get_db),
):
    result = db.query(Result).filter(Result.result_id == result_id).first()

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Result not found.",
        )

    return result


# SUBMIT RESULT FOR REVIEW
@router.patch("/{result_id}/submit")
def submit_result(
    result_id: str,
    db: Session = Depends(get_db),
):
    result = db.query(Result).filter(Result.result_id == result_id).first()

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Result not found.",
        )

    if result.status != "Draft":
        raise HTTPException(
            status_code=400,
            detail="Only draft results can be submitted for review.",
        )

    result.status = "Awaiting Review"

    test_request = (
        db.query(TestRequest).filter(TestRequest.id == result.test_request_id).first()
    )

    test_request.status = "Awaiting Review"

    db.commit()
    db.refresh(result)

    return {
        "message": "Result submitted for supervisor review.",
        "result": result,
    }


@router.patch("/{result_id}/review", response_model=ResultResponse)
def review_result(
    result_id: str,
    review_data: ResultReview,
    db: Session = Depends(get_db),
):
    result = db.query(Result).filter(Result.result_id == result_id).first()

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Result not found.",
        )

    if result.status != "Awaiting Review":
        raise HTTPException(
            status_code=400,
            detail="Only results awaiting review can be reviewed.",
        )

    if review_data.decision == "reject" and not review_data.review_comments:
        raise HTTPException(
            status_code=400,
            detail="A rejection reason is required.",
        )

    test_request = (
        db.query(TestRequest).filter(TestRequest.id == result.test_request_id).first()
    )

    if review_data.decision == "approve":
        result.status = "Approved"
        test_request.status = "Completed"

    else:
        result.status = "Rejected"
        test_request.status = "Processing"

        result.comments = review_data.review_comments

    db.commit()
    db.refresh(result)

    return result


@router.patch("/{result_id}/correct", response_model=ResultResponse)
def correct_result(
    result_id: str,
    result_data: ResultUpdate,
    db: Session = Depends(get_db),
):
    result = db.query(Result).filter(Result.result_id == result_id).first()

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Result not found.",
        )

    if result.status != "Rejected":
        raise HTTPException(
            status_code=400,
            detail="Only rejected results can be corrected.",
        )

    update_data = result_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update.",
        )

    for field, value in update_data.items():
        setattr(result, field, value)

    result.status = "Draft"

    db.commit()
    db.refresh(result)

    return result
