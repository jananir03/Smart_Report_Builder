import api from "../api/axios";

import type {
  ReportSchedule,
  ScheduleCreatePayload,
  ScheduleUpdatePayload,
} from "../types/reportSchedule";

export const getSchedules = async (): Promise<ReportSchedule[]> => {
  const response = await api.get<ReportSchedule[]>(
    "/reports/schedules",
  );

  return response.data;
};

export const getSchedule = async (
  scheduleId: number,
): Promise<ReportSchedule> => {
  const response = await api.get<ReportSchedule>(
    `/reports/schedules/${scheduleId}`,
  );

  return response.data;
};

export const createSchedule = async (
  reportId: number,
  payload: ScheduleCreatePayload,
): Promise<ReportSchedule> => {
  const response = await api.post<ReportSchedule>(
    `/reports/${reportId}/schedules`,
    payload,
  );

  return response.data;
};

export const updateSchedule = async (
  scheduleId: number,
  payload: ScheduleUpdatePayload,
): Promise<ReportSchedule> => {
  const response = await api.put<ReportSchedule>(
    `/reports/schedules/${scheduleId}`,
    payload,
  );

  return response.data;
};

export const toggleSchedule = async (
  scheduleId: number,
): Promise<ReportSchedule> => {
  const response = await api.patch<ReportSchedule>(
    `/reports/schedules/${scheduleId}/toggle`,
  );

  return response.data;
};

export const deleteSchedule = async (
  scheduleId: number,
): Promise<void> => {
  await api.delete(
    `/reports/schedules/${scheduleId}`,
  );
};