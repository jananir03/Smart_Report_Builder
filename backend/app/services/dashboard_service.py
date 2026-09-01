from collections import defaultdict

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.report_history import ReportHistory
from app.models.shared_report import SharedReport


def get_dashboard_summary(
    db: Session,
    user_id: int,
) -> dict:

    total_reports = (
        db.query(func.count(Report.id))
        .filter(
            Report.owner_id == user_id
        )
        .scalar()
        or 0
    )

    active_reports = (
        db.query(func.count(Report.id))
        .filter(
            Report.owner_id == user_id,
            Report.is_active.is_(True),
        )
        .scalar()
        or 0
    )

    total_executions = (
        db.query(func.count(ReportHistory.id))
        .join(
            Report,
            Report.id == ReportHistory.report_id,
        )
        .filter(
            Report.owner_id == user_id
        )
        .scalar()
        or 0
    )

    total_shared_reports = (
        db.query(func.count(SharedReport.id))
        .join(
            Report,
            Report.id == SharedReport.report_id,
        )
        .filter(
            Report.owner_id == user_id
        )
        .scalar()
        or 0
    )

    return {
        "total_reports": total_reports,
        "active_reports": active_reports,
        "total_executions": total_executions,
        "total_shared_reports": total_shared_reports,
    }


def get_recent_reports(
    db: Session,
    user_id: int,
    limit: int = 10,
) -> list[dict]:

    records = (
        db.query(
            ReportHistory,
            Report,
        )
        .join(
            Report,
            Report.id == ReportHistory.report_id,
        )
        .filter(
            Report.owner_id == user_id
        )
        .order_by(
            ReportHistory.executed_at.desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "id": history.id,
            "report_id": report.id,
            "report_name": report.name,
            "executed_by": history.executed_by,
            "executed_at": history.executed_at,
            "status": history.status,
        }
        for history, report in records
    ]


def get_frequently_used_reports(
    db: Session,
    user_id: int,
    limit: int = 5,
) -> list[dict]:

    records = (
        db.query(
            Report.id,
            Report.name,
            func.count(
                ReportHistory.id
            ).label("execution_count"),
        )
        .join(
            ReportHistory,
            Report.id == ReportHistory.report_id,
        )
        .filter(
            Report.owner_id == user_id
        )
        .group_by(
            Report.id,
            Report.name,
        )
        .order_by(
            func.count(
                ReportHistory.id
            ).desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "report_id": record.id,
            "report_name": record.name,
            "execution_count": record.execution_count,
        }
        for record in records
    ]


def get_execution_trend(
    db: Session,
    user_id: int,
) -> dict:

    records = (
        db.query(
            ReportHistory.executed_at
        )
        .join(
            Report,
            Report.id == ReportHistory.report_id,
        )
        .filter(
            Report.owner_id == user_id
        )
        .order_by(
            ReportHistory.executed_at.asc()
        )
        .all()
    )

    monthly_counts = defaultdict(int)

    for record in records:

        executed_at = record[0]

        if executed_at is None:
            continue

        month_key = executed_at.strftime(
            "%Y-%m"
        )

        monthly_counts[month_key] += 1

    labels = sorted(
        monthly_counts.keys()
    )

    values = [
        monthly_counts[label]
        for label in labels
    ]

    return {
        "labels": labels,
        "values": values,
    }


def get_dashboard(
    db: Session,
    user_id: int,
) -> dict:

    return {
        "summary": get_dashboard_summary(
            db=db,
            user_id=user_id,
        ),
        "recent_reports": get_recent_reports(
            db=db,
            user_id=user_id,
        ),
        "frequently_used_reports": (
            get_frequently_used_reports(
                db=db,
                user_id=user_id,
            )
        ),
        "execution_trend": get_execution_trend(
            db=db,
            user_id=user_id,
        ),
    }