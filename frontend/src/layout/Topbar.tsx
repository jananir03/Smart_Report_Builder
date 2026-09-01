import {
  LogoutRounded,
  MenuRounded,
  PersonRounded,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<
  string,
  string
> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/reports/create": "Create Report",
  "/templates": "Report Templates",
  "/shared-reports":
    "Shared Reports",
  "/schedules":
    "Report Schedules",
  "/exports": "Report Export",
  "/audit-logs": "Audit Logs",
  "/admin/users":
    "User Management",
};

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(
      null,
    );

  const menuOpen =
    Boolean(anchorEl);

  const currentTitle =
    pageTitles[
      location.pathname
    ] ||
    (location.pathname.startsWith(
      "/reports/",
    )
      ? "Report"
      : "Smart Reports");

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map(
        (part) =>
          part.charAt(0),
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    setAnchorEl(null);

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: {
          xs: "100%",
          md: "calc(100% - 250px)",
        },

        ml: {
          md: "250px",
        },

        backgroundColor:
          "rgba(255, 253, 251, 0.94)",

        backdropFilter:
          "blur(10px)",

        borderBottom:
          "1px solid #F0DFDA",

        color: "#3E3030",
      }}
    >
      <Toolbar
        sx={{
          minHeight:
            "72px !important",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* Mobile menu */}

        <IconButton
          onClick={onMenuClick}
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },

            mr: 1,

            color: "#A96868",
          }}
        >
          <MenuRounded />
        </IconButton>

        {/* Page title */}

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 750,
              fontSize: {
                xs: 17,
                sm: 19,
              },
            }}
          >
            {currentTitle}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            Manage and explore your
            reporting workspace
          </Typography>
        </Box>

        {/* User */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            borderRadius: "12px",
            px: 1,
            py: 0.6,

            "&:hover": {
              backgroundColor:
                "rgba(217, 154, 154, 0.08)",
            },
          }}
          onClick={(event) =>
            setAnchorEl(
              event.currentTarget,
            )
          }
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              fontSize: 14,
              fontWeight: 700,

              background:
                "linear-gradient(135deg, #D99A9A, #E8B6A7)",
            }}
          >
            {getInitials()}
          </Avatar>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },

              minWidth: 80,
            }}
          >
            <Typography
              fontSize={13}
              fontWeight={700}
              noWrap
            >
              {user?.name ||
                "User"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform:
                  "capitalize",
              }}
            >
              {user?.role ||
                "User"}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() =>
            setAnchorEl(null)
          }
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 210,
                borderRadius: "14px",

                boxShadow:
                  "0 12px 35px rgba(80, 55, 50, 0.14)",
              },
            },
          }}
        >
          <MenuItem
            disabled
            sx={{
              opacity: 1,
              py: 1.2,
            }}
          >
            <PersonRounded
              sx={{
                mr: 1.5,
                color: "#C98282",
              }}
            />

            <Box>
              <Typography
                fontSize={13}
                fontWeight={700}
              >
                {user?.email}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Signed in
              </Typography>
            </Box>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={
              handleLogout
            }
            sx={{
              color: "#C96F6F",
              py: 1.2,
            }}
          >
            <LogoutRounded
              sx={{
                mr: 1.5,
              }}
            />

            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}