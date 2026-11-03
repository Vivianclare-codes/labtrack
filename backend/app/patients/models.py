from sqlalchemy import String, Integer, Date, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    hospital_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    sex_at_birth: Mapped[str] = mapped_column(String(20), nullable=False)
    patient_type: Mapped[str] = mapped_column(String(50), nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    home_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    clinic_or_ward: Mapped[str] = mapped_column(String(100), nullable=False)
    referring_clinician: Mapped[str] = mapped_column(String(150), nullable=False)
    clinical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    identity_verified: Mapped[bool] = mapped_column(Boolean, nullable=False)
