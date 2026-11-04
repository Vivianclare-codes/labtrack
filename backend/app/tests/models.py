from sqlalchemy import String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Test(Base):
    __tablename__ = "tests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(150), nullable=False)

    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.id"), nullable=False
    )

    sample_type: Mapped[str] = mapped_column(String(100), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
