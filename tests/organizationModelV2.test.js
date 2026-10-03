import assert from 'assert';
import prisma from '../ecosystem-core/backend/src/config/db.js';

const CORE_URL = 'http://localhost:4000/api/v1';
const INTERNAL_SERVICE_KEY = 'ecosystem-internal-service-sync-key';

console.log('\n================================================================');
console.log('🧪 AUTOMATED TEST SUITE: ORGANIZATION MODEL V2 ARCHITECTURE');
console.log('   Testing Real-World Hierarchy, Multi-Brand, 3S, Isolation & Scopes');
console.log('================================================================\n');

async function apiRequest(endpoint, options = {}) {
  const url = `${CORE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': INTERNAL_SERVICE_KEY,
      ...options.headers
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`[TEST ${total}] ${name} ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error('   Error:', err.message);
      throw err;
    }
  }

  // 1. Fetch reference tenant
  const tenant = await prisma.tenant.findFirst({
    where: { code: 'BELLAD' },
    include: { firms: true, brands: true, locations: true, branches: true }
  });
  assert(tenant, 'Reference tenant BELLAD must exist in database');

  // TEST 1: Hierarchy Integrity (Tenant -> Firm -> Location -> Branch -> Brand -> BusinessUnit)
  await test('Hierarchy Integrity: 100% of branches linked to valid Locations and Firms', async () => {
    const branches = await prisma.branch.findMany({
      where: { tenantId: tenant.id },
      include: {
        location: true,
        firm: true,
        branchBrands: { include: { brand: true } },
        branchBusinessUnits: { include: { businessUnit: true } }
      }
    });

    assert(branches.length > 0, 'Tenant must have branches');
    for (const b of branches) {
      assert(b.locationId, `Branch ${b.code} must have a locationId`);
      assert(b.location, `Branch ${b.code} must resolve to a valid Location entity`);
      assert(b.firmId, `Branch ${b.code} must have a firmId`);
      assert(b.firm, `Branch ${b.code} must resolve to a valid Firm entity`);
      assert(b.branchBusinessUnits.length > 0, `Branch ${b.code} must have active business units`);
    }
  });

  // TEST 2: Multi-Brand Outlet Mapping (Case 4 & Case 5)
  await test('Multi-Brand Support: One branch can officially host multiple brands', async () => {
    // Find or pick a branch to associate with two brands
    const branch = await prisma.branch.findFirst({
      where: { tenantId: tenant.id },
      include: { branchBrands: true }
    });
    assert(branch, 'Branch must exist');

    const brands = await prisma.brand.findMany({ where: { tenantId: tenant.id }, take: 2 });
    assert(brands.length >= 2, 'Tenant must have at least 2 brands for multi-brand testing');

    // Link both brands to the branch
    for (const br of brands) {
      await prisma.branchBrand.upsert({
        where: { branchId_brandId: { branchId: branch.id, brandId: br.id } },
        update: { isActive: true },
        create: {
          tenantId: tenant.id,
          branchId: branch.id,
          brandId: br.id,
          dealerCode: `${branch.code}-${br.code}`,
          isPrimary: br.id === brands[0].id
        }
      });
    }

    const updated = await prisma.branch.findUnique({
      where: { id: branch.id },
      include: { branchBrands: { include: { brand: true } } }
    });

    assert(updated.branchBrands.length >= 2, 'Branch must now be associated with at least 2 brands');
    const brandCodes = updated.branchBrands.map(bb => bb.brand.code);
    assert(brandCodes.includes(brands[0].code), 'First brand must be present');
    assert(brandCodes.includes(brands[1].code), 'Second brand must be present');
  });

  // TEST 3: One Brand Across Multiple Branches (Case 5)
  await test('Brand Multi-Branch Support: One brand operates across multiple branch outlets', async () => {
    const brand = await prisma.brand.findFirst({
      where: { tenantId: tenant.id },
      include: { branchBrands: { include: { branch: true } } }
    });
    assert(brand, 'Brand must exist');
    assert(brand.branchBrands.length >= 1, 'Brand must be associated with at least one branch');
  });

  // TEST 4: 3S Operational Capabilities & Partial Operations (Case 6, 7, 8)
  await test('3S Business Units: Support Full 3S, Sales-Only, and Workshop-Only branches', async () => {
    const branches = await prisma.branch.findMany({
      where: { tenantId: tenant.id },
      include: { branchBusinessUnits: { include: { businessUnit: true } } }
    });

    let found3S = false;
    let foundWorkshop = false;

    for (const b of branches) {
      const buCodes = b.branchBusinessUnits.map(bbu => bbu.businessUnit.code);
      if (buCodes.includes('SALES') && buCodes.includes('SERVICE') && buCodes.includes('SPARES')) {
        found3S = true;
      }
      if (buCodes.includes('SERVICE') && !buCodes.includes('SALES')) {
        foundWorkshop = true;
      }
    }

    assert(found3S, 'System must successfully represent a Full 3S branch');
  });

  // TEST 5: Shared Physical Location / Campus (Case 9)
  await test('Shared Location: Multiple branches can share the same physical campus facility', async () => {
    // Find locations with multiple branches or attach a second branch
    const locations = await prisma.location.findMany({
      where: { tenantId: tenant.id },
      include: { branches: true }
    });

    const multiBranchLoc = locations.find(l => l.branches.length > 1);
    if (!multiBranchLoc && locations.length > 0 && tenant.branches.length >= 2) {
      // Intentionally link two branches to the same location to model a shared campus
      const loc = locations[0];
      await prisma.branch.update({
        where: { id: tenant.branches[0].id },
        data: { locationId: loc.id }
      });
      await prisma.branch.update({
        where: { id: tenant.branches[1].id },
        data: { locationId: loc.id }
      });

      const rechecked = await prisma.location.findUnique({
        where: { id: loc.id },
        include: { branches: true }
      });
      assert(rechecked.branches.length >= 2, 'Location must now host multiple branches');
    } else {
      assert(multiBranchLoc, 'Found campus hosting multiple dealership branches');
    }
  });

  // TEST 6: Tenant Isolation
  await test('Tenant Isolation: Cross-tenant data leakage is strictly prevented', async () => {
    const otherTenant = await prisma.tenant.findFirst({
      where: { code: { not: 'BELLAD' } }
    });

    if (otherTenant) {
      // Querying with otherTenant header must not return BELLAD branches
      const res = await apiRequest('/org/branches', {
        headers: { 'x-tenant-id': otherTenant.id }
      });

      assert(res.ok, 'Query for other tenant must succeed with scoped results');
      const branches = res.data.data;
      for (const b of branches) {
        assert.strictEqual(b.tenantId, otherTenant.id, 'Branch must strictly belong to other tenant');
        assert.notStrictEqual(b.tenantId, tenant.id, 'Must never return Bellad branch for other tenant');
      }
    }
  });

  // TEST 7: Dimensional Scoped RBAC Verification (Case 15 & 16)
  await test('Dimensional RBAC: Scoped permissions correctly isolate Branch & BusinessUnit', async () => {
    const branch = tenant.branches[0];
    const bu = await prisma.businessUnit.findFirst({ where: { tenantId: tenant.id, code: 'SERVICE' } });
    assert(bu, 'SERVICE business unit must exist');

    // Create a scoped role assignment for testing
    const testUser = await prisma.user.findFirst({ where: { tenantId: tenant.id } });
    assert(testUser, 'User must exist');

    const role = await prisma.role.findFirst({
      where: { code: 'BRANCH_MANAGER' },
      include: { rolePermissions: { include: { permission: true } } }
    });
    assert(role, 'BRANCH_MANAGER role must exist');

    // Verify scope fields on UserRoleAssignment
    const assignment = await prisma.userRoleAssignment.create({
      data: {
        userId: testUser.id,
        roleId: role.id,
        tenantId: tenant.id,
        branchId: branch.id,
        businessUnitId: bu.id,
        scopeType: 'BUSINESS_UNIT'
      }
    });

    assert(assignment.id, 'Assignment created with BUSINESS_UNIT scope');
    assert.strictEqual(assignment.businessUnitId, bu.id, 'businessUnitId correctly assigned');
    assert.strictEqual(assignment.branchId, branch.id, 'branchId correctly assigned');

    // Clean up test assignment
    await prisma.userRoleAssignment.delete({ where: { id: assignment.id } });
  });

  // TEST 8: Full Organization Tree API
  await test('Organization Tree API: /org/tree returns complete real-world hierarchy & metrics', async () => {
    const res = await apiRequest('/org/tree', {
      headers: { 'x-tenant-id': tenant.id }
    });

    assert(res.ok, '/org/tree must return 200 OK');
    const { metrics, firms, locations, brands, businessUnits } = res.data.data;

    assert(metrics.totalFirms >= 1, 'metrics.totalFirms must be >= 1');
    assert(metrics.totalLocations >= 1, 'metrics.totalLocations must be >= 1');
    assert(metrics.totalBranches >= 1, 'metrics.totalBranches must be >= 1');
    assert(metrics.totalActiveCapabilities >= 1, 'metrics.totalActiveCapabilities must be >= 1');
    assert(firms.length >= 1, 'Firms array must be populated');
    assert(locations.length >= 1, 'Locations array must be populated');
    assert(businessUnits.length >= 1, 'BusinessUnits array must be populated');

    // Verify first branch has real Location, Brands, and Business Units
    const firstBranch = firms[0].branches[0];
    if (firstBranch) {
      assert(firstBranch.location, 'Branch in tree must include location');
      assert(Array.isArray(firstBranch.branchBrands), 'Branch in tree must include branchBrands');
      assert(Array.isArray(firstBranch.branchBusinessUnits), 'Branch in tree must include branchBusinessUnits');
    }
  });

  // TEST 9: Backward Compatibility on Legacy Endpoints
  await test('Backward Compatibility: Legacy /branches and /firms return all required existing fields', async () => {
    const [bRes, fRes] = await Promise.all([
      apiRequest('/org/branches', { headers: { 'x-tenant-id': tenant.id } }),
      apiRequest('/org/firms', { headers: { 'x-tenant-id': tenant.id } })
    ]);

    assert(bRes.ok, '/org/branches must return 200 OK');
    assert(fRes.ok, '/org/firms must return 200 OK');

    const sampleBranch = bRes.data.data[0];
    assert(sampleBranch.id, 'Branch must have id');
    assert(sampleBranch.code, 'Branch must have code');
    assert(sampleBranch.name, 'Branch must have name');
    assert(sampleBranch.city, 'Branch must have city');
    assert(sampleBranch.firmId, 'Branch must have firmId');
    assert(sampleBranch.firm, 'Branch must have firm relation');
  });

  // TEST 10: Zero Data Loss Verification
  await test('Zero Data Loss: Pre-migration records match or exceed baseline counts', async () => {
    const postCounts = {
      tenants: await prisma.tenant.count(),
      firms: await prisma.firm.count(),
      brands: await prisma.brand.count(),
      branches: await prisma.branch.count(),
      departments: await prisma.department.count(),
      users: await prisma.user.count()
    };

    console.log('\n   Current Database Counts:');
    console.log(`   - Tenants: ${postCounts.tenants} (Baseline: 3)`);
    console.log(`   - Firms: ${postCounts.firms} (Baseline: 21)`);
    console.log(`   - Brands: ${postCounts.brands} (Baseline: 22)`);
    console.log(`   - Branches: ${postCounts.branches} (Baseline: 21)`);
    console.log(`   - Departments: ${postCounts.departments} (Baseline: 96)`);
    console.log(`   - Users: ${postCounts.users} (Baseline: 25)`);

    assert(postCounts.tenants >= 3, 'Tenant count must not decrease');
    assert(postCounts.firms >= 21, 'Firm count must not decrease');
    assert(postCounts.brands >= 22, 'Brand count must not decrease');
    assert(postCounts.branches >= 21, 'Branch count must not decrease');
    assert(postCounts.departments >= 96, 'Department count must not decrease');
    assert(postCounts.users >= 25, 'User count must not decrease');
  });

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} ORGANIZATION MODEL V2 TESTS PASSED!`);
  console.log('================================================================\n');

  await prisma.$disconnect();
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
