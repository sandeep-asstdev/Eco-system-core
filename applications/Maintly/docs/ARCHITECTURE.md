# MAINTLY Architecture Document

## Overview
**MAINTLY** ("Internal Maintenance & Operations Management") is an enterprise-grade, highly scalable multi-tenant maintenance and facility management application. It is designed to govern, approve, execute, track, and close maintenance requests across different organizations, corporate groups, and subsidiaries with completely different operational procedures, organizational hierarchies, workflows, and SLA policies.

---

## Architectural Principles

### 1. Zero Hardcoding Policy
- Tenant names, brands, branches, departments, work categories, SLA thresholds, and procedure rules are **NEVER hardcoded** in application logic.
- Tenant #1 is seeded as **Bellad & Groups** (17 automotive brands, 37 branches, 32 departments, branch areas, 10 work types).
- Tenant #2 is seeded as **OmniLogistics Supply Chain Ltd** (distinct branches, fleet departments, lean no-approval workflow, 6h grace SLA).
- Any future tenant can be dynamically onboarded via the administration UI or REST API without modifying a single line of application source code.

### 2. Multi-Tenant Scalability & Procedural Flexibility
- **Configurable Approval Hierarchy**:
  - Each tenant can toggle whether requests require formal management approval (`tenant.approvalRequired: true/false`).
  - Strict hierarchical tenants enforce approval before assignment; lean logistics/operations tenants allow immediate technician dispatch.
- **Configurable SLA & Grace Engine**:
  - Each tenant sets their own allowable grace window (`tenant.graceHours`, default 12.0 hours) and priority resolution targets (`targetHoursHigh`, `targetHoursMedium`, `targetHoursLow`, `targetHoursCritical`).
  - Tasks completed within `Target < Actual <= Target + Grace` are designated `WITHIN_GRACE`. Only tasks exceeding `Target + Grace` are designated `OVERDUE`.
- **Sequential Collision-Safe Identification**:
  - IDs are uniquely formatted per tenant using a customizable prefix: `{requestPrefix}-YYYY-XXXXXX` (e.g. `BELL-MAIN-2026-000001`, `OMNI-MAIN-2026-000001`).
- **Dynamic Master Data Hierarchies**:
  - `Brand`: Optional per tenant (supports automotive groups, retail franchises, or single-brand entities).
  - `Branch`: Isolated per tenant with address and city metadata.
  - `BranchDepartment`: Configurable branch-department mapping defining exactly which departments exist in which facility.
  - `BranchArea`: Configurable branch areas (e.g., "Bay 1", "Wash Bay", "Cold Storage", "Dock 4", "Server Room").
  - `MaintenanceType`: Custom maintenance categories per tenant with color palettes and sort orders.
- **Custom Workflow Transitions**:
  - State transitions are validated by `workflow.service.js`, with support for tenant-specific transition overrides (`tenant.workflowConfig` / `tenant.features`).

---

## System Blueprint

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|                       React 18 + Vite + Tailwind CSS                            |
|       - 6-Step Cascading Request Creation Wizard (Brand -> Branch -> Dept -> Area)
|       - "MY ACTIONS" Personal Action Center + 13 Clickable Operational Views    |
|       - 6 Detailed Panels presenting all 43 Business Variables                  |
|       - Operational Controls: Checked-Off Switch, Rectification Modal, Feedback |
|       - Full Administration UI for Tenant Settings, SLA & Master Data (/settings)
+---------------------------------------------------------------------------------+
                                        |
                            REST API / JSON / JWT Tokens
                                        v
+---------------------------------------------------------------------------------+
|                                 SERVER LAYER                                    |
|                             Node.js + Express.js                                |
|  - JWT Authentication & Server-Derived Identity (req.user, req.tenantId)        |
|  - Role-Based Access Control (RBAC) & Branch Access Authorization Guards        |
|  - State Transition Engine (workflow.service.js) with Tenant Custom Overrides   |
|  - SLA & 12-Hour Grace Period Engine (sla.service.js)                           |
|  - Modular Feature Architecture (Auth, Org, Maintenance, Purchase, Vendors,     |
|    Dashboard, Reports, Notifications, Audit)                                    |
|  - Bulk Legacy Data Normalization & Import (import.controller.js)               |
+---------------------------------------------------------------------------------+
                                        |
                                    Prisma ORM
                                        v
+---------------------------------------------------------------------------------+
|                                DATABASE LAYER                                   |
|                             PostgreSQL 18.6 (Port 5433)                         |
|  - Strict Logical Tenant Isolation (Shared schema, tenantId on every entity)   |
|  - Composite Tenant Uniqueness (request numbers, codes, master data)            |
|  - Configurable Hierarchies: BranchDepartment, BranchArea, MaintenanceType     |
|  - Immutable Audit Logs, Status History Logs, Assignment Logs                   |
+---------------------------------------------------------------------------------+
```

---

## All 43 Business Variables Specification

| Category | # | Variable Name | Database Field / Model | Description |
|---|---|---|---|---|
| **Request** | 1 | Tracking ID | `requestNumber` | Sequential ID (`PREFIX-YYYY-XXXXXX`) |
| | 2 | Brand | `brand.name` | Associated brand or business division |
| | 3 | Branch | `branch.name` | Operating branch or facility |
| | 4 | Department | `department.name` | Allowed department based on branch mapping |
| | 5 | Branch Area | `branchArea.name` / `areaInBranch` | Specific location within the facility |
| | 6 | Equipment / Asset | `location` | Asset tag or equipment name |
| | 7 | Priority Level | `priority` | `HIGH`, `MEDIUM`, `LOW` |
| | 8 | Maintenance Work Type | `maintenanceType.name` | Category (e.g. Electrical, HVAC, Plumbing) |
| | 9 | Raised Timestamp | `createdAt` | ISO date & time of creation |
| | 10 | Requester Contact | `requesterContact` / `requester` | Requester name, email, phone |
| **Approval** | 11 | Approval Status | `approvalStatus` | `PENDING`, `APPROVED`, `REJECTED`, `NOT_REQUIRED` |
| | 12 | Approver Name | `approvedBy` / `rejectedBy` | Reviewing manager |
| | 13 | Approval Timestamp | `approvedAt` / `rejectedAt` | Decision timestamp |
| | 14 | Rejection Reason | `rejectionReason` | Mandatory reason if rejected |
| | 15 | Approval Copy Document | `approvalCopyUrl` | Uploaded signed approval document |
| **Assignment** | 16 | Assigned Executive | `assignedTo` | Technician or executive in charge |
| | 17 | Executive Contact | `assignedToContact` | Phone number of assigned technician |
| | 18 | Assigned Timestamp | `assignedAt` | Dispatch timestamp |
| | 19 | Dispatching Manager | `assignedBy` | Manager who assigned the task |
| | 20 | Manager Contact | `managerContact` | Phone number of assigning manager |
| | 21 | Assignment Latency | `timeToAssignMinutes` | Minutes taken from creation to assignment |
| | 22 | Action Plan | `actionPlan` | Structured execution steps |
| **Execution** | 23 | Lifecycle Work Status | `workStatus` | High-level state machine status |
| | 24 | Execution Status | `currentStatus` | Real-time execution stage |
| | 25 | Work Started Timestamp | `startedAt` | Timestamp when technician began work |
| | 26 | Work Completed Timestamp | `completedAt` | Timestamp when work was finished |
| | 27 | Actual Resolution Hours | `actualTimeHours` | Total elapsed operational hours |
| | 28 | Completion Remarks | `completionRemarks` | Technical summary of repairs |
| | 29 | Rectification State | `correctionDone` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `NOT_REQUIRED` |
| **Procurement** | 30 | Purchase Required | `purchaseStatus` / `purchaseRequests` | Flag indicating if parts are requisitioned |
| | 31 | Purchase Status | `purchaseStatus` | Status of procurement workflow |
| | 32 | Estimated Cost | `estimatedCost` | Initial cost projection |
| | 33 | Actual Cost | `actualCost` | Final reconciled expenditure |
| | 34 | Linked Purchase Orders | `purchaseRequests.prNumber` | Requisitions linked to the ticket |
| | 35 | Requisitioned Items | `materials` | Logged parts and quantities |
| | 36 | Procurement Remarks | `purchaseRemarks` | Notes on parts and delivery |
| **SLA & Grace** | 37 | Target SLA Hours | `targetHours` | Benchmark duration per priority |
| | 38 | Configured Grace Period | `graceHours` | Allowable window (default 12.0h) |
| | 39 | Absolute Deadline | `deadline` | Calculated SLA deadline |
| | 40 | SLA Variance | `differenceHours` | Difference between actual and target hours |
| | 41 | Compliance State | `slaClassification` | `ON_TIME`, `WITHIN_GRACE`, `OVERDUE` |
| **Verification** | 42 | Operational Checked-Off | `checkedOff` | Checked-off toggle flag & timestamp |
| | 43 | Customer Satisfaction | `isDissatisfied` / feedback | Satisfied closure or dissatisfied reopening |

---

## Security & Isolation Verification
- **Cross-Tenant Attack Prevention**: Every query is filtered with `where: { tenantId: req.tenantId }`. Attempting to access an entity belonging to another tenant yields 404 or 403.
- **Role-Based Authorization**: RBAC permissions are validated on every endpoint via `requireRole` middleware.
- **Audit Logging**: All state transitions, assignments, approvals, and configuration changes are recorded in the immutable `audit_logs` and `maintenance_request_status_histories` tables.
