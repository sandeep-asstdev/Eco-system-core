# Organization Model V2 — Dimensional Scoped RBAC Specification

**Document Version**: 2.0.0  
**Status**: APPROVED RBAC SPECIFICATION  
**Author**: Lead Enterprise SaaS & Automotive Systems Architect  
**Workspace**: `C:\Users\User\Desktop\Automobile_Ecosystem`

---

## 1. Principles of Dimensional Scoped RBAC

In generic RBAC, a user is assigned a Role (e.g. `MANAGER`). In a multi-company, multi-brand automotive dealership group, a role without spatial and functional dimensions is meaningless. A "Service Manager" does not manage the entire enterprise; they manage the Service Department for a specific Brand at a specific Branch.

The ecosystem utilizes **Dimensional Scoped RBAC**:
```text
Access Decision = Function(User, Required Permission, Target Context [Tenant, Firm, Brand, Location, Branch, BusinessUnit, Department])
```

---

## 2. Scope Hierarchy & Evaluation Semantics

The `ScopeType` enum is extended:
```prisma
enum ScopeType {
  GLOBAL          // SuperAdmin across all tenants
  TENANT          // Group-wide access (e.g., Managing Director, Group HR Head, Group CFO)
  FIRM            // All branches & brands under a specific legal entity (e.g., Bellad Motors Director)
  BRAND           // Brand-specific access across branches (e.g., Hyundai Brand Head)
  LOCATION        // All branches operating on a physical campus (e.g., Hubballi Campus Security/Facility Mgr)
  BRANCH          // Specific dealership outlet (e.g., Hubballi Main Showroom General Manager)
  BUSINESS_UNIT   // Specific operational stream (e.g., Regional Workshop Auditor, Bodyshop Head)
  DEPARTMENT      // Specific functional team (e.g., Showroom Sales Team Leader)
}
```

### Scope Evaluation Rules in Middleware:
When a route is guarded by `checkPermission('maintenance.ticket.create', getScope)`:
1. **Platform Admin**: Always allowed.
2. **Tenant Scope**: If user has role assignment with `scopeType = TENANT` and role has permission, access is granted.
3. **Firm Scope**: Matches if `assignment.firmId === targetFirmId`.
4. **Brand Scope**: Matches if `assignment.brandId === targetBrandId`.
5. **Location Scope**: Matches if `assignment.locationId === targetLocationId`.
6. **Branch Scope**: Matches if `assignment.branchId === targetBranchId`.
7. **Business Unit Scope**: Matches if `assignment.branchId === targetBranchId` AND `assignment.businessUnitId === targetBusinessUnitId`.
8. **Department Scope**: Matches if `assignment.branchId === targetBranchId` AND `assignment.departmentId === targetDeptId`.

---

## 3. Real-World Personas & Assignment Matrix

| Persona | Role Code | Scope Type | Scope Dimensions | Granted Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Group Managing Director** | `TENANT_ADMIN` | `TENANT` | `tenantId: Bellad` | View all financials, reports, employees, and inventory across all firms, brands, and branches. |
| **Legal Firm Director** | `FIRM_ADMIN` | `FIRM` | `firmId: BelladMotors` | Manage all branches, bank accounts, and compliance for Bellad Motors Pvt Ltd. Cannot view Bellad Logistics. |
| **OEM Brand Head (Hyundai)** | `BRAND_ADMIN` | `BRAND` | `brandId: Hyundai` | Access sales numbers, warranty claims, and targets for Hyundai across Hubballi, Dharwad, and Belgaum branches. Cannot view MG data. |
| **Campus Facility Head** | `FACILITY_ADMIN`| `LOCATION` | `locationId: GokulCampus` | View and manage building maintenance, power usage, and security for all outlets situated on Gokul Road. |
| **Branch General Manager** | `BRANCH_MANAGER`| `BRANCH` | `branchId: HBL-Main` | Full operational control of Hubballi Main Showroom across all active brands and departments. |
| **Workshop Service Manager**| `SERVICE_MANAGER`| `BUSINESS_UNIT`| `branchId: HBL-Main`, `businessUnitId: SERVICE` | Control job cards, service advisors, technicians, and bay utilization. Cannot alter new car sales contracts. |
| **Floating Diagnostic Tech**| `TECHNICIAN` | `BRANCH` (multi) | `branchId: HBL-Main` + `branchId: DHW-Outlet` | Dual memberships allow clocking into repair orders at either workshop. |
| **Group HR Officer** | `HR_OFFICER` | `TENANT` | `tenantId: Bellad` | Manage dossiers, attendance, leaves, and payroll across all branches. Cannot view vehicle sales margins. |
