import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

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
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccessTimeRounded,
  DescriptionOutlined,
  FilterAltOutlined,
  HistoryRounded,
  PersonOutlineRounded,
  RefreshRounded,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  getAuditLog,
  getAuditLogs,
} from "../services/auditLogService";

import type {
  AuditLog,
  AuditLogQueryParams,
} from "../types/auditLog";


const PAGE_SIZE = 10;


/* =========================================================
   ERROR HELPER
========================================================= */

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
};


/* =========================================================
   DATE FORMATTER
========================================================= */

const formatDateTime = (
  value: string,
): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
};


/* =========================================================
   ACTION FORMATTER
========================================================= */

const formatAction = (
  action: string,
): string => {
  if (!action) {
    return "Unknown";
  }

  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
};


/* =========================================================
   ACTION COLOR
========================================================= */

const getActionColor = (
  action: string,
):
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default" => {
  const normalized =
    action.toUpperCase();

  if (
    normalized.includes("CREATE") ||
    normalized.includes("CREATED")
  ) {
    return "success";
  }

  if (
    normalized.includes("DELETE") ||
    normalized.includes("REMOVED") ||
    normalized.includes("CANCEL")
  ) {
    return "error";
  }

  if (
    normalized.includes("UPDATE") ||
    normalized.includes("EDIT")
  ) {
    return "info";
  }

  if (
    normalized.includes("EXPORT") ||
    normalized.includes("EXECUTE")
  ) {
    return "secondary";
  }

  if (
    normalized.includes("SHARE") ||
    normalized.includes("PERMISSION")
  ) {
    return "warning";
  }

  return "primary";
};


/* =========================================================
   MAIN PAGE
========================================================= */

export default function AuditLogs() {
  const [
    logs,
    setLogs,
  ] = useState<AuditLog[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    action,
    setAction,
  ] = useState("");

  const [
    entityType,
    setEntityType,
  ] = useState("");

  const [
    userId,
    setUserId,
  ] = useState("");

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState<AuditLogQueryParams>({});

  const [
    selectedLog,
    setSelectedLog,
  ] = useState<AuditLog | null>(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    detailError,
    setDetailError,
  ] = useState("");


  /* =======================================================
     LOAD AUDIT LOGS
  ======================================================= */

  const loadLogs = async (
    targetPage: number,
    filters: AuditLogQueryParams,
  ) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAuditLogs({
          ...filters,
          page: targetPage,
          page_size: PAGE_SIZE,
        });

      setLogs(response.logs);

      setTotal(response.total);

      setTotalPages(
        response.total_pages,
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load audit logs.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL LOAD / FILTER CHANGE
  ======================================================= */

  useEffect(() => {
    void loadLogs(
      page,
      appliedFilters,
    );
  }, [
    page,
    appliedFilters,
  ]);


  /* =======================================================
     APPLY FILTERS
  ======================================================= */

  const handleApplyFilters = () => {
    const filters: AuditLogQueryParams =
      {};

    const trimmedAction =
      action.trim();

    const trimmedEntityType =
      entityType.trim();

    const trimmedUserId =
      userId.trim();

    if (trimmedAction) {
      filters.action =
        trimmedAction;
    }

    if (trimmedEntityType) {
      filters.entity_type =
        trimmedEntityType;
    }

    if (trimmedUserId) {
      const parsedUserId =
        Number(trimmedUserId);

      if (
        !Number.isInteger(
          parsedUserId,
        ) ||
        parsedUserId <= 0
      ) {
        setError(
          "User ID must be a positive number.",
        );

        return;
      }

      filters.user_id =
        parsedUserId;
    }

    setError("");

    setPage(1);

    setAppliedFilters(
      filters,
    );
  };


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const handleClearFilters = () => {
    setAction("");
    setEntityType("");
    setUserId("");

    setError("");

    setPage(1);

    setAppliedFilters({});
  };


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    void loadLogs(
      page,
      appliedFilters,
    );
  };


  /* =======================================================
     PAGINATION
  ======================================================= */

  const handlePageChange = (
    _event: ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };


  /* =======================================================
     VIEW LOG DETAILS
  ======================================================= */

  const handleViewLog = async (
    log: AuditLog,
  ) => {
    setSelectedLog(log);

    setDetailError("");

    setDetailLoading(true);

    try {
      const latestLog =
        await getAuditLog(
          log.id,
        );

      setSelectedLog(
        latestLog,
      );
    } catch (err) {
      setDetailError(
        getErrorMessage(
          err,
          "Unable to load audit log details.",
        ),
      );
    } finally {
      setDetailLoading(false);
    }
  };


  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  const closeDetails = () => {
    if (!detailLoading) {
      setSelectedLog(null);

      setDetailError("");
    }
  };


  /* =======================================================
     PAGE STATISTICS
  ======================================================= */

  const uniqueActions =
    new Set(
      logs.map(
        (log) =>
          log.action,
      ),
    ).size;

  const uniqueEntities =
    new Set(
      logs
        .map(
          (log) =>
            log.entity_type,
        )
        .filter(Boolean),
    ).size;


  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        pb: 4,
      }}
    >

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent:
            "space-between",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
        }}
      >
        <Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #FBE6D8, #F8DCE7)",
                color: "#C76D87",
              }}
            >
              <HistoryRounded />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#3A2930",
                fontSize: {
                  xs: 25,
                  sm: 30,
                },
              }}
            >
              Audit Logs
            </Typography>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 700,
              fontSize: 14,
            }}
          >
            Review important activities
            performed across your reporting
            workspace.
          </Typography>
        </Box>


        <Button
          variant="outlined"
          startIcon={
            <RefreshRounded />
          }
          onClick={
            handleRefresh
          }
          disabled={loading}
          sx={{
            borderColor: "#E7C8D0",
            color: "#B85F7A",
            backgroundColor:
              "rgba(255,255,255,0.8)",
            borderRadius: "10px",
            fontWeight: 700,
            px: 2.2,
            "&:hover": {
              borderColor: "#DFAEBC",
              backgroundColor:
                "#FFF8F7",
            },
          }}
        >
          Refresh
        </Button>
      </Box>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 2,
          }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >

        {/* TOTAL */}

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "13px",
                    backgroundColor:
                      "#FCE8DE",
                    color: "#C97855",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HistoryRounded />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Activities
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="#3A2930"
                  >
                    {total}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>


        {/* ACTIONS */}

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "13px",
                    backgroundColor:
                      "#F9E4EA",
                    color: "#C76583",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DescriptionOutlined />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Actions on Page
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="#3A2930"
                  >
                    {uniqueActions}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>


        {/* ENTITY TYPES */}

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "13px",
                    backgroundColor:
                      "#FBEFE7",
                    color: "#C47B58",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccessTimeRounded />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Entity Types
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="#3A2930"
                  >
                    {uniqueEntities}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>


      {/* =================================================
          FILTERS
      ================================================= */}

      <Card
        sx={{
          mb: 3,
          overflow: "visible",
        }}
      >
        <CardContent>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  "#F9E4EA",
                color: "#C76583",
              }}
            >
              <FilterAltOutlined
                fontSize="small"
              />
            </Box>

            <Typography
              fontWeight={800}
              color="#3A2930"
            >
              Filter Activity
            </Typography>
          </Stack>


          <Grid
            container
            spacing={2}
            alignItems="center"
          >

            {/* ACTION */}

            <Grid
              size={{
                xs: 12,
                md: 3.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                label="Action"
                placeholder="e.g. REPORT_CREATED"
                value={action}
                onChange={(event) =>
                  setAction(
                    event.target.value,
                  )
                }
              />
            </Grid>


            {/* ENTITY */}

            <Grid
              size={{
                xs: 12,
                md: 3.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                label="Entity Type"
                placeholder="e.g. REPORT"
                value={entityType}
                onChange={(event) =>
                  setEntityType(
                    event.target.value,
                  )
                }
              />
            </Grid>


            {/* USER ID */}

            <Grid
              size={{
                xs: 12,
                md: 2,
              }}
            >
              <TextField
                fullWidth
                size="small"
                label="User ID"
                placeholder="e.g. 3"
                type="number"
                value={userId}
                onChange={(event) =>
                  setUserId(
                    event.target.value,
                  )
                }
              />
            </Grid>


            {/* BUTTONS */}

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
              >

                <Button
                  variant="contained"
                  onClick={
                    handleApplyFilters
                  }
                  startIcon={
                    <FilterAltOutlined />
                  }
                  sx={{
                    flex: 1,
                    backgroundColor:
                      "#C76583",
                    borderRadius: "10px",
                    fontWeight: 700,
                    "&:hover": {
                      backgroundColor:
                        "#B45674",
                    },
                  }}
                >
                  Apply
                </Button>


                <Button
                  variant="outlined"
                  onClick={
                    handleClearFilters
                  }
                  sx={{
                    flex: 1,
                    borderColor:
                      "#E7C8D0",
                    color: "#75656B",
                    borderRadius: "10px",
                    fontWeight: 700,
                  }}
                >
                  Clear
                </Button>

              </Stack>
            </Grid>

          </Grid>

        </CardContent>
      </Card>


      {/* =================================================
          TABLE
      ================================================= */}

      <Card>
        <CardContent
          sx={{
            p: 0,
            "&:last-child": {
              pb: 0,
            },
          }}
        >

          {/* TABLE HEADER */}

          <Box
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              py: 2.5,
              borderBottom:
                "1px solid #F0E4E5",
            }}
          >
            <Typography
              fontWeight={800}
              color="#3A2930"
            >
              Activity History
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.3 }}
            >
              Showing the latest recorded
              activities.
            </Typography>
          </Box>


          {/* LOADING */}

          {loading ? (

            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack
                spacing={1.5}
                alignItems="center"
              >
                <CircularProgress
                  size={32}
                  sx={{
                    color: "#C76583",
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Loading audit logs...
                </Typography>
              </Stack>
            </Box>

          ) : logs.length === 0 ? (

            /* EMPTY STATE */

            <Box
              sx={{
                minHeight: 320,
                px: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack
                spacing={1.5}
                alignItems="center"
                textAlign="center"
              >

                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: "17px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #FCE9E2, #F9E1EA)",
                    color: "#C76583",
                  }}
                >
                  <HistoryRounded
                    fontSize="large"
                  />
                </Box>

                <Typography
                  fontWeight={800}
                  color="#3A2930"
                >
                  No audit activity found
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: 420,
                  }}
                >
                  Try changing your filters,
                  or perform an action in the
                  application to generate a
                  new audit entry.
                </Typography>

              </Stack>
            </Box>

          ) : (

            /* TABLE */

            <>
              <TableContainer
                sx={{
                  overflowX: "auto",
                }}
              >

                <Table
                  sx={{
                    minWidth: 900,
                  }}
                >

                  <TableHead>

                    <TableRow
                      sx={{
                        backgroundColor:
                          "#FFF9F7",
                      }}
                    >

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        ID
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Action
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Entity
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        User
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Description
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Date & Time
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        View
                      </TableCell>

                    </TableRow>

                  </TableHead>


                  <TableBody>

                    {logs.map(
                      (log) => (

                        <TableRow
                          key={log.id}
                          hover
                          sx={{
                            "&:last-child td":
                              {
                                borderBottom: 0,
                              },
                          }}
                        >

                          {/* ID */}

                          <TableCell>
                            <Typography
                              fontSize={13}
                              fontWeight={700}
                              color="#514348"
                            >
                              #{log.id}
                            </Typography>
                          </TableCell>


                          {/* ACTION */}

                          <TableCell>
                            <Chip
                              label={formatAction(
                                log.action,
                              )}
                              size="small"
                              color={getActionColor(
                                log.action,
                              )}
                              sx={{
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>


                          {/* ENTITY */}

                          <TableCell>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >

                              <Typography
                                fontSize={13}
                                fontWeight={700}
                                color="#514348"
                              >
                                {log.entity_type ||
                                  "—"}
                              </Typography>

                              {log.entity_id !==
                                null && (
                                <Chip
                                  label={`#${log.entity_id}`}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: 11,
                                    backgroundColor:
                                      "#F9E9EC",
                                    color:
                                      "#8D6874",
                                  }}
                                />
                              )}

                            </Stack>

                          </TableCell>


                          {/* USER */}

                          <TableCell>

                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                            >

                              <PersonOutlineRounded
                                sx={{
                                  fontSize: 18,
                                  color:
                                    "#A28F96",
                                }}
                              />

                              <Typography
                                fontSize={13}
                                fontWeight={600}
                                color="#514348"
                              >
                                {log.user_id !==
                                null
                                  ? `User ${log.user_id}`
                                  : "System"}
                              </Typography>

                            </Stack>

                          </TableCell>


                          {/* DESCRIPTION */}

                          <TableCell
                            sx={{
                              maxWidth: 330,
                            }}
                          >

                            <Tooltip
                              title={
                                log.description ||
                                "No description"
                              }
                              placement="top"
                            >

                              <Typography
                                fontSize={13}
                                color="#756A70"
                                noWrap
                              >
                                {log.description ||
                                  "No description"}
                              </Typography>

                            </Tooltip>

                          </TableCell>


                          {/* DATE */}

                          <TableCell>

                            <Typography
                              fontSize={12.5}
                              color="#756A70"
                              sx={{
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatDateTime(
                                log.created_at,
                              )}
                            </Typography>

                          </TableCell>


                          {/* VIEW */}

                          <TableCell align="center">

                            <Tooltip
                              title="View details"
                            >

                              <IconButton
                                onClick={() =>
                                  void handleViewLog(
                                    log,
                                  )
                                }
                                sx={{
                                  color:
                                    "#C76583",
                                  backgroundColor:
                                    "#FCEEF1",
                                  "&:hover": {
                                    backgroundColor:
                                      "#F8DDE4",
                                  },
                                }}
                              >

                                <VisibilityOutlined
                                  fontSize="small"
                                />

                              </IconButton>

                            </Tooltip>

                          </TableCell>

                        </TableRow>

                      ),
                    )}

                  </TableBody>

                </Table>

              </TableContainer>


              {/* PAGINATION */}

              <Divider />

              <Box
                sx={{
                  px: {
                    xs: 2,
                    sm: 3,
                  },
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: 2,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {total === 0
                    ? "No records"
                    : `Page ${page} of ${totalPages} • ${total} total records`}
                </Typography>


                {totalPages > 1 && (

                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={
                      handlePageChange
                    }
                    color="primary"
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root.Mui-selected":
                        {
                          backgroundColor:
                            "#C76583",
                          color: "#FFFFFF",
                        },

                      "& .MuiPaginationItem-root.Mui-selected:hover":
                        {
                          backgroundColor:
                            "#B45674",
                        },
                    }}
                  />

                )}

              </Box>

            </>

          )}

        </CardContent>
      </Card>


      {/* =================================================
          DETAIL DIALOG
      ================================================= */}

      <Dialog
        open={selectedLog !== null}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#3A2930",
            borderBottom:
              "1px solid #F0E4E5",
          }}
        >
          Audit Log Details
        </DialogTitle>


        <DialogContent
          dividers
          sx={{
            backgroundColor:
              "#FFFDFC",
          }}
        >

          {/* DETAIL LOADING */}

          {detailLoading ? (

            <Box
              sx={{
                minHeight: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <CircularProgress
                sx={{
                  color: "#C76583",
                }}
              />

            </Box>

          ) : detailError ? (

            /* DETAIL ERROR */

            <Alert severity="error">
              {detailError}
            </Alert>

          ) : selectedLog ? (

            /* DETAILS */

            <Stack spacing={2.5}>

              {/* ACTION */}

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #FFF4EF, #FFF0F4)",
                  border:
                    "1px solid #F4DDE1",
                }}
              >

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Action
                </Typography>

                <Box sx={{ mt: 0.7 }}>

                  <Chip
                    label={formatAction(
                      selectedLog.action,
                    )}
                    color={getActionColor(
                      selectedLog.action,
                    )}
                    sx={{
                      fontWeight: 700,
                    }}
                  />

                </Box>

              </Box>


              {/* BASIC DETAILS */}

              <Grid
                container
                spacing={2}
              >

                {/* LOG ID */}

                <Grid
                  size={{
                    xs: 6,
                  }}
                >

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Log ID
                  </Typography>

                  <Typography
                    fontWeight={700}
                    sx={{ mt: 0.3 }}
                  >
                    #{selectedLog.id}
                  </Typography>

                </Grid>


                {/* USER ID */}

                <Grid
                  size={{
                    xs: 6,
                  }}
                >

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    User ID
                  </Typography>

                  <Typography
                    fontWeight={700}
                    sx={{ mt: 0.3 }}
                  >
                    {selectedLog.user_id !==
                    null
                      ? selectedLog.user_id
                      : "System"}
                  </Typography>

                </Grid>


                {/* ENTITY TYPE */}

                <Grid
                  size={{
                    xs: 6,
                  }}
                >

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Entity Type
                  </Typography>

                  <Typography
                    fontWeight={700}
                    sx={{ mt: 0.3 }}
                  >
                    {selectedLog.entity_type ||
                      "—"}
                  </Typography>

                </Grid>


                {/* ENTITY ID */}

                <Grid
                  size={{
                    xs: 6,
                  }}
                >

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Entity ID
                  </Typography>

                  <Typography
                    fontWeight={700}
                    sx={{ mt: 0.3 }}
                  >
                    {selectedLog.entity_id !==
                    null
                      ? `#${selectedLog.entity_id}`
                      : "—"}
                  </Typography>

                </Grid>

              </Grid>


              {/* DESCRIPTION */}

              <Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Description
                </Typography>

                <Typography
                  sx={{
                    mt: 0.7,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor:
                      "#FFF5F3",
                    border:
                      "1px solid #F3E3E2",
                    color: "#514348",
                    lineHeight: 1.6,
                  }}
                >
                  {selectedLog.description ||
                    "No description available."}
                </Typography>

              </Box>


              {/* CREATED AT */}

              <Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Created At
                </Typography>

                <Typography
                  fontWeight={600}
                  sx={{ mt: 0.3 }}
                >
                  {formatDateTime(
                    selectedLog.created_at,
                  )}
                </Typography>

              </Box>

            </Stack>

          ) : null}

        </DialogContent>


        {/* DIALOG ACTIONS */}

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >

          <Button
            onClick={closeDetails}
            variant="contained"
            sx={{
              backgroundColor:
                "#C76583",
              borderRadius: "9px",
              fontWeight: 700,
              px: 2.5,
              "&:hover": {
                backgroundColor:
                  "#B45674",
              },
            }}
          >
            Close
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}