# Smart Reports & Analytics Platform

A full-stack reporting and analytics platform for creating, executing,
scheduling, sharing, and exporting data-driven reports.

## Overview

The Smart Reports & Analytics Platform provides an end-to-end workflow
for transforming datasets into configurable reports and analytics.

The project includes:

-   Dashboard
-   Report creation and execution
-   Dynamic filters
-   Sorting and grouping
-   Analytics and aggregations
-   Reusable report templates
-   Report scheduling
-   Report sharing
-   CSV and PDF exports
-   Audit logs
-   User management
-   Multiple data sources

## Features

### Dashboard

The dashboard acts as the main entry point to the application and
provides access to the reporting and analytics modules.

### Reports

Users can:

-   View reports
-   Create reports
-   Open reports in the Report Builder
-   Configure filters
-   Configure sorting
-   Configure grouping
-   Set result limits
-   Execute reports

### Report Builder

The Report Builder allows users to configure a report before execution.

A report can contain:

-   Data source
-   Filters
-   Sort field
-   Sort order
-   Grouping
-   Result limit

Example filter:

``` json
{
  "field_name": "borrowed_count",
  "operator": "greater_than",
  "value": "100"
}
```

### Analytics

The analytics module supports:

-   Filters
-   Grouping
-   Aggregations
-   Sorting
-   Result limits

Supported aggregation functions:

-   `count`
-   `sum`
-   `avg`
-   `min`
-   `max`

Example analytics request:

``` json
{
  "filters": [
    {
      "field_name": "borrowed_count",
      "operator": "greater_than",
      "value": "100"
    }
  ],
  "group_by": "category",
  "aggregations": [
    {
      "field": "borrowed_count",
      "function": "sum"
    }
  ],
  "sort_by": "borrowed_count",
  "sort_order": "desc",
  "limit": 20
}
```

### Report Templates

Templates allow frequently used report configurations to be saved and
reused.

A template contains:

-   Name
-   Description
-   Data source
-   Configuration

Example:

``` json
{
  "name": "Most Borrowed Library Books",
  "description": "Shows the most frequently borrowed books in the library.",
  "data_source": "library_books",
  "configuration": {
    "filters": [
      {
        "field_name": "borrowed_count",
        "operator": "greater_than",
        "value": "100"
      }
    ],
    "sort_by": "borrowed_count",
    "sort_order": "desc",
    "group_by": null,
    "limit": 20
  }
}
```

### Report Sharing

The report sharing module allows reports to be shared with other users
according to the configured permissions.

### Report Scheduling

Reports can be scheduled to run automatically.

Scheduling information includes:

-   Frequency
-   Run time
-   Day of week
-   Day of month

Example daily schedule:

``` json
{
  "frequency": "daily",
  "run_time": "20:00:00",
  "day_of_week": null,
  "day_of_month": null
}
```

### Report Export

Reports can be exported in:

-   CSV
-   PDF

The export request supports:

-   Filters
-   Sorting
-   Result limit

Example:

``` json
{
  "filters": [
    {
      "field_name": "borrowed_count",
      "operator": "greater_than",
      "value": "100"
    }
  ],
  "sort_by": "borrowed_count",
  "sort_order": "desc",
  "limit": 20
}
```

### Audit Logs

The Audit Logs module records important user and system actions
performed within the application.

### User Management

The User Management module provides administrative functionality for
managing application users.

Typical operations include:

-   Viewing users
-   Creating users
-   Updating users
-   Deleting users

## Supported Data Sources

The application supports the following datasets:

-   `customers`
-   `sales`
-   `employee_performance`
-   `library_books`

### Customers

The customers dataset supports customer-related reporting and analytics.

### Sales

The sales dataset supports sales-related reporting and analytics.

### Employee Performance

The employee performance dataset supports employee performance reporting
and analytics.

### Library Books

The library books dataset supports library-related reporting and
analytics.

The dataset includes fields such as:

-   `id`
-   `book_title`
-   `author`
-   `category`
-   `publisher`
-   `year_published`
-   `copies_available`
-   `borrowed_count`
-   `rating`
-   `member_type`
-   `last_borrowed_date`

Example library report:

``` text
Report: Recently Published Library Books

Data source: library_books

Filter:
year_published >= 2020

Sort:
year_published DESC

Limit:
20
```

Another example:

``` text
Report: Books With Low Availability

Data source: library_books

Filter 1:
copies_available < 3

Filter 2:
borrowed_count > 50

Sort:
borrowed_count DESC

Limit:
20
```

## Backend

The backend provides APIs for:

-   Reports
-   Analytics
-   Templates
-   Scheduling
-   Sharing
-   Exports
-   Audit logs
-   User management

The backend is organized into layers such as:

-   Models
-   Schemas
-   Routers
-   Services
-   Database configuration

### Data Source Mapping

The analytics functionality supports these data sources:

``` text
customers
sales
employee_performance
library_books
```

### OpenAPI

When the backend is running, the OpenAPI specification is available at:

``` text
/openapi.json
```

Swagger UI can be used to test the backend endpoints independently from
the frontend.

## Frontend

The frontend provides the user interface for the reporting platform.

Major pages/modules include:

-   Login
-   Register
-   Dashboard
-   Reports
-   Report Builder
-   Templates
-   Shared Reports
-   Report Schedules
-   Exports
-   Audit Logs
-   User Management

### Main Routes

``` text
/login
/register
/dashboard
/reports
/reports/create
/reports/:reportId/builder
/templates
/shared-reports
/schedules
/exports
/audit-logs
/admin/users
```

## Typical Report Workflow

``` text
Login
  ↓
Dashboard
  ↓
Reports
  ↓
Create Report
  ↓
Select Data Source
  ↓
Configure Filters
  ↓
Configure Sorting / Grouping
  ↓
Save Report
  ↓
Execute Report
  ↓
View Results
  ↓
Share / Schedule / Export
```

## Testing Through Swagger

Swagger can be used to verify backend functionality before testing the
frontend.

Recommended testing order:

1.  Verify available endpoints.
2.  Test the supported data sources.
3.  Create a report.
4.  Execute the report.
5.  Test filters.
6.  Test sorting and limits.
7.  Create a template.
8.  Create a schedule.
9.  Test report sharing.
10. Test CSV export.
11. Test PDF export.
12. Test analytics.
13. Test audit logs.
14. Test user management.

Swagger testing helps distinguish backend API issues from frontend
routing and request-payload issues.

## Testing Checklist

### Authentication

-   [ ] Login works
-   [ ] Registration works
-   [ ] Protected routes require authentication

### Reports

-   [ ] Reports page loads
-   [ ] Create Report opens Report Builder
-   [ ] Data sources are displayed
-   [ ] Filters can be created
-   [ ] Reports can be executed
-   [ ] Sorting works
-   [ ] Limits work

### Analytics

-   [ ] Analytics executes successfully
-   [ ] Filters work
-   [ ] Grouping works
-   [ ] Aggregations work
-   [ ] Sorting works
-   [ ] All supported data sources work

### Templates

-   [ ] Template creation works
-   [ ] Templates can be listed
-   [ ] Templates can be reused
-   [ ] Template configuration is saved correctly

### Scheduling

-   [ ] Schedule creation works
-   [ ] Daily scheduling works
-   [ ] Weekly scheduling works
-   [ ] Monthly scheduling works

### Sharing

-   [ ] Reports can be shared
-   [ ] Shared reports can be accessed according to permissions

### Exports

-   [ ] CSV export works
-   [ ] PDF export works
-   [ ] Exported data respects filters
-   [ ] Exported data respects sorting
-   [ ] Exported data respects limits

### Administration

-   [ ] Audit logs load
-   [ ] User management loads
-   [ ] Users can be created
-   [ ] Users can be updated
-   [ ] Users can be deleted

## Project Structure

``` text
project/
├── backend/
│   └── app/
│       ├── models/
│       ├── routers/
│       ├── schemas/
│       ├── services/
│       └── ...
│
└── frontend/
    └── src/
        ├── components/
        ├── layout/
        ├── pages/
        ├── routes/
        ├── services/
        ├── types/
        └── ...
```

## Frontend Design

The frontend follows a clean dashboard-oriented design with:

-   Sidebar navigation
-   Dashboard cards
-   Report tables
-   Report configuration forms
-   Filter controls
-   Export controls
-   Administrative pages

The UI uses a soft, modern visual theme with light backgrounds and
highlighted interface elements.

## Development Notes

When making changes:

1.  Keep the backend API contract as the source of truth.
2.  Verify backend endpoints through Swagger before debugging frontend
    behavior.
3.  Keep report filters consistent between report execution and exports.
4.  Keep frontend routes synchronized with sidebar navigation.
5.  Use configured data-source names exactly.
6.  Preserve existing request and response schemas when extending
    functionality.

## Conclusion

The Smart Reports & Analytics Platform combines report creation,
analytics, reusable templates, scheduling, sharing, exports, audit
logging, and user administration into a single reporting application.
