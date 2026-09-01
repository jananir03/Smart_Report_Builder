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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
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

import type {
  SelectChangeEvent,
} from "@mui/material";

import {
  AddRounded,
  AdminPanelSettingsRounded,
  CheckCircleOutlineRounded,
  DeleteOutlineRounded,
  EditOutlined,
  FilterAltOutlined,
  GroupRounded,
  LockOutlined,
  PersonAddAlt1Rounded,
  RefreshRounded,
  SearchRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "../services/userManagementService";

import type {
  ManagedUser,
  UserCreateRequest,
  UserUpdateRequest,
} from "../types/userManagement";


const PAGE_SIZE = 10;

const ROLE_USER = "USER";
const ROLE_ADMIN = "ADMIN";


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
   MAIN COMPONENT
========================================================= */

export default function UserManagement() {
  const [
    users,
    setUsers,
  ] = useState<ManagedUser[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
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


  /* =======================================================
     FILTER STATES
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");


  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    appliedRole,
    setAppliedRole,
  ] = useState("");

  const [
    appliedStatus,
    setAppliedStatus,
  ] = useState("");


  /* =======================================================
     DIALOG
  ======================================================= */

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState<ManagedUser | null>(
    null,
  );


  /* =======================================================
     DELETE / STATUS DIALOG
  ======================================================= */

  const [
    actionDialogOpen,
    setActionDialogOpen,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<ManagedUser | null>(
    null,
  );

  const [
    actionType,
    setActionType,
  ] = useState<
    "deactivate" |
    "activate" |
    "delete" |
    null
  >(null);


  /* =======================================================
     FORM
  ======================================================= */

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    role,
    setRole,
  ] = useState(ROLE_USER);

  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);


  /* =======================================================
     LOAD USERS
  ======================================================= */

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params: {
        page: number;
        page_size: number;
        search?: string;
        role?: string;
        is_active?: boolean;
      } = {
        page,
        page_size: PAGE_SIZE,
      };

      if (appliedSearch) {
        params.search =
          appliedSearch;
      }

      if (appliedRole) {
        params.role =
          appliedRole;
      }

      if (appliedStatus) {
        params.is_active =
          appliedStatus === "active";
      }

      const response =
        await getUsers(params);

      setUsers(
        response.users,
      );

      setTotal(
        response.total,
      );

      setTotalPages(
        response.total_pages,
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load users.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL / FILTER LOAD
  ======================================================= */

  useEffect(() => {
    void loadUsers();
  }, [
    page,
    appliedSearch,
    appliedRole,
    appliedStatus,
  ]);


  /* =======================================================
     APPLY FILTERS
  ======================================================= */

  const handleApplyFilters = () => {
    setPage(1);

    setAppliedSearch(
      search.trim(),
    );

    setAppliedRole(
      roleFilter,
    );

    setAppliedStatus(
      statusFilter,
    );
  };


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");

    setAppliedSearch("");
    setAppliedRole("");
    setAppliedStatus("");

    setPage(1);
  };


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    void loadUsers();
  };


  /* =======================================================
     PAGE CHANGE
  ======================================================= */

  const handlePageChange = (
    _event: ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };


  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole(ROLE_USER);
    setPasswordVisible(false);
  };


  /* =======================================================
     OPEN CREATE
  ======================================================= */

  const handleCreateOpen = () => {
    setEditingUser(null);

    resetForm();

    setError("");

    setDialogOpen(true);
  };


  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const handleEditOpen = (
    user: ManagedUser,
  ) => {
    setEditingUser(user);

    setName(user.name);
    setEmail(user.email);
    setRole(
      user.role.toUpperCase(),
    );

    setPassword("");

    setPasswordVisible(false);

    setError("");

    setDialogOpen(true);
  };


  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const handleDialogClose = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);

    setEditingUser(null);

    resetForm();
  };


  /* =======================================================
     SAVE USER
  ======================================================= */

  const handleSaveUser = async () => {
    if (!name.trim()) {
      setError(
        "Name is required.",
      );

      return;
    }

    if (!email.trim()) {
      setError(
        "Email is required.",
      );

      return;
    }

    if (!editingUser && !password) {
      setError(
        "Password is required.",
      );

      return;
    }

    if (
      !editingUser &&
      password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        const data: UserUpdateRequest = {
          name: name.trim(),
          email:
            email.trim(),
          role,
        };

        const updatedUser =
          await updateUser(
            editingUser.id,
            data,
          );

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updatedUser.id
                  ? updatedUser
                  : item,
            ),
        );

        setSuccess(
          "User updated successfully.",
        );
      } else {
        const data: UserCreateRequest = {
          name: name.trim(),
          email:
            email.trim(),
          password,
          role,
          is_active: true,
        };

        await createUser(
          data,
        );

        setSuccess(
          "User created successfully.",
        );

        setPage(1);

        setAppliedSearch(
          "",
        );

        setAppliedRole(
          "",
        );

        setAppliedStatus(
          "",
        );

        setSearch("");
        setRoleFilter("");
        setStatusFilter("");

        await loadUsers();
      }

      setDialogOpen(false);

      setEditingUser(null);

      resetForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingUser
            ? "Unable to update user."
            : "Unable to create user.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     OPEN ACTION DIALOG
  ======================================================= */

  const openActionDialog = (
    user: ManagedUser,
    type:
      | "deactivate"
      | "activate"
      | "delete",
  ) => {
    setSelectedUser(user);

    setActionType(type);

    setActionDialogOpen(true);
  };


  /* =======================================================
     CLOSE ACTION DIALOG
  ======================================================= */

  const closeActionDialog = () => {
    if (actionLoading) {
      return;
    }

    setActionDialogOpen(false);

    setSelectedUser(null);

    setActionType(null);
  };


  /* =======================================================
     CONFIRM ACTION
  ======================================================= */

  const handleConfirmAction = async () => {
    if (
      !selectedUser ||
      !actionType
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      if (
        actionType ===
        "activate"
      ) {
        await updateUserStatus(
          selectedUser.id,
          {
            is_active: true,
          },
        );

        setSuccess(
          `${selectedUser.name} has been activated.`,
        );
      }

      if (
        actionType ===
        "deactivate"
      ) {
        await updateUserStatus(
          selectedUser.id,
          {
            is_active: false,
          },
        );

        setSuccess(
          `${selectedUser.name} has been deactivated.`,
        );
      }

      if (
        actionType ===
        "delete"
      ) {
        await deleteUser(
          selectedUser.id,
        );

        setSuccess(
          `${selectedUser.name} has been deactivated.`,
        );
      }

      closeActionDialog();

      await loadUsers();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to complete the requested action.",
        ),
      );
    } finally {
      setActionLoading(false);
    }
  };


  /* =======================================================
     FILTER SELECT HANDLERS
  ======================================================= */

  const handleRoleFilterChange = (
    event: SelectChangeEvent,
  ) => {
    setRoleFilter(
      event.target.value,
    );
  };


  const handleStatusFilterChange = (
    event: SelectChangeEvent,
  ) => {
    setStatusFilter(
      event.target.value,
    );
  };


  const handleFormRoleChange = (
    event: SelectChangeEvent,
  ) => {
    setRole(
      event.target.value,
    );
  };


  /* =======================================================
     COUNTS
  ======================================================= */

  const activeCount =
    users.filter(
      (user) =>
        user.is_active,
    ).length;

  const inactiveCount =
    users.filter(
      (user) =>
        !user.is_active,
    ).length;

  const adminCount =
    users.filter(
      (user) =>
        user.role.toUpperCase() ===
        ROLE_ADMIN,
    ).length;


  /* =======================================================
     ACTION TEXT
  ======================================================= */

  const getActionTitle = () => {
    if (
      actionType ===
      "activate"
    ) {
      return "Activate User";
    }

    if (
      actionType ===
      "deactivate"
    ) {
      return "Deactivate User";
    }

    return "Deactivate User";
  };


  const getActionDescription =
    () => {
      if (!selectedUser) {
        return "";
      }

      if (
        actionType ===
        "activate"
      ) {
        return (
          `Are you sure you want to activate `
          + `${selectedUser.name}? `
          + "They will be able to use the platform again."
        );
      }

      if (
        actionType ===
        "delete"
      ) {
        return (
          `This will deactivate ${selectedUser.name}. `
          + "The user record will be retained for reporting "
          + "and audit history."
        );
      }

      return (
        `Are you sure you want to deactivate `
        + `${selectedUser.name}? `
        + "They will no longer be able to access the platform."
      );
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        pb: 5,
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >

        <Box>

          <Stack
            direction="row"
            spacing={1.3}
            alignItems="center"
            sx={{
              mb: 0.8,
            }}
          >

            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #F9DCCB, #F5D7E2)",
                color: "#C96D87",
                boxShadow:
                  "0 7px 18px rgba(201, 109, 135, 0.13)",
              }}
            >
              <GroupRounded />
            </Box>

            <Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#3A2930",
                  fontSize: {
                    xs: 25,
                    sm: 30,
                  },
                  lineHeight: 1.15,
                }}
              >
                User Management
              </Typography>

            </Box>

          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
              fontSize: 14,
            }}
          >
            Manage users, roles and account
            access from one place.
          </Typography>

        </Box>


        <Stack
          direction="row"
          spacing={1}
        >

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
              borderColor:
                "#E6C6CF",
              color: "#B45F78",
              borderRadius: "10px",
              fontWeight: 700,
              backgroundColor:
                "rgba(255,255,255,0.75)",
            }}
          >
            Refresh
          </Button>


          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={
              handleCreateOpen
            }
            sx={{
              background:
                "linear-gradient(135deg, #C86C86, #D78378)",
              borderRadius: "10px",
              fontWeight: 700,
              px: 2,
              boxShadow:
                "0 6px 16px rgba(200, 108, 134, 0.22)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #B95C76, #C87268)",
              },
            }}
          >
            Add User
          </Button>

        </Stack>

      </Stack>


      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}


      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() =>
            setSuccess("")
          }
        >
          {success}
        </Alert>
      )}


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >

        {/* TOTAL */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
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
                      "#FBE6DD",
                    color: "#C87857",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GroupRounded />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Users
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


        {/* ACTIVE */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
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
                      "#E8F4EC",
                    color: "#5C9B70",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleOutlineRounded />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Active on Page
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="#3A2930"
                  >
                    {activeCount}
                  </Typography>
                </Box>

              </Stack>
            </CardContent>
          </Card>
        </Grid>


        {/* ADMINS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
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
                      "#F6E7EF",
                    color: "#B96888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AdminPanelSettingsRounded />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Admins on Page
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="#3A2930"
                  >
                    {adminCount}
                  </Typography>
                </Box>

              </Stack>
            </CardContent>
          </Card>
        </Grid>


        {/* INACTIVE */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
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
                      "#F8ECE9",
                    color: "#B97868",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LockOutlined />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Inactive on Page
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="#3A2930"
                  >
                    {inactiveCount}
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
        }}
      >

        <CardContent>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mb: 2,
            }}
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
                  "#F9E5EA",
                color: "#C66A85",
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
              Find Users
            </Typography>

          </Stack>


          <Grid
            container
            spacing={2}
            alignItems="center"
          >

            {/* SEARCH */}

            <Grid
              size={{
                xs: 12,
                md: 5,
              }}
            >

              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchRounded
                        sx={{
                          mr: 1,
                          color:
                            "#A999A0",
                        }}
                      />
                    ),
                  },
                }}
              />

            </Grid>


            {/* ROLE */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 2.3,
              }}
            >

              <FormControl
                fullWidth
                size="small"
              >

                <InputLabel>
                  Role
                </InputLabel>

                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={
                    handleRoleFilterChange
                  }
                >

                  <MenuItem value="">
                    All roles
                  </MenuItem>

                  <MenuItem
                    value={ROLE_USER}
                  >
                    User
                  </MenuItem>

                  <MenuItem
                    value={ROLE_ADMIN}
                  >
                    Admin
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* STATUS */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 2.3,
              }}
            >

              <FormControl
                fullWidth
                size="small"
              >

                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={
                    handleStatusFilterChange
                  }
                >

                  <MenuItem value="">
                    All statuses
                  </MenuItem>

                  <MenuItem value="active">
                    Active
                  </MenuItem>

                  <MenuItem value="inactive">
                    Inactive
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* BUTTONS */}

            <Grid
              size={{
                xs: 12,
                md: 2.4,
              }}
            >

              <Stack
                direction="row"
                spacing={1}
              >

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={
                    <SearchRounded />
                  }
                  onClick={
                    handleApplyFilters
                  }
                  sx={{
                    backgroundColor:
                      "#C86B85",
                    borderRadius: "10px",
                    fontWeight: 700,
                    "&:hover": {
                      backgroundColor:
                        "#B85C76",
                    },
                  }}
                >
                  Search
                </Button>

                <Button
                  variant="outlined"
                  onClick={
                    handleClearFilters
                  }
                  sx={{
                    minWidth: 76,
                    borderColor:
                      "#E5C8D0",
                    color: "#786970",
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
          USERS TABLE
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

          {/* TABLE TITLE */}

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
              Platform Users
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.3,
              }}
            >
              Manage accounts and access
              levels.
            </Typography>

          </Box>


          {/* LOADING */}

          {loading ? (

            <Box
              sx={{
                minHeight: 350,
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
                    color: "#C86B85",
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Loading users...
                </Typography>

              </Stack>

            </Box>

          ) : users.length === 0 ? (

            /* EMPTY */

            <Box
              sx={{
                minHeight: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
              }}
            >

              <Stack
                spacing={1.5}
                alignItems="center"
                textAlign="center"
              >

                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #FBE6DD, #F8DFE8)",
                    color: "#C86B85",
                  }}
                >
                  <GroupRounded
                    fontSize="large"
                  />
                </Box>

                <Typography
                  fontWeight={800}
                  color="#3A2930"
                >
                  No users found
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Try changing your search
                  or filters.
                </Typography>

              </Stack>

            </Box>

          ) : (

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
                        User
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Role
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Status
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        User ID
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 800,
                          color: "#75656B",
                        }}
                      >
                        Actions
                      </TableCell>

                    </TableRow>

                  </TableHead>


                  <TableBody>

                    {users.map(
                      (user) => (

                        <TableRow
                          key={user.id}
                          hover
                          sx={{
                            "&:last-child td":
                              {
                                borderBottom: 0,
                              },
                          }}
                        >

                          {/* USER */}

                          <TableCell>

                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >

                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  flexShrink: 0,
                                  borderRadius:
                                    "12px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    user.role.toUpperCase() ===
                                    ROLE_ADMIN
                                      ? "#F7E4EB"
                                      : "#FCEBDD",
                                  color:
                                    user.role.toUpperCase() ===
                                    ROLE_ADMIN
                                      ? "#B9617F"
                                      : "#C47A58",
                                  fontWeight: 800,
                                }}
                              >
                                {user.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </Box>

                              <Box
                                sx={{
                                  minWidth: 0,
                                }}
                              >

                                <Typography
                                  fontWeight={700}
                                  color="#45353B"
                                  noWrap
                                >
                                  {user.name}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {user.email}
                                </Typography>

                              </Box>

                            </Stack>

                          </TableCell>


                          {/* ROLE */}

                          <TableCell>

                            <Chip
                              icon={
                                user.role.toUpperCase() ===
                                ROLE_ADMIN ? (
                                  <AdminPanelSettingsRounded />
                                ) : (
                                  <GroupRounded />
                                )
                              }
                              label={
                                user.role.toUpperCase() ===
                                ROLE_ADMIN
                                  ? "Admin"
                                  : "User"
                              }
                              size="small"
                              sx={{
                                fontWeight: 700,
                                backgroundColor:
                                  user.role.toUpperCase() ===
                                  ROLE_ADMIN
                                    ? "#F8E4EC"
                                    : "#FCEBDD",
                                color:
                                  user.role.toUpperCase() ===
                                  ROLE_ADMIN
                                    ? "#A85674"
                                    : "#A9684D",
                                "& .MuiChip-icon":
                                  {
                                    color:
                                      "inherit",
                                  },
                              }}
                            />

                          </TableCell>


                          {/* STATUS */}

                          <TableCell>

                            <Chip
                              label={
                                user.is_active
                                  ? "Active"
                                  : "Inactive"
                              }
                              size="small"
                              sx={{
                                fontWeight: 700,
                                backgroundColor:
                                  user.is_active
                                    ? "#E7F3EA"
                                    : "#F2E9E8",
                                color:
                                  user.is_active
                                    ? "#4E8C63"
                                    : "#90736E",
                              }}
                            />

                          </TableCell>


                          {/* ID */}

                          <TableCell>

                            <Typography
                              fontSize={13}
                              fontWeight={700}
                              color="#75656B"
                            >
                              #{user.id}
                            </Typography>

                          </TableCell>


                          {/* ACTIONS */}

                          <TableCell align="right">

                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >

                              {/* EDIT */}

                              <Tooltip title="Edit user">

                                <IconButton
                                  onClick={() =>
                                    handleEditOpen(
                                      user,
                                    )
                                  }
                                  sx={{
                                    color:
                                      "#C16A83",
                                    backgroundColor:
                                      "#FCEEF1",
                                    "&:hover":
                                      {
                                        backgroundColor:
                                          "#F8DDE4",
                                      },
                                  }}
                                >
                                  <EditOutlined
                                    fontSize="small"
                                  />
                                </IconButton>

                              </Tooltip>


                              {/* ACTIVATE / DEACTIVATE */}

                              <Tooltip
                                title={
                                  user.is_active
                                    ? "Deactivate user"
                                    : "Activate user"
                                }
                              >

                                <IconButton
                                  onClick={() =>
                                    openActionDialog(
                                      user,
                                      user.is_active
                                        ? "deactivate"
                                        : "activate",
                                    )
                                  }
                                  sx={{
                                    color:
                                      user.is_active
                                        ? "#B87868"
                                        : "#5B966D",
                                    backgroundColor:
                                      user.is_active
                                        ? "#FBF0ED"
                                        : "#EDF7EF",
                                    "&:hover":
                                      {
                                        backgroundColor:
                                          user.is_active
                                            ? "#F6E3DF"
                                            : "#DFF0E3",
                                      },
                                  }}
                                >

                                  {user.is_active ? (
                                    <LockOutlined
                                      fontSize="small"
                                    />
                                  ) : (
                                    <CheckCircleOutlineRounded
                                      fontSize="small"
                                    />
                                  )}

                                </IconButton>

                              </Tooltip>


                              {/* DELETE / SOFT DELETE */}

                              {user.is_active && (
                                <Tooltip
                                  title="Deactivate user"
                                >

                                  <IconButton
                                    onClick={() =>
                                      openActionDialog(
                                        user,
                                        "delete",
                                      )
                                    }
                                    sx={{
                                      color:
                                        "#B45F72",
                                      backgroundColor:
                                        "#FBECEF",
                                      "&:hover":
                                        {
                                          backgroundColor:
                                            "#F7DDE4",
                                        },
                                    }}
                                  >
                                    <DeleteOutlineRounded
                                      fontSize="small"
                                    />
                                  </IconButton>

                                </Tooltip>
                              )}

                            </Stack>

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
                    ? "No users"
                    : `Page ${page} of ${totalPages} • ${total} total users`}
                </Typography>


                {totalPages > 1 && (

                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={
                      handlePageChange
                    }
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root.Mui-selected":
                        {
                          backgroundColor:
                            "#C86B85",
                          color:
                            "#FFFFFF",
                        },

                      "& .MuiPaginationItem-root.Mui-selected:hover":
                        {
                          backgroundColor:
                            "#B85C76",
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
          CREATE / EDIT DIALOG
      ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={
          handleDialogClose
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#3A2930",
            pb: 1,
          }}
        >

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >

            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  "#F9E5EA",
                color: "#C66A85",
              }}
            >
              {editingUser ? (
                <EditOutlined />
              ) : (
                <PersonAddAlt1Rounded />
              )}
            </Box>

            <Box>

              <Typography
                fontWeight={800}
              >
                {editingUser
                  ? "Edit User"
                  : "Add New User"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {editingUser
                  ? "Update account details and role."
                  : "Create a new platform account."}
              </Typography>

            </Box>

          </Stack>

        </DialogTitle>


        <DialogContent
          dividers
          sx={{
            backgroundColor:
              "#FFFDFC",
          }}
        >

          <Stack
            spacing={2.2}
            sx={{
              pt: 1,
            }}
          >

            {/* NAME */}

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              autoFocus
            />


            {/* EMAIL */}

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
            />


            {/* PASSWORD */}

            {!editingUser && (

              <TextField
                fullWidth
                label="Password"
                type={
                  passwordVisible
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                helperText="Minimum 6 characters"
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setPasswordVisible(
                            (current) =>
                              !current,
                          )
                        }
                        edge="end"
                        aria-label={
                          passwordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {passwordVisible ? (
                          <VisibilityOffOutlined />
                        ) : (
                          <VisibilityOutlined />
                        )}
                      </IconButton>
                    ),
                  },
                }}
              />

            )}


            {/* ROLE */}

            <FormControl
              fullWidth
            >

              <InputLabel>
                Role
              </InputLabel>

              <Select
                value={role}
                label="Role"
                onChange={
                  handleFormRoleChange
                }
              >

                <MenuItem
                  value={ROLE_USER}
                >
                  User
                </MenuItem>

                <MenuItem
                  value={ROLE_ADMIN}
                >
                  Admin
                </MenuItem>

              </Select>

            </FormControl>


            {/* INFO */}

            <Box
              sx={{
                p: 1.7,
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, #FFF3ED, #FFF0F4)",
                border:
                  "1px solid #F2DEE1",
              }}
            >

              <Typography
                variant="body2"
                color="#735E65"
                sx={{
                  lineHeight: 1.55,
                }}
              >
                {editingUser
                  ? "Changing a user's role or account details will be recorded in the audit log."
                  : "The new account will be active immediately. User creation will also be recorded in the audit log."}
              </Typography>

            </Box>

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >

          <Button
            onClick={
              handleDialogClose
            }
            disabled={saving}
            sx={{
              color: "#75656B",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveUser
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={17}
                  sx={{
                    color:
                      "#FFFFFF",
                  }}
                />
              ) : editingUser ? (
                <CheckCircleOutlineRounded />
              ) : (
                <PersonAddAlt1Rounded />
              )
            }
            sx={{
              background:
                "linear-gradient(135deg, #C86C86, #D78378)",
              borderRadius: "9px",
              fontWeight: 700,
              px: 2.5,
              "&:hover": {
                background:
                  "linear-gradient(135deg, #B95C76, #C87268)",
              },
            }}
          >
            {saving
              ? "Saving..."
              : editingUser
                ? "Save Changes"
                : "Create User"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =================================================
          ACTION CONFIRMATION DIALOG
      ================================================= */}

      <Dialog
        open={actionDialogOpen}
        onClose={
          closeActionDialog
        }
        fullWidth
        maxWidth="xs"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#3A2930",
          }}
        >
          {getActionTitle()}
        </DialogTitle>


        <DialogContent>

          <Typography
            color="text.secondary"
            sx={{
              lineHeight: 1.65,
            }}
          >
            {getActionDescription()}
          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >

          <Button
            onClick={
              closeActionDialog
            }
            disabled={
              actionLoading
            }
            sx={{
              color: "#75656B",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleConfirmAction
            }
            disabled={
              actionLoading
            }
            startIcon={
              actionLoading ? (
                <CircularProgress
                  size={17}
                  sx={{
                    color:
                      "#FFFFFF",
                  }}
                />
              ) : (
                <CheckCircleOutlineRounded />
              )
            }
            sx={{
              backgroundColor:
                actionType ===
                "activate"
                  ? "#60966F"
                  : "#C26D7F",
              borderRadius: "9px",
              fontWeight: 700,
              "&:hover": {
                backgroundColor:
                  actionType ===
                  "activate"
                    ? "#508461"
                    : "#B65B70",
              },
            }}
          >
            {actionLoading
              ? "Processing..."
              : actionType ===
                  "activate"
                ? "Activate"
                : "Deactivate"}
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}