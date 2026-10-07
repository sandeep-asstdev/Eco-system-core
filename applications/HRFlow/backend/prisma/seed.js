const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { BELLAD_LEVELS, BELLAD_DESIGNATIONS } = require('./belladMastersData');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Multi-Tenant Seeding for HRFlow (PostgreSQL 18) ---');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.fnfRecord.deleteMany();
  await prisma.nocRecord.deleteMany();
  await prisma.resignation.deleteMany();
  await prisma.paymentAdvice.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.deduction.deleteMany();
  await prisma.payDay.deleteMany();
  await prisma.attendanceCorrection.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.salaryAdvance.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.joiningRecord.deleteMany();
  await prisma.manpowerBudget.deleteMany();
  await prisma.position.deleteMany();
  await prisma.employeeTransfer.deleteMany();
  await prisma.employeeDocument.deleteMany();
  await prisma.employeeAsset.deleteMany();
  await prisma.salaryHike.deleteMany();
  await prisma.employeeSalary.deleteMany();
  await prisma.employeeStatutory.deleteMany();
  await prisma.employeeKYC.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.employeeLevel.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Cleared all prior records.');

  // Common password hashes
  const adminHash = await bcrypt.hash('admin123456', 10);
  const hrHash = await bcrypt.hash('hr123456', 10);
  const bmHash = await bcrypt.hash('bm123456', 10);
  const empHash = await bcrypt.hash('emp123456', 10);

  // 1. Create Platform Admin (no tenant association)
  const platformAdmin = await prisma.user.create({
    data: {
      email: 'admin@hrflow.com',
      passwordHash: adminHash,
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Created Platform Admin: admin@hrflow.com');

  // ==========================================
  // TENANT A: Apex Auto Group (Dealer Group A)
  // ==========================================
  const tenantA = await prisma.tenant.create({
    data: {
      organizationName: 'Apex Auto Group',
      legalName: 'Apex Automotive Dealerships Private Limited',
      code: 'APEX-AUTO',
      logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=150',
      contactPhone: '+91 22 6123 4500',
      contactEmail: 'corporate@apexautogroup.com',
      address: 'Level 14, Platina Tower, Bandra Kurla Complex (BKC), Mumbai 400051',
      subscriptionPlan: 'ENTERPRISE',
      status: 'ACTIVE',
      settings: {
        workingDaysPerMonth: 30,
        salarySettings: {
          standardWorkingDays: 30,
          pfRate: 0.12,
          esiRate: 0.0075,
          esiThreshold: 21000,
        },
        attendanceRules: {
          gracePeriodMinutes: 15,
          halfDayHours: 4,
          fullDayHours: 8,
        },
        codeFormats: {
          employeeCodePrefix: 'APEX-',
          positionCodePrefix: 'POS-APEX-',
        },
      },
      features: {
        vacancies: true,
        joining: true,
        employees: true,
        payroll: true,
        advances: true,
        attendance: true,
        exit: true,
        approvals: true,
        reports: true,
        audit: true,
      },
    },
  });

  // Tenant A Branches
  const apexMumbai = await prisma.branch.create({
    data: {
      tenantId: tenantA.id,
      code: 'APEX-BOM',
      name: 'Mumbai Corporate HQ',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Level 14, Platina Tower, Bandra Kurla Complex (BKC), Mumbai 400051',
      phone: '+91 22 6123 4500',
      email: 'mumbai.hq@apexautogroup.com',
      active: true,
    },
  });

  const apexBangalore = await prisma.branch.create({
    data: {
      tenantId: tenantA.id,
      code: 'APEX-BLR',
      name: 'Bangalore Tech Park Showroom',
      city: 'Bengaluru',
      state: 'Karnataka',
      address: 'Block C, Embassy TechVillage, Outer Ring Road, Bengaluru 560103',
      phone: '+91 80 4123 7800',
      email: 'bangalore@apexautogroup.com',
      active: true,
    },
  });

  const apexDelhi = await prisma.branch.create({
    data: {
      tenantId: tenantA.id,
      code: 'APEX-DEL',
      name: 'Delhi NCR Hub',
      city: 'Gurugram',
      state: 'Haryana',
      address: 'Cyber City, Tower 10, DLF Phase 2, Gurugram 122002',
      phone: '+91 124 456 7890',
      email: 'delhi@apexautogroup.com',
      active: true,
    },
  });

  // Tenant A Users
  const hrAUser = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: 'hr@hrflow.com', // Retain original email for backward compatibility
      passwordHash: hrHash,
      role: 'HR',
      status: 'ACTIVE',
      branchId: apexMumbai.id,
    },
  });

  const bmMumbaiUser = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: 'bm.mumbai@hrflow.com',
      passwordHash: bmHash,
      role: 'BM',
      status: 'ACTIVE',
      branchId: apexMumbai.id,
    },
  });

  const bmBangaloreUser = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: 'bm.bangalore@hrflow.com',
      passwordHash: bmHash,
      role: 'BM',
      status: 'ACTIVE',
      branchId: apexBangalore.id,
    },
  });

  // Tenant A Levels & Designations
  const apexL1 = await prisma.employeeLevel.create({
    data: { tenantId: tenantA.id, levelNumber: 1, name: 'Entry Level', description: 'Associates and trainees' },
  });
  const apexL2 = await prisma.employeeLevel.create({
    data: { tenantId: tenantA.id, levelNumber: 2, name: 'Professional', description: 'Engineers and specialists' },
  });
  const apexL3 = await prisma.employeeLevel.create({
    data: { tenantId: tenantA.id, levelNumber: 3, name: 'Leadership', description: 'Managers and team leads' },
  });

  const apexDesigSE = await prisma.designation.create({
    data: { tenantId: tenantA.id, levelId: apexL2.id, name: 'Software Systems Engineer', code: 'APEX-ENG-01' },
  });
  const apexDesigSM = await prisma.designation.create({
    data: { tenantId: tenantA.id, levelId: apexL3.id, name: 'Service Manager', code: 'APEX-MGR-01' },
  });

  // Tenant A Employee 2: Priya Nair (Bangalore) - Manager
  const empPriya = await prisma.employee.create({
    data: {
      tenantId: tenantA.id,
      employeeCode: 'APEX-1002',
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'emp.priya@hrflow.com',
      phone: '+91 98450 67890',
      gender: 'Female',
      dob: new Date('1996-09-22'),
      bloodGroup: 'B+',
      maritalStatus: 'Single',
      branchId: apexBangalore.id,
      department: 'Service',
      designation: 'Service Manager',
      levelId: apexL3.id,
      designationId: apexDesigSM.id,
      dateOfJoining: new Date('2023-01-15'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: 'emp.priya@hrflow.com',
      passwordHash: empHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: empPriya.id,
      branchId: apexBangalore.id,
    },
  });

  await prisma.employeeSalary.create({
    data: {
      employeeId: empPriya.id,
      basic: 40000,
      hra: 20000,
      conveyance: 2500,
      specialAllowance: 12500,
      grossSalary: 75000,
    },
  });

  // Tenant A Employee 1: Rahul Sharma (Mumbai) - reports to Priya
  const empRahul = await prisma.employee.create({
    data: {
      tenantId: tenantA.id,
      employeeCode: 'APEX-1001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'emp.rahul@hrflow.com',
      phone: '+91 98201 12345',
      gender: 'Male',
      dob: new Date('1994-06-15'),
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      branchId: apexMumbai.id,
      department: 'Engineering',
      designation: 'Software Systems Engineer',
      levelId: apexL2.id,
      designationId: apexDesigSE.id,
      reportingManagerId: empPriya.id,
      dateOfJoining: new Date('2022-03-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: 'emp.rahul@hrflow.com',
      passwordHash: empHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: empRahul.id,
      branchId: apexMumbai.id,
    },
  });

  await prisma.employeeKYC.create({
    data: {
      employeeId: empRahul.id,
      aadhaarNumber: 'XXXX-XXXX-4521',
      panNumber: 'ABCPS1234K',
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0000060',
      branchName: 'BKC Branch Mumbai',
      verified: true,
    },
  });

  await prisma.employeeStatutory.create({
    data: {
      employeeId: empRahul.id,
      pfNumber: 'MH/BAN/0012345/000/0001001',
      uanNumber: '100904561234',
      esiNumber: '31000543210001001',
      pfApplicable: true,
      esiApplicable: false,
    },
  });

  await prisma.employeeSalary.create({
    data: {
      employeeId: empRahul.id,
      basic: 45000,
      hra: 22500,
      conveyance: 3000,
      specialAllowance: 14500,
      grossSalary: 85000,
    },
  });

  // Tenant A Positions & Budgets
  const posSalesApex = await prisma.position.create({
    data: {
      tenantId: tenantA.id,
      positionCode: 'POS-APEX-101',
      title: 'Senior Automobile Sales Consultant',
      department: 'Sales',
      branchId: apexMumbai.id,
      requiredCount: 2,
      status: 'OPEN',
      reasonForOpening: 'Showroom expansion',
    },
  });

  const posTechApex = await prisma.position.create({
    data: {
      tenantId: tenantA.id,
      positionCode: 'POS-APEX-102',
      title: 'Senior Diagnostic Technician',
      department: 'Service',
      branchId: apexBangalore.id,
      requiredCount: 1,
      status: 'OPEN',
      reasonForOpening: 'EV workshop certification requirement',
    },
  });

  await prisma.manpowerBudget.create({
    data: {
      tenantId: tenantA.id,
      branchId: apexMumbai.id,
      department: 'Engineering',
      financialYear: '2026-2027',
      sanctionedPositions: 5,
      budgetAmount: 5000000,
    },
  });

  // Tenant A Candidate for Joining Formalities (Vikram Malhotra)
  await prisma.joiningRecord.create({
    data: {
      tenantId: tenantA.id,
      candidateName: 'Vikram Malhotra',
      candidateEmail: 'vikram.candidate@apexauto.com',
      candidatePhone: '+91 99887 76655',
      positionId: posTechApex.id,
      branchId: apexBangalore.id,
      designation: 'Senior Diagnostic Technician',
      department: 'Service',
      joiningDate: new Date('2026-10-01'),
      token: 'join_vikram_apex_2026',
      status: 'PENDING',
    },
  });

  // Tenant A Operational Records (PayDays, Payroll, Advances)
  await prisma.payDay.create({
    data: {
      tenantId: tenantA.id,
      month: 9,
      year: 2026,
      employeeId: empRahul.id,
      totalWorkingDays: 30,
      presentDays: 28,
      paidLeaves: 2,
      lopDays: 0,
      payableDays: 30,
    },
  });

  await prisma.payDay.create({
    data: {
      tenantId: tenantA.id,
      month: 9,
      year: 2026,
      employeeId: empPriya.id,
      totalWorkingDays: 30,
      presentDays: 29,
      paidLeaves: 1,
      lopDays: 0,
      payableDays: 30,
    },
  });

  console.log('Seeded Tenant A: Apex Auto Group (Mumbai, Bangalore, Delhi)');

  // ==========================================
  // TENANT B: Zenith Motors Group (Dealer Group B)
  // ==========================================
  const tenantB = await prisma.tenant.create({
    data: {
      organizationName: 'Zenith Motors Group',
      legalName: 'Zenith Commercial Vehicles & Dealerships Ltd',
      code: 'ZENITH-MOTORS',
      logoUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150',
      contactPhone: '+91 20 4567 8900',
      contactEmail: 'contact@zenithmotors.com',
      address: 'ICC Tech Park, Senapati Bapat Road, Pune 411016',
      subscriptionPlan: 'PRO',
      status: 'ACTIVE',
      settings: {
        workingDaysPerMonth: 30,
        salarySettings: {
          standardWorkingDays: 30,
          pfRate: 0.12,
          esiRate: 0.0075,
          esiThreshold: 21000,
        },
        codeFormats: {
          employeeCodePrefix: 'ZEN-',
          positionCodePrefix: 'POS-ZEN-',
        },
      },
      features: {
        vacancies: true,
        joining: true,
        employees: true,
        payroll: true,
        advances: true,
        attendance: true,
        exit: true,
        approvals: true,
        reports: true,
        audit: true,
      },
    },
  });

  // Tenant B Branches
  const zenithPune = await prisma.branch.create({
    data: {
      tenantId: tenantB.id,
      code: 'ZEN-PUN',
      name: 'Pune Central Dealership',
      city: 'Pune',
      state: 'Maharashtra',
      address: 'ICC Tech Park, Tower A, Senapati Bapat Road, Pune 411016',
      phone: '+91 20 4567 8900',
      email: 'pune.dealership@zenithmotors.com',
      active: true,
    },
  });

  const zenithHyd = await prisma.branch.create({
    data: {
      tenantId: tenantB.id,
      code: 'ZEN-HYD',
      name: 'Hyderabad Auto Hub',
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Financial District, Nanakramguda, Hyderabad 500032',
      phone: '+91 40 8901 2345',
      email: 'hyderabad@zenithmotors.com',
      active: true,
    },
  });

  // Tenant B Users
  const hrZenithUser = await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      email: 'hr.zenith@hrflow.com',
      passwordHash: hrHash,
      role: 'HR',
      status: 'ACTIVE',
      branchId: zenithPune.id,
    },
  });

  const bmPuneUser = await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      email: 'bm.pune@hrflow.com',
      passwordHash: bmHash,
      role: 'BM',
      status: 'ACTIVE',
      branchId: zenithPune.id,
    },
  });

  // Tenant B Employee 1: Rohit Verma (Pune)
  const empRohit = await prisma.employee.create({
    data: {
      tenantId: tenantB.id,
      employeeCode: 'ZEN-2001',
      firstName: 'Rohit',
      lastName: 'Verma',
      email: 'emp.rohit@hrflow.com',
      phone: '+91 97654 32100',
      gender: 'Male',
      dob: new Date('1992-11-10'),
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      branchId: zenithPune.id,
      department: 'Parts',
      designation: 'Spares & Parts Manager',
      dateOfJoining: new Date('2021-08-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      email: 'emp.rohit@hrflow.com',
      passwordHash: empHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: empRohit.id,
      branchId: zenithPune.id,
    },
  });

  await prisma.employeeKYC.create({
    data: {
      employeeId: empRohit.id,
      aadhaarNumber: 'XXXX-XXXX-8912',
      panNumber: 'VERMA9876P',
      bankName: 'ICICI Bank',
      accountNumber: '002105012345',
      ifscCode: 'ICIC0000021',
      branchName: 'SB Road Pune',
      verified: true,
    },
  });

  await prisma.employeeSalary.create({
    data: {
      employeeId: empRohit.id,
      basic: 38000,
      hra: 19000,
      conveyance: 2000,
      specialAllowance: 11000,
      grossSalary: 70000,
    },
  });

  // Tenant B Employee 2: Neha Singh (Hyderabad)
  const empNeha = await prisma.employee.create({
    data: {
      tenantId: tenantB.id,
      employeeCode: 'ZEN-2002',
      firstName: 'Neha',
      lastName: 'Singh',
      email: 'emp.neha@hrflow.com',
      phone: '+91 91234 56789',
      gender: 'Female',
      dob: new Date('1997-04-18'),
      bloodGroup: 'AB+',
      maritalStatus: 'Single',
      branchId: zenithHyd.id,
      department: 'Customer Relations',
      designation: 'CRM Lead',
      dateOfJoining: new Date('2023-05-10'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      email: 'emp.neha@hrflow.com',
      passwordHash: empHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: empNeha.id,
      branchId: zenithHyd.id,
    },
  });

  await prisma.employeeSalary.create({
    data: {
      employeeId: empNeha.id,
      basic: 32000,
      hra: 16000,
      conveyance: 2000,
      specialAllowance: 10000,
      grossSalary: 60000,
    },
  });

  // Tenant B Positions
  await prisma.position.create({
    data: {
      tenantId: tenantB.id,
      positionCode: 'POS-ZEN-201',
      title: 'Commercial Fleet Specialist',
      department: 'Sales',
      branchId: zenithPune.id,
      requiredCount: 3,
      status: 'OPEN',
      reasonForOpening: 'Quarterly heavy commercial sales drive',
    },
  });

  console.log('Seeded Tenant B: Zenith Motors Group (Pune, Hyderabad)');

  // ==========================================
  // TENANT C: Bellad Group (Dealer Group C - Reference Tenant)
  // ==========================================
  const tenantC = await prisma.tenant.create({
    data: {
      organizationName: 'Bellad Group',
      legalName: 'Bellad Enterprises Private Limited',
      code: 'BELLAD',
      logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150',
      contactPhone: '+91 836 244 8888',
      contactEmail: 'contact@belladgroup.com',
      address: 'Bellad Chambers, PB Road, Hubli, Karnataka 580025',
      subscriptionPlan: 'ENTERPRISE',
      status: 'ACTIVE',
      settings: {
        workingDaysPerMonth: 30,
        salarySettings: {
          standardWorkingDays: 30,
          pfRate: 0.12,
          esiRate: 0.0075,
          esiThreshold: 21000,
        },
        attendanceRules: {
          gracePeriodMinutes: 15,
          halfDayHours: 4,
          fullDayHours: 8,
        },
        codeFormats: {
          employeeCodePrefix: 'BLD-',
          positionCodePrefix: 'POS-BLD-',
        },
      },
      features: {
        vacancies: true,
        joining: true,
        employees: true,
        payroll: true,
        advances: true,
        attendance: true,
        exit: true,
        approvals: true,
        reports: true,
        audit: true,
      },
    },
  });

  // Bellad Branches
  const belladHubli = await prisma.branch.create({
    data: {
      tenantId: tenantC.id,
      code: 'BELLAD-HUB',
      name: 'Hubli Central HQ & Showroom',
      city: 'Hubli',
      state: 'Karnataka',
      address: 'Bellad Chambers, PB Road, Hubli, Karnataka 580025',
      phone: '+91 836 244 8888',
      email: 'hubli.hq@belladgroup.com',
      active: true,
    },
  });

  const belladDharwad = await prisma.branch.create({
    data: {
      tenantId: tenantC.id,
      code: 'BELLAD-DWD',
      name: 'Dharwad Service & Bodyshop',
      city: 'Dharwad',
      state: 'Karnataka',
      address: 'Industrial Area, Rayapur, Dharwad 580009',
      phone: '+91 836 274 5555',
      email: 'dharwad.service@belladgroup.com',
      active: true,
    },
  });

  const belladBelgaum = await prisma.branch.create({
    data: {
      tenantId: tenantC.id,
      code: 'BELLAD-BGM',
      name: 'Belgaum Auto Hub',
      city: 'Belgaum',
      state: 'Karnataka',
      address: 'Khanapur Road, Tilakwadi, Belgaum 590006',
      phone: '+91 831 240 1234',
      email: 'belgaum@belladgroup.com',
      active: true,
    },
  });

  // Bellad Users
  const hrBelladUser = await prisma.user.create({
    data: {
      tenantId: tenantC.id,
      email: 'hr.bellad@hrflow.com',
      passwordHash: hrHash,
      role: 'HR',
      status: 'ACTIVE',
      branchId: belladHubli.id,
    },
  });

  const bmHubliUser = await prisma.user.create({
    data: {
      tenantId: tenantC.id,
      email: 'bm.hubli@hrflow.com',
      passwordHash: bmHash,
      role: 'BM',
      status: 'ACTIVE',
      branchId: belladHubli.id,
    },
  });

  const mdBelladUser = await prisma.user.create({
    data: {
      tenantId: tenantC.id,
      email: 'md.bellad@hrflow.com',
      passwordHash: hrHash,
      role: 'HR',
      status: 'ACTIVE',
      branchId: belladHubli.id,
    },
  });

  // Seed Bellad Group Levels & Designations (idempotent helper)
  const { belladLevelMap, belladDesigMap } = await seedBelladGroupMasters(prisma, tenantC.id);

  // Vertical Reporting Hierarchy for Bellad Group:
  // MD (L10) -> Director/CEO (L9) -> Chief Service Officer (L7) -> Service Head (L6) -> Branch Manager (L5) -> Service Advisor (L3) -> Technician (L3) -> Washers (L1)

  // 1. MD: Anand Bellad (Level 10)
  const empMD = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1001',
      firstName: 'Anand',
      lastName: 'Bellad',
      email: 'md.bellad@hrflow.com',
      phone: '+91 836 244 8801',
      gender: 'Male',
      dob: new Date('1969-05-15'),
      bloodGroup: 'B+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Executive Board',
      designation: 'MD',
      levelId: belladLevelMap.get(10).id,
      designationId: belladDesigMap.get('MD').id,
      reportingManagerId: null,
      dateOfJoining: new Date('2010-01-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.user.update({ where: { id: mdBelladUser.id }, data: { employeeId: empMD.id } });
  await prisma.employeeSalary.create({
    data: { employeeId: empMD.id, basic: 150000, hra: 75000, conveyance: 15000, specialAllowance: 60000, grossSalary: 300000 },
  });

  // 2. Director/CEO: Suresh Bellad (Level 9) -> reports to MD
  const empDirector = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1002',
      firstName: 'Suresh',
      lastName: 'Bellad',
      email: 'suresh.director@belladgroup.com',
      phone: '+91 836 244 8802',
      gender: 'Male',
      dob: new Date('1974-08-20'),
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Executive Board',
      designation: 'Director/CEO',
      levelId: belladLevelMap.get(9).id,
      designationId: belladDesigMap.get('Director/CEO').id,
      reportingManagerId: empMD.id,
      dateOfJoining: new Date('2012-04-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.employeeSalary.create({
    data: { employeeId: empDirector.id, basic: 120000, hra: 60000, conveyance: 12000, specialAllowance: 48000, grossSalary: 240000 },
  });

  // 3. Chief Service Officer: Raghavendra Joshi (Level 7) -> reports to Director
  const empCSO = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1003',
      firstName: 'Raghavendra',
      lastName: 'Joshi',
      email: 'cso@belladgroup.com',
      phone: '+91 836 244 8803',
      gender: 'Male',
      dob: new Date('1978-11-12'),
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Service',
      designation: 'Chief Service Officer',
      levelId: belladLevelMap.get(7).id,
      designationId: belladDesigMap.get('Chief Service Officer').id,
      reportingManagerId: empDirector.id,
      dateOfJoining: new Date('2015-06-15'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.employeeSalary.create({
    data: { employeeId: empCSO.id, basic: 90000, hra: 45000, conveyance: 8000, specialAllowance: 37000, grossSalary: 180000 },
  });

  // 4. Service Head: Vijay Kulkarni (Level 6) -> reports to CSO
  const empServiceHead = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1004',
      firstName: 'Vijay',
      lastName: 'Kulkarni',
      email: 'service.head@belladgroup.com',
      phone: '+91 836 244 8804',
      gender: 'Male',
      dob: new Date('1982-03-25'),
      bloodGroup: 'AB+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Service',
      designation: 'Service Head',
      levelId: belladLevelMap.get(6).id,
      designationId: belladDesigMap.get('Service Head').id,
      reportingManagerId: empCSO.id,
      dateOfJoining: new Date('2017-02-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.employeeSalary.create({
    data: { employeeId: empServiceHead.id, basic: 70000, hra: 35000, conveyance: 6000, specialAllowance: 29000, grossSalary: 140000 },
  });

  // 5. Branch Manager: Praveen Patil (Level 5) -> reports to Service Head
  const empBM = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1005',
      firstName: 'Praveen',
      lastName: 'Patil',
      email: 'bm.hubli@hrflow.com',
      phone: '+91 836 244 8805',
      gender: 'Male',
      dob: new Date('1985-09-14'),
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Operations',
      designation: 'Branch Manager',
      levelId: belladLevelMap.get(5).id,
      designationId: belladDesigMap.get('Branch Manager').id,
      reportingManagerId: empServiceHead.id,
      dateOfJoining: new Date('2018-09-10'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.user.update({ where: { id: bmHubliUser.id }, data: { employeeId: empBM.id } });
  await prisma.employeeSalary.create({
    data: { employeeId: empBM.id, basic: 55000, hra: 27500, conveyance: 5000, specialAllowance: 22500, grossSalary: 110000 },
  });

  // 6. Service Advisor: Girish Hiremath (Level 3) -> reports to Branch Manager
  const empAdvisor = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1006',
      firstName: 'Girish',
      lastName: 'Hiremath',
      email: 'girish.advisor@belladgroup.com',
      phone: '+91 94480 11223',
      gender: 'Male',
      dob: new Date('1990-12-05'),
      bloodGroup: 'B+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Service',
      designation: 'Service Advisor',
      levelId: belladLevelMap.get(3).id,
      designationId: belladDesigMap.get('Service Advisor').id,
      reportingManagerId: empBM.id,
      dateOfJoining: new Date('2020-07-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.employeeSalary.create({
    data: { employeeId: empAdvisor.id, basic: 30000, hra: 15000, conveyance: 3000, specialAllowance: 12000, grossSalary: 60000 },
  });

  // 7. Technician: Manjunath Desai (Level 3) -> reports to Service Advisor
  const empTech = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1007',
      firstName: 'Manjunath',
      lastName: 'Desai',
      email: 'manju.tech@belladgroup.com',
      phone: '+91 98451 44556',
      gender: 'Male',
      dob: new Date('1993-04-18'),
      bloodGroup: 'A+',
      maritalStatus: 'Single',
      branchId: belladHubli.id,
      department: 'Service',
      designation: 'Technician',
      levelId: belladLevelMap.get(3).id,
      designationId: belladDesigMap.get('Technician').id,
      reportingManagerId: empAdvisor.id,
      dateOfJoining: new Date('2021-03-15'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.employeeSalary.create({
    data: { employeeId: empTech.id, basic: 25000, hra: 12500, conveyance: 2500, specialAllowance: 10000, grossSalary: 50000 },
  });

  // 8. Washers: Basavaraj Korvi (Level 1) -> reports to Technician
  const empWasher = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1008',
      firstName: 'Basavaraj',
      lastName: 'Korvi',
      email: 'basavaraj.washer@belladgroup.com',
      phone: '+91 91100 22334',
      gender: 'Male',
      dob: new Date('1997-01-10'),
      bloodGroup: 'O+',
      maritalStatus: 'Single',
      branchId: belladHubli.id,
      department: 'Service',
      designation: 'Washers',
      levelId: belladLevelMap.get(1).id,
      designationId: belladDesigMap.get('Washers').id,
      reportingManagerId: empTech.id,
      dateOfJoining: new Date('2022-11-01'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.employeeSalary.create({
    data: { employeeId: empWasher.id, basic: 16000, hra: 8000, conveyance: 1500, specialAllowance: 4500, grossSalary: 30000 },
  });

  // 9. HR Head: Kavitha Deshpande (Level 6) -> reports to MD
  const empHRHead = await prisma.employee.create({
    data: {
      tenantId: tenantC.id,
      employeeCode: 'BLD-1009',
      firstName: 'Kavitha',
      lastName: 'Deshpande',
      email: 'hr.bellad@hrflow.com',
      phone: '+91 836 244 8809',
      gender: 'Female',
      dob: new Date('1984-07-22'),
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      branchId: belladHubli.id,
      department: 'Human Resources',
      designation: 'HR Head',
      levelId: belladLevelMap.get(6).id,
      designationId: belladDesigMap.get('HR Head').id,
      reportingManagerId: empMD.id,
      dateOfJoining: new Date('2016-05-10'),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });
  await prisma.user.update({ where: { id: hrBelladUser.id }, data: { employeeId: empHRHead.id } });
  await prisma.employeeSalary.create({
    data: { employeeId: empHRHead.id, basic: 65000, hra: 32500, conveyance: 5000, specialAllowance: 27500, grossSalary: 130000 },
  });

  console.log('Seeded Tenant C: Bellad Group (Hubli, Dharwad, Belgaum) with 10 Levels and 101 Designations');

  console.log('\n======================================================');
  console.log('Database Seeding Complete for Multi-Tenant Architecture');
  console.log('======================================================');
  console.log('Default Accounts:');
  console.log('  1. Platform Admin:      admin@hrflow.com        (admin123456) [SaaS Platform Scope]');
  console.log('  2. Apex HR Admin:       hr@hrflow.com           (hr123456)    [Apex Auto Group Scope]');
  console.log('  3. Apex BM Mumbai:      bm.mumbai@hrflow.com    (bm123456)    [Apex Mumbai Scope]');
  console.log('  4. Apex BM Bangalore:   bm.bangalore@hrflow.com (bm123456)    [Apex Bangalore Scope]');
  console.log('  5. Apex Emp Rahul:      emp.rahul@hrflow.com    (emp123456)   [Apex Employee Scope]');
  console.log('  6. Zenith HR Admin:     hr.zenith@hrflow.com    (hr123456)    [Zenith Motors Scope]');
  console.log('  7. Zenith BM Pune:      bm.pune@hrflow.com      (bm123456)    [Zenith Pune Scope]');
  console.log('  8. Zenith Emp Rohit:    emp.rohit@hrflow.com    (emp123456)   [Zenith Employee Scope]');
  console.log('  9. Bellad HR Admin:     hr.bellad@hrflow.com    (hr123456)    [Bellad Group Scope]');
  console.log(' 10. Bellad BM Hubli:     bm.hubli@hrflow.com     (bm123456)    [Bellad Hubli Scope]');
  console.log(' 11. Bellad MD Executive: md.bellad@hrflow.com     (hr123456)    [Bellad Group Scope]');
  console.log('======================================================\n');
}

/**
 * Idempotent seeder for Bellad Group Levels & Designations
 */
async function seedBelladGroupMasters(prismaClient, tenantId) {
  const belladLevelMap = new Map();
  for (const lvl of BELLAD_LEVELS) {
    const createdLevel = await prismaClient.employeeLevel.upsert({
      where: {
        tenantId_levelNumber: {
          tenantId,
          levelNumber: lvl.levelNumber,
        },
      },
      update: {
        name: lvl.name,
        description: lvl.description,
        isActive: true,
      },
      create: {
        tenantId,
        levelNumber: lvl.levelNumber,
        name: lvl.name,
        description: lvl.description,
        isActive: true,
      },
    });
    belladLevelMap.set(lvl.levelNumber, createdLevel);
  }

  const belladDesigMap = new Map();
  for (const desig of BELLAD_DESIGNATIONS) {
    const levelObj = belladLevelMap.get(desig.levelNumber);
    const createdDesig = await prismaClient.designation.upsert({
      where: {
        tenantId_name: {
          tenantId,
          name: desig.name,
        },
      },
      update: {
        levelId: levelObj.id,
        code: desig.code,
        isActive: true,
      },
      create: {
        tenantId,
        levelId: levelObj.id,
        name: desig.name,
        code: desig.code,
        isActive: true,
      },
    });
    belladDesigMap.set(desig.name, createdDesig);
  }

  return { belladLevelMap, belladDesigMap };
}

module.exports = {
  seedBelladGroupMasters,
};

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
