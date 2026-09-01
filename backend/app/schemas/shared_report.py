from pydantic import BaseModel, Field


class ShareReportRequest(BaseModel):
    user_id: int

    permission: str = Field(
        default="VIEW",
        pattern="^(VIEW|EXECUTE|EDIT)$",
    )


class UpdateSharePermissionRequest(BaseModel):
    permission: str = Field(
        pattern="^(VIEW|EXECUTE|EDIT)$",
    )


class SharedReportResponse(BaseModel):
    id: int
    report_id: int
    shared_with_user_id: int
    permission: str

    class Config:
        from_attributes = True