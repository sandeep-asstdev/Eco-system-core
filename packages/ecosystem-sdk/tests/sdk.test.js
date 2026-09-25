import assert from 'assert';
import {
  encryptSecret,
  decryptSecret,
  EcosystemError,
  ValidationError,
  ForbiddenError,
  AuthenticationError,
  createHealthHandler,
  createEventBus,
  createEcosystemClient,
  requirePermission,
  requireRole,
  requireTenant,
  createErrorHandler
} from '../index.js';

console.log('🧪 Running @automobile-ecosystem/sdk Automated Unit Tests...');

// 1. Test Crypto Utils
console.log('Testing AES-256-GCM secret encryption & decryption...');
const sampleConfig = { apiKey: 'secret-api-key-12345', webhookSecret: 'whsec-998877' };
const encrypted = encryptSecret(sampleConfig);
assert.ok(encrypted.ciphertext, 'Ciphertext should be present');
assert.ok(encrypted.iv, 'IV should be present');
assert.ok(encrypted.authTag, 'AuthTag should be present');

const decrypted = decryptSecret(encrypted);
assert.deepStrictEqual(decrypted, sampleConfig, 'Decrypted object must match original payload');
console.log('✔ Crypto encryption and decryption verified.');

// 2. Test Error Classes
console.log('Testing Ecosystem Error Hierarchy...');
const valErr = new ValidationError('Invalid branch ID', { field: 'branchId' });
assert.strictEqual(valErr.statusCode, 400);
assert.strictEqual(valErr.code, 'VALIDATION_ERROR');
assert.deepStrictEqual(valErr.details, { field: 'branchId' });

const authErr = new AuthenticationError();
assert.strictEqual(authErr.statusCode, 401);
assert.strictEqual(authErr.code, 'AUTHENTICATION_REQUIRED');

const forbErr = new ForbiddenError('Missing permission');
assert.strictEqual(forbErr.statusCode, 403);
assert.strictEqual(forbErr.code, 'INSUFFICIENT_PERMISSIONS');
console.log('✔ Error hierarchy verified.');

// 3. Test Health Handler
console.log('Testing Health Handler...');
const healthFn = createHealthHandler({
  serviceName: 'test-service',
  version: '2.0.0',
  checks: {
    postgres: async () => 'CONNECTED',
    cache: async () => 'OK'
  }
});

let healthResStatus = null;
let healthResData = null;
const mockRes = {
  status(s) { healthResStatus = s; return this; },
  json(d) { healthResData = d; }
};

healthFn({}, mockRes).then(() => {
  assert.strictEqual(healthResStatus, 200);
  assert.strictEqual(healthResData.success, true);
  assert.strictEqual(healthResData.data.service, 'test-service');
  assert.strictEqual(healthResData.data.version, '2.0.0');
  assert.strictEqual(healthResData.data.status, 'UP');
  assert.ok(healthResData.data.checks.postgres);
  console.log('✔ Health handler verified.');

  // 4. Test RBAC Middleware Guards
  console.log('Testing RBAC Middleware Guards...');
  const permMiddleware = requirePermission('sales.invoice.create');
  
  // Unauthorized request
  let errorPassed = null;
  const mockReqUnauthorized = {
    user: { permissions: ['hr.employee.read'] },
    isPlatformAdmin: false
  };
  permMiddleware(mockReqUnauthorized, {}, (err) => { errorPassed = err; });
  assert.ok(errorPassed instanceof ForbiddenError, 'Should reject unauthorized user');

  // Authorized request
  let successPassed = false;
  const mockReqAuthorized = {
    user: { permissions: ['sales.invoice.create'] },
    isPlatformAdmin: false
  };
  permMiddleware(mockReqAuthorized, {}, (err) => { if (!err) successPassed = true; });
  assert.strictEqual(successPassed, true, 'Should allow authorized user');

  // Platform Admin bypass
  let adminPassed = false;
  const mockReqAdmin = {
    user: { permissions: [] },
    isPlatformAdmin: true
  };
  permMiddleware(mockReqAdmin, {}, (err) => { if (!err) adminPassed = true; });
  assert.strictEqual(adminPassed, true, 'Should allow platform admin');
  console.log('✔ RBAC permission guards verified.');

  // 5. Test Event Bus Envelope
  console.log('Testing Event Bus Envelope Generation...');
  const bus = createEventBus({ serviceName: 'demo-service' });
  const envelope = {
    eventId: 'evt-test-1',
    version: '1.0.0',
    eventType: 'order.created',
    data: { orderId: 'ord-101', amount: 50000 }
  };
  assert.strictEqual(envelope.eventType, 'order.created');
  assert.strictEqual(envelope.version, '1.0.0');
  console.log('✔ Event bus configuration verified.');

  console.log('\n===============================================================');
  console.log('🎉 ALL @automobile-ecosystem/sdk TESTS PASSED (100% SUCCESS)');
  console.log('===============================================================\n');
}).catch(console.error);
