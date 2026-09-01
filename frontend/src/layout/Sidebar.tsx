import {
  AssessmentRounded,
  BarChartRounded,
  CalendarMonthRounded,
  CloseRounded,
  DashboardRounded,
  DescriptionRounded,
  FileDownloadRounded,
  GroupRounded,
  HistoryRounded,
  ShareRounded,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRounded />,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <AssessmentRounded />,
  },
  {
    label: "Templates",
    path: "/templates",
    icon: <DescriptionRounded />,
  },
  {
    label: "Shared Reports",
    path: "/shared-reports",
    icon: <ShareRounded />,
  },
  {
    label: "Schedules",
    path: "/schedules",
    icon: <CalendarMonthRounded />,
  },
  {
    label: "Export",
    path: "/exports",
    icon: <FileDownloadRounded />,
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: <HistoryRounded />,
  },
];

const adminItems: NavigationItem[] = [
  {
    label: "User Management",
    path: "/admin/users",
    icon: <GroupRounded />,
  },
];

const DRAWER_WIDTH = 250;

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (
    path: string,
  ) => {
    navigate(path);
    onMobileClose();
  };

  const isActive = (
    path: string,
  ) => {
    if (path === "/dashboard") {
      return (
        location.pathname ===
        "/dashboard"
      );
    }

    return location.pathname.startsWith(
      path,
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #FFFDFC 0%, #FFF8F4 100%)",
      }}
    >
      {/* Brand */}

      <Box
        sx={{
          height: 72,
          px: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction="row"
          spacing={1.3}
          alignItems="center"
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #D99A9A, #E8B6A7)",
              boxShadow:
                "0 7px 18px rgba(217, 154, 154, 0.25)",
            }}
          >
            <BarChartRounded
              sx={{
                color: "#FFFFFF",
                fontSize: 23,
              }}
            />
          </Box>

          <Box>
            <Typography
              fontWeight={800}
              fontSize={16}
              lineHeight={1.1}
              color="#3E3030"
            >
              Smart Reports
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Analytics platform
            </Typography>
          </Box>
        </Stack>

        <IconButton
          onClick={onMobileClose}
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },
            color: "#A87878",
          }}
        >
          <CloseRounded />
        </IconButton>
      </Box>

      <Divider
        sx={{
          borderColor: "#F0DFDA",
        }}
      />

      {/* Navigation */}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1,
            display: "block",
            fontWeight: 700,
            color: "#A79591",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          Workspace
        </Typography>

        <List disablePadding>
          {navigationItems.map(
            (item) => (
              <ListItemButton
                key={item.path}
                selected={isActive(
                  item.path,
                )}
                onClick={() =>
                  handleNavigation(
                    item.path,
                  )
                }
                sx={{
                  minHeight: 46,
                  mb: 0.5,
                  px: 1.5,
                  borderRadius: "11px",
                  color: "#716463",

                  "& .MuiListItemIcon-root":
                    {
                      minWidth: 38,
                      color: "#A58D89",
                    },

                  "& .MuiListItemText-primary":
                    {
                      fontSize: 14,
                      fontWeight: 600,
                    },

                  "&:hover": {
                    backgroundColor:
                      "rgba(217, 154, 154, 0.10)",
                  },

                  "&.Mui-selected": {
                    background:
                      "linear-gradient(90deg, rgba(217, 154, 154, 0.19), rgba(232, 182, 167, 0.08))",
                    color: "#A96868",
                  },

                  "&.Mui-selected .MuiListItemIcon-root":
                    {
                      color: "#C98282",
                    },

                  "&.Mui-selected:hover":
                    {
                      background:
                        "linear-gradient(90deg, rgba(217, 154, 154, 0.23), rgba(232, 182, 167, 0.11))",
                    },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                />
              </ListItemButton>
            ),
          )}
        </List>

        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mt: 3,
            mb: 1,
            display: "block",
            fontWeight: 700,
            color: "#A79591",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          Administration
        </Typography>

        <List disablePadding>
          {adminItems.map(
            (item) => (
              <ListItemButton
                key={item.path}
                selected={isActive(
                  item.path,
                )}
                onClick={() =>
                  handleNavigation(
                    item.path,
                  )
                }
                sx={{
                  minHeight: 46,
                  mb: 0.5,
                  px: 1.5,
                  borderRadius: "11px",
                  color: "#716463",

                  "& .MuiListItemIcon-root":
                    {
                      minWidth: 38,
                      color: "#A58D89",
                    },

                  "& .MuiListItemText-primary":
                    {
                      fontSize: 14,
                      fontWeight: 600,
                    },

                  "&:hover": {
                    backgroundColor:
                      "rgba(217, 154, 154, 0.10)",
                  },

                  "&.Mui-selected": {
                    background:
                      "linear-gradient(90deg, rgba(217, 154, 154, 0.19), rgba(232, 182, 167, 0.08))",
                    color: "#A96868",
                  },

                  "&.Mui-selected .MuiListItemIcon-root":
                    {
                      color: "#C98282",
                    },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                />
              </ListItemButton>
            ),
          )}
        </List>
      </Box>

      {/* Bottom hint */}

      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 1.5,
          borderRadius: "14px",
          background:
            "linear-gradient(135deg, #FCE9E5, #FFF3EF)",
          border:
            "1px solid rgba(217, 154, 154, 0.14)",
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="#A96868"
        >
          Smart reporting
        </Typography>

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{
            mt: 0.3,
            lineHeight: 1.4,
          }}
        >
          Turn your data into useful
          insights.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop sidebar */}

      <Box
        component="nav"
        sx={{
          width: {
            md: DRAWER_WIDTH,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight:
                "1px solid #F0DFDA",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Mobile sidebar */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}