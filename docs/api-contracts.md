# Integration API Contracts & Event Payloads Specification

## 1. Standard API Conventions

All ecosystem APIs adhere to standardized REST principles:
- **Base URI**: `/api/v1/...`
- **Data Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "total": 120, "page": 1, "limit": 20 }
  }
  ```
- **Error Envelope**:
  ```json
  {
    "success": false,
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Branch with ID 4f2c... was not found.",
      "details": []
    }
  }
  ```
- **Authentication**: `Authorization: Bearer <RS256_OIDC_TOKEN>`
- **Tenant Context**: Automatically injected from token claim `tenant_id`.

---

## 2. Core Platform REST Contracts (`ecosystem-core`)

### 2.1 Identity & Authentication (`/api/v1/auth`)

#### `GET /api/v1/auth/me`
Retrieves authenticated user profile, tenant context, branch memberships, and authorized applications.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr-9281-abcd",
        "email": "bm.hubli@belladgroup.com",
        "firstName": "Rajesh",
        "lastName": "Sharma",
        "isPlatformAdmin": false
      },
      "tenant": {
        "id": "tnt-bellad-1234",
        "code": "BELLAD",
        "name": "Bellad Group",
        "status": "ACTIVE"
      },
      "memberships": [
        {
          "firmId": "frm-bmpl-01",
          "firmName": "Bellad Motors Pvt Ltd",
          "branchId": "brn-hubli-01",
          "branchName": "Hubli 3S Facility",
          "departmentId": "dpt-service-01",
          "departmentName": "Service",
          "isPrimary": true
        }
      ],
      "applications": [
        {
          "appKey": "hrflow",
          "name": "HRFlow HRMS",
          "baseUrl": "http://localhost:3001",
          "icon": "Users"
        },
        {
          "appKey": "maintly",
          "name": "MAINTLY Facilities",
          "baseUrl": "http://localhost:3002",
          "icon": "Wrench"
        }
      ],
      "permissions": [
        "hr.employee.read",
        "hr.leave.approve",
        "maintenance.ticket.create",
        "maintenance.ticket.approve"
      ]
    }
  }
  ```

---

### 2.2 Organization Hierarchy Management (`/api/v1/org`)

#### `GET /api/v1/org/branches`
Lists physical facilities and outlets belonging to the active tenant.
- **Query Parameters**: `firmId`, `brandId`, `city`, `active`
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "brn-hubli-01",
        "tenantId": "tnt-bellad-1234",
        "firmId": "frm-bmpl-01",
        "firmName": "Bellad Motors Pvt Ltd",
        "code": "HBL-SHOWROOM-01",
        "name": "Hubli Main Showroom",
        "outletType": "3S_FACILITY",
        "city": "Hubli",
        "state": "Karnataka",
        "active": true
      }
    ]
  }
  ```

#### `POST /api/v1/org/branches`
Creates a physical branch outlet under a specific legal firm.
- **Required Permission**: `org.branch.manage`
- **Request Body**:
  ```json
  {
    "firmId": "frm-bmpl-01",
    "firmBrandId": "fb-bmpl-hyundai-01",
    "code": "DHW-WORKSHOP-01",
    "name": "Dharwad Bodyshop Facility",
    "outletType": "BODYSHOP",
    "address": "PB Road, Industrial Estate",
    "city": "Dharwad",
    "state": "Karnataka",
    "pincode": "580001",
    "phone": "+91 836 2200000"
  }
  ```

---

### 2.3 Application Registry & Subscriptions (`/api/v1/applications`)

#### `GET /api/v1/applications`
Catalog of registered ecosystem applications and their tenant subscription status.
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "app-hrflow-01",
        "appKey": "hrflow",
        "name": "HRFlow HRMS",
        "version": "1.0.0",
        "baseUrl": "http://localhost:3001",
        "apiUrl": "http://localhost:5000",
        "healthEndpoint": "/api/health",
        "isSubscribed": true,
        "subscriptionStatus": "ACTIVE",
        "planName": "ENTERPRISE"
      },
      {
        "id": "app-maintly-01",
        "appKey": "maintly",
        "name": "MAINTLY Facilities",
        "version": "1.0.0",
        "baseUrl": "http://localhost:3002",
        "apiUrl": "http://localhost:5002",
        "healthEndpoint": "/api/health",
        "isSubscribed": true,
        "subscriptionStatus": "ACTIVE",
        "planName": "ENTERPRISE"
      }
    ]
  }
  ```

---

### 2.4 HRFlow Versioned REST Integration Endpoints (`/api/v1/integrations`)

These versioned endpoints are provided by HRFlow for **MAINTLY** and central services to query authorized employee references without touching HRFlow's database directly.

#### `GET /api/v1/integrations/employees`
Lists authorized dealership employee references scoped by tenant and optional central branch.
- **Request Headers**: `Authorization: Bearer <RS256_OIDC_TOKEN>`
- **Query Parameters**:
  - `centralBranchId` (UUID, optional): Filter employees by central facility ID.
  - `status` (string, optional, default: `ACTIVE`): Filter by lifecycle state (`ACTIVE`, `PROBATION`, etc.).
  - `search` (string, optional): Search by name or employee code.
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "821c1ea5-99ce-4f7a-85f5-7fe90c058a7e",
        "centralTenantId": "883663e1-917e-4fae-8f1d-9d89e749362b",
        "centralBranchId": "df42516a-ac2b-4757-ae1e-fa0eddd0c246",
        "centralUserId": "8c1ba00f-b947-4bd7-b5b6-fe761580642f",
        "employeeCode": "BLD-1001",
        "firstName": "Anand",
        "lastName": "Bellad",
        "fullName": "Anand Bellad",
        "email": "anand.bellad@belladgroup.com",
        "phone": "+91 98450 11111",
        "status": "ACTIVE",
        "department": "Management",
        "designation": "Managing Director",
        "branch": {
          "id": "df42516a-ac2b-4757-ae1e-fa0eddd0c246",
          "name": "Hubli Central HQ & Showroom",
          "code": "BELLAD-HUB",
          "city": "Hubli"
        }
      }
    ],
    "meta": {
      "total": 14,
      "version": "v1"
    }
  }
  ```

#### `GET /api/v1/integrations/employees/:id`
Retrieves a specific employee reference by either HRFlow Employee UUID or Central User ID.
- **Request Headers**: `Authorization: Bearer <RS256_OIDC_TOKEN>`
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "id": "821c1ea5-99ce-4f7a-85f5-7fe90c058a7e",
      "centralTenantId": "883663e1-917e-4fae-8f1d-9d89e749362b",
      "centralBranchId": "df42516a-ac2b-4757-ae1e-fa0eddd0c246",
      "centralUserId": "8c1ba00f-b947-4bd7-b5b6-fe761580642f",
      "employeeCode": "BLD-1001",
      "firstName": "Anand",
      "lastName": "Bellad",
      "fullName": "Anand Bellad",
      "email": "anand.bellad@belladgroup.com",
      "phone": "+91 98450 11111",
      "status": "ACTIVE",
      "department": "Management",
      "designation": "Managing Director"
    }
  }
  ```

---

## 3. Asynchronous Integration Event Schemas

All domain integration events published to the message broker or webhook endpoints adhere to CloudEvents v1.0 standard envelope:

### Envelope Specification
```json
{
  "specversion": "1.0",
  "id": "evt-7a8b-9c0d-1e2f3a4b",
  "source": "https://api.ecosystem.com/hrflow",
  "type": "com.ecosystem.hr.employee.created",
  "time": "2026-09-24T12:00:00Z",
  "tenantid": "tnt-bellad-1234",
  "datacontenttype": "application/json",
  "data": { ... }
}
```

---

### Event 1: `employee.created` (v1)
Dispatched when candidate onboarding completes or an active employee record is created in HRFlow.
```json
{
  "specversion": "1.0",
  "id": "evt-001-emp-created",
  "source": "https://api.ecosystem.com/hrflow",
  "type": "com.ecosystem.hr.employee.created",
  "time": "2026-09-24T12:00:00Z",
  "tenantid": "tnt-bellad-1234",
  "data": {
    "employeeId": "hr-emp-101",
    "centralUserId": "usr-9281-abcd",
    "tenantId": "tnt-bellad-1234",
    "employeeCode": "BG-HBL-0042",
    "firstName": "Suresh",
    "lastName": "Patil",
    "email": "suresh.patil@belladgroup.com",
    "phone": "+91 98450 12345",
    "branchId": "brn-hubli-01",
    "branchCode": "HBL-SHOWROOM-01",
    "department": "Service",
    "designation": "Master Diagnostic Technician",
    "levelNumber": 8,
    "dateOfJoining": "2026-09-24",
    "status": "ACTIVE"
  }
}
```

---

### Event 2: `employee.transferred` (v1)
Dispatched when an employee is transferred between branches or promoted to another department.
```json
{
  "specversion": "1.0",
  "id": "evt-002-emp-transferred",
  "source": "https://api.ecosystem.com/hrflow",
  "type": "com.ecosystem.hr.employee.transferred",
  "time": "2026-09-24T12:30:00Z",
  "tenantid": "tnt-bellad-1234",
  "data": {
    "employeeId": "hr-emp-101",
    "employeeCode": "BG-HBL-0042",
    "previousBranchId": "brn-hubli-01",
    "newBranchId": "brn-belgaum-02",
    "effectiveDate": "2026-10-01",
    "reportingManagerId": "hr-emp-012"
  }
}
```

---

### Event 3: `employee.deactivated` / `employee.resigned` (v1)
Dispatched when an employee resigns, is terminated, or absconds. Used by MAINTLY to revoke technician assignments and reassign pending work orders.
```json
{
  "specversion": "1.0",
  "id": "evt-003-emp-resigned",
  "source": "https://api.ecosystem.com/hrflow",
  "type": "com.ecosystem.hr.employee.resigned",
  "time": "2026-09-24T14:00:00Z",
  "tenantid": "tnt-bellad-1234",
  "data": {
    "employeeId": "hr-emp-101",
    "employeeCode": "BG-HBL-0042",
    "status": "RESIGNED",
    "lastWorkingDay": "2026-10-24",
    "requiresAssetClearance": true
  }
}
```

---

### Event 4: `maintenance.ticket.created` (v1)
Dispatched by MAINTLY when a maintenance request is submitted.
```json
{
  "specversion": "1.0",
  "id": "evt-004-maint-created",
  "source": "https://api.ecosystem.com/maintly",
  "type": "com.ecosystem.maintenance.ticket.created",
  "time": "2026-09-24T15:00:00Z",
  "tenantid": "tnt-bellad-1234",
  "data": {
    "ticketId": "mnt-req-5012",
    "ticketNumber": "MAIN-HBL-2026-0089",
    "branchId": "brn-hubli-01",
    "departmentId": "dpt-service-01",
    "priority": "HIGH",
    "requesterEmployeeCode": "BG-HBL-0042",
    "subject": "Paint Booth Exhaust Motor Malfunction",
    "requiredDate": "2026-09-25T18:00:00Z"
  }
}
```

---

## 4. Phase 7 Employee Synchronization Event Specifications

### 4.1 Canonical Event Schema
All employee synchronization events published to `automobile.events.topic` adhere to the canonical schema:

```json
{
  "eventId": "ab7ac84c-e47d-4ff1-afb2-9046ea1018cd",
  "version": "1.0.0",
  "eventType": "employee.created",
  "centralTenantId": "883663e1-917e-4fae-8f1d-9d89e749362b",
  "hrEmployeeId": "821c1ea5-99ce-4f7a-85f5-7fe90c058a7e",
  "centralUserId": "84a1e6f3-f10c-411c-b6c5-95e693399416",
  "centralBranchId": "df42516a-ac2b-4757-ae1e-fa0eddd0c246",
  "employeeCode": "EMP-BLD-0104",
  "firstName": "Suresh",
  "lastName": "Kulkarni",
  "email": "suresh.k@belladgroup.com",
  "phone": "+91-9880011223",
  "department": "Service",
  "designation": "Master Diagnostic Technician",
  "employeeStatus": "ACTIVE",
  "timestamp": "2026-09-25T09:47:40.923Z"
}
```

### 4.2 Supported Event Types
1. **`employee.created`**: Fired when an employee record is created in HRFlow or an onboarding candidate finishes joining formalities.
2. **`employee.updated`**: Fired when an employee's personal details, contact info, department, or designation is modified.
3. **`employee.transferred`**: Fired when an employee is transferred to a different facility (`centralBranchId` updated).
4. **`employee.deactivated`**: Fired when an employee resigns, is terminated, or marked absconded. Maps to `EmployeeReference.status = 'INACTIVE'`.
5. **`employee.reactivated`**: Fired when an inactive employee is reinstated. Restores `EmployeeReference.status = 'ACTIVE'`.

---

## 5. Synchronization REST Endpoints

### 5.1 HRFlow Outbox Management Endpoints
- `GET /api/v1/integrations/outbox/status`: Returns current counts of `PENDING`, `PUBLISHING`, `PUBLISHED`, and `FAILED` outbox events.
- `GET /api/v1/integrations/outbox/events`: Returns paginated list of outbox events with status filter.
- `POST /api/v1/integrations/outbox/retry/:id`: Manually resets a failed event to `PENDING`.
- `POST /api/v1/integrations/outbox/retry-all`: Resets all failed events for immediate re-publishing.

### 5.2 MAINTLY Integration Endpoints
- `GET /api/integrations/sync-status`: Returns counts of cached `EmployeeReference` records and processed event counts.
- `POST /api/integrations/sync-initial`: Triggers bulk import from HRFlow without duplicate creation.
- `POST /api/integrations/replay-dlq`: Moves messages from `maintly.employee.sync.dlq` back to the main topic exchange.

### 5.3 Ecosystem Core Sync Governance Endpoints
- `GET /api/v1/sync/overview`: Comprehensive cluster sync health, queue depth, outbox breakdown, and broker connectivity.
- `GET /api/v1/sync/outbox/events`: Central proxy for reviewing HRFlow outbox records.
- `POST /api/v1/sync/initial-sync`: Central invocation of initial synchronization.
- `POST /api/v1/sync/retry-failed`: Central trigger for re-publishing failed outbox events.
- `POST /api/v1/sync/replay-dlq`: Central trigger for replaying dead-lettered messages.

---

## 6. Phase 8 Extensibility Contracts

### 6.1 Dynamic Application Registry (`/api/v1/applications`)

#### `GET /api/v1/applications`
Lists all registered platform applications with filtering by category or status.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "app-demo-01",
        "appKey": "demo-app",
        "code": "DEMO",
        "name": "Demo Reference Application",
        "category": "OPERATIONS",
        "baseUrl": "http://localhost:5005",
        "apiUrl": "http://localhost:5005",
        "apiVersion": "v1",
        "capabilities": ["orders.view", "orders.create"],
        "requiredPermissions": ["demo.order.view"],
        "supportedEvents": ["demo.item.created"],
        "status": "ACTIVE"
      }
    ]
  }
  ```

#### `POST /api/v1/applications`
Registers a new application into the ecosystem catalog dynamically.
- **Authorization**: `PLATFORM_ADMIN`
- **Request Body**:
  ```json
  {
    "appKey": "billing-app",
    "code": "BILLING",
    "name": "Vehicle Billing & Delivery",
    "category": "SALES",
    "baseUrl": "http://localhost:5006",
    "apiUrl": "http://localhost:5006",
    "apiVersion": "v1",
    "capabilities": ["invoices.generate", "gatepass.create"],
    "requiredPermissions": ["billing.invoice.create"],
    "supportedEvents": ["billing.invoice.issued"],
    "status": "ACTIVE"
  }
  ```

#### `GET /api/v1/applications/user-launcher`
Returns applications available specifically to the authenticated user based on active tenant subscriptions and user RBAC permissions.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**: Array of application objects with resolved target URLs and icons.

#### `POST /api/v1/applications/:id/subscribe`
Entitles a tenant to access an application.
- **Request Body**: `{ "tenantId": "883663e1-917e-4fae-8f1d-9d89e749362b", "plan": "ENTERPRISE" }`

#### `POST /api/v1/applications/:id/unsubscribe`
Revokes tenant entitlement to an application.
- **Request Body**: `{ "tenantId": "883663e1-917e-4fae-8f1d-9d89e749362b" }`

---

### 6.2 Provider-Independent Integration Hub (`/api/v1/integrations`)

#### `GET /api/v1/integrations/providers`
Returns catalog of integration adapters (e.g. `CUSTOM_REST`, `WEBHOOK`, `REALBOOK`, `TALLY`).

#### `POST /api/v1/integrations/tenants/:tenantId`
Configures a tenant-specific integration with AES-256-GCM encrypted credentials.
- **Request Body**:
  ```json
  {
    "providerCode": "REALBOOK",
    "credentials": {
      "apiKey": "realbook_live_key_998811",
      "companyCode": "BELLAD_MOTORS_HUB"
    },
    "fieldMappings": {
      "customerName": "party_name",
      "invoiceTotal": "gross_amount",
      "taxAmount": "total_gst"
    },
    "syncSchedule": "0 */4 * * *"
  }
  ```

#### `POST /api/v1/integrations/tenants/:tenantId/providers/:providerCode/sync`
Executes an on-demand sync batch, applying declarative field mappings and recording telemetry in `IntegrationSyncLog`.

---

### 6.3 Configurable Workflow Engine (`/api/v1/workflows`)

#### `POST /api/v1/workflows/definitions`
Creates a versioned workflow definition supporting declarative conditions and multi-stage approvals.
- **Request Body**:
  ```json
  {
    "workflowCode": "PURCHASE_ORDER_APPROVAL",
    "name": "Dealership PO Multi-Stage Approval",
    "triggerEvent": "purchase.order.requested",
    "conditions": {
      "and": [
        { "field": "amount", "operator": "gte", "value": 50000 }
      ]
    },
    "stages": [
      { "stageIndex": 0, "role": "BRANCH_MANAGER", "name": "Branch GM Approval" },
      { "stageIndex": 1, "role": "TENANT_ADMIN", "name": "Finance MD Approval" }
    ]
  }
  ```

#### `POST /api/v1/workflows/trigger`
Triggers workflow evaluation against an incoming domain event or entity action without executing arbitrary code.
- **Request Body**:
  ```json
  {
    "triggerEvent": "purchase.order.requested",
    "entityType": "PurchaseOrder",
    "entityId": "po-99120",
    "contextData": {
      "amount": 75000,
      "vendor": "Bosch Components",
      "branchCode": "HUB"
    }
  }
  ```

#### `POST /api/v1/workflows/instances/:id/action`
Submits an approval or rejection on the active stage. Enforces that the caller holds the required role for that stage.
- **Request Body**:
  ```json
  {
    "decision": "APPROVED",
    "comments": "Verified and approved for procurement."
  }
  ```

---

### 6.4 Versioned Cross-App Event Envelope
All asynchronous domain events conform to standard envelope:
```json
{
  "eventId": "evt-7721-a4b9-1234",
  "version": "1.0.0",
  "eventType": "demo.item.created",
  "centralTenantId": "883663e1-917e-4fae-8f1d-9d89e749362b",
  "payload": {
    "itemId": "item-9918",
    "name": "Diagnostic Brake Tester",
    "category": "WORKSHOP_EQUIPMENT",
    "serialNumber": "SN-982104"
  },
  "metadata": {
    "publisher": "demo-app",
    "correlationId": "corr-1192-3849",
    "timestamp": "2026-09-25T11:00:00.000Z"
  }
}
```


