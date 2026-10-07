# HRFlow — Multi-Tenant SaaS HRMS for Automobile Dealerships & Enterprise Groups

![HRFlow Logo](https://img.shields.io/badge/HRFlow-SaaS%20HRMS-4F46E5?style=for-the-badge&logo=react)
![Stack](https://img.shields.io/badge/Stack-PostgreSQL%20%7C%20Express%20%7C%20React%20%7C%20Node-0ea5e9?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-65%2F65%20Passing-10b981?style=for-the-badge)
![Security](https://img.shields.io/badge/Multi--Tenant%20Isolation-Strict-purple?style=for-the-badge)

**HRFlow** is a modern, enterprise-grade, multi-tenant Human Resource Management System (HRMS) built on the **PERN stack** (PostgreSQL, Express.js, React, Node.js) in **pure JavaScript (`.js` and `.jsx`)**. 

Engineered specifically for automobile dealership groups, retail automotive networks, and multi-branch enterprises, HRFlow delivers multi-tenant data isolation, dynamic organizational levels and designations, complete employee lifecycle management, branch-level permissions, and real-time operational workflows.

---

## 🏢 Multi-Tenant Architecture

HRFlow operates as a true B2B SaaS platform where multiple dealer organizations operate independently on a unified system:

```text
                                  ┌─────────────────────────────┐
                                  │       HRFlow Platform       │
                                  │   (admin@hrflow.com)        │
                                  │   Global Tenant Governance  │
                                  └──────────────┬──────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          │                                      │                                      │
          ▼                                      ▼                                      ▼
┌───────────────────┐                  ┌───────────────────┐                  ┌───────────────────┐
│   Bellad Group    │                  │  Apex Auto Group  │                  │   Zenith Motors   │
│ (Dealer Tenant A) │                  │ (Dealer Tenant B) │                  │ (Dealer Tenant C) │
├───────────────────┤                  ├───────────────────┤                  ├───────────────────┤
│ • Hubli Branch    │                  │ • Mumbai HQ       │                  │ • Bangalore       │
│ • Belgaum Branch  │                  │ • Pune Dealership │                  │ • Mysore Showroom │
│ • Dharwad Branch  │                  │ • Thane Workshop  │                  │ • Mangalore       │
│ • 10 Levels &     │                  │ • Custom Levels & │                  │ • Custom Levels & │
│   101 Designations│                  │   Designations    │                  │   Designations    │
└───────────────────┘                  └───────────────────┘                  └───────────────────┘
```

### Tenant Data Isolation Guarantees
- Every data table includes a strict `tenantId` foreign key.
- Express middleware extracts `req.tenantId` directly from the authenticated JWT token.
- All database queries enforce tenant isolation at the ORM layer.
- `PLATFORM_ADMIN` users can view all tenants, create new organizations, and monitor cross-tenant telemetry without mixing operational data.
- Tenant administrators (HR) cannot view, modify, or query employees, branches, vacancies, or payroll records of other tenants.

---

## 🎯 Employee Level & Designation Master

Designed with deep domain modeling for enterprise dealership networks (with the **Bellad Group** configuration as the reference baseline):

- **Employee Levels (10-Tier Hierarchy)**:
  - **Level 1**: Top Leadership (MD, CEO, Joint MD)
  - **Level 2**: Senior Leadership (VP, CFO, General Manager)
  - **Level 3**: Functional Leadership (Senior Managers, DGM)
  - **Level 4**: Department Heads & Branch Leadership (Managers, Branch Managers)
  - **Level 5**: Assistant Management & Team Leads (Deputy Managers, Assistant Managers)
  - **Level 6**: Supervisors & Senior Specialists (Supervisors, Team Leaders)
  - **Level 7**: Core Operational Staff (Customer Care, Sr Executives)
  - **Level 8**: Associates & Technicians (Sales Consultants, Technicians, Mechanics)
  - **Level 9**: Trainees & Entry Level (Apprentices, Trainee Technicians)
  - **Level 10**: Support Staff (Drivers, Housekeeping, Helpers)

- **101 Automotive Designations**: Spanning Sales, After-Sales / Service, Body Shop, Accounts & Finance, HR, IT, PDI, Parts & Accessories, Customer Care, and General Management.
- **Reporting Hierarchy Enforcement**: Employees can only report to managers occupying equal or higher organizational levels.
- **Cascading Level-to-Designation Selection**: Interactive level-filtered dropdowns during onboarding and employee master editing.
- **Tenant Configurability**: Levels and designations are dynamically mastered per tenant and not hardcoded into application business logic.
- **Export & Import**: Export levels and designations to JSON for easy tenant replication or backups.

---

## 🔄 Complete Employee Lifecycle Automation

```text
Manpower Planning ──► Vacancy Management ──► Candidate Invitation ──► Digital Onboarding
                                                                             │
Position Reopening ◄── Full & Final / Exit ◄── Resignation / NOC ◄── Active Employee Master
                                                                             │
                                              ┌──────────────────────────────┴──────────────────────────────┐
                                              ▼                              ▼                              ▼
                                     Salary & Payroll Engine        Attendance & Leaves            Assets & Documents
```

### Core Automation Rules:
1. **Rule 1 (Joining → Active)**: When candidate joining formalities are completed and verified by HR, the employee status transitions to `ACTIVE`, the assigned Vacancy Position transitions to `FILLED/CLOSED`, and BM approval tasks for IT assets (SIM/Laptop) are automatically dispatched.
2. **Rule 2 (Resignation → Backfill)**: When an employee submits a resignation, employee status shifts to `RESIGNED`, salary is set to `ON_HOLD`, and a replacement Vacancy Position is automatically spawned in `OPEN` state.
3. **Rule 3 (Left Without Intimation)**: When marked as absconded by a Branch Manager, status updates to `LEFT_WITHOUT_INTIMATION` and a backfill Vacancy Position is generated.
4. **Rule 4 (Asset Clearances & NOC)**: Department NOC, Asset Recovery, and Finance Clearances auto-calculate Full & Final (F&F) settlement amounts.

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Scope | Key Permissions & Responsibilities |
|---|---|---|
| `PLATFORM_ADMIN` | Global (Cross-Tenant) | Manage tenant organizations, view platform telemetry, create new dealer tenants, toggle tenant status. |
| `HR` | Tenant-Wide | Manage all branches, vacancy requisitions, levels & designations master, employee master (10-tab dossier), payroll engine, salary advances, exit approvals, and audit trail. |
| `BM` (Branch Manager) | Assigned Branch | View branch employees, request vacancy positions, approve SIM/laptop requests, approve attendance corrections, recommend salary advances, initiate absconding reports. |
| `EMPLOYEE` | Self-Service | Access personal profile & Digital ID card, view & download payslips, submit attendance punches & corrections, request salary advances, submit resignation. |

---

## 💻 Tech Stack

- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT), bcryptjs, Multer
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React Icons
- **Database**: PostgreSQL 18 (default port `5433`)
- **Code Standards**: Pure JavaScript (`.js` and `.jsx`), zero TypeScript compiler overhead, modular architecture

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14+ (Configured for PostgreSQL 18 on port `5433`)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/hrflow.git
cd hrflow
```

### 3. Backend Setup
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
copy .env.example .env
# Edit .env if your PostgreSQL port or password differs

# 3. Synchronize database schema
npx prisma db push

# 4. Seed demo tenants, branches, levels, designations, and employees
npm run db:seed

# 5. Start backend development server
npm run dev
```
Backend runs at: `http://localhost:5000`

### 4. Frontend Setup
```bash
cd ../frontend

# 1. Install dependencies
npm install

# 2. Configure environment
copy .env.example .env

# 3. Start frontend development server
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

HRFlow includes an end-to-end test suite testing multi-tenant security, RBAC enforcement, level/designation hierarchy, and core APIs:

```bash
# Ensure backend server is running in another terminal (`npm run dev`)
cd backend
npm test
```

### Test Coverage Highlights:
- **`levelsDesignations.test.js`** (27 tests): Level CRUD, designation validation, hierarchy constraints, cascading lookups, duplicate detection, JSON export.
- **`crossTenantSecurity.test.js`** (25 tests): Cross-tenant isolation verification, unauthorized tenant switching rejection, token verification.
- **`api.test.js`** (13 tests): Auth flow, vacancies, employee onboarding, approval queues, payroll calculations.
- **Total**: 65 tests passing across all suites.

---

## 🔑 Default Demo Accounts

All accounts are pre-seeded in the database with standard testing credentials:

| Tenant | Role | Email | Password | Scope & Notes |
|---|---|---|---|---|
| **SaaS Platform** | `PLATFORM_ADMIN` | `admin@hrflow.com` | `admin123456` | Global Multi-Tenant Admin Portal |
| **Bellad Group** | `HR` | `hr.bellad@hrflow.com` | `hr123456` | Full Bellad Group Access (101 Designations) |
| **Bellad Group** | `BM` (Hubli) | `bm.hubli@hrflow.com` | `bm123456` | Scoped to Bellad Hubli Branch |
| **Bellad Group** | `EMPLOYEE` (MD) | `md.bellad@hrflow.com` | `hr123456` | Managing Director (Level 1) |
| **Apex Auto** | `HR` | `hr@hrflow.com` | `hr123456` | Apex Auto Group Tenant Admin |
| **Apex Auto** | `BM` (Mumbai) | `bm.mumbai@hrflow.com` | `bm123456` | Scoped to Apex Mumbai Branch |
| **Zenith Motors** | `HR` | `hr.zenith@hrflow.com` | `hr123456` | Zenith Motors Tenant Admin |

---

## 📁 Repository Structure

```text
HRFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Multi-tenant PostgreSQL schema
│   │   ├── seed.js                  # Master seed script for all tenants
│   │   └── belladMastersData.js     # Bellad Group 10 levels & 101 designations
│   ├── src/
│   │   ├── config/                  # Prisma client and environment
│   │   ├── middleware/              # Auth, Tenant Scoping, RBAC, Error Handler
│   │   ├── modules/                 # Modular domain services and controllers
│   │   │   ├── approvals/
│   │   │   ├── attendance/
│   │   │   ├── audit/
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── exit/
│   │   │   ├── joining/
│   │   │   ├── levels/              # Level & Designation Master API
│   │   │   ├── payroll/
│   │   │   ├── tenants/             # SaaS Tenant Management API
│   │   │   └── vacancies/
│   │   ├── utils/                   # Token helpers, response formatters
│   │   ├── app.js                   # Express application configuration
│   │   └── server.js                # Server entry point
│   ├── tests/                       # Automated Jest test suites
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/                  # Logos and UI assets
│   │   ├── components/              # Shared UI components, Badges, Modals
│   │   ├── context/                 # AuthContext and TenantContext
│   │   ├── layouts/                 # AppLayout, Navbar, Sidebar
│   │   ├── modules/                 # Feature pages and dashboards
│   │   │   ├── approvals/
│   │   │   ├── attendance/
│   │   │   ├── audit/
│   │   │   ├── auth/                # Login & Registration
│   │   │   ├── dashboard/           # Role-based dashboards
│   │   │   ├── employees/           # Employee Master & 10-tab dossier
│   │   │   ├── exit/
│   │   │   ├── joining/
│   │   │   ├── masters/             # Level & Designation Master Management
│   │   │   ├── payroll/
│   │   │   ├── platform/            # Platform Admin SaaS management
│   │   │   └── vacancies/
│   │   ├── services/                # Axios API client
│   │   ├── App.jsx                  # Application router
│   │   └── index.css                # Tailwind styling & tokens
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── docs/                            # Deep-dive architecture and design specifications
│   ├── architecture.md              # Multi-tenant and modular architecture
│   ├── database.md                  # Entity relationship models and schema notes
│   ├── permissions.md               # RBAC matrix and security rules
│   └── workflows.md                 # State transition automations
│
├── .gitignore                       # Git exclusions for secrets, modules, and builds
└── README.md                        # Master project documentation
```

---

## 📄 License & Attribution

This project is licensed under the MIT License. Built for enterprise multi-dealership operations.
