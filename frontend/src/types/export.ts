export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportRequest {
  filters: Array<Record<string, unknown>>;
  sort_by: string | null;
  sort_order: "asc" | "desc";
  limit: number;
}