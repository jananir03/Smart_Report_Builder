import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

import Reports from "../pages/Reports";
import ReportBuilder from "../pages/ReportBuilder";
import Templates from "../pages/Template";
import SharedReports from "../pages/SharedReports";
import Schedules from "../pages/ReportSchedules";
import AuditLogs from "../pages/AuditLogs";
import UserManagement from "../pages/UserManagement";
import Exports from "../pages/Exports";

import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layout/AppLayout";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =================================================
          PUBLIC
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =================================================
          PROTECTED
      ================================================= */}

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          element={
            <AppLayout />
          }
        >

          {/* =============================================
              DASHBOARD
          ============================================= */}

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          {/* =============================================
              REPORTS
          ============================================= */}

          <Route
            path="/reports"
            element={
              <Reports />
            }
          />

          <Route
            path="/reports/create"
            element={
              <ReportBuilder />
            }
          />

          <Route
            path="/reports/:reportId/builder"
            element={
              <ReportBuilder />
            }
          />

          {/* =============================================
              EXPORTS
          ============================================= */}

          <Route
            path="/exports"
            element={
              <Exports />
            }
          />

          {/* =============================================
              TEMPLATES
          ============================================= */}

          <Route
            path="/templates"
            element={
              <Templates />
            }
          />

          {/* =============================================
              SHARED REPORTS
          ============================================= */}

          <Route
            path="/shared-reports"
            element={
              <SharedReports />
            }
          />

          {/* =============================================
              SCHEDULES
          ============================================= */}

          <Route
            path="/schedules"
            element={
              <Schedules />
            }
          />

          {/* =============================================
              AUDIT LOGS
          ============================================= */}

          <Route
            path="/audit-logs"
            element={
              <AuditLogs />
            }
          />

          {/* =============================================
              USER MANAGEMENT
          ============================================= */}

          <Route
            path="/admin/users"
            element={
              <UserManagement />
            }
          />

        </Route>
      </Route>

      {/* =================================================
          DEFAULT
      ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}