# MAINTLY — Internal Maintenance & Operations Management System

![PERN Stack](https://img.shields.io/badge/Stack-PostgreSQL%2018%20%7C%20Express%20%7C%20React%20%7C%20Node-4f46e5?style=for-the-badge)
![Language](https://img.shields.io/badge/Language-Pure%20JavaScript%20%2F%20JSX-f59e0b?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-4%2F4%20Suites%20Passing-10b981?style=for-the-badge)
![Security](https://img.shields.io/badge/Multi--Tenant%20Isolation-Strict-8b5cf6?style=for-the-badge)

**MAINTLY** is a production-grade, internal multi-tenant Maintenance & Operations Management System built on the **PERN stack** (PostgreSQL 18, Express.js, React, Node.js) in **pure JavaScript (`.js` and `.jsx`)**.

It is engineered for multi-branch, multi-brand companies to replace spreadsheets, paper records, WhatsApp messages, and fragmented communication with an end-to-end controlled operational workflow:

```
REQUEST → APPROVAL → ASSIGNMENT → EXECUTION → PURCHASE/VENDOR → COMPLETION → VERIFICATION → CLOSURE
```

---

## 🚀 Quick Start Guide

### 1. Database Prerequisite (PostgreSQL 18)
MAINTLY is configured to run against PostgreSQL 18 on port 5433 with database `maintly_db`.

To start PostgreSQL 18:
```cmd
start-db.bat
```

### 2. Backend API Setup
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run test
npm start
```
The REST API will be active at `http://localhost:5000`.

### 3. Frontend Web Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Login Credentials

The database is pre-seeded with 8 active demo accounts across all 7 supported roles (Password: `Admin@123`):

| Role | Email | Description |
|---|---|---|
| **TENANT_ADMIN** | `tenantadmin@maintly.com` | Full organizational oversight (Apex Automotive Group) |
| **MANAGER** | `manager@maintly.com` | Branch operations manager (Assignment, Rejection, SLAs) |
| **APPROVER** | `approver@maintly.com` | Authorized approver for maintenance requests |
| **MAINTENANCE_USER** | `tech@maintly.com` | Field maintenance technician (Status updates, Materials) |
| **PURCHASE_USER** | `purchase@maintly.com` | Procurement officer (Quotations, Purchase orders) |
| **EMPLOYEE** | `employee@maintly.com` | Internal employee (Raise requests, Quality satisfaction) |
| **PLATFORM_ADMIN** | `platformadmin@maintly.com` | Global platform administrator (Multi-tenant governance) |
| **TENANT_ADMIN (B)** | `admin@omnilogistics.com` | OmniLogistics Corp (Used to demonstrate strict tenant isolation) |

> 💡 **Tip:** The login page and top navbar include a **1-Click Demo Switcher** allowing you to instantly switch roles without retyping passwords.

---

## 📊 Dashboard Operational Views (13 Database-Driven Sections)

The main dashboard provides real-time database queries matching operational requirements:

1. **New Requests**: Submitted requests awaiting initial triage.
2. **Waiting for Approval**: Requests gated behind approver authorization.
3. **Work in Progress**: Actively executed work by assigned technicians.
4. **For Purchase Team**: Tasks waiting for spare parts or vendor procurement.
5. **Request Rejections**: Terminated requests with mandatory rejection reasons.
6. **High Priority**: Urgent, business-critical maintenance issues.
7. **Overdue**: Automatic SLA breach detection (current time past `requiredDate`).
8. **Low Priority**: Routine, non-critical facility requests.
9. **Dissatisfied Tasks**: Tasks rejected by the requester upon verification and reopened.
10. **Work Done Status**: Tasks marked completed by technician awaiting employee review.
11. **Medium Priority**: Standard facility repairs.
12. **All Closed Tasks**: Successfully verified and closed requests.
13. **All Data**: Complete database listing across authorized branches.

*Every single card is interactive and directly navigates to the pre-filtered request listing.*

---

## 🛠 Project Structure

```
Maintly/
│
├── backend/                  # Node.js + Express + Prisma REST API
│   ├── src/
│   │   ├── config/           # Database & environment configurations
│   │   ├── middleware/       # JWT auth, RBAC guards, Multer upload, Error handler
│   │   ├── modules/          # Modular domain features:
│   │   │   ├── auth/         # Login, Session validation, Password hashing
│   │   │   ├── org/          # Tenants, Brands, Branches, Departments, Users
│   │   │   ├── maintenance/  # Requests, Approvals, Assignments, Materials, Attachments
│   │   │   ├── purchase/     # Requisitions, Quotations, POs, Receipt triggers
│   │   │   ├── vendor/       # External contractor directory
│   │   │   ├── dashboard/    # 13 Operational view counts, KPIs, Distribution charts
│   │   │   ├── reports/      # Workload metrics, Cost telemetry, CSV export
│   │   │   ├── notifications/# Live alert queue and badge counters
│   │   │   └── audit/        # Immutable governance records
│   │   └── server.js         # Express app initialization
│   ├── prisma/
│   │   ├── schema.prisma     # Normalized multi-tenant schema with relations & indexes
│   │   └── seed.js           # Multi-tenant demo dataset
│   └── tests/
│       ├── runAll.js         # Unified test runner
│       ├── tenantIsolation.test.js
│       ├── rbac.test.js
│       ├── workflow.test.js
│       └── overdue.test.js
│
├── frontend/                 # React 18 + Vite + Tailwind CSS (Pure JSX)
│   ├── src/
│   │   ├── components/       # Status badges, Modals, StatCards, Navbar, Sidebar
│   │   ├── context/          # AuthContext (with Demo Switcher) & NotificationContext
│   │   ├── layouts/          # MainLayout with responsive drawer and breadcrumbs
│   │   ├── pages/            # Dashboard, Requests, Details, Purchases, Vendors,
│   │   │                     # Reports, MasterData, Users, AuditLogs, Login
│   │   ├── services/         # Axios client with JWT interceptor
│   │   ├── App.jsx           # Protected routes
│   │   ├── index.css         # Custom typography and scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/                     # Complete architectural documentation:
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── WORKFLOW.md
│   ├── SECURITY.md
│   └── AI_PROGRESS.md
│
├── docker-compose.yml        # Production container specification
├── start-db.bat              # Instant PostgreSQL 18 runner
└── package.json              # Monorepo scripts
```

---

## 🧪 Automated Test Verification

Run the test suite from `backend`:
```bash
npm run test
```

Verification output:
```
======================================================
MAINTLY AUTOMATED ENTERPRISE TEST SUITE (POSTGRESQL 18)
======================================================

[TEST 1] Verifying Multi-Tenant Data Isolation...
✔ Multi-tenant isolation verified with zero leakage.
[TEST 2] Verifying Role-Based Access Control...
✔ RBAC security verified: Employees cannot approve requests.
[TEST 3] Verifying End-to-End Maintenance Workflow...
✔ Workflow lifecycle (Create -> Approve -> Assign -> WIP -> Complete -> Reopen -> Close) fully verified.
[TEST 4] Verifying SLA & Overdue Database Calculations...
✔ SLA detection verified: 2 overdue tasks correctly identified.

======================================================
🎉 ALL 4 TEST SUITES PASSED PERFECTLY (100% SUCCESS)
======================================================
```

---

## 🔒 Security Standards
1. **Server-Derived Identity**: The client never specifies `tenantId` or `branchId` for authorization. Everything is extracted from verified JWT tokens.
2. **Strict Multi-Tenant Isolation**: Tenant A users cannot access, query, or mutate Tenant B records.
3. **Branch-Level Access**: Non-administrators are bounded strictly to their assigned company branches.
4. **Immutable Audit Trail**: All actions (status changes, approvals, material additions, assignments) are permanently logged in `audit_logs`.
5. **Pure JavaScript**: Built strictly with `.js` and `.jsx` with zero TypeScript files.
