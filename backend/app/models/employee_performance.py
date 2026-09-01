from datetime import date

from sqlalchemy import Date, DECIMAL, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EmployeePerformance(Base):
    __tablename__ = "employee_performance"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    department: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    job_role: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    location: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    experience_years: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    projects_completed: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    performance_score: Mapped[float] = mapped_column(
        DECIMAL(3, 1),
        nullable=False,
    )

    salary: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        nullable=False,
    )

    attendance_percentage: Mapped[float] = mapped_column(
        DECIMAL(5, 2),
        nullable=False,
    )

    joining_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )