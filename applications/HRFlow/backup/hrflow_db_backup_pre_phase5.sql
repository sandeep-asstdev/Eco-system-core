--
-- PostgreSQL database dump
--

\restrict 2veQq7U0y1p27B9wTe9cmMiM1SctbprGqOPUdadX2DjqNwU31EWkXKb6Q7Ygmcn

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AdvanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdvanceStatus" AS ENUM (
    'PENDING_BM',
    'PENDING_HR',
    'APPROVED',
    'REJECTED',
    'DISBURSED'
);


ALTER TYPE public."AdvanceStatus" OWNER TO postgres;

--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApprovalStatus" OWNER TO postgres;

--
-- Name: ApprovalType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalType" AS ENUM (
    'SIM_REQUEST',
    'LAPTOP_REQUEST',
    'SALARY_ADVANCE',
    'ATTENDANCE_CORRECTION',
    'RESIGNATION',
    'NOC'
);


ALTER TYPE public."ApprovalType" OWNER TO postgres;

--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'ASSIGNED',
    'RETURNED',
    'DAMAGED'
);


ALTER TYPE public."AssetStatus" OWNER TO postgres;

--
-- Name: AssetType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetType" AS ENUM (
    'LAPTOP',
    'SIM',
    'DESKTOP',
    'MOBILE',
    'OTHER'
);


ALTER TYPE public."AssetType" OWNER TO postgres;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'HALF_DAY',
    'ON_LEAVE'
);


ALTER TYPE public."AttendanceStatus" OWNER TO postgres;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentType" AS ENUM (
    'AADHAAR',
    'PAN',
    'OFFER_LETTER',
    'PAYSLIP',
    'RESUME',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO postgres;

--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'RESIGNED',
    'LEFT_WITHOUT_INTIMATION',
    'TERMINATED',
    'ON_NOTICE'
);


ALTER TYPE public."EmployeeStatus" OWNER TO postgres;

--
-- Name: EmploymentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EmploymentType" AS ENUM (
    'FULL_TIME',
    'PROBATION',
    'CONTRACT'
);


ALTER TYPE public."EmploymentType" OWNER TO postgres;

--
-- Name: FnfStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FnfStatus" AS ENUM (
    'PENDING',
    'PAID'
);


ALTER TYPE public."FnfStatus" OWNER TO postgres;

--
-- Name: JoiningStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JoiningStatus" AS ENUM (
    'PENDING',
    'FORM_SUBMITTED',
    'COMPLETED'
);


ALTER TYPE public."JoiningStatus" OWNER TO postgres;

--
-- Name: NocStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NocStatus" AS ENUM (
    'PENDING',
    'CLEARED'
);


ALTER TYPE public."NocStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INFO',
    'APPROVAL',
    'ALERT',
    'ACTION_REQUIRED'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: PaymentAdviceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentAdviceStatus" AS ENUM (
    'GENERATED',
    'APPROVED',
    'DISBURSED'
);


ALTER TYPE public."PaymentAdviceStatus" OWNER TO postgres;

--
-- Name: PayrollStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PayrollStatus" AS ENUM (
    'PROCESSED',
    'DISBURSED'
);


ALTER TYPE public."PayrollStatus" OWNER TO postgres;

--
-- Name: PositionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PositionStatus" AS ENUM (
    'OPEN',
    'FILLED',
    'ON_HOLD',
    'CLOSED'
);


ALTER TYPE public."PositionStatus" OWNER TO postgres;

--
-- Name: ResignationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResignationStatus" AS ENUM (
    'SUBMITTED',
    'HR_PROCESSING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."ResignationStatus" OWNER TO postgres;

--
-- Name: SalaryHoldStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SalaryHoldStatus" AS ENUM (
    'ACTIVE',
    'ON_HOLD'
);


ALTER TYPE public."SalaryHoldStatus" OWNER TO postgres;

--
-- Name: TenantStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TenantStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."TenantStatus" OWNER TO postgres;

--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."TransferStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'PLATFORM_ADMIN',
    'HR',
    'BM',
    'EMPLOYEE'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Approval; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Approval" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    type public."ApprovalType" NOT NULL,
    "referenceId" text,
    "branchId" text NOT NULL,
    "requestedById" text NOT NULL,
    "approverId" text,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Approval" OWNER TO postgres;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "inTime" text,
    "outTime" text,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    "totalHours" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Attendance" OWNER TO postgres;

--
-- Name: AttendanceCorrection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AttendanceCorrection" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "attendanceId" text,
    "employeeId" text NOT NULL,
    "requestedDate" timestamp(3) without time zone NOT NULL,
    "punchIn" text NOT NULL,
    "punchOut" text NOT NULL,
    reason text NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "reviewedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AttendanceCorrection" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "tenantId" text,
    "userId" text,
    action text NOT NULL,
    module text NOT NULL,
    "recordId" text,
    "previousValue" text,
    "newValue" text,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    address text,
    phone text,
    email text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Branch" OWNER TO postgres;

--
-- Name: Deduction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Deduction" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "employeeId" text NOT NULL,
    "advanceRecovery" double precision DEFAULT 0 NOT NULL,
    "loanDeduction" double precision DEFAULT 0 NOT NULL,
    tds double precision DEFAULT 0 NOT NULL,
    "otherDeduction" double precision DEFAULT 0 NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Deduction" OWNER TO postgres;

--
-- Name: Designation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Designation" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "levelId" text NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Designation" OWNER TO postgres;

--
-- Name: Employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Employee" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeCode" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    gender text NOT NULL,
    dob timestamp(3) without time zone NOT NULL,
    "bloodGroup" text,
    "maritalStatus" text,
    "photoUrl" text,
    "branchId" text NOT NULL,
    department text NOT NULL,
    designation text NOT NULL,
    "dateOfJoining" timestamp(3) without time zone NOT NULL,
    "employmentType" public."EmploymentType" DEFAULT 'FULL_TIME'::public."EmploymentType" NOT NULL,
    status public."EmployeeStatus" DEFAULT 'ACTIVE'::public."EmployeeStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "designationId" text,
    "levelId" text,
    "reportingManagerId" text
);


ALTER TABLE public."Employee" OWNER TO postgres;

--
-- Name: EmployeeAsset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeAsset" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    "assetType" public."AssetType" NOT NULL,
    "assetName" text NOT NULL,
    "serialNumber" text NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "returnDate" timestamp(3) without time zone,
    status public."AssetStatus" DEFAULT 'ASSIGNED'::public."AssetStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmployeeAsset" OWNER TO postgres;

--
-- Name: EmployeeDocument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeDocument" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    "documentType" public."DocumentType" NOT NULL,
    "documentName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileSize" integer,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmployeeDocument" OWNER TO postgres;

--
-- Name: EmployeeKYC; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeKYC" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "aadhaarNumber" text NOT NULL,
    "panNumber" text NOT NULL,
    "bankName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "ifscCode" text NOT NULL,
    "branchName" text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmployeeKYC" OWNER TO postgres;

--
-- Name: EmployeeLevel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeLevel" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "levelNumber" integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmployeeLevel" OWNER TO postgres;

--
-- Name: EmployeeSalary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeSalary" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    basic double precision NOT NULL,
    hra double precision NOT NULL,
    conveyance double precision DEFAULT 0 NOT NULL,
    "specialAllowance" double precision DEFAULT 0 NOT NULL,
    "grossSalary" double precision NOT NULL,
    "effectiveDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmployeeSalary" OWNER TO postgres;

--
-- Name: EmployeeStatutory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeStatutory" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "pfNumber" text,
    "uanNumber" text,
    "esiNumber" text,
    "pfApplicable" boolean DEFAULT true NOT NULL,
    "esiApplicable" boolean DEFAULT true NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmployeeStatutory" OWNER TO postgres;

--
-- Name: EmployeeTransfer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmployeeTransfer" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    "fromBranchId" text NOT NULL,
    "toBranchId" text NOT NULL,
    "transferDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    reason text,
    status public."TransferStatus" DEFAULT 'PENDING'::public."TransferStatus" NOT NULL,
    "approvedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmployeeTransfer" OWNER TO postgres;

--
-- Name: FnfRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FnfRecord" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    "resignationId" text NOT NULL,
    "settlementDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "unpaidDays" double precision DEFAULT 0 NOT NULL,
    "encashmentAmount" double precision DEFAULT 0 NOT NULL,
    "gratuityAmount" double precision DEFAULT 0 NOT NULL,
    deductions double precision DEFAULT 0 NOT NULL,
    "netPayable" double precision NOT NULL,
    status public."FnfStatus" DEFAULT 'PENDING'::public."FnfStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FnfRecord" OWNER TO postgres;

--
-- Name: JoiningRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."JoiningRecord" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "candidateName" text NOT NULL,
    "candidateEmail" text NOT NULL,
    "candidatePhone" text NOT NULL,
    "positionId" text,
    "branchId" text NOT NULL,
    designation text NOT NULL,
    department text NOT NULL,
    "joiningDate" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    status public."JoiningStatus" DEFAULT 'PENDING'::public."JoiningStatus" NOT NULL,
    "formData" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JoiningRecord" OWNER TO postgres;

--
-- Name: ManpowerBudget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ManpowerBudget" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "branchId" text NOT NULL,
    department text NOT NULL,
    "financialYear" text NOT NULL,
    "sanctionedPositions" integer NOT NULL,
    "existingCount" integer DEFAULT 0 NOT NULL,
    "budgetAmount" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ManpowerBudget" OWNER TO postgres;

--
-- Name: NocRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NocRecord" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    "resignationId" text NOT NULL,
    "departmentClearance" boolean DEFAULT false NOT NULL,
    "assetClearance" boolean DEFAULT false NOT NULL,
    "financeClearance" boolean DEFAULT false NOT NULL,
    status public."NocStatus" DEFAULT 'PENDING'::public."NocStatus" NOT NULL,
    remarks text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NocRecord" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "tenantId" text,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'INFO'::public."NotificationType" NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: PayDay; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PayDay" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "employeeId" text NOT NULL,
    "totalWorkingDays" integer DEFAULT 30 NOT NULL,
    "presentDays" integer NOT NULL,
    "paidLeaves" integer DEFAULT 0 NOT NULL,
    "lopDays" integer DEFAULT 0 NOT NULL,
    "payableDays" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PayDay" OWNER TO postgres;

--
-- Name: PaymentAdvice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentAdvice" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "branchId" text,
    "bankName" text NOT NULL,
    "totalEmployees" integer NOT NULL,
    "totalAmount" double precision NOT NULL,
    status public."PaymentAdviceStatus" DEFAULT 'GENERATED'::public."PaymentAdviceStatus" NOT NULL,
    "referenceNumber" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PaymentAdvice" OWNER TO postgres;

--
-- Name: Payroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payroll" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "employeeId" text NOT NULL,
    "branchId" text NOT NULL,
    basic double precision NOT NULL,
    hra double precision NOT NULL,
    allowances double precision DEFAULT 0 NOT NULL,
    "grossPay" double precision NOT NULL,
    "pfDeduction" double precision DEFAULT 0 NOT NULL,
    "esiDeduction" double precision DEFAULT 0 NOT NULL,
    "advanceDeduction" double precision DEFAULT 0 NOT NULL,
    "taxDeduction" double precision DEFAULT 0 NOT NULL,
    "totalDeductions" double precision DEFAULT 0 NOT NULL,
    "netPay" double precision NOT NULL,
    "isHold" boolean DEFAULT false NOT NULL,
    status public."PayrollStatus" DEFAULT 'PROCESSED'::public."PayrollStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payroll" OWNER TO postgres;

--
-- Name: Position; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Position" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "positionCode" text NOT NULL,
    title text NOT NULL,
    department text NOT NULL,
    "branchId" text NOT NULL,
    "requiredCount" integer DEFAULT 1 NOT NULL,
    status public."PositionStatus" DEFAULT 'OPEN'::public."PositionStatus" NOT NULL,
    "reasonForOpening" text,
    "sourceResignationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Position" OWNER TO postgres;

--
-- Name: Resignation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Resignation" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    "resignationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "noticePeriodDays" integer DEFAULT 30 NOT NULL,
    "proposedLastWorkingDate" timestamp(3) without time zone NOT NULL,
    reason text NOT NULL,
    status public."ResignationStatus" DEFAULT 'SUBMITTED'::public."ResignationStatus" NOT NULL,
    "salaryHoldStatus" public."SalaryHoldStatus" DEFAULT 'ON_HOLD'::public."SalaryHoldStatus" NOT NULL,
    "fnfDate" timestamp(3) without time zone,
    "hrRemarks" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Resignation" OWNER TO postgres;

--
-- Name: SalaryAdvance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SalaryAdvance" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employeeId" text NOT NULL,
    amount double precision NOT NULL,
    purpose text NOT NULL,
    "monthlyDeduction" double precision NOT NULL,
    status public."AdvanceStatus" DEFAULT 'PENDING_BM'::public."AdvanceStatus" NOT NULL,
    "bmRemarks" text,
    "hrRemarks" text,
    "disbursedDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SalaryAdvance" OWNER TO postgres;

--
-- Name: SalaryHike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SalaryHike" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "previousSalary" double precision NOT NULL,
    "newSalary" double precision NOT NULL,
    percentage double precision NOT NULL,
    reason text,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "approvedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SalaryHike" OWNER TO postgres;

--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    "organizationName" text NOT NULL,
    "legalName" text NOT NULL,
    code text NOT NULL,
    "logoUrl" text,
    "contactPhone" text,
    "contactEmail" text,
    address text,
    "subscriptionPlan" text DEFAULT 'ENTERPRISE'::text NOT NULL,
    status public."TenantStatus" DEFAULT 'ACTIVE'::public."TenantStatus" NOT NULL,
    settings jsonb,
    features jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tenant" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "tenantId" text,
    "branchId" text,
    "employeeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Approval; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Approval" (id, "tenantId", type, "referenceId", "branchId", "requestedById", "approverId", status, remarks, "createdAt", "updatedAt") FROM stdin;
921d3787-0028-42cf-8c55-77a5b9715d29	fd5918ee-e583-47e4-b776-b1c5a605faa3	LAPTOP_REQUEST	bf2288f1-fee4-4c34-8e45-a2952eecf973	27db60a4-5eb5-4af7-b430-92b7821b4403	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	\N	PENDING	New Joiner Laptop allocation for Vikram Malhotra (APEX-1003)	2026-09-22 07:35:46.759	2026-09-22 07:35:46.759
26d1ad8d-f320-4c1d-bf4c-fefc4a1051f7	fd5918ee-e583-47e4-b776-b1c5a605faa3	SIM_REQUEST	bf2288f1-fee4-4c34-8e45-a2952eecf973	27db60a4-5eb5-4af7-b430-92b7821b4403	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	5d1500fe-4feb-45d0-bf4b-528ce3f52c88	APPROVED	Approved by Branch Manager Bangalore. SIM dispatched.	2026-09-22 07:35:46.758	2026-09-22 07:35:46.843
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attendance" (id, "tenantId", "employeeId", date, "inTime", "outTime", status, "totalHours", "createdAt") FROM stdin;
\.


--
-- Data for Name: AttendanceCorrection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AttendanceCorrection" (id, "tenantId", "attendanceId", "employeeId", "requestedDate", "punchIn", "punchOut", reason, status, "reviewedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "tenantId", "userId", action, module, "recordId", "previousValue", "newValue", "ipAddress", "createdAt") FROM stdin;
9fb5015b-af8f-4c6c-82f5-44693c0f04df	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_CREATED	ORGANIZATION_MASTER	c74782ad-5bc4-4ef5-9f4c-86c06a528cdf	\N	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:34:32.668
8eec3f85-9bca-4a4f-bba5-f20057ebe6e8	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	c74782ad-5bc4-4ef5-9f4c-86c06a528cdf	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:34:32.68
c34f7efc-6e7a-4031-9c0c-eee02a6370b3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_UPDATED	ORGANIZATION_MASTER	c74782ad-5bc4-4ef5-9f4c-86c06a528cdf	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	::ffff:127.0.0.1	2026-09-22 07:34:32.693
97240893-2bab-425e-b9b6-deba3ea2b8dc	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_CREATED	EMPLOYEE	d21258db-41f5-420b-b904-24e7142c6011	\N	Created employee Legacy Holder (EMP-1010)	::ffff:127.0.0.1	2026-09-22 07:34:32.711
45cfb47c-188f-474b-a3d0-609838a110e6	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	c74782ad-5bc4-4ef5-9f4c-86c06a528cdf	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:34:32.718
89533428-d2cf-47b2-9410-551eacc3ad5e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_UPDATED	EMPLOYEE	d21258db-41f5-420b-b904-24e7142c6011	{"id":"d21258db-41f5-420b-b904-24e7142c6011","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790062472693@belladgroup.com","phone":"","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":null,"photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"c74782ad-5bc4-4ef5-9f4c-86c06a528cdf","reportingManagerId":null,"dateOfJoining":"2026-09-22T07:34:32.700Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-22T07:34:32.701Z","updatedAt":"2026-09-22T07:34:32.701Z"}	{"id":"d21258db-41f5-420b-b904-24e7142c6011","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790062472693@belladgroup.com","phone":"+91 99999 88888","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":"Married","photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"c74782ad-5bc4-4ef5-9f4c-86c06a528cdf","reportingManagerId":null,"dateOfJoining":"2026-09-22T07:34:32.700Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-22T07:34:32.701Z","updatedAt":"2026-09-22T07:34:32.724Z","branch":{"id":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","code":"BELLAD-HUB","name":"Hubli Central HQ & Showroom","city":"Hubli","state":"Karnataka","address":"Bellad Chambers, PB Road, Hubli, Karnataka 580025","phone":"+91 836 244 8888","email":"hubli.hq@belladgroup.com","active":true,"createdAt":"2026-09-22T07:31:40.079Z","updatedAt":"2026-09-22T07:31:40.079Z"},"level":{"id":"143e958d-fcc1-4c81-a000-d713ca91a92e","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelNumber":1,"name":"Staff","description":"Entry-level support, janitorial, and operations staff","isActive":true,"createdAt":"2026-09-22T07:31:40.085Z","updatedAt":"2026-09-22T07:31:40.085Z"},"designationRel":{"id":"c74782ad-5bc4-4ef5-9f4c-86c06a528cdf","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","name":"Temporary Trainee Spec","code":"TEMP-TRAIN-01","description":null,"isActive":false,"createdAt":"2026-09-22T07:34:32.665Z","updatedAt":"2026-09-22T07:34:32.716Z"},"reportingManager":null}	::ffff:127.0.0.1	2026-09-22 07:34:32.728
0b1810a7-07ae-422c-ab86-4e2197d3d384	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	DESIGNATION_CREATED	ORGANIZATION_MASTER	41852e69-8f22-4ede-9a11-e241f94c813c	\N	{"name":"Washers","levelId":"57259c38-88e7-4051-b597-acf178ba1b14","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:34:32.763
fd8c62ec-d028-47ec-bdba-a617c5eb0712	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_UPDATED	EMPLOYEE	a894320e-0eaa-4b7f-8e14-0ebbececdfa5	{"id":"a894320e-0eaa-4b7f-8e14-0ebbececdfa5","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790062493929@belladgroup.com","phone":"","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":null,"photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"aa7d565e-3644-4249-a1bb-d686f83a2ac9","reportingManagerId":null,"dateOfJoining":"2026-09-22T07:34:53.935Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-22T07:34:53.937Z","updatedAt":"2026-09-22T07:34:53.937Z"}	{"id":"a894320e-0eaa-4b7f-8e14-0ebbececdfa5","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790062493929@belladgroup.com","phone":"+91 99999 88888","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":"Married","photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"aa7d565e-3644-4249-a1bb-d686f83a2ac9","reportingManagerId":null,"dateOfJoining":"2026-09-22T07:34:53.935Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-22T07:34:53.937Z","updatedAt":"2026-09-22T07:34:53.957Z","branch":{"id":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","code":"BELLAD-HUB","name":"Hubli Central HQ & Showroom","city":"Hubli","state":"Karnataka","address":"Bellad Chambers, PB Road, Hubli, Karnataka 580025","phone":"+91 836 244 8888","email":"hubli.hq@belladgroup.com","active":true,"createdAt":"2026-09-22T07:31:40.079Z","updatedAt":"2026-09-22T07:31:40.079Z"},"level":{"id":"143e958d-fcc1-4c81-a000-d713ca91a92e","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelNumber":1,"name":"Staff","description":"Entry-level support, janitorial, and operations staff","isActive":true,"createdAt":"2026-09-22T07:31:40.085Z","updatedAt":"2026-09-22T07:34:32.767Z"},"designationRel":{"id":"aa7d565e-3644-4249-a1bb-d686f83a2ac9","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","name":"Temporary Trainee Spec","code":"TEMP-TRAIN-01","description":null,"isActive":false,"createdAt":"2026-09-22T07:34:53.904Z","updatedAt":"2026-09-22T07:34:53.950Z"},"reportingManager":null}	::ffff:127.0.0.1	2026-09-22 07:34:53.96
8c51aa21-d9c5-4270-ad7c-ba614a9943bc	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_STATUS_SUSPENDED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ACTIVE	SUSPENDED	::ffff:127.0.0.1	2026-09-22 07:35:27.559
a20a6d97-28d6-4433-ae80-c74f7841e8c5	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_STATUS_ACTIVE	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	SUSPENDED	ACTIVE	::ffff:127.0.0.1	2026-09-22 07:35:27.64
0d91ed00-9ba4-4503-a0af-8d746dab80fd	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_PLAN_UPDATED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	\N	{"features":{"vacancies":false,"payroll":true,"employees":true}}	::ffff:127.0.0.1	2026-09-22 07:35:27.715
5435d106-08d3-498c-9a9c-1f1eb3f849ca	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_PLAN_UPDATED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	\N	{"features":{"vacancies":true,"payroll":true,"employees":true}}	::ffff:127.0.0.1	2026-09-22 07:35:27.795
20a49ac9-1627-47d2-9bf1-db8191b92898	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	JOINING_COMPLETED	JOINING	bf2288f1-fee4-4c34-8e45-a2952eecf973	\N	Onboarding completed for Vikram Malhotra. Position closed. Asset approvals triggered.	::ffff:127.0.0.1	2026-09-22 07:35:46.762
cabe4eb4-5742-4972-822c-4aa9c22fd615	fd5918ee-e583-47e4-b776-b1c5a605faa3	5d1500fe-4feb-45d0-bf4b-528ce3f52c88	BM_APPROVED_SIM_REQUEST	APPROVALS	26d1ad8d-f320-4c1d-bf4c-fefc4a1051f7	\N	APPROVED	::ffff:127.0.0.1	2026-09-22 07:35:46.846
42c7ca9f-f9d1-4159-a5e8-b6da17124bf7	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_CREATED	ORGANIZATION_MASTER	ef6f064f-f810-4f09-9c3f-662bf3acf6c7	\N	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:32:56.707
e21859ce-14ca-48ee-8dbf-752f82dadc0b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	ef6f064f-f810-4f09-9c3f-662bf3acf6c7	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:32:56.716
69e06333-0e9e-4ffb-ad0d-351b99b0be6a	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_UPDATED	ORGANIZATION_MASTER	ef6f064f-f810-4f09-9c3f-662bf3acf6c7	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	::ffff:127.0.0.1	2026-09-22 07:32:56.73
b464068a-6f50-44c8-a498-5ccae4ee7668	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_CREATED	EMPLOYEE	11778d53-074e-436a-8c14-a5d4e2ded2ca	\N	Created employee Legacy Holder (EMP-1010)	::ffff:127.0.0.1	2026-09-22 07:32:56.749
c8fce644-daf8-4580-af9b-4a875b4d9ab3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	ef6f064f-f810-4f09-9c3f-662bf3acf6c7	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:32:56.757
d413b718-8909-4f9c-bdfc-b2847aa7b90d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_CREATED	ORGANIZATION_MASTER	aa7d565e-3644-4249-a1bb-d686f83a2ac9	\N	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:34:53.908
7582f3b0-2cf5-435b-bbcf-3ed3d28a6e1e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	aa7d565e-3644-4249-a1bb-d686f83a2ac9	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:34:53.917
1730d59c-a82d-4ead-b67b-ffbf88a6ddc1	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_UPDATED	ORGANIZATION_MASTER	aa7d565e-3644-4249-a1bb-d686f83a2ac9	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	::ffff:127.0.0.1	2026-09-22 07:34:53.929
938ac0cc-62d6-462f-8664-53d06d7a1fbe	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_CREATED	EMPLOYEE	a894320e-0eaa-4b7f-8e14-0ebbececdfa5	\N	Created employee Legacy Holder (EMP-1010)	::ffff:127.0.0.1	2026-09-22 07:34:53.945
0bc635df-4cca-4154-9073-d250ffa77648	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	aa7d565e-3644-4249-a1bb-d686f83a2ac9	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:34:53.952
1dc26036-60b9-4dc2-8ecb-5a68a7fdf9c1	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	DESIGNATION_CREATED	ORGANIZATION_MASTER	598ac39a-4c76-4c62-ae31-62dfa5e8263d	\N	{"name":"Washers","levelId":"57259c38-88e7-4051-b597-acf178ba1b14","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:34:53.991
e0a43f54-24c7-4dc6-88cc-3b2202664067	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_CREATED	ORGANIZATION_MASTER	0892ad59-3f10-4b1e-a6a9-5fb0eeab509c	\N	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:35:22.276
384a97fd-3596-4173-86ff-03d1c93491bd	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	0892ad59-3f10-4b1e-a6a9-5fb0eeab509c	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:35:22.285
f5ec9107-9b37-478a-a0ce-6394639ce754	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_UPDATED	ORGANIZATION_MASTER	0892ad59-3f10-4b1e-a6a9-5fb0eeab509c	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	::ffff:127.0.0.1	2026-09-22 07:35:22.298
0ae33760-9a3e-47cc-b442-390052fbc262	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_CREATED	EMPLOYEE	44c3c5af-c683-4bbe-8c56-70e9b8f7bbb7	\N	Created employee Legacy Holder (EMP-1010)	::ffff:127.0.0.1	2026-09-22 07:35:22.315
52fb0557-854d-4cbf-8696-a80d1eea5ee7	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	0892ad59-3f10-4b1e-a6a9-5fb0eeab509c	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-22 07:35:22.323
1ea8a121-41f3-443d-b9ed-d67148db8018	fd5918ee-e583-47e4-b776-b1c5a605faa3	e33bc161-06be-48af-921d-0ee6ff69a9bb	EMPLOYEE_RESIGNED	EXIT	618a47f2-c31b-4044-9825-3b7a7cb0444f	ACTIVE	RESIGNED_SALARY_ON_HOLD_POSITION_OPENED	::ffff:127.0.0.1	2026-09-22 07:35:46.865
6603612a-3375-457f-a47f-9ee9b70abd71	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	LEFT_WITHOUT_INTIMATION	EMPLOYEE	bf2288f1-fee4-4c34-8e45-a2952eecf973	ACTIVE	LEFT_WITHOUT_INTIMATION	::ffff:127.0.0.1	2026-09-22 07:35:46.887
0f8c677e-9e79-4b3b-bf06-133d04e218a3	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	PAYROLL_CALCULATED	PAYROLL	2026-9	\N	Executed payroll calculation for 3 employees (Month: 9/2026)	::ffff:127.0.0.1	2026-09-22 07:35:46.903
cb5268e3-6c93-4801-adc0-55b2fa7ce343	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	PAYMENT_ADVICE_GENERATED	PAYROLL	PA-FD59-202609-ALL-6909	\N	Generated payment advice for INR 75000 across 1 employees.	::ffff:127.0.0.1	2026-09-22 07:35:46.912
cc289670-612f-45f3-bf8c-b784c3bf0f42	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_CREATED	ORGANIZATION_MASTER	088edcf3-695f-463b-be41-a12c116f3a29	\N	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","levelNumber":1}	::ffff:127.0.0.1	2026-09-24 11:43:46.038
5f4142a0-0fb2-4687-8801-7c88826f5633	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_STATUS_SUSPENDED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ACTIVE	SUSPENDED	::ffff:127.0.0.1	2026-09-24 11:43:47.18
827cd849-0d89-4d41-bc98-a54d74828ef3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_UPDATED	EMPLOYEE	44c3c5af-c683-4bbe-8c56-70e9b8f7bbb7	{"id":"44c3c5af-c683-4bbe-8c56-70e9b8f7bbb7","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790062522298@belladgroup.com","phone":"","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":null,"photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"0892ad59-3f10-4b1e-a6a9-5fb0eeab509c","reportingManagerId":null,"dateOfJoining":"2026-09-22T07:35:22.306Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-22T07:35:22.307Z","updatedAt":"2026-09-22T07:35:22.307Z"}	{"id":"44c3c5af-c683-4bbe-8c56-70e9b8f7bbb7","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790062522298@belladgroup.com","phone":"+91 99999 88888","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":"Married","photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"0892ad59-3f10-4b1e-a6a9-5fb0eeab509c","reportingManagerId":null,"dateOfJoining":"2026-09-22T07:35:22.306Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-22T07:35:22.307Z","updatedAt":"2026-09-22T07:35:22.328Z","branch":{"id":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","code":"BELLAD-HUB","name":"Hubli Central HQ & Showroom","city":"Hubli","state":"Karnataka","address":"Bellad Chambers, PB Road, Hubli, Karnataka 580025","phone":"+91 836 244 8888","email":"hubli.hq@belladgroup.com","active":true,"createdAt":"2026-09-22T07:31:40.079Z","updatedAt":"2026-09-22T07:31:40.079Z"},"level":{"id":"143e958d-fcc1-4c81-a000-d713ca91a92e","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelNumber":1,"name":"Staff","description":"Entry-level support, janitorial, and operations staff","isActive":true,"createdAt":"2026-09-22T07:31:40.085Z","updatedAt":"2026-09-22T07:34:53.994Z"},"designationRel":{"id":"0892ad59-3f10-4b1e-a6a9-5fb0eeab509c","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","name":"Temporary Trainee Spec","code":"TEMP-TRAIN-01","description":null,"isActive":false,"createdAt":"2026-09-22T07:35:22.273Z","updatedAt":"2026-09-22T07:35:22.321Z"},"reportingManager":null}	::ffff:127.0.0.1	2026-09-22 07:35:22.332
c071db6a-8fb5-4be0-9e97-cb2d2ee0cf33	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	DESIGNATION_CREATED	ORGANIZATION_MASTER	d16f34f1-55b4-40fe-8624-92213af4e223	\N	{"name":"Washers","levelId":"57259c38-88e7-4051-b597-acf178ba1b14","levelNumber":1}	::ffff:127.0.0.1	2026-09-22 07:35:22.364
5f5ab97b-a20c-49b5-a709-345cf9f4e4f6	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	088edcf3-695f-463b-be41-a12c116f3a29	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-24 11:43:46.054
4717e435-fe19-4b5e-9e67-70dc86118a0a	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_UPDATED	ORGANIZATION_MASTER	088edcf3-695f-463b-be41-a12c116f3a29	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	::ffff:127.0.0.1	2026-09-24 11:43:46.066
2f3d430d-47c5-4a96-b93e-07f43937802c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_CREATED	EMPLOYEE	15ec6b8a-e99a-49d1-90ca-024b9ea355a7	\N	Created employee Legacy Holder (EMP-1010)	::ffff:127.0.0.1	2026-09-24 11:43:46.089
14d9ed00-957c-48a3-89df-e74aaad3fa94	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	088edcf3-695f-463b-be41-a12c116f3a29	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-24 11:43:46.095
fc34e103-7abc-4a7f-b678-168ca583f9aa	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_UPDATED	EMPLOYEE	15ec6b8a-e99a-49d1-90ca-024b9ea355a7	{"id":"15ec6b8a-e99a-49d1-90ca-024b9ea355a7","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790250226067@belladgroup.com","phone":"","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":null,"photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"088edcf3-695f-463b-be41-a12c116f3a29","reportingManagerId":null,"dateOfJoining":"2026-09-24T11:43:46.072Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-24T11:43:46.073Z","updatedAt":"2026-09-24T11:43:46.073Z"}	{"id":"15ec6b8a-e99a-49d1-90ca-024b9ea355a7","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790250226067@belladgroup.com","phone":"+91 99999 88888","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":"Married","photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"088edcf3-695f-463b-be41-a12c116f3a29","reportingManagerId":null,"dateOfJoining":"2026-09-24T11:43:46.072Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-24T11:43:46.073Z","updatedAt":"2026-09-24T11:43:46.101Z","branch":{"id":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","code":"BELLAD-HUB","name":"Hubli Central HQ & Showroom","city":"Hubli","state":"Karnataka","address":"Bellad Chambers, PB Road, Hubli, Karnataka 580025","phone":"+91 836 244 8888","email":"hubli.hq@belladgroup.com","active":true,"createdAt":"2026-09-22T07:31:40.079Z","updatedAt":"2026-09-22T07:31:40.079Z"},"level":{"id":"143e958d-fcc1-4c81-a000-d713ca91a92e","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelNumber":1,"name":"Staff","description":"Entry-level support, janitorial, and operations staff","isActive":true,"createdAt":"2026-09-22T07:31:40.085Z","updatedAt":"2026-09-22T07:35:22.369Z"},"designationRel":{"id":"088edcf3-695f-463b-be41-a12c116f3a29","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","name":"Temporary Trainee Spec","code":"TEMP-TRAIN-01","description":null,"isActive":false,"createdAt":"2026-09-24T11:43:46.032Z","updatedAt":"2026-09-24T11:43:46.093Z"},"reportingManager":null}	::ffff:127.0.0.1	2026-09-24 11:43:46.103
18f1bb44-5bff-472c-8118-cc54896a45c2	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	DESIGNATION_CREATED	ORGANIZATION_MASTER	5dc24cdc-bd31-4ed9-acb9-57e93823db85	\N	{"name":"Washers","levelId":"57259c38-88e7-4051-b597-acf178ba1b14","levelNumber":1}	::ffff:127.0.0.1	2026-09-24 11:43:46.162
3c3e34ce-7428-4a82-8b14-d0160cd744a6	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_STATUS_ACTIVE	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	SUSPENDED	ACTIVE	::ffff:127.0.0.1	2026-09-24 11:43:47.258
145d2e01-8d9d-417e-b2fb-3a3b61a62768	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_PLAN_UPDATED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	\N	{"features":{"vacancies":false,"payroll":true,"employees":true}}	::ffff:127.0.0.1	2026-09-24 11:43:47.335
f38f1f72-8502-4ef4-9f45-5dd597406859	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_PLAN_UPDATED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	\N	{"features":{"vacancies":true,"payroll":true,"employees":true}}	::ffff:127.0.0.1	2026-09-24 11:43:47.414
8cce250f-0776-4c13-bd4d-fed00a9d8f05	fd5918ee-e583-47e4-b776-b1c5a605faa3	e33bc161-06be-48af-921d-0ee6ff69a9bb	EMPLOYEE_RESIGNED	EXIT	fb35cfe5-72da-40ac-a299-b98c75f59b76	ACTIVE	RESIGNED_SALARY_ON_HOLD_POSITION_OPENED	::ffff:127.0.0.1	2026-09-24 11:43:47.822
46031a2c-d83a-4944-b8a3-0d2c48ddad36	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	LEFT_WITHOUT_INTIMATION	EMPLOYEE	afc5ad5d-4a53-4830-aebb-e967df5548fb	ACTIVE	LEFT_WITHOUT_INTIMATION	::ffff:127.0.0.1	2026-09-24 11:43:47.843
6fbdb019-a887-4767-a581-be4155fc4afc	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	PAYROLL_CALCULATED	PAYROLL	2026-9	\N	Executed payroll calculation for 3 employees (Month: 9/2026)	::ffff:127.0.0.1	2026-09-24 11:43:47.858
8ce0d181-66ed-423d-8ef1-cf842a9efcfa	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	PAYMENT_ADVICE_GENERATED	PAYROLL	PA-FD59-202609-ALL-7864	\N	Generated payment advice for INR 0 across 0 employees.	::ffff:127.0.0.1	2026-09-24 11:43:47.87
f139c269-0c8a-4e40-8409-f64b9f4c6422	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_CREATED	ORGANIZATION_MASTER	27204d98-8f92-4a04-bf61-e1515c11b875	\N	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","levelNumber":1}	::ffff:127.0.0.1	2026-09-24 11:56:44.078
2171fe0e-2630-4e9e-8625-5de8846ef5b1	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	27204d98-8f92-4a04-bf61-e1515c11b875	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-24 11:56:44.088
79885575-5a94-4006-b425-b194304233fa	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_UPDATED	ORGANIZATION_MASTER	27204d98-8f92-4a04-bf61-e1515c11b875	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	::ffff:127.0.0.1	2026-09-24 11:56:44.1
bee11c27-be57-468e-be2e-f7dad7593b7c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_CREATED	EMPLOYEE	14411356-b7c7-43f8-9383-37d997fdc02a	\N	Created employee Legacy Holder (EMP-1010)	::ffff:127.0.0.1	2026-09-24 11:56:44.117
5e60a495-3607-4f56-9ba8-804dff7a431f	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	DESIGNATION_DEACTIVATED	ORGANIZATION_MASTER	27204d98-8f92-4a04-bf61-e1515c11b875	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":true}	{"name":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","isActive":false}	::ffff:127.0.0.1	2026-09-24 11:56:44.123
6dad3067-4758-4052-a39c-df9569cf73f1	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	a0d55345-fa48-4930-8760-1527632c301b	EMPLOYEE_UPDATED	EMPLOYEE	14411356-b7c7-43f8-9383-37d997fdc02a	{"id":"14411356-b7c7-43f8-9383-37d997fdc02a","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790251004100@belladgroup.com","phone":"","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":null,"photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"27204d98-8f92-4a04-bf61-e1515c11b875","reportingManagerId":null,"dateOfJoining":"2026-09-24T11:56:44.108Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-24T11:56:44.109Z","updatedAt":"2026-09-24T11:56:44.109Z"}	{"id":"14411356-b7c7-43f8-9383-37d997fdc02a","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","employeeCode":"EMP-1010","firstName":"Legacy","lastName":"Holder","email":"legacy.holder.1790251004100@belladgroup.com","phone":"+91 99999 88888","gender":"Other","dob":"1995-01-01T00:00:00.000Z","bloodGroup":null,"maritalStatus":"Married","photoUrl":null,"branchId":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","department":"Service","designation":"Temporary Trainee Spec","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","designationId":"27204d98-8f92-4a04-bf61-e1515c11b875","reportingManagerId":null,"dateOfJoining":"2026-09-24T11:56:44.108Z","employmentType":"FULL_TIME","status":"ACTIVE","createdAt":"2026-09-24T11:56:44.109Z","updatedAt":"2026-09-24T11:56:44.128Z","branch":{"id":"6c353c46-a1b5-4cf8-baad-6f4cdca5474f","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","code":"BELLAD-HUB","name":"Hubli Central HQ & Showroom","city":"Hubli","state":"Karnataka","address":"Bellad Chambers, PB Road, Hubli, Karnataka 580025","phone":"+91 836 244 8888","email":"hubli.hq@belladgroup.com","active":true,"createdAt":"2026-09-22T07:31:40.079Z","updatedAt":"2026-09-22T07:31:40.079Z"},"level":{"id":"143e958d-fcc1-4c81-a000-d713ca91a92e","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelNumber":1,"name":"Staff","description":"Entry-level support, janitorial, and operations staff","isActive":true,"createdAt":"2026-09-22T07:31:40.085Z","updatedAt":"2026-09-24T11:43:46.165Z"},"designationRel":{"id":"27204d98-8f92-4a04-bf61-e1515c11b875","tenantId":"2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0","levelId":"143e958d-fcc1-4c81-a000-d713ca91a92e","name":"Temporary Trainee Spec","code":"TEMP-TRAIN-01","description":null,"isActive":false,"createdAt":"2026-09-24T11:56:44.074Z","updatedAt":"2026-09-24T11:56:44.122Z"},"reportingManager":null}	::ffff:127.0.0.1	2026-09-24 11:56:44.132
1cdba3c6-5bf0-40df-9881-1167b6cd6edf	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	DESIGNATION_CREATED	ORGANIZATION_MASTER	c0ef170f-0dbf-4d17-b65a-2e0d3c8ac4fa	\N	{"name":"Washers","levelId":"57259c38-88e7-4051-b597-acf178ba1b14","levelNumber":1}	::ffff:127.0.0.1	2026-09-24 11:56:44.165
eea4992e-06d5-4575-b093-073903bfc347	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_STATUS_SUSPENDED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ACTIVE	SUSPENDED	::ffff:127.0.0.1	2026-09-24 11:56:45.015
8390dbbe-bb10-41a7-a8d6-14fec82ba09d	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_STATUS_ACTIVE	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	SUSPENDED	ACTIVE	::ffff:127.0.0.1	2026-09-24 11:56:45.094
9adad57c-9d41-4b36-b2b2-333ff4814d79	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_PLAN_UPDATED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	\N	{"features":{"vacancies":false,"payroll":true,"employees":true}}	::ffff:127.0.0.1	2026-09-24 11:56:45.167
fa1eb671-588d-4c36-a62e-d6b7ee1be1ea	\N	a8fe6450-d0d8-4485-b259-5191ad5d2982	TENANT_PLAN_UPDATED	PLATFORM	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	\N	{"features":{"vacancies":true,"payroll":true,"employees":true}}	::ffff:127.0.0.1	2026-09-24 11:56:45.242
ff63490e-66f0-4da5-978d-ddceaaf06c1d	fd5918ee-e583-47e4-b776-b1c5a605faa3	e33bc161-06be-48af-921d-0ee6ff69a9bb	EMPLOYEE_RESIGNED	EXIT	56ccc928-1acd-4886-abb7-9a13d8c980c0	ACTIVE	RESIGNED_SALARY_ON_HOLD_POSITION_OPENED	::ffff:127.0.0.1	2026-09-24 11:56:45.628
60900ff4-793b-46e5-932b-0f1f47eb7d6c	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	PAYROLL_CALCULATED	PAYROLL	2026-9	\N	Executed payroll calculation for 3 employees (Month: 9/2026)	::ffff:127.0.0.1	2026-09-24 11:56:45.651
d74d4536-ecde-49c4-b7c7-8794f1c0a32c	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	PAYMENT_ADVICE_GENERATED	PAYROLL	PA-FD59-202609-ALL-5657	\N	Generated payment advice for INR 0 across 0 employees.	::ffff:127.0.0.1	2026-09-24 11:56:45.661
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Branch" (id, "tenantId", code, name, city, state, address, phone, email, active, "createdAt", "updatedAt") FROM stdin;
ca001867-d92c-4887-ae63-39dc8643b990	fd5918ee-e583-47e4-b776-b1c5a605faa3	APEX-BOM	Mumbai Corporate HQ	Mumbai	Maharashtra	Level 14, Platina Tower, Bandra Kurla Complex (BKC), Mumbai 400051	+91 22 6123 4500	mumbai.hq@apexautogroup.com	t	2026-09-22 07:31:40.029	2026-09-22 07:31:40.029
27db60a4-5eb5-4af7-b430-92b7821b4403	fd5918ee-e583-47e4-b776-b1c5a605faa3	APEX-BLR	Bangalore Tech Park Showroom	Bengaluru	Karnataka	Block C, Embassy TechVillage, Outer Ring Road, Bengaluru 560103	+91 80 4123 7800	bangalore@apexautogroup.com	t	2026-09-22 07:31:40.03	2026-09-22 07:31:40.03
861d4569-2897-4f57-b688-5616dc61be99	fd5918ee-e583-47e4-b776-b1c5a605faa3	APEX-DEL	Delhi NCR Hub	Gurugram	Haryana	Cyber City, Tower 10, DLF Phase 2, Gurugram 122002	+91 124 456 7890	delhi@apexautogroup.com	t	2026-09-22 07:31:40.031	2026-09-22 07:31:40.031
0ffd5f8e-1871-472c-ae29-228adf944f4b	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ZEN-PUN	Pune Central Dealership	Pune	Maharashtra	ICC Tech Park, Tower A, Senapati Bapat Road, Pune 411016	+91 20 4567 8900	pune.dealership@zenithmotors.com	t	2026-09-22 07:31:40.066	2026-09-22 07:31:40.066
85a144e0-546e-48ac-9a5a-46a38cec8f75	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ZEN-HYD	Hyderabad Auto Hub	Hyderabad	Telangana	Financial District, Nanakramguda, Hyderabad 500032	+91 40 8901 2345	hyderabad@zenithmotors.com	t	2026-09-22 07:31:40.067	2026-09-22 07:31:40.067
6c353c46-a1b5-4cf8-baad-6f4cdca5474f	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BELLAD-HUB	Hubli Central HQ & Showroom	Hubli	Karnataka	Bellad Chambers, PB Road, Hubli, Karnataka 580025	+91 836 244 8888	hubli.hq@belladgroup.com	t	2026-09-22 07:31:40.079	2026-09-22 07:31:40.079
8ada09b7-c6c3-4060-bc0b-c7ce5053939c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BELLAD-DWD	Dharwad Service & Bodyshop	Dharwad	Karnataka	Industrial Area, Rayapur, Dharwad 580009	+91 836 274 5555	dharwad.service@belladgroup.com	t	2026-09-22 07:31:40.08	2026-09-22 07:31:40.08
4592041e-fe7d-473e-89ee-54ebdc630e50	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BELLAD-BGM	Belgaum Auto Hub	Belgaum	Karnataka	Khanapur Road, Tilakwadi, Belgaum 590006	+91 831 240 1234	belgaum@belladgroup.com	t	2026-09-22 07:31:40.081	2026-09-22 07:31:40.081
\.


--
-- Data for Name: Deduction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Deduction" (id, "tenantId", month, year, "employeeId", "advanceRecovery", "loanDeduction", tds, "otherDeduction", remarks, "createdAt") FROM stdin;
\.


--
-- Data for Name: Designation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Designation" (id, "tenantId", "levelId", name, code, description, "isActive", "createdAt", "updatedAt") FROM stdin;
d2d66342-de57-4660-b941-d1666bbffe3d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Customer Relations Manager	BLD-L5-08	\N	t	2026-09-22 07:31:40.158	2026-09-24 11:56:44.23
9a611b5d-6366-491a-b483-f20650f497f5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	143e958d-fcc1-4c81-a000-d713ca91a92e	Security	BLD-L1-06	\N	t	2026-09-22 07:31:40.104	2026-09-24 11:56:44.184
fb5af76b-feea-4e07-824f-9b1706251bd7	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Assistant - Technicians	BLD-L2-01	\N	t	2026-09-22 07:31:40.105	2026-09-24 11:56:44.184
cdee0674-d12a-4207-977f-3c582a9d9e5d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Showroom Host(ess)	BLD-L2-02	\N	t	2026-09-22 07:31:40.106	2026-09-24 11:56:44.185
c0ee5d60-07ec-4e00-87bd-fd91ffb9ccc3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Assistant - PDI	BLD-L2-03	\N	t	2026-09-22 07:31:40.106	2026-09-24 11:56:44.186
b57d3c67-1b7f-4157-89ca-3149bb45be50	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - Customer Relationship	BLD-L3-07	\N	t	2026-09-22 07:31:40.12	2026-09-24 11:56:44.199
76ce4721-7791-4520-a2d6-b8f10be341f6	fd5918ee-e583-47e4-b776-b1c5a605faa3	3118dbdc-04df-4648-b0c9-c856bb228809	Software Systems Engineer	APEX-ENG-01	\N	t	2026-09-22 07:31:40.039	2026-09-22 07:31:40.039
20a6d7d0-52ef-4cb8-bb1a-9b3bdae7360c	fd5918ee-e583-47e4-b776-b1c5a605faa3	4ad5deb4-10c1-4c68-b1e2-56df55c6a45e	Service Manager	APEX-MGR-01	\N	t	2026-09-22 07:31:40.041	2026-09-22 07:31:40.041
51c1b9b1-acc2-4ba5-a191-039ed0a24ae3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	143e958d-fcc1-4c81-a000-d713ca91a92e	Washers	BLD-L1-01	\N	t	2026-09-22 07:31:40.098	2026-09-24 11:56:44.179
ab753834-865d-47bd-9a74-c3182f01896d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	143e958d-fcc1-4c81-a000-d713ca91a92e	Assistant - RTO	BLD-L1-02	\N	t	2026-09-22 07:31:40.099	2026-09-24 11:56:44.18
7d8fa974-7531-4d51-9b62-7456802e23d5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Coordinator	BLD-L2-04	\N	t	2026-09-22 07:31:40.107	2026-09-24 11:56:44.186
9cc46a79-baf4-4030-bbc2-486974485e97	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	CRE	BLD-L2-05	\N	t	2026-09-22 07:31:40.108	2026-09-24 11:56:44.187
36ca5c4b-b18a-4584-a230-f6b21fab4bcf	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Assistant Accountant	BLD-L2-06	\N	t	2026-09-22 07:31:40.109	2026-09-24 11:56:44.188
ac01e142-ed7e-479e-8778-c11236681f4a	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Assistant IT Coordinator	BLD-L2-07	\N	t	2026-09-22 07:31:40.11	2026-09-24 11:56:44.188
b36fd303-f77f-4ead-8a32-2c704f2c7ce6	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Electrician	BLD-L2-08	\N	t	2026-09-22 07:31:40.111	2026-09-24 11:56:44.189
150391f4-6e9e-4e8d-a650-0d7cf5e0568d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	143e958d-fcc1-4c81-a000-d713ca91a92e	Janitors	BLD-L1-03	\N	t	2026-09-22 07:31:40.1	2026-09-24 11:56:44.181
c7d59ecf-4206-4576-990c-b7e3f08d7d61	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	143e958d-fcc1-4c81-a000-d713ca91a92e	Assistant - Polisher	BLD-L1-04	\N	t	2026-09-22 07:31:40.101	2026-09-24 11:56:44.182
9ddd4a8e-e807-4d38-aeba-30d257480f4b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	143e958d-fcc1-4c81-a000-d713ca91a92e	Office Attendants	BLD-L1-05	\N	t	2026-09-22 07:31:40.102	2026-09-24 11:56:44.183
7fd9b80a-2fcb-42f4-9508-51a7d95c1a39	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Assistant - Spares	BLD-L2-09	\N	t	2026-09-22 07:31:40.111	2026-09-24 11:56:44.19
e468e636-250b-486f-adee-1596d9951f12	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Relationship Officer - Sales	BLD-L2-10	\N	t	2026-09-22 07:31:40.112	2026-09-24 11:56:44.191
d9c80d49-767b-4e6f-a907-71a2d95602c0	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Drivers	BLD-L2-11	\N	t	2026-09-22 07:31:40.113	2026-09-24 11:56:44.191
d8e54a64-2457-4a8d-a657-3c09d742677e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7612488c-b81b-4bba-9898-bfd1790cc1ba	Denter	BLD-L2-12	\N	t	2026-09-22 07:31:40.113	2026-09-24 11:56:44.192
75fef048-7447-4ffe-87e5-563bd0129899	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Technician	BLD-L3-01	\N	t	2026-09-22 07:31:40.114	2026-09-24 11:56:44.193
7acfa8ee-64a3-4e46-8b41-71e16b9286ea	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Floor Incharge	BLD-L3-02	\N	t	2026-09-22 07:31:40.115	2026-09-24 11:56:44.193
6b179b16-e88e-47dd-a5a8-64504776bd6e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - HR	BLD-L3-08	\N	t	2026-09-22 07:31:40.121	2026-09-24 11:56:44.2
abb28437-e32b-4495-940a-983ded5a004b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - Internal Auditing	BLD-L3-09	\N	t	2026-09-22 07:31:40.122	2026-09-24 11:56:44.201
b424648b-bb2d-432b-9cde-0c4590f10527	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Accounts Specialist	BLD-L3-10	\N	t	2026-09-22 07:31:40.123	2026-09-24 11:56:44.202
d3d2c099-c671-4bc8-9c67-3d1153a27ea7	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - IT	BLD-L3-11	\N	t	2026-09-22 07:31:40.124	2026-09-24 11:56:44.202
eaaa8868-694f-4a0f-a8a1-ddb19ba539e5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - Spares	BLD-L3-12	\N	t	2026-09-22 07:31:40.124	2026-09-24 11:56:44.203
de24ac40-c5a8-41e0-8646-614e9d1e2483	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - Accessories	BLD-L3-13	\N	t	2026-09-22 07:31:40.125	2026-09-24 11:56:44.203
43988472-704a-4512-9cf2-fa18b09b8d14	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Relationship Manager - Sales	BLD-L3-14	\N	t	2026-09-22 07:31:40.126	2026-09-24 11:56:44.204
ee638de7-35f2-4410-9c2b-39006a26e1df	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - Purchase	BLD-L3-15	\N	t	2026-09-22 07:31:40.126	2026-09-24 11:56:44.205
90ca5fad-add7-4903-9a18-af9ace741944	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	SPECIALIST USED CARS	BLD-L3-16	\N	t	2026-09-22 07:31:40.127	2026-09-24 11:56:44.206
57257c24-d2c4-4180-bad0-3e6dc903851b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Auditors	BLD-L3-17	\N	t	2026-09-22 07:31:40.128	2026-09-24 11:56:44.206
f23560f4-760f-40e5-9061-8f9958d00189	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	DET	BLD-L3-18	\N	t	2026-09-22 07:31:40.129	2026-09-24 11:56:44.207
0a4081b5-e95b-4a17-badb-c09643e7ef4c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Service Advisor	BLD-L3-19	\N	t	2026-09-22 07:31:40.13	2026-09-24 11:56:44.208
ed0f5dbd-bd12-4adc-88bf-e60a363327c2	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	FIELD EXECUTIVE & RTO Executive	BLD-L3-20	\N	t	2026-09-22 07:31:40.13	2026-09-24 11:56:44.209
0e63776b-4cff-485a-8231-0b850024aafc	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	SERVICE	BLD-L3-21	\N	t	2026-09-22 07:31:40.131	2026-09-24 11:56:44.209
ae800bdd-e3cd-4ad9-9812-0594f80b4d8c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	CRM	BLD-L3-22	\N	t	2026-09-22 07:31:40.132	2026-09-24 11:56:44.21
30e29e16-dcd9-4e6a-8d8f-3a262a069ad2	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	HR	BLD-L3-23	\N	t	2026-09-22 07:31:40.132	2026-09-24 11:56:44.211
7fec343f-d3fe-4693-909e-e023a1656009	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Auditor	BLD-L3-24	\N	t	2026-09-22 07:31:40.133	2026-09-24 11:56:44.211
6bf6b36c-2d12-4dd0-90fb-dc4ca7103a84	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Accounts	BLD-L3-25	\N	t	2026-09-22 07:31:40.134	2026-09-24 11:56:44.212
1298afb6-e58e-48bc-a78c-40ea8719d581	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Spares	BLD-L3-26	\N	t	2026-09-22 07:31:40.135	2026-09-24 11:56:44.213
8c73ad90-c66c-4fde-b259-fee4911e9bbd	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Sales	BLD-L3-27	\N	t	2026-09-22 07:31:40.137	2026-09-24 11:56:44.213
15afc85a-0c0b-4d79-9e24-c622a4071586	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Relationship Officer - Service	BLD-L4-01	\N	t	2026-09-22 07:31:40.138	2026-09-24 11:56:44.214
a0757b7e-71ce-4e06-bd7b-a22d883dec50	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Bodyshop Incharge	BLD-L4-02	\N	t	2026-09-22 07:31:40.138	2026-09-24 11:56:44.214
860e22fd-acc4-4ab3-a345-76a7f583db8a	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Team Leader	BLD-L4-03	\N	t	2026-09-22 07:31:40.139	2026-09-24 11:56:44.215
43af91c5-cd93-4974-8455-030c33a4e455	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Sr. HR Specialist	BLD-L4-04	\N	t	2026-09-22 07:31:40.14	2026-09-24 11:56:44.216
0eac773a-d540-44c4-8f38-71ce725d035b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Sr. Audit Specialist	BLD-L4-05	\N	t	2026-09-22 07:31:40.141	2026-09-24 11:56:44.216
3c154249-5a5b-4dc6-99d5-fb4a40f624f0	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Sr. Accountant	BLD-L4-06	\N	t	2026-09-22 07:31:40.142	2026-09-24 11:56:44.217
c2ae236b-f5d6-441f-b52e-2e3165ef7976	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Sr. Legal Consultant	BLD-L4-07	\N	t	2026-09-22 07:31:40.143	2026-09-24 11:56:44.217
0019c045-9762-4cde-8942-0c530afecaba	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Team Manager	BLD-L4-08	\N	t	2026-09-22 07:31:40.144	2026-09-24 11:56:44.218
ced6cad8-7313-4bc7-aa74-adff0adfc028	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Sr. Relationship Manager - Sales	BLD-L4-09	\N	t	2026-09-22 07:31:40.145	2026-09-24 11:56:44.219
d15170fa-88fa-42a4-91f6-de463768cfd9	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Spares Incharge	BLD-L4-10	\N	t	2026-09-22 07:31:40.146	2026-09-24 11:56:44.219
50d01fc3-3aba-418d-bd40-6b6fcc19e78a	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Purchase Incharge	BLD-L4-11	\N	t	2026-09-22 07:31:40.146	2026-09-24 11:56:44.22
c9b6d8b1-c267-4bfd-b773-fa601d7e1b7e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Customer Relations Incharge	BLD-L4-12	\N	t	2026-09-22 07:31:40.147	2026-09-24 11:56:44.22
e2f36f21-3ce8-494e-9cc6-50f7f14b3064	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	CXM	BLD-L4-13	\N	t	2026-09-22 07:31:40.148	2026-09-24 11:56:44.221
b92457b3-900e-402f-809e-c778d996aea2	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	legal	BLD-L4-14	\N	t	2026-09-22 07:31:40.148	2026-09-24 11:56:44.222
593d1ef3-a6c4-4b9b-bb2f-a68b6fe0b7b7	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	samyak shetty	BLD-L4-15	\N	t	2026-09-22 07:31:40.149	2026-09-24 11:56:44.222
4d7ab757-38ee-47d5-8b0c-afd263b78ee0	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	ASM	BLD-L4-16	\N	t	2026-09-22 07:31:40.15	2026-09-24 11:56:44.223
2be307f1-a71b-46f8-8fb8-1227bdf151e1	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	DMS Executive	BLD-L3-03	\N	t	2026-09-22 07:31:40.116	2026-09-24 11:56:44.196
cc881b1d-b626-4d11-aa77-5ad186237e65	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Warranty Specialist	BLD-L3-04	\N	t	2026-09-22 07:31:40.117	2026-09-24 11:56:44.197
b306eca3-0e5a-4696-966f-b095a1230483	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Specialist - PDI	BLD-L3-05	\N	t	2026-09-22 07:31:40.117	2026-09-24 11:56:44.198
d2068579-ef75-41c2-bbf5-a75e0207568c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f83b8f73-888b-407c-b05b-028bbd19431d	Cashier	BLD-L3-06	\N	t	2026-09-22 07:31:40.118	2026-09-24 11:56:44.198
847f183c-7495-450e-9df1-9e4ba9230386	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Used Cars Manager	BLD-L5-03	\N	t	2026-09-22 07:31:40.155	2026-09-24 11:56:44.227
510c0b1f-67f4-4237-a0f0-2d73ce533a08	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Showroom Manager	BLD-L5-04	\N	t	2026-09-22 07:31:40.156	2026-09-24 11:56:44.228
95c52057-fe91-4ccb-9a3d-4ca3f5d042e2	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Spares Manager	BLD-L5-05	\N	t	2026-09-22 07:31:40.156	2026-09-24 11:56:44.229
f317f013-17db-4577-b208-a3b6c5eaa304	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Accounts Manager	BLD-L5-06	\N	t	2026-09-22 07:31:40.157	2026-09-24 11:56:44.229
1fdad670-7875-478f-b862-32900d61b169	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Taxation Manager	BLD-L5-07	\N	t	2026-09-22 07:31:40.158	2026-09-24 11:56:44.23
d5ef23c0-22c4-492c-8b40-861216ba73d5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Audit Manager	BLD-L5-09	\N	t	2026-09-22 07:31:40.159	2026-09-24 11:56:44.231
c5e909f1-0b97-4be8-bf3f-3c2a95b8a582	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	service/sales manager	BLD-L5-10	\N	t	2026-09-22 07:31:40.16	2026-09-24 11:56:44.232
71c46d2a-dd65-4201-8841-4d9d4ea8c0bc	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Business Head	BLD-L6-01	\N	t	2026-09-22 07:31:40.16	2026-09-24 11:56:44.232
30957a0a-ced9-4d80-a2fa-8ab66757a666	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Finance Controller	BLD-L6-02	\N	t	2026-09-22 07:31:40.161	2026-09-24 11:56:44.233
8cbeae12-728f-4b2d-9ce1-15dd12ba2510	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	HR Head	BLD-L6-03	\N	t	2026-09-22 07:31:40.162	2026-09-24 11:56:44.234
dc46d646-41a0-4016-a28b-e01d5d0bb18b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Finance Head	BLD-L6-04	\N	t	2026-09-22 07:31:40.162	2026-09-24 11:56:44.234
b1765ee7-49d4-42d3-a1fb-f4802cc09f93	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Audit Head	BLD-L6-05	\N	t	2026-09-22 07:31:40.163	2026-09-24 11:56:44.235
dbae3fb4-9151-4b4d-bc95-bb1b5e9e14f4	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Service Head	BLD-L6-06	\N	t	2026-09-22 07:31:40.164	2026-09-24 11:56:44.236
22212887-bb33-48ec-8bfa-db32653f0a99	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Sales Head	BLD-L6-07	\N	t	2026-09-22 07:31:40.164	2026-09-24 11:56:44.236
3bad2c29-143a-45fb-8398-1ba135be3a2b	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Spares Head	BLD-L6-08	\N	t	2026-09-22 07:31:40.165	2026-09-24 11:56:44.237
c5df7b71-1682-4938-a936-380be1d1fb06	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Tax Controller	BLD-L6-09	\N	t	2026-09-22 07:31:40.166	2026-09-24 11:56:44.237
a3bf9aa7-97a4-4df7-a16c-157de559282a	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Statutory Controller	BLD-L6-10	\N	t	2026-09-22 07:31:40.166	2026-09-24 11:56:44.238
3c3eaf2a-b591-4c6d-92a4-e2e30636db5c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	f0f81273-6e0d-4446-8463-6c65a3d88300	Senior Account Manager	BLD-L6-11	\N	t	2026-09-22 07:31:40.167	2026-09-24 11:56:44.239
a141427f-b7d8-489b-86cb-4f3e0bc4cfdb	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Chief Audit Officer	BLD-L7-01	\N	t	2026-09-22 07:31:40.168	2026-09-24 11:56:44.24
a16d1391-6dfe-48aa-a6f4-624543563e12	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Chief Finance Officer	BLD-L7-02	\N	t	2026-09-22 07:31:40.17	2026-09-24 11:56:44.24
668fdf9c-5071-491c-bbb1-4d225fa65ba2	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Chief Inventory Officer	BLD-L7-03	\N	t	2026-09-22 07:31:40.171	2026-09-24 11:56:44.241
daefc0a9-8735-4f67-88d0-077750665b9e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Chief Sales Officer-TATA	BLD-L7-04	\N	t	2026-09-22 07:31:40.172	2026-09-24 11:56:44.242
5ab2846d-9fbd-4b30-b0f5-2035279dd023	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Chief Human Resource Officer	BLD-L7-05	\N	t	2026-09-22 07:31:40.173	2026-09-24 11:56:44.243
a3f149a5-7062-4d85-9a13-0e5a7bff29ef	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Chief Service Officer	BLD-L7-06	\N	t	2026-09-22 07:31:40.173	2026-09-24 11:56:44.243
036a785c-80e7-4e4e-a15b-776c209277b5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Deepu sir	BLD-L7-07	\N	t	2026-09-22 07:31:40.174	2026-09-24 11:56:44.244
45bd6813-e6c3-4af7-97a6-63aabd78d2f0	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	parashuram sir	BLD-L7-08	\N	t	2026-09-22 07:31:40.174	2026-09-24 11:56:44.245
eb21ce0e-f566-4d6a-ac0e-404bdfddf520	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	Shrinivas sir	BLD-L7-09	\N	t	2026-09-22 07:31:40.175	2026-09-24 11:56:44.245
63fb5eac-13d6-4983-9fee-6f58d026de8c	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	kiran s	BLD-L7-10	\N	t	2026-09-22 07:31:40.176	2026-09-24 11:56:44.246
bde5eb88-abc1-4aa0-a7c0-c74f586720b7	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2ffdee9f-cd93-4613-b91e-0d017a367aed	K R Dwarakanth	BLD-L7-11	\N	t	2026-09-22 07:31:40.177	2026-09-24 11:56:44.247
ff397bc8-a72e-4543-b7ef-3393f7e3dc23	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	50c3701f-311e-40c4-93be-a40ee2afacbc	Chief Operations Officer	BLD-L8-01	\N	t	2026-09-22 07:31:40.177	2026-09-24 11:56:44.247
98bfa52b-9a09-420a-8e06-e80c56b008fb	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	50c3701f-311e-40c4-93be-a40ee2afacbc	General Manager - Legal	BLD-L8-02	\N	t	2026-09-22 07:31:40.178	2026-09-24 11:56:44.248
2f25668a-55dd-4ac6-8b80-47a38267bad5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	50c3701f-311e-40c4-93be-a40ee2afacbc	Chief Sales Officer/CEO(TATA BANGALORE)	BLD-L8-03	\N	t	2026-09-22 07:31:40.178	2026-09-24 11:56:44.248
08ef5261-d0bb-4874-932a-c91005ffe68e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	50c3701f-311e-40c4-93be-a40ee2afacbc	Umesh wadkar sir	BLD-L8-04	\N	t	2026-09-22 07:31:40.179	2026-09-24 11:56:44.249
406cabc9-766a-49bf-ac1e-a8b473504a21	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	15dacae7-5849-4c74-82a0-fd320df9f5c0	Director/CEO	BLD-L9-01	\N	t	2026-09-22 07:31:40.18	2026-09-24 11:56:44.25
4b2a650e-ec7b-4510-b44a-6b465f52f588	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	0c0bc0c3-7600-498a-90a7-6adcbc631cbd	MD	BLD-L10-01	\N	t	2026-09-22 07:31:40.18	2026-09-24 11:56:44.25
3266737b-cd0c-459a-bac4-5736fc66292f	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Bodyshop advisor	BLD-L4-17	\N	t	2026-09-22 07:31:40.15	2026-09-24 11:56:44.224
44633aa4-ae0b-4a7d-8cc7-06eb5369f13f	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6272d44e-e7a8-4cae-bd7b-9c3d795ef115	Trainer	BLD-L4-18	\N	t	2026-09-22 07:31:40.151	2026-09-24 11:56:44.225
8bff4b67-aad8-4947-9f91-bdfd319c7428	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Purchase Manager	BLD-L5-01	\N	t	2026-09-22 07:31:40.153	2026-09-24 11:56:44.226
64c00790-42c6-46fe-9c74-da734945eaa3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	c89b7d43-a399-4833-b210-30c7fbf7e040	Branch Manager	BLD-L5-02	\N	t	2026-09-22 07:31:40.154	2026-09-24 11:56:44.227
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Employee" (id, "tenantId", "employeeCode", "firstName", "lastName", email, phone, gender, dob, "bloodGroup", "maritalStatus", "photoUrl", "branchId", department, designation, "dateOfJoining", "employmentType", status, "createdAt", "updatedAt", "designationId", "levelId", "reportingManagerId") FROM stdin;
bf2288f1-fee4-4c34-8e45-a2952eecf973	fd5918ee-e583-47e4-b776-b1c5a605faa3	APEX-1003	Vikram	Malhotra	vikram.candidate@apexauto.com	+91 99887 76655	Male	1995-01-01 00:00:00	\N	\N	\N	27db60a4-5eb5-4af7-b430-92b7821b4403	Service	Senior Diagnostic Technician	2026-10-01 00:00:00	FULL_TIME	LEFT_WITHOUT_INTIMATION	2026-09-22 07:35:46.751	2026-09-22 07:35:46.88	\N	\N	\N
afc5ad5d-4a53-4830-aebb-e967df5548fb	fd5918ee-e583-47e4-b776-b1c5a605faa3	APEX-1002	Priya	Nair	emp.priya@hrflow.com	+91 98450 67890	Female	1996-09-22 00:00:00	B+	Single	\N	27db60a4-5eb5-4af7-b430-92b7821b4403	Service	Service Manager	2023-01-15 00:00:00	FULL_TIME	LEFT_WITHOUT_INTIMATION	2026-09-22 07:31:40.043	2026-09-24 11:43:47.837	20a6d7d0-52ef-4cb8-bb1a-9b3bdae7360c	4ad5deb4-10c1-4c68-b1e2-56df55c6a45e	\N
0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	fd5918ee-e583-47e4-b776-b1c5a605faa3	APEX-1001	Rahul	Sharma	emp.rahul@hrflow.com	+91 98201 12345	Male	1994-06-15 00:00:00	O+	Married	\N	ca001867-d92c-4887-ae63-39dc8643b990	Engineering	Software Systems Engineer	2022-03-01 00:00:00	FULL_TIME	RESIGNED	2026-09-22 07:31:40.05	2026-09-24 11:56:45.62	76ce4721-7791-4520-a2d6-b8f10be341f6	3118dbdc-04df-4648-b0c9-c856bb228809	afc5ad5d-4a53-4830-aebb-e967df5548fb
24f477ef-37ba-48c9-924b-9a55c6bccbfa	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ZEN-2001	Rohit	Verma	emp.rohit@hrflow.com	+91 97654 32100	Male	1992-11-10 00:00:00	A+	Married	\N	0ffd5f8e-1871-472c-ae29-228adf944f4b	Parts	Spares & Parts Manager	2021-08-01 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.071	2026-09-22 07:31:40.071	\N	\N	\N
54bf7596-3659-4fe7-bcb2-f3543cfb8492	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	ZEN-2002	Neha	Singh	emp.neha@hrflow.com	+91 91234 56789	Female	1997-04-18 00:00:00	AB+	Single	\N	85a144e0-546e-48ac-9a5a-46a38cec8f75	Customer Relations	CRM Lead	2023-05-10 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.075	2026-09-22 07:31:40.075	\N	\N	\N
821c1ea5-99ce-4f7a-85f5-7fe90c058a7e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1001	Anand	Bellad	md.bellad@hrflow.com	+91 836 244 8801	Male	1969-05-15 00:00:00	B+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Executive Board	MD	2010-01-01 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.181	2026-09-22 07:31:40.181	4b2a650e-ec7b-4510-b44a-6b465f52f588	0c0bc0c3-7600-498a-90a7-6adcbc631cbd	\N
898197c7-025a-45e9-a29f-c9bf0df88535	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1002	Suresh	Bellad	suresh.director@belladgroup.com	+91 836 244 8802	Male	1974-08-20 00:00:00	A+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Executive Board	Director/CEO	2012-04-01 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.187	2026-09-22 07:31:40.187	406cabc9-766a-49bf-ac1e-a8b473504a21	15dacae7-5849-4c74-82a0-fd320df9f5c0	821c1ea5-99ce-4f7a-85f5-7fe90c058a7e
9a367775-8559-485e-8cbd-03253ac0e1f5	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1003	Raghavendra	Joshi	cso@belladgroup.com	+91 836 244 8803	Male	1978-11-12 00:00:00	O+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Service	Chief Service Officer	2015-06-15 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.19	2026-09-22 07:31:40.19	a3f149a5-7062-4d85-9a13-0e5a7bff29ef	2ffdee9f-cd93-4613-b91e-0d017a367aed	898197c7-025a-45e9-a29f-c9bf0df88535
b59c4a6c-4460-46de-9865-138d67ccd61d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1004	Vijay	Kulkarni	service.head@belladgroup.com	+91 836 244 8804	Male	1982-03-25 00:00:00	AB+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Service	Service Head	2017-02-01 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.192	2026-09-22 07:31:40.192	dbae3fb4-9151-4b4d-bc95-bb1b5e9e14f4	f0f81273-6e0d-4446-8463-6c65a3d88300	9a367775-8559-485e-8cbd-03253ac0e1f5
2bcce391-f44a-4fba-93aa-cc21c37ed3a3	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1005	Praveen	Patil	bm.hubli@hrflow.com	+91 836 244 8805	Male	1985-09-14 00:00:00	O+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Operations	Branch Manager	2018-09-10 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.194	2026-09-22 07:31:40.194	64c00790-42c6-46fe-9c74-da734945eaa3	c89b7d43-a399-4833-b210-30c7fbf7e040	b59c4a6c-4460-46de-9865-138d67ccd61d
031ff443-b7b1-437c-b7bd-d2dd50643978	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1006	Girish	Hiremath	girish.advisor@belladgroup.com	+91 94480 11223	Male	1990-12-05 00:00:00	B+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Service	Service Advisor	2020-07-01 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.196	2026-09-22 07:31:40.196	0a4081b5-e95b-4a17-badb-c09643e7ef4c	f83b8f73-888b-407c-b05b-028bbd19431d	2bcce391-f44a-4fba-93aa-cc21c37ed3a3
56380913-ef02-4a2f-8074-88146db1b4d4	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1007	Manjunath	Desai	manju.tech@belladgroup.com	+91 98451 44556	Male	1993-04-18 00:00:00	A+	Single	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Service	Technician	2021-03-15 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.198	2026-09-22 07:31:40.198	75fef048-7447-4ffe-87e5-563bd0129899	f83b8f73-888b-407c-b05b-028bbd19431d	031ff443-b7b1-437c-b7bd-d2dd50643978
8a933d98-6224-4b46-9c52-97162350e5ae	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1008	Basavaraj	Korvi	basavaraj.washer@belladgroup.com	+91 91100 22334	Male	1997-01-10 00:00:00	O+	Single	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Service	Washers	2022-11-01 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.2	2026-09-22 07:31:40.2	51c1b9b1-acc2-4ba5-a191-039ed0a24ae3	143e958d-fcc1-4c81-a000-d713ca91a92e	56380913-ef02-4a2f-8074-88146db1b4d4
908c14aa-0d00-426d-81c4-1629633ba629	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	BLD-1009	Kavitha	Deshpande	hr.bellad@hrflow.com	+91 836 244 8809	Female	1984-07-22 00:00:00	A+	Married	\N	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	Human Resources	HR Head	2016-05-10 00:00:00	FULL_TIME	ACTIVE	2026-09-22 07:31:40.202	2026-09-22 07:31:40.202	8cbeae12-728f-4b2d-9ce1-15dd12ba2510	f0f81273-6e0d-4446-8463-6c65a3d88300	821c1ea5-99ce-4f7a-85f5-7fe90c058a7e
\.


--
-- Data for Name: EmployeeAsset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeAsset" (id, "tenantId", "employeeId", "assetType", "assetName", "serialNumber", "issueDate", "returnDate", status, "createdAt") FROM stdin;
99bcaee9-ff13-4d9a-9ad5-be2fa37ce64d	fd5918ee-e583-47e4-b776-b1c5a605faa3	bf2288f1-fee4-4c34-8e45-a2952eecf973	SIM	Corporate 5G SIM	SN-SIM-546848	2026-09-22 07:35:46.848	\N	ASSIGNED	2026-09-22 07:35:46.849
\.


--
-- Data for Name: EmployeeDocument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeDocument" (id, "tenantId", "employeeId", "documentType", "documentName", "fileUrl", "fileSize", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: EmployeeKYC; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeKYC" (id, "employeeId", "aadhaarNumber", "panNumber", "bankName", "accountNumber", "ifscCode", "branchName", verified, "updatedAt") FROM stdin;
ea430d31-628d-4186-9efe-24c9bae979b2	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	XXXX-XXXX-4521	ABCPS1234K	HDFC Bank	50100234567890	HDFC0000060	BKC Branch Mumbai	t	2026-09-22 07:31:40.055
dd2a722d-07af-4a6c-b84a-0ef5ac09cad4	24f477ef-37ba-48c9-924b-9a55c6bccbfa	XXXX-XXXX-8912	VERMA9876P	ICICI Bank	002105012345	ICIC0000021	SB Road Pune	t	2026-09-22 07:31:40.073
\.


--
-- Data for Name: EmployeeLevel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeLevel" (id, "tenantId", "levelNumber", name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
57259c38-88e7-4051-b597-acf178ba1b14	fd5918ee-e583-47e4-b776-b1c5a605faa3	1	Entry Level	Associates and trainees	t	2026-09-22 07:31:40.035	2026-09-22 07:31:40.035
3118dbdc-04df-4648-b0c9-c856bb228809	fd5918ee-e583-47e4-b776-b1c5a605faa3	2	Professional	Engineers and specialists	t	2026-09-22 07:31:40.038	2026-09-22 07:31:40.038
4ad5deb4-10c1-4c68-b1e2-56df55c6a45e	fd5918ee-e583-47e4-b776-b1c5a605faa3	3	Leadership	Managers and team leads	t	2026-09-22 07:31:40.039	2026-09-22 07:31:40.039
143e958d-fcc1-4c81-a000-d713ca91a92e	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	1	Staff	Entry-level support, janitorial, and operations staff	t	2026-09-22 07:31:40.085	2026-09-24 11:56:44.168
7612488c-b81b-4bba-9898-bfd1790cc1ba	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	2	Middle Management	Coordinators, assistants, and junior specialists	t	2026-09-22 07:31:40.091	2026-09-24 11:56:44.17
f83b8f73-888b-407c-b05b-028bbd19431d	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	3	Senior Management	Specialists, technicians, executives, and advisors	t	2026-09-22 07:31:40.092	2026-09-24 11:56:44.171
6272d44e-e7a8-4cae-bd7b-9c3d795ef115	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	4	Top Management	Team leaders, in-charges, senior specialists, and consultants	t	2026-09-22 07:31:40.093	2026-09-24 11:56:44.172
c89b7d43-a399-4833-b210-30c7fbf7e040	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	5	Level 5	Departmental managers and branch managers	t	2026-09-22 07:31:40.094	2026-09-24 11:56:44.173
f0f81273-6e0d-4446-8463-6c65a3d88300	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6	Level 6	Functional heads, controllers, and business heads	t	2026-09-22 07:31:40.094	2026-09-24 11:56:44.174
2ffdee9f-cd93-4613-b91e-0d017a367aed	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	7	Level 7	Chief officers, senior executives, and leadership advisors	t	2026-09-22 07:31:40.095	2026-09-24 11:56:44.175
50c3701f-311e-40c4-93be-a40ee2afacbc	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	8	Level 8	Executive leadership, COOs, and general managers	t	2026-09-22 07:31:40.096	2026-09-24 11:56:44.176
15dacae7-5849-4c74-82a0-fd320df9f5c0	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	9	Director/CEO	Board-level executive directors and Chief Executive Officers	t	2026-09-22 07:31:40.097	2026-09-24 11:56:44.177
0c0bc0c3-7600-498a-90a7-6adcbc631cbd	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	10	MD	Managing Director & Ultimate Executive Leadership	t	2026-09-22 07:31:40.097	2026-09-24 11:56:44.178
\.


--
-- Data for Name: EmployeeSalary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeSalary" (id, "employeeId", basic, hra, conveyance, "specialAllowance", "grossSalary", "effectiveDate", "updatedAt") FROM stdin;
1a538bf8-87e8-41ae-a994-b4460651c93b	afc5ad5d-4a53-4830-aebb-e967df5548fb	40000	20000	2500	12500	75000	2026-09-22 07:31:40.048	2026-09-22 07:31:40.048
ed858402-2c25-4d77-82dd-3278068f3886	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	45000	22500	3000	14500	85000	2026-09-22 07:31:40.058	2026-09-22 07:31:40.058
7ce91201-8f46-4a20-a094-94693e5ebc5a	24f477ef-37ba-48c9-924b-9a55c6bccbfa	38000	19000	2000	11000	70000	2026-09-22 07:31:40.074	2026-09-22 07:31:40.074
a8906bc2-a7b5-4679-a75f-8a284010b226	54bf7596-3659-4fe7-bcb2-f3543cfb8492	32000	16000	2000	10000	60000	2026-09-22 07:31:40.076	2026-09-22 07:31:40.076
9086a966-8c58-42c6-87b9-10b68aab07e1	821c1ea5-99ce-4f7a-85f5-7fe90c058a7e	150000	75000	15000	60000	300000	2026-09-22 07:31:40.186	2026-09-22 07:31:40.186
330bfe7f-106a-42f5-87bd-a640036a6836	898197c7-025a-45e9-a29f-c9bf0df88535	120000	60000	12000	48000	240000	2026-09-22 07:31:40.189	2026-09-22 07:31:40.189
0c214d51-1a52-4795-bc84-49790937a2d2	9a367775-8559-485e-8cbd-03253ac0e1f5	90000	45000	8000	37000	180000	2026-09-22 07:31:40.191	2026-09-22 07:31:40.191
876d7f44-295e-4efc-8366-d0c7b5e26c80	b59c4a6c-4460-46de-9865-138d67ccd61d	70000	35000	6000	29000	140000	2026-09-22 07:31:40.193	2026-09-22 07:31:40.193
f08c9c20-f90a-475a-a8bb-bce31c4307f7	2bcce391-f44a-4fba-93aa-cc21c37ed3a3	55000	27500	5000	22500	110000	2026-09-22 07:31:40.196	2026-09-22 07:31:40.196
9575fec7-2480-470c-80dd-eba588651542	031ff443-b7b1-437c-b7bd-d2dd50643978	30000	15000	3000	12000	60000	2026-09-22 07:31:40.197	2026-09-22 07:31:40.197
33931b1e-d0af-4ec1-a42f-322e6cd5d9e3	56380913-ef02-4a2f-8074-88146db1b4d4	25000	12500	2500	10000	50000	2026-09-22 07:31:40.199	2026-09-22 07:31:40.199
d19b9215-f0fc-41e4-9e66-1eb9cf1b18e7	8a933d98-6224-4b46-9c52-97162350e5ae	16000	8000	1500	4500	30000	2026-09-22 07:31:40.201	2026-09-22 07:31:40.201
c99ea73e-424c-441b-8503-c88bdb1ab613	908c14aa-0d00-426d-81c4-1629633ba629	65000	32500	5000	27500	130000	2026-09-22 07:31:40.205	2026-09-22 07:31:40.205
c1d34e58-34d3-43d0-a4bf-49088f2ce7c2	bf2288f1-fee4-4c34-8e45-a2952eecf973	40000	20000	0	12000	72000	2026-10-01 00:00:00	2026-09-22 07:35:46.754
\.


--
-- Data for Name: EmployeeStatutory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeStatutory" (id, "employeeId", "pfNumber", "uanNumber", "esiNumber", "pfApplicable", "esiApplicable", "updatedAt") FROM stdin;
e000689c-6e7e-4091-be13-fcf08e800e0a	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	MH/BAN/0012345/000/0001001	100904561234	31000543210001001	t	f	2026-09-22 07:31:40.056
ef5f51b6-8ba9-4191-88a6-fbaea7692b5f	bf2288f1-fee4-4c34-8e45-a2952eecf973	\N	\N	\N	t	t	2026-09-22 07:35:46.753
\.


--
-- Data for Name: EmployeeTransfer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmployeeTransfer" (id, "tenantId", "employeeId", "fromBranchId", "toBranchId", "transferDate", "effectiveDate", reason, status, "approvedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: FnfRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FnfRecord" (id, "tenantId", "employeeId", "resignationId", "settlementDate", "unpaidDays", "encashmentAmount", "gratuityAmount", deductions, "netPayable", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: JoiningRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."JoiningRecord" (id, "tenantId", "candidateName", "candidateEmail", "candidatePhone", "positionId", "branchId", designation, department, "joiningDate", token, status, "formData", "createdAt", "updatedAt") FROM stdin;
3f8b2e34-07c4-4b2c-b8eb-70705028fb0b	fd5918ee-e583-47e4-b776-b1c5a605faa3	Vikram Malhotra	vikram.candidate@apexauto.com	+91 99887 76655	836790e7-59a3-4237-affd-f2eb00afe764	27db60a4-5eb5-4af7-b430-92b7821b4403	Senior Diagnostic Technician	Service	2026-10-01 00:00:00	join_vikram_apex_2026	COMPLETED	\N	2026-09-22 07:31:40.062	2026-09-22 07:35:46.755
\.


--
-- Data for Name: ManpowerBudget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ManpowerBudget" (id, "tenantId", "branchId", department, "financialYear", "sanctionedPositions", "existingCount", "budgetAmount", "createdAt", "updatedAt") FROM stdin;
82cf1f62-45fa-495c-abab-05fb6abbd64b	fd5918ee-e583-47e4-b776-b1c5a605faa3	ca001867-d92c-4887-ae63-39dc8643b990	Engineering	2026-2027	5	0	5000000	2026-09-22 07:31:40.061	2026-09-22 07:31:40.061
\.


--
-- Data for Name: NocRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NocRecord" (id, "tenantId", "employeeId", "resignationId", "departmentClearance", "assetClearance", "financeClearance", status, remarks, "updatedAt") FROM stdin;
e04ee85c-6cad-4bf3-89d7-18863e22a5b5	fd5918ee-e583-47e4-b776-b1c5a605faa3	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	618a47f2-c31b-4044-9825-3b7a7cb0444f	f	f	f	PENDING	Awaiting Department, IT/Asset, and Finance clearance.	2026-09-22 07:35:46.861
2d969c8c-b69d-418d-aec9-368ca84a07a4	fd5918ee-e583-47e4-b776-b1c5a605faa3	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	fb35cfe5-72da-40ac-a299-b98c75f59b76	f	f	f	PENDING	Awaiting Department, IT/Asset, and Finance clearance.	2026-09-24 11:43:47.815
c9901f64-9cd9-43ba-a426-378cf79b17a2	fd5918ee-e583-47e4-b776-b1c5a605faa3	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	56ccc928-1acd-4886-abb7-9a13d8c980c0	f	f	f	PENDING	Awaiting Department, IT/Asset, and Finance clearance.	2026-09-24 11:56:45.625
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "tenantId", "userId", title, message, type, link, "isRead", "createdAt") FROM stdin;
c716df9c-e9f0-4564-8349-d48497722663	fd5918ee-e583-47e4-b776-b1c5a605faa3	5d1500fe-4feb-45d0-bf4b-528ce3f52c88	New Joiner Ready for Asset Approval	Vikram Malhotra has joined Bangalore Tech Park Showroom. Please approve SIM & Laptop allocation.	ACTION_REQUIRED	/approvals	f	2026-09-22 07:35:46.761
e98b70ec-10d7-498c-bbd7-381f2f496948	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	BM Approved SIM Allocation	Branch Manager at Bangalore Tech Park Showroom approved SIM_REQUEST (Approved by Branch Manager Bangalore. SIM dispatched.). Ready for HR dispatch.	ACTION_REQUIRED	/approvals	f	2026-09-22 07:35:46.845
06026905-e511-49f3-8866-9bdf23b1b261	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	New Resignation Submitted	Rahul Sharma (APEX-1001) submitted resignation. Salary placed on hold. Replacement position POS-REP-APEX-1001-6859 opened.	ALERT	/exit	f	2026-09-22 07:35:46.864
8d06f8ae-f1be-4aad-aa8e-9aa3ca0dc497	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	Employee Marked Left Without Intimation	Vikram Malhotra (APEX-1003) was marked Left Without Intimation by Absent without intimation for 14 consecutive days.. Replacement position opened.	ALERT	/vacancies	f	2026-09-22 07:35:46.886
4e3151be-88b4-45b9-b2fb-af28aa63a7aa	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	New Resignation Submitted	Rahul Sharma (APEX-1001) submitted resignation. Salary placed on hold. Replacement position POS-REP-APEX-1001-7811 opened.	ALERT	/exit	f	2026-09-24 11:43:47.818
faa9ae9f-d219-48ec-a309-5fa4211a6f47	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	Employee Marked Left Without Intimation	Priya Nair (APEX-1002) was marked Left Without Intimation by Absent without intimation for 14 consecutive days.. Replacement position opened.	ALERT	/vacancies	f	2026-09-24 11:43:47.842
44649656-c284-4371-87d1-775f04668d25	fd5918ee-e583-47e4-b776-b1c5a605faa3	a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	New Resignation Submitted	Rahul Sharma (APEX-1001) submitted resignation. Salary placed on hold. Replacement position POS-REP-APEX-1001-5623 opened.	ALERT	/exit	f	2026-09-24 11:56:45.627
\.


--
-- Data for Name: PayDay; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PayDay" (id, "tenantId", month, year, "employeeId", "totalWorkingDays", "presentDays", "paidLeaves", "lopDays", "payableDays", "createdAt") FROM stdin;
4105d8ea-547e-4e5e-93bd-733ffdc6ca5b	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	30	28	2	0	30	2026-09-22 07:31:40.063
e047699b-a633-409d-b4d3-d82948d47aaa	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	afc5ad5d-4a53-4830-aebb-e967df5548fb	30	29	1	0	30	2026-09-22 07:31:40.064
\.


--
-- Data for Name: PaymentAdvice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentAdvice" (id, "tenantId", month, year, "branchId", "bankName", "totalEmployees", "totalAmount", status, "referenceNumber", "createdAt") FROM stdin;
5efa3093-f351-4a1f-bb2a-a2b480561cb7	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	\N	HDFC Corporate NetBanking	1	75000	GENERATED	PA-FD59-202609-ALL-6909	2026-09-22 07:35:46.91
38953de6-b674-4d82-9f9b-0e35f0c64024	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	\N	HDFC Corporate NetBanking	0	0	GENERATED	PA-FD59-202609-ALL-7864	2026-09-24 11:43:47.865
e74a9f35-ee49-4488-9ae0-c8e7338e97f3	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	\N	HDFC Corporate NetBanking	0	0	GENERATED	PA-FD59-202609-ALL-5657	2026-09-24 11:56:45.658
\.


--
-- Data for Name: Payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payroll" (id, "tenantId", month, year, "employeeId", "branchId", basic, hra, allowances, "grossPay", "pfDeduction", "esiDeduction", "advanceDeduction", "taxDeduction", "totalDeductions", "netPay", "isHold", status, "createdAt", "updatedAt") FROM stdin;
16344647-ed85-4cea-9fc7-ffbbbe4c4489	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	bf2288f1-fee4-4c34-8e45-a2952eecf973	27db60a4-5eb5-4af7-b430-92b7821b4403	40000	20000	12000	72000	4800	0	0	0	4800	67200	t	PROCESSED	2026-09-22 07:35:46.9	2026-09-24 11:56:45.646
6bdbeade-7054-4c0b-8222-9802e359237e	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	afc5ad5d-4a53-4830-aebb-e967df5548fb	27db60a4-5eb5-4af7-b430-92b7821b4403	40000	20000	15000	75000	0	0	0	0	0	75000	t	PROCESSED	2026-09-22 07:35:46.902	2026-09-24 11:56:45.648
f96b7d7a-d461-4c21-881c-548cb2bca762	fd5918ee-e583-47e4-b776-b1c5a605faa3	9	2026	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	ca001867-d92c-4887-ae63-39dc8643b990	45000	22500	17500	85000	5400	0	0	0	5400	79600	t	PROCESSED	2026-09-22 07:35:46.897	2026-09-24 11:56:45.65
\.


--
-- Data for Name: Position; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Position" (id, "tenantId", "positionCode", title, department, "branchId", "requiredCount", status, "reasonForOpening", "sourceResignationId", "createdAt", "updatedAt") FROM stdin;
67e24008-9440-4b79-b982-52149a9001a4	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-APEX-101	Senior Automobile Sales Consultant	Sales	ca001867-d92c-4887-ae63-39dc8643b990	2	OPEN	Showroom expansion	\N	2026-09-22 07:31:40.058	2026-09-22 07:31:40.058
11cd1631-5cf3-4367-a9e2-ebf8a994482b	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	POS-ZEN-201	Commercial Fleet Specialist	Sales	0ffd5f8e-1871-472c-ae29-228adf944f4b	3	OPEN	Quarterly heavy commercial sales drive	\N	2026-09-22 07:31:40.077	2026-09-22 07:31:40.077
836790e7-59a3-4237-affd-f2eb00afe764	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-APEX-102	Senior Diagnostic Technician	Service	27db60a4-5eb5-4af7-b430-92b7821b4403	1	CLOSED	EV workshop certification requirement	\N	2026-09-22 07:31:40.06	2026-09-22 07:35:46.756
d67a2639-d172-49ee-9a90-e9f23f8865fa	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-REP-APEX-1001-6859	Software Systems Engineer (Replacement for APEX-1001)	Engineering	ca001867-d92c-4887-ae63-39dc8643b990	1	OPEN	Automatic replacement vacancy created due to resignation of Rahul Sharma (APEX-1001).	618a47f2-c31b-4044-9825-3b7a7cb0444f	2026-09-22 07:35:46.86	2026-09-22 07:35:46.86
62d1a2e2-1914-418b-8c95-8eb604a1f351	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-LWI-APEX-1003-6883	Senior Diagnostic Technician (Urgent Replacement - LWI)	Service	27db60a4-5eb5-4af7-b430-92b7821b4403	1	OPEN	Automatic replacement vacancy created because Vikram Malhotra (APEX-1003) was marked Left Without Intimation.	\N	2026-09-22 07:35:46.884	2026-09-22 07:35:46.884
d1d54f8b-183d-4bbe-90a1-fee92c10ee8a	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-REP-APEX-1001-7811	Software Systems Engineer (Replacement for APEX-1001)	Engineering	ca001867-d92c-4887-ae63-39dc8643b990	1	OPEN	Automatic replacement vacancy created due to resignation of Rahul Sharma (APEX-1001).	fb35cfe5-72da-40ac-a299-b98c75f59b76	2026-09-24 11:43:47.813	2026-09-24 11:43:47.813
047d9317-818a-47d5-a0e3-0daa395a878d	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-LWI-APEX-1002-7839	Service Manager (Urgent Replacement - LWI)	Service	27db60a4-5eb5-4af7-b430-92b7821b4403	1	OPEN	Automatic replacement vacancy created because Priya Nair (APEX-1002) was marked Left Without Intimation.	\N	2026-09-24 11:43:47.839	2026-09-24 11:43:47.839
86396d02-e6ac-4ecc-90cb-50a1fb8d35f4	fd5918ee-e583-47e4-b776-b1c5a605faa3	POS-REP-APEX-1001-5623	Software Systems Engineer (Replacement for APEX-1001)	Engineering	ca001867-d92c-4887-ae63-39dc8643b990	1	OPEN	Automatic replacement vacancy created due to resignation of Rahul Sharma (APEX-1001).	56ccc928-1acd-4886-abb7-9a13d8c980c0	2026-09-24 11:56:45.624	2026-09-24 11:56:45.624
\.


--
-- Data for Name: Resignation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Resignation" (id, "tenantId", "employeeId", "resignationDate", "noticePeriodDays", "proposedLastWorkingDate", reason, status, "salaryHoldStatus", "fnfDate", "hrRemarks", "createdAt", "updatedAt") FROM stdin;
618a47f2-c31b-4044-9825-3b7a7cb0444f	fd5918ee-e583-47e4-b776-b1c5a605faa3	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	2026-09-22 07:35:46.855	30	2026-10-22 07:35:46.855	Relocating to another city for higher education.	SUBMITTED	ON_HOLD	\N	\N	2026-09-22 07:35:46.856	2026-09-22 07:35:46.856
fb35cfe5-72da-40ac-a299-b98c75f59b76	fd5918ee-e583-47e4-b776-b1c5a605faa3	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	2026-09-24 11:43:47.806	30	2026-10-24 11:43:47.806	Relocating to another city for higher education.	SUBMITTED	ON_HOLD	\N	\N	2026-09-24 11:43:47.806	2026-09-24 11:43:47.806
56ccc928-1acd-4886-abb7-9a13d8c980c0	fd5918ee-e583-47e4-b776-b1c5a605faa3	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	2026-09-24 11:56:45.618	30	2026-10-24 11:56:45.618	Relocating to another city for higher education.	SUBMITTED	ON_HOLD	\N	\N	2026-09-24 11:56:45.619	2026-09-24 11:56:45.619
\.


--
-- Data for Name: SalaryAdvance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SalaryAdvance" (id, "tenantId", "employeeId", amount, purpose, "monthlyDeduction", status, "bmRemarks", "hrRemarks", "disbursedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SalaryHike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SalaryHike" (id, "employeeId", "previousSalary", "newSalary", percentage, reason, "effectiveDate", "approvedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tenant" (id, "organizationName", "legalName", code, "logoUrl", "contactPhone", "contactEmail", address, "subscriptionPlan", status, settings, features, "createdAt", "updatedAt") FROM stdin;
2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	Bellad Group	Bellad Enterprises Private Limited	BELLAD	https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150	+91 836 244 8888	contact@belladgroup.com	Bellad Chambers, PB Road, Hubli, Karnataka 580025	ENTERPRISE	ACTIVE	{"codeFormats": {"employeeCodePrefix": "BLD-", "positionCodePrefix": "POS-BLD-"}, "salarySettings": {"pfRate": 0.12, "esiRate": 0.0075, "esiThreshold": 21000, "standardWorkingDays": 30}, "attendanceRules": {"fullDayHours": 8, "halfDayHours": 4, "gracePeriodMinutes": 15}, "workingDaysPerMonth": 30}	{"exit": true, "audit": true, "joining": true, "payroll": true, "reports": true, "advances": true, "approvals": true, "employees": true, "vacancies": true, "attendance": true}	2026-09-22 07:31:40.078	2026-09-22 07:31:40.078
fd5918ee-e583-47e4-b776-b1c5a605faa3	Apex Auto Group	Apex Automotive Dealerships Private Limited	APEX-AUTO	https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=150	+91 22 6123 4500	corporate@apexautogroup.com	Level 14, Platina Tower, Bandra Kurla Complex (BKC), Mumbai 400051	ENTERPRISE	ACTIVE	{"codeFormats": {"employeeCodePrefix": "APEX-", "positionCodePrefix": "POS-APEX-"}, "salarySettings": {"pfRate": 0.12, "esiRate": 0.0075, "esiThreshold": 21000, "standardWorkingDays": 30}, "attendanceRules": {"fullDayHours": 8, "halfDayHours": 4, "gracePeriodMinutes": 15}, "workingDaysPerMonth": 30}	{"exit": true, "audit": true, "joining": true, "payroll": true, "reports": true, "advances": true, "approvals": true, "employees": true, "vacancies": true, "attendance": true}	2026-09-22 07:31:40.027	2026-09-22 07:31:40.027
e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	Zenith Motors Group	Zenith Commercial Vehicles & Dealerships Ltd	ZENITH-MOTORS	https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150	+91 20 4567 8900	contact@zenithmotors.com	ICC Tech Park, Senapati Bapat Road, Pune 411016	PRO	ACTIVE	{"codeFormats": {"employeeCodePrefix": "ZEN-", "positionCodePrefix": "POS-ZEN-"}, "salarySettings": {"pfRate": 0.12, "esiRate": 0.0075, "esiThreshold": 21000, "standardWorkingDays": 30}, "workingDaysPerMonth": 30}	{"payroll": true, "employees": true, "vacancies": true}	2026-09-22 07:31:40.065	2026-09-24 11:56:45.24
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", role, status, "tenantId", "branchId", "employeeId", "createdAt", "updatedAt") FROM stdin;
a8fe6450-d0d8-4485-b259-5191ad5d2982	admin@hrflow.com	$2a$10$vXkUTknsmdlKwm/uCtdMx.kWoIDltxzgb2QDvR2jfp359o/0ZKozy	PLATFORM_ADMIN	ACTIVE	\N	\N	\N	2026-09-22 07:31:40.024	2026-09-22 07:31:40.024
a50aa3b2-8fb0-483b-a68c-bd2b167bcad9	hr@hrflow.com	$2a$10$YFUQMYG0KCduPgKPSe/yWuAWNmiYgBWKf0L4Otueuc0J7cL7.yqIS	HR	ACTIVE	fd5918ee-e583-47e4-b776-b1c5a605faa3	ca001867-d92c-4887-ae63-39dc8643b990	\N	2026-09-22 07:31:40.031	2026-09-22 07:31:40.031
eeaa9a99-b5f7-44ca-a7b6-0b9e66e435c9	bm.mumbai@hrflow.com	$2a$10$Gy9pi/Uvt4psrVAmgDMLHOfGWjenLSLWBAyyZOAdPZzcAz.WNeVRG	BM	ACTIVE	fd5918ee-e583-47e4-b776-b1c5a605faa3	ca001867-d92c-4887-ae63-39dc8643b990	\N	2026-09-22 07:31:40.033	2026-09-22 07:31:40.033
5d1500fe-4feb-45d0-bf4b-528ce3f52c88	bm.bangalore@hrflow.com	$2a$10$Gy9pi/Uvt4psrVAmgDMLHOfGWjenLSLWBAyyZOAdPZzcAz.WNeVRG	BM	ACTIVE	fd5918ee-e583-47e4-b776-b1c5a605faa3	27db60a4-5eb5-4af7-b430-92b7821b4403	\N	2026-09-22 07:31:40.034	2026-09-22 07:31:40.034
940180e4-4bcb-41dd-9eb9-edb150637ffc	emp.priya@hrflow.com	$2a$10$EHBMFoBceudQPA6/fMzsn.lqqhGIZBFfwgIY73zaM0SA5OTfMicJS	EMPLOYEE	ACTIVE	fd5918ee-e583-47e4-b776-b1c5a605faa3	27db60a4-5eb5-4af7-b430-92b7821b4403	afc5ad5d-4a53-4830-aebb-e967df5548fb	2026-09-22 07:31:40.046	2026-09-22 07:31:40.046
e33bc161-06be-48af-921d-0ee6ff69a9bb	emp.rahul@hrflow.com	$2a$10$EHBMFoBceudQPA6/fMzsn.lqqhGIZBFfwgIY73zaM0SA5OTfMicJS	EMPLOYEE	ACTIVE	fd5918ee-e583-47e4-b776-b1c5a605faa3	ca001867-d92c-4887-ae63-39dc8643b990	0da5d579-c3ff-4ddb-9835-eedb0f8cae7e	2026-09-22 07:31:40.053	2026-09-22 07:31:40.053
5f5309dd-0fdc-4d39-b3d9-c862432d83ee	hr.zenith@hrflow.com	$2a$10$YFUQMYG0KCduPgKPSe/yWuAWNmiYgBWKf0L4Otueuc0J7cL7.yqIS	HR	ACTIVE	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	0ffd5f8e-1871-472c-ae29-228adf944f4b	\N	2026-09-22 07:31:40.068	2026-09-22 07:31:40.068
03c78c7a-706d-4f45-9ed3-0b82bc79eb16	bm.pune@hrflow.com	$2a$10$Gy9pi/Uvt4psrVAmgDMLHOfGWjenLSLWBAyyZOAdPZzcAz.WNeVRG	BM	ACTIVE	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	0ffd5f8e-1871-472c-ae29-228adf944f4b	\N	2026-09-22 07:31:40.069	2026-09-22 07:31:40.069
e5562265-c9a2-40df-8302-452e26b9e19c	emp.rohit@hrflow.com	$2a$10$EHBMFoBceudQPA6/fMzsn.lqqhGIZBFfwgIY73zaM0SA5OTfMicJS	EMPLOYEE	ACTIVE	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	0ffd5f8e-1871-472c-ae29-228adf944f4b	24f477ef-37ba-48c9-924b-9a55c6bccbfa	2026-09-22 07:31:40.072	2026-09-22 07:31:40.072
52b9607e-da61-4fac-bc6c-383cf7d532dc	emp.neha@hrflow.com	$2a$10$EHBMFoBceudQPA6/fMzsn.lqqhGIZBFfwgIY73zaM0SA5OTfMicJS	EMPLOYEE	ACTIVE	e5ebdb0d-09da-4b1a-ba8e-8ca41b948f33	85a144e0-546e-48ac-9a5a-46a38cec8f75	54bf7596-3659-4fe7-bcb2-f3543cfb8492	2026-09-22 07:31:40.076	2026-09-22 07:31:40.076
8f0f5de7-fb13-4e7e-a96a-a031d9a41fb9	md.bellad@hrflow.com	$2a$10$YFUQMYG0KCduPgKPSe/yWuAWNmiYgBWKf0L4Otueuc0J7cL7.yqIS	HR	ACTIVE	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	821c1ea5-99ce-4f7a-85f5-7fe90c058a7e	2026-09-22 07:31:40.084	2026-09-22 07:31:40.182
85d5933f-b319-475f-8e39-2f6ecc517ab4	bm.hubli@hrflow.com	$2a$10$Gy9pi/Uvt4psrVAmgDMLHOfGWjenLSLWBAyyZOAdPZzcAz.WNeVRG	BM	ACTIVE	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	2bcce391-f44a-4fba-93aa-cc21c37ed3a3	2026-09-22 07:31:40.083	2026-09-22 07:31:40.195
a0d55345-fa48-4930-8760-1527632c301b	hr.bellad@hrflow.com	$2a$10$YFUQMYG0KCduPgKPSe/yWuAWNmiYgBWKf0L4Otueuc0J7cL7.yqIS	HR	ACTIVE	2e9e3a8c-13c5-4e5a-bbe9-1c612520ffa0	6c353c46-a1b5-4cf8-baad-6f4cdca5474f	908c14aa-0d00-426d-81c4-1629633ba629	2026-09-22 07:31:40.082	2026-09-22 07:31:40.204
\.


--
-- Name: Approval Approval_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceCorrection AttendanceCorrection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: Deduction Deduction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deduction"
    ADD CONSTRAINT "Deduction_pkey" PRIMARY KEY (id);


--
-- Name: Designation Designation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Designation"
    ADD CONSTRAINT "Designation_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeAsset EmployeeAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeAsset"
    ADD CONSTRAINT "EmployeeAsset_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeDocument EmployeeDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeDocument"
    ADD CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeKYC EmployeeKYC_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeKYC"
    ADD CONSTRAINT "EmployeeKYC_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeLevel EmployeeLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeLevel"
    ADD CONSTRAINT "EmployeeLevel_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeSalary EmployeeSalary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeSalary"
    ADD CONSTRAINT "EmployeeSalary_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeStatutory EmployeeStatutory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeStatutory"
    ADD CONSTRAINT "EmployeeStatutory_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeTransfer EmployeeTransfer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeTransfer"
    ADD CONSTRAINT "EmployeeTransfer_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: FnfRecord FnfRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FnfRecord"
    ADD CONSTRAINT "FnfRecord_pkey" PRIMARY KEY (id);


--
-- Name: JoiningRecord JoiningRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JoiningRecord"
    ADD CONSTRAINT "JoiningRecord_pkey" PRIMARY KEY (id);


--
-- Name: ManpowerBudget ManpowerBudget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManpowerBudget"
    ADD CONSTRAINT "ManpowerBudget_pkey" PRIMARY KEY (id);


--
-- Name: NocRecord NocRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NocRecord"
    ADD CONSTRAINT "NocRecord_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PayDay PayDay_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayDay"
    ADD CONSTRAINT "PayDay_pkey" PRIMARY KEY (id);


--
-- Name: PaymentAdvice PaymentAdvice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentAdvice"
    ADD CONSTRAINT "PaymentAdvice_pkey" PRIMARY KEY (id);


--
-- Name: Payroll Payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_pkey" PRIMARY KEY (id);


--
-- Name: Position Position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Position"
    ADD CONSTRAINT "Position_pkey" PRIMARY KEY (id);


--
-- Name: Resignation Resignation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resignation"
    ADD CONSTRAINT "Resignation_pkey" PRIMARY KEY (id);


--
-- Name: SalaryAdvance SalaryAdvance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalaryAdvance"
    ADD CONSTRAINT "SalaryAdvance_pkey" PRIMARY KEY (id);


--
-- Name: SalaryHike SalaryHike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalaryHike"
    ADD CONSTRAINT "SalaryHike_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Approval_tenantId_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Approval_tenantId_branchId_idx" ON public."Approval" USING btree ("tenantId", "branchId");


--
-- Name: Approval_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Approval_tenantId_idx" ON public."Approval" USING btree ("tenantId");


--
-- Name: Approval_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Approval_tenantId_status_idx" ON public."Approval" USING btree ("tenantId", status);


--
-- Name: AttendanceCorrection_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AttendanceCorrection_employeeId_idx" ON public."AttendanceCorrection" USING btree ("employeeId");


--
-- Name: AttendanceCorrection_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AttendanceCorrection_tenantId_idx" ON public."AttendanceCorrection" USING btree ("tenantId");


--
-- Name: AttendanceCorrection_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AttendanceCorrection_tenantId_status_idx" ON public."AttendanceCorrection" USING btree ("tenantId", status);


--
-- Name: Attendance_employeeId_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON public."Attendance" USING btree ("employeeId", date);


--
-- Name: Attendance_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Attendance_employeeId_idx" ON public."Attendance" USING btree ("employeeId");


--
-- Name: Attendance_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Attendance_tenantId_idx" ON public."Attendance" USING btree ("tenantId");


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_module_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_module_idx" ON public."AuditLog" USING btree (module);


--
-- Name: AuditLog_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_tenantId_idx" ON public."AuditLog" USING btree ("tenantId");


--
-- Name: Branch_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Branch_tenantId_code_key" ON public."Branch" USING btree ("tenantId", code);


--
-- Name: Branch_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Branch_tenantId_idx" ON public."Branch" USING btree ("tenantId");


--
-- Name: Deduction_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deduction_employeeId_idx" ON public."Deduction" USING btree ("employeeId");


--
-- Name: Deduction_month_year_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Deduction_month_year_employeeId_key" ON public."Deduction" USING btree (month, year, "employeeId");


--
-- Name: Deduction_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deduction_tenantId_idx" ON public."Deduction" USING btree ("tenantId");


--
-- Name: Designation_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Designation_tenantId_idx" ON public."Designation" USING btree ("tenantId");


--
-- Name: Designation_tenantId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Designation_tenantId_isActive_idx" ON public."Designation" USING btree ("tenantId", "isActive");


--
-- Name: Designation_tenantId_levelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Designation_tenantId_levelId_idx" ON public."Designation" USING btree ("tenantId", "levelId");


--
-- Name: Designation_tenantId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Designation_tenantId_name_key" ON public."Designation" USING btree ("tenantId", name);


--
-- Name: EmployeeAsset_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeAsset_employeeId_idx" ON public."EmployeeAsset" USING btree ("employeeId");


--
-- Name: EmployeeAsset_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeAsset_tenantId_idx" ON public."EmployeeAsset" USING btree ("tenantId");


--
-- Name: EmployeeDocument_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeDocument_employeeId_idx" ON public."EmployeeDocument" USING btree ("employeeId");


--
-- Name: EmployeeDocument_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeDocument_tenantId_idx" ON public."EmployeeDocument" USING btree ("tenantId");


--
-- Name: EmployeeKYC_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmployeeKYC_employeeId_key" ON public."EmployeeKYC" USING btree ("employeeId");


--
-- Name: EmployeeLevel_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeLevel_tenantId_idx" ON public."EmployeeLevel" USING btree ("tenantId");


--
-- Name: EmployeeLevel_tenantId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeLevel_tenantId_isActive_idx" ON public."EmployeeLevel" USING btree ("tenantId", "isActive");


--
-- Name: EmployeeLevel_tenantId_levelNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmployeeLevel_tenantId_levelNumber_key" ON public."EmployeeLevel" USING btree ("tenantId", "levelNumber");


--
-- Name: EmployeeSalary_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmployeeSalary_employeeId_key" ON public."EmployeeSalary" USING btree ("employeeId");


--
-- Name: EmployeeStatutory_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmployeeStatutory_employeeId_key" ON public."EmployeeStatutory" USING btree ("employeeId");


--
-- Name: EmployeeTransfer_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeTransfer_employeeId_idx" ON public."EmployeeTransfer" USING btree ("employeeId");


--
-- Name: EmployeeTransfer_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmployeeTransfer_tenantId_idx" ON public."EmployeeTransfer" USING btree ("tenantId");


--
-- Name: Employee_tenantId_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_branchId_idx" ON public."Employee" USING btree ("tenantId", "branchId");


--
-- Name: Employee_tenantId_department_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_department_idx" ON public."Employee" USING btree ("tenantId", department);


--
-- Name: Employee_tenantId_designationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_designationId_idx" ON public."Employee" USING btree ("tenantId", "designationId");


--
-- Name: Employee_tenantId_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Employee_tenantId_email_key" ON public."Employee" USING btree ("tenantId", email);


--
-- Name: Employee_tenantId_employeeCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Employee_tenantId_employeeCode_key" ON public."Employee" USING btree ("tenantId", "employeeCode");


--
-- Name: Employee_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_idx" ON public."Employee" USING btree ("tenantId");


--
-- Name: Employee_tenantId_levelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_levelId_idx" ON public."Employee" USING btree ("tenantId", "levelId");


--
-- Name: Employee_tenantId_reportingManagerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_reportingManagerId_idx" ON public."Employee" USING btree ("tenantId", "reportingManagerId");


--
-- Name: Employee_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Employee_tenantId_status_idx" ON public."Employee" USING btree ("tenantId", status);


--
-- Name: FnfRecord_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FnfRecord_employeeId_idx" ON public."FnfRecord" USING btree ("employeeId");


--
-- Name: FnfRecord_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FnfRecord_tenantId_idx" ON public."FnfRecord" USING btree ("tenantId");


--
-- Name: JoiningRecord_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "JoiningRecord_tenantId_idx" ON public."JoiningRecord" USING btree ("tenantId");


--
-- Name: JoiningRecord_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "JoiningRecord_tenantId_status_idx" ON public."JoiningRecord" USING btree ("tenantId", status);


--
-- Name: JoiningRecord_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "JoiningRecord_token_idx" ON public."JoiningRecord" USING btree (token);


--
-- Name: JoiningRecord_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "JoiningRecord_token_key" ON public."JoiningRecord" USING btree (token);


--
-- Name: ManpowerBudget_tenantId_branchId_department_financialYear_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ManpowerBudget_tenantId_branchId_department_financialYear_key" ON public."ManpowerBudget" USING btree ("tenantId", "branchId", department, "financialYear");


--
-- Name: ManpowerBudget_tenantId_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ManpowerBudget_tenantId_branchId_idx" ON public."ManpowerBudget" USING btree ("tenantId", "branchId");


--
-- Name: ManpowerBudget_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ManpowerBudget_tenantId_idx" ON public."ManpowerBudget" USING btree ("tenantId");


--
-- Name: NocRecord_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NocRecord_employeeId_idx" ON public."NocRecord" USING btree ("employeeId");


--
-- Name: NocRecord_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NocRecord_tenantId_idx" ON public."NocRecord" USING btree ("tenantId");


--
-- Name: Notification_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_tenantId_idx" ON public."Notification" USING btree ("tenantId");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: PayDay_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PayDay_employeeId_idx" ON public."PayDay" USING btree ("employeeId");


--
-- Name: PayDay_month_year_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PayDay_month_year_employeeId_key" ON public."PayDay" USING btree (month, year, "employeeId");


--
-- Name: PayDay_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PayDay_tenantId_idx" ON public."PayDay" USING btree ("tenantId");


--
-- Name: PaymentAdvice_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentAdvice_tenantId_idx" ON public."PaymentAdvice" USING btree ("tenantId");


--
-- Name: PaymentAdvice_tenantId_month_year_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentAdvice_tenantId_month_year_idx" ON public."PaymentAdvice" USING btree ("tenantId", month, year);


--
-- Name: PaymentAdvice_tenantId_referenceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentAdvice_tenantId_referenceNumber_key" ON public."PaymentAdvice" USING btree ("tenantId", "referenceNumber");


--
-- Name: Payroll_month_year_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payroll_month_year_employeeId_key" ON public."Payroll" USING btree (month, year, "employeeId");


--
-- Name: Payroll_tenantId_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payroll_tenantId_branchId_idx" ON public."Payroll" USING btree ("tenantId", "branchId");


--
-- Name: Payroll_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payroll_tenantId_idx" ON public."Payroll" USING btree ("tenantId");


--
-- Name: Payroll_tenantId_month_year_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payroll_tenantId_month_year_idx" ON public."Payroll" USING btree ("tenantId", month, year);


--
-- Name: Position_tenantId_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Position_tenantId_branchId_idx" ON public."Position" USING btree ("tenantId", "branchId");


--
-- Name: Position_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Position_tenantId_idx" ON public."Position" USING btree ("tenantId");


--
-- Name: Position_tenantId_positionCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Position_tenantId_positionCode_key" ON public."Position" USING btree ("tenantId", "positionCode");


--
-- Name: Position_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Position_tenantId_status_idx" ON public."Position" USING btree ("tenantId", status);


--
-- Name: Resignation_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resignation_employeeId_idx" ON public."Resignation" USING btree ("employeeId");


--
-- Name: Resignation_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resignation_tenantId_idx" ON public."Resignation" USING btree ("tenantId");


--
-- Name: SalaryAdvance_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SalaryAdvance_employeeId_idx" ON public."SalaryAdvance" USING btree ("employeeId");


--
-- Name: SalaryAdvance_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SalaryAdvance_tenantId_idx" ON public."SalaryAdvance" USING btree ("tenantId");


--
-- Name: SalaryAdvance_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SalaryAdvance_tenantId_status_idx" ON public."SalaryAdvance" USING btree ("tenantId", status);


--
-- Name: SalaryHike_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SalaryHike_employeeId_idx" ON public."SalaryHike" USING btree ("employeeId");


--
-- Name: Tenant_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Tenant_code_idx" ON public."Tenant" USING btree (code);


--
-- Name: Tenant_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tenant_code_key" ON public."Tenant" USING btree (code);


--
-- Name: Tenant_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Tenant_status_idx" ON public."Tenant" USING btree (status);


--
-- Name: User_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_branchId_idx" ON public."User" USING btree ("branchId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_employeeId_key" ON public."User" USING btree ("employeeId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_tenantId_idx" ON public."User" USING btree ("tenantId");


--
-- Name: Approval Approval_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Approval Approval_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Approval Approval_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Approval Approval_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceCorrection AttendanceCorrection_attendanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES public."Attendance"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AttendanceCorrection AttendanceCorrection_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceCorrection AttendanceCorrection_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttendanceCorrection"
    ADD CONSTRAINT "AttendanceCorrection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Branch Branch_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Deduction Deduction_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deduction"
    ADD CONSTRAINT "Deduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Deduction Deduction_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deduction"
    ADD CONSTRAINT "Deduction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Designation Designation_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Designation"
    ADD CONSTRAINT "Designation_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."EmployeeLevel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Designation Designation_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Designation"
    ADD CONSTRAINT "Designation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeAsset EmployeeAsset_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeAsset"
    ADD CONSTRAINT "EmployeeAsset_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeAsset EmployeeAsset_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeAsset"
    ADD CONSTRAINT "EmployeeAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeDocument EmployeeDocument_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeDocument"
    ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeDocument EmployeeDocument_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeDocument"
    ADD CONSTRAINT "EmployeeDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeKYC EmployeeKYC_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeKYC"
    ADD CONSTRAINT "EmployeeKYC_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeLevel EmployeeLevel_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeLevel"
    ADD CONSTRAINT "EmployeeLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeSalary EmployeeSalary_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeSalary"
    ADD CONSTRAINT "EmployeeSalary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeStatutory EmployeeStatutory_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeStatutory"
    ADD CONSTRAINT "EmployeeStatutory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeTransfer EmployeeTransfer_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeTransfer"
    ADD CONSTRAINT "EmployeeTransfer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeTransfer EmployeeTransfer_fromBranchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeTransfer"
    ADD CONSTRAINT "EmployeeTransfer_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmployeeTransfer EmployeeTransfer_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeTransfer"
    ADD CONSTRAINT "EmployeeTransfer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmployeeTransfer EmployeeTransfer_toBranchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmployeeTransfer"
    ADD CONSTRAINT "EmployeeTransfer_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employee Employee_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employee Employee_designationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES public."Designation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Employee Employee_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."EmployeeLevel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Employee Employee_reportingManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Employee Employee_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FnfRecord FnfRecord_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FnfRecord"
    ADD CONSTRAINT "FnfRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FnfRecord FnfRecord_resignationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FnfRecord"
    ADD CONSTRAINT "FnfRecord_resignationId_fkey" FOREIGN KEY ("resignationId") REFERENCES public."Resignation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FnfRecord FnfRecord_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FnfRecord"
    ADD CONSTRAINT "FnfRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JoiningRecord JoiningRecord_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JoiningRecord"
    ADD CONSTRAINT "JoiningRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JoiningRecord JoiningRecord_positionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JoiningRecord"
    ADD CONSTRAINT "JoiningRecord_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES public."Position"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: JoiningRecord JoiningRecord_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JoiningRecord"
    ADD CONSTRAINT "JoiningRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ManpowerBudget ManpowerBudget_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManpowerBudget"
    ADD CONSTRAINT "ManpowerBudget_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ManpowerBudget ManpowerBudget_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ManpowerBudget"
    ADD CONSTRAINT "ManpowerBudget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NocRecord NocRecord_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NocRecord"
    ADD CONSTRAINT "NocRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NocRecord NocRecord_resignationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NocRecord"
    ADD CONSTRAINT "NocRecord_resignationId_fkey" FOREIGN KEY ("resignationId") REFERENCES public."Resignation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NocRecord NocRecord_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NocRecord"
    ADD CONSTRAINT "NocRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PayDay PayDay_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayDay"
    ADD CONSTRAINT "PayDay_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PayDay PayDay_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayDay"
    ADD CONSTRAINT "PayDay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentAdvice PaymentAdvice_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentAdvice"
    ADD CONSTRAINT "PaymentAdvice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PaymentAdvice PaymentAdvice_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentAdvice"
    ADD CONSTRAINT "PaymentAdvice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payroll Payroll_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payroll Payroll_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payroll Payroll_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Position Position_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Position"
    ADD CONSTRAINT "Position_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Position Position_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Position"
    ADD CONSTRAINT "Position_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Resignation Resignation_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resignation"
    ADD CONSTRAINT "Resignation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Resignation Resignation_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resignation"
    ADD CONSTRAINT "Resignation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalaryAdvance SalaryAdvance_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalaryAdvance"
    ADD CONSTRAINT "SalaryAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalaryAdvance SalaryAdvance_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalaryAdvance"
    ADD CONSTRAINT "SalaryAdvance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalaryHike SalaryHike_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SalaryHike"
    ADD CONSTRAINT "SalaryHike_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 2veQq7U0y1p27B9wTe9cmMiM1SctbprGqOPUdadX2DjqNwU31EWkXKb6Q7Ygmcn

