/**
 * Bellad Group Level and Designation Master Data
 * Exact 10 levels and 101 designations preserved without modification.
 */

const BELLAD_LEVELS = [
  { levelNumber: 1, name: 'Staff', description: 'Entry-level support, janitorial, and operations staff' },
  { levelNumber: 2, name: 'Middle Management', description: 'Coordinators, assistants, and junior specialists' },
  { levelNumber: 3, name: 'Senior Management', description: 'Specialists, technicians, executives, and advisors' },
  { levelNumber: 4, name: 'Top Management', description: 'Team leaders, in-charges, senior specialists, and consultants' },
  { levelNumber: 5, name: 'Level 5', description: 'Departmental managers and branch managers' },
  { levelNumber: 6, name: 'Level 6', description: 'Functional heads, controllers, and business heads' },
  { levelNumber: 7, name: 'Level 7', description: 'Chief officers, senior executives, and leadership advisors' },
  { levelNumber: 8, name: 'Level 8', description: 'Executive leadership, COOs, and general managers' },
  { levelNumber: 9, name: 'Director/CEO', description: 'Board-level executive directors and Chief Executive Officers' },
  { levelNumber: 10, name: 'MD', description: 'Managing Director & Ultimate Executive Leadership' },
];

const BELLAD_DESIGNATIONS = [
  // Level 1 — Staff (6 designations)
  { levelNumber: 1, name: 'Washers', code: 'BLD-L1-01' },
  { levelNumber: 1, name: 'Assistant - RTO', code: 'BLD-L1-02' },
  { levelNumber: 1, name: 'Janitors', code: 'BLD-L1-03' },
  { levelNumber: 1, name: 'Assistant - Polisher', code: 'BLD-L1-04' },
  { levelNumber: 1, name: 'Office Attendants', code: 'BLD-L1-05' },
  { levelNumber: 1, name: 'Security', code: 'BLD-L1-06' },

  // Level 2 — Middle Management (12 designations)
  { levelNumber: 2, name: 'Assistant - Technicians', code: 'BLD-L2-01' },
  { levelNumber: 2, name: 'Showroom Host(ess)', code: 'BLD-L2-02' },
  { levelNumber: 2, name: 'Assistant - PDI', code: 'BLD-L2-03' },
  { levelNumber: 2, name: 'Coordinator', code: 'BLD-L2-04' },
  { levelNumber: 2, name: 'CRE', code: 'BLD-L2-05' },
  { levelNumber: 2, name: 'Assistant Accountant', code: 'BLD-L2-06' },
  { levelNumber: 2, name: 'Assistant IT Coordinator', code: 'BLD-L2-07' },
  { levelNumber: 2, name: 'Electrician', code: 'BLD-L2-08' },
  { levelNumber: 2, name: 'Assistant - Spares', code: 'BLD-L2-09' },
  { levelNumber: 2, name: 'Relationship Officer - Sales', code: 'BLD-L2-10' },
  { levelNumber: 2, name: 'Drivers', code: 'BLD-L2-11' },
  { levelNumber: 2, name: 'Denter', code: 'BLD-L2-12' },

  // Level 3 — Senior Management (27 designations)
  { levelNumber: 3, name: 'Technician', code: 'BLD-L3-01' },
  { levelNumber: 3, name: 'Floor Incharge', code: 'BLD-L3-02' },
  { levelNumber: 3, name: 'DMS Executive', code: 'BLD-L3-03' },
  { levelNumber: 3, name: 'Warranty Specialist', code: 'BLD-L3-04' },
  { levelNumber: 3, name: 'Specialist - PDI', code: 'BLD-L3-05' },
  { levelNumber: 3, name: 'Cashier', code: 'BLD-L3-06' },
  { levelNumber: 3, name: 'Specialist - Customer Relationship', code: 'BLD-L3-07' },
  { levelNumber: 3, name: 'Specialist - HR', code: 'BLD-L3-08' },
  { levelNumber: 3, name: 'Specialist - Internal Auditing', code: 'BLD-L3-09' },
  { levelNumber: 3, name: 'Accounts Specialist', code: 'BLD-L3-10' },
  { levelNumber: 3, name: 'Specialist - IT', code: 'BLD-L3-11' },
  { levelNumber: 3, name: 'Specialist - Spares', code: 'BLD-L3-12' },
  { levelNumber: 3, name: 'Specialist - Accessories', code: 'BLD-L3-13' },
  { levelNumber: 3, name: 'Relationship Manager - Sales', code: 'BLD-L3-14' },
  { levelNumber: 3, name: 'Specialist - Purchase', code: 'BLD-L3-15' },
  { levelNumber: 3, name: 'SPECIALIST USED CARS', code: 'BLD-L3-16' },
  { levelNumber: 3, name: 'Auditors', code: 'BLD-L3-17' },
  { levelNumber: 3, name: 'DET', code: 'BLD-L3-18' },
  { levelNumber: 3, name: 'Service Advisor', code: 'BLD-L3-19' },
  { levelNumber: 3, name: 'FIELD EXECUTIVE & RTO Executive', code: 'BLD-L3-20' },
  { levelNumber: 3, name: 'SERVICE', code: 'BLD-L3-21' },
  { levelNumber: 3, name: 'CRM', code: 'BLD-L3-22' },
  { levelNumber: 3, name: 'HR', code: 'BLD-L3-23' },
  { levelNumber: 3, name: 'Auditor', code: 'BLD-L3-24' },
  { levelNumber: 3, name: 'Accounts', code: 'BLD-L3-25' },
  { levelNumber: 3, name: 'Spares', code: 'BLD-L3-26' },
  { levelNumber: 3, name: 'Sales', code: 'BLD-L3-27' },

  // Level 4 — Top Management (18 designations)
  { levelNumber: 4, name: 'Relationship Officer - Service', code: 'BLD-L4-01' },
  { levelNumber: 4, name: 'Bodyshop Incharge', code: 'BLD-L4-02' },
  { levelNumber: 4, name: 'Team Leader', code: 'BLD-L4-03' },
  { levelNumber: 4, name: 'Sr. HR Specialist', code: 'BLD-L4-04' },
  { levelNumber: 4, name: 'Sr. Audit Specialist', code: 'BLD-L4-05' },
  { levelNumber: 4, name: 'Sr. Accountant', code: 'BLD-L4-06' },
  { levelNumber: 4, name: 'Sr. Legal Consultant', code: 'BLD-L4-07' },
  { levelNumber: 4, name: 'Team Manager', code: 'BLD-L4-08' },
  { levelNumber: 4, name: 'Sr. Relationship Manager - Sales', code: 'BLD-L4-09' },
  { levelNumber: 4, name: 'Spares Incharge', code: 'BLD-L4-10' },
  { levelNumber: 4, name: 'Purchase Incharge', code: 'BLD-L4-11' },
  { levelNumber: 4, name: 'Customer Relations Incharge', code: 'BLD-L4-12' },
  { levelNumber: 4, name: 'CXM', code: 'BLD-L4-13' },
  { levelNumber: 4, name: 'legal', code: 'BLD-L4-14' },
  { levelNumber: 4, name: 'samyak shetty', code: 'BLD-L4-15' },
  { levelNumber: 4, name: 'ASM', code: 'BLD-L4-16' },
  { levelNumber: 4, name: 'Bodyshop advisor', code: 'BLD-L4-17' },
  { levelNumber: 4, name: 'Trainer', code: 'BLD-L4-18' },

  // Level 5 (10 designations)
  { levelNumber: 5, name: 'Purchase Manager', code: 'BLD-L5-01' },
  { levelNumber: 5, name: 'Branch Manager', code: 'BLD-L5-02' },
  { levelNumber: 5, name: 'Used Cars Manager', code: 'BLD-L5-03' },
  { levelNumber: 5, name: 'Showroom Manager', code: 'BLD-L5-04' },
  { levelNumber: 5, name: 'Spares Manager', code: 'BLD-L5-05' },
  { levelNumber: 5, name: 'Accounts Manager', code: 'BLD-L5-06' },
  { levelNumber: 5, name: 'Taxation Manager', code: 'BLD-L5-07' },
  { levelNumber: 5, name: 'Customer Relations Manager', code: 'BLD-L5-08' },
  { levelNumber: 5, name: 'Audit Manager', code: 'BLD-L5-09' },
  { levelNumber: 5, name: 'service/sales manager', code: 'BLD-L5-10' },

  // Level 6 (11 designations)
  { levelNumber: 6, name: 'Business Head', code: 'BLD-L6-01' },
  { levelNumber: 6, name: 'Finance Controller', code: 'BLD-L6-02' },
  { levelNumber: 6, name: 'HR Head', code: 'BLD-L6-03' },
  { levelNumber: 6, name: 'Finance Head', code: 'BLD-L6-04' },
  { levelNumber: 6, name: 'Audit Head', code: 'BLD-L6-05' },
  { levelNumber: 6, name: 'Service Head', code: 'BLD-L6-06' },
  { levelNumber: 6, name: 'Sales Head', code: 'BLD-L6-07' },
  { levelNumber: 6, name: 'Spares Head', code: 'BLD-L6-08' },
  { levelNumber: 6, name: 'Tax Controller', code: 'BLD-L6-09' },
  { levelNumber: 6, name: 'Statutory Controller', code: 'BLD-L6-10' },
  { levelNumber: 6, name: 'Senior Account Manager', code: 'BLD-L6-11' },

  // Level 7 (11 designations)
  { levelNumber: 7, name: 'Chief Audit Officer', code: 'BLD-L7-01' },
  { levelNumber: 7, name: 'Chief Finance Officer', code: 'BLD-L7-02' },
  { levelNumber: 7, name: 'Chief Inventory Officer', code: 'BLD-L7-03' },
  { levelNumber: 7, name: 'Chief Sales Officer-TATA', code: 'BLD-L7-04' },
  { levelNumber: 7, name: 'Chief Human Resource Officer', code: 'BLD-L7-05' },
  { levelNumber: 7, name: 'Chief Service Officer', code: 'BLD-L7-06' },
  { levelNumber: 7, name: 'Deepu sir', code: 'BLD-L7-07' },
  { levelNumber: 7, name: 'parashuram sir', code: 'BLD-L7-08' },
  { levelNumber: 7, name: 'Shrinivas sir', code: 'BLD-L7-09' },
  { levelNumber: 7, name: 'kiran s', code: 'BLD-L7-10' },
  { levelNumber: 7, name: 'K R Dwarakanth', code: 'BLD-L7-11' },

  // Level 8 (4 designations)
  { levelNumber: 8, name: 'Chief Operations Officer', code: 'BLD-L8-01' },
  { levelNumber: 8, name: 'General Manager - Legal', code: 'BLD-L8-02' },
  { levelNumber: 8, name: 'Chief Sales Officer/CEO(TATA BANGALORE)', code: 'BLD-L8-03' },
  { levelNumber: 8, name: 'Umesh wadkar sir', code: 'BLD-L8-04' },

  // Level 9 (1 designation)
  { levelNumber: 9, name: 'Director/CEO', code: 'BLD-L9-01' },

  // Level 10 (1 designation)
  { levelNumber: 10, name: 'MD', code: 'BLD-L10-01' },
];

module.exports = {
  BELLAD_LEVELS,
  BELLAD_DESIGNATIONS,
};
