from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.audit_log import (
    AuditLogListResponse,
    AuditLogResponse,
)
from app.services.audit_log_service import (
    get_audit_log,
    get_audit_logs,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "",
    response_model=AuditLogListResponse,
)
def list_audit_logs(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    action: str | None = None,
    entity_type: str | None = None,
    user_id: int | None = None,
):

    return get_audit_logs(
        db=db,
        page=page,
        page_size=page_size,
        action=action,
        entity_type=entity_type,
        user_id=user_id,
    )


@router.get(
    "/{log_id}",
    response_model=AuditLogResponse,
)
def get_single_audit_log(
    log_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return get_audit_log(
        db=db,
        log_id=log_id,
    )