import {
  exportReportCsv,
  exportReportExcel,
  exportReportPdf,
} from "../api/exportApi";

import type {
  ExportFormat,
  ExportRequest,
} from "../types/export";

const getFilenameFromHeaders = (
  headers: Record<string, unknown>,
  fallback: string,
): string => {
  const disposition = headers[
    "content-disposition"
  ];

  if (
    typeof disposition !== "string"
  ) {
    return fallback;
  }

  const match = disposition.match(
    /filename="?([^"]+)"?/i,
  );

  return match?.[1] || fallback;
};

const downloadBlob = (
  blob: Blob,
  filename: string,
): void => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export const exportReport = async (
  reportId: number,
  format: ExportFormat,
  payload: ExportRequest,
): Promise<void> => {
  let response;

  if (format === "csv") {
    response = await exportReportCsv(
      reportId,
      payload,
    );
  } else if (format === "excel") {
    response = await exportReportExcel(
      reportId,
      payload,
    );
  } else {
    response = await exportReportPdf(
      reportId,
      payload,
    );
  }

  const fallbackFilename =
    `report_${reportId}.${format === "excel" ? "xlsx" : format}`;

  const filename =
    getFilenameFromHeaders(
      response.headers,
      fallbackFilename,
    );

  downloadBlob(
    response.data,
    filename,
  );
};