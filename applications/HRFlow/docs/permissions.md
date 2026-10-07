# docs/permissions.md

# HRFlow Multi-Tenant Role-Based Access Control (RBAC) Matrix

HRFlow enforces hierarchical, multi-dimensional security:
1. **Tenant Scope**: Determined strictly server-side by cryptographically signed JWT.
2. **Branch Scope**: Enforced for Branch Managers within their assigned dealership.
3. **Role Scope**: Enforced by Express RBAC route middleware.

---

## 1. System Roles Overview

| Role | Operational Scope | Description |
|---|---|---|
| `PLATFORM_ADMIN` | Global (All Tenants) | SaaS platform operator; manages tenant onboarding, subscriptions, feature gates, and system audits. |
| `HR` | Dealership Master | Complete operational HR authority across all branches within their single dealership organization. |
| `BM` | Branch-Scoped | Operational manager restricted strictly to employees, vacancies, and assets within their assigned showroom/workshop. |
| `EMPLOYEE` | Self-Service | Strictly restricted to viewing and managing their own employee profile, payslips, advances, and punches. |

---

## 2. Comprehensive Permissions Matrix

| Functional Module & Action | Platform Admin | Dealership HR | Branch Manager (BM) | Employee (Self) |
|---|:---:|:---:|:---:|:---:|
| **Platform Management** | | | | |
| Onboard Dealership Organization | **Yes** | No | No | No |
| Suspend / Activate Dealership | **Yes** | No | No | No |
| Toggle Plan Features / Modules | **Yes** | No | No | No |
| View Platform Analytics | **Yes** | No | No | No |
| **Dealership Settings** | | | | |
| Configure Dealership Profile & Logo | **Yes** | **Yes** | No | No |
| Configure Statutory Engine (PF/ESI) | **Yes** | **Yes** | No | No |
| Configure Working Days & Attendance | **Yes** | **Yes** | No | No |
| **Branch Management** | | | | |
| Create New Showroom / Branch | **Yes** | **Yes** | No | No |
| View All Dealership Branches | **Yes** | **Yes** | Assigned Only | Assigned Only |
| **Employee Master** | | | | |
| View Employee Directory | Cross-Tenant | Dealership-Wide | Branch Only | Self Only |
| Create / Add Employee | Cross-Tenant | Dealership-Wide | No | No |
| Edit Employee Profile / KYC | Cross-Tenant | Dealership-Wide | No | Self (Basic) |
| Export Employee Records (CSV) | Cross-Tenant | Dealership-Wide | Branch Only | No |
| View Digital ID Card | Cross-Tenant | Dealership-Wide | Branch Only | Self Only |
| **Recruitment & Vacancies** | | | | |
| Upload Manpower Budget | Cross-Tenant | Dealership-Wide | No | No |
| Create Branch Requisition | Cross-Tenant | Dealership-Wide | Branch Only | No |
| Hold / Close Position | Cross-Tenant | Dealership-Wide | Branch Only | No |
| **Onboarding & Joining** | | | | |
| Generate Candidate Joining Link | Cross-Tenant | Dealership-Wide | Branch Only | No |
| Verify Onboarding & Activate Employee | Cross-Tenant | Dealership-Wide | No | No |
| **Payroll & Statutory Engine** | | | | |
| Process Monthly Payroll | Cross-Tenant | Dealership-Wide | No | No |
| Generate Bank Payment Advice | Cross-Tenant | Dealership-Wide | No | No |
| Upload Monthly Pay Days & Deductions | Cross-Tenant | Dealership-Wide | No | No |
| View Payslips & Salary Structure | Cross-Tenant | Dealership-Wide | No | Self Only |
| **Salary Advances** | | | | |
| Apply for Salary Advance | No | No | No | **Yes** |
| Approve / Reject Salary Advance | Cross-Tenant | Dealership-Wide | Branch Only | No |
| Disburse Salary Advance | Cross-Tenant | Dealership-Wide | No | No |
| **Attendance & Biometrics** | | | | |
| Record Punch In / Punch Out | No | No | No | **Yes** |
| View Attendance Muster Roll | Cross-Tenant | Dealership-Wide | Branch Only | Self Only |
| Approve Attendance Corrections | Cross-Tenant | Dealership-Wide | Branch Only | No |
| **Exit & Resignation** | | | | |
| Submit Resignation & NOC | No | No | No | **Yes** |
| Mark Left Without Intimation (LWI) | Cross-Tenant | Dealership-Wide | Branch Only | No |
| Execute F&F Settlement | Cross-Tenant | Dealership-Wide | No | No |
| **Approvals & Workflow** | | | | |
| Approve CUG SIM / Laptop Requests | Cross-Tenant | Dealership-Wide | Branch Only | No |
| View Audit Logs | All Tenants | Dealership-Wide | No | No |
| **Organization Masters (Levels & Designations)** | | | | |
| View Levels & Designations Directory | Cross-Tenant | Dealership-Wide | Read-Only | No |
| Create / Edit Employee Level | Cross-Tenant | Dealership-Wide | No | No |
| Create / Edit Designation | Cross-Tenant | Dealership-Wide | No | No |
| Deactivate Designation | Cross-Tenant | Dealership-Wide | No | No |
| Delete Designation (0 Employees Only) | Cross-Tenant | Dealership-Wide | No | No |
| Assign Employee Level & Designation | Cross-Tenant | Dealership-Wide | No | No |
| Assign Reporting Manager (Hierarchy) | Cross-Tenant | Dealership-Wide | No | No |

---

## 3. Cross-Tenant Security Rules

1. **Attempting to access data from another tenant**: HTTP 403 Forbidden.
2. **Attempting to pass `tenantId` in request query or body**: Overridden or rejected with HTTP 403 Forbidden.
3. **Attempting to link branch from Tenant B to employee in Tenant A**: Rejected with HTTP 403 Forbidden.
4. **Attempting to link designation from Tenant B to employee in Tenant A**: Rejected with HTTP 400/403.
5. **Attempting to assign designation belonging to Level Y when employee is assigned Level X**: Rejected with HTTP 400 Bad Request.
6. **Attempting to assign reporting manager from another tenant**: Rejected with HTTP 400 Bad Request.
7. **Attempting to assign self or circular reporting manager**: Rejected with HTTP 400 Bad Request.
8. **Suspended tenant authorization**: Blocked at authentication gate with HTTP 403 Forbidden.
