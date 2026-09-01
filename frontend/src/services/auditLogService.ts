import api from "../api/axios";

import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogQueryParams,
} from "../types/auditLog";


export const getAuditLogs = async (
  params: AuditLogQueryParams = {},
): Promise<AuditLogListResponse> => {
  const response =
    await api.get<AuditLogListResponse>(
      "/audit-logs",
      {
        params,
      },
    );

  return response.data;
};


export const getAuditLog = async (
  logId: number,
): Promise<AuditLog> => {
  const response =
    await api.get<AuditLog>(
      `/audit-logs/${logId}`,
    );

  return response.data;
};