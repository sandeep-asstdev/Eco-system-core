import prisma from '../ecosystem-core/backend/src/config/db.js';

/**
 * Idempotent Data Backfill & Organization Model V2 Migration Script
 * 
 * Safely populates:
 * 1. Standard BusinessUnit catalog for each active Tenant
 * 2. Synthesizes physical Location records from existing branch addresses
 * 3. Links branch.locationId to newly established Locations
 * 4. Populates BranchBrand mappings from existing firmBrandId
 * 5. Populates BranchBusinessUnit capabilities based on branch.outletType
 */

const STANDARD_BUSINESS_UNITS = [
  { code: 'SALES', name: 'New Vehicle Sales', type: '3S_CORE', icon: 'Car', description: 'Showroom display, bookings, retail finance, and customer deliveries.' },
  { code: 'SERVICE', name: 'Mechanical Workshop & Service', type: '3S_CORE', icon: 'Wrench', description: 'Periodic maintenance, electronic diagnostics, and mechanical repairs.' },
  { code: 'SPARES', 'name': 'Genuine Spares & Parts Depot', type: '3S_CORE', icon: 'Boxes', description: 'OEM parts depot, workshop issue, over-the-counter retail, and wholesale.' },
  { code: 'BODYSHOP', name: 'Accidental Repair & Paint Booth', type: 'VALUE_ADDED_SERVICE', icon: 'Paintbrush', description: 'Chassis alignment, denting, computerized paint booth, and insurance claims.' },
  { code: 'PDI', name: 'Pre-Delivery Inspection & Fitment', type: 'SUPPORT', icon: 'ClipboardCheck', description: 'Stockyard receipt, multi-point checklist, and accessory fitment.' },
  { code: 'USED_CARS', name: 'Pre-Owned Vehicle Exchange', type: 'VALUE_ADDED_SERVICE', icon: 'RefreshCw', description: 'Trade-in evaluation, vehicle refurbishment, certification, and pre-owned sales.' },
  { code: 'ACCESSORIES', name: 'Accessories & Lifestyle Store', type: 'VALUE_ADDED_SERVICE', icon: 'Sparkles', description: 'OEM styling kits, infotainment, alloy wheels, and lifestyle merchandise.' },
  { code: 'INSURANCE_FINANCE', name: 'Insurance & Finance Desk', type: 'SUPPORT', icon: 'ShieldCheck', description: 'New vehicle loans, cashless renewal desk, and claim assistance.' },
  { code: 'DETAILING', name: 'Detailing & Ceramic Studio', type: 'VALUE_ADDED_SERVICE', icon: 'Sparkles', description: 'Paint protection film (PPF), ceramic coating, and interior steam hygiene.' }
];

async function runMigration() {
  console.log('===============================================================');
  console.log('🚀 AUTOMOBILE ECOSYSTEM: ORGANIZATION MODEL V2 BACKFILL START');
  console.log('===============================================================');

  const tenants = await prisma.tenant.findMany({ select: { id: true, code: true, name: true } });
  console.log(`[INFO] Found ${tenants.length} tenants to process.`);

  for (const tenant of tenants) {
    console.log(`\n🏢 Processing Tenant: [${tenant.code}] ${tenant.name}`);

    // 1. Seed Business Units for this Tenant
    const buMap = new Map();
    for (const buDef of STANDARD_BUSINESS_UNITS) {
      const bu = await prisma.businessUnit.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: buDef.code } },
        update: {
          name: buDef.name,
          type: buDef.type,
          icon: buDef.icon,
          description: buDef.description,
          isSystem: true,
          isActive: true
        },
        create: {
          tenantId: tenant.id,
          code: buDef.code,
          name: buDef.name,
          type: buDef.type,
          icon: buDef.icon,
          description: buDef.description,
          isSystem: true,
          isActive: true
        }
      });
      buMap.set(bu.code, bu);
    }
    console.log(`  ✅ Seeded ${buMap.size} standard Business Units.`);

    // 2. Fetch existing branches for this Tenant
    const branches = await prisma.branch.findMany({
      where: { tenantId: tenant.id },
      include: {
        firm: true,
        firmBrand: { include: { brand: true } }
      }
    });
    console.log(`  📍 Found ${branches.length} branches to synthesize & link.`);

    // Group branches by normalized location signature to avoid creating redundant locations for shared campuses
    const locationCache = new Map();

    for (const branch of branches) {
      const cityKey = (branch.city || 'Hubli').trim().toUpperCase();
      const addrSnippet = (branch.address || branch.name || 'Main Campus').substring(0, 30).trim().toUpperCase();
      const locKey = `${cityKey}_${addrSnippet.replace(/[^A-Z0-9]/g, '_')}`;

      let locationId = branch.locationId;

      if (!locationId) {
        if (locationCache.has(locKey)) {
          locationId = locationCache.get(locKey);
        } else {
          // Synthesize Location code & name
          const locCode = `LOC-${cityKey}-${String(locationCache.size + 1).padStart(2, '0')}`;
          const locName = `${branch.city} ${branch.address ? branch.address.split(',')[0] : 'Automotive Facility'}`;

          const location = await prisma.location.upsert({
            where: { tenantId_code: { tenantId: tenant.id, code: locCode } },
            update: {
              name: locName,
              addressLine1: branch.address || `${branch.name}, ${branch.city}`,
              city: branch.city,
              state: branch.state,
              pincode: branch.pincode,
              isActive: true
            },
            create: {
              tenantId: tenant.id,
              code: locCode,
              name: locName,
              type: branch.outletType === 'WORKSHOP' ? 'WORKSHOP_FACILITY' : 'DEALERSHIP_CAMPUS',
              addressLine1: branch.address || `${branch.name}, ${branch.city}`,
              city: branch.city,
              state: branch.state,
              pincode: branch.pincode,
              totalAreaSqFt: 15000,
              isActive: true
            }
          });
          locationId = location.id;
          locationCache.set(locKey, locationId);
        }

        // Update branch with locationId
        await prisma.branch.update({
          where: { id: branch.id },
          data: { locationId }
        });
      }

      // 3. Link Branch to Brand via BranchBrand
      if (branch.firmBrand && branch.firmBrand.brandId) {
        await prisma.branchBrand.upsert({
          where: {
            branchId_brandId: {
              branchId: branch.id,
              brandId: branch.firmBrand.brandId
            }
          },
          update: {
            dealerCode: branch.code,
            isPrimary: true,
            isActive: true
          },
          create: {
            tenantId: tenant.id,
            branchId: branch.id,
            brandId: branch.firmBrand.brandId,
            dealerCode: branch.code,
            isPrimary: true,
            isActive: true
          }
        });
      }

      // 4. Link Branch to BusinessUnits via BranchBusinessUnit
      const targetCapabilities = [];
      const outletType = (branch.outletType || '3S_FACILITY').toUpperCase();

      if (outletType.includes('3S')) {
        targetCapabilities.push('SALES', 'SERVICE', 'SPARES', 'INSURANCE_FINANCE');
      } else if (outletType.includes('SHOWROOM')) {
        targetCapabilities.push('SALES', 'ACCESSORIES', 'INSURANCE_FINANCE');
      } else if (outletType.includes('WORKSHOP')) {
        targetCapabilities.push('SERVICE', 'SPARES');
      } else if (outletType.includes('BODYSHOP')) {
        targetCapabilities.push('BODYSHOP', 'SPARES');
      } else if (outletType.includes('STOCKYARD')) {
        targetCapabilities.push('PDI');
      } else {
        targetCapabilities.push('SALES', 'SERVICE', 'SPARES');
      }

      for (const capCode of targetCapabilities) {
        const bu = buMap.get(capCode);
        if (bu) {
          await prisma.branchBusinessUnit.upsert({
            where: {
              branchId_businessUnitId: {
                branchId: branch.id,
                businessUnitId: bu.id
              }
            },
            update: {
              operationalStatus: 'ACTIVE',
              capacityUnits: capCode === 'SERVICE' ? 12 : capCode === 'SALES' ? 6 : 4
            },
            create: {
              tenantId: tenant.id,
              branchId: branch.id,
              businessUnitId: bu.id,
              operationalStatus: 'ACTIVE',
              capacityUnits: capCode === 'SERVICE' ? 12 : capCode === 'SALES' ? 6 : 4,
              workingHours: { open: '09:00', close: '19:00', days: 'Mon-Sat' }
            }
          });
        }
      }
    }

    console.log(`  ✅ Successfully linked all ${branches.length} branches to Locations, Brands, and Business Units.`);
  }

  // 5. Final Reconciliation
  console.log('\n===============================================================');
  console.log('📊 RECONCILIATION & POST-MIGRATION COUNTS');
  console.log('===============================================================');

  const finalCounts = {
    tenants: await prisma.tenant.count(),
    firms: await prisma.firm.count(),
    brands: await prisma.brand.count(),
    firmBrands: await prisma.firmBrand.count(),
    locations: await prisma.location.count(),
    branches: await prisma.branch.count(),
    branchBrands: await prisma.branchBrand.count(),
    businessUnits: await prisma.businessUnit.count(),
    branchBusinessUnits: await prisma.branchBusinessUnit.count(),
    departments: await prisma.department.count(),
    users: await prisma.user.count(),
    memberships: await prisma.organizationMembership.count(),
    userRoleAssignments: await prisma.userRoleAssignment.count()
  };

  console.table(finalCounts);

  const unlinkedBranches = await prisma.branch.count({ where: { locationId: null } });
  if (unlinkedBranches > 0) {
    console.error(`❌ CRITICAL: ${unlinkedBranches} branches still have locationId = null!`);
    process.exit(1);
  } else {
    console.log('✅ PASS: 100% of branches successfully linked to Location records.');
  }

  console.log('===============================================================');
  console.log('🎉 ORGANIZATION MODEL V2 BACKFILL COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
  await prisma.$disconnect();
}

runMigration().catch(err => {
  console.error('❌ MIGRATION FAILED:', err);
  process.exit(1);
});
