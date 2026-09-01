import {
  AccessTimeRounded,
  AssessmentRounded,
  CheckCircleRounded,
  ErrorOutlineRounded,
  RefreshRounded,
  ShareRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import {
  Line,
} from "react-chartjs-2";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip as ChartTooltip,
} from "chart.js";

import {
  getDashboard,
  type DashboardResponse,
} from "../api/dashboardApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  Legend
);

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: SummaryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "18px",
        border:
          "1px solid rgba(40, 35, 70, 0.07)",
        overflow: "hidden",
        position: "relative",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow:
            "0 12px 30px rgba(40, 35, 70, 0.09)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: gradient,
        }}
      />

      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 30,
                fontWeight: 800,
                color: "#28243D",
                lineHeight: 1,
              }}
            >
              {value.toLocaleString()}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 1,
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: gradient,
              color: "#FFFFFF",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatMonth(
  value: string
): string {
  if (!value) {
    return "";
  }

  const [year, month] =
    value.split("-");

  if (!year || !month) {
    return value;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  );
}

function formatDate(
  value: string
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getStatusColor(
  status: string
):
  | "success"
  | "error"
  | "warning"
  | "default" {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "success" ||
    normalized === "completed"
  ) {
    return "success";
  }

  if (
    normalized === "failed" ||
    normalized === "error"
  ) {
    return "error";
  }

  if (
    normalized === "pending" ||
    normalized === "running"
  ) {
    return "warning";
  }

  return "default";
}

export default function Dashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getDashboard();

        setDashboard(data);
      } catch (err: any) {
        console.error(
          "Dashboard loading error:",
          err
        );

        const message =
          err?.response?.data?.detail ||
          "Unable to load dashboard data.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
        >
          <CircularProgress
            size={38}
            thickness={4}
            sx={{
              color: "#6C5CE7",
            }}
          />

          <Typography
            color="text.secondary"
          >
            Loading your dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{
            borderRadius: "14px",
            mb: 2,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={
                <RefreshRounded />
              }
              onClick={loadDashboard}
            >
              Retry
            </Button>
          }
        >
          {error ||
            "Dashboard data is unavailable."}
        </Alert>
      </Box>
    );
  }

  const {
    summary,
    recent_reports,
    frequently_used_reports,
    execution_trend,
  } = dashboard;

  const chartData = {
    labels:
      execution_trend.labels.map(
        formatMonth
      ),

    datasets: [
      {
        label: "Report Executions",

        data:
          execution_trend.values,

        borderColor: "#6C5CE7",

        backgroundColor:
          "rgba(108, 92, 231, 0.10)",

        borderWidth: 3,

        tension: 0.4,

        fill: true,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor:
          "#6C5CE7",

        pointBorderWidth: 2,

        pointBorderColor:
          "#FFFFFF",
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#28243D",

        titleColor: "#FFFFFF",

        bodyColor: "#FFFFFF",

        padding: 12,

        cornerRadius: 10,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#8B8798",
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,

          color: "#8B8798",
        },

        grid: {
          color:
            "rgba(40, 35, 61, 0.07)",
        },
      },
    },
  };

  return (
    <Box>
      {/* Header */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 25,
                md: 29,
              },
              fontWeight: 800,
              color: "#28243D",
            }}
          >
            Welcome back 👋
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontSize: 14,
            }}
          >
            Here's what's happening with
            your reports.
          </Typography>
        </Box>

        <Tooltip title="Refresh dashboard">
          <IconButton
            onClick={loadDashboard}
            sx={{
              width: 42,
              height: 42,
              backgroundColor:
                "#FFFFFF",
              border:
                "1px solid #E8E5F0",

              "&:hover": {
                backgroundColor:
                  "#F3F0FF",
              },
            }}
          >
            <RefreshRounded
              sx={{
                color: "#6C5CE7",
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard
          title="Total Reports"
          value={
            summary.total_reports
          }
          subtitle="Reports you own"
          icon={
            <AssessmentRounded />
          }
          gradient="linear-gradient(135deg, #6C5CE7, #8D7FF0)"
        />

        <SummaryCard
          title="Active Reports"
          value={
            summary.active_reports
          }
          subtitle="Currently available"
          icon={
            <CheckCircleRounded />
          }
          gradient="linear-gradient(135deg, #20B486, #53CBA6)"
        />

        <SummaryCard
          title="Total Executions"
          value={
            summary.total_executions
          }
          subtitle="Report runs"
          icon={
            <TrendingUpRounded />
          }
          gradient="linear-gradient(135deg, #FF8A65, #FFB36B)"
        />

        <SummaryCard
          title="Shared Reports"
          value={
            summary.total_shared_reports
          }
          subtitle="Reports shared"
          icon={<ShareRounded />}
          gradient="linear-gradient(135deg, #E85AAD, #F58AB9)"
        />
      </Box>

      {/* Chart + Frequently Used */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.7fr) minmax(300px, 0.8fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Execution Trend */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            borderRadius: "18px",
            border:
              "1px solid rgba(40, 35, 70, 0.07)",
            backgroundColor:
              "#FFFFFF",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                fontSize={17}
                fontWeight={750}
                color="#28243D"
              >
                Execution Trend
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Report executions over time
              </Typography>
            </Box>

            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  "#F1EEFF",
              }}
            >
              <TrendingUpRounded
                sx={{
                  color: "#6C5CE7",
                  fontSize: 21,
                }}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {execution_trend.labels
              .length > 0 ? (
              <Line
                data={chartData}
                options={
                  chartOptions
                }
              />
            ) : (
              <Stack
                alignItems="center"
                spacing={1}
              >
                <TrendingUpRounded
                  sx={{
                    fontSize: 42,
                    color: "#C8C4D5",
                  }}
                />

                <Typography
                  color="text.secondary"
                  fontSize={14}
                >
                  No execution data yet
                </Typography>
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Frequently Used */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
            borderRadius: "18px",
            border:
              "1px solid rgba(40, 35, 70, 0.07)",
            backgroundColor:
              "#FFFFFF",
          }}
        >
          <Typography
            fontSize={17}
            fontWeight={750}
            color="#28243D"
          >
            Frequently Used
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Your most executed reports
          </Typography>

          <Stack
            spacing={1.5}
            sx={{
              mt: 2.5,
            }}
          >
            {frequently_used_reports
              .length > 0 ? (
              frequently_used_reports.map(
                (
                  report,
                  index
                ) => (
                  <Box
                    key={
                      report.report_id
                    }
                    sx={{
                      p: 1.5,
                      borderRadius:
                        "13px",
                      backgroundColor:
                        index === 0
                          ? "#F5F2FF"
                          : "#FAF9FC",
                      border:
                        "1px solid #F0EDF6",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          flexShrink: 0,
                          borderRadius:
                            "10px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          backgroundColor:
                            index === 0
                              ? "#6C5CE7"
                              : "#ECE9F8",
                          color:
                            index === 0
                              ? "#FFFFFF"
                              : "#6C5CE7",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {index + 1}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          fontSize={13}
                          fontWeight={700}
                          noWrap
                        >
                          {
                            report.report_name
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            report.execution_count
                          }{" "}
                          executions
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )
              )
            ) : (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                }}
              >
                <AssessmentRounded
                  sx={{
                    fontSize: 40,
                    color: "#C8C4D5",
                  }}
                />

                <Typography
                  color="text.secondary"
                  fontSize={14}
                  sx={{ mt: 1 }}
                >
                  No frequently used
                  reports yet
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Recent Reports */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: "18px",
          border:
            "1px solid rgba(40, 35, 70, 0.07)",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              sm: 2.5,
            },
            py: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                fontSize={17}
                fontWeight={750}
                color="#28243D"
              >
                Recent Reports
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Latest report executions
              </Typography>
            </Box>

            <AccessTimeRounded
              sx={{
                color: "#8E89A0",
              }}
            />
          </Stack>
        </Box>

        <Divider />

        {recent_reports.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#6F6A7E",
                      fontSize: 12,
                    }}
                  >
                    REPORT
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#6F6A7E",
                      fontSize: 12,
                    }}
                  >
                    EXECUTED BY
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#6F6A7E",
                      fontSize: 12,
                    }}
                  >
                    DATE
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#6F6A7E",
                      fontSize: 12,
                    }}
                  >
                    STATUS
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recent_reports.map(
                  (report) => (
                    <TableRow
                      key={report.id}
                      hover
                      sx={{
                        "&:last-child td":
                          {
                            borderBottom: 0,
                          },
                      }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius:
                                "9px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              backgroundColor:
                                "#F1EEFF",
                              color:
                                "#6C5CE7",
                            }}
                          >
                            <AssessmentRounded
                              sx={{
                                fontSize: 18,
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              fontSize={13}
                              fontWeight={700}
                              noWrap
                            >
                              {
                                report.report_name
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Report #
                              {
                                report.report_id
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontSize={13}
                          color="text.secondary"
                        >
                          {report.executed_by ??
                            "System"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontSize={13}
                          color="text.secondary"
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDate(
                            report.executed_at
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            report.status
                          }
                          color={getStatusColor(
                            report.status
                          )}
                          icon={
                            report.status
                              .toLowerCase() ===
                            "success" ? (
                              <CheckCircleRounded />
                            ) : report.status
                                .toLowerCase() ===
                              "failed" ? (
                              <ErrorOutlineRounded />
                            ) : undefined
                          }
                          sx={{
                            fontWeight: 650,
                            textTransform:
                              "capitalize",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              py: 7,
              textAlign: "center",
            }}
          >
            <AssessmentRounded
              sx={{
                fontSize: 46,
                color: "#C8C4D5",
              }}
            />

            <Typography
              sx={{
                mt: 1,
                fontWeight: 700,
                color: "#5F5A6D",
              }}
            >
              No recent reports
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Execute a report to see it
              appear here.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}