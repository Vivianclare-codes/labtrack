from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.tests.models import Test
from app.departments.models import Department

router = APIRouter()


# CREATE TEST SCHEMA
class TestCreate(BaseModel):
    name: str
    code: str
    description: str | None = None
    department_id: int
    sample_type: str


# UPDATE TEST SCHEMA
class TestUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    department_id: int | None = None
    sample_type: str | None = None
    is_active: bool | None = None


# RESPONSE SCHEMA
class TestResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    code: str
    description: str | None
    department_id: int
    sample_type: str
    is_active: bool


# CREATE TEST
@router.post("/", response_model=TestResponse)
def create_test(test: TestCreate, db: Session = Depends(get_db)):

    department = (
        db.query(Department).filter(Department.id == test.department_id).first()
    )

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    new_test = Test(**test.model_dump())

    try:
        db.add(new_test)
        db.commit()
        db.refresh(new_test)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A test with this code already exists.",
        )

    return new_test


# GET ALL TESTS
@router.get("/", response_model=list[TestResponse])
def get_tests(
    search: str | None = None,
    department_id: int | None = None,
    active_only: bool = True,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Test)

    if search:
        query = query.filter(
            (Test.name.ilike("%" + search + "%"))
            | (Test.code.ilike("%" + search + "%"))
        )

    if department_id is not None:
        query = query.filter(Test.department_id == department_id)

    if active_only:
        query = query.filter(Test.is_active == True)

    tests = query.offset(skip).limit(limit).all()

    return tests


# GET SINGLE TEST
@router.get("/{test_id}", response_model=TestResponse)
def get_test(test_id: int, db: Session = Depends(get_db)):

    test = db.query(Test).filter(Test.id == test_id).first()

    if test is None:
        raise HTTPException(
            status_code=404,
            detail="Test not found.",
        )

    return test


# UPDATE TEST
@router.patch("/{test_id}", response_model=TestResponse)
def update_test(
    test_id: int,
    test_data: TestUpdate,
    db: Session = Depends(get_db),
):
    test = db.query(Test).filter(Test.id == test_id).first()

    if test is None:
        raise HTTPException(
            status_code=404,
            detail="Test not found.",
        )

    update_data = test_data.model_dump(exclude_unset=True)

    if "department_id" in update_data:
        department = (
            db.query(Department)
            .filter(Department.id == update_data["department_id"])
            .first()
        )

        if department is None:
            raise HTTPException(
                status_code=404,
                detail="Department not found.",
            )

    for field, value in update_data.items():
        setattr(test, field, value)

    try:
        db.commit()
        db.refresh(test)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A test with this code already exists.",
        )

    return test
