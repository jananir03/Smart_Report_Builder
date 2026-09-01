from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ReportFilterCreate(BaseModel):
    field_name: str = Field(
        min_length=1,
        max_length=100,
    )

    operator: str = Field(
        min_length=1,
        max_length=30,
    )

    value: Any


class ReportFilterResponse(BaseModel):
    id: int
    field_name: str
    operator: str
    value: Any
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReportCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )

    data_source: str = Field(
        min_length=1,
        max_length=100,
    )

    is_public: bool = False


class ReportUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )

    data_source: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    is_public: bool | None = None

    is_active: bool | None = None


class ReportResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    data_source: str
    is_public: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    filters: list[ReportFilterResponse] = []

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReportFilterUpdate(BaseModel):
    field_name: str = Field(
        min_length=1,
        max_length=100,
    )

    operator: str = Field(
        min_length=1,
        max_length=30,
    )

    value: Any

    