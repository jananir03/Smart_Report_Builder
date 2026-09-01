from typing import Any

from pydantic import BaseModel, Field


class AggregationRequest(BaseModel):
    field: str

    function: str


class AnalyticsQueryRequest(BaseModel):
    filters: list[dict[str, Any]] = Field(
        default_factory=list
    )

    group_by: str | None = None

    aggregations: list[AggregationRequest] = Field(
        default_factory=list
    )

    sort_by: str | None = None

    sort_order: str = "asc"

    limit: int = Field(
        default=100,
        ge=1,
        le=1000,
    )


class AnalyticsQueryResponse(BaseModel):
    report_id: int

    data_source: str

    group_by: str | None

    columns: list[str]

    rows: list[dict[str, Any]]

    total_records: int