from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.database import SessionLocal


scheduler = BackgroundScheduler()


def build_trigger(schedule) -> CronTrigger:

    hour = schedule.run_time.hour
    minute = schedule.run_time.minute

    if schedule.frequency == "DAILY":

        return CronTrigger(
            hour=hour,
            minute=minute,
        )

    if schedule.frequency == "WEEKLY":

        return CronTrigger(
            day_of_week=schedule.day_of_week,
            hour=hour,
            minute=minute,
        )

    if schedule.frequency == "MONTHLY":

        return CronTrigger(
            day=schedule.day_of_month,
            hour=hour,
            minute=minute,
        )

    raise ValueError(
        f"Unsupported frequency: {schedule.frequency}"
    )


def execute_scheduled_report(
    schedule_id: int,
):
    from app.models.report_history import ReportHistory
    from app.models.report_schedule import ReportSchedule

    db = SessionLocal()

    try:

        schedule = (
            db.query(ReportSchedule)
            .filter(
                ReportSchedule.id == schedule_id
            )
            .first()
        )

        if schedule is None:
            return

        if not schedule.is_active:
            return

        report = schedule.report

        if report is None:
            return

        if not report.is_active:
            return

        try:

            # Import here to avoid circular imports
            from app.services.report_query_service import (
                execute_report,
            )

            result = execute_report(
                db=db,
                report_id=report.id,
                user_id=schedule.created_by,
                filters=[],
                sort_by=None,
                sort_order="asc",
                limit=100,
            )

            history = ReportHistory(
                report_id=report.id,
                executed_by=schedule.created_by,
                status="SUCCESS",
                result_summary={
                    "scheduled": True,
                    "schedule_id": schedule.id,
                    "total_records": (
                        result.get("total_records", 0)
                        if isinstance(result, dict)
                        else 0
                    ),
                },
                executed_at=datetime.now(),
            )

            db.add(history)

            schedule.last_run_at = datetime.now()

            db.commit()

        except Exception as exc:

            history = ReportHistory(
                report_id=report.id,
                executed_by=schedule.created_by,
                status="FAILED",
                error_message=str(exc),
                result_summary={
                    "scheduled": True,
                    "schedule_id": schedule.id,
                },
                executed_at=datetime.now(),
            )

            db.add(history)

            schedule.last_run_at = datetime.now()

            db.commit()

    finally:
        db.close()


def add_schedule_job(schedule):

    job_id = f"report_schedule_{schedule.id}"

    existing_job = scheduler.get_job(job_id)

    if existing_job:
        scheduler.remove_job(job_id)

    trigger = build_trigger(schedule)

    job = scheduler.add_job(
        execute_scheduled_report,
        trigger=trigger,
        args=[schedule.id],
        id=job_id,
        replace_existing=True,
    )

    return job


def remove_schedule_job(
    schedule_id: int,
):

    job_id = f"report_schedule_{schedule_id}"

    if scheduler.get_job(job_id):

        scheduler.remove_job(job_id)


def load_active_schedules():

    from app.models.report_schedule import ReportSchedule

    db = SessionLocal()

    try:

        schedules = (
            db.query(ReportSchedule)
            .filter(
                ReportSchedule.is_active.is_(True)
            )
            .all()
        )

        for schedule in schedules:

            try:
                add_schedule_job(schedule)

            except Exception as exc:

                print(
                    f"Failed to load schedule "
                    f"{schedule.id}: {exc}"
                )

    finally:
        db.close()


def start_scheduler():

    if scheduler.running:
        return

    scheduler.start()

    load_active_schedules()

    print(
        "Report scheduler started."
    )


def shutdown_scheduler():

    if not scheduler.running:
        return

    scheduler.shutdown(
        wait=False
    )

    print(
        "Report scheduler stopped."
    )