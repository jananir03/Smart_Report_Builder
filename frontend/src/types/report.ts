export type DataSource = "sales" | "customers";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "in";

export interface ReportFilter {
  id?: number;
  field_name: string;
  operator: FilterOperator;
  value: string | number | string[];
  created_at?: string;
}

export interface Report {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  data_source: DataSource | string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  filters: ReportFilter[];
}

export interface ReportCreatePayload {
  name: string;
  description?: string | null;
  data_source: string;
  is_public: boolean;
}

export interface ReportUpdatePayload {
  name?: string;
  description?: string | null;
  data_source?: string;
  is_public?: boolean;
  is_active?: boolean;
}

export interface ReportQueryFilter {
  field_name: string;
  operator: FilterOperator;
  value: string | number | string[];
}

export interface ReportQueryPayload {
  filters: ReportQueryFilter[];
  sort_by: string;
  sort_order: "asc" | "desc";
  group_by: string;
  limit: number;
}

export interface ReportQueryResponse {
  report_id: number;
  data_source: string;
  columns: string[];
  rows: Record<string, unknown>[];
  total_records: number;
}