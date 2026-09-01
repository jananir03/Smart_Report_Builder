from typing import Any

from pydantic import BaseModel, Field


class ReportTemplateCreate(BaseModel):
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

    configuration: dict[str, Any] = Field(
        default_factory=dict
    )


class ReportTemplateUpdate(BaseModel):
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
        max_length=100,
    )

    configuration: dict[str, Any] | None = None


class ReportTemplateResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    data_source: str
    configuration: dict[str, Any]

    class Config:
        from_attributes = True


class CreateReportFromTemplateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )

    is_public: bool = False