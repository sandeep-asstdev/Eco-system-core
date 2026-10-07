import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_document():
    doc = Document()

    # 1. Page Margins - 0.6 inch for maximum content area
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.6)
        section.right_margin = Inches(0.6)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # 2. Styling Helper Functions
    def set_cell_background(cell, fill_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'''
            <w:tcMar {nsdecls("w")}>
                <w:top w:w="{top}" w:type="dxa"/>
                <w:bottom w:w="{bottom}" w:type="dxa"/>
                <w:left w:w="{left}" w:type="dxa"/>
                <w:right w:w="{right}" w:type="dxa"/>
            </w:tcMar>
        ''')
        tcPr.append(tcMar)

    def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            </w:tblBorders>
        ''')
        tblPr.append(borders)

    # Typography styles
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(9.5)
    font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    def add_custom_heading(text, level, space_before=14, space_after=6, color_rgb=(30, 58, 138)):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Calibri'
        if level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(30, 58, 138) # Navy #1E3A8A
        elif level == 2:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(37, 99, 235) # Blue #2563EB
        elif level == 3:
            run.font.size = Pt(11)
            run.font.color.rgb = RGBColor(51, 65, 85) # Slate 700
        return p

    # =========================================================================
    # DOCUMENT HEADER & TITLE
    # =========================================================================
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("AUTOMOBILE DEALERSHIP ECOSYSTEM")
    r_title.bold = True
    r_title.font.size = Pt(22)
    r_title.font.color.rgb = RGBColor(30, 58, 138) # Deep Navy

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("MASTER MANUAL TEST SUITE & END-TO-END QA CHECKLIST")
    r_sub.bold = True
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = RGBColor(100, 116, 139) # Slate 500

    # Metadata Card Table
    meta_table = doc.add_table(rows=4, cols=4)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_table, color="94A3B8")
    
    meta_data = [
        [("Document Version", True), ("v2.5 (Complete Enterprise Release)", False), ("Test Target", True), ("Multi-Tenant Dealership Ecosystem", False)],
        [("Execution Type", True), ("100% Manual Execution Checklist", False), ("Databases", True), ("PostgreSQL 18 (3 Autonomous DBs)", False)],
        [("Platform Core", True), ("Ecosystem Core (Port 3000/4000)", False), ("Identity & SSO", True), ("Keycloak OIDC (Port 8080)", False)],
        [("Integrated Apps", True), ("HRFlow (3001) & MAINTLY (3002)", False), ("Messaging", True), ("RabbitMQ AMQP (Port 5672/15672)", False)]
    ]

    col_widths = [Inches(1.4), Inches(2.25), Inches(1.4), Inches(2.25)]
    for r_idx, row in enumerate(meta_table.rows):
        for c_idx, cell in enumerate(row.cells):
            cell.width = col_widths[c_idx]
            set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
            label, is_header = meta_data[r_idx][c_idx]
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(label)
            if is_header:
                run.bold = True
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(30, 41, 59)
                set_cell_background(cell, "F1F5F9")
            else:
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(51, 65, 85)
                set_cell_background(cell, "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # =========================================================================
    # SECTION 1: PRE-REQUISITES & TEST PERSONAS
    # =========================================================================
    add_custom_heading("1. Environment Runbook & Pre-Seeded Test Credentials", 1)

    p_desc = doc.add_paragraph()
    p_desc.add_run("Before beginning manual testing, ensure all services are booted via ").font.size = Pt(9.5)
    r_bat = p_desc.add_run("start-ecosystem.bat")
    r_bat.bold = True
    p_desc.add_run(" and status is validated via ").font.size = Pt(9.5)
    r_stat = p_desc.add_run("start-ecosystem.bat status")
    r_stat.bold = True
    p_desc.add_run(". Use the pre-configured test personas below to validate scoped permissions:").font.size = Pt(9.5)

    persona_table = doc.add_table(rows=7, cols=5)
    persona_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(persona_table, color="CBD5E1")
    
    p_headers = ["Persona / Role", "Login Email", "Password", "Organizational Scope", "Permitted Access"]
    p_col_widths = [Inches(1.4), Inches(1.8), Inches(0.9), Inches(1.3), Inches(1.9)]
    
    for c_idx, cell in enumerate(persona_table.rows[0].cells):
        cell.width = p_col_widths[c_idx]
        set_cell_margins(cell, top=90, bottom=90, left=90, right=90)
        set_cell_background(cell, "1E3A8A")
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(p_headers[c_idx])
        run.bold = True
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(255, 255, 255)

    personas_rows = [
        ("Platform SuperAdmin", "admin@ecosystem.com", "Admin@123", "GLOBAL", "All Tenants, Core Platform, Registry, Audit Logs"),
        ("Bellad Group MD", "md.bellad@belladgroup.com", "Admin@123", "TENANT (Bellad)", "Executive KPI Dashboard, All Firms, Brands, Branches"),
        ("Bellad Group HR Officer", "hr.bellad@belladgroup.com", "Admin@123", "TENANT (Bellad)", "HRFlow HRMS, Employee Dossier, Payroll, Onboarding"),
        ("Hubli Branch Manager", "bm.hubli@belladgroup.com", "Admin@123", "BRANCH (Hubli Main)", "Hubli Branch ops, Approvals, Maintly requests"),
        ("Hubli Master Technician", "tech.hubli@belladgroup.com", "Admin@123", "BRANCH (Hubli Service)", "Maintly repair ticket execution, Work logs"),
        ("Apex Auto Group Admin", "admin@apexauto.in", "Admin@123", "TENANT (Apex)", "Tenant boundary testing (Zero Bellad data leakage)")
    ]

    for r_idx, row_data in enumerate(personas_rows):
        row = persona_table.rows[r_idx + 1]
        bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, text in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = p_col_widths[c_idx]
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            set_cell_background(cell, bg_col)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(text)
            run.font.size = Pt(8.5)
            if c_idx == 0:
                run.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Ports & Endpoints Table
    add_custom_heading("Service Endpoints & Port Verification Checklist", 2)
    endpoint_table = doc.add_table(rows=8, cols=4)
    endpoint_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(endpoint_table, color="CBD5E1")

    ep_headers = ["Check", "Service / Component", "Local Port & URL", "Expected Behavior / Verification"]
    ep_col_widths = [Inches(0.6), Inches(1.8), Inches(2.2), Inches(2.7)]

    for c_idx, cell in enumerate(endpoint_table.rows[0].cells):
        cell.width = ep_col_widths[c_idx]
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        set_cell_background(cell, "334155") # Slate 700
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(ep_headers[c_idx])
        run.bold = True
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(255, 255, 255)

    endpoints_data = [
        ("☐ [ ]", "Ecosystem Portal (Web)", "http://localhost:3000", "Loads Central Governance UI, KPI Dashboard, App Launcher"),
        ("☐ [ ]", "Ecosystem Core API", "http://localhost:4000/api/v1/health", "Returns status 200 with database health and uptime"),
        ("☐ [ ]", "HRFlow Frontend (Web)", "http://localhost:3001", "Loads HRMS portal with 12-tab dossier and payroll suite"),
        ("☐ [ ]", "HRFlow Backend API", "http://localhost:5000/api/health", "Returns status 200 with hrflow_db connectivity"),
        ("☐ [ ]", "MAINTLY Frontend (Web)", "http://localhost:3002", "Loads Maintenance Ops dashboard with 13 view counters"),
        ("☐ [ ]", "MAINTLY Backend API", "http://localhost:5002/api/health", "Returns status 200 with maintly_db connectivity"),
        ("☐ [ ]", "Keycloak Identity Provider", "http://localhost:8080/realms/automobile-ecosystem/.well-known/openid-configuration", "Returns OIDC discovery metadata with RS256 JWKS")
    ]

    for r_idx, row_data in enumerate(endpoints_data):
        row = endpoint_table.rows[r_idx + 1]
        bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, text in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = ep_col_widths[c_idx]
            set_cell_margins(cell, top=65, bottom=65, left=80, right=80)
            set_cell_background(cell, bg_col)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(text)
            run.font.size = Pt(8.5)
            if c_idx == 0:
                run.bold = True
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # =========================================================================
    # REUSABLE TABLE GENERATOR FOR MODULE TEST CASES
    # =========================================================================
    def render_test_cases_table(module_title, test_cases):
        add_custom_heading(module_title, 2)
        
        tc_table = doc.add_table(rows=len(test_cases) + 1, cols=6)
        tc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tc_table, color="CBD5E1")

        tc_headers = ["Check", "Test ID", "Scenario / Objective", "Step-by-Step Test Procedure", "Expected Result", "Status & Sign-Off"]
        tc_widths = [Inches(0.5), Inches(0.95), Inches(1.4), Inches(1.85), Inches(1.6), Inches(1.0)]

        for c_idx, cell in enumerate(tc_table.rows[0].cells):
            cell.width = tc_widths[c_idx]
            set_cell_margins(cell, top=80, bottom=80, left=70, right=70)
            set_cell_background(cell, "1E3A8A")
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(tc_headers[c_idx])
            run.bold = True
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(255, 255, 255)
            if c_idx == 0 or c_idx == 5:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

        for r_idx, tc in enumerate(test_cases):
            row = tc_table.rows[r_idx + 1]
            bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            
            # [check, tc_id, scenario, procedure, expected, status]
            row_vals = [
                "☐ [ ]",
                tc["id"],
                tc["scenario"],
                tc["procedure"],
                tc["expected"],
                "[ ] Pass\n[ ] Fail\n[ ] Block"
            ]

            for c_idx, val in enumerate(row_vals):
                cell = row.cells[c_idx]
                cell.width = tc_widths[c_idx]
                set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
                set_cell_background(cell, bg_col)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                run = p.add_run(val)
                run.font.size = Pt(8.0)
                if c_idx == 0:
                    run.bold = True
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif c_idx == 1:
                    run.bold = True
                    run.font.color.rgb = RGBColor(30, 58, 138)
                elif c_idx == 5:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    run.font.size = Pt(7.5)

        doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # =========================================================================
    # PART 1: ECOSYSTEM CORE PLATFORM & PORTAL (PORT 3000 / 4000)
    # =========================================================================
    add_custom_heading("PART 1: ECOSYSTEM CORE PLATFORM & CENTRAL PORTAL", 1)

    # 1.1 Auth & SSO
    render_test_cases_table("Module 1.1: Authentication, Keycloak OIDC & Single Sign-On (SSO)", [
        {
            "id": "CORE-AUTH-001",
            "scenario": "Platform Admin Login via Ecosystem Portal",
            "procedure": "1. Navigate to http://localhost:3000/login\n2. Enter 'admin@ecosystem.com' & 'Admin@123'\n3. Click 'Sign In'",
            "expected": "Redirects to Executive KPI Dashboard (/dashboard). Token contains GLOBAL platform admin claims. Top bar displays 'Platform SuperAdmin'."
        },
        {
            "id": "CORE-AUTH-002",
            "scenario": "1-Click Persona Login (Pre-configured Dealership Accounts)",
            "procedure": "1. Go to /login\n2. Click 'Bellad Group MD' persona button\n3. Click 'Rajesh Sharma (Hubli BM)' persona button",
            "expected": "Instant seamless authentication without manual typing. Context switcher adjusts tenant/branch automatically to selected role."
        },
        {
            "id": "CORE-AUTH-003",
            "scenario": "Invalid Credentials & Password Mismatch Validation",
            "procedure": "1. At /login, enter 'admin@ecosystem.com' with wrong password 'WrongPass'\n2. Click 'Sign In'",
            "expected": "Returns HTTP 401 Unauthorized. Error toast displays 'Invalid email or password'. User remains on login screen; no JWT issued."
        },
        {
            "id": "CORE-AUTH-004",
            "scenario": "Session Expiration & Secure Token Refresh",
            "procedure": "1. Log into Portal\n2. Inspect React state memory (tokens NOT in localStorage)\n3. Verify HTTPOnly session cookie\n4. Wait/trigger refresh token cycle",
            "expected": "Access token is retrieved in-memory. Zero security leakage in localStorage. Token refreshes smoothly without user disruption."
        },
        {
            "id": "CORE-AUTH-005",
            "scenario": "Logout & Global Single Sign-Out Revocation",
            "procedure": "1. Click user avatar in header\n2. Click 'Sign Out'\n3. Attempt navigating back to /dashboard via browser back button",
            "expected": "Session terminated, tokens wiped. Back button redirects to /login. Protected API calls reject with HTTP 401."
        }
    ])

    # 1.2 Tenant Onboarding
    render_test_cases_table("Module 1.2: Dealership Groups / Tenants Management (/tenants)", [
        {
            "id": "CORE-TNT-001",
            "scenario": "View All Dealership Groups with Pagination",
            "procedure": "1. Login as Platform Admin\n2. Navigate to '/tenants'\n3. Observe tenant cards and table",
            "expected": "Displays 'Bellad Group' (BELLAD) and 'Apex Auto Group' (APEX). Active status badges, subscription tiers, and contact details shown."
        },
        {
            "id": "CORE-TNT-002",
            "scenario": "Onboard New Dealership Group (Mandatory Fields Contract)",
            "procedure": "1. Click 'Onboard Dealership Group'\n2. Enter Name: 'Kalyani Automotive Group', Legal: 'Kalyani Motors Pvt Ltd', Code: 'KALYANI', Tier: 'ENTERPRISE', Email: 'admin@kalyani.in'\n3. Click Save",
            "expected": "Returns HTTP 201 Created. New tenant appears in list. Legal entity and default hierarchy structures initialize."
        },
        {
            "id": "CORE-TNT-003",
            "scenario": "Reject Incomplete Onboarding (Missing legalName Contract)",
            "procedure": "1. Attempt creating tenant with Code: 'TEST_INC', Name: 'Incomplete Motors', but leave 'legalName' empty\n2. Submit",
            "expected": "Backend rejects with HTTP 400 VALIDATION_ERROR: 'Tenant code, name, and legalName are required.' Form highlights required field."
        },
        {
            "id": "CORE-TNT-004",
            "scenario": "Reject Duplicate Dealership Tenant Code",
            "procedure": "1. Try onboarding tenant with Code: 'BELLAD' (existing code)\n2. Submit",
            "expected": "Returns HTTP 400 VALIDATION_ERROR: 'Tenant with this code already exists.' No duplicate database records created."
        },
        {
            "id": "CORE-TNT-005",
            "scenario": "Tenant Suspension & Instant Access Revocation",
            "procedure": "1. Toggle tenant status for test group to 'SUSPENDED'\n2. Attempt logging in as a user belonging to suspended tenant",
            "expected": "Login rejected with HTTP 403: 'Dealership group account has been suspended. Please contact administrator.' Access revoked immediately."
        }
    ])

    # 1.3 Legal Entities & Brands
    render_test_cases_table("Module 1.3: Legal Corporate Entities (Firms) & OEM Brands (/firms-brands)", [
        {
            "id": "CORE-FRM-001",
            "scenario": "Create Legal Corporate Entity with Indian Statutory Tax IDs",
            "procedure": "1. Go to '/firms-brands'\n2. Click 'Add Legal Firm'\n3. Enter Name: 'Bellad Motors Pvt Ltd', Code: 'BMPL', PAN: 'AABCB1234F', GSTIN: '29AABCB1234F1Z5', State: 'Karnataka'\n4. Save",
            "expected": "Firm created and bound to tenant. PAN and GSTIN regex validation passes. Firm appears under legal corporate roster."
        },
        {
            "id": "CORE-FRM-002",
            "scenario": "Validate PAN and GSTIN Format Constraints",
            "procedure": "1. Add Firm with invalid PAN ('1234INVALID') and bad GSTIN ('GST123')\n2. Submit",
            "expected": "Form validation blocks submission. Shows format helper: PAN format: [A-Z]{5}[0-9]{4}[A-Z]{1}, GSTIN format: 15 characters."
        },
        {
            "id": "CORE-BRD-001",
            "scenario": "OEM Automotive Brand Catalog & Franchise Linking",
            "procedure": "1. View OEM Brands tab (Hyundai, Toyota, Maruti Suzuki, Tata Motors)\n2. Click 'Bind Dealership Agreement'\n3. Select Firm: 'BMPL', Brand: 'Hyundai', Agreement: 'DA-HYU-2023-001'\n4. Save",
            "expected": "FirmBrand dealership agreement link created. Allows branches to inherit OEM franchise certification."
        }
    ])

    # 1.4 Branches & Facilities
    render_test_cases_table("Module 1.4: Physical Facilities (Branches) & Departments (/branches)", [
        {
            "id": "CORE-BRN-001",
            "scenario": "Add Physical Dealership Facility (Showroom / 3S / Workshop)",
            "procedure": "1. Navigate to '/branches'\n2. Click 'Add Facility'\n3. Select Firm: 'BMPL', FirmBrand: 'Hyundai'\n4. Enter Code: 'HBL-MAIN-01', Name: 'Hubli Main 3S Facility', Type: '3S_FACILITY', Address: 'Gokul Road', Pincode: '580030'\n5. Save",
            "expected": "Branch created successfully. Automatic provisioning of 6 core automotive departments (Sales, Service, Bodyshop, Spares, Accounts, HR)."
        },
        {
            "id": "CORE-BRN-002",
            "scenario": "Verify Auto-Provisioned Automotive Functional Departments",
            "procedure": "1. Click on newly created branch details\n2. Open 'Departments & Bays' section",
            "expected": "Confirms presence of auto-created departments: SALES, SERVICE, BODYSHOP, SPARES, ACCOUNTS, HR with correct branchId mapping."
        },
        {
            "id": "CORE-BRN-003",
            "scenario": "Facility Filter by Outlet Type and Brand",
            "procedure": "1. In /branches, use filter dropdown to select 'Outlet Type: WORKSHOP'\n2. Filter by 'Brand: Hyundai'",
            "expected": "Table dynamically filters to display matching workshop facilities (e.g. Belgaum Workshop). Correct counts reflected."
        }
    ])

    # 1.5 Users & Floating Staff
    render_test_cases_table("Module 1.5: Central Staff Directory & Multi-Branch Floating Memberships (/users)", [
        {
            "id": "CORE-USR-001",
            "scenario": "Create Central User Account with Primary Branch Membership",
            "procedure": "1. Go to '/users'\n2. Click 'Add User'\n3. Enter Email: 'new.advisor@belladgroup.com', Name: 'Anil Kumar', Emp Code: 'BG-HBL-105', Primary Branch: 'Hubli Main 3S', Dept: 'SERVICE'\n4. Submit",
            "expected": "User created with hashed password in database. Primary OrganizationMembership created. User listed in active directory."
        },
        {
            "id": "CORE-USR-002",
            "scenario": "Assign Secondary Floating Memberships (Multi-Branch Staff)",
            "procedure": "1. Edit user 'Anil Kumar'\n2. Under 'Assigned Facilities', add Secondary Membership for 'Belgaum Workshop'\n3. Save",
            "expected": "User has 1 primary + 1 secondary membership. In session tokens, req.branchIds contains both Hubli and Belgaum IDs."
        },
        {
            "id": "CORE-USR-003",
            "scenario": "User Account Suspension & Immediate Token Invalidation",
            "procedure": "1. Toggle user 'Anil Kumar' status from ACTIVE to SUSPENDED\n2. In a separate browser, attempt API calls or login with Anil's account",
            "expected": "Auth middleware checks user.status on each request. Returns HTTP 403 USER_SUSPENDED. Immediate lockout enforced."
        }
    ])

    # 1.6 Scoped RBAC
    render_test_cases_table("Module 1.6: Scoped Role-Based Access Control (RBAC) & Permissions (/roles)", [
        {
            "id": "CORE-RBC-001",
            "scenario": "Inspect 23 Granular Dot-Notation System Permissions",
            "procedure": "1. Navigate to '/roles'\n2. Open Permissions Catalog tab\n3. Review categories: Platform, Org, HRMS (hr.*), Maintenance (maintenance.*)",
            "expected": "All 23 permissions displayed with unique codes, domains, actions, and descriptions. Read-only system permissions protected."
        },
        {
            "id": "CORE-RBC-002",
            "scenario": "Create Custom Dealership Role with Selected Permissions",
            "procedure": "1. Click 'Create Role'\n2. Name: 'Bodyshop Supervisor', Code: 'BODYSHOP_SUP'\n3. Check: maintenance.ticket.create, maintenance.ticket.execute, maintenance.purchase.request\n4. Save",
            "expected": "Role stored in ecosystem_core_db. RolePermission mappings established for checked permissions only."
        },
        {
            "id": "CORE-RBC-003",
            "scenario": "Scoped Role Assignment (Branch vs Tenant vs Global)",
            "procedure": "1. Assign 'BRANCH_MANAGER' role to user 'bm.hubli@belladgroup.com' with Scope: BRANCH and branchId = Hubli Main\n2. Verify user claims",
            "expected": "User receives manager rights strictly bounded to Hubli branch. Access to Belgaum maintenance tickets/staff restricted."
        },
        {
            "id": "CORE-RBC-004",
            "scenario": "Cross-Tenant Security Boundary Enforcement",
            "procedure": "1. Login as Bellad Group MD\n2. Attempt making direct API GET request to /api/v1/tenants/{APEX_ID}/branches",
            "expected": "API strictly blocks request with HTTP 403 Forbidden: 'Cross-tenant access forbidden'. Zero data leakage between dealerships."
        }
    ])

    # 1.7 Dynamic App Registry & Launcher
    render_test_cases_table("Module 1.7: Application Registry & Dynamic App Launcher (/applications & /launcher)", [
        {
            "id": "CORE-APP-001",
            "scenario": "View Registered Autonomous Applications & Health Status",
            "procedure": "1. Go to '/applications'\n2. Inspect tiles: HRFlow HRMS, MAINTLY Operations, DemoApp\n3. Check live health probe indicators",
            "expected": "Applications show version, API base URL, supported events, and green 'ONLINE' health status badge."
        },
        {
            "id": "CORE-APP-002",
            "scenario": "Toggle Tenant Application Subscription Entitlement",
            "procedure": "1. For tenant 'Apex Auto Group', unsubscribe from 'DemoApp'\n2. Log in as Apex Admin\n3. Open '/launcher'",
            "expected": "DemoApp tile is hidden or displays 'Not Subscribed / Contact Admin'. Gating strictly enforced based on TenantApplication record."
        },
        {
            "id": "CORE-APP-003",
            "scenario": "1-Click Launch Application with SSO Token Propagation",
            "procedure": "1. In /launcher as Bellad MD, click 'Launch HRFlow'\n2. In a new tab, click 'Launch MAINTLY'",
            "expected": "Opens HRFlow (:3001) and MAINTLY (:3002). Browser passes KEYCLOAK_SESSION cookie; user logged in immediately without password prompt."
        }
    ])

    # 1.8 Sync Monitor & Audit Logs
    render_test_cases_table("Module 1.8: Sync Monitor & Compliance Audit Logs (/sync-monitor & /audit-logs)", [
        {
            "id": "CORE-MON-001",
            "scenario": "Enterprise Event Sync Monitor & Queue Metrics",
            "procedure": "1. Navigate to '/sync-monitor'\n2. Observe live RabbitMQ queue stats, Outbox status, and processed event counts",
            "expected": "Real-time cards show Published Events, Consumed Events, Failed Events, and DLQ count. Live polling updates without lag."
        },
        {
            "id": "CORE-MON-002",
            "scenario": "Inspect Outbox Event Payload in Modal",
            "procedure": "1. On /sync-monitor, click on any event in table (e.g. employee.created)\n2. Click 'Inspect Payload'",
            "expected": "Modal opens showing sanitized CloudEvents v1.0 JSON: eventId, tenantId, eventType, timestamp, and employee payload."
        },
        {
            "id": "CORE-AUD-001",
            "scenario": "Immutable Compliance Audit Log Trail",
            "procedure": "1. Navigate to '/audit-logs'\n2. Filter by Action: 'UPDATE', Resource: 'tenant'\n3. Expand audit record",
            "expected": "Displays timestamp, actor email, IP address, action, and JSON diff showing previous state vs updated state."
        }
    ])

    # =========================================================================
    # PART 2: HRFLOW - HRMS & INDIAN PAYROLL (PORT 3001 / 5000)
    # =========================================================================
    add_custom_heading("PART 2: HRFLOW - ENTERPRISE DEALERSHIP HRMS & PAYROLL", 1)

    # 2.1 Auth & Dashboard
    render_test_cases_table("Module 2.1: HRFlow Authentication & Executive HR Dashboard", [
        {
            "id": "HR-ATH-001",
            "scenario": "HRFlow Direct Login & Central Dealership SSO Bridge",
            "procedure": "1. Open http://localhost:3001\n2. Click 'Login with Dealership SSO'\n3. Observe redirect to Keycloak (:8080) and return to HRFlow callback",
            "expected": "Callback exchanges PKCE code for token. User enters HRFlow authenticated with dealership role and tenant context."
        },
        {
            "id": "HR-DSH-001",
            "scenario": "Executive Headcount & Attendance KPI Dashboard",
            "procedure": "1. On HRFlow Dashboard, inspect summary widgets:\n- Total Headcount\n- Today Present vs Absent\n- Pending Leave Approvals\n- Upcoming Birthdays & Probation",
            "expected": "KPI cards populate with real-time numbers from hrflow_db. Quick action buttons (Add Employee, Punch Attendance, Run Payroll) functional."
        }
    ])

    # 2.2 Employee Master 12-Tab Dossier
    render_test_cases_table("Module 2.2: Employee Master & 12-Tab Digital Dossier (/employees)", [
        {
            "id": "HR-EMP-001",
            "scenario": "View Paginated Dealership Staff Directory",
            "procedure": "1. Navigate to '/employees'\n2. Filter by Branch: 'Hubli Main', Department: 'SERVICE', Cadre: 'Level 5'\n3. Search by name 'Rajesh'",
            "expected": "Table filters dynamically. Shows employee photo/avatar, code, full name, branch, designation, contact, and active status."
        },
        {
            "id": "HR-EMP-002",
            "scenario": "Create New Dealership Employee (Tab 1: Personal & Contact)",
            "procedure": "1. Click 'Add New Employee'\n2. Fill First Name: 'Vikram', Last Name: 'Rathore', Code: 'BG-HBL-110', DOB: '1992-05-15', Blood Group: 'O+', Email: 'vikram.r@belladgroup.com', Phone: '9876543210'\n3. Save",
            "expected": "Step 1 creates employee record. Automatically triggers outbox event creation for inter-app sync."
        },
        {
            "id": "HR-EMP-003",
            "scenario": "Tab 2: Statutory Compliance Details (Indian Labour Standards)",
            "procedure": "1. In employee dossier, open 'Statutory' tab\n2. Enter UAN: '100908070605', PF No: 'KN/HBL/12345/001', ESIC No: '53000123450000001', PAN: 'ABCDE1234F', Aadhaar: '1234-5678-9012'\n3. Save",
            "expected": "Statutory fields saved. Data validated against Indian statutory formats. Sensitive Aadhaar displays masked."
        },
        {
            "id": "HR-EMP-004",
            "scenario": "Tab 3: Dealership Salary Structure & CTC Breakup",
            "procedure": "1. Open 'Salary Structure' tab\n2. Set Monthly CTC: ₹45,000\n3. Configure breakdown: Basic: ₹22,500 (50%), HRA: ₹11,250 (50% of Basic), DA: ₹4,500, Special Allowance: ₹6,750\n4. Save",
            "expected": "Total calculated dynamically matches ₹45,000. Statutory employer contributions (PF/ESI) preview correctly."
        },
        {
            "id": "HR-EMP-005",
            "scenario": "Tab 4: Bank Account & NEFT Payment Coordinates",
            "procedure": "1. Open 'Bank Details' tab\n2. Enter Bank: 'HDFC Bank', Branch: 'Hubli Gokul Road', Account No: '50100234567890', IFSC: 'HDFC0001234'\n3. Save",
            "expected": "Saved with IFSC validation. Account number masked (••••••••7890) for non-finance users."
        },
        {
            "id": "HR-EMP-006",
            "scenario": "Tab 5: KYC Documents & Digital Upload Audit",
            "procedure": "1. Open 'KYC Documents' tab\n2. Upload Aadhaar Card copy (PDF) and Driving License (JPG)\n3. Enter Expiration Date for Driving License",
            "expected": "Document uploads to secure storage. Status set to 'PENDING_VERIFICATION'. Expiration date indexed for alerts."
        },
        {
            "id": "HR-EMP-007",
            "scenario": "Tab 6: Workshop & IT Company Assets Allocation",
            "procedure": "1. Open 'Assets' tab\n2. Allocate Asset: 'Diagnostic Scan Tool OBD-II (Serial #ST-9021)' and 'Dell Latitude Laptop'\n3. Set Allocation Date",
            "expected": "Assets linked to employee. Listed under active employee custody. Indexed for exit clearance NOC."
        },
        {
            "id": "HR-EMP-008",
            "scenario": "Tab 7 to 12: Attendance, Leave, Discipline, Transfers & Family",
            "procedure": "1. Inspect tabs: Attendance History, Leave Ledger, Disciplinary Notices, Branch Transfer Logs, Dependents, Education\n2. Add family dependent (Spouse) for mediclaim coverage",
            "expected": "All 12 tabs load historical audit records without tab crashes. Dependent stored for group insurance."
        }
    ])

    # 2.3 Org Chart & Recruitment
    render_test_cases_table("Module 2.3: Organization Hierarchy, Cadre Levels & Recruitment ATS", [
        {
            "id": "HR-ORG-001",
            "scenario": "Interactive Dealership Organization Chart Visualization",
            "procedure": "1. Navigate to '/org-chart'\n2. Expand root node 'Agastya Bellad (MD - Level 1)'\n3. Drill down to Branch Managers (Level 3) and Service Advisors (Level 5)",
            "expected": "Dynamic tree renders reporting relationships smoothly. Shows cadre level, designation badge, and team headcount."
        },
        {
            "id": "HR-ATS-001",
            "scenario": "Create Dealership Job Requisition / Vacancy",
            "procedure": "1. Navigate to '/vacancies'\n2. Click 'Create Vacancy'\n3. Title: 'Senior Bodyshop Painter', Branch: 'Hubli Main', Department: 'BODYSHOP', Openings: 2, Min Exp: 3 Years\n4. Publish",
            "expected": "Vacancy created and listed. Status set to 'OPEN'. Ready for applicant pipeline."
        },
        {
            "id": "HR-ATS-002",
            "scenario": "Candidate ATS Kanban Pipeline & 1-5 Star Ratings",
            "procedure": "1. Open Vacancy candidate Kanban board\n2. Add candidate 'Ramesh Naik', Phone: '9845011223'\n3. Drag candidate from 'Applied' -> 'Screening' -> 'Technical Interview'\n4. Submit 4-star rating and technical interview notes",
            "expected": "Candidate moves across stages. Rating and notes logged with interviewer identity and timestamp."
        },
        {
            "id": "HR-ATS-003",
            "scenario": "Convert Hired Candidate Directly to Employee Dossier",
            "procedure": "1. Move candidate to 'Offered' -> 'Hired'\n2. Click 'Onboard as Employee'\n3. Verify pre-populated biographical data",
            "expected": "Auto-populates Employee Master creation wizard. Eliminates duplicate data entry. Hired candidate archived."
        }
    ])

    # 2.4 Attendance, Leave & Advances
    render_test_cases_table("Module 2.4: Attendance 2.0, Leaves, Advances & Expense Claims", [
        {
            "id": "HR-ATT-001",
            "scenario": "Daily Punch-in / Punch-out with Geofence & Device Validation",
            "procedure": "1. Navigate to '/attendance'\n2. Click 'Punch In' at 09:05 AM\n3. Click 'Punch Out' at 06:15 PM",
            "expected": "Punch recorded with exact timestamp. Total hours calculated (9 hrs 10 mins). Status flagged as 'PRESENT'."
        },
        {
            "id": "HR-ATT-002",
            "scenario": "Attendance Regularization Request & Manager Approval",
            "procedure": "1. Employee submits regularization for missed punch on yesterday\n2. Reason: 'Customer roadside assistance breakdown visit'\n3. Branch Manager reviews under '/approvals' and clicks Approve",
            "expected": "Status updates to 'VALIDATED'. Daily attendance log marked regularized with manager sign-off stamp."
        },
        {
            "id": "HR-LEV-001",
            "scenario": "Apply for Leave with Balance Check & Holiday Exclusion",
            "procedure": "1. Go to '/leave'\n2. Select Leave Type: 'Earned Leave (EL)'\n3. Select Dates: Monday to Wednesday (3 days)\n4. Submit request",
            "expected": "Calculates working days excluding Sundays and declared holidays. Deducts 3 days from available EL balance pending approval."
        },
        {
            "id": "HR-LEV-002",
            "scenario": "Manager Leave Approval / Rejection Workflow",
            "procedure": "1. Login as Hubli Branch Manager\n2. Open Pending Leave Approvals\n3. Review request and click 'Approve'",
            "expected": "Leave status changes to 'APPROVED'. Employee notified. Balance officially debited. Attendance calendar marked 'ON LEAVE'."
        },
        {
            "id": "HR-ADV-001",
            "scenario": "Salary Advance Request & Monthly EMI Recovery Schedule",
            "procedure": "1. Go to '/advances'\n2. Request Advance: ₹15,000, Reason: 'Medical emergency', Repayment Tenor: 3 Months (₹5,000/mo)\n3. HR Officer approves request",
            "expected": "Advance approved. Schedule created in payroll queue: ₹5,000 deduction per month for next 3 payroll cycles."
        },
        {
            "id": "HR-CLM-001",
            "scenario": "File Conveyance / Expense Claim with Invoice Attachment",
            "procedure": "1. Go to '/claims'\n2. File Claim: 'Vehicle delivery fuel expense - ₹2,500'\n3. Attach fuel station receipt\n4. Submit for manager sign-off",
            "expected": "Claim submitted with receipt preview. Routes to Accounts approver. Approved claims credited in next salary run."
        }
    ])

    # 2.5 Payroll & Statutory Compliance
    render_test_cases_table("Module 2.5: Executive Indian Dealership Payroll & Bank Advice (/payroll)", [
        {
            "id": "HR-PAY-001",
            "scenario": "Run Monthly Dealership Payroll Cycle",
            "procedure": "1. Navigate to '/payroll'\n2. Select Month: 'September 2026', Branch: 'Hubli Main 3S Facility'\n3. Click 'Process Payroll Batch'",
            "expected": "Batch runs across active employees. Calculates lop (loss of pay) days, gross salary, deductions, and net payable salary."
        },
        {
            "id": "HR-PAY-002",
            "scenario": "Automated Indian Statutory Deductions (EPF, ESIC, PT)",
            "procedure": "1. Inspect calculated salary record for Employee earning ₹30,000 gross:\n- EPF (12% of Basic/DA capped at ₹1,800 or actual)\n- ESIC (0.75% of Gross if gross <= ₹21,000)\n- Karnataka Professional Tax (PT: ₹200)",
            "expected": "Deductions strictly comply with Indian statutory rules. EPF and PT exact to statutory slabs. Zero calculation drift."
        },
        {
            "id": "HR-PAY-003",
            "scenario": "Salary Slip Modal with Dealership Letterhead Format",
            "procedure": "1. In processed payroll batch, click 'View Payslip' for an employee\n2. Click 'Download PDF'",
            "expected": "Letterhead modal displays Dealership Logo, Firm Name, PAN, GSTIN, Employee UAN/PF, Earnings table, Deductions table, and Net Pay in words."
        },
        {
            "id": "HR-PAY-004",
            "scenario": "Generate Bank NEFT Payment Advice (CSV Export)",
            "procedure": "1. In completed payroll batch, click 'Export Bank Advice'\n2. Select Bank Format: 'HDFC Bank NEFT / RTGS Format'",
            "expected": "Downloads CSV containing: Beneficiary Name, Account Number, IFSC Code, Net Amount, Dealership Debit Account, and Narration."
        }
    ])

    # 2.6 Exit Clearance & NOC
    render_test_cases_table("Module 2.6: Exit Clearance, 3-Tier Departmental NOC & F&F Settlement (/exit)", [
        {
            "id": "HR-EXT-001",
            "scenario": "Submit Resignation & Notice Period Calculation",
            "procedure": "1. Navigate to '/exit'\n2. Click 'Initiate Resignation'\n3. Select Employee, Resignation Date: '2026-10-01', Notice Period: 30 Days\n4. Submit",
            "expected": "Last Working Day (LWD) automatically calculated as '2026-10-31'. Status set to 'NOTICE_PERIOD'. Outbox event queued."
        },
        {
            "id": "HR-EXT-002",
            "scenario": "3-Tier Departmental NOC Clearances (Workshop, IT, Accounts)",
            "procedure": "1. Open Employee Exit Clearance record\n2. Workshop Supervisor signs off: 'All diagnostic tools & bay lockers returned'\n3. IT Admin signs off: 'Laptop, SIM card & portal accounts cleared'\n4. Accounts Officer signs off: 'Zero pending advances'",
            "expected": "All 3 NOC tiers marked 'CLEARED' with individual manager timestamps. Unlocks Full & Final (F&F) settlement calculator."
        },
        {
            "id": "HR-EXT-003",
            "scenario": "Full & Final (F&F) Settlement Calculation & Relieving Letter",
            "procedure": "1. Click 'Compute F&F Settlement'\n2. Review computed items: Earned salary for worked days, Leave encashment, Gratuity (if >5 yrs), Minus notice shortfall\n3. Click 'Finalize & Generate Relieving Letter'",
            "expected": "F&F statement generated. Relieving letter & Service certificate rendered with company seal. Employee status updated to 'RESIGNED'."
        }
    ])

    # =========================================================================
    # PART 3: MAINTLY - OPERATIONS & MAINTENANCE (PORT 3002 / 5002)
    # =========================================================================
    add_custom_heading("PART 3: MAINTLY - FACILITY MAINTENANCE & OPERATIONS", 1)

    # 3.1 Auth & Dashboard
    render_test_cases_table("Module 3.1: MAINTLY Authentication & Operations Dashboard", [
        {
            "id": "MNT-ATH-001",
            "scenario": "MAINTLY Login via Central Dealership SSO Bridge",
            "procedure": "1. Open http://localhost:3002\n2. Click 'Login with Dealership SSO'\n3. Validate PKCE code exchange with Keycloak (:8080)",
            "expected": "Authenticated successfully. Claims populate req.branchIds and maintenance permissions. Landing at /dashboard."
        },
        {
            "id": "MNT-DSH-001",
            "scenario": "Maintenance Operations Real-Time Counters & SLA Alerts",
            "procedure": "1. Inspect Dashboard KPI cards:\n- Active Repair Requests\n- High / Critical Priority Outages\n- Pending Manager Sign-offs\n- Monthly Maintenance Spend vs Cap",
            "expected": "Real-time metrics display accurately. High-priority cards glow with warning indicators if SLA breach is imminent."
        }
    ])

    # 3.2 Tickets & Lifecycle
    render_test_cases_table("Module 3.2: Maintenance Ticket Lifecycle & Workflow (/requests)", [
        {
            "id": "MNT-TKT-001",
            "scenario": "Raise Maintenance Repair Ticket (Critical Workshop Breakdown)",
            "procedure": "1. Go to '/requests' -> Click 'Raise Maintenance Request'\n2. Title: '2-Post Hydraulic Lift #3 Pressure Failure'\n3. Branch: 'Hubli Main', Category: 'HYDRAULIC_EQUIPMENT', Priority: 'CRITICAL'\n4. Upload photo of leaking hydraulic hose\n5. Submit",
            "expected": "Ticket created with status 'OPEN'. Response SLA countdown timer initialized (e.g. 1 hour). Ticket assigned a unique tracking number."
        },
        {
            "id": "MNT-TKT-002",
            "scenario": "Assign Ticket to Internal Technician or Empaneled Vendor",
            "procedure": "1. Open ticket details\n2. Click 'Assign Work'\n3. Select Technician: 'Suresh Patil (Master Diagnostic Technician)'\n4. Assign Bay: 'Mechanical Bay 03'",
            "expected": "Ticket transitions to 'ASSIGNED'. Notification dispatched to technician. Technician dashboard displays new task."
        },
        {
            "id": "MNT-TKT-003",
            "scenario": "Technician Work Log & Status Transition to IN_PROGRESS",
            "procedure": "1. Login as Suresh Patil (Technician)\n2. Open assigned ticket and click 'Start Work'\n3. Add work note: 'Inspected valve; replacement hydraulic seal required'\n4. Log 1.5 labor hours",
            "expected": "Status updates to 'IN_PROGRESS'. Work log, technician name, and elapsed labor time appended to immutable timeline."
        },
        {
            "id": "MNT-TKT-004",
            "scenario": "Ticket Waiting on Parts (PENDING_PARTS Transition)",
            "procedure": "1. Click 'Put on Hold - Pending Parts'\n2. Link spare parts requisition #PR-901\n3. Save",
            "expected": "Status changes to 'PENDING_PARTS'. Resolution SLA timer temporarily pauses or flags parts dependency."
        },
        {
            "id": "MNT-TKT-005",
            "scenario": "Resolve Ticket, Completion Photo & Manager Sign-Off",
            "procedure": "1. Technician installs parts, clicks 'Mark as Resolved'\n2. Upload photo of repaired hydraulic lift\n3. Branch Manager inspects and clicks 'Verify & Close'",
            "expected": "Status moves 'RESOLVED' -> 'CLOSED'. Total MTTR recorded. Equipment marked OPERATIONAL. Timeline permanently locked."
        }
    ])

    # 3.3 SLA Engine & Approvals
    render_test_cases_table("Module 3.3: SLA Engine, Breach Detection & Approval Matrix", [
        {
            "id": "MNT-SLA-001",
            "scenario": "Real-Time SLA Countdown & Escalation Breach Badge",
            "procedure": "1. Create ticket with Priority 'CRITICAL' (Response SLA: 1 Hr, Resolution SLA: 4 Hrs)\n2. Allow time or simulate response SLA threshold exceeded",
            "expected": "System flags SLA Breach! Badge turns RED ('BREACHED'). Automated escalation alert logged in audit trail."
        },
        {
            "id": "MNT-APR-001",
            "scenario": "Expenditure Approval Threshold Routing (> ₹10,000)",
            "procedure": "1. In repair ticket, add estimated expenditure: ₹18,500 (Exceeds ₹10k threshold)\n2. Submit estimate",
            "expected": "Repair placed in 'PENDING_APPROVAL' state. Routes to Branch Manager inbox. Technician cannot execute until approved."
        },
        {
            "id": "MNT-APR-002",
            "scenario": "High-Value Expenditure Escalation (> ₹50,000 to MD)",
            "procedure": "1. Repair cost estimate: ₹75,000 for Paint Booth burner unit\n2. Submit estimate",
            "expected": "Routes automatically to Managing Director approval level. Bypasses lower branch threshold."
        }
    ])

    # 3.4 Preventive Maintenance & Assets
    render_test_cases_table("Module 3.4: Preventive Maintenance (PM) & Facility Asset Register", [
        {
            "id": "MNT-PM-001",
            "scenario": "Create Recurring Preventive Maintenance Schedule",
            "procedure": "1. Go to '/preventive-maintenance'\n2. Click 'Add PM Schedule'\n3. Asset: 'Main Screw Compressor Atlas Copco', Frequency: 'MONTHLY', Next Due Date: '2026-11-01'\n4. Add checklist items: Check oil level, Drain moisture, Inspect belt tension\n5. Save",
            "expected": "PM Schedule activated. Scheduler creates automated work order when due date arrives with attached inspection checklist."
        },
        {
            "id": "MNT-AST-001",
            "scenario": "Dealership Facility Asset Register & QR Tagging",
            "procedure": "1. Navigate to '/assets'\n2. Click 'Add Asset'\n3. Name: 'Paint Booth Air Filtration System', Model: 'Blowtherm Extra', Serial: 'BT-8821', Bay: 'Bodyshop Bay 1', Purchase Date: '2024-03-15'\n4. Save",
            "expected": "Asset created with unique QR/Asset ID. Condition set to 'OPERATIONAL'. Full maintenance history tab initialized."
        },
        {
            "id": "MNT-AST-002",
            "scenario": "Asset Breakdown & Downtime Logging",
            "procedure": "1. When critical ticket raised against Paint Booth, set asset status to 'OUT_OF_SERVICE'\n2. Monitor downtime tracker until ticket resolution",
            "expected": "Asset card shows red OUT_OF_SERVICE indicator. Downtime counter records hours out of service for MTBF reporting."
        }
    ])

    # 3.5 Purchases & Vendors
    render_test_cases_table("Module 3.5: Purchases, Spare Parts & Vendor Management", [
        {
            "id": "MNT-PUR-001",
            "scenario": "Raise Spare Parts Purchase Requisition for Maintenance",
            "procedure": "1. Navigate to '/purchases'\n2. Click 'New Purchase Requisition'\n3. Items: 'Hydraulic Seal Kit (Qty 2) - ₹4,500', 'ISO 68 Hydraulic Oil 20L - ₹3,800'\n4. Link Ticket: 'Hydraulic Lift Repair'\n5. Submit",
            "expected": "Requisition PR-901 created. Routes to Procurement Approver. Items linked directly to maintenance work order."
        },
        {
            "id": "MNT-VND-001",
            "scenario": "Empaneled Service Vendor Directory & Performance Ratings",
            "procedure": "1. Navigate to '/vendors'\n2. Add Vendor: 'Atlas Copco Authorized Service', Category: 'PNEUMATICS_COMPRESSOR', Contact: 'Ravi Verma', Phone: '9845001122'\n3. Log completed AMC visit and submit 5-star performance rating",
            "expected": "Vendor saved with GSTIN and AMC contract expiry date. Average performance rating recalculates dynamically."
        }
    ])

    # 3.6 Analytics & Reports
    render_test_cases_table("Module 3.6: 13 View Counters, Analytics Hub & Master Data", [
        {
            "id": "MNT-ANL-001",
            "scenario": "Inspect 13 View Counters & Dealership Maintenance Metrics",
            "procedure": "1. Navigate to '/analytics'\n2. Review metrics:\n- Mean Time to Acknowledge (MTTA)\n- Mean Time to Repair (MTTR)\n- SLA Breach Ratio by Facility\n- Reactive vs Preventive Maintenance Ratio\n- Category Breakdown (Electrical, Hydraulic, HVAC, Civil)",
            "expected": "Analytics charts load with real database statistics. Filters by Date range and Branch reflect correct trends."
        },
        {
            "id": "MNT-MST-001",
            "scenario": "Configure Master Data (Categories, Bay Codes & Priorities)",
            "procedure": "1. Navigate to '/master-data'\n2. Add new Category: 'EV Charging Infrastructure'\n3. Add new Bay: 'EV High Voltage Bay 01'\n4. Save",
            "expected": "New category and bay immediately available in Maintenance Request creation form across Hubli branch."
        }
    ])

    # =========================================================================
    # PART 4: CROSS-APP EVENT SYNCHRONIZATION & SDK (PORT 3000/3001/3002/5672)
    # =========================================================================
    add_custom_heading("PART 4: CROSS-APPLICATION SYNCHRONIZATION & SDK", 1)

    render_test_cases_table("Module 4.1: Real-Time Employee Lifecycle Sync (HRFlow -> RabbitMQ -> MAINTLY)", [
        {
            "id": "SYNC-EVT-001",
            "scenario": "New Employee Creation Sync (employee.created Event)",
            "procedure": "1. In HRFlow, create employee 'Karan Deshmukh' in Hubli Service department\n2. Inspect HRFlow Outbox: Verify status transitions PENDING -> PUBLISHING -> PUBLISHED\n3. Inspect RabbitMQ Management (:15672): Topic 'automobile.events.topic'\n4. Inspect MAINTLY (/users or EmployeeReference table)",
            "expected": "MAINTLY consumer consumes event and creates EmployeeReference record. Karan appears in MAINTLY technician assignment list!"
        },
        {
            "id": "SYNC-EVT-002",
            "scenario": "Sensitive HR Data Stripping Verification (Zero PII/Salary Leakage)",
            "procedure": "1. Check the event payload for 'employee.created' in Portal Sync Monitor\n2. Inspect MAINTLY database EmployeeReference table",
            "expected": "CONFIRMED: Salary, Bank details, PAN, Aadhaar, and CTC are completely omitted from sync payload. Zero security leakage!"
        },
        {
            "id": "SYNC-EVT-003",
            "scenario": "Employee Branch Transfer Sync (employee.transferred Event)",
            "procedure": "1. In HRFlow, transfer 'Karan Deshmukh' from Hubli Main to Belgaum Workshop\n2. Wait 2 seconds for event publication and consumption\n3. Check Karan in MAINTLY",
            "expected": "MAINTLY updates Karan's local branch assignment to Belgaum. He now appears in Belgaum's technician roster."
        },
        {
            "id": "SYNC-EVT-004",
            "scenario": "Employee Exit / Deactivation Sync with Historical Ticket Preservation",
            "procedure": "1. In HRFlow, complete resignation for an employee who has historical maintenance tickets in MAINTLY\n2. Observe event 'employee.deactivated'\n3. Check MAINTLY EmployeeReference status and historical tickets",
            "expected": "MAINTLY marks EmployeeReference.status = 'INACTIVE'. CRITICAL: Past tickets and work orders remain fully preserved and intact!"
        },
        {
            "id": "SYNC-EVT-005",
            "scenario": "Idempotent Event Processing (Zero Duplicate Records on Replay)",
            "procedure": "1. In Ecosystem Portal (/sync-monitor), find a processed 'employee.created' event\n2. Click 'Retry / Re-dispatch Event'\n3. Inspect MAINTLY database and UI",
            "expected": "MAINTLY ProcessedEvent checks unique eventId. Recognizes duplicate and safely ignores it. Exactly 1 employee record remains."
        },
        {
            "id": "SYNC-EVT-006",
            "scenario": "Dead-Letter Queue (DLQ) & Failure Recovery Workflow",
            "procedure": "1. Submit an invalid event payload with missing tenantId\n2. Inspect queue 'maintly.employee.sync.dlq'\n3. Open Ecosystem Portal -> Sync Monitor -> DLQ alerts\n4. Inspect error trace and click 'Replay'",
            "expected": "Malformed event routed to DLQ without crashing event consumer. Portal shows red DLQ alert banner. Replay re-processes after payload fix."
        },
        {
            "id": "SYNC-EVT-007",
            "scenario": "Initial Bulk Sync Utility Execution (initialSync.js)",
            "procedure": "1. In MAINTLY backend, trigger initial sync API with X-Internal-Service-Key\n2. Observe console reconciliation log",
            "expected": "Fetches all HRFlow employees, matches existing records, imports missing ones. Zero duplicates created. Status 200 SUCCESS."
        }
    ])

    render_test_cases_table("Module 4.2: DemoApp Reference Implementation & Shared SDK", [
        {
            "id": "SDK-APP-001",
            "scenario": "DemoApp Authentication & Central Token Verification",
            "procedure": "1. Access DemoApp at http://localhost:5005\n2. Pass central Keycloak bearer token\n3. Verify request passes authMiddleware",
            "expected": "DemoApp validates token RS256 signature using @automobile-ecosystem/sdk. Extracts tenant and user context successfully."
        },
        {
            "id": "SDK-APP-002",
            "scenario": "Tenant Entitlement Gating for New Applications",
            "procedure": "1. Login as Bellad Group user (Subscribed to DemoApp) -> Check launcher\n2. Login as Apex Auto Group user (Not Subscribed) -> Check launcher",
            "expected": "DemoApp visible and accessible for Bellad Group. Strictly hidden and blocked for Apex Auto Group."
        },
        {
            "id": "SDK-AST-001",
            "scenario": "Zero-Eval AST Workflow Engine Rule Evaluation",
            "procedure": "1. Trigger approval workflow in DemoApp with condition: { 'gte': [{ 'var': 'amount' }, 10000] }\n2. Test amount = ₹15,000\n3. Test amount = ₹5,000",
            "expected": "Evaluates condition via pure AST JSON Logic without eval(). Amount ₹15k triggers Stage 2 approval; ₹5k auto-approves."
        }
    ])

    # =========================================================================
    # PART 5: INFRASTRUCTURE, GATEWAY & AUTOMATION RUNNER
    # =========================================================================
    add_custom_heading("PART 5: INFRASTRUCTURE, NGINX GATEWAY & AUTOMATION", 1)

    render_test_cases_table("Module 5.1: Unified Runner CLI, Nginx Gateway & Multi-Tenant DBs", [
        {
            "id": "INF-RUN-001",
            "scenario": "Unified Runner 1-Click Startup (start-ecosystem.bat)",
            "procedure": "1. Open Windows Command Prompt\n2. Run 'start-ecosystem.bat'\n3. Observe sequential boot of all 9 services (PostgreSQL 18, RabbitMQ, Keycloak, Core, HRFlow, MAINTLY, Web Portals)",
            "expected": "All services start without port conflicts. Status dashboard renders with all green 'ONLINE' badges."
        },
        {
            "id": "INF-RUN-002",
            "scenario": "Unified Runner Status Check (start-ecosystem.bat status)",
            "procedure": "1. Run 'start-ecosystem.bat status'\n2. Inspect terminal output",
            "expected": "Renders formatted table of all 9 ports with ONLINE/OFFLINE status and URL endpoints."
        },
        {
            "id": "INF-RUN-003",
            "scenario": "Unified Runner Clean Termination (start-ecosystem.bat stop)",
            "procedure": "1. Run 'start-ecosystem.bat stop'\n2. Run 'start-ecosystem.bat status'",
            "expected": "Gracefully terminates application processes on ports 3000, 3001, 3002, 4000, 5000, 5002, 5672, 8080. Keeps PostgreSQL active for data safety."
        },
        {
            "id": "INF-NGX-001",
            "scenario": "Nginx Reverse Proxy Gateway Routing (Port 80)",
            "procedure": "1. Navigate to http://localhost/ (Nginx)\n2. Navigate to http://localhost/hrflow\n3. Navigate to http://localhost/maintly\n4. Navigate to http://localhost/auth",
            "expected": "Nginx routes root to Portal (3000), /hrflow to HRFlow (3001), /maintly to MAINTLY (3002), and /auth to Keycloak (8080) under single origin."
        },
        {
            "id": "INF-SEC-001",
            "scenario": "HTTP Security Headers & Rate Limiting Enforcement",
            "procedure": "1. Inspect response headers on Nginx gateway:\n- X-Content-Type-Options: nosniff\n- X-Frame-Options: SAMEORIGIN\n- Strict-Transport-Security\n2. Send high-frequency requests (>30 req/sec)",
            "expected": "Security headers present on all responses. Rapid requests beyond threshold return HTTP 429 Too Many Requests."
        },
        {
            "id": "INF-DB-001",
            "scenario": "Database Multi-Tenant Isolation Guarantee",
            "procedure": "1. Inspect PostgreSQL 18 databases: ecosystem_core_db, hrflow_db, maintly_db\n2. Verify independent schemas, autonomous connections, and tenant ID foreign keys",
            "expected": "Complete structural isolation. Dealership data partitioned by tenantId. Foreign data access strictly rejected."
        }
    ])

    # =========================================================================
    # SUMMARY CHECKLIST & SIGN-OFF SECTION
    # =========================================================================
    add_custom_heading("6. QA Execution Summary & Sign-Off Matrix", 1)

    summary_table = doc.add_table(rows=6, cols=6)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(summary_table, color="CBD5E1")

    s_headers = ["Application / Domain", "Total Cases", "Passed", "Failed", "Blocked", "Lead QA Sign-Off"]
    s_widths = [Inches(2.2), Inches(0.9), Inches(0.9), Inches(0.9), Inches(0.9), Inches(1.5)]

    for c_idx, cell in enumerate(summary_table.rows[0].cells):
        cell.width = s_widths[c_idx]
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        set_cell_background(cell, "1E3A8A")
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(s_headers[c_idx])
        run.bold = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(255, 255, 255)
        if c_idx >= 1:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    summary_data = [
        ("Part 1: Ecosystem Core Platform & Portal", "24", "[   ]", "[   ]", "[   ]", "___________________"),
        ("Part 2: HRFlow - HRMS & Indian Payroll", "26", "[   ]", "[   ]", "[   ]", "___________________"),
        ("Part 3: MAINTLY - Facility Maintenance Ops", "22", "[   ]", "[   ]", "[   ]", "___________________"),
        ("Part 4: Cross-App Event Synchronization & SDK", "10", "[   ]", "[   ]", "[   ]", "___________________"),
        ("Part 5: Infrastructure, Gateway & Security", "6", "[   ]", "[   ]", "[   ]", "___________________")
    ]

    for r_idx, row_data in enumerate(summary_data):
        row = summary_table.rows[r_idx + 1]
        bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, text in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = s_widths[c_idx]
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            set_cell_background(cell, bg_col)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(text)
            run.font.size = Pt(8.5)
            if c_idx == 0:
                run.bold = True
            elif c_idx in [1, 2, 3, 4, 5]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Defect Tracking Log
    add_custom_heading("Defect & Observation Tracking Log", 2)
    p_defect = doc.add_paragraph()
    p_defect.add_run("Use the table below during manual testing to record any failed steps, UI anomalies, or error messages:").font.size = Pt(9.5)

    defect_table = doc.add_table(rows=6, cols=6)
    defect_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(defect_table, color="CBD5E1")

    d_headers = ["Bug #", "Test ID", "Application & Module", "Severity", "Defect Description & Steps", "Status"]
    d_widths = [Inches(0.6), Inches(1.0), Inches(1.5), Inches(0.9), Inches(2.3), Inches(1.0)]

    for c_idx, cell in enumerate(defect_table.rows[0].cells):
        cell.width = d_widths[c_idx]
        set_cell_margins(cell, top=80, bottom=80, left=70, right=70)
        set_cell_background(cell, "475569") # Slate 600
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(d_headers[c_idx])
        run.bold = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(255, 255, 255)
        if c_idx in [0, 3, 5]:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for r_idx in range(1, 6):
        row = defect_table.rows[r_idx]
        for c_idx in range(6):
            cell = row.cells[c_idx]
            cell.width = d_widths[c_idx]
            set_cell_margins(cell, top=65, bottom=65, left=70, right=70)
            set_cell_background(cell, "FFFFFF")
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if c_idx == 0:
                p.add_run(f"BUG-{r_idx:02d}").font.size = Pt(8.0)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 3:
                p.add_run("High / Med / Low").font.size = Pt(7.5)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            elif c_idx == 5:
                p.add_run("Open / Fixed").font.size = Pt(7.5)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    output_path = os.path.join(os.getcwd(), "Automobile_Ecosystem_Complete_Manual_Test_Cases_Checklist.docx")
    doc.save(output_path)
    print(f"[OK] Master Document successfully generated at: {output_path}")

if __name__ == "__main__":
    create_document()
