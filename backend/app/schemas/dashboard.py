from datetime import datetime

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_reports: int
    active_reports: int
    total_executions: int
    total_shared_reports: int


class RecentReportResponse(BaseModel):
    id: int
    report_id: int
    report_name: str
    executed_by: int | None
    executed_at: datetime
    status: str


class FrequentlyUsedReportResponse(BaseModel):
    report_id: int
    report_name: str
    execution_count: int


class ExecutionTrendResponse(BaseModel):
    labels: list[str]
    values: list[int]


class DashboardResponse(BaseModel):
    summary: DashboardSummaryResponse
    recent_reports: list[RecentReportResponse]
    frequently_used_reports: list[
        FrequentlyUsedReportResponse
    ]
    execution_trend: ExecutionTrendResponse