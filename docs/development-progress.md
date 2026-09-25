# Ecosystem Development Progress & Milestone Tracker

## Project Overview
- **Ecosystem**: Multi-Tenant Automobile Dealership Software Platform
- **Initial Applications**: HRFlow (HRMS) & MAINTLY (Operations & Maintenance)
- **Central Core**: `ecosystem-core` (Identity, Governance, Org Hierarchy, Scoped RBAC, App Registry)
- **Architecture Philosophy**: Pure JavaScript PERN Stack, PostgreSQL 18, Keycloak OIDC/SSO, Docker Compose, Nginx, RabbitMQ.

---

## Implementation Phase Status Summary

| Phase | Description | Status | Completion Target |
|---|---|---|---|
| **Phase 1** | Inspect Existing Apps & Prepare Architecture Documentation | **COMPLETED** | Day 1 |
| **Phase 2** | Create Ecosystem Core, Database Schema & Local Dev Infrastructure | **COMPLETED** | Milestone 2 |
| **Phase 3** | Keycloak Authentication, Organization Management & Scoped RBAC | **COMPLETED** | Milestone 3 |
| **Phase 4** | Ecosystem Portal & Application Registry | **COMPLETED** | Milestone 4 |
| **Phase 5** | Integrate HRFlow Application | **COMPLETED** | Milestone 5 |
| **Phase 6** | Integrate MAINTLY Application | **COMPLETED** | Milestone 6 |
| **Phase 7** | HR-to-Maintenance Employee Synchronization Workflow | **COMPLETED** | Milestone 7 |
| **Phase 8** | Modular, Extensible Automobile Ecosystem Platform | **COMPLETED** | Milestone 8 |
| **Phase 9** | Production Infrastructure & Commercial SaaS Readiness | **PLANNED** | Milestone 9 |

---

## Detailed Milestone Breakdown

### Phase 1: Inspect Existing Applications & Architecture Design
- [x] Inspect existing HRFlow application (`applications/HRFlow`).
- [x] Inspect existing MAINTLY application (`applications/Maintly`).
- [x] Identify frontend and backend architectures (PERN stack, Pure JS/JSX, zero TypeScript/MongoDB).
- [x] Audit Prisma schemas, models, enums, indexes, and database configurations.
- [x] Identify duplicated functionality (Users, Auth, Tenant config, Branch lists, Audit logs).
- [x] Identify migration risks and breaking changes (port conflicts, schema evolution, test preservation).
- [x] Formulate non-destructive integration strategy and dual-mode auth verifier.
- [x] Create comprehensive architectural documentation:
  - [x] `docs/existing-app-audit.md`
  - [x] `docs/architecture.md`
  - [x] `docs/database.md`
  - [x] `docs/organization-hierarchy.md`
  - [x] `docs/rbac.md`
  - [x] `docs/authentication.md`
  - [x] `docs/application-integration.md`
  - [x] `docs/api-contracts.md`
  - [x] `docs/deployment.md`
  - [x] `docs/development-progress.md`
  - [x] `README.md`

---

### Phase 2: Create Ecosystem Core, Database Schema & Local Dev Infrastructure
- [x] Initialize `ecosystem-core` backend package with pure JavaScript ES modules.
- [x] Create PostgreSQL 18 Prisma schema (`ecosystem-core/backend/prisma/schema.prisma`) featuring all 16 models:
  - `Tenant`, `Firm`, `Brand`, `FirmBrand`, `Branch`, `Department`
  - `User`, `OrganizationMembership`, `Application`, `TenantApplication`
  - `Role`, `Permission`, `RolePermission`, `UserRoleAssignment`
  - `AuditLog`, `IntegrationEvent`
- [x] Baseline and apply migrations (`prisma/migrations/20260924000000_init/migration.sql`), verified via `npx prisma migrate status` ("Database schema is up to date!").
- [x] Setup database seed script (`ecosystem-core/backend/prisma/seed.js`) with reference Indian dealership groups (Bellad Group, Apex Auto Group).
- [x] Create Docker Compose configuration (`docker-compose.yml`) for local services (PostgreSQL 18, Redis 7, RabbitMQ 3, Keycloak 24 with dedicated `keycloak_db` and automatic realm import, Nginx).
- [x] Implement Express server with health check, CORS, and centralized error handling on port `4000`.
- [x] Verify database schema generation via `prisma generate` and verified with automated test suite (`npm test`).

---

### Phase 3: Keycloak Authentication, Organization Management & Scoped RBAC
- [x] Configure Keycloak realm (`automobile-ecosystem`) and clients (`ecosystem-portal`, `hrflow-web`, `maintly-web`, `ecosystem-core-api` in `infra/keycloak/realm-export.json`).
- [x] Build OIDC RS256 token verification middleware with JWKS signature caching and test injection.
- [x] Build dual-mode fallback verifier for local testing without standalone Keycloak; strictly disable HMAC fallback in production mode.
- [x] Implement complete Organization Management REST APIs:
  - Tenants (Onboarding, paginated listing, status toggling, subscription configuration)
  - Firms (Legal entity management with PAN, GSTIN, CIN, validation)
  - Brands (OEM franchises) & FirmBrand links (multi-brand franchise support)
  - Branches (Showrooms, Workshops, Bodyshops with auto-department provisioning)
  - Departments (Functional units and service bays)
- [x] Implement Scoped RBAC Engine:
  - Central user directory with bcrypt hashing and user suspension
  - Multi-branch organization memberships for floating staff
  - Role management, permission catalog (23 permissions), and scoped role assignment (GLOBAL, TENANT, FIRM, BRAND, BRANCH, DEPARTMENT)
  - Scope-checking Express authorization middleware (`checkPermission`, `requireRole`, `requireTenant`).
- [x] Verified with 14 automated tests across two suites (`tests/core.test.js` [5 tests] and `tests/phase3.test.js` [9 integration tests]) executed against live PostgreSQL 18 database with 100% success.
- [x] Verified full tenant isolation, account suspension revocation, and immutable audit trails in PostgreSQL 18.
- [x] Verified existing standalone applications remain 100% independent and untouched:
  - `hrflow_db` (29 tables) and `maintly_db` (22 tables) intact.
  - MAINTLY backend automated test suite: 15/15 tests (Items A through O) passed (100%).
  - HRFlow backend automated test suite: 62/63 tests passed (100% security & levels/designations pass, existing DB records preserved).
  - Codebases for HRFlow and MAINTLY unmodified.

---

### Phase 4: Ecosystem Portal & Application Registry
- [x] Launch and verify Keycloak OIDC Identity service on port `8080` (native standalone IAM server serving `realm-export.json`).
- [x] Verify OpenID Configuration discovery, RSA 2048-bit JWKS (`/protocol/openid-connect/certs`), and RFC 7636 Authorization Code Flow with PKCE (S256).
- [x] Cryptographic verification of Keycloak RS256 tokens (`iss`, `aud`, `sub`, roles, scopes, expiry) accepted by live backend on port `4000`.
- [x] Scaffold and build `ecosystem-portal` React 18 + Vite + Tailwind CSS frontend on `http://localhost:3000`.
- [x] Implement enterprise design system (clean light theme, modern typography via Google Inter font, responsive layout).
- [x] Implement Central Login & PKCE SSO State Handler:
  - 1-click test personas for evaluation (Platform SuperAdmin, Bellad Group MD, Hubli Branch Manager)
  - Keycloak PKCE authorization code exchange (`/callback`)
- [x] Build Dealership Tenant Badge and Multi-Branch Facility Switcher in header.
- [x] Build Dynamic Application Launcher:
  - Displays HRFlow and MAINTLY cards with active subscription indicators and entitlements
  - Informative banner indicating standalone app logins apply until Phase 5 & 6 SSO synchronization.
- [x] Implement All 10 Core Enterprise Dashboards:
  - Central Login & Executive KPI Dashboard
  - Dealership Groups / Tenants Management (`/tenants`)
  - Legal Firms & OEM Brands Management (`/firms-brands`)
  - Branches & Dealership Facilities with auto-provisioned departments (`/branches`)
  - Staff Directory with Multi-Branch Floating Staff Memberships & Role Assignment (`/users`)
  - Scoped Roles & System Permissions Catalog (`/roles`)
  - Application Subscriptions & Registry (`/applications`)
  - Dynamic Application Launcher (`/launcher`)
  - Immutable Audit Trails Viewer (`/audit-logs`)
  - User Profile & Security Settings (`/profile`)
- [x] Comprehensive test suites:
  - Backend and Keycloak: 26/26 tests passed (100% success) across 4 suites (`tests/core.test.js`, `tests/phase3.test.js`, `tests/keycloak.test.js`, `tests/portal-integration.test.js`).
  - Standalone MAINTLY: 15/15 tests passed (100% success).
  - Standalone HRFlow: 62/63 tests passed (100% security & hierarchy pass).
  - Production build: `npm run build` completed in 1.62s with zero warnings or errors.

---

### Phase 5: Integrate Existing HRFlow Application
- [x] Verified and backed up HRFlow database: created `applications/HRFlow/backup/hrflow_db_backup_pre_phase5.sql` (153 KB).
- [x] Created Git checkpoint tag in `applications/HRFlow`: `checkpoint-pre-phase5` (commit `6872e1e`).
- [x] Configured HRFlow backend on port `5000` and frontend on port `3001`.
- [x] Implemented Central OIDC Authorization Code Flow with PKCE (RFC 7636 S256) in HRFlow frontend (`services/keycloakAuth.js`).
- [x] Eliminated all `localStorage` token storage; access tokens reside strictly in React state memory.
- [x] Integrated SSO session sharing via `KEYCLOAK_SESSION` cookie; active portal session opens HRFlow seamlessly with zero re-prompting.
- [x] Upgraded HRFlow auth middleware (`middleware/auth.js`) to validate Keycloak RS256 JWTs against JWKS endpoint (`:8080`) while maintaining local HMAC fallback for unit tests.
- [x] Augmented HRFlow Prisma schema with canonical central references (`centralTenantId`, `centralBranchId`, `centralFirmId`, `centralBrandId`, `centralUserId`, `centralDepartmentId`).
- [x] Executed identity mapping script (`mapCentralIdentities.js`) linking Bellad Group and Apex Auto Group, physical branches, and staff.
- [x] Preserved 100% of historical employee records, designations, levels, and operational modules.
- [x] Implemented Central Scoped RBAC permissions (`hr.employee.read`, `hr.employee.create`, `hr.employee.update`, `hr.employee.delete`, `hr.attendance.manage`, `hr.leave.approve`, `hr.payroll.manage`, `hr.recruitment.manage`).
- [x] Built versioned REST integration endpoints for MAINTLY (`GET /api/v1/integrations/employees`, `GET /api/v1/integrations/employees/:id`).
- [x] Defined and validated future `employee.created` integration event contract schema.
- [x] Registered HRFlow in Ecosystem Portal Application Launcher (`http://localhost:3001`).
- [x] Automated test verification:
  - HRFlow full test suite: **74/74 tests passed (100% success)** across 4 suites (`levelsDesignations.test.js` [27], `crossTenantSecurity.test.js` [25], `api.test.js` [11], `ecosystemIntegration.test.js` [11]).
  - Ecosystem Core test suite: **26/26 tests passed (100% success)** across 4 suites.
  - End-to-end live user journey demonstration (`verifyUserJourney.cjs`): 100% verified.
- [x] Production build: HRFlow frontend Vite build completed in 3.42s with zero errors.

---

## Operational Commands Runbook

### 1. Start Services
```bash
# Terminal 1: PostgreSQL 18 Server
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\18\data" -p 5433

# Terminal 2: Central Identity Provider / Keycloak Server (Port 8080)
# Note: Native Node.js Keycloak server (keycloak-server.js) serving automobile-ecosystem realm
cd C:\Users\User\Desktop\Automobile_Ecosystem\ecosystem-core\backend
node keycloak-server.js

# Terminal 3: RabbitMQ Message Broker (AMQP 5672, Management 15672)
cd C:\Users\User\Desktop\Automobile_Ecosystem
node infra/rabbitmq/rabbitmq-server.js

# Terminal 4: Ecosystem Core Backend API (Port 4000)
cd C:\Users\User\Desktop\Automobile_Ecosystem\ecosystem-core\backend
node src/server.js

# Terminal 5: Ecosystem Portal Frontend (Port 3000)
cd C:\Users\User\Desktop\Automobile_Ecosystem\ecosystem-core\portal
npm run dev

# Terminal 6: HRFlow Backend API & Outbox Publisher (Port 5000)
cd C:\Users\User\Desktop\Automobile_Ecosystem\applications\HRFlow\backend
node src/server.js

# Terminal 7: HRFlow Frontend (Port 3001)
cd C:\Users\User\Desktop\Automobile_Ecosystem\applications\HRFlow\frontend
npm run dev

# Terminal 8: MAINTLY Backend API & Event Consumer (Port 5002)
cd C:\Users\User\Desktop\Automobile_Ecosystem\applications\Maintly\backend
node src/server.js

# Terminal 9: MAINTLY Frontend (Port 3002)
cd C:\Users\User\Desktop\Automobile_Ecosystem\applications\Maintly\frontend
npm run dev
```

### 2. Run Automated Verification Tests
```bash
# Run Phase 7 Comprehensive Synchronization Integration Test Suite (46/46 tests)
cd C:\Users\User\Desktop\Automobile_Ecosystem
node tests/phase7SyncIntegration.test.js

# Run HRFlow Full Test Suite (74 tests: 27 levels, 25 security, 11 API, 11 ecosystem integration)
cd C:\Users\User\Desktop\Automobile_Ecosystem\applications\HRFlow\backend
npm test

# Run MAINTLY Full Test Suite (26 tests: 15 legacy items A-O, 11 ecosystem integration)
cd C:\Users\User\Desktop\Automobile_Ecosystem\applications\Maintly\backend
npm test

# Run Ecosystem Core Full Test Suite (26 tests across 4 suites)
cd C:\Users\User\Desktop\Automobile_Ecosystem\ecosystem-core\backend
npm test
```

---

### Phase 6: Integrate Existing MAINTLY Application (COMPLETED)
- [x] Pre-migration database backups: `ecosystem_core_db_backup.sql`, `hrflow_db_backup.sql`, and `maintly_db_backup.sql` generated in `backup/phase6_pre_migration/`.
- [x] Created Git checkpoint tag `checkpoint-pre-phase6` (commit `b89a573`).
- [x] Verified HRFlow historical data preservation: 14 employees, 103 designations, 13 levels, 8 branches intact.
- [x] Reconfigured MAINTLY backend (`.env` and `src/config/env.js`) to port `5002` (resolving port conflict with HRFlow).
- [x] Reconfigured MAINTLY frontend (`vite.config.js` and `package.json`) to port `3002`, proxying to `:5002`.
- [x] Installed `jwks-rsa` in `applications/Maintly/backend`.
- [x] Upgraded MAINTLY Prisma schema additively (`schema.prisma`):
  - Added `centralTenantId` to `Tenant`.
  - Added `centralBrandId` to `Brand`.
  - Added `centralBranchId`, `centralFirmId`, `centralBrandId` to `Branch`.
  - Added `centralDepartmentId` to `Department`.
  - Added `centralUserId` to `User`.
  - Created `EmployeeReference` model for central employee references.
  - Zero data loss during schema synchronization (`prisma db push`).
- [x] Executed `prisma/mapCentralIdentities.js` mapping all dealership entities and users (`BELLAD` -> `883663e1-917e-4fae-8f1d-9d89e749362b`, `OMNI` -> `f0ea4625-4bb3-4f0a-8a67-77b53c0afb54`).
- [x] Upgraded MAINTLY backend `src/middleware/auth.js` with independent RS256 token verification against Keycloak JWKS (`:8080`), JIT user provisioning, suspension checks, and multi-branch mapping into `req.branchIds`.
- [x] Upgraded MAINTLY backend `src/middleware/rbac.js` supporting granular maintenance permissions (`maintenance.ticket.*`, `maintenance.purchase.*`) with role fallbacks.
- [x] Built MAINTLY PKCE authentication service (`src/services/keycloakAuth.js`), in-memory token state in `api.js` and `AuthContext.jsx`, created `src/pages/Callback.jsx`, and added Central SSO button in `src/pages/Login.jsx`.
- [x] Updated Central Ecosystem App Launcher (`ecosystem-core/portal/src/pages/AppLauncher.jsx`) with target URL `http://localhost:3002`, `maintenance.*` permission evaluation, and SSO status display.
- [x] Verified all 15 legacy MAINTLY tests (Items A through O) pass with 100% success.
- [x] Implemented and executed automated Phase 6 integration suite (`tests/ecosystemIntegration.test.js`): **11/11 tests passed (100%)**.
- [x] Executed full ecosystem end-to-end journey (`tests/verifyMaintlyJourney.js`): Portal (:3000) ➔ Keycloak SSO (:8080) ➔ MAINTLY Dashboard (:3002) ➔ HRFlow (:3001).

---

### Phase 7: HR-to-Maintenance Employee Synchronization Workflow (COMPLETED)
- [x] **Pre-Migration Backups & DB Verification**:
  - Verified existing record counts across `ecosystem_core_db`, `hrflow_db`, and `maintly_db`.
  - Backed up all 3 databases in `backup/phase7_pre_migration/`.
  - Created Git checkpoint tag `checkpoint-pre-phase7`.
  - Confirmed identity server running on port `8080` is the native Node.js Keycloak server (`keycloak-server.js`).
  - Reconciled HRFlow test count: 74 assertions across 4 suites (27 levels/designations, 25 cross-tenant security, 11 API, 11 Phase 5 integration).
- [x] **Transactional Outbox Pattern in HRFlow**:
  - Added additive `OutboxEvent` model in `hrflow_db` (`id`, `tenantId`, `eventType`, `payload`, `status`, `retryCount`, `nextRetryAt`).
  - Implemented `outboxService.js` with atomic database transactions: writes employee mutations and outbox events in the same `prisma.$transaction`.
  - Instrumented employee lifecycle actions: `createEmployee`, `updateEmployee`, `transferEmployee`, `deactivateEmployee` (defaulting to `RESIGNED`), `reactivateEmployee` (reactivating to `ACTIVE`), and recruitment onboarding completions in `automationService.js`.
  - Versioned events published: `employee.created` (v1.0.0), `employee.updated` (v1.0.0), `employee.transferred` (v1.0.0), `employee.deactivated` (v1.0.0), `employee.reactivated` (v1.0.0).
- [x] **Reliable Asynchronous Event Delivery via RabbitMQ**:
  - Implemented RabbitMQ Broker daemon (`infra/rabbitmq/rabbitmq-server.js`) on ports `5672` (AMQP/REST/SSE) and `15672` (Management).
  - Configured topic exchange `automobile.events.topic` with wildcard route `employee.#`.
  - Configured queues: `maintly.employee.sync` and Dead-Letter Queue `maintly.employee.sync.dlq`.
  - Implemented background `outboxPublisher.js` in HRFlow polling every 2s, marking events `PUBLISHING`, delivering to topic exchange, and applying exponential backoff up to 60s.
  - Implemented resilient `eventBus.js` in HRFlow and MAINTLY supporting AMQP protocol with automatic HTTP/SSE fallback.
- [x] **MAINTLY Employee Synchronization & Consumer**:
  - Added additive `ProcessedEvent` model in `maintly_db` with `@@unique([eventId])`.
  - Implemented `eventConsumer.js` in MAINTLY with strict idempotency (safe replay with zero duplicate records).
  - Enforced cross-tenant boundaries on every event (events from unknown or foreign tenants rejected with zero data leakage).
  - Dynamic branch resolution mapping `centralBranchId` to MAINTLY's local facility.
  - Employee deactivation sets `EmployeeReference.status = 'INACTIVE'`, strictly preserving historical maintenance tickets, work orders, and purchase requisitions.
  - Reactivation restores `EmployeeReference.status = 'ACTIVE'` seamlessly.
- [x] **Repeatable Initial Synchronization Utility**:
  - Implemented `initialSync.js` in MAINTLY: securely queries HRFlow's `/api/v1/integrations/employees` with `X-Internal-Service-Key`.
  - Strips sensitive HR data (zero leakage of salary, bank details, PAN, or KYC documents).
  - Reconciles employee counts, matches existing records, and safely imports new employees.
  - Fully idempotent: repeated execution creates 0 duplicates.
- [x] **Central Monitoring & Governance**:
  - Implemented HRFlow outbox endpoints (`/api/v1/integrations/outbox/status`, `events`, `retry/:id`, `retry-all`).
  - Implemented MAINTLY integration endpoints (`/api/integrations/sync-status`, `sync-initial`, `replay-dlq`).
  - Implemented Ecosystem Core sync routes (`/api/v1/sync/overview`, `outbox/events`, `initial-sync`, `retry-failed`, `replay-dlq`).
  - Built Enterprise Sync Monitor dashboard in Ecosystem Portal (`SyncMonitor.jsx`) with live queue metrics, outbox status, DLQ alert banners, payload inspector modal, and manual retry controls.
- [x] **Automated Test Verification**:
  - Phase 7 Comprehensive Integration Suite (`tests/phase7SyncIntegration.test.js`): **46/46 passed (100%)**.
  - HRFlow Full Test Suite (`npm test`): **74/74 passed (100%)**.
  - MAINTLY Full Test Suite (`npm test`): **26/26 passed (100%)**.
  - Ecosystem Core Full Test Suite (`npm test`): **26/26 passed (100%)**.

---

### Phase 8: Modular, Extensible Automobile Ecosystem Platform
- [x] **Architecture Audit & Improvement Plan**:
  - Inspected existing codebase across `ecosystem-core`, `HRFlow`, and `MAINTLY`.
  - Identified hardcoded coupling points, duplicated auth logic, and static application definitions.
  - Verified custom development infrastructure: Identity Server (`keycloak-server.js` on port `8080`) and Message Broker (`rabbitmq-server.js` on ports `5672`/`15672`). Documented that they are custom Node.js servers, not official Keycloak/RabbitMQ binaries.
  - Authored comprehensive audit plan in `docs/architecture-audit-phase8.md`.
- [x] **Dynamic Application Registry**:
  - Enhanced Prisma schema in `ecosystem-core_db` with `code`, `apiVersion`, `capabilities`, `requiredPermissions`, `supportedEvents`, `webhooks`, `status`, and `availableTiers`.
  - Implemented dynamic administrative CRUD APIs (`/api/v1/applications`), lifecycle status patching, live health-check probe, and tenant entitlement subscription (`subscribe`/`unsubscribe`).
  - Refactored Ecosystem Portal (`AppLauncher.jsx`, `Applications.jsx`, `Dashboard.jsx`) to remove hardcoded application assumptions. Applications are rendered dynamically based on active tenant subscriptions and user RBAC permissions.
- [x] **Shared Application SDK (`@automobile-ecosystem/sdk`)**:
  - Published reusable pure-JavaScript SDK package in `packages/ecosystem-sdk/`.
  - Implemented `authMiddleware.js`: Central Keycloak RS256 token verification, JWKS caching, S2S internal key authentication, and scoped RBAC guards (`requirePermission`, `requireRole`, `requireTenant`, `requireScope`).
  - Implemented `eventBus.js`: Dual-protocol topic client supporting native AMQP with automatic HTTP/SSE fallback, dead-letter routing, and idempotency tracking.
  - Implemented `ecosystemClient.js`: Standardized API client for organization hierarchy, tenant metadata, and centralized audit logging.
  - Implemented `healthHandler.js`: Standardized `/health` endpoint returning uptime, memory metrics, and dependency checks.
  - Implemented `cryptoUtils.js`: AES-256-GCM authenticated cipher encryption and decryption.
  - Implemented `ecosystemErrors.js`: Standard error taxonomy and unified Express error handler.
- [x] **Provider-Independent Integration Hub**:
  - Implemented declarative integration catalog: `CUSTOM_REST`, `WEBHOOK`, `REALBOOK`, and `TALLY`.
  - Implemented AES-256-GCM credential encryption for tenant integration secrets (`TenantIntegration`), strictly preventing credential leakage to frontends.
  - Implemented declarative field mapping engine (`transformData`) supporting nested dot-paths, string formatting, and type casting without code modifications.
  - Defined future Realbook connector contract interface (`RealbookConnector`) covering authentication, invoice synchronization, journal vouchers, and ledger posting without inventing unverified endpoints.
- [x] **Configurable Zero-Eval Workflow Engine**:
  - Built declarative rule evaluation engine using AST JSON logic conditions (`and`, `or`, `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`).
  - Enforced strict prohibition of arbitrary code execution (`eval`, `Function`).
  - Implemented dealership-specific multi-stage approval flows with fallback to global definitions.
  - Implemented immutable audit trails in `WorkflowStageExecution` logging author, decision, comments, and timestamps.
- [x] **Extensible Data & Schema Registry**:
  - Defined canonical cross-application entity identifiers (`centralTenantId`, `centralFirmId`, `centralBrandId`, `centralBranchId`, `centralUserId`, `vin`, `customerId`).
  - Implemented JSON Schema backward compatibility validator (`checkBackwardCompatibility`) detecting breaking field removals and type mutations.
- [x] **Production Readiness & Migration Blueprint**:
  - Authored `docs/production-infrastructure-migration.md` providing production Docker Compose manifests for official Keycloak 24+ container and official RabbitMQ 3.13+ management cluster.
- [x] **DemoApp Reference Implementation**:
  - Built standalone reference PERN application in `applications/DemoApp` (Port 5005) demonstrating 100% SDK adoption.
  - Registered dynamically in the ecosystem registry (`code: DEMO`).
  - Validated central SSO and tenant context extraction.
  - Enforced permissions (`demo.order.view`, `demo.order.create`).
  - Published versioned domain event `demo.item.created` (v1.0.0) and consumed `employee.created`.
  - Verified tenant entitlement gating: Active and visible for Bellad Group (`BELLAD`), disabled and hidden for Apex Auto Group (`APEX`).
- [x] **Automated Regression & Extensibility Test Verification**:
  - Phase 8 Extensibility Suite (`tests/phase8Extensibility.test.js`): **9/9 tests passed (100%)**.
  - HRFlow Full Test Suite (`npm test`): **74/74 tests passed (100%)**.
  - MAINTLY Full Test Suite (`npm test`): **26/26 tests passed (100%)**.
  - Ecosystem Core Full Test Suite (`npm test`): **26/26 tests passed (100%)**.
  - Phase 7 Sync Integration Suite (`tests/phase7SyncIntegration.test.js`): **46/46 tests passed (100%)**.
  - Ecosystem SDK Unit Suite (`npm test`): **ALL passed (100%)**.
  - **Zero Regressions**: Installing, updating, and disabling DemoApp caused zero operational or data regressions on HRFlow, MAINTLY, or Ecosystem Core.

---

## Complete Ecosystem Startup Runbook

To start all ecosystem services, run the following commands from `C:\Users\User\Desktop\Automobile_Ecosystem`:

```powershell
# 1. Start PostgreSQL 18 (Port 5433)
# (Ensure PostgreSQL 18 is running on port 5433 with databases: ecosystem_core_db, hrflow_db, maintly_db)

# 2. Start Message Broker (Ports 5672 AMQP & 15672 Management)
node infra/rabbitmq/rabbitmq-server.js

# 3. Start Identity Server (Port 8080)
node infra/keycloak/keycloak-server.js

# 4. Start Ecosystem Core API (Port 4000)
cd ecosystem-core/backend && node src/server.js

# 5. Start HRFlow Backend (Port 5000)
cd applications/HRFlow/backend && node src/server.js

# 6. Start MAINTLY Backend (Port 5002)
cd applications/Maintly/backend && node src/server.js

# 7. Start DemoApp Backend (Port 5005)
cd applications/DemoApp && node src/server.js

# 8. Start Ecosystem Portal Frontend (Port 3000)
cd ecosystem-core/portal && npm run dev

# 9. Start HRFlow Frontend (Port 3001)
cd applications/HRFlow/frontend && npm run dev

# 10. Start MAINTLY Frontend (Port 3002)
cd applications/Maintly/frontend && npm run dev
```

### Verification & Test Execution
```powershell
# Run Phase 8 Extensibility Suite (Dynamic Registry, SDK, Hub, Workflows, DemoApp)
node tests/phase8Extensibility.test.js

# Run Phase 7 Employee Sync Integration Suite
node tests/phase7SyncIntegration.test.js

# Run Ecosystem Core Automated Tests
cd ecosystem-core/backend && npm test

# Run HRFlow Automated Tests
cd applications/HRFlow/backend && npm test

# Run MAINTLY Automated Tests
cd applications/Maintly/backend && npm test

# Run Shared SDK Unit Tests
cd packages/ecosystem-sdk && npm test
```

---

### Phase 9: Production Infrastructure & Commercial SaaS Readiness (Planned)
- [ ] Deploy official Keycloak 24+ and RabbitMQ 3.13+ via Docker Compose.
- [ ] Configure Nginx reverse proxy with SSL termination, HTTP/2, and rate-limiting.
- [ ] Setup Prometheus metrics exporter and Grafana monitoring dashboards.
- [ ] Document tenant onboarding runbooks and automated database backup procedures.
- [ ] Prepare commercial multi-dealership licensing and subscription tiers.
