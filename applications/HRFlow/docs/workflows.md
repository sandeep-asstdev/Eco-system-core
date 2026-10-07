# docs/workflows.md

# HRFlow Multi-Tenant Workflows & Business Automations

This document specifies the lifecycle stages, SaaS onboarding procedures, and automated business rules implemented across the HRFlow system.

---

## 1. SaaS Dealership Onboarding Workflow

```text
Platform SuperAdmin accesses Platform Command Center (/platform/tenants)
       │
       ▼
Clicks "Onboard Dealership" & submits:
- Organization Name & Legal Entity
- Unique Dealership Code (e.g., ROYAL-HONDA)
- Subscription Tier (ENTERPRISE / PRO / STARTER)
- Initial Corporate HQ Branch Details
- Initial HR Administrator Account Credentials
       │
       ▼
[Atomic Database Transaction]
1. Creates Tenant record with default features and statutory parameters.
2. Creates Initial Branch linked with tenantId.
3. Hashes password and creates Initial HR Admin user linked with tenantId and branchId.
4. Writes audit entry "TENANT_ONBOARDED".
       │
       ▼
Dealership HR Administrator logs in immediately, configures branches, and invites employees.
```

---

## 2. Dealership Lifecycle & Access Suspension Workflow

```text
Platform Admin flags Dealership as SUSPENDED (e.g., billing delinquency)
       │
       ▼
[Instant Platform Action]
1. Database Tenant.status updated to "SUSPENDED".
2. Audit log entry recorded with reason.
3. Every active user from this dealership is blocked on their next API request (HTTP 403 Forbidden).
4. New logins from this dealership rejected immediately (HTTP 403 Forbidden).
       │
       ▼
Issue resolved → Platform Admin restores status to "ACTIVE"
       │
       ▼
All users from the dealership immediately regain access without credential resets.
```

---

## 3. Server-Side Automation Rules (Strictly Tenant-Scoped)

All automations execute strictly on the backend inside transactional database queries, ensuring that newly created entities (positions, approvals, notifications) inherit the exact `tenantId` of the originating event.

### Rule 1: Joining Completion
```text
Candidate fills joining form → Dealership HR reviews & clicks "Complete Onboarding"
      ↓
[Backend Automation Transaction - Scoped to tenantId]
1. Creates official Employee record in Employee Master with tenantId.
2. Updates JoiningRecord status to "COMPLETED".
3. Updates assigned Position status to "FILLED" and "CLOSED".
4. Auto-generates pending Approval records for the assigned Branch Manager (BM)
   for SIM and Laptop allocation with tenantId.
5. Emits in-app Notification to the Branch Manager within the same tenant.
```

### Rule 2: Resignation Submission
```text
Employee submits Resignation with reason & notice period
      ↓
[Backend Automation Transaction - Scoped to tenantId]
1. Employee status updated to "RESIGNED" (or "ON_NOTICE").
2. Salary record marked "ON_HOLD" to prevent unauthorized payroll disbursement.
3. Automatically creates a replacement Position in Vacancy Master with:
   - tenantId: matching employee tenantId
   - branchId: matching employee branchId
   - status: "OPEN"
   - reason: "Replacement for Resignation (Emp Code)"
   - sourceResignationId linked
4. Creates Resignation & NOC tracking records.
5. Emits notification to Dealership HR within the same tenant.
```

### Rule 3: Left Without Intimation (LWI)
```text
Branch Manager (BM) or HR marks employee as "LEFT_WITHOUT_INTIMATION"
      ↓
[Backend Automation Transaction - Scoped to tenantId]
1. Updates Employee status to "LEFT_WITHOUT_INTIMATION".
2. Immediately places current salary on "ON_HOLD".
3. Automatically creates a replacement Position in Vacancy Master with:
   - tenantId: matching employee tenantId
   - branchId: matching employee branchId
   - status: "OPEN"
   - reason: "Replacement for Left Without Intimation (Emp Code)"
4. Logs an audit entry with author IP, timestamp, and previous state.
5. Emits alerts to Dealership HR and Branch management.
```

### Rule 4: BM SIM & Laptop Approval
```text
Branch Manager opens Approvals Center and clicks "Approve" for SIM/Laptop
      ↓
[Backend Automation Transaction - Scoped to tenantId]
1. Updates Approval status to "APPROVED".
2. Records BM remarks and approval timestamp.
3. Dispatches automated Notification and Task alert to Dealership HR to execute physical dispatch.
```

---

## 4. Multi-Tenant Salary & Payroll Engine Workflow

The payroll calculation engine executes strictly within the tenant context, using the dealership's configured statutory parameters:

```text
1. Dealership Statutory Parameters Retrieval
   - Working days per month (e.g. 30)
   - PF Rate (default: 12% of Basic)
   - ESI Rate (default: 0.75% of Gross)
   - ESI Gross Ceiling (default: ₹21,000)

2. Attendance / Pay Days Computation
   - Filtered exclusively by `WHERE tenantId = :tenantId AND branchId IN (...)`
   - Proration Ratio = Payable Days / Standard Working Days

3. Gross Component Calculations
   - Earned Basic = (Monthly Basic * Proration Ratio)
   - Earned HRA = (Monthly HRA * Proration Ratio)
   - Earned Special = (Special Allowance * Proration Ratio)
   - Earned Gross = Earned Basic + Earned HRA + Earned Special

4. Statutory & Custom Deductions
   - Employee PF = Earned Basic * pfRate (if applicable)
   - Employee ESI = Earned Gross * esiRate (if Gross <= esiThreshold)
   - Salary Advance recovery (from active approved advances in this tenant)

5. Net Pay & Hold Enforcement
   - Net Pay = Earned Gross - Total Deductions
   - If Employee status is RESIGNED, LWI, or isHold is true:
     Payroll status marked as "HELD"

6. Payment Advice Generation
   - Grouped by Branch and Bank Name within the tenant
   - Issues unique reference number: `PA-{TENANT_CODE}-{YEAR}-{MONTH}-{RAND}`
```

---

## 5. Organization Masters & Employee Hierarchy Workflow

### Level & Designation Setup
1. **Tenant HR Accesses `/tenant/organization-masters`**:
   - Reviews configured levels (e.g. 10 levels for Bellad Group, or custom levels for other tenants).
   - Can add, edit, or adjust level descriptions.
2. **Designation Catalog Management**:
   - Designations must be linked to an existing active Level within the tenant.
   - Unique designation names enforced per tenant (`@@unique([tenantId, name])`).
   - Safe deactivation guarantee: Designations assigned to active employees cannot be hard-deleted. They must be toggled to `isActive: false` to preserve historical payroll and audit trail integrity.

### Employee Placement & Cascading Selection Workflow
```text
HR Opens "Add Employee" / "Edit Role & Level"
       │
       ▼
Selects Employee Level (e.g. Level 5)
       │
       ▼
Designation dropdown dynamically queries:
`GET /api/organization-masters/designations?levelId=...&isActive=true`
Displays only designations belonging to Level 5 (e.g. Branch Manager, Purchase Manager)
       │
       ▼
If HR changes Level from 5 to 3:
Selected designation is automatically invalidated and reset to prevent cross-level mismatches.
       │
       ▼
Selects Reporting Manager from same tenant:
Backend verifies manager belongs to same tenant and verifies no circular reporting cycle exists.
       │
       ▼
Saves Profile -> Employee record updated, Level & Designation linked, AuditLog entry recorded.
```

### Claims & Policy Integration Workflow (Future Engine)
```text
Employee Submits Expense / Travel Claim
       │
       ▼
Engine looks up Employee.levelId -> EmployeeLevel.levelNumber
       │
       ▼
Queries ClaimPolicy configured for Level (e.g. Level 3: ₹500/day food, 2AC Train)
       │
       ▼
Routes for Approval using Reporting Hierarchy:
Employee -> Reporting Manager -> Branch Manager -> Functional Head -> MD
```
