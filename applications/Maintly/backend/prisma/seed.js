import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting MAINTLY Multi-Tenant Database Seed on PostgreSQL 18...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.maintenanceRequestAttachment.deleteMany();
  await prisma.maintenanceRequestMaterial.deleteMany();
  await prisma.maintenanceRequestComment.deleteMany();
  await prisma.maintenanceRequestStatusHistory.deleteMany();
  await prisma.maintenanceRequestAssignment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.maintenanceType.deleteMany();
  await prisma.userBranchAccess.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branchArea.deleteMany();
  await prisma.branchDepartment.deleteMany();
  await prisma.department.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.tenant.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // ==============================================================
  // TENANT 1: BELLAD & GROUPS (INITIAL PRIMARY TENANT)
  // ==============================================================
  const belladTenant = await prisma.tenant.create({
    data: {
      name: 'Bellad & Groups',
      slug: 'bellad-groups',
      code: 'BELLAD',
      timezone: 'Asia/Kolkata',
      requestPrefix: 'BELL-MAIN',
      graceHours: 12.0,
      targetHoursHigh: 24.0,
      targetHoursMedium: 48.0,
      targetHoursLow: 72.0,
      approvalRequired: true,
      status: 'ACTIVE'
    }
  });

  // ==============================================================
  // TENANT 2: OMNILOGISTICS (SECONDARY TENANT FOR ISOLATION)
  // ==============================================================
  const omniTenant = await prisma.tenant.create({
    data: {
      name: 'OmniLogistics Supply Chain Ltd',
      slug: 'omni-logistics',
      code: 'OMNI',
      timezone: 'Asia/Kolkata',
      requestPrefix: 'OMNI-MNT',
      graceHours: 6.0,
      targetHoursHigh: 12.0,
      targetHoursMedium: 24.0,
      targetHoursLow: 48.0,
      approvalRequired: false, // Procedure without approval requirement to demonstrate flexibility!
      status: 'ACTIVE'
    }
  });

  console.log(`[SEED] Created Tenants: ${belladTenant.name} & ${omniTenant.name}`);

  // ==============================================================
  // BELLAD & GROUPS: BRANDS (17 Initial Brands)
  // ==============================================================
  const belladBrandNames = [
    { name: 'Ather Energy', code: 'ATHER' },
    { name: 'Ballad Used Cars', code: 'BUC' },
    { name: 'Back Office', code: 'BO' },
    { name: 'Beltech AI', code: 'BELTECH_AI' },
    { name: 'Chevrolet', code: 'CHEV' },
    { name: 'CNH Industrial India Pvt Ltd', code: 'CNH' },
    { name: 'CRM', code: 'CRM' },
    { name: 'Head Office', code: 'HO' },
    { name: 'Hero Moto Corp', code: 'HERO' },
    { name: 'Hyundai', code: 'HYUNDAI' },
    { name: 'MD Apartment', code: 'MD_APT' },
    { name: 'MD House', code: 'MD_HOUSE' },
    { name: 'MG Motors', code: 'MG' },
    { name: 'Sony', code: 'SONY' },
    { name: 'Swaraj', code: 'SWARAJ' },
    { name: 'Tata Motors', code: 'TATA' },
    { name: 'Warehouse', code: 'WH' }
  ];

  const belladBrands = {};
  for (const b of belladBrandNames) {
    belladBrands[b.name] = await prisma.brand.create({
      data: {
        tenantId: belladTenant.id,
        name: b.name,
        code: b.code,
        isActive: true
      }
    });
  }

  // ==============================================================
  // BELLAD & GROUPS: BRANCHES (37 Initial Branches)
  // ==============================================================
  const belladBranchData = [
    { name: 'Ather Bangalore', code: 'ATH-BLR', brand: 'Ather Energy', city: 'Bangalore' },
    { name: 'Ather Bommasandra Bangalore', code: 'ATH-BMS', brand: 'Ather Energy', city: 'Bangalore' },
    { name: 'Ather Energy Hubli', code: 'ATH-HBL', brand: 'Ather Energy', city: 'Hubli' },
    { name: 'Ather Energy Belgaum', code: 'ATH-BGM', brand: 'Ather Energy', city: 'Belgaum' },
    { name: 'Back Office Hubli', code: 'BO-HBL', brand: 'Back Office', city: 'Hubli' },
    { name: 'Beltech Bangalore', code: 'BEL-BLR', brand: 'Beltech AI', city: 'Bangalore' },
    { name: 'Beltech Goa', code: 'BEL-GOA', brand: 'Beltech AI', city: 'Goa' },
    { name: 'Beltech Hubli', code: 'BEL-HBL', brand: 'Beltech AI', city: 'Hubli' },
    { name: 'Chevrolet Belgaum', code: 'CHV-BGM', brand: 'Chevrolet', city: 'Belgaum' },
    { name: 'CNH Hubli', code: 'CNH-HBL', brand: 'CNH Industrial India Pvt Ltd', city: 'Hubli' },
    { name: 'CRM Hubli', code: 'CRM-HBL', brand: 'CRM', city: 'Hubli' },
    { name: 'D7D', code: 'D7D-HBL', brand: 'Head Office', city: 'Hubli' },
    { name: 'Gabbur Hubli', code: 'GBR-HBL', brand: 'Head Office', city: 'Hubli' },
    { name: 'Head Office Hubli', code: 'HO-HBL', brand: 'Head Office', city: 'Hubli' },
    { name: 'Hero MotoCorp Dharwad', code: 'HERO-DWD', brand: 'Hero Moto Corp', city: 'Dharwad' },
    { name: 'Hero MotoCorp Hubli', code: 'HERO-HBL', brand: 'Hero Moto Corp', city: 'Hubli' },
    { name: 'Hyundai Hubli', code: 'HYN-HBL', brand: 'Hyundai', city: 'Hubli' },
    { name: 'Hyundai Dharwad', code: 'HYN-DWD', brand: 'Hyundai', city: 'Dharwad' },
    { name: 'Hyundai Gadag', code: 'HYN-GDG', brand: 'Hyundai', city: 'Gadag' },
    { name: 'Hyundai Haveri', code: 'HYN-HVR', brand: 'Hyundai', city: 'Haveri' },
    { name: 'MD Department Bangalore', code: 'MD-DEPT-BLR', brand: 'MD Apartment', city: 'Bangalore' },
    { name: 'MD House Bangalore', code: 'MD-HSE-BLR', brand: 'MD House', city: 'Bangalore' },
    { name: 'MD House Hubli', code: 'MD-HSE-HBL', brand: 'MD House', city: 'Hubli' },
    { name: 'MG Motors Belgaum', code: 'MG-BGM', brand: 'MG Motors', city: 'Belgaum' },
    { name: 'MG Motors Gulbarga', code: 'MG-GLB', brand: 'MG Motors', city: 'Gulbarga' },
    { name: 'MG Motors Hubli', code: 'MG-HBL', brand: 'MG Motors', city: 'Hubli' },
    { name: 'Sony Hubli', code: 'SNY-HBL', brand: 'Sony', city: 'Hubli' },
    { name: 'Swaraj Hubli', code: 'SWR-HBL', brand: 'Swaraj', city: 'Hubli' },
    { name: 'Tata Motors Bellary', code: 'TATA-BLY', brand: 'Tata Motors', city: 'Bellary' },
    { name: 'Tata Motors Bommasandra Bangalore', code: 'TATA-BMS', brand: 'Tata Motors', city: 'Bangalore' },
    { name: 'Tata Motors Gangavathi', code: 'TATA-GGV', brand: 'Tata Motors', city: 'Gangavathi' },
    { name: 'Tata Motors Hospet', code: 'TATA-HSP', brand: 'Tata Motors', city: 'Hospet' },
    { name: 'Tata Motors Koppal', code: 'TATA-KPL', brand: 'Tata Motors', city: 'Koppal' },
    { name: 'Tata Motors Raichur', code: 'TATA-RCR', brand: 'Tata Motors', city: 'Raichur' },
    { name: 'Tata Motors Sarjapur Bangalore', code: 'TATA-SJP', brand: 'Tata Motors', city: 'Bangalore' },
    { name: 'Tata Motors Sarjapur Workshop', code: 'TATA-SJP-WK', brand: 'Tata Motors', city: 'Bangalore' },
    { name: 'Used Cars', code: 'UC-HBL', brand: 'Ballad Used Cars', city: 'Hubli' }
  ];

  const belladBranches = {};
  for (const br of belladBranchData) {
    const brand = belladBrands[br.brand];
    belladBranches[br.name] = await prisma.branch.create({
      data: {
        tenantId: belladTenant.id,
        brandId: brand ? brand.id : null,
        name: br.name,
        code: br.code,
        city: br.city,
        state: 'Karnataka',
        isActive: true
      }
    });
  }

  // ==============================================================
  // BELLAD & GROUPS: DEPARTMENTS (32 Initial Departments)
  // ==============================================================
  const belladDeptNames = [
    { name: 'Accessories', code: 'ACC' },
    { name: 'Accounts', code: 'ACCT' },
    { name: 'Admin', code: 'ADM' },
    { name: 'Amargol Layout', code: 'AML' },
    { name: 'Auditor', code: 'AUD' },
    { name: 'Back Office', code: 'BO' },
    { name: 'Belligatti Farmhouse', code: 'BFH' },
    { name: 'Beltech AI', code: 'BAI' },
    { name: 'Beltech Goa', code: 'BGOA' },
    { name: 'Bodyshop', code: 'BSH' },
    { name: 'CRM', code: 'CRM' },
    { name: 'Dharwad Home', code: 'DHD' },
    { name: 'Hubli Home', code: 'HBH' },
    { name: 'Hubli Residence', code: 'HBR' },
    { name: 'IT', code: 'IT' },
    { name: 'Mahogany Apartment Bangalore', code: 'MAB' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Other', code: 'OTH' },
    { name: 'Real Estate', code: 'RE' },
    { name: 'Sales', code: 'SLS' },
    { name: 'Sale / Service / Spares', code: 'SSS' },
    { name: 'Service', code: 'SRV' },
    { name: 'Service and Sales', code: 'SNS' },
    { name: 'Showroom', code: 'SHW' },
    { name: 'Sony', code: 'SNY' },
    { name: 'Spares', code: 'SPR' },
    { name: 'Stockyard', code: 'SYD' },
    { name: 'Taxation', code: 'TAX' },
    { name: 'Taxation Department', code: 'TXD' },
    { name: 'Warehouse', code: 'WH' },
    { name: 'Workshop', code: 'WKP' },
    { name: 'Workshop Expense', code: 'WKE' }
  ];

  const belladDepts = {};
  for (const d of belladDeptNames) {
    belladDepts[d.name] = await prisma.department.create({
      data: {
        tenantId: belladTenant.id,
        name: d.name,
        code: d.code,
        isActive: true
      }
    });
  }

  // ==============================================================
  // BRANCH-DEPARTMENT MAPPINGS & BRANCH AREAS (Section 6 & 13)
  // ==============================================================
  // Map relevant departments to key branches
  const workshopBranch = belladBranches['Tata Motors Sarjapur Workshop'];
  const showroomBranch = belladBranches['Tata Motors Sarjapur Bangalore'];
  const headOfficeBranch = belladBranches['Head Office Hubli'];

  const workshopDeptNames = ['Workshop', 'Spares', 'Bodyshop', 'Service', 'Accounts'];
  for (const dName of workshopDeptNames) {
    if (belladDepts[dName] && workshopBranch) {
      await prisma.branchDepartment.create({
        data: {
          tenantId: belladTenant.id,
          branchId: workshopBranch.id,
          departmentId: belladDepts[dName].id
        }
      });
    }
  }

  const showroomDeptNames = ['Showroom', 'Sales', 'Accessories', 'Accounts', 'CRM'];
  for (const dName of showroomDeptNames) {
    if (belladDepts[dName] && showroomBranch) {
      await prisma.branchDepartment.create({
        data: {
          tenantId: belladTenant.id,
          branchId: showroomBranch.id,
          departmentId: belladDepts[dName].id
        }
      });
    }
  }

  // Configurable Branch Areas for Workshop Branch
  const sarjapurWorkshopAreas = [
    { name: 'Mechanical Bay 1-4', code: 'BAY-MECH' },
    { name: 'Paint & Bodyshop Booth', code: 'BOOTH-PAINT' },
    { name: 'Customer Lounge', code: 'LOUNGE' },
    { name: 'Spare Parts Inventory Room', code: 'SPARE-STORE' },
    { name: 'Washing & Detailing Area', code: 'WASH-BAY' }
  ];

  const sarjapurAreasMap = {};
  for (const a of sarjapurWorkshopAreas) {
    sarjapurAreasMap[a.name] = await prisma.branchArea.create({
      data: {
        tenantId: belladTenant.id,
        branchId: workshopBranch.id,
        name: a.name,
        code: a.code,
        isActive: true
      }
    });
  }

  // Configurable Branch Areas for Head Office Branch
  const hoAreas = [
    { name: 'Executive Suite Floor 3', code: 'HO-EXEC' },
    { name: 'Accounts & Finance Wing', code: 'HO-ACCT' },
    { name: 'Server & IT Network Hub', code: 'HO-IT' },
    { name: 'Main Conference Hall', code: 'HO-CONF' }
  ];
  for (const a of hoAreas) {
    await prisma.branchArea.create({
      data: {
        tenantId: belladTenant.id,
        branchId: headOfficeBranch.id,
        name: a.name,
        code: a.code,
        isActive: true
      }
    });
  }

  // ==============================================================
  // BELLAD: TYPE OF WORK (10 Initial Types from Section 7)
  // ==============================================================
  const belladWorkTypes = [
    { name: 'Carpentry', code: 'CARP', icon: 'Hammer', color: '#d97706', sortOrder: 1 },
    { name: 'Civil', code: 'CIVIL', icon: 'HardHat', color: '#ea580c', sortOrder: 2 },
    { name: 'Electrical', code: 'ELEC', icon: 'Zap', color: '#eab308', sortOrder: 3 },
    { name: 'IT', code: 'IT', icon: 'Laptop', color: '#2563eb', sortOrder: 4 },
    { name: 'New Construction', code: 'CONST', icon: 'Building', color: '#6366f1', sortOrder: 5 },
    { name: 'Other', code: 'OTHER', icon: 'HelpCircle', color: '#64748b', sortOrder: 6 },
    { name: 'Plumbing', code: 'PLUMB', icon: 'Droplet', color: '#06b6d4', sortOrder: 7 },
    { name: 'Printing', code: 'PRINT', icon: 'Printer', color: '#8b5cf6', sortOrder: 8 },
    { name: 'Purchase', code: 'PURCH', icon: 'ShoppingCart', color: '#10b981', sortOrder: 9 },
    { name: 'Vendor Payment', code: 'VPAY', icon: 'CreditCard', color: '#ec4899', sortOrder: 10 }
  ];

  const belladTypes = {};
  for (const t of belladWorkTypes) {
    belladTypes[t.name] = await prisma.maintenanceType.create({
      data: {
        tenantId: belladTenant.id,
        name: t.name,
        code: t.code,
        icon: t.icon,
        color: t.color,
        sortOrder: t.sortOrder,
        isActive: true
      }
    });
  }

  // ==============================================================
  // BELLAD: USERS (Across all 7 roles)
  // ==============================================================
  const belladPlatformAdmin = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'platformadmin@maintly.com',
      passwordHash,
      firstName: 'Vikram',
      lastName: 'Singhania',
      role: 'PLATFORM_ADMIN',
      phone: '+91 9820011111'
    }
  });

  const belladTenantAdmin = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'admin@bellad.com',
      passwordHash,
      firstName: 'Sandeep',
      lastName: 'Bellad',
      role: 'TENANT_ADMIN',
      phone: '+91 9845012345'
    }
  });

  const belladManager = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'manager@bellad.com',
      passwordHash,
      firstName: 'Praveen',
      lastName: 'Kulkarni',
      role: 'MANAGER',
      phone: '+91 9845023456'
    }
  });

  const belladApprover = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'approver@bellad.com',
      passwordHash,
      firstName: 'Anil',
      lastName: 'Deshpande',
      role: 'APPROVER',
      phone: '+91 9845034567'
    }
  });

  const belladTechnician = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'technician@bellad.com',
      passwordHash,
      firstName: 'Ramesh',
      lastName: 'Pawar',
      role: 'MAINTENANCE_USER',
      phone: '+91 9845045678'
    }
  });

  const belladPurchase = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'purchase@bellad.com',
      passwordHash,
      firstName: 'Sunil',
      lastName: 'Joshi',
      role: 'PURCHASE_USER',
      phone: '+91 9845056789'
    }
  });

  const belladEmployee = await prisma.user.create({
    data: {
      tenantId: belladTenant.id,
      email: 'employee@bellad.com',
      passwordHash,
      firstName: 'Mahesh',
      lastName: 'Hiremath',
      role: 'EMPLOYEE',
      phone: '+91 9845067890'
    }
  });

  // Assign branch access for Bellad users
  const allBelladBranches = Object.values(belladBranches);
  for (const b of allBelladBranches) {
    await prisma.userBranchAccess.createMany({
      data: [
        { userId: belladTenantAdmin.id, branchId: b.id, isPrimary: b.name.includes('Head Office') },
        { userId: belladManager.id, branchId: b.id, isPrimary: b.name.includes('Workshop') },
        { userId: belladApprover.id, branchId: b.id, isPrimary: b.name.includes('Head Office') },
        { userId: belladTechnician.id, branchId: b.id, isPrimary: b.name.includes('Workshop') },
        { userId: belladPurchase.id, branchId: b.id, isPrimary: b.name.includes('Head Office') },
        { userId: belladEmployee.id, branchId: b.id, isPrimary: b.name.includes('Workshop') }
      ]
    });
  }

  // ==============================================================
  // BELLAD: VENDORS
  // ==============================================================
  const vendorElectrical = await prisma.vendor.create({
    data: {
      tenantId: belladTenant.id,
      name: 'Hubli Industrial Electricals',
      contactPerson: 'Kishore Patil',
      phone: '+91 9844012345',
      email: 'sales@hublielectricals.com',
      category: 'Electrical Supplies'
    }
  });

  const vendorCivil = await prisma.vendor.create({
    data: {
      tenantId: belladTenant.id,
      name: 'Karnataka Building Solutions',
      contactPerson: 'Suresh Angadi',
      phone: '+91 9844067890',
      email: 'orders@karnatakabuilding.com',
      category: 'Civil & Flooring'
    }
  });

  // ==============================================================
  // BELLAD: SAMPLE MAINTENANCE REQUESTS (Covering all 43 fields & views)
  // ==============================================================
  const now = new Date();
  const past2Hours = new Date(now.getTime() - 2 * 3600000);
  const past20Hours = new Date(now.getTime() - 20 * 3600000);
  const past65Hours = new Date(now.getTime() - 65 * 3600000); // Past 48h target + 12h grace -> OVERDUE

  // 1. High Priority Overdue Task (Breached 48h target + 12h grace = 60h)
  const reqOverdue = await prisma.maintenanceRequest.create({
    data: {
      requestNumber: 'BELL-MAIN-2026-000001',
      tenantId: belladTenant.id,
      brandId: belladBrands['Tata Motors'].id,
      branchId: workshopBranch.id,
      departmentId: belladDepts['Workshop'].id,
      branchAreaId: sarjapurAreasMap['Mechanical Bay 1-4']?.id || null,
      areaInBranch: 'Mechanical Bay 1-4',
      maintenanceTypeId: belladTypes['Electrical'].id,
      requesterId: belladEmployee.id,
      requesterContact: '+91 9845067890',
      priority: 'HIGH',
      location: 'Tata Motors Sarjapur Workshop - Mechanical Bay 2',
      subject: 'Hydraulic Car Lift 3-Phase Power Panel Short Circuit',
      description: 'Main 415V supply contactor tripped with sparking. 2 hydraulic lifts inoperable. Urgent replacement of 32A MCB required.',
      requiredDate: new Date(past65Hours.getTime() + 24 * 3600000),
      deadline: new Date(past65Hours.getTime() + 24 * 3600000),
      targetHours: 24.0,
      graceHours: 12.0,
      approvalStatus: 'APPROVED',
      approvedById: belladApprover.id,
      approvedAt: new Date(past65Hours.getTime() + 1 * 3600000),
      assignedToId: belladTechnician.id,
      assignedById: belladManager.id,
      assignedAt: new Date(past65Hours.getTime() + 2 * 3600000),
      timeToAssignMinutes: 120,
      assignedToContact: '+91 9845045678',
      managerContact: '+91 9845023456',
      actionPlan: '1. Isolate main feeder\n2. Inspect Schneider contactor\n3. Replace burnt terminals\n4. Load test under 30A current',
      branchStatus: 'OPEN',
      workStatus: 'IN_PROGRESS',
      currentStatus: 'IN_PROGRESS',
      correctionDone: 'IN_PROGRESS',
      checkedOff: false, // Flagged for attention!
      branchRemarks: 'Urgent task - affecting morning customer delivery throughput.',
      createdAt: past65Hours
    }
  });

  await prisma.maintenanceRequestStatusHistory.createMany({
    data: [
      { tenantId: belladTenant.id, requestId: reqOverdue.id, fromStatus: null, toStatus: 'WAITING_FOR_APPROVAL', changedById: belladEmployee.id, createdAt: past65Hours, remarks: 'Request raised.' },
      { tenantId: belladTenant.id, requestId: reqOverdue.id, fromStatus: 'WAITING_FOR_APPROVAL', toStatus: 'APPROVED', changedById: belladApprover.id, createdAt: new Date(past65Hours.getTime() + 3600000), remarks: 'Approved by Branch Manager.' },
      { tenantId: belladTenant.id, requestId: reqOverdue.id, fromStatus: 'APPROVED', toStatus: 'ASSIGNED', changedById: belladManager.id, createdAt: new Date(past65Hours.getTime() + 7200000), remarks: 'Assigned to Senior Electrical Technician.' },
      { tenantId: belladTenant.id, requestId: reqOverdue.id, fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', changedById: belladTechnician.id, createdAt: new Date(past65Hours.getTime() + 10800000), remarks: 'Parts isolated. Waiting on 32A replacement contactor.' }
    ]
  });

  // 2. Waiting for Approval Request
  const reqApproval = await prisma.maintenanceRequest.create({
    data: {
      requestNumber: 'BELL-MAIN-2026-000002',
      tenantId: belladTenant.id,
      brandId: belladBrands['Hero Moto Corp'].id,
      branchId: belladBranches['Hero MotoCorp Hubli'].id,
      departmentId: belladDepts['Showroom'].id,
      maintenanceTypeId: belladTypes['Civil'].id,
      requesterId: belladEmployee.id,
      requesterContact: '+91 9845067890',
      priority: 'MEDIUM',
      location: 'Hero MotoCorp Hubli - Customer Lounge',
      subject: 'Entrance Glass Sliding Door Sensor Malfunction',
      description: 'Automatic motion sensor not detecting customers. Door remains closed or sticks midway.',
      requiredDate: new Date(now.getTime() + 48 * 3600000),
      deadline: new Date(now.getTime() + 48 * 3600000),
      targetHours: 48.0,
      graceHours: 12.0,
      approvalStatus: 'PENDING',
      workStatus: 'WAITING_FOR_APPROVAL',
      currentStatus: 'WAITING_FOR_APPROVAL',
      correctionDone: 'NOT_STARTED',
      checkedOff: true,
      branchStatus: 'OPEN',
      createdAt: past2Hours
    }
  });

  // 3. Purchase Request Pending Requisition
  const reqPurchase = await prisma.maintenanceRequest.create({
    data: {
      requestNumber: 'BELL-MAIN-2026-000003',
      tenantId: belladTenant.id,
      brandId: belladBrands['Ather Energy'].id,
      branchId: belladBranches['Ather Bangalore'].id,
      departmentId: belladDepts['Service'].id,
      maintenanceTypeId: belladTypes['Purchase'].id,
      requesterId: belladEmployee.id,
      requesterContact: '+91 9845067890',
      priority: 'MEDIUM',
      location: 'Ather Bangalore Showroom - EV Fast Charging Bay',
      subject: 'Replacement Industrial Water Filter Cartridges for EV Wash Bay',
      description: 'High TDS level clogging pressure washer nozzle. Requisition of 4x Ro Cartridge sets required.',
      requiredDate: new Date(now.getTime() + 36 * 3600000),
      deadline: new Date(now.getTime() + 36 * 3600000),
      targetHours: 48.0,
      graceHours: 12.0,
      approvalStatus: 'APPROVED',
      approvedById: belladApprover.id,
      assignedToId: belladTechnician.id,
      assignedById: belladManager.id,
      workStatus: 'WAITING_FOR_PURCHASE',
      currentStatus: 'WAITING_FOR_PURCHASE',
      purchaseStatus: 'APPROVAL_PENDING',
      purchaseRemarks: 'Quotation received from Karnataka Water Tech for ₹18,500. Awaiting purchase order sign-off.',
      correctionDone: 'NOT_STARTED',
      checkedOff: true,
      createdAt: past20Hours
    }
  });

  // 4. Completed & Verified Request (Closed On Time)
  const past80Hours = new Date(now.getTime() - 80 * 3600000);
  const completed40HoursAgo = new Date(past80Hours.getTime() + 36 * 3600000); // 36 hours elapsed vs 48 target -> ON_TIME

  await prisma.maintenanceRequest.create({
    data: {
      requestNumber: 'BELL-MAIN-2026-000004',
      tenantId: belladTenant.id,
      brandId: belladBrands['Tata Motors'].id,
      branchId: showroomBranch.id,
      departmentId: belladDepts['Showroom'].id,
      maintenanceTypeId: belladTypes['Carpentry'].id,
      requesterId: belladEmployee.id,
      requesterContact: '+91 9845067890',
      priority: 'LOW',
      location: 'Tata Motors Sarjapur Showroom - Sales Reception',
      subject: 'Reception Desk Drawer Lock and Hinges Repair',
      description: 'Three key lock cylinders jammed. Replace drawer slides and install Godrej brass locks.',
      requiredDate: new Date(past80Hours.getTime() + 72 * 3600000),
      deadline: new Date(past80Hours.getTime() + 72 * 3600000),
      targetHours: 72.0,
      graceHours: 12.0,
      approvalStatus: 'APPROVED',
      approvedById: belladApprover.id,
      assignedToId: belladTechnician.id,
      assignedById: belladManager.id,
      assignedAt: new Date(past80Hours.getTime() + 4 * 3600000),
      timeToAssignMinutes: 240,
      startedAt: new Date(past80Hours.getTime() + 6 * 3600000),
      completedAt: completed40HoursAgo,
      closedAt: new Date(completed40HoursAgo.getTime() + 2 * 3600000),
      actualTimeHours: 36.0,
      differenceHours: -36.0,
      slaClassification: 'ON_TIME',
      workStatus: 'CLOSED',
      currentStatus: 'CLOSED',
      correctionDone: 'COMPLETED',
      correctionAt: completed40HoursAgo,
      checkedOff: true,
      isDissatisfied: false,
      completionRemarks: 'All 3 locks replaced and tested. Keys handed over to showroom reception head.',
      createdAt: past80Hours
    }
  });

  // 5. Reopened Dissatisfied Request
  const reqDissatisfied = await prisma.maintenanceRequest.create({
    data: {
      requestNumber: 'BELL-MAIN-2026-000005',
      tenantId: belladTenant.id,
      brandId: belladBrands['MG Motors'].id,
      branchId: belladBranches['MG Motors Hubli'].id,
      departmentId: belladDepts['Workshop'].id,
      maintenanceTypeId: belladTypes['Plumbing'].id,
      requesterId: belladEmployee.id,
      requesterContact: '+91 9845067890',
      priority: 'MEDIUM',
      location: 'MG Motors Hubli - Technician Washroom',
      subject: 'Main Drainage Pipe Leakage Behind Workshop Bay 4',
      description: 'Persistent greywater seep onto service floor creating slipping hazard.',
      requiredDate: new Date(now.getTime() + 24 * 3600000),
      deadline: new Date(now.getTime() + 24 * 3600000),
      targetHours: 48.0,
      graceHours: 12.0,
      approvalStatus: 'APPROVED',
      approvedById: belladApprover.id,
      assignedToId: belladTechnician.id,
      assignedById: belladManager.id,
      assignedAt: past20Hours,
      workStatus: 'REOPENED',
      currentStatus: 'REOPENED',
      correctionDone: 'NOT_STARTED',
      checkedOff: true,
      isDissatisfied: true,
      dissatisfactionReason: 'Pipe elbow was patched with silicone tape instead of replacing PVC coupling. Leakage started again within 2 hours.',
      dissatisfiedAt: past2Hours,
      dissatisfiedById: belladEmployee.id,
      createdAt: past20Hours
    }
  });

  // ==============================================================
  // TENANT 2: OMNILOGISTICS SEED (Verifies 100% Configurable Isolation)
  // ==============================================================
  const omniBrandFleet = await prisma.brand.create({
    data: {
      tenantId: omniTenant.id,
      name: 'OmniExpress Fleet',
      code: 'OMNI-FLT',
      isActive: true
    }
  });

  const omniBranchDepot = await prisma.branch.create({
    data: {
      tenantId: omniTenant.id,
      brandId: omniBrandFleet.id,
      name: 'Bhiwandi Central Mega Depot',
      code: 'BHW-01',
      city: 'Bhiwandi',
      state: 'Maharashtra',
      isActive: true
    }
  });

  const omniDeptFleet = await prisma.department.create({
    data: {
      tenantId: omniTenant.id,
      name: 'Heavy Fleet & Trailers',
      code: 'HFLT',
      isActive: true
    }
  });

  const omniWorkType = await prisma.maintenanceType.create({
    data: {
      tenantId: omniTenant.id,
      name: 'Dock Leveler & Hydraulics',
      code: 'DOCK-HYD',
      icon: 'Truck',
      color: '#0284c7',
      sortOrder: 1,
      isActive: true
    }
  });

  const omniAdmin = await prisma.user.create({
    data: {
      tenantId: omniTenant.id,
      email: 'admin@omnilogistics.com',
      passwordHash,
      firstName: 'Rajesh',
      lastName: 'Mehta',
      role: 'TENANT_ADMIN',
      phone: '+91 9988011223'
    }
  });

  await prisma.userBranchAccess.create({
    data: {
      userId: omniAdmin.id,
      branchId: omniBranchDepot.id,
      isPrimary: true
    }
  });

  // Create isolated Tenant B request
  await prisma.maintenanceRequest.create({
    data: {
      requestNumber: 'OMNI-MNT-2026-000001',
      tenantId: omniTenant.id,
      brandId: omniBrandFleet.id,
      branchId: omniBranchDepot.id,
      departmentId: omniDeptFleet.id,
      maintenanceTypeId: omniWorkType.id,
      requesterId: omniAdmin.id,
      priority: 'HIGH',
      location: 'Dock Bay 12 Hydraulic Ramp',
      subject: 'Heavy Cargo Ramp Hydraulic Cylinder Pressure Failure',
      description: '40ft container trailer unable to unload due to hydraulic pressure drop.',
      requiredDate: new Date(now.getTime() + 12 * 3600000),
      deadline: new Date(now.getTime() + 12 * 3600000),
      targetHours: 12.0,
      graceHours: 6.0,
      approvalStatus: 'NOT_REQUIRED', // Tenant B does not require approval
      workStatus: 'ASSIGNED',
      currentStatus: 'ASSIGNED',
      createdAt: now
    }
  });

  console.log('[SEED] Successfully seeded Bellad & Groups (Tenant #1) and OmniLogistics (Tenant #2) with full master data!');
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
