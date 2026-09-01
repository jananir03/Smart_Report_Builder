export type ScheduleFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

export interface ReportSchedule {
  id: number;
  report_id: number;
  created_by: number;
  frequency: ScheduleFrequency;
  run_time: string;
  day_of_week: number | null;
  day_of_month: number | null;
  is_active: boolean;
  next_run_at: string | null;
  created_at: string;
}

export interface ScheduleCreatePayload {
  frequency: ScheduleFrequency;
  run_time: string;
  day_of_week?: number | null;
  day_of_month?: number | null;
}

export interface ScheduleUpdatePayload {
  frequency?: ScheduleFrequency;
  run_time?: string;
  day_of_week?: number | null;
  day_of_month?: number | null;
  is_active?: boolean;
}