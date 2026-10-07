# MAINTLY Operational Workflow Engine

## Lifecycle Overview

```
[ EMPLOYEE / USER ]
       │
       ▼
 [ SUBMIT NEW REQUEST ] ────────► Initial Status: PENDING_APPROVAL
       │
       ▼
 [ APPROVER / MANAGER ]
       ├──► REJECT ────────► Status: REJECTED (Reason captured & logged)
       └──► APPROVE ───────► Status: APPROVED
              │
              ▼
       [ WORK ASSIGNMENT ]
              │ (Assigned to Technician, historical assignment stored)
              ▼ Status: ASSIGNED
       [ EXECUTION (Technician) ]
              ├──► Started ─────────► Status: IN_PROGRESS (startedAt logged)
              ├──► Log Materials ───► Total cost accumulated
              ├──► Parts Needed? ───► Status: WAITING_FOR_PURCHASE
              │                             │
              │                             ▼
              │                    [ PURCHASE WORKFLOW ]
              │                    - Purchase Request created
              │                    - Vendor quotation attached
              │                    - Management Approval
              │                    - Purchase Order issued
              │                    - Material Received ───────► Resumes IN_PROGRESS
              │
              ├──► External Vendor? ─► Status: WAITING_FOR_VENDOR
              └──► Complete Work ────► Status: COMPLETED (completionRemarks logged)
                                             │
                                             ▼
                                     [ QUALITY VERIFICATION ]
                                             ├──► DISSATISFIED ──► Status: REOPENED (reason captured)
                                             │                         │
                                             │                         └──► Work in progress resumes
                                             └──► SATISFIED ─────► Status: CLOSED (closedAt logged)
```

## Detailed Workflow Rules

### 1. Request Creation
- Anyone with the `EMPLOYEE`, `MANAGER`, `APPROVER`, `MAINTENANCE_USER`, or `TENANT_ADMIN` role can raise a maintenance request for their authorized branch.
- Generates a tenant-scoped request number `REQ-YYYY-XXXX`.
- Notifications are immediately dispatched to the branch approvers and managers.

### 2. Approval Gate
- Approvers or Managers inspect the request.
- If **Approved**: Moves to `APPROVED`. Notification sent to requester.
- If **Rejected**: Requires a mandatory `rejectionReason`. Moves to `REJECTED`. The request terminates.

### 3. Assignment
- Managers assign the request to an individual technician (`MAINTENANCE_USER`).
- A new record is inserted into `maintenance_request_assignments` with `active: true`. Prior assignments for this task are marked `active: false`.
- The technician receives an in-app notification.

### 4. Execution & Materials
- Technician updates status to `IN_PROGRESS`.
- If parts or tools are consumed, technician logs items into `maintenance_request_materials`. The total cost automatically rolls up into `actualCost` on the maintenance request.
- Attachments (before/after photos, diagnostics) can be uploaded at any time.

### 5. Procurement Integration
- If parts must be purchased from an external supplier, a `PurchaseRequest` is created.
- The maintenance request transitions to `WAITING_FOR_PURCHASE`.
- Quotations from registered vendors are uploaded.
- Once materials are physically received onsite, the user marks the PR as `RECEIVED`. The system automatically transitions the maintenance request back to `IN_PROGRESS`!

### 6. Verification & Dissatisfaction / Reopen Loop
- Once work is finished, technician marks the task `COMPLETED` with detailed remarks.
- The original requester is prompted to verify:
  - **SATISFIED**: The request is permanently closed (`CLOSED`).
  - **DISSATISFIED**: The requester inputs a mandatory dissatisfaction reason. The task transitions to `REOPENED`, alerting the technician and manager that rectification is required.
