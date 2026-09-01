import csv
import io
from typing import Any

from fastapi import HTTPException, status
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report
from app.services.report_query_service import (
    execute_saved_report,
)
from app.services.shared_report_service import (
    require_report_permission,
)
from app.schemas.report_query import ReportQueryRequest


def get_report_data(
    db: Session,
    report_id: int,
    user_id: int,
    filters: list[dict[str, Any]],
    sort_by: str | None,
    sort_order: str,
    limit: int,
) -> dict[str, Any]:

    require_report_permission(
        db=db,
        report_id=report_id,
        user_id=user_id,
        required_permission="EXECUTE",
    )

    query_data = ReportQueryRequest(
        filters=filters,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
    )

    result = execute_saved_report(
        db=db,
        report_id=report_id,
        user_id=user_id,
        query_data=query_data,
    )

    return result


def generate_csv(
    rows: list[dict[str, Any]],
    columns: list[str],
) -> io.BytesIO:

    output = io.StringIO()

    if not rows:
        output.write("No data available\n")
    else:
        writer = csv.DictWriter(
            output,
            fieldnames=columns,
            extrasaction="ignore",
        )

        writer.writeheader()

        for row in rows:
            writer.writerow(row)

    file = io.BytesIO(
        output.getvalue().encode("utf-8")
    )

    file.seek(0)

    return file


def generate_excel(
    rows: list[dict[str, Any]],
    columns: list[str],
) -> io.BytesIO:

    workbook = Workbook()

    worksheet = workbook.active
    worksheet.title = "Report"

    if not rows:
        worksheet.append(
            ["No data available"]
        )
    else:
        worksheet.append(columns)

        for row in rows:
            worksheet.append(
                [
                    row.get(column)
                    for column in columns
                ]
            )

        for column_cells in worksheet.columns:

            max_length = 0

            column_letter = (
                column_cells[0].column_letter
            )

            for cell in column_cells:

                value = (
                    ""
                    if cell.value is None
                    else str(cell.value)
                )

                max_length = max(
                    max_length,
                    len(value),
                )

            worksheet.column_dimensions[
                column_letter
            ].width = min(
                max_length + 2,
                40,
            )

    output = io.BytesIO()

    workbook.save(output)

    output.seek(0)

    return output


def generate_pdf(
    rows: list[dict[str, Any]],
    columns: list[str],
) -> io.BytesIO:

    output = io.BytesIO()

    document = SimpleDocTemplate(
        output,
        pagesize=landscape(A4),
        rightMargin=20,
        leftMargin=20,
        topMargin=20,
        bottomMargin=20,
    )

    if not rows:

        table_data = [
            ["No data available"]
        ]

    else:

        table_data = [columns]

        for row in rows:
            table_data.append(
                [
                    str(
                        row.get(column, "")
                    )
                    for column in columns
                ]
            )

    table = Table(
        table_data,
        repeatRows=1,
    )

    table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.grey,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.black,
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
            ]
        )
    )

    document.build([table])

    output.seek(0)

    return output