from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):

    id: int

    user_id: int | None

    action: str

    entity_type: str | None

    entity_id: int | None

    description: str | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class AuditLogListResponse(BaseModel):

    logs: list[AuditLogResponse]

    total: int

    page: int

    page_size: int

    total_pages: int