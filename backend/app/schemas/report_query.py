from typing import Any

from pydantic import BaseModel, Field


class ReportQueryRequest(BaseModel):
    filters: list[dict[str, Any]] = Field(
        default_factory=list
    )

    sort_by: str | None = None

    sort_order: str = "asc"

    group_by: str | None = None

    limit: int = Field(
        default=100,
        ge=1,
        le=1000,
    )


class ReportQueryResponse(BaseModel):
    report_id: int
    data_source: str
    columns: list[str]
    rows: list[dict[str, Any]]
    total_records: int