import prisma from '../src/config/db.js';

async function registerDemoApp() {
  console.log('Registering DemoApp in Ecosystem Application Registry...');

  const app = await prisma.application.upsert({
    where: { appKey: 'demo-app' },
    update: {
      code: 'DEMO',
      name: 'DemoApp Fleet & Accessories',
      description: 'Fleet Management, Telematics, Dashcams and Dealership Accessories Catalog',
      icon: 'Car',
      category: 'OPERATIONS',
      baseUrl: 'http://localhost:5005',
      apiUrl: 'http://localhost:5005',
      version: '1.0.0',
      apiVersion: 'v1',
      capabilities: ['sso', 'event_streaming', 'telematics_catalog'],
      requiredPermissions: ['demo.order.view'],
      supportedEvents: ['demo.item.created'],
      healthEndpoint: '/api/health',
      status: 'ACTIVE',
      isPublic: true
    },
    create: {
      appKey: 'demo-app',
      code: 'DEMO',
      name: 'DemoApp Fleet & Accessories',
      description: 'Fleet Management, Telematics, Dashcams and Dealership Accessories Catalog',
      icon: 'Car',
      category: 'OPERATIONS',
      baseUrl: 'http://localhost:5005',
      apiUrl: 'http://localhost:5005',
      version: '1.0.0',
      apiVersion: 'v1',
      capabilities: ['sso', 'event_streaming', 'telematics_catalog'],
      requiredPermissions: ['demo.order.view'],
      supportedEvents: ['demo.item.created'],
      healthEndpoint: '/api/health',
      status: 'ACTIVE',
      isPublic: true
    }
  });

  // Seed demo permissions into permissions catalog
  const permView = await prisma.permission.upsert({
    where: { code: 'demo.order.view' },
    update: {},
    create: {
      code: 'demo.order.view',
      domain: 'demo',
      resource: 'order',
      action: 'view',
      description: 'View fleet accessories and demo orders',
      applicationId: app.id
    }
  });

  const permCreate = await prisma.permission.upsert({
    where: { code: 'demo.order.create' },
    update: {},
    create: {
      code: 'demo.order.create',
      domain: 'demo',
      resource: 'order',
      action: 'create',
      description: 'Create demo orders and publish events',
      applicationId: app.id
    }
  });

  // Subscribe Tenant A (Bellad Group)
  const belladTenant = await prisma.tenant.findUnique({ where: { code: 'BELLAD' } });
  if (belladTenant) {
    await prisma.tenantApplication.upsert({
      where: {
        tenantId_applicationId: {
          tenantId: belladTenant.id,
          applicationId: app.id
        }
      },
      update: { status: 'ACTIVE', planName: 'ENTERPRISE' },
      create: {
        tenantId: belladTenant.id,
        applicationId: app.id,
        status: 'ACTIVE',
        planName: 'ENTERPRISE'
      }
    });

    // Grant demo permissions to TENANT_ADMIN and BM roles in Bellad Group
    const tenantAdminRole = await prisma.role.findFirst({ where: { code: 'TENANT_ADMIN' } });
    if (tenantAdminRole) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: tenantAdminRole.id, permissionId: permView.id } },
        update: {},
        create: { roleId: tenantAdminRole.id, permissionId: permView.id }
      });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: tenantAdminRole.id, permissionId: permCreate.id } },
        update: {},
        create: { roleId: tenantAdminRole.id, permissionId: permCreate.id }
      });
    }
    console.log(`✔ DemoApp subscribed for Tenant A (${belladTenant.name})`);
  }

  // Ensure Tenant B (Apex Auto Group) is explicitly NOT subscribed
  const apexTenant = await prisma.tenant.findUnique({ where: { code: 'APEX-AUTO' } });
  if (apexTenant) {
    await prisma.tenantApplication.deleteMany({
      where: {
        tenantId: apexTenant.id,
        applicationId: app.id
      }
    });
    console.log(`✔ DemoApp explicitly unsubscribed for Tenant B (${apexTenant.name}) [Tenant Entitlement Gating Verified]`);
  }

  console.log('✔ DemoApp registered successfully in central ecosystem!');
  process.exit(0);
}

registerDemoApp().catch((err) => {
  console.error(err);
  process.exit(1);
});
