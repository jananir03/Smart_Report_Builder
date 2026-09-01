import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  AssessmentOutlined,
  DeleteOutline,
  EditOutlined,
  PeopleAltOutlined,
  PlayArrowOutlined,
  ShareOutlined,
} from "@mui/icons-material";

import {
  deleteReport,
  getReports,
} from "../services/reportService";

import {
  getReportShares,
  removeShare,
  shareReport,
  updateSharePermission,
} from "../services/sharedReportService";

import type {
  Report,
} from "../types/report";

import type {
  SharePermission,
  SharedReport,
} from "../types/sharedReport";


const Reports = () => {
  const navigate = useNavigate();

  const [reports, setReports] =
    useState<Report[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =====================================================
     DELETE
  ===================================================== */

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    selectedReport,
    setSelectedReport,
  ] = useState<Report | null>(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);


  /* =====================================================
     SHARE
  ===================================================== */

  const [
    shareDialogOpen,
    setShareDialogOpen,
  ] = useState(false);

  const [
    shareReportTarget,
    setShareReportTarget,
  ] = useState<Report | null>(null);

  const [
    targetUserId,
    setTargetUserId,
  ] = useState("");

  const [
    sharePermission,
    setSharePermission,
  ] = useState<SharePermission>(
    "VIEW",
  );

  const [
    sharing,
    setSharing,
  ] = useState(false);

  const [
    reportShares,
    setReportShares,
  ] = useState<SharedReport[]>([]);

  const [
    sharesLoading,
    setSharesLoading,
  ] = useState(false);

  const [
    ,
    setSelectedShare,
  ] = useState<SharedReport | null>(
    null,
  );

  const [
    permissionUpdating,
    setPermissionUpdating,
  ] = useState(false);

  const [
    removingShare,
    setRemovingShare,
  ] = useState(false);


  /* =====================================================
     LOAD REPORTS
  ===================================================== */

  useEffect(() => {
    loadReports();
  }, []);


  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getReports();

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


  /* =====================================================
     DELETE HANDLERS
  ===================================================== */

  const openDeleteDialog = (
    report: Report,
  ) => {
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

      await deleteReport(
        selectedReport.id,
      );

      setReports((current) =>
        current.filter(
          (report) =>
            report.id !==
            selectedReport.id,
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


  /* =====================================================
     SHARE DIALOG
  ===================================================== */

  const openShareDialog = async (
    report: Report,
  ) => {
    setShareReportTarget(report);
    setShareDialogOpen(true);

    setTargetUserId("");
    setSharePermission("VIEW");
    setSelectedShare(null);
    setError("");

    await loadReportShares(
      report.id,
    );
  };


  const closeShareDialog = () => {
    if (
      sharing ||
      permissionUpdating ||
      removingShare
    ) {
      return;
    }

    setShareDialogOpen(false);
    setShareReportTarget(null);
    setTargetUserId("");
    setSharePermission("VIEW");
    setReportShares([]);
    setSelectedShare(null);
  };


  const loadReportShares = async (
    reportId: number,
  ) => {
    try {
      setSharesLoading(true);

      const data =
        await getReportShares(
          reportId,
        );

      setReportShares(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load sharing details.",
      );
    } finally {
      setSharesLoading(false);
    }
  };


  const handleShare = async () => {
    if (!shareReportTarget) {
      return;
    }

    const parsedUserId =
      Number(targetUserId);

    if (
      !targetUserId.trim() ||
      !Number.isInteger(
        parsedUserId,
      ) ||
      parsedUserId <= 0
    ) {
      setError(
        "Please enter a valid user ID.",
      );

      return;
    }

    try {
      setSharing(true);
      setError("");

      const createdShare =
        await shareReport(
          shareReportTarget.id,
          {
            user_id: parsedUserId,
            permission:
              sharePermission,
          },
        );

      setReportShares(
        (current) => [
          createdShare,
          ...current,
        ],
      );

      setTargetUserId("");
      setSharePermission("VIEW");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to share the report.",
      );
    } finally {
      setSharing(false);
    }
  };


  const handlePermissionChange =
    async (
      share: SharedReport,
      permission: SharePermission,
    ) => {
      try {
        setPermissionUpdating(true);
        setError("");

        const updated =
          await updateSharePermission(
            share.id,
            permission,
          );

        setReportShares(
          (current) =>
            current.map(
              (item) =>
                item.id === share.id
                  ? updated
                  : item,
            ),
        );
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            "Unable to update permission.",
        );
      } finally {
        setPermissionUpdating(false);
      }
    };


  const handleRemoveShare =
    async (
      share: SharedReport,
    ) => {
      try {
        setRemovingShare(true);
        setError("");

        await removeShare(
          share.id,
        );

        setReportShares(
          (current) =>
            current.filter(
              (item) =>
                item.id !== share.id,
            ),
        );

        setSelectedShare(null);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            "Unable to remove sharing.",
        );
      } finally {
        setRemovingShare(false);
      }
    };


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleOpenReport = (
    reportId: number,
  ) => {
    navigate(
      `/reports/${reportId}/builder`,
    );
  };


  const handleEditReport = (
    reportId: number,
  ) => {
    navigate(
      `/reports/${reportId}/edit`,
    );
  };


  const handleCreateReport = () => {
    navigate("/reports/new");
  };


  return (
    <Box>

      {/* =================================================
          HEADER
      ================================================= */}

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
            sx={{
              maxWidth: 600,
            }}
          >
            Build, run and manage your custom
            reports from one place.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={
            handleCreateReport
          }
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.25,
            fontWeight: 700,
            boxShadow:
              "0 8px 20px rgba(63, 81, 181, 0.20)",
          }}
        >
          Create Report
        </Button>
      </Stack>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
          }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}


      {/* =================================================
          LOADING / EMPTY / REPORTS
      ================================================= */}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          py={10}
        >
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (

        <Card
          sx={{
            borderRadius: 4,
            border:
              "1px solid",
            borderColor:
              "divider",
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
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "linear-gradient(135deg, #7c4dff, #42a5f5)",
                color: "white",
              }}
            >
              <AssessmentOutlined
                sx={{
                  fontSize: 38,
                }}
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
              Create your first report and
              start exploring your data.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={
                handleCreateReport
              }
              sx={{
                borderRadius: 3,
                px: 3,
              }}
            >
              Create Your First Report
            </Button>
          </CardContent>
        </Card>

      ) : (

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
          {reports.map(
            (report) => (
              <Card
                key={report.id}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border:
                    "1px solid",
                  borderColor:
                    "divider",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",

                  "&:hover": {
                    transform:
                      "translateY(-4px)",
                    boxShadow:
                      "0 16px 35px rgba(0,0,0,0.09)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                  }}
                >

                  {/* Top */}

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
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "linear-gradient(135deg, #7c4dff, #42a5f5)",
                        color:
                          "white",
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
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
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
                      display:
                        "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient:
                        "vertical",
                      overflow:
                        "hidden",
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
                      label={
                        report.data_source
                      }
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
                        handleOpenReport(
                          report.id,
                        )
                      }
                      sx={{
                        borderRadius: 2.5,
                      }}
                    >
                      Open
                    </Button>

                    <Tooltip title="Share report">
                      <IconButton
                        onClick={() =>
                          openShareDialog(
                            report,
                          )
                        }
                        aria-label="Share report"
                        sx={{
                          border:
                            "1px solid",
                          borderColor:
                            "divider",
                          borderRadius: 2.5,
                          color:
                            "#7c3aed",
                        }}
                      >
                        <ShareOutlined />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit report">
                      <IconButton
                        onClick={() =>
                          handleEditReport(
                            report.id,
                          )
                        }
                        aria-label="Edit report"
                        sx={{
                          border:
                            "1px solid",
                          borderColor:
                            "divider",
                          borderRadius: 2.5,
                        }}
                      >
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete report">
                      <IconButton
                        color="error"
                        onClick={() =>
                          openDeleteDialog(
                            report,
                          )
                        }
                        aria-label="Delete report"
                        sx={{
                          border:
                            "1px solid",
                          borderColor:
                            "divider",
                          borderRadius: 2.5,
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                </CardContent>
              </Card>
            ),
          )}
        </Box>
      )}


      {/* =================================================
          DELETE DIALOG
      ================================================= */}

      <Dialog
        open={deleteDialogOpen}
        onClose={
          closeDeleteDialog
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          fontWeight={800}
        >
          Delete report?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to
            delete{" "}
            <strong>
              {selectedReport?.name}
            </strong>
            ? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={
              closeDeleteDialog
            }
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDelete
            }
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>


      {/* =================================================
          SHARE DIALOG
      ================================================= */}

      <Dialog
        open={shareDialogOpen}
        onClose={
          closeShareDialog
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            pb: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color: "white",
                background:
                  "linear-gradient(135deg, #7c3aed, #ec4899)",
              }}
            >
              <PeopleAltOutlined />
            </Box>

            <Box>
              <Typography
                fontWeight={800}
                fontSize={20}
              >
                Share Report
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {shareReportTarget?.name}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>


        <DialogContent>
          <Stack
            spacing={2.5}
            mt={1}
          >

            {/* Add user */}

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor:
                  "#F8F6FF",
                border:
                  "1px solid #E8E2FF",
              }}
            >
              <Typography
                fontWeight={700}
                mb={0.5}
              >
                Give report access
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={2}
              >
                Enter the user ID of the
                person you want to share
                this report with.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="User ID"
                  value={
                    targetUserId
                  }
                  onChange={(event) =>
                    setTargetUserId(
                      event.target.value,
                    )
                  }
                  type="number"
                  inputProps={{
                    min: 1,
                  }}
                />

                <FormControl
                  size="small"
                  sx={{
                    minWidth: 145,
                  }}
                >
                  <InputLabel>
                    Permission
                  </InputLabel>

                  <Select
                    value={
                      sharePermission
                    }
                    label="Permission"
                    onChange={(
                      event,
                    ) =>
                      setSharePermission(
                        event.target
                          .value as SharePermission,
                      )
                    }
                  >
                    <MenuItem value="VIEW">
                      View
                    </MenuItem>

                    <MenuItem value="EXECUTE">
                      Execute
                    </MenuItem>

                    <MenuItem value="EDIT">
                      Edit
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                onClick={
                  handleShare
                }
                disabled={sharing}
                sx={{
                  mt: 1.5,
                  borderRadius: 2.5,
                }}
              >
                {sharing
                  ? "Sharing..."
                  : "Share Report"}
              </Button>
            </Box>


            {/* Existing shares */}

            <Box>
              <Typography
                fontWeight={800}
                mb={1.5}
              >
                Current Access
              </Typography>

              {sharesLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  py={3}
                >
                  <CircularProgress
                    size={26}
                  />
                </Box>
              ) : reportShares.length ===
                0 ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign:
                      "center",
                    backgroundColor:
                      "#FAFAFC",
                    border:
                      "1px dashed #D8D5E2",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    This report has not
                    been shared with
                    anyone yet.
                  </Typography>
                </Box>
              ) : (
                <Stack
                  spacing={1}
                >
                  {reportShares.map(
                    (share) => (
                      <Card
                        key={
                          share.id
                        }
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          boxShadow:
                            "none",
                        }}
                      >
                        <CardContent
                          sx={{
                            "&:last-child":
                              {
                                pb: 2,
                              },
                            p: 2,
                          }}
                        >
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            spacing={1.5}
                            justifyContent="space-between"
                            alignItems={{
                              xs: "flex-start",
                              sm: "center",
                            }}
                          >
                            <Box>
                              <Typography
                                fontWeight={
                                  700
                                }
                              >
                                User #
                                {
                                  share.shared_with_user_id
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Share #
                                {
                                  share.id
                                }
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <FormControl
                                size="small"
                                sx={{
                                  minWidth: 120,
                                }}
                              >
                                <Select
                                  value={
                                    share.permission
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    handlePermissionChange(
                                      share,
                                      event
                                        .target
                                        .value as SharePermission,
                                    )
                                  }
                                  disabled={
                                    permissionUpdating
                                  }
                                >
                                  <MenuItem value="VIEW">
                                    View
                                  </MenuItem>

                                  <MenuItem value="EXECUTE">
                                    Execute
                                  </MenuItem>

                                  <MenuItem value="EDIT">
                                    Edit
                                  </MenuItem>
                                </Select>
                              </FormControl>

                              <IconButton
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleRemoveShare(
                                    share,
                                  )
                                }
                                disabled={
                                  removingShare
                                }
                                aria-label="Remove share"
                              >
                                <DeleteOutline />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={
              closeShareDialog
            }
            disabled={
              sharing ||
              permissionUpdating ||
              removingShare
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};


export default Reports;