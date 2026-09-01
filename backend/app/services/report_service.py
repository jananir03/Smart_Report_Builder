from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.report_filter import ReportFilter
from app.schemas.report import (
    ReportCreate,
    ReportFilterCreate,
    ReportUpdate,
)
from app.services.audit_service import create_audit_log
from app.core.dependencies import get_current_user


def create_report(
    db: Session,
    report_data: ReportCreate,
    owner_id: int,
) -> Report:

    report = Report(
        owner_id=owner_id,
        name=report_data.name,
        description=report_data.description,
        data_source=report_data.data_source,
        is_public=report_data.is_public,
        is_active=True,
    )

    db.add(report)
    db.flush()

    create_audit_log(
        db=db,
        user_id=owner_id,
        action="REPORT_CREATED",
        entity_type="REPORT",
        entity_id=report.id,
        description=f"Report '{report.name}' created",
    )

    db.commit()
    db.refresh(report)

    return report


def get_user_reports(
    db: Session,
    user_id: int,
) -> list[Report]:

    result = db.execute(
        select(Report)
        .where(Report.owner_id == user_id)
        .order_by(Report.created_at.desc())
    )

    return list(result.scalars().all())


def get_report_by_id(
    db: Session,
    report_id: int,
    user_id: int,
) -> Report:

    report = db.execute(
        select(Report)
        .where(Report.id == report_id)
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if (
        report.owner_id != user_id
        and not report.is_public
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this report",
        )

    return report


def update_report(
    db: Session,
    report_id: int,
    user_id: int,
    report_data: ReportUpdate,
) -> Report:

    report = db.execute(
        select(Report)
        .where(Report.id == report_id)
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if report.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the report owner can update this report",
        )

    update_data = report_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(report, field, value)

    create_audit_log(
    db=db,
    user_id=user_id,
    action="REPORT_UPDATED",
    entity_type="REPORT",
    entity_id=report.id,
    description=f"Report '{report.name}' updated",
)

    db.commit()
    db.refresh(report)

        

    return report


def delete_report(
    db: Session,
    report_id: int,
    user_id: int,
) -> None:

    report = db.execute(
        select(Report)
        .where(Report.id == report_id)
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if report.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the report owner can delete this report",
        )

    report_name = report.name

    db.delete(report)

    create_audit_log(
        db=db,
        user_id=user_id,
        action="REPORT_DELETED",
        entity_type="REPORT",
        entity_id=report_id,
        description=f"Report '{report_name}' deleted",
    )

    db.commit()

def add_report_filter(
    db: Session,
    report_id: int,
    user_id: int,
    filter_data: ReportFilterCreate,
) -> ReportFilter:

    report = db.execute(
        select(Report)
        .where(Report.id == report_id)
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if report.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the report owner can add filters",
        )

    report_filter = ReportFilter(
        report_id=report_id,
        field_name=filter_data.field_name,
        operator=filter_data.operator,
        value=filter_data.value,
    )

    db.add(report_filter)
    db.commit()
    db.refresh(report_filter)

    return report_filter


def delete_report_filter(
    db: Session,
    report_id: int,
    filter_id: int,
    user_id: int,
) -> None:

    report = db.execute(
        select(Report)
        .where(Report.id == report_id)
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if report.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the report owner can delete filters",
        )

    report_filter = db.execute(
        select(ReportFilter)
        .where(
            ReportFilter.id == filter_id,
            ReportFilter.report_id == report_id,
        )
    ).scalar_one_or_none()

    if report_filter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Filter not found",
        )

    db.delete(report_filter)
    db.commit()