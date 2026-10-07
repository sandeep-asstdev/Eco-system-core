const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        method,
        path,
        headers,
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            const parsed = resBody ? JSON.parse(resBody) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runCrossTenantSecurityTests() {
  console.log('===============================================================');
  console.log('  HRFlow SaaS: Automated Cross-Tenant Security & Isolation Test');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // SETUP: Authenticate All Roles
    // ----------------------------------------------------
    console.log('Authenticating users across platform and tenants...');

    // Platform Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@hrflow.com',
      password: 'admin123456',
    });
    assert(adminLogin.status === 200, 'Platform Admin Login');
    const adminToken = adminLogin.data.data.token;

    // Tenant A (Apex Auto Group) HR
    const tenantA_HR_Login = await request('POST', '/api/auth/login', {
      email: 'hr@hrflow.com',
      password: 'hr123456',
    });
    assert(tenantA_HR_Login.status === 200, 'Tenant A HR Login');
    const tenantA_HR_Token = tenantA_HR_Login.data.data.token;
    const tenantA_Id = tenantA_HR_Login.data.data.user.tenantId;

    // Tenant A BM Mumbai
    const tenantA_BM_Login = await request('POST', '/api/auth/login', {
      email: 'bm.mumbai@hrflow.com',
      password: 'bm123456',
    });
    assert(tenantA_BM_Login.status === 200, 'Tenant A BM Login');
    const tenantA_BM_Token = tenantA_BM_Login.data.data.token;

    // Tenant A Employee Rahul
    const tenantA_Emp_Login = await request('POST', '/api/auth/login', {
      email: 'emp.rahul@hrflow.com',
      password: 'emp123456',
    });
    assert(tenantA_Emp_Login.status === 200, 'Tenant A Employee Login');
    const tenantA_Emp_Token = tenantA_Emp_Login.data.data.token;

    // Tenant B (Zenith Motors) HR
    const tenantB_HR_Login = await request('POST', '/api/auth/login', {
      email: 'hr.zenith@hrflow.com',
      password: 'hr123456',
    });
    assert(tenantB_HR_Login.status === 200, 'Tenant B HR Login');
    let tenantB_HR_Token = tenantB_HR_Login.data.data.token;
    const tenantB_Id = tenantB_HR_Login.data.data.user.tenantId;

    // Tenant B BM Pune
    const tenantB_BM_Login = await request('POST', '/api/auth/login', {
      email: 'bm.pune@hrflow.com',
      password: 'bm123456',
    });
    assert(tenantB_BM_Login.status === 200, 'Tenant B BM Login');
    const tenantB_BM_Token = tenantB_BM_Login.data.data.token;

    // Tenant B Employee Rohit
    const tenantB_Emp_Login = await request('POST', '/api/auth/login', {
      email: 'emp.rohit@hrflow.com',
      password: 'emp123456',
    });
    assert(tenantB_Emp_Login.status === 200, 'Tenant B Employee Login');
    const tenantB_Emp_Token = tenantB_Emp_Login.data.data.token;

    // Fetch Tenant A and Tenant B sample resources
    const tenantA_Employees = await request('GET', '/api/employees', null, tenantA_HR_Token);
    const tenantB_Employees = await request('GET', '/api/employees', null, tenantB_HR_Token);
    const tenantA_Branches = await request('GET', '/api/branches', null, tenantA_HR_Token);
    const tenantB_Branches = await request('GET', '/api/branches', null, tenantB_HR_Token);

    const empA = tenantA_Employees.data.data.employees[0];
    const empB = tenantB_Employees.data.data.employees[0];
    const branchB = tenantB_Branches.data.data[0];

    console.log(`\nTenant A: ${tenantA_Id} (Sample Emp: ${empA?.employeeCode})`);
    console.log(`Tenant B: ${tenantB_Id} (Sample Emp: ${empB?.employeeCode}, Branch: ${branchB?.name})\n`);

    // ----------------------------------------------------
    // TEST 1: Tenant A HR requests Tenant B Employee by ID
    // ----------------------------------------------------
    console.log('--- Test 1: Cross-Tenant Employee Access ---');
    const crossEmpRes = await request('GET', `/api/employees/${empB.id}`, null, tenantA_HR_Token);
    assert(
      crossEmpRes.status === 403,
      'Tenant A HR requesting Tenant B Employee must be 403 Forbidden',
      `Got ${crossEmpRes.status}`
    );

    // ----------------------------------------------------
    // TEST 2: Tenant A BM attempts to view Tenant B Branch
    // ----------------------------------------------------
    console.log('\n--- Test 2: Cross-Tenant Branch Access by BM ---');
    const crossBranchRes = await request('GET', `/api/branches/${branchB.id}`, null, tenantA_BM_Token);
    assert(
      crossBranchRes.status === 403,
      'Tenant A BM requesting Tenant B Branch must be 403 Forbidden',
      `Got ${crossBranchRes.status}`
    );

    // ----------------------------------------------------
    // TEST 3: Tenant A Employee attempts to view Tenant B Employee
    // ----------------------------------------------------
    console.log('\n--- Test 3: Cross-Tenant Employee Access by Employee ---');
    const crossEmpByEmpRes = await request('GET', `/api/employees/${empB.id}`, null, tenantA_Emp_Token);
    assert(
      crossEmpByEmpRes.status === 403,
      'Tenant A Employee requesting Tenant B Employee must be 403 Forbidden',
      `Got ${crossEmpByEmpRes.status}`
    );

    // ----------------------------------------------------
    // TEST 4: Manipulating tenantId in query params (Spoofing)
    // ----------------------------------------------------
    console.log('\n--- Test 4: Tenant ID Spoofing / Parameter Tampering ---');
    const spoofQueryRes = await request(
      'GET',
      `/api/employees?tenantId=${tenantB_Id}`,
      null,
      tenantA_HR_Token
    );
    assert(
      spoofQueryRes.status === 403,
      'Attempt to spoof tenantId via query parameter must be rejected with 403 Forbidden',
      `Got ${spoofQueryRes.status}`
    );

    // ----------------------------------------------------
    // TEST 5: Creating an employee with a branch belonging to another tenant
    // ----------------------------------------------------
    console.log('\n--- Test 5: Cross-Tenant Branch Association on Creation ---');
    const crossBranchEmpCreate = await request(
      'POST',
      '/api/employees',
      {
        firstName: 'Intruder',
        lastName: 'Test',
        email: 'intruder.test@example.com',
        phone: '9999999999',
        branchId: branchB.id, // Tenant B branch!
        department: 'Sales',
        designation: 'Sales Consultant',
        dateOfJoining: '2026-04-01',
        employmentType: 'PERMANENT',
        basic: 30000,
        hra: 12000,
        specialAllowance: 5000,
      },
      tenantA_HR_Token // Tenant A HR token
    );
    assert(
      crossBranchEmpCreate.status === 403,
      'Creating an employee using another tenant branch must be rejected with 403 Forbidden',
      `Got ${crossBranchEmpCreate.status}`
    );

    // ----------------------------------------------------
    // TEST 6: Employee Export Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 6: Cross-Tenant Data Leakage in Export ---');
    const exportRes = await request('GET', '/api/employees/export', null, tenantA_HR_Token);
    assert(exportRes.status === 200, 'Tenant A HR Export returns 200');
    const exportCsv = typeof exportRes.raw === 'string' ? exportRes.raw : JSON.stringify(exportRes.data);
    const hasZenithData = exportCsv.toLowerCase().includes('zenith') || exportCsv.includes('ZEN-');
    assert(
      !hasZenithData,
      'Tenant A Export must contain ZERO records from Tenant B',
      hasZenithData ? 'Found Tenant B data in CSV!' : 'No Tenant B data found'
    );

    // ----------------------------------------------------
    // TEST 7: Cross-Tenant Search Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 7: Global Search Scoping ---');
    const searchRes = await request('GET', '/api/search?q=Zenith', null, tenantA_HR_Token);
    assert(searchRes.status === 200, 'Global Search executed successfully');
    const searchResults = searchRes.data.data;
    const totalFound =
      (searchResults.employees?.length || 0) +
      (searchResults.branches?.length || 0) +
      (searchResults.positions?.length || 0);
    assert(
      totalFound === 0,
      'Tenant A search for "Zenith" must return 0 results',
      `Found ${totalFound} results`
    );

    // ----------------------------------------------------
    // TEST 8: Cross-Tenant File Retrieval
    // ----------------------------------------------------
    console.log('\n--- Test 8: Cross-Tenant File Storage Authorization ---');
    const fileRes = await request(
      'GET',
      `/api/files/${tenantB_Id}/documents/secret.pdf`,
      null,
      tenantA_HR_Token
    );
    assert(
      fileRes.status === 403,
      'Attempt by Tenant A HR to fetch file from Tenant B storage must be 403 Forbidden',
      `Got ${fileRes.status}`
    );

    // ----------------------------------------------------
    // TEST 9: Tenant Suspension Enforcement
    // ----------------------------------------------------
    console.log('\n--- Test 9: Suspended Tenant Access Blocking ---');
    // Platform admin suspends Tenant B
    const suspendRes = await request(
      'PATCH',
      `/api/tenants/${tenantB_Id}/status`,
      { status: 'SUSPENDED', remarks: 'Billing delinquency test' },
      adminToken
    );
    assert(suspendRes.status === 200, 'Platform Admin suspended Tenant B successfully');

    // Tenant B HR attempts authenticated operation with existing token
    const suspendedAccess = await request('GET', '/api/employees', null, tenantB_HR_Token);
    assert(
      suspendedAccess.status === 403,
      'Access with existing token for SUSPENDED tenant must be blocked with 403 Forbidden',
      `Got ${suspendedAccess.status}`
    );

    // Tenant B HR attempts to log in again while suspended
    const suspendedLogin = await request('POST', '/api/auth/login', {
      email: 'hr.zenith@hrflow.com',
      password: 'hr123456',
    });
    assert(
      suspendedLogin.status === 403,
      'Login attempt for SUSPENDED tenant must be rejected with 403 Forbidden',
      `Got ${suspendedLogin.status}`
    );

    // Restore Tenant B to ACTIVE
    const activateRes = await request(
      'PATCH',
      `/api/tenants/${tenantB_Id}/status`,
      { status: 'ACTIVE' },
      adminToken
    );
    assert(activateRes.status === 200, 'Platform Admin restored Tenant B to ACTIVE status');

    // Re-login Tenant B HR after restoration
    const restoredLogin = await request('POST', '/api/auth/login', {
      email: 'hr.zenith@hrflow.com',
      password: 'hr123456',
    });
    assert(restoredLogin.status === 200, 'Tenant B HR successfully logged in after restoration');
    tenantB_HR_Token = restoredLogin.data.data.token;

    // ----------------------------------------------------
    // TEST 10: Plan Feature Gating (requireFeature)
    // ----------------------------------------------------
    console.log('\n--- Test 10: Plan Feature Flag Gating ---');
    // Platform Admin disables 'vacancies' module for Tenant B
    const updatePlanRes = await request(
      'PATCH',
      `/api/tenants/${tenantB_Id}/plan`,
      { features: { vacancies: false, payroll: true, employees: true } },
      adminToken
    );
    assert(updatePlanRes.status === 200, 'Platform Admin disabled vacancies module for Tenant B');

    // Refresh token / login for Tenant B HR to get fresh feature state
    const freshLogin = await request('POST', '/api/auth/login', {
      email: 'hr.zenith@hrflow.com',
      password: 'hr123456',
    });
    const freshTenantBToken = freshLogin.data.data.token;

    // Tenant B HR tries to access vacancies module
    const gatedVacanciesRes = await request(
      'GET',
      '/api/vacancies/positions',
      null,
      freshTenantBToken
    );
    assert(
      gatedVacanciesRes.status === 403,
      'Access to disabled module (vacancies) must be blocked with 403 Forbidden',
      `Got ${gatedVacanciesRes.status}`
    );

    // Platform Admin re-enables vacancies module
    const restorePlanRes = await request(
      'PATCH',
      `/api/tenants/${tenantB_Id}/plan`,
      { features: { vacancies: true, payroll: true, employees: true } },
      adminToken
    );
    assert(restorePlanRes.status === 200, 'Platform Admin re-enabled vacancies module for Tenant B');

    console.log('\n===============================================================');
    console.log(`  Security Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runCrossTenantSecurityTests();
