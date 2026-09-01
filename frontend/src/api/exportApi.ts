import api from "./axios";

import type { ExportRequest } from "../types/export";

export const exportReportCsv = async (
  reportId: number,
  payload: ExportRequest,
) => {
  return api.post(
    `/reports/${reportId}/export/csv`,
    payload,
    {
      responseType: "blob",
    },
  );
};

export const exportReportExcel = async (
  reportId: number,
  payload: ExportRequest,
) => {
  return api.post(
    `/reports/${reportId}/export/excel`,
    payload,
    {
      responseType: "blob",
    },
  );
};

export const exportReportPdf = async (
  reportId: number,
  payload: ExportRequest,
) => {
  return api.post(
    `/reports/${reportId}/export/pdf`,
    payload,
    {
      responseType: "blob",
    },
  );
};