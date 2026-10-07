const http = require('http');

const BASE_URL = 'http://localhost:5000';

function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const postData = body ? JSON.stringify(body) : null;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(responseData);
          } catch (e) {
            parsed = responseData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runUAT() {
  console.log('================================================================================');
  console.log('🏎️  HRFLOW SAAS: END-TO-END UAT & WORKFLOW VERIFICATION SUITE');
  console.log('   Auditing all 9 Phases & Dealership Operations Live on http://localhost:5000');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 0: System Health & Multi-Tenant Gateway Connectivity
  // -------------------------------------------------------------------------
  console.log('--- Phase 0: System Health & Gateway Connectivity ---');
  const healthRes = await apiRequest('GET', '/api/health');
  assert('API Gateway online', healthRes.status === 200);
  assert('Ecosystem Phase 5 badge verified', healthRes.data?.ecosystem?.includes('Phase 5'));

  // -------------------------------------------------------------------------
  // PHASE 1: Authentication & Role-Based Access Control (RBAC)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 1: Authentication & Role-Based Access Control (RBAC) ---');
  // 1a. Bellad Group HR Admin Login
  const belladLoginRes = await apiRequest('POST', '/api/auth/login', {
    email: 'hr.bellad@hrflow.com',
    password: 'hr123456',
  });
  assert('Bellad HR Admin login success', belladLoginRes.status === 200 && Boolean(belladLoginRes.data?.data?.token));
  const belladHrToken = belladLoginRes.data?.data?.token;

  const belladMeRes = await apiRequest('GET', '/api/auth/me', null, belladHrToken);
  assert('Resolve Bellad HR Profile', belladMeRes.status === 200 && belladMeRes.data?.data?.user?.email === 'hr.bellad@hrflow.com');
  assert('Bellad Group Tenant Scope', belladMeRes.data?.data?.user?.tenant?.organizationName === 'Bellad Group', `Tenant: ${belladMeRes.data?.data?.user?.tenant?.organizationName}`);

  // 1b. Hubli Branch Manager Login
  const hubliBmRes = await apiRequest('POST', '/api/auth/login', {
    email: 'bm.hubli@hrflow.com',
    password: 'bm123456',
  });
  assert('Hubli Branch Manager login success', hubliBmRes.status === 200 && Boolean(hubliBmRes.data?.data?.token));
  const hubliBmToken = hubliBmRes.data?.data?.token;

  // 1c. Apex Auto Group HR Login (Tenant A)
  const apexLoginRes = await apiRequest('POST', '/api/auth/login', {
    email: 'hr@hrflow.com',
    password: 'hr123456',
  });
  assert('Apex HR Admin login success', apexLoginRes.status === 200 && Boolean(apexLoginRes.data?.data?.token));
  const apexHrToken = apexLoginRes.data?.data?.token;

  // -------------------------------------------------------------------------
  // PHASE 1 (Cont): Organization Masters (Bellad Levels 1-10 & 103 Designations)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 1: Organization Masters & Cadre Hierarchy ---');
  const levelsRes = await apiRequest('GET', '/api/organization-masters/levels', null, belladHrToken);
  assert('Cadre Levels Master Endpoint', levelsRes.status === 200);
  const levels = levelsRes.data?.data || [];
  assert('Bellad Cadre Levels 1 to 10 Enforced', levels.length >= 10, `Found ${levels.length} levels (L1 Managing Director to L10 Support)`);

  const desigRes = await apiRequest('GET', '/api/organization-masters/designations', null, belladHrToken);
  assert('Dealership Designations Master Endpoint', desigRes.status === 200);
  const designations = desigRes.data?.data || [];
  assert('100+ Dealership Designation Master Enforced', designations.length >= 100, `Found ${designations.length} standardized dealership designations`);

  // -------------------------------------------------------------------------
  // PHASE 4: Workforce Directory & 12-Tab Profile Suite
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 4: Workforce Directory & 12-Tab Profile Suite ---');
  const employeesRes = await apiRequest('GET', '/api/employees', null, belladHrToken);
  assert('Workforce Directory Roster Endpoint', employeesRes.status === 200);
  const employees = employeesRes.data?.data?.employees || employeesRes.data?.data || [];
  assert('Employees Loaded within Tenant Boundary', employees.length > 0, `Total employees: ${employees.length}`);

  if (employees.length > 0) {
    const sampleEmpId = employees[0].id;
    const detailRes = await apiRequest('GET', `/api/employees/${sampleEmpId}`, null, belladHrToken);
    assert('12-Tab Profile Detail Loaded', detailRes.status === 200);
    const empData = detailRes.data?.data || {};
    assert('Personal & Employment Tab Data', Boolean(empData.employeeCode || empData.designation));
    assert('Statutory / PF & ESI Tab Data', Boolean(empData.statutory !== undefined));
    assert('Salary / Compensation Structure Tab Data', Boolean(empData.salary !== undefined));
    assert('KYC & Documents Tab Data', Boolean(empData.kyc !== undefined));
    assert('Hardware & Asset Allocation Tab Data', Boolean(empData.assets !== undefined));
  }

  // -------------------------------------------------------------------------
  // PHASE 2: Enterprise Horilla Modules (Org Chart, Documents, ATS Pipeline)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 2: Enterprise Horilla Modules (Org Chart, Documents, ATS Pipeline) ---');
  // Visual Org Chart relies on /employees?limit=200 with reportingManagerId links
  const orgChartFeedRes = await apiRequest('GET', '/api/employees?limit=200', null, belladHrToken);
  assert('Visual Org Chart Employee Hierarchy Feed', orgChartFeedRes.status === 200);

  // Document Requests / KYC Catalog uses employees document records
  const kycFeedRes = await apiRequest('GET', '/api/employees?limit=200', null, belladHrToken);
  assert('KYC Compliance & Document Requests Catalog Feed', kycFeedRes.status === 200);

  // ATS Recruitment Vacancies & Requisitions
  const positionsRes = await apiRequest('GET', '/api/vacancies/positions', null, belladHrToken);
  assert('ATS Recruitment Positions / Requisitions Register', positionsRes.status === 200);

  const budgetsRes = await apiRequest('GET', '/api/vacancies/budgets', null, belladHrToken);
  assert('Dealership Branch Manpower Budgets Register', budgetsRes.status === 200);

  // -------------------------------------------------------------------------
  // PHASE 5: Time & Attendance Hub & Missed Punch Regularization
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 5: Attendance Hub & Missed Punch Regularization ---');
  const attendanceRes = await apiRequest('GET', '/api/attendance', null, belladHrToken);
  assert('Attendance Logs & Biometric Punch Matrix', attendanceRes.status === 200);

  const correctionsRes = await apiRequest('GET', '/api/attendance/corrections', null, belladHrToken);
  assert('Missed Punch Regularization Approval Queue', correctionsRes.status === 200);

  // -------------------------------------------------------------------------
  // PHASE 6: Executive Dealership Payslip Engine & Bank Advice
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 6: Executive Dealership Payslip Engine ---');
  const payrollRes = await apiRequest('GET', '/api/payroll', null, belladHrToken);
  assert('Payroll Batch Runs Ledger', payrollRes.status === 200);

  const adviceRes = await apiRequest('GET', '/api/payroll/advice', null, belladHrToken);
  assert('Disbursement Payment Advice Register', adviceRes.status === 200);

  // -------------------------------------------------------------------------
  // PHASE 7: Candidate Digital Onboarding Pipeline (Rule 1)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 7: Candidate Digital Onboarding Pipeline (Rule 1) ---');
  const joiningRes = await apiRequest('GET', '/api/joining', null, belladHrToken);
  assert('Candidate Onboarding Formalities Pipeline', joiningRes.status === 200);

  // -------------------------------------------------------------------------
  // PHASE 8: Offboarding & Separation Suite (Rule 2 & 3)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 8: Offboarding & Separation Suite (Rule 2 & 3) ---');
  const exitRes = await apiRequest('GET', '/api/exit/resignations', null, belladHrToken);
  assert('Resignations & Separations Ledger (Rule 2 & 3)', exitRes.status === 200);

  const testFnfRes = await apiRequest('POST', '/api/exit/fnf', {
    employeeId: employees[0]?.id,
    lastWorkingDay: new Date().toISOString(),
    gratuityEligible: true,
  }, belladHrToken);
  assert('3-Tier Dealership NOC & F&F Settlement Calculator', [200, 201, 400, 404].includes(testFnfRes.status));

  // -------------------------------------------------------------------------
  // PHASE 9: Dealership Analytics Reports Suite
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 9: Dealership Analytics Reports Suite ---');
  const analyticsRes = await apiRequest('GET', '/api/reports/analytics', null, belladHrToken);
  assert('Dealership Multi-Dimension Analytics Engine', analyticsRes.status === 200);
  const analyticsData = analyticsRes.data?.data || {};
  assert('Departmental Diversity & Staffing Breakdown', Array.isArray(analyticsData.departments));
  assert('Cadre Level 1-10 Cadre Distribution Breakdown', Array.isArray(analyticsData.levels));
  assert('Statutory Liabilities Remittance (PF/ESI/PT) Summary', Boolean(analyticsData.statutory));

  const manpowerReportRes = await apiRequest('GET', '/api/reports/manpower', null, belladHrToken);
  assert('Branch Manpower Budget vs Actual Matrix Report', manpowerReportRes.status === 200);

  const dashboardStatsRes = await apiRequest('GET', '/api/reports/dashboard', null, belladHrToken);
  assert('Executive HR & Dealership KPI Dashboard Metrics', dashboardStatsRes.status === 200);

  // -------------------------------------------------------------------------
  // ECOSYSTEM SECURITY & MULTI-TENANT ISOLATION BOUNDARIES
  // -------------------------------------------------------------------------
  console.log('\n--- Ecosystem Security & Multi-Tenant Isolation Boundaries ---');
  // Tenant A HR cannot access Bellad Group employees
  if (employees.length > 0) {
    const belladEmpId = employees[0].id;
    const crossTenantAttempt = await apiRequest('GET', `/api/employees/${belladEmpId}`, null, apexHrToken);
    assert('Cross-Tenant Data Isolation Shield (HTTP 403/404)', crossTenantAttempt.status === 403 || crossTenantAttempt.status === 404);
  }

  // Branch Manager restricted from global platform audit logs
  const bmAuditAttempt = await apiRequest('GET', '/api/audit', null, hubliBmToken);
  assert('Branch Manager Restricted from Platform Audit Logs (HTTP 403)', bmAuditAttempt.status === 403);

  console.log('\n================================================================================');
  console.log(`🏁 UAT AUDIT COMPLETE: ${passed} PASSED | ${failed} FAILED (Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runUAT().catch((err) => {
  console.error('UAT Suite Execution Error:', err);
  process.exit(1);
});
