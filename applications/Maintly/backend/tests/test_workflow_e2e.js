import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import prisma from '../src/config/db.js';
import { ENV } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5002';
const JWT_SECRET = ENV.JWT_SECRET;

function makeToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      branchIds: user.branchIds || []
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function run() {
  console.log('--- STARTING MAINTLY WORKFLOW & IMAGE E2E TEST ---');

  // Query real tenant, user, branch, dept from DB
  const tenant = await prisma.tenant.findFirst({
    where: { name: { contains: 'Bellad' } }
  });
  if (!tenant) throw new Error('Tenant Bellad & Groups not found in DB');
  const tenantId = tenant.id;

  const branch = await prisma.branch.findFirst({ where: { tenantId } });
  const dept = await prisma.department.findFirst({ where: { tenantId } });
  const type = await prisma.maintenanceType.findFirst({ where: { tenantId } });
  const managerUser = await prisma.user.findFirst({ where: { tenantId, role: 'MANAGER' } });
  const empUser = await prisma.user.findFirst({ where: { tenantId, role: 'EMPLOYEE' } });
  const adminUser = await prisma.user.findFirst({ where: { tenantId, role: 'TENANT_ADMIN' } });

  console.log(`Using Tenant: ${tenant.name} (${tenantId})`);
  console.log(`Branch: ${branch.name}, Dept: ${dept.name}, Type: ${type.name}`);
  console.log(`Requester: ${empUser.email}, Manager: ${managerUser.email}`);

  // 1x1 transparent PNG buffer
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

  // ==========================================
  // TEST 1: Requester -> New Request + Problem Image
  // ==========================================
  console.log('\n[TEST 1] Requester creates request with Problem Image...');
  const requesterToken = makeToken({
    id: empUser.id,
    email: empUser.email,
    role: empUser.role,
    tenantId,
    branchIds: [branch.id]
  });

  const form1 = new FormData();
  form1.append('branchId', branch.id);
  form1.append('departmentId', dept.id);
  form1.append('maintenanceTypeId', type.id);
  form1.append('location', 'Showroom Washroom');
  form1.append('subject', 'Water leakage in showroom washroom');
  form1.append('description', 'Severe water leakage from the ceiling washroom pipeline.');
  form1.append('priority', 'HIGH');
  form1.append('problemImages', new Blob([pngBuffer], { type: 'image/png' }), 'water_leakage_problem.png');

  const createRes = await fetch(`${BASE_URL}/api/maintenance/requests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${requesterToken}`,
      'x-tenant-id': tenantId
    },
    body: form1
  });

  const createData = await createRes.json();
  if (!createData.success) {
    throw new Error(`Failed to create request: ${JSON.stringify(createData)}`);
  }
  const requestId = createData.data.id;
  const requestNumber = createData.data.requestNumber;
  console.log(`✓ Request created: ${requestNumber} (ID: ${requestId})`);

  // Verify request details and problem image
  const get1Res = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}`, {
    headers: { 'Authorization': `Bearer ${requesterToken}`, 'x-tenant-id': tenantId }
  });
  const get1Data = await get1Res.json();
  console.log(`Problem images count: ${get1Data.data.problemImages?.length}`);
  if (!get1Data.data.problemImages || get1Data.data.problemImages.length === 0) {
    throw new Error('Problem image was not attached to request!');
  }
  const problemImageUrl = get1Data.data.problemImages[0].fileUrl;
  console.log(`Problem image URL: ${problemImageUrl}`);

  // Test downloading the image directly via HTTP GET
  const imgFetchRes = await fetch(`${BASE_URL}${problemImageUrl}`);
  console.log(`Image HTTP status: ${imgFetchRes.status}, Content-Type: ${imgFetchRes.headers.get('content-type')}`);
  if (imgFetchRes.status !== 200 || !imgFetchRes.headers.get('content-type').includes('image')) {
    throw new Error('Image URL failed to serve image correctly!');
  }
  console.log('✓ TEST 1 PASSED: Problem image successfully saved, retrieved, and served!');

  // ==========================================
  // TEST 2: Manager Approves & Assigns
  // ==========================================
  console.log('\n[TEST 2] Manager reviews problem image, Approves and Assigns to Person...');
  const managerToken = makeToken({
    id: managerUser.id,
    email: managerUser.email,
    role: managerUser.role,
    tenantId,
    branchIds: [branch.id]
  });

  const approveRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${managerToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assignedToId: empUser.id,
      assignedToContact: '9876543210',
      approvedCost: 6000,
      remarks: 'Approved for immediate plumbing repair work'
    })
  });
  const approveData = await approveRes.json();
  if (!approveData.success) {
    throw new Error(`Approve failed: ${JSON.stringify(approveData)}`);
  }
  console.log(`✓ Request approved and assigned to ${empUser.email}. Work status: ${approveData.data.workStatus}`);
  console.log('✓ TEST 2 PASSED!');

  // ==========================================
  // TEST 3: Assigned Person starts and completes work with Completion Image
  // ==========================================
  console.log('\n[TEST 3] Assigned Person starts work, completes, and uploads Completion Image...');
  const assignedToken = makeToken({
    id: empUser.id,
    email: empUser.email,
    role: empUser.role,
    tenantId,
    branchIds: [branch.id]
  });

  // 3a. In Progress
  const inProgressRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${assignedToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workStatus: 'IN_PROGRESS',
      remarks: 'Started plumbing pipe replacement'
    })
  });
  const inProgressData = await inProgressRes.json();
  if (!inProgressData.success) {
    throw new Error(`Status to IN_PROGRESS failed: ${JSON.stringify(inProgressData)}`);
  }
  console.log('✓ Work status updated to IN_PROGRESS');

  // 3b. Upload Completion Image
  const form2 = new FormData();
  form2.append('type', 'COMPLETION');
  form2.append('description', 'Solved: Pipe replaced and leak sealed');
  form2.append('images', new Blob([pngBuffer], { type: 'image/png' }), 'water_leakage_fixed.png');

  const compImgRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${assignedToken}`,
      'x-tenant-id': tenantId
    },
    body: form2
  });
  const compImgData = await compImgRes.json();
  if (!compImgData.success) {
    throw new Error(`Completion image upload failed: ${JSON.stringify(compImgData)}`);
  }
  console.log(`✓ Completion image uploaded: ${compImgData.data[0].fileUrl}`);

  // 3c. Mark Completed
  const completeRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${assignedToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workStatus: 'COMPLETED',
      completionRemarks: 'Pipeline joint replaced, leakage fully resolved and area cleaned.',
      actualCost: 5500
    })
  });
  const completeData = await completeRes.json();
  if (!completeData.success) {
    throw new Error(`Complete status failed: ${JSON.stringify(completeData)}`);
  }
  console.log('✓ Work status updated to COMPLETED');
  console.log('✓ TEST 3 PASSED!');

  // ==========================================
  // TEST 4: Finance / Payment User Records Invoice and Payment
  // ==========================================
  console.log('\n[TEST 4] Recording Invoice and Payment details...');
  const financeToken = makeToken({
    id: managerUser.id,
    email: managerUser.email,
    role: managerUser.role,
    tenantId,
    branchIds: [branch.id]
  });

  // 4a. Record Invoice
  const invoiceForm = new FormData();
  invoiceForm.append('invoiceNumber', 'INV-2026-0891');
  invoiceForm.append('invoiceDate', '2026-09-30');
  invoiceForm.append('invoiceAmount', '5500');
  invoiceForm.append('invoiceRemarks', 'Plumbing contractor final invoice');
  invoiceForm.append('invoiceFile', new Blob([pngBuffer], { type: 'application/pdf' }), 'plumbing_invoice.pdf');

  const invRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/invoice`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${financeToken}`,
      'x-tenant-id': tenantId
    },
    body: invoiceForm
  });
  const invData = await invRes.json();
  if (!invData.success) {
    throw new Error(`Record invoice failed: ${JSON.stringify(invData)}`);
  }
  console.log(`✓ Invoice recorded: ${invData.data.invoiceNumber}, Amount: ₹${invData.data.invoiceAmount}, PaymentStatus: ${invData.data.paymentStatus}`);

  // 4b. Record Payment
  const payForm = new FormData();
  payForm.append('paymentStatus', 'PAID');
  payForm.append('paymentDate', '2026-09-30');
  payForm.append('paymentAmount', '5500');
  payForm.append('paymentMethod', 'Bank Transfer (NEFT)');
  payForm.append('paymentRemarks', 'NEFT Ref #TXN998822 completed');
  payForm.append('paymentProofFile', new Blob([pngBuffer], { type: 'image/png' }), 'bank_receipt.png');

  const payRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/payment`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${financeToken}`,
      'x-tenant-id': tenantId
    },
    body: payForm
  });
  const payData = await payRes.json();
  if (!payData.success) {
    throw new Error(`Record payment failed: ${JSON.stringify(payData)}`);
  }
  console.log(`✓ Payment recorded: ${payData.data.paymentStatus}, Method: ${payData.data.paymentMethod}`);
  console.log('✓ TEST 4 PASSED!');

  // ==========================================
  // TEST 5: Close Request
  // ==========================================
  console.log('\n[TEST 5] Closing request...');
  const closeRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}/close`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${managerToken}`,
      'x-tenant-id': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      remarks: 'All repairs completed, verified satisfactory, and payment settled.'
    })
  });
  const closeData = await closeRes.json();
  if (!closeData.success) {
    throw new Error(`Close request failed: ${JSON.stringify(closeData)}`);
  }
  console.log(`✓ Request status closed: ${closeData.data.workStatus}`);
  console.log('✓ TEST 5 PASSED!');

  // ==========================================
  // TEST 6: Reopen and Verify Full Lifecycle History in Single Record
  // ==========================================
  console.log('\n[TEST 6] Re-fetching request to verify all images, invoice, payment & timeline persist...');
  const adminToken = makeToken({
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    tenantId,
    branchIds: [branch.id]
  });

  const finalRes = await fetch(`${BASE_URL}/api/maintenance/requests/${requestId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'x-tenant-id': tenantId
    }
  });
  const finalData = await finalRes.json();
  const reqObj = finalData.data;

  console.log(`Status: ${reqObj.workStatus}`);
  console.log(`Problem Images (${reqObj.problemImages.length}):`, reqObj.problemImages.map(i => i.fileUrl));
  console.log(`Completion Images (${reqObj.completionImages.length}):`, reqObj.completionImages.map(i => i.fileUrl));
  console.log(`Invoice:`, reqObj.invoice);
  console.log(`Payment:`, reqObj.payment);
  console.log(`Timeline entries count:`, reqObj.timeline.length);

  if (reqObj.workStatus !== 'CLOSED') throw new Error('Expected status to be CLOSED');
  if (reqObj.problemImages.length === 0) throw new Error('Missing problem images!');
  if (reqObj.completionImages.length === 0) throw new Error('Missing completion images!');
  if (!reqObj.invoice.number || !reqObj.invoice.url) throw new Error('Missing invoice details!');
  if (reqObj.payment.status !== 'PAID' || !reqObj.payment.proofUrl) throw new Error('Missing payment details!');
  if (reqObj.timeline.length < 5) throw new Error('Timeline history incomplete!');

  await prisma.$disconnect();

  console.log('\n======================================================');
  console.log('🎉 ALL 6 WORKFLOW AND IMAGE TESTS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('❌ E2E TEST FAILED:', err);
  prisma.$disconnect();
  process.exit(1);
});
