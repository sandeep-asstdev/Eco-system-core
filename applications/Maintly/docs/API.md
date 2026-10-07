# MAINTLY REST API Reference

All requests require the `Authorization: Bearer <JWT_TOKEN>` header unless otherwise stated.

## 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with corporate credentials (`email`, `password`). Returns JWT token and sanitized user profile with tenant and branch access.
- `GET /api/auth/me`: Retrieve fresh profile of current authenticated user.
- `POST /api/auth/change-password`: Update account password.

## 2. Organization (`/api/org`)
- `GET /api/org/tenants`: List accessible tenants.
- `POST /api/org/tenants`: Provision new tenant (Platform Admin only).
- `GET /api/org/brands`: List brands within tenant.
- `POST /api/org/brands`: Create brand (Admin only).
- `GET /api/org/branches`: List branches within tenant (scoped to assigned branches for non-admins).
- `POST /api/org/branches`: Create branch (Admin only).
- `GET /api/org/departments`: List departments within tenant.
- `GET /api/org/users`: List users with branch access mappings and roles.
- `POST /api/org/users`: Create organization user and assign branches.
- `PUT /api/org/users/:id`: Update user role, status, or branch authorizations.

## 3. Maintenance Operations (`/api/maintenance`)
- `GET /api/maintenance/types`: List master maintenance work categories.
- `POST /api/maintenance/types`: Add configurable work category.
- `PUT /api/maintenance/types/reorder`: Drag-and-drop sort order update (`items: [{ id, sortOrder }]`).
- `GET /api/maintenance/requests`: List requests with full filters:
  - `view`: `new`, `waiting_approval`, `wip`, `purchase`, `rejections`, `high_priority`, `overdue`, `low_priority`, `dissatisfied`, `completed`, `medium_priority`, `closed`, `all`.
  - `search`, `priority`, `branchId`, `maintenanceTypeId`, `startDate`, `endDate`, `page`, `limit`.
- `GET /api/maintenance/requests/:id`: Full details of request including status history, assignments, comments, materials, attachments, and linked purchases.
- `POST /api/maintenance/requests`: Submit new maintenance request. Auto-generates `REQ-YYYY-XXXX`.
- `PUT /api/maintenance/requests/:id/approve`: Approve request (Approver/Manager/Admin).
- `PUT /api/maintenance/requests/:id/reject`: Reject request with mandatory `rejectionReason`.
- `PUT /api/maintenance/requests/:id/assign`: Assign/reassign technician with historical audit tracking.
- `PUT /api/maintenance/requests/:id/status`: Update execution status (`IN_PROGRESS`, `WAITING_FOR_PURCHASE`, `WAITING_FOR_VENDOR`, `COMPLETED`).
- `POST /api/maintenance/requests/:id/comments`: Add collaboration note or update.
- `POST /api/maintenance/requests/:id/materials`: Log consumed materials/parts with unit and total cost.
- `POST /api/maintenance/requests/:id/attachments`: Upload photos or PDF documents (Multer multipart).
- `PUT /api/maintenance/requests/:id/satisfaction`: Feedback review (`SATISFIED` -> `CLOSED`, `DISSATISFIED` -> `REOPENED`).

## 4. Vendors & Procurement (`/api/vendors` & `/api/purchases`)
- `GET /api/vendors`: List approved external vendor partners.
- `POST /api/vendors`: Register new vendor.
- `GET /api/purchases`: List purchase requisitions.
- `POST /api/purchases`: Raise purchase request linked to maintenance task (auto-transitions request to `WAITING_FOR_PURCHASE`).
- `POST /api/purchases/:id/quotations`: Add vendor quote.
- `PUT /api/purchases/:id/status`: Transition purchase request (`APPROVED`, `ORDERED`, `RECEIVED`). Marking `RECEIVED` automatically resumes the linked maintenance task back to `IN_PROGRESS`!

## 5. Dashboard & Analytics (`/api/dashboard` & `/api/reports`)
- `GET /api/dashboard/metrics`: Real PostgreSQL database metrics: 13 operational view counts, KPI summary cards, and distributions by Type, Branch, Priority, and Status.
- `GET /api/reports/summary`: Aggregate operational metrics, technician workload and resolution times, material expenditures.
- `GET /api/reports/export/csv`: Stream downloadable CSV report of maintenance records.

## 6. Notifications & Governance (`/api/notifications` & `/api/audit-logs`)
- `GET /api/notifications`: Retrieve unread and historical in-app notifications.
- `PUT /api/notifications/:id/read`: Mark single notification as read.
- `PUT /api/notifications/read-all`: Mark all notifications as read.
- `GET /api/audit-logs`: Query immutable security and operational audit trail (Admin only).
