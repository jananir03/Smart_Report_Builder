from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.report import Report
    from app.models.user import User


class SharedReport(Base):
    __tablename__ = "shared_reports"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id"),
        nullable=False,
        index=True,
    )

    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    permission: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="VIEW",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    report: Mapped["Report"] = relationship(
        "Report",
        back_populates="shared_reports",
    )

    shared_with_user: Mapped["User"] = relationship(
        "User",
        back_populates="shared_reports",
        foreign_keys=[shared_with_user_id],
    )

    __table_args__ = (
        UniqueConstraint(
            "report_id",
            "shared_with_user_id",
            name="uq_report_shared_user",
        ),
    )