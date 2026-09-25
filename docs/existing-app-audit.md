# Comprehensive Existing Applications Audit: HRFlow & Maintly

## Executive Summary

This document presents a deep-dive architectural and code audit of the two existing applications in the dealership ecosystem:
1. **HRFlow** (`applications/HRFlow`): Enterprise Human Resource Management System (HRMS) engineered for automobile dealerships.
2. **MAINTLY** (`applications/Maintly`): Multi-branch Maintenance & Operations Management System.

Both applications represent mature, production-grade applications built on the PERN stack (PostgreSQL, Express, React, Node.js) using **pure JavaScript (`.js` and `.jsx`)** with zero TypeScript or MongoDB dependencies.

This audit evaluates their current architecture, data models, authentication mechanisms, organizational structures, duplicated features, integration points, migration risks, and the step-by-step preservation plan.

---

## 1. Application-by-Application Audit

### 1.1 HRFlow (HRMS Application)

#### Location & Codebase
- **Root Path**: `applications/HRFlow`
- **Backend**: `applications/HRFlow/backend` (CommonJS Node.js + Express)
- **Frontend**: `applications/HRFlow/frontend` (React 18 + Vite + Tailwind CSS + Lucide React)
- **ORM & Database**: Prisma 5.22.0 targeting PostgreSQL 18 on port 5433 (`hrflow_db`)

#### Backend Architecture
- **Module System**: CommonJS (`require` / `module.exports`)
- **Server Entry**: `src/server.js` listening on port `5000` (configurable via `process.env.PORT`)
- **App Configuration**: `src/app.js` mounting 17 domain modules:
  - `/api/auth`: Login, registration, demo role switching, `/me` profile.
  - `/api/tenants`: Platform admin tenant management (SaaS provisioning).
  - `/api/branches`: Branch CRUD scoped to tenant.
  - `/api/organization-masters`: 10-tier `EmployeeLevel` hierarchy and 101 automotive `Designation` master.
  - `/api/employees`: Complete 10-tab dossier (demographics, KYC, statutory, salary, assets, documents, transfers).
  - `/api/vacancies`, `/api/joining`, `/api/approvals`, `/api/payroll`, `/api/advances`, `/api/attendance`, `/api/exit`, `/api/reports`, `/api/notifications`, `/api/audit`, `/api/search`, `/api/files`.

#### Data Model & Prisma Schema (`HRFlow/backend/prisma/schema.prisma`)
- **Total Models**: 25 models, 19 enums.
- **Core Tenant & Org Entities**:
  - `Tenant`: `id` (UUID), `organizationName`, `legalName`, `code` (unique), `subscriptionPlan`, `status` (ACTIVE/INACTIVE/SUSPENDED), `settings` (JSON), `features` (JSON).
  - `Branch`: `id`, `tenantId`, `code`, `name`, `city`, `state`, `address`, `phone`, `email`, `active`. Unique on `[tenantId, code]`.
  - `User`: `id`, `email`, `passwordHash`, `role` (`PLATFORM_ADMIN`, `HR`, `BM`, `EMPLOYEE`), `status`, `tenantId`, `branchId`, `employeeId`.
  - `EmployeeLevel`: `id`, `tenantId`, `levelNumber` (1-10), `name`, `description`, `isActive`. Unique on `[tenantId, levelNumber]`.
  - `Designation`: `id`, `tenantId`, `levelId`, `name`, `code`, `description`, `isActive`. Unique on `[tenantId, name]`.
  - `Employee`: `id`, `tenantId`, `employeeCode`, `firstName`, `lastName`, `email`, `phone`, `gender`, `dob`, `branchId`, `department` (String), `designation` (String), `levelId`, `designationId`, `reportingManagerId`, `dateOfJoining`, `employmentType`, `status`. Unique on `[tenantId, employeeCode]` and `[tenantId, email]`.
  - `EmployeeAsset`: IT assets (`LAPTOP`, `SIM`, `DESKTOP`, `MOBILE`, `OTHER`) issued to employees during joining/tenure.

#### Authentication & Authorization
- **Mechanism**: Local JWT signed with HMAC-SHA256 (`jsonwebtoken`), verified in `src/middleware/auth.js`.
- **RBAC**: Static role checks (`src/middleware/rbac.js`) validating against `req.user.role` from `['PLATFORM_ADMIN', 'HR', 'BM', 'EMPLOYEE']`.
- **Tenant Isolation**: Extracted `req.tenantId` from JWT, verified against DB `User` and enforced on Prisma queries.
- **Frontend Auth**: `AuthContext.jsx` storing JWT in `localStorage.getItem('hrflow_token')`.

#### Automated Tests
- 65 unit and integration tests across 3 test suites:
  - `tests/levelsDesignations.test.js`: Hierarchy, cascading lookups, duplicate detection.
  - `tests/crossTenantSecurity.test.js`: Cross-tenant isolation verification.
  - `tests/api.test.js`: Auth flow, vacancies, employee onboarding, payroll.

---

### 1.2 MAINTLY (Maintenance & Operations Application)

#### Location & Codebase
- **Root Path**: `applications/Maintly`
- **Backend**: `applications/Maintly/backend` (ES Modules Node.js + Express)
- **Frontend**: `applications/Maintly/frontend` (React 18 + Vite + Tailwind CSS + Lucide React)
- **ORM & Database**: Prisma 5.22.0 targeting PostgreSQL 18 on port 5433 (`maintly_db`)

#### Backend Architecture
- **Module System**: ES Modules (`"type": "module"`, `import` / `export`)
- **Server Entry**: `src/server.js` listening on port `5000` (configurable via `ENV.PORT`)
- **App Configuration**: Modular architecture with routes:
  - `/api/auth`: Login, me, password hashing, session restore.
  - `/api/org`: Tenants, brands, branches, departments, branch-departments, branch-areas, users.
  - `/api/maintenance`: Maintenance types, maintenance requests, approval, assignment, work status, satisfaction verification, comments, materials, attachments.
  - `/api/vendors`: Vendor directory, categories, GSTIN, contacts.
  - `/api/purchases`: Purchase requests, purchase items, quotations, PO tracking.
  - `/api/dashboard`: 13 operational view counters, KPIs, distribution metrics.
  - `/api/reports`, `/api/notifications`, `/api/audit-logs`.

#### Data Model & Prisma Schema (`Maintly/backend/prisma/schema.prisma`)
- **Total Models**: 16 models, 7 enums.
- **Core Tenant & Org Entities**:
  - `Tenant`: `id`, `name`, `slug` (unique), `code` (unique), `logo`, `logoUrl`, `status`, `timezone`, SLA configuration (`graceHours`, `targetHoursHigh`, `targetHoursMedium`, `targetHoursLow`), `approvalRequired`, `workflowConfig`.
  - `Brand`: `id`, `tenantId`, `name`, `code`, `description`, `isActive`. Unique on `[tenantId, code]`.
  - `Branch`: `id`, `tenantId`, `brandId` (optional), `name`, `code`, `address`, `city`, `state`, `pincode`, `isActive`. Unique on `[tenantId, code]`.
  - `Department`: `id`, `tenantId`, `name`, `code`, `description`, `isActive`. Unique on `[tenantId, code]`.
  - `BranchDepartment`: Junction model linking `Branch` and `Department`. Unique on `[branchId, departmentId]`.
  - `BranchArea`: Sub-locations within a branch (e.g. "Bay 3", "Customer Lounge", "Paint Booth"). Unique on `[branchId, code]`.
  - `User`: `id`, `tenantId`, `email`, `passwordHash`, `firstName`, `lastName`, `phone`, `role`, `status`, `avatarUrl`.
  - `UserBranchAccess`: Multi-branch authorization mapping users to multiple branches (`[userId, branchId]`).
- **Operational Entities**:
  - `MaintenanceRequest`: End-to-end maintenance ticket with lifecycle stages:
    `NEW → WAITING_FOR_APPROVAL → APPROVED → ASSIGNMENT → IN_PROGRESS → PURCHASE/VENDOR → COMPLETION → SATISFACTION → CLOSED`.
  - `MaintenanceType`: Configurable categorization (e.g. Electrical, HVAC, Mechanical, Civil, IT).
  - `PurchaseRequest`, `PurchaseItem`, `Quotation`, `Vendor`.

#### Authentication & Authorization
- **Mechanism**: Local JWT signed with HMAC-SHA256 (`jsonwebtoken`), verified in `src/middleware/auth.js`.
- **RBAC**: Granular roles: `PLATFORM_ADMIN`, `TENANT_ADMIN`, `MANAGER`, `APPROVER`, `MAINTENANCE_USER`, `PURCHASE_USER`, `EMPLOYEE`.
- **Multi-Branch Access**: `UserBranchAccess` allows users to operate in primary and secondary branches.
- **Frontend Auth**: `AuthContext.jsx` storing JWT in `localStorage.getItem('maintly_token')`.

#### Automated Tests
- 4 end-to-end test suites executed via `tests/runAll.js`:
  - `tests/tenantIsolation.test.js`: Strict multi-tenant isolation.
  - `tests/rbac.test.js`: Role enforcement and privilege boundaries.
  - `tests/workflow.test.js`: Complete 8-stage lifecycle validation.
  - `tests/overdue.test.js`: SLA calculation and breach detection.

---

## 2. Comparative Analysis & Architectural Divergence

| Architectural Dimension | HRFlow | MAINTLY | Central Ecosystem Target (`ecosystem-core`) |
|---|---|---|---|
| **Module System** | CommonJS (`require`) | ES Modules (`import`) | ES Modules (`import`) |
| **Default Port** | Backend: 5000 / Web: 5173 | Backend: 5000 / Web: 5173 | Core API: 4000 / Portal: 3000 / HR: 5001/3001 / Maint: 5002/3002 |
| **Database** | `hrflow_db` (PG 18, port 5433) | `maintly_db` (PG 18, port 5433) | `ecosystem_core_db` (PG 18, port 5433) |
| **Tenant Model** | Has `organizationName`, `legalName`, `subscriptionPlan`, `settings`, `features` | Has `name`, `slug`, `timezone`, SLA configs | Comprehensive `Tenant` + `Firm` + `Brand` + `FirmBrand` + Subscriptions |
| **Brands & Firms** | Not modeled | Has `Brand`, No `Firm` | Fully modeled: Dealership Group (`Tenant`) → Legal Companies (`Firm`) → OEM Franchises (`Brand`) |
| **Departments** | Stored as String on Employee | Normalized table `Department` + `BranchDepartment` | Normalized central `Department` with firm/branch association |
| **User Roles** | 4 static roles: `PLATFORM_ADMIN`, `HR`, `BM`, `EMPLOYEE` | 7 roles: `PLATFORM_ADMIN`, `TENANT_ADMIN`, `MANAGER`, `APPROVER`, `MAINTENANCE_USER`, `PURCHASE_USER`, `EMPLOYEE` | Scoped RBAC: Granular permissions (`domain.entity.action`) mapped to customizable Roles |
| **Branch Access** | Single `branchId` foreign key on User | Multi-branch table `UserBranchAccess` with `isPrimary` | Central `OrganizationMembership` supporting multi-scope assignments |
| **Authentication** | Local JWT in `localStorage` | Local JWT in `localStorage` | Keycloak OpenID Connect + PKCE, Central SSO, no sensitive tokens in localStorage |
| **Assets** | Employee IT Assets (`LAPTOP`, `SIM`) | No Asset registry (requests reference freeform location) | Shared Asset registry in Maintenance with employee reference from HR |

---

## 3. Duplicated Functionality & Integration Opportunities

### Duplicated Functionality
1. **User Identity & Credential Store**: Both maintain independent `User` tables with bcrypt password hashing. A dealership employee currently requires two separate logins.
2. **Tenant Onboarding & Settings**: Both implement separate tenant status switches, tenant settings, and tenant metadata.
3. **Branch Master**: Both maintain branch tables (`Branch`) with slight variations in column definitions.
4. **Audit Logging**: Both record user actions into their own local `AuditLog` tables.
5. **Notification Engine**: Both maintain in-app notification records in local `Notification` tables.

### Integration Opportunities
1. **Unified Identity & Single Sign-On (SSO)**:
   - Centralize users into Keycloak and `ecosystem-core`.
   - Dealership staff log in once at the Ecosystem Portal and launch HRFlow or MAINTLY seamlessly without re-authenticating.
2. **Central Organization Hierarchy**:
   - Single authoritative source for Dealership Groups, Legal Entities (Firms), Brands, Branches, and Departments.
   - HRFlow and MAINTLY reference these canonical IDs.
3. **Cross-Application Operational Workflows**:
   - **HR → Maintenance Employee Provisioning**: When a technician or manager is onboarded in HRFlow, an integration event or sync endpoint provisions their employee reference in MAINTLY with assigned branch and department.
   - **Maintenance → HR Asset & Clearance Tracking**: When an employee resigns in HRFlow, HRFlow queries or listens for Maintenance clearances to ensure company property and assigned equipment are returned before Full & Final (F&F) settlement.

---

## 4. Migration Risks & Breaking Change Mitigation

### Critical Risk 1: Destructive Database Migrations
- **Hazard**: Running `prisma db push` or migrations that alter existing columns could wipe operational records or break application-specific relations.
- **Mitigation**:
  - Zero modifications to existing primary keys (`id`) or required columns.
  - Non-breaking additive columns only: `centralTenantId`, `centralBranchId`, `centralUserId`, `centralEmployeeId` (all nullable with index).
  - Existing tables and relations remain 100% operational.

### Critical Risk 2: Existing Automated Test Regressions
- **Hazard**: Both HRFlow (65 tests) and MAINTLY (4 suites) rely on local JWT authentication (`/api/auth/login`) in their test runners. Switching to Keycloak could break the entire test suite if not designed carefully.
- **Mitigation**:
  - Implement a **Dual-Mode Authentication Adapter**:
    1. Primary mode: Keycloak OIDC JWT token validation (for SSO portal & modern requests).
    2. Fallback mode: Local HMAC JWT verification (preserves 100% backward compatibility for existing tests and legacy endpoints).
  - All existing unit, security, and workflow tests pass without modification.

### Critical Risk 3: Port and Host Collisions
- **Hazard**: Both apps default to `PORT=5000` for backend and `5173` for frontend.
- **Mitigation**:
  - Allocate distinct, non-conflicting local development ports:
    - **Ecosystem Core API**: `4000`
    - **Ecosystem Portal Web**: `3000`
    - **HRFlow Backend API**: `5001`
    - **HRFlow Frontend Web**: `3001`
    - **MAINTLY Backend API**: `5002`
    - **MAINTLY Frontend Web**: `3002`
    - **Keycloak Identity Provider**: `8080`
    - **PostgreSQL 18**: `5433` (databases: `ecosystem_core_db`, `hrflow_db`, `maintly_db`)
    - **Nginx API Gateway**: `80` (routing `/api/core`, `/api/hr`, `/api/maintenance`, `/`)

---

## 5. Non-Destructive Integration Strategy

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    KEYCLOAK 24+                        │
                               │          Central OpenID Connect Provider               │
                               │       Realm: automobile-dealership-network             │
                               └───────────┬────────────────┬───────────────────────────┘
                                           │                │
                        OIDC Token (RS256) │                │ OIDC Token (RS256)
                                           ▼                ▼
                             ┌───────────────────┐    ┌───────────────────┐
                             │  ECOSYSTEM PORTAL │    │   NGINX GATEWAY   │
                             │  (Port 3000 Web)  │    │     (Port 80)     │
                             └─────────┬─────────┘    └─────────┬─────────┘
                                       │                        │
       ┌───────────────────────────────┼────────────────────────┼───────────────────────────────┐
       ▼                               ▼                        ▼                               ▼
┌───────────────┐              ┌───────────────┐        ┌───────────────┐               ┌───────────────┐
│ECOSYSTEM CORE │              │    HRFLOW     │        │    MAINTLY    │               │  FUTURE APPS  │
│  (Port 4000)  │              │  (Port 5001)  │        │  (Port 5002)  │               │ (CRM, Bills)  │
├───────────────┤              ├───────────────┤        ├───────────────┤               ├───────────────┤
│• Multi-Tenant │              │• Employee DB  │        │• Tickets & SLA│               │• Enquiry CRM  │
│• Firms/Brands │◄────────────►│• Payroll/Att  │◄──────►│• Purchases    │               │• Inventory    │
│• Scoped RBAC  │ Integration  │• Vacancies    │ Events │• Vendors      │               │• Vehicle Sale │
│• App Registry │    Events    │• Onboarding   │ (Sync) │• Assets Mgt   │               │               │
├───────────────┤              ├───────────────┤        ├───────────────┤               ├───────────────┤
│ecosystem_core │              │   hrflow_db   │        │   maintly_db  │               │  app_spec_db  │
│   (PG 18)     │              │    (PG 18)    │        │    (PG 18)    │               │    (PG 18)    │
└───────────────┘              └───────────────┘        └───────────────┘               └───────────────┘
```

### Files & Schemas Requiring Modification in Phase 5 & 6 (Integration Phases)

#### In `applications/HRFlow`:
1. `backend/.env.example` and `.env`: Update port to `5001`, add Keycloak config.
2. `backend/src/middleware/auth.js`: Implement dual-token verifier (Keycloak OIDC JWT + legacy JWT).
3. `backend/prisma/schema.prisma`: Add `centralTenantId`, `centralBranchId`, `centralUserId` to `Tenant`, `Branch`, `User` respectively.
4. `backend/src/modules/employees/employeeController.js`: Dispatch webhook / event on employee creation/update.
5. `frontend/.env.example` and `.env`: Update port to `3001`, update backend URL to `http://localhost:5001`.
6. `frontend/src/context/AuthContext.jsx`: Integrate SSO token reception from Ecosystem Portal.

#### In `applications/Maintly`:
1. `backend/.env.example` and `.env`: Update port to `5002`, add Keycloak config.
2. `backend/src/middleware/auth.js`: Implement dual-token verifier (Keycloak OIDC JWT + legacy JWT).
3. `backend/prisma/schema.prisma`:
   - Add `centralTenantId`, `centralFirmId`, `centralBrandId`, `centralBranchId` to org models.
   - Add `EmployeeReference` model for cached HR employee metadata (ID, code, name, email, phone, branchId, department, status).
   - Add `Asset` and `AssetAssignment` models to support enterprise asset maintenance.
4. `backend/src/modules/maintenance/`: Update request creation to allow selection from synced employee references.
5. `frontend/.env.example` and `.env`: Update port to `3002`, update backend URL to `http://localhost:5002`.
6. `frontend/src/context/AuthContext.jsx`: Integrate SSO token reception from Ecosystem Portal.

---

## 6. Audit Conclusion & Readiness

Both applications are clean, robust, and adhere to strict multi-tenant boundaries. Their code patterns are compatible with the centralized ecosystem architecture. We can proceed with constructing `ecosystem-core` without destabilizing existing code or databases.
