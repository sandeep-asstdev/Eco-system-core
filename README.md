# Multi-Tenant Automobile Dealership Software Ecosystem

[![PostgreSQL 18](https://img.shields.io/badge/Database-PostgreSQL%2018-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Keycloak](https://img.shields.io/badge/Identity-Keycloak%20OIDC%20%26%20SSO-blue?style=for-the-badge&logo=redhat)](https://www.keycloak.org/)
[![Docker](https://img.shields.io/badge/DevOps-Docker%20Compose%20%7C%20Nginx-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Architecture](https://img.shields.io/badge/Language-Pure%20JavaScript-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A commercial, multi-tenant enterprise software ecosystem engineered for automobile dealership groups, retail automotive networks, and multi-franchise corporate groups across India.

The ecosystem unifies specialized dealership applications—**HRFlow** (HRMS & Payroll), **MAINTLY** (Facility Maintenance & Operations), **Enquiry CRM**, **Vehicle Billing**, and **Inventory**—under a centralized governance platform with **Single Sign-On (SSO)**, **Scoped Organizational RBAC**, and **Event-Driven Data Synchronization**, while preserving the operational independence and autonomous databases of each application.

---

## 🏛️ Ecosystem Architecture Blueprint

```text
                                   ┌──────────────────────────────────────────────┐
                                   │            KEYCLOAK IDENTITY (OIDC)          │
                                   │            Central SSO & Token Issuer        │
                                   └──────────────────────┬───────────────────────┘
                                                          │
                                         ┌────────────────┴────────────────┐
                                         ▼                                 ▼
                              ┌──────────────────────┐         ┌──────────────────────┐
                              │  ECOSYSTEM PORTAL    │         │    NGINX GATEWAY     │
                              │  (Port 3000 Web)     │         │      (Port 80)       │
                              └──────────┬───────────┘         └──────────┬───────────┘
                                         │                                │
                 ┌───────────────────────┴────────────────────────────────┼───────────────────────┐
                 ▼                                                        ▼                       ▼
      ┌─────────────────────┐                                  ┌─────────────────────┐ ┌─────────────────────┐
      │   ECOSYSTEM CORE    │                                  │       HRFLOW        │ │       MAINTLY       │
      │    (Port 4000)      │                                  │     (Port 5001)     │ │     (Port 5002)     │
      ├─────────────────────┤                                  ├─────────────────────┤ ├─────────────────────┤
      │ • Multi-Tenant SaaS │                                  │ • Employee Master   │ │ • Ticket Lifecycle  │
      │ • Legal Firms       │      Asynchronous Events         │ • Indian Payroll    │ │ • SLA Breach Engine │
      │ • OEM Brands        │◄────────────────────────────────►│ • Daily Attendance │ │ • Vendor Purchases  │
      │ • Branches & Depts  │       (RabbitMQ / BullMQ)        │ • Exit Clearances   │ │ • Facility Assets   │
      │ • Scoped RBAC       │                                  │ • Digital Onboard   │ │ • 13 View Counters  │
      │ • App Registry      │                                  └──────────┬──────────┘ └──────────┬──────────┘
      └──────────┬──────────┘                                             │                       │
                 │                                                        ▼                       ▼
                 ▼                                             ┌─────────────────────┐ ┌─────────────────────┐
      ┌─────────────────────┐                                  │      hrflow_db      │ │     maintly_db      │
      │  ecosystem_core_db  │                                  │   (PostgreSQL 18)   │ │   (PostgreSQL 18)   │
      │   (PostgreSQL 18)   │                                  └─────────────────────┘ └─────────────────────┘
      └─────────────────────┘
```

---

## 🚀 Key Architectural Capabilities

1. **6-Tier Automotive Organizational Hierarchy**:
   - **Dealership Group** (`Tenant`): Overarching conglomerate (e.g. *Bellad Group*).
   - **Legal Entities** (`Firm`): Corporate entities for separate OEM franchises (e.g. *Bellad Motors Pvt Ltd*).
   - **Automotive Brands** (`Brand`): OEM manufacturers (e.g. *Hyundai*, *Toyota*, *Maruti Suzuki*).
   - **Dealership Agreement** (`FirmBrand`): Franchise contract binding legal firm to OEM brand.
   - **Physical Outlets** (`Branch`): Showrooms, Workshops, Bodyshops, Stockyards.
   - **Functional Teams** (`Department`): New Car Sales, Service, Spares, Bodyshop, Accounts, HR.
2. **Permission-Based Scoped RBAC**:
   - Multiple roles per user with explicit organizational scope (`GLOBAL`, `TENANT`, `FIRM`, `BRAND`, `BRANCH`, `DEPARTMENT`).
   - Granular dot-notation permissions (e.g. `hr.employee.read`, `maintenance.ticket.create`).
3. **Single Sign-On (SSO) with Keycloak OIDC**:
   - Authorization Code Flow with PKCE for React SPAs.
   - Zero sensitive tokens in `localStorage`; in-memory token state with HttpOnly refresh cookies.
   - Independent token verification in each Express backend (RS256 signature, issuer, audience, expiry).
4. **Resilient Inter-App Integration**:
   - Autonomous application databases (`ecosystem_core_db`, `hrflow_db`, `maintly_db`).
   - Non-destructive integration preserving existing data and tests.
   - Transactional outbox pattern and asynchronous event dispatching for cross-application sync.
5. **Pure JavaScript PERN Stack**:
   - 100% pure JavaScript (`.js` and `.jsx`) with Node.js, Express, React 18, and Vite.
   - Zero TypeScript compiler lag, zero MongoDB dependencies.

---

## 📁 Repository & Ecosystem Structure

```text
Automobile_Ecosystem/
├── README.md                          # Master documentation & entry point
├── docker-compose.yml                 # Local development multi-container specification
├── docs/                              # Comprehensive architectural blueprints:
│   ├── existing-app-audit.md          # In-depth code & database audit of HRFlow and MAINTLY
│   ├── architecture.md                # System topology, data isolation, and tech stack rationale
│   ├── database.md                    # Ecosystem Core Prisma schema, models, constraints, and RLS
│   ├── organization-hierarchy.md      # 6-tier dealership model for Indian automotive networks
│   ├── rbac.md                        # Scoped RBAC model, permissions matrix, and middleware
│   ├── authentication.md              # Keycloak OIDC, PKCE, token claims, and dev auth bridge
│   ├── application-integration.md     # Registry, contracts, and HR-to-Maint sync workflow
│   ├── api-contracts.md               # Standard REST contracts and CloudEvents v1.0 schemas
│   ├── deployment.md                  # Port topology, Docker, Nginx gateway, CI/CD, backups
│   └── development-progress.md        # 9-phase development tracker with milestone checklists
│
├── ecosystem-core/                    # Central Ecosystem Governance Platform:
│   ├── backend/                       # Node.js + Express API (Port 4000)
│   │   ├── prisma/                    # Schema with all 16 ecosystem models
│   │   └── src/                       # Org management, RBAC, Auth, Outbox, and App Registry
│   └── portal/                        # React 18 + Vite Portal Web Dashboard (Port 3000)
│
└── applications/                      # Autonomous Domain Applications:
    ├── HRFlow/                        # HRMS & Indian Payroll Application:
    │   ├── backend/                   # Express API (Port 5001, hrflow_db)
    │   └── frontend/                  # React 18 Web (Port 3001)
    │
    └── Maintly/                       # Facility & Maintenance Operations Application:
        ├── backend/                   # Express API (Port 5002, maintly_db)
        └── frontend/                  # React 18 Web (Port 3002)
```

---

## 🔌 Deterministic Port Allocation

| Application / Service | Role | Web / UI Port | API / Service Port | Database Target |
|---|---|---|---|---|
| **Nginx Gateway** | Ingress Proxy | `80` / `443` | - | - |
| **Ecosystem Portal** | Central Dashboard | `3000` | `4000` | `ecosystem_core_db` |
| **HRFlow** | HRMS & Payroll | `3001` | `5001` | `hrflow_db` |
| **MAINTLY** | Maintenance Ops | `3002` | `5002` | `maintly_db` |
| **Keycloak** | OIDC Identity Provider | `8080` | `8080` | `ecosystem_core_db` |
| **PostgreSQL 18** | Relational Database | - | `5433` | All Databases |
| **Redis 7** | Cache & Job Queue | - | `6379` | Memory |
| **RabbitMQ** | Message Broker | `15672` | `5672` | AMQP Messages |

---

## 📚 Complete Architectural Documentation Index

| Document | Key Contents |
|---|---|
| [**Existing Application Audit**](file:///docs/existing-app-audit.md) | Exhaustive code inspection of HRFlow and MAINTLY, comparison matrix, migration risks, and preservation strategy. |
| [**System Architecture**](file:///docs/architecture.md) | Topology diagram, component responsibilities, multi-tenant isolation guarantees, and stack decisions. |
| [**Database Specification**](file:///docs/database.md) | Complete Prisma schema for `ecosystem-core` covering all 16 models, constraints, and Row-Level Security. |
| [**Organizational Hierarchy**](file:///docs/organization-hierarchy.md) | Modeling Indian dealership networks (Tenant, Firm, Brand, FirmBrand, Branch, Department) and floating staff. |
| [**Scoped RBAC Engine**](file:///docs/rbac.md) | Granular dot-notation permissions, organizational scope inheritance, permission catalog, and middleware. |
| [**Central Authentication & SSO**](file:///docs/authentication.md) | Keycloak OIDC, PKCE flow, token claims, secure storage, and dual-mode development bridge. |
| [**Application Integration**](file:///docs/application-integration.md) | Registry model, non-breaking schema evolution, event outbox, and HR-to-Maintenance sync workflow. |
| [**API Contracts & Events**](file:///docs/api-contracts.md) | REST endpoint schemas and CloudEvents v1.0 specifications (`employee.created`, `ticket.created`). |
| [**DevOps & Deployment**](file:///docs/deployment.md) | Port topology, Docker Compose, Nginx reverse proxy configuration, GitHub Actions CI/CD. |
| [**Development Progress**](file:///docs/development-progress.md) | Live tracking across all 9 implementation phases and milestone checklists. |

---

## 🚦 Roadmap & Implementation Status

- [x] **Phase 1: Existing Application Audit & Architecture Design** (COMPLETED)
- [ ] **Phase 2: Ecosystem Core, Database Schema & Local Dev Infrastructure** (IN PROGRESS)
- [ ] **Phase 3: Keycloak Authentication, Organization Management & Scoped RBAC**
- [ ] **Phase 4: Ecosystem Portal & Application Registry**
- [ ] **Phase 5: Integrate Existing HRFlow Application**
- [ ] **Phase 6: Integrate Existing MAINTLY Application**
- [ ] **Phase 7: HR-to-Maintenance Employee Synchronization Workflow**
- [ ] **Phase 8: Automated Integration Tests & CI/CD Pipelines**
- [ ] **Phase 9: Production Readiness & Commercial SaaS Capabilities**
