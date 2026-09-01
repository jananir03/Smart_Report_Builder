from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.report_filter import ReportFilter
    from app.models.report_history import ReportHistory
    from app.models.report_schedule import ReportSchedule
    from app.models.shared_report import SharedReport
    from app.models.user import User


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    data_source: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    is_public: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        "User",
        back_populates="reports",
    )

    filters: Mapped[list["ReportFilter"]] = relationship(
        "ReportFilter",
        back_populates="report",
        cascade="all, delete-orphan",
    )

    history: Mapped[list["ReportHistory"]] = relationship(
        "ReportHistory",
        back_populates="report",
        cascade="all, delete-orphan",
    )

    shared_reports: Mapped[list["SharedReport"]] = relationship(
        "SharedReport",
        back_populates="report",
        cascade="all, delete-orphan",
    )

    schedules: Mapped[list["ReportSchedule"]] = relationship(
        "ReportSchedule",
        back_populates="report",
        cascade="all, delete-orphan",
    )