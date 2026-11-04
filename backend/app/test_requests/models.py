from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TestRequest(Base):
    __tablename__ = "test_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    request_id: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    sample_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("samples.id"), nullable=False
    )

    test_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("tests.id"), nullable=True
    )

    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.id"), nullable=False
    )

    custom_test_name: Mapped[str | None] = mapped_column(String(150), nullable=True)

    custom_test_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="Requested", nullable=False)

    requested_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, nullable=False
    )
