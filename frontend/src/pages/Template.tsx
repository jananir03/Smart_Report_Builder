import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AddRounded,
  AutoAwesomeRounded,
  DeleteOutlineRounded,
  EditOutlined,
  PlayArrowRounded,
  RefreshRounded,
  TuneRounded,
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
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import type {
  SelectChangeEvent,
} from "@mui/material";

import {
  createReportFromTemplate,
  createTemplate,
  deleteTemplate,
  getTemplates,
  updateTemplate,
} from "../services/templateService";

import type {
  ReportTemplate,
  TemplateConfiguration,
  TemplateFilter,
} from "../services/templateService";


/* =========================================================
   DATA SOURCES
========================================================= */

const DATA_SOURCES = [
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
   OPERATORS
========================================================= */

const OPERATORS = [
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
   FILTER TYPE
========================================================= */

interface FilterRow extends TemplateFilter {
  id: number;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Templates() {
  const navigate = useNavigate();


  /* =======================================================
     STATE
  ======================================================= */

  const [templates, setTemplates] =
    useState<ReportTemplate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* =======================================================
     CREATE / EDIT DIALOG
  ======================================================= */

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingTemplate, setEditingTemplate] =
    useState<ReportTemplate | null>(null);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [dataSource, setDataSource] =
    useState("sales");

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


  /* =======================================================
     CREATE REPORT DIALOG
  ======================================================= */

  const [useDialogOpen, setUseDialogOpen] =
    useState(false);

  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);

  const [reportName, setReportName] =
    useState("");

  const [reportDescription, setReportDescription] =
    useState("");

  const [reportPublic, setReportPublic] =
    useState(false);

  const [creatingReport, setCreatingReport] =
    useState(false);


  /* =======================================================
     DELETE DIALOG
  ======================================================= */

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [templateToDelete, setTemplateToDelete] =
    useState<ReportTemplate | null>(null);

  const [deleting, setDeleting] =
    useState(false);


  /* =======================================================
     CURRENT FIELDS
  ======================================================= */

  const currentFields = useMemo(() => {
    return (
      DATA_SOURCES.find(
        (source) =>
          source.value === dataSource,
      )?.fields || []
    );
  }, [dataSource]);


  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    loadTemplates();
  }, []);


  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getTemplates();

      setTemplates(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load templates.",
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setName("");
    setDescription("");
    setDataSource("sales");
    setFilters([]);
    setSortBy("");
    setSortOrder("desc");
    setGroupBy("");
    setLimit(100);
    setEditingTemplate(null);
  };


  /* =======================================================
     OPEN CREATE
  ======================================================= */

  const handleCreate = () => {
    resetForm();
    setDialogOpen(true);
  };


  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const handleEdit = (
    template: ReportTemplate,
  ) => {
    const configuration =
      template.configuration || {};

    setEditingTemplate(template);

    setName(template.name);

    setDescription(
      template.description || "",
    );

    setDataSource(
      template.data_source,
    );

    setFilters(
      (configuration.filters || []).map(
        (filter, index) => ({
          id:
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

    setSortBy(
      configuration.sort_by || "",
    );

    setSortOrder(
      configuration.sort_order ||
        "desc",
    );

    setGroupBy(
      configuration.group_by || "",
    );

    setLimit(
      configuration.limit || 100,
    );

    setDialogOpen(true);
  };


  /* =======================================================
     ADD FILTER
  ======================================================= */

  const addFilter = () => {
    if (!currentFields.length) {
      return;
    }

    setFilters((current) => [
      ...current,

      {
        id: Date.now(),

        field_name:
          currentFields[0],

        operator: "equals",

        value: "",
      },
    ]);
  };


  /* =======================================================
     UPDATE FILTER
  ======================================================= */

  const updateFilter = (
    id: number,
    property: keyof TemplateFilter,
    value:
      | string
      | number
      | string[],
  ) => {
    setFilters((current) =>
      current.map((filter) =>
        filter.id === id
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
    id: number,
  ) => {
    setFilters((current) =>
      current.filter(
        (filter) =>
          filter.id !== id,
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

    const fields =
      DATA_SOURCES.find(
        (item) =>
          item.value === source,
      )?.fields || [];

    setDataSource(source);

    setFilters((current) =>
      current.map((filter) => ({
        ...filter,
        field_name:
          fields[0] || "",
      })),
    );

    setSortBy("");
    setGroupBy("");
  };


  /* =======================================================
     SAVE TEMPLATE
  ======================================================= */

  const handleSave = async () => {
    if (!name.trim()) {
      setError(
        "Template name is required.",
      );

      return;
    }

    if (!dataSource) {
      setError(
        "Please select a data source.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const configuration: TemplateConfiguration = {
        filters: filters
          .filter(
            (filter) =>
              filter.field_name &&
              String(
                filter.value,
              ).trim() !== "",
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

      if (editingTemplate) {
        await updateTemplate(
          editingTemplate.id,
          {
            name: name.trim(),

            description:
              description.trim() ||
              null,

            data_source:
              dataSource,

            configuration,
          },
        );

        setSuccess(
          "Template updated successfully.",
        );
      } else {
        await createTemplate({
          name: name.trim(),

          description:
            description.trim() ||
            null,

          data_source:
            dataSource,

          configuration,
        });

        setSuccess(
          "Template created successfully.",
        );
      }

      setDialogOpen(false);

      resetForm();

      await loadTemplates();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to save template.",
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     OPEN USE TEMPLATE
  ======================================================= */

  const handleUseTemplate = (
    template: ReportTemplate,
  ) => {
    setSelectedTemplate(template);

    setReportName(template.name);

    setReportDescription(
      template.description || "",
    );

    setReportPublic(false);

    setUseDialogOpen(true);
  };


  /* =======================================================
     CREATE REPORT FROM TEMPLATE
  ======================================================= */

  const handleCreateReport = async () => {
    if (!selectedTemplate) {
      return;
    }

    try {
      setCreatingReport(true);
      setError("");

      const report =
        await createReportFromTemplate(
          selectedTemplate.id,
          {
            name:
              reportName.trim() ||
              selectedTemplate.name,

            description:
              reportDescription.trim() ||
              selectedTemplate.description,

            is_public:
              reportPublic,
          },
        );

      setUseDialogOpen(false);

      setSelectedTemplate(null);

      setSuccess(
        "Report created from template.",
      );

      if (report?.id) {
        navigate(
          `/reports/${report.id}/builder`,
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to create report from template.",
      );
    } finally {
      setCreatingReport(false);
    }
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const openDeleteDialog = (
    template: ReportTemplate,
  ) => {
    setTemplateToDelete(template);

    setDeleteDialogOpen(true);
  };


  const handleDelete = async () => {
    if (!templateToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteTemplate(
        templateToDelete.id,
      );

      setTemplates((current) =>
        current.filter(
          (template) =>
            template.id !==
            templateToDelete.id,
        ),
      );

      setDeleteDialogOpen(false);

      setTemplateToDelete(null);

      setSuccess(
        "Template deleted successfully.",
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete template.",
      );
    } finally {
      setDeleting(false);
    }
  };


  /* =======================================================
     DATA SOURCE LABEL
  ======================================================= */

  const getSourceLabel = (
    source: string,
  ) => {
    return (
      DATA_SOURCES.find(
        (item) =>
          item.value === source,
      )?.label || source
    );
  };


  /* =======================================================
     CONFIGURATION SUMMARY
  ======================================================= */

  const getFilterCount = (
    template: ReportTemplate,
  ) => {
    return (
      template.configuration
        ?.filters?.length || 0
    );
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }


  /* =======================================================
     PAGE
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

        <Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            mb={0.8}
          >
            <AutoAwesomeRounded
              sx={{
                color: "#6C5CE7",
              }}
            />

            <Typography
              variant="overline"
              fontWeight={800}
              sx={{
                color: "#6C5CE7",
                letterSpacing: 1,
              }}
            >
              REPORT TEMPLATES
            </Typography>
          </Stack>

          <Typography
            variant="h4"
            fontWeight={800}
            color="#24213A"
          >
            Build once. Reuse anytime.
          </Typography>

          <Typography
            color="text.secondary"
            mt={0.7}
          >
            Save your report configurations
            and quickly create reports from
            them.
          </Typography>

        </Box>


        <Stack
          direction="row"
          spacing={1}
        >

          <Tooltip title="Refresh templates">

            <IconButton
              onClick={
                loadTemplates
              }
              sx={{
                border:
                  "1px solid #E8E5F0",
                borderRadius: 2.5,
              }}
            >
              <RefreshRounded />
            </IconButton>

          </Tooltip>


          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={handleCreate}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              px: 2.5,
              py: 1.2,
              background:
                "linear-gradient(135deg, #6C5CE7, #8578EE)",
              boxShadow:
                "0 8px 20px rgba(108,92,231,0.2)",
            }}
          >
            Create Template
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
          EMPTY STATE
      =================================================== */}

      {templates.length === 0 ? (

        <Card
          sx={{
            borderRadius: 4,
            border:
              "1px solid #ECEAF2",
            boxShadow:
              "0 8px 30px rgba(50,45,80,0.05)",
          }}
        >

          <CardContent
            sx={{
              py: 9,
              textAlign: "center",
            }}
          >

            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2,
                borderRadius: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #F0EDFF, #FFF1F7)",
              }}
            >
              <TuneRounded
                sx={{
                  fontSize: 34,
                  color: "#6C5CE7",
                }}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight={800}
            >
              No templates yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 480,
                mx: "auto",
                mt: 1,
                mb: 3,
              }}
            >
              Create your first report
              template to save filters,
              sorting and grouping
              configurations for reuse.
            </Typography>

            <Button
              variant="contained"
              startIcon={
                <AddRounded />
              }
              onClick={handleCreate}
              sx={{
                textTransform:
                  "none",
                borderRadius: 3,
              }}
            >
              Create Your First Template
            </Button>

          </CardContent>

        </Card>

      ) : (

        /* =================================================
           TEMPLATE GRID
        ================================================= */

        <Grid
          container
          spacing={3}
        >

          {templates.map(
            (template, index) => {

              const accent =
                index % 3 === 0
                  ? "#6C5CE7"
                  : index % 3 === 1
                    ? "#00897B"
                    : "#EF6C00";

              return (

                <Grid
                  key={template.id}
                  size={{
                    xs: 12,
                    md: 6,
                    xl: 4,
                  }}
                >

                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border:
                        "1px solid #ECEAF2",
                      boxShadow:
                        "0 8px 28px rgba(50,45,80,0.05)",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease",

                      "&:hover": {
                        transform:
                          "translateY(-4px)",
                        boxShadow:
                          "0 14px 36px rgba(50,45,80,0.1)",
                      },
                    }}
                  >

                    {/* Accent */}

                    <Box
                      sx={{
                        height: 5,
                        background:
                          accent,
                      }}
                    />


                    <CardContent
                      sx={{
                        p: 3,
                        height:
                          "calc(100% - 5px)",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                      }}
                    >

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >

                        <Box>

                          <Typography
                            variant="h6"
                            fontWeight={800}
                            color="#24213A"
                          >
                            {template.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.7,
                              minHeight: 42,
                            }}
                          >
                            {template.description ||
                              "No description provided."}
                          </Typography>

                        </Box>


                        <Chip
                          label={getSourceLabel(
                            template.data_source,
                          )}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor:
                              `${accent}14`,
                            color: accent,
                          }}
                        />

                      </Stack>


                      <Divider
                        sx={{
                          my: 2.5,
                        }}
                      />


                      {/* Stats */}

                      <Grid
                        container
                        spacing={1.5}
                      >

                        <Grid
                          size={4}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor:
                                "#F8F7FC",
                            }}
                          >

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Filters
                            </Typography>

                            <Typography
                              fontWeight={800}
                              mt={0.3}
                            >
                              {
                                getFilterCount(
                                  template,
                                )
                              }
                            </Typography>

                          </Box>
                        </Grid>


                        <Grid
                          size={4}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor:
                                "#F8F7FC",
                            }}
                          >

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Sort
                            </Typography>

                            <Typography
                              fontWeight={800}
                              mt={0.3}
                              noWrap
                            >
                              {template
                                .configuration
                                ?.sort_by ||
                                "None"}
                            </Typography>

                          </Box>
                        </Grid>


                        <Grid
                          size={4}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor:
                                "#F8F7FC",
                            }}
                          >

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Limit
                            </Typography>

                            <Typography
                              fontWeight={800}
                              mt={0.3}
                            >
                              {template
                                .configuration
                                ?.limit ||
                                100}
                            </Typography>

                          </Box>
                        </Grid>

                      </Grid>


                      {/* Actions */}

                      <Stack
                        direction="row"
                        spacing={1}
                        mt="auto"
                        pt={3}
                      >

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={
                            <PlayArrowRounded />
                          }
                          onClick={() =>
                            handleUseTemplate(
                              template,
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            borderRadius: 2.5,
                            background:
                              accent,
                          }}
                        >
                          Use Template
                        </Button>


                        <Tooltip title="Edit">

                          <IconButton
                            onClick={() =>
                              handleEdit(
                                template,
                              )
                            }
                            sx={{
                              border:
                                "1px solid #E8E5F0",
                              borderRadius: 2.5,
                            }}
                          >
                            <EditOutlined />
                          </IconButton>

                        </Tooltip>


                        <Tooltip title="Delete">

                          <IconButton
                            color="error"
                            onClick={() =>
                              openDeleteDialog(
                                template,
                              )
                            }
                            sx={{
                              border:
                                "1px solid #F1D8D8",
                              borderRadius: 2.5,
                            }}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>

                        </Tooltip>

                      </Stack>

                    </CardContent>

                  </Card>

                </Grid>

              );
            },
          )}

        </Grid>

      )}


      {/* ===================================================
          CREATE / EDIT DIALOG
      =================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={() =>
          !saving &&
          setDialogOpen(false)
        }
        fullWidth
        maxWidth="md"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 1,
          }}
        >
          {editingTemplate
            ? "Edit Template"
            : "Create Template"}
        </DialogTitle>


        <DialogContent
          dividers
        >

          <Stack spacing={2.5}>

            <TextField
              fullWidth
              label="Template name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="e.g. Monthly Sales Summary"
            />


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
              placeholder="Describe what this template is used for..."
            />


            <FormControl fullWidth>

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


            {/* Filters */}

            <Box>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >

                <Box>

                  <Typography
                    fontWeight={800}
                  >
                    Filters
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Save reusable
                    filtering rules.
                  </Typography>

                </Box>


                <Button
                  size="small"
                  startIcon={
                    <AddRounded />
                  }
                  onClick={
                    addFilter
                  }
                  sx={{
                    textTransform:
                      "none",
                  }}
                >
                  Add Filter
                </Button>

              </Stack>


              {filters.length === 0 ? (

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor:
                      "#F8F7FC",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No filters added.
                  </Typography>
                </Box>

              ) : (

                <Stack spacing={1.5}>

                  {filters.map(
                    (filter) => (

                      <Grid
                        container
                        spacing={1}
                        key={filter.id}
                      >

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
                                  filter.id,
                                  "field_name",
                                  event
                                    .target
                                    .value,
                                )
                              }
                            >

                              {currentFields.map(
                                (field) => (
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
                                  filter.id,
                                  "operator",
                                  event
                                    .target
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
                                filter.id,
                                "value",
                                event
                                  .target
                                  .value,
                              )
                            }
                          />

                        </Grid>


                        <Grid
                          size={{
                            xs: 12,
                            md: 1,
                          }}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >

                          <IconButton
                            color="error"
                            onClick={() =>
                              removeFilter(
                                filter.id,
                              )
                            }
                          >
                            <DeleteOutlineRounded />
                          </IconButton>

                        </Grid>

                      </Grid>

                    ),
                  )}

                </Stack>

              )}

            </Box>


            {/* Sorting */}

            <Grid
              container
              spacing={2}
            >

              <Grid
                size={{
                  xs: 12,
                  md: 5,
                }}
              >

                <FormControl fullWidth>

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

                    {currentFields.map(
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


              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >

                <FormControl fullWidth>

                  <InputLabel>
                    Sort order
                  </InputLabel>

                  <Select
                    value={sortOrder}
                    label="Sort order"
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


              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >

                <FormControl fullWidth>

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

                    {currentFields.map(
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

            </Grid>


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

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >

          <Button
            onClick={() =>
              setDialogOpen(false)
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
              borderRadius: 2.5,
              px: 3,
            }}
          >
            {saving
              ? "Saving..."
              : editingTemplate
                ? "Update Template"
                : "Create Template"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* ===================================================
          USE TEMPLATE DIALOG
      =================================================== */}

      <Dialog
        open={useDialogOpen}
        onClose={() =>
          !creatingReport &&
          setUseDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Create Report from Template
        </DialogTitle>


        <DialogContent>

          {selectedTemplate && (

            <Box>

              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #F4F1FF, #FFF3F8)",
                }}
              >

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Using template
                </Typography>

                <Typography
                  fontWeight={800}
                  mt={0.3}
                >
                  {
                    selectedTemplate.name
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={0.5}
                >
                  {
                    getSourceLabel(
                      selectedTemplate.data_source,
                    )
                  }
                </Typography>

              </Box>


              <Stack spacing={2.5}>

                <TextField
                  fullWidth
                  label="Report name"
                  value={reportName}
                  onChange={(event) =>
                    setReportName(
                      event.target
                        .value,
                    )
                  }
                />


                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  value={
                    reportDescription
                  }
                  onChange={(event) =>
                    setReportDescription(
                      event.target
                        .value,
                    )
                  }
                />


                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        reportPublic
                      }
                      onChange={(
                        event,
                      ) =>
                        setReportPublic(
                          event.target
                            .checked,
                        )
                      }
                    />
                  }
                  label="Make report public"
                />

              </Stack>

            </Box>

          )}

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >

          <Button
            onClick={() =>
              setUseDialogOpen(false)
            }
            disabled={
              creatingReport
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            startIcon={
              <PlayArrowRounded />
            }
            onClick={
              handleCreateReport
            }
            disabled={
              creatingReport
            }
            sx={{
              textTransform:
                "none",
              borderRadius: 2.5,
              px: 2.5,
            }}
          >
            {creatingReport
              ? "Creating..."
              : "Create Report"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* ===================================================
          DELETE DIALOG
      =================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() =>
          !deleting &&
          setDeleteDialogOpen(false)
        }
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Delete Template?
        </DialogTitle>


        <DialogContent>

          <Typography
            color="text.secondary"
          >
            Are you sure you want to
            delete{" "}
            <strong>
              {templateToDelete?.name}
            </strong>
            ? This action cannot be
            undone.
          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >

          <Button
            onClick={() =>
              setDeleteDialogOpen(
                false,
              )
            }
            disabled={deleting}
            sx={{
              textTransform:
                "none",
            }}
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
            sx={{
              textTransform:
                "none",
                borderRadius: 2.5,
            }}
          >
            {deleting
              ? "Deleting..."
              : "Delete Template"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* ===================================================
          SUCCESS
      =================================================== */}

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() =>
          setSuccess("")
        }
        message={success}
      />

    </Box>
  );
}