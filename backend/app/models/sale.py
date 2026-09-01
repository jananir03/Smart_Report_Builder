from datetime import date

from sqlalchemy import Date, DECIMAL, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    customer_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    product_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    region: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    amount: Mapped[float] = mapped_column(
        DECIMAL(12, 2),
        nullable=False,
    )

    sale_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    salesperson: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )