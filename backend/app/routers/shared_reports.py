from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.shared_report import (
    ShareReportRequest,
    SharedReportResponse,
    UpdateSharePermissionRequest,
)

from app.services.shared_report_service import (
    get_report_permission,
    get_user_shared_reports,
    list_shared_users,
    remove_share,
    share_report,
    update_share_permission,
)


router = APIRouter(
    prefix="/reports",
    tags=["Report Sharing"],
)


@router.post(
    "/{report_id}/share",
    response_model=SharedReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def share(
    report_id: int,
    request_data: ShareReportRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return share_report(
        db=db,
        report_id=report_id,
        owner_id=current_user.id,
        target_user_id=request_data.user_id,
        permission=request_data.permission,
    )


@router.get(
    "/{report_id}/shares",
    response_model=list[SharedReportResponse],
)
def get_shares(
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
    return list_shared_users(
        db=db,
        report_id=report_id,
        owner_id=current_user.id,
    )


@router.put(
    "/shares/{share_id}",
    response_model=SharedReportResponse,
)
def update_permission(
    share_id: int,
    request_data: UpdateSharePermissionRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return update_share_permission(
        db=db,
        share_id=share_id,
        owner_id=current_user.id,
        permission=request_data.permission,
    )


@router.delete(
    "/shares/{share_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_share(
    share_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    remove_share(
        db=db,
        share_id=share_id,
        owner_id=current_user.id,
    )

    return None


@router.get(
    "/shared-with-me",
    response_model=list[SharedReportResponse],
)
def shared_with_me(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return get_user_shared_reports(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{report_id}/permission",
)
def get_permission(
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
    permission = get_report_permission(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    if permission is None:
        return {
            "report_id": report_id,
            "permission": None,
            "has_access": False,
        }

    return {
        "report_id": report_id,
        "permission": permission,
        "has_access": True,
    }