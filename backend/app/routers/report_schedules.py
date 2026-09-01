from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.report_schedule import (
    ScheduleCreate,
    ScheduleResponse,
    ScheduleUpdate,
)
from app.services.report_schedule_service import (
    create_schedule,
    delete_schedule,
    get_schedule,
    list_schedules,
    toggle_schedule,
    update_schedule,
)


router = APIRouter(
    prefix="/reports",
    tags=["Report Scheduling"],
)


@router.post(
    "/{report_id}/schedules",
    response_model=ScheduleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_report_schedule(
    report_id: int,
    data: ScheduleCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return create_schedule(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        data=data,
    )


@router.get(
    "/schedules",
    response_model=list[ScheduleResponse],
)
def get_report_schedules(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return list_schedules(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/schedules/{schedule_id}",
    response_model=ScheduleResponse,
)
def get_report_schedule(
    schedule_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return get_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=current_user.id,
    )


@router.put(
    "/schedules/{schedule_id}",
    response_model=ScheduleResponse,
)
def update_report_schedule(
    schedule_id: int,
    data: ScheduleUpdate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return update_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=current_user.id,
        data=data,
    )


@router.patch(
    "/schedules/{schedule_id}/toggle",
    response_model=ScheduleResponse,
)
def toggle_report_schedule(
    schedule_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return toggle_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=current_user.id,
    )


@router.delete(
    "/schedules/{schedule_id}",
)
def delete_report_schedule(
    schedule_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return delete_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=current_user.id,
    )