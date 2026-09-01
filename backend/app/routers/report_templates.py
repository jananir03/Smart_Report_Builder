from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.report import ReportResponse

from app.schemas.report_template import (
    CreateReportFromTemplateRequest,
    ReportTemplateCreate,
    ReportTemplateResponse,
    ReportTemplateUpdate,
)

from app.services.report_template_service import (
    create_report_from_template,
    create_template,
    delete_template,
    get_template_by_id,
    get_user_templates,
    update_template,
)


router = APIRouter(
    prefix="/templates",
    tags=["Report Templates"],
)


@router.post(
    "",
    response_model=ReportTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    template_data: ReportTemplateCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return create_template(
        db=db,
        template_data=template_data,
        owner_id=current_user.id,
    )


@router.get(
    "",
    response_model=list[ReportTemplateResponse],
)
def list_templates(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return get_user_templates(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{template_id}",
    response_model=ReportTemplateResponse,
)
def get_single_template(
    template_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return get_template_by_id(
        db=db,
        template_id=template_id,
        user_id=current_user.id,
    )


@router.put(
    "/{template_id}",
    response_model=ReportTemplateResponse,
)
def update(
    template_id: int,
    template_data: ReportTemplateUpdate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return update_template(
        db=db,
        template_id=template_id,
        user_id=current_user.id,
        template_data=template_data,
    )


@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    template_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    delete_template(
        db=db,
        template_id=template_id,
        user_id=current_user.id,
    )

    return None


@router.post(
    "/{template_id}/create-report",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_from_template(
    template_id: int,
    request_data: CreateReportFromTemplateRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return create_report_from_template(
        db=db,
        template_id=template_id,
        user_id=current_user.id,
        request_data=request_data,
    )