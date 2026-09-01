import api from "../api/axios";

import type {
  Report,
} from "../types/report";

/* =========================================================
   TEMPLATE TYPES
========================================================= */

export interface TemplateFilter {
  field_name: string;
  operator:
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
  value: string | number | string[];
}

export interface TemplateConfiguration {
  filters: TemplateFilter[];
  sort_by: string;
  sort_order: "asc" | "desc";
  group_by: string;
  limit: number;
}

export interface ReportTemplate {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  data_source: string;
  configuration: TemplateConfiguration;
}

export interface TemplateCreatePayload {
  name: string;
  description?: string | null;
  data_source: string;
  configuration: TemplateConfiguration;
}

export interface TemplateUpdatePayload {
  name?: string;
  description?: string | null;
  data_source?: string;
  configuration?: TemplateConfiguration;
}

export interface CreateReportFromTemplatePayload {
  name?: string | null;
  description?: string | null;
  is_public: boolean;
}


/* =========================================================
   GET ALL TEMPLATES
   GET /templates
========================================================= */

export const getTemplates = async (): Promise<
  ReportTemplate[]
> => {
  const response =
    await api.get<ReportTemplate[]>(
      "/templates",
    );

  return response.data;
};


/* =========================================================
   GET SINGLE TEMPLATE
   GET /templates/{template_id}
========================================================= */

export const getTemplate = async (
  templateId: number,
): Promise<ReportTemplate> => {
  const response =
    await api.get<ReportTemplate>(
      `/templates/${templateId}`,
    );

  return response.data;
};


/* =========================================================
   CREATE TEMPLATE
   POST /templates
========================================================= */

export const createTemplate = async (
  payload: TemplateCreatePayload,
): Promise<ReportTemplate> => {
  const response =
    await api.post<ReportTemplate>(
      "/templates",
      payload,
    );

  return response.data;
};


/* =========================================================
   UPDATE TEMPLATE
   PUT /templates/{template_id}
========================================================= */

export const updateTemplate = async (
  templateId: number,
  payload: TemplateUpdatePayload,
): Promise<ReportTemplate> => {
  const response =
    await api.put<ReportTemplate>(
      `/templates/${templateId}`,
      payload,
    );

  return response.data;
};


/* =========================================================
   DELETE TEMPLATE
   DELETE /templates/{template_id}
========================================================= */

export const deleteTemplate = async (
  templateId: number,
): Promise<void> => {
  await api.delete(
    `/templates/${templateId}`,
  );
};


/* =========================================================
   CREATE REPORT FROM TEMPLATE
   POST /templates/{template_id}/create-report
========================================================= */

export const createReportFromTemplate =
  async (
    templateId: number,
    payload: CreateReportFromTemplatePayload,
  ): Promise<Report> => {
    const response =
      await api.post<Report>(
        `/templates/${templateId}/create-report`,
        payload,
      );

    return response.data;
  };