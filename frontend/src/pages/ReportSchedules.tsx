import {
  AddRounded,
  CalendarMonthRounded,
  DeleteOutlineRounded,
  EditRounded,
  EventRepeatRounded,
  ScheduleRounded,
} from "@mui/icons-material";

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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";

import { getReports } from "../services/reportService";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  toggleSchedule,
  updateSchedule,
} from "../services/reportScheduleService";

import type { Report } from "../types/report";
import type {
  ReportSchedule,
  ScheduleCreatePayload,
  ScheduleFrequency,
} from "../types/reportSchedule";

const frequencies: ScheduleFrequency[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const monthDays = Array.from(
  { length: 31 },
  (_, index) => index + 1,
);

export default function ReportSchedules() {
  const [reports, setReports] = useState<Report[]>([]);
  const [schedules, setSchedules] =
    useState<ReportSchedule[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingSchedule, setEditingSchedule] =
    useState<ReportSchedule | null>(null);

  const [reportId, setReportId] = useState("");
  const [frequency, setFrequency] =
    useState<ScheduleFrequency>("DAILY");
  const [runTime, setRunTime] =
    useState("09:00");
  const [dayOfWeek, setDayOfWeek] =
    useState("");
  const [dayOfMonth, setDayOfMonth] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [reportsData, schedulesData] =
        await Promise.all([
          getReports(),
          getSchedules(),
        ]);

      setReports(reportsData);
      setSchedules(schedulesData);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load schedules.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const reportMap = useMemo(() => {
    const map = new Map<number, string>();

    reports.forEach((report) => {
      map.set(report.id, report.name);
    });

    return map;
  }, [reports]);

  const openCreateDialog = () => {
    setEditingSchedule(null);

    setReportId(
      reports.length > 0
        ? String(reports[0].id)
        : "",
    );

    setFrequency("DAILY");
    setRunTime("09:00");
    setDayOfWeek("");
    setDayOfMonth("");

    setDialogOpen(true);
  };

  const openEditDialog = (
    schedule: ReportSchedule,
  ) => {
    setEditingSchedule(schedule);

    setReportId(String(schedule.report_id));
    setFrequency(schedule.frequency);
    setRunTime(
      schedule.run_time.slice(0, 5),
    );

    setDayOfWeek(
      schedule.day_of_week === null
        ? ""
        : String(schedule.day_of_week),
    );

    setDayOfMonth(
      schedule.day_of_month === null
        ? ""
        : String(schedule.day_of_month),
    );

    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
    }
  };

  const handleFrequencyChange = (
    event: SelectChangeEvent,
  ) => {
    setFrequency(
      event.target.value as ScheduleFrequency,
    );

    if (event.target.value !== "WEEKLY") {
      setDayOfWeek("");
    }

    if (event.target.value !== "MONTHLY") {
      setDayOfMonth("");
    }
  };

  const handleSave = async () => {
    if (!reportId) {
      setError("Please select a report.");
      return;
    }

    if (!runTime) {
      setError("Please select a run time.");
      return;
    }

    if (
      frequency === "WEEKLY" &&
      dayOfWeek === ""
    ) {
      setError(
        "Please select a day of the week.",
      );
      return;
    }

    if (
      frequency === "MONTHLY" &&
      dayOfMonth === ""
    ) {
      setError(
        "Please select a day of the month.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingSchedule) {
        const updated =
          await updateSchedule(
            editingSchedule.id,
            {
              frequency,
              run_time: runTime,
              day_of_week:
                frequency === "WEEKLY"
                  ? Number(dayOfWeek)
                  : null,
              day_of_month:
                frequency === "MONTHLY"
                  ? Number(dayOfMonth)
                  : null,
            },
          );

        setSchedules((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );

        setSuccess(
          "Schedule updated successfully.",
        );
      } else {
        const payload: ScheduleCreatePayload =
          {
            frequency,
            run_time: runTime,
            day_of_week:
              frequency === "WEEKLY"
                ? Number(dayOfWeek)
                : null,
            day_of_month:
              frequency === "MONTHLY"
                ? Number(dayOfMonth)
                : null,
          };

        const created =
          await createSchedule(
            Number(reportId),
            payload,
          );

        setSchedules((current) => [
          created,
          ...current,
        ]);

        setSuccess(
          "Schedule created successfully.",
        );
      }

      setDialogOpen(false);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save schedule.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    schedule: ReportSchedule,
  ) => {
    try {
      const updated =
        await toggleSchedule(
          schedule.id,
        );

      setSchedules((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );

      setSuccess(
        updated.is_active
          ? "Schedule activated."
          : "Schedule paused.",
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to change schedule status.",
        ),
      );
    }
  };

  const handleDelete = async (
    scheduleId: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);

      setSchedules((current) =>
        current.filter(
          (item) =>
            item.id !== scheduleId,
        ),
      );

      setSuccess(
        "Schedule deleted successfully.",
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete schedule.",
        ),
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const activeCount =
    schedules.filter(
      (item) => item.is_active,
    ).length;

  const pausedCount =
    schedules.length - activeCount;

  return (
    <Box>
      {/* Header */}

      <Box sx={{ mb: 3 }}>
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
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#24213A",
                mb: 0.6,
              }}
            >
              Report Schedules
            </Typography>

            <Typography
              color="text.secondary"
            >
              Automatically generate reports
              on a schedule that works for you.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
            disabled={reports.length === 0}
            sx={{
              borderRadius: "11px",
              px: 2.2,
              py: 1.1,
              boxShadow:
                "0 7px 18px rgba(108, 92, 231, 0.20)",
            }}
          >
            Create Schedule
          </Button>
        </Stack>
      </Box>

      {/* Summary */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          size={{ xs: 12, sm: 4 }}
        >
          <SummaryCard
            icon={<EventRepeatRounded />}
            title="Total Schedules"
            value={schedules.length}
            text="Configured schedules"
          />
        </Grid>

        <Grid
          size={{ xs: 12, sm: 4 }}
        >
          <SummaryCard
            icon={<ScheduleRounded />}
            title="Active"
            value={activeCount}
            text="Currently running"
          />
        </Grid>

        <Grid
          size={{ xs: 12, sm: 4 }}
        >
          <SummaryCard
            icon={<CalendarMonthRounded />}
            title="Paused"
            value={pausedCount}
            text="Currently inactive"
          />
        </Grid>
      </Grid>

      {/* Schedule list */}

      <Card
        sx={{
          borderRadius: "18px",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            color="#24213A"
          >
            Your schedules
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2.5 }}
          >
            Manage when your reports should
            be generated automatically.
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {schedules.length === 0 ? (
            <EmptySchedules
              onCreate={openCreateDialog}
              disabled={reports.length === 0}
            />
          ) : (
            <Stack spacing={1.5}>
              {schedules.map(
                (schedule) => (
                  <ScheduleRow
                    key={schedule.id}
                    schedule={schedule}
                    reportName={
                      reportMap.get(
                        schedule.report_id,
                      ) ??
                      `Report #${schedule.report_id}`
                    }
                    onToggle={
                      handleToggle
                    }
                    onEdit={
                      openEditDialog
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                ),
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#24213A",
          }}
        >
          {editingSchedule
            ? "Edit Schedule"
            : "Create Schedule"}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.2}
            sx={{ pt: 1 }}
          >
            <FormControl fullWidth>
              <InputLabel>
                Report
              </InputLabel>

              <Select
                value={reportId}
                label="Report"
                disabled={
                  Boolean(editingSchedule)
                }
                onChange={(event) =>
                  setReportId(
                    event.target.value,
                  )
                }
              >
                {reports.map((report) => (
                  <MenuItem
                    key={report.id}
                    value={String(
                      report.id,
                    )}
                  >
                    {report.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>
                Frequency
              </InputLabel>

              <Select
                value={frequency}
                label="Frequency"
                onChange={
                  handleFrequencyChange
                }
              >
                {frequencies.map(
                  (item) => (
                    <MenuItem
                      key={item}
                      value={item}
                    >
                      {formatFrequency(
                        item,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Run Time"
              type="time"
              value={runTime}
              onChange={(event) =>
                setRunTime(
                  event.target.value,
                )
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              helperText="Time is based on the application's configured timezone."
            />

            {frequency === "WEEKLY" && (
              <FormControl fullWidth>
                <InputLabel>
                  Day of Week
                </InputLabel>

                <Select
                  value={dayOfWeek}
                  label="Day of Week"
                  onChange={(event) =>
                    setDayOfWeek(
                      event.target.value,
                    )
                  }
                >
                  {weekdays.map(
                    (day) => (
                      <MenuItem
                        key={day.value}
                        value={String(
                          day.value,
                        )}
                      >
                        {day.label}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            )}

            {frequency === "MONTHLY" && (
              <FormControl fullWidth>
                <InputLabel>
                  Day of Month
                </InputLabel>

                <Select
                  value={dayOfMonth}
                  label="Day of Month"
                  onChange={(event) =>
                    setDayOfMonth(
                      event.target.value,
                    )
                  }
                >
                  {monthDays.map(
                    (day) => (
                      <MenuItem
                        key={day}
                        value={String(
                          day,
                        )}
                      >
                        {day}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #F7F5FF, #FFF7FA)",
                border:
                  "1px solid #EAE5F5",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                color="#5B4CCC"
              >
                Schedule preview
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {buildPreview(
                  frequency,
                  runTime,
                  dayOfWeek,
                  dayOfMonth,
                )}
              </Typography>
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
            onClick={closeDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleSave()
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {saving
              ? "Saving..."
              : editingSchedule
                ? "Update Schedule"
                : "Create Schedule"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3500}
        onClose={() => setSuccess("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  text: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: "16px",
      }}
    >
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
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6C5CE7",
              background:
                "linear-gradient(135deg, #F0EDFF, #F9F1FF)",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              color="#24213A"
            >
              {value}
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 1.5,
          }}
        >
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ScheduleRow({
  schedule,
  reportName,
  onToggle,
  onEdit,
  onDelete,
}: {
  schedule: ReportSchedule;
  reportName: string;
  onToggle: (
    schedule: ReportSchedule,
  ) => Promise<void>;
  onEdit: (
    schedule: ReportSchedule,
  ) => void;
  onDelete: (
    scheduleId: number,
  ) => Promise<void>;
}) {
  return (
    <Box
      sx={{
        p: 2,
        border:
          "1px solid #ECEAF2",
        borderRadius: "14px",
        transition: "0.2s ease",
        "&:hover": {
          borderColor: "#D8D2F7",
          backgroundColor: "#FCFBFF",
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                "#F1EEFF",
              color: "#6C5CE7",
              flexShrink: 0,
            }}
          >
            <ScheduleRounded />
          </Box>

          <Box>
            <Typography
              fontWeight={800}
              color="#24213A"
            >
              {reportName}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {formatFrequency(
                schedule.frequency,
              )}{" "}
              at{" "}
              {formatTime(
                schedule.run_time,
              )}
            </Typography>

            {schedule.frequency ===
              "WEEKLY" &&
              schedule.day_of_week !==
                null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Every{" "}
                  {
                    weekdays.find(
                      (day) =>
                        day.value ===
                        schedule.day_of_week,
                    )?.label
                  }
                </Typography>
              )}

            {schedule.frequency ===
              "MONTHLY" &&
              schedule.day_of_month !==
                null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Day{" "}
                  {
                    schedule.day_of_month
                  }{" "}
                  of every month
                </Typography>
              )}
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
        >
          <Chip
            label={
              schedule.is_active
                ? "Active"
                : "Paused"
            }
            size="small"
            color={
              schedule.is_active
                ? "success"
                : "default"
            }
            sx={{
              fontWeight: 700,
            }}
          />

          <Switch
            checked={
              schedule.is_active
            }
            onChange={() =>
              void onToggle(
                schedule,
              )
            }
            inputProps={{
              "aria-label":
                "Toggle schedule",
            }}
          />

          <IconButton
            onClick={() =>
              onEdit(schedule)
            }
            sx={{
              color: "#6C5CE7",
            }}
          >
            <EditRounded />
          </IconButton>

          <IconButton
            onClick={() =>
              void onDelete(
                schedule.id,
              )
            }
            sx={{
              color: "#D95C67",
            }}
          >
            <DeleteOutlineRounded />
          </IconButton>
        </Stack>
      </Stack>

      {schedule.next_run_at && (
        <Box
          sx={{
            mt: 1.5,
            ml: {
              xs: 0,
              sm: 5.5,
            },
            px: 1.5,
            py: 1,
            borderRadius: "9px",
            backgroundColor: "#F8F7FB",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Next run:{" "}
            <strong>
              {formatDate(
                schedule.next_run_at,
              )}
            </strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function EmptySchedules({
  onCreate,
  disabled,
}: {
  onCreate: () => void;
  disabled: boolean;
}) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: "center",
        border:
          "1px dashed #DCD8E8",
        borderRadius: "15px",
        backgroundColor: "#FCFBFE",
      }}
    >
      <ScheduleRounded
        sx={{
          fontSize: 44,
          color: "#B8B2CC",
          mb: 1,
        }}
      />

      <Typography
        fontWeight={800}
        color="#3B374D"
      >
        No schedules yet
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 2 }}
      >
        Create a schedule to automatically
        generate one of your reports.
      </Typography>

      <Button
        variant="outlined"
        startIcon={<AddRounded />}
        onClick={onCreate}
        disabled={disabled}
      >
        Create Schedule
      </Button>

      {disabled && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 1,
          }}
        >
          Create a report first.
        </Typography>
      )}
    </Box>
  );
}

function formatFrequency(
  frequency: ScheduleFrequency,
) {
  return (
    frequency.charAt(0) +
    frequency.slice(1).toLowerCase()
  );
}

function formatTime(time: string) {
  const [hours, minutes] =
    time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildPreview(
  frequency: ScheduleFrequency,
  time: string,
  weekday: string,
  monthDay: string,
) {
  const formattedTime =
    time || "--:--";

  if (frequency === "WEEKLY") {
    const day = weekdays.find(
      (item) =>
        String(item.value) ===
        weekday,
    );

    return `Every ${
      day?.label ?? "selected day"
    } at ${formattedTime}`;
  }

  if (frequency === "MONTHLY") {
    return `Day ${
      monthDay || "selected day"
    } of every month at ${formattedTime}`;
  }

  return `Every day at ${formattedTime}`;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response =
      error.response;

    if (
      typeof response ===
        "object" &&
      response !== null &&
      "data" in response
    ) {
      const data =
        response.data;

      if (
        typeof data ===
          "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail ===
          "string"
      ) {
        return data.detail;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}