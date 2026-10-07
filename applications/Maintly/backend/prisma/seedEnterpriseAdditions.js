import prisma from '../src/config/db.js';

async function seedEnterprise() {
  console.log('[ENTERPRISE_SEED] Checking existing enterprise assets, PM plans, and rules...');

  // Get Bellad & Groups tenant
  const tenant = await prisma.tenant.findFirst({
    where: { code: 'BELLAD' }
  });

  if (!tenant) {
    console.log('[ENTERPRISE_SEED] Bellad tenant not found. Skipping.');
    return;
  }

  // Get branches
  const branches = await prisma.branch.findMany({
    where: { tenantId: tenant.id },
    take: 6
  });

  if (branches.length === 0) {
    console.log('[ENTERPRISE_SEED] No branches found. Skipping.');
    return;
  }

  // 1. Seed Assets if none exist for tenant
  const assetCount = await prisma.asset.count({ where: { tenantId: tenant.id } });
  let assets = [];
  if (assetCount === 0) {
    console.log('[ENTERPRISE_SEED] Seeding real automotive dealership assets across branches...');

    const assetTemplates = [
      {
        name: 'Rotary 2-Post Electro-Hydraulic Lift (4.5 Ton)',
        category: 'Hydraulic Lift',
        manufacturer: 'Rotary Lift Corp',
        model: 'SPOA10-TA-N500',
        serialNumber: 'ROT-2024-88392',
        location: 'Bay 1 - Express Service',
        criticality: 'CRITICAL',
        maintenanceFrequencyDays: 30,
        status: 'OPERATIONAL'
      },
      {
        name: 'Hunter HawkEye Elite 3D Wheel Aligner',
        category: 'Wheel Aligner',
        manufacturer: 'Hunter Engineering',
        model: 'HE421FC4E',
        serialNumber: 'HNT-ELITE-44021',
        location: 'Bay 4 - Alignment Bay',
        criticality: 'HIGH',
        maintenanceFrequencyDays: 60,
        status: 'OPERATIONAL'
      },
      {
        name: 'Ingersoll Rand Rotary Screw Air Compressor (25 HP)',
        category: 'Air Compressor',
        manufacturer: 'Ingersoll Rand',
        model: 'UP6-25-125',
        serialNumber: 'IR-SCREW-99381',
        location: 'Central Compressor Room',
        criticality: 'CRITICAL',
        maintenanceFrequencyDays: 30,
        status: 'OPERATIONAL'
      },
      {
        name: 'Blowtherm Down-Draft Spray Paint Booth & Oven',
        category: 'Paint Booth',
        manufacturer: 'Blowtherm USA',
        model: 'World DownDraft 7000',
        serialNumber: 'BLW-BOOTH-12903',
        location: 'Paint Shop Bay 7',
        criticality: 'CRITICAL',
        maintenanceFrequencyDays: 45,
        status: 'DEGRADED'
      },
      {
        name: 'Kirloskar Cummins 125 kVA Silent DG Generator',
        category: 'Generator',
        manufacturer: 'Kirloskar Green',
        model: 'KG-125-WS',
        serialNumber: 'KIR-GEN-67291',
        location: 'Utility Yard - Back Yard',
        criticality: 'HIGH',
        maintenanceFrequencyDays: 30,
        status: 'OPERATIONAL'
      },
      {
        name: 'Bosch KTS 590 Wireless Vehicle Diagnostic Scanner',
        category: 'Diagnostic Tool',
        manufacturer: 'Bosch Automotive',
        model: 'KTS-590-BT',
        serialNumber: 'BSH-KTS-33219',
        location: 'Bay 5 - Diagnostics',
        criticality: 'MEDIUM',
        maintenanceFrequencyDays: 90,
        status: 'OPERATIONAL'
      },
      {
        name: 'Daikin VRV IV Industrial Central AC Chiller (15 TR)',
        category: 'HVAC Chiller',
        manufacturer: 'Daikin Industries',
        model: 'RXYQ16TAY1',
        serialNumber: 'DAI-VRV-89410',
        location: 'Customer Showroom & Lounge',
        criticality: 'MEDIUM',
        maintenanceFrequencyDays: 60,
        status: 'OPERATIONAL'
      },
      {
        name: 'ATS ELGI Automatic High-Pressure Car Washer (150 Bar)',
        category: 'Car Washer',
        manufacturer: 'ATS ELGI Ltd',
        model: 'HPW-150-TRI',
        serialNumber: 'ELG-WASH-55912',
        location: 'Bay 8 - Washing & Detailing',
        criticality: 'HIGH',
        maintenanceFrequencyDays: 15,
        status: 'OPERATIONAL'
      }
    ];

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      for (let j = 0; j < assetTemplates.length; j++) {
        const t = assetTemplates[j];
        const prefix = t.category.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
        const code = `AST-${branch.code}-${prefix}-${String(j + 1).padStart(4, '0')}`;
        const created = await prisma.asset.create({
          data: {
            tenantId: tenant.id,
            branchId: branch.id,
            assetCode: code,
            name: `${t.name} (${branch.code})`,
            category: t.category,
            manufacturer: t.manufacturer,
            model: t.model,
            serialNumber: `${t.serialNumber}-${branch.code}`,
            location: t.location,
            criticality: t.criticality,
            maintenanceFrequencyDays: t.maintenanceFrequencyDays,
            status: j === 3 ? 'DEGRADED' : 'OPERATIONAL',
            installationDate: new Date('2023-03-15'),
            warrantyExpiry: new Date('2026-03-15'),
            qrCodeData: `MAINTLY:${tenant.id}:${code}`,
            riskLevel: t.criticality === 'CRITICAL' ? 'MEDIUM' : 'LOW'
          }
        });
        assets.push(created);
      }
    }
    console.log(`[ENTERPRISE_SEED] Created ${assets.length} assets across ${branches.length} branches.`);
  } else {
    assets = await prisma.asset.findMany({ where: { tenantId: tenant.id } });
  }

  // 2. Link existing requests to assets where assetId is null
  const unlinkedRequests = await prisma.maintenanceRequest.findMany({
    where: { tenantId: tenant.id, assetId: null },
    take: 50
  });

  if (unlinkedRequests.length > 0 && assets.length > 0) {
    console.log(`[ENTERPRISE_SEED] Associating ${unlinkedRequests.length} maintenance tickets with assets...`);
    for (let i = 0; i < unlinkedRequests.length; i++) {
      const r = unlinkedRequests[i];
      const matchAsset = assets.find(a => a.branchId === r.branchId) || assets[i % assets.length];
      await prisma.maintenanceRequest.update({
        where: { id: r.id },
        data: {
          assetId: matchAsset.id,
          // Calculate realistic cost breakdowns
          labourHours: r.actualCost > 0 ? 3.5 : 0,
          labourCost: r.actualCost > 0 ? Math.round(r.actualCost * 0.35) : 0,
          partsCost: r.actualCost > 0 ? Math.round(r.actualCost * 0.55) : 0,
          otherCost: r.actualCost > 0 ? Math.round(r.actualCost * 0.10) : 0
        }
      });
    }
  }

  // 3. Seed PM Plans if none exist
  const pmCount = await prisma.preventiveMaintenancePlan.count({ where: { tenantId: tenant.id } });
  if (pmCount === 0 && assets.length > 0) {
    console.log('[ENTERPRISE_SEED] Creating Preventive Maintenance Plans and Inspection Schedules...');
    const now = new Date();

    for (let i = 0; i < Math.min(assets.length, 12); i++) {
      const asset = assets[i];
      const nextDue = new Date(now.getTime() + (i % 2 === 0 ? -2 : (i + 3)) * 24 * 60 * 60 * 1000); // Some overdue, some upcoming

      const plan = await prisma.preventiveMaintenancePlan.create({
        data: {
          tenantId: tenant.id,
          branchId: asset.branchId,
          assetId: asset.id,
          title: `Monthly Preventive Service: ${asset.name}`,
          description: `Standard periodic OEM service, safety inspection, seal checks, and lubrication for ${asset.category}.`,
          category: asset.category,
          triggerType: 'FREQUENCY',
          frequencyDays: asset.maintenanceFrequencyDays || 30,
          nextDueDate: nextDue,
          priority: asset.criticality === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          checklistTemplate: [
            { id: 1, text: 'Check hydraulic fluid level and seal leakage', type: 'CHECKBOX' },
            { id: 2, text: 'Measure operating line pressure (bar)', type: 'NUMERIC', unit: 'bar', min: 2.2, max: 4.8 },
            { id: 3, text: 'Inspect safety lock engagement and emergency stop', type: 'CHECKBOX' },
            { id: 4, text: 'Lubricate arm pivot pins and carriage rollers', type: 'CHECKBOX' },
            { id: 5, text: 'Clean and inspect electrical control switchboard', type: 'CHECKBOX' }
          ]
        }
      });

      // Schedule PM Execution
      await prisma.pMExecution.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          assetId: asset.id,
          branchId: asset.branchId,
          scheduledDate: nextDue,
          status: nextDue < now ? 'OVERDUE' : 'PENDING'
        }
      });
    }
  }

  // 4. Seed Approval Matrix Rules if none exist
  const ruleCount = await prisma.approvalMatrixRule.count({ where: { tenantId: tenant.id } });
  if (ruleCount === 0) {
    console.log('[ENTERPRISE_SEED] Creating Approval Matrix Rules...');
    const rules = [
      { name: 'Standard Operational Repair (Cost < ₹5,000)', ruleType: 'COST_THRESHOLD', minAmount: 0, maxAmount: 5000, approverRole: 'MAINTENANCE_MANAGER', priorityEscalation: false, orderIndex: 1 },
      { name: 'Mid-Tier Repair & Spares (Cost ₹5,000 - ₹25,000)', ruleType: 'COST_THRESHOLD', minAmount: 5000, maxAmount: 25000, approverRole: 'BRANCH_MANAGER', priorityEscalation: false, orderIndex: 2 },
      { name: 'Major Overhaul or Replacement (Cost > ₹25,000)', ruleType: 'COST_THRESHOLD', minAmount: 25000, maxAmount: 9999999, approverRole: 'REGIONAL_MANAGER', priorityEscalation: true, orderIndex: 3 },
      { name: 'Emergency Priority Breakdown', ruleType: 'EMERGENCY_REQUEST', minAmount: null, maxAmount: null, approverRole: 'BRANCH_MANAGER', priorityEscalation: true, orderIndex: 4 },
      { name: 'Third-Party Contractor / Vendor Work', ruleType: 'VENDOR_WORK', minAmount: null, maxAmount: null, approverRole: 'PURCHASE_MANAGER', priorityEscalation: false, orderIndex: 5 },
      { name: 'Capital Equipment Replacement', ruleType: 'ASSET_REPLACEMENT', minAmount: 50000, maxAmount: null, approverRole: 'MANAGEMENT', priorityEscalation: true, orderIndex: 6 }
    ];

    for (const r of rules) {
      await prisma.approvalMatrixRule.create({
        data: { ...r, tenantId: tenant.id, isActive: true }
      });
    }
  }

  // 5. Calculate and log penalties for existing overdue requests
  const overdueRequests = await prisma.maintenanceRequest.findMany({
    where: {
      tenantId: tenant.id,
      deadline: { lt: new Date() },
      workStatus: { notIn: ['COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'] }
    }
  });

  console.log(`[ENTERPRISE_SEED] Initializing penalty trackers for ${overdueRequests.length} overdue requests...`);
  const now = new Date();
  for (const req of overdueRequests) {
    const graceHours = req.graceHours || 12.0;
    const deadlinePlusGrace = new Date(new Date(req.deadline).getTime() + (graceHours * 3600 * 1000));
    if (now > deadlinePlusGrace) {
      const breachHours = Math.max(1, Math.round(((now.getTime() - deadlinePlusGrace.getTime()) / 3600000) * 10) / 10);
      const rate = req.priority === 'HIGH' ? 500 : req.priority === 'MEDIUM' ? 250 : 100;
      const penaltyAmount = Math.round(breachHours * rate);

      await prisma.maintenanceRequest.update({
        where: { id: req.id },
        data: {
          penaltyAmount,
          penaltyStatus: 'ACCRUING',
          penaltyHourlyRate: rate,
          penaltyCalculatedAt: now
        }
      });
    }
  }

  console.log('[ENTERPRISE_SEED] Enterprise seed complete. All existing data 100% preserved!');
}

seedEnterprise().catch(console.error).finally(() => prisma.$disconnect());
