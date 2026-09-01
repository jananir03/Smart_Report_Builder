from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def get_audit_logs(
    db: Session,
    page: int = 1,
    page_size: int = DEFAULT_PAGE_SIZE,
    action: str | None = None,
    entity_type: str | None = None,
    user_id: int | None = None,
):

    if page < 1:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="page must be greater than 0",
        )

    if page_size < 1 or page_size > MAX_PAGE_SIZE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"page_size must be between "
                f"1 and {MAX_PAGE_SIZE}"
            ),
        )

    query = db.query(AuditLog)

    # -----------------------------
    # Action filter
    # -----------------------------

    if action:

        query = query.filter(
            AuditLog.action == action
        )

    # -----------------------------
    # Entity filter
    # -----------------------------

    if entity_type:

        query = query.filter(
            AuditLog.entity_type == entity_type
        )

    # -----------------------------
    # User filter
    # -----------------------------

    if user_id is not None:

        query = query.filter(
            AuditLog.user_id == user_id
        )

    # -----------------------------
    # Total records
    # -----------------------------

    total = query.count()

    # -----------------------------
    # Pagination
    # -----------------------------

    offset = (page - 1) * page_size

    logs = (
        query
        .order_by(
            AuditLog.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    total_pages = (
        ceil(total / page_size)
        if total > 0
        else 0
    )

    return {
        "logs": logs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_audit_log(
    db: Session,
    log_id: int,
):

    log = (
        db.query(AuditLog)
        .filter(
            AuditLog.id == log_id
        )
        .first()
    )

    if log is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    return log