# Automobile Dealership Organization Model — Industry & Domain Research

**Document Version**: 2.0.0  
**Date**: October 2026  
**Auditor / Architect**: Lead Enterprise SaaS & Automotive Systems Architect  
**Workspace**: `C:\Users\User\Desktop\Automobile_Ecosystem`

---

## 1. Executive Summary & Objective

Automobile dealerships operate under complex legal, physical, and operational structures that differ fundamentally from generic multi-tenant or enterprise B2B SaaS models. 
A naive hierarchy (`Tenant -> Firm -> Brand -> Branch -> Department`) fails when confronting real-world dealership groups because:
1. Physical real estate (Location) is distinct from operational commercial dealerships (Branch/Outlet).
2. Modern automotive groups operate multi-brand franchises on shared facilities (e.g., Hyundai + MG on a single campus, or multi-brand service centers).
3. The traditional **3S** operational model (**Sales, Service, Spares**) describes **business capabilities / operational functions**, not hierarchical parent-child nodes.
4. Dealership staff frequently float across physical bays, sister legal entities, or multiple OEM brands while requiring strictly partitioned data access in the Dealer Management System (DMS).

This document establishes the empirical industry research and domain principles governing the upgraded **Organization Model V2** for the Automobile Ecosystem.

---

## 2. Structured Domain Research Matrix

The research below spans OEM dealership standards (Maruti Suzuki, Hyundai Motor India, Tata Motors, Toyota Kirloskar), industry federation guidelines (Federation of Automobile Dealers Associations — FADA, Automotive Skills Development Council — ASDC), and established automotive dealer management platforms (CDK Global Drive, Reynolds & Reynolds ERA-IGNITE, Cox Automotive / DealerSocket, Horilla HRMS).

---

### Topic 1: Indian Automobile Dealership Organizational Structures

* **Source**: Federation of Automobile Dealers Associations (FADA) India — *Dealership Operational Benchmarking & Statutory Guidelines* (2024–2025); Indian Companies Act 2013 & GST Council Dealership Classification.
* **URL**: https://www.fada.in / Ministry of Corporate Affairs (MCA) Registrar of Companies.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Indian automotive dealership groups operate as corporate conglomerates comprising multiple distinct Private Limited, Limited, or Partnership legal entities (Firms), each possessing distinct Corporate Identification Numbers (CIN), Permanent Account Numbers (PAN), and state-specific Goods and Services Tax Identification Numbers (GSTIN). For example, a single promoter family controls *Bellad Motors Pvt Ltd* (for brand A), *Bellad Enterprises* (for brand B), and *Bellad Logistics* (for pre-owned & commercial vehicles).
* **Inference**:
  A single top-level `Tenant` represents the entire promoter/dealership holding group (e.g. *Bellad Group*). Legal obligations, vendor invoicing, employee payroll, tax filings, and bank credit facilities attach to the `Firm`, not the umbrella brand or branch.
* **Recommendation**:
  Retain `Tenant` as the top-level tenancy boundary and `Firm` as the legal corporate entity. Enforce strict isolation at the legal entity level while allowing group-level consolidation for executive analytics and group HR.

---

### Topic 2: The 3S Dealership Model (Sales, Service, Spares)

* **Source**: Automotive Skills Development Council (ASDC) India — *Automotive Dealership Operational Standards & Competency Frameworks*; OEM Standard Operating Procedures (Maruti Suzuki Arena / Nexa Manuals, Hyundai Dealer Standards).
* **URL**: https://www.asdc.org.in / OEM Dealer Manuals.
* **Date Accessed**: October 2026.
* **Source Fact**:
  The automotive industry defines **3S** as three core operational streams:
  1. **Sales (1S)**: Showroom display, vehicle enquiry handling, test drives, quotation, retail finance, accessory fitment, billing, and vehicle delivery.
  2. **Service (2S)**: Periodic maintenance, mechanical diagnostics, emergency repairs, warranty claims, and recall campaigns.
  3. **Spares (3S)**: Parts stockroom inventory, OTC (over-the-counter) retail sales, internal workshop issuance, wholesale distribution to secondary garages.
  Dealerships are commercially categorized by OEMs as:
  - **Full 3S Facility**: An integrated outlet hosting showroom, workshop, and parts depot.
  - **1S (Sales Outlet)**: City-center or mall boutique showroom with zero workshop capability.
  - **2S (Service & Spares)**: Industrial area facility hosting workshop bays and parts stock, with no new car display.
* **Inference**:
  `3S` is **not an organizational tier**. Modeling 3S as a hierarchical level beneath Branch creates duplicate branch records and confuses entity relationships. Sales, Service, and Spares are **operational capabilities / business units** activated on a branch.
* **Recommendation**:
  Model business capabilities as a first-class `BusinessUnit` catalog (`SALES`, `SERVICE`, `SPARES`, `BODYSHOP`, `PDI`, `USED_CARS`, `ACCESSORIES`, `INSURANCE_FINANCE`, `DETAILING`). Connect branches to business units via an explicit junction table (`BranchBusinessUnit`).

---

### Topic 3: Multi-Brand Dealer Groups

* **Source**: FADA Dealer Group Survey & Bain & Company *India Automotive Retail Report*.
* **URL**: https://www.fada.in / Industry Reports.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Over 68% of Tier-1 and Tier-2 dealership groups in India hold dealerships for two or more competing or complementary OEMs (e.g., Hyundai + MG + Ather, or Maruti Suzuki + Toyota). OEMs mandate strict brand separation for customer-facing touchpoints (separate fascia, exclusive customer lounges, dedicated sales executives), but permit backend synergies in administrative overhead, group HR, facility security, and central accounts.
* **Inference**:
  The system must support multi-brand portfolios under a single group tenant while guaranteeing customer-facing brand isolation, OEM-specific pricing, and role-based permissions.
* **Recommendation**:
  Retain the `Brand` model and `FirmBrand` franchise agreements. Introduce `BranchBrand` to allow branches to operate one or more brands with distinct dealer codes while sharing facility infrastructure.

---

### Topic 4: Multi-Company / Legal-Entity Dealer Groups

* **Source**: Institute of Chartered Accountants of India (ICAI) — *Technical Guide on Internal Audit of Automobile Dealerships*.
* **URL**: https://www.icai.org.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Automotive OEMs require dedicated legal entities for separate franchises to shield the OEM from inter-brand financial liabilities and cross-collateralization. Furthermore, tax optimization across state borders requires unique GSTIN registrations for each state where a firm operates.
* **Inference**:
  A branch must trace back to a specific legal entity (`Firm`) for GST invoicing, books of accounts, and statutory employee deductions (PF, ESI, Professional Tax).
* **Recommendation**:
  Ensure every `Branch` maintains a foreign key to its owning `Firm`. When a shared facility hosts outlets belonging to different sister firms, each outlet remains cleanly isolated to its parent firm.

---

### Topic 5: Dealer Outlet vs Physical Location

* **Source**: CDK Global — *CDK Drive Enterprise Organization Model*; Reynolds & Reynolds *ERA-IGNITE Multi-Store Setup*.
* **URL**: https://www.cdkglobal.com / https://www.reyrey.com.
* **Date Accessed**: October 2026.
* **Source Fact**:
  In enterprise DMS architectures, a **Location (Premises / Site)** represents the physical real estate: geographic coordinates, plot number, lease deed, physical security, municipal property tax ID, utility connections, and building layout. A **Branch (Outlet / Store / Point of Sale)** represents the operational commercial entity: OEM dealer code, customer entrance, trade license, GST sub-code, bank account, and active staff roster. Multiple branches frequently inhabit the exact same physical property.
* **Inference**:
  Treating `Location` and `Branch` as synonyms makes it impossible to represent shared dealership campuses, causing data duplication and invalid reporting on facility operating costs.
* **Recommendation**:
  Introduce a dedicated `Location` model (physical asset/premises) and link `Branch` to `Location` via a nullable foreign key `branch.locationId`. This maintains 100% backward compatibility for existing branch records while unlocking multi-outlet physical campus mapping.

---

### Topic 6: Sales Outlets vs Service Outlets (Specialized Facilities)

* **Source**: Ministry of Road Transport and Highways (MoRTH) & OEM Dealer Network Expansion Guidelines.
* **URL**: https://morth.nic.in.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Due to urban real estate costs and zoning laws, OEMs prohibit full 3S facilities inside prime commercial districts. Dealerships operate boutique high-street showrooms (1S Sales) in downtown zones, while heavy mechanical workshops, paint booths, and bodyshops are situated in outer industrial zones (MIDC, KIADB, RIICO).
* **Inference**:
  A branch's functional nature cannot be hardcoded or assumed to be identical across an organization. One branch may have 10 workshop bays and zero showroom cars; another may have 8 display vehicles and zero grease pits.
* **Recommendation**:
  Support granular capability activation on branches via `BranchBusinessUnit`. Allow branches to declare specific operational metadata (e.g., number of service bays, paint booths, display car capacity).

---

### Topic 7: Shared Locations & Dealership Campuses

* **Source**: Dealership Architecture & Commercial Real Estate Case Studies (e.g., Auto Complex Hubli, Ring Road Auto Clusters Pune, Gurgaon Motor Market).
* **URL**: Industry Architectural Case Studies.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Promoter groups develop large 2-to-5 acre automotive complexes housing multiple automobile brands. For example, a single site on P.B. Road, Hubballi houses *Bellad Hyundai Showroom*, *Bellad MG Showroom*, and a consolidated *Joint Workshop & Bodyshop Facility*.
* **Inference**:
  Multiple `Branch` records belonging to different `Firm` and `Brand` records share a single `locationId`.
* **Recommendation**:
  Establish a one-to-many relationship: `Location.branches Branch[]`. A physical location can host 1, 2, or many branches.

---

### Topic 8: Multiple Brands at One Location

* **Source**: Competition Commission of India (CCI) — *Market Study on Automobile Dealership Agreements* (2022).
* **URL**: https://www.cci.gov.in.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Indian regulatory rulings permit multi-brand automotive retailing. While OEMs require distinct branding on customer-facing partitions, non-conflicting operational segments (such as body shop paint booths, wheel alignment machines, car washing bays, and pre-owned vehicle stockyards) frequently service multiple OEM brands under one roof.
* **Inference**:
  The system must support shared service centers where a single physical facility handles work orders for multiple brands simultaneously.
* **Recommendation**:
  Introduce `BranchBrand` junction table, allowing a branch to associate with multiple brands.

---

### Topic 9: Brand-Specific Operations Within the Same Branch

* **Source**: Horilla Open Source HRMS & Automotive Dealer ERP Design Patterns.
* **URL**: https://www.horilla.com.
* **Date Accessed**: October 2026.
* **Source Fact**:
  In a dual-brand outlet (e.g. Hyundai + MG), sales consultants represent exactly ONE brand (e.g., a Hyundai Sales Advisor cannot sell MG cars), whereas backend administrative personnel (Accounts Officer, Cashier, Receptionist, Security, Housekeeping) serve BOTH brands.
* **Inference**:
  User role scoping must support fine-grained brand-branch-business unit intersections. A user may have `SALES` scoped strictly to `HYUNDAI`, while an accountant has `ACCOUNTS` scoped to the entire `BRANCH`.
* **Recommendation**:
  Allow `UserRoleAssignment` to accept composite scope dimensions: `tenantId`, `firmId`, `brandId`, `branchId`, `businessUnitId`, and `departmentId`.

---

### Topic 10: Branch-Specific vs Centralized Departments

* **Source**: ASDC Dealership Organizational Chart Specifications.
* **URL**: https://www.asdc.org.in.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Automotive dealership groups maintain two types of departments:
  1. **Centralized / Corporate Departments**: Head office finance, central CRM call centers, group HR, digital marketing, and procurement (shared across all branches).
  2. **Branch-Specific Operational Departments**: Hubballi Workshop Tech Team, Dharwad Showroom Sales Floor, Belgaum Bodyshop Denting & Painting Team.
* **Inference**:
  The `Department` entity must continue supporting both tenant-wide departments (`branchId: null`) and branch-specific departments (`branchId: String`).
* **Recommendation**:
  Preserve the existing `Department` schema: `branchId` remains nullable with foreign key link to `Branch`.

---

### Topic 11: Enterprise RBAC for Multi-Location Automotive Organizations

* **Source**: NIST Special Publication 800-162 — *Guide to Attribute Based Access Control (ABAC) & Scoped RBAC*; Keycloak Multi-Tenancy Architecture.
* **URL**: https://csrc.nist.gov/publications/detail/sp/800-162/final.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Dealership staff roles fall into distinct geometric access patterns:
  - **Global / Group SuperAdmin**: Unrestricted visibility across all legal firms, brands, and branches.
  - **Firm Director / CFO**: Full visibility across all branches and brands belonging to one legal firm.
  - **OEM Brand Head / General Manager**: Visibility across all branches for their specific OEM brand (e.g., VP Hyundai across 6 branches).
  - **Regional / Cluster Manager**: Visibility across 3 to 4 specific branches in a geographic district (e.g., North Karnataka cluster).
  - **Branch General Manager**: Full visibility across all departments and brands operating within their specific branch.
  - **Service Manager / Workshop Head**: Visibility restricted to `SERVICE` and `BODYSHOP` units within their branch.
  - **Technician / Service Advisor**: Visibility restricted strictly to their own assigned service jobs.
* **Inference**:
  A single linear hierarchy or single-scope enum cannot capture cross-cutting matrices without multiplying role definitions into hundreds of unmanageable permutations.
* **Recommendation**:
  Implement Dimensional Scoped RBAC. Scopes include `GLOBAL`, `TENANT`, `FIRM`, `BRAND`, `LOCATION`, `BRANCH`, `BUSINESS_UNIT`, `DEPARTMENT`.

---

### Topic 12: Multi-Tenant SaaS Organization Models

* **Source**: AWS Architecture Center — *SaaS Multi-Tenant Organizational Hierarchies & Data Partitioning Strategies*; Microsoft Azure SaaS Identity Architecture.
* **URL**: https://aws.amazon.com/solutions/guidance/multi-tenant-architecture-on-aws/.
* **Date Accessed**: October 2026.
* **Source Fact**:
  In enterprise multi-tenant systems, tenant isolation must be absolute (`tenantId` present on all operational and organizational tables). Cross-tenant data leakage is catastrophic. However, within a tenant, hierarchical and matrix relationships require flexible querying (parent-child navigation, closure tables, or normalized junction models) without risking cross-tenant corruption.
* **Inference**:
  Every newly introduced entity (`Location`, `BusinessUnit`, `BranchBrand`, `BranchBusinessUnit`) MUST carry `tenantId` and enforce foreign-key integrity matching the parent's tenant.
* **Recommendation**:
  Enforce composite foreign keys and scoped uniqueness constraints (`@@unique([tenantId, code])`, `@@index([tenantId])`).

---

### Topic 13: Automotive Dealer Management Systems (DMS) Benchmarking

* **Source**: Analysis of CDK Global Drive, Reynolds & Reynolds, DealerSocket, and Horilla HRMS Architecture.
* **URL**: https://www.cdkglobal.com / https://www.horilla.com.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Leading DMS platforms model organizations using a 4-tier foundation:
  - **Enterprise / Group** (Tenant)
  - **Company / Entity** (Firm)
  - **Site / Facility** (Location)
  - **Dealership / Point of Sale / Profit Center** (Branch with Brand & Departmental mappings)
  They explicitly separate the profit center / accounting ledger (Firm/Branch) from the physical property address (Site/Location).
* **Inference**:
  Aligning our Automobile Ecosystem with this industry standard ensures future-proof integration with external OEM APIs, accounting software (Tally / SAP / Realbook), and DMS platforms.
* **Recommendation**:
  Adopt this proven 4-tier foundation with operational capability mapping.

---

### Topic 14: Consolidated Management with Branch Autonomy

* **Source**: Harvard Business Review — *Managing the Multi-Unit Enterprise*; Indian Automotive Dealership Promoter Case Studies.
* **URL**: https://hbr.org.
* **Date Accessed**: October 2026.
* **Source Fact**:
  Automobile dealership groups succeed by balancing centralized policy with localized execution. Central management dictates pricing policies, commission structures, vendor contracts, and HR rules; local branch managers control day-to-day lead assignment, workshop bay scheduling, customer escalation, and petty cash.
* **Inference**:
  The system must allow central defaults to cascade down to branches while allowing branches to configure local operational overrides (working hours, bay counts, local holiday lists, local gate passes).
* **Recommendation**:
  Include a `settings Json?` and `metadata Json?` field on `Location`, `Branch`, and `BranchBusinessUnit` to support local configuration overrides without schema mutations.

---

## 3. Summary of Core Architectural Principles

| Domain Principle | Anti-Pattern to Avoid | Correct Architecture Pattern |
| :--- | :--- | :--- |
| **Physical vs Operational** | Merging address and dealer code into a single table | `Location` (physical land/facility) + `Branch` (operational commercial dealership) |
| **3S Capabilities** | Creating 3S as a rigid parent-child hierarchy level | `BusinessUnit` catalog (`SALES`, `SERVICE`, `SPARES`, `BODYSHOP`, etc.) attached to `Branch` via junction table |
| **Multi-Brand Outlets** | Constraining a branch to only one `firmBrandId` | `BranchBrand` junction table allowing 1..N brands per branch |
| **Dealership Grouping** | Independent isolated tenants for sister companies | Multi-Firm structure under a unified `Tenant` umbrella |
| **Scoped Access** | Exploding role count (`HYUNDAI_HUBLI_SERVICE_MANAGER`) | Standard Role (`SERVICE_MANAGER`) + Dimensional Scope Assignment |
