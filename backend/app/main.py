from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    analytics,
    audit_logs,
    auth,
    dashboard,
    exports,
    report_query,
    report_schedules,
    report_templates,
    reports,
    shared_reports,
)

from app.routers import admin

from app.services.scheduler_service import (
    shutdown_scheduler,
    start_scheduler,
)


@asynccontextmanager
async def lifespan(
    app: FastAPI,
):
    start_scheduler()

    yield

    shutdown_scheduler()


app = FastAPI(
    title="Smart Report Builder & Analytics Platform",
    description=(
        "A platform for creating, managing, "
        "visualizing, sharing, and exporting custom reports."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth.router
)

app.include_router(
    report_schedules.router
)

app.include_router(
    reports.router
)

app.include_router(
    report_query.router
)

app.include_router(
    analytics.router
)

app.include_router(
    report_templates.router
)

app.include_router(
    shared_reports.router
)

app.include_router(
    exports.router
)

app.include_router(
    dashboard.router
)



app.include_router(
    audit_logs.router
)

app.include_router(
    admin.router
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "success",
        "application": "running",
    }


# =========================================================
# ROOT
# =========================================================

@app.get(
    "/",
    tags=["Root"],
)
def root():
    return {
        "message": "Smart Report Builder API",
    }