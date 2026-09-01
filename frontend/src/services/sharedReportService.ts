import api from "../api/axios";

import type {
  ReportPermissionResponse,
  SharePermission,
  ShareReportPayload,
  SharedReport,
  UpdateSharePermissionPayload,
} from "../types/sharedReport";

/* =========================================================
   SHARE A REPORT
   POST /reports/{report_id}/share
========================================================= */

export const shareReport = async (
  reportId: number,
  payload: ShareReportPayload,
): Promise<SharedReport> => {
  const response =
    await api.post<SharedReport>(
      `/reports/${reportId}/share`,
      payload,
    );

  return response.data;
};


/* =========================================================
   GET SHARES FOR A REPORT
   GET /reports/{report_id}/shares
========================================================= */

export const getReportShares = async (
  reportId: number,
): Promise<SharedReport[]> => {
  const response =
    await api.get<SharedReport[]>(
      `/reports/${reportId}/shares`,
    );

  return response.data;
};


/* =========================================================
   UPDATE SHARE PERMISSION
   PUT /reports/shares/{share_id}
========================================================= */

export const updateSharePermission = async (
  shareId: number,
  permission: SharePermission,
): Promise<SharedReport> => {
  const payload: UpdateSharePermissionPayload = {
    permission,
  };

  const response =
    await api.put<SharedReport>(
      `/reports/shares/${shareId}`,
      payload,
    );

  return response.data;
};


/* =========================================================
   REMOVE SHARE
   DELETE /reports/shares/{share_id}
========================================================= */

export const removeShare = async (
  shareId: number,
): Promise<void> => {
  await api.delete(
    `/reports/shares/${shareId}`,
  );
};


/* =========================================================
   GET REPORTS SHARED WITH CURRENT USER
   GET /reports/shared-with-me
========================================================= */

export const getSharedWithMe = async (): Promise<
  SharedReport[]
> => {
  const response =
    await api.get<SharedReport[]>(
      "/reports/shared-with-me",
    );

  return response.data;
};


/* =========================================================
   GET CURRENT USER'S PERMISSION FOR A REPORT
   GET /reports/{report_id}/permission
========================================================= */

export const getReportPermission = async (
  reportId: number,
): Promise<ReportPermissionResponse> => {
  const response =
    await api.get<ReportPermissionResponse>(
      `/reports/${reportId}/permission`,
    );

  return response.data;
};