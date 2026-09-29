# Phase A: Architecture Audit — Extensible Platform & Event Integration

**Date**: September 2026  
**Auditor**: Principal SaaS & Security Architect  
**Workspace**: `C:\Users\User\Desktop\Automobile_Ecosystem`

---

## 1. Executive Summary

This audit evaluates the existing Automobile Dealership Ecosystem to guide its transformation into a flexible, metadata-driven, plugin-based SaaS platform. The system operates on a PERN stack (PostgreSQL 18, Express, React, Node.js) with microservices communicating via REST and RabbitMQ, secured by Keycloak OIDC.

The core infrastructure and baseline synchronization (HRFlow outbox to MAINTLY consumer) are functional. However, application registration, event subscription management, and integration monitoring currently require manual interventions or code changes.

---

## 2. Existing System Inventory & Capabilities

### 2.1 Ecosystem Core (`ecosystem-core`)
- **Backend (Port 4000)**:
  - Express.js API connecting to `ecosystem_core_db` (Port 5433) via Prisma ORM.
  - Multi-tenant data model: `Tenant`, `Firm`, `Brand`, `Branch`, `Department`, `User`, `Role`, `Permission`, `Application`, `TenantApplication`.
  - Application endpoints (`/api/v1/applications`) support basic CRUD and tenant subscription status.
  - Sync endpoints (`/api/v1/sync`) provide basic overview of RabbitMQ queues and HRFlow outbox.
- **Portal Frontend (Port 3000)**:
  - Vite + React 18 single-page application using Tailwind CSS and Lucide icons.
  - Application Launcher (`AppLauncher.jsx`) redirects to Keycloak SSO bridge (`:8080/.../sso-launch`).
  - Application listing (`Applications.jsx`) is currently read-only.
  - Sync Monitor (`SyncMonitor.jsx`) is limited to hardcoded HRFlow ➔ MAINTLY tracking.

### 2.2 Infrastructure Layer (`infra`)
- **Identity Provider (Port 8080)**:
  - Development: Custom Node.js OIDC identity server (`infra/keycloak/keycloak-server.js`) implementing discovery, JWKS, token issuing, and 1-click SSO launch bridge.
  - Production: Keycloak 24.0.5 container defined in `docker-compose.prod.yml` with `realm-export.json`.
- **Message Broker (Ports 5672 AMQP / 15672 Management)**:
  - Development: Native Node.js broker (`infra/rabbitmq/rabbitmq-server.js`) supporting AMQP topic exchange `automobile.events.topic` and HTTP API.
  - Production: RabbitMQ 3.13 Alpine container.
- **Database Engine (Port 5433)**:
  - PostgreSQL 18 managing three isolated databases: `ecosystem_core_db`, `hrflow_db`, `maintly_db`.

### 2.3 Shared SDK (`packages/ecosystem-sdk`)
- Reusable package providing:
  - `EcosystemEventBus`: AMQP publisher/consumer with DLX dead-lettering and HTTP fallback.
  - `createAuthMiddleware`: Validates Keycloak JWTs against JWKS endpoint.
  - `schemaRegistry`: Canonical identifiers (`centralTenantId`, `centralBranchId`, `vin`, etc.).
  - `eventContracts`: Schema registry and backward-compatibility checker.

### 2.4 Vertical Applications
- **HRFlow (Port 5000 API, Port 3001 Web)**:
  - Full-featured HRMS & payroll application.
  - Implements Transactional Outbox pattern (`OutboxService` & `OutboxPublisher`) publishing to `automobile.events.topic`.
- **MAINTLY (Port 5002 API, Port 3002 Web)**:
  - Multi-branch maintenance and operations tool.
  - Implements idempotent consumer (`EventConsumer`) subscribing to `maintly.employee.sync` queue, storing `EmployeeReference` records.
- **DemoApp (Port 5005)**:
  - Autonomous PERN extension demonstrating SDK integration, permission gating, and event publishing/consumption.

---

## 3. Gap Analysis for Central App Management & Integration

| Requirement | Current State | Required Architecture Change |
| :--- | :--- | :--- |
| **No-Code App Registration** | Manual SQL seed or basic REST POST | Implement standardized manifest schema, SSRF-safe URL fetch, validation, review-and-approve UI wizard. |
| **Dynamic Event Subscriptions** | Static queues declared in application code | Central Event Subscription Catalog: Applications declare publishes/subscribes in manifest; Admins approve subscriptions; Core provisions broker bindings dynamically. |
| **Versioned Event Contracts** | Unversioned event names (`employee.created`) | Formalize versioned contracts (`employee.created.v1`, `employee.updated.v1`, etc.) with strict envelopes and backwards-compatible routing. |
| **Initial Synchronization** | Hardcoded initial sync endpoint | Standardized paginated tenant-scoped reference API with reconciliation and progress tracking. |
| **Central Integration Monitor** | Fixed to HRFlow-MAINTLY overview | Multi-application integration monitor showing all registered apps, active bindings, event metrics, DLQ messages, and payload-safe retry controls. |
| **Third-Party App Independence** | DemoApp hardcoded | Fully decouple new apps so they register, discover events, and integrate entirely via UI without modifying core/app code. |

---

## 4. Implementation Strategy

- **Phase B**: Formalize the App Manifest schema (`manifestVersion: "1.0"`) and versioned event contracts in `packages/ecosystem-sdk`.
- **Phase C**: Extend Core API with manifest ingestion, SSRF protection, Keycloak client provisioning, and build the rich Application Registry UI in Portal.
- **Phase D**: Implement dynamic subscription approval, automated queue/binding provisioning, and update `ecosystem-sdk`.
- **Phase E & F**: Upgrade HRFlow and MAINTLY to versioned contracts, refine initial synchronization, and build the Central Integration Monitor.
- **Phase G & H**: Complete end-to-end UAT with DemoApp registered entirely via the frontend, accompanied by automated regression suites.
