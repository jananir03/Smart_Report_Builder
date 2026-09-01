from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import asc, desc, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.employee_performance import EmployeePerformance
from app.models.library_book import LibraryBook
from app.models.report import Report
from app.models.report_history import ReportHistory
from app.models.sale import Sale
from app.schemas.report_query import ReportQueryRequest


# ============================================================
# Supported Data Sources
# ============================================================

DATA_SOURCES = {
    "customers": Customer,
    "sales": Sale,
    "employee_performance": EmployeePerformance,
    "library_books": LibraryBook,
}


# ============================================================
# Supported Filter Operators
# ============================================================

ALLOWED_OPERATORS = {
    "equals",
    "not_equals",
    "contains",
    "starts_with",
    "ends_with",
    "greater_than",
    "less_than",
    "greater_than_or_equal",
    "less_than_or_equal",
    "in",
}


# ============================================================
# Data Source
# ============================================================

def get_data_source(data_source: str):
    model = DATA_SOURCES.get(data_source)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported data source: {data_source}",
        )

    return model


# ============================================================
# Model Columns
# ============================================================

def get_model_columns(model):
    return {
        column.name: getattr(model, column.name)
        for column in model.__table__.columns
    }


# ============================================================
# Filter Builder
# ============================================================

def build_filter(
    model,
    filter_data: dict[str, Any],
):
    field_name = filter_data.get("field_name")
    operator = filter_data.get("operator")
    value = filter_data.get("value")

    if not field_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filter field_name is required",
        )

    if not operator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filter operator is required",
        )

    if operator not in ALLOWED_OPERATORS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported operator: {operator}",
        )

    columns = get_model_columns(model)

    column = columns.get(field_name)

    if column is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid filter field: {field_name}",
        )

    if operator == "equals":
        return column == value

    if operator == "not_equals":
        return column != value

    if operator == "contains":
        return column.ilike(
            f"%{value}%"
        )

    if operator == "starts_with":
        return column.ilike(
            f"{value}%"
        )

    if operator == "ends_with":
        return column.ilike(
            f"%{value}"
        )

    if operator == "greater_than":
        return column > value

    if operator == "less_than":
        return column < value

    if operator == "greater_than_or_equal":
        return column >= value

    if operator == "less_than_or_equal":
        return column <= value

    if operator == "in":
        if not isinstance(value, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The 'in' operator "
                    "requires a list value"
                ),
            )

        return column.in_(value)

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid filter",
    )


# ============================================================
# Execute Report Query
# ============================================================

def execute_report_query(
    db: Session,
    report: Report,
    query_data: ReportQueryRequest,
):
    model = get_data_source(
        report.data_source
    )

    columns = get_model_columns(model)

    statement = select(model)

    # --------------------------------------------------------
    # Filters
    # --------------------------------------------------------

    for filter_data in query_data.filters:
        condition = build_filter(
            model,
            filter_data,
        )

        statement = statement.where(
            condition
        )

    # --------------------------------------------------------
    # Grouping
    # --------------------------------------------------------

    if query_data.group_by:
        group_column = columns.get(
            query_data.group_by
        )

        if group_column is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid group field: "
                    f"{query_data.group_by}"
                ),
            )

        statement = statement.group_by(
            group_column
        )

    # --------------------------------------------------------
    # Sorting
    # --------------------------------------------------------

    if query_data.sort_by:
        sort_column = columns.get(
            query_data.sort_by
        )

        if sort_column is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid sort field: "
                    f"{query_data.sort_by}"
                ),
            )

        sort_order = query_data.sort_order.lower()

        if sort_order == "desc":
            statement = statement.order_by(
                desc(sort_column)
            )

        elif sort_order == "asc":
            statement = statement.order_by(
                asc(sort_column)
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "sort_order must be "
                    "'asc' or 'desc'"
                ),
            )

    else:
        statement = statement.order_by(
            model.id
        )

    # --------------------------------------------------------
    # Limit
    # --------------------------------------------------------

    statement = statement.limit(
        query_data.limit
    )

    # --------------------------------------------------------
    # Execute Query
    # --------------------------------------------------------

    results = db.execute(
        statement
    ).scalars().all()

    # --------------------------------------------------------
    # Convert Results To JSON
    # --------------------------------------------------------

    rows = []

    for item in results:
        row = {}

        for column_name in columns:
            value = getattr(
                item,
                column_name,
            )

            if hasattr(value, "isoformat"):
                value = value.isoformat()

            row[column_name] = value

        rows.append(row)

    return {
        "columns": list(
            columns.keys()
        ),
        "rows": rows,
        "total_records": len(rows),
    }


# ============================================================
# Execute Saved Report
# ============================================================

def execute_saved_report(
    db: Session,
    report_id: int,
    user_id: int,
    query_data: ReportQueryRequest,
):
    report = db.execute(
        select(Report)
        .where(
            Report.id == report_id
        )
    ).scalar_one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    # --------------------------------------------------------
    # Permission Check
    # --------------------------------------------------------

    if (
        report.owner_id != user_id
        and not report.is_public
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have access "
                "to this report"
            ),
        )

    # --------------------------------------------------------
    # Active Check
    # --------------------------------------------------------

    if not report.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is inactive",
        )

    # --------------------------------------------------------
    # Execute And Record History
    # --------------------------------------------------------

    try:
        result = execute_report_query(
            db=db,
            report=report,
            query_data=query_data,
        )

        # ----------------------------------------------------
        # Successful Execution History
        # ----------------------------------------------------

        history = ReportHistory(
            report_id=report.id,
            executed_by=user_id,
            status="success",
            result_summary={
                "total_records": result[
                    "total_records"
                ],
                "data_source": report.data_source,
                "filters_count": len(
                    query_data.filters
                ),
                "sort_by": query_data.sort_by,
                "sort_order": query_data.sort_order,
                "group_by": query_data.group_by,
                "limit": query_data.limit,
            },
            error_message=None,
        )

        db.add(history)
        db.commit()
        db.refresh(history)

        return {
            "report_id": report.id,
            "data_source": report.data_source,
            **result,
        }

    except HTTPException as exc:

        # ----------------------------------------------------
        # Failed Execution History
        # ----------------------------------------------------

        db.rollback()

        history = ReportHistory(
            report_id=report.id,
            executed_by=user_id,
            status="failed",
            result_summary=None,
            error_message=str(
                exc.detail
            ),
        )

        db.add(history)
        db.commit()

        raise exc

    except Exception as exc:

        # ----------------------------------------------------
        # Unexpected Failure History
        # ----------------------------------------------------

        db.rollback()

        history = ReportHistory(
            report_id=report.id,
            executed_by=user_id,
            status="failed",
            result_summary=None,
            error_message=str(exc),
        )

        db.add(history)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Report execution failed",
        )