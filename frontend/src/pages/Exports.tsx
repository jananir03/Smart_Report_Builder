import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material/Select";

import {
  DescriptionRounded,
  DownloadRounded,
  FileDownloadRounded,
  PictureAsPdfRounded,
  TableViewRounded,
} from "@mui/icons-material";

import { getReports } from "../services/reportService";
import { exportReport } from "../services/exportService";

import type { Report } from "../types/report";
import type {
  ExportFormat,
  ExportRequest,
} from "../types/export";

const Exports = () => {
  const [reports, setReports] =
    useState<Report[]>([]);

  const [selectedReportId, setSelectedReportId] =
    useState<number | "">("");

  const [format, setFormat] =
    useState<ExportFormat>("excel");

  const [sortBy, setSortBy] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("asc");

  const [limit, setLimit] =
    useState(100);

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReports();

      setReports(data);

      if (data.length > 0) {
        setSelectedReportId(data[0].id);
      }
    } catch (err: unknown) {
      const axiosError =
        err as {
          response?: {
            data?: {
              detail?: string;
            };
          };
        };

      setError(
        axiosError.response?.data?.detail ||
          "Unable to load reports.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (
    event: SelectChangeEvent<
      number | string
    >,
  ) => {
    const value = event.target.value;

    setSelectedReportId(
      value === ""
        ? ""
        : Number(value),
    );

    setSuccess("");
    setError("");
  };

  const handleFormatChange = (
    event: SelectChangeEvent,
  ) => {
    setFormat(
      event.target.value as ExportFormat,
    );

    setSuccess("");
    setError("");
  };

  const handleSortByChange = (
    event: SelectChangeEvent,
  ) => {
    setSortBy(event.target.value);

    setSuccess("");
  };

  const handleSortOrderChange = (
    event: SelectChangeEvent,
  ) => {
    setSortOrder(
      event.target.value as
        | "asc"
        | "desc",
    );

    setSuccess("");
  };

  const handleLimitChange = (
    event: SelectChangeEvent,
  ) => {
    setLimit(
      Number(event.target.value),
    );

    setSuccess("");
  };

  const getSelectedReport = () => {
    return reports.find(
      (report) =>
        report.id === selectedReportId,
    );
  };

  const handleExport = async () => {
    if (
      selectedReportId === ""
    ) {
      setError(
        "Please select a report first.",
      );
      return;
    }

    try {
      setExporting(true);
      setError("");
      setSuccess("");

      const payload: ExportRequest = {
        filters: [],
        sort_by: sortBy || null,
        sort_order: sortOrder,
        limit,
      };

      await exportReport(
        selectedReportId,
        format,
        payload,
      );

      const selectedReport =
        getSelectedReport();

      const formatLabel =
        format === "excel"
          ? "Excel"
          : format.toUpperCase();

      setSuccess(
        `${formatLabel} export for "${selectedReport?.name || "report"}" downloaded successfully.`,
      );
    } catch (err: unknown) {
      const axiosError =
        err as {
          response?: {
            data?: Blob | {
              detail?: string;
            };
          };
        };

      let message =
        "Unable to export the report.";

      const responseData =
        axiosError.response?.data;

      if (
        responseData instanceof Blob
      ) {
        try {
          const text =
            await responseData.text();

          const parsed =
            JSON.parse(text) as {
              detail?: string;
            };

          if (parsed.detail) {
            message = parsed.detail;
          }
        } catch {
          // Keep the default error.
        }
      } else if (
        responseData &&
        typeof responseData === "object" &&
        "detail" in responseData &&
        typeof responseData.detail ===
          "string"
      ) {
        message = responseData.detail;
      }

      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const selectedReport =
    getSelectedReport();

  const reportFields =
    selectedReport?.data_source ===
    "sales"
      ? [
          "id",
          "customer_name",
          "product_name",
          "category",
          "region",
          "amount",
          "sale_date",
          "salesperson",
        ]
      : selectedReport?.data_source ===
        "customers"
        ? [
            "id",
            "name",
            "email",
            "country",
            "status",
            "total_spent",
            "created_at",
          ]
        : [];

  return (
    <Box>
      {/* Header */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            gutterBottom
          >
            Export Reports
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Download your reports as CSV,
            Excel, or PDF files.
          </Typography>
        </Box>

        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #D99A9A, #E8B6A7)",
            color: "#FFFFFF",
            boxShadow:
              "0 10px 25px rgba(217, 154, 154, 0.28)",
          }}
        >
          <FileDownloadRounded
            sx={{
              fontSize: 30,
            }}
          />
        </Box>
      </Stack>

      {/* Alerts */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError("")
          }
          sx={{
            mb: 3,
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess("")
          }
          sx={{
            mb: 3,
            borderRadius: 3,
          }}
        >
          {success}
        </Alert>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          py={10}
        >
          <CircularProgress
            sx={{
              color: "#D99A9A",
            }}
          />
        </Box>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              textAlign: "center",
              py: 10,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 3,
                borderRadius: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "#FCE9E5",
                color: "#C98282",
              }}
            >
              <DescriptionRounded
                sx={{
                  fontSize: 34,
                }}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight={800}
              gutterBottom
            >
              No reports available
            </Typography>

            <Typography
              color="text.secondary"
            >
              Create a report before
              exporting it.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1.25fr 0.75fr",
            },
            gap: 3,
          }}
        >
          {/* Export configuration */}

          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 4,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                mb={1}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "#FCE9E5",
                    color: "#C98282",
                  }}
                >
                  <DownloadRounded />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Export settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Choose what you want
                    to download.
                  </Typography>
                </Box>
              </Stack>

              <Divider
                sx={{
                  my: 3,
                }}
              />

              <Stack spacing={2.5}>
                {/* Report */}

                <FormControl fullWidth>
                  <InputLabel>
                    Report
                  </InputLabel>

                  <Select
                    value={
                      selectedReportId
                    }
                    label="Report"
                    onChange={
                      handleReportChange
                    }
                  >
                    {reports.map(
                      (report) => (
                        <MenuItem
                          key={report.id}
                          value={report.id}
                        >
                          {report.name}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>

                {/* Format */}

                <FormControl fullWidth>
                  <InputLabel>
                    Export format
                  </InputLabel>

                  <Select
                    value={format}
                    label="Export format"
                    onChange={
                      handleFormatChange
                    }
                  >
                    <MenuItem value="excel">
                      Excel (.xlsx)
                    </MenuItem>

                    <MenuItem value="csv">
                      CSV (.csv)
                    </MenuItem>

                    <MenuItem value="pdf">
                      PDF (.pdf)
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Sort */}

                {reportFields.length >
                  0 && (
                  <FormControl fullWidth>
                    <InputLabel>
                      Sort by
                    </InputLabel>

                    <Select
                      value={sortBy}
                      label="Sort by"
                      onChange={
                        handleSortByChange
                      }
                    >
                      <MenuItem value="">
                        No sorting
                      </MenuItem>

                      {reportFields.map(
                        (field) => (
                          <MenuItem
                            key={field}
                            value={field}
                          >
                            {field}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>
                )}

                {/* Sort order */}

                {sortBy && (
                  <FormControl fullWidth>
                    <InputLabel>
                      Sort order
                    </InputLabel>

                    <Select
                      value={sortOrder}
                      label="Sort order"
                      onChange={
                        handleSortOrderChange
                      }
                    >
                      <MenuItem value="asc">
                        Ascending
                      </MenuItem>

                      <MenuItem value="desc">
                        Descending
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* Limit */}

                <FormControl fullWidth>
                  <InputLabel>
                    Records
                  </InputLabel>

                  <Select
                    value={String(limit)}
                    label="Records"
                    onChange={
                      handleLimitChange
                    }
                  >
                    <MenuItem value="25">
                      25 records
                    </MenuItem>

                    <MenuItem value="50">
                      50 records
                    </MenuItem>

                    <MenuItem value="100">
                      100 records
                    </MenuItem>

                    <MenuItem value="250">
                      250 records
                    </MenuItem>

                    <MenuItem value="500">
                      500 records
                    </MenuItem>

                    <MenuItem value="1000">
                      1000 records
                    </MenuItem>
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={
                    exporting ? (
                      <CircularProgress
                        size={19}
                        sx={{
                          color:
                            "#FFFFFF",
                        }}
                      />
                    ) : (
                      <DownloadRounded />
                    )
                  }
                  onClick={
                    handleExport
                  }
                  disabled={exporting}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, #D99A9A, #E4AAA0)",
                    boxShadow:
                      "0 9px 22px rgba(217, 154, 154, 0.25)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #C98989, #D99D94)",
                    },
                  }}
                >
                  {exporting
                    ? "Preparing download..."
                    : "Export Report"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Preview / information */}

          <Card
            sx={{
              background:
                "linear-gradient(145deg, #FFFDFC, #FFF5F0)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3.5,
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                gutterBottom
              >
                Export preview
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
              >
                The exported file will use
                the saved report and the
                options selected here.
              </Typography>

              {selectedReport && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor:
                        "#FFFFFF",
                      border:
                        "1px solid #F0DFDA",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Selected report
                    </Typography>

                    <Typography
                      fontWeight={800}
                      mt={0.5}
                    >
                      {
                        selectedReport.name
                      }
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={0.5}
                    >
                      Data source:{" "}
                      {
                        selectedReport.data_source
                      }
                    </Typography>
                  </Box>

                  <Stack
                    spacing={1.5}
                    mt={2}
                  >
                    <PreviewRow
                      label="Format"
                      value={
                        format ===
                        "excel"
                          ? "Excel"
                          : format.toUpperCase()
                      }
                    />

                    <PreviewRow
                      label="Records"
                      value={`Up to ${limit}`}
                    />

                    <PreviewRow
                      label="Sorting"
                      value={
                        sortBy
                          ? `${sortBy} (${sortOrder})`
                          : "None"
                      }
                    />

                    <PreviewRow
                      label="Filters"
                      value={`${selectedReport.filters?.length || 0} saved filters`}
                    />
                  </Stack>
                </>
              )}

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 3,
                  background:
                    "#FCE9E5",
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                {format ===
                  "excel" && (
                  <TableViewRounded
                    sx={{
                      color: "#C98282",
                    }}
                  />
                )}

                {format ===
                  "csv" && (
                  <DescriptionRounded
                    sx={{
                      color: "#C98282",
                    }}
                  />
                )}

                {format ===
                  "pdf" && (
                  <PictureAsPdfRounded
                    sx={{
                      color: "#C98282",
                    }}
                  />
                )}

                <Box>
                  <Typography
                    fontWeight={700}
                    fontSize={14}
                  >
                    Ready to download
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Your browser will
                    download the generated
                    file automatically.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

interface PreviewRowProps {
  label: string;
  value: string;
}

const PreviewRow = ({
  label,
  value,
}: PreviewRowProps) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      sx={{
        py: 1.2,
        borderBottom:
          "1px solid #F1E7E3",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={700}
        textAlign="right"
      >
        {value}
      </Typography>
    </Stack>
  );
};

export default Exports;