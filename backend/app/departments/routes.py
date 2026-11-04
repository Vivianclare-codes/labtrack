from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.departments.models import Department

router = APIRouter()


class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: str | None = None


class DepartmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    code: str
    description: str | None
    is_active: bool


@router.post("/", response_model=DepartmentResponse)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
):
    new_department = Department(**department.model_dump())

    try:
        db.add(new_department)
        db.commit()
        db.refresh(new_department)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A department with this name or code already exists.",
        )

    return new_department


@router.get("/", response_model=list[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    return departments


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    department = db.query(Department).filter(Department.id == department_id).first()

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    return department


@router.patch("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
):
    department = db.query(Department).filter(Department.id == department_id).first()

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    update_data = department_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(department, field, value)

    try:
        db.commit()
        db.refresh(department)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A department with this name or code already exists.",
        )

    return department
