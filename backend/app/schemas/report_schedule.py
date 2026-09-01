from datetime import datetime, time

from pydantic import BaseModel, field_validator


class ScheduleCreate(BaseModel):
    frequency: str
    run_time: time
    day_of_week: int | None = None
    day_of_month: int | None = None

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, value: str) -> str:
        value = value.upper()

        allowed = {
            "DAILY",
            "WEEKLY",
            "MONTHLY",
        }

        if value not in allowed:
            raise ValueError(
                "frequency must be DAILY, WEEKLY or MONTHLY"
            )

        return value

    @field_validator("day_of_week")
    @classmethod
    def validate_day_of_week(
        cls,
        value: int | None,
    ) -> int | None:

        if value is not None and not 0 <= value <= 6:
            raise ValueError(
                "day_of_week must be between 0 and 6"
            )

        return value

    @field_validator("day_of_month")
    @classmethod
    def validate_day_of_month(
        cls,
        value: int | None,
    ) -> int | None:

        if value is not None and not 1 <= value <= 31:
            raise ValueError(
                "day_of_month must be between 1 and 31"
            )

        return value


class ScheduleUpdate(BaseModel):
    frequency: str | None = None
    run_time: time | None = None
    day_of_week: int | None = None
    day_of_month: int | None = None
    is_active: bool | None = None

    @field_validator("frequency")
    @classmethod
    def validate_frequency(
        cls,
        value: str | None,
    ) -> str | None:

        if value is None:
            return None

        value = value.upper()

        allowed = {
            "DAILY",
            "WEEKLY",
            "MONTHLY",
        }

        if value not in allowed:
            raise ValueError(
                "frequency must be DAILY, WEEKLY or MONTHLY"
            )

        return value

    @field_validator("day_of_week")
    @classmethod
    def validate_day_of_week(
        cls,
        value: int | None,
    ) -> int | None:

        if value is not None and not 0 <= value <= 6:
            raise ValueError(
                "day_of_week must be between 0 and 6"
            )

        return value

    @field_validator("day_of_month")
    @classmethod
    def validate_day_of_month(
        cls,
        value: int | None,
    ) -> int | None:

        if value is not None and not 1 <= value <= 31:
            raise ValueError(
                "day_of_month must be between 1 and 31"
            )

        return value


class ScheduleResponse(BaseModel):
    id: int
    report_id: int
    created_by: int
    frequency: str
    run_time: time
    day_of_week: int | None
    day_of_month: int | None
    is_active: bool
    last_run_at: datetime | None
    next_run_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }