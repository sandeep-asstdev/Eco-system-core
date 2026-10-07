# docs/architecture.md

# HRFlow Multi-Tenant SaaS Architecture

## 1. Architectural Overview & SaaS Goals

HRFlow is an enterprise, multi-tenant Software-as-a-Service (SaaS) Human Resource Management System (HRMS) engineered specifically for automobile dealerships, dealer networks, and multi-location automotive retail groups.

The system is designed with strict row-level tenant isolation, dynamic feature gating, branch-level managerial scoping, and automated core HR lifecycle engines built on PostgreSQL 18, Express.js, React 18, and Node.js (PERN Stack).

---

## 2. Multi-Tenant Organizational Hierarchy

```text
HRFlow SaaS Platform
│
├── PLATFORM_ADMIN (Global System Administrator)
│   ├── Tenant Onboarding & Lifecycle (ACTIVE / SUSPENDED / INACTIVE)
│   ├── Subscription Tier & Plan Management (ENTERPRISE / PRO / STARTER)
│   ├── Feature Flag Entitlements
│   └── Cross-Platform Security Audit Log
│
├── Dealer Organization A (Tenant A - Apex Auto Group)
│   ├── Tenant HR Administrator (Master access to Tenant A)
│   ├── Dealership Configuration & Statutory Engine (PF, ESI, Code Prefixes)
│   ├── Branch 1: Mumbai Corporate HQ
│   │   ├── Branch Manager (BM Mumbai)
│   │   └── Employees (Rahul Sharma, etc.)
│   ├── Branch 2: Bangalore Tech & Sales Hub
│   │   ├── Branch Manager (BM Bangalore)
│   │   └── Employees (Priya Patel, etc.)
│   └── Branch 3: Delhi North Showroom
│
├── Dealer Organization B (Tenant B - Zenith Motors Group)
│   ├── Tenant HR Administrator (Master access to Tenant B)
│   ├── Branch 1: Pune Central Dealership
│   │   ├── Branch Manager (BM Pune)
│   │   └── Employees (Rohit Kumar, etc.)
│   └── Branch 2: Hyderabad Auto Hub
│
└── Dealer Organization N (Strictly Isolated Tenant)
```

---

## 3. Database Multi-Tenancy Architecture

HRFlow implements a **Shared Database, Shared Schema with Discriminator Column (`tenantId`)** model on PostgreSQL 18.

### Key Tenancy Design Principles:
1. **Mandatory Foreign Key**: Every operational and business table includes a `tenantId UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE`.
2. **Composite Unique Constraints**: Uniqueness is strictly tenant-scoped rather than globally scoped:
   - `Branch`: `@@unique([tenantId, code])`
   - `Employee`: `@@unique([tenantId, employeeCode])`
   - `Employee`: `@@unique([tenantId, email])`
   - `Position`: `@@unique([tenantId, positionCode])`
   - `ManpowerBudget`: `@@unique([tenantId, branchId, department, financialYear])`
   - `PaymentAdvice`: `@@unique([tenantId, referenceNumber])`
3. **Optimized Multi-Tenant Indexing**: Composite indexes `@@index([tenantId, branchId])` and single-column `@@index([tenantId])` are applied across all tables for instant partition filtering and high throughput.

---

## 4. Security & Isolation Layer

### Server-Side Isolation Guarantee
- **Zero Trust on Client Identity**: The frontend or client application can NEVER specify or override `tenantId`.
- **JWT Context**: The authenticated user's `tenantId` is sealed into their cryptographically signed JWT.
- **Tenant Scope Enforcement Middleware (`enforceTenantScope`)**:
  - Automatically attaches `req.tenantFilter = { tenantId: req.user.tenantId }`.
  - Rejects parameter spoofing attempts (e.g., query params `?tenantId=...` or request body `tenantId`) with HTTP 403 Forbidden.
- **Cross-Tenant Prevention**:
  - Querying an employee or branch ID belonging to another dealership returns 403 Forbidden.
  - Exporting employees or searching produces 0 records from other dealer organizations.
  - Creating employees with a branch from another dealership returns 403 Forbidden.

### Tenant Suspension Protection
- When a dealership is marked `SUSPENDED` by the Platform Admin:
  - Active JWT sessions immediately fail at `authenticate` middleware with HTTP 403 Forbidden.
  - New login requests are blocked with HTTP 403 Forbidden until reactivated.

---

## 5. Subscription Plans & Feature Flag Gating

Each dealership organization has a subscription plan (`ENTERPRISE`, `PRO`, `STARTER`) and a configurable `features` JSON payload in the database.

Feature gates are enforced via the `requireFeature(featureName)` route middleware:
- `vacancies`: Manpower budgeting and position approvals
- `joining`: Digital candidate onboarding and Form 11
- `employees`: Core employee master and digital ID cards
- `payroll`: Automated salary calculation and payment advice
- `advances`: Salary advance requests and recovery
- `attendance`: Biometric punches, muster rolls, and corrections
- `exit`: Resignations, NOC tracking, and F&F settlement
- `approvals`: Multi-stage approval workflows
- `reports`: Dealership analytics and compliance exports
- `audit`: Dealership activity logs

---

## 6. Physical File Storage Partitioning

Uploaded documents, identity proofs, Form 11 submissions, and KYC proofs are stored in physically partitioned tenant directories:

```text
backend/storage/tenants/
├── [tenantA-uuid]/
│   ├── documents/
│   ├── kyc/
│   └── photos/
└── [tenantB-uuid]/
    ├── documents/
    ├── kyc/
    └── photos/
```

Access to files is routed through the authenticated `GET /api/files/:tenantId/:category/:filename` endpoint, which verifies that the requesting user belongs to `:tenantId` (or is a `PLATFORM_ADMIN`) before streaming the file. Cross-tenant access is rejected with HTTP 403.

---

## 7. Automated Core HR Workflows (Preserved & Tenant-Scoped)

All business logic automations operate with strict tenant scoping:
1. **Candidate Onboarding Completed**:
   - Updates candidate record to completed.
   - Activates employee record in the tenant.
   - Closes open position for the tenant's branch.
   - Generates CUG SIM and laptop approval requests for the BM.
2. **Resignation Submitted**:
   - Marks employee status to `RESIGNED` within the tenant.
   - Places salary on hold in the tenant's payroll engine.
   - Generates NOC records across Department, Accounts, and HR.
   - Automatically opens a replacement vacancy in the tenant's branch.
3. **Left Without Intimation (LWI)**:
   - Marks employee status to `ABSCONDED`.
   - Places salary immediately on hold.
   - Automatically opens a replacement vacancy.
4. **Branch Approvals**:
   - Notifications and approval workflows route exclusively to the designated BM and HR within the same dealership.

---

## 8. Organization Masters Architecture: Levels, Designations & Hierarchy

HRFlow introduces a dedicated tenant-configurable organizational taxonomy decoupled from RBAC permissions.

### Application Roles vs Organizational Levels vs Designations

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Application RBAC Role (System Access Permissions)        │
│    PLATFORM_ADMIN | HR | BM | EMPLOYEE                      │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │ Assigned to User
┌──────────────────────────────┴──────────────────────────────┐
│ 2. Employee Level (Corporate Seniority & Policy Tier)       │
│    Level 1 (Staff) ... Level 5 ... Level 10 (MD)            │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │ Assigned to Level
┌──────────────────────────────┴──────────────────────────────┐
│ 3. Company Designation (Exact Job Title)                    │
│    e.g. Branch Manager, Service Advisor, MD                 │
└─────────────────────────────────────────────────────────────┘
```

### Hierarchy & Reporting Tree
- Every employee can have an explicit `reportingManagerId` pointing to another employee within the same tenant.
- Cycle detection prevents circular managerial loops.
- Supports multi-tier vertical escalations:
  `Washers (L1) -> Technician (L3) -> Service Advisor (L3) -> Branch Manager (L5) -> Service Head (L6) -> Chief Service Officer (L7) -> Director/CEO (L9) -> MD (L10)`.

### Reference Tenant: Bellad Group
- Bellad Group serves as the reference tenant with 10 exact levels and 101 distinct designations.
- The system is 100% generic: other dealership groups can create their own custom levels (e.g. 5 levels or 8 levels) and independent designation catalogs without any code alterations.

### Future Claim Policies & Approvals Compatibility
- Future Claims & Expenses engine maps policies directly to `EmployeeLevel`:
  `Employee -> EmployeeLevel -> TravelPolicy / FoodPolicy / LodgingPolicy`.
- Approval authorities are configurable through Reporting Managers, Branch Managers, Department Heads, and Executive Authorities rather than hardcoded designation names.
