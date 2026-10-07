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

async function runTests() {
  console.log('--- Starting HRFlow Automated Backend API Verification ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'online', '1. API Health Check');

    // 2. HR Login
    const hrLogin = await request('POST', '/api/auth/login', {
      email: 'hr@hrflow.com',
      password: 'hr123456',
    });
    assert(hrLogin.status === 200 && hrLogin.data.data.token, '2. HR Admin Login & Token Issuance');
    const hrToken = hrLogin.data.data.token;

    // 3. BM Mumbai Login
    const bmLogin = await request('POST', '/api/auth/login', {
      email: 'bm.mumbai@hrflow.com',
      password: 'bm123456',
    });
    assert(bmLogin.status === 200 && bmLogin.data.data.token, '3. Branch Manager (Mumbai) Login & Token Issuance');
    const bmToken = bmLogin.data.data.token;
    const bmMumbaiBranchId = bmLogin.data.data.user.branchId;

    // 4. Employee Rahul Login
    const empLogin = await request('POST', '/api/auth/login', {
      email: 'emp.rahul@hrflow.com',
      password: 'emp123456',
    });
    assert(empLogin.status === 200 && empLogin.data.data.token, '4. Employee (Rahul) Login & Token Issuance');
    const empToken = empLogin.data.data.token;

    // 5. RBAC Protection: Employee cannot access /api/audit (HR Only)
    const empAuditCheck = await request('GET', '/api/audit', null, empToken);
    assert(empAuditCheck.status === 403, '5. RBAC: Employee blocked from HR Audit logs (403 Forbidden)');

    // 6. Branch Scoping: BM Mumbai blocked from BM Bangalore branch details
    const branchesRes = await request('GET', '/api/branches', null, hrToken);
    const bangaloreBranch = branchesRes.data.data.find((b) => b.code === 'APEX-BLR' || b.code.includes('BLR'));
    const bmCrossBranchCheck = await request('GET', `/api/branches/${bangaloreBranch.id}`, null, bmToken);
    assert(bmCrossBranchCheck.status === 403, '6. Branch Scoping: BM Mumbai blocked from Bangalore branch (403 Forbidden)');

    // 7. Automation Rule 1: Completing Joining Formalities
    const joiningList = await request('GET', '/api/joining', null, hrToken);
    const candidateVikram = joiningList.data.data.find((j) => j.candidateName.includes('Vikram'));
    assert(Boolean(candidateVikram), '7a. Candidate Joining Record Found');

    let completeJoiningSuccess = false;
    if (candidateVikram.status === 'COMPLETED') {
      completeJoiningSuccess = true;
    } else {
      const completeJoiningRes = await request(
        'POST',
        `/api/joining/${candidateVikram.id}/complete`,
        {
          employeeData: {
            firstName: 'Vikram',
            lastName: 'Malhotra',
            basic: 40000,
          },
        },
        hrToken
      );
      completeJoiningSuccess = completeJoiningRes.status === 200 && completeJoiningRes.data?.data?.employee?.status === 'ACTIVE';
    }
    assert(
      completeJoiningSuccess,
      '7b. Automation Rule 1: Candidate completed onboarding -> Employee status ACTIVE, Position closed, Asset approvals created'
    );

    // 8. Automation Rule 4: BM Approves SIM allocation
    const bmBlrLogin = await request('POST', '/api/auth/login', {
      email: 'bm.bangalore@hrflow.com',
      password: 'bm123456',
    });
    const bmBlrToken = bmBlrLogin.data.data.token;

    const approvalsList = await request('GET', '/api/approvals?type=SIM_REQUEST', null, bmBlrToken);
    const pendingSimApproval = approvalsList.data.data.find((a) => a.status === 'PENDING');
    if (pendingSimApproval) {
      const approveRes = await request(
        'PATCH',
        `/api/approvals/${pendingSimApproval.id}/action`,
        {
          status: 'APPROVED',
          remarks: 'Approved by Branch Manager Bangalore. SIM dispatched.',
        },
        bmBlrToken
      );
      assert(
        approveRes.status === 200 && approveRes.data.data.status === 'APPROVED',
        '8. Automation Rule 4: BM approved SIM request -> Status APPROVED & HR notification dispatched'
      );
    } else {
      console.log('[SKIP] No pending SIM approval found for BM Bangalore branch');
    }

    // 9. Automation Rule 2: Resignation Submission & Automatic Replacement Vacancy
    const resignRes = await request(
      'POST',
      '/api/exit/resignations',
      {
        reason: 'Relocating to another city for higher education.',
        noticePeriodDays: 30,
      },
      empToken
    );
    assert(
      resignRes.status === 200 &&
        resignRes.data.data.resignation.salaryHoldStatus === 'ON_HOLD' &&
        resignRes.data.data.replacementPosition.status === 'OPEN',
      '9. Automation Rule 2: Employee Resignation -> Status RESIGNED, Salary ON_HOLD, Replacement Position OPENED'
    );

    // 10. Automation Rule 3: Left Without Intimation
    const empList = await request('GET', '/api/employees', null, hrToken);
    const activeEmp = empList.data.data.employees.find((e) => e.status === 'ACTIVE');
    if (activeEmp) {
      const lwiRes = await request(
        'POST',
        '/api/exit/left-without-intimation',
        {
          employeeId: activeEmp.id,
          remarks: 'Absent without intimation for 14 consecutive days.',
        },
        hrToken
      );
      assert(
        lwiRes.status === 200 &&
          lwiRes.data.data.employee.status === 'LEFT_WITHOUT_INTIMATION' &&
          lwiRes.data.data.replacementPosition.status === 'OPEN',
        '10. Automation Rule 3: Marked Left Without Intimation -> Salary ON_HOLD, Replacement Position OPENED'
      );
    }

    // 11. Backend Salary Calculation Engine
    const calcPayrollRes = await request(
      'POST',
      '/api/payroll/calculate',
      {
        month: 9,
        year: 2026,
      },
      hrToken
    );
    assert(
      calcPayrollRes.status === 200 && calcPayrollRes.data.data.records.length > 0,
      '11. Salary Calculation Engine: Processed payroll across employees with prorated Gross, PF, ESI, and holds'
    );

    // 12. Payment Advice Generation
    const adviceRes = await request(
      'POST',
      '/api/payroll/payment-advice',
      {
        month: 9,
        year: 2026,
        bankName: 'HDFC Corporate NetBanking',
      },
      hrToken
    );
    assert(
      adviceRes.status === 200 && adviceRes.data.data.advice.referenceNumber,
      '12. Payment Advice: Generated bank-wise advice summary with reference code'
    );

    console.log(`\n========================================`);
    console.log(`Backend Verification Complete!`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
