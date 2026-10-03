# Automobile Dealership Organization Model V2 — System Architecture & Design Specification

**Document Version**: 2.0.0  
**Status**: APPROVED DESIGN SPECIFICATION  
**Author**: Lead Enterprise SaaS & Automotive Systems Architect  
**Workspace**: `C:\Users\User\Desktop\Automobile_Ecosystem`

---

## 1. Architectural Foundations & Definitions

To reflect real-world automotive dealership conglomerates without breaking existing software, the system defines ten fundamental organizational primitives:

### A. What is Tenant?
* **Definition**: A **Tenant** represents the top-level **Dealership Holding Group / Customer Enterprise** (e.g. *Bellad Group*, *Apex Automotive Group*, *Kalyani Motors Group*).
* **Scope**: It forms the absolute boundary of tenancy, data isolation, billing subscription, and root administrative authority. No user, branch, firm, or operational record can cross tenant boundaries.
* **Database Representation**: `Tenant` model in PostgreSQL 18.

### B. What is Firm?
* **Definition**: A **Firm** is a distinct **Legal Corporate Entity** registered under the Indian Companies Act or Partnership Act (e.g., *Bellad Motors Pvt Ltd*, *Bellad Auto Enterprises LLP*).
* **Attributes**: Holds distinct statutory credentials: Corporate Identification Number (CIN), Permanent Account Number (PAN), Tax Deduction Account Number (TAN), and registered corporate state.
* **Role in Ecosystem**: Serves as the contracting party for OEM franchise agreements, employee employment contracts, vendor contracts, financial balance sheets, and bank credit lines.
* **Relationship**: Belongs to exactly one `Tenant`. A `Tenant` has 1..N `Firms`.

### C. What is Brand?
* **Definition**: A **Brand** represents an **Automotive Original Equipment Manufacturer (OEM)** or franchise product line (e.g., *Hyundai Motor India*, *MG Motor India*, *Maruti Suzuki Arena*, *Nexa*, *Tata Motors Passenger Vehicles*, *Toyota Bharat*).
* **Role in Ecosystem**: Governs model lineups, warranty claim formats, OEM-mandated service intervals, and branded customer experience standards.
* **Relationship**: Registered under a `Tenant`, and formally linked to legal entities via `FirmBrand` franchise agreements.

### D. What is Location?
* **Definition**: A **Location** is a distinct **Physical Property, Campus, or Facility** situated at a specific physical address with geographic coordinates (e.g., *Plot 14-A, Gokul Industrial Estate, Hubballi*, or *102 P.B. Road Automotive Hub, Dharwad*).
* **Attributes**: Physical street address, city, state, postal code, GPS latitude/longitude, plot/survey number, premises ownership type (Owned, Leased, Rented), facility size (sq ft), and shared campus infrastructure (security gate, high-voltage transformer, customer parking, wash bay).
* **Relationship**: Belongs to a `Tenant`. Hosts 1..N `Branches` (outlets). May be shared by branches belonging to different sister `Firms`.

### E. What is Branch / Outlet?
* **Definition**: A **Branch** (also termed **Dealership Outlet, Store, or Point of Sale**) is an **Operational Commercial Unit** that conducts business with customers and the OEM under an authorized dealer code.
* **Attributes**: OEM Dealer Code, Branch Display Name, State GSTIN (Goods and Services Tax Identification Number), commercial phone/email, active status, and operational configuration.
* **Relationship**:
  - Owned by exactly one legal `Firm` (for GST invoicing and liability).
  - Situated at exactly one physical `Location` (via foreign key `locationId`).
  - Associated with 1..N `Brands` via `BranchBrand` junction.
  - Hosts 1..N `Business Units` (capabilities) via `BranchBusinessUnit` junction.
  - Hosts 1..N `Departments` (functional teams).

### F. What is Business Unit?
* **Definition**: A **Business Unit (Capability / Functional Stream)** represents a distinct **Automotive Commercial Line of Operation** conducted at an outlet.
* **Core Catalog**:
  1. `SALES`: New vehicle retail, customer test drives, vehicle booking, financing desk, RTO vehicle registration, and delivery.
  2. `SERVICE`: Periodic maintenance, mechanical diagnostics, electronic repairs, engine overhauls, and warranty claims.
  3. `SPARES`: OEM genuine parts depot, workshop parts issue, over-the-counter (OTC) retail, and wholesale distribution.
  4. `BODYSHOP`: Accidental damage structural repair, chassis alignment, panel beating, paint booth, and insurance claim surveyor approvals.
  5. `PDI`: Pre-Delivery Inspection, stockyard receipt inspection, rust-proofing, and high-security registration plate (HSRP) fitment.
  6. `USED_CARS`: Pre-owned car evaluation, exchange trade-in, refurbishment, certification, and pre-owned vehicle retail.
  7. `ACCESSORIES`: OEM lifestyle merchandise, car audio, seat covers, and vehicle styling kits.
  8. `INSURANCE_FINANCE`: New policy issuance, renewal desk, cashless tie-up claims, and retail auto loans.
  9. `DETAILING`: Ceramic coating, paint protection film (PPF), interior steam cleaning, and underbody anti-rust treatments.
* **Key Principle**: `BusinessUnit` is NOT an organizational hierarchy level; it is an operational capability activated on a branch.

### G. What is Department?
* **Definition**: A **Department** represents an **Internal Functional Team / Cost Center** within a branch or centralized across the dealership group (e.g., *Showroom Sales Consultants*, *Workshop Technicians*, *Accounts & Cashier*, *Central HR & Admin*, *Customer Relationship Management & Calling Team*).
* **Relationship**: Belongs to a `Tenant`, and may optionally be linked to a specific `Branch` (`branchId: null` for group-wide departments; `branchId: UUID` for branch-specific teams).

### H. What is a Brand Association?
* **Definition**: The separation between **Franchise Ownership** and **Physical Outlet Operation**:
  1. `FirmBrand`: The legal agreement between a `Firm` and an OEM `Brand` granting dealership franchise rights and dealer agreement numbers.
  2. `BranchBrand`: The physical/commercial authorization for a specific `Branch` to represent that brand (e.g., *Hubballi Main Outlet* is authorized for both *Hyundai* and *MG*).

### I. What is User Membership?
* **Definition**: Represents an employee's **Organizational Placement** within the dealership group.
* **Model**: `OrganizationMembership` linking a `User` to a primary `Branch`, an optional `Department`, an optional `BusinessUnit`, with designation and HR employee code.

### J. What is Access Scope?
* **Definition**: The precise boundary governing what records and actions a user can view or mutate in the system. Expressed through `UserRoleAssignment` with dimensional constraints: `tenantId`, `firmId`, `brandId`, `locationId`, `branchId`, `businessUnitId`, and `departmentId`.

---

## 2. Resolution of the Required Design Question

### Question:
Should the model be a rigid linear hierarchy:
```text
Firm -> Location -> Branch -> Brand -> Business Unit
```
or a normalized join model using associative entities (`BranchBrand`, `BranchBusinessUnit`)?

### Architectural Decision:
The linear hierarchy is **architecturally flawed and rejected**. A real-world dealership environment cannot be mapped to a linear tree because:
1. **Shared Campuses**: Two branches owned by two *different* sister firms often sit at the *same* physical location. A strict `Firm -> Location` hierarchy would force the physical location to be duplicated twice, losing spatial identity and consolidated facility metrics.
2. **Multi-Brand Outlets**: One physical branch outlet often represents two or more brands (e.g. *Bellad Hubballi Main* selling *Hyundai* and *MG*). In a linear tree, you would be forced to create two separate fake branches, duplicating staff, GSTINs, and physical operational records.
3. **Multi-Capability Branches**: A branch does not have one brand per business unit. Rather, a branch has capabilities (Sales, Service, Spares), and those capabilities may be shared or brand-specific.

### Target Normalized Architecture:
```text
PLATFORM
   │
   ▼
TENANT (Dealer Group)
   │
   ├── [1..N] Firm (Legal Corporate Entity)
   │             │
   │             └── owns ──┐
   │                        │
   ├── [1..N] Location (Physical Campus / Real Estate)
   │             │          │
   │             └── hosts ─┼──► Branch (Operational Dealership Outlet)
   │                        │       │
   ├── [1..N] Brand (OEM)   │       ├── [1..N] BranchBrand ──► Brand
   │            │           │       │
   │            └─ franchise┘       ├── [1..N] BranchBusinessUnit ──► BusinessUnit (Sales, Service, Spares...)
   │                                │
   │                                └── [1..N] Department (Functional Teams)
   │
   └── [1..N] User ──► OrganizationMembership (Branch, Dept, BusinessUnit)
                      └──► UserRoleAssignment (Role + Dimensional Scopes)
```

---

## 3. Validation Against All 16 Edge Cases

| Case | Scenario | Model Representation & Resolution |
| :--- | :--- | :--- |
| **Case 1** | One firm, multiple branches | `Firm A` has 4 `Branch` records (`Branch 1..4`), each with `firmId = FirmA.id`. Validated. |
| **Case 2** | Multiple firms under one tenant | `Tenant` has `Firm A` (Branches 1 & 2) and `Firm B` (Branches 3 & 4). Each branch points to its respective firm while sharing `tenantId`. Validated. |
| **Case 3** | Multiple brands under one firm | `Firm A` has `FirmBrand` links for `Hyundai`, `MG`, and `Ather`. Validated. |
| **Case 4** | One branch, multiple brands | `Branch Hubballi` has two `BranchBrand` records: one pointing to `Hyundai`, one pointing to `MG`. Validated. |
| **Case 5** | One brand, multiple branches | `Brand Hyundai` is linked via `BranchBrand` to `Branch Hubballi`, `Branch Dharwad`, and `Branch Gadag`. Validated. |
| **Case 6** | One branch has only Sales | `Branch A` has a single `BranchBusinessUnit` record for `SALES`. `SERVICE` and `SPARES` are absent. Validated. |
| **Case 7** | One branch has Full 3S | `Branch B` has three `BranchBusinessUnit` records: `SALES`, `SERVICE`, `SPARES`. Validated. |
| **Case 8** | One branch has Service, Spares, Bodyshop (No Sales) | `Branch C` has `BranchBusinessUnit` records for `SERVICE`, `SPARES`, and `BODYSHOP`. `SALES` is absent. Validated. |
| **Case 9** | Shared physical location | `Location X` hosts `Branch 1` (Firm A, Hyundai Sales), `Branch 2` (Firm B, MG Sales), and `Branch 3` (Firm A, Joint Service). All three branches share `locationId = LocationX.id`. Validated. |
| **Case 10** | User working across multiple branches | `User` has multiple `OrganizationMembership` records: Primary at `Branch 1`, Secondary at `Branch 2`. Validated. |
| **Case 11** | User working across multiple brands | `User` has `UserRoleAssignment` with `scopeType = TENANT` or `scopeType = BRANCH` (no `brandId` restriction), allowing them to serve all brands at the branch. Validated. |
| **Case 12** | Different permissions at different branches | `User` has two `UserRoleAssignment` records: Role `BRANCH_MANAGER` scoped to `Branch 1`, and Role `BRANCH_VIEWER` scoped to `Branch 2`. Validated. |
| **Case 13** | Regional manager seeing several branches | `User` has multiple `UserRoleAssignment` records for Role `REGIONAL_MANAGER` pointing to specific branch IDs in that cluster, or a `locationId` scope. Validated. |
| **Case 14** | HR manager seeing employees across all branches, but no operational data | `User` has Role `HR_MANAGER` with `scopeType = TENANT`. Permissions include `hr.employee.*` but lack `maintenance.*` or `sales.*`. Validated. |
| **Case 15** | Branch manager seeing only their branch | `User` has Role `BRANCH_MANAGER` with `scopeType = BRANCH` and `branchId = TargetBranch.id`. Validated. |
| **Case 16** | Service manager with composite scope | `UserRoleAssignment` with `role = SERVICE_MANAGER`, `brandId = Hyundai.id`, `branchId = Hubballi.id`, and `businessUnitId = Service.id`. Validated. |

---

## 4. Database Schema Evolution & Constraints

### 4.1 New Entities:
1. **`Location`**:
   - `id`: UUID (Primary Key)
   - `tenantId`: Foreign Key -> `Tenant.id` (Cascade)
   - `code`: String (Unique per tenant: `[tenantId, code]`)
   - `name`: String (e.g. "Airport Road Automotive Complex")
   - `type`: Enum/String (`DEALERSHIP_CAMPUS`, `STANDALONE_STORE`, `WORKSHOP_FACILITY`, `STOCKYARD`)
   - `addressLine1`, `addressLine2`, `city`, `state`, `pincode`, `country`
   - `latitude`, `longitude`: Float? (GPS coordinates)
   - `plotNumber`, `surveyNumber`: String?
   - `totalAreaSqFt`: Int?
   - `active`: Boolean (Default true)
   - Timestamps & Audit links

2. **`BusinessUnit`**:
   - `id`: UUID (Primary Key)
   - `tenantId`: Foreign Key -> `Tenant.id` (Cascade)
   - `code`: String (e.g. `SALES`, `SERVICE`, `SPARES`, `BODYSHOP`, `PDI`, `USED_CARS`)
   - `name`: String (e.g. "New Car Sales", "Mechanical Service & Repairs")
   - `type`: String (`3S_CORE`, `VALUE_ADDED_SERVICE`, `SUPPORT`)
   - `icon`: String?
   - `description`: String?
   - `isSystem`: Boolean (Default false, true for standard 3S units)
   - `active`: Boolean (Default true)
   - Unique per tenant: `[tenantId, code]`

3. **`BranchBusinessUnit`**:
   - `id`: UUID (Primary Key)
   - `tenantId`: Foreign Key -> `Tenant.id` (Cascade)
   - `branchId`: Foreign Key -> `Branch.id` (Cascade)
   - `businessUnitId`: Foreign Key -> `BusinessUnit.id` (Cascade)
   - `operationalStatus`: String (`ACTIVE`, `MAINTENANCE`, `TEMPORARILY_CLOSED`)
   - `capacityUnits`: Int? (e.g., number of service bays or showroom display spots)
   - `workingHours`: Json?
   - Unique: `[branchId, businessUnitId]`

4. **`BranchBrand`**:
   - `id`: UUID (Primary Key)
   - `tenantId`: Foreign Key -> `Tenant.id` (Cascade)
   - `branchId`: Foreign Key -> `Branch.id` (Cascade)
   - `brandId`: Foreign Key -> `Brand.id` (Cascade)
   - `dealerCode`: String? (OEM-specific dealer/outlet code)
   - `isPrimary`: Boolean (Default true)
   - `active`: Boolean (Default true)
   - Unique: `[branchId, brandId]`

### 4.2 Modifications to Existing Models:
- **`Branch`**:
  - Add `locationId String?`: Foreign Key -> `Location.id` (SetNull).
  - Existing `address`, `city`, `state`, `pincode`, `outletType`, `firmBrandId` are preserved 100% for existing API consumers and backward compatibility.
  - Relations added: `location Location?`, `branchBrands BranchBrand[]`, `branchBusinessUnits BranchBusinessUnit[]`.
- **`ScopeType` Enum**:
  - Add `LOCATION` and `BUSINESS_UNIT`.
- **`UserRoleAssignment`**:
  - Add `locationId String?` and `businessUnitId String?` with relation fields.
- **`OrganizationMembership`**:
  - Add `businessUnitId String?` with relation fields.
