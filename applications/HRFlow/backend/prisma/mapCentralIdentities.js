const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mapCentralIdentities() {
  console.log('================================================================');
  console.log('🔄 MAP HRFLOW ORGANIZATIONAL IDENTITIES TO CENTRAL ECOSYSTEM');
  console.log('================================================================\n');

  // 1. Map Dealership Tenants
  console.log('[STEP 1] Mapping Dealership Tenants to Central Tenant IDs...');
  const tenantMappings = [
    { code: 'BELLAD', centralTenantId: '883663e1-917e-4fae-8f1d-9d89e749362b' }, // Bellad Group
    { code: 'APEX-AUTO', centralTenantId: 'f0ea4625-4bb3-4f0a-8a67-77b53c0afb54' } // Apex Auto Group
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
    { code: 'BELLAD-HUB', centralBranchId: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246' }, // Hubli Main 3S Facility (HBL-MAIN-01)
    { code: 'BELLAD-BGM', centralBranchId: '4350dbb5-8d55-405c-9456-9de567e356c4' }  // Belgaum Workshop (BGM-WKSHP-02)
  ];

  for (const bm of branchMappings) {
    const updated = await prisma.branch.updateMany({
      where: { code: bm.code },
      data: { centralBranchId: bm.centralBranchId }
    });
    console.log(`✔ Mapped Branch ${bm.code} -> centralBranchId: ${bm.centralBranchId} (${updated.count} updated)`);
  }

  // 3. Map Users
  console.log('\n[STEP 3] Mapping Staff User Accounts to Central User IDs...');
  const userMappings = [
    { email: 'admin@hrflow.com', centralUserId: 'eaf9bc24-127f-4405-8b80-ad29b5e5058e' },
    { email: 'admin@ecosystem.com', centralUserId: 'eaf9bc24-127f-4405-8b80-ad29b5e5058e' },
    { email: 'hr.bellad@hrflow.com', centralUserId: '8c1ba00f-b947-4bd7-b5b6-fe761580642f' },
    { email: 'hr.bellad@belladgroup.com', centralUserId: '8c1ba00f-b947-4bd7-b5b6-fe761580642f' },
    { email: 'md.bellad@hrflow.com', centralUserId: '84a1e6f3-f10c-411c-b6c5-95e693399416' },
    { email: 'md.bellad@belladgroup.com', centralUserId: '84a1e6f3-f10c-411c-b6c5-95e693399416' },
    { email: 'bm.hubli@hrflow.com', centralUserId: '169f0047-84b6-48a4-9d1c-621756017075' },
    { email: 'bm.hubli@belladgroup.com', centralUserId: '169f0047-84b6-48a4-9d1c-621756017075' }
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

  // 4. Update Employees with Central References
  console.log('\n[STEP 4] Backfilling Employee Central References...');
  const branches = await prisma.branch.findMany({
    where: { centralBranchId: { not: null } },
    include: { tenant: true }
  });

  for (const branch of branches) {
    const updated = await prisma.employee.updateMany({
      where: { branchId: branch.id },
      data: {
        centralTenantId: branch.tenant.centralTenantId,
        centralBranchId: branch.centralBranchId
      }
    });
    console.log(`✔ Updated ${updated.count} employees in branch ${branch.code} with centralTenantId and centralBranchId`);
  }

  console.log('\n================================================================');
  console.log('🎉 CENTRAL ORGANIZATIONAL MAPPING COMPLETED SUCCESSFULLY');
  console.log('================================================================');
}

mapCentralIdentities()
  .catch((e) => {
    console.error('Mapping error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
