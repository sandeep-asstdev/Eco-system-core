# MAINTLY Security & Isolation Architecture

## Multi-Tenant Isolation Guarantees

MAINTLY is engineered to prevent cross-tenant data leakage under all circumstances:

### 1. Server-Derived Identity
- `req.tenantId` is strictly extracted from the cryptographically signed JWT token verified against `JWT_SECRET`.
- The client cannot supply a header or body parameter to override `tenantId`.
- Every database query in every service/controller applies `where: { tenantId: req.tenantId }`.

### 2. Branch-Level Authorization
- Users are assigned to specific branches via `UserBranchAccess`.
- When an employee, manager, or technician accesses request lists or details, the server filters by `branchId: { in: req.branchIds }`.
- Platform Admin and Tenant Admin have company-wide branch oversight.

### 3. Role-Based Access Control (RBAC) Matrix

| Role | Create Request | Approve / Reject | Assign Tech | Update WIP / Log Parts | Raise PR / PO | Manage Vendors | Master Data | User Admin | Audit Logs |
|---|---|---|---|---|---|---|---|---|---|
| **PLATFORM_ADMIN** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **TENANT_ADMIN** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **MANAGER** | Yes | Yes | Yes | Yes | Yes | Yes | View | View | No |
| **APPROVER** | Yes | Yes | No | No | No | No | View | View | No |
| **MAINTENANCE_USER** | Yes | No | No | Yes | Yes | View | View | No | No |
| **PURCHASE_USER** | Yes | No | No | No | Yes | Yes | View | No | No |
| **EMPLOYEE** | Yes | No | No | No | No | No | View | No | No |

## Password & Token Security
- Passwords are salted and hashed using **bcryptjs** (10 rounds). Plaintext passwords are never stored or logged.
- Session tokens use **JSON Web Tokens (JWT)** with 7-day expiration.
- User accounts can be deactivated (`status: INACTIVE`), which immediately invalidates all subsequent API requests.

## Audit Logging
- Every sensitive operation (Logins, Creation, Approvals, Rejections, Assignments, Status transitions, Reopening, File uploads, User creations) is written to the immutable `audit_logs` table.
- Records capture: `userId`, `tenantId`, `action`, `entity`, `entityId`, `details`, `ipAddress`, `userAgent`, `createdAt`.
