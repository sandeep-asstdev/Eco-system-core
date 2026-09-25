--
-- PostgreSQL database dump
--

\restrict QcpcqhylHKa5Pl0XogTMSssCdMlTbEWMBQ04IQd0EP8dFhdNPEc0hxSyIm9gJzt

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
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'NOT_REQUIRED',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApprovalStatus" OWNER TO postgres;

--
-- Name: AttachmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttachmentType" AS ENUM (
    'INITIAL_PHOTO',
    'WORK_PROGRESS',
    'COMPLETION_PHOTO',
    'QUOTATION_DOC',
    'INVOICE_DOC',
    'DISSATISFACTION_PHOTO',
    'OTHER',
    'APPROVAL_DOC'
);


ALTER TYPE public."AttachmentType" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: PurchaseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PurchaseStatus" AS ENUM (
    'REQUESTED',
    'QUOTED',
    'APPROVED',
    'ORDERED',
    'RECEIVED',
    'CANCELLED',
    'NOT_REQUIRED',
    'REQUIRED',
    'QUOTATION_PENDING',
    'APPROVAL_PENDING',
    'PARTIALLY_RECEIVED',
    'COMPLETED'
);


ALTER TYPE public."PurchaseStatus" OWNER TO postgres;

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
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'PLATFORM_ADMIN',
    'TENANT_ADMIN',
    'MANAGER',
    'APPROVER',
    'MAINTENANCE_USER',
    'PURCHASE_USER',
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

--
-- Name: WorkStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PENDING_APPROVAL',
    'APPROVED',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_FOR_PURCHASE',
    'WAITING_FOR_VENDOR',
    'COMPLETED',
    'CLOSED',
    'REJECTED',
    'REOPENED',
    'NEW',
    'WAITING_FOR_APPROVAL',
    'PURCHASE_COMPLETED',
    'CORRECTION_DONE',
    'WAITING_FOR_CHECK',
    'NOT_SATISFACTORY',
    'CANCELLED'
);


ALTER TYPE public."WorkStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    details jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: branch_areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branch_areas (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "branchId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.branch_areas OWNER TO postgres;

--
-- Name: branch_departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branch_departments (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "branchId" text NOT NULL,
    "departmentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.branch_departments OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "brandId" text,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    city text,
    state text,
    pincode text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: maintenance_request_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request_assignments (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "requestId" text NOT NULL,
    "assignedToId" text NOT NULL,
    "assignedById" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    active boolean DEFAULT true NOT NULL,
    "actionPlan" text
);


ALTER TABLE public.maintenance_request_assignments OWNER TO postgres;

--
-- Name: maintenance_request_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request_attachments (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "requestId" text NOT NULL,
    "originalFilename" text NOT NULL,
    "storedFilename" text NOT NULL,
    "fileUrl" text NOT NULL,
    "mimeType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "attachmentType" public."AttachmentType" DEFAULT 'INITIAL_PHOTO'::public."AttachmentType" NOT NULL,
    "uploadedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_request_attachments OWNER TO postgres;

--
-- Name: maintenance_request_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request_comments (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "requestId" text NOT NULL,
    "userId" text NOT NULL,
    comment text NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_request_comments OWNER TO postgres;

--
-- Name: maintenance_request_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request_materials (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "requestId" text NOT NULL,
    "materialName" text NOT NULL,
    quantity double precision DEFAULT 1.0 NOT NULL,
    unit text DEFAULT 'pcs'::text NOT NULL,
    "unitCost" double precision DEFAULT 0.0 NOT NULL,
    "totalCost" double precision DEFAULT 0.0 NOT NULL,
    "addedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_request_materials OWNER TO postgres;

--
-- Name: maintenance_request_status_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request_status_histories (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "requestId" text NOT NULL,
    "fromStatus" public."WorkStatus",
    "toStatus" public."WorkStatus" NOT NULL,
    "changedById" text NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_request_status_histories OWNER TO postgres;

--
-- Name: maintenance_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_requests (
    id text NOT NULL,
    "requestNumber" text NOT NULL,
    "tenantId" text NOT NULL,
    "brandId" text,
    "branchId" text NOT NULL,
    "departmentId" text NOT NULL,
    "maintenanceTypeId" text NOT NULL,
    "requesterId" text NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    location text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    "requiredDate" timestamp(3) without time zone NOT NULL,
    "approvalStatus" public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "workStatus" public."WorkStatus" DEFAULT 'WAITING_FOR_APPROVAL'::public."WorkStatus" NOT NULL,
    "assignedToId" text,
    "assignedById" text,
    "assignedAt" timestamp(3) without time zone,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "estimatedCost" double precision DEFAULT 0.0 NOT NULL,
    "actualCost" double precision DEFAULT 0.0 NOT NULL,
    "rejectedById" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "completionRemarks" text,
    "isDissatisfied" boolean DEFAULT false NOT NULL,
    "dissatisfactionReason" text,
    "dissatisfiedAt" timestamp(3) without time zone,
    "dissatisfiedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "actionPlan" text,
    "actualTimeHours" double precision,
    "approvalCopyUrl" text,
    "approvalUploadedAt" timestamp(3) without time zone,
    "areaInBranch" text,
    "assignedToContact" text,
    "branchAreaId" text,
    "branchRemarks" text,
    "branchStatus" text DEFAULT 'OPEN'::text NOT NULL,
    "checkedOff" boolean DEFAULT true NOT NULL,
    "correctionAt" timestamp(3) without time zone,
    "correctionDone" text DEFAULT 'NOT_STARTED'::text NOT NULL,
    "currentStatus" text DEFAULT 'WAITING_FOR_APPROVAL'::text NOT NULL,
    deadline timestamp(3) without time zone,
    "differenceHours" double precision,
    "graceHours" double precision DEFAULT 12.0,
    "managerContact" text,
    "purchaseRemarks" text,
    "purchaseStatus" text DEFAULT 'NOT_REQUIRED'::text NOT NULL,
    "purchaseStatusAt" timestamp(3) without time zone,
    "requesterContact" text,
    "slaClassification" text,
    "statusUpdatedAt" timestamp(3) without time zone,
    "statusUpdatedById" text,
    "targetHours" double precision,
    "timeToAssignMinutes" integer,
    "vendorCompletionNotes" text,
    "vendorId" text,
    "vendorQuotationRef" text,
    "vendorScope" text,
    "vendorServiceDate" timestamp(3) without time zone,
    "vendorStatus" text
);


ALTER TABLE public.maintenance_requests OWNER TO postgres;

--
-- Name: maintenance_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_types (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    icon text DEFAULT 'Wrench'::text,
    color text DEFAULT '#2563eb'::text,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.maintenance_types OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'INFO'::text NOT NULL,
    "entityType" text,
    "entityId" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_items (
    id text NOT NULL,
    "purchaseRequestId" text NOT NULL,
    "itemName" text NOT NULL,
    quantity double precision DEFAULT 1.0 NOT NULL,
    unit text DEFAULT 'pcs'::text NOT NULL,
    "estimatedPrice" double precision DEFAULT 0.0 NOT NULL,
    "quotedPrice" double precision DEFAULT 0.0 NOT NULL,
    "actualPrice" double precision DEFAULT 0.0 NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.purchase_items OWNER TO postgres;

--
-- Name: purchase_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_requests (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "maintenanceRequestId" text NOT NULL,
    "prNumber" text NOT NULL,
    status public."PurchaseStatus" DEFAULT 'REQUESTED'::public."PurchaseStatus" NOT NULL,
    "requestedById" text NOT NULL,
    "approvedById" text,
    "vendorId" text,
    "estimatedTotal" double precision DEFAULT 0.0 NOT NULL,
    "actualTotal" double precision DEFAULT 0.0 NOT NULL,
    "poReference" text,
    notes text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "orderedAt" timestamp(3) without time zone,
    "receivedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    carrier text,
    "expectedDeliveryDate" timestamp(3) without time zone,
    "orderUrl" text,
    "purchaseSource" text DEFAULT 'APPROVED_VENDOR'::text NOT NULL,
    "trackingNumber" text
);


ALTER TABLE public.purchase_requests OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "purchaseRequestId" text NOT NULL,
    "vendorId" text NOT NULL,
    "quoteNumber" text NOT NULL,
    amount double precision NOT NULL,
    "fileAttachmentId" text,
    "validUntil" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text NOT NULL,
    logo text,
    status public."TenantStatus" DEFAULT 'ACTIVE'::public."TenantStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "approvalRequired" boolean DEFAULT true NOT NULL,
    "graceHours" double precision DEFAULT 12.0 NOT NULL,
    "logoUrl" text,
    "requestPrefix" text DEFAULT 'MAIN'::text NOT NULL,
    "targetHoursHigh" double precision DEFAULT 24.0 NOT NULL,
    "targetHoursLow" double precision DEFAULT 72.0 NOT NULL,
    "targetHoursMedium" double precision DEFAULT 48.0 NOT NULL,
    timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
    "workflowConfig" jsonb
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: user_branch_accesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_branch_accesses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "branchId" text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_branch_accesses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    "tenantId" text,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    role public."UserRole" DEFAULT 'EMPLOYEE'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "avatarUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    "contactPerson" text,
    phone text,
    email text,
    address text,
    gstin text,
    category text,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "tenantId", "userId", action, entity, "entityId", details, "ipAddress", "userAgent", "createdAt") FROM stdin;
8b94a0b2-a9de-4e72-85a1-71954d87af75	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:13:19.372
58cfe276-6c06-4799-89e0-6066eb719024	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:40:15.734
0c059771-dba1-498a-b9fd-5ac55ecbee17	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	TOGGLE_CHECKED_OFF	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"checkedOff": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:42:36.43
21ac2336-558d-4069-9deb-cd8d264f858c	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	TOGGLE_CHECKED_OFF	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"checkedOff": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:42:37.566
8a30efda-1255-4b2c-b8f7-9a07d09fa474	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	TOGGLE_CHECKED_OFF	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"checkedOff": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:42:43.787
85899a99-edf3-45f7-8305-70540b27ef59	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	ASSIGN_REQUEST	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 2}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:43:46.393
f1ba799f-0861-43ea-84e7-1c89c5d91585	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	UPDATE_CORRECTION_STATE	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"correctionDone": "IN_PROGRESS"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:44:08.988
6ecf6e18-eef3-4d31-b526-529c62f45899	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	UPLOAD_ATTACHMENT	MaintenanceRequestAttachment	6df22272-8804-494b-819b-5c2f15a5e372	{"requestId": "dab2909e-bdfa-4485-b784-18f4008a5843", "originalFilename": "Hyundai (1).png"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:44:59.894
a693f96f-803d-46b7-9777-c08ab217039e	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"remarks": "Approved by Branch Approver", "requestNumber": "BELL-MAIN-2026-000114"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.856
fe3abd8e-b0e1-4234-9611-ee7ee6e4337e	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.93
974b1290-6fa0-4f67-bf9d-a57874401a20	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	APPROVE_REQUEST	MaintenanceRequest	c5e0c846-1783-4ba3-b7c0-f91163f48337	{"remarks": "", "requestNumber": "OMNI-MNT-2026-000001"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:29:48.654
1564db5a-03cd-449a-8f7d-6aa8c33dd84a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	2b45d87e-ea75-44fb-bd6f-2df9be49f43b	{"subject": "sdf", "branchId": "283a319f-d5e6-4679-8b0a-dd65c4bee0f5", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000116"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:43:16.079
f0b672f7-7ac3-493c-bed2-32a28eb844e8	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPLOAD_ATTACHMENT	MaintenanceRequestAttachment	0eee1709-0de6-496c-a78d-fde3a4d22681	{"requestId": "d5de7495-d572-42cb-ba27-2b857cff6977", "originalFilename": "Hyundai (1).png"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:58:21.617
7c7b98ab-6702-4d81-9268-625fe64f986e	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:58:29.988
1cb76969-d392-4c90-b433-96bfd62cf58d	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	UPDATE_STATUS	MaintenanceRequest	d5de7495-d572-42cb-ba27-2b857cff6977	{"remarks": "", "toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:58:42.915
2c9350d2-43fc-47f1-a241-0a412b5c9ccb	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.009
cdd3c11a-f77d-4d18-9a9e-402e07dbaebe	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"subject": "Cooling failure in primary server room", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000117"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.133
145f7db9-43f2-4137-b563-c82e109ea054	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"remarks": "Emergency server room approval granted.", "requestNumber": "BELL-MAIN-2026-000117"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.175
c1ed2a2a-5eec-497f-988d-2e0fad3c2fbe	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	{"status": "ORDERED"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.271
3f09e309-69ad-4926-8aff-0cc8434636cd	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	{"status": "RECEIVED"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.287
029cc09d-cf45-46d4-86c9-c87f6ff57a8a	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_VENDOR	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"vendorId": "4f2d00d9-1d59-471d-bbd6-ccaf05a1158a", "vendorName": "Hubli Industrial Electricals"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.331
cd6bbaf6-a2ed-4874-9309-f5b39f76c631	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.465
666b5a05-9007-48a0-a1cf-3cea99cb7fd1	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	CREATE_REQUEST	MaintenanceRequest	f531ef35-5426-44e3-b01d-390593385c04	{"subject": "want 1 TB HDD", "branchId": "f13bd4c8-950c-4605-b6c3-587ece85dac5", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000009"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:16:27.217
28abda54-14f2-42d9-ab89-0fa6cc55b464	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	CREATE_REQUEST	MaintenanceRequest	41513dbf-520f-400b-851b-68f02a1ea7d0	{"subject": "want 1 TB HDD", "branchId": "f13bd4c8-950c-4605-b6c3-587ece85dac5", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000010"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:16:42.299
96b1de90-fab2-4673-ba97-4843d959b5a2	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	CREATE_REQUEST	MaintenanceRequest	28ef519c-464c-450c-89a7-247c44bf50e0	{"subject": "want 1 TB HDD", "branchId": "f13bd4c8-950c-4605-b6c3-587ece85dac5", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000011"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:16:58.298
a93870b4-591a-4857-9fc8-7a80060d0593	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	CREATE_REQUEST	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"subject": "wanted 1 TB HDD", "branchId": "4c9d1366-ba6f-40d4-be29-f85162d2c069", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000013"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:42:12.793
ddeac624-493c-470b-9b5f-a80b84dc59fc	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	APPROVE_REQUEST	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"remarks": "we'll send you at EOD", "requestNumber": "BELL-MAIN-2026-000013"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:43:19.914
e94ce6d3-d7cc-44c4-9b1d-02f6c9fd71af	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	UPDATE_STATUS	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	{"remarks": "", "toStatus": "WAITING_FOR_PURCHASE", "fromStatus": "ASSIGNED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:43:58.172
6d59044b-325e-4881-a3aa-effb97c39c52	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:59:42.756
c185e59e-fef2-4af3-9a3b-4b8b9e882ff5	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	UPDATE_TENANT_SETTINGS	Tenant	30d424ac-9074-40b8-b062-deae1a023a3d	{"id": "30d424ac-9074-40b8-b062-deae1a023a3d", "code": "OMNI", "logo": null, "name": "OmniLogistics Supply Chain Ltd", "slug": "omni-logistics", "status": "ACTIVE", "logoUrl": null, "timezone": "Asia/Kolkata", "createdAt": "2026-09-23T06:52:46.657Z", "updatedAt": "2026-09-23T06:52:46.657Z", "graceHours": 6, "requestPrefix": "OMNI-MNT", "targetHoursLow": 48, "workflowConfig": null, "targetHoursHigh": 12, "approvalRequired": false, "targetHoursMedium": 24}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:30:50.245
9e2cb273-49ae-4248-9313-8a67f5140590	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:46:12.787
5146073a-1e4a-43bc-b8ea-916283f0c824	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:32.619
d4d258f9-ac2a-4e84-a220-488b56a54e8d	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.007
46dd4f4a-dbcf-4f55-b668-31116ad1baa7	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	LOGIN	User	d37e3c4f-f763-4c56-8254-2acc13c24927	{"role": "PURCHASE_USER", "email": "purchase@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.009
bb681ca2-ca72-400a-ab6c-3120b292219d	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 12:43:49.868
3e785ad5-4677-4298-a4d0-95a739dc5db3	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	5fc257a2-5650-41eb-947a-62c19c0a118a	{"remarks": "", "toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 12:45:36.353
ca983446-ea00-4886-a28d-967ea248b1c0	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.465
9fcdd3f5-cf5d-44bd-9326-01ff0cd817bd	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.051
66d27824-b74c-4a52-9630-135a6b75bccd	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.132
8824bdaa-9748-48e1-a3ee-266991eeeae3	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.381
13ff487a-e24c-4224-ad24-6ca6a46631d7	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.452
f661f392-94f2-4254-9cd7-00b1a25bba05	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.552
e97c4476-7cc5-420f-83cc-a26d86e57b2e	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.622
43f77335-3dab-4ca8-b3ef-b47c2aba018a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"subject": "Hydraulic safety lock sensor replacement", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000006"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.637
2301b8be-85a3-4eda-a8e3-8276cb0662d5	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"remarks": "Approved by Branch Approver", "requestNumber": "BELL-MAIN-2026-000006"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.653
4b7ac54a-2062-44ad-b408-2acf73a2697b	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.72
0549e49a-233e-4117-a7fe-5004648cdd14	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:37:26.921
5395bf74-2c6e-4ed9-a2eb-aca05793d856	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-23 07:37:26.999
91e04592-3f4d-4663-ae4c-a315981ee591	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.435
c64a384d-9256-4e59-bccd-c4585ba3a514	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"remarks": "Dismantling safety sensor", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.447
f9961df2-57ec-461c-ae4c-fc156e598f47	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.466
a3b41c34-d413-4304-a127-5713b471fca1	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	REOPEN_REQUEST	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"reason": "Safety buzzer volume low"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.476
e25dedcc-13f7-4091-b521-5c2a1053c41a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.488
d721e8aa-8765-476a-a697-cd1972b7896a	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:45:46.969
8f5be7b9-2dc4-44a4-8cf2-67508ae07822	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	TOGGLE_CHECKED_OFF	MaintenanceRequest	d5de7495-d572-42cb-ba27-2b857cff6977	{"checkedOff": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 07:45:59.628
4431ace8-a406-4d09-a320-4933467c8ce2	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	CREATE_REQUEST	MaintenanceRequest	bc621456-a4f1-4ca0-afb4-76ffac6880f4	{"subject": "need CPU", "branchId": "4c9d1366-ba6f-40d4-be29-f85162d2c069", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000115"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:19:03.56
76339f17-b108-4b9c-b0e4-759b6b340269	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:21:01.01
00104b38-d8df-4866-b3a9-fcb2c88a81cf	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:36:03.943
aa3a8f73-f14d-459b-b3b3-5ee68f2a3a79	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:53:48.441
3a749c4c-b356-4557-9d27-7b3ed0d43e65	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.007
dfed5220-51e8-4f91-b8b9-9416b57c9573	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	4d0c47cb-7702-4803-a302-ab121ba0db42	{"remarks": "", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 12:44:59.208
cb152ca9-36f6-4140-8b16-68f28807a899	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	LOGIN	User	d37e3c4f-f763-4c56-8254-2acc13c24927	{"role": "PURCHASE_USER", "email": "purchase@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 12:49:54.976
8d2df853-bf7f-4af0-8124-6552613d4553	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.066
986e3bdd-428c-426a-a768-762754884508	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.464
03106586-275e-4f76-898c-a1ff0565eaf4	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	LOGIN	User	d37e3c4f-f763-4c56-8254-2acc13c24927	{"role": "PURCHASE_USER", "email": "purchase@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.465
ab465eaf-c5dc-478c-8e21-caace7864979	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.723
e2a2a48e-ee8d-433c-a20d-1b79e21e653a	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.223
340052b8-2c16-4c64-a50f-e4c0f09700a6	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.669
0acb553f-5efe-4a7a-b868-e089ad5f8262	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"remarks": "Dismantling safety sensor", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.681
0b05aa05-8b0d-46be-ac19-f3625ab130b3	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.699
543132a8-5b9e-4932-aa20-15d9664fe2f0	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	REOPEN_REQUEST	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	{"reason": "Safety buzzer volume low"}	::ffff:127.0.0.1	node	2026-09-23 06:53:41.709
aff1c4e7-f560-4a14-b61b-56e1fe87a7b1	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:03:50.873
e258daa5-6cd1-4a17-9dc6-8ae0889b7901	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-23 07:03:50.956
97568d3a-d1ee-443b-8c66-4bb311283fb3	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.119
88f9ed24-23c9-4f86-89ee-358e52fbad5a	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.189
be67ffa1-34e0-47ae-9672-a35097eeccce	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.292
9dddc646-3080-4fe7-880e-1b0c49d3091a	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.363
e206acb2-b417-4a0a-8fcd-21f054a9fa0d	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"subject": "Hydraulic safety lock sensor replacement", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000007"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.378
360b4d6e-1f07-4325-9f97-4b3680feca55	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"remarks": "Approved by Branch Approver", "requestNumber": "BELL-MAIN-2026-000007"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.394
181ac483-4251-4375-8f57-84e83dfc8f8e	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.41
315aa64c-91b9-412f-9a59-1b2b926da935	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"remarks": "Dismantling safety sensor", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.423
cb9a4271-f6fa-4cd2-833d-a7263cb05529	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.441
ff96add2-7e9d-4179-92b7-6f70aa8c4e7c	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	REOPEN_REQUEST	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"reason": "Safety buzzer volume low"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.452
5b45b5a8-ccaf-4f1f-9201-e69300c7c040	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-23 07:03:51.464
b3c88e33-e5d9-474f-8618-267a2ae2d370	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.227
5e32da9b-e270-4912-87d9-aff6405bf3f8	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.308
fd874703-260f-4f33-ad2b-d0d16346b122	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.471
43cd3e18-8674-42ac-9ec4-315dc42fe753	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.542
6afc3d75-bf3b-496a-a3a3-bc2a616688f1	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.64
d22db222-dccf-481c-90f2-51ece0871c99	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.708
bd302ce6-dc3d-4d41-b78f-57ed23c88ab5	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"subject": "Hydraulic safety lock sensor replacement", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000008"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.723
998f001b-eb20-4b4b-a04a-dba49339bd1a	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"remarks": "Approved by Branch Approver", "requestNumber": "BELL-MAIN-2026-000008"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.74
48e75af9-1f6f-46ba-a5b1-4a71c45f99ee	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.756
cbd7d28e-df54-4254-ad37-a7c251f22b0d	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"remarks": "Dismantling safety sensor", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.769
b854755c-cb25-42ab-88f8-87177950c2a8	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.788
cd46741e-0bfe-4ee5-965a-80ef7b764325	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	REOPEN_REQUEST	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"reason": "Safety buzzer volume low"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.797
9ee4e361-cb61-49ca-890c-1d1fef675c87	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.146
58a7564b-6dec-4790-9185-a2ecf4bdcb0d	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.215
4925b1df-d6f6-432f-9134-d5d8ca6b0962	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.315
7a84a902-edb0-4d7e-b390-14cdff48777e	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.384
0a350a92-4395-4290-b6b9-33e964771681	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"subject": "Hydraulic safety lock sensor replacement", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000012"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.4
3c30ae0a-934a-44a8-8f50-5b6e811543ad	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.33
27e6eda8-996e-45a5-89ed-ed3f03b7e90f	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.428
ab753431-9b3c-4cd4-99a9-bf1a137fdff1	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.873
f5b6f0c4-71d1-42e7-b488-2e81959ae28c	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"remarks": "Dismantling safety sensor", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.887
8dfbfe52-d929-4942-be65-49aef626fa9e	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.908
20da70c4-9e55-4a5a-826d-4942d396eb1a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	REOPEN_REQUEST	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"reason": "Safety buzzer volume low"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.92
fd2546c4-fc00-46b4-b4e0-af22303d9ed9	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	bc621456-a4f1-4ca0-afb4-76ffac6880f4	{"remarks": "xyz", "requestNumber": "BELL-MAIN-2026-000115"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:19:53.85
64d00d1d-93bd-4f3c-a58d-c4c257e8baee	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:36:15.899
2c7d8d04-8b53-47fc-b8ed-bc54aa6788aa	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:38:19.686
d7ff445a-328f-4b4b-88ce-4591f27b6e40	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:53:53.419
cdbb6204-7c28-4a0c-ba18-492ce1acfabc	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.008
89ebfdaa-8b2b-408d-98e4-46c96ea9c2ea	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"toStatus": "COMPLETED", "fromStatus": "WAITING_FOR_VENDOR"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.451
244750bb-5ac4-4df6-9fad-9c709ded007a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.468
c5c185f5-d8ca-4266-902d-7ebceb700835	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	4d0c47cb-7702-4803-a302-ab121ba0db42	{"remarks": "", "toStatus": "COMPLETED", "fromStatus": "IN_PROGRESS"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 12:45:13.025
fc64abfb-f62c-4e3e-af0b-cdcc07ed3275	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.464
ddeb9511-1286-476e-8bb0-015b3e79d4aa	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"remarks": "Arrived at server room, opened AC panel.", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.738
caaee016-9a68-4d54-8490-985178c45e3a	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	CREATE_PURCHASE_REQUEST	PurchaseRequest	6cb58714-f3b8-4054-96a2-b115d3c65f1d	{"prNumber": "PR-2026-0002", "maintenanceRequestId": "938b7ae1-d1d5-4211-b64a-c65f8efac643"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.754
9243b4fa-4c55-4825-b1f1-abb4c38858f2	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-23 07:05:13.809
a05fb695-152a-4cab-8173-fbfe677204c9	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	{"remarks": "Approved by Branch Approver", "requestNumber": "BELL-MAIN-2026-000012"}	::ffff:127.0.0.1	node	2026-09-23 07:37:27.418
78011691-af2a-43ea-8ed9-1cbb2553e23c	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.578
f11253fb-1b5f-4fd0-bb66-28e18e8ccbdd	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.653
0f0fadb5-4f48-42d7-b0c1-5c54a0d03fc6	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.752
e7d85d8a-3b01-40a3-96a9-b6730ecb3971	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.822
59d69e8b-0df1-443a-b912-86d5122bda50	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	{"subject": "Hydraulic safety lock sensor replacement", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000114"}	::ffff:127.0.0.1	node	2026-09-23 07:49:05.839
a9735d90-570a-43b2-a93e-73ad58840312	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:29:13.49
66082b67-4782-4d2a-a7ab-694d983ebb52	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:38:38.799
14907e8a-ee0d-4dd6-9b8d-09d8a6166e74	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:57:49.085
8fc47c71-9f61-4e67-bf49-0c5c33c4d9a5	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	CLOSE_REQUEST	MaintenanceRequest	d5de7495-d572-42cb-ba27-2b857cff6977	{"satisfaction": "SATISFIED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 11:58:51.24
68d57102-83ed-4d19-bab4-8a7b35c3b137	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.008
a96c0948-fd8e-4670-b2d9-32b44defc4dc	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.195
74c6044a-de1b-4db2-9093-f4fcfaf8315d	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	{"remarks": "Arrived at server room, opened AC panel.", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.21
a8e8a74d-bf60-465b-88ce-ee90d6ce4422	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	CREATE_PURCHASE_REQUEST	PurchaseRequest	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	{"prNumber": "PR-2026-0001", "maintenanceRequestId": "bea94c31-a71e-40ad-823e-31d3847d6b80"}	::ffff:127.0.0.1	node	2026-09-23 12:38:33.229
b92dec18-837e-43ef-ab43-e585d6b4d323	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	5fc257a2-5650-41eb-947a-62c19c0a118a	{"remarks": "", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	2026-09-23 12:45:34.689
910cca4b-aaeb-43ec-aca8-109374c3708d	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.464
1a017a4a-bd91-4edb-9885-f41d444896ef	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"subject": "Cooling failure in primary server room", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000118"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.599
90255b58-fce1-45a4-84f3-c002bbc06362	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"remarks": "Emergency server room approval granted.", "requestNumber": "BELL-MAIN-2026-000118"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.704
a27fd16e-d0c8-4251-be83-5497ea79def2	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	6cb58714-f3b8-4054-96a2-b115d3c65f1d	{"status": "ORDERED"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.79
e5eb89a9-a59a-42e4-87bd-897cb9595094	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	6cb58714-f3b8-4054-96a2-b115d3c65f1d	{"status": "RECEIVED"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.801
a7e1175d-1a60-4fcd-a66a-c061d8beff0c	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_VENDOR	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"vendorId": "4f2d00d9-1d59-471d-bbd6-ccaf05a1158a", "vendorName": "Hubli Industrial Electricals"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.838
9a9aab56-49bc-40bc-98c9-c530c2cd631e	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"toStatus": "COMPLETED", "fromStatus": "WAITING_FOR_VENDOR"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.868
51940d12-1a79-4b55-ad4d-d456430ff90f	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-24 11:43:35.879
042677f4-63ba-416b-9192-8ce1b85b55ea	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	LOGIN	User	d37e3c4f-f763-4c56-8254-2acc13c24927	{"role": "PURCHASE_USER", "email": "purchase@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.669
e7c0549a-7932-4013-a415-100017fb030a	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.669
f8a1f46e-3a42-458e-9152-13be0b30de73	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.687
2af72862-be6f-4558-b2b3-52affc2c2d39	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.687
340395f3-9802-4925-8570-5c58d20c13d9	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.688
c55dbc02-ec31-4ae4-ae4e-013798521130	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.69
70875e10-e387-462f-bb71-84fd8b59719a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"subject": "Cooling failure in primary server room", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000119"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.793
c97553f0-f46d-4ff7-a650-e9bd5895a582	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"remarks": "Emergency server room approval granted.", "requestNumber": "BELL-MAIN-2026-000119"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.833
67d574ac-4242-4ac8-a562-7d15ddbd9356	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.852
d991b036-f255-478d-af3b-034a7d34e4da	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"remarks": "Arrived at server room, opened AC panel.", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.867
f100c170-ae69-4ea7-ace6-77da8bc8d269	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	CREATE_PURCHASE_REQUEST	PurchaseRequest	eb41a501-de43-4613-8e1b-f40c3ab79f80	{"prNumber": "PR-2026-0003", "maintenanceRequestId": "314b82b7-fa61-4cf5-bfee-0d35da51afca"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.887
35c8db76-7e17-4895-98a0-d39f5aee90ad	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	eb41a501-de43-4613-8e1b-f40c3ab79f80	{"status": "ORDERED"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.928
160d993f-766d-4d96-841c-49d2b985d7ea	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	eb41a501-de43-4613-8e1b-f40c3ab79f80	{"status": "RECEIVED"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.938
2d3a504f-a29e-42e1-b260-115210ea3d8d	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_VENDOR	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"vendorId": "4f2d00d9-1d59-471d-bbd6-ccaf05a1158a", "vendorName": "Hubli Industrial Electricals"}	::ffff:127.0.0.1	node	2026-09-24 11:55:28.976
8b792c46-9650-49c9-b1de-071601d580e3	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"toStatus": "COMPLETED", "fromStatus": "WAITING_FOR_VENDOR"}	::ffff:127.0.0.1	node	2026-09-24 11:55:29.007
553e1387-957e-4fec-a0e5-776ec3bc7e20	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-24 11:55:29.02
13049a67-b0a3-4635-9594-33a89de8a566	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	LOGIN	User	c9788a8d-ec88-4679-b72a-9dcae52c45a5	{"role": "APPROVER", "email": "approver@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.235
4a20499f-755b-488a-b79d-356090f33be8	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	LOGIN	User	6b6d957f-362e-446f-9c61-375c17bd6201	{"role": "EMPLOYEE", "email": "employee@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.635
6812ff3d-81c5-485c-a610-1d62e704e2d4	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	LOGIN	User	d37e3c4f-f763-4c56-8254-2acc13c24927	{"role": "PURCHASE_USER", "email": "purchase@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.636
14819158-cc8e-440c-8398-4eb087a6dcae	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	LOGIN	User	d1c9ac36-506b-42eb-9472-c83873c0d37a	{"role": "TENANT_ADMIN", "email": "admin@omnilogistics.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.636
296bcc8a-a7ab-4bf6-bb7b-f46448aab1e5	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	LOGIN	User	be9a0dd8-f525-403b-8c54-45d7f34a7570	{"role": "MAINTENANCE_USER", "email": "technician@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.637
6f4ba505-3ccb-43bb-a8d5-7ee43f175d96	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	LOGIN	User	79604a14-4a74-4c65-a925-5f8e953ec609	{"role": "TENANT_ADMIN", "email": "admin@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.638
82c9bb3b-2d2e-43c1-8ff1-4d854c7cb22b	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	LOGIN	User	3fbf1cdd-5680-4802-9174-129dd38a2b62	{"role": "MANAGER", "email": "manager@bellad.com"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.637
d496d2a5-87cf-4201-b052-e4c25037f8ec	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CREATE_REQUEST	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"subject": "Cooling failure in primary server room", "branchId": "ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b", "priority": "HIGH", "requestNumber": "BELL-MAIN-2026-000120"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.741
875b0da1-29c1-4a37-80ab-3259487dfe9e	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	APPROVE_REQUEST	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"remarks": "Emergency server room approval granted.", "requestNumber": "BELL-MAIN-2026-000120"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.785
3a03dc5d-a864-408f-9d30-088646b9e662	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_REQUEST	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"assignedToId": "be9a0dd8-f525-403b-8c54-45d7f34a7570", "technicianName": "Ramesh Pawar", "timeToAssignMinutes": 0}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.802
2775795c-1d1a-42ca-a51c-ec0db4d3f704	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"remarks": "Arrived at server room, opened AC panel.", "toStatus": "IN_PROGRESS", "fromStatus": "ASSIGNED"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.816
acd3fb5c-18e5-4449-825c-ebb4274336dd	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	CREATE_PURCHASE_REQUEST	PurchaseRequest	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	{"prNumber": "PR-2026-0004", "maintenanceRequestId": "1caddaa4-88da-4d4b-8f5d-e58d956d36f3"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.835
63543498-2160-443e-9fc5-a7abd017ea04	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	{"status": "ORDERED"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.878
97c21fda-5ba5-450c-a4da-354d74eb8a81	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	UPDATE_PURCHASE_STATUS	PurchaseRequest	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	{"status": "RECEIVED"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.892
788fc70d-c0f8-42a9-ab85-7c16ccd3814a	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	ASSIGN_VENDOR	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"vendorId": "4f2d00d9-1d59-471d-bbd6-ccaf05a1158a", "vendorName": "Hubli Industrial Electricals"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.931
f6f35f0e-8cb7-4d65-9066-0dc855c99064	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	UPDATE_STATUS	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"toStatus": "COMPLETED", "fromStatus": "WAITING_FOR_VENDOR"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.962
c9a54e00-b7fc-4801-ac81-28b140941ed3	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	CLOSE_REQUEST	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	{"satisfaction": "SATISFIED"}	::ffff:127.0.0.1	node	2026-09-24 12:45:18.975
\.


--
-- Data for Name: branch_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branch_areas (id, "tenantId", "branchId", name, code, description, "isActive", "createdAt", "updatedAt") FROM stdin;
f93185a6-0745-4888-aa1c-e51fa4106c40	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	Mechanical Bay 1-4	BAY-MECH	\N	t	2026-09-23 06:52:46.729	2026-09-23 06:52:46.729
45408c01-812a-4d95-a07f-f517cc04c490	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	Paint & Bodyshop Booth	BOOTH-PAINT	\N	t	2026-09-23 06:52:46.73	2026-09-23 06:52:46.73
f6eb1570-5dde-4420-a059-cd75faf3c65c	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	Customer Lounge	LOUNGE	\N	t	2026-09-23 06:52:46.731	2026-09-23 06:52:46.731
ab75ed0a-6445-4f16-a835-e7136c9549ab	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	Spare Parts Inventory Room	SPARE-STORE	\N	t	2026-09-23 06:52:46.731	2026-09-23 06:52:46.731
72863ffb-456a-4650-9ee5-492f3757f9b0	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	Washing & Detailing Area	WASH-BAY	\N	t	2026-09-23 06:52:46.732	2026-09-23 06:52:46.732
6b2e9838-f1d7-490c-9f86-4338b88376e7	2e310667-1c46-4818-ac37-379d159a30f7	4c9d1366-ba6f-40d4-be29-f85162d2c069	Executive Suite Floor 3	HO-EXEC	\N	t	2026-09-23 06:52:46.733	2026-09-23 06:52:46.733
1cd3acc9-8a7f-4847-a034-302551e7c249	2e310667-1c46-4818-ac37-379d159a30f7	4c9d1366-ba6f-40d4-be29-f85162d2c069	Accounts & Finance Wing	HO-ACCT	\N	t	2026-09-23 06:52:46.734	2026-09-23 06:52:46.734
f05c3052-87bd-4a3a-b7be-347e33a33cd9	2e310667-1c46-4818-ac37-379d159a30f7	4c9d1366-ba6f-40d4-be29-f85162d2c069	Server & IT Network Hub	HO-IT	\N	t	2026-09-23 06:52:46.734	2026-09-23 06:52:46.734
1cf3832d-618e-4d0e-bc64-35360d8889fd	2e310667-1c46-4818-ac37-379d159a30f7	4c9d1366-ba6f-40d4-be29-f85162d2c069	Main Conference Hall	HO-CONF	\N	t	2026-09-23 06:52:46.735	2026-09-23 06:52:46.735
\.


--
-- Data for Name: branch_departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branch_departments (id, "tenantId", "branchId", "departmentId", "createdAt") FROM stdin;
6cb83c59-3f16-4d15-8eeb-15d7039201c8	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	cdfa8b61-1211-4989-b098-ccec8afe83e7	2026-09-23 06:52:46.722
643fd1ca-a849-4186-947d-78a208f0dd84	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	9fce4cc9-e4c7-46b3-a21c-01de69369a0f	2026-09-23 06:52:46.724
e7bf718f-0e92-4891-ac1e-eafeb14ea509	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	4f615162-c1d7-4e1b-94c7-b1c2cbe837f2	2026-09-23 06:52:46.725
2db447c9-b739-4b5b-b235-02079b688c0c	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	48d3a965-80a2-4fe1-b8fb-fad5d02731e7	2026-09-23 06:52:46.725
8de605a3-ab35-45fc-a2f5-d764502be672	2e310667-1c46-4818-ac37-379d159a30f7	d8dbd457-63e9-4040-b873-267bf4712118	b4585701-6704-4e3b-af7c-9bb115c6701b	2026-09-23 06:52:46.726
fef191a8-dfe0-450e-92aa-95bd08d8d914	2e310667-1c46-4818-ac37-379d159a30f7	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	77482462-625b-4554-b7b6-4bb0c2900069	2026-09-23 06:52:46.726
d43494ff-68ef-4585-812f-e767f6ff5d37	2e310667-1c46-4818-ac37-379d159a30f7	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	0450b534-f413-4064-b9b7-3ad1fa6eb25c	2026-09-23 06:52:46.727
68399db4-5721-4e43-8ec5-c0e5b8623be1	2e310667-1c46-4818-ac37-379d159a30f7	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2026-09-23 06:52:46.727
34bee5a2-c4e9-4c23-960d-51199083fd8e	2e310667-1c46-4818-ac37-379d159a30f7	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	b4585701-6704-4e3b-af7c-9bb115c6701b	2026-09-23 06:52:46.728
abbcc308-fe1a-4c8e-bf05-76b2b6c3931f	2e310667-1c46-4818-ac37-379d159a30f7	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	ac10bb19-9e42-4f76-8a90-61d3385ef600	2026-09-23 06:52:46.728
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, "tenantId", "brandId", name, code, address, city, state, pincode, "isActive", "createdAt", "updatedAt") FROM stdin;
ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	Ather Bangalore	ATH-BLR	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.675	2026-09-23 06:52:46.675
8267385b-f101-4266-9c36-b6413a1e8bb6	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	Ather Bommasandra Bangalore	ATH-BMS	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.676	2026-09-23 06:52:46.676
0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	Ather Energy Hubli	ATH-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.677	2026-09-23 06:52:46.677
b21f50b4-f52a-4f81-ab05-5e1e40c4070c	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	Ather Energy Belgaum	ATH-BGM	\N	Belgaum	Karnataka	\N	t	2026-09-23 06:52:46.677	2026-09-23 06:52:46.677
9ffc9414-f95d-4344-b770-3a56e4a95d75	2e310667-1c46-4818-ac37-379d159a30f7	f7aa29cf-7a33-47d5-8fd5-df043f7448a0	Back Office Hubli	BO-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.678	2026-09-23 06:52:46.678
f8356d40-000e-48ce-bf31-3e757ff805e3	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	Beltech Bangalore	BEL-BLR	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.679	2026-09-23 06:52:46.679
6c9f266b-02e1-4a74-a57b-9732c2c81c23	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	Beltech Goa	BEL-GOA	\N	Goa	Karnataka	\N	t	2026-09-23 06:52:46.679	2026-09-23 06:52:46.679
48e27d0f-82ca-486f-b0a7-094188cb9014	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	Beltech Hubli	BEL-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.68	2026-09-23 06:52:46.68
ba7a9081-fa66-4878-8fcf-d217f465a646	2e310667-1c46-4818-ac37-379d159a30f7	dd42f648-4887-4eea-a658-1c33796f8412	Chevrolet Belgaum	CHV-BGM	\N	Belgaum	Karnataka	\N	t	2026-09-23 06:52:46.681	2026-09-23 06:52:46.681
c512bc52-6b64-4258-b319-ade81c809cf9	2e310667-1c46-4818-ac37-379d159a30f7	8774585c-a9bb-4c1c-a5eb-7db85543530c	CNH Hubli	CNH-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.681	2026-09-23 06:52:46.681
5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	2e310667-1c46-4818-ac37-379d159a30f7	29e2cdbc-abdf-422f-9036-79cfa70b0d70	CRM Hubli	CRM-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.682	2026-09-23 06:52:46.682
26876c43-7084-4bc1-9085-203fe4893588	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	D7D	D7D-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.683	2026-09-23 06:52:46.683
086c6225-d976-41af-a6ed-8b90f88b27ce	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	Gabbur Hubli	GBR-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.683	2026-09-23 06:52:46.683
4c9d1366-ba6f-40d4-be29-f85162d2c069	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	Head Office Hubli	HO-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.684	2026-09-23 06:52:46.684
d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	Hero MotoCorp Dharwad	HERO-DWD	\N	Dharwad	Karnataka	\N	t	2026-09-23 06:52:46.685	2026-09-23 06:52:46.685
5f71bbf4-677d-4944-befc-b47325ff7c24	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	Hero MotoCorp Hubli	HERO-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.685	2026-09-23 06:52:46.685
2516f2ba-62c9-4f29-b86b-423ad765542f	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	Hyundai Hubli	HYN-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.686	2026-09-23 06:52:46.686
283a319f-d5e6-4679-8b0a-dd65c4bee0f5	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	Hyundai Dharwad	HYN-DWD	\N	Dharwad	Karnataka	\N	t	2026-09-23 06:52:46.687	2026-09-23 06:52:46.687
e8bbf769-4f3b-4ab1-a848-08b266d80f10	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	Hyundai Gadag	HYN-GDG	\N	Gadag	Karnataka	\N	t	2026-09-23 06:52:46.688	2026-09-23 06:52:46.688
67756409-f447-4a92-8f0a-cb859c9e664c	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	Hyundai Haveri	HYN-HVR	\N	Haveri	Karnataka	\N	t	2026-09-23 06:52:46.688	2026-09-23 06:52:46.688
28869f10-6ac5-4cf2-9388-f26d661750ea	2e310667-1c46-4818-ac37-379d159a30f7	f658801b-24b1-4471-b4b6-b765d77c67c4	MD Department Bangalore	MD-DEPT-BLR	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.689	2026-09-23 06:52:46.689
3cdd0057-fb6b-48e4-b993-d44151cc7b42	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	MD House Bangalore	MD-HSE-BLR	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.689	2026-09-23 06:52:46.689
e4aba731-eb4b-4394-843c-7f704d4838f9	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	MD House Hubli	MD-HSE-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.69	2026-09-23 06:52:46.69
0244afde-2a2e-4282-95ca-dc1abad52b6e	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	MG Motors Belgaum	MG-BGM	\N	Belgaum	Karnataka	\N	t	2026-09-23 06:52:46.691	2026-09-23 06:52:46.691
030411fe-e37d-4442-b121-603d4813f5bf	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	MG Motors Gulbarga	MG-GLB	\N	Gulbarga	Karnataka	\N	t	2026-09-23 06:52:46.691	2026-09-23 06:52:46.691
3898fdc6-de13-4b0b-9adb-8499305d3559	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	MG Motors Hubli	MG-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.692	2026-09-23 06:52:46.692
1c2b8e43-245d-42a3-adb5-2671be4b95ba	2e310667-1c46-4818-ac37-379d159a30f7	97c3f3a3-b74f-4358-8b0d-f676e2f35d7a	Sony Hubli	SNY-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.693	2026-09-23 06:52:46.693
0f8bf570-765d-4b8f-b135-2261fc299a6d	2e310667-1c46-4818-ac37-379d159a30f7	1e67c4bd-ca0e-402e-822f-bc358916769c	Swaraj Hubli	SWR-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.694	2026-09-23 06:52:46.694
aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Bellary	TATA-BLY	\N	Bellary	Karnataka	\N	t	2026-09-23 06:52:46.694	2026-09-23 06:52:46.694
afbb8543-7464-4290-ae99-4d3c654fb777	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Bommasandra Bangalore	TATA-BMS	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.695	2026-09-23 06:52:46.695
321fe9e5-83c9-40f4-a345-3802c6e9d5bf	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Gangavathi	TATA-GGV	\N	Gangavathi	Karnataka	\N	t	2026-09-23 06:52:46.695	2026-09-23 06:52:46.695
25987508-ee1d-4722-b814-5f6596cc783a	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Hospet	TATA-HSP	\N	Hospet	Karnataka	\N	t	2026-09-23 06:52:46.696	2026-09-23 06:52:46.696
cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Koppal	TATA-KPL	\N	Koppal	Karnataka	\N	t	2026-09-23 06:52:46.696	2026-09-23 06:52:46.696
67234d49-0607-43eb-b468-7a1a742b5f59	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Raichur	TATA-RCR	\N	Raichur	Karnataka	\N	t	2026-09-23 06:52:46.697	2026-09-23 06:52:46.697
a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Sarjapur Bangalore	TATA-SJP	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.697	2026-09-23 06:52:46.697
d8dbd457-63e9-4040-b873-267bf4712118	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	Tata Motors Sarjapur Workshop	TATA-SJP-WK	\N	Bangalore	Karnataka	\N	t	2026-09-23 06:52:46.698	2026-09-23 06:52:46.698
f13bd4c8-950c-4605-b6c3-587ece85dac5	2e310667-1c46-4818-ac37-379d159a30f7	0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	Used Cars	UC-HBL	\N	Hubli	Karnataka	\N	t	2026-09-23 06:52:46.698	2026-09-23 06:52:46.698
a24c8442-d623-4ffc-8fbc-4fdd876030ab	30d424ac-9074-40b8-b062-deae1a023a3d	f8131f02-987c-4d62-ac42-01a814b827c8	Bhiwandi Central Mega Depot	BHW-01	\N	Bhiwandi	Maharashtra	\N	t	2026-09-23 06:52:46.827	2026-09-23 06:52:46.827
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, "tenantId", name, code, description, "isActive", "createdAt", "updatedAt") FROM stdin;
5e04052b-99bf-41c7-81ce-f32af306bab5	2e310667-1c46-4818-ac37-379d159a30f7	Ather Energy	ATHER	\N	t	2026-09-23 06:52:46.658	2026-09-23 06:52:46.658
0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	2e310667-1c46-4818-ac37-379d159a30f7	Ballad Used Cars	BUC	\N	t	2026-09-23 06:52:46.66	2026-09-23 06:52:46.66
f7aa29cf-7a33-47d5-8fd5-df043f7448a0	2e310667-1c46-4818-ac37-379d159a30f7	Back Office	BO	\N	t	2026-09-23 06:52:46.661	2026-09-23 06:52:46.661
f2a51b19-d251-43a0-a07b-eebc692ebbcf	2e310667-1c46-4818-ac37-379d159a30f7	Beltech AI	BELTECH_AI	\N	t	2026-09-23 06:52:46.662	2026-09-23 06:52:46.662
dd42f648-4887-4eea-a658-1c33796f8412	2e310667-1c46-4818-ac37-379d159a30f7	Chevrolet	CHEV	\N	t	2026-09-23 06:52:46.663	2026-09-23 06:52:46.663
8774585c-a9bb-4c1c-a5eb-7db85543530c	2e310667-1c46-4818-ac37-379d159a30f7	CNH Industrial India Pvt Ltd	CNH	\N	t	2026-09-23 06:52:46.664	2026-09-23 06:52:46.664
29e2cdbc-abdf-422f-9036-79cfa70b0d70	2e310667-1c46-4818-ac37-379d159a30f7	CRM	CRM	\N	t	2026-09-23 06:52:46.666	2026-09-23 06:52:46.666
cec05e97-654a-4d1f-af5a-cbe29dd33b4d	2e310667-1c46-4818-ac37-379d159a30f7	Head Office	HO	\N	t	2026-09-23 06:52:46.667	2026-09-23 06:52:46.667
387493bc-be7e-4ca1-bf51-4386fb151aa2	2e310667-1c46-4818-ac37-379d159a30f7	Hero Moto Corp	HERO	\N	t	2026-09-23 06:52:46.668	2026-09-23 06:52:46.668
885f7fb1-49f6-42f9-a966-7c9a017860bb	2e310667-1c46-4818-ac37-379d159a30f7	Hyundai	HYUNDAI	\N	t	2026-09-23 06:52:46.669	2026-09-23 06:52:46.669
f658801b-24b1-4471-b4b6-b765d77c67c4	2e310667-1c46-4818-ac37-379d159a30f7	MD Apartment	MD_APT	\N	t	2026-09-23 06:52:46.67	2026-09-23 06:52:46.67
c7e01a14-d9c8-4d39-9ca3-a47799e097dc	2e310667-1c46-4818-ac37-379d159a30f7	MD House	MD_HOUSE	\N	t	2026-09-23 06:52:46.671	2026-09-23 06:52:46.671
164a8950-346f-42f9-a265-acffcd37862f	2e310667-1c46-4818-ac37-379d159a30f7	MG Motors	MG	\N	t	2026-09-23 06:52:46.672	2026-09-23 06:52:46.672
97c3f3a3-b74f-4358-8b0d-f676e2f35d7a	2e310667-1c46-4818-ac37-379d159a30f7	Sony	SONY	\N	t	2026-09-23 06:52:46.672	2026-09-23 06:52:46.672
1e67c4bd-ca0e-402e-822f-bc358916769c	2e310667-1c46-4818-ac37-379d159a30f7	Swaraj	SWARAJ	\N	t	2026-09-23 06:52:46.673	2026-09-23 06:52:46.673
605c6364-cb40-43f4-b9c1-933556989196	2e310667-1c46-4818-ac37-379d159a30f7	Tata Motors	TATA	\N	t	2026-09-23 06:52:46.673	2026-09-23 06:52:46.673
0211dadd-7ea1-4e91-a087-c6a3e06afbf5	2e310667-1c46-4818-ac37-379d159a30f7	Warehouse	WH	\N	t	2026-09-23 06:52:46.674	2026-09-23 06:52:46.674
f8131f02-987c-4d62-ac42-01a814b827c8	30d424ac-9074-40b8-b062-deae1a023a3d	OmniExpress Fleet	OMNI-FLT	\N	t	2026-09-23 06:52:46.826	2026-09-23 06:52:46.826
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, "tenantId", name, code, description, "isActive", "createdAt", "updatedAt") FROM stdin;
a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2e310667-1c46-4818-ac37-379d159a30f7	Accessories	ACC	\N	t	2026-09-23 06:52:46.699	2026-09-23 06:52:46.699
b4585701-6704-4e3b-af7c-9bb115c6701b	2e310667-1c46-4818-ac37-379d159a30f7	Accounts	ACCT	\N	t	2026-09-23 06:52:46.7	2026-09-23 06:52:46.7
5ff7f408-a107-4d91-ae42-6eab5d066fa0	2e310667-1c46-4818-ac37-379d159a30f7	Admin	ADM	\N	t	2026-09-23 06:52:46.701	2026-09-23 06:52:46.701
5eb176c4-1e46-4e18-9a96-45bda861c64a	2e310667-1c46-4818-ac37-379d159a30f7	Amargol Layout	AML	\N	t	2026-09-23 06:52:46.705	2026-09-23 06:52:46.705
970518e5-8654-4f26-a37c-6a326da6db69	2e310667-1c46-4818-ac37-379d159a30f7	Auditor	AUD	\N	t	2026-09-23 06:52:46.706	2026-09-23 06:52:46.706
aec92a78-c6ca-40ef-8a2d-9eb98c51e38f	2e310667-1c46-4818-ac37-379d159a30f7	Back Office	BO	\N	t	2026-09-23 06:52:46.707	2026-09-23 06:52:46.707
a897678b-8f1f-49f2-8fa7-aa5ab301d5c7	2e310667-1c46-4818-ac37-379d159a30f7	Belligatti Farmhouse	BFH	\N	t	2026-09-23 06:52:46.709	2026-09-23 06:52:46.709
6e4178c4-f806-4a41-b122-a4566e58fe9b	2e310667-1c46-4818-ac37-379d159a30f7	Beltech AI	BAI	\N	t	2026-09-23 06:52:46.709	2026-09-23 06:52:46.709
e18f7e62-e43b-43e0-9cfb-cf757c51986c	2e310667-1c46-4818-ac37-379d159a30f7	Beltech Goa	BGOA	\N	t	2026-09-23 06:52:46.71	2026-09-23 06:52:46.71
4f615162-c1d7-4e1b-94c7-b1c2cbe837f2	2e310667-1c46-4818-ac37-379d159a30f7	Bodyshop	BSH	\N	t	2026-09-23 06:52:46.71	2026-09-23 06:52:46.71
ac10bb19-9e42-4f76-8a90-61d3385ef600	2e310667-1c46-4818-ac37-379d159a30f7	CRM	CRM	\N	t	2026-09-23 06:52:46.711	2026-09-23 06:52:46.711
1db5ef20-9e3e-497a-9379-f41157d92689	2e310667-1c46-4818-ac37-379d159a30f7	Dharwad Home	DHD	\N	t	2026-09-23 06:52:46.711	2026-09-23 06:52:46.711
e8b28bba-6710-40f5-95e4-3cc63f71746e	2e310667-1c46-4818-ac37-379d159a30f7	Hubli Home	HBH	\N	t	2026-09-23 06:52:46.712	2026-09-23 06:52:46.712
cafeac1a-2bc9-43b4-a888-6aaf84095a6c	2e310667-1c46-4818-ac37-379d159a30f7	Hubli Residence	HBR	\N	t	2026-09-23 06:52:46.712	2026-09-23 06:52:46.712
265446e9-0314-4f84-8e1f-3b364635560b	2e310667-1c46-4818-ac37-379d159a30f7	IT	IT	\N	t	2026-09-23 06:52:46.713	2026-09-23 06:52:46.713
6ef083e2-cc35-40db-a160-014595678a38	2e310667-1c46-4818-ac37-379d159a30f7	Mahogany Apartment Bangalore	MAB	\N	t	2026-09-23 06:52:46.713	2026-09-23 06:52:46.713
a5e37161-3a17-4b45-8a80-aba8da91e43a	2e310667-1c46-4818-ac37-379d159a30f7	Operations	OPS	\N	t	2026-09-23 06:52:46.714	2026-09-23 06:52:46.714
81e0adea-4293-4d69-a5ed-e5c0c7d6d981	2e310667-1c46-4818-ac37-379d159a30f7	Other	OTH	\N	t	2026-09-23 06:52:46.714	2026-09-23 06:52:46.714
c47d1a73-63a2-4495-af48-8c63cde7a428	2e310667-1c46-4818-ac37-379d159a30f7	Real Estate	RE	\N	t	2026-09-23 06:52:46.715	2026-09-23 06:52:46.715
0450b534-f413-4064-b9b7-3ad1fa6eb25c	2e310667-1c46-4818-ac37-379d159a30f7	Sales	SLS	\N	t	2026-09-23 06:52:46.715	2026-09-23 06:52:46.715
ecfbc3ce-8eae-438b-844b-4be93d4279d0	2e310667-1c46-4818-ac37-379d159a30f7	Sale / Service / Spares	SSS	\N	t	2026-09-23 06:52:46.716	2026-09-23 06:52:46.716
48d3a965-80a2-4fe1-b8fb-fad5d02731e7	2e310667-1c46-4818-ac37-379d159a30f7	Service	SRV	\N	t	2026-09-23 06:52:46.716	2026-09-23 06:52:46.716
3bd56fb7-59f4-436e-acf0-75f2d32caa89	2e310667-1c46-4818-ac37-379d159a30f7	Service and Sales	SNS	\N	t	2026-09-23 06:52:46.717	2026-09-23 06:52:46.717
77482462-625b-4554-b7b6-4bb0c2900069	2e310667-1c46-4818-ac37-379d159a30f7	Showroom	SHW	\N	t	2026-09-23 06:52:46.717	2026-09-23 06:52:46.717
a95613ac-3cd8-4e26-8d14-7b5aefd285ae	2e310667-1c46-4818-ac37-379d159a30f7	Sony	SNY	\N	t	2026-09-23 06:52:46.718	2026-09-23 06:52:46.718
9fce4cc9-e4c7-46b3-a21c-01de69369a0f	2e310667-1c46-4818-ac37-379d159a30f7	Spares	SPR	\N	t	2026-09-23 06:52:46.718	2026-09-23 06:52:46.718
b16448ef-ee35-4cc5-954f-64c3a0be802e	2e310667-1c46-4818-ac37-379d159a30f7	Stockyard	SYD	\N	t	2026-09-23 06:52:46.719	2026-09-23 06:52:46.719
5bf9c7f0-7cfa-42b6-94ea-bc73fc53831a	2e310667-1c46-4818-ac37-379d159a30f7	Taxation	TAX	\N	t	2026-09-23 06:52:46.719	2026-09-23 06:52:46.719
15daf98f-36f7-4c83-894e-6c969eab0675	2e310667-1c46-4818-ac37-379d159a30f7	Taxation Department	TXD	\N	t	2026-09-23 06:52:46.72	2026-09-23 06:52:46.72
dd68c990-eb26-47a9-a147-b3f39e52d797	2e310667-1c46-4818-ac37-379d159a30f7	Warehouse	WH	\N	t	2026-09-23 06:52:46.721	2026-09-23 06:52:46.721
cdfa8b61-1211-4989-b098-ccec8afe83e7	2e310667-1c46-4818-ac37-379d159a30f7	Workshop	WKP	\N	t	2026-09-23 06:52:46.721	2026-09-23 06:52:46.721
74ef73ac-bcce-487a-9798-e0db05cd0aa2	2e310667-1c46-4818-ac37-379d159a30f7	Workshop Expense	WKE	\N	t	2026-09-23 06:52:46.722	2026-09-23 06:52:46.722
78606a9e-2e7a-427a-9357-faf556876efb	30d424ac-9074-40b8-b062-deae1a023a3d	Heavy Fleet & Trailers	HFLT	\N	t	2026-09-23 06:52:46.828	2026-09-23 06:52:46.828
\.


--
-- Data for Name: maintenance_request_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request_assignments (id, "tenantId", "requestId", "assignedToId", "assignedById", "assignedAt", notes, active, "actionPlan") FROM stdin;
e3321ae6-fd3b-409b-a526-9e62261a24f6	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 06:53:41.661	Inspect immediately	t	1. Test sensor\n2. Swap circuit\n3. Verify output voltage
1c4e02b6-bab9-42b1-bd18-275cb3a4ea61	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:03:51.402	Inspect immediately	t	1. Test sensor\n2. Swap circuit\n3. Verify output voltage
9ad47674-5454-4696-9e50-c36cc16588a8	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:05:13.748	Inspect immediately	t	1. Test sensor\n2. Swap circuit\n3. Verify output voltage
eb827342-64df-4122-aac4-9c185e72e849	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:37:27.425	Inspect immediately	t	1. Test sensor\n2. Swap circuit\n3. Verify output voltage
6f2c7fc2-6b0c-41c2-a2f1-8d3b752a1485	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	be9a0dd8-f525-403b-8c54-45d7f34a7570	79604a14-4a74-4c65-a925-5f8e953ec609	2026-09-23 07:43:46.387	\N	t	\N
7bfabf8b-cb7e-4b39-8e9c-6d5e3cc300a0	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:49:05.863	Inspect immediately	t	1. Test sensor\n2. Swap circuit\n3. Verify output voltage
5a039465-e1f0-4aba-9d28-102c5f3d4c49	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 12:38:33.183	Priority task: server room heat critical	t	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower
4a686a72-dd2b-424c-b193-6477cc89ae37	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-24 11:43:35.711	Priority task: server room heat critical	t	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower
582bad2e-8e69-44c0-8cbb-12877c3a0e0a	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-24 11:55:28.842	Priority task: server room heat critical	t	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower
b3b3cda4-3729-4d5c-9dde-49127927b897	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-24 12:45:18.792	Priority task: server room heat critical	t	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower
\.


--
-- Data for Name: maintenance_request_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request_attachments (id, "tenantId", "requestId", "originalFilename", "storedFilename", "fileUrl", "mimeType", "fileSize", "attachmentType", "uploadedById", "createdAt") FROM stdin;
6df22272-8804-494b-819b-5c2f15a5e372	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	Hyundai (1).png	maintly-1790149499887-986267208.png	/uploads/maintly-1790149499887-986267208.png	image/png	8579	QUOTATION_DOC	79604a14-4a74-4c65-a925-5f8e953ec609	2026-09-23 07:44:59.892
0eee1709-0de6-496c-a78d-fde3a4d22681	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	Hyundai (1).png	maintly-1790164701606-514510785.png	/uploads/maintly-1790164701606-514510785.png	image/png	8579	INVOICE_DOC	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-23 11:58:21.614
\.


--
-- Data for Name: maintenance_request_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request_comments (id, "tenantId", "requestId", "userId", comment, "isInternal", "createdAt") FROM stdin;
00c3730f-0789-421c-bfe6-35d55d83574a	2e310667-1c46-4818-ac37-379d159a30f7	882448d3-94df-4df9-bcc3-1181fbf83325	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-08-31 09:00:45.653
e7f3d141-0eb4-4e81-ad64-c794db6ec643	2e310667-1c46-4818-ac37-379d159a30f7	2e0e0cad-3604-4a94-bd9e-35a4a3f9b98f	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-09-20 09:02:49.109
21339a84-bf6b-411b-add0-510b6317c664	2e310667-1c46-4818-ac37-379d159a30f7	64c7b9e9-6fd3-4754-9140-f1e0ba886948	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-02 09:04:52.565
1d378a66-c95c-466e-a51b-445182c573e9	2e310667-1c46-4818-ac37-379d159a30f7	de7c30f1-ec69-483d-ba6c-359f6161eb2b	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-09-03 09:06:56.021
60e3dfb6-175f-4e59-b74f-b1a76e576f95	2e310667-1c46-4818-ac37-379d159a30f7	c607ba1d-a287-4251-9623-012a8c5b3af8	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-16 09:08:59.477
93533652-9864-4a5c-974e-05b22f2289ab	2e310667-1c46-4818-ac37-379d159a30f7	c2d05477-a809-4a22-af50-7517f84d61a4	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-03 09:11:02.933
972ecedb-bb0e-4341-8729-4021d4dc7bdf	2e310667-1c46-4818-ac37-379d159a30f7	833695c9-3f1a-4fbc-99ab-c233b3e1b6b2	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-19 09:13:06.389
ee7007e9-f904-4f72-9c6c-5ac3aa90ac3f	2e310667-1c46-4818-ac37-379d159a30f7	d5ca95c5-7e35-4c80-b673-36b5eea47ddf	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-03 09:15:09.845
54935135-8c53-4b72-8260-d2c9ac002615	2e310667-1c46-4818-ac37-379d159a30f7	80c09d2e-5c24-49a3-9ae9-cede9acda39c	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-09-08 09:17:13.301
97a451d0-3891-4f37-a93a-eb0024d4e3be	2e310667-1c46-4818-ac37-379d159a30f7	83cbe196-bc01-4581-b2fa-163a65dcb8d7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-10 09:19:16.757
3fd256a2-8c66-4330-9ae7-87785316d761	2e310667-1c46-4818-ac37-379d159a30f7	55bfb048-a97a-4eee-84e6-7fcc6cbd499d	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Server Room Liebert Precision AC High Temperature Alarm (28°C). Equipment isolated for safety.	f	2026-09-18 09:21:20.213
a2e4e95c-d779-4bc4-bc02-1b495533c403	2e310667-1c46-4818-ac37-379d159a30f7	27a61a4b-cd9b-40c8-9d51-21458c070110	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked. Equipment isolated for safety.	f	2026-09-19 09:23:23.669
ab63d5ef-6464-4992-a5e8-6b64d510556d	2e310667-1c46-4818-ac37-379d159a30f7	97584eaa-ede9-4c1b-80be-b7ac1d4eada7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination. Equipment isolated for safety.	f	2026-09-20 09:25:27.125
f6d99509-7c05-45b4-a9c5-c214b7de480a	2e310667-1c46-4818-ac37-379d159a30f7	243ed821-21df-4eca-a30b-9658db7e7987	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Customer Restroom Sensor Faucets Non-Responsive. Equipment isolated for safety.	f	2026-08-30 09:27:30.581
22f87fb8-8053-4e5d-a022-7b1d944ff6fc	2e310667-1c46-4818-ac37-379d159a30f7	8cc086bf-dc97-4a2f-9fb9-0e18f0ae73a1	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded. Equipment isolated for safety.	f	2026-09-17 09:29:34.037
02cc6fbe-260f-4105-b54b-d076237a4651	2e310667-1c46-4818-ac37-379d159a30f7	37c0759c-d9b3-4e73-97f5-3dc512b3aa90	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-09-07 09:31:37.493
cdff9bb2-200a-4d82-ac7d-75a41725c278	2e310667-1c46-4818-ac37-379d159a30f7	910ece14-e6dd-4108-b0fe-22e11540a423	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-09-17 09:33:40.949
98a79bb7-7571-44d6-9dc5-1af5c8cc2bee	2e310667-1c46-4818-ac37-379d159a30f7	df744de5-8240-49bf-b0f9-ea3daf5bfc06	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-16 09:35:44.405
c5230d24-7636-4e24-bf6a-6c26521d1670	2e310667-1c46-4818-ac37-379d159a30f7	75bc0d75-eedd-4f16-8e13-e7a1dfe79d88	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-09-05 09:37:47.861
a25ad7c6-fb6a-4000-9504-58e45a1530b4	2e310667-1c46-4818-ac37-379d159a30f7	7f741e90-4f7f-4c93-8c42-36d4ba29971a	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-17 09:39:51.317
5c107bab-5d9d-4ee1-aea5-ddfefc769f2b	2e310667-1c46-4818-ac37-379d159a30f7	e323ba8e-fb9b-48ac-852f-870dd17ce8b5	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-04 09:41:54.773
0fc15cbf-7ef0-45c9-9671-a4126322cf68	2e310667-1c46-4818-ac37-379d159a30f7	ebc460f7-17c1-473d-9f58-808bf980e1c4	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-18 09:43:58.229
761693ce-1a81-4b23-9948-723b08cb4bea	2e310667-1c46-4818-ac37-379d159a30f7	fd4c21ee-c7e6-4b7d-8c93-713dbb49e9ae	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-16 09:46:01.685
b3ddb8ad-06ce-4ba3-984b-df96862dbb7c	2e310667-1c46-4818-ac37-379d159a30f7	84b7c1dc-00f5-4f1a-b5b0-59b50d5cb381	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-09-12 09:48:05.141
fdf57211-d52f-446b-9772-9381bc55fdbf	2e310667-1c46-4818-ac37-379d159a30f7	4d0c47cb-7702-4803-a302-ab121ba0db42	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-20 09:50:08.597
52323569-0e5d-4097-a76c-02633c55ad9b	2e310667-1c46-4818-ac37-379d159a30f7	4e064602-d295-479f-b719-477ff80b22be	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Server Room Liebert Precision AC High Temperature Alarm (28°C). Equipment isolated for safety.	f	2026-09-12 09:52:12.053
a649db82-0bfb-47cd-a010-23d4cd30bb07	2e310667-1c46-4818-ac37-379d159a30f7	8ffc3841-5441-4130-8178-3f46f7a40f6e	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked. Equipment isolated for safety.	f	2026-09-16 09:54:15.509
07bca7d4-a93b-43bb-b41c-1e08ca5b2182	2e310667-1c46-4818-ac37-379d159a30f7	6a31a101-5bad-4e53-8158-721e00bd85ff	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination. Equipment isolated for safety.	f	2026-09-15 09:56:18.965
bcfaec1f-d65e-4892-928b-bd03f8b27aaf	2e310667-1c46-4818-ac37-379d159a30f7	1790fc3f-a48a-4203-b74f-e63df64b02a0	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Customer Restroom Sensor Faucets Non-Responsive. Equipment isolated for safety.	f	2026-09-08 09:58:22.421
6b00653c-8abf-4ba7-a421-f343b50159e6	2e310667-1c46-4818-ac37-379d159a30f7	e9048dad-433f-4c01-adbf-d01a543adfed	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded. Equipment isolated for safety.	f	2026-09-11 10:00:25.877
cd183fa6-de6a-4901-910c-f4e93a732e96	2e310667-1c46-4818-ac37-379d159a30f7	73c15eb2-90b6-40b9-b70e-aa8805e03bc9	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-09-03 09:02:29.333
6a49f20f-922d-4f22-93ce-c91e6ed89b41	2e310667-1c46-4818-ac37-379d159a30f7	f47106c9-30ff-4e5d-a59d-53979374be82	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-09-15 09:04:32.789
c813e833-061c-47fa-8688-748343e2e5c3	2e310667-1c46-4818-ac37-379d159a30f7	de1ff722-784e-405e-bbdb-2a6a2de37825	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-16 09:06:36.245
faea4236-3eb3-424c-97a7-b1519c2e7599	2e310667-1c46-4818-ac37-379d159a30f7	4cd4e1bc-7839-4cc7-b50e-1c093ccb9a51	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-08-31 09:08:39.701
447e86e2-d555-4ed4-be7c-53ca758b3f25	2e310667-1c46-4818-ac37-379d159a30f7	5c535968-0658-4eff-9330-6941b14bdcbd	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-14 09:10:43.157
82515f05-344f-46ff-8f5e-23421b932532	2e310667-1c46-4818-ac37-379d159a30f7	49b69ec1-f5b9-4053-91c8-5419c33d12b0	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-11 09:12:46.613
cfa2e274-1277-4f6b-99a2-733bcf76bfe3	2e310667-1c46-4818-ac37-379d159a30f7	5fc257a2-5650-41eb-947a-62c19c0a118a	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-17 09:14:50.069
7defb106-817e-474a-8d7d-29271c976668	2e310667-1c46-4818-ac37-379d159a30f7	03e99ff3-29af-46de-ac1a-bd7aed8a5bee	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-17 09:16:53.525
91546204-a337-47f0-aa7b-4a8cdbb78541	2e310667-1c46-4818-ac37-379d159a30f7	7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-09-09 09:18:56.981
34d903a2-8d9b-489c-b2df-f1655c96cbaa	2e310667-1c46-4818-ac37-379d159a30f7	5bd03715-3e1a-4407-8c94-1b26a032933b	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-03 09:21:00.437
f6bf9e9b-f1e8-48a0-8f0d-a32b6336812e	2e310667-1c46-4818-ac37-379d159a30f7	b32d65fc-538d-49ca-be9d-129ad29b74ab	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Server Room Liebert Precision AC High Temperature Alarm (28°C). Equipment isolated for safety.	f	2026-09-02 09:23:03.893
3a1b267d-78d8-4237-bca8-5f6ff6556423	2e310667-1c46-4818-ac37-379d159a30f7	fcbaeb3e-6bad-4309-8e7d-44c23d388261	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked. Equipment isolated for safety.	f	2026-09-19 09:25:07.349
13535397-d04a-421d-b290-6a463aa34d88	2e310667-1c46-4818-ac37-379d159a30f7	a03758bf-48bd-425e-9d72-0a456384cf18	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination. Equipment isolated for safety.	f	2026-09-20 09:27:10.805
b6822b3b-b68d-4409-b7db-1f315e24efbe	2e310667-1c46-4818-ac37-379d159a30f7	60d1386d-d792-4580-9a15-64888c1d1da5	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Customer Restroom Sensor Faucets Non-Responsive. Equipment isolated for safety.	f	2026-09-08 09:29:14.261
26b60ec5-1e7a-40a4-976c-76aca24c2b66	2e310667-1c46-4818-ac37-379d159a30f7	ad0981d4-d720-4479-a90d-4a717bfbfa99	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded. Equipment isolated for safety.	f	2026-09-06 09:31:17.717
81b83200-1b22-4d7b-8249-f33e3bfe9014	2e310667-1c46-4818-ac37-379d159a30f7	fe91c5e8-8181-49dc-b665-d8cd25aac83e	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-09-19 09:33:21.173
cdbb9f04-cb6a-4c88-8366-1d4210e80d86	2e310667-1c46-4818-ac37-379d159a30f7	0d8c4f0a-a810-412e-a69c-e0b615ac7682	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-09-05 09:35:24.629
53f2f9e7-ccfe-47e1-8c5d-c3cf52689e60	2e310667-1c46-4818-ac37-379d159a30f7	9c20c2d8-6691-48ed-af25-a45d7e37a657	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-02 09:37:28.085
d939d12f-48ae-48c1-8a60-88aa4928c268	2e310667-1c46-4818-ac37-379d159a30f7	0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-09-10 09:39:31.541
4a8a1ab6-fe78-4cce-b7f7-b83cc713164d	2e310667-1c46-4818-ac37-379d159a30f7	c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-06 09:41:34.997
afcd22aa-d185-4b44-b9e7-2e1a1a1d5748	2e310667-1c46-4818-ac37-379d159a30f7	b6cb63b1-6a66-4183-90d4-e09aed2b5082	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-21 09:43:38.453
d1b9d66c-4034-4867-86c2-13849fda6f95	2e310667-1c46-4818-ac37-379d159a30f7	7e9503e3-4e8f-4bc4-95f9-ec1482032333	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-19 09:45:41.909
861ff3c1-b065-4828-b3f9-9066d1fda9d7	2e310667-1c46-4818-ac37-379d159a30f7	76ae857a-3221-4911-9621-54e23a37d0c2	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-21 09:47:45.365
349b198d-0e0e-40cd-bae4-0058079587f6	2e310667-1c46-4818-ac37-379d159a30f7	7aa3c28e-696a-4280-9147-539d287188b9	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-09-11 09:49:48.821
3dcd570d-f275-4ad8-96be-5618f0130f0d	2e310667-1c46-4818-ac37-379d159a30f7	de3a3406-db8e-4a9a-94a9-d0a523c9aebb	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-12 09:51:52.277
15bfa198-cd3a-411f-ab25-73a79f55acdc	2e310667-1c46-4818-ac37-379d159a30f7	d4ad56fd-6b9a-4449-a6cb-309440a65d5c	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Server Room Liebert Precision AC High Temperature Alarm (28°C). Equipment isolated for safety.	f	2026-09-01 09:53:55.733
f1b06989-4757-43ed-bca6-1b9b1d6e21dd	2e310667-1c46-4818-ac37-379d159a30f7	d91ff9ab-ae5b-4ec0-859a-963998d8feb4	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked. Equipment isolated for safety.	f	2026-09-13 09:55:59.189
84c51995-a281-4b12-82cc-93ab6132d199	2e310667-1c46-4818-ac37-379d159a30f7	ad7ac685-23e6-4a67-a138-33255e4dd00e	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination. Equipment isolated for safety.	f	2026-09-22 09:58:02.645
2855498f-7a32-4793-b66b-4559354fc5e3	2e310667-1c46-4818-ac37-379d159a30f7	c30d680f-8b2e-4314-9b16-96c1f2452a3f	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Customer Restroom Sensor Faucets Non-Responsive. Equipment isolated for safety.	f	2026-09-19 10:00:06.101
d98ad74a-3779-4583-8202-cb12715e3e81	2e310667-1c46-4818-ac37-379d159a30f7	3534c52b-b76b-4f16-a8ef-6995ad23153a	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded. Equipment isolated for safety.	f	2026-09-09 09:02:09.557
3c20647e-66ab-4378-af04-57a521ebd888	2e310667-1c46-4818-ac37-379d159a30f7	d09f9082-4308-4fb7-b4b2-8b7342bbe655	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-09-05 09:04:13.013
d29f08c1-99d1-4c34-816a-ce8e705a1741	2e310667-1c46-4818-ac37-379d159a30f7	14ea07ff-c5cf-40fb-b109-eb8f53085ea7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-08-29 09:06:16.469
5037e061-a394-48e5-a428-ee14aaa03932	2e310667-1c46-4818-ac37-379d159a30f7	c6e2f83f-af02-4fa6-a70f-6dfa74c04b85	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-19 09:08:19.925
c8998ad1-f521-4ab8-96d1-1e0db5bbd89d	2e310667-1c46-4818-ac37-379d159a30f7	bc2c4645-efb4-47e3-902e-76d34d7a9d12	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-09-22 09:10:23.381
ab9b1a11-a82f-4271-9f1e-08fc376c9b9e	2e310667-1c46-4818-ac37-379d159a30f7	c518ff44-1f26-46b5-9938-41a838d4e7ea	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-18 09:12:26.837
45aa775c-ba9c-4452-ac3f-9a285397d987	2e310667-1c46-4818-ac37-379d159a30f7	c1677129-600c-48b4-956f-4a7bc34c7a0c	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-16 09:14:30.293
66e1fcd6-8dca-4e33-85bb-fbc41c074dad	2e310667-1c46-4818-ac37-379d159a30f7	a7f42c46-a564-462b-9f48-77679c77c245	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-10 09:16:33.749
31c0f47f-594c-487c-ad44-34bf5608eb31	2e310667-1c46-4818-ac37-379d159a30f7	f37d2d08-4ee3-4a69-8bab-e1dc70f38ad5	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-16 09:18:37.205
155924ef-263f-46ce-819a-b5231443496a	2e310667-1c46-4818-ac37-379d159a30f7	7cb88513-1ff9-4cac-ab15-a7c0a2d41ff4	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-09-15 09:20:40.661
df8623e5-88dc-4946-b970-6a799731a117	2e310667-1c46-4818-ac37-379d159a30f7	8a476908-a3dc-4b62-9123-fe72cabb0ed7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-18 09:22:44.117
1bdc83e3-ce43-4bd8-8f2c-9fba631f72af	2e310667-1c46-4818-ac37-379d159a30f7	8c179cf7-4dc2-412d-9071-12f3d01cee00	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Server Room Liebert Precision AC High Temperature Alarm (28°C). Equipment isolated for safety.	f	2026-09-22 09:24:47.573
a36a766e-fab4-4151-b8ab-16843649c27c	2e310667-1c46-4818-ac37-379d159a30f7	65a94fbf-060f-4322-a38c-a2a4153be1dc	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked. Equipment isolated for safety.	f	2026-09-21 09:26:51.029
bfc524fc-4de1-4591-a11b-57590d7a2a8e	2e310667-1c46-4818-ac37-379d159a30f7	bfb358ae-3aa4-4523-9904-b6e6382b629e	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination. Equipment isolated for safety.	f	2026-09-15 09:28:54.485
42e23f00-85d4-4290-b613-baa681f98ca8	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Customer Restroom Sensor Faucets Non-Responsive. Equipment isolated for safety.	f	2026-09-04 09:30:57.941
97a9e989-8bdb-462c-be56-3d0a946b0ee8	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded. Equipment isolated for safety.	f	2026-09-09 09:33:01.397
87e94dff-78f3-44a1-9bef-da8391ea316c	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-09-10 09:35:04.853
9f8f61c1-4776-4169-b64b-269a807422cc	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-09-19 09:37:08.309
d137289e-625b-4e7b-b377-6cb633877f68	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-17 09:39:11.765
4f6ba809-36ce-4edd-9317-5fc3c57b9aaf	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-09-16 09:41:15.221
15a116c6-f674-496a-ba08-68af6b4eedee	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-01 09:43:18.677
cd7fea88-aedc-49bb-8a6d-17fbd5152878	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-16 09:45:22.133
941158d1-6f11-482a-aa87-ad20dba42846	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-13 09:47:25.589
8fbaab22-ad79-476d-8df4-02ce0f1b6235	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-10 09:49:29.045
e95fd6e2-df69-4e74-aafd-396437745817	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-09-03 09:51:32.501
f5dd5751-983e-4f31-9d68-b1b876b8529a	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-03 09:53:35.957
64dff7d2-d492-42bf-979f-8af658f75339	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Server Room Liebert Precision AC High Temperature Alarm (28°C). Equipment isolated for safety.	f	2026-09-20 09:55:39.413
026d3208-0efc-4c6c-93d1-536926be4739	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked. Equipment isolated for safety.	f	2026-09-18 09:57:42.869
27337ebf-263f-4e29-9e43-3dd34c1b9edf	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination. Equipment isolated for safety.	f	2026-09-03 09:59:46.325
eff0b1d4-42da-432b-b55c-b6f7fa05954a	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Customer Restroom Sensor Faucets Non-Responsive. Equipment isolated for safety.	f	2026-09-11 09:01:49.781
4227b340-f99e-4d5f-9adb-ec67db2c76ab	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded. Equipment isolated for safety.	f	2026-09-01 09:03:53.237
e1ebeb8a-7dc8-4d17-a780-58ad49847657	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage. Equipment isolated for safety.	f	2026-09-12 09:05:56.693
2a27b8d5-b2d3-4d33-a50c-644d840c1f09	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Central Workshop 50HP Screw Compressor Pressure Switch Failure. Equipment isolated for safety.	f	2026-09-09 09:08:00.149
5252e7e2-9e78-488e-ae3a-097667dbdf2a	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping. Equipment isolated for safety.	f	2026-09-07 09:10:03.605
a2076421-6598-4e0c-a935-5d822e1eeef0	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Paint Booth Downdraft Extraction Fan V-Belt Snapped. Equipment isolated for safety.	f	2026-09-14 09:12:07.061
3e346d49-f171-48dd-a924-fed085c4e8ee	2e310667-1c46-4818-ac37-379d159a30f7	099ad174-3ae2-4d99-b18f-378c18277e48	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Wheel Alignment System Optical Camera Calibration Fault. Equipment isolated for safety.	f	2026-09-10 09:14:10.517
2069f96b-a895-4da6-88a3-9b1eed3336ce	2e310667-1c46-4818-ac37-379d159a30f7	2425c292-06f9-4971-8724-5af82f9eed18	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping. Equipment isolated for safety.	f	2026-09-16 09:16:13.973
823ae356-6b47-4942-b56b-bb96c9820aba	2e310667-1c46-4818-ac37-379d159a30f7	98e3b603-0119-4d17-b475-b806a530c3e8	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Main Showroom Glass Automatic Sliding Door Sensor Jammed. Equipment isolated for safety.	f	2026-09-21 09:18:17.429
b94b93de-d16f-47ff-8ef6-c23a0424d31b	2e310667-1c46-4818-ac37-379d159a30f7	713fa020-ff0c-49fb-97f6-01a640432517	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Parts Warehouse High-Bay LED Luminaire Array Flickering. Equipment isolated for safety.	f	2026-09-16 09:20:20.885
d6bf00ef-3d01-4df6-a18a-d576a3afb483	2e310667-1c46-4818-ac37-379d159a30f7	57df17ea-1d1d-42f8-a29b-26a25b296ae7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for RO Drinking Water Filtration Plant High TDS & Pump Cavitation. Equipment isolated for safety.	f	2026-08-29 09:22:24.341
5ca6bbe7-7b81-4e6d-925d-812bd3f50c82	2e310667-1c46-4818-ac37-379d159a30f7	0344b543-c3ab-4f9c-b1bb-baa05643bbca	be9a0dd8-f525-403b-8c54-45d7f34a7570	Site inspection complete for Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled. Equipment isolated for safety.	f	2026-09-20 09:24:27.797
\.


--
-- Data for Name: maintenance_request_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request_materials (id, "tenantId", "requestId", "materialName", quantity, unit, "unitCost", "totalCost", "addedById", "createdAt") FROM stdin;
0fb136c0-d068-417b-bb34-8112eb64e8cb	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	Proximity Sensor PNP NC	1	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-23 06:53:41.686
4256fc82-b0e7-4bd0-857a-8c83f2c32f12	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	Proximity Sensor PNP NC	1	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-23 07:03:51.428
15e96d6d-6f31-4927-92d1-ecaaf9c1a767	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	Proximity Sensor PNP NC	1	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-23 07:05:13.775
50605478-e084-4dd5-997e-12c5e3d1fa16	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	Proximity Sensor PNP NC	1	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-23 07:37:27.453
6b2f9969-8685-45f4-884d-ff3bce513033	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	toshiba 1 TB HDD	2	pcs	14000	28000	79604a14-4a74-4c65-a925-5f8e953ec609	2026-09-23 07:44:39.231
cc9f98a2-50e7-4fcc-99db-734c2efcf1fc	2e310667-1c46-4818-ac37-379d159a30f7	03e99ff3-29af-46de-ac1a-bd7aed8a5bee	Contactor 3-Phase 40A 24V Coil	2	pcs	1520	1520	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-17 12:34:53.525
011b41b3-164a-42b1-b6b0-ad65a02681a8	2e310667-1c46-4818-ac37-379d159a30f7	7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1680	1680	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-09 12:36:56.981
f061fe46-483a-4568-a957-bf360a666440	2e310667-1c46-4818-ac37-379d159a30f7	5bd03715-3e1a-4407-8c94-1b26a032933b	Contactor 3-Phase 40A 24V Coil	2	pcs	4400	4400	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-03 12:39:00.437
a8b9ed0d-7b39-4e24-a62e-c822819d6a8a	2e310667-1c46-4818-ac37-379d159a30f7	b32d65fc-538d-49ca-be9d-129ad29b74ab	Hydraulic Cylinder Seal Kit 65mm	1	pcs	3120	3120	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-02 12:41:03.893
3d260520-0ab5-4214-abbd-0be345df1636	2e310667-1c46-4818-ac37-379d159a30f7	fcbaeb3e-6bad-4309-8e7d-44c23d388261	Contactor 3-Phase 40A 24V Coil	2	pcs	1400	1400	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-19 12:43:07.349
d7706d66-480c-4780-88a1-89729ab45505	2e310667-1c46-4818-ac37-379d159a30f7	a03758bf-48bd-425e-9d72-0a456384cf18	Hydraulic Cylinder Seal Kit 65mm	1	pcs	5800	5800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-20 12:45:10.805
81c02cfe-7c90-46f2-b7d0-c11466f9e791	2e310667-1c46-4818-ac37-379d159a30f7	60d1386d-d792-4580-9a15-64888c1d1da5	Contactor 3-Phase 40A 24V Coil	2	pcs	640	640	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-08 12:47:14.261
2b730e0f-3edc-4a7b-9cf7-85bbe7e0ad02	2e310667-1c46-4818-ac37-379d159a30f7	ad0981d4-d720-4479-a90d-4a717bfbfa99	Hydraulic Cylinder Seal Kit 65mm	1	pcs	2600	2600	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-06 12:49:17.717
cfb45326-d60c-4729-b5ae-fcf5d97a44e2	2e310667-1c46-4818-ac37-379d159a30f7	fe91c5e8-8181-49dc-b665-d8cd25aac83e	Contactor 3-Phase 40A 24V Coil	2	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-19 12:51:21.173
617ed51a-a64f-4dd9-86e0-a7ec76e6a1e0	2e310667-1c46-4818-ac37-379d159a30f7	0d8c4f0a-a810-412e-a69c-e0b615ac7682	Hydraulic Cylinder Seal Kit 65mm	1	pcs	3280	3280	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-05 12:53:24.629
2f48db58-ac72-4558-9506-9f097c26a494	2e310667-1c46-4818-ac37-379d159a30f7	9c20c2d8-6691-48ed-af25-a45d7e37a657	Contactor 3-Phase 40A 24V Coil	2	pcs	720	720	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-02 12:55:28.085
68c58cab-7d0a-492c-ad69-1e1b9ecae795	2e310667-1c46-4818-ac37-379d159a30f7	0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1280	1280	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-10 12:57:31.541
d699ed43-f869-4653-9814-15410e85227a	2e310667-1c46-4818-ac37-379d159a30f7	c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	Contactor 3-Phase 40A 24V Coil	2	pcs	2000	2000	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-06 12:59:34.997
80893cc5-f06c-4ab5-a4b4-ac8bc0ff09f1	2e310667-1c46-4818-ac37-379d159a30f7	b6cb63b1-6a66-4183-90d4-e09aed2b5082	Hydraulic Cylinder Seal Kit 65mm	1	pcs	3800	3800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-21 13:01:38.453
a72f6c16-89c8-4db4-bd82-29750be34e0b	2e310667-1c46-4818-ac37-379d159a30f7	7e9503e3-4e8f-4bc4-95f9-ec1482032333	Contactor 3-Phase 40A 24V Coil	2	pcs	960	960	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-19 13:03:41.909
fde94193-eb4b-46bd-bf88-82b85d1665bb	2e310667-1c46-4818-ac37-379d159a30f7	76ae857a-3221-4911-9621-54e23a37d0c2	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1520	1520	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-21 13:05:45.365
08d04f2a-e54b-4650-9cdd-cc3280f3a7cb	2e310667-1c46-4818-ac37-379d159a30f7	7aa3c28e-696a-4280-9147-539d287188b9	Contactor 3-Phase 40A 24V Coil	2	pcs	1680	1680	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-11 13:07:48.821
6ee70cc7-0c11-42d9-a3bc-bb29cf2287c0	2e310667-1c46-4818-ac37-379d159a30f7	de3a3406-db8e-4a9a-94a9-d0a523c9aebb	Hydraulic Cylinder Seal Kit 65mm	1	pcs	4400	4400	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-12 13:09:52.277
2871d196-12f4-4ad4-9e9b-0b50549081ae	2e310667-1c46-4818-ac37-379d159a30f7	d4ad56fd-6b9a-4449-a6cb-309440a65d5c	Contactor 3-Phase 40A 24V Coil	2	pcs	3120	3120	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-01 13:11:55.733
b18569b8-e9af-4f71-ae80-4e20618bf4eb	2e310667-1c46-4818-ac37-379d159a30f7	d91ff9ab-ae5b-4ec0-859a-963998d8feb4	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1400	1400	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-13 13:13:59.189
dccdf73d-03c4-4a24-a906-668966a6d3ce	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	Contactor 3-Phase 40A 24V Coil	2	pcs	640	640	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-04 12:48:57.941
849aab62-69af-4679-bbed-6cd438c83d83	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	Hydraulic Cylinder Seal Kit 65mm	1	pcs	2600	2600	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-09 12:51:01.397
0a41b8a9-3f1a-4049-b9ab-c37a462f3d9d	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	Contactor 3-Phase 40A 24V Coil	2	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-10 12:53:04.853
c4c55d4a-e3b9-436c-91f4-66b76cefe55c	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	Hydraulic Cylinder Seal Kit 65mm	1	pcs	3280	3280	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-19 12:55:08.309
eda2b694-daeb-4d61-b5d9-963fbd44caa8	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	Contactor 3-Phase 40A 24V Coil	2	pcs	720	720	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-17 12:57:11.765
9ab0bce1-7178-46d7-a45c-2935279b2dbd	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1280	1280	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-16 12:59:15.221
50a03a18-1afa-4ab3-bdeb-5e9435589356	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	Contactor 3-Phase 40A 24V Coil	2	pcs	2000	2000	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-01 13:01:18.677
e049eaae-c0b6-40b0-aa8d-a474a98f3bc6	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	Hydraulic Cylinder Seal Kit 65mm	1	pcs	3800	3800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-16 13:03:22.133
822f40bd-0987-410b-9ed2-0798672d6d50	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	Contactor 3-Phase 40A 24V Coil	2	pcs	960	960	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-13 13:05:25.589
b0a15d30-f8ba-45dd-b736-830936ef843a	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1520	1520	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-10 13:07:29.045
e6c949d0-7eff-4db9-8dfa-39387db7f378	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	Contactor 3-Phase 40A 24V Coil	2	pcs	1680	1680	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-03 13:09:32.501
f528c818-6616-4145-bb45-c40fa3a6a1c9	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	Hydraulic Cylinder Seal Kit 65mm	1	pcs	4400	4400	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-03 13:11:35.957
95aa69fd-49a3-441e-b66e-59a9f84317f1	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	Contactor 3-Phase 40A 24V Coil	2	pcs	3120	3120	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-20 13:13:39.413
bc422142-f449-4fd0-8d7f-3e44a7ba5d15	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1400	1400	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-18 13:15:42.869
df416485-2113-45ab-b9a4-ea988ae4b44e	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	Contactor 3-Phase 40A 24V Coil	2	pcs	5800	5800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-03 13:17:46.325
2acd71d4-bfc4-45ab-aa72-7fd066efe6da	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	Hydraulic Cylinder Seal Kit 65mm	1	pcs	640	640	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-11 12:19:49.781
95713a3b-3a1d-49ac-a975-96f53151de80	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	Contactor 3-Phase 40A 24V Coil	2	pcs	2600	2600	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-01 12:21:53.237
54fa95ca-e813-43a7-8982-f8a535ed0b96	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	Hydraulic Cylinder Seal Kit 65mm	1	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-12 12:23:56.693
c0292306-97b7-4f26-a7a1-77618f2153b0	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	Contactor 3-Phase 40A 24V Coil	2	pcs	3280	3280	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-09 12:26:00.149
dc1db280-5180-43b0-b9dc-b00ad8888ebf	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	Hydraulic Cylinder Seal Kit 65mm	1	pcs	720	720	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-07 12:28:03.605
84effda1-e86d-48c3-ab4a-2cec3a5bcb98	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	Contactor 3-Phase 40A 24V Coil	2	pcs	1280	1280	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-14 12:30:07.061
d01fe4b6-347c-497f-bc84-a9fcf8649468	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	Proximity Sensor PNP NC	1	pcs	1800	1800	be9a0dd8-f525-403b-8c54-45d7f34a7570	2026-09-23 07:49:05.893
\.


--
-- Data for Name: maintenance_request_status_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request_status_histories (id, "tenantId", "requestId", "fromStatus", "toStatus", "changedById", remarks, "createdAt") FROM stdin;
f026fc8e-96e1-4575-8c6c-764dcfc432ec	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request raised.	2026-09-20 13:52:46.789
be95504b-2f75-4c13-a21f-0f8fa1052c67	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved by Branch Manager.	2026-09-20 14:52:46.789
57da1323-a82c-463f-8994-41f82a659045	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Senior Electrical Technician.	2026-09-20 15:52:46.789
8c5e41ae-6919-4430-b3bc-df2f3cf2134f	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Parts isolated. Waiting on 32A replacement contactor.	2026-09-20 16:52:46.789
da2988cf-4bd2-4ce1-b32e-37a9e121ee74	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 06:53:41.634
4c087221-02d1-4de5-b9da-4c164f9ef37e	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved by Branch Approver	2026-09-23 06:53:41.652
50b63a63-42b4-4694-afc2-f53818da4994	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Inspect immediately	2026-09-23 06:53:41.667
8052e05b-e233-4f95-87eb-af8ff72c11e5	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Dismantling safety sensor	2026-09-23 06:53:41.68
bccf03a0-12ed-4a6d-ba53-8fc287b183fe	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Installed and calibrated. All tests passed.	2026-09-23 06:53:41.697
17a4c378-0960-4d52-bd43-5d8550e84cd0	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	COMPLETED	REOPENED	6b6d957f-362e-446f-9c61-375c17bd6201	Dissatisfied task reopened. Reason: Safety buzzer volume low. Notes: None	2026-09-23 06:53:41.707
8604edef-1786-4f4e-b140-fb60d535c98b	2e310667-1c46-4818-ac37-379d159a30f7	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	REOPENED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Buzzer volume adjusted. Verified!	2026-09-23 06:53:41.719
c6c02913-4d07-4be3-a6e7-4769926f9eaf	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 07:03:51.374
3203538d-3792-43c1-90e6-60d4c51d3cb9	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved by Branch Approver	2026-09-23 07:03:51.392
98b9c7b9-6418-4541-95c5-a5da9f62b5b0	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Inspect immediately	2026-09-23 07:03:51.408
bdc87099-b172-47c5-9d4c-4f06068b87a4	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Dismantling safety sensor	2026-09-23 07:03:51.422
e7a9552b-3614-41e3-a694-6cb2ca328d95	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Installed and calibrated. All tests passed.	2026-09-23 07:03:51.44
fe716260-cfe9-448a-97f6-539443bcfc70	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	COMPLETED	REOPENED	6b6d957f-362e-446f-9c61-375c17bd6201	Dissatisfied task reopened. Reason: Safety buzzer volume low. Notes: None	2026-09-23 07:03:51.451
a1263f52-7081-455c-b6b8-a875a556ff54	2e310667-1c46-4818-ac37-379d159a30f7	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	REOPENED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Buzzer volume adjusted. Verified!	2026-09-23 07:03:51.461
4b9e6c2f-f535-4b3a-a25b-c7757f110bb5	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 07:05:13.72
56043057-ca35-4e3c-ac6f-5f259f2ae3cb	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved by Branch Approver	2026-09-23 07:05:13.739
7787a609-a5b7-422f-bfe4-4c0565b637e7	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Inspect immediately	2026-09-23 07:05:13.754
1662bd56-53cb-4517-9b87-3f9b7e4168bb	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Dismantling safety sensor	2026-09-23 07:05:13.768
897cade8-447e-4c54-ac6c-aea0cab27fbc	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Installed and calibrated. All tests passed.	2026-09-23 07:05:13.787
39f5021d-b956-4f00-9961-7bef1717bde2	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	COMPLETED	REOPENED	6b6d957f-362e-446f-9c61-375c17bd6201	Dissatisfied task reopened. Reason: Safety buzzer volume low. Notes: None	2026-09-23 07:05:13.796
d4476831-2239-4f4a-b7eb-d2b55f36c86b	2e310667-1c46-4818-ac37-379d159a30f7	51656f67-115a-4ebf-85b8-2a6ea0d256e2	REOPENED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Buzzer volume adjusted. Verified!	2026-09-23 07:05:13.808
8550df6e-0ee4-4a23-af05-a3cb3ace6690	2e310667-1c46-4818-ac37-379d159a30f7	f531ef35-5426-44e3-b01d-390593385c04	\N	WAITING_FOR_APPROVAL	79604a14-4a74-4c65-a925-5f8e953ec609	Request created and submitted for approval.	2026-09-23 07:16:27.213
2238d95c-342c-4195-afa4-efff38b8f7a2	2e310667-1c46-4818-ac37-379d159a30f7	41513dbf-520f-400b-851b-68f02a1ea7d0	\N	WAITING_FOR_APPROVAL	79604a14-4a74-4c65-a925-5f8e953ec609	Request created and submitted for approval.	2026-09-23 07:16:42.296
16515d2b-43a1-420f-9e63-d7f5c5642d3f	2e310667-1c46-4818-ac37-379d159a30f7	28ef519c-464c-450c-89a7-247c44bf50e0	\N	WAITING_FOR_APPROVAL	79604a14-4a74-4c65-a925-5f8e953ec609	Request created and submitted for approval.	2026-09-23 07:16:58.296
ba6698b4-d6d2-4815-b013-2adfe5ea3dd7	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 07:37:27.396
fc1ddef8-b623-4361-a754-b26906c0816c	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved by Branch Approver	2026-09-23 07:37:27.416
da4b741b-4aeb-4033-875c-0b17f6481035	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Inspect immediately	2026-09-23 07:37:27.433
c6012217-9485-42e7-8f22-2acf009fe7ca	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Dismantling safety sensor	2026-09-23 07:37:27.446
f19a028d-b3e2-485b-b8c5-55931c893b21	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Installed and calibrated. All tests passed.	2026-09-23 07:37:27.465
6a1b176f-134e-4693-a513-93a049fefdfe	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	COMPLETED	REOPENED	6b6d957f-362e-446f-9c61-375c17bd6201	Dissatisfied task reopened. Reason: Safety buzzer volume low. Notes: None	2026-09-23 07:37:27.475
a064a034-3ad4-409f-8f6c-5fd5567b9a71	2e310667-1c46-4818-ac37-379d159a30f7	6413283e-3cb0-4b1c-bfb8-d557856cef31	REOPENED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Buzzer volume adjusted. Verified!	2026-09-23 07:37:27.487
ff833610-a1a8-458a-acd7-e01ab99d40ed	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	\N	WAITING_FOR_APPROVAL	79604a14-4a74-4c65-a925-5f8e953ec609	Request created and submitted for approval.	2026-09-23 07:42:12.79
8d08f48c-4a7b-45e4-b404-4f4e5ce63178	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	WAITING_FOR_APPROVAL	APPROVED	79604a14-4a74-4c65-a925-5f8e953ec609	we'll send you at EOD	2026-09-23 07:43:19.912
4c09e82d-90a2-471f-bb88-6cbf1e35d014	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	APPROVED	ASSIGNED	79604a14-4a74-4c65-a925-5f8e953ec609	Assigned to Ramesh Pawar.	2026-09-23 07:43:46.392
74b26c92-7704-4b6e-9e95-6b3bcd970a6f	2e310667-1c46-4818-ac37-379d159a30f7	dab2909e-bdfa-4485-b784-18f4008a5843	ASSIGNED	WAITING_FOR_PURCHASE	79604a14-4a74-4c65-a925-5f8e953ec609	Status updated to WAITING_FOR_PURCHASE	2026-09-23 07:43:58.171
51790311-adef-4b6d-8d9a-9a59d28d2936	2e310667-1c46-4818-ac37-379d159a30f7	882448d3-94df-4df9-bcc3-1181fbf83325	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-08-31 07:48:45.653
925ccc8b-8f58-4775-b105-b39718ae144a	2e310667-1c46-4818-ac37-379d159a30f7	2e0e0cad-3604-4a94-bd9e-35a4a3f9b98f	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-20 07:50:49.109
fdcad39c-881d-43aa-a5fb-94f93a398b50	2e310667-1c46-4818-ac37-379d159a30f7	64c7b9e9-6fd3-4754-9140-f1e0ba886948	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-02 07:52:52.565
00033a69-a39f-4926-a536-c9237fe3aa8c	2e310667-1c46-4818-ac37-379d159a30f7	de7c30f1-ec69-483d-ba6c-359f6161eb2b	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 07:54:56.021
a613941a-1a5c-4422-82b9-248c548ed9ea	2e310667-1c46-4818-ac37-379d159a30f7	c607ba1d-a287-4251-9623-012a8c5b3af8	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 07:56:59.477
619c3386-2bf4-4c91-8f39-e0fd37446a3f	2e310667-1c46-4818-ac37-379d159a30f7	c2d05477-a809-4a22-af50-7517f84d61a4	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 07:59:02.933
32f01504-10b2-4303-b487-aceb42c02e06	2e310667-1c46-4818-ac37-379d159a30f7	833695c9-3f1a-4fbc-99ab-c233b3e1b6b2	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:01:06.389
60327a27-3e9d-42c4-b27c-a1349c0b97ae	2e310667-1c46-4818-ac37-379d159a30f7	d5ca95c5-7e35-4c80-b673-36b5eea47ddf	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 08:03:09.845
0f6a8ed4-bdf2-4d19-86e8-c9a7d451dc2f	2e310667-1c46-4818-ac37-379d159a30f7	80c09d2e-5c24-49a3-9ae9-cede9acda39c	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-08 08:05:13.301
f3ab2cfb-a396-4449-9667-86912ecc9cec	2e310667-1c46-4818-ac37-379d159a30f7	83cbe196-bc01-4581-b2fa-163a65dcb8d7	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-10 08:07:16.757
2901416d-5dac-4b5d-ae5c-d987e00844c3	2e310667-1c46-4818-ac37-379d159a30f7	55bfb048-a97a-4eee-84e6-7fcc6cbd499d	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-18 08:09:20.213
27d0bcd7-1e6b-4063-990c-a1262b21efd8	2e310667-1c46-4818-ac37-379d159a30f7	27a61a4b-cd9b-40c8-9d51-21458c070110	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:11:23.669
bdcf5211-22c2-419c-8ca0-61ff5c5f457c	2e310667-1c46-4818-ac37-379d159a30f7	97584eaa-ede9-4c1b-80be-b7ac1d4eada7	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-20 08:13:27.125
c369d958-ab9e-4e94-81fb-e684f5250fd8	2e310667-1c46-4818-ac37-379d159a30f7	97584eaa-ede9-4c1b-80be-b7ac1d4eada7	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-20 10:13:27.125
7b806923-a788-4348-89ca-00607425cfe9	2e310667-1c46-4818-ac37-379d159a30f7	243ed821-21df-4eca-a30b-9658db7e7987	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-08-30 08:15:30.581
284d52a7-ebc6-497b-add8-22374dd7405a	2e310667-1c46-4818-ac37-379d159a30f7	243ed821-21df-4eca-a30b-9658db7e7987	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-08-30 10:15:30.581
8ef66777-5065-4cf0-b345-5258b8737550	2e310667-1c46-4818-ac37-379d159a30f7	8cc086bf-dc97-4a2f-9fb9-0e18f0ae73a1	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-17 08:17:34.037
87703c75-1b13-4952-bfc1-ae71bb120ec2	2e310667-1c46-4818-ac37-379d159a30f7	8cc086bf-dc97-4a2f-9fb9-0e18f0ae73a1	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-17 10:17:34.037
b207bea5-39dc-4950-9a31-7ef631fd723e	2e310667-1c46-4818-ac37-379d159a30f7	37c0759c-d9b3-4e73-97f5-3dc512b3aa90	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-07 08:19:37.493
1105daad-9382-40a8-8067-f244072e4d2a	2e310667-1c46-4818-ac37-379d159a30f7	37c0759c-d9b3-4e73-97f5-3dc512b3aa90	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-07 10:19:37.493
e379ed27-f867-4991-b383-3e61aca8b2c6	2e310667-1c46-4818-ac37-379d159a30f7	910ece14-e6dd-4108-b0fe-22e11540a423	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-17 08:21:40.949
83bdb04a-484c-49b4-9541-521eddb02209	2e310667-1c46-4818-ac37-379d159a30f7	910ece14-e6dd-4108-b0fe-22e11540a423	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-17 10:21:40.949
6f928c93-37db-4281-a6a5-31a45826f282	2e310667-1c46-4818-ac37-379d159a30f7	df744de5-8240-49bf-b0f9-ea3daf5bfc06	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:23:44.405
dc1a9ad6-8327-4632-a3b0-e2060790dfae	2e310667-1c46-4818-ac37-379d159a30f7	df744de5-8240-49bf-b0f9-ea3daf5bfc06	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:23:44.405
d0b651f3-4740-4c00-88d2-40da170554d2	2e310667-1c46-4818-ac37-379d159a30f7	75bc0d75-eedd-4f16-8e13-e7a1dfe79d88	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-05 08:25:47.861
d3a292e5-31fd-4a46-95b3-83852a471c3a	2e310667-1c46-4818-ac37-379d159a30f7	75bc0d75-eedd-4f16-8e13-e7a1dfe79d88	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-05 10:25:47.861
5ec2d300-88d7-447e-bb68-45bfa227cdf5	2e310667-1c46-4818-ac37-379d159a30f7	7f741e90-4f7f-4c93-8c42-36d4ba29971a	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-17 08:27:51.317
77983661-9132-4793-8275-1d7440f57fc8	2e310667-1c46-4818-ac37-379d159a30f7	7f741e90-4f7f-4c93-8c42-36d4ba29971a	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-17 10:27:51.317
1b07aaca-c3c7-4897-aa5c-d7b2d3607f7c	2e310667-1c46-4818-ac37-379d159a30f7	e323ba8e-fb9b-48ac-852f-870dd17ce8b5	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-04 08:29:54.773
d0810846-244a-4616-8720-20c589be44c5	2e310667-1c46-4818-ac37-379d159a30f7	e323ba8e-fb9b-48ac-852f-870dd17ce8b5	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-04 10:29:54.773
6b75b8c1-434e-45a6-9782-306a4e77d3b5	2e310667-1c46-4818-ac37-379d159a30f7	ebc460f7-17c1-473d-9f58-808bf980e1c4	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-18 08:31:58.229
3d2e3b35-af28-4c08-9986-766bb84a6d21	2e310667-1c46-4818-ac37-379d159a30f7	ebc460f7-17c1-473d-9f58-808bf980e1c4	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-18 10:31:58.229
5ea576b4-0c05-4877-b63f-109f8ae18f15	2e310667-1c46-4818-ac37-379d159a30f7	fd4c21ee-c7e6-4b7d-8c93-713dbb49e9ae	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:34:01.685
41bd9256-b1da-4e62-916a-92599897154a	2e310667-1c46-4818-ac37-379d159a30f7	fd4c21ee-c7e6-4b7d-8c93-713dbb49e9ae	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:34:01.685
673032c7-ff08-4a3f-a0c5-7c9f4773213c	2e310667-1c46-4818-ac37-379d159a30f7	fd4c21ee-c7e6-4b7d-8c93-713dbb49e9ae	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 12:04:01.685
60b1f798-11c5-4858-bfa2-062fdb3b345a	2e310667-1c46-4818-ac37-379d159a30f7	84b7c1dc-00f5-4f1a-b5b0-59b50d5cb381	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-12 08:36:05.141
d16ffc7c-31a9-4857-aa0c-5575ea27337b	2e310667-1c46-4818-ac37-379d159a30f7	84b7c1dc-00f5-4f1a-b5b0-59b50d5cb381	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-12 10:36:05.141
e168a4ef-80b9-4dc6-8190-95d7dcc8d97c	2e310667-1c46-4818-ac37-379d159a30f7	84b7c1dc-00f5-4f1a-b5b0-59b50d5cb381	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-12 12:06:05.141
af3ed197-decf-4487-88b9-1f0385dc4731	2e310667-1c46-4818-ac37-379d159a30f7	4d0c47cb-7702-4803-a302-ab121ba0db42	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-20 08:38:08.597
1f205862-3e1a-4fdb-9abc-fd2c4d8ec3ec	2e310667-1c46-4818-ac37-379d159a30f7	4d0c47cb-7702-4803-a302-ab121ba0db42	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-20 10:38:08.597
bb405c43-94d7-4b43-81f7-fe16c6c498e9	2e310667-1c46-4818-ac37-379d159a30f7	4d0c47cb-7702-4803-a302-ab121ba0db42	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-20 12:08:08.597
ecbffc63-2c7b-4000-aef1-c285767592d9	2e310667-1c46-4818-ac37-379d159a30f7	4e064602-d295-479f-b719-477ff80b22be	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-12 08:40:12.053
cac4b452-78fb-44b3-b764-33234def17e9	2e310667-1c46-4818-ac37-379d159a30f7	4e064602-d295-479f-b719-477ff80b22be	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-12 10:40:12.053
c07d8660-9172-45f9-a229-5a55705ecbe9	2e310667-1c46-4818-ac37-379d159a30f7	4e064602-d295-479f-b719-477ff80b22be	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-12 12:10:12.053
918bcf9a-d234-4edd-adb5-8f3baf735ec5	2e310667-1c46-4818-ac37-379d159a30f7	8ffc3841-5441-4130-8178-3f46f7a40f6e	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:42:15.509
5d6db9b8-2d80-4d51-8106-2ddb8e870aff	2e310667-1c46-4818-ac37-379d159a30f7	8ffc3841-5441-4130-8178-3f46f7a40f6e	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:42:15.509
76285d5b-36ba-4535-9aee-6337ac9fbe78	2e310667-1c46-4818-ac37-379d159a30f7	8ffc3841-5441-4130-8178-3f46f7a40f6e	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 12:12:15.509
60364e57-2103-4d5b-afb2-3c70c4d0cadf	2e310667-1c46-4818-ac37-379d159a30f7	6a31a101-5bad-4e53-8158-721e00bd85ff	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-15 08:44:18.965
5ade9d84-4494-490a-93d5-7704ba45397d	2e310667-1c46-4818-ac37-379d159a30f7	6a31a101-5bad-4e53-8158-721e00bd85ff	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-15 10:44:18.965
ba4fd6a2-4095-44d3-abe6-d807c7b8d227	2e310667-1c46-4818-ac37-379d159a30f7	6a31a101-5bad-4e53-8158-721e00bd85ff	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-15 12:14:18.965
69f5fc68-31df-447e-867f-10f6c69776b8	2e310667-1c46-4818-ac37-379d159a30f7	1790fc3f-a48a-4203-b74f-e63df64b02a0	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-08 08:46:22.421
f9b10cda-a67a-42a0-8bc3-eb7ff55339e0	2e310667-1c46-4818-ac37-379d159a30f7	1790fc3f-a48a-4203-b74f-e63df64b02a0	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-08 10:46:22.421
48fca64a-aff8-42d8-8e9c-d6075677238c	2e310667-1c46-4818-ac37-379d159a30f7	1790fc3f-a48a-4203-b74f-e63df64b02a0	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-08 12:16:22.421
fb1160f9-799b-4a14-8779-ae219fef852a	2e310667-1c46-4818-ac37-379d159a30f7	e9048dad-433f-4c01-adbf-d01a543adfed	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-11 08:48:25.877
daa1f9b5-c9a2-467e-872a-020bdc7f9845	2e310667-1c46-4818-ac37-379d159a30f7	e9048dad-433f-4c01-adbf-d01a543adfed	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-11 10:48:25.877
276e2053-7f41-4156-bdef-4c4b14681e71	2e310667-1c46-4818-ac37-379d159a30f7	e9048dad-433f-4c01-adbf-d01a543adfed	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-11 12:18:25.877
149b4cb0-98a8-4ac9-9c85-6f4ddc2fbd9c	2e310667-1c46-4818-ac37-379d159a30f7	73c15eb2-90b6-40b9-b70e-aa8805e03bc9	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 07:50:29.333
4c783d47-ea5c-45c6-bfd0-1cf488d0e81b	2e310667-1c46-4818-ac37-379d159a30f7	73c15eb2-90b6-40b9-b70e-aa8805e03bc9	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-03 09:50:29.333
4c3c324d-d5fe-4d65-8030-ed880129290f	2e310667-1c46-4818-ac37-379d159a30f7	73c15eb2-90b6-40b9-b70e-aa8805e03bc9	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-03 11:20:29.333
a1d1e399-81f8-457b-abaa-df82ff40cc75	2e310667-1c46-4818-ac37-379d159a30f7	f47106c9-30ff-4e5d-a59d-53979374be82	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-15 07:52:32.789
a1c8c5ee-8b8e-4161-98aa-2c846d39adda	2e310667-1c46-4818-ac37-379d159a30f7	f47106c9-30ff-4e5d-a59d-53979374be82	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-15 09:52:32.789
b63d9c62-4f5b-41e4-b5e0-70d5a1f38412	2e310667-1c46-4818-ac37-379d159a30f7	f47106c9-30ff-4e5d-a59d-53979374be82	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-15 11:22:32.789
22a5dda2-94ef-47ab-be2a-ce86c8991f8b	2e310667-1c46-4818-ac37-379d159a30f7	de1ff722-784e-405e-bbdb-2a6a2de37825	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 07:54:36.245
f694db87-94f5-491f-a72d-a0bc4a433ffb	2e310667-1c46-4818-ac37-379d159a30f7	de1ff722-784e-405e-bbdb-2a6a2de37825	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 09:54:36.245
3253ff62-45a0-4041-b655-44c7e6abaf03	2e310667-1c46-4818-ac37-379d159a30f7	de1ff722-784e-405e-bbdb-2a6a2de37825	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 11:24:36.245
5ee515c9-6f96-4d59-98ad-57cba1bc6191	2e310667-1c46-4818-ac37-379d159a30f7	4cd4e1bc-7839-4cc7-b50e-1c093ccb9a51	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-08-31 07:56:39.701
75b926d4-0560-4dc3-8648-fd236981b3a3	2e310667-1c46-4818-ac37-379d159a30f7	4cd4e1bc-7839-4cc7-b50e-1c093ccb9a51	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-08-31 09:56:39.701
e7033714-8e07-4391-9bfb-a5d41184b5d0	2e310667-1c46-4818-ac37-379d159a30f7	4cd4e1bc-7839-4cc7-b50e-1c093ccb9a51	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-08-31 11:26:39.701
64f03d8f-1722-4d8b-b2d9-38f4bb38401d	2e310667-1c46-4818-ac37-379d159a30f7	5c535968-0658-4eff-9330-6941b14bdcbd	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-14 07:58:43.157
3e1f1366-22b3-49bf-b10b-65be9d44057c	2e310667-1c46-4818-ac37-379d159a30f7	5c535968-0658-4eff-9330-6941b14bdcbd	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-14 09:58:43.157
576af8e5-c566-4e1a-880e-304db81673fa	2e310667-1c46-4818-ac37-379d159a30f7	5c535968-0658-4eff-9330-6941b14bdcbd	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-14 11:28:43.157
5697b7b3-582e-4b7a-89fa-6131bf46da3d	2e310667-1c46-4818-ac37-379d159a30f7	49b69ec1-f5b9-4053-91c8-5419c33d12b0	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-11 08:00:46.613
410731f0-818d-4930-8b7a-789b1209ff7d	2e310667-1c46-4818-ac37-379d159a30f7	49b69ec1-f5b9-4053-91c8-5419c33d12b0	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-11 10:00:46.613
b1796bdd-ea46-4ca1-9422-76384e9a2571	2e310667-1c46-4818-ac37-379d159a30f7	49b69ec1-f5b9-4053-91c8-5419c33d12b0	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-11 11:30:46.613
87ff6d60-d3b6-4400-82fd-e97e58eed8e8	2e310667-1c46-4818-ac37-379d159a30f7	5fc257a2-5650-41eb-947a-62c19c0a118a	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-17 08:02:50.069
95a59b73-45e8-445f-b5e7-092e2f8f4993	2e310667-1c46-4818-ac37-379d159a30f7	5fc257a2-5650-41eb-947a-62c19c0a118a	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-17 10:02:50.069
535e95c7-25bb-4377-9729-343aec0be440	2e310667-1c46-4818-ac37-379d159a30f7	5fc257a2-5650-41eb-947a-62c19c0a118a	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-17 11:32:50.069
95a1f717-ce35-4df4-aa30-d3e51296dcd6	2e310667-1c46-4818-ac37-379d159a30f7	03e99ff3-29af-46de-ac1a-bd7aed8a5bee	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-17 08:04:53.525
f747a121-1cb6-478d-8390-87c3f85c3e96	2e310667-1c46-4818-ac37-379d159a30f7	03e99ff3-29af-46de-ac1a-bd7aed8a5bee	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-17 10:04:53.525
ffa2579f-a49f-4af8-819e-9bc257bc19c2	2e310667-1c46-4818-ac37-379d159a30f7	03e99ff3-29af-46de-ac1a-bd7aed8a5bee	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-17 11:34:53.525
a2047eb9-7595-47fe-a3b6-4310230e822b	2e310667-1c46-4818-ac37-379d159a30f7	03e99ff3-29af-46de-ac1a-bd7aed8a5bee	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-17 12:34:53.525
3acdbeae-7249-4abd-be40-8ef2884a9aa7	2e310667-1c46-4818-ac37-379d159a30f7	7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-09 08:06:56.981
223c8405-0ea4-499c-a44a-408d7bc068bd	2e310667-1c46-4818-ac37-379d159a30f7	7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-09 10:06:56.981
0813cdd3-82eb-4ee0-a5c7-d4e61e51806d	2e310667-1c46-4818-ac37-379d159a30f7	7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-09 11:36:56.981
e2eac147-ac74-4f29-970b-929d1a7217a3	2e310667-1c46-4818-ac37-379d159a30f7	7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-09 12:36:56.981
9f448395-ccbb-401c-83cf-95de50ad1ab6	2e310667-1c46-4818-ac37-379d159a30f7	5bd03715-3e1a-4407-8c94-1b26a032933b	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 08:09:00.437
198876fc-d091-4295-900f-65a18441fea9	2e310667-1c46-4818-ac37-379d159a30f7	5bd03715-3e1a-4407-8c94-1b26a032933b	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-03 10:09:00.437
85e9d344-d6b7-438b-b398-862adb9e347f	2e310667-1c46-4818-ac37-379d159a30f7	5bd03715-3e1a-4407-8c94-1b26a032933b	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-03 11:39:00.437
e220ab27-e1da-4e19-980f-8f332af1ab1b	2e310667-1c46-4818-ac37-379d159a30f7	5bd03715-3e1a-4407-8c94-1b26a032933b	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-03 12:39:00.437
143c12e5-3121-47a6-93ee-7913b43b0dd0	2e310667-1c46-4818-ac37-379d159a30f7	b32d65fc-538d-49ca-be9d-129ad29b74ab	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-02 08:11:03.893
64f31002-833e-4114-8b70-ea0dddd2062a	2e310667-1c46-4818-ac37-379d159a30f7	b32d65fc-538d-49ca-be9d-129ad29b74ab	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-02 10:11:03.893
a14cea0f-0285-4c1f-9647-2ee33f492b59	2e310667-1c46-4818-ac37-379d159a30f7	b32d65fc-538d-49ca-be9d-129ad29b74ab	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-02 11:41:03.893
265df624-6b14-4a33-b338-62d4e571e7e8	2e310667-1c46-4818-ac37-379d159a30f7	b32d65fc-538d-49ca-be9d-129ad29b74ab	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-02 12:41:03.893
686a00a9-de4f-409f-837a-b9aa3831863d	2e310667-1c46-4818-ac37-379d159a30f7	fcbaeb3e-6bad-4309-8e7d-44c23d388261	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:13:07.349
201bc122-5535-4e77-a12f-8a842e1ceac8	2e310667-1c46-4818-ac37-379d159a30f7	fcbaeb3e-6bad-4309-8e7d-44c23d388261	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-19 10:13:07.349
a4e10aa0-6069-4e41-904b-f62d863741c0	2e310667-1c46-4818-ac37-379d159a30f7	fcbaeb3e-6bad-4309-8e7d-44c23d388261	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-19 11:43:07.349
3922e42c-882e-47c5-b19f-138bcdfba871	2e310667-1c46-4818-ac37-379d159a30f7	fcbaeb3e-6bad-4309-8e7d-44c23d388261	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-19 12:43:07.349
0fe2758b-015c-4c98-8534-a9a05b29368e	2e310667-1c46-4818-ac37-379d159a30f7	a03758bf-48bd-425e-9d72-0a456384cf18	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-20 08:15:10.805
5170831d-8e18-4f01-8d55-ced9b2a2bdec	2e310667-1c46-4818-ac37-379d159a30f7	a03758bf-48bd-425e-9d72-0a456384cf18	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-20 10:15:10.805
d9d3584c-2a42-4146-9eb1-ead0efb1e38b	2e310667-1c46-4818-ac37-379d159a30f7	a03758bf-48bd-425e-9d72-0a456384cf18	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-20 11:45:10.805
f6fb9057-1f61-4d99-ac2f-407149a815dd	2e310667-1c46-4818-ac37-379d159a30f7	a03758bf-48bd-425e-9d72-0a456384cf18	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-20 12:45:10.805
7c94ed28-749d-4f0f-9be8-a292b2225365	2e310667-1c46-4818-ac37-379d159a30f7	60d1386d-d792-4580-9a15-64888c1d1da5	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-08 08:17:14.261
69ab87e9-84c1-47d2-9231-8c53a1ecf268	2e310667-1c46-4818-ac37-379d159a30f7	60d1386d-d792-4580-9a15-64888c1d1da5	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-08 10:17:14.261
60b16293-e33f-4550-a191-f930b8f70358	2e310667-1c46-4818-ac37-379d159a30f7	60d1386d-d792-4580-9a15-64888c1d1da5	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-08 11:47:14.261
55427239-0b06-4369-8df3-4ad4158d4c1c	2e310667-1c46-4818-ac37-379d159a30f7	60d1386d-d792-4580-9a15-64888c1d1da5	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-08 12:47:14.261
1d1b051a-8508-4bf7-a869-5408c673431a	2e310667-1c46-4818-ac37-379d159a30f7	ad0981d4-d720-4479-a90d-4a717bfbfa99	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-06 08:19:17.717
fa34b942-a940-4e09-b352-43f5320349df	2e310667-1c46-4818-ac37-379d159a30f7	ad0981d4-d720-4479-a90d-4a717bfbfa99	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-06 10:19:17.717
e8257c2d-07ae-449a-ade3-aae94e4fbcdd	2e310667-1c46-4818-ac37-379d159a30f7	ad0981d4-d720-4479-a90d-4a717bfbfa99	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-06 11:49:17.717
42fbfd42-d72f-439c-abc1-5a68b90b24a6	2e310667-1c46-4818-ac37-379d159a30f7	ad0981d4-d720-4479-a90d-4a717bfbfa99	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-06 12:49:17.717
d33e71ce-f9da-4ae8-9bc3-97da569337ea	2e310667-1c46-4818-ac37-379d159a30f7	fe91c5e8-8181-49dc-b665-d8cd25aac83e	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:21:21.173
52c17ae0-fbe4-4b54-84ed-e8ceea553f82	2e310667-1c46-4818-ac37-379d159a30f7	fe91c5e8-8181-49dc-b665-d8cd25aac83e	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-19 10:21:21.173
63888ba7-cb23-49b3-befb-04c6b6cc6be4	2e310667-1c46-4818-ac37-379d159a30f7	fe91c5e8-8181-49dc-b665-d8cd25aac83e	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-19 11:51:21.173
e6857cb7-6549-49ef-a126-19bc6dbe7e85	2e310667-1c46-4818-ac37-379d159a30f7	fe91c5e8-8181-49dc-b665-d8cd25aac83e	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-19 12:51:21.173
b182d89b-664e-4765-bb66-b8698276f289	2e310667-1c46-4818-ac37-379d159a30f7	0d8c4f0a-a810-412e-a69c-e0b615ac7682	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-05 08:23:24.629
affbf0ba-3350-40a9-8ca9-5576496879c5	2e310667-1c46-4818-ac37-379d159a30f7	0d8c4f0a-a810-412e-a69c-e0b615ac7682	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-05 10:23:24.629
29fdb7d7-9c8c-44dd-a970-59f6c3835a7b	2e310667-1c46-4818-ac37-379d159a30f7	0d8c4f0a-a810-412e-a69c-e0b615ac7682	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-05 11:53:24.629
a69ed0a7-f443-4720-8756-c8320a0cb1d8	2e310667-1c46-4818-ac37-379d159a30f7	0d8c4f0a-a810-412e-a69c-e0b615ac7682	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-05 12:53:24.629
eec37774-8c4b-435f-b9ec-a33aafda62f3	2e310667-1c46-4818-ac37-379d159a30f7	9c20c2d8-6691-48ed-af25-a45d7e37a657	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-02 08:25:28.085
b8b54d10-2a55-4122-972d-bd34f386bb59	2e310667-1c46-4818-ac37-379d159a30f7	9c20c2d8-6691-48ed-af25-a45d7e37a657	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-02 10:25:28.085
7ec4e871-5eeb-4650-b7b1-17d790d97dfc	2e310667-1c46-4818-ac37-379d159a30f7	9c20c2d8-6691-48ed-af25-a45d7e37a657	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-02 11:55:28.085
1063d46b-561e-4b05-9f52-70789885ac28	2e310667-1c46-4818-ac37-379d159a30f7	9c20c2d8-6691-48ed-af25-a45d7e37a657	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-02 12:55:28.085
32f53af5-26e2-41c9-bfaa-41b020ca98e7	2e310667-1c46-4818-ac37-379d159a30f7	0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-10 08:27:31.541
8dcb44f0-3a28-49a1-bfa2-ec5a74df194e	2e310667-1c46-4818-ac37-379d159a30f7	0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-10 10:27:31.541
f73fab69-b77f-4b64-807c-3ad742a53f22	2e310667-1c46-4818-ac37-379d159a30f7	0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-10 11:57:31.541
fa68f47c-2d85-4196-baf4-bb20bd58c067	2e310667-1c46-4818-ac37-379d159a30f7	0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-10 12:57:31.541
1367f049-2688-44cb-b459-294a8dcb339e	2e310667-1c46-4818-ac37-379d159a30f7	c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-06 08:29:34.997
a7384409-9a94-446b-b1aa-db70e8ceaa94	2e310667-1c46-4818-ac37-379d159a30f7	c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-06 10:29:34.997
14d53459-52fb-4a25-a33a-0c7fa6ad3c8a	2e310667-1c46-4818-ac37-379d159a30f7	c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-06 11:59:34.997
9ac73a23-0f54-4d89-831f-93a4f195e39b	2e310667-1c46-4818-ac37-379d159a30f7	c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-06 12:59:34.997
6281b8c8-ca15-46b8-9b7d-d7e2cc04311a	2e310667-1c46-4818-ac37-379d159a30f7	b6cb63b1-6a66-4183-90d4-e09aed2b5082	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-21 08:31:38.453
a2e237b4-1b26-40c1-bfd7-bf97cdf26cbe	2e310667-1c46-4818-ac37-379d159a30f7	b6cb63b1-6a66-4183-90d4-e09aed2b5082	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-21 10:31:38.453
71ced703-56d8-4e39-8ec8-6c34f16eafd3	2e310667-1c46-4818-ac37-379d159a30f7	b6cb63b1-6a66-4183-90d4-e09aed2b5082	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-21 12:01:38.453
41ac5a24-817d-433c-a709-91e959d0c6bc	2e310667-1c46-4818-ac37-379d159a30f7	b6cb63b1-6a66-4183-90d4-e09aed2b5082	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-21 13:01:38.453
0334524c-43ba-45fe-9bf0-75c9649e0edb	2e310667-1c46-4818-ac37-379d159a30f7	7e9503e3-4e8f-4bc4-95f9-ec1482032333	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:33:41.909
d3eac278-3785-4590-a469-702d01bb7a5f	2e310667-1c46-4818-ac37-379d159a30f7	7e9503e3-4e8f-4bc4-95f9-ec1482032333	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-19 10:33:41.909
7ce3320f-f7d7-412b-ae96-99676c429445	2e310667-1c46-4818-ac37-379d159a30f7	7e9503e3-4e8f-4bc4-95f9-ec1482032333	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-19 12:03:41.909
a80886af-2366-41dd-a080-54d232d0b8ff	2e310667-1c46-4818-ac37-379d159a30f7	7e9503e3-4e8f-4bc4-95f9-ec1482032333	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-19 13:03:41.909
0d1a5d1c-a145-4bea-8dec-e5b9a24edd20	2e310667-1c46-4818-ac37-379d159a30f7	76ae857a-3221-4911-9621-54e23a37d0c2	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-21 08:35:45.365
365f6ebb-0b13-453c-a8e6-abfb9f4644aa	2e310667-1c46-4818-ac37-379d159a30f7	76ae857a-3221-4911-9621-54e23a37d0c2	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-21 10:35:45.365
18b650c7-1aa7-44d8-a350-55528628acc5	2e310667-1c46-4818-ac37-379d159a30f7	76ae857a-3221-4911-9621-54e23a37d0c2	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-21 12:05:45.365
9759bf71-88c0-4401-927a-e1a4b83f55c7	2e310667-1c46-4818-ac37-379d159a30f7	76ae857a-3221-4911-9621-54e23a37d0c2	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-21 13:05:45.365
84c727bc-0f6a-494e-9a20-622525b5f59d	2e310667-1c46-4818-ac37-379d159a30f7	7aa3c28e-696a-4280-9147-539d287188b9	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-11 08:37:48.821
1dc8c436-bc43-4e26-9e76-3d0dca226134	2e310667-1c46-4818-ac37-379d159a30f7	7aa3c28e-696a-4280-9147-539d287188b9	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-11 10:37:48.821
8e5587bc-e715-4c25-a21f-6b9c290359ab	2e310667-1c46-4818-ac37-379d159a30f7	7aa3c28e-696a-4280-9147-539d287188b9	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-11 12:07:48.821
772e4bac-8959-460c-b1c8-185e382401ca	2e310667-1c46-4818-ac37-379d159a30f7	7aa3c28e-696a-4280-9147-539d287188b9	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-11 13:07:48.821
a31284e9-b140-4630-a89b-e30e107e7a97	2e310667-1c46-4818-ac37-379d159a30f7	de3a3406-db8e-4a9a-94a9-d0a523c9aebb	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-12 08:39:52.277
f4436e5d-d2d2-4a4c-9c05-d48b1480b134	2e310667-1c46-4818-ac37-379d159a30f7	de3a3406-db8e-4a9a-94a9-d0a523c9aebb	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-12 10:39:52.277
66b4bee0-0c63-48e2-8a8a-70ee7d4a2f82	2e310667-1c46-4818-ac37-379d159a30f7	de3a3406-db8e-4a9a-94a9-d0a523c9aebb	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-12 12:09:52.277
b98bbe47-4f32-448b-bbd8-32813a511a9e	2e310667-1c46-4818-ac37-379d159a30f7	de3a3406-db8e-4a9a-94a9-d0a523c9aebb	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-12 13:09:52.277
6068e0f3-61f8-4bab-aada-23e4d7fe79b5	2e310667-1c46-4818-ac37-379d159a30f7	d4ad56fd-6b9a-4449-a6cb-309440a65d5c	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-01 08:41:55.733
d3f4b67a-c538-49a1-bb78-b8db53746100	2e310667-1c46-4818-ac37-379d159a30f7	d4ad56fd-6b9a-4449-a6cb-309440a65d5c	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-01 10:41:55.733
c2592713-56ad-41fa-b2e0-9244715fe238	2e310667-1c46-4818-ac37-379d159a30f7	d4ad56fd-6b9a-4449-a6cb-309440a65d5c	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-01 12:11:55.733
fb75ea5a-d6df-4d6f-b36e-cd3bad82383d	2e310667-1c46-4818-ac37-379d159a30f7	d4ad56fd-6b9a-4449-a6cb-309440a65d5c	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-01 13:11:55.733
be2712be-ed86-4b76-a464-687dd7ca95a7	2e310667-1c46-4818-ac37-379d159a30f7	d91ff9ab-ae5b-4ec0-859a-963998d8feb4	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-13 08:43:59.189
76744b8c-3be8-4b3e-b856-6bbc1f95c03a	2e310667-1c46-4818-ac37-379d159a30f7	d91ff9ab-ae5b-4ec0-859a-963998d8feb4	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-13 10:43:59.189
2f8c7266-33c9-42f8-aba7-5a391e026764	2e310667-1c46-4818-ac37-379d159a30f7	d91ff9ab-ae5b-4ec0-859a-963998d8feb4	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-13 12:13:59.189
d083d9f4-bf88-4b00-8fae-f68391babf68	2e310667-1c46-4818-ac37-379d159a30f7	d91ff9ab-ae5b-4ec0-859a-963998d8feb4	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-13 13:13:59.189
8985ec7d-d40a-48df-afb6-8a034fad3d8e	2e310667-1c46-4818-ac37-379d159a30f7	ad7ac685-23e6-4a67-a138-33255e4dd00e	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-22 08:46:02.645
a16e83a8-65d9-41dd-9551-91a52e631283	2e310667-1c46-4818-ac37-379d159a30f7	ad7ac685-23e6-4a67-a138-33255e4dd00e	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-22 10:46:02.645
0c671bc9-ce17-4d01-adcd-bb870eb057e3	2e310667-1c46-4818-ac37-379d159a30f7	ad7ac685-23e6-4a67-a138-33255e4dd00e	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-22 12:16:02.645
ed945534-3015-45be-b34d-8ca6a2da381e	2e310667-1c46-4818-ac37-379d159a30f7	c30d680f-8b2e-4314-9b16-96c1f2452a3f	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:48:06.101
8cd8d58e-095a-4fbc-9c86-adc912b1b66f	2e310667-1c46-4818-ac37-379d159a30f7	c30d680f-8b2e-4314-9b16-96c1f2452a3f	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-19 10:48:06.101
bcb85c75-4b3a-4f36-9230-76dd53d750c7	2e310667-1c46-4818-ac37-379d159a30f7	c30d680f-8b2e-4314-9b16-96c1f2452a3f	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-19 12:18:06.101
057acf09-3a0d-4129-b756-540167aa98ef	2e310667-1c46-4818-ac37-379d159a30f7	3534c52b-b76b-4f16-a8ef-6995ad23153a	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-09 07:50:09.557
84607038-3d2f-4f3c-84bc-08bfcd7cc902	2e310667-1c46-4818-ac37-379d159a30f7	3534c52b-b76b-4f16-a8ef-6995ad23153a	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-09 09:50:09.557
7ffbe39c-13bb-4edb-9f0b-73095ab41728	2e310667-1c46-4818-ac37-379d159a30f7	3534c52b-b76b-4f16-a8ef-6995ad23153a	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-09 11:20:09.557
ef751623-dcf7-4fea-adb9-9107ccff204a	2e310667-1c46-4818-ac37-379d159a30f7	d09f9082-4308-4fb7-b4b2-8b7342bbe655	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-05 07:52:13.013
31b673de-43ea-467c-b39b-e531b7724475	2e310667-1c46-4818-ac37-379d159a30f7	d09f9082-4308-4fb7-b4b2-8b7342bbe655	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-05 09:52:13.013
fe118cd0-5337-49dd-8280-78343b788631	2e310667-1c46-4818-ac37-379d159a30f7	d09f9082-4308-4fb7-b4b2-8b7342bbe655	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-05 11:22:13.013
986337a6-5c09-4ac6-a3f4-9ec617d6a975	2e310667-1c46-4818-ac37-379d159a30f7	14ea07ff-c5cf-40fb-b109-eb8f53085ea7	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-08-29 07:54:16.469
a7d73c4b-3f36-4a56-8064-2477e251e0a5	2e310667-1c46-4818-ac37-379d159a30f7	14ea07ff-c5cf-40fb-b109-eb8f53085ea7	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-08-29 09:54:16.469
66a77fb4-d7cd-4e35-b520-beac5f1f3d92	2e310667-1c46-4818-ac37-379d159a30f7	14ea07ff-c5cf-40fb-b109-eb8f53085ea7	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-08-29 11:24:16.469
84dd6536-7e77-4f8b-9f43-39cb3e993069	2e310667-1c46-4818-ac37-379d159a30f7	c6e2f83f-af02-4fa6-a70f-6dfa74c04b85	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 07:56:19.925
ebd91e29-43e3-4dfa-a57a-5975f882625b	2e310667-1c46-4818-ac37-379d159a30f7	c6e2f83f-af02-4fa6-a70f-6dfa74c04b85	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-19 09:56:19.925
d27ecdbb-9c56-439e-a593-389943fa25b7	2e310667-1c46-4818-ac37-379d159a30f7	c6e2f83f-af02-4fa6-a70f-6dfa74c04b85	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-19 11:26:19.925
b1ff43de-0a0a-4d66-b0fc-0e2b6068a27d	2e310667-1c46-4818-ac37-379d159a30f7	bc2c4645-efb4-47e3-902e-76d34d7a9d12	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-22 07:58:23.381
619ca00e-46b5-4b85-91a2-f156ca0d8119	2e310667-1c46-4818-ac37-379d159a30f7	bc2c4645-efb4-47e3-902e-76d34d7a9d12	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-22 09:58:23.381
00bd9227-e88f-417d-851e-1edfce843141	2e310667-1c46-4818-ac37-379d159a30f7	bc2c4645-efb4-47e3-902e-76d34d7a9d12	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-22 11:28:23.381
c4976d89-deaa-47cd-86a3-92f4f567b778	2e310667-1c46-4818-ac37-379d159a30f7	c518ff44-1f26-46b5-9938-41a838d4e7ea	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-18 08:00:26.837
800d95fd-13ec-4a60-8c9d-b5bc28c94d93	2e310667-1c46-4818-ac37-379d159a30f7	c518ff44-1f26-46b5-9938-41a838d4e7ea	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-18 10:00:26.837
7d28fe19-ee10-4b3e-823c-a6340a95a212	2e310667-1c46-4818-ac37-379d159a30f7	c518ff44-1f26-46b5-9938-41a838d4e7ea	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-18 11:30:26.837
15ab276f-6935-40f9-a437-cb9c9c5576fe	2e310667-1c46-4818-ac37-379d159a30f7	c1677129-600c-48b4-956f-4a7bc34c7a0c	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:02:30.293
ec7fc138-4f8a-445f-8f11-506d6091a41a	2e310667-1c46-4818-ac37-379d159a30f7	c1677129-600c-48b4-956f-4a7bc34c7a0c	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:02:30.293
2146ab4d-195c-4577-8093-a7ac2b1c2a02	2e310667-1c46-4818-ac37-379d159a30f7	c1677129-600c-48b4-956f-4a7bc34c7a0c	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 11:32:30.293
51671254-10cb-49ea-bade-6f284b600030	2e310667-1c46-4818-ac37-379d159a30f7	a7f42c46-a564-462b-9f48-77679c77c245	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-10 08:04:33.749
94c50022-3401-42ec-96cf-327b59bc05a7	2e310667-1c46-4818-ac37-379d159a30f7	a7f42c46-a564-462b-9f48-77679c77c245	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-10 10:04:33.749
6c25d769-c688-4305-b624-23f9e247c089	2e310667-1c46-4818-ac37-379d159a30f7	a7f42c46-a564-462b-9f48-77679c77c245	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-10 11:34:33.749
34793e1a-bcb6-4d66-9907-63e174dba64d	2e310667-1c46-4818-ac37-379d159a30f7	f37d2d08-4ee3-4a69-8bab-e1dc70f38ad5	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:06:37.205
60e91b1b-8245-4805-89d1-1a271ba1124f	2e310667-1c46-4818-ac37-379d159a30f7	f37d2d08-4ee3-4a69-8bab-e1dc70f38ad5	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:06:37.205
090b440b-3c6b-46c1-975e-3c7942e28bc5	2e310667-1c46-4818-ac37-379d159a30f7	f37d2d08-4ee3-4a69-8bab-e1dc70f38ad5	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 11:36:37.205
352f53ab-0729-45e5-9efd-30bb3647dfda	2e310667-1c46-4818-ac37-379d159a30f7	7cb88513-1ff9-4cac-ab15-a7c0a2d41ff4	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-15 08:08:40.661
bb88223f-da8f-4fef-8f07-2054c86d96a1	2e310667-1c46-4818-ac37-379d159a30f7	7cb88513-1ff9-4cac-ab15-a7c0a2d41ff4	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-15 10:08:40.661
cd368915-5cb0-4f4a-be11-54f92a827c45	2e310667-1c46-4818-ac37-379d159a30f7	7cb88513-1ff9-4cac-ab15-a7c0a2d41ff4	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-15 11:38:40.661
7927f907-7897-4d3d-b790-74fb168c5dda	2e310667-1c46-4818-ac37-379d159a30f7	8a476908-a3dc-4b62-9123-fe72cabb0ed7	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-18 08:10:44.117
3bbd2338-04b6-491b-9ca3-b9521a730dc5	2e310667-1c46-4818-ac37-379d159a30f7	8a476908-a3dc-4b62-9123-fe72cabb0ed7	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-18 10:10:44.117
a676afd4-0ec2-4b09-9328-c79c0da227a1	2e310667-1c46-4818-ac37-379d159a30f7	8a476908-a3dc-4b62-9123-fe72cabb0ed7	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-18 11:40:44.117
a5503e46-a0f5-41bb-8924-25d30f415431	2e310667-1c46-4818-ac37-379d159a30f7	8c179cf7-4dc2-412d-9071-12f3d01cee00	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-22 08:12:47.573
01668082-ce28-4b3f-812f-0216c0dcdd2c	2e310667-1c46-4818-ac37-379d159a30f7	8c179cf7-4dc2-412d-9071-12f3d01cee00	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-22 10:12:47.573
c445f15c-5d09-4a38-9c5e-be4b651d73ac	2e310667-1c46-4818-ac37-379d159a30f7	8c179cf7-4dc2-412d-9071-12f3d01cee00	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-22 11:42:47.573
c635c1e8-7b21-4fa7-81ba-6fddb2c64dc1	2e310667-1c46-4818-ac37-379d159a30f7	65a94fbf-060f-4322-a38c-a2a4153be1dc	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-21 08:14:51.029
39c5f53e-1edd-4035-b8f5-470ba7b21b0b	2e310667-1c46-4818-ac37-379d159a30f7	65a94fbf-060f-4322-a38c-a2a4153be1dc	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-21 10:14:51.029
a09d8c3c-bfb3-4703-9d7c-c3d99441b98e	2e310667-1c46-4818-ac37-379d159a30f7	65a94fbf-060f-4322-a38c-a2a4153be1dc	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-21 11:44:51.029
c3f22e27-2eb5-4fea-9564-5d3834dafaf4	2e310667-1c46-4818-ac37-379d159a30f7	bfb358ae-3aa4-4523-9904-b6e6382b629e	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-15 08:16:54.485
89b2d09c-1c0b-4237-b56e-4169a5a54fc6	2e310667-1c46-4818-ac37-379d159a30f7	bfb358ae-3aa4-4523-9904-b6e6382b629e	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-15 10:16:54.485
c44eac40-0c11-4614-9e22-a519644ce2cf	2e310667-1c46-4818-ac37-379d159a30f7	bfb358ae-3aa4-4523-9904-b6e6382b629e	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-15 11:46:54.485
d0a8b55a-28a7-4929-bee3-3c038c2be164	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-04 08:18:57.941
455ba359-df50-45a3-bd8a-af64ee682743	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-04 10:18:57.941
56945a94-5377-4516-bd4d-bfba8df03b31	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-04 11:48:57.941
370f252e-1c40-4c87-a4a7-01622300b39b	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-04 12:48:57.941
06bd4fa1-ffed-4b33-8875-7ad8276d96fa	2e310667-1c46-4818-ac37-379d159a30f7	2cd513e7-8498-44a0-9982-2a1f7435b921	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-07 03:18:57.941
be666491-b6bf-4a67-81e2-db2c95b1ef39	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-09 08:21:01.397
3a6f264f-b033-47c7-af9e-ef7ce66448e6	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-09 10:21:01.397
8bd6eb45-2ebf-4aa8-aab2-a6bbabbf612e	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-09 11:51:01.397
dcdfb536-7d9e-4542-8233-751e3332a84d	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-09 12:51:01.397
e2915d1f-a341-44a2-8bd5-6f52325736e3	2e310667-1c46-4818-ac37-379d159a30f7	47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-11 03:21:01.397
804bd830-10f0-40ad-91e9-bf207dc8ce8c	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-10 08:23:04.853
49b74fc3-f8c8-4526-8c3a-02d8e7b69616	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-10 10:23:04.853
febd1ac0-17cd-4d02-a608-f2cbe3b4b2e2	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-10 11:53:04.853
d4a3f114-ade6-4644-9ed1-e4a406a85e5a	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-10 12:53:04.853
db810073-e9c3-4a14-b443-b3e8c35dab7a	2e310667-1c46-4818-ac37-379d159a30f7	e9e511bd-798c-4f40-acab-cd9279bbbcbe	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-11 14:23:04.853
4b8412c8-e65b-475b-ac77-47893b433a6a	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-19 08:25:08.309
4b5a614f-3632-4861-987d-defd2ef38c5c	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-19 10:25:08.309
7cbe8401-79b3-4391-b149-c3a9448bfb13	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-19 11:55:08.309
211aa56d-4c12-4c35-b2e8-67f4d7fccbe2	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-19 12:55:08.309
437e01ea-41fc-46f8-964b-81d43eb73351	2e310667-1c46-4818-ac37-379d159a30f7	6a4f0950-db4f-4b78-bff0-f8c037b7c482	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-20 03:25:08.309
04c946a5-f604-4a58-94f0-b8fc1760ee91	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-17 08:27:11.765
40fc7ff6-3cf5-4891-8222-9fe146033033	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-17 10:27:11.765
00a7e681-953c-495f-9beb-5856417b4310	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-17 11:57:11.765
19e4f28c-1b74-44ee-8f89-67aa2ab79ad5	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-17 12:57:11.765
8a779295-0a2a-401b-b760-4244692b8b46	2e310667-1c46-4818-ac37-379d159a30f7	b4e0e976-0eed-4836-b809-44cab2f1d251	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-19 03:27:11.765
13ff56d0-4197-4682-a894-c4011009fe35	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:29:15.221
7b5cd057-fb87-4869-898b-de1419ca2c66	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:29:15.221
cc4f1398-dac5-4664-b17c-4cf6baaa13d7	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 11:59:15.221
5042efea-ec52-417f-8216-e3286d694b2c	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-16 12:59:15.221
a083fd19-2a91-4a6d-b6a4-55bd822d37eb	2e310667-1c46-4818-ac37-379d159a30f7	66548a5f-cd4b-4d18-9cdb-d7132c216088	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-17 14:29:15.221
741e2500-37fe-4ee6-a72c-99b50bad4f3d	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-01 08:31:18.677
81615f10-1d00-4919-86b6-dfa542c1b29b	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-01 10:31:18.677
2c7050a0-ab9e-42c9-a050-0f08d6a7e8bd	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-01 12:01:18.677
bf2df876-d501-450e-b181-aa4a2a62fe4b	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-01 13:01:18.677
1785d8d6-bf0f-4ff6-8db2-960762107967	2e310667-1c46-4818-ac37-379d159a30f7	7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-03 03:31:18.677
57685f42-df41-462e-b8b0-e2eb62322d16	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:33:22.133
36c164a0-df15-4634-abc6-6fdec541ea36	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-16 10:33:22.133
0f89bc27-9df1-4a8b-91b8-9fbe1a864227	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-16 12:03:22.133
d80c160b-3043-4502-9ec2-aee2600c09e7	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-16 13:03:22.133
a0d77b79-c889-486d-84dc-24827ef48a38	2e310667-1c46-4818-ac37-379d159a30f7	79db6a48-9d52-4762-94bd-3835777fb82a	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-18 02:33:22.133
fa190944-a918-4339-8ea9-697efe43be58	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-13 08:35:25.589
75bc90e4-989e-4110-be8c-cedad1195559	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-13 10:35:25.589
68d36652-bbac-4534-b60f-890828d3f0fa	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-13 12:05:25.589
6a93cf36-cea1-41e3-bb71-8b416bd21f9d	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-13 13:05:25.589
50bf4e82-2b38-4949-be20-44a71ba7c12a	2e310667-1c46-4818-ac37-379d159a30f7	fc52f07f-670d-454a-9775-56b49f712c14	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-15 14:35:25.589
e5676cc3-42e3-4fc4-b79c-42c48130907f	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-10 08:37:29.045
c9fca4b9-f5de-429b-81ee-4bcd66d7c931	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-10 10:37:29.045
1d6e9118-f221-4501-b609-0acfb44e0f34	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-10 12:07:29.045
12b52936-97a3-4515-bb57-190c318f1737	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-10 13:07:29.045
c2734423-94cf-42c2-8454-9963ebb59123	2e310667-1c46-4818-ac37-379d159a30f7	939d9cb9-2e12-45db-9fcb-bbcd96e46620	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-13 03:37:29.045
37b700a8-ac39-4404-a303-6bc5a08eadb1	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 08:39:32.501
adb289a3-af3e-492f-af4e-61e605c7daf1	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-03 10:39:32.501
3b331f2c-71c5-445a-8449-161c012be7c0	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-03 12:09:32.501
ad5ef69c-4066-45de-b9b5-b7980d57bfe5	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-03 13:09:32.501
e25248c2-8fec-407d-a66d-f4739b74dc35	2e310667-1c46-4818-ac37-379d159a30f7	d9a05135-9acb-448b-b4f2-94cb0c0374da	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-05 03:39:32.501
724f5472-1765-482c-bae0-d77c5fba71d7	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 08:41:35.957
235a7de3-acad-42b3-885b-667d2516b3e2	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-03 10:41:35.957
6b799f29-7caf-476c-bbe8-06ffc8318fb8	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-03 12:11:35.957
64a754c5-cee7-4717-8ad9-344ca07ca684	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-03 13:11:35.957
1c0b0228-fcfb-4824-be97-87de8b02f9e8	2e310667-1c46-4818-ac37-379d159a30f7	a4859ccc-6e51-470d-8944-b988bff3a174	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-04 14:41:35.957
3fcda268-5ebd-4717-8f64-644afd976e07	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-20 08:43:39.413
db6cd1ef-3fbc-47e7-94f6-ebd3e8b8c5ac	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-20 10:43:39.413
89ddf7b4-fd8f-45d0-9561-044ad2906137	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-20 12:13:39.413
e2bf1051-82bb-46b8-938d-a6186d8bacd3	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-20 13:13:39.413
9c66d4fd-3b27-4222-b21f-7371e96f2367	2e310667-1c46-4818-ac37-379d159a30f7	0427517c-9cc0-4bf6-9a0f-c27078c83597	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-22 02:43:39.413
891de771-2514-4014-af9b-b9891254155c	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-18 08:45:42.869
86e12030-a54d-4818-807f-b52ecf656da6	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-18 10:45:42.869
df770041-6579-42aa-a014-9b477834adcd	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-18 12:15:42.869
bcc3d8fc-1316-4581-a9a9-cdf3a0b03f65	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-18 13:15:42.869
3f69a1c2-b9f8-4d9f-b0cb-830e25e66fb5	2e310667-1c46-4818-ac37-379d159a30f7	ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-19 03:45:42.869
457ed6d4-6c00-47ee-9f51-f34dd3e9375d	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-03 08:47:46.325
d1077d34-545f-4856-a1dd-d5c2cc198448	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-03 10:47:46.325
beb44767-608b-4e18-954e-ef5f0664278f	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-03 12:17:46.325
e212722d-669b-4ddb-bf2d-b56e72d47307	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-03 13:17:46.325
dc61c3e6-02ce-4402-b2a4-56b68f572301	2e310667-1c46-4818-ac37-379d159a30f7	d4d366ea-bd98-47d2-b688-b883f6318e6f	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-06 14:47:46.325
d5c6ec02-3012-4262-9e2e-36703e3e3cd6	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-11 07:49:49.781
98c66ef4-7f03-40f1-9857-ecaa9c491f29	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-11 09:49:49.781
9b9f16ed-e392-4341-88b9-12ea46e0ed36	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-11 11:19:49.781
a7c6f935-684f-4321-bc6f-5e747e2843a4	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-11 12:19:49.781
1cbdea8d-0598-4e81-92bf-83b9c839df88	2e310667-1c46-4818-ac37-379d159a30f7	89b8eaa5-49c4-4415-b67e-3cc88c941f5d	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-14 02:49:49.781
15e85ed1-9565-4bcc-a44b-95f2f0a95e97	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-01 07:51:53.237
3de0fff3-c20a-4c3e-a5de-1386cd68352f	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-01 09:51:53.237
4e128afb-bc04-47d6-a0a5-5471dfd44028	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-01 11:21:53.237
84343756-3879-460c-bfd8-95bb4a0bd598	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-01 12:21:53.237
3895221b-9010-4e18-9461-c7b818382192	2e310667-1c46-4818-ac37-379d159a30f7	dc99a788-8398-4515-8462-f954cfe7d97f	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-03 02:51:53.237
03611c6e-2174-48fe-af58-63c5c6884e1a	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-12 07:53:56.693
704ccd5d-af61-40b1-98df-758895ab07ef	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-12 09:53:56.693
fced32ef-a5c8-42eb-b151-f7fce8701a4d	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-12 11:23:56.693
32600a7b-a212-46ad-8ca4-03b078d96db3	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-12 12:23:56.693
0ac183f3-1017-416d-bfe7-5af4b003e0e7	2e310667-1c46-4818-ac37-379d159a30f7	66be6ca8-809f-4504-8e5f-95092eebd06c	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-13 13:53:56.693
d8585c45-6103-4359-bfc5-19f29dea3fbb	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-09 07:56:00.149
0581beff-81fe-4e7f-845f-6c6469971273	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-09 09:56:00.149
38178a46-ebc2-4d94-88f3-c9e780aad672	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-09 11:26:00.149
f3092afd-0886-49c9-ae1f-3b85eade0754	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-09 12:26:00.149
729bf3e8-1051-437b-bf98-f25dffa8375a	2e310667-1c46-4818-ac37-379d159a30f7	0c9a6ffe-29e1-4ef3-8879-5ab62e031243	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-10 02:56:00.149
34db55b1-bcbb-439d-94e9-57ea81c05d72	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-07 07:58:03.605
9fdc29ab-73ff-4a28-ba39-0802ba622662	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-07 09:58:03.605
db1c5668-460c-40f5-92b5-e61c838b21d1	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-07 11:28:03.605
f3fa3860-2d54-490b-8819-c5d423bf9369	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-07 12:28:03.605
42aba013-9ef0-4ee2-8c5b-4b5d75af69e6	2e310667-1c46-4818-ac37-379d159a30f7	5c191c78-2698-4b36-8139-70aee7452d89	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-09 02:58:03.605
7c00a457-1894-484d-9cdb-edf41292687c	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-14 08:00:07.061
07312c55-d72e-489d-9bf6-0a4d4f560813	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved. Proceed with immediate technician dispatch.	2026-09-14 10:00:07.061
e184d835-c5f2-4ed5-8ff6-a460424e5a36	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to technician Ramesh Pawar.	2026-09-14 11:30:07.061
af647567-e9d4-4d7b-9299-f59597d5deb6	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Diagnostic assessment commenced. Safety isolation confirmed.	2026-09-14 12:30:07.061
a90db96b-40c1-4097-90fc-09214ffdb0dc	2e310667-1c46-4818-ac37-379d159a30f7	d2318bad-9436-4ed5-a31c-c0de0e0ab033	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	2026-09-15 14:00:07.061
14b15cd3-27ef-47f8-8df7-0615108decb2	2e310667-1c46-4818-ac37-379d159a30f7	099ad174-3ae2-4d99-b18f-378c18277e48	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-10 08:02:10.517
9e127a26-c63c-4c69-9ddc-c84624b23eca	2e310667-1c46-4818-ac37-379d159a30f7	2425c292-06f9-4971-8724-5af82f9eed18	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:04:13.973
f6d6d1a3-5c3e-4eb9-8962-ba2b1ba2a864	2e310667-1c46-4818-ac37-379d159a30f7	98e3b603-0119-4d17-b475-b806a530c3e8	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-21 08:06:17.429
75067cdd-54ab-4608-b503-ba07443fcd3f	2e310667-1c46-4818-ac37-379d159a30f7	713fa020-ff0c-49fb-97f6-01a640432517	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-16 08:08:20.885
36e917a3-a6e9-437c-98f0-365d16336e60	2e310667-1c46-4818-ac37-379d159a30f7	57df17ea-1d1d-42f8-a29b-26a25b296ae7	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-08-29 08:10:24.341
74774472-a7aa-4052-bf82-f7b4a1d5c917	2e310667-1c46-4818-ac37-379d159a30f7	0344b543-c3ab-4f9c-b1bb-baa05643bbca	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted into tenant queue.	2026-09-20 08:12:27.797
b7a1db77-946f-414e-8e11-c1428dcee6f1	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 07:49:05.836
3a0760be-3d78-40d7-b1c0-bf5f7f10b74d	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Approved by Branch Approver	2026-09-23 07:49:05.854
9bbe7715-c8e1-42d8-8a89-e4c6626409c3	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Inspect immediately	2026-09-23 07:49:05.871
3d95ad51-3966-4601-96ea-494ddf6921d7	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Dismantling safety sensor	2026-09-23 07:49:05.885
31f25f76-bca5-4542-a751-0b4c2e3c77cb	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Installed and calibrated. All tests passed.	2026-09-23 07:49:05.906
b1d61242-7019-477f-92b5-4d05b9b5f67f	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	COMPLETED	REOPENED	6b6d957f-362e-446f-9c61-375c17bd6201	Dissatisfied task reopened. Reason: Safety buzzer volume low. Notes: None	2026-09-23 07:49:05.917
a27f5e24-8669-43c6-893c-01670f806ed2	2e310667-1c46-4818-ac37-379d159a30f7	b0e67952-d6f9-4713-a1b5-abcc38838c8b	REOPENED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Buzzer volume adjusted. Verified!	2026-09-23 07:49:05.929
67faa7ba-1997-4cf9-b368-7602e94a88f2	2e310667-1c46-4818-ac37-379d159a30f7	bc621456-a4f1-4ca0-afb4-76ffac6880f4	\N	WAITING_FOR_APPROVAL	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Request created and submitted for approval.	2026-09-23 11:19:03.554
321362f9-0ed3-4f3c-91fb-4d4bfa9f386e	2e310667-1c46-4818-ac37-379d159a30f7	bc621456-a4f1-4ca0-afb4-76ffac6880f4	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	xyz	2026-09-23 11:19:53.848
9ef10ddb-e8f2-47bd-8f0e-359a7c89b1fa	30d424ac-9074-40b8-b062-deae1a023a3d	c5e0c846-1783-4ba3-b7c0-f91163f48337	ASSIGNED	APPROVED	d1c9ac36-506b-42eb-9472-c83873c0d37a	Request approved.	2026-09-23 11:29:48.65
8d833f04-43f9-4d36-b5d6-a1e873f6b27a	2e310667-1c46-4818-ac37-379d159a30f7	2b45d87e-ea75-44fb-bd6f-2df9be49f43b	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 11:43:16.07
85a9fbbf-062f-4755-a946-7252baec2710	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	IN_PROGRESS	COMPLETED	79604a14-4a74-4c65-a925-5f8e953ec609	Status updated to COMPLETED	2026-09-23 11:58:42.913
e4f33b54-ae4a-443d-8b78-d442e4039164	2e310667-1c46-4818-ac37-379d159a30f7	d5de7495-d572-42cb-ba27-2b857cff6977	COMPLETED	CLOSED	79604a14-4a74-4c65-a925-5f8e953ec609	Verified and confirmed satisfied by requester.	2026-09-23 11:58:51.237
3d6fee25-ca39-4178-8600-f9e71af90623	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-23 12:38:33.128
d606eb66-8141-4be5-9f82-9ca04b17c5ed	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Emergency server room approval granted.	2026-09-23 12:38:33.172
1b521d49-89e8-41ae-afd7-b0838c9e430d	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Priority task: server room heat critical	2026-09-23 12:38:33.193
b5c91cac-d02b-4ded-a251-a38bda467ebb	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Arrived at server room, opened AC panel.	2026-09-23 12:38:33.208
8d513dca-3b96-4812-90fc-6b028424596c	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	IN_PROGRESS	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Purchase Request PR-2026-0001 created for materials/services via AMAZON BUSINESS.	2026-09-23 12:38:33.228
36df9f42-e749-4e07-bddf-6bdac73d1b06	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	WAITING_FOR_PURCHASE	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Parts ordered via AMAZON_BUSINESS. Order Ref: AMZ-882190	2026-09-23 12:38:33.269
ea7a8944-3e00-4653-bddd-d9d1c0ba0e1b	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	WAITING_FOR_PURCHASE	IN_PROGRESS	d37e3c4f-f763-4c56-8254-2acc13c24927	Materials received via PR PR-2026-0001. Maintenance work resumed.	2026-09-23 12:38:33.285
f675d233-2c6d-4274-9c7c-60d8c370565b	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	IN_PROGRESS	WAITING_FOR_VENDOR	3fbf1cdd-5680-4802-9174-129dd38a2b62	Third-party vendor assigned: Hubli Industrial Electricals. Work Scope: HVAC precision gas charging and compressor calibration.	2026-09-23 12:38:33.329
74a26742-b569-4f82-a0a2-6722038755ed	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	WAITING_FOR_VENDOR	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Repairs done and server room cooled to 19°C.	2026-09-23 12:38:33.423
169081d9-700c-4584-b7e4-9fdc4386d782	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	COMPLETED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Temperature confirmed normal. Great job.	2026-09-23 12:38:33.467
8b92c520-1a3c-4a99-bdd9-2f82ae69b6ed	2e310667-1c46-4818-ac37-379d159a30f7	4d0c47cb-7702-4803-a302-ab121ba0db42	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Status updated to IN_PROGRESS	2026-09-23 12:44:59.205
2e7dea9c-eb98-4ab6-a482-fce73875d54a	2e310667-1c46-4818-ac37-379d159a30f7	4d0c47cb-7702-4803-a302-ab121ba0db42	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Status updated to COMPLETED	2026-09-23 12:45:13.022
bb1d715c-a648-4a15-8da2-9d76c9aef56b	2e310667-1c46-4818-ac37-379d159a30f7	5fc257a2-5650-41eb-947a-62c19c0a118a	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Status updated to IN_PROGRESS	2026-09-23 12:45:34.686
5b976169-0635-4f68-9bb6-529f5838d85d	2e310667-1c46-4818-ac37-379d159a30f7	5fc257a2-5650-41eb-947a-62c19c0a118a	IN_PROGRESS	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Status updated to COMPLETED	2026-09-23 12:45:36.35
6d7942d2-cabe-47d3-b16f-03f25667ba21	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-24 11:43:35.589
472065ad-7fac-4b5c-91ac-5a40f6e580e0	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Emergency server room approval granted.	2026-09-24 11:43:35.702
10616038-3caa-4747-8629-5dae9fbea870	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Priority task: server room heat critical	2026-09-24 11:43:35.72
eac5b47d-8340-4535-89eb-48f7cfe6d62b	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Arrived at server room, opened AC panel.	2026-09-24 11:43:35.736
6075bc36-365c-49bd-be39-2cae6ae7aa9c	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	IN_PROGRESS	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Purchase Request PR-2026-0002 created for materials/services via AMAZON BUSINESS.	2026-09-24 11:43:35.753
c8af012a-a515-4939-8c84-5ecccde4eb1c	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	WAITING_FOR_PURCHASE	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Parts ordered via AMAZON_BUSINESS. Order Ref: AMZ-882190	2026-09-24 11:43:35.788
682c1a33-4e44-4fbb-896e-ba1ca0817924	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	WAITING_FOR_PURCHASE	IN_PROGRESS	d37e3c4f-f763-4c56-8254-2acc13c24927	Materials received via PR PR-2026-0002. Maintenance work resumed.	2026-09-24 11:43:35.8
33f8ea7b-9bdc-4642-88ae-c126b39831c7	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	IN_PROGRESS	WAITING_FOR_VENDOR	3fbf1cdd-5680-4802-9174-129dd38a2b62	Third-party vendor assigned: Hubli Industrial Electricals. Work Scope: HVAC precision gas charging and compressor calibration.	2026-09-24 11:43:35.837
13b8904e-cf09-4cbc-84ca-f3b64fe78dfb	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	WAITING_FOR_VENDOR	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Repairs done and server room cooled to 19°C.	2026-09-24 11:43:35.867
b4c231ec-c6dc-49c0-b225-ac273fe55e6a	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	COMPLETED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Temperature confirmed normal. Great job.	2026-09-24 11:43:35.878
30ec82e1-ef24-4bd1-998b-44b334d6fe40	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-24 11:55:28.789
d187dcda-13f4-4386-afd2-6b38bef87254	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Emergency server room approval granted.	2026-09-24 11:55:28.83
725a6046-6df0-4e93-ad3b-ae1b28914532	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Priority task: server room heat critical	2026-09-24 11:55:28.849
a675ee2b-bff0-4e8d-9d1c-19819bca4b58	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Arrived at server room, opened AC panel.	2026-09-24 11:55:28.866
8f16812e-9acc-4b62-9891-8a2c4317fc79	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	IN_PROGRESS	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Purchase Request PR-2026-0003 created for materials/services via AMAZON BUSINESS.	2026-09-24 11:55:28.886
cde4c13e-5261-4b64-baf8-bded46e1e7e6	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	WAITING_FOR_PURCHASE	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Parts ordered via AMAZON_BUSINESS. Order Ref: AMZ-882190	2026-09-24 11:55:28.926
7fee6065-d90d-44a8-b260-dda374dc82a5	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	WAITING_FOR_PURCHASE	IN_PROGRESS	d37e3c4f-f763-4c56-8254-2acc13c24927	Materials received via PR PR-2026-0003. Maintenance work resumed.	2026-09-24 11:55:28.937
90e4d56a-b81a-4806-8049-3ce8de3d6941	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	IN_PROGRESS	WAITING_FOR_VENDOR	3fbf1cdd-5680-4802-9174-129dd38a2b62	Third-party vendor assigned: Hubli Industrial Electricals. Work Scope: HVAC precision gas charging and compressor calibration.	2026-09-24 11:55:28.975
ecfcff9b-2518-4434-9978-c6568b2a3ef7	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	WAITING_FOR_VENDOR	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Repairs done and server room cooled to 19°C.	2026-09-24 11:55:29.005
1750c2f3-1e1e-4e62-a060-597163fe060e	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	COMPLETED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Temperature confirmed normal. Great job.	2026-09-24 11:55:29.019
905a94e6-57f5-4b73-a294-e6a2b3e33eb7	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	\N	WAITING_FOR_APPROVAL	6b6d957f-362e-446f-9c61-375c17bd6201	Request created and submitted for approval.	2026-09-24 12:45:18.737
25cfdf99-e1dc-4fa1-960f-493dbca33051	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	WAITING_FOR_APPROVAL	APPROVED	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Emergency server room approval granted.	2026-09-24 12:45:18.783
df0ae512-8b65-4410-afb5-39234150f662	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	APPROVED	ASSIGNED	3fbf1cdd-5680-4802-9174-129dd38a2b62	Assigned to Ramesh Pawar. Notes: Priority task: server room heat critical	2026-09-24 12:45:18.8
8379c027-5ddd-4ee5-b6ac-57e813ff27c0	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	ASSIGNED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	Arrived at server room, opened AC panel.	2026-09-24 12:45:18.815
3e73c88a-df5a-4717-ab7e-bace46244787	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	IN_PROGRESS	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Purchase Request PR-2026-0004 created for materials/services via AMAZON BUSINESS.	2026-09-24 12:45:18.833
7d894711-1fab-4e6b-b0ea-453a543961ae	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	WAITING_FOR_PURCHASE	WAITING_FOR_PURCHASE	d37e3c4f-f763-4c56-8254-2acc13c24927	Parts ordered via AMAZON_BUSINESS. Order Ref: AMZ-882190	2026-09-24 12:45:18.877
0bae030b-cd40-4fdf-b798-3e41cd580bc2	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	WAITING_FOR_PURCHASE	IN_PROGRESS	d37e3c4f-f763-4c56-8254-2acc13c24927	Materials received via PR PR-2026-0004. Maintenance work resumed.	2026-09-24 12:45:18.891
4b36f039-4417-4b08-ba73-59d49d9dcf73	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	IN_PROGRESS	WAITING_FOR_VENDOR	3fbf1cdd-5680-4802-9174-129dd38a2b62	Third-party vendor assigned: Hubli Industrial Electricals. Work Scope: HVAC precision gas charging and compressor calibration.	2026-09-24 12:45:18.93
573aa2b3-a369-4297-8ce9-69644a6a9e2c	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	WAITING_FOR_VENDOR	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	Repairs done and server room cooled to 19°C.	2026-09-24 12:45:18.961
ef6a2a7f-124e-4e35-b1c5-a2a821379993	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	COMPLETED	CLOSED	6b6d957f-362e-446f-9c61-375c17bd6201	Temperature confirmed normal. Great job.	2026-09-24 12:45:18.974
\.


--
-- Data for Name: maintenance_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_requests (id, "requestNumber", "tenantId", "brandId", "branchId", "departmentId", "maintenanceTypeId", "requesterId", priority, location, subject, description, "requiredDate", "approvalStatus", "workStatus", "assignedToId", "assignedById", "assignedAt", "approvedById", "approvedAt", "startedAt", "completedAt", "closedAt", "estimatedCost", "actualCost", "rejectedById", "rejectedAt", "rejectionReason", "completionRemarks", "isDissatisfied", "dissatisfactionReason", "dissatisfiedAt", "dissatisfiedById", "createdAt", "updatedAt", "actionPlan", "actualTimeHours", "approvalCopyUrl", "approvalUploadedAt", "areaInBranch", "assignedToContact", "branchAreaId", "branchRemarks", "branchStatus", "checkedOff", "correctionAt", "correctionDone", "currentStatus", deadline, "differenceHours", "graceHours", "managerContact", "purchaseRemarks", "purchaseStatus", "purchaseStatusAt", "requesterContact", "slaClassification", "statusUpdatedAt", "statusUpdatedById", "targetHours", "timeToAssignMinutes", "vendorCompletionNotes", "vendorId", "vendorQuotationRef", "vendorScope", "vendorServiceDate", "vendorStatus") FROM stdin;
80c09d2e-5c24-49a3-9ae9-cede9acda39c	BELL-MAIN-2026-000022	2e310667-1c46-4818-ac37-379d159a30f7	dd42f648-4887-4eea-a658-1c33796f8412	ba7a9081-fa66-4878-8fcf-d217f465a646	e18f7e62-e43b-43e0-9cfb-cf757c51986c	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Chevrolet Belgaum - Bay 1	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-09-10 08:05:13.301	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	4200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-08 08:05:13.301	2026-09-23 07:48:45.695	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-10 08:05:13.301	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
83cbe196-bc01-4581-b2fa-163a65dcb8d7	BELL-MAIN-2026-000023	2e310667-1c46-4818-ac37-379d159a30f7	8774585c-a9bb-4c1c-a5eb-7db85543530c	c512bc52-6b64-4258-b319-ade81c809cf9	4f615162-c1d7-4e1b-94c7-b1c2cbe837f2	7d29c8c5-d4e5-48f6-9af4-4193a7bf1ed2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	CNH Hubli - Bay 2	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-11 08:07:16.757	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	11000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-10 08:07:16.757	2026-09-23 07:48:45.698	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-11 08:07:16.757	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
55bfb048-a97a-4eee-84e6-7fcc6cbd499d	BELL-MAIN-2026-000024	2e310667-1c46-4818-ac37-379d159a30f7	29e2cdbc-abdf-422f-9036-79cfa70b0d70	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	ac10bb19-9e42-4f76-8a90-61d3385ef600	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	CRM Hubli - Bay 3	Server Room Liebert Precision AC High Temperature Alarm (28°C)	Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.	2026-09-19 08:09:20.213	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	7800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-18 08:09:20.213	2026-09-23 07:48:45.701	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-19 08:09:20.213	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
27a61a4b-cd9b-40c8-9d51-21458c070110	BELL-MAIN-2026-000025	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	26876c43-7084-4bc1-9085-203fe4893588	1db5ef20-9e3e-497a-9379-f41157d92689	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	D7D - Bay 4	Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked	Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.	2026-09-20 08:11:23.669	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	3500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 08:11:23.669	2026-09-23 07:48:45.704	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-20 08:11:23.669	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
dab2909e-bdfa-4485-b784-18f4008a5843	BELL-MAIN-2026-000013	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	4c9d1366-ba6f-40d4-be29-f85162d2c069	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	79604a14-4a74-4c65-a925-5f8e953ec609	HIGH	XYZ	wanted 1 TB HDD	Need to back up of the files in the system	2026-09-24 07:42:12.779	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	79604a14-4a74-4c65-a925-5f8e953ec609	2026-09-23 07:43:46.387	79604a14-4a74-4c65-a925-5f8e953ec609	2026-09-23 07:43:19.909	\N	\N	\N	7000	28000	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 07:42:12.785	2026-09-23 07:44:39.233	\N	\N	sandeep	2026-09-23 07:42:12.783	Accounts & Finance Wing	+91 9845045678	1cd3acc9-8a7f-4847-a034-302551e7c249	\N	OPEN	f	\N	IN_PROGRESS	WAITING_FOR_PURCHASE	2026-09-24 07:42:12.779	\N	12	+91 9845012345	\N	NOT_REQUIRED	\N	7019732498	\N	2026-09-23 07:43:58.168	79604a14-4a74-4c65-a925-5f8e953ec609	24	2	\N	\N	\N	\N	\N	\N
833695c9-3f1a-4fbc-99ab-c233b3e1b6b2	BELL-MAIN-2026-000020	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	48e27d0f-82ca-486f-b0a7-094188cb9014	a897678b-8f1f-49f2-8fa7-aa5ab301d5c7	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Beltech Hubli - Bay 7	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-21 08:01:06.389	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	2400	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 08:01:06.389	2026-09-23 07:48:45.687	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-21 08:01:06.389	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
d5ca95c5-7e35-4c80-b673-36b5eea47ddf	BELL-MAIN-2026-000021	2e310667-1c46-4818-ac37-379d159a30f7	f7aa29cf-7a33-47d5-8fd5-df043f7448a0	9ffc9414-f95d-4344-b770-3a56e4a95d75	6e4178c4-f806-4a41-b122-a4566e58fe9b	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Back Office Hubli - Bay 8	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-06 08:03:09.845	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	3800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-03 08:03:09.845	2026-09-23 07:48:45.692	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-06 08:03:09.845	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
97584eaa-ede9-4c1b-80be-b7ac1d4eada7	BELL-MAIN-2026-000026	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	086c6225-d976-41af-a6ed-8b90f88b27ce	e8b28bba-6710-40f5-95e4-3cc63f71746e	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Gabbur Hubli - Bay 5	Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination	Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.	2026-09-23 08:13:27.125	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-20 10:13:27.125	\N	\N	\N	14500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-20 08:13:27.125	2026-09-23 07:48:45.708	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-23 08:13:27.125	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
243ed821-21df-4eca-a30b-9658db7e7987	BELL-MAIN-2026-000027	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	cafeac1a-2bc9-43b4-a888-6aaf84095a6c	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Hero MotoCorp Dharwad - Bay 6	Customer Restroom Sensor Faucets Non-Responsive	Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.	2026-09-02 08:15:30.581	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-08-30 10:15:30.581	\N	\N	\N	1600	0	\N	\N	\N	\N	f	\N	\N	\N	2026-08-30 08:15:30.581	2026-09-23 07:48:45.711	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-02 08:15:30.581	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
8cc086bf-dc97-4a2f-9fb9-0e18f0ae73a1	BELL-MAIN-2026-000028	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	5f71bbf4-677d-4944-befc-b47325ff7c24	265446e9-0314-4f84-8e1f-3b364635560b	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hero MotoCorp Hubli - Bay 7	CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded	Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.	2026-09-19 08:17:34.037	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-17 10:17:34.037	\N	\N	\N	6500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-17 08:17:34.037	2026-09-23 07:48:45.715	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-19 08:17:34.037	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
882448d3-94df-4df9-bcc3-1181fbf83325	BELL-MAIN-2026-000014	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Energy Belgaum - Bay 1	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-01 07:48:45.653	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	4500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-08-31 07:48:45.653	2026-09-23 07:48:45.655	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-01 07:48:45.653	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
2e0e0cad-3604-4a94-bd9e-35a4a3f9b98f	BELL-MAIN-2026-000015	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	b4585701-6704-4e3b-af7c-9bb115c6701b	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Bangalore - Bay 2	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-09-21 07:50:49.109	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	8200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-20 07:50:49.109	2026-09-23 07:48:45.665	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-21 07:50:49.109	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
f7080e0b-9f33-4776-9f83-72219b1a5d33	BELL-MAIN-2026-000002	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	5f71bbf4-677d-4944-befc-b47325ff7c24	77482462-625b-4554-b7b6-4bb0c2900069	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hero MotoCorp Hubli - Customer Lounge	Entrance Glass Sliding Door Sensor Malfunction	Automatic motion sensor not detecting customers. Door remains closed or sticks midway.	2026-09-25 06:52:46.789	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	0	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 04:52:46.789	2026-09-23 06:52:46.797	\N	\N	\N	\N	\N	\N	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-25 06:52:46.789	\N	12	\N	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
0dcfd09a-a9ff-4c67-bc82-bf0d0de73ce1	BELL-MAIN-2026-000003	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	48d3a965-80a2-4fe1-b8fb-fad5d02731e7	958301dd-b4cd-48bd-8ab0-e9fe99b2cac2	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Ather Bangalore Showroom - EV Fast Charging Bay	Replacement Industrial Water Filter Cartridges for EV Wash Bay	High TDS level clogging pressure washer nozzle. Requisition of 4x Ro Cartridge sets required.	2026-09-24 18:52:46.789	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	\N	\N	\N	\N	0	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-22 10:52:46.789	2026-09-23 06:52:46.799	\N	\N	\N	\N	\N	\N	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-24 18:52:46.789	\N	12	\N	Quotation received from Karnataka Water Tech for ₹18,500. Awaiting purchase order sign-off.	APPROVAL_PENDING	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
9d3126d1-1d7a-4b8c-9577-8c2410afcf6d	BELL-MAIN-2026-000004	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	77482462-625b-4554-b7b6-4bb0c2900069	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Tata Motors Sarjapur Showroom - Sales Reception	Reception Desk Drawer Lock and Hinges Repair	Three key lock cylinders jammed. Replace drawer slides and install Godrej brass locks.	2026-09-22 22:52:46.789	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-20 02:52:46.789	c9788a8d-ec88-4679-b72a-9dcae52c45a5	\N	2026-09-20 04:52:46.789	2026-09-21 10:52:46.789	2026-09-21 12:52:46.789	0	0	\N	\N	\N	All 3 locks replaced and tested. Keys handed over to showroom reception head.	f	\N	\N	\N	2026-09-19 22:52:46.789	2026-09-23 06:52:46.803	\N	36	\N	\N	\N	\N	\N	\N	OPEN	t	2026-09-21 10:52:46.789	COMPLETED	CLOSED	2026-09-22 22:52:46.789	-36	12	\N	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	72	240	\N	\N	\N	\N	\N	\N
1ca54006-f57f-4e1a-8a5b-203836f85349	BELL-MAIN-2026-000005	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	3898fdc6-de13-4b0b-9adb-8499305d3559	cdfa8b61-1211-4989-b098-ccec8afe83e7	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MG Motors Hubli - Technician Washroom	Main Drainage Pipe Leakage Behind Workshop Bay 4	Persistent greywater seep onto service floor creating slipping hazard.	2026-09-24 06:52:46.789	APPROVED	REOPENED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-22 10:52:46.789	c9788a8d-ec88-4679-b72a-9dcae52c45a5	\N	\N	\N	\N	0	0	\N	\N	\N	\N	t	Pipe elbow was patched with silicone tape instead of replacing PVC coupling. Leakage started again within 2 hours.	2026-09-23 04:52:46.789	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-22 10:52:46.789	2026-09-23 06:52:46.822	\N	\N	\N	\N	\N	\N	\N	\N	OPEN	t	\N	NOT_STARTED	REOPENED	2026-09-24 06:52:46.789	\N	12	\N	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	BELL-MAIN-2026-000006	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Bay 4 Hydraulic Lift	Hydraulic safety lock sensor replacement	Sensor needs calibration and replacement.	2026-09-25 06:53:41.624	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 06:53:41.661	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 06:53:41.648	2026-09-23 06:53:41.677	2026-09-23 06:53:41.694	2026-09-23 06:53:41.716	2500	1800	\N	\N	\N	Installed and calibrated. All tests passed.	f	Safety buzzer volume low	2026-09-23 06:53:41.704	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-23 06:53:41.632	2026-09-23 06:53:41.717	1. Test sensor\n2. Swap circuit\n3. Verify output voltage	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-23 06:53:41.694	COMPLETED	CLOSED	2026-09-25 06:53:41.624	-24	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	2026-09-23 06:53:41.694	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	\N	\N	\N	\N	\N
a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	BELL-MAIN-2026-000007	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Bay 4 Hydraulic Lift	Hydraulic safety lock sensor replacement	Sensor needs calibration and replacement.	2026-09-25 07:03:51.364	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:03:51.402	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 07:03:51.388	2026-09-23 07:03:51.418	2026-09-23 07:03:51.436	2026-09-23 07:03:51.457	2500	1800	\N	\N	\N	Installed and calibrated. All tests passed.	f	Safety buzzer volume low	2026-09-23 07:03:51.447	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-23 07:03:51.372	2026-09-23 07:03:51.459	1. Test sensor\n2. Swap circuit\n3. Verify output voltage	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-23 07:03:51.436	COMPLETED	CLOSED	2026-09-25 07:03:51.364	-24	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	2026-09-23 07:03:51.436	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	\N	\N	\N	\N	\N
64c7b9e9-6fd3-4754-9140-f1e0ba886948	BELL-MAIN-2026-000016	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	8267385b-f101-4266-9c36-b6413a1e8bb6	5ff7f408-a107-4d91-ae42-6eab5d066fa0	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Ather Bommasandra Bangalore - Bay 3	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-04 07:52:52.565	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	1800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-02 07:52:52.565	2026-09-23 07:48:45.669	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-04 07:52:52.565	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
de7c30f1-ec69-483d-ba6c-359f6161eb2b	BELL-MAIN-2026-000017	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	5eb176c4-1e46-4e18-9a96-45bda861c64a	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Energy Hubli - Bay 4	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-04 07:54:56.021	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	3200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-03 07:54:56.021	2026-09-23 07:48:45.676	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-04 07:54:56.021	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
c607ba1d-a287-4251-9623-012a8c5b3af8	BELL-MAIN-2026-000018	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	f8356d40-000e-48ce-bf31-3e757ff805e3	970518e5-8654-4f26-a37c-6a326da6db69	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Beltech Bangalore - Bay 5	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-18 07:56:59.477	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	5000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 07:56:59.477	2026-09-23 07:48:45.68	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-18 07:56:59.477	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
c2d05477-a809-4a22-af50-7517f84d61a4	BELL-MAIN-2026-000019	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	6c9f266b-02e1-4a74-a57b-9732c2c81c23	aec92a78-c6ca-40ef-8a2d-9eb98c51e38f	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Beltech Goa - Bay 6	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-04 07:59:02.933	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	9500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-03 07:59:02.933	2026-09-23 07:48:45.683	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-04 07:59:02.933	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
f531ef35-5426-44e3-b01d-390593385c04	BELL-MAIN-2026-000009	2e310667-1c46-4818-ac37-379d159a30f7	0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	f13bd4c8-950c-4605-b6c3-587ece85dac5	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	79604a14-4a74-4c65-a925-5f8e953ec609	HIGH	XYZ	want 1 TB HDD	need to backup all the files 	2026-09-24 07:16:27.203	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	6000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 07:16:27.209	2026-09-23 07:16:27.209	\N	\N	\N	\N	Head office 	\N	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-24 07:16:27.203	\N	12	\N	\N	NOT_REQUIRED	\N	7019732498	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
51656f67-115a-4ebf-85b8-2a6ea0d256e2	BELL-MAIN-2026-000008	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Bay 4 Hydraulic Lift	Hydraulic safety lock sensor replacement	Sensor needs calibration and replacement.	2026-09-25 07:05:13.71	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:05:13.748	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 07:05:13.736	2026-09-23 07:05:13.764	2026-09-23 07:05:13.784	2026-09-23 07:05:13.805	2500	1800	\N	\N	\N	Installed and calibrated. All tests passed.	f	Safety buzzer volume low	2026-09-23 07:05:13.793	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-23 07:05:13.718	2026-09-23 07:05:13.806	1. Test sensor\n2. Swap circuit\n3. Verify output voltage	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-23 07:05:13.784	COMPLETED	CLOSED	2026-09-25 07:05:13.71	-24	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	2026-09-23 07:05:13.784	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	\N	\N	\N	\N	\N
41513dbf-520f-400b-851b-68f02a1ea7d0	BELL-MAIN-2026-000010	2e310667-1c46-4818-ac37-379d159a30f7	0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	f13bd4c8-950c-4605-b6c3-587ece85dac5	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	79604a14-4a74-4c65-a925-5f8e953ec609	HIGH	XYZ	want 1 TB HDD	need to backup all the files 	2026-09-24 07:16:42.292	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	6000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 07:16:42.295	2026-09-23 07:16:42.295	\N	\N	\N	\N	Head office 	\N	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-24 07:16:42.292	\N	12	\N	\N	NOT_REQUIRED	\N	7019732498	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
28ef519c-464c-450c-89a7-247c44bf50e0	BELL-MAIN-2026-000011	2e310667-1c46-4818-ac37-379d159a30f7	0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	f13bd4c8-950c-4605-b6c3-587ece85dac5	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	79604a14-4a74-4c65-a925-5f8e953ec609	HIGH	XYZ	want 1 TB HDD	need to backup all the files 	2026-09-24 07:16:58.285	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	6000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 07:16:58.291	2026-09-23 07:16:58.291	\N	\N	kjkhj	2026-09-23 07:16:58.289	Head office 	\N	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-24 07:16:58.285	\N	12	\N	\N	NOT_REQUIRED	\N	7019732498	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
6413283e-3cb0-4b1c-bfb8-d557856cef31	BELL-MAIN-2026-000012	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Bay 4 Hydraulic Lift	Hydraulic safety lock sensor replacement	Sensor needs calibration and replacement.	2026-09-25 07:37:27.385	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:37:27.425	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 07:37:27.411	2026-09-23 07:37:27.441	2026-09-23 07:37:27.461	2026-09-23 07:37:27.483	2500	1800	\N	\N	\N	Installed and calibrated. All tests passed.	f	Safety buzzer volume low	2026-09-23 07:37:27.471	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-23 07:37:27.393	2026-09-23 07:37:27.485	1. Test sensor\n2. Swap circuit\n3. Verify output voltage	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-23 07:37:27.461	COMPLETED	CLOSED	2026-09-25 07:37:27.385	-24	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	2026-09-23 07:37:27.461	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	\N	\N	\N	\N	\N
37c0759c-d9b3-4e73-97f5-3dc512b3aa90	BELL-MAIN-2026-000029	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	4c9d1366-ba6f-40d4-be29-f85162d2c069	6ef083e2-cc35-40db-a160-014595678a38	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Head Office Hubli - Bay 8	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-08 08:19:37.493	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-07 10:19:37.493	\N	\N	\N	4500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-07 08:19:37.493	2026-09-23 07:48:45.718	\N	\N	\N	\N	Main Conference Hall	+91 9845045678	1cf3832d-618e-4d0e-bc64-35360d8889fd	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-08 08:19:37.493	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
910ece14-e6dd-4108-b0fe-22e11540a423	BELL-MAIN-2026-000030	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	a5e37161-3a17-4b45-8a80-aba8da91e43a	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Dharwad - Bay 1	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-09-18 08:21:40.949	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-17 10:21:40.949	\N	\N	\N	8200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-17 08:21:40.949	2026-09-23 07:48:45.724	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	APPROVED	2026-09-18 08:21:40.949	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
df744de5-8240-49bf-b0f9-ea3daf5bfc06	BELL-MAIN-2026-000031	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	e8bbf769-4f3b-4ab1-a848-08b266d80f10	81e0adea-4293-4d69-a5ed-e5c0c7d6d981	3acd2c54-f54e-4908-8fe4-b870d03a5452	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hyundai Gadag - Bay 2	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-18 08:23:44.405	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:23:44.405	\N	\N	\N	1800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 08:23:44.405	2026-09-23 07:48:45.728	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-18 08:23:44.405	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
75bc0d75-eedd-4f16-8e13-e7a1dfe79d88	BELL-MAIN-2026-000032	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	2516f2ba-62c9-4f29-b86b-423ad765542f	c47d1a73-63a2-4495-af48-8c63cde7a428	958301dd-b4cd-48bd-8ab0-e9fe99b2cac2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Hubli - Bay 3	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-06 08:25:47.861	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-05 10:25:47.861	\N	\N	\N	3200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-05 08:25:47.861	2026-09-23 07:48:45.731	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-06 08:25:47.861	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
7f741e90-4f7f-4c93-8c42-36d4ba29971a	BELL-MAIN-2026-000033	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	67756409-f447-4a92-8f0a-cb859c9e664c	0450b534-f413-4064-b9b7-3ad1fa6eb25c	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hyundai Haveri - Bay 4	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-19 08:27:51.317	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-17 10:27:51.317	\N	\N	\N	5000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-17 08:27:51.317	2026-09-23 07:48:45.735	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-19 08:27:51.317	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
e323ba8e-fb9b-48ac-852f-870dd17ce8b5	BELL-MAIN-2026-000034	2e310667-1c46-4818-ac37-379d159a30f7	f658801b-24b1-4471-b4b6-b765d77c67c4	28869f10-6ac5-4cf2-9388-f26d661750ea	ecfbc3ce-8eae-438b-844b-4be93d4279d0	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MD Department Bangalore - Bay 5	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-05 08:29:54.773	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-04 10:29:54.773	\N	\N	\N	9500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-04 08:29:54.773	2026-09-23 07:48:45.74	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-05 08:29:54.773	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
ebc460f7-17c1-473d-9f58-808bf980e1c4	BELL-MAIN-2026-000035	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	3cdd0057-fb6b-48e4-b993-d44151cc7b42	48d3a965-80a2-4fe1-b8fb-fad5d02731e7	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MD House Bangalore - Bay 6	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-20 08:31:58.229	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-18 10:31:58.229	\N	\N	\N	2400	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-18 08:31:58.229	2026-09-23 07:48:45.743	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-20 08:31:58.229	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
fd4c21ee-c7e6-4b7d-8c93-713dbb49e9ae	BELL-MAIN-2026-000036	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	e4aba731-eb4b-4394-843c-7f704d4838f9	3bd56fb7-59f4-436e-acf0-75f2d32caa89	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	MD House Hubli - Bay 7	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-19 08:34:01.685	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 12:04:01.685	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:34:01.685	\N	\N	\N	3800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 08:34:01.685	2026-09-23 07:48:45.747	1. Verify 3-phase neutral balance. 2. Replace failing MeanWell constant-current drivers. 3. Secure cable gland terminations.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-19 08:34:01.685	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
84b7c1dc-00f5-4f1a-b5b0-59b50d5cb381	BELL-MAIN-2026-000037	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	0244afde-2a2e-4282-95ca-dc1abad52b6e	77482462-625b-4554-b7b6-4bb0c2900069	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MG Motors Belgaum - Bay 8	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-09-14 08:36:05.141	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-12 12:06:05.141	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-12 10:36:05.141	\N	\N	\N	4200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-12 08:36:05.141	2026-09-23 07:48:45.751	1. Backwash sand media filter. 2. Replace 5-micron spun polypropylene cartridges. 3. Clean Dow Filmtec membrane with citric acid wash.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-14 08:36:05.141	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
bc621456-a4f1-4ca0-afb4-76ffac6880f4	BELL-MAIN-2026-000115	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	4c9d1366-ba6f-40d4-be29-f85162d2c069	265446e9-0314-4f84-8e1f-3b364635560b	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	c9788a8d-ec88-4679-b72a-9dcae52c45a5	HIGH	service desk	need CPU	current cpu is not working	2026-09-24 11:19:03.544	APPROVED	APPROVED	\N	\N	\N	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 11:19:53.845	\N	\N	\N	15000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 11:19:03.551	2026-09-23 11:19:53.846	\N	\N	\N	\N	Server & IT Network Hub	\N	f05c3052-87bd-4a3a-b7be-347e33a33cd9	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-24 11:19:03.544	\N	12	\N	\N	NOT_REQUIRED	\N	7865987678	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
4e064602-d295-479f-b719-477ff80b22be	BELL-MAIN-2026-000039	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	3898fdc6-de13-4b0b-9adb-8499305d3559	9fce4cc9-e4c7-46b3-a21c-01de69369a0f	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MG Motors Hubli - Bay 2	Server Room Liebert Precision AC High Temperature Alarm (28°C)	Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.	2026-09-13 08:40:12.053	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-12 12:10:12.053	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-12 10:40:12.053	\N	\N	\N	7800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-12 08:40:12.053	2026-09-23 07:48:45.762	1. Electronic sniffer leak test on flare connections. 2. Braze cracked condenser coil return bend. 3. Evacuate to 500 microns and charge R410A.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-13 08:40:12.053	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
8ffc3841-5441-4130-8178-3f46f7a40f6e	BELL-MAIN-2026-000040	2e310667-1c46-4818-ac37-379d159a30f7	97c3f3a3-b74f-4358-8b0d-f676e2f35d7a	1c2b8e43-245d-42a3-adb5-2671be4b95ba	b16448ef-ee35-4cc5-954f-64c3a0be802e	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Sony Hubli - Bay 3	Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked	Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.	2026-09-17 08:42:15.509	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 12:12:15.509	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:42:15.509	\N	\N	\N	3500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 08:42:15.509	2026-09-23 07:48:45.767	1. Descale water chiller internal heat exchanger. 2. Flush silicone cooling tubes. 3. Replace copper alloy electrode caps.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-17 08:42:15.509	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
6a31a101-5bad-4e53-8158-721e00bd85ff	BELL-MAIN-2026-000041	2e310667-1c46-4818-ac37-379d159a30f7	1e67c4bd-ca0e-402e-822f-bc358916769c	0f8bf570-765d-4b8f-b135-2261fc299a6d	5bf9c7f0-7cfa-42b6-94ea-bc73fc53831a	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Swaraj Hubli - Bay 4	Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination	Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.	2026-09-18 08:44:18.965	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-15 12:14:18.965	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-15 10:44:18.965	\N	\N	\N	14500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-15 08:44:18.965	2026-09-23 07:48:45.772	1. Diamond grind damaged floor section. 2. Neutralize acid with alkaline solution. 3. Apply moisture barrier primer and recoat 2-pack polyurethane.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-18 08:44:18.965	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
1790fc3f-a48a-4203-b74f-e63df64b02a0	BELL-MAIN-2026-000042	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	15daf98f-36f7-4c83-894e-6c969eab0675	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Tata Motors Bellary - Bay 5	Customer Restroom Sensor Faucets Non-Responsive	Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.	2026-09-11 08:46:22.421	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-08 12:16:22.421	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-08 10:46:22.421	\N	\N	\N	1600	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-08 08:46:22.421	2026-09-23 07:48:45.776	1. Disassemble solenoid cartridge. 2. Soak EPDM diaphragms in descaling agent. 3. Install new 6V lithium battery packs.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-11 08:46:22.421	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
e9048dad-433f-4c01-adbf-d01a543adfed	BELL-MAIN-2026-000043	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	afbb8543-7464-4290-ae99-4d3c654fb777	dd68c990-eb26-47a9-a147-b3f39e52d797	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Tata Motors Bommasandra Bangalore - Bay 6	CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded	Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.	2026-09-13 08:48:25.877	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-11 12:18:25.877	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-11 10:48:25.877	\N	\N	\N	6500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-11 08:48:25.877	2026-09-23 07:48:45.78	1. Hot-swap defective 4TB WD Purple enterprise surveillance hard drive. 2. Rebuild RAID volume through storage controller web interface.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-13 08:48:25.877	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
73c15eb2-90b6-40b9-b70e-aa8805e03bc9	BELL-MAIN-2026-000044	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	cdfa8b61-1211-4989-b098-ccec8afe83e7	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Gangavathi - Bay 7	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-04 07:50:29.333	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-03 11:20:29.333	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-03 09:50:29.333	\N	\N	\N	4500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-03 07:50:29.333	2026-09-23 07:48:45.784	1. Lockout-tagout power. 2. Depressurize hydraulic circuit. 3. Disassemble cylinder gland and replace polyurethane seals. 4. Refill ISO 68 oil and load-test.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-04 07:50:29.333	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
f47106c9-30ff-4e5d-a59d-53979374be82	BELL-MAIN-2026-000045	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	25987508-ee1d-4722-b814-5f6596cc783a	74ef73ac-bcce-487a-9798-e0db05cd0aa2	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Hospet - Bay 8	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-09-16 07:52:32.789	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-15 11:22:32.789	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-15 09:52:32.789	\N	\N	\N	8200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-15 07:52:32.789	2026-09-23 07:48:45.789	1. Inspect Danfoss pressure switch contacts. 2. Calibrate cut-in/cut-out thresholds. 3. Test pilot solenoid valve operation under full line load.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-16 07:52:32.789	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
de1ff722-784e-405e-bbdb-2a6a2de37825	BELL-MAIN-2026-000046	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Tata Motors Koppal - Bay 1	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-18 07:54:36.245	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 11:24:36.245	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 09:54:36.245	\N	\N	\N	1800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 07:54:36.245	2026-09-23 07:48:45.794	1. Remove intake louvers. 2. Nitrogen flush condensate drain pipe. 3. Inspect lift pump impeller and clean pan with antibacterial tablet.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	ASSIGNED	2026-09-18 07:54:36.245	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
4cd4e1bc-7839-4cc7-b50e-1c093ccb9a51	BELL-MAIN-2026-000047	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	67234d49-0607-43eb-b468-7a1a742b5f59	b4585701-6704-4e3b-af7c-9bb115c6701b	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Raichur - Bay 2	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-01 07:56:39.701	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-08-31 11:26:39.701	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-08-31 09:56:39.701	\N	\N	\N	3200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-08-31 07:56:39.701	2026-09-23 07:48:45.798	1. Isolate motor MCC panel. 2. Inspect pulley alignment with laser tool. 3. Install matched set of SPA-1600 cogged V-belts. 4. Check CFM airflow.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-01 07:56:39.701	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
5c535968-0658-4eff-9330-6941b14bdcbd	BELL-MAIN-2026-000048	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	5ff7f408-a107-4d91-ae42-6eab5d066fa0	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Tata Motors Sarjapur Bangalore - Bay 3	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-16 07:58:43.157	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-14 11:28:43.157	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-14 09:58:43.157	\N	\N	\N	5000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-14 07:58:43.157	2026-09-23 07:48:45.802	1. Clean optical glass filters with isopropanol. 2. Level target fixture with digital inclinometer. 3. Run OEM compensation routine with master bar.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-16 07:58:43.157	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
49b69ec1-f5b9-4053-91c8-5419c33d12b0	BELL-MAIN-2026-000049	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	d8dbd457-63e9-4040-b873-267bf4712118	5eb176c4-1e46-4e18-9a96-45bda861c64a	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Sarjapur Workshop - Bay 4	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-12 08:00:46.613	APPROVED	ASSIGNED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-11 11:30:46.613	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-11 10:00:46.613	\N	\N	\N	9500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-11 08:00:46.613	2026-09-23 07:48:45.808	1. Replace defective 12V 120Ah lead-acid starter battery. 2. Calibrate AMF sensing PCB timer. 3. Execute simulated grid outage switchover.	\N	\N	\N	Mechanical Bay 1-4	+91 9845045678	f93185a6-0745-4888-aa1c-e51fa4106c40	\N	OPEN	t	\N	NOT_STARTED	ASSIGNED	2026-09-12 08:00:46.613	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
03e99ff3-29af-46de-ac1a-bd7aed8a5bee	BELL-MAIN-2026-000051	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	aec92a78-c6ca-40ef-8a2d-9eb98c51e38f	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Ather Energy Belgaum - Bay 6	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-20 08:04:53.525	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-17 11:34:53.525	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-17 10:04:53.525	2026-09-17 12:34:53.525	\N	\N	3800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-17 08:04:53.525	2026-09-23 07:48:45.816	1. Verify 3-phase neutral balance. 2. Replace failing MeanWell constant-current drivers. 3. Secure cable gland terminations.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-20 08:04:53.525	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
7e8791f9-4c65-4d20-879f-66d7cfbb8c7d	BELL-MAIN-2026-000052	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a897678b-8f1f-49f2-8fa7-aa5ab301d5c7	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Ather Bangalore - Bay 7	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-09-11 08:06:56.981	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-09 11:36:56.981	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-09 10:06:56.981	2026-09-09 12:36:56.981	\N	\N	4200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-09 08:06:56.981	2026-09-23 07:48:45.824	1. Backwash sand media filter. 2. Replace 5-micron spun polypropylene cartridges. 3. Clean Dow Filmtec membrane with citric acid wash.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-11 08:06:56.981	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
2b45d87e-ea75-44fb-bd6f-2df9be49f43b	BELL-MAIN-2026-000116	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	265446e9-0314-4f84-8e1f-3b364635560b	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	hello	sdf	dsffds	2026-09-24 11:43:16.05	PENDING	WAITING_FOR_APPROVAL	\N	\N	\N	\N	\N	\N	\N	\N	0	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 11:43:16.06	2026-09-23 11:43:16.06	\N	\N	\N	\N	IT department 	\N	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_APPROVAL	2026-09-24 11:43:16.05	\N	12	\N	\N	NOT_REQUIRED	\N	23234	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
5bd03715-3e1a-4407-8c94-1b26a032933b	BELL-MAIN-2026-000053	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	8267385b-f101-4266-9c36-b6413a1e8bb6	6e4178c4-f806-4a41-b122-a4566e58fe9b	7d29c8c5-d4e5-48f6-9af4-4193a7bf1ed2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Bommasandra Bangalore - Bay 8	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-04 08:09:00.437	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-03 11:39:00.437	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-03 10:09:00.437	2026-09-03 12:39:00.437	\N	\N	11000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-03 08:09:00.437	2026-09-23 07:48:45.829	1. Disconnect hydraulic quick-coupler. 2. Measure circuit relief pressure. 3. Replace orbital hydraulic motor and flushed bypass valve.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-04 08:09:00.437	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
b32d65fc-538d-49ca-be9d-129ad29b74ab	BELL-MAIN-2026-000054	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	e18f7e62-e43b-43e0-9cfb-cf757c51986c	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Energy Hubli - Bay 1	Server Room Liebert Precision AC High Temperature Alarm (28°C)	Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.	2026-09-03 08:11:03.893	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-02 11:41:03.893	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-02 10:11:03.893	2026-09-02 12:41:03.893	\N	\N	7800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-02 08:11:03.893	2026-09-23 07:48:45.836	1. Electronic sniffer leak test on flare connections. 2. Braze cracked condenser coil return bend. 3. Evacuate to 500 microns and charge R410A.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	IN_PROGRESS	2026-09-03 08:11:03.893	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
fcbaeb3e-6bad-4309-8e7d-44c23d388261	BELL-MAIN-2026-000055	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	f8356d40-000e-48ce-bf31-3e757ff805e3	4f615162-c1d7-4e1b-94c7-b1c2cbe837f2	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Beltech Bangalore - Bay 2	Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked	Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.	2026-09-20 08:13:07.349	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-19 11:43:07.349	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-19 10:13:07.349	2026-09-19 12:43:07.349	\N	\N	3500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 08:13:07.349	2026-09-23 07:48:45.842	1. Descale water chiller internal heat exchanger. 2. Flush silicone cooling tubes. 3. Replace copper alloy electrode caps.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-20 08:13:07.349	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
a03758bf-48bd-425e-9d72-0a456384cf18	BELL-MAIN-2026-000056	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	6c9f266b-02e1-4a74-a57b-9732c2c81c23	ac10bb19-9e42-4f76-8a90-61d3385ef600	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Beltech Goa - Bay 3	Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination	Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.	2026-09-23 08:15:10.805	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-20 11:45:10.805	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-20 10:15:10.805	2026-09-20 12:45:10.805	\N	\N	14500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-20 08:15:10.805	2026-09-23 07:48:45.848	1. Diamond grind damaged floor section. 2. Neutralize acid with alkaline solution. 3. Apply moisture barrier primer and recoat 2-pack polyurethane.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-23 08:15:10.805	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
60d1386d-d792-4580-9a15-64888c1d1da5	BELL-MAIN-2026-000057	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	48e27d0f-82ca-486f-b0a7-094188cb9014	1db5ef20-9e3e-497a-9379-f41157d92689	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Beltech Hubli - Bay 4	Customer Restroom Sensor Faucets Non-Responsive	Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.	2026-09-11 08:17:14.261	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-08 11:47:14.261	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-08 10:17:14.261	2026-09-08 12:47:14.261	\N	\N	1600	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-08 08:17:14.261	2026-09-23 07:48:45.856	1. Disassemble solenoid cartridge. 2. Soak EPDM diaphragms in descaling agent. 3. Install new 6V lithium battery packs.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-11 08:17:14.261	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
ad0981d4-d720-4479-a90d-4a717bfbfa99	BELL-MAIN-2026-000058	2e310667-1c46-4818-ac37-379d159a30f7	f7aa29cf-7a33-47d5-8fd5-df043f7448a0	9ffc9414-f95d-4344-b770-3a56e4a95d75	e8b28bba-6710-40f5-95e4-3cc63f71746e	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Back Office Hubli - Bay 5	CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded	Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.	2026-09-08 08:19:17.717	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-06 11:49:17.717	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-06 10:19:17.717	2026-09-06 12:49:17.717	\N	\N	6500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-06 08:19:17.717	2026-09-23 07:48:45.862	1. Hot-swap defective 4TB WD Purple enterprise surveillance hard drive. 2. Rebuild RAID volume through storage controller web interface.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-08 08:19:17.717	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
fe91c5e8-8181-49dc-b665-d8cd25aac83e	BELL-MAIN-2026-000059	2e310667-1c46-4818-ac37-379d159a30f7	dd42f648-4887-4eea-a658-1c33796f8412	ba7a9081-fa66-4878-8fcf-d217f465a646	cafeac1a-2bc9-43b4-a888-6aaf84095a6c	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Chevrolet Belgaum - Bay 6	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-20 08:21:21.173	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-19 11:51:21.173	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-19 10:21:21.173	2026-09-19 12:51:21.173	\N	\N	4500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 08:21:21.173	2026-09-23 07:48:45.867	1. Lockout-tagout power. 2. Depressurize hydraulic circuit. 3. Disassemble cylinder gland and replace polyurethane seals. 4. Refill ISO 68 oil and load-test.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-20 08:21:21.173	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
0d8c4f0a-a810-412e-a69c-e0b615ac7682	BELL-MAIN-2026-000060	2e310667-1c46-4818-ac37-379d159a30f7	8774585c-a9bb-4c1c-a5eb-7db85543530c	c512bc52-6b64-4258-b319-ade81c809cf9	265446e9-0314-4f84-8e1f-3b364635560b	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	CNH Hubli - Bay 7	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-09-06 08:23:24.629	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-05 11:53:24.629	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-05 10:23:24.629	2026-09-05 12:53:24.629	\N	\N	8200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-05 08:23:24.629	2026-09-23 07:48:45.874	1. Inspect Danfoss pressure switch contacts. 2. Calibrate cut-in/cut-out thresholds. 3. Test pilot solenoid valve operation under full line load.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-06 08:23:24.629	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
9c20c2d8-6691-48ed-af25-a45d7e37a657	BELL-MAIN-2026-000061	2e310667-1c46-4818-ac37-379d159a30f7	29e2cdbc-abdf-422f-9036-79cfa70b0d70	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	6ef083e2-cc35-40db-a160-014595678a38	3acd2c54-f54e-4908-8fe4-b870d03a5452	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	CRM Hubli - Bay 8	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-04 08:25:28.085	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-02 11:55:28.085	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-02 10:25:28.085	2026-09-02 12:55:28.085	\N	\N	1800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-02 08:25:28.085	2026-09-23 07:48:45.879	1. Remove intake louvers. 2. Nitrogen flush condensate drain pipe. 3. Inspect lift pump impeller and clean pan with antibacterial tablet.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-04 08:25:28.085	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
0c92e1db-1fa9-4243-aa1c-dbfe5920e0a3	BELL-MAIN-2026-000062	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	26876c43-7084-4bc1-9085-203fe4893588	a5e37161-3a17-4b45-8a80-aba8da91e43a	958301dd-b4cd-48bd-8ab0-e9fe99b2cac2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	D7D - Bay 1	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-11 08:27:31.541	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-10 11:57:31.541	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-10 10:27:31.541	2026-09-10 12:57:31.541	\N	\N	3200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-10 08:27:31.541	2026-09-23 07:48:45.884	1. Isolate motor MCC panel. 2. Inspect pulley alignment with laser tool. 3. Install matched set of SPA-1600 cogged V-belts. 4. Check CFM airflow.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	IN_PROGRESS	2026-09-11 08:27:31.541	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
c72d818f-de67-47e1-b9fd-5a7d3ae8b3d8	BELL-MAIN-2026-000063	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	086c6225-d976-41af-a6ed-8b90f88b27ce	81e0adea-4293-4d69-a5ed-e5c0c7d6d981	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Gabbur Hubli - Bay 2	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-08 08:29:34.997	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-06 11:59:34.997	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-06 10:29:34.997	2026-09-06 12:59:34.997	\N	\N	5000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-06 08:29:34.997	2026-09-23 07:48:45.891	1. Clean optical glass filters with isopropanol. 2. Level target fixture with digital inclinometer. 3. Run OEM compensation routine with master bar.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-08 08:29:34.997	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
b6cb63b1-6a66-4183-90d4-e09aed2b5082	BELL-MAIN-2026-000064	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	c47d1a73-63a2-4495-af48-8c63cde7a428	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hero MotoCorp Dharwad - Bay 3	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-22 08:31:38.453	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-21 12:01:38.453	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-21 10:31:38.453	2026-09-21 13:01:38.453	\N	\N	9500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-21 08:31:38.453	2026-09-23 07:48:45.897	1. Replace defective 12V 120Ah lead-acid starter battery. 2. Calibrate AMF sensing PCB timer. 3. Execute simulated grid outage switchover.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-22 08:31:38.453	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
7e9503e3-4e8f-4bc4-95f9-ec1482032333	BELL-MAIN-2026-000065	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	5f71bbf4-677d-4944-befc-b47325ff7c24	0450b534-f413-4064-b9b7-3ad1fa6eb25c	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hero MotoCorp Hubli - Bay 4	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-21 08:33:41.909	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-19 12:03:41.909	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-19 10:33:41.909	2026-09-19 13:03:41.909	\N	\N	2400	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 08:33:41.909	2026-09-23 07:48:45.902	1. Clean radar sensor lens. 2. Adjust beam detection angle and sensitivity potentiometer. 3. Lubricate carriage track nylon rollers.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-21 08:33:41.909	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
76ae857a-3221-4911-9621-54e23a37d0c2	BELL-MAIN-2026-000066	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	4c9d1366-ba6f-40d4-be29-f85162d2c069	ecfbc3ce-8eae-438b-844b-4be93d4279d0	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Head Office Hubli - Bay 5	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-24 08:35:45.365	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-21 12:05:45.365	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-21 10:35:45.365	2026-09-21 13:05:45.365	\N	\N	3800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-21 08:35:45.365	2026-09-23 07:48:45.909	1. Verify 3-phase neutral balance. 2. Replace failing MeanWell constant-current drivers. 3. Secure cable gland terminations.	\N	\N	\N	Executive Suite Floor 3	+91 9845045678	6b2e9838-f1d7-490c-9f86-4338b88376e7	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-24 08:35:45.365	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
7aa3c28e-696a-4280-9147-539d287188b9	BELL-MAIN-2026-000067	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	48d3a965-80a2-4fe1-b8fb-fad5d02731e7	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hyundai Dharwad - Bay 6	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-09-13 08:37:48.821	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-11 12:07:48.821	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-11 10:37:48.821	2026-09-11 13:07:48.821	\N	\N	4200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-11 08:37:48.821	2026-09-23 07:48:45.914	1. Backwash sand media filter. 2. Replace 5-micron spun polypropylene cartridges. 3. Clean Dow Filmtec membrane with citric acid wash.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-13 08:37:48.821	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
de3a3406-db8e-4a9a-94a9-d0a523c9aebb	BELL-MAIN-2026-000068	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	e8bbf769-4f3b-4ab1-a848-08b266d80f10	3bd56fb7-59f4-436e-acf0-75f2d32caa89	a8d25d4f-c91d-4e13-a3e0-9f7fce7ce24b	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Gadag - Bay 7	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-13 08:39:52.277	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-12 12:09:52.277	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-12 10:39:52.277	2026-09-12 13:09:52.277	\N	\N	11000	0	\N	\N	\N	\N	t	Vibration and high acoustic noise reoccurred after 2 hours under peak operational load.	2026-09-12 20:39:52.277	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-12 08:39:52.277	2026-09-23 07:48:45.919	1. Disconnect hydraulic quick-coupler. 2. Measure circuit relief pressure. 3. Replace orbital hydraulic motor and flushed bypass valve.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	IN_PROGRESS	IN_PROGRESS	2026-09-13 08:39:52.277	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
d4ad56fd-6b9a-4449-a6cb-309440a65d5c	BELL-MAIN-2026-000069	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	2516f2ba-62c9-4f29-b86b-423ad765542f	77482462-625b-4554-b7b6-4bb0c2900069	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Hubli - Bay 8	Server Room Liebert Precision AC High Temperature Alarm (28°C)	Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.	2026-09-02 08:41:55.733	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-01 12:11:55.733	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-01 10:41:55.733	2026-09-01 13:11:55.733	\N	\N	7800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-01 08:41:55.733	2026-09-23 07:48:45.927	1. Electronic sniffer leak test on flare connections. 2. Braze cracked condenser coil return bend. 3. Evacuate to 500 microns and charge R410A.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	IN_PROGRESS	2026-09-02 08:41:55.733	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
d91ff9ab-ae5b-4ec0-859a-963998d8feb4	BELL-MAIN-2026-000070	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	67756409-f447-4a92-8f0a-cb859c9e664c	a95613ac-3cd8-4e26-8d14-7b5aefd285ae	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Haveri - Bay 1	Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked	Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.	2026-09-14 08:43:59.189	APPROVED	IN_PROGRESS	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-13 12:13:59.189	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-13 10:43:59.189	2026-09-13 13:13:59.189	\N	\N	3500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-13 08:43:59.189	2026-09-23 07:48:45.933	1. Descale water chiller internal heat exchanger. 2. Flush silicone cooling tubes. 3. Replace copper alloy electrode caps.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	IN_PROGRESS	2026-09-14 08:43:59.189	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
ad7ac685-23e6-4a67-a138-33255e4dd00e	BELL-MAIN-2026-000071	2e310667-1c46-4818-ac37-379d159a30f7	f658801b-24b1-4471-b4b6-b765d77c67c4	28869f10-6ac5-4cf2-9388-f26d661750ea	9fce4cc9-e4c7-46b3-a21c-01de69369a0f	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	MD Department Bangalore - Bay 2	Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination	Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.	2026-09-25 08:46:02.645	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-22 12:16:02.645	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-22 10:46:02.645	2026-09-22 13:16:02.645	\N	\N	14500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-22 08:46:02.645	2026-09-23 07:48:45.939	1. Diamond grind damaged floor section. 2. Neutralize acid with alkaline solution. 3. Apply moisture barrier primer and recoat 2-pack polyurethane.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-25 08:46:02.645	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
c30d680f-8b2e-4314-9b16-96c1f2452a3f	BELL-MAIN-2026-000072	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	3cdd0057-fb6b-48e4-b993-d44151cc7b42	b16448ef-ee35-4cc5-954f-64c3a0be802e	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	MD House Bangalore - Bay 3	Customer Restroom Sensor Faucets Non-Responsive	Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.	2026-09-22 08:48:06.101	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-19 12:18:06.101	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-19 10:48:06.101	2026-09-19 13:18:06.101	\N	\N	1600	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 08:48:06.101	2026-09-23 07:48:45.944	1. Disassemble solenoid cartridge. 2. Soak EPDM diaphragms in descaling agent. 3. Install new 6V lithium battery packs.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-22 08:48:06.101	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
3534c52b-b76b-4f16-a8ef-6995ad23153a	BELL-MAIN-2026-000073	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	e4aba731-eb4b-4394-843c-7f704d4838f9	5bf9c7f0-7cfa-42b6-94ea-bc73fc53831a	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MD House Hubli - Bay 4	CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded	Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.	2026-09-11 07:50:09.557	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-09 11:20:09.557	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-09 09:50:09.557	2026-09-09 12:20:09.557	\N	\N	6500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-09 07:50:09.557	2026-09-23 07:48:45.947	1. Hot-swap defective 4TB WD Purple enterprise surveillance hard drive. 2. Rebuild RAID volume through storage controller web interface.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-11 07:50:09.557	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
d09f9082-4308-4fb7-b4b2-8b7342bbe655	BELL-MAIN-2026-000074	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	0244afde-2a2e-4282-95ca-dc1abad52b6e	15daf98f-36f7-4c83-894e-6c969eab0675	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MG Motors Belgaum - Bay 5	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-06 07:52:13.013	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-05 11:22:13.013	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-05 09:52:13.013	2026-09-05 12:22:13.013	\N	\N	4500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-05 07:52:13.013	2026-09-23 07:48:45.951	1. Lockout-tagout power. 2. Depressurize hydraulic circuit. 3. Disassemble cylinder gland and replace polyurethane seals. 4. Refill ISO 68 oil and load-test.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-06 07:52:13.013	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
14ea07ff-c5cf-40fb-b109-eb8f53085ea7	BELL-MAIN-2026-000075	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	030411fe-e37d-4442-b121-603d4813f5bf	dd68c990-eb26-47a9-a147-b3f39e52d797	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MG Motors Gulbarga - Bay 6	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-08-30 07:54:16.469	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-08-29 11:24:16.469	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-08-29 09:54:16.469	2026-08-29 12:24:16.469	\N	\N	8200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-08-29 07:54:16.469	2026-09-23 07:48:45.957	1. Inspect Danfoss pressure switch contacts. 2. Calibrate cut-in/cut-out thresholds. 3. Test pilot solenoid valve operation under full line load.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-08-30 07:54:16.469	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
c6e2f83f-af02-4fa6-a70f-6dfa74c04b85	BELL-MAIN-2026-000076	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	3898fdc6-de13-4b0b-9adb-8499305d3559	cdfa8b61-1211-4989-b098-ccec8afe83e7	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MG Motors Hubli - Bay 7	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-21 07:56:19.925	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-19 11:26:19.925	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-19 09:56:19.925	2026-09-19 12:26:19.925	\N	\N	1800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-19 07:56:19.925	2026-09-23 07:48:45.961	1. Remove intake louvers. 2. Nitrogen flush condensate drain pipe. 3. Inspect lift pump impeller and clean pan with antibacterial tablet.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-21 07:56:19.925	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
bc2c4645-efb4-47e3-902e-76d34d7a9d12	BELL-MAIN-2026-000077	2e310667-1c46-4818-ac37-379d159a30f7	97c3f3a3-b74f-4358-8b0d-f676e2f35d7a	1c2b8e43-245d-42a3-adb5-2671be4b95ba	74ef73ac-bcce-487a-9798-e0db05cd0aa2	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Sony Hubli - Bay 8	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-23 07:58:23.381	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-22 11:28:23.381	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-22 09:58:23.381	2026-09-22 12:28:23.381	\N	\N	3200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-22 07:58:23.381	2026-09-23 07:48:45.965	1. Isolate motor MCC panel. 2. Inspect pulley alignment with laser tool. 3. Install matched set of SPA-1600 cogged V-belts. 4. Check CFM airflow.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-23 07:58:23.381	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
c518ff44-1f26-46b5-9938-41a838d4e7ea	BELL-MAIN-2026-000078	2e310667-1c46-4818-ac37-379d159a30f7	1e67c4bd-ca0e-402e-822f-bc358916769c	0f8bf570-765d-4b8f-b135-2261fc299a6d	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Swaraj Hubli - Bay 1	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-20 08:00:26.837	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-18 11:30:26.837	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-18 10:00:26.837	2026-09-18 12:30:26.837	\N	\N	5000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-18 08:00:26.837	2026-09-23 07:48:45.97	1. Clean optical glass filters with isopropanol. 2. Level target fixture with digital inclinometer. 3. Run OEM compensation routine with master bar.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-20 08:00:26.837	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
c1677129-600c-48b4-956f-4a7bc34c7a0c	BELL-MAIN-2026-000079	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	b4585701-6704-4e3b-af7c-9bb115c6701b	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Bellary - Bay 2	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-17 08:02:30.293	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 11:32:30.293	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:02:30.293	2026-09-16 12:32:30.293	\N	\N	9500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 08:02:30.293	2026-09-23 07:48:45.974	1. Replace defective 12V 120Ah lead-acid starter battery. 2. Calibrate AMF sensing PCB timer. 3. Execute simulated grid outage switchover.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-17 08:02:30.293	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
a7f42c46-a564-462b-9f48-77679c77c245	BELL-MAIN-2026-000080	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	afbb8543-7464-4290-ae99-4d3c654fb777	5ff7f408-a107-4d91-ae42-6eab5d066fa0	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Tata Motors Bommasandra Bangalore - Bay 3	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-12 08:04:33.749	APPROVED	WAITING_FOR_PURCHASE	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-10 11:34:33.749	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-10 10:04:33.749	2026-09-10 12:34:33.749	\N	\N	2400	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-10 08:04:33.749	2026-09-23 07:48:45.979	1. Clean radar sensor lens. 2. Adjust beam detection angle and sensitivity potentiometer. 3. Lubricate carriage track nylon rollers.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_PURCHASE	2026-09-12 08:04:33.749	\N	12	+91 9845023456	OEM spare parts ordered from approved supplier. Delivery expected within 48 hours.	PURCHASE_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
f37d2d08-4ee3-4a69-8bab-e1dc70f38ad5	BELL-MAIN-2026-000081	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	5eb176c4-1e46-4e18-9a96-45bda861c64a	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Tata Motors Gangavathi - Bay 4	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-19 08:06:37.205	APPROVED	WAITING_FOR_VENDOR	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 11:36:37.205	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:06:37.205	2026-09-16 12:36:37.205	\N	\N	3800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-16 08:06:37.205	2026-09-23 07:48:45.983	1. Verify 3-phase neutral balance. 2. Replace failing MeanWell constant-current drivers. 3. Secure cable gland terminations.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_VENDOR	2026-09-19 08:06:37.205	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
7cb88513-1ff9-4cac-ab15-a7c0a2d41ff4	BELL-MAIN-2026-000082	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	25987508-ee1d-4722-b814-5f6596cc783a	970518e5-8654-4f26-a37c-6a326da6db69	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Tata Motors Hospet - Bay 5	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-09-17 08:08:40.661	APPROVED	WAITING_FOR_VENDOR	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-15 11:38:40.661	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-15 10:08:40.661	2026-09-15 12:38:40.661	\N	\N	4200	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-15 08:08:40.661	2026-09-23 07:48:45.987	1. Backwash sand media filter. 2. Replace 5-micron spun polypropylene cartridges. 3. Clean Dow Filmtec membrane with citric acid wash.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_VENDOR	2026-09-17 08:08:40.661	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
8a476908-a3dc-4b62-9123-fe72cabb0ed7	BELL-MAIN-2026-000083	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	aec92a78-c6ca-40ef-8a2d-9eb98c51e38f	7d29c8c5-d4e5-48f6-9af4-4193a7bf1ed2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Koppal - Bay 6	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-19 08:10:44.117	APPROVED	WAITING_FOR_VENDOR	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-18 11:40:44.117	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-18 10:10:44.117	2026-09-18 12:40:44.117	\N	\N	11000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-18 08:10:44.117	2026-09-23 07:48:45.992	1. Disconnect hydraulic quick-coupler. 2. Measure circuit relief pressure. 3. Replace orbital hydraulic motor and flushed bypass valve.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_VENDOR	2026-09-19 08:10:44.117	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
8c179cf7-4dc2-412d-9071-12f3d01cee00	BELL-MAIN-2026-000084	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	67234d49-0607-43eb-b468-7a1a742b5f59	a897678b-8f1f-49f2-8fa7-aa5ab301d5c7	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Raichur - Bay 7	Server Room Liebert Precision AC High Temperature Alarm (28°C)	Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.	2026-09-23 08:12:47.573	APPROVED	WAITING_FOR_VENDOR	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-22 11:42:47.573	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-22 10:12:47.573	2026-09-22 12:42:47.573	\N	\N	7800	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-22 08:12:47.573	2026-09-23 07:48:45.996	1. Electronic sniffer leak test on flare connections. 2. Braze cracked condenser coil return bend. 3. Evacuate to 500 microns and charge R410A.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_VENDOR	2026-09-23 08:12:47.573	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
65a94fbf-060f-4322-a38c-a2a4153be1dc	BELL-MAIN-2026-000085	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	6e4178c4-f806-4a41-b122-a4566e58fe9b	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Sarjapur Bangalore - Bay 8	Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked	Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.	2026-09-22 08:14:51.029	APPROVED	WAITING_FOR_VENDOR	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-21 11:44:51.029	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-21 10:14:51.029	2026-09-21 12:44:51.029	\N	\N	3500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-21 08:14:51.029	2026-09-23 07:48:46	1. Descale water chiller internal heat exchanger. 2. Flush silicone cooling tubes. 3. Replace copper alloy electrode caps.	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	WAITING_FOR_VENDOR	2026-09-22 08:14:51.029	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
bfb358ae-3aa4-4523-9904-b6e6382b629e	BELL-MAIN-2026-000086	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	d8dbd457-63e9-4040-b873-267bf4712118	e18f7e62-e43b-43e0-9cfb-cf757c51986c	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Tata Motors Sarjapur Workshop - Bay 1	Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination	Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.	2026-09-18 08:16:54.485	APPROVED	WAITING_FOR_VENDOR	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-15 11:46:54.485	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-15 10:16:54.485	2026-09-15 12:46:54.485	\N	\N	14500	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-15 08:16:54.485	2026-09-23 07:48:46.005	1. Diamond grind damaged floor section. 2. Neutralize acid with alkaline solution. 3. Apply moisture barrier primer and recoat 2-pack polyurethane.	\N	\N	\N	Customer Lounge	+91 9845045678	f6eb1570-5dde-4420-a059-cd75faf3c65c	\N	OPEN	f	\N	NOT_STARTED	WAITING_FOR_VENDOR	2026-09-18 08:16:54.485	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
2cd513e7-8498-44a0-9982-2a1f7435b921	BELL-MAIN-2026-000087	2e310667-1c46-4818-ac37-379d159a30f7	0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	f13bd4c8-950c-4605-b6c3-587ece85dac5	4f615162-c1d7-4e1b-94c7-b1c2cbe837f2	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Used Cars - Bay 2	Customer Restroom Sensor Faucets Non-Responsive	Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.	2026-09-07 08:18:57.941	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-04 11:48:57.941	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-04 10:18:57.941	2026-09-04 12:48:57.941	2026-09-07 03:18:57.941	\N	1600	1673	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-04 08:18:57.941	2026-09-23 07:48:46.01	1. Disassemble solenoid cartridge. 2. Soak EPDM diaphragms in descaling agent. 3. Install new 6V lithium battery packs.	67	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-07 03:18:57.941	COMPLETED	COMPLETED	2026-09-07 08:18:57.941	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
47d5be87-bb7e-4e7f-ab9e-d2d925d0908c	BELL-MAIN-2026-000088	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	ac10bb19-9e42-4f76-8a90-61d3385ef600	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Ather Energy Belgaum - Bay 3	CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded	Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.	2026-09-11 08:21:01.397	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-09 11:51:01.397	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-09 10:21:01.397	2026-09-09 12:51:01.397	2026-09-11 03:21:01.397	\N	6500	6574	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-09 08:21:01.397	2026-09-23 07:48:46.016	1. Hot-swap defective 4TB WD Purple enterprise surveillance hard drive. 2. Rebuild RAID volume through storage controller web interface.	43	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-11 03:21:01.397	COMPLETED	COMPLETED	2026-09-11 08:21:01.397	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
e9e511bd-798c-4f40-acab-cd9279bbbcbe	BELL-MAIN-2026-000089	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	1db5ef20-9e3e-497a-9379-f41157d92689	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Bangalore - Bay 4	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-11 08:23:04.853	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-10 11:53:04.853	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-10 10:23:04.853	2026-09-10 12:53:04.853	2026-09-11 14:23:04.853	\N	4500	4575	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-10 08:23:04.853	2026-09-23 07:48:46.023	1. Lockout-tagout power. 2. Depressurize hydraulic circuit. 3. Disassemble cylinder gland and replace polyurethane seals. 4. Refill ISO 68 oil and load-test.	30	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-11 14:23:04.853	COMPLETED	COMPLETED	2026-09-11 08:23:04.853	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
6a4f0950-db4f-4b78-bff0-f8c037b7c482	BELL-MAIN-2026-000090	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	8267385b-f101-4266-9c36-b6413a1e8bb6	e8b28bba-6710-40f5-95e4-3cc63f71746e	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Ather Bommasandra Bangalore - Bay 5	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-09-20 08:25:08.309	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-19 11:55:08.309	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-19 10:25:08.309	2026-09-19 12:55:08.309	2026-09-20 03:25:08.309	\N	8200	8276	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-19 08:25:08.309	2026-09-23 07:48:46.03	1. Inspect Danfoss pressure switch contacts. 2. Calibrate cut-in/cut-out thresholds. 3. Test pilot solenoid valve operation under full line load.	19	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-20 03:25:08.309	COMPLETED	COMPLETED	2026-09-20 08:25:08.309	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
b4e0e976-0eed-4836-b809-44cab2f1d251	BELL-MAIN-2026-000091	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	cafeac1a-2bc9-43b4-a888-6aaf84095a6c	3acd2c54-f54e-4908-8fe4-b870d03a5452	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Ather Energy Hubli - Bay 6	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-19 08:27:11.765	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-17 11:57:11.765	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-17 10:27:11.765	2026-09-17 12:57:11.765	2026-09-19 03:27:11.765	\N	1800	1877	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-17 08:27:11.765	2026-09-23 07:48:46.036	1. Remove intake louvers. 2. Nitrogen flush condensate drain pipe. 3. Inspect lift pump impeller and clean pan with antibacterial tablet.	43	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-19 03:27:11.765	COMPLETED	COMPLETED	2026-09-19 08:27:11.765	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
66548a5f-cd4b-4d18-9cdb-d7132c216088	BELL-MAIN-2026-000092	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	f8356d40-000e-48ce-bf31-3e757ff805e3	265446e9-0314-4f84-8e1f-3b364635560b	958301dd-b4cd-48bd-8ab0-e9fe99b2cac2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Beltech Bangalore - Bay 7	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-17 08:29:15.221	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 11:59:15.221	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:29:15.221	2026-09-16 12:59:15.221	2026-09-17 14:29:15.221	\N	3200	3278	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-16 08:29:15.221	2026-09-23 07:48:46.043	1. Isolate motor MCC panel. 2. Inspect pulley alignment with laser tool. 3. Install matched set of SPA-1600 cogged V-belts. 4. Check CFM airflow.	30	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-17 14:29:15.221	COMPLETED	COMPLETED	2026-09-17 08:29:15.221	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
7d46ffe6-4ad6-478a-afe4-0305f62dd9cd	BELL-MAIN-2026-000093	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	6c9f266b-02e1-4a74-a57b-9732c2c81c23	6ef083e2-cc35-40db-a160-014595678a38	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Beltech Goa - Bay 8	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-03 08:31:18.677	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-01 12:01:18.677	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-01 10:31:18.677	2026-09-01 13:01:18.677	2026-09-03 03:31:18.677	\N	5000	5079	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-01 08:31:18.677	2026-09-23 07:48:46.048	1. Clean optical glass filters with isopropanol. 2. Level target fixture with digital inclinometer. 3. Run OEM compensation routine with master bar.	43	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-03 03:31:18.677	COMPLETED	COMPLETED	2026-09-03 08:31:18.677	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
79db6a48-9d52-4762-94bd-3835777fb82a	BELL-MAIN-2026-000094	2e310667-1c46-4818-ac37-379d159a30f7	f2a51b19-d251-43a0-a07b-eebc692ebbcf	48e27d0f-82ca-486f-b0a7-094188cb9014	a5e37161-3a17-4b45-8a80-aba8da91e43a	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Beltech Hubli - Bay 1	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-17 08:33:22.133	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-16 12:03:22.133	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 10:33:22.133	2026-09-16 13:03:22.133	2026-09-18 02:33:22.133	\N	9500	9580	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-16 08:33:22.133	2026-09-23 07:48:46.055	1. Replace defective 12V 120Ah lead-acid starter battery. 2. Calibrate AMF sensing PCB timer. 3. Execute simulated grid outage switchover.	42	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	2026-09-18 02:33:22.133	COMPLETED	COMPLETED	2026-09-17 08:33:22.133	18	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	OVERDUE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
fc52f07f-670d-454a-9775-56b49f712c14	BELL-MAIN-2026-000095	2e310667-1c46-4818-ac37-379d159a30f7	f7aa29cf-7a33-47d5-8fd5-df043f7448a0	9ffc9414-f95d-4344-b770-3a56e4a95d75	81e0adea-4293-4d69-a5ed-e5c0c7d6d981	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Back Office Hubli - Bay 2	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-15 08:35:25.589	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-13 12:05:25.589	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-13 10:35:25.589	2026-09-13 13:05:25.589	2026-09-15 14:35:25.589	\N	2400	2481	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-13 08:35:25.589	2026-09-23 07:48:46.061	1. Clean radar sensor lens. 2. Adjust beam detection angle and sensitivity potentiometer. 3. Lubricate carriage track nylon rollers.	54	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-15 14:35:25.589	COMPLETED	COMPLETED	2026-09-15 08:35:25.589	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
939d9cb9-2e12-45db-9fcb-bbcd96e46620	BELL-MAIN-2026-000096	2e310667-1c46-4818-ac37-379d159a30f7	dd42f648-4887-4eea-a658-1c33796f8412	ba7a9081-fa66-4878-8fcf-d217f465a646	c47d1a73-63a2-4495-af48-8c63cde7a428	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Chevrolet Belgaum - Bay 3	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-13 08:37:29.045	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-10 12:07:29.045	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-10 10:37:29.045	2026-09-10 13:07:29.045	2026-09-13 03:37:29.045	\N	3800	3882	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-10 08:37:29.045	2026-09-23 07:48:46.068	1. Verify 3-phase neutral balance. 2. Replace failing MeanWell constant-current drivers. 3. Secure cable gland terminations.	67	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-13 03:37:29.045	COMPLETED	COMPLETED	2026-09-13 08:37:29.045	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
d9a05135-9acb-448b-b4f2-94cb0c0374da	BELL-MAIN-2026-000097	2e310667-1c46-4818-ac37-379d159a30f7	8774585c-a9bb-4c1c-a5eb-7db85543530c	c512bc52-6b64-4258-b319-ade81c809cf9	0450b534-f413-4064-b9b7-3ad1fa6eb25c	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	CNH Hubli - Bay 4	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-09-05 08:39:32.501	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-03 12:09:32.501	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-03 10:39:32.501	2026-09-03 13:09:32.501	2026-09-05 03:39:32.501	\N	4200	4283	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-03 08:39:32.501	2026-09-23 07:48:46.075	1. Backwash sand media filter. 2. Replace 5-micron spun polypropylene cartridges. 3. Clean Dow Filmtec membrane with citric acid wash.	43	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-05 03:39:32.501	COMPLETED	COMPLETED	2026-09-05 08:39:32.501	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
a4859ccc-6e51-470d-8944-b988bff3a174	BELL-MAIN-2026-000098	2e310667-1c46-4818-ac37-379d159a30f7	29e2cdbc-abdf-422f-9036-79cfa70b0d70	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	ecfbc3ce-8eae-438b-844b-4be93d4279d0	a8d25d4f-c91d-4e13-a3e0-9f7fce7ce24b	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	CRM Hubli - Bay 5	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-04 08:41:35.957	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-03 12:11:35.957	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-03 10:41:35.957	2026-09-03 13:11:35.957	2026-09-04 14:41:35.957	\N	11000	11084	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-03 08:41:35.957	2026-09-23 07:48:46.081	1. Disconnect hydraulic quick-coupler. 2. Measure circuit relief pressure. 3. Replace orbital hydraulic motor and flushed bypass valve.	30	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-04 14:41:35.957	COMPLETED	COMPLETED	2026-09-04 08:41:35.957	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
0427517c-9cc0-4bf6-9a0f-c27078c83597	BELL-MAIN-2026-000099	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	26876c43-7084-4bc1-9085-203fe4893588	48d3a965-80a2-4fe1-b8fb-fad5d02731e7	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	D7D - Bay 6	Server Room Liebert Precision AC High Temperature Alarm (28°C)	Secondary DX circuit low refrigerant pressure switch open. Environmental monitoring agent sending critical alert to IT operations.	2026-09-21 08:43:39.413	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-20 12:13:39.413	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-20 10:43:39.413	2026-09-20 13:13:39.413	2026-09-22 02:43:39.413	\N	7800	7885	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-20 08:43:39.413	2026-09-23 07:48:46.088	1. Electronic sniffer leak test on flare connections. 2. Braze cracked condenser coil return bend. 3. Evacuate to 500 microns and charge R410A.	42	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-22 02:43:39.413	COMPLETED	COMPLETED	2026-09-21 08:43:39.413	18	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	OVERDUE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
ada70bd7-8b3a-4fb2-ae2a-e55fdff7a1fa	BELL-MAIN-2026-000100	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	086c6225-d976-41af-a6ed-8b90f88b27ce	3bd56fb7-59f4-436e-acf0-75f2d32caa89	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Gabbur Hubli - Bay 7	Bodyshop Resistance Spot Welder Water Cooling Circuit Blocked	Spot welder electrode tips overheating and sticking to galvanized sheet metal. Chiller flow rate dropped below 2.5 LPM safety interlock.	2026-09-19 08:45:42.869	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-18 12:15:42.869	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-18 10:45:42.869	2026-09-18 13:15:42.869	2026-09-19 03:45:42.869	\N	3500	3586	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-18 08:45:42.869	2026-09-23 07:48:46.094	1. Descale water chiller internal heat exchanger. 2. Flush silicone cooling tubes. 3. Replace copper alloy electrode caps.	19	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-19 03:45:42.869	COMPLETED	COMPLETED	2026-09-19 08:45:42.869	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
d4d366ea-bd98-47d2-b688-b883f6318e6f	BELL-MAIN-2026-000101	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	77482462-625b-4554-b7b6-4bb0c2900069	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Hero MotoCorp Dharwad - Bay 8	Vehicle Delivery Bay Epoxy Flooring Heavy Chemical Delamination	Battery acid spill etched through 2mm self-leveling epoxy coating in PDI inspection bay. Concrete substrate exposed to oil penetration.	2026-09-06 08:47:46.325	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-03 12:17:46.325	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-03 10:47:46.325	2026-09-03 13:17:46.325	2026-09-06 14:47:46.325	\N	14500	14587	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-03 08:47:46.325	2026-09-23 07:48:46.101	1. Diamond grind damaged floor section. 2. Neutralize acid with alkaline solution. 3. Apply moisture barrier primer and recoat 2-pack polyurethane.	78	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-06 14:47:46.325	COMPLETED	COMPLETED	2026-09-06 08:47:46.325	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
89b8eaa5-49c4-4415-b67e-3cc88c941f5d	BELL-MAIN-2026-000102	2e310667-1c46-4818-ac37-379d159a30f7	387493bc-be7e-4ca1-bf51-4386fb151aa2	5f71bbf4-677d-4944-befc-b47325ff7c24	a95613ac-3cd8-4e26-8d14-7b5aefd285ae	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	Hero MotoCorp Hubli - Bay 1	Customer Restroom Sensor Faucets Non-Responsive	Two infrared touchless washbasin taps in customer lounge not dispensing water. Solenoid valves clicking but valve diaphragms calcified.	2026-09-14 07:49:49.781	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-11 11:19:49.781	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-11 09:49:49.781	2026-09-11 12:19:49.781	2026-09-14 02:49:49.781	2026-09-14 06:49:49.781	1600	1688	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-11 07:49:49.781	2026-09-23 07:48:46.108	1. Disassemble solenoid cartridge. 2. Soak EPDM diaphragms in descaling agent. 3. Install new 6V lithium battery packs.	67	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	2026-09-14 02:49:49.781	COMPLETED	CLOSED	2026-09-14 07:49:49.781	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
dc99a788-8398-4515-8462-f954cfe7d97f	BELL-MAIN-2026-000103	2e310667-1c46-4818-ac37-379d159a30f7	cec05e97-654a-4d1f-af5a-cbe29dd33b4d	4c9d1366-ba6f-40d4-be29-f85162d2c069	9fce4cc9-e4c7-46b3-a21c-01de69369a0f	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Head Office Hubli - Bay 2	CCTV Network Video Recorder (NVR) Storage RAID-5 Array Degraded	Drive Bay #3 in 32-channel Hikvision NVR showing red amber failure LED. Video retention compromised for workshop yard monitoring.	2026-09-03 07:51:53.237	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-01 11:21:53.237	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-01 09:51:53.237	2026-09-01 12:21:53.237	2026-09-03 02:51:53.237	2026-09-03 06:51:53.237	6500	6589	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-01 07:51:53.237	2026-09-23 07:48:46.114	1. Hot-swap defective 4TB WD Purple enterprise surveillance hard drive. 2. Rebuild RAID volume through storage controller web interface.	43	\N	\N	Accounts & Finance Wing	+91 9845045678	1cd3acc9-8a7f-4847-a034-302551e7c249	\N	OPEN	t	2026-09-03 02:51:53.237	COMPLETED	CLOSED	2026-09-03 07:51:53.237	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
66be6ca8-809f-4504-8e5f-95092eebd06c	BELL-MAIN-2026-000104	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	b16448ef-ee35-4cc5-954f-64c3a0be802e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Dharwad - Bay 3	Two-Post Hydraulic Car Lift Cylinder O-Ring Leakage	Hydraulic oil leaking rapidly from left-side hoist cylinder during lift cycle. Pressure dropping under 2.5 ton load. Immediate safety seal replacement needed.	2026-09-13 07:53:56.693	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-12 11:23:56.693	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-12 09:53:56.693	2026-09-12 12:23:56.693	2026-09-13 13:53:56.693	2026-09-13 17:53:56.693	4500	4590	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-12 07:53:56.693	2026-09-23 07:48:46.122	1. Lockout-tagout power. 2. Depressurize hydraulic circuit. 3. Disassemble cylinder gland and replace polyurethane seals. 4. Refill ISO 68 oil and load-test.	30	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-13 13:53:56.693	COMPLETED	CLOSED	2026-09-13 07:53:56.693	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
0c9a6ffe-29e1-4ef3-8879-5ab62e031243	BELL-MAIN-2026-000105	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	e8bbf769-4f3b-4ab1-a848-08b266d80f10	5bf9c7f0-7cfa-42b6-94ea-bc73fc53831a	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Gadag - Bay 4	Central Workshop 50HP Screw Compressor Pressure Switch Failure	Main air compressor failing to unloader cycle at 8.5 bar, causing safety relief valve to pop. High acoustic noise and line vibration.	2026-09-10 07:56:00.149	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-09 11:26:00.149	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-09 09:56:00.149	2026-09-09 12:26:00.149	2026-09-10 02:56:00.149	2026-09-10 06:56:00.149	8200	8291	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-09 07:56:00.149	2026-09-23 07:48:46.129	1. Inspect Danfoss pressure switch contacts. 2. Calibrate cut-in/cut-out thresholds. 3. Test pilot solenoid valve operation under full line load.	19	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-10 02:56:00.149	COMPLETED	CLOSED	2026-09-10 07:56:00.149	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
5c191c78-2698-4b36-8139-70aee7452d89	BELL-MAIN-2026-000106	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	2516f2ba-62c9-4f29-b86b-423ad765542f	15daf98f-36f7-4c83-894e-6c969eab0675	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Hyundai Hubli - Bay 5	Showroom Variable Refrigerant Flow (VRF) Indoor Unit Water Dripping	Ceiling cassette AC unit in main vehicle delivery area dripping condensation onto customer lounge carpet. Drain pump appears clogged with algae.	2026-09-09 07:58:03.605	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-07 11:28:03.605	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-07 09:58:03.605	2026-09-07 12:28:03.605	2026-09-09 02:58:03.605	2026-09-09 06:58:03.605	1800	1892	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-07 07:58:03.605	2026-09-23 07:48:46.135	1. Remove intake louvers. 2. Nitrogen flush condensate drain pipe. 3. Inspect lift pump impeller and clean pan with antibacterial tablet.	43	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-09 02:58:03.605	COMPLETED	CLOSED	2026-09-09 07:58:03.605	-5	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
d2318bad-9436-4ed5-a31c-c0de0e0ab033	BELL-MAIN-2026-000107	2e310667-1c46-4818-ac37-379d159a30f7	885f7fb1-49f6-42f9-a966-7c9a017860bb	67756409-f447-4a92-8f0a-cb859c9e664c	dd68c990-eb26-47a9-a147-b3f39e52d797	ce6c4760-bdc1-43e2-9c93-b97523ad8e34	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Hyundai Haveri - Bay 6	Paint Booth Downdraft Extraction Fan V-Belt Snapped	Blower fan #2 belt shredded during priming shift. Paint overspray accumulating in preparation bay. Odor filtration compromised.	2026-09-15 08:00:07.061	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-14 11:30:07.061	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-14 10:00:07.061	2026-09-14 12:30:07.061	2026-09-15 14:00:07.061	2026-09-15 18:00:07.061	3200	3293	\N	\N	\N	Work completed. Tested and calibrated according to standard operating checklist. Voltage, pressure, and thermal readings verified normal.	f	\N	\N	\N	2026-09-14 08:00:07.061	2026-09-23 07:48:46.142	1. Isolate motor MCC panel. 2. Inspect pulley alignment with laser tool. 3. Install matched set of SPA-1600 cogged V-belts. 4. Check CFM airflow.	30	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-15 14:00:07.061	COMPLETED	CLOSED	2026-09-15 08:00:07.061	6	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	WITHIN_GRACE	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
099ad174-3ae2-4d99-b18f-378c18277e48	BELL-MAIN-2026-000108	2e310667-1c46-4818-ac37-379d159a30f7	f658801b-24b1-4471-b4b6-b765d77c67c4	28869f10-6ac5-4cf2-9388-f26d661750ea	cdfa8b61-1211-4989-b098-ccec8afe83e7	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MD Department Bangalore - Bay 7	Wheel Alignment System Optical Camera Calibration Fault	3D alignment rack throwing Sensor Error 104 on right-rear target reflector. Calibration mast out of level by 1.8 degrees.	2026-09-12 08:02:10.517	REJECTED	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N	5000	0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-10 11:02:10.517	Capital budget ceiling exceeded for current quarter	\N	f	\N	\N	\N	2026-09-10 08:02:10.517	2026-09-23 07:48:46.149	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	REJECTED	2026-09-12 08:02:10.517	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
2425c292-06f9-4971-8724-5af82f9eed18	BELL-MAIN-2026-000109	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	3cdd0057-fb6b-48e4-b993-d44151cc7b42	74ef73ac-bcce-487a-9798-e0db05cd0aa2	c68859e9-b2fc-41f9-ab66-c020d773b637	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MD House Bangalore - Bay 8	DG Set 125kVA Automatic Mains Failure (AMF) Relay Tripping	Diesel generator fails to auto-crank upon grid phase drop. Auxiliary battery terminal showing 10.4V float charge.	2026-09-17 08:04:13.973	REJECTED	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N	9500	0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 11:04:13.973	Equipment under active OEM warranty period	\N	f	\N	\N	\N	2026-09-16 08:04:13.973	2026-09-23 07:48:46.151	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	REJECTED	2026-09-17 08:04:13.973	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
98e3b603-0119-4d17-b475-b806a530c3e8	BELL-MAIN-2026-000110	2e310667-1c46-4818-ac37-379d159a30f7	c7e01a14-d9c8-4d39-9ca3-a47799e097dc	e4aba731-eb4b-4394-843c-7f704d4838f9	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MD House Hubli - Bay 1	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-23 08:06:17.429	REJECTED	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N	2400	0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-21 11:06:17.429	Duplicate work ticket	\N	f	\N	\N	\N	2026-09-21 08:06:17.429	2026-09-23 07:48:46.156	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	\N	NOT_STARTED	REJECTED	2026-09-23 08:06:17.429	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
713fa020-ff0c-49fb-97f6-01a640432517	BELL-MAIN-2026-000111	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	0244afde-2a2e-4282-95ca-dc1abad52b6e	b4585701-6704-4e3b-af7c-9bb115c6701b	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	LOW	MG Motors Belgaum - Bay 2	Parts Warehouse High-Bay LED Luminaire Array Flickering	6 units of 150W UFO LED high-bay lights strobing intermittently in Zone C rack aisle. Driver output voltage fluctuating between 32V and 48V.	2026-09-19 08:08:20.885	REJECTED	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N	3800	0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-16 11:08:20.885	Capital budget ceiling exceeded for current quarter	\N	f	\N	\N	\N	2026-09-16 08:08:20.885	2026-09-23 07:48:46.159	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	REJECTED	2026-09-19 08:08:20.885	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	72	\N	\N	\N	\N	\N	\N	\N
57df17ea-1d1d-42f8-a29b-26a25b296ae7	BELL-MAIN-2026-000112	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	030411fe-e37d-4442-b121-603d4813f5bf	5ff7f408-a107-4d91-ae42-6eab5d066fa0	37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	MG Motors Gulbarga - Bay 3	RO Drinking Water Filtration Plant High TDS & Pump Cavitation	Purified water TDS spiked to 380 ppm. Booster pump emitting high cavitation screeching. Micron pre-filter cartridge fouled with silt.	2026-08-31 08:10:24.341	REJECTED	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N	4200	0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-08-29 11:10:24.341	Equipment under active OEM warranty period	\N	f	\N	\N	\N	2026-08-29 08:10:24.341	2026-09-23 07:48:46.162	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	REJECTED	2026-08-31 08:10:24.341	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	48	\N	\N	\N	\N	\N	\N	\N
0344b543-c3ab-4f9c-b1bb-baa05643bbca	BELL-MAIN-2026-000113	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	3898fdc6-de13-4b0b-9adb-8499305d3559	5eb176c4-1e46-4e18-9a96-45bda861c64a	7d29c8c5-d4e5-48f6-9af4-4193a7bf1ed2	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MG Motors Hubli - Bay 4	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-21 08:12:27.797	REJECTED	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N	11000	0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-20 11:12:27.797	Duplicate work ticket	\N	f	\N	\N	\N	2026-09-20 08:12:27.797	2026-09-23 07:48:46.165	\N	\N	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	\N	NOT_STARTED	REJECTED	2026-09-21 08:12:27.797	\N	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	\N	\N	\N	24	\N	\N	\N	\N	\N	\N	\N
b0e67952-d6f9-4713-a1b5-abcc38838c8b	BELL-MAIN-2026-000114	2e310667-1c46-4818-ac37-379d159a30f7	5e04052b-99bf-41c7-81ce-f32af306bab5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Bay 4 Hydraulic Lift	Hydraulic safety lock sensor replacement	Sensor needs calibration and replacement.	2026-09-25 07:49:05.824	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 07:49:05.863	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 07:49:05.849	2026-09-23 07:49:05.881	2026-09-23 07:49:05.903	2026-09-23 07:49:05.926	2500	1800	\N	\N	\N	Installed and calibrated. All tests passed.	f	Safety buzzer volume low	2026-09-23 07:49:05.914	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-23 07:49:05.832	2026-09-23 07:49:05.928	1. Test sensor\n2. Swap circuit\n3. Verify output voltage	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-23 07:49:05.903	COMPLETED	CLOSED	2026-09-25 07:49:05.824	-24	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	ON_TIME	2026-09-23 07:49:05.903	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	\N	\N	\N	\N	\N
c5e0c846-1783-4ba3-b7c0-f91163f48337	OMNI-MNT-2026-000001	30d424ac-9074-40b8-b062-deae1a023a3d	f8131f02-987c-4d62-ac42-01a814b827c8	a24c8442-d623-4ffc-8fbc-4fdd876030ab	78606a9e-2e7a-427a-9357-faf556876efb	24df740f-d0a5-43e5-a090-1d86aee09030	d1c9ac36-506b-42eb-9472-c83873c0d37a	HIGH	Dock Bay 12 Hydraulic Ramp	Heavy Cargo Ramp Hydraulic Cylinder Pressure Failure	40ft container trailer unable to unload due to hydraulic pressure drop.	2026-09-23 18:52:46.789	APPROVED	APPROVED	\N	\N	\N	d1c9ac36-506b-42eb-9472-c83873c0d37a	2026-09-23 11:29:48.643	\N	\N	\N	0	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-23 06:52:46.789	2026-09-23 11:29:48.644	\N	\N	\N	\N	\N	\N	\N	\N	OPEN	t	\N	NOT_STARTED	APPROVED	2026-09-23 18:52:46.789	\N	6	\N	\N	NOT_REQUIRED	\N	\N	\N	\N	\N	12	\N	\N	\N	\N	\N	\N	\N
d5de7495-d572-42cb-ba27-2b857cff6977	BELL-MAIN-2026-000001	2e310667-1c46-4818-ac37-379d159a30f7	605c6364-cb40-43f4-b9c1-933556989196	d8dbd457-63e9-4040-b873-267bf4712118	cdfa8b61-1211-4989-b098-ccec8afe83e7	f6505738-db12-41e5-8c44-744eaf61b611	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Tata Motors Sarjapur Workshop - Mechanical Bay 2	Hydraulic Car Lift 3-Phase Power Panel Short Circuit	Main 415V supply contactor tripped with sparking. 2 hydraulic lifts inoperable. Urgent replacement of 32A MCB required.	2026-09-21 13:52:46.789	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-20 15:52:46.789	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-20 14:52:46.789	\N	2026-09-23 11:58:42.908	2026-09-23 11:58:51.234	0	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-20 13:52:46.789	2026-09-23 11:58:51.235	1. Isolate main feeder\n2. Inspect Schneider contactor\n3. Replace burnt terminals\n4. Load test under 30A current	70.1	\N	\N	Mechanical Bay 1-4	+91 9845045678	f93185a6-0745-4888-aa1c-e51fa4106c40	Urgent task - affecting morning customer delivery throughput.	OPEN	t	2026-09-23 11:58:42.908	COMPLETED	CLOSED	2026-09-21 13:52:46.789	46.1	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	OVERDUE	2026-09-23 11:58:42.908	79604a14-4a74-4c65-a925-5f8e953ec609	24	120	\N	\N	\N	\N	\N	\N
bea94c31-a71e-40ad-823e-31d3847d6b80	BELL-MAIN-2026-000117	2e310667-1c46-4818-ac37-379d159a30f7	\N	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Server Room AC Unit #2	Cooling failure in primary server room	Compressor tripped. Temperature rising rapidly.	2026-09-24 12:38:33.109	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-23 12:38:33.183	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-23 12:38:33.166	2026-09-23 12:38:33.204	2026-09-23 12:38:33.387	2026-09-23 12:38:33.462	0	1150	\N	\N	\N	Repairs done and server room cooled to 19°C.	f	\N	\N	\N	2026-09-23 12:38:33.124	2026-09-23 12:38:33.464	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-23 12:38:33.387	COMPLETED	CLOSED	2026-09-24 12:38:33.109	-24	12	+91 9845023456	\N	COMPLETED	2026-09-23 12:38:33.224	+91 9845067890	ON_TIME	2026-09-23 12:38:33.387	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	4f2d00d9-1d59-471d-bbd6-ccaf05a1158a	\N	HVAC precision gas charging and compressor calibration	2026-09-23 12:38:33.317	SCHEDULED
4d0c47cb-7702-4803-a302-ab121ba0db42	BELL-MAIN-2026-000038	2e310667-1c46-4818-ac37-379d159a30f7	164a8950-346f-42f9-a265-acffcd37862f	030411fe-e37d-4442-b121-603d4813f5bf	a95613ac-3cd8-4e26-8d14-7b5aefd285ae	a8d25d4f-c91d-4e13-a3e0-9f7fce7ce24b	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	MG Motors Gulbarga - Bay 1	Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled	Top contouring brush stops rotating halfway down SUV roofline. Hydraulic drive motor overheating above 85°C.	2026-09-21 08:38:08.597	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-20 12:08:08.597	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-20 10:38:08.597	2026-09-23 12:44:59.201	2026-09-23 12:45:13.019	\N	11000	0	\N	\N	\N	\N	f	\N	\N	\N	2026-09-20 08:38:08.597	2026-09-23 12:45:13.02	1. Disconnect hydraulic quick-coupler. 2. Measure circuit relief pressure. 3. Replace orbital hydraulic motor and flushed bypass valve.	76.12	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	f	2026-09-23 12:45:13.019	COMPLETED	COMPLETED	2026-09-21 08:38:08.597	52.12	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	OVERDUE	2026-09-23 12:45:13.019	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	\N	\N	\N	\N	\N	\N	\N
1caddaa4-88da-4d4b-8f5d-e58d956d36f3	BELL-MAIN-2026-000120	2e310667-1c46-4818-ac37-379d159a30f7	\N	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Server Room AC Unit #2	Cooling failure in primary server room	Compressor tripped. Temperature rising rapidly.	2026-09-25 12:45:18.725	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-24 12:45:18.792	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-24 12:45:18.779	2026-09-24 12:45:18.811	2026-09-24 12:45:18.956	2026-09-24 12:45:18.97	0	1150	\N	\N	\N	Repairs done and server room cooled to 19°C.	f	\N	\N	\N	2026-09-24 12:45:18.734	2026-09-24 12:45:18.972	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-24 12:45:18.956	COMPLETED	CLOSED	2026-09-25 12:45:18.725	-24	12	+91 9845023456	\N	COMPLETED	2026-09-24 12:45:18.829	+91 9845067890	ON_TIME	2026-09-24 12:45:18.956	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	4f2d00d9-1d59-471d-bbd6-ccaf05a1158a	\N	HVAC precision gas charging and compressor calibration	2026-09-24 12:45:18.919	SCHEDULED
5fc257a2-5650-41eb-947a-62c19c0a118a	BELL-MAIN-2026-000050	2e310667-1c46-4818-ac37-379d159a30f7	0cb5131c-a6f6-4877-ab9b-bbad1ff3686f	f13bd4c8-950c-4605-b6c3-587ece85dac5	970518e5-8654-4f26-a37c-6a326da6db69	5143b2f5-dc74-4b0c-bd31-63f7698721d9	6b6d957f-362e-446f-9c61-375c17bd6201	MEDIUM	Used Cars - Bay 5	Main Showroom Glass Automatic Sliding Door Sensor Jammed	Infrared motion sensor permanently engaged. Entrance sliding doors remain open, causing high AC cooling loss and dust ingress.	2026-09-19 08:02:50.069	APPROVED	COMPLETED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-17 11:32:50.069	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-17 10:02:50.069	2026-09-23 12:45:34.683	2026-09-23 12:45:36.347	\N	2400	0	\N	\N	\N	\N	t	Vibration and high acoustic noise reoccurred after 2 hours under peak operational load.	2026-09-17 20:02:50.069	6b6d957f-362e-446f-9c61-375c17bd6201	2026-09-17 08:02:50.069	2026-09-23 12:45:36.348	1. Clean radar sensor lens. 2. Adjust beam detection angle and sensitivity potentiometer. 3. Lubricate carriage track nylon rollers.	148.71	\N	\N	Main Bay	+91 9845045678	\N	\N	OPEN	t	2026-09-23 12:45:36.347	COMPLETED	COMPLETED	2026-09-19 08:02:50.069	100.71	12	+91 9845023456	\N	NOT_REQUIRED	\N	+91 9845067890	OVERDUE	2026-09-23 12:45:36.347	be9a0dd8-f525-403b-8c54-45d7f34a7570	48	\N	\N	\N	\N	\N	\N	\N
938b7ae1-d1d5-4211-b64a-c65f8efac643	BELL-MAIN-2026-000118	2e310667-1c46-4818-ac37-379d159a30f7	\N	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Server Room AC Unit #2	Cooling failure in primary server room	Compressor tripped. Temperature rising rapidly.	2026-09-25 11:43:35.574	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-24 11:43:35.711	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-24 11:43:35.696	2026-09-24 11:43:35.732	2026-09-24 11:43:35.863	2026-09-24 11:43:35.875	0	1150	\N	\N	\N	Repairs done and server room cooled to 19°C.	f	\N	\N	\N	2026-09-24 11:43:35.584	2026-09-24 11:43:35.877	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-24 11:43:35.863	COMPLETED	CLOSED	2026-09-25 11:43:35.574	-24	12	+91 9845023456	\N	COMPLETED	2026-09-24 11:43:35.75	+91 9845067890	ON_TIME	2026-09-24 11:43:35.863	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	4f2d00d9-1d59-471d-bbd6-ccaf05a1158a	\N	HVAC precision gas charging and compressor calibration	2026-09-24 11:43:35.826	SCHEDULED
314b82b7-fa61-4cf5-bfee-0d35da51afca	BELL-MAIN-2026-000119	2e310667-1c46-4818-ac37-379d159a30f7	\N	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	a32df8d7-43eb-44a7-89e2-9a0c6d6f766e	2965211e-5a9d-4a33-bee0-7bce4956a225	6b6d957f-362e-446f-9c61-375c17bd6201	HIGH	Server Room AC Unit #2	Cooling failure in primary server room	Compressor tripped. Temperature rising rapidly.	2026-09-25 11:55:28.778	APPROVED	CLOSED	be9a0dd8-f525-403b-8c54-45d7f34a7570	3fbf1cdd-5680-4802-9174-129dd38a2b62	2026-09-24 11:55:28.842	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2026-09-24 11:55:28.827	2026-09-24 11:55:28.862	2026-09-24 11:55:29.001	2026-09-24 11:55:29.015	0	1150	\N	\N	\N	Repairs done and server room cooled to 19°C.	f	\N	\N	\N	2026-09-24 11:55:28.786	2026-09-24 11:55:29.016	1. Check refrigerant pressure\n2. Inspect capacitor\n3. Restart blower	0	\N	\N	\N	+91 9845045678	\N	\N	OPEN	t	2026-09-24 11:55:29.001	COMPLETED	CLOSED	2026-09-25 11:55:28.778	-24	12	+91 9845023456	\N	COMPLETED	2026-09-24 11:55:28.882	+91 9845067890	ON_TIME	2026-09-24 11:55:29.001	be9a0dd8-f525-403b-8c54-45d7f34a7570	24	0	\N	4f2d00d9-1d59-471d-bbd6-ccaf05a1158a	\N	HVAC precision gas charging and compressor calibration	2026-09-24 11:55:28.964	SCHEDULED
\.


--
-- Data for Name: maintenance_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_types (id, "tenantId", name, code, icon, color, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
2965211e-5a9d-4a33-bee0-7bce4956a225	2e310667-1c46-4818-ac37-379d159a30f7	Carpentry	CARP	Hammer	#d97706	\N	1	t	2026-09-23 06:52:46.736	2026-09-23 06:52:46.736
5143b2f5-dc74-4b0c-bd31-63f7698721d9	2e310667-1c46-4818-ac37-379d159a30f7	Civil	CIVIL	HardHat	#ea580c	\N	2	t	2026-09-23 06:52:46.737	2026-09-23 06:52:46.737
f6505738-db12-41e5-8c44-744eaf61b611	2e310667-1c46-4818-ac37-379d159a30f7	Electrical	ELEC	Zap	#eab308	\N	3	t	2026-09-23 06:52:46.738	2026-09-23 06:52:46.738
ce6c4760-bdc1-43e2-9c93-b97523ad8e34	2e310667-1c46-4818-ac37-379d159a30f7	IT	IT	Laptop	#2563eb	\N	4	t	2026-09-23 06:52:46.738	2026-09-23 06:52:46.738
a8d25d4f-c91d-4e13-a3e0-9f7fce7ce24b	2e310667-1c46-4818-ac37-379d159a30f7	New Construction	CONST	Building	#6366f1	\N	5	t	2026-09-23 06:52:46.739	2026-09-23 06:52:46.739
c68859e9-b2fc-41f9-ab66-c020d773b637	2e310667-1c46-4818-ac37-379d159a30f7	Other	OTHER	HelpCircle	#64748b	\N	6	t	2026-09-23 06:52:46.74	2026-09-23 06:52:46.74
37fb6e8f-3ebb-4832-ba80-7ca44b7a0788	2e310667-1c46-4818-ac37-379d159a30f7	Plumbing	PLUMB	Droplet	#06b6d4	\N	7	t	2026-09-23 06:52:46.741	2026-09-23 06:52:46.741
3acd2c54-f54e-4908-8fe4-b870d03a5452	2e310667-1c46-4818-ac37-379d159a30f7	Printing	PRINT	Printer	#8b5cf6	\N	8	t	2026-09-23 06:52:46.741	2026-09-23 06:52:46.741
958301dd-b4cd-48bd-8ab0-e9fe99b2cac2	2e310667-1c46-4818-ac37-379d159a30f7	Purchase	PURCH	ShoppingCart	#10b981	\N	9	t	2026-09-23 06:52:46.742	2026-09-23 06:52:46.742
7d29c8c5-d4e5-48f6-9af4-4193a7bf1ed2	2e310667-1c46-4818-ac37-379d159a30f7	Vendor Payment	VPAY	CreditCard	#ec4899	\N	10	t	2026-09-23 06:52:46.742	2026-09-23 06:52:46.742
24df740f-d0a5-43e5-a090-1d86aee09030	30d424ac-9074-40b8-b062-deae1a023a3d	Dock Leveler & Hydraulics	DOCK-HYD	Truck	#0284c7	\N	1	t	2026-09-23 06:52:46.829	2026-09-23 06:52:46.829
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "tenantId", "userId", title, message, type, "entityType", "entityId", "isRead", "readAt", "createdAt") FROM stdin;
b12145b4-937f-4cec-a55f-5d6e199c721d	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000006	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.64
2d4cda1f-d123-4119-9ba3-6547319e409f	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000006	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.64
fecfc210-1f14-442b-9e53-323a0f7816ac	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000006	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.64
c882e9bf-14c7-4262-9236-728ba8506256	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000006	Your maintenance request "Hydraulic safety lock sensor replacement" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.654
ab0f24f1-9dab-4f90-97a9-710577231db0	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000006	You have been assigned to maintenance request "Hydraulic safety lock sensor replacement" at Bay 4 Hydraulic Lift.	TASK_ASSIGNED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.669
ae0328d4-4187-42de-8a0c-ea8e34ff0d1f	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000006	Your maintenance request "Hydraulic safety lock sensor replacement" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.699
494776f8-2eec-4d98-a037-2f02df8df2c8	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Reopened (Dissatisfied): BELL-MAIN-2026-000006	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.711
34a471ac-dfbb-492e-ad0a-00ce6b73bb75	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	Task Reopened (Dissatisfied): BELL-MAIN-2026-000006	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	7aa15a08-c5a7-4f88-b8ed-9037bfd7e56e	f	\N	2026-09-23 06:53:41.711
ee96fca2-414c-46f4-be26-c44dd7c42a1f	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000007	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.382
adfc9f7a-8d8e-40b5-9941-7b921e211018	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000007	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.382
f9ec228c-84a0-4880-b15f-aefadf6f8560	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000007	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.381
bbca1fad-938b-4723-bcc0-6bc9ffa380a9	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000007	Your maintenance request "Hydraulic safety lock sensor replacement" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.396
35edb426-5a8a-4370-b618-8f58e1ae7e8c	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000007	You have been assigned to maintenance request "Hydraulic safety lock sensor replacement" at Bay 4 Hydraulic Lift.	TASK_ASSIGNED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.411
94d080b8-6fc6-4f42-a71c-bcb5963b9863	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000007	Your maintenance request "Hydraulic safety lock sensor replacement" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.441
bbcdd4f4-5e3e-4f6d-af24-5cec77b53b89	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Reopened (Dissatisfied): BELL-MAIN-2026-000007	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.453
fff6211e-d765-4364-8166-88e3852ae1ea	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	Task Reopened (Dissatisfied): BELL-MAIN-2026-000007	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	a4c8ab9b-487e-4a92-82ba-4ce51bda6f71	f	\N	2026-09-23 07:03:51.453
ba0436ea-0e8c-4c77-b71e-09da8c3e9bfc	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000008	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	f	\N	2026-09-23 07:05:13.726
bd7ad329-674c-4448-9d0e-6847bf98cd1d	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000008	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	f	\N	2026-09-23 07:05:13.726
e9106da4-3029-4e69-8189-eefc3beda291	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000008	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	f	\N	2026-09-23 07:05:13.726
ceae21fd-471f-4bdb-9def-eba1df9e3007	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000008	You have been assigned to maintenance request "Hydraulic safety lock sensor replacement" at Bay 4 Hydraulic Lift.	TASK_ASSIGNED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	f	\N	2026-09-23 07:05:13.757
33b84444-7259-413e-a898-86b7bb387f44	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Reopened (Dissatisfied): BELL-MAIN-2026-000008	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	f	\N	2026-09-23 07:05:13.798
242c255e-8c8c-4af1-b7bb-196ce82a5838	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	Task Reopened (Dissatisfied): BELL-MAIN-2026-000008	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	f	\N	2026-09-23 07:05:13.798
6ccba330-a9f1-403b-b593-ba57ad43d913	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000009	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	f531ef35-5426-44e3-b01d-390593385c04	f	\N	2026-09-23 07:16:27.22
4aec36d9-28bd-4a54-91e5-72ff5cd4c5cb	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000009	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	f531ef35-5426-44e3-b01d-390593385c04	f	\N	2026-09-23 07:16:27.22
ae0f0010-8465-4334-af63-9f313a6a8a78	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000009	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	f531ef35-5426-44e3-b01d-390593385c04	f	\N	2026-09-23 07:16:27.22
e8d6a899-b319-4e1d-a8f4-64f6041f42f4	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000010	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	41513dbf-520f-400b-851b-68f02a1ea7d0	f	\N	2026-09-23 07:16:42.301
145ec6e3-69bb-40f2-a42c-dc2bca62ae65	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000010	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	41513dbf-520f-400b-851b-68f02a1ea7d0	f	\N	2026-09-23 07:16:42.301
8ca1ec6b-fd79-4aea-b644-4bf433298cf4	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000008	Your maintenance request "Hydraulic safety lock sensor replacement" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	t	2026-09-23 11:44:41.898	2026-09-23 07:05:13.742
b46278a9-f73d-43c3-82fb-b7430a322f78	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000010	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	41513dbf-520f-400b-851b-68f02a1ea7d0	f	\N	2026-09-23 07:16:42.301
4fc3cca3-33a7-4bec-82c9-8bf315eb233d	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000011	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	28ef519c-464c-450c-89a7-247c44bf50e0	f	\N	2026-09-23 07:16:58.3
6c79acbc-61ce-438d-b669-bb647c4a9d12	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000011	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	28ef519c-464c-450c-89a7-247c44bf50e0	f	\N	2026-09-23 07:16:58.3
cb05990c-a761-4962-891c-bdc98771ed50	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000011	Sandeep Bellad submitted request "want 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	28ef519c-464c-450c-89a7-247c44bf50e0	f	\N	2026-09-23 07:16:58.3
0e60df04-8382-4a60-88d9-71421c3014e9	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000012	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	f	\N	2026-09-23 07:37:27.402
695213ad-8261-4e21-8fcd-7e80bd40760d	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000012	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	f	\N	2026-09-23 07:37:27.402
62919302-a8f2-4b72-8853-fa4a268e5448	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000012	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	f	\N	2026-09-23 07:37:27.402
e9b4d3e8-bd00-48c3-81a7-8cd1c1b465d9	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000012	You have been assigned to maintenance request "Hydraulic safety lock sensor replacement" at Bay 4 Hydraulic Lift.	TASK_ASSIGNED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	f	\N	2026-09-23 07:37:27.436
83494555-4bdd-4067-887f-ca2f1a2966f6	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	Task Reopened (Dissatisfied): BELL-MAIN-2026-000012	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	f	\N	2026-09-23 07:37:27.477
6288f0de-2904-48a7-9e6d-f5cf3f0ee858	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Reopened (Dissatisfied): BELL-MAIN-2026-000012	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	f	\N	2026-09-23 07:37:27.477
8ec189b9-1194-4ec0-8db1-a61a3052fcbd	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000013	Sandeep Bellad submitted request "wanted 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	f	\N	2026-09-23 07:42:12.796
796c1a20-7056-4533-8da0-6fce6ebbc24c	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000013	Sandeep Bellad submitted request "wanted 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	f	\N	2026-09-23 07:42:12.796
f14da0ac-d385-444a-afc1-439953a2b290	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000013	Sandeep Bellad submitted request "wanted 1 TB HDD" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	f	\N	2026-09-23 07:42:12.796
81515876-5bda-4c0a-a3d2-fec9244486e4	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	Request Approved: BELL-MAIN-2026-000013	Your maintenance request "wanted 1 TB HDD" was approved by Sandeep Bellad.	REQUEST_APPROVED	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	f	\N	2026-09-23 07:43:19.915
82215ad1-8a6d-4690-bbe9-6179417ad56f	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000013	You have been assigned to maintenance request "wanted 1 TB HDD" at XYZ.	TASK_ASSIGNED	MaintenanceRequest	dab2909e-bdfa-4485-b784-18f4008a5843	f	\N	2026-09-23 07:43:46.394
c19ba9a0-ebc7-4dd0-83ea-adcfa9c0cf42	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000114	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	f	\N	2026-09-23 07:49:05.841
5ef73cf2-a062-42db-958c-bb462751e485	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000114	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	f	\N	2026-09-23 07:49:05.841
734badd6-d1fc-46de-aba8-aaa0cf410a9c	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000114	Mahesh Hiremath submitted request "Hydraulic safety lock sensor replacement" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	f	\N	2026-09-23 07:49:05.841
78915ac1-c053-4853-8a17-21cc3577c5d4	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000114	You have been assigned to maintenance request "Hydraulic safety lock sensor replacement" at Bay 4 Hydraulic Lift.	TASK_ASSIGNED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	f	\N	2026-09-23 07:49:05.874
2461ba81-35ee-4b66-ac6f-a9a8d72b6b88	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Reopened (Dissatisfied): BELL-MAIN-2026-000114	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	f	\N	2026-09-23 07:49:05.921
e6d6ee5a-7c09-4b05-a58e-762f4ff18220	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000114	Your maintenance request "Hydraulic safety lock sensor replacement" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	t	2026-09-23 11:44:23.258	2026-09-23 07:49:05.857
c3a73047-a460-472a-832e-9b5bf4575081	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000012	Your maintenance request "Hydraulic safety lock sensor replacement" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	t	2026-09-23 11:44:23.878	2026-09-23 07:37:27.467
e2faba0e-69f9-4183-850f-4a7c2495271a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000012	Your maintenance request "Hydraulic safety lock sensor replacement" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	6413283e-3cb0-4b1c-bfb8-d557856cef31	t	2026-09-23 11:44:40.477	2026-09-23 07:37:27.419
ddeccc3a-5c4c-406e-8773-f5ca8d7884cb	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	Task Reopened (Dissatisfied): BELL-MAIN-2026-000114	Task "Hydraulic safety lock sensor replacement" was marked dissatisfied: Safety buzzer volume low. Work reopened for rectification.	TASK_REOPENED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	f	\N	2026-09-23 07:49:05.921
1747055a-e772-4091-9ccd-8d5d67eb9003	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000115	Anil Deshpande submitted request "need CPU" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	bc621456-a4f1-4ca0-afb4-76ffac6880f4	f	\N	2026-09-23 11:19:03.567
d37717ca-da17-4997-9ce6-c7a91e11519c	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000115	Anil Deshpande submitted request "need CPU" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	bc621456-a4f1-4ca0-afb4-76ffac6880f4	f	\N	2026-09-23 11:19:03.567
e390030a-f8f4-4bda-b71f-25a6fa8c0d17	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000115	Anil Deshpande submitted request "need CPU" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	bc621456-a4f1-4ca0-afb4-76ffac6880f4	f	\N	2026-09-23 11:19:03.567
67bf4b00-0913-4a75-a384-ad83387f8ab9	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	Request Approved: BELL-MAIN-2026-000115	Your maintenance request "need CPU" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	bc621456-a4f1-4ca0-afb4-76ffac6880f4	f	\N	2026-09-23 11:19:53.852
70667045-86de-4a6e-a9ec-ff19aeaccff9	30d424ac-9074-40b8-b062-deae1a023a3d	d1c9ac36-506b-42eb-9472-c83873c0d37a	Request Approved: OMNI-MNT-2026-000001	Your maintenance request "Heavy Cargo Ramp Hydraulic Cylinder Pressure Failure" was approved by Rajesh Mehta.	REQUEST_APPROVED	MaintenanceRequest	c5e0c846-1783-4ba3-b7c0-f91163f48337	t	2026-09-23 11:30:28.713	2026-09-23 11:29:48.656
57c77152-8853-4669-bacf-25243fbee520	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000116	Mahesh Hiremath submitted request "sdf" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	2b45d87e-ea75-44fb-bd6f-2df9be49f43b	f	\N	2026-09-23 11:43:16.084
e0a93677-59aa-44f1-9bd3-107be4e9b91f	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000116	Mahesh Hiremath submitted request "sdf" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	2b45d87e-ea75-44fb-bd6f-2df9be49f43b	f	\N	2026-09-23 11:43:16.084
9000bf3e-f7ca-4f6f-a6fd-fa508ee74b5a	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000116	Mahesh Hiremath submitted request "sdf" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	2b45d87e-ea75-44fb-bd6f-2df9be49f43b	f	\N	2026-09-23 11:43:16.084
2426395e-e440-4271-a082-bee7b40bbcd2	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000114	Your maintenance request "Hydraulic safety lock sensor replacement" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	b0e67952-d6f9-4713-a1b5-abcc38838c8b	t	2026-09-23 11:44:22.252	2026-09-23 07:49:05.909
4ea58002-27ff-45ae-a4c1-6e6dea74803a	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000008	Your maintenance request "Hydraulic safety lock sensor replacement" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	51656f67-115a-4ebf-85b8-2a6ea0d256e2	t	2026-09-23 11:44:41.555	2026-09-23 07:05:13.789
3f4b7b01-c410-4b9a-8905-f9ce569a6afc	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000001	Your maintenance request "Hydraulic Car Lift 3-Phase Power Panel Short Circuit" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	d5de7495-d572-42cb-ba27-2b857cff6977	f	\N	2026-09-23 11:58:42.916
b7817522-c7fd-4623-b6f2-daf7568159d8	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000117	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.136
5953bc6c-dc70-46b8-bf4e-248ed50d6a2a	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000117	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.136
89a58ce8-d7c8-41b0-ade8-5f6a6a5df1cd	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000117	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.136
522f4fec-89b4-48c9-be08-efa36c3837d9	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000117	Your maintenance request "Cooling failure in primary server room" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.176
6c43d722-67b7-4304-aa83-6ec48dad5fcf	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000117	You have been assigned to maintenance request "Cooling failure in primary server room" at Server Room AC Unit #2.	TASK_ASSIGNED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.196
9584b9ab-4022-4b7d-8b21-14f0948fff14	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Purchase Request: PR-2026-0001	Purchase request raised for maintenance request BELL-MAIN-2026-000117.	PURCHASE_REQUIRED	PurchaseRequest	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	f	\N	2026-09-23 12:38:33.231
6956256e-f664-4a99-934c-cbf1205d9d7b	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Purchase Request: PR-2026-0001	Purchase request raised for maintenance request BELL-MAIN-2026-000117.	PURCHASE_REQUIRED	PurchaseRequest	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	f	\N	2026-09-23 12:38:33.231
1c975755-41cc-4ee8-a82e-d237e0a0868c	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Parts Received: BELL-MAIN-2026-000117	Materials for maintenance request "Cooling failure in primary server room" have arrived at the facility. You can resume work.	PARTS_RECEIVED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.288
b07f05a0-b658-49bd-907e-e60350d1b181	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	New Purchase Request: PR-2026-0001	Purchase request raised for maintenance request BELL-MAIN-2026-000117.	PURCHASE_REQUIRED	PurchaseRequest	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	t	2026-09-23 13:00:05.65	2026-09-23 12:38:33.231
78484164-7c2f-401b-96ad-c271b7a87b63	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Parts Received: BELL-MAIN-2026-000119	Materials for maintenance request "Cooling failure in primary server room" have arrived at the facility. You can resume work.	PARTS_RECEIVED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:28.939
8b910c91-dbef-4a1e-b00e-7c4c1d751a04	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000117	Your maintenance request "Cooling failure in primary server room" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	bea94c31-a71e-40ad-823e-31d3847d6b80	f	\N	2026-09-23 12:38:33.452
883ed0f6-74b7-4b3d-8695-6f733306b3bc	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000038	Your maintenance request "Automatic Car Wash Gantry Top Brush Hydraulic Motor Stalled" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	4d0c47cb-7702-4803-a302-ab121ba0db42	f	\N	2026-09-23 12:45:13.027
da5e2c07-5bb2-4757-a677-5ec5cd2b7433	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000050	Your maintenance request "Main Showroom Glass Automatic Sliding Door Sensor Jammed" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	5fc257a2-5650-41eb-947a-62c19c0a118a	f	\N	2026-09-23 12:45:36.355
ea578236-3a5e-4be8-bc27-d9497051ac98	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000118	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.644
80e1f1da-c374-407f-8acf-28fba9decefa	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000118	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.644
3610f06e-4533-4fb0-b149-785e02c4aa34	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000118	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.644
63d8f627-128f-4cf6-b515-618aed16aa9f	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000118	Your maintenance request "Cooling failure in primary server room" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.705
3f707a5d-238e-431a-a368-16180ed257dc	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000118	You have been assigned to maintenance request "Cooling failure in primary server room" at Server Room AC Unit #2.	TASK_ASSIGNED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.725
8fbfe548-6ca0-4ece-a263-a1f193ff9357	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Purchase Request: PR-2026-0002	Purchase request raised for maintenance request BELL-MAIN-2026-000118.	PURCHASE_REQUIRED	PurchaseRequest	6cb58714-f3b8-4054-96a2-b115d3c65f1d	f	\N	2026-09-24 11:43:35.756
548b7254-ec15-4ebf-b160-040d8938fa65	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	New Purchase Request: PR-2026-0002	Purchase request raised for maintenance request BELL-MAIN-2026-000118.	PURCHASE_REQUIRED	PurchaseRequest	6cb58714-f3b8-4054-96a2-b115d3c65f1d	f	\N	2026-09-24 11:43:35.756
333671d3-df7e-4177-8e03-83cc296349c0	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Purchase Request: PR-2026-0002	Purchase request raised for maintenance request BELL-MAIN-2026-000118.	PURCHASE_REQUIRED	PurchaseRequest	6cb58714-f3b8-4054-96a2-b115d3c65f1d	f	\N	2026-09-24 11:43:35.756
4dcb9ab3-95c5-4f9b-9a13-fcedabc2323f	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Parts Received: BELL-MAIN-2026-000118	Materials for maintenance request "Cooling failure in primary server room" have arrived at the facility. You can resume work.	PARTS_RECEIVED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.802
c6cb5561-5547-4589-8172-55c047b533b0	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000118	Your maintenance request "Cooling failure in primary server room" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	938b7ae1-d1d5-4211-b64a-c65f8efac643	f	\N	2026-09-24 11:43:35.87
50a91eed-a30e-40b6-90cf-dcfc8a801d18	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000119	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:28.796
aeb91ea0-4c58-479a-93eb-69e1072fb7e9	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000119	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:28.796
69433bfc-369e-4ec7-9182-0514e23d0089	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000119	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:28.796
755984da-c6dd-415f-83e3-c7e0f38b1198	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000119	Your maintenance request "Cooling failure in primary server room" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:28.834
066442ee-cd17-4010-868f-e7fcdafbd8c6	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000119	You have been assigned to maintenance request "Cooling failure in primary server room" at Server Room AC Unit #2.	TASK_ASSIGNED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:28.853
20eadafb-15af-41e2-8a34-e6d94b2c2000	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Purchase Request: PR-2026-0003	Purchase request raised for maintenance request BELL-MAIN-2026-000119.	PURCHASE_REQUIRED	PurchaseRequest	eb41a501-de43-4613-8e1b-f40c3ab79f80	f	\N	2026-09-24 11:55:28.89
909ccb2f-310d-48ec-9206-bfeb27683b91	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	New Purchase Request: PR-2026-0003	Purchase request raised for maintenance request BELL-MAIN-2026-000119.	PURCHASE_REQUIRED	PurchaseRequest	eb41a501-de43-4613-8e1b-f40c3ab79f80	f	\N	2026-09-24 11:55:28.89
d3e1059c-36e4-439c-b4e3-af3b83280dbf	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Purchase Request: PR-2026-0003	Purchase request raised for maintenance request BELL-MAIN-2026-000119.	PURCHASE_REQUIRED	PurchaseRequest	eb41a501-de43-4613-8e1b-f40c3ab79f80	f	\N	2026-09-24 11:55:28.89
19622970-79b4-4da3-85b9-83bbf55c6b0b	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000119	Your maintenance request "Cooling failure in primary server room" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	314b82b7-fa61-4cf5-bfee-0d35da51afca	f	\N	2026-09-24 11:55:29.008
006f1667-c1a5-4c19-92ed-0163fc2f3dbe	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Maintenance Request: BELL-MAIN-2026-000120	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.744
81331469-ff3a-4c84-8b97-3f2d4e8271c8	2e310667-1c46-4818-ac37-379d159a30f7	c9788a8d-ec88-4679-b72a-9dcae52c45a5	New Maintenance Request: BELL-MAIN-2026-000120	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.744
3b8a31da-0429-4a86-82c7-2d60139dc775	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Maintenance Request: BELL-MAIN-2026-000120	Mahesh Hiremath submitted request "Cooling failure in primary server room" awaiting your action.	APPROVAL_REQUIRED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.744
26c3af0c-d2b0-4b7c-9598-ad7aba939142	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Request Approved: BELL-MAIN-2026-000120	Your maintenance request "Cooling failure in primary server room" was approved by Anil Deshpande.	REQUEST_APPROVED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.786
721fa349-6b69-4775-aa1d-22b2d9084bf8	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Task Assigned: BELL-MAIN-2026-000120	You have been assigned to maintenance request "Cooling failure in primary server room" at Server Room AC Unit #2.	TASK_ASSIGNED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.803
fc087b11-d9a0-45bc-933b-7f3066e271fa	2e310667-1c46-4818-ac37-379d159a30f7	79604a14-4a74-4c65-a925-5f8e953ec609	New Purchase Request: PR-2026-0004	Purchase request raised for maintenance request BELL-MAIN-2026-000120.	PURCHASE_REQUIRED	PurchaseRequest	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	f	\N	2026-09-24 12:45:18.838
cb90ef13-8278-42cf-8c8d-40616f8630ea	2e310667-1c46-4818-ac37-379d159a30f7	3fbf1cdd-5680-4802-9174-129dd38a2b62	New Purchase Request: PR-2026-0004	Purchase request raised for maintenance request BELL-MAIN-2026-000120.	PURCHASE_REQUIRED	PurchaseRequest	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	f	\N	2026-09-24 12:45:18.838
56ade0ab-3c99-4257-b0ea-4f0d790b4e3b	2e310667-1c46-4818-ac37-379d159a30f7	d37e3c4f-f763-4c56-8254-2acc13c24927	New Purchase Request: PR-2026-0004	Purchase request raised for maintenance request BELL-MAIN-2026-000120.	PURCHASE_REQUIRED	PurchaseRequest	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	f	\N	2026-09-24 12:45:18.838
42dcf203-a11d-417f-9ce0-4deb853310d1	2e310667-1c46-4818-ac37-379d159a30f7	be9a0dd8-f525-403b-8c54-45d7f34a7570	Parts Received: BELL-MAIN-2026-000120	Materials for maintenance request "Cooling failure in primary server room" have arrived at the facility. You can resume work.	PARTS_RECEIVED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.893
ea231f1d-82cd-4f05-807d-43d2eae27189	2e310667-1c46-4818-ac37-379d159a30f7	6b6d957f-362e-446f-9c61-375c17bd6201	Work Completed: BELL-MAIN-2026-000120	Your maintenance request "Cooling failure in primary server room" has been completed. Please inspect and confirm satisfaction.	WORK_COMPLETED	MaintenanceRequest	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	f	\N	2026-09-24 12:45:18.963
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, "purchaseRequestId", "itemName", quantity, unit, "estimatedPrice", "quotedPrice", "actualPrice", status, "createdAt") FROM stdin;
06a92812-7875-4e16-b57f-6403a5fd96ff	0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	Capacitor 50uF Dual Run	1	pcs	1200	0	0	PENDING	2026-09-23 12:38:33.219
1e614309-b23e-4371-b0b1-701c6c620fe1	6cb58714-f3b8-4054-96a2-b115d3c65f1d	Capacitor 50uF Dual Run	1	pcs	1200	0	0	PENDING	2026-09-24 11:43:35.746
8a8735bf-2cf1-41aa-a3df-c8b94b47b21e	eb41a501-de43-4613-8e1b-f40c3ab79f80	Capacitor 50uF Dual Run	1	pcs	1200	0	0	PENDING	2026-09-24 11:55:28.879
bc5a6d21-bc00-4833-b0fe-c8bc97c4daf5	a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	Capacitor 50uF Dual Run	1	pcs	1200	0	0	PENDING	2026-09-24 12:45:18.826
\.


--
-- Data for Name: purchase_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_requests (id, "tenantId", "maintenanceRequestId", "prNumber", status, "requestedById", "approvedById", "vendorId", "estimatedTotal", "actualTotal", "poReference", notes, "requestedAt", "approvedAt", "orderedAt", "receivedAt", "createdAt", "updatedAt", carrier, "expectedDeliveryDate", "orderUrl", "purchaseSource", "trackingNumber") FROM stdin;
0b04e0f9-77e8-4337-a8ef-300eaa77d5f8	2e310667-1c46-4818-ac37-379d159a30f7	bea94c31-a71e-40ad-823e-31d3847d6b80	PR-2026-0001	RECEIVED	d37e3c4f-f763-4c56-8254-2acc13c24927	\N	\N	1200	1150	AMZ-882190	\N	2026-09-23 12:38:33.219	\N	2026-09-23 12:38:33.264	2026-09-23 12:38:33.278	2026-09-23 12:38:33.219	2026-09-23 12:38:33.28	BlueDart	\N	https://business.amazon.in/orders/402-11928	AMAZON_BUSINESS	TRK-9921
6cb58714-f3b8-4054-96a2-b115d3c65f1d	2e310667-1c46-4818-ac37-379d159a30f7	938b7ae1-d1d5-4211-b64a-c65f8efac643	PR-2026-0002	RECEIVED	d37e3c4f-f763-4c56-8254-2acc13c24927	\N	\N	1200	1150	AMZ-882190	\N	2026-09-24 11:43:35.746	\N	2026-09-24 11:43:35.784	2026-09-24 11:43:35.794	2026-09-24 11:43:35.746	2026-09-24 11:43:35.796	BlueDart	\N	https://business.amazon.in/orders/402-11928	AMAZON_BUSINESS	TRK-9921
eb41a501-de43-4613-8e1b-f40c3ab79f80	2e310667-1c46-4818-ac37-379d159a30f7	314b82b7-fa61-4cf5-bfee-0d35da51afca	PR-2026-0003	RECEIVED	d37e3c4f-f763-4c56-8254-2acc13c24927	\N	\N	1200	1150	AMZ-882190	\N	2026-09-24 11:55:28.879	\N	2026-09-24 11:55:28.922	2026-09-24 11:55:28.933	2026-09-24 11:55:28.879	2026-09-24 11:55:28.934	BlueDart	\N	https://business.amazon.in/orders/402-11928	AMAZON_BUSINESS	TRK-9921
a33d9a7a-f9c4-42b6-88e9-e161094fe4fb	2e310667-1c46-4818-ac37-379d159a30f7	1caddaa4-88da-4d4b-8f5d-e58d956d36f3	PR-2026-0004	RECEIVED	d37e3c4f-f763-4c56-8254-2acc13c24927	\N	\N	1200	1150	AMZ-882190	\N	2026-09-24 12:45:18.826	\N	2026-09-24 12:45:18.871	2026-09-24 12:45:18.886	2026-09-24 12:45:18.826	2026-09-24 12:45:18.887	BlueDart	\N	https://business.amazon.in/orders/402-11928	AMAZON_BUSINESS	TRK-9921
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, "tenantId", "purchaseRequestId", "vendorId", "quoteNumber", amount, "fileAttachmentId", "validUntil", status, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, "tenantId", key, value, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, slug, code, logo, status, "createdAt", "updatedAt", "approvalRequired", "graceHours", "logoUrl", "requestPrefix", "targetHoursHigh", "targetHoursLow", "targetHoursMedium", timezone, "workflowConfig") FROM stdin;
2e310667-1c46-4818-ac37-379d159a30f7	Bellad & Groups	bellad-groups	BELLAD	\N	ACTIVE	2026-09-23 06:52:46.654	2026-09-23 06:52:46.654	t	12	\N	BELL-MAIN	24	72	48	Asia/Kolkata	\N
30d424ac-9074-40b8-b062-deae1a023a3d	OmniLogistics Supply Chain Ltd	omni-logistics	OMNI	\N	ACTIVE	2026-09-23 06:52:46.657	2026-09-23 11:30:50.242	f	6	\N	OMNI-MNT	12	48	24	Asia/Kolkata	null
\.


--
-- Data for Name: user_branch_accesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_branch_accesses (id, "userId", "branchId", "isPrimary", "createdAt") FROM stdin;
e368e51a-347c-4398-a4a2-9f55ffd4065a	79604a14-4a74-4c65-a925-5f8e953ec609	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	f	2026-09-23 06:52:46.749
3a3eab4f-f37e-45ae-94d7-6b03ab034783	3fbf1cdd-5680-4802-9174-129dd38a2b62	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	f	2026-09-23 06:52:46.749
5758d5e8-6415-4d21-8ffe-009726d4d612	c9788a8d-ec88-4679-b72a-9dcae52c45a5	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	f	2026-09-23 06:52:46.749
72e95f61-120d-48dd-8968-c0875135e09e	be9a0dd8-f525-403b-8c54-45d7f34a7570	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	f	2026-09-23 06:52:46.749
0cbe286d-04e9-4149-97af-9e99437ab1cd	d37e3c4f-f763-4c56-8254-2acc13c24927	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	f	2026-09-23 06:52:46.749
f9b8038e-4d1d-48cd-a8e2-5aff5bcf4045	6b6d957f-362e-446f-9c61-375c17bd6201	ff7a2ea0-a9a8-42e3-9433-57bc40f4e71b	f	2026-09-23 06:52:46.749
5fefe160-8976-4646-bcce-08415270031e	79604a14-4a74-4c65-a925-5f8e953ec609	8267385b-f101-4266-9c36-b6413a1e8bb6	f	2026-09-23 06:52:46.751
e49d7d5a-3c74-4c3e-8557-27f71f1048ca	3fbf1cdd-5680-4802-9174-129dd38a2b62	8267385b-f101-4266-9c36-b6413a1e8bb6	f	2026-09-23 06:52:46.751
19d1a4d7-4e3d-4be8-8533-ae273b177785	c9788a8d-ec88-4679-b72a-9dcae52c45a5	8267385b-f101-4266-9c36-b6413a1e8bb6	f	2026-09-23 06:52:46.751
5c792879-4031-428f-99c8-191571ca1bc9	be9a0dd8-f525-403b-8c54-45d7f34a7570	8267385b-f101-4266-9c36-b6413a1e8bb6	f	2026-09-23 06:52:46.751
38a43e34-c70f-425c-85c4-1eb297e5b667	d37e3c4f-f763-4c56-8254-2acc13c24927	8267385b-f101-4266-9c36-b6413a1e8bb6	f	2026-09-23 06:52:46.751
81f635eb-1ce1-4a09-93bf-9aebba2a9651	6b6d957f-362e-446f-9c61-375c17bd6201	8267385b-f101-4266-9c36-b6413a1e8bb6	f	2026-09-23 06:52:46.751
0c053f1f-a2ac-4dda-b079-e04c43c7e566	79604a14-4a74-4c65-a925-5f8e953ec609	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	f	2026-09-23 06:52:46.752
adf998ce-f210-4c1b-85aa-b0e5fd3db6c5	3fbf1cdd-5680-4802-9174-129dd38a2b62	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	f	2026-09-23 06:52:46.752
4991ac87-eb7c-48dd-85ca-5bf0df1a7724	c9788a8d-ec88-4679-b72a-9dcae52c45a5	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	f	2026-09-23 06:52:46.752
8d3969fd-ca30-40dc-b194-7f79f75902d6	be9a0dd8-f525-403b-8c54-45d7f34a7570	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	f	2026-09-23 06:52:46.752
e061b9fd-89d1-49f2-8505-9384a2e120b2	d37e3c4f-f763-4c56-8254-2acc13c24927	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	f	2026-09-23 06:52:46.752
26631e12-94e2-4075-8048-0d56f9043d4f	6b6d957f-362e-446f-9c61-375c17bd6201	0e8f942d-27a8-4c54-88c1-b1a0d3f686e5	f	2026-09-23 06:52:46.752
19bf9f53-08c4-4417-9a84-4921e88cf9dc	79604a14-4a74-4c65-a925-5f8e953ec609	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	f	2026-09-23 06:52:46.753
8c3f06ff-850f-4d45-ad4b-477b643945a9	3fbf1cdd-5680-4802-9174-129dd38a2b62	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	f	2026-09-23 06:52:46.753
fac8e371-3a9b-43de-b289-f72476ed688c	c9788a8d-ec88-4679-b72a-9dcae52c45a5	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	f	2026-09-23 06:52:46.753
38c0da84-8c8b-4dae-b802-fc76255f68d8	be9a0dd8-f525-403b-8c54-45d7f34a7570	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	f	2026-09-23 06:52:46.753
ffea6f0c-bd5e-4da9-af83-0fe6f8676c75	d37e3c4f-f763-4c56-8254-2acc13c24927	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	f	2026-09-23 06:52:46.753
a168bb44-f430-4848-8874-d8144b2ff0c5	6b6d957f-362e-446f-9c61-375c17bd6201	b21f50b4-f52a-4f81-ab05-5e1e40c4070c	f	2026-09-23 06:52:46.753
200aacc6-a8eb-4e14-9de1-4862e6fc460f	79604a14-4a74-4c65-a925-5f8e953ec609	9ffc9414-f95d-4344-b770-3a56e4a95d75	f	2026-09-23 06:52:46.754
5d1ed01f-4fc8-4194-91c9-92b9990df4e0	3fbf1cdd-5680-4802-9174-129dd38a2b62	9ffc9414-f95d-4344-b770-3a56e4a95d75	f	2026-09-23 06:52:46.754
ee531daf-2378-4faa-ab58-e7b340850b5e	c9788a8d-ec88-4679-b72a-9dcae52c45a5	9ffc9414-f95d-4344-b770-3a56e4a95d75	f	2026-09-23 06:52:46.754
92db219f-9fc8-48b7-bf5c-123370b019f1	be9a0dd8-f525-403b-8c54-45d7f34a7570	9ffc9414-f95d-4344-b770-3a56e4a95d75	f	2026-09-23 06:52:46.754
19680ea6-df55-40b2-b6e7-cd4676f1c4b8	d37e3c4f-f763-4c56-8254-2acc13c24927	9ffc9414-f95d-4344-b770-3a56e4a95d75	f	2026-09-23 06:52:46.754
3bc7ca22-429e-496b-bb0f-6cb9eab199f4	6b6d957f-362e-446f-9c61-375c17bd6201	9ffc9414-f95d-4344-b770-3a56e4a95d75	f	2026-09-23 06:52:46.754
c73fc889-6aed-49fc-9d34-75ecf59f5a74	79604a14-4a74-4c65-a925-5f8e953ec609	f8356d40-000e-48ce-bf31-3e757ff805e3	f	2026-09-23 06:52:46.755
aa22d3aa-1490-4b2b-b985-a90e9ab3ba8b	3fbf1cdd-5680-4802-9174-129dd38a2b62	f8356d40-000e-48ce-bf31-3e757ff805e3	f	2026-09-23 06:52:46.755
abdbe66d-40e8-402e-b79a-daec0c203192	c9788a8d-ec88-4679-b72a-9dcae52c45a5	f8356d40-000e-48ce-bf31-3e757ff805e3	f	2026-09-23 06:52:46.755
7dd05bd1-5283-4525-8e75-de8e0b5cddf2	be9a0dd8-f525-403b-8c54-45d7f34a7570	f8356d40-000e-48ce-bf31-3e757ff805e3	f	2026-09-23 06:52:46.755
e3cf5ef8-fa93-4d93-a560-6bc7cfb3d00d	d37e3c4f-f763-4c56-8254-2acc13c24927	f8356d40-000e-48ce-bf31-3e757ff805e3	f	2026-09-23 06:52:46.755
79cc16a1-5fc9-422b-aea4-cf0d968afe2d	6b6d957f-362e-446f-9c61-375c17bd6201	f8356d40-000e-48ce-bf31-3e757ff805e3	f	2026-09-23 06:52:46.755
f05b8f04-8549-4858-878b-a829290d1743	79604a14-4a74-4c65-a925-5f8e953ec609	6c9f266b-02e1-4a74-a57b-9732c2c81c23	f	2026-09-23 06:52:46.757
0d8e965a-067a-4944-b39a-0b05989cb8aa	3fbf1cdd-5680-4802-9174-129dd38a2b62	6c9f266b-02e1-4a74-a57b-9732c2c81c23	f	2026-09-23 06:52:46.757
90a7b68a-ad78-4dcf-83cc-54280ffe95f8	c9788a8d-ec88-4679-b72a-9dcae52c45a5	6c9f266b-02e1-4a74-a57b-9732c2c81c23	f	2026-09-23 06:52:46.757
20f1ffeb-0b7f-450f-9ed9-ec3ed847d19e	be9a0dd8-f525-403b-8c54-45d7f34a7570	6c9f266b-02e1-4a74-a57b-9732c2c81c23	f	2026-09-23 06:52:46.757
7c5f4a53-4c47-423d-9526-09537ef58bac	d37e3c4f-f763-4c56-8254-2acc13c24927	6c9f266b-02e1-4a74-a57b-9732c2c81c23	f	2026-09-23 06:52:46.757
c5241734-669a-4a5f-854f-54da203bc47b	6b6d957f-362e-446f-9c61-375c17bd6201	6c9f266b-02e1-4a74-a57b-9732c2c81c23	f	2026-09-23 06:52:46.757
bf47ddef-c17e-4100-a71f-17704da418d5	79604a14-4a74-4c65-a925-5f8e953ec609	48e27d0f-82ca-486f-b0a7-094188cb9014	f	2026-09-23 06:52:46.757
74c1c479-3e41-4b19-8b25-2d8481c9f7df	3fbf1cdd-5680-4802-9174-129dd38a2b62	48e27d0f-82ca-486f-b0a7-094188cb9014	f	2026-09-23 06:52:46.757
89fd3910-6c57-44ab-a323-7662b3e6ecad	c9788a8d-ec88-4679-b72a-9dcae52c45a5	48e27d0f-82ca-486f-b0a7-094188cb9014	f	2026-09-23 06:52:46.757
c400a2bb-a156-4e12-8e2f-3ea468e6b658	be9a0dd8-f525-403b-8c54-45d7f34a7570	48e27d0f-82ca-486f-b0a7-094188cb9014	f	2026-09-23 06:52:46.757
862e9c83-5c2c-45c6-b3ca-760597207947	d37e3c4f-f763-4c56-8254-2acc13c24927	48e27d0f-82ca-486f-b0a7-094188cb9014	f	2026-09-23 06:52:46.757
db6a3f3c-75ea-4ab1-b257-4ec7cac62edc	6b6d957f-362e-446f-9c61-375c17bd6201	48e27d0f-82ca-486f-b0a7-094188cb9014	f	2026-09-23 06:52:46.757
4c29ba20-df73-4402-b7a7-95dbca44da9b	79604a14-4a74-4c65-a925-5f8e953ec609	ba7a9081-fa66-4878-8fcf-d217f465a646	f	2026-09-23 06:52:46.758
02dc4909-2fca-410b-99cf-669ef968f563	3fbf1cdd-5680-4802-9174-129dd38a2b62	ba7a9081-fa66-4878-8fcf-d217f465a646	f	2026-09-23 06:52:46.758
072d1706-f313-4131-a4ed-81792f49c1ed	c9788a8d-ec88-4679-b72a-9dcae52c45a5	ba7a9081-fa66-4878-8fcf-d217f465a646	f	2026-09-23 06:52:46.758
e8ef210f-649d-41b7-a226-4e1bff675c19	be9a0dd8-f525-403b-8c54-45d7f34a7570	ba7a9081-fa66-4878-8fcf-d217f465a646	f	2026-09-23 06:52:46.758
c5b38d7b-dfe5-46b3-a85d-f4371282f1e6	d37e3c4f-f763-4c56-8254-2acc13c24927	ba7a9081-fa66-4878-8fcf-d217f465a646	f	2026-09-23 06:52:46.758
4e572882-0e60-4e53-bc80-55fa4ab7b4cc	6b6d957f-362e-446f-9c61-375c17bd6201	ba7a9081-fa66-4878-8fcf-d217f465a646	f	2026-09-23 06:52:46.758
22032fb8-2b28-4f77-97df-11785f73f1be	79604a14-4a74-4c65-a925-5f8e953ec609	c512bc52-6b64-4258-b319-ade81c809cf9	f	2026-09-23 06:52:46.759
d3fb1647-870d-4137-ab48-0ec1fab4ca4b	3fbf1cdd-5680-4802-9174-129dd38a2b62	c512bc52-6b64-4258-b319-ade81c809cf9	f	2026-09-23 06:52:46.759
54e845f6-b2db-4f4b-ab24-ac06affc71d4	c9788a8d-ec88-4679-b72a-9dcae52c45a5	c512bc52-6b64-4258-b319-ade81c809cf9	f	2026-09-23 06:52:46.759
4611f667-06d2-4da6-8edb-08ed3a7bc66b	be9a0dd8-f525-403b-8c54-45d7f34a7570	c512bc52-6b64-4258-b319-ade81c809cf9	f	2026-09-23 06:52:46.759
ab2f2b3d-d118-45b6-b074-aa182e3c68ee	d37e3c4f-f763-4c56-8254-2acc13c24927	c512bc52-6b64-4258-b319-ade81c809cf9	f	2026-09-23 06:52:46.759
c4b60825-e387-47d3-8953-20bd13749d74	6b6d957f-362e-446f-9c61-375c17bd6201	c512bc52-6b64-4258-b319-ade81c809cf9	f	2026-09-23 06:52:46.759
dc936ce0-455f-4429-85db-fba8198ea894	79604a14-4a74-4c65-a925-5f8e953ec609	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	f	2026-09-23 06:52:46.76
707676e9-45ca-4267-a643-ceb4103f9e9e	3fbf1cdd-5680-4802-9174-129dd38a2b62	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	f	2026-09-23 06:52:46.76
d7e711fa-3386-4232-99dd-7f56fdae8ae0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	f	2026-09-23 06:52:46.76
f5a91d73-2dc9-4f12-a8fa-61622a533715	be9a0dd8-f525-403b-8c54-45d7f34a7570	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	f	2026-09-23 06:52:46.76
1aa7ed54-28d1-4082-af42-1aab93ea6283	d37e3c4f-f763-4c56-8254-2acc13c24927	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	f	2026-09-23 06:52:46.76
15403f1b-dd58-4c72-b883-d2d92af1e414	6b6d957f-362e-446f-9c61-375c17bd6201	5f7f0c6b-9aaf-4409-af94-1f33e9ee1abb	f	2026-09-23 06:52:46.76
b69ad5f7-622a-46d8-910e-e61c2793d0b2	79604a14-4a74-4c65-a925-5f8e953ec609	26876c43-7084-4bc1-9085-203fe4893588	f	2026-09-23 06:52:46.761
2ff2adb9-cace-429a-881a-9084fdae9101	3fbf1cdd-5680-4802-9174-129dd38a2b62	26876c43-7084-4bc1-9085-203fe4893588	f	2026-09-23 06:52:46.761
586d22cc-5fd6-4160-ba78-bf5025122b6d	c9788a8d-ec88-4679-b72a-9dcae52c45a5	26876c43-7084-4bc1-9085-203fe4893588	f	2026-09-23 06:52:46.761
5703a20f-71bf-4057-a70f-bdea8d4d73b3	be9a0dd8-f525-403b-8c54-45d7f34a7570	26876c43-7084-4bc1-9085-203fe4893588	f	2026-09-23 06:52:46.761
b738da73-d488-49bb-9c88-5b626d0fe4f1	d37e3c4f-f763-4c56-8254-2acc13c24927	26876c43-7084-4bc1-9085-203fe4893588	f	2026-09-23 06:52:46.761
82db4bc6-13df-4b20-be3b-c81377522b5f	6b6d957f-362e-446f-9c61-375c17bd6201	26876c43-7084-4bc1-9085-203fe4893588	f	2026-09-23 06:52:46.761
f0f6f539-023d-40ce-b869-bbb6762af477	79604a14-4a74-4c65-a925-5f8e953ec609	086c6225-d976-41af-a6ed-8b90f88b27ce	f	2026-09-23 06:52:46.762
ee5d90ee-1fdc-467d-9f9e-f71fca698813	3fbf1cdd-5680-4802-9174-129dd38a2b62	086c6225-d976-41af-a6ed-8b90f88b27ce	f	2026-09-23 06:52:46.762
9c967263-9628-46fa-b7bb-b51f0711c493	c9788a8d-ec88-4679-b72a-9dcae52c45a5	086c6225-d976-41af-a6ed-8b90f88b27ce	f	2026-09-23 06:52:46.762
f47408ab-10a9-44a9-9ee0-e34a4375ed1e	be9a0dd8-f525-403b-8c54-45d7f34a7570	086c6225-d976-41af-a6ed-8b90f88b27ce	f	2026-09-23 06:52:46.762
cfd8bb81-e8a8-4927-b588-29fce68480ba	d37e3c4f-f763-4c56-8254-2acc13c24927	086c6225-d976-41af-a6ed-8b90f88b27ce	f	2026-09-23 06:52:46.762
c471dc09-7bbd-481a-bb79-bb8b2d0cd8d6	6b6d957f-362e-446f-9c61-375c17bd6201	086c6225-d976-41af-a6ed-8b90f88b27ce	f	2026-09-23 06:52:46.762
9026a508-3384-43ec-93f0-65a9148839ce	79604a14-4a74-4c65-a925-5f8e953ec609	4c9d1366-ba6f-40d4-be29-f85162d2c069	t	2026-09-23 06:52:46.763
f0b9b548-af05-46c1-baaa-114f67c4c653	3fbf1cdd-5680-4802-9174-129dd38a2b62	4c9d1366-ba6f-40d4-be29-f85162d2c069	f	2026-09-23 06:52:46.763
1d9aead7-95dc-431d-9c32-56ff27797722	c9788a8d-ec88-4679-b72a-9dcae52c45a5	4c9d1366-ba6f-40d4-be29-f85162d2c069	t	2026-09-23 06:52:46.763
1f32cc06-bde2-4362-9dc2-db0658f6383f	be9a0dd8-f525-403b-8c54-45d7f34a7570	4c9d1366-ba6f-40d4-be29-f85162d2c069	f	2026-09-23 06:52:46.763
09869a22-a03e-40a5-b34d-140f388660d4	d37e3c4f-f763-4c56-8254-2acc13c24927	4c9d1366-ba6f-40d4-be29-f85162d2c069	t	2026-09-23 06:52:46.763
9cec6b9f-6cd1-4838-8f73-f42ce92cc012	6b6d957f-362e-446f-9c61-375c17bd6201	4c9d1366-ba6f-40d4-be29-f85162d2c069	f	2026-09-23 06:52:46.763
53f80746-0816-438b-a744-7d204d5302ec	79604a14-4a74-4c65-a925-5f8e953ec609	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	f	2026-09-23 06:52:46.764
fb4338e1-6112-498b-bbde-f42185900ec3	3fbf1cdd-5680-4802-9174-129dd38a2b62	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	f	2026-09-23 06:52:46.764
50a533df-36d2-4ace-9cbc-e6f3ece2339b	c9788a8d-ec88-4679-b72a-9dcae52c45a5	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	f	2026-09-23 06:52:46.764
b8c04710-f996-4451-920c-484daa643e39	be9a0dd8-f525-403b-8c54-45d7f34a7570	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	f	2026-09-23 06:52:46.764
1637ddad-a04e-4d69-97a6-533f4e4012eb	d37e3c4f-f763-4c56-8254-2acc13c24927	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	f	2026-09-23 06:52:46.764
08a5a9ae-5493-426a-81e5-f64c5ee59121	6b6d957f-362e-446f-9c61-375c17bd6201	d07a5cef-1294-4cb2-aa1f-c4bd4d999fab	f	2026-09-23 06:52:46.764
0524a16f-0ea0-4110-acdd-b1063bcb702d	79604a14-4a74-4c65-a925-5f8e953ec609	5f71bbf4-677d-4944-befc-b47325ff7c24	f	2026-09-23 06:52:46.764
881e2300-c1a3-4075-8f67-7c7fae4ee9e1	3fbf1cdd-5680-4802-9174-129dd38a2b62	5f71bbf4-677d-4944-befc-b47325ff7c24	f	2026-09-23 06:52:46.764
b28c94b4-4fb3-4e91-a604-9b6c0a9ebcf0	c9788a8d-ec88-4679-b72a-9dcae52c45a5	5f71bbf4-677d-4944-befc-b47325ff7c24	f	2026-09-23 06:52:46.764
77cc9a8b-b968-4049-bc14-569a67c4777e	be9a0dd8-f525-403b-8c54-45d7f34a7570	5f71bbf4-677d-4944-befc-b47325ff7c24	f	2026-09-23 06:52:46.764
a0c943f7-b393-48ee-93fd-8eb79bf537a5	d37e3c4f-f763-4c56-8254-2acc13c24927	5f71bbf4-677d-4944-befc-b47325ff7c24	f	2026-09-23 06:52:46.764
c559e6cc-6b61-42e3-9fb6-26e250cd681c	6b6d957f-362e-446f-9c61-375c17bd6201	5f71bbf4-677d-4944-befc-b47325ff7c24	f	2026-09-23 06:52:46.764
9c0ecc1e-2f88-4d50-8fe5-1c8478ce0ceb	79604a14-4a74-4c65-a925-5f8e953ec609	2516f2ba-62c9-4f29-b86b-423ad765542f	f	2026-09-23 06:52:46.765
f8577cba-343a-4673-840a-062bced51dc6	3fbf1cdd-5680-4802-9174-129dd38a2b62	2516f2ba-62c9-4f29-b86b-423ad765542f	f	2026-09-23 06:52:46.765
23f58755-99e8-43d5-b209-c57f5e0f4d60	c9788a8d-ec88-4679-b72a-9dcae52c45a5	2516f2ba-62c9-4f29-b86b-423ad765542f	f	2026-09-23 06:52:46.765
cc7a6eb6-9f54-4d56-a2d8-e5848f3f3155	be9a0dd8-f525-403b-8c54-45d7f34a7570	2516f2ba-62c9-4f29-b86b-423ad765542f	f	2026-09-23 06:52:46.765
05335e5f-4383-4d3f-9e8a-4621337a6364	d37e3c4f-f763-4c56-8254-2acc13c24927	2516f2ba-62c9-4f29-b86b-423ad765542f	f	2026-09-23 06:52:46.765
1324767e-2433-4d6f-ab0f-0241e16e902f	6b6d957f-362e-446f-9c61-375c17bd6201	2516f2ba-62c9-4f29-b86b-423ad765542f	f	2026-09-23 06:52:46.765
c307c0cf-c230-446c-8f67-6c3e9bc055ba	79604a14-4a74-4c65-a925-5f8e953ec609	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	f	2026-09-23 06:52:46.766
b5ebf5a7-b7de-4b40-96f7-c244f9735b38	3fbf1cdd-5680-4802-9174-129dd38a2b62	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	f	2026-09-23 06:52:46.766
9f4f204e-355d-41a6-a641-7c8a66bc6d61	c9788a8d-ec88-4679-b72a-9dcae52c45a5	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	f	2026-09-23 06:52:46.766
6a471b38-f352-4f5e-a0a5-426170dd434e	be9a0dd8-f525-403b-8c54-45d7f34a7570	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	f	2026-09-23 06:52:46.766
e9c5f967-0520-41c3-bc5a-4dc794fb917a	d37e3c4f-f763-4c56-8254-2acc13c24927	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	f	2026-09-23 06:52:46.766
e4ad30ac-c6c2-4a03-bd6e-7ccdbdf425bd	6b6d957f-362e-446f-9c61-375c17bd6201	283a319f-d5e6-4679-8b0a-dd65c4bee0f5	f	2026-09-23 06:52:46.766
692a0780-ce2c-4771-ad59-8343ffb03e66	79604a14-4a74-4c65-a925-5f8e953ec609	e8bbf769-4f3b-4ab1-a848-08b266d80f10	f	2026-09-23 06:52:46.768
7469c2c8-cc28-4e83-b52a-1058f54758eb	3fbf1cdd-5680-4802-9174-129dd38a2b62	e8bbf769-4f3b-4ab1-a848-08b266d80f10	f	2026-09-23 06:52:46.768
6a512cc3-7ba6-429f-b75d-59a113525a8c	c9788a8d-ec88-4679-b72a-9dcae52c45a5	e8bbf769-4f3b-4ab1-a848-08b266d80f10	f	2026-09-23 06:52:46.768
0e6d43eb-c671-459e-97ec-3cfe534be4c8	be9a0dd8-f525-403b-8c54-45d7f34a7570	e8bbf769-4f3b-4ab1-a848-08b266d80f10	f	2026-09-23 06:52:46.768
96c665d8-538a-401b-a7ab-738a0eceb8a9	d37e3c4f-f763-4c56-8254-2acc13c24927	e8bbf769-4f3b-4ab1-a848-08b266d80f10	f	2026-09-23 06:52:46.768
94a30ae1-5709-4e3f-b183-b36dd83e8882	6b6d957f-362e-446f-9c61-375c17bd6201	e8bbf769-4f3b-4ab1-a848-08b266d80f10	f	2026-09-23 06:52:46.768
7ad152fb-b6e0-424a-bf79-6d5d4abf6a42	79604a14-4a74-4c65-a925-5f8e953ec609	67756409-f447-4a92-8f0a-cb859c9e664c	f	2026-09-23 06:52:46.769
815699cb-4b2a-4ab0-aa9a-c21965ad7b6b	3fbf1cdd-5680-4802-9174-129dd38a2b62	67756409-f447-4a92-8f0a-cb859c9e664c	f	2026-09-23 06:52:46.769
29a01e2a-b6dc-4f65-8d88-678eb2be1fff	c9788a8d-ec88-4679-b72a-9dcae52c45a5	67756409-f447-4a92-8f0a-cb859c9e664c	f	2026-09-23 06:52:46.769
9c6fbcc3-a298-44f9-b42b-db82e4a2929a	be9a0dd8-f525-403b-8c54-45d7f34a7570	67756409-f447-4a92-8f0a-cb859c9e664c	f	2026-09-23 06:52:46.769
5419f53f-f942-4192-9c47-679b4994663c	d37e3c4f-f763-4c56-8254-2acc13c24927	67756409-f447-4a92-8f0a-cb859c9e664c	f	2026-09-23 06:52:46.769
12e69fb4-6c4b-499e-ab2d-04ca45195622	6b6d957f-362e-446f-9c61-375c17bd6201	67756409-f447-4a92-8f0a-cb859c9e664c	f	2026-09-23 06:52:46.769
f770a041-b4e4-4f2e-9396-8ec59d1a45e4	79604a14-4a74-4c65-a925-5f8e953ec609	28869f10-6ac5-4cf2-9388-f26d661750ea	f	2026-09-23 06:52:46.77
bb1e8f52-9afb-40e2-b7c4-748c09d7883f	3fbf1cdd-5680-4802-9174-129dd38a2b62	28869f10-6ac5-4cf2-9388-f26d661750ea	f	2026-09-23 06:52:46.77
e336e449-9d08-4062-b6e6-e6f69892e2bb	c9788a8d-ec88-4679-b72a-9dcae52c45a5	28869f10-6ac5-4cf2-9388-f26d661750ea	f	2026-09-23 06:52:46.77
c1a4b502-6d5c-472d-ba77-f73ef9eab8f9	be9a0dd8-f525-403b-8c54-45d7f34a7570	28869f10-6ac5-4cf2-9388-f26d661750ea	f	2026-09-23 06:52:46.77
4c7e0283-1f9f-4054-a345-c1cb0884bbff	d37e3c4f-f763-4c56-8254-2acc13c24927	28869f10-6ac5-4cf2-9388-f26d661750ea	f	2026-09-23 06:52:46.77
a95bdea6-af8b-4680-aab5-b6f0b2df0976	6b6d957f-362e-446f-9c61-375c17bd6201	28869f10-6ac5-4cf2-9388-f26d661750ea	f	2026-09-23 06:52:46.77
7369e08b-7220-4d6d-8af5-aafe21b36037	79604a14-4a74-4c65-a925-5f8e953ec609	3cdd0057-fb6b-48e4-b993-d44151cc7b42	f	2026-09-23 06:52:46.771
15f7ebd6-bfc3-4b12-9154-8a84ff7e63ca	3fbf1cdd-5680-4802-9174-129dd38a2b62	3cdd0057-fb6b-48e4-b993-d44151cc7b42	f	2026-09-23 06:52:46.771
8df3fb3d-c7cc-48f9-9863-33cc545d4bf9	c9788a8d-ec88-4679-b72a-9dcae52c45a5	3cdd0057-fb6b-48e4-b993-d44151cc7b42	f	2026-09-23 06:52:46.771
89318a9d-22e1-4c20-bd91-63ac197a23ce	be9a0dd8-f525-403b-8c54-45d7f34a7570	3cdd0057-fb6b-48e4-b993-d44151cc7b42	f	2026-09-23 06:52:46.771
449e002e-8dd7-49c5-a1d0-6ab43a3e8c12	d37e3c4f-f763-4c56-8254-2acc13c24927	3cdd0057-fb6b-48e4-b993-d44151cc7b42	f	2026-09-23 06:52:46.771
c734a89a-4673-49c3-a159-7f54791c817f	6b6d957f-362e-446f-9c61-375c17bd6201	3cdd0057-fb6b-48e4-b993-d44151cc7b42	f	2026-09-23 06:52:46.771
d05faa12-fcd7-44f3-ba77-b3b8b572913e	79604a14-4a74-4c65-a925-5f8e953ec609	e4aba731-eb4b-4394-843c-7f704d4838f9	f	2026-09-23 06:52:46.772
9da2d752-4cc5-47aa-af60-98a53b1032fa	3fbf1cdd-5680-4802-9174-129dd38a2b62	e4aba731-eb4b-4394-843c-7f704d4838f9	f	2026-09-23 06:52:46.772
84714901-4e78-4bc1-b036-40a06b236b53	c9788a8d-ec88-4679-b72a-9dcae52c45a5	e4aba731-eb4b-4394-843c-7f704d4838f9	f	2026-09-23 06:52:46.772
3c85e14e-433c-44ae-b06c-c7ff08daea92	be9a0dd8-f525-403b-8c54-45d7f34a7570	e4aba731-eb4b-4394-843c-7f704d4838f9	f	2026-09-23 06:52:46.772
a380a68f-e27b-4e80-bd54-ebb06806f3a0	d37e3c4f-f763-4c56-8254-2acc13c24927	e4aba731-eb4b-4394-843c-7f704d4838f9	f	2026-09-23 06:52:46.772
b6f524a4-e4cb-4c5e-b144-064b1f11b0f6	6b6d957f-362e-446f-9c61-375c17bd6201	e4aba731-eb4b-4394-843c-7f704d4838f9	f	2026-09-23 06:52:46.772
77f4419c-e4e8-41b7-b7da-e2c17976797c	79604a14-4a74-4c65-a925-5f8e953ec609	0244afde-2a2e-4282-95ca-dc1abad52b6e	f	2026-09-23 06:52:46.774
f34ff11b-9920-4f1d-aa14-cd2daeffe34b	3fbf1cdd-5680-4802-9174-129dd38a2b62	0244afde-2a2e-4282-95ca-dc1abad52b6e	f	2026-09-23 06:52:46.774
0f84ad67-72b7-471d-912c-46295f1c5e3d	c9788a8d-ec88-4679-b72a-9dcae52c45a5	0244afde-2a2e-4282-95ca-dc1abad52b6e	f	2026-09-23 06:52:46.774
f0ba3150-ee35-4113-95a5-5cbd32b2a07d	be9a0dd8-f525-403b-8c54-45d7f34a7570	0244afde-2a2e-4282-95ca-dc1abad52b6e	f	2026-09-23 06:52:46.774
3187fe54-49d4-4e89-9b56-fe3d59993aff	d37e3c4f-f763-4c56-8254-2acc13c24927	0244afde-2a2e-4282-95ca-dc1abad52b6e	f	2026-09-23 06:52:46.774
03a34e87-903d-4fd5-8052-075750fc0bec	6b6d957f-362e-446f-9c61-375c17bd6201	0244afde-2a2e-4282-95ca-dc1abad52b6e	f	2026-09-23 06:52:46.774
9c4ebecd-dc4a-44a9-8fa4-a751a7a8aa66	79604a14-4a74-4c65-a925-5f8e953ec609	030411fe-e37d-4442-b121-603d4813f5bf	f	2026-09-23 06:52:46.775
c22dac68-fe43-4062-a8ae-60702f685cc6	3fbf1cdd-5680-4802-9174-129dd38a2b62	030411fe-e37d-4442-b121-603d4813f5bf	f	2026-09-23 06:52:46.775
bd20006f-ce49-4791-85d7-23be95f840cb	c9788a8d-ec88-4679-b72a-9dcae52c45a5	030411fe-e37d-4442-b121-603d4813f5bf	f	2026-09-23 06:52:46.775
bd60f4a4-2cb3-454c-ae0f-f541b98af212	be9a0dd8-f525-403b-8c54-45d7f34a7570	030411fe-e37d-4442-b121-603d4813f5bf	f	2026-09-23 06:52:46.775
6c7ce929-9d5f-4d8e-ac18-07b7f086d770	d37e3c4f-f763-4c56-8254-2acc13c24927	030411fe-e37d-4442-b121-603d4813f5bf	f	2026-09-23 06:52:46.775
02688147-5ebe-4993-b0e2-a63f39c5ce54	6b6d957f-362e-446f-9c61-375c17bd6201	030411fe-e37d-4442-b121-603d4813f5bf	f	2026-09-23 06:52:46.775
6c9db7c9-6544-4239-8cc4-ea1b925e99b5	79604a14-4a74-4c65-a925-5f8e953ec609	3898fdc6-de13-4b0b-9adb-8499305d3559	f	2026-09-23 06:52:46.775
dba0b4a9-2807-4fb5-add7-73c715fcb03f	3fbf1cdd-5680-4802-9174-129dd38a2b62	3898fdc6-de13-4b0b-9adb-8499305d3559	f	2026-09-23 06:52:46.775
fd1c0ae1-f7f4-44e9-8c63-bef8825614d1	c9788a8d-ec88-4679-b72a-9dcae52c45a5	3898fdc6-de13-4b0b-9adb-8499305d3559	f	2026-09-23 06:52:46.775
469acfd3-c1c1-4eae-aa9e-202630a0ca9e	be9a0dd8-f525-403b-8c54-45d7f34a7570	3898fdc6-de13-4b0b-9adb-8499305d3559	f	2026-09-23 06:52:46.775
929292f7-f532-47d4-a555-70835f1360be	d37e3c4f-f763-4c56-8254-2acc13c24927	3898fdc6-de13-4b0b-9adb-8499305d3559	f	2026-09-23 06:52:46.775
f70ee927-24ba-49bd-b0c0-bf2652b9de44	6b6d957f-362e-446f-9c61-375c17bd6201	3898fdc6-de13-4b0b-9adb-8499305d3559	f	2026-09-23 06:52:46.775
b0435175-93d7-4ff3-bd64-968b2b84c305	79604a14-4a74-4c65-a925-5f8e953ec609	1c2b8e43-245d-42a3-adb5-2671be4b95ba	f	2026-09-23 06:52:46.777
ba51b0a0-229c-4fec-bc83-763e435aa8b8	3fbf1cdd-5680-4802-9174-129dd38a2b62	1c2b8e43-245d-42a3-adb5-2671be4b95ba	f	2026-09-23 06:52:46.777
a6cb0485-5298-47e3-9e6e-f9098be49794	c9788a8d-ec88-4679-b72a-9dcae52c45a5	1c2b8e43-245d-42a3-adb5-2671be4b95ba	f	2026-09-23 06:52:46.777
d5b8e24f-8294-4e2c-8d5b-ef079ddf5c96	be9a0dd8-f525-403b-8c54-45d7f34a7570	1c2b8e43-245d-42a3-adb5-2671be4b95ba	f	2026-09-23 06:52:46.777
6f4786ed-cfb0-462d-bd2a-ec03aba3a4a3	d37e3c4f-f763-4c56-8254-2acc13c24927	1c2b8e43-245d-42a3-adb5-2671be4b95ba	f	2026-09-23 06:52:46.777
b998d9b6-26bb-4e8b-b2b4-c6446c93c438	6b6d957f-362e-446f-9c61-375c17bd6201	1c2b8e43-245d-42a3-adb5-2671be4b95ba	f	2026-09-23 06:52:46.777
664e2739-cd5d-43a5-8abf-a49a02667c1c	79604a14-4a74-4c65-a925-5f8e953ec609	0f8bf570-765d-4b8f-b135-2261fc299a6d	f	2026-09-23 06:52:46.777
4b824f58-617e-434d-9613-694f734e02a4	3fbf1cdd-5680-4802-9174-129dd38a2b62	0f8bf570-765d-4b8f-b135-2261fc299a6d	f	2026-09-23 06:52:46.777
47d45920-384a-48e1-80da-5ab5a2e8d806	c9788a8d-ec88-4679-b72a-9dcae52c45a5	0f8bf570-765d-4b8f-b135-2261fc299a6d	f	2026-09-23 06:52:46.777
137744a7-8c21-4ecb-a371-e058911b7389	be9a0dd8-f525-403b-8c54-45d7f34a7570	0f8bf570-765d-4b8f-b135-2261fc299a6d	f	2026-09-23 06:52:46.777
e0665e19-936c-4e9e-acfb-d2b7ef0efef5	d37e3c4f-f763-4c56-8254-2acc13c24927	0f8bf570-765d-4b8f-b135-2261fc299a6d	f	2026-09-23 06:52:46.777
f73c069d-4606-467d-992f-4f77aa62910e	6b6d957f-362e-446f-9c61-375c17bd6201	0f8bf570-765d-4b8f-b135-2261fc299a6d	f	2026-09-23 06:52:46.777
8cdea7fe-5398-4cef-b4ef-5a5fe96676ec	79604a14-4a74-4c65-a925-5f8e953ec609	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	f	2026-09-23 06:52:46.778
44fc681d-0cdc-4509-8e35-ede63066f92e	3fbf1cdd-5680-4802-9174-129dd38a2b62	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	f	2026-09-23 06:52:46.778
7e0cd5ae-8cca-4585-90dc-15881984f766	c9788a8d-ec88-4679-b72a-9dcae52c45a5	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	f	2026-09-23 06:52:46.778
dc4e901d-6083-40b4-a912-2d56d9f17764	be9a0dd8-f525-403b-8c54-45d7f34a7570	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	f	2026-09-23 06:52:46.778
4204a17d-0f92-459a-989f-4f9e0897e27a	d37e3c4f-f763-4c56-8254-2acc13c24927	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	f	2026-09-23 06:52:46.778
f2d928cf-4298-4f97-a8c8-80d9f54b59e7	6b6d957f-362e-446f-9c61-375c17bd6201	aa2df444-efa8-44e0-a9b7-1fb4874f0d5b	f	2026-09-23 06:52:46.778
5b806f04-2506-451f-865f-062489543cdc	79604a14-4a74-4c65-a925-5f8e953ec609	afbb8543-7464-4290-ae99-4d3c654fb777	f	2026-09-23 06:52:46.779
75103cba-750a-4628-8ec0-7ac5f443da44	3fbf1cdd-5680-4802-9174-129dd38a2b62	afbb8543-7464-4290-ae99-4d3c654fb777	f	2026-09-23 06:52:46.779
a772b21f-d2cf-4ca3-a01f-6f2ad794f45c	c9788a8d-ec88-4679-b72a-9dcae52c45a5	afbb8543-7464-4290-ae99-4d3c654fb777	f	2026-09-23 06:52:46.779
cec0a07c-3c30-40b5-8816-871456fbda9d	be9a0dd8-f525-403b-8c54-45d7f34a7570	afbb8543-7464-4290-ae99-4d3c654fb777	f	2026-09-23 06:52:46.779
0bfaca80-1cdf-43a3-93ac-2f52415b9c61	d37e3c4f-f763-4c56-8254-2acc13c24927	afbb8543-7464-4290-ae99-4d3c654fb777	f	2026-09-23 06:52:46.779
69dd4086-42d2-4caf-aa13-e9769690a6b5	6b6d957f-362e-446f-9c61-375c17bd6201	afbb8543-7464-4290-ae99-4d3c654fb777	f	2026-09-23 06:52:46.779
037587a6-25c3-4872-9702-0f02c2e85fa8	79604a14-4a74-4c65-a925-5f8e953ec609	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	f	2026-09-23 06:52:46.78
e6692d77-ba55-4b23-b807-7799c985a5f4	3fbf1cdd-5680-4802-9174-129dd38a2b62	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	f	2026-09-23 06:52:46.78
a983872a-c1d9-4b23-9909-1b9fa6f9bfc2	c9788a8d-ec88-4679-b72a-9dcae52c45a5	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	f	2026-09-23 06:52:46.78
332cd35e-27e0-4c0b-a4f8-0c9309d723d2	be9a0dd8-f525-403b-8c54-45d7f34a7570	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	f	2026-09-23 06:52:46.78
c1b4b091-2503-41f5-af9e-b7a7dd6febe0	d37e3c4f-f763-4c56-8254-2acc13c24927	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	f	2026-09-23 06:52:46.78
a11a3379-0aad-4753-adcf-1a59253570e2	6b6d957f-362e-446f-9c61-375c17bd6201	321fe9e5-83c9-40f4-a345-3802c6e9d5bf	f	2026-09-23 06:52:46.78
14ecf364-4daa-45f3-aaae-6e63e661776a	79604a14-4a74-4c65-a925-5f8e953ec609	25987508-ee1d-4722-b814-5f6596cc783a	f	2026-09-23 06:52:46.781
9223ef9e-4366-416d-bfd9-7ba12c483dd7	3fbf1cdd-5680-4802-9174-129dd38a2b62	25987508-ee1d-4722-b814-5f6596cc783a	f	2026-09-23 06:52:46.781
df1d224b-bcc8-46e1-a913-3df25f1c347f	c9788a8d-ec88-4679-b72a-9dcae52c45a5	25987508-ee1d-4722-b814-5f6596cc783a	f	2026-09-23 06:52:46.781
5a01d857-80dc-45d7-8cf0-250880b68477	be9a0dd8-f525-403b-8c54-45d7f34a7570	25987508-ee1d-4722-b814-5f6596cc783a	f	2026-09-23 06:52:46.781
9c83c08b-0b7f-4c40-ba2a-e2dbc89b9630	d37e3c4f-f763-4c56-8254-2acc13c24927	25987508-ee1d-4722-b814-5f6596cc783a	f	2026-09-23 06:52:46.781
e030f192-78eb-424a-8335-85f9a4722c97	6b6d957f-362e-446f-9c61-375c17bd6201	25987508-ee1d-4722-b814-5f6596cc783a	f	2026-09-23 06:52:46.781
2679a942-45bc-4a48-98cd-24bfff8d4174	79604a14-4a74-4c65-a925-5f8e953ec609	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	f	2026-09-23 06:52:46.782
a6540059-cfc6-4c77-9c17-3e3e1889d4bd	3fbf1cdd-5680-4802-9174-129dd38a2b62	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	f	2026-09-23 06:52:46.782
ae65902f-ef1a-44b9-ad7b-9c82e4358688	c9788a8d-ec88-4679-b72a-9dcae52c45a5	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	f	2026-09-23 06:52:46.782
ac16e276-d504-479a-b3a1-5262c6a79d12	be9a0dd8-f525-403b-8c54-45d7f34a7570	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	f	2026-09-23 06:52:46.782
e02041d6-5f89-4ffc-8dec-8f4be372adf1	d37e3c4f-f763-4c56-8254-2acc13c24927	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	f	2026-09-23 06:52:46.782
559aa8d6-538d-4c7f-8cb8-3827f937ecf9	6b6d957f-362e-446f-9c61-375c17bd6201	cc121a90-71a2-4f0d-b804-0e68bc5e0c3e	f	2026-09-23 06:52:46.782
376e4c47-bffe-42c3-8570-dfbaa895c33d	79604a14-4a74-4c65-a925-5f8e953ec609	67234d49-0607-43eb-b468-7a1a742b5f59	f	2026-09-23 06:52:46.783
563b4d7e-f060-48e4-b291-cb5d28e6d3dd	3fbf1cdd-5680-4802-9174-129dd38a2b62	67234d49-0607-43eb-b468-7a1a742b5f59	f	2026-09-23 06:52:46.783
9f943f39-e0f1-4956-9b7c-6e533af13c8c	c9788a8d-ec88-4679-b72a-9dcae52c45a5	67234d49-0607-43eb-b468-7a1a742b5f59	f	2026-09-23 06:52:46.783
f813f20c-8a6f-4313-aff8-36b59a486cdd	be9a0dd8-f525-403b-8c54-45d7f34a7570	67234d49-0607-43eb-b468-7a1a742b5f59	f	2026-09-23 06:52:46.783
214374b3-5a85-4661-ba25-44b553006da6	d37e3c4f-f763-4c56-8254-2acc13c24927	67234d49-0607-43eb-b468-7a1a742b5f59	f	2026-09-23 06:52:46.783
a05f9db2-67ce-48b1-a818-fae5e6ca7b05	6b6d957f-362e-446f-9c61-375c17bd6201	67234d49-0607-43eb-b468-7a1a742b5f59	f	2026-09-23 06:52:46.783
9e4ecf66-625c-40ee-8c9b-525d462cd91e	79604a14-4a74-4c65-a925-5f8e953ec609	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	f	2026-09-23 06:52:46.784
4bc9c7c7-c469-4560-8379-2b7812cc8460	3fbf1cdd-5680-4802-9174-129dd38a2b62	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	f	2026-09-23 06:52:46.784
7a25b330-725b-4697-9fb0-8fb6666622c3	c9788a8d-ec88-4679-b72a-9dcae52c45a5	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	f	2026-09-23 06:52:46.784
283aa02e-7eec-492c-a91a-2a60401fc528	be9a0dd8-f525-403b-8c54-45d7f34a7570	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	f	2026-09-23 06:52:46.784
3a25a976-a283-41cf-aea2-8ef201a3bd5b	d37e3c4f-f763-4c56-8254-2acc13c24927	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	f	2026-09-23 06:52:46.784
67e4f96c-79b4-4fda-ba67-6c9970c53ff4	6b6d957f-362e-446f-9c61-375c17bd6201	a6ed953e-a4b6-41b3-8aba-d3e47ad95ac8	f	2026-09-23 06:52:46.784
c9689df9-48ad-48f1-98cf-a088d9863843	79604a14-4a74-4c65-a925-5f8e953ec609	d8dbd457-63e9-4040-b873-267bf4712118	f	2026-09-23 06:52:46.786
c291ddbb-4258-4c48-9650-c8262b4234e0	3fbf1cdd-5680-4802-9174-129dd38a2b62	d8dbd457-63e9-4040-b873-267bf4712118	t	2026-09-23 06:52:46.786
a3f4032c-bfbf-4715-a2fa-7987c2707baf	c9788a8d-ec88-4679-b72a-9dcae52c45a5	d8dbd457-63e9-4040-b873-267bf4712118	f	2026-09-23 06:52:46.786
b75332e6-4194-47e4-a8d8-0145236f8ac0	be9a0dd8-f525-403b-8c54-45d7f34a7570	d8dbd457-63e9-4040-b873-267bf4712118	t	2026-09-23 06:52:46.786
5e8eec6e-082e-42e0-b62c-dd002153c6b4	d37e3c4f-f763-4c56-8254-2acc13c24927	d8dbd457-63e9-4040-b873-267bf4712118	f	2026-09-23 06:52:46.786
5a8739db-0f87-4d86-bc67-4a6c0ebf7e0b	6b6d957f-362e-446f-9c61-375c17bd6201	d8dbd457-63e9-4040-b873-267bf4712118	t	2026-09-23 06:52:46.786
c538ea68-46b9-4d5a-ad31-2698694e3f55	79604a14-4a74-4c65-a925-5f8e953ec609	f13bd4c8-950c-4605-b6c3-587ece85dac5	f	2026-09-23 06:52:46.787
ce4e690f-fa86-4ec1-86e5-8af83db99ccd	3fbf1cdd-5680-4802-9174-129dd38a2b62	f13bd4c8-950c-4605-b6c3-587ece85dac5	f	2026-09-23 06:52:46.787
f0e0caf5-cf5a-4f6d-b7ee-9224c9ad4033	c9788a8d-ec88-4679-b72a-9dcae52c45a5	f13bd4c8-950c-4605-b6c3-587ece85dac5	f	2026-09-23 06:52:46.787
abe2c9ab-c06e-4645-972b-2485f7accdd0	be9a0dd8-f525-403b-8c54-45d7f34a7570	f13bd4c8-950c-4605-b6c3-587ece85dac5	f	2026-09-23 06:52:46.787
530ba5a3-3308-4c8b-9423-58727c2061c6	d37e3c4f-f763-4c56-8254-2acc13c24927	f13bd4c8-950c-4605-b6c3-587ece85dac5	f	2026-09-23 06:52:46.787
aec9774d-2896-4e10-b3a0-3758a9ed7abf	6b6d957f-362e-446f-9c61-375c17bd6201	f13bd4c8-950c-4605-b6c3-587ece85dac5	f	2026-09-23 06:52:46.787
019aed7a-dd50-4915-8543-6230667f086e	d1c9ac36-506b-42eb-9472-c83873c0d37a	a24c8442-d623-4ffc-8fbc-4fdd876030ab	t	2026-09-23 06:52:46.84
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "tenantId", email, "passwordHash", "firstName", "lastName", phone, role, status, "avatarUrl", "createdAt", "updatedAt") FROM stdin;
0277955e-54f2-4c64-b7a6-7c5f29ba6606	2e310667-1c46-4818-ac37-379d159a30f7	platformadmin@maintly.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Vikram	Singhania	+91 9820011111	PLATFORM_ADMIN	ACTIVE	\N	2026-09-23 06:52:46.743	2026-09-23 06:52:46.743
79604a14-4a74-4c65-a925-5f8e953ec609	2e310667-1c46-4818-ac37-379d159a30f7	admin@bellad.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Sandeep	Bellad	+91 9845012345	TENANT_ADMIN	ACTIVE	\N	2026-09-23 06:52:46.744	2026-09-23 06:52:46.744
3fbf1cdd-5680-4802-9174-129dd38a2b62	2e310667-1c46-4818-ac37-379d159a30f7	manager@bellad.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Praveen	Kulkarni	+91 9845023456	MANAGER	ACTIVE	\N	2026-09-23 06:52:46.745	2026-09-23 06:52:46.745
c9788a8d-ec88-4679-b72a-9dcae52c45a5	2e310667-1c46-4818-ac37-379d159a30f7	approver@bellad.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Anil	Deshpande	+91 9845034567	APPROVER	ACTIVE	\N	2026-09-23 06:52:46.746	2026-09-23 06:52:46.746
be9a0dd8-f525-403b-8c54-45d7f34a7570	2e310667-1c46-4818-ac37-379d159a30f7	technician@bellad.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Ramesh	Pawar	+91 9845045678	MAINTENANCE_USER	ACTIVE	\N	2026-09-23 06:52:46.746	2026-09-23 06:52:46.746
d37e3c4f-f763-4c56-8254-2acc13c24927	2e310667-1c46-4818-ac37-379d159a30f7	purchase@bellad.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Sunil	Joshi	+91 9845056789	PURCHASE_USER	ACTIVE	\N	2026-09-23 06:52:46.747	2026-09-23 06:52:46.747
6b6d957f-362e-446f-9c61-375c17bd6201	2e310667-1c46-4818-ac37-379d159a30f7	employee@bellad.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Mahesh	Hiremath	+91 9845067890	EMPLOYEE	ACTIVE	\N	2026-09-23 06:52:46.748	2026-09-23 06:52:46.748
d1c9ac36-506b-42eb-9472-c83873c0d37a	30d424ac-9074-40b8-b062-deae1a023a3d	admin@omnilogistics.com	$2a$10$y2UigyCjnbIPiAVQtDz50OKIgJ3Bj8F5vPiAjDpoZgBhxVLLw4XgC	Rajesh	Mehta	+91 9988011223	TENANT_ADMIN	ACTIVE	\N	2026-09-23 06:52:46.83	2026-09-23 06:52:46.83
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, "tenantId", name, "contactPerson", phone, email, address, gstin, category, "isActive", notes, "createdAt", "updatedAt") FROM stdin;
4f2d00d9-1d59-471d-bbd6-ccaf05a1158a	2e310667-1c46-4818-ac37-379d159a30f7	Hubli Industrial Electricals	Kishore Patil	+91 9844012345	sales@hublielectricals.com	\N	\N	Electrical Supplies	t	\N	2026-09-23 06:52:46.789	2026-09-23 06:52:46.789
ffe5831d-1c0a-48d0-aef9-6e344f444c0e	2e310667-1c46-4818-ac37-379d159a30f7	Karnataka Building Solutions	Suresh Angadi	+91 9844067890	orders@karnatakabuilding.com	\N	\N	Civil & Flooring	t	\N	2026-09-23 06:52:46.79	2026-09-23 06:52:46.79
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branch_areas branch_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_areas
    ADD CONSTRAINT branch_areas_pkey PRIMARY KEY (id);


--
-- Name: branch_departments branch_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_departments
    ADD CONSTRAINT branch_departments_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: maintenance_request_assignments maintenance_request_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_assignments
    ADD CONSTRAINT maintenance_request_assignments_pkey PRIMARY KEY (id);


--
-- Name: maintenance_request_attachments maintenance_request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_attachments
    ADD CONSTRAINT maintenance_request_attachments_pkey PRIMARY KEY (id);


--
-- Name: maintenance_request_comments maintenance_request_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_comments
    ADD CONSTRAINT maintenance_request_comments_pkey PRIMARY KEY (id);


--
-- Name: maintenance_request_materials maintenance_request_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_materials
    ADD CONSTRAINT maintenance_request_materials_pkey PRIMARY KEY (id);


--
-- Name: maintenance_request_status_histories maintenance_request_status_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_histories
    ADD CONSTRAINT maintenance_request_status_histories_pkey PRIMARY KEY (id);


--
-- Name: maintenance_requests maintenance_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id);


--
-- Name: maintenance_types maintenance_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_types
    ADD CONSTRAINT maintenance_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_requests purchase_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: user_branch_accesses user_branch_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_branch_accesses
    ADD CONSTRAINT user_branch_accesses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON public.audit_logs USING btree ("tenantId", "createdAt");


--
-- Name: audit_logs_tenantId_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_entity_idx" ON public.audit_logs USING btree ("tenantId", entity);


--
-- Name: branch_areas_branchId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "branch_areas_branchId_code_key" ON public.branch_areas USING btree ("branchId", code);


--
-- Name: branch_areas_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branch_areas_branchId_idx" ON public.branch_areas USING btree ("branchId");


--
-- Name: branch_areas_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branch_areas_tenantId_idx" ON public.branch_areas USING btree ("tenantId");


--
-- Name: branch_departments_branchId_departmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "branch_departments_branchId_departmentId_key" ON public.branch_departments USING btree ("branchId", "departmentId");


--
-- Name: branch_departments_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branch_departments_branchId_idx" ON public.branch_departments USING btree ("branchId");


--
-- Name: branch_departments_departmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branch_departments_departmentId_idx" ON public.branch_departments USING btree ("departmentId");


--
-- Name: branch_departments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branch_departments_tenantId_idx" ON public.branch_departments USING btree ("tenantId");


--
-- Name: branches_brandId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branches_brandId_idx" ON public.branches USING btree ("brandId");


--
-- Name: branches_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "branches_tenantId_code_key" ON public.branches USING btree ("tenantId", code);


--
-- Name: branches_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branches_tenantId_idx" ON public.branches USING btree ("tenantId");


--
-- Name: brands_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "brands_tenantId_code_key" ON public.brands USING btree ("tenantId", code);


--
-- Name: brands_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "brands_tenantId_idx" ON public.brands USING btree ("tenantId");


--
-- Name: departments_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "departments_tenantId_code_key" ON public.departments USING btree ("tenantId", code);


--
-- Name: departments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "departments_tenantId_idx" ON public.departments USING btree ("tenantId");


--
-- Name: maintenance_request_assignments_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_assignments_assignedToId_idx" ON public.maintenance_request_assignments USING btree ("assignedToId");


--
-- Name: maintenance_request_assignments_requestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_assignments_requestId_idx" ON public.maintenance_request_assignments USING btree ("requestId");


--
-- Name: maintenance_request_assignments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_assignments_tenantId_idx" ON public.maintenance_request_assignments USING btree ("tenantId");


--
-- Name: maintenance_request_attachments_requestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_attachments_requestId_idx" ON public.maintenance_request_attachments USING btree ("requestId");


--
-- Name: maintenance_request_attachments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_attachments_tenantId_idx" ON public.maintenance_request_attachments USING btree ("tenantId");


--
-- Name: maintenance_request_comments_requestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_comments_requestId_idx" ON public.maintenance_request_comments USING btree ("requestId");


--
-- Name: maintenance_request_comments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_comments_tenantId_idx" ON public.maintenance_request_comments USING btree ("tenantId");


--
-- Name: maintenance_request_materials_requestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_materials_requestId_idx" ON public.maintenance_request_materials USING btree ("requestId");


--
-- Name: maintenance_request_materials_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_materials_tenantId_idx" ON public.maintenance_request_materials USING btree ("tenantId");


--
-- Name: maintenance_request_status_histories_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_status_histories_createdAt_idx" ON public.maintenance_request_status_histories USING btree ("createdAt");


--
-- Name: maintenance_request_status_histories_requestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_status_histories_requestId_idx" ON public.maintenance_request_status_histories USING btree ("requestId");


--
-- Name: maintenance_request_status_histories_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_request_status_histories_tenantId_idx" ON public.maintenance_request_status_histories USING btree ("tenantId");


--
-- Name: maintenance_requests_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_assignedToId_idx" ON public.maintenance_requests USING btree ("assignedToId");


--
-- Name: maintenance_requests_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_branchId_idx" ON public.maintenance_requests USING btree ("branchId");


--
-- Name: maintenance_requests_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_createdAt_idx" ON public.maintenance_requests USING btree ("createdAt");


--
-- Name: maintenance_requests_deadline_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_requests_deadline_idx ON public.maintenance_requests USING btree (deadline);


--
-- Name: maintenance_requests_departmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_departmentId_idx" ON public.maintenance_requests USING btree ("departmentId");


--
-- Name: maintenance_requests_maintenanceTypeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_maintenanceTypeId_idx" ON public.maintenance_requests USING btree ("maintenanceTypeId");


--
-- Name: maintenance_requests_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maintenance_requests_priority_idx ON public.maintenance_requests USING btree (priority);


--
-- Name: maintenance_requests_requesterId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_requesterId_idx" ON public.maintenance_requests USING btree ("requesterId");


--
-- Name: maintenance_requests_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_tenantId_idx" ON public.maintenance_requests USING btree ("tenantId");


--
-- Name: maintenance_requests_tenantId_requestNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "maintenance_requests_tenantId_requestNumber_key" ON public.maintenance_requests USING btree ("tenantId", "requestNumber");


--
-- Name: maintenance_requests_workStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_requests_workStatus_idx" ON public.maintenance_requests USING btree ("workStatus");


--
-- Name: maintenance_types_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_types_sortOrder_idx" ON public.maintenance_types USING btree ("sortOrder");


--
-- Name: maintenance_types_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "maintenance_types_tenantId_code_key" ON public.maintenance_types USING btree ("tenantId", code);


--
-- Name: maintenance_types_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maintenance_types_tenantId_idx" ON public.maintenance_types USING btree ("tenantId");


--
-- Name: maintenance_types_tenantId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "maintenance_types_tenantId_name_key" ON public.maintenance_types USING btree ("tenantId", name);


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_tenantId_userId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_tenantId_userId_isRead_idx" ON public.notifications USING btree ("tenantId", "userId", "isRead");


--
-- Name: purchase_items_purchaseRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_items_purchaseRequestId_idx" ON public.purchase_items USING btree ("purchaseRequestId");


--
-- Name: purchase_requests_maintenanceRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_requests_maintenanceRequestId_idx" ON public.purchase_requests USING btree ("maintenanceRequestId");


--
-- Name: purchase_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_requests_status_idx ON public.purchase_requests USING btree (status);


--
-- Name: purchase_requests_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_requests_tenantId_idx" ON public.purchase_requests USING btree ("tenantId");


--
-- Name: purchase_requests_tenantId_prNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "purchase_requests_tenantId_prNumber_key" ON public.purchase_requests USING btree ("tenantId", "prNumber");


--
-- Name: quotations_purchaseRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quotations_purchaseRequestId_idx" ON public.quotations USING btree ("purchaseRequestId");


--
-- Name: quotations_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quotations_tenantId_idx" ON public.quotations USING btree ("tenantId");


--
-- Name: quotations_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quotations_vendorId_idx" ON public.quotations USING btree ("vendorId");


--
-- Name: settings_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "settings_tenantId_idx" ON public.settings USING btree ("tenantId");


--
-- Name: settings_tenantId_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "settings_tenantId_key_key" ON public.settings USING btree ("tenantId", key);


--
-- Name: tenants_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_code_key ON public.tenants USING btree (code);


--
-- Name: tenants_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);


--
-- Name: user_branch_accesses_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_branch_accesses_branchId_idx" ON public.user_branch_accesses USING btree ("branchId");


--
-- Name: user_branch_accesses_userId_branchId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_branch_accesses_userId_branchId_key" ON public.user_branch_accesses USING btree ("userId", "branchId");


--
-- Name: user_branch_accesses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_branch_accesses_userId_idx" ON public.user_branch_accesses USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_tenantId_idx" ON public.users USING btree ("tenantId");


--
-- Name: vendors_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendors_category_idx ON public.vendors USING btree (category);


--
-- Name: vendors_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vendors_tenantId_idx" ON public.vendors USING btree ("tenantId");


--
-- Name: audit_logs audit_logs_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branch_areas branch_areas_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_areas
    ADD CONSTRAINT "branch_areas_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branch_areas branch_areas_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_areas
    ADD CONSTRAINT "branch_areas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branch_departments branch_departments_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_departments
    ADD CONSTRAINT "branch_departments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branch_departments branch_departments_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_departments
    ADD CONSTRAINT "branch_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branch_departments branch_departments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_departments
    ADD CONSTRAINT "branch_departments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branches branches_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "branches_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branches branches_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "branches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: brands brands_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "brands_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_assignments maintenance_request_assignments_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_assignments
    ADD CONSTRAINT "maintenance_request_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_assignments maintenance_request_assignments_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_assignments
    ADD CONSTRAINT "maintenance_request_assignments_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_assignments maintenance_request_assignments_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_assignments
    ADD CONSTRAINT "maintenance_request_assignments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_assignments maintenance_request_assignments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_assignments
    ADD CONSTRAINT "maintenance_request_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_attachments maintenance_request_attachments_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_attachments
    ADD CONSTRAINT "maintenance_request_attachments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_attachments maintenance_request_attachments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_attachments
    ADD CONSTRAINT "maintenance_request_attachments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_attachments maintenance_request_attachments_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_attachments
    ADD CONSTRAINT "maintenance_request_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_comments maintenance_request_comments_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_comments
    ADD CONSTRAINT "maintenance_request_comments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_comments maintenance_request_comments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_comments
    ADD CONSTRAINT "maintenance_request_comments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_comments maintenance_request_comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_comments
    ADD CONSTRAINT "maintenance_request_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_materials maintenance_request_materials_addedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_materials
    ADD CONSTRAINT "maintenance_request_materials_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_materials maintenance_request_materials_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_materials
    ADD CONSTRAINT "maintenance_request_materials_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_materials maintenance_request_materials_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_materials
    ADD CONSTRAINT "maintenance_request_materials_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_status_histories maintenance_request_status_histories_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_histories
    ADD CONSTRAINT "maintenance_request_status_histories_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_status_histories maintenance_request_status_histories_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_histories
    ADD CONSTRAINT "maintenance_request_status_histories_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_request_status_histories maintenance_request_status_histories_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_histories
    ADD CONSTRAINT "maintenance_request_status_histories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_requests maintenance_requests_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_branchAreaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_branchAreaId_fkey" FOREIGN KEY ("branchAreaId") REFERENCES public.branch_areas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_requests maintenance_requests_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_requests maintenance_requests_dissatisfiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_dissatisfiedById_fkey" FOREIGN KEY ("dissatisfiedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_maintenanceTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_maintenanceTypeId_fkey" FOREIGN KEY ("maintenanceTypeId") REFERENCES public.maintenance_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_requests maintenance_requests_rejectedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_requests maintenance_requests_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_requests maintenance_requests_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_requests maintenance_requests_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT "maintenance_requests_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_types maintenance_types_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_types
    ADD CONSTRAINT "maintenance_types_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_purchaseRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT "purchase_items_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES public.purchase_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_requests purchase_requests_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT "purchase_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_requests purchase_requests_maintenanceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT "purchase_requests_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_requests purchase_requests_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT "purchase_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_requests purchase_requests_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT "purchase_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_requests purchase_requests_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT "purchase_requests_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_purchaseRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES public.purchase_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: settings settings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_branch_accesses user_branch_accesses_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_branch_accesses
    ADD CONSTRAINT "user_branch_accesses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_branch_accesses user_branch_accesses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_branch_accesses
    ADD CONSTRAINT "user_branch_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendors vendors_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QcpcqhylHKa5Pl0XogTMSssCdMlTbEWMBQ04IQd0EP8dFhdNPEc0hxSyIm9gJzt

