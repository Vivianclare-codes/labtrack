from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    result_id: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    test_request_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("test_requests.id"), nullable=False
    )

    result_value: Mapped[str] = mapped_column(Text, nullable=False)

    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)

    reference_range: Mapped[str | None] = mapped_column(String(100), nullable=True)

    interpretation: Mapped[str | None] = mapped_column(String(100), nullable=True)

    comments: Mapped[str | None] = mapped_column(Text, nullable=True)

    performed_by: Mapped[str] = mapped_column(String(150), nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="Draft", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, nullable=False
    )
