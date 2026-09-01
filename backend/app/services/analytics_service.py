from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import (
    asc,
    desc,
    func,
    select,
)
from sqlalchemy.orm import Session


from app.models.customer import Customer
from app.models.sale import Sale
from app.models.employee_performance import EmployeePerformance
from app.models.library_book import LibraryBook
from app.models.report import Report
from app.schemas.analytics import (
    AggregationRequest,
    AnalyticsQueryRequest,
)


DATA_SOURCES = {
    "customers": Customer,
    "sales": Sale,
    "employee_performance": EmployeePerformance,
    "library_books": LibraryBook,
}

ALLOWED_AGGREGATIONS = {
    "count",
    "sum",
    "avg",
    "min",
    "max",
}


def get_data_source(
    data_source: str,
):
    model = DATA_SOURCES.get(
        data_source
    )

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported data source: "
                f"{data_source}"
            ),
        )

    return model


def get_model_columns(model):
    return {
        column.name: getattr(
            model,
            column.name,
        )
        for column in model.__table__.columns
    }


def build_filter(
    model,
    filter_data: dict[str, Any],
):
    field_name = filter_data.get(
        "field_name"
    )

    operator = filter_data.get(
        "operator"
    )

    value = filter_data.get(
        "value"
    )

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

    columns = get_model_columns(
        model
    )

    column = columns.get(
        field_name
    )

    if column is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid filter field: "
                f"{field_name}"
            ),
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

        if not isinstance(
            value,
            list,
        ):
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
        detail=(
            f"Unsupported operator: "
            f"{operator}"
        ),
    )


def build_aggregation(
    model,
    aggregation: AggregationRequest,
):
    columns = get_model_columns(
        model
    )

    field = aggregation.field

    function = aggregation.function.lower()

    if function not in ALLOWED_AGGREGATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported aggregation: "
                f"{function}"
            ),
        )

    column = columns.get(
        field
    )

    if column is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid aggregation field: "
                f"{field}"
            ),
        )

    if function == "count":
        return func.count(
            column
        ).label(
            f"count_{field}"
        )

    if function == "sum":
        return func.sum(
            column
        ).label(
            f"sum_{field}"
        )

    if function == "avg":
        return func.avg(
            column
        ).label(
            f"avg_{field}"
        )

    if function == "min":
        return func.min(
            column
        ).label(
            f"min_{field}"
        )

    if function == "max":
        return func.max(
            column
        ).label(
            f"max_{field}"
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid aggregation",
    )


def execute_analytics_query(
    db: Session,
    report: Report,
    query_data: AnalyticsQueryRequest,
):
    model = get_data_source(
        report.data_source
    )

    columns = get_model_columns(
        model
    )

    # -------------------------
    # Validate group_by
    # -------------------------

    group_column = None

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

    # -------------------------
    # Build SELECT
    # -------------------------

    selected_columns = []

    if group_column is not None:
        selected_columns.append(
            group_column
        )

    aggregation_expressions = []

    for aggregation in query_data.aggregations:

        expression = build_aggregation(
            model,
            aggregation,
        )

        aggregation_expressions.append(
            expression
        )

    selected_columns.extend(
        aggregation_expressions
    )

    # -------------------------
    # Validate query
    # -------------------------

    if not selected_columns:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "At least one aggregation "
                "is required"
            ),
        )

    # -------------------------
    # Create SELECT
    # -------------------------

    statement = select(
        *selected_columns
    )

    # -------------------------
    # Filters
    # -------------------------

    for filter_data in query_data.filters:

        condition = build_filter(
            model,
            filter_data,
        )

        statement = statement.where(
            condition
        )

    # -------------------------
    # GROUP BY
    # -------------------------

    if group_column is not None:

        statement = statement.group_by(
            group_column
        )

    # -------------------------
    # Sorting
    # -------------------------

    if query_data.sort_by:

        sort_column = None

        # Sort by group field
        if (
            query_data.group_by
            and query_data.sort_by
            == query_data.group_by
        ):
            sort_column = group_column

        # Sort by aggregation alias
        else:

            for expression in (
                aggregation_expressions
            ):
                if (
                    expression.name
                    == query_data.sort_by
                ):
                    sort_column = expression
                    break

        if sort_column is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid sort field: "
                    f"{query_data.sort_by}"
                ),
            )

        if (
            query_data.sort_order.lower()
            == "desc"
        ):
            statement = statement.order_by(
                desc(sort_column)
            )

        elif (
            query_data.sort_order.lower()
            == "asc"
        ):
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

    # -------------------------
    # Limit
    # -------------------------

    statement = statement.limit(
        query_data.limit
    )

    # -------------------------
    # Execute
    # -------------------------

    result = db.execute(
        statement
    )

    rows = []

    for row in result:

        row_data = dict(
            row._mapping
        )

        converted_row = {}

        for key, value in row_data.items():

            if hasattr(
                value,
                "isoformat",
            ):
                value = value.isoformat()

            converted_row[key] = value

        rows.append(
            converted_row
        )

    result_columns = []

    if query_data.group_by:
        result_columns.append(
            query_data.group_by
        )

    for aggregation in (
        query_data.aggregations
    ):
        result_columns.append(
            (
                f"{aggregation.function.lower()}"
                f"_{aggregation.field}"
            )
        )

    return {
        "columns": result_columns,
        "rows": rows,
        "total_records": len(rows),
    }


def execute_saved_analytics_report(
    db: Session,
    report_id: int,
    user_id: int,
    query_data: AnalyticsQueryRequest,
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

    # -------------------------
    # Authorization
    # -------------------------

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

    # -------------------------
    # Active report check
    # -------------------------

    if not report.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is inactive",
        )

    result = execute_analytics_query(
        db=db,
        report=report,
        query_data=query_data,
    )

    return {
        "report_id": report.id,
        "data_source": report.data_source,
        "group_by": query_data.group_by,
        **result,
    }