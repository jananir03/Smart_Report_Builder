from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsQueryRequest,
    AnalyticsQueryResponse,
)
from app.services.analytics_service import (
    execute_saved_analytics_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Analytics"],
)


@router.post(
    "/{report_id}/analytics",
    response_model=AnalyticsQueryResponse,
)
def execute_analytics(
    report_id: int,
    query_data: AnalyticsQueryRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return execute_saved_analytics_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        query_data=query_data,
    )