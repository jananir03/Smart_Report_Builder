from pydantic import BaseModel


class ExportRequest(BaseModel):
    filters: list[dict] = []
    sort_by: str | None = None
    sort_order: str = "asc"
    limit: int = 100