from datetime import datetime, time
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


if TYPE_CHECKING:
    from app.models.report import Report
    from app.models.user import User


class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id"),
        nullable=False,
        index=True,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    frequency: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    run_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    day_of_week: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    day_of_month: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    last_run_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    next_run_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
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

    report: Mapped["Report"] = relationship(
        "Report",
        back_populates="schedules",
    )

    creator: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
    )