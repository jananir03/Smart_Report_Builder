from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.report_query import (
    ReportQueryRequest,
    ReportQueryResponse,
)
from app.services.report_query_service import (
    execute_saved_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Report Query"],
)


@router.post(
    "/{report_id}/execute",
    response_model=ReportQueryResponse,
)
def execute_report(
    report_id: int,
    query_data: ReportQueryRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return execute_saved_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        query_data=query_data,
    )