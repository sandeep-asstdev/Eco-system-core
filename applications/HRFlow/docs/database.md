# docs/database.md

# HRFlow Multi-Tenant Database Architecture (PostgreSQL 18)

The HRFlow database schema is built on **PostgreSQL 18** and managed via **Prisma ORM**. It implements a shared-database, shared-schema multi-tenant design with strict foreign key constraints and composite indexes.

---

## 1. Multi-Tenant Master: `Tenant`

Stores the primary dealership organization, branding, subscription tier, and custom configuration.

```prisma
model Tenant {
  id               String       @id @default(uuid()) @db.Uuid
  organizationName String       @db.VarChar(150)
  legalName        String       @db.VarChar(200)
  code             String       @unique @db.VarChar(30)
  logoUrl          String?      @db.VarChar(500)
  contactPhone     String?      @db.VarChar(20)
  contactEmail     String?      @db.VarChar(100)
  address          String?      @db.Text
  subscriptionPlan String       @default("ENTERPRISE") @db.VarChar(50)
  status           TenantStatus @default(ACTIVE)
  settings         Json?        // Statutory rules, code formats, grace periods
  features         Json?        // Module gating flags (vacancies, payroll, etc.)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  // 21 Cascading Relations
  users            User[]
  branches         Branch[]
  employees        Employee[]
  positions        Position[]
  // ... all operational models cascade delete on tenant removal
}
```

---

## 2. Authentication & IAM: `User`

Stores application login credentials with role-based and tenant-scoped identity.

```prisma
enum UserRole {
  PLATFORM_ADMIN  // SaaS platform administrator (tenantId is NULL)
  HR              // Dealership-wide HR administrator (bound to tenantId)
  BM              // Branch manager (bound to tenantId and branchId)
  EMPLOYEE        // Self-service employee (bound to tenantId and employeeId)
}

model User {
  id           String    @id @default(uuid()) @db.Uuid
  email        String    @unique @db.VarChar(100)
  passwordHash String    @db.VarChar(255)
  role         UserRole  @default(EMPLOYEE)
  status       String    @default("ACTIVE") @db.VarChar(20)
  tenantId     String?   @db.Uuid
  tenant       Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  branchId     String?   @db.Uuid
  branch       Branch?   @relation(fields: [branchId], references: [id], onDelete: SetNull)
  employeeId   String?   @unique @db.Uuid
  employee     Employee? @relation(fields: [employeeId], references: [id], onDelete: SetNull)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([tenantId])
}
```

---

## 3. Branches: `Branch`

Physical dealerships, showrooms, and service workshops.

```prisma
model Branch {
  id       String  @id @default(uuid()) @db.Uuid
  tenantId String  @db.Uuid
  tenant   Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  code     String  @db.VarChar(20)
  name     String  @db.VarChar(100)
  city     String  @db.VarChar(50)
  state    String  @db.VarChar(50)
  address  String? @db.Text
  phone    String? @db.VarChar(20)
  email    String? @db.VarChar(100)
  active   Boolean @default(true)

  // Scoped uniqueness per dealership
  @@unique([tenantId, code])
  @@index([tenantId])
}
```

---

## 4. Employee Master & Organizational Placement: `Employee`

Comprehensive employee records with dealership, branch scoping, organizational level, designation, and reporting manager hierarchy.

```prisma
model Employee {
  id                 String         @id @default(uuid()) @db.Uuid
  tenantId           String         @db.Uuid
  tenant             Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  branchId           String         @db.Uuid
  branch             Branch         @relation(fields: [branchId], references: [id], onDelete: Restrict)
  employeeCode       String         @db.VarChar(30)
  firstName          String         @db.VarChar(50)
  lastName           String         @db.VarChar(50)
  email              String         @db.VarChar(100)
  designation        String         @db.VarChar(100) // Synced with designationRel.name
  levelId            String?        @db.Uuid
  level              EmployeeLevel? @relation(fields: [levelId], references: [id], onDelete: SetNull)
  designationId      String?        @db.Uuid
  designationRel     Designation?   @relation(fields: [designationId], references: [id], onDelete: SetNull)
  reportingManagerId String?        @db.Uuid
  reportingManager   Employee?      @relation("ReportingHierarchy", fields: [reportingManagerId], references: [id], onDelete: SetNull)
  directReports      Employee[]     @relation("ReportingHierarchy")
  status             EmployeeStatus @default(ACTIVE)

  // Scoped uniqueness: employeeCode and email unique WITHIN dealership
  @@unique([tenantId, employeeCode])
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([tenantId, branchId])
  @@index([tenantId, levelId])
  @@index([tenantId, designationId])
  @@index([tenantId, reportingManagerId])
}
```

---

## 5. Organization Masters: `EmployeeLevel` & `Designation`

HRFlow implements a generic, tenant-scoped organizational taxonomy:

```prisma
model EmployeeLevel {
  id           String        @id @default(uuid()) @db.Uuid
  tenantId     String        @db.Uuid
  levelNumber  Int           // Numerical hierarchy band (e.g. 1 to 10)
  name         String        @db.VarChar(100) // e.g. Staff, Middle Management, Executive
  description  String?       @db.Text
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  tenant       Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  designations Designation[]
  employees    Employee[]

  @@unique([tenantId, levelNumber])
  @@index([tenantId])
  @@index([tenantId, isActive])
}

model Designation {
  id          String        @id @default(uuid()) @db.Uuid
  tenantId    String        @db.Uuid
  levelId     String        @db.Uuid
  name        String        @db.VarChar(100) // Exact company designation
  code        String?       @db.VarChar(30)  // Optional alphanumeric code (e.g. BLD-L5-02)
  description String?       @db.Text
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  level       EmployeeLevel @relation(fields: [levelId], references: [id], onDelete: Restrict)
  employees   Employee[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([tenantId, levelId])
  @@index([tenantId, isActive])
}
```

---

## 6. Composite Uniqueness & Isolation Matrix

| Model | Composite Unique Constraint | Business Rationale |
|---|---|---|
| `Branch` | `@@unique([tenantId, code])` | Allows different dealer groups to have `HQ`, `MAIN`, or `DEL-01` without collision. |
| `EmployeeLevel` | `@@unique([tenantId, levelNumber])` | Strict sequential level ordering within each dealer group without collision across tenants. |
| `Designation` | `@@unique([tenantId, name])` | Unique designation names per dealership tenant; distinct tenants can share common titles ("Technician"). |
| `Employee` | `@@unique([tenantId, employeeCode])` | Allows independent employee numbering systems per dealer group (e.g. `APEX-1001`, `BLD-1001`). |
| `Employee` | `@@unique([tenantId, email])` | Ensures email uniqueness within the dealer organization. |
| `Position` | `@@unique([tenantId, positionCode])` | Dealerships independently control requisition codes. |
| `ManpowerBudget` | `@@unique([tenantId, branchId, department, financialYear])` | Branch budgeting scoped per financial year per dealer organization. |
| `PaymentAdvice` | `@@unique([tenantId, referenceNumber])` | Bank disbursement advice references generated per tenant. |

---

## 7. Reporting Hierarchy & Circular Prevention

Employees hold a nullable self-referencing foreign key `reportingManagerId` pointing to an `Employee` within the **same tenant**.
- Multi-tier vertical chains: `Washers (L1) -> Technician (L3) -> Service Advisor (L3) -> Branch Manager (L5) -> Service Head (L6) -> Chief Service Officer (L7) -> Director/CEO (L9) -> MD (L10)`.
- Enforced at backend:
  1. `reportingManager.tenantId === employee.tenantId`
  2. `reportingManagerId !== employee.id` (self-reporting blocked)
  3. Cycle detection traverses ancestor chain to block indirect circular loops.

---

## 8. Claims & Expenses Module Compatibility

Organizational hierarchy connects to future policy rules via Levels:
```text
Employee
   ↓ (belongs to)
EmployeeLevel (Level 1..10)
   ↓ (applies)
ClaimPolicy (Food, Travel, Lodging limits mapped to Level, NOT Designation string)
```
This guarantees portability: changing a designation or creating new titles never breaks claim rules or approval matrices.

---

## 9. Performance & Multi-Tenant Query Optimization

To guarantee sub-15ms response times across multi-tenant queries:
1. Every table contains an index on `tenantId`.
2. Operational tables (Employees, Positions, Budgets, Approvals, Attendance, Pay Days, Deductions, Payroll, Levels, Designations) contain composite indexes `@@index([tenantId, levelId])`, `@@index([tenantId, isActive])`, etc.
3. The Prisma query engine generates `WHERE "tenantId" = $1 AND ...` targeting specific index partitions.
