from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.report import (
    ReportCreate,
    ReportFilterCreate,
    ReportFilterResponse,
    ReportResponse,
    ReportUpdate,
)
from app.services.report_service import (
    add_report_filter,
    create_report,
    delete_report,
    delete_report_filter,
    get_report_by_id,
    get_user_reports,
    update_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    report_data: ReportCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return create_report(
        db,
        report_data,
        current_user.id,
    )


@router.get(
    "",
    response_model=list[ReportResponse],
)
def list_reports(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return get_user_reports(
        db,
        current_user.id,
    )


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
def get_report(
    report_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return get_report_by_id(
        db,
        report_id,
        current_user.id,
    )


@router.put(
    "/{report_id}",
    response_model=ReportResponse,
)
def update(
    report_id: int,
    report_data: ReportUpdate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return update_report(
        db,
        report_id,
        current_user.id,
        report_data,
    )


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    report_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    delete_report(
        db,
        report_id,
        current_user.id,
    )

    return None


@router.post(
    "/{report_id}/filters",
    response_model=ReportFilterResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_filter(
    report_id: int,
    filter_data: ReportFilterCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return add_report_filter(
        db,
        report_id,
        current_user.id,
        filter_data,
    )


@router.delete(
    "/{report_id}/filters/{filter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_filter(
    report_id: int,
    filter_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    delete_report_filter(
        db,
        report_id,
        filter_id,
        current_user.id,
    )

    return None