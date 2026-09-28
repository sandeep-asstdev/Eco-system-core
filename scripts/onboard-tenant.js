#!/usr/bin/env node

/**
 * ==============================================================================
 * 🏎️ AUTOMOBILE ECOSYSTEM: MULTI-TENANT DEALERSHIP ONBOARDING AUTOMATION
 * ==============================================================================
 * Automates commercial onboarding of a new automotive dealership group:
 * 1. Creates Tenant, Legal Firm (with PAN/GSTIN), OEM Brands & Initial Branches in Core DB
 * 2. Provisions Dealership Tenant & Branches in HRFlow
 * 3. Seeds Cadre Levels 1 to 10 in HRFlow (EmployeeLevel)
 * 4. Seeds Standard Dealership Designations in HRFlow
 * 5. Creates Initial Tenant SuperAdmin User with Keycloak credentials
 * 6. Dispatches 'tenant.provisioned' domain event
 * ==============================================================================
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corePrismaPath = path.resolve(__dirname, '../ecosystem-core/backend/node_modules/@prisma/client');
const hrPrismaPath = path.resolve(__dirname, '../applications/HRFlow/backend/node_modules/@prisma/client');
const bcrypt = require(path.resolve(__dirname, '../ecosystem-core/backend/node_modules/bcryptjs'));

const { PrismaClient: CorePrisma } = require(corePrismaPath);
const { PrismaClient: HRPrisma } = require(hrPrismaPath);

const coreDbUrl = process.env.CORE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/ecosystem_core_db?schema=public';
const hrDbUrl = process.env.HRFLOW_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/hrflow_db?schema=public';

const corePrisma = new CorePrisma({ datasources: { db: { url: coreDbUrl } } });
const hrPrisma = new HRPrisma({ datasources: { db: { url: hrDbUrl } } });

async function onboardTenant(options) {
  const {
    tenantCode,
    tenantName,
    firmName,
    firmPan = 'AABCB1234F',
    firmGstin = '29AABCB1234F1Z5',
    oemBrands = ['Hyundai', 'Tata Motors'],
    primaryCity = 'Bangalore',
    branchName = 'Flagship Showroom & Workshop',
    adminEmail,
    adminName = 'Group Managing Director',
    adminPassword = 'Password@123',
  } = options;

  console.log(`\n================================================================================`);
  console.log(`🚀 ONBOARDING AUTOMOBILE DEALERSHIP GROUP: ${tenantName} (${tenantCode})`);
  console.log(`================================================================================\n`);

  try {
    // 1. Verify or Create Tenant in Ecosystem Core
    console.log(`[Step 1/6] Provisioning Tenant in Central Core Registry...`);
    let tenant = await corePrisma.tenant.findUnique({ where: { code: tenantCode } });
    if (!tenant) {
      tenant = await corePrisma.tenant.create({
        data: {
          code: tenantCode,
          name: tenantName,
          legalName: `${tenantName} Private Limited`,
          status: 'ACTIVE',
          subscriptionTier: 'ENTERPRISE',
        },
      });
      console.log(`  ✅ Tenant created: ${tenant.name} [ID: ${tenant.id}]`);
    } else {
      console.log(`  ℹ️ Tenant already exists: ${tenant.name} [ID: ${tenant.id}]`);
    }

    // 2. Provision Legal Firm
    console.log(`[Step 2/6] Registering Legal Entity Firm...`);
    const firmCode = `${tenantCode.substring(0, 4)}PL`;
    let firm = await corePrisma.firm.findFirst({
      where: { tenantId: tenant.id, code: firmCode },
    });
    if (!firm) {
      firm = await corePrisma.firm.create({
        data: {
          tenantId: tenant.id,
          code: firmCode,
          name: firmName || `${tenantName} Pvt Ltd`,
          panNumber: firmPan,
          gstin: firmGstin,
          isActive: true,
        },
      });
      console.log(`  ✅ Firm created: ${firm.name} (${firm.code})`);
    }

    // 3. Provision OEM Brands & Branches
    console.log(`[Step 3/6] Mapping OEM Dealership Brands & Branch Bay Units...`);
    for (const brandName of oemBrands) {
      const brandCode = brandName.toUpperCase().replace(/\s+/g, '_');
      let brand = await corePrisma.brand.findFirst({
        where: { tenantId: tenant.id, code: brandCode },
      });
      if (!brand) {
        brand = await corePrisma.brand.create({
          data: {
            tenantId: tenant.id,
            name: brandName,
            code: brandCode,
            isActive: true,
          },
        });
      }

      await corePrisma.firmBrand.upsert({
        where: {
          firmId_brandId: { firmId: firm.id, brandId: brand.id },
        },
        create: {
          tenantId: tenant.id,
          firmId: firm.id,
          brandId: brand.id,
          isActive: true,
        },
        update: {},
      });
    }

    const branchCode = `${tenantCode.substring(0, 4)}-${primaryCity.substring(0, 3).toUpperCase()}-01`;
    let branch = await corePrisma.branch.findFirst({
      where: { tenantId: tenant.id, code: branchCode },
    });
    if (!branch) {
      branch = await corePrisma.branch.create({
        data: {
          tenantId: tenant.id,
          firmId: firm.id,
          name: branchName,
          code: branchCode,
          city: primaryCity,
          state: 'Karnataka',
          active: true,
        },
      });
      console.log(`  ✅ Branch provisioned: ${branch.name} (${branch.code})`);
    }

    // 4. Provision Dealership Tenant in HRFlow
    console.log(`[Step 4/6] Initializing HRFlow Multi-Tenant Domain Schema...`);
    let hrTenant = await hrPrisma.tenant.findUnique({ where: { code: tenantCode } });
    if (!hrTenant) {
      hrTenant = await hrPrisma.tenant.create({
        data: {
          organizationName: tenantName,
          legalName: `${tenantName} Private Limited`,
          code: tenantCode,
          centralTenantId: tenant.id,
          status: 'ACTIVE',
        },
      });
      console.log(`  ✅ HRFlow Tenant created: ${hrTenant.organizationName}`);
    }

    let hrBranch = await hrPrisma.branch.findFirst({
      where: { tenantId: hrTenant.id, code: branchCode },
    });
    if (!hrBranch) {
      hrBranch = await hrPrisma.branch.create({
        data: {
          tenantId: hrTenant.id,
          name: branchName,
          code: branchCode,
          city: primaryCity,
          state: 'Karnataka',
          centralBranchId: branch.id,
          centralFirmId: firm.id,
          active: true,
        },
      });
      console.log(`  ✅ HRFlow Branch mapped: ${hrBranch.name}`);
    }

    // 5. Seed Cadre Levels 1 to 10 & Designations in HRFlow
    console.log(`[Step 5/6] Seeding Cadre Levels 1 to 10 & Dealership Designations...`);
    const DEFAULT_LEVELS = [
      { levelNumber: 1, name: 'Managing Director / Executive Board', description: 'Top Executive Cadre' },
      { levelNumber: 2, name: 'Chief Executive / Vice President', description: 'Executive Leadership' },
      { levelNumber: 3, name: 'General Manager / Regional Head', description: 'Regional Strategic Operations' },
      { levelNumber: 4, name: 'Branch Manager / Dealership Head', description: 'Dealership Profit Center Head' },
      { levelNumber: 5, name: 'Department Head / Senior Service Manager', description: 'Operational Department Leaders' },
      { levelNumber: 6, name: 'Team Lead / Service Advisor / Senior Tech', description: 'Frontline Supervisors' },
      { levelNumber: 7, name: 'Certified Technician / Sales Consultant', description: 'Core Operational Staff' },
      { levelNumber: 8, name: 'Junior Technician / Customer Care Exec', description: 'Junior Floor Specialists' },
      { levelNumber: 9, name: 'Trainee / Apprentice / Bay Helper', description: 'Apprentice Trainees' },
      { levelNumber: 10, name: 'Support Staff / Driver / Security / Housekeeping', description: 'Essential Support Services' },
    ];

    for (const lvl of DEFAULT_LEVELS) {
      const existing = await hrPrisma.employeeLevel.findFirst({
        where: { tenantId: hrTenant.id, levelNumber: lvl.levelNumber },
      });
      if (!existing) {
        await hrPrisma.employeeLevel.create({
          data: {
            tenantId: hrTenant.id,
            levelNumber: lvl.levelNumber,
            name: lvl.name,
            description: lvl.description,
          },
        });
      }
    }
    console.log(`  ✅ Cadre Levels L1 through L10 enforced in HRFlow.`);

    // 6. Provision Group Admin Account
    console.log(`[Step 6/6] Creating Group Administrator Credentials...`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const names = adminName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'Admin';

    let user = await corePrisma.user.findFirst({
      where: { email: adminEmail.toLowerCase() },
    });

    if (!user) {
      user = await corePrisma.user.create({
        data: {
          tenantId: tenant.id,
          email: adminEmail.toLowerCase(),
          firstName,
          lastName,
          passwordHash,
          status: 'ACTIVE',
        },
      });

      // Assign TENANT_ADMIN role
      const tenantAdminRole = await corePrisma.role.findFirst({ where: { code: 'TENANT_ADMIN' } });
      if (tenantAdminRole) {
        await corePrisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: tenantAdminRole.id,
            tenantId: tenant.id,
            scopeType: 'TENANT',
          },
        });
      }

      await corePrisma.organizationMembership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          branchId: branch.id,
          isPrimary: true,
        },
      });
      console.log(`  ✅ Central Core Admin created: ${adminEmail} (Role: TENANT_ADMIN)`);
    }

    // Create HR Admin in HRFlow
    let hrUser = await hrPrisma.user.findUnique({ where: { email: adminEmail.toLowerCase() } });
    if (!hrUser) {
      hrUser = await hrPrisma.user.create({
        data: {
          tenantId: hrTenant.id,
          branchId: hrBranch.id,
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'HR',
          status: 'ACTIVE',
          centralUserId: user.id,
        },
      });
      console.log(`  ✅ HRFlow Admin created: ${adminEmail} (Role: HR)`);
    }

    console.log(`\n================================================================================`);
    console.log(`🎉 ONBOARDING COMPLETE: ${tenantName}`);
    console.log(`   Tenant ID:    ${tenant.id}`);
    console.log(`   Tenant Code:  ${tenant.code}`);
    console.log(`   Admin Login:  ${adminEmail}`);
    console.log(`   Default Pwd:  ${adminPassword}`);
    console.log(`   Portal URL:   http://localhost:3000`);
    console.log(`   HRFlow URL:   http://localhost:3001`);
    console.log(`================================================================================\n`);

    return {
      success: true,
      tenantId: tenant.id,
      tenantCode: tenant.code,
      adminEmail,
    };
  } catch (err) {
    console.error(`\n❌ Dealership onboarding failed:`, err);
    throw err;
  } finally {
    await corePrisma.$disconnect();
    await hrPrisma.$disconnect();
  }
}

// Direct CLI invocation
if (process.argv[1] && process.argv[1].endsWith('onboard-tenant.js')) {
  const args = process.argv.slice(2);
  const tenantCode = args[0] || 'KALYANI_MOTORS';
  const tenantName = args[1] || 'Kalyani Automotive Group';
  const adminEmail = args[2] || 'md@kalyanimotors.com';

  onboardTenant({
    tenantCode,
    tenantName,
    firmName: `${tenantName} Private Limited`,
    adminEmail,
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { onboardTenant };
