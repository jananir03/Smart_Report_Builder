from datetime import date

from sqlalchemy import Date, DECIMAL, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LibraryBook(Base):
    __tablename__ = "library_books"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    book_title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    author: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    publisher: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    year_published: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    copies_available: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    borrowed_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    rating: Mapped[float] = mapped_column(
        DECIMAL(3, 1),
        nullable=False,
    )

    member_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    last_borrowed_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )