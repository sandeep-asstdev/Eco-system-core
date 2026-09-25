# Phase 8 — Architecture Audit & Ecosystem Extensibility Plan

## 1. Executive Summary & Audit Scope

This document provides a thorough architectural audit of the Automobile Ecosystem codebase as of Phase 7 completion, analyzing:
- `ecosystem-core` (Governance, Identity, RBAC, Application Registry)
- `applications/HRFlow` (HRMS & Payroll)
- `applications/Maintly` (Facility & Maintenance Operations)
- `infra/keycloak` & `infra/rabbitmq` (Custom development infrastructure)
- Shared data flow, event publishing, and cross-application dependencies

### Primary Architectural Objectives:
1. **Maximum Flexibility & Extensibility**: Enable seamless addition of future applications (Vehicle Billing, Enquiry CRM, Purchase, Inventory, Accounting) and third-party integrations (Realbook, Tally, DMS) with zero modifications to existing operational applications.
2. **Preservation of Existing Work**: Zero rewrites or breaking changes to HRFlow or MAINTLY.
3. **Decoupled Governance**: Eliminate hardcoded application assumptions from the central portal and backend routers.

---

## 2. Identified Architectural Deficiencies & Coupling Points

### 2.1 Hardcoded Application Names, URLs & Permissions
* **Portal Application Launcher (`ecosystem-core/portal/src/pages/AppLauncher.jsx`)**:
  - Hardcoded permission checks filtering applications:
    ```javascript
    if (app.appKey === 'hrflow') {
      return hasPermission('hrflow.employee.view') || ...;
    }
    if (app.appKey === 'maintly') {
      return hasPermission('maintly.ticket.create') || ...;
    }
    ```
  - Hardcoded Lucide icons (`Users` for HRFlow, `Wrench` for MAINTLY) and default fallback URLs (`http://localhost:3001`, `http://localhost:3002`).
  - Hardcoded SSO banner explicitly naming HRFlow and MAINTLY.
* **Portal Applications View (`ecosystem-core/portal/src/pages/Applications.jsx`)**:
  - Hardcoded `isHrflow` condition determining theme colors, initials (`HR` vs `MT`), and default ports (`:5173`, `:3002`).
* **Portal Executive Dashboard (`ecosystem-core/portal/src/pages/Dashboard.jsx`)**:
  - Hardcoded launcher card rendering with `appKey === 'hrflow'` checks and outdated warning banner ("Opening requires standalone app login until Phase 5 & 6 SSO").
* **Central Sync Router (`ecosystem-core/backend/src/modules/sync/sync.routes.js`)**:
  - Hardcoded endpoint calls to HRFlow (`:5000/api/v1/integrations/outbox/...`) and direct SQL queries to `maintly_db.employee_references`.
  - Hardcoded queue name `maintly.employee.sync.dlq`.

### 2.2 Duplicated Authentication & Middleware Logic
* Each of the three backends (`ecosystem-core/backend`, `HRFlow/backend`, and `Maintly/backend`) implements its own RS256 JWT verifier with:
  - Separate `jwks-rsa` client setup
  - Separate token decoding and claim mapping
  - Separate fallback/test token verification logic
  - Inconsistent mapping of tenant context (`req.tenantId` vs `req.user.tenantId`)
  - Duplicate error handling envelopes
* **Solution**: Extract a shared, reusable, enterprise-grade SDK (`packages/ecosystem-sdk`) that provides standardized auth middleware, tenant extraction, scoped RBAC guards, standardized API response envelopes, and health checkers.

### 2.3 Integration Tight Coupling & Lack of Inbound/Outbound Adapters
* Point-to-point integration: HRFlow publishes employee events specifically to the topic exchange for MAINTLY's queue.
* No provider-independent integration framework for external REST APIs, scheduled synchronizations, or outbound webhooks.
* No abstraction layer for external financial/ERP systems (such as Realbook or Tally) whose API endpoints are not yet formalized.
* **Solution**: Build an **Integration Hub** within `ecosystem-core` supporting connector adapters (REST, Webhook, future Realbook), encrypted credential storage (AES-256-GCM), and declarative field-mapping engines.

### 2.4 Lack of Configurable Multi-Tenant Workflows
* Multi-dealership networks require different operational rules: e.g., Dealership A requires 2-step purchase approval (Branch Manager ➔ Finance Head), while Dealership B requires 4-step approval (Branch Manager ➔ Bodyshop Head ➔ Finance Head ➔ Managing Director).
* Currently, operational approval flows are hardcoded in application business logic.
* **Solution**: Implement a **Declarative Workflow Engine** supporting trigger events, conditions, multi-stage approval hierarchies, role assignments, notifications, and immutable audit logs without executing arbitrary code.

---

## 3. Infrastructure Audit: Custom Identity Server & Message Broker

### 3.1 Custom Node.js Identity Server (`infra/keycloak/keycloak-server.js`)
* **Current Status**: A native Node.js HTTP server running on port `8080`.
* **Verified Features**:
  - OpenID Connect discovery (`/.well-known/openid-configuration`)
  - RSA-256 Keypair generation and JWKS endpoint (`/protocol/openid-connect/certs`)
  - RFC 7636 Authorization Code Flow with PKCE (`/protocol/openid-connect/auth`, `/protocol/openid-connect/token`)
  - User credentials validation against PostgreSQL 18 `ecosystem_core_db.users`
* **Important Classification**: This is a custom development identity server and must **never** be represented as official Quarkus Keycloak.
* **Production Migration Path**: Official Keycloak 24+ container with PostgreSQL backend (`keycloak_db`), importing `realm-export.json`.

### 3.2 Custom Node.js Message Broker (`infra/rabbitmq/rabbitmq-server.js`)
* **Current Status**: A native Node.js service running on port `5672` (AMQP + REST/SSE) and port `15672` (Management API).
* **Verified Features**:
  - AMQP 0-9-1 framing and protocol handshake
  - Topic Exchange (`automobile.events.topic`) with wildcard routing keys (`employee.#`)
  - Dead-Letter Exchange (`automobile.events.dlx`) and Dead-Letter Queue (`maintly.employee.sync.dlq`)
  - In-memory & JSON file persistence (`broker-storage.json`)
* **Important Classification**: This is a custom development message broker and must **never** be represented as official Erlang RabbitMQ.
* **Production Migration Path**: Official RabbitMQ 3.13+ Docker image (`rabbitmq:3-management-alpine`).

---

## 4. Phase 8 Extensibility Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    ECOSYSTEM CORE                                       |
|                                                                                         |
|  +------------------------+  +-------------------------+  +--------------------------+  |
|  | Dynamic App Registry   |  | Integration Hub         |  | Workflow Engine          |  |
|  | - Metadata & URLs      |  | - REST / Webhook        |  | - Declarative Conditions |  |
|  | - Required Permissions |  | - Field Transformation  |  | - Multi-Stage Approvals  |  |
|  | - Capabilities & Events|  | - Encrypted Credentials |  | - Dealership Overrides   |  |
|  | - Lifecycle Status     |  | - Future Realbook Spec  |  | - Versioned Definitions  |  |
|  +------------------------+  +-------------------------+  +--------------------------+  |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Shared Event & Data Schema Registry (Common Identifiers & Event Versioning)        |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                                          |
                                          | Standardized PERN SDK
                                          v
+-----------------------------------------------------------------------------------------+
|                         SHARED APPLICATION SDK (ecosystem-sdk)                          |
|  - Central OIDC Auth & RS256 Verification           - Unified Permission/Role Checks    |
|  - Tenant & Branch Context Extraction               - Resilient Event Publisher/Consumer|
|  - Standard API Client & S2S Authentication         - Standardized Error Handling       |
+-----------------------------------------------------------------------------------------+
         |                                |                               |
         v                                v                               v
+------------------+            +-------------------+            +------------------+
| HRFlow HRMS      |            | MAINTLY Maint     |            | DemoApp (New)    |
| (Existing - PERN)|            | (Existing - PERN) |            | (Plug-and-Play)  |
+------------------+            +-------------------+            +------------------+
```

---

## 5. Execution Roadmap

1. **Step 2**: Upgrade Database Schema with additive models for Dynamic App Registry, Integration Hub, and Workflow Engine.
2. **Step 3**: Build `packages/ecosystem-sdk` with full authentication, tenant context, event handling, error envelopes, and API client.
3. **Step 4**: Implement Integration Hub in `ecosystem-core` with provider configuration, AES-256-GCM encryption, field mapping, webhook delivery, and Realbook connector interface.
5. **Step 5**: Implement Configurable Workflow Engine with zero-eval declarative JSON logic, multi-stage approval hierarchies, and tenant customization.
6. **Step 6**: Implement Shared Data & Event Contract Registry with backward-compatibility checks.
7. **Step 7**: Update Portal Frontend (`AppLauncher.jsx`, `Applications.jsx`, `Dashboard.jsx`) to remove all hardcoded assumptions and dynamically render applications, icons, entitlements, and subscriptions.
8. **Step 8**: Build `DemoApp` demonstrating dynamic registration, launcher appearance, central SSO, permission enforcement, event publishing/consumption, and tenant-gating without touching HRFlow or MAINTLY.
9. **Step 9**: Execute full regression test suites and end-to-end verification.
