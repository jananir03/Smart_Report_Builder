from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.report_schedule import ReportSchedule

from app.schemas.report_schedule import (
    ScheduleCreate,
    ScheduleUpdate,
)

from app.services.scheduler_service import (
    add_schedule_job,
    remove_schedule_job,
)

from app.services.audit_service import create_audit_log


def validate_schedule_data(schedule):

    if schedule.frequency == "WEEKLY":

        if schedule.day_of_week is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "day_of_week is required "
                    "for weekly schedules"
                ),
            )

    if schedule.frequency == "MONTHLY":

        if schedule.day_of_month is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "day_of_month is required "
                    "for monthly schedules"
                ),
            )


def get_owned_report(
    db: Session,
    report_id: int,
    user_id: int,
):

    report = (
        db.query(Report)
        .filter(
            Report.id == report_id
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if report.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only the report owner "
                "can manage schedules"
            ),
        )

    return report


def create_schedule(
    db: Session,
    report_id: int,
    user_id: int,
    data: ScheduleCreate,
):

    report = get_owned_report(
        db=db,
        report_id=report_id,
        user_id=user_id,
    )

    if not report.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot schedule an inactive report",
        )

    validate_schedule_data(data)

    schedule = ReportSchedule(
        report_id=report_id,
        created_by=user_id,
        frequency=data.frequency,
        run_time=data.run_time,
        day_of_week=data.day_of_week,
        day_of_month=data.day_of_month,
        is_active=True,
    )

    db.add(schedule)

    # Get schedule.id without committing.
    db.flush()

    try:

        job = add_schedule_job(schedule)

        if job.next_run_time:
            schedule.next_run_at = (
                job.next_run_time
            )

        create_audit_log(
            db=db,
            user_id=user_id,
            action="REPORT_SCHEDULE_CREATED",
            entity_type="REPORT_SCHEDULE",
            entity_id=schedule.id,
            description=(
                f"Schedule created for "
                f"report {report_id} "
                f"({schedule.frequency})"
            ),
        )

        db.commit()
        db.refresh(schedule)

    except Exception as exc:

        db.rollback()

        try:
            remove_schedule_job(schedule.id)
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid schedule: {exc}",
        )

    return schedule


def list_schedules(
    db: Session,
    user_id: int,
):

    return (
        db.query(ReportSchedule)
        .filter(
            ReportSchedule.created_by == user_id
        )
        .order_by(
            ReportSchedule.created_at.desc()
        )
        .all()
    )


def get_schedule(
    db: Session,
    schedule_id: int,
    user_id: int,
):

    schedule = (
        db.query(ReportSchedule)
        .filter(
            ReportSchedule.id == schedule_id,
            ReportSchedule.created_by == user_id,
        )
        .first()
    )

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    return schedule


def update_schedule(
    db: Session,
    schedule_id: int,
    user_id: int,
    data: ScheduleUpdate,
):

    schedule = get_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=user_id,
    )

    old_frequency = schedule.frequency
    old_run_time = schedule.run_time
    old_is_active = schedule.is_active

    if data.frequency is not None:
        schedule.frequency = data.frequency

    if data.run_time is not None:
        schedule.run_time = data.run_time

    if data.day_of_week is not None:
        schedule.day_of_week = data.day_of_week

    if data.day_of_month is not None:
        schedule.day_of_month = data.day_of_month

    if data.is_active is not None:
        schedule.is_active = data.is_active

    validate_schedule_data(schedule)

    remove_schedule_job(schedule.id)

    try:

        if schedule.is_active:

            job = add_schedule_job(schedule)

            if job.next_run_time:
                schedule.next_run_at = (
                    job.next_run_time
                )

        else:

            schedule.next_run_at = None

        create_audit_log(
            db=db,
            user_id=user_id,
            action="REPORT_SCHEDULE_UPDATED",
            entity_type="REPORT_SCHEDULE",
            entity_id=schedule.id,
            description=(
                f"Schedule for report "
                f"{schedule.report_id} updated. "
                f"Frequency: "
                f"{old_frequency} -> "
                f"{schedule.frequency}; "
                f"Run time: "
                f"{old_run_time} -> "
                f"{schedule.run_time}; "
                f"Active: "
                f"{old_is_active} -> "
                f"{schedule.is_active}"
            ),
        )

        db.commit()
        db.refresh(schedule)

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid schedule: {exc}",
        )

    return schedule


def delete_schedule(
    db: Session,
    schedule_id: int,
    user_id: int,
):

    schedule = get_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=user_id,
    )

    report_id = schedule.report_id
    schedule_id_value = schedule.id
    frequency = schedule.frequency

    remove_schedule_job(schedule.id)

    db.delete(schedule)

    create_audit_log(
        db=db,
        user_id=user_id,
        action="REPORT_SCHEDULE_DELETED",
        entity_type="REPORT_SCHEDULE",
        entity_id=schedule_id_value,
        description=(
            f"Schedule {schedule_id_value} "
            f"for report {report_id} deleted "
            f"({frequency})"
        ),
    )

    db.commit()

    return {
        "message": "Schedule deleted successfully"
    }


def toggle_schedule(
    db: Session,
    schedule_id: int,
    user_id: int,
):

    schedule = get_schedule(
        db=db,
        schedule_id=schedule_id,
        user_id=user_id,
    )

    old_status = schedule.is_active

    remove_schedule_job(schedule.id)

    schedule.is_active = (
        not schedule.is_active
    )

    if schedule.is_active:

        try:

            job = add_schedule_job(schedule)

            if job.next_run_time:
                schedule.next_run_at = (
                    job.next_run_time
                )

        except Exception as exc:

            schedule.is_active = False

            db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid schedule: {exc}",
            )

    else:

        schedule.next_run_at = None

    create_audit_log(
        db=db,
        user_id=user_id,
        action="REPORT_SCHEDULE_TOGGLED",
        entity_type="REPORT_SCHEDULE",
        entity_id=schedule.id,
        description=(
            f"Schedule {schedule.id} for "
            f"report {schedule.report_id} "
            f"status changed from "
            f"{old_status} to "
            f"{schedule.is_active}"
        ),
    )

    db.commit()
    db.refresh(schedule)

    return schedule
