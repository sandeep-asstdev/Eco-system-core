import prisma from '../src/config/db.js';

// Real-world industrial & commercial maintenance scenarios
const SAMPLE_SCENARIOS = [
  {
    subject: 'Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage',
    desc: 'Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.',
    typeKeyword: 'Mechanical',
    priority: 'HIGH',
    cost: 4500,
    actionPlan: '1. Lockout-tagout power. 2. Depressurize hydraulic circuit. 3. Disassemble cylinder gland and replace polyurethane seals. 4. Refill ISO 68 oil and load-test.'
  },
  {
    subject: 'Central Workshop 50HP Screw Compressor Pressure Switch Failure',
    desc: 'Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.',
    typeKeyword: 'Compressor',
    priority: 'HIGH',
    cost: 8200,
    actionPlan: '1. Inspect Danfoss pressure switch contacts. 2. Calibrate cut-in/cut-out thresholds. 3. Test pilot solenoid valve operation under full line load.'
  },
  {
    subject: 'Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping',
    desc: 'Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.',
    typeKeyword: 'HVAC',
    priority: 'MEDIUM',
    cost: 1800,
    actionPlan: '1. Remove intake louvers. 2. Nitrogen flush condensate drain pipe. 3. Inspect lift pump impeller and clean pan with antibacterial tablet.'
  },
  {
    subject: 'Paint Booth Downdraft Extraction Fan V-Belt Snapped',
    desc: 'Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.',
    typeKeyword: 'Mechanical',
    priority: 'HIGH',
    cost: 3200,
    actionPlan: '1. Isolate motor MCC panel. 2. Inspect pulley alignment with laser tool. 3. Install matched set of SPA-1600 cogged V-belts. 4. Check CFM airflow.'
  },
  {
    subject: 'Wheel Alignment System Optical Camera Calibration Fault',
    desc: '3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.',
    typeKeyword: 'Electrical',
    priority: 'MEDIUM',
    cost: 5000,
    actionPlan: '1. Clean optical glass filters with isopropanol. 2. Level target fixture with digital inclinometer. 3. Run OEM compensation routine with master bar.'
  },
  {
    subject: 'DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping',
    desc: 'Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.',
    typeKeyword: 'Generator',
    priority: 'HIGH',
    cost: 9500,
    actionPlan: '1. Replace defective 12V 120Ah lead-acid starter battery. 2. Calibrate AMF sensing PCB timer. 3. Execute simulated grid outage switchover.'
  },
  {
    subject: 'Main Showroom Glass Automatic Sliding Door Sensor Jammed',
    desc: 'Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.',
    typeKeyword: 'Civil',
    priority: 'MEDIUM',
    cost: 2400,
    actionPlan: '1. Clean radar sensor lens. 2. Adjust beam detection angle and sensitivity potentiometer. 3. Lubricate carriage track nylon rollers.'
  },
  {
    subject: 'Parts Warehouse High-Bay LED Luminaire Array Flickering',
    desc: '6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.',
    typeKeyword: 'Electrical',
    priority: 'LOW',
    cost: 3800,
    actionPlan: '1. Verify 3-phase neutral balance. 2. Replace failing MeanWell constant-current drivers. 3. Secure cable gland terminations.'
  },
  {
    subject: 'RO Drinking Water Filtration Plant High TDS & Pump Cavitation',
    desc: 'Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.',
    typeKeyword: 'Plumbing',
    priority: 'MEDIUM',
    cost: 4200,
    actionPlan: '1. Backwash sand media filter. 2. Replace 5-micron spun polypropylene cartridges. 3. Clean Dow Filmtec membrane with citric acid wash.'
  },
  {
    subject: 'Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled',
    desc: 'Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.',
    typeKeyword: 'Mechanical',
    priority: 'HIGH',
    cost: 11000,
    actionPlan: '1. Disconnect hydraulic quick-coupler. 2. Measure circuit relief pressure. 3. Replace orbital hydraulic motor and flushed bypass valve.'
  },
  {
    subject: 'Server Room Liebert Precision AC High Temperature Alarm (28°C)',
    desc: 'Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.',
    typeKeyword: 'HVAC',
    priority: 'HIGH',
    cost: 7800,
    actionPlan: '1. Electronic sniffer leak test on flare connections. 2. Braze cracked condenser coil return bend. 3. Evacuate to 500 microns and charge R410A.'
  },
  {
    subject: 'Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked',
    desc: 'Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.',
    typeKeyword: 'Electrical',
    priority: 'HIGH',
    cost: 3500,
    actionPlan: '1. Descale water chiller internal heat exchanger. 2. Flush silicone cooling tubes. 3. Replace copper alloy electrode caps.'
  },
  {
    subject: 'Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination',
    desc: 'Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.',
    typeKeyword: 'Civil',
    priority: 'LOW',
    cost: 14500,
    actionPlan: '1. Diamond grind damaged floor section. 2. Neutralize acid with alkaline solution. 3. Apply moisture barrier primer and recoat 2-pack polyurethane.'
  },
  {
    subject: 'Customer Restroom Sensor Faucets Non-Responsive',
    desc: 'Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.',
    typeKeyword: 'Plumbing',
    priority: 'LOW',
    cost: 1600,
    actionPlan: '1. Disassemble solenoid cartridge. 2. Soak EPDM diaphragms in descaling agent. 3. Install new 6V lithium battery packs.'
  },
  {
    subject: 'CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded',
    desc: 'Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.',
    typeKeyword: 'IT',
    priority: 'MEDIUM',
    cost: 6500,
    actionPlan: '1. Hot-swap defective 4TB WD Purple enterprise surveillance hard drive. 2. Rebuild RAID volume through storage controller web interface.'
  }
];

const STATUS_DISTRIBUTIONS = [
  { status: 'WAITING_FOR_APPROVAL', count: 12 },
  { status: 'APPROVED', count: 10 },
  { status: 'ASSIGNED', count: 15 },
  { status: 'IN_PROGRESS', count: 20 },
  { status: 'WAITING_FOR_PURCHASE', count: 10 },
  { status: 'WAITING_FOR_VENDOR', count: 6 },
  { status: 'COMPLETED', count: 15 },
  { status: 'CLOSED', count: 6 },
  { status: 'REJECTED', count: 6 }
];

async function seed100Requests() {
  console.log('\n=============================================================');
  console.log('MAINTLY: Generating 100 Rich Multi-Tenant Maintenance Records');
  console.log('=============================================================\n');

  // 1. Fetch Tenant #1 (Bellad & Groups)
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'bellad-groups' },
    include: {
      branches: { include: { branchAreas: true } },
      departments: true,
      brands: true,
      maintenanceTypes: true,
      users: true
    }
  });

  if (!tenant) {
    throw new Error('Tenant Bellad & Groups not found in database!');
  }

  const { branches, departments, brands, maintenanceTypes, users } = tenant;

  // Role mappings
  const adminUser = users.find(u => u.role === 'TENANT_ADMIN' || u.role === 'PLATFORM_ADMIN') || users[0];
  const managerUser = users.find(u => u.role === 'MANAGER') || adminUser;
  const approverUser = users.find(u => u.role === 'APPROVER') || managerUser;
  const techUser = users.find(u => u.role === 'MAINTENANCE_USER') || users[0];
  const empUser = users.find(u => u.role === 'EMPLOYEE') || users[0];

  // Get current highest request sequence number
  const existingCount = await prisma.maintenanceRequest.count({
    where: { tenantId: tenant.id }
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  let createdCount = 0;

  // Flatten target statuses
  const statusQueue = [];
  for (const dist of STATUS_DISTRIBUTIONS) {
    for (let i = 0; i < dist.count; i++) {
      statusQueue.push(dist.status);
    }
  }

  // Shuffle or expand to exactly 100
  while (statusQueue.length < 100) {
    statusQueue.push(statusQueue[createdCount % statusQueue.length]);
  }

  for (let i = 0; i < 100; i++) {
    const seqNum = existingCount + i + 1;
    const requestNumber = `${tenant.requestPrefix || 'BELL-MAIN'}-${currentYear}-${String(seqNum).padStart(6, '0')}`;
    const targetStatus = statusQueue[i];
    const scenario = SAMPLE_SCENARIOS[i % SAMPLE_SCENARIOS.length];

    // Pick branch, department, type, brand
    const branch = branches[i % branches.length];
    const dept = departments[i % departments.length];
    const brand = branch.brandId ? brands.find(b => b.id === branch.brandId) || brands[i % brands.length] : brands[i % brands.length];
    
    // Pick maintenance type matching keyword or cyclical
    const mType = maintenanceTypes.find(t => t.name.toLowerCase().includes(scenario.typeKeyword.toLowerCase())) ||
      maintenanceTypes[i % maintenanceTypes.length];

    const branchArea = branch.branchAreas?.length > 0 ? branch.branchAreas[i % branch.branchAreas.length] : null;

    // Date calculations: spread over the past 30 days
    const daysAgo = Math.floor(Math.random() * 25) + 1;
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000 + (i * 123456 % 3600000));
    
    const priority = scenario.priority;
    const targetHours = priority === 'HIGH' ? 24 : priority === 'LOW' ? 72 : 48;
    const graceHours = 12.0;

    // Calculate deadline
    const deadline = new Date(createdAt.getTime() + targetHours * 3600 * 1000);

    // Operational properties based on targetStatus
    let approvalStatus = 'PENDING';
    let approvedAt = null;
    let approvedById = null;
    let rejectedAt = null;
    let rejectedById = null;
    let rejectionReason = null;
    let assignedToId = null;
    let assignedById = null;
    let assignedAt = null;
    let startedAt = null;
    let completedAt = null;
    let closedAt = null;
    let actualTimeHours = null;
    let differenceHours = null;
    let slaClassification = null;
    let isDissatisfied = false;
    let dissatisfactionReason = null;
    let dissatisfiedAt = null;
    let dissatisfiedById = null;
    let correctionDone = 'NOT_STARTED';
    let completionRemarks = null;
    let actualCost = 0;
    let checkedOff = true;

    // Timings
    if (['APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'COMPLETED', 'CLOSED'].includes(targetStatus)) {
      approvalStatus = 'APPROVED';
      approvedAt = new Date(createdAt.getTime() + 2 * 3600 * 1000);
      approvedById = approverUser.id;
    }

    if (targetStatus === 'REJECTED') {
      approvalStatus = 'REJECTED';
      rejectedAt = new Date(createdAt.getTime() + 3 * 3600 * 1000);
      rejectedById = approverUser.id;
      rejectionReason = ['Duplicate work ticket', 'Capital budget ceiling exceeded for current quarter', 'Equipment under active OEM warranty period'][i % 3];
    }

    if (['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'COMPLETED', 'CLOSED'].includes(targetStatus)) {
      assignedToId = techUser.id;
      assignedById = managerUser.id;
      assignedAt = new Date(approvedAt.getTime() + 1.5 * 3600 * 1000);
    }

    if (['IN_PROGRESS', 'WAITING_FOR_PURCHASE', 'WAITING_FOR_VENDOR', 'COMPLETED', 'CLOSED'].includes(targetStatus)) {
      startedAt = new Date(assignedAt.getTime() + 1 * 3600 * 1000);
    }

    if (['COMPLETED', 'CLOSED'].includes(targetStatus)) {
      // Intentionally simulate some ON_TIME, some WITHIN_GRACE, some OVERDUE
      let completionOffsetHours = targetHours - 5; // On time default
      if (i % 3 === 0) {
        // Within 12-hour grace
        completionOffsetHours = targetHours + 6;
      } else if (i % 5 === 0) {
        // Overdue
        completionOffsetHours = targetHours + 18;
      }

      completedAt = new Date(createdAt.getTime() + completionOffsetHours * 3600 * 1000);
      actualTimeHours = Math.round(completionOffsetHours * 10) / 10;
      differenceHours = Math.round((completionOffsetHours - targetHours) * 10) / 10;

      if (actualTimeHours <= targetHours) {
        slaClassification = 'ON_TIME';
      } else if (actualTimeHours <= targetHours + graceHours) {
        slaClassification = 'WITHIN_GRACE';
      } else {
        slaClassification = 'OVERDUE';
      }

      completionRemarks = `Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.`;
      actualCost = scenario.cost + (i % 500);
      correctionDone = 'COMPLETED';
    }

    if (targetStatus === 'CLOSED') {
      closedAt = new Date(completedAt.getTime() + 4 * 3600 * 1000);
    }

    // Dissatisfied / Reopened simulation for 5 records
    if (i % 18 === 0 && ['IN_PROGRESS', 'ASSIGNED'].includes(targetStatus)) {
      isDissatisfied = true;
      dissatisfactionReason = 'Vibration and high acoustic noise reoccurred after 2 hours under peak operational load.';
      dissatisfiedAt = new Date(createdAt.getTime() + 12 * 3600 * 1000);
      dissatisfiedById = empUser.id;
      correctionDone = 'IN_PROGRESS';
    }

    // Simulate 12 tasks having checkedOff = false for attention badge
    if (i % 8 === 0) {
      checkedOff = false;
    }

    // Purchase attributes
    const purchaseRequired = targetStatus === 'WAITING_FOR_PURCHASE';
    const purchaseStatus = purchaseRequired ? 'PURCHASE_REQUIRED' : 'NOT_REQUIRED';
    const purchaseRemarks = purchaseRequired ? 'OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.' : null;

    // Create the Request
    const createdReq = await prisma.maintenanceRequest.create({
      data: {
        requestNumber,
        tenantId: tenant.id,
        brandId: brand ? brand.id : null,
        branchId: branch.id,
        departmentId: dept.id,
        branchAreaId: branchArea ? branchArea.id : null,
        areaInBranch: branchArea ? branchArea.name : 'Main Bay',
        maintenanceTypeId: mType.id,
        requesterId: empUser.id,
        requesterContact: empUser.phone || '+91 98450 12345',
        priority,
        location: `${branch.name} - Bay ${i % 8 + 1}`,
        subject: scenario.subject,
        description: scenario.desc,
        estimatedCost: scenario.cost,
        actualCost,
        requiredDate: deadline,
        deadline,
        targetHours,
        graceHours,
        actualTimeHours,
        differenceHours,
        slaClassification,
        approvalStatus,
        approvedAt,
        approvedById,
        rejectedAt,
        rejectedById,
        rejectionReason,
        assignedToId,
        assignedById,
        assignedAt,
        assignedToContact: techUser.phone || '+91 98765 43210',
        managerContact: managerUser.phone || '+91 91234 56789',
        actionPlan: assignedToId ? scenario.actionPlan : null,
        workStatus: targetStatus,
        currentStatus: targetStatus,
        startedAt,
        completedAt,
        closedAt,
        completionRemarks,
        correctionDone,
        correctionAt: correctionDone === 'COMPLETED' ? completedAt : null,
        checkedOff,
        isDissatisfied,
        dissatisfactionReason,
        dissatisfiedAt,
        dissatisfiedById,
        purchaseStatus,
        purchaseRemarks,
        createdAt
      }
    });

    // Create Status History Audit Trail
    await prisma.maintenanceRequestStatusHistory.create({
      data: {
        tenantId: tenant.id,
        requestId: createdReq.id,
        fromStatus: null,
        toStatus: 'WAITING_FOR_APPROVAL',
        changedById: empUser.id,
        remarks: 'Request created and submitted into tenant queue.',
        createdAt
      }
    });

    if (approvalStatus === 'APPROVED') {
      await prisma.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: tenant.id,
          requestId: createdReq.id,
          fromStatus: 'WAITING_FOR_APPROVAL',
          toStatus: 'APPROVED',
          changedById: approverUser.id,
          remarks: 'Approved. Proceed with immediate technician dispatch.',
          createdAt: approvedAt
        }
      });
    }

    if (assignedToId) {
      await prisma.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: tenant.id,
          requestId: createdReq.id,
          fromStatus: 'APPROVED',
          toStatus: 'ASSIGNED',
          changedById: managerUser.id,
          remarks: `Assigned to technician ${techUser.firstName} ${techUser.lastName}.`,
          createdAt: assignedAt
        }
      });
    }

    if (['IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(targetStatus)) {
      await prisma.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: tenant.id,
          requestId: createdReq.id,
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_PROGRESS',
          changedById: techUser.id,
          remarks: 'Diagnostic assessment commenced. Safety isolation confirmed.',
          createdAt: startedAt
        }
      });
    }

    if (['COMPLETED', 'CLOSED'].includes(targetStatus)) {
      await prisma.maintenanceRequestStatusHistory.create({
        data: {
          tenantId: tenant.id,
          requestId: createdReq.id,
          fromStatus: 'IN_PROGRESS',
          toStatus: 'COMPLETED',
          changedById: techUser.id,
          remarks: completionRemarks,
          createdAt: completedAt
        }
      });
    }

    // Add Materials consumed for completed or WIP requests
    if (['IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(targetStatus)) {
      await prisma.maintenanceRequestMaterial.create({
        data: {
          tenantId: tenant.id,
          requestId: createdReq.id,
          materialName: i % 2 === 0 ? 'Hydraulic Cylinder Seal Kit 65mm' : 'Contactor 3-Phase 40A 24V Coil',
          quantity: i % 2 === 0 ? 1 : 2,
          unit: 'pcs',
          unitCost: Math.round(scenario.cost * 0.4),
          totalCost: Math.round(scenario.cost * 0.4),
          addedById: techUser.id,
          createdAt: startedAt || createdAt
        }
      });
    }

    // Add Collaboration Work Notes / Comments
    await prisma.maintenanceRequestComment.create({
      data: {
        tenantId: tenant.id,
        requestId: createdReq.id,
        userId: techUser.id,
        comment: `Site inspection complete for ${scenario.subject}. Equipment isolated for safety.`,
        createdAt: new Date(createdAt.getTime() + 1.2 * 3600 * 1000)
      }
    });

    createdCount++;
    if (createdCount % 20 === 0) {
      console.log(`... Generated ${createdCount}/100 maintenance records`);
    }
  }

  console.log(`\n🎉 Successfully inserted ${createdCount} realistic maintenance requests for tenant "${tenant.name}"!`);
  await prisma.$disconnect();
}

seed100Requests().catch(err => {
  console.error('Failed to generate 100 requests:', err);
  process.exit(1);
});
