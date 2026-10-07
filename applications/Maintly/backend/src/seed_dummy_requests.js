import prisma from './config/db.js';

async function seed() {
  console.log('Seeding rich dummy maintenance requests for Maintly...');

  const tenant = await prisma.tenant.findFirst({
    where: { name: { contains: 'Bellad' } },
    include: {
      branches: true,
      departments: true,
      maintenanceTypes: true,
      users: true
    }
  });

  if (!tenant) {
    console.error('Bellad tenant not found');
    process.exit(1);
  }

  const branches = tenant.branches;
  const departments = tenant.departments;
  const types = tenant.maintenanceTypes;
  const users = tenant.users;

  const requester = users.find(u => u.role === 'EMPLOYEE') || users[0];
  const manager = users.find(u => u.role === 'MANAGER' || u.role === 'TENANT_ADMIN') || users[0];
  const assignedPerson = users.find(u => u.id !== requester.id) || users[0];

  // Dummy requests scenarios across the full workflow
  const scenarios = [
    // 1. PENDING APPROVAL
    {
      subject: 'Showroom ceiling water leakage near display area',
      description: 'Severe water seepage from ceiling pipeline directly above the main display vehicle in showroom.',
      location: 'Main Showroom - Bay 1 Display',
      priority: 'HIGH',
      workStatus: 'WAITING_FOR_APPROVAL',
      approvalStatus: 'PENDING',
      branch: branches[0] || branches[0],
      dept: departments.find(d => d.name.toLowerCase().includes('sales')) || departments[0],
      type: types.find(t => t.name.toLowerCase().includes('plumb')) || types[0],
      daysAgo: 1,
      problemPhoto: '/uploads/maintly-1790759331316-134614420.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },
    {
      subject: 'Customer Lounge AC cooling malfunction',
      description: 'Air conditioning unit in customer waiting lounge blowing warm air. Compressor not engaging.',
      location: 'Customer Waiting Lounge - 1st Floor',
      priority: 'MEDIUM',
      workStatus: 'WAITING_FOR_APPROVAL',
      approvalStatus: 'PENDING',
      branch: branches[1] || branches[0],
      dept: departments[0],
      type: types.find(t => t.name.toLowerCase().includes('elec') || t.name.toLowerCase().includes('ac')) || types[0],
      daysAgo: 2,
      problemPhoto: '/uploads/maintly-1790149499887-986267208.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },
    {
      subject: 'Spare parts stockroom shutter motor jam',
      description: 'Motorized roller shutter for spare parts loading bay jammed at 3 feet height. Emergency override unresponsive.',
      location: 'Spare Parts Loading Bay',
      priority: 'HIGH',
      workStatus: 'WAITING_FOR_APPROVAL',
      approvalStatus: 'PENDING',
      branch: branches[2] || branches[0],
      dept: departments.find(d => d.name.toLowerCase().includes('parts') || d.name.toLowerCase().includes('store')) || departments[0],
      type: types[0],
      daysAgo: 1,
      problemPhoto: '/uploads/maintly-1790164701606-514510785.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },

    // 2. ASSIGNED
    {
      subject: 'Workshop 2-Post Hydraulic Lift #3 oil pressure drop',
      description: 'Hydraulic lift in service bay 3 losing pressure under vehicle load. Hydraulic seal degradation suspected.',
      location: 'Service Workshop - Bay 3',
      priority: 'HIGH',
      workStatus: 'ASSIGNED',
      approvalStatus: 'APPROVED',
      approvedCost: 8500,
      branch: branches[0],
      dept: departments.find(d => d.name.toLowerCase().includes('service') || d.name.toLowerCase().includes('work')) || departments[0],
      type: types.find(t => t.name.toLowerCase().includes('hydraul') || t.name.toLowerCase().includes('mech')) || types[0],
      daysAgo: 3,
      problemPhoto: '/uploads/maintly-1790759331316-134614420.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },
    {
      subject: 'Customer restroom exhaust fan motor burnt out',
      description: 'Restroom exhaust fan making loud screeching noise and smoking. Disconnected circuit breaker immediately.',
      location: 'Ground Floor Restroom',
      priority: 'MEDIUM',
      workStatus: 'ASSIGNED',
      approvalStatus: 'APPROVED',
      approvedCost: 2200,
      branch: branches[1] || branches[0],
      dept: departments[0],
      type: types.find(t => t.name.toLowerCase().includes('elec')) || types[0],
      daysAgo: 2,
      problemPhoto: '/uploads/maintly-1790149499887-986267208.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },

    // 3. IN PROGRESS
    {
      subject: 'Paint Booth exhaust suction filter clogged',
      description: 'Over-spray suction air flow dropped below 0.4 m/s in Paint Booth 1. Filter replacement in progress.',
      location: 'Bodyshop - Paint Booth 1',
      priority: 'HIGH',
      workStatus: 'IN_PROGRESS',
      approvalStatus: 'APPROVED',
      approvedCost: 12000,
      branch: branches[0],
      dept: departments[0],
      type: types[0],
      daysAgo: 4,
      problemPhoto: '/uploads/maintly-1790759331316-134614420.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },
    {
      subject: 'EV Fast Charger Gun cable sleeve frayed',
      description: 'Protective insulation sleeve on 60kW DC fast charger gun cracked. Re-sleeving and insulation testing active.',
      location: 'EV Charging Station 1',
      priority: 'HIGH',
      workStatus: 'IN_PROGRESS',
      approvalStatus: 'APPROVED',
      approvedCost: 4500,
      branch: branches[0],
      dept: departments[0],
      type: types.find(t => t.name.toLowerCase().includes('elec')) || types[0],
      daysAgo: 3,
      problemPhoto: '/uploads/maintly-1790164701606-514510785.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },
    {
      subject: 'Accounts office LED panel lights flickering',
      description: 'Choke and LED drivers failing across 6 ceiling panels in Accounts cabin.',
      location: 'Administration - Accounts Cabin',
      priority: 'LOW',
      workStatus: 'IN_PROGRESS',
      approvalStatus: 'APPROVED',
      approvedCost: 1800,
      branch: branches[2] || branches[0],
      dept: departments[0],
      type: types.find(t => t.name.toLowerCase().includes('elec')) || types[0],
      daysAgo: 5,
      problemPhoto: '/uploads/maintly-1790149499887-986267208.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    },

    // 4. COMPLETED - INVOICE PENDING
    {
      subject: 'Wheel Balancer calibration and laser sensor replacement',
      description: 'Wheel balancer reading variance of +25g. Calibrated and optical encoder replaced.',
      location: 'Wheel Care Bay 2',
      priority: 'MEDIUM',
      workStatus: 'COMPLETED',
      approvalStatus: 'APPROVED',
      approvedCost: 5000,
      actualCost: 4800,
      completionRemarks: 'Optical encoder replaced, test wheel balanced to 0g variance. Verified.',
      branch: branches[0],
      dept: departments[0],
      type: types[0],
      daysAgo: 6,
      problemPhoto: '/uploads/maintly-1790759331316-134614420.png',
      completionPhoto: '/uploads/maintly-1790759331527-799795028.png',
      invoice: null,
      payment: { status: 'PENDING' }
    },
    {
      subject: 'Security Guard Gate hydraulic arm piston seal replacement',
      description: 'Main boom barrier gate falling fast without damping. Replaced hydraulic damping piston.',
      location: 'Main Security Gate Entrance',
      priority: 'MEDIUM',
      workStatus: 'COMPLETED',
      approvalStatus: 'APPROVED',
      approvedCost: 3500,
      actualCost: 3200,
      completionRemarks: 'Replaced hydraulic piston, tested with 50 continuous cycles. Operates smoothly.',
      branch: branches[1] || branches[0],
      dept: departments[0],
      type: types[0],
      daysAgo: 5,
      problemPhoto: '/uploads/maintly-1790164701606-514510785.png',
      completionPhoto: '/uploads/maintly-1790759965794-462182920.png',
      invoice: null,
      payment: { status: 'PENDING' }
    },

    // 5. COMPLETED - PAYMENT PENDING (Invoice Uploaded)
    {
      subject: 'High-pressure vehicle wash pump pressure valve overhaul',
      description: 'Water pressure dropped below 100 bar in automatic car wash bay. High-pressure ceramic plunger replaced.',
      location: 'Washing Bay 1',
      priority: 'HIGH',
      workStatus: 'COMPLETED',
      approvalStatus: 'APPROVED',
      approvedCost: 7500,
      actualCost: 7200,
      completionRemarks: 'Ceramic pistons and seals replaced. Pump pressure steady at 160 bar.',
      branch: branches[0],
      dept: departments[0],
      type: types[0],
      daysAgo: 7,
      problemPhoto: '/uploads/maintly-1790759331316-134614420.png',
      completionPhoto: '/uploads/maintly-1790759331527-799795028.png',
      invoice: {
        number: 'INV-CARWASH-9012',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        amount: 7200,
        url: '/uploads/maintly-1790759331589-257699690.pdf',
        remarks: 'Hydraulics & Pressure Systems Services invoice'
      },
      payment: {
        status: 'PENDING',
        amount: 7200
      }
    },
    {
      subject: 'Diesel Generator 125kVA battery bank replacement',
      description: 'DG set failed to crank during power cut. Starter batteries aged out (4 years old).',
      location: 'DG Room - Rear Yard',
      priority: 'HIGH',
      workStatus: 'COMPLETED',
      approvalStatus: 'APPROVED',
      approvedCost: 16000,
      actualCost: 15500,
      completionRemarks: 'Installed 2x 180Ah Exide commercial batteries. Auto-mains failure test passed.',
      branch: branches[2] || branches[0],
      dept: departments[0],
      type: types.find(t => t.name.toLowerCase().includes('elec')) || types[0],
      daysAgo: 8,
      problemPhoto: '/uploads/maintly-1790149499887-986267208.png',
      completionPhoto: '/uploads/maintly-1790759965794-462182920.png',
      invoice: {
        number: 'INV-BATTERY-4411',
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        amount: 15500,
        url: '/uploads/maintly-1790759965857-307437401.pdf',
        remarks: 'Exide Battery Distributors tax invoice'
      },
      payment: {
        status: 'PENDING',
        amount: 15500
      }
    },

    // 6. CLOSED (Full Cycle: problem -> approved -> completed -> invoice -> paid -> closed)
    {
      subject: 'Air compressor pneumatic line regulator leak repair',
      description: 'Continuous hissing leak and pressure loss in central compressed air pipeline in Bay 4.',
      location: 'Workshop Central Pneumatics',
      priority: 'MEDIUM',
      workStatus: 'CLOSED',
      approvalStatus: 'APPROVED',
      approvedCost: 3000,
      actualCost: 2800,
      completionRemarks: 'Replaced brass pressure regulator and quick-release coupling. Pressure holds 8 bar.',
      branch: branches[0],
      dept: departments[0],
      type: types[0],
      daysAgo: 14,
      problemPhoto: '/uploads/maintly-1790759331316-134614420.png',
      completionPhoto: '/uploads/maintly-1790759331527-799795028.png',
      invoice: {
        number: 'INV-PNEU-1088',
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        amount: 2800,
        url: '/uploads/maintly-1790759331589-257699690.pdf',
        remarks: 'Pneumatics spares & fitting invoice'
      },
      payment: {
        status: 'PAID',
        date: new Date(Date.now() - 8 * 24 * 3600 * 1000),
        amount: 2800,
        method: 'UPI',
        proofUrl: '/uploads/maintly-1790759331610-807599338.png',
        remarks: 'UPI Ref #UPI-99228811 settled'
      }
    },
    {
      subject: 'Customer Delivery Bay ceremonial lighting fixture replacement',
      description: 'Chandelier LED spotlights damaged during showroom renovation delivery ceremony.',
      location: 'New Car Delivery Area',
      priority: 'LOW',
      workStatus: 'CLOSED',
      approvalStatus: 'APPROVED',
      approvedCost: 4000,
      actualCost: 3850,
      completionRemarks: 'Installed warm-white spotlight fixtures. Fully tested with dimming controller.',
      branch: branches[1] || branches[0],
      dept: departments[0],
      type: types.find(t => t.name.toLowerCase().includes('elec')) || types[0],
      daysAgo: 20,
      problemPhoto: '/uploads/maintly-1790149499887-986267208.png',
      completionPhoto: '/uploads/maintly-1790759965794-462182920.png',
      invoice: {
        number: 'INV-LIGHTS-7721',
        date: new Date(Date.now() - 16 * 24 * 3600 * 1000),
        amount: 3850,
        url: '/uploads/maintly-1790759965857-307437401.pdf',
        remarks: 'Commercial Electricals tax invoice'
      },
      payment: {
        status: 'PAID',
        date: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        amount: 3850,
        method: 'Bank Transfer (NEFT)',
        proofUrl: '/uploads/maintly-1790759965887-382909102.png',
        remarks: 'NEFT Ref #TXN554411 settled'
      }
    },

    // 7. REJECTED
    {
      subject: 'Employee personal vehicle dent removal request',
      description: 'Request submitted to repair private employee car using dealership body shop equipment.',
      location: 'Body Shop',
      priority: 'LOW',
      workStatus: 'REJECTED',
      approvalStatus: 'REJECTED',
      rejectionReason: 'Dealership maintenance facility is restricted to company assets, test drive vehicles, and facility infrastructure.',
      branch: branches[0],
      dept: departments[0],
      type: types[0],
      daysAgo: 4,
      problemPhoto: '/uploads/maintly-1790164701606-514510785.png',
      completionPhoto: null,
      invoice: null,
      payment: null
    }
  ];

  let currentCount = await prisma.maintenanceRequest.count({ where: { tenantId: tenant.id } });

  for (const s of scenarios) {
    currentCount++;
    const prefix = tenant.requestPrefix || 'MAIN';
    const currentYear = new Date().getFullYear();
    const requestNumber = `${prefix}-${currentYear}-${String(currentCount).padStart(6, '0')}`;
    const createdAt = new Date(Date.now() - s.daysAgo * 24 * 3600 * 1000);

    const reqRecord = await prisma.maintenanceRequest.create({
      data: {
        requestNumber,
        tenantId: tenant.id,
        branchId: s.branch.id,
        departmentId: s.dept.id,
        maintenanceTypeId: s.type.id,
        requesterId: requester.id,
        requesterContact: requester.phone || '9876543210',
        location: s.location,
        subject: s.subject,
        description: s.description,
        priority: s.priority,
        requiredDate: new Date(createdAt.getTime() + 48 * 3600 * 1000),
        deadline: new Date(createdAt.getTime() + 48 * 3600 * 1000),
        targetHours: 48.0,
        graceHours: 12.0,
        workStatus: s.workStatus,
        currentStatus: s.workStatus,
        approvalStatus: s.approvalStatus,
        approvedById: s.approvalStatus === 'APPROVED' ? manager.id : null,
        approvedAt: s.approvalStatus === 'APPROVED' ? new Date(createdAt.getTime() + 2 * 3600 * 1000) : null,
        approvedCost: s.approvedCost || 0,
        rejectedById: s.approvalStatus === 'REJECTED' ? manager.id : null,
        rejectedAt: s.approvalStatus === 'REJECTED' ? new Date(createdAt.getTime() + 2 * 3600 * 1000) : null,
        rejectionReason: s.rejectionReason || null,
        assignedToId: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(s.workStatus) ? assignedPerson.id : null,
        assignedById: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(s.workStatus) ? manager.id : null,
        assignedAt: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(s.workStatus) ? new Date(createdAt.getTime() + 3 * 3600 * 1000) : null,
        startedAt: ['IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(s.workStatus) ? new Date(createdAt.getTime() + 5 * 3600 * 1000) : null,
        completedAt: ['COMPLETED', 'CLOSED'].includes(s.workStatus) ? new Date(createdAt.getTime() + 24 * 3600 * 1000) : null,
        closedAt: s.workStatus === 'CLOSED' ? new Date(createdAt.getTime() + 48 * 3600 * 1000) : null,
        actualCost: s.actualCost || 0,
        completionRemarks: s.completionRemarks || null,
        checkedOff: true,
        branchStatus: s.workStatus === 'CLOSED' ? 'CLOSED' : 'OPEN',
        createdAt,
        updatedAt: new Date(),

        // Invoice fields
        invoiceNumber: s.invoice?.number || null,
        invoiceDate: s.invoice?.date || null,
        invoiceAmount: s.invoice?.amount || null,
        invoiceUrl: s.invoice?.url || null,
        invoiceRemarks: s.invoice?.remarks || null,

        // Payment fields
        paymentStatus: s.payment?.status || (s.workStatus === 'CLOSED' ? 'PAID' : 'NOT_REQUIRED'),
        paymentDate: s.payment?.date || null,
        paymentAmount: s.payment?.amount || null,
        paymentMethod: s.payment?.method || null,
        paymentProofUrl: s.payment?.proofUrl || null,
        paymentRemarks: s.payment?.remarks || null
      }
    });

    // Attach Problem Image
    if (s.problemPhoto) {
      await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: tenant.id,
          requestId: reqRecord.id,
          originalFilename: 'problem_inspection_photo.png',
          storedFilename: s.problemPhoto.split('/').pop(),
          fileUrl: s.problemPhoto,
          mimeType: 'image/png',
          fileSize: 8579,
          attachmentType: 'INITIAL_PHOTO',
          uploadedById: requester.id,
          createdAt
        }
      });

      await prisma.maintenanceEvidence.create({
        data: {
          tenantId: tenant.id,
          requestId: reqRecord.id,
          stage: 'BEFORE',
          fileUrl: s.problemPhoto,
          mediaType: 'PHOTO',
          filename: 'problem_inspection_photo.png',
          description: 'Problem Proof Photo',
          uploadedById: requester.id,
          uploadedAt: createdAt
        }
      });
    }

    // Attach Completion Image
    if (s.completionPhoto) {
      await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: tenant.id,
          requestId: reqRecord.id,
          originalFilename: 'solved_completion_proof.png',
          storedFilename: s.completionPhoto.split('/').pop(),
          fileUrl: s.completionPhoto,
          mimeType: 'image/png',
          fileSize: 8579,
          attachmentType: 'COMPLETION_PHOTO',
          uploadedById: assignedPerson.id,
          createdAt: new Date(createdAt.getTime() + 24 * 3600 * 1000)
        }
      });

      await prisma.maintenanceEvidence.create({
        data: {
          tenantId: tenant.id,
          requestId: reqRecord.id,
          stage: 'AFTER',
          fileUrl: s.completionPhoto,
          mediaType: 'PHOTO',
          filename: 'solved_completion_proof.png',
          description: 'Solved Proof Photo',
          uploadedById: assignedPerson.id,
          uploadedAt: new Date(createdAt.getTime() + 24 * 3600 * 1000)
        }
      });
    }

    // Attach Invoice Document
    if (s.invoice?.url) {
      await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: tenant.id,
          requestId: reqRecord.id,
          originalFilename: `${s.invoice.number}.pdf`,
          storedFilename: s.invoice.url.split('/').pop(),
          fileUrl: s.invoice.url,
          mimeType: 'application/pdf',
          fileSize: 45000,
          attachmentType: 'INVOICE_DOC',
          uploadedById: manager.id,
          createdAt: s.invoice.date || new Date()
        }
      });
    }

    // Attach Payment Proof
    if (s.payment?.proofUrl) {
      await prisma.maintenanceRequestAttachment.create({
        data: {
          tenantId: tenant.id,
          requestId: reqRecord.id,
          originalFilename: 'payment_settlement_receipt.png',
          storedFilename: s.payment.proofUrl.split('/').pop(),
          fileUrl: s.payment.proofUrl,
          mimeType: 'image/png',
          fileSize: 8579,
          attachmentType: 'OTHER',
          uploadedById: manager.id,
          createdAt: s.payment.date || new Date()
        }
      });
    }

    // Add Status History
    await prisma.maintenanceRequestStatusHistory.create({
      data: {
        tenantId: tenant.id,
        requestId: reqRecord.id,
        fromStatus: null,
        toStatus: s.workStatus,
        changedById: manager.id,
        remarks: `Initialized as ${s.workStatus}`,
        createdAt
      }
    });

    console.log(`✓ Seeded ${requestNumber} - ${s.workStatus}: ${s.subject}`);
  }

  console.log(`\n🎉 Successfully seeded ${scenarios.length} realistic maintenance requests!`);
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  prisma.$disconnect();
  process.exit(1);
});
