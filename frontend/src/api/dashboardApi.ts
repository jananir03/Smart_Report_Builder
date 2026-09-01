import api from "./axios";

export interface DashboardSummary {
  total_reports: number;
  active_reports: number;
  total_executions: number;
  total_shared_reports: number;
}

export interface RecentReport {
  id: number;
  report_id: number;
  report_name: string;
  executed_by: number | null;
  executed_at: string;
  status: string;
}

export interface FrequentlyUsedReport {
  report_id: number;
  report_name: string;
  execution_count: number;
}

export interface ExecutionTrend {
  labels: string[];
  values: number[];
}

export interface DashboardResponse {
  summary: DashboardSummary;
  recent_reports: RecentReport[];
  frequently_used_reports: FrequentlyUsedReport[];
  execution_trend: ExecutionTrend;
}

export const getDashboard =
  async (): Promise<DashboardResponse> => {
    const response =
      await api.get<DashboardResponse>(
        "/dashboard"
      );

    return response.data;
  };