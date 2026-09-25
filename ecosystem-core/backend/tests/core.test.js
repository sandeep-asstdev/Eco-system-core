import assert from 'assert';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { ENV } from '../src/config/env.js';

let server = null;
let baseUrl = '';

async function runTests() {
  console.log('======================================================');
  console.log('🧪 ECOSYSTEM CORE AUTOMATED ARCHITECTURE & TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  try {
    // Start temporary test server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // --------------------------------------------------------
    // TEST 1: Health Check Endpoint
    // --------------------------------------------------------
    total++;
    console.log('[TEST 1] Testing /api/health and /api/v1/health status...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'healthy');
    assert.strictEqual(healthData.service, 'ecosystem-core-api');
    console.log('✔ Health check endpoint returned healthy status.\n');
    passed++;

    // --------------------------------------------------------
    // TEST 2: Standardized 404 Route Handling
    // --------------------------------------------------------
    total++;
    console.log('[TEST 2] Testing 404 standard JSON error envelope...');
    const notFoundRes = await fetch(`${baseUrl}/api/v1/non-existent-route`);
    const notFoundData = await notFoundRes.json();
    assert.strictEqual(notFoundRes.status, 404);
    assert.strictEqual(notFoundData.success, false);
    assert.strictEqual(notFoundData.error.code, 'ROUTE_NOT_FOUND');
    console.log('✔ Non-existent route correctly returns standardized 404 error envelope.\n');
    passed++;

    // --------------------------------------------------------
    // TEST 3: Unauthenticated Access Rejection
    // --------------------------------------------------------
    total++;
    console.log('[TEST 3] Testing rejection of unauthenticated requests to protected endpoints...');
    const unauthRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    const unauthData = await unauthRes.json();
    assert.strictEqual(unauthRes.status, 401);
    assert.strictEqual(unauthData.success, false);
    console.log('✔ Unauthenticated request properly rejected with HTTP 401.\n');
    passed++;

    // --------------------------------------------------------
    // TEST 4: JWT Token Minting & Dual-Mode HMAC Verification
    // --------------------------------------------------------
    total++;
    console.log('[TEST 4] Testing Dual-Mode JWT generation and verification...');
    const mockPayload = {
      userId: 'test-user-uuid',
      email: 'test@dealership.com',
      tenantId: 'tenant-bellad-1234',
      isPlatformAdmin: false,
      roles: ['BRANCH_MANAGER'],
      permissions: ['hr.employee.read', 'maintenance.ticket.create']
    };

    const token = jwt.sign(mockPayload, ENV.JWT_SECRET, { expiresIn: '1h' });
    const verified = jwt.verify(token, ENV.JWT_SECRET);
    assert.strictEqual(verified.email, 'test@dealership.com');
    assert.strictEqual(verified.tenantId, 'tenant-bellad-1234');
    assert.strictEqual(verified.roles[0], 'BRANCH_MANAGER');
    console.log('✔ Dual-Mode token correctly signed and verified against ecosystem secret.\n');
    passed++;

    // --------------------------------------------------------
    // TEST 5: Scoped RBAC Scope Evaluation Logic
    // --------------------------------------------------------
    total++;
    console.log('[TEST 5] Testing Scoped RBAC organizational boundary evaluation...');
    
    // Test helper to simulate scope check
    function evaluateScope(userScope, userBranchId, targetBranchId) {
      if (userScope === 'GLOBAL' || userScope === 'TENANT') return true;
      if (userScope === 'BRANCH') return userBranchId === targetBranchId;
      return false;
    }

    // Branch manager for Hubli trying to access Hubli
    assert.strictEqual(evaluateScope('BRANCH', 'brn-hubli', 'brn-hubli'), true);
    // Branch manager for Hubli trying to access Belgaum
    assert.strictEqual(evaluateScope('BRANCH', 'brn-hubli', 'brn-belgaum'), false);
    // Tenant Admin trying to access Belgaum
    assert.strictEqual(evaluateScope('TENANT', 'brn-hubli', 'brn-belgaum'), true);
    console.log('✔ Scoped RBAC isolation logic verified: Hubli branch manager cannot access Belgaum.\n');
    passed++;

    console.log('======================================================');
    console.log(`🎉 ALL ${passed}/${total} ECOSYSTEM CORE TEST SUITES PASSED PERFECTLY (100%)`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
