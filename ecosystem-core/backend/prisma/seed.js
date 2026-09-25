import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ecosystem Core Database Seed...');

  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

  // ==========================================
  // 1. REGISTER CORE APPLICATIONS
  // ==========================================
  console.log('Registering Applications...');
  const appHrflow = await prisma.application.upsert({
    where: { appKey: 'hrflow' },
    update: {},
    create: {
      appKey: 'hrflow',
      name: 'HRFlow HRMS & Payroll',
      description: 'Enterprise Human Resource Management, Indian Payroll & Compliance',
      baseUrl: 'http://localhost:3001',
      apiUrl: 'http://localhost:5001',
      version: '1.0.0',
      category: 'HR',
      icon: 'Users',
      healthEndpoint: '/api/health',
      isActive: true,
      settings: {
        themeColor: '#4f46e5',
        modules: ['employee-master', 'attendance', 'payroll', 'vacancies', 'joining', 'exit']
      }
    }
  });

  const appMaintly = await prisma.application.upsert({
    where: { appKey: 'maintly' },
    update: {},
    create: {
      appKey: 'maintly',
      name: 'MAINTLY Facility & Operations',
      description: 'Multi-Branch Maintenance, Equipment Lifecycle & SLA Management',
      baseUrl: 'http://localhost:3002',
      apiUrl: 'http://localhost:5002',
      version: '1.0.0',
      category: 'OPERATIONS',
      icon: 'Wrench',
      healthEndpoint: '/api/health',
      isActive: true,
      settings: {
        themeColor: '#2563eb',
        modules: ['requests', 'approvals', 'assignments', 'purchases', 'vendors', 'assets']
      }
    }
  });

  // ==========================================
  // 2. SEED GRANULAR PERMISSIONS
  // ==========================================
  console.log('Seeding Permissions Catalog...');
  const permissionDefs = [
    // Platform Governance
    { code: 'platform.tenant.manage', domain: 'platform', resource: 'tenant', action: 'manage', description: 'Onboard and configure dealer groups' },
    { code: 'platform.application.manage', domain: 'platform', resource: 'application', action: 'manage', description: 'Register and configure ecosystem apps' },
    { code: 'platform.telemetry.view', domain: 'platform', resource: 'telemetry', action: 'view', description: 'View system-wide telemetry and health' },
    
    // Organization Governance
    { code: 'org.tenant.update', domain: 'org', resource: 'tenant', action: 'update', description: 'Update dealership group details' },
    { code: 'org.firm.manage', domain: 'org', resource: 'firm', action: 'manage', description: 'Manage legal corporate entities' },
    { code: 'org.brand.manage', domain: 'org', resource: 'brand', action: 'manage', description: 'Manage OEM franchises and agreements' },
    { code: 'org.branch.manage', domain: 'org', resource: 'branch', action: 'manage', description: 'Manage physical outlets and facilities' },
    { code: 'org.department.manage', domain: 'org', resource: 'department', action: 'manage', description: 'Manage functional teams and bays' },
    { code: 'org.user.manage', domain: 'org', resource: 'user', action: 'manage', description: 'Manage central user accounts and roles' },
    { code: 'org.audit.view', domain: 'org', resource: 'audit', action: 'view', description: 'Inspect compliance audit trail' },

    // HRMS Domain
    { code: 'hr.employee.read', domain: 'hr', resource: 'employee', action: 'read', description: 'View employee records and org hierarchy', appId: appHrflow.id },
    { code: 'hr.employee.create', domain: 'hr', resource: 'employee', action: 'create', description: 'Onboard new candidates', appId: appHrflow.id },
    { code: 'hr.employee.update', domain: 'hr', resource: 'employee', action: 'update', description: 'Update employee records, KYC, salary', appId: appHrflow.id },
    { code: 'hr.leave.approve', domain: 'hr', resource: 'leave', action: 'approve', description: 'Approve employee leave applications', appId: appHrflow.id },
    { code: 'hr.attendance.punch', domain: 'hr', resource: 'attendance', action: 'punch', description: 'Punch biometric/mobile attendance', appId: appHrflow.id },
    { code: 'hr.attendance.correct', domain: 'hr', resource: 'attendance', action: 'correct', description: 'Approve attendance punch corrections', appId: appHrflow.id },
    { code: 'hr.payroll.process', domain: 'hr', resource: 'payroll', action: 'process', description: 'Run monthly payroll and tax calculations', appId: appHrflow.id },

    // Maintenance Domain
    { code: 'maintenance.ticket.create', domain: 'maintenance', resource: 'ticket', action: 'create', description: 'Raise maintenance or repair requests', appId: appMaintly.id },
    { code: 'maintenance.ticket.read', domain: 'maintenance', resource: 'ticket', action: 'read', description: 'View maintenance tickets', appId: appMaintly.id },
    { code: 'maintenance.ticket.approve', domain: 'maintenance', resource: 'ticket', action: 'approve', description: 'Approve maintenance expenditure and tickets', appId: appMaintly.id },
    { code: 'maintenance.ticket.assign', domain: 'maintenance', resource: 'ticket', action: 'assign', description: 'Assign work to technicians or vendors', appId: appMaintly.id },
    { code: 'maintenance.ticket.execute', domain: 'maintenance', resource: 'ticket', action: 'execute', description: 'Execute repair work and log materials', appId: appMaintly.id },
    { code: 'maintenance.purchase.request', domain: 'maintenance', resource: 'purchase', action: 'request', description: 'Raise purchase requests for spare parts', appId: appMaintly.id }
  ];

  const permissionsMap = {};
  for (const perm of permissionDefs) {
    const created = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: {
        code: perm.code,
        domain: perm.domain,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        applicationId: perm.appId || null
      }
    });
    permissionsMap[perm.code] = created.id;
  }

  // ==========================================
  // 3. SEED SYSTEM ROLES & ROLE-PERMISSIONS
  // ==========================================
  console.log('Seeding Standard Scoped Roles...');
  const roleDefs = [
    {
      code: 'PLATFORM_ADMIN',
      name: 'Platform Administrator',
      scopeType: 'GLOBAL',
      isSystem: true,
      description: 'Superuser access across the entire multi-tenant platform',
      permissions: Object.keys(permissionsMap)
    },
    {
      code: 'TENANT_ADMIN',
      name: 'Tenant Administrator',
      scopeType: 'TENANT',
      isSystem: true,
      description: 'Complete governance over a dealership group and all its firms/branches',
      permissions: [
        'org.tenant.update', 'org.firm.manage', 'org.brand.manage', 'org.branch.manage',
        'org.department.manage', 'org.user.manage', 'org.audit.view',
        'hr.employee.read', 'hr.employee.create', 'hr.employee.update', 'hr.payroll.process',
        'maintenance.ticket.create', 'maintenance.ticket.read', 'maintenance.ticket.approve', 'maintenance.ticket.assign'
      ]
    },
    {
      code: 'BRANCH_MANAGER',
      name: 'Branch General Manager',
      scopeType: 'BRANCH',
      isSystem: true,
      description: 'Operational manager for a specific physical branch or showroom/workshop',
      permissions: [
        'hr.employee.read', 'hr.leave.approve', 'hr.attendance.correct',
        'maintenance.ticket.create', 'maintenance.ticket.read', 'maintenance.ticket.approve',
        'maintenance.ticket.assign', 'maintenance.purchase.request'
      ]
    },
    {
      code: 'HR_OFFICER',
      name: 'Human Resources Officer',
      scopeType: 'TENANT',
      isSystem: true,
      description: 'Manages onboarding, attendance, leaves, and payroll records',
      permissions: [
        'hr.employee.read', 'hr.employee.create', 'hr.employee.update',
        'hr.leave.approve', 'hr.attendance.correct', 'hr.payroll.process'
      ]
    },
    {
      code: 'TECHNICIAN',
      name: 'Maintenance Technician',
      scopeType: 'BRANCH',
      isSystem: true,
      description: 'Executes repair work, logs materials, and updates ticket status',
      permissions: [
        'maintenance.ticket.read', 'maintenance.ticket.execute', 'maintenance.purchase.request'
      ]
    },
    {
      code: 'EMPLOYEE',
      name: 'Dealership Staff',
      scopeType: 'BRANCH',
      isSystem: true,
      description: 'Standard employee self-service',
      permissions: [
        'hr.employee.read', 'hr.attendance.punch',
        'maintenance.ticket.create', 'maintenance.ticket.read'
      ]
    }
  ];

  const rolesMap = {};
  for (const roleDef of roleDefs) {
    let role = await prisma.role.findFirst({
      where: { code: roleDef.code, tenantId: null }
    });
    if (!role) {
      role = await prisma.role.create({
        data: {
          code: roleDef.code,
          name: roleDef.name,
          scopeType: roleDef.scopeType,
          isSystem: roleDef.isSystem,
          description: roleDef.description
        }
      });
    }
    rolesMap[roleDef.code] = role.id;

    for (const permCode of roleDef.permissions) {
      if (permissionsMap[permCode]) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permissionsMap[permCode]
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permissionsMap[permCode]
          }
        });
      }
    }
  }

  // ==========================================
  // 4. SEED REFERENCE TENANTS (DEALER GROUPS)
  // ==========================================
  console.log('Seeding Reference Dealership Groups...');
  const belladTenant = await prisma.tenant.upsert({
    where: { code: 'BELLAD' },
    update: {},
    create: {
      code: 'BELLAD',
      name: 'Bellad Group',
      legalName: 'Bellad Enterprises Private Limited',
      status: 'ACTIVE',
      subscriptionTier: 'ENTERPRISE',
      primaryContact: 'Agastya Bellad',
      primaryEmail: 'info@belladgroup.com',
      primaryPhone: '+91 836 2488888',
      city: 'Hubli',
      state: 'Karnataka',
      country: 'India',
      timezone: 'Asia/Kolkata',
      currency: 'INR'
    }
  });

  const apexTenant = await prisma.tenant.upsert({
    where: { code: 'APEX' },
    update: {},
    create: {
      code: 'APEX',
      name: 'Apex Auto Group',
      legalName: 'Apex Automotive Network Private Limited',
      status: 'ACTIVE',
      subscriptionTier: 'ENTERPRISE',
      primaryContact: 'Vikram Malhotra',
      primaryEmail: 'admin@apexauto.in',
      primaryPhone: '+91 22 61234567',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    }
  });

  // Activate Subscriptions for Bellad Group
  await prisma.tenantApplication.upsert({
    where: { tenantId_applicationId: { tenantId: belladTenant.id, applicationId: appHrflow.id } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      applicationId: appHrflow.id,
      status: 'ACTIVE',
      planName: 'ENTERPRISE'
    }
  });

  await prisma.tenantApplication.upsert({
    where: { tenantId_applicationId: { tenantId: belladTenant.id, applicationId: appMaintly.id } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      applicationId: appMaintly.id,
      status: 'ACTIVE',
      planName: 'ENTERPRISE'
    }
  });

  // ==========================================
  // 5. SEED LEGAL FIRMS & OEM BRANDS
  // ==========================================
  console.log('Seeding Legal Firms & Brands...');
  const bmplFirm = await prisma.firm.upsert({
    where: { tenantId_code: { tenantId: belladTenant.id, code: 'BMPL' } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      code: 'BMPL',
      name: 'Bellad Motors Private Limited',
      panNumber: 'AABCB1234F',
      gstin: '29AABCB1234F1Z5',
      registeredAt: 'Karnataka'
    }
  });

  const ballpFirm = await prisma.firm.upsert({
    where: { tenantId_code: { tenantId: belladTenant.id, code: 'BALLP' } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      code: 'BALLP',
      name: 'Bellad Auto LLP',
      panNumber: 'AALFB5678K',
      gstin: '29AALFB5678K1ZA',
      registeredAt: 'Karnataka'
    }
  });

  const hyundaiBrand = await prisma.brand.upsert({
    where: { tenantId_code: { tenantId: belladTenant.id, code: 'HYUNDAI' } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      code: 'HYUNDAI',
      name: 'Hyundai Motor India Ltd',
      description: 'Passenger Car OEM Franchise'
    }
  });

  const toyotaBrand = await prisma.brand.upsert({
    where: { tenantId_code: { tenantId: belladTenant.id, code: 'TOYOTA' } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      code: 'TOYOTA',
      name: 'Toyota Kirloskar Motor',
      description: 'Passenger & Commercial Vehicle OEM Franchise'
    }
  });

  // Link Firms to Brands
  const fbHyundai = await prisma.firmBrand.upsert({
    where: { firmId_brandId: { firmId: bmplFirm.id, brandId: hyundaiBrand.id } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      firmId: bmplFirm.id,
      brandId: hyundaiBrand.id,
      dealerAgreementNo: 'DA-HYD-2024-001'
    }
  });

  const fbToyota = await prisma.firmBrand.upsert({
    where: { firmId_brandId: { firmId: ballpFirm.id, brandId: toyotaBrand.id } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      firmId: ballpFirm.id,
      brandId: toyotaBrand.id,
      dealerAgreementNo: 'DA-TOY-2023-088'
    }
  });

  // ==========================================
  // 6. SEED PHYSICAL BRANCHES & DEPARTMENTS
  // ==========================================
  console.log('Seeding Physical Branches...');
  const hubliBranch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: belladTenant.id, code: 'HBL-MAIN-01' } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      firmId: bmplFirm.id,
      firmBrandId: fbHyundai.id,
      code: 'HBL-MAIN-01',
      name: 'Hubli Main 3S Facility',
      outletType: '3S_FACILITY',
      address: 'Gokul Road, Industrial Area',
      city: 'Hubli',
      state: 'Karnataka',
      pincode: '580030',
      phone: '+91 836 2488888',
      email: 'hubli@belladmotors.com',
      active: true
    }
  });

  const belgaumBranch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: belladTenant.id, code: 'BGM-WKSHP-02' } },
    update: {},
    create: {
      tenantId: belladTenant.id,
      firmId: bmplFirm.id,
      firmBrandId: fbHyundai.id,
      code: 'BGM-WKSHP-02',
      name: 'Belgaum Workshop & Bodyshop',
      outletType: 'WORKSHOP',
      address: 'Khanapur Road, Udyambag',
      city: 'Belgaum',
      state: 'Karnataka',
      pincode: '590008',
      phone: '+91 831 2455555',
      active: true
    }
  });

  // Standard Departments
  const deptCodes = [
    { code: 'SALES', name: 'New Vehicle Sales' },
    { code: 'SERVICE', name: 'Mechanical Service' },
    { code: 'BODYSHOP', name: 'Body & Paint Repair' },
    { code: 'SPARES', name: 'Parts & Accessories' },
    { code: 'ACCOUNTS', name: 'Finance & Accounts' },
    { code: 'HR', name: 'Human Resources' }
  ];

  const deptsMap = {};
  for (const d of deptCodes) {
    const dept = await prisma.department.upsert({
      where: { tenantId_code_branchId: { tenantId: belladTenant.id, code: d.code, branchId: hubliBranch.id } },
      update: {},
      create: {
        tenantId: belladTenant.id,
        branchId: hubliBranch.id,
        code: d.code,
        name: d.name
      }
    });
    deptsMap[d.code] = dept.id;
  }

  // ==========================================
  // 7. SEED USERS & SCOPED ROLE ASSIGNMENTS
  // ==========================================
  console.log('Seeding Central Users...');

  // Global Platform Super Admin
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@ecosystem.com' },
    update: {},
    create: {
      email: 'admin@ecosystem.com',
      username: 'platform.admin',
      passwordHash: defaultPasswordHash,
      firstName: 'Platform',
      lastName: 'SuperAdmin',
      isPlatformAdmin: true,
      status: 'ACTIVE'
    }
  });

  // Bellad Group Managing Director
  const belladMD = await prisma.user.upsert({
    where: { email: 'md.bellad@belladgroup.com' },
    update: {},
    create: {
      tenantId: belladTenant.id,
      email: 'md.bellad@belladgroup.com',
      username: 'agastya.bellad',
      passwordHash: defaultPasswordHash,
      firstName: 'Agastya',
      lastName: 'Bellad',
      status: 'ACTIVE'
    }
  });

  async function assignRoleOnce(userId, roleId, tenantId, branchId = null, scopeType = 'TENANT') {
    const existing = await prisma.userRoleAssignment.findFirst({
      where: { userId, roleId, tenantId, branchId }
    });
    if (!existing) {
      await prisma.userRoleAssignment.create({
        data: { userId, roleId, tenantId, branchId, scopeType }
      });
    }
  }

  await assignRoleOnce(belladMD.id, rolesMap['TENANT_ADMIN'], belladTenant.id, null, 'TENANT');

  // Bellad Group HR Officer
  const belladHR = await prisma.user.upsert({
    where: { email: 'hr.bellad@belladgroup.com' },
    update: {},
    create: {
      tenantId: belladTenant.id,
      email: 'hr.bellad@belladgroup.com',
      username: 'hr.bellad',
      passwordHash: defaultPasswordHash,
      firstName: 'Pooja',
      lastName: 'Kulkarni',
      status: 'ACTIVE'
    }
  });

  await assignRoleOnce(belladHR.id, rolesMap['HR_OFFICER'], belladTenant.id, null, 'TENANT');

  // Hubli Branch Manager
  const hubliBM = await prisma.user.upsert({
    where: { email: 'bm.hubli@belladgroup.com' },
    update: {},
    create: {
      tenantId: belladTenant.id,
      email: 'bm.hubli@belladgroup.com',
      username: 'bm.hubli',
      passwordHash: defaultPasswordHash,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      status: 'ACTIVE'
    }
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_branchId_departmentId: {
        userId: hubliBM.id,
        branchId: hubliBranch.id,
        departmentId: deptsMap['SERVICE']
      }
    },
    update: {},
    create: {
      tenantId: belladTenant.id,
      userId: hubliBM.id,
      branchId: hubliBranch.id,
      departmentId: deptsMap['SERVICE'],
      isPrimary: true,
      employeeCode: 'BG-HBL-001',
      designation: 'General Manager - Branch Operations'
    }
  });

  await assignRoleOnce(hubliBM.id, rolesMap['BRANCH_MANAGER'], belladTenant.id, hubliBranch.id, 'BRANCH');

  // Hubli Technician
  const hubliTech = await prisma.user.upsert({
    where: { email: 'tech.hubli@belladgroup.com' },
    update: {},
    create: {
      tenantId: belladTenant.id,
      email: 'tech.hubli@belladgroup.com',
      username: 'tech.hubli',
      passwordHash: defaultPasswordHash,
      firstName: 'Suresh',
      lastName: 'Patil',
      status: 'ACTIVE'
    }
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_branchId_departmentId: {
        userId: hubliTech.id,
        branchId: hubliBranch.id,
        departmentId: deptsMap['SERVICE']
      }
    },
    update: {},
    create: {
      tenantId: belladTenant.id,
      userId: hubliTech.id,
      branchId: hubliBranch.id,
      departmentId: deptsMap['SERVICE'],
      isPrimary: true,
      employeeCode: 'BG-HBL-042',
      designation: 'Master Diagnostic Technician'
    }
  });

  await assignRoleOnce(hubliTech.id, rolesMap['TECHNICIAN'], belladTenant.id, hubliBranch.id, 'BRANCH');

  console.log('✅ Ecosystem Core Database seeded successfully with multi-tenant automotive groups!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
