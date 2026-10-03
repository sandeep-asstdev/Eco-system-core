# Organization Model V2 — Staged Zero-Downtime Migration Plan

**Document Version**: 2.0.0  
**Status**: APPROVED EXECUTION PLAN  
**Author**: Lead Enterprise SaaS & Automotive Systems Architect  
**Workspace**: `C:\Users\User\Desktop\Automobile_Ecosystem`

---

## 1. Migration Philosophy & Safety Guarantees

This migration evolves an **ACTIVE, WORKING PRODUCTION-LIKE SYSTEM**. 

### Absolute Safety Rules:
1. **Zero Data Loss**: Every existing record (3 tenants, 21 firms, 22 brands, 22 firmBrands, 21 branches, 96 departments, 25 users, 38 memberships, 22 role assignments, 34 HRFlow employees, 167 Maintly requests) will be preserved.
2. **Immutable Primary Keys**: All UUIDs of existing branches, firms, brands, and users remain identical.
3. **No Breaking API Changes**: Existing endpoints (`/branches`, `/firms`, `/departments`) continue to return all existing fields. New fields are additive.
4. **Additive Non-Destructive DDL**: All new columns added to existing tables are strictly `NULLABLE`. New tables (`locations`, `business_units`, `branch_brands`, `branch_business_units`) have explicit foreign key cascades to their parent entities.
5. **No `prisma migrate reset`**: Strictly prohibited. Schema will be synced safely using Prisma push / non-destructive SQL migrations, followed by an idempotent data backfill script.

---

## 2. Staged Migration Phasing

```text
[STAGE 0: PRE-MIGRATION SNAPSHOT & BACKUP]
  ├── pg_dump of ecosystem_core_db, hrflow_db, maintly_db (COMPLETED)
  └── Baseline record count capture (COMPLETED)
          │
          ▼
[STAGE 1: NON-DESTRUCTIVE SCHEMA EXTENSION]
  ├── Add Location, BusinessUnit, BranchBrand, BranchBusinessUnit models
  ├── Add nullable locationId to Branch
  ├── Add LOCATION, BUSINESS_UNIT to ScopeType enum
  ├── Add nullable locationId, businessUnitId to UserRoleAssignment & OrganizationMembership
  └── Execute safe schema migration
          │
          ▼
[STAGE 2: IDEMPOTENT DATA BACKFILL]
  ├── 2.1: Seed standard BusinessUnit catalog per tenant (SALES, SERVICE, SPARES, BODYSHOP, etc.)
  ├── 2.2: Extract unique physical addresses from existing branches -> synthesize Location records
  ├── 2.3: Link branch.locationId to newly synthesized Location records
  ├── 2.4: Populate BranchBrand for all existing branches (from firmBrandId)
  └── 2.5: Populate BranchBusinessUnit for all existing branches (from outletType)
          │
          ▼
[STAGE 3: VERIFICATION & RECONCILIATION]
  ├── Verify 100% of branches have a valid locationId
  ├── Verify all existing branch IDs, names, codes match baseline exactly
  ├── Verify zero data loss (Tenants=3, Firms=21, Brands=22, Branches=21, Users=25)
  └── Verify HRFlow employees & MAINTLY maintenance requests resolve correctly
          │
          ▼
[STAGE 4: BACKEND API EXPANSION]
  ├── Add /locations controller & routes
  ├── Add /business-units controller & routes
  ├── Add /branches/:id/brands and /branches/:id/business-units
  ├── Add /organization/tree hierarchical endpoint for dashboards
  └── Enhance RBAC middleware with BUSINESS_UNIT and LOCATION scope checks
          │
          ▼
[STAGE 5: PORTAL FRONTEND & DASHBOARD VISUALIZATION]
  ├── Update Dashboard.jsx with real organization counts (Locations, Business Units)
  ├── Build Organization Hierarchy visual tree tab
  └── Support location & business unit inspection
          │
          ▼
[STAGE 6: AUTOMATED REGRESSION & INTEGRATION TESTS]
  ├── Execute Phase 8 Extensibility tests
  ├── Execute Phase 7 Employee Sync tests
  ├── Execute dedicated Organization Model V2 tests (16 edge cases)
  └── Verify clean pass across all microservices
```

---

## 3. Rollback Strategy

In the event of an unforeseen failure:
1. Every newly created table (`locations`, `business_units`, `branch_brands`, `branch_business_units`) is independent. Dropping them or ignoring them restores the system to V1 state without affecting the existing `branches` table.
2. The only modification to `branches` is the nullable `locationId` column. If nullified, existing code operates identically.
3. Binary database dumps are stored in `C:\Users\User\Desktop\Automobile_Ecosystem\backups/` and can be restored using:
   ```powershell
   pg_restore -h localhost -p 5433 -U postgres -d ecosystem_core_db --clean backups/ecosystem_core_db_pre_v2_backup.dump
   ```
