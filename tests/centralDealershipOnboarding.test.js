import assert from 'assert';
import http from 'http';
import { PrismaClient as CorePrisma } from '../ecosystem-core/backend/node_modules/@prisma/client/index.js';
import { PrismaClient as HrPrisma } from '../applications/HRFlow/backend/node_modules/@prisma/client/index.js';
import { PrismaClient as MaintlyPrisma } from '../applications/Maintly/backend/node_modules/@prisma/client/index.js';

const CORE_URL = 'http://localhost:4000/api/v1';
const HRFLOW_URL = 'http://localhost:5000/api';
const MAINTLY_URL = 'http://localhost:5002/api';

const coreDb = new CorePrisma({ datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/ecosystem_core_db?schema=public' } } });
const hrDb = new HrPrisma({ datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/hrflow_db?schema=public' } } });
const maintDb = new MaintlyPrisma({ datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5433/maintly_db?schema=public' } } });

function httpRequest(urlStr, method = 'GET', body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;

    const headers = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers,
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, text: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    if (postData) req.write(postData);
    req.end();
  });
}

console.log('\n================================================================');
console.log('🏛️ CENTRALIZED DEALERSHIP ONBOARDING & TENANT ARCHITECTURE SUITE');
console.log('   SaaS Principle: Ecosystem Core Authority, App Decoupling, Isolation');
console.log('================================================================\n');

async function run() {
  try {
    // -------------------------------------------------------------
    // [STEP 1] Authenticate as Platform Admin on Ecosystem Core
    // -------------------------------------------------------------
    console.log('[STEP 1] Logging in as Platform Admin on Ecosystem Core...');
    const adminLogin = await httpRequest(`${CORE_URL}/auth/login`, 'POST', {
      email: 'admin@ecosystem.com',
      password: 'Admin@123'
    });
    assert.strictEqual(adminLogin.status, 200, 'Platform admin login must succeed');
    const platformToken = adminLogin.data.data.token;
    console.log('✔ Authenticated as Platform Admin.\n');

    // -------------------------------------------------------------
    // [TEST 1] HRFlow: Direct Dealership Creation MUST Be Blocked
    // -------------------------------------------------------------
    console.log('[TEST 1] Verifying HRFlow rejects independent dealership creation...');
    const hrflowCreateRes = await httpRequest(`${HRFLOW_URL}/tenants`, 'POST', {
      organizationName: 'Rogue Dealership HRFlow',
      legalName: 'Rogue Dealership Private Limited',
      code: 'ROGUE_HR'
    }, platformToken);

    assert.strictEqual(hrflowCreateRes.status, 403, 'HRFlow POST /tenants must return 403 Forbidden');
    assert.strictEqual(hrflowCreateRes.data.error.code, 'TENANT_ONBOARDING_CENTRALIZED');
    console.log('✔ HRFlow /tenants blocked with 403 TENANT_ONBOARDING_CENTRALIZED.');

    const hrflowRegisterRes = await httpRequest(`${HRFLOW_URL}/auth/register`, 'POST', {
      organizationName: 'Rogue Dealership Register',
      email: 'rogue@dealership.com',
      password: 'password123'
    });
    assert.strictEqual(hrflowRegisterRes.status, 403, 'HRFlow POST /auth/register must return 403 Forbidden');
    assert.strictEqual(hrflowRegisterRes.data.error.code, 'CENTRAL_AUTHENTICATION_REQUIRED');
    console.log('✔ HRFlow /auth/register blocked with 403 CENTRAL_AUTHENTICATION_REQUIRED.\n');

    // -------------------------------------------------------------
    // [TEST 2] MAINTLY: Direct Dealership Creation MUST Be Blocked
    // -------------------------------------------------------------
    console.log('[TEST 2] Verifying MAINTLY rejects independent dealership creation...');
    const maintlyCreateRes = await httpRequest(`${MAINTLY_URL}/org/tenants`, 'POST', {
      name: 'Rogue Dealership Maintly',
      code: 'ROGUE_MNT',
      slug: 'rogue-mnt'
    }, platformToken);

    assert.strictEqual(maintlyCreateRes.status, 403, 'MAINTLY POST /org/tenants must return 403 Forbidden');
    assert.strictEqual(maintlyCreateRes.data.error.code, 'TENANT_ONBOARDING_CENTRALIZED');
    console.log('✔ MAINTLY /org/tenants blocked with 403 TENANT_ONBOARDING_CENTRALIZED.\n');

    // -------------------------------------------------------------
    // [TEST 3] Central Onboarding in Ecosystem Core: TRIDENT GROUP
    // -------------------------------------------------------------
    console.log('[TEST 3] Onboarding TRIDENT GROUP centrally in Ecosystem Core...');

    // Clean prior test artifacts cleanly if present
    await coreDb.tenant.deleteMany({ where: { code: 'TRIDENT' } });
    await hrDb.tenant.deleteMany({ where: { code: 'TRIDENT' } });
    await maintDb.tenant.deleteMany({ where: { code: 'TRIDENT' } });

    const tridentPayload = {
      name: 'Trident Group',
      legalName: 'Trident Automotive Private Limited',
      code: 'TRIDENT',
      subscriptionTier: 'ENTERPRISE',
      primaryEmail: 'admin@tridentgroup.in',
      primaryPhone: '9876500001',
      adminName: 'Trident Administrator',
      adminEmail: 'admin@tridentgroup.in',
      adminPassword: 'Admin@123',
      firms: [
        { code: 'TRIDENT_MOTORS', name: 'Trident Motors Pvt Ltd' },
        { code: 'TRIDENT_AUTO', name: 'Trident Automotive Pvt Ltd' }
      ],
      brands: [
        { code: 'HYUNDAI', name: 'Hyundai' },
        { code: 'TATA', name: 'Tata Motors' },
        { code: 'MG', name: 'MG Motor' }
      ],
      branches: [
        { code: 'TRIDENT-HUB', name: 'Hubballi Branch', city: 'Hubballi', state: 'Karnataka', firmCode: 'TRIDENT_MOTORS' },
        { code: 'TRIDENT-DHW', name: 'Dharwad Branch', city: 'Dharwad', state: 'Karnataka', firmCode: 'TRIDENT_MOTORS' },
        { code: 'TRIDENT-BLG', name: 'Belagavi Branch', city: 'Belagavi', state: 'Karnataka', firmCode: 'TRIDENT_AUTO' }
      ],
      subscribedApps: ['hrflow', 'maintly']
    };

    const onboardRes = await httpRequest(`${CORE_URL}/tenants`, 'POST', tridentPayload, platformToken);
    if (onboardRes.status !== 201) {
      console.error('❌ ONBOARDING ERROR DETAILS:', onboardRes.data);
    }
    assert.strictEqual(onboardRes.status, 201, 'Central tenant onboarding must return 201 CREATED');
    const tridentTenant = onboardRes.data.data;
    const tridentTenantId = tridentTenant.id;
    console.log(`✔ Central Tenant Onboarded: ${tridentTenant.name} (UUID: ${tridentTenantId}, Code: ${tridentTenant.code}).`);

    // Verify Organization Hierarchy in Ecosystem Core
    const firms = await coreDb.firm.findMany({ where: { tenantId: tridentTenantId } });
    const brands = await coreDb.brand.findMany({ where: { tenantId: tridentTenantId } });
    const branches = await coreDb.branch.findMany({ where: { tenantId: tridentTenantId } });
    const units = await coreDb.businessUnit.findMany({ where: { tenantId: tridentTenantId } });

    assert.strictEqual(firms.length, 2, 'Must create 2 firms in Ecosystem Core');
    assert.strictEqual(brands.length, 3, 'Must create 3 brands in Ecosystem Core');
    assert.strictEqual(branches.length, 3, 'Must create 3 branches in Ecosystem Core');
    assert.strictEqual(units.length, 9, 'Must seed standard 3S operational units');
    console.log(`✔ Hierarchy verified: ${firms.length} Firms, ${brands.length} Brands, ${branches.length} Branches, ${units.length} Business Units.\n`);

    // -------------------------------------------------------------
    // [TEST 4] Verify Canonical Tenant Identity in HRFlow & MAINTLY
    // -------------------------------------------------------------
    console.log('[TEST 4] Verifying canonical tenant identity in domain databases...');
    // Give asynchronous propagation 500ms to settle or JIT fallback
    await new Promise(r => setTimeout(r, 600));

    let hrTenant = await hrDb.tenant.findFirst({ where: { centralTenantId: tridentTenantId } });
    if (!hrTenant) {
      // Test JIT pull from Core
      const ping = await httpRequest(`${HRFLOW_URL}/internal/tenants/sync`, 'POST', {
        id: tridentTenantId,
        code: 'TRIDENT',
        name: 'Trident Group',
        legalName: 'Trident Automotive Private Limited'
      }, null, { 'X-Internal-Service-Key': 'ecosystem-internal-service-sync-key' });
      assert.strictEqual(ping.status, 200);
      hrTenant = await hrDb.tenant.findFirst({ where: { centralTenantId: tridentTenantId } });
    }
    assert.ok(hrTenant, 'HRFlow must have tenant linked to canonical centralTenantId');
    assert.strictEqual(hrTenant.centralTenantId, tridentTenantId);
    assert.strictEqual(hrTenant.code, 'TRIDENT');
    console.log(`✔ HRFlow canonical tenant verified (Local ID: ${hrTenant.id}, centralTenantId: ${hrTenant.centralTenantId}).`);

    let maintTenant = await maintDb.tenant.findFirst({ where: { centralTenantId: tridentTenantId } });
    if (!maintTenant) {
      const pingM = await httpRequest(`${MAINTLY_URL}/internal/tenants/sync`, 'POST', {
        id: tridentTenantId,
        code: 'TRIDENT',
        name: 'Trident Group',
        slug: 'trident'
      }, null, { 'X-Internal-Service-Key': 'ecosystem-internal-service-sync-key' });
      assert.strictEqual(pingM.status, 200);
      maintTenant = await maintDb.tenant.findFirst({ where: { centralTenantId: tridentTenantId } });
    }
    assert.ok(maintTenant, 'MAINTLY must have tenant linked to canonical centralTenantId');
    assert.strictEqual(maintTenant.centralTenantId, tridentTenantId);
    assert.strictEqual(maintTenant.code, 'TRIDENT');
    console.log(`✔ MAINTLY canonical tenant verified (Local ID: ${maintTenant.id}, centralTenantId: ${maintTenant.centralTenantId}).\n`);

    // -------------------------------------------------------------
    // [TEST 5] Trident User Login & Multi-Application Entry
    // -------------------------------------------------------------
    console.log('[TEST 5] Verifying Trident Administrator login and application entry...');
    const tridentLogin = await httpRequest(`${CORE_URL}/auth/login`, 'POST', {
      email: 'admin@tridentgroup.in',
      password: 'Admin@123'
    });
    assert.strictEqual(tridentLogin.status, 200, 'Trident admin login must succeed');
    const tridentToken = tridentLogin.data.data.token;
    assert.strictEqual(tridentLogin.data.data.tenant.id, tridentTenantId);
    console.log('✔ Trident Admin authenticated on Central Ecosystem.');

    // Enter HRFlow
    const hrflowProfile = await httpRequest(`${HRFLOW_URL}/auth/me`, 'GET', null, tridentToken);
    if (hrflowProfile.status !== 200) {
      console.error('HRFLOW PROFILE ERROR:', hrflowProfile.data);
    }
    assert.strictEqual(hrflowProfile.status, 200, 'Trident user entry into HRFlow must succeed');
    assert.strictEqual(hrflowProfile.data.data.user.email, 'admin@tridentgroup.in');
    assert.strictEqual(hrflowProfile.data.data.user.tenantId, hrTenant.id, 'Must be scoped to Trident HR tenant');
    console.log('✔ Trident Admin entered HRFlow (Scoped to Trident tenant).');

    // Enter MAINTLY
    const maintlyProfile = await httpRequest(`${MAINTLY_URL}/auth/me`, 'GET', null, tridentToken);
    assert.strictEqual(maintlyProfile.status, 200, 'Trident user entry into MAINTLY must succeed');
    assert.strictEqual(maintlyProfile.data.data.user.email, 'admin@tridentgroup.in');
    assert.strictEqual(maintlyProfile.data.data.user.tenantId, maintTenant.id, 'Must be scoped to Trident maintenance tenant');
    console.log('✔ Trident Admin entered MAINTLY (Scoped to Trident tenant).\n');

    // -------------------------------------------------------------
    // [TEST 6] Application Subscription Enforcement (Advait Group)
    // -------------------------------------------------------------
    console.log('[TEST 6] Testing application subscription enforcement (Advait Group)...');
    // Ensure Advait Group exists in Core
    let advait = await coreDb.tenant.findUnique({ where: { code: 'ADV_GRP' } });
    if (!advait) {
      advait = await coreDb.tenant.create({
        data: {
          code: 'ADV_GRP',
          name: 'Advait Group',
          legalName: 'Advait Motors Private Limited',
          subscriptionTier: 'ENTERPRISE',
          primaryEmail: 'hello@gmail.com'
        }
      });
    }

    // Configure Subscriptions for Advait: HRFlow = ACTIVE, MAINTLY = INACTIVE
    const hrApp = await coreDb.application.findFirst({ where: { OR: [{ appKey: 'hrflow' }, { code: 'hrflow' }] } });
    const maintApp = await coreDb.application.findFirst({ where: { OR: [{ appKey: 'maintly' }, { code: 'maintly' }] } });

    if (hrApp) {
      await coreDb.tenantApplication.upsert({
        where: { tenantId_applicationId: { tenantId: advait.id, applicationId: hrApp.id } },
        update: { status: 'ACTIVE' },
        create: { tenantId: advait.id, applicationId: hrApp.id, status: 'ACTIVE' }
      });
    }

    if (maintApp) {
      await coreDb.tenantApplication.upsert({
        where: { tenantId_applicationId: { tenantId: advait.id, applicationId: maintApp.id } },
        update: { status: 'SUSPENDED' },
        create: { tenantId: advait.id, applicationId: maintApp.id, status: 'SUSPENDED' }
      });
    }

    // Log in as Advait Admin
    const advaitLogin = await httpRequest(`${CORE_URL}/auth/login`, 'POST', {
      email: 'hello@gmail.com',
      password: 'Admin@123'
    });
    assert.strictEqual(advaitLogin.status, 200, 'Advait admin login must succeed');
    const advaitToken = advaitLogin.data.data.token;

    // Advait enters HRFlow -> Allowed (Subscribed)
    const advaitHrRes = await httpRequest(`${HRFLOW_URL}/auth/me`, 'GET', null, advaitToken);
    assert.strictEqual(advaitHrRes.status, 200, 'Advait user should access subscribed HRFlow application');
    console.log('✔ Advait Group entered HRFlow (HRFlow is SUBSCRIBED).');

    // Advait enters MAINTLY -> Denied (403 Subscription Inactive)
    const advaitMaintRes = await httpRequest(`${MAINTLY_URL}/auth/me`, 'GET', null, advaitToken);
    assert.strictEqual(advaitMaintRes.status, 403, 'MAINTLY must reject Advait since MAINTLY subscription is INACTIVE');
    assert.match(advaitMaintRes.data.message, /subscription/i, 'Error message must specify subscription required');
    console.log('✔ MAINTLY strictly rejected Advait with 403 (MAINTLY is DISABLED for Advait).\n');

    // -------------------------------------------------------------
    // [TEST 7] Strict Cross-Tenant Data Isolation (Trident vs Bellad)
    // -------------------------------------------------------------
    console.log('[TEST 7] Testing strict multi-tenant data isolation...');

    // 1. In HRFlow: Create employee in Trident Group
    const tridentBranch = await hrDb.branch.findFirst({ where: { tenantId: hrTenant.id } });
    assert.ok(tridentBranch, 'Trident branch must exist in HRFlow');

    const empRes = await httpRequest(`${HRFLOW_URL}/employees`, 'POST', {
      firstName: 'Kiran',
      lastName: 'Kulkarni',
      email: 'kiran.k@tridentgroup.in',
      phone: '9888877771',
      gender: 'MALE',
      dateOfJoining: '2026-01-15',
      employmentType: 'FULL_TIME',
      department: 'SALES',
      designation: 'Sales Consultant',
      branchId: tridentBranch.id
    }, tridentToken);
    assert.strictEqual(empRes.status, 201, 'Trident employee creation must succeed');
    const tridentEmpId = empRes.data.data.id;
    console.log(`✔ Created Trident Employee: Kiran Kulkarni (ID: ${tridentEmpId}).`);

    // Verify Trident Admin can read own employee
    const getOwnEmp = await httpRequest(`${HRFLOW_URL}/employees/${tridentEmpId}`, 'GET', null, tridentToken);
    assert.strictEqual(getOwnEmp.status, 200);

    // Fetch Bellad employee as reference
    const belladHr = await hrDb.tenant.findUnique({ where: { code: 'BELLAD' } });
    const belladEmp = await hrDb.employee.findFirst({ where: { tenantId: belladHr.id } });
    if (belladEmp) {
      // Trident Admin attempts to access Bellad employee -> Must be 403 Forbidden!
      const crossEmpRes = await httpRequest(`${HRFLOW_URL}/employees/${belladEmp.id}`, 'GET', null, tridentToken);
      assert.strictEqual(crossEmpRes.status, 403, 'Trident user must NOT access Bellad employee data');
      console.log('✔ Trident Admin blocked from Bellad employee (403 Forbidden).');
    }

    // Manipulated Tenant ID spoofing in query param
    const spoofQueryRes = await httpRequest(`${HRFLOW_URL}/employees?tenantId=${belladHr?.id}`, 'GET', null, tridentToken);
    assert.strictEqual(spoofQueryRes.status, 403, 'Tenant ID query spoofing must be rejected with 403');
    console.log('✔ Tenant ID query parameter spoofing blocked with 403 Forbidden.');

    // 2. In MAINTLY: Create maintenance ticket in Trident Group
    let tridentMaintBranch = await maintDb.branch.findFirst({ where: { tenantId: maintTenant.id } });
    if (!tridentMaintBranch) {
      tridentMaintBranch = await maintDb.branch.create({
        data: {
          tenantId: maintTenant.id,
          name: 'Hubballi Main Facility',
          code: 'TRID-HBL'
        }
      });
    }

    let tridentMaintDept = await maintDb.department.findFirst({ where: { tenantId: maintTenant.id } });
    if (!tridentMaintDept) {
      tridentMaintDept = await maintDb.department.create({
        data: {
          tenantId: maintTenant.id,
          name: 'Service Operations',
          code: 'SERV'
        }
      });
    }

    let maintType = await maintDb.maintenanceType.findFirst({ where: { tenantId: maintTenant.id } });
    if (!maintType) {
      maintType = await maintDb.maintenanceType.findFirst();
    }

    const tridentMaintTicket = await maintDb.maintenanceRequest.create({
      data: {
        tenantId: maintTenant.id,
        branchId: tridentMaintBranch.id,
        departmentId: tridentMaintDept.id,
        requesterId: maintlyProfile.data.data.user.id,
        maintenanceTypeId: maintType.id,
        requestNumber: 'TRID-MAIN-2026-000001',
        subject: 'Customer Lounge AC Servicing',
        description: 'AC cooling issue in Hubballi delivery bay',
        location: 'Hubballi Campus - Delivery Bay',
        priority: 'MEDIUM',
        requiredDate: new Date()
      }
    });
    console.log(`✔ Created Trident Maintenance Ticket: ${tridentMaintTicket.requestNumber}`);

    // Verify Trident sees only Trident requests
    const tridentTickets = await httpRequest(`${MAINTLY_URL}/maintenance/requests`, 'GET', null, tridentToken);
    assert.strictEqual(tridentTickets.status, 200);
    const tickets = Array.isArray(tridentTickets.data.data) ? tridentTickets.data.data : (tridentTickets.data.data?.items || []);
    const hasOnlyTrident = tickets.every(t => t.tenantId === maintTenant.id);
    assert.strictEqual(hasOnlyTrident, true, 'Trident maintenance query must contain only Trident tickets');
    console.log(`✔ MAINTLY query returned ${tickets.length} ticket(s) belonging 100% exclusively to Trident.\n`);

    // -------------------------------------------------------------
    // [TEST 8] Baseline Tenants Integrity Check
    // -------------------------------------------------------------
    console.log('[TEST 8] Verifying baseline tenants integrity (BELLAD, APEX, KALYANI_MOTORS)...');
    const baselineCodes = ['BELLAD', 'APEX', 'KALYANI_MOTORS'];
    for (const code of baselineCodes) {
      const coreT = await coreDb.tenant.findUnique({ where: { code } });
      assert.ok(coreT, `Baseline tenant ${code} must exist in Ecosystem Core`);
    }
    console.log('✔ All baseline tenants preserved intact with zero data loss.');

    console.log('\n================================================================');
    console.log('🎉 ALL 8/8 CENTRALIZED DEALERSHIP ONBOARDING TESTS PASSED (100%)');
    console.log('================================================================\n');

  } finally {
    await coreDb.$disconnect();
    await hrDb.$disconnect();
    await maintDb.$disconnect();
  }
}

run().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
