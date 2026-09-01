import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import {
  Add,
  AssessmentOutlined,
  DeleteOutline,
  EditOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";

import {
  deleteReport,
  getReports,
} from "../services/reportService";

import type { Report } from "../types/report";

const Reports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReports();

      setReports(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load reports.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (report: Report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const handleDelete = async () => {
    if (!selectedReport) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteReport(selectedReport.id);

      setReports((current) =>
        current.filter(
          (report) =>
            report.id !== selectedReport.id,
        ),
      );

      setDeleteDialogOpen(false);
      setSelectedReport(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete the report.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenReport = (reportId: number) => {
    navigate(`/reports/${reportId}/builder`);
  };

  const handleEditReport = (reportId: number) => {
    navigate(`/reports/${reportId}/edit`);
  };

  const handleCreateReport = () => {
    navigate("/reports/create");
  };

  return (
    <Box>
      {/* Page Header */}
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
            My Reports
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 600 }}
          >
            Build, run and manage your custom reports
            from one place.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateReport}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.25,
            textTransform: "none",
            fontWeight: 700,
            boxShadow:
              "0 8px 20px rgba(63, 81, 181, 0.20)",
          }}
        >
          Create Report
        </Button>
      </Stack>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          py={10}
        >
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        /* Empty State */
        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              py: 10,
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                mx: "auto",
                mb: 3,
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #7c4dff, #42a5f5)",
                color: "white",
                boxShadow:
                  "0 12px 30px rgba(92, 70, 180, 0.20)",
              }}
            >
              <AssessmentOutlined
                sx={{ fontSize: 38 }}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight={800}
              gutterBottom
            >
              No reports yet
            </Typography>

            <Typography
              color="text.secondary"
              mb={3}
            >
              Create your first report and start
              exploring your data.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateReport}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                px: 3,
              }}
            >
              Create Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Report Cards */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {reports.map((report) => (
            <Card
              key={report.id}
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    "0 16px 35px rgba(0,0,0,0.09)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Top row */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #7c4dff, #42a5f5)",
                      color: "white",
                    }}
                  >
                    <AssessmentOutlined />
                  </Box>

                  <Chip
                    label={
                      report.is_active
                        ? "Active"
                        : "Inactive"
                    }
                    size="small"
                    color={
                      report.is_active
                        ? "success"
                        : "default"
                    }
                  />
                </Stack>

                {/* Name */}
                <Typography
                  variant="h6"
                  fontWeight={800}
                  mt={3}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {report.name}
                </Typography>

                {/* Description */}
                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    minHeight: 48,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {report.description ||
                    "No description provided."}
                </Typography>

                {/* Metadata */}
                <Stack
                  direction="row"
                  spacing={1}
                  mt={2}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={report.data_source}
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={
                      report.is_public
                        ? "Public"
                        : "Private"
                    }
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={`${report.filters?.length || 0} filters`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {/* Actions */}
                <Stack
                  direction="row"
                  spacing={1}
                  mt={3}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      <PlayArrowOutlined />
                    }
                    onClick={() =>
                      handleOpenReport(report.id)
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: 2.5,
                    }}
                  >
                    Open
                  </Button>

                  <IconButton
                    onClick={() =>
                      handleEditReport(report.id)
                    }
                    aria-label="Edit report"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                    }}
                  >
                    <EditOutlined />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      openDeleteDialog(report)
                    }
                    aria-label="Delete report"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={800}>
          Delete report?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>
              {selectedReport?.name}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;