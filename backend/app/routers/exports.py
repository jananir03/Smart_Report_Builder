from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.export import ExportRequest
from app.services.export_service import (
    generate_csv,
    generate_excel,
    generate_pdf,
    get_report_data,
)


router = APIRouter(
    prefix="/reports",
    tags=["Report Export"],
)


@router.post(
    "/{report_id}/export/csv",
)
def export_csv(
    report_id: int,
    request_data: ExportRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    result = get_report_data(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        filters=request_data.filters,
        sort_by=request_data.sort_by,
        sort_order=request_data.sort_order,
        limit=request_data.limit,
    )

    file = generate_csv(
        rows=result["rows"],
        columns=result["columns"],
    )

    return StreamingResponse(
        file,
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                f'attachment; '
                f'filename="report_{report_id}.csv"'
            )
        },
    )


@router.post(
    "/{report_id}/export/excel",
)
def export_excel(
    report_id: int,
    request_data: ExportRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    result = get_report_data(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        filters=request_data.filters,
        sort_by=request_data.sort_by,
        sort_order=request_data.sort_order,
        limit=request_data.limit,
    )

    file = generate_excel(
        rows=result["rows"],
        columns=result["columns"],
    )

    return StreamingResponse(
        file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; '
                f'filename="report_{report_id}.xlsx"'
            )
        },
    )


@router.post(
    "/{report_id}/export/pdf",
)
def export_pdf(
    report_id: int,
    request_data: ExportRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    result = get_report_data(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        filters=request_data.filters,
        sort_by=request_data.sort_by,
        sort_order=request_data.sort_order,
        limit=request_data.limit,
    )

    file = generate_pdf(
        rows=result["rows"],
        columns=result["columns"],
    )

    return StreamingResponse(
        file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; '
                f'filename="report_{report_id}.pdf"'
            )
        },
    )