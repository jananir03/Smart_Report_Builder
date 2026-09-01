from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.report_template import ReportTemplate
from app.models.report_filter import ReportFilter

from app.schemas.report_template import (
    CreateReportFromTemplateRequest,
    ReportTemplateCreate,
    ReportTemplateUpdate,
)

from app.services.audit_service import create_audit_log


def create_template(
    db: Session,
    template_data: ReportTemplateCreate,
    owner_id: int,
) -> ReportTemplate:

    template = ReportTemplate(
        owner_id=owner_id,
        name=template_data.name,
        description=template_data.description,
        data_source=template_data.data_source,
        configuration=template_data.configuration,
    )

    db.add(template)
    db.flush()

    create_audit_log(
        db=db,
        user_id=owner_id,
        action="TEMPLATE_CREATED",
        entity_type="REPORT_TEMPLATE",
        entity_id=template.id,
        description=(
            f"Template '{template.name}' created"
        ),
    )

    db.commit()
    db.refresh(template)

    return template


def get_user_templates(
    db: Session,
    user_id: int,
) -> list[ReportTemplate]:

    result = db.execute(
        select(ReportTemplate)
        .where(
            ReportTemplate.owner_id == user_id
        )
        .order_by(
            ReportTemplate.created_at.desc()
        )
    )

    return list(
        result.scalars().all()
    )


def get_template_by_id(
    db: Session,
    template_id: int,
    user_id: int,
) -> ReportTemplate:

    template = db.execute(
        select(ReportTemplate)
        .where(
            ReportTemplate.id == template_id
        )
    ).scalar_one_or_none()

    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report template not found",
        )

    if template.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have access "
                "to this template"
            ),
        )

    return template


def update_template(
    db: Session,
    template_id: int,
    user_id: int,
    template_data: ReportTemplateUpdate,
) -> ReportTemplate:

    template = get_template_by_id(
        db=db,
        template_id=template_id,
        user_id=user_id,
    )

    update_data = template_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            template,
            field,
            value,
        )

    create_audit_log(
        db=db,
        user_id=user_id,
        action="TEMPLATE_UPDATED",
        entity_type="REPORT_TEMPLATE",
        entity_id=template.id,
        description=(
            f"Template '{template.name}' updated"
        ),
    )

    db.commit()
    db.refresh(template)

    return template


def delete_template(
    db: Session,
    template_id: int,
    user_id: int,
) -> None:

    template = get_template_by_id(
        db=db,
        template_id=template_id,
        user_id=user_id,
    )

    template_name = template.name
    template_id_value = template.id

    db.delete(template)

    create_audit_log(
        db=db,
        user_id=user_id,
        action="TEMPLATE_DELETED",
        entity_type="REPORT_TEMPLATE",
        entity_id=template_id_value,
        description=(
            f"Template '{template_name}' deleted"
        ),
    )

    db.commit()


def create_report_from_template(
    db: Session,
    template_id: int,
    user_id: int,
    request_data: CreateReportFromTemplateRequest,
) -> Report:

    template = get_template_by_id(
        db=db,
        template_id=template_id,
        user_id=user_id,
    )

    report_name = (
        request_data.name
        if request_data.name
        else template.name
    )

    report_description = (
        request_data.description
        if request_data.description
        else template.description
    )

    report = Report(
        owner_id=user_id,
        name=report_name,
        description=report_description,
        data_source=template.data_source,
        is_public=request_data.is_public,
        is_active=True,
    )

    db.add(report)
    db.flush()

    configuration = (
        template.configuration
        or {}
    )

    filters = configuration.get(
        "filters",
        []
    )

    for filter_data in filters:

        field_name = filter_data.get(
            "field_name"
        )

        operator = filter_data.get(
            "operator"
        )

        value = filter_data.get(
            "value"
        )

        if not field_name or not operator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid filter configuration "
                    "in template"
                ),
            )

        report_filter = ReportFilter(
            report_id=report.id,
            field_name=field_name,
            operator=operator,
            value=value,
        )

        db.add(report_filter)

    create_audit_log(
        db=db,
        user_id=user_id,
        action="REPORT_CREATED_FROM_TEMPLATE",
        entity_type="REPORT",
        entity_id=report.id,
        description=(
            f"Report '{report.name}' created "
            f"from template '{template.name}'"
        ),
    )

    db.commit()
    db.refresh(report)

    return report