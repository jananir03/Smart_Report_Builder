import {
  Box,
  Toolbar,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const handleMobileMenu = () => {
    setMobileOpen(
      (previous) => !previous,
    );
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #FFF8F4 0%, #FFF3EF 48%, #FCEDE8 100%)",
      }}
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={
          handleMobileClose
        }
      />

      <Topbar
        onMenuClick={
          handleMobileMenu
        }
      />

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: "250px",
          },
          minHeight: "100vh",
        }}
      >
        <Toolbar />

        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}