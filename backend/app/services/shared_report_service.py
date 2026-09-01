from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.shared_report import SharedReport
from app.models.user import User

from app.services.audit_service import create_audit_log


ALLOWED_PERMISSIONS = {
    "VIEW",
    "EXECUTE",
    "EDIT",
}


def get_report(
    db: Session,
    report_id: int,
) -> Report:

    report = db.execute(
        select(Report)
        .where(
            Report.id == report_id
        )
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    return report


def verify_report_owner(
    report: Report,
    user_id: int,
):
    if report.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only the report owner "
                "can manage sharing"
            ),
        )


def get_target_user(
    db: Session,
    user_id: int,
) -> User:

    user = db.execute(
        select(User)
        .where(
            User.id == user_id
        )
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def share_report(
    db: Session,
    report_id: int,
    owner_id: int,
    target_user_id: int,
    permission: str,
) -> SharedReport:

    report = get_report(
        db=db,
        report_id=report_id,
    )

    verify_report_owner(
        report=report,
        user_id=owner_id,
    )

    permission = permission.upper()

    if permission not in ALLOWED_PERMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported permission: "
                f"{permission}"
            ),
        )

    target_user = get_target_user(
        db=db,
        user_id=target_user_id,
    )

    if target_user.id == owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "A report cannot be shared "
                "with its owner"
            ),
        )

    existing_share = db.execute(
        select(SharedReport)
        .where(
            SharedReport.report_id == report_id,
            SharedReport.shared_with_user_id
            == target_user_id,
        )
    ).scalar_one_or_none()

    if existing_share is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Report is already shared "
                "with this user"
            ),
        )

    shared_report = SharedReport(
        report_id=report_id,
        shared_with_user_id=target_user_id,
        permission=permission,
    )

    db.add(shared_report)
    db.flush()

    create_audit_log(
        db=db,
        user_id=owner_id,
        action="REPORT_SHARED",
        entity_type="SHARED_REPORT",
        entity_id=shared_report.id,
        description=(
            f"Report {report_id} shared with "
            f"user {target_user_id} with "
            f"{permission} permission"
        ),
    )

    db.commit()
    db.refresh(shared_report)

    return shared_report


def list_shared_users(
    db: Session,
    report_id: int,
    owner_id: int,
) -> list[SharedReport]:

    report = get_report(
        db=db,
        report_id=report_id,
    )

    verify_report_owner(
        report=report,
        user_id=owner_id,
    )

    result = db.execute(
        select(SharedReport)
        .where(
            SharedReport.report_id == report_id
        )
        .order_by(
            SharedReport.id.desc()
        )
    )

    return list(
        result.scalars().all()
    )


def get_shared_report(
    db: Session,
    share_id: int,
) -> SharedReport:

    shared_report = db.execute(
        select(SharedReport)
        .where(
            SharedReport.id == share_id
        )
    ).scalar_one_or_none()

    if shared_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared report record not found",
        )

    return shared_report


def update_share_permission(
    db: Session,
    share_id: int,
    owner_id: int,
    permission: str,
) -> SharedReport:

    shared_report = get_shared_report(
        db=db,
        share_id=share_id,
    )

    report = get_report(
        db=db,
        report_id=shared_report.report_id,
    )

    verify_report_owner(
        report=report,
        user_id=owner_id,
    )

    permission = permission.upper()

    if permission not in ALLOWED_PERMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported permission: "
                f"{permission}"
            ),
        )

    old_permission = shared_report.permission

    shared_report.permission = permission

    create_audit_log(
        db=db,
        user_id=owner_id,
        action="SHARE_PERMISSION_UPDATED",
        entity_type="SHARED_REPORT",
        entity_id=shared_report.id,
        description=(
            f"Permission for report "
            f"{shared_report.report_id} shared "
            f"with user "
            f"{shared_report.shared_with_user_id} "
            f"changed from {old_permission} "
            f"to {permission}"
        ),
    )

    db.commit()
    db.refresh(shared_report)

    return shared_report


def remove_share(
    db: Session,
    share_id: int,
    owner_id: int,
) -> None:

    shared_report = get_shared_report(
        db=db,
        share_id=share_id,
    )

    report = get_report(
        db=db,
        report_id=shared_report.report_id,
    )

    verify_report_owner(
        report=report,
        user_id=owner_id,
    )

    report_id = shared_report.report_id
    target_user_id = shared_report.shared_with_user_id
    permission = shared_report.permission
    share_id_value = shared_report.id

    db.delete(shared_report)

    create_audit_log(
        db=db,
        user_id=owner_id,
        action="SHARE_PERMISSION_REVOKED",
        entity_type="SHARED_REPORT",
        entity_id=share_id_value,
        description=(
            f"Sharing for report {report_id} "
            f"was revoked for user "
            f"{target_user_id}. "
            f"Previous permission: {permission}"
        ),
    )

    db.commit()


def get_user_shared_reports(
    db: Session,
    user_id: int,
) -> list[SharedReport]:

    result = db.execute(
        select(SharedReport)
        .where(
            SharedReport.shared_with_user_id
            == user_id,
        )
        .order_by(
            SharedReport.id.desc()
        )
    )

    return list(
        result.scalars().all()
    )


def get_report_permission(
    db: Session,
    report_id: int,
    user_id: int,
) -> str | None:

    report = get_report(
        db=db,
        report_id=report_id,
    )

    if report.owner_id == user_id:
        return "OWNER"

    shared_report = db.execute(
        select(SharedReport)
        .where(
            SharedReport.report_id == report_id,
            SharedReport.shared_with_user_id
            == user_id,
        )
    ).scalar_one_or_none()

    if shared_report is None:
        return None

    return shared_report.permission


def require_report_permission(
    db: Session,
    report_id: int,
    user_id: int,
    required_permission: str,
) -> Report:

    report = get_report(
        db=db,
        report_id=report_id,
    )

    if report.owner_id == user_id:
        return report

    shared_report = db.execute(
        select(SharedReport)
        .where(
            SharedReport.report_id == report_id,
            SharedReport.shared_with_user_id
            == user_id,
        )
    ).scalar_one_or_none()

    if shared_report is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have access "
                "to this report"
            ),
        )

    permission_levels = {
        "VIEW": 1,
        "EXECUTE": 2,
        "EDIT": 3,
    }

    user_permission = (
        shared_report.permission.upper()
    )

    required_permission = (
        required_permission.upper()
    )

    user_level = permission_levels.get(
        user_permission,
        0,
    )

    required_level = permission_levels.get(
        required_permission,
        0,
    )

    if user_level < required_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"{required_permission} permission "
                "is required"
            ),
        )

    return report