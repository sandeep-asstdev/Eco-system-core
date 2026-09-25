import prisma from '../src/config/db.js';

async function backfill() {
  await prisma.application.updateMany({
    where: { appKey: 'hrflow' },
    data: {
      code: 'HRFLOW',
      apiVersion: 'v1',
      capabilities: ['sso', 'multi_branch', 'outbox_publishing', 'indian_payroll'],
      requiredPermissions: ['hr.employee.read', 'hrflow.employee.view'],
      supportedEvents: ['employee.created', 'employee.updated', 'employee.transferred', 'employee.deactivated', 'employee.reactivated'],
      status: 'ACTIVE',
      isPublic: true
    }
  });

  await prisma.application.updateMany({
    where: { appKey: 'maintly' },
    data: {
      code: 'MAINTLY',
      apiVersion: 'v1',
      capabilities: ['sso', 'multi_branch', 'event_consumer', 'equipment_lifecycle'],
      requiredPermissions: ['maintenance.ticket.create', 'maintenance.ticket.read', 'maintly.ticket.create'],
      supportedEvents: ['maintenance.ticket.created'],
      status: 'ACTIVE',
      isPublic: true
    }
  });

  console.log('✔ Applications updated with dynamic registry metadata.');
  process.exit(0);
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
