export type SharePermission =
  | "VIEW"
  | "EXECUTE"
  | "EDIT";

export interface SharedReport {
  id: number;
  report_id: number;
  shared_with_user_id: number;
  permission: SharePermission;
}

export interface ShareReportPayload {
  user_id: number;
  permission: SharePermission;
}

export interface UpdateSharePermissionPayload {
  permission: SharePermission;
}

export interface ReportPermissionResponse {
  report_id: number;
  permission: SharePermission | null;
  has_access: boolean;
}