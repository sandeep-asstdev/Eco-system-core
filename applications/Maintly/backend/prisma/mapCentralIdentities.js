import prisma from '../src/config/db.js';

async function mapCentralIdentities() {
  console.log('================================================================');
  console.log('🔄 MAP MAINTLY ORGANIZATIONAL IDENTITIES TO CENTRAL ECOSYSTEM');
  console.log('================================================================\n');

  // 1. Map Dealership Tenants
  console.log('[STEP 1] Mapping Dealership Tenants to Central Tenant IDs...');
  const tenantMappings = [
    { code: 'BELLAD', centralTenantId: '883663e1-917e-4fae-8f1d-9d89e749362b' }, // Bellad Group
    { code: 'OMNI', centralTenantId: 'f0ea4625-4bb3-4f0a-8a67-77b53c0afb54' }    // Mapped to second central tenant
  ];

  for (const tm of tenantMappings) {
    const updated = await prisma.tenant.updateMany({
      where: { code: tm.code },
      data: { centralTenantId: tm.centralTenantId }
    });
    console.log(`✔ Mapped Tenant ${tm.code} -> centralTenantId: ${tm.centralTenantId} (${updated.count} updated)`);
  }

  // 2. Map Dealership Branches
  console.log('\n[STEP 2] Mapping Facility Branches to Central Branch IDs...');
  const branchMappings = [
    { code: 'HO-HBL', centralBranchId: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246', centralFirmId: 'firm-bmpl-uuid', centralBrandId: 'brand-hyundai-uuid' }, // Hubli Central HQ
    { code: 'BEL-HBL', centralBranchId: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246', centralFirmId: 'firm-bmpl-uuid', centralBrandId: 'brand-hyundai-uuid' },
    { code: 'ATH-HBL', centralBranchId: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246', centralFirmId: 'firm-bmpl-uuid', centralBrandId: 'brand-hyundai-uuid' },
    { code: 'ATH-BGM', centralBranchId: '4350dbb5-8d55-405c-9456-9de567e356c4', centralFirmId: 'firm-bmpl-uuid', centralBrandId: 'brand-hyundai-uuid' }, // Belgaum
    { code: 'MG-BGM', centralBranchId: '4350dbb5-8d55-405c-9456-9de567e356c4', centralFirmId: 'firm-bmpl-uuid', centralBrandId: 'brand-hyundai-uuid' }
  ];

  for (const bm of branchMappings) {
    const updated = await prisma.branch.updateMany({
      where: { code: bm.code },
      data: {
        centralBranchId: bm.centralBranchId,
        centralFirmId: bm.centralFirmId,
        centralBrandId: bm.centralBrandId
      }
    });
    console.log(`✔ Mapped Branch ${bm.code} -> centralBranchId: ${bm.centralBranchId} (${updated.count} updated)`);
  }

  // 3. Map Users
  console.log('\n[STEP 3] Mapping Staff User Accounts to Central User IDs...');
  const userMappings = [
    { email: 'platformadmin@maintly.com', centralUserId: 'eaf9bc24-127f-4405-8b80-ad29b5e5058e' }, // SuperAdmin
    { email: 'admin@bellad.com', centralUserId: '84a1e6f3-f10c-411c-b6c5-95e693399416' },          // Agastya Bellad (MD)
    { email: 'manager@bellad.com', centralUserId: '6e9ca912-32b5-4b2a-b0d3-35fb1bdf32c9' },        // Rajesh Sharma (BM Hubli)
    { email: 'approver@bellad.com', centralUserId: '8c1ba00f-b947-4bd7-b5b6-fe761580642f' },       // Pooja Kulkarni (HR/Approver)
    { email: 'technician@bellad.com', centralUserId: 'tech-hubli-central-uuid' },                  // Suresh Patil (Tech)
    { email: 'employee@bellad.com', centralUserId: 'emp-rahul-central-uuid' }
  ];

  for (const um of userMappings) {
    const updated = await prisma.user.updateMany({
      where: { email: um.email },
      data: { centralUserId: um.centralUserId }
    });
    if (updated.count > 0) {
      console.log(`✔ Mapped User ${um.email} -> centralUserId: ${um.centralUserId}`);
    }
  }

  // 4. Seed Reference EmployeeReferences
  console.log('\n[STEP 4] Populating Initial Cached EmployeeReferences for Hubli & Belgaum...');
  const belladTenant = await prisma.tenant.findUnique({ where: { code: 'BELLAD' } });
  const hubliBranch = await prisma.branch.findFirst({ where: { code: 'HO-HBL' } });

  if (belladTenant) {
    const sampleEmployees = [
      {
        id: '821c1ea5-99ce-4f7a-85f5-7fe90c058a7e',
        tenantId: belladTenant.id,
        centralTenantId: '883663e1-917e-4fae-8f1d-9d89e749362b',
        centralBranchId: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246',
        centralUserId: '84a1e6f3-f10c-411c-b6c5-95e693399416',
        hrEmployeeId: '821c1ea5-99ce-4f7a-85f5-7fe90c058a7e',
        employeeCode: 'BLD-1001',
        firstName: 'Anand',
        lastName: 'Bellad',
        email: 'anand.bellad@belladgroup.com',
        phone: '+91 98450 11111',
        branchId: hubliBranch?.id || null,
        department: 'Management',
        designation: 'Managing Director',
        status: 'ACTIVE'
      },
      {
        id: 'emp-bld-1006-uuid',
        tenantId: belladTenant.id,
        centralTenantId: '883663e1-917e-4fae-8f1d-9d89e749362b',
        centralBranchId: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246',
        centralUserId: '6e9ca912-32b5-4b2a-b0d3-35fb1bdf32c9',
        hrEmployeeId: 'emp-bld-1006-uuid',
        employeeCode: 'BLD-1006',
        firstName: 'Girish',
        lastName: 'Hiremath',
        email: 'girish.hiremath@belladgroup.com',
        phone: '+91 98450 66666',
        branchId: hubliBranch?.id || null,
        department: 'Service',
        designation: 'Service Advisor',
        status: 'ACTIVE'
      }
    ];

    for (const emp of sampleEmployees) {
      await prisma.employeeReference.upsert({
        where: { id: emp.id },
        update: emp,
        create: emp
      });
    }
    console.log(`✔ Populated ${sampleEmployees.length} cached EmployeeReference records.`);
  }

  console.log('\n================================================================');
  console.log('✅ MAINTLY CENTRAL IDENTITY MAPPING COMPLETED SUCCESSFULLY');
  console.log('================================================================\n');
}

mapCentralIdentities()
  .catch((e) => {
    console.error('❌ Error mapping central identities:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
