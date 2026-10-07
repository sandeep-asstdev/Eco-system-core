import jwt from 'jsonwebtoken';
import prisma from '../src/config/db.js';
import { ENV } from '../src/config/env.js';

async function testApis() {
  const user = await prisma.user.findFirst({ where: { role: 'TENANT_ADMIN' } });
  if (!user) {
    console.error('No TENANT_ADMIN found');
    return;
  }
  const token = jwt.sign({
    userId: user.id,
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId
  }, ENV.JWT_SECRET);

  const headers = {
    'Authorization': 'Bearer ' + token,
    'x-tenant-id': user.tenantId
  };

  const endpoints = [
    '/api/assets',
    '/api/pm/plans',
    '/api/approvals/rules',
    '/api/intelligence/branch-comparison',
    '/api/intelligence/health-score',
    '/api/intelligence/heatmap',
    '/api/intelligence/repeat-failures',
    '/api/purchases',
    '/api/vendors',
    '/api/reports/summary',
    '/api/audit-logs',
    '/api/org/branches',
    '/api/notifications'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch('http://localhost:5002' + ep, { headers });
      const data = await res.json();
      console.log(ep, '-> HTTP', res.status, data.success !== undefined ? `success: ${data.success}` : `status: ${res.status}`);
    } catch (err) {
      console.log(ep, '-> ERROR', err.message);
    }
  }
}

testApis().finally(() => prisma.$disconnect());
