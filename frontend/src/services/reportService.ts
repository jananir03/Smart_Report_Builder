import api from "../api/axios";

import type {
  Report,
  ReportCreatePayload,
  ReportQueryPayload,
  ReportQueryResponse,
  ReportUpdatePayload,
} from "../types/report";

export const getReports = async (): Promise<Report[]> => {
  const response = await api.get<Report[]>("/reports");

  return response.data;
};

export const getReport = async (
  reportId: number,
): Promise<Report> => {
  const response = await api.get<Report>(
    `/reports/${reportId}`,
  );

  return response.data;
};

export const createReport = async (
  payload: ReportCreatePayload,
): Promise<Report> => {
  const response = await api.post<Report>(
    "/reports",
    payload,
  );

  return response.data;
};

export const updateReport = async (
  reportId: number,
  payload: ReportUpdatePayload,
): Promise<Report> => {
  const response = await api.put<Report>(
    `/reports/${reportId}`,
    payload,
  );

  return response.data;
};

export const deleteReport = async (
  reportId: number,
): Promise<void> => {
  await api.delete(`/reports/${reportId}`);
};

export const executeReport = async (
  reportId: number,
  payload: ReportQueryPayload,
): Promise<ReportQueryResponse> => {
  const response = await api.post<ReportQueryResponse>(
    `/reports/${reportId}/execute`,
    payload,
  );

  return response.data;
};

export const addReportFilter = async (
  reportId: number,
  filter: {
    field_name: string;
    operator: string;
    value: string | number | string[];
  },
): Promise<Report> => {
  const response = await api.post<Report>(
    `/reports/${reportId}/filters`,
    filter,
  );

  return response.data;
};

export const deleteReportFilter = async (
  reportId: number,
  filterId: number,
): Promise<void> => {
  await api.delete(
    `/reports/${reportId}/filters/${filterId}`,
  );
};