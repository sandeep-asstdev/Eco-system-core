# MAINTLY Engineering Progress Log (AI Context)

## Project Summary
- **Application**: MAINTLY ("Internal Maintenance & Operations Management")
- **Stack**: PERN Stack (PostgreSQL 18.6 on Port 5433, Express.js 4, React 18, Node.js 24)
- **Language**: Pure JavaScript / JSX (Strictly 0 TypeScript files)
- **Design Standard**: Clean Light Theme enterprise standard (Tailwind CSS 3, Lucide React, Plus Jakarta Sans)
- **Multi-Tenancy Model**: Fully scalable, flexible multi-tenant platform with zero hardcoding of tenant names, brands, branches, departments, workflows, or SLA rules.
  - **Tenant #1**: Bellad & Groups (17 automotive brands, 37 branches, 32 departments, branch-department mappings, branch areas, 10 work types, 12h grace SLA).
  - **Tenant #2**: OmniLogistics Supply Chain Ltd (different procedures: `approvalRequired: false`, direct dispatch, 6h grace SLA, custom prefix `OMNI-MAIN`).

---

## Architecture & Flexibility Highlights

### 1. Zero Hardcoding Policy
- No `if (tenant === 'Bellad')` or static lists anywhere in frontend or backend code.
- All organizational hierarchies, branch-department mappings, branch areas, maintenance types, SLA thresholds, and procedure settings are stored in PostgreSQL 18 and fetched dynamically.

### 2. Tenant Procedural Flexibility
- **Approval Procedures**:
  - Configurable per tenant: `approvalRequired` (boolean).
  - When enabled: Requests enter `WAITING_FOR_APPROVAL` and require Manager/Approver review before assignment.
  - When disabled (lean/logistics operations): Requests go directly to `ASSIGNED` or allow direct dispatch.
- **SLA & 12-Hour Grace Engine**:
  - Configurable per tenant: `graceHours` (e.g. 12.0h for Bellad, 6.0h for OmniLogistics).
  - Configurable priority deadlines: `targetHoursHigh`, `targetHoursMedium`, `targetHoursLow`, `targetHoursCritical`.
  - Three-tier status classification: `ON_TIME`, `WITHIN_GRACE`, `OVERDUE`.
- **Sequential Collision-Safe Request Numbering**:
  - Formatted dynamically using tenant's custom prefix: `{requestPrefix}-YYYY-XXXXXX` (e.g., `BELL-MAIN-2026-000001`, `OMNI-MAIN-2026-000001`).
- **Workflow State Transition Engine**:
  - `workflow.service.js` enforces state transitions and RBAC permissions while supporting tenant-specific custom transition matrices (`tenant.workflowConfig` / `tenant.features`).

### 3. Comprehensive 43-Variable System
All 43 variables are fully stored in the schema, served via API, and presented across 6 thematic panels on `RequestDetails.jsx`:
1. **Request Variables (1-10)**: Tracking ID, Brand, Branch, Allowed Department, Branch Area, Equipment/Asset Name, Detailed Problem Description, Urgency/Priority, Created Date/Time, Requester Contact & Details.
2. **Approval Variables (11-15)**: Approval Status, Approver Name, Approval/Rejection Timestamp, Rejection Reason, Approval Copy Document URL.
3. **Assignment Variables (16-22)**: Assigned Technician/Executive, Executive Contact, Assigned Date/Time, Dispatching Manager, Manager Contact, Action Plan, Assignment Latency (minutes).
4. **Execution Variables (23-29)**: Lifecycle Work Status, Operational Execution Status, Started At, Completed At, Total Actual Resolution Hours, Technical Completion Remarks, Rectification Done State.
5. **Procurement Variables (30-38)**: Purchase Required Flag, Purchase Status, Estimated Cost, Actual Cost, Linked Purchase Orders, Requisitioned Consumables, Purchase Remarks.
6. **Timing & SLA Compliance (39-43)**: Target SLA Hours, Configured Grace Period, Absolute Deadline, SLA Variance/Difference, SLA Compliance Classification (`ON_TIME`, `WITHIN_GRACE`, `OVERDUE`).
- **Quality & Satisfaction Verification**: Checked-Off operational toggle, Dissatisfaction alerts with customer comments, and Verified Completion.

---

## Completed Phases

### Phase 1: Database & Schema Sync (PostgreSQL 18.6)
- Connected to PostgreSQL 18 on port 5433 (`maintly_db`).
- Normalized Prisma schema with `BranchDepartment`, `BranchArea`, `Tenant` SLA configuration (`graceHours`, `targetHoursHigh/Medium/Low`, `approvalRequired`, `requestPrefix`), and all 43 business variables.
- Synced using `npx prisma db push` and `npx prisma generate`.

### Phase 2: Seeding & Master Data
- Scripted `backend/prisma/seed.js`:
  - **Tenant 1**: Bellad & Groups (17 brands, 37 branches, 32 departments, branch mappings, branch areas, 10 work types, 7 users, sample requests in various states).
  - **Tenant 2**: OmniLogistics (different branches, fleet departments, `approvalRequired: false`, 6h grace SLA).
  - All users seeded with password `Admin@123`.

### Phase 3: REST API & Business Engines
- `workflow.service.js`: Configurable state transition matrix and role permissions with tenant config overrides.
- `sla.service.js`: Priority target resolution times, 12h grace calculations, and live duration countdowns.
- `import.controller.js`: Bulk legacy data import with column normalization.
- `maintenance.controller.js`: Sequential IDs, assignment latency, execution tracking, checkedOff toggle, correction status, and satisfaction verification.
- `org.controller.js`: Branch-department mappings, branch areas, and tenant settings CRUD.
- `dashboard.controller.js`: "MY ACTIONS" personal action center and 13 operational view counters.

### Phase 4: Automated Testing
- Executed `npm run test` against PostgreSQL 18 on port 5433.
- **All 5 Test Suites Passed (100% Success)**:
  - Test 1: Multi-Tenant Data Isolation (zero cross-tenant leakage).
  - Test 2: Role-Based Access Control (strict role gating).
  - Test 3: End-to-End Workflow Lifecycle (Create -> Approve -> Assign -> WIP -> Material -> Complete -> Reopen -> Close).
  - Test 4: SLA & 12-Hour Grace Period Calculations.
  - Test 5: Branch-Department Mappings & Configurable Areas.

### Phase 5: Enterprise Frontend
- `Dashboard.jsx`: "MY ACTIONS" personal action queue + 13 clickable operational cards + distribution charts.
- `Requests.jsx`: 6-step request creation modal with dynamic cascading Brand -> Branch -> Allowed Departments -> Branch Areas, checked-off badges, and 13-tab carousel.
- `RequestDetails.jsx`: Comprehensive presentation of all 43 variables across 6 panels, checked-off switch, correction modal, action plan, and live SLA 12h grace metrics.
- `TenantSettings.jsx`: Administration UI for organization identity, custom ID prefix, approval procedures, SLA grace hours, branch-department mappings, and custom branch areas.
- Production build verified with `npm run build` (0 errors).

---

## Verification & Status
- **Backend**: Port 5000 (connected to PostgreSQL 18.6 on port 5433).
- **Frontend**: Port 5173 (Vite + React 18).
- **Automated Tests**: 5/5 Passing (100%).
