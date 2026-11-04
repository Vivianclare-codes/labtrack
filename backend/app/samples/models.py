from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class Sample(Base):
    __tablename__ = "samples"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sample_id: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    patient_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("patients.id"), nullable=False
    )
    sample_type: Mapped[str] = mapped_column(String(100), nullable=False)
    collection_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    received_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    sample_condition: Mapped[str] = mapped_column(String(100), nullable=False)
    receiving_staff: Mapped[str] = mapped_column(String(150), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
