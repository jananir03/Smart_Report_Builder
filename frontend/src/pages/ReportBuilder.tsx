import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type {
  SelectChangeEvent,
} from "@mui/material";

import {
  Add,
  ArrowBack,
  PlayArrowOutlined,
  SaveOutlined,
} from "@mui/icons-material";

import {
  createReport,
  executeReport,
  getReport,
  updateReport,
} from "../services/reportService";

import type {
  FilterOperator,
  ReportQueryPayload,
  ReportQueryResponse,
} from "../types/report";


/* =========================================================
   TYPES
========================================================= */

interface FilterRow {
  key: number;
  field_name: string;
  operator: FilterOperator;
  value: string;
}

interface DataSourceConfig {
  value: string;
  label: string;
  fields: string[];
}


/* =========================================================
   DATA SOURCE CONFIGURATION
========================================================= */

const DATA_SOURCES: DataSourceConfig[] = [
  {
    value: "sales",
    label: "Sales",
    fields: [
      "id",
      "customer_name",
      "product_name",
      "category",
      "region",
      "amount",
      "sale_date",
      "salesperson",
    ],
  },

  {
    value: "customers",
    label: "Customers",
    fields: [
      "id",
      "name",
      "email",
      "phone",
      "city",
      "country",
    ],
  },

  {
    value: "employee_performance",
    label: "Employee Performance",
    fields: [
      "id",
      "employee_name",
      "department",
      "job_role",
      "location",
      "experience_years",
      "projects_completed",
      "performance_score",
      "salary",
      "attendance_percentage",
      "joining_date",
    ],
  },

  {
    value: "library_books",
    label: "Library Books",
    fields: [
      "id",
      "book_title",
      "author",
      "category",
      "publisher",
      "year_published",
      "copies_available",
      "borrowed_count",
      "rating",
      "member_type",
      "last_borrowed_date",
    ],
  },
];


/* =========================================================
   FILTER OPERATORS
========================================================= */

const OPERATORS: {
  value: FilterOperator;
  label: string;
}[] = [
  {
    value: "equals",
    label: "Equals",
  },
  {
    value: "not_equals",
    label: "Not equals",
  },
  {
    value: "contains",
    label: "Contains",
  },
  {
    value: "starts_with",
    label: "Starts with",
  },
  {
    value: "ends_with",
    label: "Ends with",
  },
  {
    value: "greater_than",
    label: "Greater than",
  },
  {
    value: "less_than",
    label: "Less than",
  },
  {
    value: "greater_than_or_equal",
    label: "Greater than or equal",
  },
  {
    value: "less_than_or_equal",
    label: "Less than or equal",
  },
];


/* =========================================================
   HELPER
========================================================= */

const getFieldsForDataSource = (
  source: string,
): string[] => {
  const config = DATA_SOURCES.find(
    (item) => item.value === source,
  );

  return config?.fields || [];
};

const getDataSourceLabel = (
  source: string,
): string => {
  const config = DATA_SOURCES.find(
    (item) => item.value === source,
  );

  return config?.label || source;
};


/* =========================================================
   COMPONENT
========================================================= */

const ReportBuilder = () => {
  const navigate = useNavigate();

  const { reportId } = useParams<{
    reportId: string;
  }>();

  const editing = Boolean(reportId);


  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [executing, setExecuting] =
    useState(false);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  /*
   * Keep this as string instead of the old
   * DataSource union because the backend now
   * supports additional data sources.
   */
  const [dataSource, setDataSource] =
    useState<string>("sales");

  const [isPublic, setIsPublic] =
    useState(false);

  const [filters, setFilters] =
    useState<FilterRow[]>([]);

  const [sortBy, setSortBy] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  const [groupBy, setGroupBy] =
    useState("");

  const [limit, setLimit] =
    useState(100);

  const [result, setResult] =
    useState<ReportQueryResponse | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =======================================================
     CURRENT DATA SOURCE FIELDS
  ======================================================= */

  const fields = useMemo(
    () => getFieldsForDataSource(dataSource),
    [dataSource],
  );


  /* =======================================================
     LOAD EXISTING REPORT
  ======================================================= */

  useEffect(() => {
    if (editing && reportId) {
      loadReport(Number(reportId));
    }
  }, [editing, reportId]);


  const loadReport = async (
    id: number,
  ) => {
    try {
      setLoading(true);
      setError("");

      const report = await getReport(id);

      setName(report.name);

      setDescription(
        report.description || "",
      );

      setDataSource(
        report.data_source,
      );

      setIsPublic(
        report.is_public,
      );

      setFilters(
        (report.filters || []).map(
          (filter, index) => ({
            key:
              filter.id ||
              Date.now() + index,

            field_name:
              filter.field_name,

            operator:
              filter.operator,

            value:
              Array.isArray(filter.value)
                ? filter.value.join(", ")
                : String(filter.value),
          }),
        ),
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load the report.",
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     ADD FILTER
  ======================================================= */

  const addFilter = () => {
    if (fields.length === 0) {
      setError(
        "No fields are available for this data source.",
      );

      return;
    }

    setFilters((current) => [
      ...current,

      {
        key: Date.now(),

        field_name: fields[0],

        operator: "equals",

        value: "",
      },
    ]);
  };


  /* =======================================================
     UPDATE FILTER
  ======================================================= */

  const updateFilter = (
    key: number,
    property: keyof FilterRow,
    value: string,
  ) => {
    setFilters((current) =>
      current.map((filter) =>
        filter.key === key
          ? {
              ...filter,
              [property]: value,
            }
          : filter,
      ),
    );
  };


  /* =======================================================
     REMOVE FILTER
  ======================================================= */

  const removeFilter = (
    key: number,
  ) => {
    setFilters((current) =>
      current.filter(
        (filter) =>
          filter.key !== key,
      ),
    );
  };


  /* =======================================================
     DATA SOURCE CHANGE
  ======================================================= */

  const handleDataSourceChange = (
    event: SelectChangeEvent,
  ) => {
    const source =
      event.target.value;

    const sourceFields =
      getFieldsForDataSource(source);

    setDataSource(source);

    /*
     * Existing filters may belong to the
     * previous data source, so reset their
     * field to the first valid field.
     */
    setFilters((current) =>
      current.map((filter) => ({
        ...filter,

        field_name:
          sourceFields[0] || "",
      })),
    );

    setSortBy("");

    setGroupBy("");

    setResult(null);

    setError("");
  };


  /* =======================================================
     BUILD EXECUTION PAYLOAD
  ======================================================= */

  const buildQueryPayload =
    (): ReportQueryPayload => {
      return {
        filters: filters
          .filter(
            (filter) =>
              filter.field_name &&
              filter.value.trim() !== "",
          )
          .map((filter) => ({
            field_name:
              filter.field_name,

            operator:
              filter.operator,

            value:
              filter.value,
          })),

        sort_by: sortBy,

        sort_order: sortOrder,

        group_by: groupBy,

        limit,
      };
    };


  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateReport = () => {
    if (!name.trim()) {
      setError(
        "Report name is required.",
      );

      return false;
    }

    if (!dataSource) {
      setError(
        "Please select a data source.",
      );

      return false;
    }

    return true;
  };


  /* =======================================================
     SAVE REPORT
  ======================================================= */

  const handleSave = async () => {
    if (!validateReport()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (
        editing &&
        reportId
      ) {
        await updateReport(
          Number(reportId),
          {
            name: name.trim(),

            description:
              description.trim() ||
              null,

            data_source:
              dataSource,

            is_public:
              isPublic,
          },
        );

        setSuccessMessage(
          "Report updated successfully.",
        );
      } else {
        const report =
          await createReport({
            name: name.trim(),

            description:
              description.trim() ||
              null,

            data_source:
              dataSource,

            is_public:
              isPublic,
          });

        setSuccessMessage(
          "Report created successfully.",
        );

        navigate(
          `/reports/${report.id}/builder`,
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to save the report.",
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     EXECUTE REPORT
  ======================================================= */

  const handleExecute = async () => {
    if (
      !editing ||
      !reportId
    ) {
      setError(
        "Save the report before executing it.",
      );

      return;
    }

    try {
      setExecuting(true);
      setError("");

      const response =
        await executeReport(
          Number(reportId),
          buildQueryPayload(),
        );

      setResult(response);

      setSuccessMessage(
        "Report executed successfully.",
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to execute the report.",
      );
    } finally {
      setExecuting(false);
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box>

      {/* ===================================================
          HEADER
      =================================================== */}

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

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >

          <Button
            startIcon={<ArrowBack />}
            onClick={() =>
              navigate("/reports")
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Reports
          </Button>

          <Box>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {editing
                ? "Edit Report"
                : "Create Report"}
            </Typography>

            <Typography
              color="text.secondary"
              mt={0.5}
            >
              Configure your data and
              preview the results.
            </Typography>

          </Box>

        </Stack>


        <Stack
          direction="row"
          spacing={1.5}
        >

          {editing && (
            <Button
              variant="outlined"
              startIcon={
                <PlayArrowOutlined />
              }
              onClick={handleExecute}
              disabled={executing}
              sx={{
                textTransform: "none",
                borderRadius: 3,
              }}
            >
              {executing
                ? "Running..."
                : "Preview Report"}
            </Button>
          )}


          <Button
            variant="contained"
            startIcon={
              <SaveOutlined />
            }
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              px: 3,
            }}
          >
            {saving
              ? "Saving..."
              : "Save Report"}
          </Button>

        </Stack>

      </Stack>


      {/* ===================================================
          ERROR
      =================================================== */}

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


      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <Grid
        container
        spacing={3}
      >

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >

          <Stack spacing={3}>

            {/* =============================================
                REPORT DETAILS
            ============================================== */}

            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >

              <CardContent
                sx={{ p: 3 }}
              >

                <Typography
                  variant="h6"
                  fontWeight={800}
                  gutterBottom
                >
                  Report Details
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                >
                  Give your report a clear
                  name and choose the data
                  source.
                </Typography>


                <Stack spacing={2.5}>

                  {/* Report Name */}

                  <TextField
                    fullWidth
                    label="Report name"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. South Region Sales"
                  />


                  {/* Description */}

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Describe what this report shows..."
                  />


                  {/* Data Source */}

                  <FormControl
                    fullWidth
                  >

                    <InputLabel>
                      Data source
                    </InputLabel>

                    <Select
                      value={dataSource}
                      label="Data source"
                      onChange={
                        handleDataSourceChange
                      }
                    >

                      {DATA_SOURCES.map(
                        (source) => (
                          <MenuItem
                            key={
                              source.value
                            }
                            value={
                              source.value
                            }
                          >
                            {source.label}
                          </MenuItem>
                        ),
                      )}

                    </Select>

                  </FormControl>


                  {/* Public */}

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPublic}
                        onChange={(event) =>
                          setIsPublic(
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label="Make this report public"
                  />

                </Stack>

              </CardContent>

            </Card>


            {/* =============================================
                FILTERS
            ============================================== */}

            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >

              <CardContent
                sx={{ p: 3 }}
              >

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >

                  <Box>

                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      Filters
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Narrow the records
                      shown in your report.
                    </Typography>

                  </Box>


                  <Button
                    startIcon={<Add />}
                    onClick={addFilter}
                    sx={{
                      textTransform:
                        "none",
                      borderRadius: 2,
                    }}
                  >
                    Add Filter
                  </Button>

                </Stack>


                <Divider
                  sx={{ my: 3 }}
                />


                {filters.length === 0 ? (

                  <Box
                    sx={{
                      py: 5,
                      textAlign: "center",
                      borderRadius: 3,
                      backgroundColor:
                        "action.hover",
                    }}
                  >

                    <Typography
                      fontWeight={700}
                    >
                      No filters added
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={0.5}
                    >
                      Add a filter to narrow
                      down your report
                      results.
                    </Typography>

                  </Box>

                ) : (

                  <Stack spacing={2}>

                    {filters.map(
                      (filter) => (

                        <Grid
                          container
                          spacing={1.5}
                          key={filter.key}
                          alignItems="center"
                        >

                          {/* Field */}

                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                          >

                            <FormControl
                              fullWidth
                              size="small"
                            >

                              <InputLabel>
                                Field
                              </InputLabel>

                              <Select
                                value={
                                  filter.field_name
                                }
                                label="Field"
                                onChange={(
                                  event,
                                ) =>
                                  updateFilter(
                                    filter.key,
                                    "field_name",
                                    event.target
                                      .value,
                                  )
                                }
                              >

                                {fields.map(
                                  (
                                    field,
                                  ) => (
                                    <MenuItem
                                      key={
                                        field
                                      }
                                      value={
                                        field
                                      }
                                    >
                                      {field}
                                    </MenuItem>
                                  ),
                                )}

                              </Select>

                            </FormControl>

                          </Grid>


                          {/* Operator */}

                          <Grid
                            size={{
                              xs: 12,
                              md: 3,
                            }}
                          >

                            <FormControl
                              fullWidth
                              size="small"
                            >

                              <InputLabel>
                                Operator
                              </InputLabel>

                              <Select
                                value={
                                  filter.operator
                                }
                                label="Operator"
                                onChange={(
                                  event,
                                ) =>
                                  updateFilter(
                                    filter.key,
                                    "operator",
                                    event.target
                                      .value,
                                  )
                                }
                              >

                                {OPERATORS.map(
                                  (
                                    operator,
                                  ) => (
                                    <MenuItem
                                      key={
                                        operator.value
                                      }
                                      value={
                                        operator.value
                                      }
                                    >
                                      {
                                        operator.label
                                      }
                                    </MenuItem>
                                  ),
                                )}

                              </Select>

                            </FormControl>

                          </Grid>


                          {/* Value */}

                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                          >

                            <TextField
                              fullWidth
                              size="small"
                              label="Value"
                              value={
                                filter.value
                              }
                              onChange={(
                                event,
                              ) =>
                                updateFilter(
                                  filter.key,
                                  "value",
                                  event.target
                                    .value,
                                )
                              }
                            />

                          </Grid>


                          {/* Remove */}

                          <Grid
                            size={{
                              xs: 12,
                              md: 1,
                            }}
                          >

                            <Button
                              color="error"
                              onClick={() =>
                                removeFilter(
                                  filter.key,
                                )
                              }
                              sx={{
                                textTransform:
                                  "none",
                              }}
                            >
                              Remove
                            </Button>

                          </Grid>

                        </Grid>

                      ),
                    )}

                  </Stack>

                )}

              </CardContent>

            </Card>


            {/* =============================================
                SORTING AND GROUPING
            ============================================== */}

            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >

              <CardContent
                sx={{ p: 3 }}
              >

                <Typography
                  variant="h6"
                  fontWeight={800}
                  gutterBottom
                >
                  Sorting & Grouping
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                >
                  Control how your report
                  results are ordered and
                  grouped.
                </Typography>


                <Grid
                  container
                  spacing={2}
                >

                  {/* Sort By */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >

                    <FormControl
                      fullWidth
                    >

                      <InputLabel>
                        Sort by
                      </InputLabel>

                      <Select
                        value={sortBy}
                        label="Sort by"
                        onChange={(event) =>
                          setSortBy(
                            event.target.value,
                          )
                        }
                      >

                        <MenuItem value="">
                          No sorting
                        </MenuItem>

                        {fields.map(
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

                  </Grid>


                  {/* Sort Order */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 3,
                    }}
                  >

                    <FormControl
                      fullWidth
                    >

                      <InputLabel>
                        Order
                      </InputLabel>

                      <Select
                        value={sortOrder}
                        label="Order"
                        onChange={(event) =>
                          setSortOrder(
                            event.target
                              .value as
                              | "asc"
                              | "desc",
                          )
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

                  </Grid>


                  {/* Group By */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >

                    <FormControl
                      fullWidth
                    >

                      <InputLabel>
                        Group by
                      </InputLabel>

                      <Select
                        value={groupBy}
                        label="Group by"
                        onChange={(event) =>
                          setGroupBy(
                            event.target.value,
                          )
                        }
                      >

                        <MenuItem value="">
                          No grouping
                        </MenuItem>

                        {fields.map(
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

                  </Grid>


                  {/* Limit */}

                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >

                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum records"
                      value={limit}
                      onChange={(event) =>
                        setLimit(
                          Math.max(
                            1,
                            Math.min(
                              1000,
                              Number(
                                event.target
                                  .value,
                              ) || 1,
                            ),
                          ),
                        )
                      }
                      inputProps={{
                        min: 1,
                        max: 1000,
                      }}
                    />

                  </Grid>

                </Grid>

              </CardContent>

            </Card>

          </Stack>

        </Grid>


        {/* =================================================
            RIGHT SUMMARY
        ================================================= */}

        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >

          <Card
            sx={{
              borderRadius: 4,

              color: "white",

              background:
                "linear-gradient(145deg, #4a148c, #1565c0)",

              boxShadow:
                "0 18px 45px rgba(21,101,192,0.25)",

              position: "sticky",

              top: 20,
            }}
          >

            <CardContent
              sx={{ p: 3 }}
            >

              <Typography
                variant="overline"
                sx={{
                  opacity: 0.8,
                }}
              >
                Report Summary
              </Typography>


              <Typography
                variant="h5"
                fontWeight={800}
                mt={1}
              >
                {name ||
                  "Untitled Report"}
              </Typography>


              <Typography
                sx={{
                  opacity: 0.78,
                  mt: 1,
                  lineHeight: 1.6,
                }}
              >
                {description ||
                  "Configure your report and preview the results."}
              </Typography>


              <Divider
                sx={{
                  my: 3,

                  borderColor:
                    "rgba(255,255,255,0.2)",
                }}
              />


              <Stack spacing={2}>

                {/* Data source */}

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Data source
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {getDataSourceLabel(
                      dataSource,
                    )}
                  </Typography>

                </Box>


                {/* Fields */}

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Available fields
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {fields.length}
                  </Typography>

                </Box>


                {/* Filters */}

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Filters
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {filters.length}
                  </Typography>

                </Box>


                {/* Sort */}

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Sort
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {sortBy || "None"}
                  </Typography>

                </Box>


                {/* Group */}

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Group
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {groupBy || "None"}
                  </Typography>

                </Box>


                {/* Limit */}

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Maximum records
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {limit}
                  </Typography>

                </Box>

              </Stack>


              <Button
                fullWidth
                variant="contained"
                startIcon={
                  <PlayArrowOutlined />
                }
                onClick={
                  handleExecute
                }
                disabled={
                  !editing ||
                  executing
                }
                sx={{
                  mt: 4,
                  py: 1.4,
                  borderRadius: 3,
                  textTransform:
                    "none",
                  fontWeight: 800,
                  backgroundColor:
                    "white",
                  color: "#1565c0",

                  "&:hover": {
                    backgroundColor:
                      "rgba(255,255,255,0.9)",
                  },
                }}
              >
                {executing
                  ? "Running Report..."
                  : "Run Report"}
              </Button>

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* ===================================================
          RESULTS
      =================================================== */}

      {result && (

        <Card
          sx={{
            mt: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >

          <CardContent
            sx={{ p: 3 }}
          >

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              spacing={1}
              mb={3}
            >

              <Box>

                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Report Results
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {result.total_records}{" "}
                  records returned from{" "}
                  {getDataSourceLabel(
                    result.data_source,
                  )}
                  .
                </Typography>

              </Box>


              <Button
                variant="outlined"
                startIcon={
                  <PlayArrowOutlined />
                }
                onClick={
                  handleExecute
                }
                disabled={executing}
                sx={{
                  textTransform:
                    "none",
                  borderRadius: 2.5,
                }}
              >
                Refresh Results
              </Button>

            </Stack>


            {/* No results */}

            {result.rows.length === 0 ? (

              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                No records matched the
                selected filters.
              </Alert>

            ) : (

              <TableContainer
                sx={{
                  maxHeight: 550,

                  border: "1px solid",

                  borderColor:
                    "divider",

                  borderRadius: 3,
                }}
              >

                <Table
                  stickyHeader
                  size="small"
                >

                  <TableHead>

                    <TableRow>

                      {result.columns.map(
                        (column) => (

                          <TableCell
                            key={column}
                            sx={{
                              fontWeight: 800,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {column}
                          </TableCell>

                        ),
                      )}

                    </TableRow>

                  </TableHead>


                  <TableBody>

                    {result.rows.map(
                      (
                        row,
                        rowIndex,
                      ) => (

                        <TableRow
                          key={rowIndex}
                          hover
                        >

                          {result.columns.map(
                            (column) => (

                              <TableCell
                                key={`${rowIndex}-${column}`}
                              >
                                {formatValue(
                                  row[column],
                                )}
                              </TableCell>

                            ),
                          )}

                        </TableRow>

                      ),
                    )}

                  </TableBody>

                </Table>

              </TableContainer>

            )}

          </CardContent>

        </Card>

      )}


      {/* ===================================================
          SUCCESS SNACKBAR
      =================================================== */}

      <Snackbar
        open={
          Boolean(
            successMessage,
          )
        }
        autoHideDuration={3000}
        onClose={() =>
          setSuccessMessage("")
        }
        message={
          successMessage
        }
      />

    </Box>
  );
};


/* =========================================================
   FORMAT RESULT VALUE
========================================================= */

const formatValue = (
  value: unknown,
): string => {

  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  return String(value);
};


export default ReportBuilder;