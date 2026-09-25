--
-- PostgreSQL database dump
--

\restrict ppQgpgd4o4pwm4vjJwWew7vbzSuadJRk4YRAACHPCOt8TcNZlwaHYv2NS2X8ppj

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
-- Name: AppSubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppSubscriptionStatus" AS ENUM (
    'ACTIVE',
    'TRIAL',
    'EXPIRED',
    'SUSPENDED',
    'PENDING'
);


ALTER TYPE public."AppSubscriptionStatus" OWNER TO postgres;

--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EventStatus" AS ENUM (
    'PENDING',
    'PUBLISHED',
    'FAILED',
    'DEAD_LETTER'
);


ALTER TYPE public."EventStatus" OWNER TO postgres;

--
-- Name: ScopeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ScopeType" AS ENUM (
    'GLOBAL',
    'TENANT',
    'FIRM',
    'BRAND',
    'BRANCH',
    'DEPARTMENT'
);


ALTER TYPE public."ScopeType" OWNER TO postgres;

--
-- Name: SubscriptionTier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionTier" AS ENUM (
    'STARTER',
    'PROFESSIONAL',
    'ENTERPRISE',
    'CUSTOM'
);


ALTER TYPE public."SubscriptionTier" OWNER TO postgres;

--
-- Name: TenantStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TenantStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'INACTIVE',
    'TRIAL'
);


ALTER TYPE public."TenantStatus" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'INVITED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id text NOT NULL,
    "appKey" text NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT 'AppWindow'::text,
    "baseUrl" text NOT NULL,
    "apiUrl" text NOT NULL,
    version text DEFAULT '1.0.0'::text NOT NULL,
    category text DEFAULT 'OPERATIONS'::text NOT NULL,
    "healthEndpoint" text DEFAULT '/api/health'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    settings jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "firmId" text NOT NULL,
    "firmBrandId" text,
    code text NOT NULL,
    name text NOT NULL,
    "outletType" text DEFAULT '3S_FACILITY'::text NOT NULL,
    address text,
    city text NOT NULL,
    state text NOT NULL,
    pincode text,
    phone text,
    email text,
    gstin text,
    active boolean DEFAULT true NOT NULL,
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
    code text NOT NULL,
    name text NOT NULL,
    "logoUrl" text,
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
    "branchId" text,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: firm_brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.firm_brands (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "firmId" text NOT NULL,
    "brandId" text NOT NULL,
    "dealerAgreementNo" text,
    "agreementExpiry" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.firm_brands OWNER TO postgres;

--
-- Name: firms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.firms (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "panNumber" text,
    gstin text,
    cin text,
    "tanNumber" text,
    "registeredAt" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.firms OWNER TO postgres;

--
-- Name: integration_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_events (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "eventType" text NOT NULL,
    "aggregateId" text NOT NULL,
    payload jsonb NOT NULL,
    status public."EventStatus" DEFAULT 'PENDING'::public."EventStatus" NOT NULL,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "maxRetries" integer DEFAULT 5 NOT NULL,
    "lastError" text,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.integration_events OWNER TO postgres;

--
-- Name: organization_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_memberships (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    "branchId" text NOT NULL,
    "departmentId" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "employeeCode" text,
    designation text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.organization_memberships OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    "applicationId" text,
    code text NOT NULL,
    domain text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    "tenantId" text,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "scopeType" public."ScopeType" DEFAULT 'TENANT'::public."ScopeType" NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: tenant_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_applications (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "applicationId" text NOT NULL,
    status public."AppSubscriptionStatus" DEFAULT 'ACTIVE'::public."AppSubscriptionStatus" NOT NULL,
    "planName" text DEFAULT 'STANDARD'::text NOT NULL,
    "customConfig" jsonb,
    features jsonb,
    "startsAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tenant_applications OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "legalName" text NOT NULL,
    status public."TenantStatus" DEFAULT 'ACTIVE'::public."TenantStatus" NOT NULL,
    "subscriptionTier" public."SubscriptionTier" DEFAULT 'ENTERPRISE'::public."SubscriptionTier" NOT NULL,
    "logoUrl" text,
    website text,
    "primaryContact" text,
    "primaryEmail" text,
    "primaryPhone" text,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    state text,
    pincode text,
    country text DEFAULT 'India'::text NOT NULL,
    timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    settings jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: user_role_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role_assignments (
    id text NOT NULL,
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "tenantId" text NOT NULL,
    "firmId" text,
    "brandId" text,
    "branchId" text,
    "departmentId" text,
    "scopeType" public."ScopeType" DEFAULT 'TENANT'::public."ScopeType" NOT NULL,
    "assignedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_role_assignments OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    "tenantId" text,
    "keycloakSub" text,
    email text NOT NULL,
    username text,
    "passwordHash" text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "isPlatformAdmin" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
08bb7f4b-7ed7-40d3-9fc5-90468ab085a9	e35ba56c0e7b99e9611857b4cd6a9751780da9819738eb3edac177c155c03780	2026-09-24 17:24:45.915399+05:30	20260924000000_init		\N	2026-09-24 17:24:45.915399+05:30	0
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, "appKey", name, description, icon, "baseUrl", "apiUrl", version, category, "healthEndpoint", "isActive", settings, "createdAt", "updatedAt") FROM stdin;
dcf21321-05e6-43e6-814f-fca410032216	hrflow	HRFlow HRMS & Payroll	Enterprise Human Resource Management, Indian Payroll & Compliance	Users	http://localhost:3001	http://localhost:5001	1.0.0	HR	/api/health	t	{"modules": ["employee-master", "attendance", "payroll", "vacancies", "joining", "exit"], "themeColor": "#4f46e5"}	2026-09-24 11:39:19.252	2026-09-24 11:39:19.252
797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintly	MAINTLY Facility & Operations	Multi-Branch Maintenance, Equipment Lifecycle & SLA Management	Wrench	http://localhost:3002	http://localhost:5002	1.0.0	OPERATIONS	/api/health	t	{"modules": ["requests", "approvals", "assignments", "purchases", "vendors", "assets"], "themeColor": "#2563eb"}	2026-09-24 11:39:19.258	2026-09-24 11:39:19.258
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "tenantId", "userId", action, "entityType", "entityId", "oldValue", "newValue", "ipAddress", "userAgent", "createdAt") FROM stdin;
7da0c77f-f8f8-4305-903b-4a20374ff00b	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	04d7ae03-ea36-43d7-bfda-6630852445b7	\N	{"code": "BKL_1790250656249", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-24 11:50:56.264
283633ae-6088-416b-951e-088fe7b140aa	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	1e8272bf-ba32-48d3-b00b-96c8fe249107	\N	{"code": "KIA_1790250656266", "name": "Kia India Private Limited"}	\N	\N	2026-09-24 11:50:56.279
05a464f3-d1ba-4e95-b3c2-5e703b344da6	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	bf5f9877-948c-400d-a1cb-414db22e9d58	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-24 11:50:56.325
e3be87f8-0b24-4759-9fdf-38dc89966678	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	\N	{"city": "Hubli", "code": "KIA_HBL_1790250656328", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-24 11:50:56.35
e7c698de-7773-4dd5-b236-826c7cd850e9	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	b2837da8-54bd-4e9a-839a-b003aee5f333	\N	{"email": "tech.floating.1790250656714@belladgroup.com", "branchId": "7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-24 11:50:56.799
b4a77ad9-e65c-4739-b68c-35f3abbbb8b4	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	7d03ede1-69c0-40e8-a82b-46f4b5f8e14a	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "b2837da8-54bd-4e9a-839a-b003aee5f333", "isPrimary": false}	\N	\N	2026-09-24 11:50:56.826
d124c6f7-f2d0-4979-90f5-6de1d7f89c12	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	77ca7d83-d238-4fca-bd56-f4655ae2d5a5	\N	{"role": "TECHNICIAN", "userId": "b2837da8-54bd-4e9a-839a-b003aee5f333", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-24 11:50:56.858
615235ea-bf90-4deb-8575-42dfe68f9cbd	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	77ca7d83-d238-4fca-bd56-f4655ae2d5a5	{"role": "TECHNICIAN", "userId": "b2837da8-54bd-4e9a-839a-b003aee5f333"}	\N	\N	\N	2026-09-24 11:50:56.87
66095c1b-2409-425f-8875-4ab20c7ae987	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	b2837da8-54bd-4e9a-839a-b003aee5f333	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-24 11:50:56.887
4bd010aa-8305-4941-add9-c235a6142488	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	ec063757-7715-4608-9608-cc6dcd55e68d	\N	{"code": "BKL_1790250687286", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-24 11:51:27.296
e62f1670-aba0-4501-85bb-14961324291c	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	e1cc2d13-6db1-4514-8026-f828d7fc0527	\N	{"code": "KIA_1790250687297", "name": "Kia India Private Limited"}	\N	\N	2026-09-24 11:51:27.32
c8f6014b-f14a-4bec-b9d0-6ec468688be8	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	00ef0274-cb3f-40c7-88b5-96a25db85a0f	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-24 11:51:27.338
13b95e83-66ea-4897-b7b8-70491592edfd	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	93f8b106-08f9-4cdc-b092-8c158089124d	\N	{"city": "Hubli", "code": "KIA_HBL_1790250687339", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-24 11:51:27.36
c98130e6-4c94-4212-8ac2-5ef3045a6df1	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	cdb0fe3f-1e53-4b85-9175-dfb59e56c455	\N	{"email": "tech.floating.1790250687714@belladgroup.com", "branchId": "93f8b106-08f9-4cdc-b092-8c158089124d", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-24 11:51:27.796
13c7eff9-c015-4e5e-8441-3592fb251e32	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	847aa15d-acfa-46d4-87b6-65008d6b481c	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "cdb0fe3f-1e53-4b85-9175-dfb59e56c455", "isPrimary": false}	\N	\N	2026-09-24 11:51:27.808
c89e3806-fe21-4cfe-b3b4-82ec8c5dd500	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	166ac4eb-8ee7-4000-ab01-f4a05f317d3d	\N	{"role": "TECHNICIAN", "userId": "cdb0fe3f-1e53-4b85-9175-dfb59e56c455", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-24 11:51:27.841
6ff05ffa-2558-4d97-8924-30154ff35d36	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	166ac4eb-8ee7-4000-ab01-f4a05f317d3d	{"role": "TECHNICIAN", "userId": "cdb0fe3f-1e53-4b85-9175-dfb59e56c455"}	\N	\N	\N	2026-09-24 11:51:27.853
45c4bed9-6ed5-450b-8ad1-ad8975792013	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	cdb0fe3f-1e53-4b85-9175-dfb59e56c455	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-24 11:51:27.87
15a556a8-4223-4a70-b8f3-20b7c3f8e52f	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	25aaed7e-b001-4558-b3bb-e81987c40ca5	\N	{"code": "BKL_1790250769901", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-24 11:52:49.919
695b40f4-a235-4b67-bb84-e8558563a300	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	845173fd-c718-4250-8263-079620b81246	\N	{"code": "KIA_1790250769919", "name": "Kia India Private Limited"}	\N	\N	2026-09-24 11:52:49.935
3cf52452-281a-4471-84f3-51920fc1f013	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	4c3b89e0-e896-44ad-ad38-e919aa523269	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-24 11:52:49.953
3cd8e02a-d9c5-41ec-aa60-3f82d4389eb0	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	25ba19dc-ac61-45d3-84ae-c040b243e85d	\N	{"city": "Hubli", "code": "KIA_HBL_1790250769952", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-24 11:52:49.969
454b490a-21f7-417f-9bfd-1e080fb146e9	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	9465af5c-f8e2-4651-b8e9-8147a5287578	\N	{"email": "tech.floating.1790250770214@belladgroup.com", "branchId": "25ba19dc-ac61-45d3-84ae-c040b243e85d", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-24 11:52:50.29
19a4c85f-67f7-49ba-9e4d-ac29adab8167	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	ec3877f5-052d-46ac-ab08-32d82077f122	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "9465af5c-f8e2-4651-b8e9-8147a5287578", "isPrimary": false}	\N	\N	2026-09-24 11:52:50.311
3aec9903-1669-4627-a216-ae96edbe828c	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	04b7649c-99e2-430c-971f-2029ea05101c	\N	{"role": "TECHNICIAN", "userId": "9465af5c-f8e2-4651-b8e9-8147a5287578", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-24 11:52:50.343
c3f541f6-e4f8-4ee6-95fc-6347b0dc2eed	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	04b7649c-99e2-430c-971f-2029ea05101c	{"role": "TECHNICIAN", "userId": "9465af5c-f8e2-4651-b8e9-8147a5287578"}	\N	\N	\N	2026-09-24 11:52:50.355
3555da39-e22f-4002-889b-da4514f6c73b	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	9465af5c-f8e2-4651-b8e9-8147a5287578	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-24 11:52:50.371
1a5fea07-aea6-42d0-81ba-93f111938481	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	3f34e822-0e77-4506-9910-07759cf0c48a	\N	{"code": "BKL_1790253254881", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-24 12:34:14.899
cff667f7-39a9-46a1-b5aa-0f732af9bf4f	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	9b7ed441-99e4-4dcb-9663-086be3f52204	\N	{"code": "KIA_1790253254900", "name": "Kia India Private Limited"}	\N	\N	2026-09-24 12:34:14.914
da4d977b-9cb0-4f25-b8de-481662a04914	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	b4d3bbf2-71a6-4044-825c-56cb0ac22aa0	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-24 12:34:14.934
9d6b783f-a174-4d9d-a13e-6a08946205f4	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	57446f6d-a45a-4c5a-bde5-da1e3720ffba	\N	{"city": "Hubli", "code": "KIA_HBL_1790253254934", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-24 12:34:14.954
95e460f7-b210-4d22-81d8-dc52a04047c4	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	3301d5a5-aaf5-4526-b4f9-d35c0dba2663	\N	{"email": "tech.floating.1790253255314@belladgroup.com", "branchId": "57446f6d-a45a-4c5a-bde5-da1e3720ffba", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-24 12:34:15.404
cd52001a-ac91-4621-b449-6b6a143109f3	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	cbd098fb-2db3-4cb7-b712-c6b1eb7ad300	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "3301d5a5-aaf5-4526-b4f9-d35c0dba2663", "isPrimary": false}	\N	\N	2026-09-24 12:34:15.428
7e6aaec0-4cf3-48a4-93c3-a3a832fd35bf	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	8c189cb0-3e31-4ed2-b88c-86d158045e8f	\N	{"role": "TECHNICIAN", "userId": "3301d5a5-aaf5-4526-b4f9-d35c0dba2663", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-24 12:34:15.46
7c3230b3-2ef5-404a-90ad-44bacd23d72e	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	8c189cb0-3e31-4ed2-b88c-86d158045e8f	{"role": "TECHNICIAN", "userId": "3301d5a5-aaf5-4526-b4f9-d35c0dba2663"}	\N	\N	\N	2026-09-24 12:34:15.473
34f56091-ca70-42e0-b362-e725172a55a4	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	3301d5a5-aaf5-4526-b4f9-d35c0dba2663	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-24 12:34:15.49
4552f837-b49b-4eb5-aa3c-e52261ddba7f	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	002f03b7-f408-4c1b-9161-ae4be115bb0e	\N	{"code": "BKL_1790253898980", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-24 12:44:58.987
8e29285e-0b6c-4810-a0ca-6285006e404e	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	e4e70373-bd35-45d0-9ad6-27a7d1d3194c	\N	{"code": "KIA_1790253898989", "name": "Kia India Private Limited"}	\N	\N	2026-09-24 12:44:59.01
33f3a959-33cd-4dc1-85d2-64f192e5e893	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	677e48e4-dc5a-49eb-bb3c-82afd82399e5	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-24 12:44:59.026
7580df47-1fb9-42ab-b6f9-87ea61fd7e5c	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	\N	{"city": "Hubli", "code": "KIA_HBL_1790253899028", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-24 12:44:59.049
42925aa1-7694-407e-9cb1-6bb6756fc74f	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	aa904b30-b18d-4efc-9b1b-8515d7ecf267	\N	{"email": "tech.floating.1790253899289@belladgroup.com", "branchId": "a4676ae4-ebc1-41a9-ba24-64f74b2267b8", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-24 12:44:59.376
c774849c-f1c6-44ff-8100-99b5994bc7bd	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	f7f87cec-e76f-4229-a267-beb648d42bd4	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "aa904b30-b18d-4efc-9b1b-8515d7ecf267", "isPrimary": false}	\N	\N	2026-09-24 12:44:59.401
4e45fe95-f60c-40a2-a752-a3394f125ca6	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	6e8450f4-e723-42cb-b4ab-d09e1c9756dc	\N	{"role": "TECHNICIAN", "userId": "aa904b30-b18d-4efc-9b1b-8515d7ecf267", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-24 12:44:59.434
4c298666-30dd-4afc-92f4-863e26f65d03	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	6e8450f4-e723-42cb-b4ab-d09e1c9756dc	{"role": "TECHNICIAN", "userId": "aa904b30-b18d-4efc-9b1b-8515d7ecf267"}	\N	\N	\N	2026-09-24 12:44:59.448
1363b096-6fce-40b0-a49f-721cfe23de98	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	aa904b30-b18d-4efc-9b1b-8515d7ecf267	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-24 12:44:59.463
aa7c8038-0e69-4bf3-9bf7-ec5c33b58964	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	c80c8c05-b555-4f34-9826-667cdd55912b	\N	{"code": "BKL_1790310643670", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 04:30:43.693
65ea5222-7ab7-4bb0-a249-42e5e9030f22	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	cf268e0c-c0b8-47bb-9690-61a56c357614	\N	{"code": "KIA_1790310643699", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 04:30:43.719
23e0f6e4-add5-457c-b6f7-2830f5c05c03	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	d2ee5644-9279-4413-9823-1a095aed53ac	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 04:30:43.768
7a0be04f-0c61-4ca1-a32b-778ef4183af5	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	f42de917-9e7f-4b90-ad97-86ba14bfc32f	\N	{"city": "Hubli", "code": "KIA_HBL_1790310643769", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 04:30:43.797
21a10a3f-39cf-414d-a8df-0b2b139a2bd1	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	75451fae-89f4-4ea4-aa2b-853f675178ae	\N	{"email": "tech.floating.1790310644043@belladgroup.com", "branchId": "f42de917-9e7f-4b90-ad97-86ba14bfc32f", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 04:30:44.13
d07f4892-7981-4ff1-b0c9-da49605998db	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	05307358-61a1-437e-86e1-ed84c6f8db67	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "75451fae-89f4-4ea4-aa2b-853f675178ae", "isPrimary": false}	\N	\N	2026-09-25 04:30:44.156
f220da70-415c-4768-9b8b-245e718271c5	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	f132ba4d-be9c-44c5-a1d5-02c8df5add3a	\N	{"role": "TECHNICIAN", "userId": "75451fae-89f4-4ea4-aa2b-853f675178ae", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 04:30:44.188
aa18a73e-9522-4e71-a783-fc8713772f44	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	f132ba4d-be9c-44c5-a1d5-02c8df5add3a	{"role": "TECHNICIAN", "userId": "75451fae-89f4-4ea4-aa2b-853f675178ae"}	\N	\N	\N	2026-09-25 04:30:44.2
46ee85c8-d2a8-4ea5-9ce7-81da07071938	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	75451fae-89f4-4ea4-aa2b-853f675178ae	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 04:30:44.216
ad2f3671-aa92-4586-ad4d-b5f89bd22df9	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	b2ccb27b-8629-478e-a76a-b2af879c0069	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 04:31:33.117
63f8807b-ec42-48a0-a172-a881b2c394cb	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	\N	{"city": "Hubli", "code": "KIA_HBL_1790310693117", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 04:31:33.144
94f39e91-c03e-4dcc-acc3-a01d28215695	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	69303311-778f-4e50-8edf-089a31a5208b	\N	{"email": "tech.floating.1790310693420@belladgroup.com", "branchId": "c9a536ca-c3e2-4303-ae28-667a4e62bd4e", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 04:31:33.504
23c21ca3-852c-4cce-a744-402a7dddc17b	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	5515b195-1637-4238-9b3d-aef92f196e1b	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "69303311-778f-4e50-8edf-089a31a5208b", "isPrimary": false}	\N	\N	2026-09-25 04:31:33.515
30c3de1b-cef8-430f-a9d4-b2595f077468	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	8c028d83-335d-4107-935e-f791156faf58	\N	{"role": "TECHNICIAN", "userId": "69303311-778f-4e50-8edf-089a31a5208b", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 04:31:33.548
6ff32f37-7dc0-4b11-92d0-1d09f720a296	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	8c028d83-335d-4107-935e-f791156faf58	{"role": "TECHNICIAN", "userId": "69303311-778f-4e50-8edf-089a31a5208b"}	\N	\N	\N	2026-09-25 04:31:33.561
e89f7575-4d81-43d2-a73e-e0c1f9aafc76	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	69303311-778f-4e50-8edf-089a31a5208b	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 04:31:33.577
84db3fa6-a06f-421e-b541-848c37879e0d	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	b11335b2-c809-4006-90a7-5fccb0c501ac	\N	{"code": "BKL_1790310693084", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 04:31:33.092
2f8059a8-ee74-4e94-b6c1-78589c279edb	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	463c2b69-f1c1-4e74-85cd-8dcda4814356	\N	{"code": "KIA_1790310693093", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 04:31:33.108
f839ac77-0c53-4d15-8831-dd9e9c2104dc	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	a999e2f9-0cfc-484b-a521-c0b73df380d3	\N	{"code": "BKL_1790311468337", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 04:44:28.358
beee638a-66d2-4952-92ee-06527c8fa8ca	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	0e2e6329-e809-47dd-b405-580053376a6d	\N	{"code": "KIA_1790311468360", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 04:44:28.368
c431881f-b9a3-4ec1-89db-1bd414d196e6	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	6d35e650-48ef-40aa-91fb-e77b3ce90392	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 04:44:28.42
862097fe-9fe4-401d-8e88-1732e2abbff6	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	f0d519b4-ee1c-459f-b280-99cd1175ad2c	\N	{"city": "Hubli", "code": "KIA_HBL_1790311468421", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 04:44:28.44
c2effa76-bbda-43da-947f-77bb7cbed8d8	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	f6a424fe-eebc-44cd-bb4c-3e2588b7db15	\N	{"email": "tech.floating.1790311468682@belladgroup.com", "branchId": "f0d519b4-ee1c-459f-b280-99cd1175ad2c", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 04:44:28.769
405fb398-2eef-4412-97bb-b284ba186c4a	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	fb3c3a90-fe67-43e2-96ee-645b6e319dae	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "f6a424fe-eebc-44cd-bb4c-3e2588b7db15", "isPrimary": false}	\N	\N	2026-09-25 04:44:28.782
b0979c57-ca58-4a4b-a0ac-2c2cd0cb1ca8	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	613b907c-5c6a-463c-9685-c112e8396fcb	\N	{"role": "TECHNICIAN", "userId": "f6a424fe-eebc-44cd-bb4c-3e2588b7db15", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 04:44:28.814
fe25b9f2-b9fc-48a9-a1eb-cde1c3776e62	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	613b907c-5c6a-463c-9685-c112e8396fcb	{"role": "TECHNICIAN", "userId": "f6a424fe-eebc-44cd-bb4c-3e2588b7db15"}	\N	\N	\N	2026-09-25 04:44:28.826
f79ca76b-6bec-4120-874d-c5a53f2934e1	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	f6a424fe-eebc-44cd-bb4c-3e2588b7db15	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 04:44:28.842
eb1e9066-e666-45ca-a558-e33991aeaaa3	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	68fff910-72b4-46fd-8483-8643cf7659c6	\N	{"code": "BKL_1790311508784", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 04:45:08.794
4d3d4f76-b926-4647-be21-7c69670af8a5	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	675d9ae8-0b6f-4a2f-bd4c-d429fa3923ef	\N	{"code": "KIA_1790311508795", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 04:45:08.81
5786859d-f8fb-431b-97d3-72206204206c	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	51d234c7-0a4e-4ff6-ba6e-47e717617a68	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 04:45:08.828
370b5c7c-06a6-45bb-8385-217db2083841	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	a848252d-0e66-4fff-b30a-944ca039a049	\N	{"city": "Hubli", "code": "KIA_HBL_1790311508828", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 04:45:08.848
f04433ec-698a-4822-9e07-699b49dc9c46	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	7c45990a-ea3e-4175-b50a-9ef3ea632bc9	\N	{"email": "tech.floating.1790311509104@belladgroup.com", "branchId": "a848252d-0e66-4fff-b30a-944ca039a049", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 04:45:09.197
b6c5f4f3-d0d5-4569-b117-81eb16773461	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	270a4b3a-dfa7-4637-a45a-95230c56ed43	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "7c45990a-ea3e-4175-b50a-9ef3ea632bc9", "isPrimary": false}	\N	\N	2026-09-25 04:45:09.217
47b14273-1e6d-4b5c-b5f5-75bd4d753136	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	f27d33b1-c7fa-4ede-8608-8a09a2069d16	\N	{"role": "TECHNICIAN", "userId": "7c45990a-ea3e-4175-b50a-9ef3ea632bc9", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 04:45:09.249
a2f523ec-d4d9-4670-846e-30b864b5604e	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	f27d33b1-c7fa-4ede-8608-8a09a2069d16	{"role": "TECHNICIAN", "userId": "7c45990a-ea3e-4175-b50a-9ef3ea632bc9"}	\N	\N	\N	2026-09-25 04:45:09.263
a1a04b02-eaf4-4443-adc9-817bde19179c	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	7c45990a-ea3e-4175-b50a-9ef3ea632bc9	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 04:45:09.279
56865588-f9d0-401c-bb5f-1ba68cb2005a	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	745f06f0-5021-458d-8e2e-18b118b63f05	\N	{"code": "BKL_1790311539022", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 04:45:39.043
75ab2633-3a9c-4142-9ad9-4d3b9867e489	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	cb708ef2-95e2-40d0-b307-e70d4be47129	\N	{"code": "KIA_1790311539043", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 04:45:39.058
5c549f37-7b18-4b91-b442-d537a9d656bf	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	1532ec7a-bedf-4e2c-a6ea-029df0d4d88e	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 04:45:39.077
b26576ce-b2ce-4b3b-92f3-c14992730554	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	d13e8634-a6bf-47c3-8188-20e61c6b5efc	\N	{"city": "Hubli", "code": "KIA_HBL_1790311539077", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 04:45:39.096
545739bc-7175-42b4-b9bb-0ecee63b9fa5	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	bbe58ab0-0f79-4aff-962b-a8616a28c119	\N	{"email": "tech.floating.1790311539337@belladgroup.com", "branchId": "d13e8634-a6bf-47c3-8188-20e61c6b5efc", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 04:45:39.425
a3bd5b02-6c51-4b6c-9556-67ea907f89ec	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	5d6de274-c94d-4466-97cd-cb4dcaeaf8c9	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "bbe58ab0-0f79-4aff-962b-a8616a28c119", "isPrimary": false}	\N	\N	2026-09-25 04:45:39.437
6e955dc1-c34c-4276-b8bd-1dde66e5e446	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	abf656a4-bf76-4024-9339-b48ada491c0f	\N	{"role": "TECHNICIAN", "userId": "bbe58ab0-0f79-4aff-962b-a8616a28c119", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 04:45:39.469
c7dbbf5d-2512-408e-b851-a1bd8164b193	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	abf656a4-bf76-4024-9339-b48ada491c0f	{"role": "TECHNICIAN", "userId": "bbe58ab0-0f79-4aff-962b-a8616a28c119"}	\N	\N	\N	2026-09-25 04:45:39.482
35d09740-a5f7-4ebb-af14-abc2b70744c4	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	bbe58ab0-0f79-4aff-962b-a8616a28c119	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 04:45:39.499
ebf7b392-d29a-4244-bfae-aebf91fa4159	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	fc0538f3-649f-4747-96cd-3745c90dbe3e	\N	{"code": "BKL_1790312294967", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 04:58:14.987
25a1a0a3-297f-4c0c-b8bf-9b952595eae2	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	2bbb7514-0085-433a-bbbb-f1590622b28b	\N	{"code": "KIA_1790312294988", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 04:58:15.002
106cab8c-f80c-485a-bfef-7e5a89f13d93	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	a4f37d96-cfeb-4318-81f6-daeeb17b87ff	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 04:58:15.048
9ae57a8b-8b15-45ca-ac08-c64e04aab6a3	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	c1251098-b4b5-4080-bdf6-0df3144bea5f	\N	{"city": "Hubli", "code": "KIA_HBL_1790312295050", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 04:58:15.075
47235fc0-8dee-4082-b01b-22626d76bd74	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	c2ea6a6b-1d36-4203-a396-d61633802998	\N	{"email": "tech.floating.1790312295322@belladgroup.com", "branchId": "c1251098-b4b5-4080-bdf6-0df3144bea5f", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 04:58:15.41
4ad3fdf3-fea9-489d-b14d-4cf541f0373d	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	b2b68f4a-200a-45e3-93d5-061796920ba2	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "c2ea6a6b-1d36-4203-a396-d61633802998", "isPrimary": false}	\N	\N	2026-09-25 04:58:15.437
a7dd2233-078c-4d76-a66f-cbc49ff5f822	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	7001e4d0-fa9f-4948-8ab8-96a2d066c073	\N	{"role": "TECHNICIAN", "userId": "c2ea6a6b-1d36-4203-a396-d61633802998", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 04:58:15.469
36f01d78-f74d-4dde-9b0a-530e16bde5cd	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	7001e4d0-fa9f-4948-8ab8-96a2d066c073	{"role": "TECHNICIAN", "userId": "c2ea6a6b-1d36-4203-a396-d61633802998"}	\N	\N	\N	2026-09-25 04:58:15.483
f77e10a6-d230-4440-855d-5edc90d9523b	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	c2ea6a6b-1d36-4203-a396-d61633802998	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 04:58:15.491
9d135518-9366-4bfb-b7df-5efdbcb1818d	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	2be2fb5c-37fe-4d44-a2ff-1af215477ab4	\N	{"code": "BKL_1790316877264", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 06:14:37.279
c1d2e420-3961-407c-9f44-bb32f65e3838	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	6892669a-4222-41de-b3b6-d32834476934	\N	{"code": "KIA_1790316877282", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 06:14:37.294
dcdba53b-20b0-4b5f-95bf-885ba870e00d	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	813ac233-ca77-4972-8025-3263c4708259	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 06:14:37.341
f821c1df-053f-4537-8171-9672343eb4ac	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	b6c26b29-2360-45cd-8cf3-295491a781b8	\N	{"city": "Hubli", "code": "KIA_HBL_1790316877343", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 06:14:37.368
30bf1ea0-ae83-40f3-b097-3bd89cc88530	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	27ede1d1-1daf-4bcb-af17-d6ede5b139aa	\N	{"email": "tech.floating.1790316877621@belladgroup.com", "branchId": "b6c26b29-2360-45cd-8cf3-295491a781b8", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 06:14:37.709
8fdd80d9-b2e1-4898-81ad-e3e1ea508b0c	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	b03b813b-db84-42ee-9d38-863217be5509	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "27ede1d1-1daf-4bcb-af17-d6ede5b139aa", "isPrimary": false}	\N	\N	2026-09-25 06:14:37.735
05c1b878-5c68-45db-8136-78408338fd6a	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	6d047194-f77c-4085-99ab-5656a5bd927d	\N	{"role": "TECHNICIAN", "userId": "27ede1d1-1daf-4bcb-af17-d6ede5b139aa", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 06:14:37.766
4e4effc8-86b7-4abb-a3a3-0b87d8d76f7d	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	6d047194-f77c-4085-99ab-5656a5bd927d	{"role": "TECHNICIAN", "userId": "27ede1d1-1daf-4bcb-af17-d6ede5b139aa"}	\N	\N	\N	2026-09-25 06:14:37.778
893e60b2-c7d4-4977-812a-89ce63362084	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	27ede1d1-1daf-4bcb-af17-d6ede5b139aa	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 06:14:37.794
c925e260-a566-479d-bd5f-cf7283c21b50	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	e1483613-9534-4d9f-86bf-35afcd489ee9	\N	{"code": "BKL_1790319644001", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 07:00:44.02
223678dd-fe36-4e63-bc07-ee0e9af7abca	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	f3dcbeda-9716-4be5-8ff0-567ceb7ffa0f	\N	{"code": "KIA_1790319644021", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 07:00:44.035
616c7ff2-c48e-426b-b85c-28df3025dbb5	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_CREATED	Firm	7fc3a7f0-9b47-489a-b13c-79b824fcd54e	\N	{"code": "BKL_1790319708769", "name": "Bellad Kia Auto Private Limited", "gstin": "29AACBK9988P1Z3"}	\N	\N	2026-09-25 07:01:48.792
97354118-e957-4897-9b94-f8c91ac3e903	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	dbc3e0da-2502-4f3a-bd89-7cce2f79185e	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 07:00:44.084
2001b957-d797-4170-8895-3ddf2fbc66e2	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	\N	{"city": "Hubli", "code": "KIA_HBL_1790319644086", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 07:00:44.108
81a38ca3-a653-4905-b7e5-cbd1977ad5e5	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	fe168d08-76a9-4c13-a0f7-0a2ac243af5f	\N	{"email": "tech.floating.1790319644359@belladgroup.com", "branchId": "07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 07:00:44.451
efbe6a1b-6c0d-49cf-9160-a05c0d93862f	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	1f542385-8cc7-415d-b1e6-84e96b56e365	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "fe168d08-76a9-4c13-a0f7-0a2ac243af5f", "isPrimary": false}	\N	\N	2026-09-25 07:00:44.472
9015d311-3622-4afa-8171-17503872e017	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	a90619fc-4c18-4946-926c-044ca3da28d9	\N	{"role": "TECHNICIAN", "userId": "fe168d08-76a9-4c13-a0f7-0a2ac243af5f", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 07:00:44.505
31724052-5ed1-462d-a3f9-be6a052d705b	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	a90619fc-4c18-4946-926c-044ca3da28d9	{"role": "TECHNICIAN", "userId": "fe168d08-76a9-4c13-a0f7-0a2ac243af5f"}	\N	\N	\N	2026-09-25 07:00:44.519
5366e4b0-432b-4605-854d-f8f82698bb3f	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	fe168d08-76a9-4c13-a0f7-0a2ac243af5f	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 07:00:44.535
1a2cbb63-61d8-43c3-98b2-6635f04bd145	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	FIRM_BRAND_LINKED	FirmBrand	43192ca2-46eb-41f1-a39f-a7dda101efe1	\N	{"firm": "Bellad Kia Auto Private Limited", "brand": "Kia India Private Limited", "agreement": "DA-KIA-2026-0042"}	\N	\N	2026-09-25 07:01:48.825
15c9de3a-0097-412e-9626-1adad7fd4ea1	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRANCH_CREATED	Branch	f5828624-ed43-4cfd-9251-37b163b71e45	\N	{"city": "Hubli", "code": "KIA_HBL_1790319708825", "name": "Hubli Kia Experience Center"}	\N	\N	2026-09-25 07:01:48.844
c16521e5-33b6-4604-af40-2e7fda4e05c2	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_CREATED	User	39216e9d-fe57-4080-81e6-702db4d18721	\N	{"email": "tech.floating.1790319709076@belladgroup.com", "branchId": "f5828624-ed43-4cfd-9251-37b163b71e45", "lastName": "Kulkarni", "firstName": "Anand"}	\N	\N	2026-09-25 07:01:49.152
0ac99261-1b4e-4f61-b4a0-df96cf4ce944	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_MEMBERSHIP_ADDED	OrganizationMembership	98fc6adb-b7f6-4e10-ad6a-4f115ee14010	\N	{"branch": "Belgaum Workshop & Bodyshop", "userId": "39216e9d-fe57-4080-81e6-702db4d18721", "isPrimary": false}	\N	\N	2026-09-25 07:01:49.168
b97c079b-bacd-49b2-82d7-86ee13471412	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_ASSIGNED	UserRoleAssignment	1037a8aa-f7f6-40c4-a7ff-6bd6fbca31b8	\N	{"role": "TECHNICIAN", "userId": "39216e9d-fe57-4080-81e6-702db4d18721", "branchId": "4350dbb5-8d55-405c-9456-9de567e356c4", "scopeType": "BRANCH"}	\N	\N	2026-09-25 07:01:49.201
242281c4-906b-4073-a32e-144643db044b	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_ROLE_REVOKED	UserRoleAssignment	1037a8aa-f7f6-40c4-a7ff-6bd6fbca31b8	{"role": "TECHNICIAN", "userId": "39216e9d-fe57-4080-81e6-702db4d18721"}	\N	\N	\N	2026-09-25 07:01:49.214
0f26de6b-9f71-4eaa-ac81-eab8482cc109	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	USER_STATUS_UPDATED	User	39216e9d-fe57-4080-81e6-702db4d18721	{"status": "ACTIVE"}	{"status": "SUSPENDED"}	\N	\N	2026-09-25 07:01:49.23
89f8ac47-2169-44c4-8068-babd25b85539	883663e1-917e-4fae-8f1d-9d89e749362b	84a1e6f3-f10c-411c-b6c5-95e693399416	BRAND_CREATED	Brand	4dc54250-8a85-4263-919f-3c5b2e6c2d4c	\N	{"code": "KIA_1790319708792", "name": "Kia India Private Limited"}	\N	\N	2026-09-25 07:01:48.806
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, "tenantId", "firmId", "firmBrandId", code, name, "outletType", address, city, state, pincode, phone, email, gstin, active, "createdAt", "updatedAt") FROM stdin;
df42516a-ac2b-4757-ae1e-fa0eddd0c246	883663e1-917e-4fae-8f1d-9d89e749362b	2e9c48e1-0ade-4860-a261-a2c0bc5ecd2f	e56d0a03-e2bd-460e-a6b2-4daae5027f17	HBL-MAIN-01	Hubli Main 3S Facility	3S_FACILITY	Gokul Road, Industrial Area	Hubli	Karnataka	580030	+91 836 2488888	hubli@belladmotors.com	\N	t	2026-09-24 11:40:41.75	2026-09-24 11:40:41.75
4350dbb5-8d55-405c-9456-9de567e356c4	883663e1-917e-4fae-8f1d-9d89e749362b	2e9c48e1-0ade-4860-a261-a2c0bc5ecd2f	e56d0a03-e2bd-460e-a6b2-4daae5027f17	BGM-WKSHP-02	Belgaum Workshop & Bodyshop	WORKSHOP	Khanapur Road, Udyambag	Belgaum	Karnataka	590008	+91 831 2455555	\N	\N	t	2026-09-24 11:40:41.754	2026-09-24 11:40:41.754
7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	883663e1-917e-4fae-8f1d-9d89e749362b	04d7ae03-ea36-43d7-bfda-6630852445b7	bf5f9877-948c-400d-a1cb-414db22e9d58	KIA_HBL_1790250656328	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-24 11:50:56.342	2026-09-24 11:50:56.342
93f8b106-08f9-4cdc-b092-8c158089124d	883663e1-917e-4fae-8f1d-9d89e749362b	ec063757-7715-4608-9608-cc6dcd55e68d	00ef0274-cb3f-40c7-88b5-96a25db85a0f	KIA_HBL_1790250687339	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-24 11:51:27.351	2026-09-24 11:51:27.351
25ba19dc-ac61-45d3-84ae-c040b243e85d	883663e1-917e-4fae-8f1d-9d89e749362b	25aaed7e-b001-4558-b3bb-e81987c40ca5	4c3b89e0-e896-44ad-ad38-e919aa523269	KIA_HBL_1790250769952	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-24 11:52:49.959	2026-09-24 11:52:49.959
57446f6d-a45a-4c5a-bde5-da1e3720ffba	883663e1-917e-4fae-8f1d-9d89e749362b	3f34e822-0e77-4506-9910-07759cf0c48a	b4d3bbf2-71a6-4044-825c-56cb0ac22aa0	KIA_HBL_1790253254934	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-24 12:34:14.947	2026-09-24 12:34:14.947
a4676ae4-ebc1-41a9-ba24-64f74b2267b8	883663e1-917e-4fae-8f1d-9d89e749362b	002f03b7-f408-4c1b-9161-ae4be115bb0e	677e48e4-dc5a-49eb-bb3c-82afd82399e5	KIA_HBL_1790253899028	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-24 12:44:59.042	2026-09-24 12:44:59.042
f42de917-9e7f-4b90-ad97-86ba14bfc32f	883663e1-917e-4fae-8f1d-9d89e749362b	c80c8c05-b555-4f34-9826-667cdd55912b	d2ee5644-9279-4413-9823-1a095aed53ac	KIA_HBL_1790310643769	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 04:30:43.786	2026-09-25 04:30:43.786
c9a536ca-c3e2-4303-ae28-667a4e62bd4e	883663e1-917e-4fae-8f1d-9d89e749362b	b11335b2-c809-4006-90a7-5fccb0c501ac	b2ccb27b-8629-478e-a76a-b2af879c0069	KIA_HBL_1790310693117	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 04:31:33.139	2026-09-25 04:31:33.139
f0d519b4-ee1c-459f-b280-99cd1175ad2c	883663e1-917e-4fae-8f1d-9d89e749362b	a999e2f9-0cfc-484b-a521-c0b73df380d3	6d35e650-48ef-40aa-91fb-e77b3ce90392	KIA_HBL_1790311468421	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 04:44:28.433	2026-09-25 04:44:28.433
a848252d-0e66-4fff-b30a-944ca039a049	883663e1-917e-4fae-8f1d-9d89e749362b	68fff910-72b4-46fd-8483-8643cf7659c6	51d234c7-0a4e-4ff6-ba6e-47e717617a68	KIA_HBL_1790311508828	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 04:45:08.841	2026-09-25 04:45:08.841
d13e8634-a6bf-47c3-8188-20e61c6b5efc	883663e1-917e-4fae-8f1d-9d89e749362b	745f06f0-5021-458d-8e2e-18b118b63f05	1532ec7a-bedf-4e2c-a6ea-029df0d4d88e	KIA_HBL_1790311539077	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 04:45:39.091	2026-09-25 04:45:39.091
c1251098-b4b5-4080-bdf6-0df3144bea5f	883663e1-917e-4fae-8f1d-9d89e749362b	fc0538f3-649f-4747-96cd-3745c90dbe3e	a4f37d96-cfeb-4318-81f6-daeeb17b87ff	KIA_HBL_1790312295050	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 04:58:15.067	2026-09-25 04:58:15.067
b6c26b29-2360-45cd-8cf3-295491a781b8	883663e1-917e-4fae-8f1d-9d89e749362b	2be2fb5c-37fe-4d44-a2ff-1af215477ab4	813ac233-ca77-4972-8025-3263c4708259	KIA_HBL_1790316877343	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 06:14:37.36	2026-09-25 06:14:37.36
07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	883663e1-917e-4fae-8f1d-9d89e749362b	e1483613-9534-4d9f-86bf-35afcd489ee9	dbc3e0da-2502-4f3a-bd89-7cce2f79185e	KIA_HBL_1790319644086	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 07:00:44.1	2026-09-25 07:00:44.1
f5828624-ed43-4cfd-9251-37b163b71e45	883663e1-917e-4fae-8f1d-9d89e749362b	7fc3a7f0-9b47-489a-b13c-79b824fcd54e	43192ca2-46eb-41f1-a39f-a7dda101efe1	KIA_HBL_1790319708825	Hubli Kia Experience Center	3S_FACILITY	Airport Road	Hubli	Karnataka	580030	+91 836 2999999	\N	\N	t	2026-09-25 07:01:48.838	2026-09-25 07:01:48.838
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, "tenantId", code, name, "logoUrl", description, "isActive", "createdAt", "updatedAt") FROM stdin;
f0774545-e53b-4504-823b-40b1d6c689f7	883663e1-917e-4fae-8f1d-9d89e749362b	HYUNDAI	Hyundai Motor India Ltd	\N	Passenger Car OEM Franchise	t	2026-09-24 11:40:41.741	2026-09-24 11:40:41.741
17a1ebe6-9d51-4bb1-bb85-7c8341ae1160	883663e1-917e-4fae-8f1d-9d89e749362b	TOYOTA	Toyota Kirloskar Motor	\N	Passenger & Commercial Vehicle OEM Franchise	t	2026-09-24 11:40:41.744	2026-09-24 11:40:41.744
1e8272bf-ba32-48d3-b00b-96c8fe249107	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790250656266	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-24 11:50:56.276	2026-09-24 11:50:56.276
e1cc2d13-6db1-4514-8026-f828d7fc0527	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790250687297	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-24 11:51:27.319	2026-09-24 11:51:27.319
845173fd-c718-4250-8263-079620b81246	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790250769919	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-24 11:52:49.934	2026-09-24 11:52:49.934
9b7ed441-99e4-4dcb-9663-086be3f52204	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790253254900	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-24 12:34:14.913	2026-09-24 12:34:14.913
e4e70373-bd35-45d0-9ad6-27a7d1d3194c	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790253898989	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-24 12:44:59.009	2026-09-24 12:44:59.009
cf268e0c-c0b8-47bb-9690-61a56c357614	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790310643699	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 04:30:43.718	2026-09-25 04:30:43.718
463c2b69-f1c1-4e74-85cd-8dcda4814356	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790310693093	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 04:31:33.107	2026-09-25 04:31:33.107
0e2e6329-e809-47dd-b405-580053376a6d	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790311468360	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 04:44:28.367	2026-09-25 04:44:28.367
675d9ae8-0b6f-4a2f-bd4c-d429fa3923ef	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790311508795	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 04:45:08.808	2026-09-25 04:45:08.808
cb708ef2-95e2-40d0-b307-e70d4be47129	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790311539043	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 04:45:39.058	2026-09-25 04:45:39.058
2bbb7514-0085-433a-bbbb-f1590622b28b	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790312294988	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 04:58:15.001	2026-09-25 04:58:15.001
6892669a-4222-41de-b3b6-d32834476934	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790316877282	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 06:14:37.293	2026-09-25 06:14:37.293
f3dcbeda-9716-4be5-8ff0-567ceb7ffa0f	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790319644021	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 07:00:44.034	2026-09-25 07:00:44.034
4dc54250-8a85-4263-919f-3c5b2e6c2d4c	883663e1-917e-4fae-8f1d-9d89e749362b	KIA_1790319708792	Kia India Private Limited	\N	Passenger vehicle manufacturer	t	2026-09-25 07:01:48.806	2026-09-25 07:01:48.806
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, "tenantId", "branchId", code, name, description, active, "createdAt", "updatedAt") FROM stdin;
f5213469-a103-42e9-af1d-db428ba256d0	883663e1-917e-4fae-8f1d-9d89e749362b	df42516a-ac2b-4757-ae1e-fa0eddd0c246	SALES	New Vehicle Sales	\N	t	2026-09-24 11:40:41.756	2026-09-24 11:40:41.756
df6845b0-fb8a-4c5b-bd7d-d4d57349b973	883663e1-917e-4fae-8f1d-9d89e749362b	df42516a-ac2b-4757-ae1e-fa0eddd0c246	SERVICE	Mechanical Service	\N	t	2026-09-24 11:40:41.76	2026-09-24 11:40:41.76
3772021b-3539-4b53-a52c-06a8e699ef9e	883663e1-917e-4fae-8f1d-9d89e749362b	df42516a-ac2b-4757-ae1e-fa0eddd0c246	BODYSHOP	Body & Paint Repair	\N	t	2026-09-24 11:40:41.761	2026-09-24 11:40:41.761
412fee5b-432e-4e96-8944-49a36d4ea418	883663e1-917e-4fae-8f1d-9d89e749362b	df42516a-ac2b-4757-ae1e-fa0eddd0c246	SPARES	Parts & Accessories	\N	t	2026-09-24 11:40:41.762	2026-09-24 11:40:41.762
a7c2166e-ba40-4ab5-8338-b3d508097d86	883663e1-917e-4fae-8f1d-9d89e749362b	df42516a-ac2b-4757-ae1e-fa0eddd0c246	ACCOUNTS	Finance & Accounts	\N	t	2026-09-24 11:40:41.764	2026-09-24 11:40:41.764
af5bcf53-b2b3-4e7e-b458-537933b20d4d	883663e1-917e-4fae-8f1d-9d89e749362b	df42516a-ac2b-4757-ae1e-fa0eddd0c246	HR	Human Resources	\N	t	2026-09-24 11:40:41.765	2026-09-24 11:40:41.765
8978e86f-3195-4dba-9731-ad8cb527dfc3	883663e1-917e-4fae-8f1d-9d89e749362b	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	SALES	New Car Sales	\N	t	2026-09-24 11:50:56.346	2026-09-24 11:50:56.346
d02f441c-a3a4-4bc0-8ff8-cf86c59811ab	883663e1-917e-4fae-8f1d-9d89e749362b	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	SERVICE	Mechanical Service	\N	t	2026-09-24 11:50:56.347	2026-09-24 11:50:56.347
1c0ab0a7-41c1-4b70-bf30-b0df7ef1b1a4	883663e1-917e-4fae-8f1d-9d89e749362b	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	BODYSHOP	Body & Paint Repair	\N	t	2026-09-24 11:50:56.348	2026-09-24 11:50:56.348
96206930-8242-4250-b5e7-2fcd9b6bbe25	883663e1-917e-4fae-8f1d-9d89e749362b	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	SPARES	Parts & Accessories	\N	t	2026-09-24 11:50:56.349	2026-09-24 11:50:56.349
63153020-f9b0-4869-9620-d82ee44cca5a	883663e1-917e-4fae-8f1d-9d89e749362b	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	ACCOUNTS	Finance & Cashier	\N	t	2026-09-24 11:50:56.35	2026-09-24 11:50:56.35
d5807ef7-8a61-45a6-a2af-8bcde612fc9b	883663e1-917e-4fae-8f1d-9d89e749362b	93f8b106-08f9-4cdc-b092-8c158089124d	SALES	New Car Sales	\N	t	2026-09-24 11:51:27.354	2026-09-24 11:51:27.354
5e17995f-beb7-48a4-865a-45a14eafd57a	883663e1-917e-4fae-8f1d-9d89e749362b	93f8b106-08f9-4cdc-b092-8c158089124d	SERVICE	Mechanical Service	\N	t	2026-09-24 11:51:27.355	2026-09-24 11:51:27.355
8cd4e00b-1dfe-4b15-bd5f-6d439308472e	883663e1-917e-4fae-8f1d-9d89e749362b	93f8b106-08f9-4cdc-b092-8c158089124d	BODYSHOP	Body & Paint Repair	\N	t	2026-09-24 11:51:27.356	2026-09-24 11:51:27.356
27459b0d-b70d-4924-8a8d-758295d89f24	883663e1-917e-4fae-8f1d-9d89e749362b	93f8b106-08f9-4cdc-b092-8c158089124d	SPARES	Parts & Accessories	\N	t	2026-09-24 11:51:27.357	2026-09-24 11:51:27.357
3a961eae-ff9e-4692-99fd-3103c82b27c4	883663e1-917e-4fae-8f1d-9d89e749362b	93f8b106-08f9-4cdc-b092-8c158089124d	ACCOUNTS	Finance & Cashier	\N	t	2026-09-24 11:51:27.358	2026-09-24 11:51:27.358
4cd4943a-51b4-4e4c-9df7-633ae32f0022	883663e1-917e-4fae-8f1d-9d89e749362b	25ba19dc-ac61-45d3-84ae-c040b243e85d	SALES	New Car Sales	\N	t	2026-09-24 11:52:49.962	2026-09-24 11:52:49.962
27dd9cba-4b19-49b5-aab2-3865793506ac	883663e1-917e-4fae-8f1d-9d89e749362b	25ba19dc-ac61-45d3-84ae-c040b243e85d	SERVICE	Mechanical Service	\N	t	2026-09-24 11:52:49.963	2026-09-24 11:52:49.963
6bd5274c-fd01-4730-a5d2-59946dec5498	883663e1-917e-4fae-8f1d-9d89e749362b	25ba19dc-ac61-45d3-84ae-c040b243e85d	BODYSHOP	Body & Paint Repair	\N	t	2026-09-24 11:52:49.964	2026-09-24 11:52:49.964
1b956b6e-ab22-4123-8173-dfcfc12e224b	883663e1-917e-4fae-8f1d-9d89e749362b	25ba19dc-ac61-45d3-84ae-c040b243e85d	SPARES	Parts & Accessories	\N	t	2026-09-24 11:52:49.968	2026-09-24 11:52:49.968
56f53931-dd50-4cc5-94d9-984949670884	883663e1-917e-4fae-8f1d-9d89e749362b	25ba19dc-ac61-45d3-84ae-c040b243e85d	ACCOUNTS	Finance & Cashier	\N	t	2026-09-24 11:52:49.969	2026-09-24 11:52:49.969
fd315ba4-8530-4924-b10f-5728b5586179	883663e1-917e-4fae-8f1d-9d89e749362b	57446f6d-a45a-4c5a-bde5-da1e3720ffba	SALES	New Car Sales	\N	t	2026-09-24 12:34:14.95	2026-09-24 12:34:14.95
108ac0f0-f5b3-4444-8092-89670e3c5b11	883663e1-917e-4fae-8f1d-9d89e749362b	57446f6d-a45a-4c5a-bde5-da1e3720ffba	SERVICE	Mechanical Service	\N	t	2026-09-24 12:34:14.951	2026-09-24 12:34:14.951
c7db936d-7720-4971-8ca3-e06695903e11	883663e1-917e-4fae-8f1d-9d89e749362b	57446f6d-a45a-4c5a-bde5-da1e3720ffba	BODYSHOP	Body & Paint Repair	\N	t	2026-09-24 12:34:14.952	2026-09-24 12:34:14.952
2963cc9c-7146-4cb3-a350-d029cf052f93	883663e1-917e-4fae-8f1d-9d89e749362b	57446f6d-a45a-4c5a-bde5-da1e3720ffba	SPARES	Parts & Accessories	\N	t	2026-09-24 12:34:14.953	2026-09-24 12:34:14.953
85de5143-49df-4166-880a-93f864aa6c70	883663e1-917e-4fae-8f1d-9d89e749362b	57446f6d-a45a-4c5a-bde5-da1e3720ffba	ACCOUNTS	Finance & Cashier	\N	t	2026-09-24 12:34:14.953	2026-09-24 12:34:14.953
bb424d90-8260-4f7e-8ab3-5f63eda5177e	883663e1-917e-4fae-8f1d-9d89e749362b	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	SALES	New Car Sales	\N	t	2026-09-24 12:44:59.045	2026-09-24 12:44:59.045
d3215fbf-3fbf-4e1d-a804-54ad0a854b33	883663e1-917e-4fae-8f1d-9d89e749362b	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	SERVICE	Mechanical Service	\N	t	2026-09-24 12:44:59.046	2026-09-24 12:44:59.046
faf3988d-b8c7-4038-9f76-249514b586a9	883663e1-917e-4fae-8f1d-9d89e749362b	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	BODYSHOP	Body & Paint Repair	\N	t	2026-09-24 12:44:59.047	2026-09-24 12:44:59.047
7ba268e2-536b-41a7-9eff-e0cf32e416c0	883663e1-917e-4fae-8f1d-9d89e749362b	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	SPARES	Parts & Accessories	\N	t	2026-09-24 12:44:59.048	2026-09-24 12:44:59.048
d782c36f-bacd-461a-968f-6655ce33bcd3	883663e1-917e-4fae-8f1d-9d89e749362b	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	ACCOUNTS	Finance & Cashier	\N	t	2026-09-24 12:44:59.048	2026-09-24 12:44:59.048
7e7c65dd-06bd-4cf4-b764-ad1920b55a27	883663e1-917e-4fae-8f1d-9d89e749362b	f42de917-9e7f-4b90-ad97-86ba14bfc32f	SALES	New Car Sales	\N	t	2026-09-25 04:30:43.789	2026-09-25 04:30:43.789
e54e6ddd-58bd-4aa0-b1c0-a8d93fbec483	883663e1-917e-4fae-8f1d-9d89e749362b	f42de917-9e7f-4b90-ad97-86ba14bfc32f	SERVICE	Mechanical Service	\N	t	2026-09-25 04:30:43.794	2026-09-25 04:30:43.794
eb63114a-cfb0-4938-8604-e6adc3015a8b	883663e1-917e-4fae-8f1d-9d89e749362b	f42de917-9e7f-4b90-ad97-86ba14bfc32f	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 04:30:43.795	2026-09-25 04:30:43.795
2612e2f4-fb78-4ec3-a533-d29893b7e6d4	883663e1-917e-4fae-8f1d-9d89e749362b	f42de917-9e7f-4b90-ad97-86ba14bfc32f	SPARES	Parts & Accessories	\N	t	2026-09-25 04:30:43.796	2026-09-25 04:30:43.796
ebda4aaa-fb6a-4af2-8e9e-ce103053df72	883663e1-917e-4fae-8f1d-9d89e749362b	f42de917-9e7f-4b90-ad97-86ba14bfc32f	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 04:30:43.796	2026-09-25 04:30:43.796
274ee897-58c0-4b13-9e31-a0f0fbc410f4	883663e1-917e-4fae-8f1d-9d89e749362b	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	SALES	New Car Sales	\N	t	2026-09-25 04:31:33.141	2026-09-25 04:31:33.141
44f86d32-c8e4-48e5-aad5-7c0c347a0085	883663e1-917e-4fae-8f1d-9d89e749362b	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	SERVICE	Mechanical Service	\N	t	2026-09-25 04:31:33.142	2026-09-25 04:31:33.142
c2a8ab2d-ddce-49b2-b0d1-b51595c28854	883663e1-917e-4fae-8f1d-9d89e749362b	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 04:31:33.142	2026-09-25 04:31:33.142
04cd0db6-7b69-4650-b585-b531ebac2204	883663e1-917e-4fae-8f1d-9d89e749362b	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	SPARES	Parts & Accessories	\N	t	2026-09-25 04:31:33.143	2026-09-25 04:31:33.143
7ef9d437-9fa5-4749-a563-9a6759c60b12	883663e1-917e-4fae-8f1d-9d89e749362b	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 04:31:33.143	2026-09-25 04:31:33.143
3a653f71-8844-4896-b8c0-b858d73b4ef9	883663e1-917e-4fae-8f1d-9d89e749362b	f0d519b4-ee1c-459f-b280-99cd1175ad2c	SALES	New Car Sales	\N	t	2026-09-25 04:44:28.435	2026-09-25 04:44:28.435
1d205a0b-c3b4-4cd0-a9d6-341ae1b213ab	883663e1-917e-4fae-8f1d-9d89e749362b	f0d519b4-ee1c-459f-b280-99cd1175ad2c	SERVICE	Mechanical Service	\N	t	2026-09-25 04:44:28.437	2026-09-25 04:44:28.437
d7238d73-eaba-469d-9169-70bff1dd0bf9	883663e1-917e-4fae-8f1d-9d89e749362b	f0d519b4-ee1c-459f-b280-99cd1175ad2c	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 04:44:28.439	2026-09-25 04:44:28.439
30ee3f1a-b170-49bc-a167-f0826d9d84fc	883663e1-917e-4fae-8f1d-9d89e749362b	f0d519b4-ee1c-459f-b280-99cd1175ad2c	SPARES	Parts & Accessories	\N	t	2026-09-25 04:44:28.439	2026-09-25 04:44:28.439
822a9a9f-b0df-4b89-bb79-9286258bbd60	883663e1-917e-4fae-8f1d-9d89e749362b	f0d519b4-ee1c-459f-b280-99cd1175ad2c	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 04:44:28.44	2026-09-25 04:44:28.44
97e98fa1-8fc6-4a16-8242-4db6955e48d5	883663e1-917e-4fae-8f1d-9d89e749362b	a848252d-0e66-4fff-b30a-944ca039a049	SALES	New Car Sales	\N	t	2026-09-25 04:45:08.844	2026-09-25 04:45:08.844
5aa1bc29-0d2f-44e1-96b8-1dc4d39fa0a6	883663e1-917e-4fae-8f1d-9d89e749362b	a848252d-0e66-4fff-b30a-944ca039a049	SERVICE	Mechanical Service	\N	t	2026-09-25 04:45:08.845	2026-09-25 04:45:08.845
3ebe7e43-c2a0-4f75-bee9-f4eac5844f52	883663e1-917e-4fae-8f1d-9d89e749362b	a848252d-0e66-4fff-b30a-944ca039a049	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 04:45:08.846	2026-09-25 04:45:08.846
c6387e1a-46e9-4e01-a4c4-beb74d9c4298	883663e1-917e-4fae-8f1d-9d89e749362b	a848252d-0e66-4fff-b30a-944ca039a049	SPARES	Parts & Accessories	\N	t	2026-09-25 04:45:08.847	2026-09-25 04:45:08.847
701d0452-ed17-4446-8d52-ef701053ce3f	883663e1-917e-4fae-8f1d-9d89e749362b	a848252d-0e66-4fff-b30a-944ca039a049	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 04:45:08.848	2026-09-25 04:45:08.848
44b91a5a-b813-492e-b4ef-25766621ba8a	883663e1-917e-4fae-8f1d-9d89e749362b	d13e8634-a6bf-47c3-8188-20e61c6b5efc	SALES	New Car Sales	\N	t	2026-09-25 04:45:39.093	2026-09-25 04:45:39.093
7ad80652-1e2e-493c-ae7d-96650278f352	883663e1-917e-4fae-8f1d-9d89e749362b	d13e8634-a6bf-47c3-8188-20e61c6b5efc	SERVICE	Mechanical Service	\N	t	2026-09-25 04:45:39.094	2026-09-25 04:45:39.094
56c56594-1724-481c-bbbe-d2b261033d15	883663e1-917e-4fae-8f1d-9d89e749362b	d13e8634-a6bf-47c3-8188-20e61c6b5efc	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 04:45:39.094	2026-09-25 04:45:39.094
5688fdba-0964-44f8-8383-b5c3ad6a767f	883663e1-917e-4fae-8f1d-9d89e749362b	d13e8634-a6bf-47c3-8188-20e61c6b5efc	SPARES	Parts & Accessories	\N	t	2026-09-25 04:45:39.095	2026-09-25 04:45:39.095
1dccf991-a2d3-4fe1-a770-2fd989300db7	883663e1-917e-4fae-8f1d-9d89e749362b	d13e8634-a6bf-47c3-8188-20e61c6b5efc	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 04:45:39.096	2026-09-25 04:45:39.096
90cfc538-8b2d-4a82-af44-3ef1b4420a7b	883663e1-917e-4fae-8f1d-9d89e749362b	c1251098-b4b5-4080-bdf6-0df3144bea5f	SALES	New Car Sales	\N	t	2026-09-25 04:58:15.069	2026-09-25 04:58:15.069
0a4891c6-0d5c-49f0-8858-c2113ca17bb1	883663e1-917e-4fae-8f1d-9d89e749362b	c1251098-b4b5-4080-bdf6-0df3144bea5f	SERVICE	Mechanical Service	\N	t	2026-09-25 04:58:15.071	2026-09-25 04:58:15.071
f38e47fd-233e-49f3-8b94-6df262d0fc02	883663e1-917e-4fae-8f1d-9d89e749362b	c1251098-b4b5-4080-bdf6-0df3144bea5f	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 04:58:15.072	2026-09-25 04:58:15.072
d81b9b6d-2e0a-44d4-8f72-f2cd0ee2dea4	883663e1-917e-4fae-8f1d-9d89e749362b	c1251098-b4b5-4080-bdf6-0df3144bea5f	SPARES	Parts & Accessories	\N	t	2026-09-25 04:58:15.073	2026-09-25 04:58:15.073
25c4f3d0-ba93-4caa-b71f-1057ac3d927f	883663e1-917e-4fae-8f1d-9d89e749362b	c1251098-b4b5-4080-bdf6-0df3144bea5f	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 04:58:15.073	2026-09-25 04:58:15.073
79616641-5fe1-4d59-9aa1-14d879217555	883663e1-917e-4fae-8f1d-9d89e749362b	b6c26b29-2360-45cd-8cf3-295491a781b8	SALES	New Car Sales	\N	t	2026-09-25 06:14:37.362	2026-09-25 06:14:37.362
a9efdbae-090f-4b31-8830-7fa1dddb5dc9	883663e1-917e-4fae-8f1d-9d89e749362b	b6c26b29-2360-45cd-8cf3-295491a781b8	SERVICE	Mechanical Service	\N	t	2026-09-25 06:14:37.364	2026-09-25 06:14:37.364
96d1e534-a72f-47a3-a2d0-b382bc1c3dd3	883663e1-917e-4fae-8f1d-9d89e749362b	b6c26b29-2360-45cd-8cf3-295491a781b8	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 06:14:37.364	2026-09-25 06:14:37.364
55e9b4dc-9029-414e-8063-1eb258b5367e	883663e1-917e-4fae-8f1d-9d89e749362b	b6c26b29-2360-45cd-8cf3-295491a781b8	SPARES	Parts & Accessories	\N	t	2026-09-25 06:14:37.366	2026-09-25 06:14:37.366
500ca368-b392-4cca-9b5a-636e2dd23874	883663e1-917e-4fae-8f1d-9d89e749362b	b6c26b29-2360-45cd-8cf3-295491a781b8	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 06:14:37.367	2026-09-25 06:14:37.367
faf3e4b7-df5a-493e-b427-b1fea6a84c1b	883663e1-917e-4fae-8f1d-9d89e749362b	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	SALES	New Car Sales	\N	t	2026-09-25 07:00:44.103	2026-09-25 07:00:44.103
08533497-e41a-4724-b4fa-db92f9f4cbc8	883663e1-917e-4fae-8f1d-9d89e749362b	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	SERVICE	Mechanical Service	\N	t	2026-09-25 07:00:44.104	2026-09-25 07:00:44.104
ef6cabf8-6d0a-4a80-822c-8294d8206df4	883663e1-917e-4fae-8f1d-9d89e749362b	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 07:00:44.106	2026-09-25 07:00:44.106
ba5d4cd5-28dc-4a04-b429-451dd60be760	883663e1-917e-4fae-8f1d-9d89e749362b	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	SPARES	Parts & Accessories	\N	t	2026-09-25 07:00:44.107	2026-09-25 07:00:44.107
fad09027-e3d0-481b-a4b0-558ce9522be9	883663e1-917e-4fae-8f1d-9d89e749362b	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 07:00:44.107	2026-09-25 07:00:44.107
d778f47a-33a8-445b-b389-8e3884afe653	883663e1-917e-4fae-8f1d-9d89e749362b	f5828624-ed43-4cfd-9251-37b163b71e45	SALES	New Car Sales	\N	t	2026-09-25 07:01:48.841	2026-09-25 07:01:48.841
e13774d7-cd00-462b-a8b1-2bb2b59a62f9	883663e1-917e-4fae-8f1d-9d89e749362b	f5828624-ed43-4cfd-9251-37b163b71e45	SERVICE	Mechanical Service	\N	t	2026-09-25 07:01:48.842	2026-09-25 07:01:48.842
bec2cc16-c66f-4434-a418-fcb1992ca5b9	883663e1-917e-4fae-8f1d-9d89e749362b	f5828624-ed43-4cfd-9251-37b163b71e45	BODYSHOP	Body & Paint Repair	\N	t	2026-09-25 07:01:48.842	2026-09-25 07:01:48.842
20c8198d-b0ad-49df-95f5-5cc247f7bd6a	883663e1-917e-4fae-8f1d-9d89e749362b	f5828624-ed43-4cfd-9251-37b163b71e45	SPARES	Parts & Accessories	\N	t	2026-09-25 07:01:48.843	2026-09-25 07:01:48.843
21bfaf60-4060-4f9f-b945-bd9468c1e55b	883663e1-917e-4fae-8f1d-9d89e749362b	f5828624-ed43-4cfd-9251-37b163b71e45	ACCOUNTS	Finance & Cashier	\N	t	2026-09-25 07:01:48.843	2026-09-25 07:01:48.843
\.


--
-- Data for Name: firm_brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.firm_brands (id, "tenantId", "firmId", "brandId", "dealerAgreementNo", "agreementExpiry", "isActive", "createdAt") FROM stdin;
e56d0a03-e2bd-460e-a6b2-4daae5027f17	883663e1-917e-4fae-8f1d-9d89e749362b	2e9c48e1-0ade-4860-a261-a2c0bc5ecd2f	f0774545-e53b-4504-823b-40b1d6c689f7	DA-HYD-2024-001	\N	t	2026-09-24 11:40:41.746
313bbba4-afc9-4956-82d4-5e2eeed79803	883663e1-917e-4fae-8f1d-9d89e749362b	43140c1f-a969-4b94-b98e-593a478db199	17a1ebe6-9d51-4bb1-bb85-7c8341ae1160	DA-TOY-2023-088	\N	t	2026-09-24 11:40:41.749
bf5f9877-948c-400d-a1cb-414db22e9d58	883663e1-917e-4fae-8f1d-9d89e749362b	04d7ae03-ea36-43d7-bfda-6630852445b7	1e8272bf-ba32-48d3-b00b-96c8fe249107	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-24 11:50:56.321
00ef0274-cb3f-40c7-88b5-96a25db85a0f	883663e1-917e-4fae-8f1d-9d89e749362b	ec063757-7715-4608-9608-cc6dcd55e68d	e1cc2d13-6db1-4514-8026-f828d7fc0527	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-24 11:51:27.335
4c3b89e0-e896-44ad-ad38-e919aa523269	883663e1-917e-4fae-8f1d-9d89e749362b	25aaed7e-b001-4558-b3bb-e81987c40ca5	845173fd-c718-4250-8263-079620b81246	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-24 11:52:49.951
b4d3bbf2-71a6-4044-825c-56cb0ac22aa0	883663e1-917e-4fae-8f1d-9d89e749362b	3f34e822-0e77-4506-9910-07759cf0c48a	9b7ed441-99e4-4dcb-9663-086be3f52204	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-24 12:34:14.929
677e48e4-dc5a-49eb-bb3c-82afd82399e5	883663e1-917e-4fae-8f1d-9d89e749362b	002f03b7-f408-4c1b-9161-ae4be115bb0e	e4e70373-bd35-45d0-9ad6-27a7d1d3194c	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-24 12:44:59.023
d2ee5644-9279-4413-9823-1a095aed53ac	883663e1-917e-4fae-8f1d-9d89e749362b	c80c8c05-b555-4f34-9826-667cdd55912b	cf268e0c-c0b8-47bb-9690-61a56c357614	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 04:30:43.76
b2ccb27b-8629-478e-a76a-b2af879c0069	883663e1-917e-4fae-8f1d-9d89e749362b	b11335b2-c809-4006-90a7-5fccb0c501ac	463c2b69-f1c1-4e74-85cd-8dcda4814356	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 04:31:33.114
6d35e650-48ef-40aa-91fb-e77b3ce90392	883663e1-917e-4fae-8f1d-9d89e749362b	a999e2f9-0cfc-484b-a521-c0b73df380d3	0e2e6329-e809-47dd-b405-580053376a6d	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 04:44:28.416
51d234c7-0a4e-4ff6-ba6e-47e717617a68	883663e1-917e-4fae-8f1d-9d89e749362b	68fff910-72b4-46fd-8483-8643cf7659c6	675d9ae8-0b6f-4a2f-bd4c-d429fa3923ef	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 04:45:08.823
1532ec7a-bedf-4e2c-a6ea-029df0d4d88e	883663e1-917e-4fae-8f1d-9d89e749362b	745f06f0-5021-458d-8e2e-18b118b63f05	cb708ef2-95e2-40d0-b307-e70d4be47129	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 04:45:39.075
a4f37d96-cfeb-4318-81f6-daeeb17b87ff	883663e1-917e-4fae-8f1d-9d89e749362b	fc0538f3-649f-4747-96cd-3745c90dbe3e	2bbb7514-0085-433a-bbbb-f1590622b28b	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 04:58:15.043
813ac233-ca77-4972-8025-3263c4708259	883663e1-917e-4fae-8f1d-9d89e749362b	2be2fb5c-37fe-4d44-a2ff-1af215477ab4	6892669a-4222-41de-b3b6-d32834476934	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 06:14:37.337
dbc3e0da-2502-4f3a-bd89-7cce2f79185e	883663e1-917e-4fae-8f1d-9d89e749362b	e1483613-9534-4d9f-86bf-35afcd489ee9	f3dcbeda-9716-4be5-8ff0-567ceb7ffa0f	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 07:00:44.078
43192ca2-46eb-41f1-a39f-a7dda101efe1	883663e1-917e-4fae-8f1d-9d89e749362b	7fc3a7f0-9b47-489a-b13c-79b824fcd54e	4dc54250-8a85-4263-919f-3c5b2e6c2d4c	DA-KIA-2026-0042	2029-12-31 00:00:00	t	2026-09-25 07:01:48.823
\.


--
-- Data for Name: firms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.firms (id, "tenantId", code, name, "panNumber", gstin, cin, "tanNumber", "registeredAt", "isActive", "createdAt", "updatedAt") FROM stdin;
2e9c48e1-0ade-4860-a261-a2c0bc5ecd2f	883663e1-917e-4fae-8f1d-9d89e749362b	BMPL	Bellad Motors Private Limited	AABCB1234F	29AABCB1234F1Z5	\N	\N	Karnataka	t	2026-09-24 11:40:41.737	2026-09-24 11:40:41.737
43140c1f-a969-4b94-b98e-593a478db199	883663e1-917e-4fae-8f1d-9d89e749362b	BALLP	Bellad Auto LLP	AALFB5678K	29AALFB5678K1ZA	\N	\N	Karnataka	t	2026-09-24 11:40:41.739	2026-09-24 11:40:41.739
04d7ae03-ea36-43d7-bfda-6630852445b7	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790250656249	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-24 11:50:56.263	2026-09-24 11:50:56.263
ec063757-7715-4608-9608-cc6dcd55e68d	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790250687286	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-24 11:51:27.295	2026-09-24 11:51:27.295
25aaed7e-b001-4558-b3bb-e81987c40ca5	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790250769901	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-24 11:52:49.919	2026-09-24 11:52:49.919
3f34e822-0e77-4506-9910-07759cf0c48a	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790253254881	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-24 12:34:14.897	2026-09-24 12:34:14.897
002f03b7-f408-4c1b-9161-ae4be115bb0e	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790253898980	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-24 12:44:58.985	2026-09-24 12:44:58.985
c80c8c05-b555-4f34-9826-667cdd55912b	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790310643670	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 04:30:43.688	2026-09-25 04:30:43.688
b11335b2-c809-4006-90a7-5fccb0c501ac	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790310693084	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 04:31:33.091	2026-09-25 04:31:33.091
a999e2f9-0cfc-484b-a521-c0b73df380d3	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790311468337	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 04:44:28.357	2026-09-25 04:44:28.357
68fff910-72b4-46fd-8483-8643cf7659c6	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790311508784	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 04:45:08.793	2026-09-25 04:45:08.793
745f06f0-5021-458d-8e2e-18b118b63f05	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790311539022	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 04:45:39.042	2026-09-25 04:45:39.042
fc0538f3-649f-4747-96cd-3745c90dbe3e	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790312294967	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 04:58:14.985	2026-09-25 04:58:14.985
2be2fb5c-37fe-4d44-a2ff-1af215477ab4	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790316877264	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 06:14:37.277	2026-09-25 06:14:37.277
e1483613-9534-4d9f-86bf-35afcd489ee9	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790319644001	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 07:00:44.018	2026-09-25 07:00:44.018
7fc3a7f0-9b47-489a-b13c-79b824fcd54e	883663e1-917e-4fae-8f1d-9d89e749362b	BKL_1790319708769	Bellad Kia Auto Private Limited	AACBK9988P	29AACBK9988P1Z3	U50100KA2024PTC123456	\N	Karnataka	t	2026-09-25 07:01:48.791	2026-09-25 07:01:48.791
\.


--
-- Data for Name: integration_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_events (id, "tenantId", "eventType", "aggregateId", payload, status, "retryCount", "maxRetries", "lastError", "publishedAt", "createdAt", "updatedAt") FROM stdin;
ee678ade-0e67-4a76-9caa-fcc48b93756d	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	{"city": "Hubli", "code": "KIA_HBL_1790250656328", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb"}	PENDING	0	5	\N	\N	2026-09-24 11:50:56.351	2026-09-24 11:50:56.351
a65689c6-2b60-4c25-bd6b-632f7046111b	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	93f8b106-08f9-4cdc-b092-8c158089124d	{"city": "Hubli", "code": "KIA_HBL_1790250687339", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "93f8b106-08f9-4cdc-b092-8c158089124d"}	PENDING	0	5	\N	\N	2026-09-24 11:51:27.361	2026-09-24 11:51:27.361
8e3fd945-8606-41fd-9673-50fe6b170cb9	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	25ba19dc-ac61-45d3-84ae-c040b243e85d	{"city": "Hubli", "code": "KIA_HBL_1790250769952", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "25ba19dc-ac61-45d3-84ae-c040b243e85d"}	PENDING	0	5	\N	\N	2026-09-24 11:52:49.97	2026-09-24 11:52:49.97
e2dc10ce-0d7e-4741-875c-857349bf65bc	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	57446f6d-a45a-4c5a-bde5-da1e3720ffba	{"city": "Hubli", "code": "KIA_HBL_1790253254934", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "57446f6d-a45a-4c5a-bde5-da1e3720ffba"}	PENDING	0	5	\N	\N	2026-09-24 12:34:14.955	2026-09-24 12:34:14.955
bbc28ada-f4c1-4b2d-ac69-b60bd20eba1c	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	{"city": "Hubli", "code": "KIA_HBL_1790253899028", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "a4676ae4-ebc1-41a9-ba24-64f74b2267b8"}	PENDING	0	5	\N	\N	2026-09-24 12:44:59.05	2026-09-24 12:44:59.05
5ef8c935-0cce-4345-9f58-9e65fdd802bd	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	f42de917-9e7f-4b90-ad97-86ba14bfc32f	{"city": "Hubli", "code": "KIA_HBL_1790310643769", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "f42de917-9e7f-4b90-ad97-86ba14bfc32f"}	PENDING	0	5	\N	\N	2026-09-25 04:30:43.798	2026-09-25 04:30:43.798
59892518-9c94-42f2-9f19-49699c7b5c0d	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	{"city": "Hubli", "code": "KIA_HBL_1790310693117", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "c9a536ca-c3e2-4303-ae28-667a4e62bd4e"}	PENDING	0	5	\N	\N	2026-09-25 04:31:33.144	2026-09-25 04:31:33.144
5a577359-ef4e-4c99-8312-73e2af77b8c1	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	f0d519b4-ee1c-459f-b280-99cd1175ad2c	{"city": "Hubli", "code": "KIA_HBL_1790311468421", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "f0d519b4-ee1c-459f-b280-99cd1175ad2c"}	PENDING	0	5	\N	\N	2026-09-25 04:44:28.441	2026-09-25 04:44:28.441
06740635-82f7-4826-b44f-2d38929bf324	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	a848252d-0e66-4fff-b30a-944ca039a049	{"city": "Hubli", "code": "KIA_HBL_1790311508828", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "a848252d-0e66-4fff-b30a-944ca039a049"}	PENDING	0	5	\N	\N	2026-09-25 04:45:08.849	2026-09-25 04:45:08.849
933efea3-bb31-4197-984c-97479d3f2989	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	d13e8634-a6bf-47c3-8188-20e61c6b5efc	{"city": "Hubli", "code": "KIA_HBL_1790311539077", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "d13e8634-a6bf-47c3-8188-20e61c6b5efc"}	PENDING	0	5	\N	\N	2026-09-25 04:45:39.097	2026-09-25 04:45:39.097
8888d20b-bf04-4241-8313-9dc87e1f88ab	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	c1251098-b4b5-4080-bdf6-0df3144bea5f	{"city": "Hubli", "code": "KIA_HBL_1790312295050", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "c1251098-b4b5-4080-bdf6-0df3144bea5f"}	PENDING	0	5	\N	\N	2026-09-25 04:58:15.075	2026-09-25 04:58:15.075
83e0e358-356f-4837-aca8-b68abe779256	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	b6c26b29-2360-45cd-8cf3-295491a781b8	{"city": "Hubli", "code": "KIA_HBL_1790316877343", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "b6c26b29-2360-45cd-8cf3-295491a781b8"}	PENDING	0	5	\N	\N	2026-09-25 06:14:37.369	2026-09-25 06:14:37.369
1ffb4a80-cbeb-4583-a934-72f39c1e9a98	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	{"city": "Hubli", "code": "KIA_HBL_1790319644086", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185"}	PENDING	0	5	\N	\N	2026-09-25 07:00:44.109	2026-09-25 07:00:44.109
0a528c9d-bd59-4742-8979-66603e2d23f1	883663e1-917e-4fae-8f1d-9d89e749362b	branch.created	f5828624-ed43-4cfd-9251-37b163b71e45	{"city": "Hubli", "code": "KIA_HBL_1790319708825", "name": "Hubli Kia Experience Center", "state": "Karnataka", "branchId": "f5828624-ed43-4cfd-9251-37b163b71e45"}	PENDING	0	5	\N	\N	2026-09-25 07:01:48.845	2026-09-25 07:01:48.845
\.


--
-- Data for Name: organization_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_memberships (id, "tenantId", "userId", "branchId", "departmentId", "isPrimary", "employeeCode", designation, "createdAt", "updatedAt") FROM stdin;
eed8e19c-767d-4eca-9014-73b66a0d15cb	883663e1-917e-4fae-8f1d-9d89e749362b	169f0047-84b6-48a4-9d1c-621756017075	df42516a-ac2b-4757-ae1e-fa0eddd0c246	df6845b0-fb8a-4c5b-bd7d-d4d57349b973	t	BG-HBL-001	General Manager - Branch Operations	2026-09-24 11:40:41.781	2026-09-24 11:40:41.781
09d4ca23-e65d-4511-bd33-f0958bfa550d	883663e1-917e-4fae-8f1d-9d89e749362b	c473a25f-fa6d-46eb-98a5-09bd8c2a9057	df42516a-ac2b-4757-ae1e-fa0eddd0c246	df6845b0-fb8a-4c5b-bd7d-d4d57349b973	t	BG-HBL-042	Master Diagnostic Technician	2026-09-24 11:40:41.788	2026-09-24 11:40:41.788
bc6cbba7-1133-489b-8ff6-96bb7cb7e379	883663e1-917e-4fae-8f1d-9d89e749362b	b2837da8-54bd-4e9a-839a-b003aee5f333	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	\N	t	\N	Senior Diagnostic Specialist	2026-09-24 11:50:56.795	2026-09-24 11:50:56.795
7d03ede1-69c0-40e8-a82b-46f4b5f8e14a	883663e1-917e-4fae-8f1d-9d89e749362b	b2837da8-54bd-4e9a-839a-b003aee5f333	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-24 11:50:56.824	2026-09-24 11:50:56.824
a2188dc1-fc0a-466c-b51b-e161cadb6854	883663e1-917e-4fae-8f1d-9d89e749362b	cdb0fe3f-1e53-4b85-9175-dfb59e56c455	93f8b106-08f9-4cdc-b092-8c158089124d	\N	t	\N	Senior Diagnostic Specialist	2026-09-24 11:51:27.792	2026-09-24 11:51:27.792
847aa15d-acfa-46d4-87b6-65008d6b481c	883663e1-917e-4fae-8f1d-9d89e749362b	cdb0fe3f-1e53-4b85-9175-dfb59e56c455	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-24 11:51:27.805	2026-09-24 11:51:27.805
cbd9600e-c843-480a-96ec-488d45e62b70	883663e1-917e-4fae-8f1d-9d89e749362b	9465af5c-f8e2-4651-b8e9-8147a5287578	25ba19dc-ac61-45d3-84ae-c040b243e85d	\N	t	\N	Senior Diagnostic Specialist	2026-09-24 11:52:50.287	2026-09-24 11:52:50.287
ec3877f5-052d-46ac-ab08-32d82077f122	883663e1-917e-4fae-8f1d-9d89e749362b	9465af5c-f8e2-4651-b8e9-8147a5287578	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-24 11:52:50.308	2026-09-24 11:52:50.308
ec6718e1-46f4-4f14-8347-d7b1bf1e5a75	883663e1-917e-4fae-8f1d-9d89e749362b	3301d5a5-aaf5-4526-b4f9-d35c0dba2663	57446f6d-a45a-4c5a-bde5-da1e3720ffba	\N	t	\N	Senior Diagnostic Specialist	2026-09-24 12:34:15.4	2026-09-24 12:34:15.4
cbd098fb-2db3-4cb7-b712-c6b1eb7ad300	883663e1-917e-4fae-8f1d-9d89e749362b	3301d5a5-aaf5-4526-b4f9-d35c0dba2663	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-24 12:34:15.426	2026-09-24 12:34:15.426
6ffbff8c-9c05-4771-a375-c20ebd855121	883663e1-917e-4fae-8f1d-9d89e749362b	aa904b30-b18d-4efc-9b1b-8515d7ecf267	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	\N	t	\N	Senior Diagnostic Specialist	2026-09-24 12:44:59.369	2026-09-24 12:44:59.369
f7f87cec-e76f-4229-a267-beb648d42bd4	883663e1-917e-4fae-8f1d-9d89e749362b	aa904b30-b18d-4efc-9b1b-8515d7ecf267	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-24 12:44:59.4	2026-09-24 12:44:59.4
905ddac4-b799-40d8-8e06-0ff922e26c15	883663e1-917e-4fae-8f1d-9d89e749362b	75451fae-89f4-4ea4-aa2b-853f675178ae	f42de917-9e7f-4b90-ad97-86ba14bfc32f	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 04:30:44.126	2026-09-25 04:30:44.126
05307358-61a1-437e-86e1-ed84c6f8db67	883663e1-917e-4fae-8f1d-9d89e749362b	75451fae-89f4-4ea4-aa2b-853f675178ae	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 04:30:44.153	2026-09-25 04:30:44.153
943ef66f-66c1-4037-ac3b-3752dea3e535	883663e1-917e-4fae-8f1d-9d89e749362b	69303311-778f-4e50-8edf-089a31a5208b	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 04:31:33.501	2026-09-25 04:31:33.501
5515b195-1637-4238-9b3d-aef92f196e1b	883663e1-917e-4fae-8f1d-9d89e749362b	69303311-778f-4e50-8edf-089a31a5208b	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 04:31:33.514	2026-09-25 04:31:33.514
407d2136-193a-4421-b05b-ba1493082fb6	883663e1-917e-4fae-8f1d-9d89e749362b	f6a424fe-eebc-44cd-bb4c-3e2588b7db15	f0d519b4-ee1c-459f-b280-99cd1175ad2c	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 04:44:28.766	2026-09-25 04:44:28.766
fb3c3a90-fe67-43e2-96ee-645b6e319dae	883663e1-917e-4fae-8f1d-9d89e749362b	f6a424fe-eebc-44cd-bb4c-3e2588b7db15	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 04:44:28.78	2026-09-25 04:44:28.78
6ab25b37-e63a-46db-ae2f-d8d38f4bd20f	883663e1-917e-4fae-8f1d-9d89e749362b	7c45990a-ea3e-4175-b50a-9ef3ea632bc9	a848252d-0e66-4fff-b30a-944ca039a049	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 04:45:09.194	2026-09-25 04:45:09.194
270a4b3a-dfa7-4637-a45a-95230c56ed43	883663e1-917e-4fae-8f1d-9d89e749362b	7c45990a-ea3e-4175-b50a-9ef3ea632bc9	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 04:45:09.215	2026-09-25 04:45:09.215
27877cb9-b43b-42c0-a8db-ef332595d2f7	883663e1-917e-4fae-8f1d-9d89e749362b	bbe58ab0-0f79-4aff-962b-a8616a28c119	d13e8634-a6bf-47c3-8188-20e61c6b5efc	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 04:45:39.422	2026-09-25 04:45:39.422
5d6de274-c94d-4466-97cd-cb4dcaeaf8c9	883663e1-917e-4fae-8f1d-9d89e749362b	bbe58ab0-0f79-4aff-962b-a8616a28c119	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 04:45:39.434	2026-09-25 04:45:39.434
2e1a0f89-6c2e-4ae3-8f62-e183e253959a	883663e1-917e-4fae-8f1d-9d89e749362b	c2ea6a6b-1d36-4203-a396-d61633802998	c1251098-b4b5-4080-bdf6-0df3144bea5f	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 04:58:15.407	2026-09-25 04:58:15.407
b2b68f4a-200a-45e3-93d5-061796920ba2	883663e1-917e-4fae-8f1d-9d89e749362b	c2ea6a6b-1d36-4203-a396-d61633802998	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 04:58:15.435	2026-09-25 04:58:15.435
7dd45962-bbe8-4e0a-8d23-5f45290abdfb	883663e1-917e-4fae-8f1d-9d89e749362b	27ede1d1-1daf-4bcb-af17-d6ede5b139aa	b6c26b29-2360-45cd-8cf3-295491a781b8	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 06:14:37.705	2026-09-25 06:14:37.705
b03b813b-db84-42ee-9d38-863217be5509	883663e1-917e-4fae-8f1d-9d89e749362b	27ede1d1-1daf-4bcb-af17-d6ede5b139aa	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 06:14:37.732	2026-09-25 06:14:37.732
1ad338f4-9c03-4f8c-9766-ba6972759b95	883663e1-917e-4fae-8f1d-9d89e749362b	fe168d08-76a9-4c13-a0f7-0a2ac243af5f	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 07:00:44.446	2026-09-25 07:00:44.446
1f542385-8cc7-415d-b1e6-84e96b56e365	883663e1-917e-4fae-8f1d-9d89e749362b	fe168d08-76a9-4c13-a0f7-0a2ac243af5f	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 07:00:44.47	2026-09-25 07:00:44.47
8c9e1995-9bb2-4b87-9277-7b62fc163a81	883663e1-917e-4fae-8f1d-9d89e749362b	39216e9d-fe57-4080-81e6-702db4d18721	f5828624-ed43-4cfd-9251-37b163b71e45	\N	t	\N	Senior Diagnostic Specialist	2026-09-25 07:01:49.149	2026-09-25 07:01:49.149
98fc6adb-b7f6-4e10-ad6a-4f115ee14010	883663e1-917e-4fae-8f1d-9d89e749362b	39216e9d-fe57-4080-81e6-702db4d18721	4350dbb5-8d55-405c-9456-9de567e356c4	\N	f	\N	Visiting Senior Technician	2026-09-25 07:01:49.166	2026-09-25 07:01:49.166
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, "applicationId", code, domain, resource, action, description, "createdAt") FROM stdin;
90b6bf9a-6583-435d-a3a4-a396e851f369	\N	platform.tenant.manage	platform	tenant	manage	Onboard and configure dealer groups	2026-09-24 11:39:19.26
aa5a880c-a6ff-4239-9233-aa1e1b7a62fc	\N	platform.application.manage	platform	application	manage	Register and configure ecosystem apps	2026-09-24 11:39:19.263
0ca23926-5062-4357-a559-926206c2025a	\N	platform.telemetry.view	platform	telemetry	view	View system-wide telemetry and health	2026-09-24 11:39:19.264
132b0ffc-80fa-4047-ad41-80dbb6dce885	\N	org.tenant.update	org	tenant	update	Update dealership group details	2026-09-24 11:39:19.266
1f2635d8-84b2-46cf-89b0-f554dd1066c6	\N	org.firm.manage	org	firm	manage	Manage legal corporate entities	2026-09-24 11:39:19.267
c827b1d2-402b-4425-9476-6f6471e96b8f	\N	org.brand.manage	org	brand	manage	Manage OEM franchises and agreements	2026-09-24 11:39:19.269
f84f0af6-775c-419f-8b88-7e6f80af18a2	\N	org.branch.manage	org	branch	manage	Manage physical outlets and facilities	2026-09-24 11:39:19.27
13a57705-4aab-4ff0-abd4-33784105c5b6	\N	org.department.manage	org	department	manage	Manage functional teams and bays	2026-09-24 11:39:19.273
5c1e1292-d503-4479-b83b-b01dd5584a20	\N	org.user.manage	org	user	manage	Manage central user accounts and roles	2026-09-24 11:39:19.274
6fcd858a-bd4f-46d8-84c4-de7c09f2407d	\N	org.audit.view	org	audit	view	Inspect compliance audit trail	2026-09-24 11:39:19.275
543bb816-2122-4277-8c17-e2414165f172	dcf21321-05e6-43e6-814f-fca410032216	hr.employee.read	hr	employee	read	View employee records and org hierarchy	2026-09-24 11:39:19.276
15788d40-8eee-425c-8a79-c51797506efc	dcf21321-05e6-43e6-814f-fca410032216	hr.employee.create	hr	employee	create	Onboard new candidates	2026-09-24 11:39:19.277
7a17a7af-2741-4fb8-9727-37052b57b6a1	dcf21321-05e6-43e6-814f-fca410032216	hr.employee.update	hr	employee	update	Update employee records, KYC, salary	2026-09-24 11:39:19.278
3596b048-dcf8-449c-a367-556b543e76ed	dcf21321-05e6-43e6-814f-fca410032216	hr.leave.approve	hr	leave	approve	Approve employee leave applications	2026-09-24 11:39:19.279
b01d4a26-361d-4463-a0cb-7113f1a0284f	dcf21321-05e6-43e6-814f-fca410032216	hr.attendance.punch	hr	attendance	punch	Punch biometric/mobile attendance	2026-09-24 11:39:19.28
eccd86ab-26b3-47d5-9197-399665a6da6f	dcf21321-05e6-43e6-814f-fca410032216	hr.attendance.correct	hr	attendance	correct	Approve attendance punch corrections	2026-09-24 11:39:19.281
e8fc7620-ddac-43d6-aaf7-da2d681c8059	dcf21321-05e6-43e6-814f-fca410032216	hr.payroll.process	hr	payroll	process	Run monthly payroll and tax calculations	2026-09-24 11:39:19.282
1b3abdaa-6ad1-4028-aa53-fd5ddf14d979	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintenance.ticket.create	maintenance	ticket	create	Raise maintenance or repair requests	2026-09-24 11:39:19.283
16d4d5da-ebe8-4779-88ad-694cb89737b2	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintenance.ticket.read	maintenance	ticket	read	View maintenance tickets	2026-09-24 11:39:19.284
b0b79e54-34ab-432f-a4ea-868134bc6a18	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintenance.ticket.approve	maintenance	ticket	approve	Approve maintenance expenditure and tickets	2026-09-24 11:39:19.285
86b1e2bf-9506-445a-861b-bc1927bf84c2	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintenance.ticket.assign	maintenance	ticket	assign	Assign work to technicians or vendors	2026-09-24 11:39:19.286
7fdddefa-eae0-4e54-a63b-e0ab1e05640d	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintenance.ticket.execute	maintenance	ticket	execute	Execute repair work and log materials	2026-09-24 11:39:19.287
a811a6a7-0721-4d9c-be0d-1d1122955e28	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	maintenance.purchase.request	maintenance	purchase	request	Raise purchase requests for spare parts	2026-09-24 11:39:19.289
8a1025cd-5557-4209-9a19-23a57061dd2e	\N	hr.employee.delete	hr	employee	delete	Deactivate or offboard employees	2026-09-25 04:43:08.052
6cc15a49-cae8-4926-85cc-d591d6f9d91c	\N	hr.attendance.manage	hr	attendance	manage	Manage attendance and corrections	2026-09-25 04:43:08.055
3bc3a1f4-15ed-4df1-93f5-c9ebd5133432	\N	hr.payroll.manage	hr	payroll	manage	Manage payroll and payment advices	2026-09-25 04:43:08.056
1aca0e4a-bbcf-4384-9614-58ad679461b7	\N	hr.recruitment.manage	hr	recruitment	manage	Manage job vacancies and hiring	2026-09-25 04:43:08.058
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, "roleId", "permissionId", "createdAt") FROM stdin;
64963619-78e3-48e4-9c0a-a001361aef9c	fb318871-d894-4c01-9661-b44323c644eb	90b6bf9a-6583-435d-a3a4-a396e851f369	2026-09-24 11:40:41.651
1542bd13-7260-46a5-ad3f-d28dd22ad998	fb318871-d894-4c01-9661-b44323c644eb	aa5a880c-a6ff-4239-9233-aa1e1b7a62fc	2026-09-24 11:40:41.654
b3590c91-21a9-4d2a-8c1b-12151c0e6a96	fb318871-d894-4c01-9661-b44323c644eb	0ca23926-5062-4357-a559-926206c2025a	2026-09-24 11:40:41.655
f4665a80-5bac-4f2f-8df9-d7e15f16a442	fb318871-d894-4c01-9661-b44323c644eb	132b0ffc-80fa-4047-ad41-80dbb6dce885	2026-09-24 11:40:41.657
d4b84a98-1a8d-45c1-a9f2-3dfdb1e14a0c	fb318871-d894-4c01-9661-b44323c644eb	1f2635d8-84b2-46cf-89b0-f554dd1066c6	2026-09-24 11:40:41.659
12bed460-1f72-4fb7-9998-180c7291ef23	fb318871-d894-4c01-9661-b44323c644eb	c827b1d2-402b-4425-9476-6f6471e96b8f	2026-09-24 11:40:41.661
3e471cfa-1682-4a74-9de9-c9cc8c1c4ed8	fb318871-d894-4c01-9661-b44323c644eb	f84f0af6-775c-419f-8b88-7e6f80af18a2	2026-09-24 11:40:41.662
5bef341e-569b-47a7-b741-a593784344c1	fb318871-d894-4c01-9661-b44323c644eb	13a57705-4aab-4ff0-abd4-33784105c5b6	2026-09-24 11:40:41.663
b99833bb-dd72-4fb8-a529-4030a1ff32fe	fb318871-d894-4c01-9661-b44323c644eb	5c1e1292-d503-4479-b83b-b01dd5584a20	2026-09-24 11:40:41.664
ce9929e5-5f34-4395-a182-3935f3f0dd46	fb318871-d894-4c01-9661-b44323c644eb	6fcd858a-bd4f-46d8-84c4-de7c09f2407d	2026-09-24 11:40:41.665
3faae823-0a36-4702-a4d3-a4edb1c25be9	fb318871-d894-4c01-9661-b44323c644eb	543bb816-2122-4277-8c17-e2414165f172	2026-09-24 11:40:41.666
1e580df3-96d4-47a7-985f-c9cc768e4d5a	fb318871-d894-4c01-9661-b44323c644eb	15788d40-8eee-425c-8a79-c51797506efc	2026-09-24 11:40:41.667
79ab2cc1-a0d4-4264-9e7b-1d28e35561dd	fb318871-d894-4c01-9661-b44323c644eb	7a17a7af-2741-4fb8-9727-37052b57b6a1	2026-09-24 11:40:41.668
1fcd5f89-49fd-47d2-b333-c123f38bf5d0	fb318871-d894-4c01-9661-b44323c644eb	3596b048-dcf8-449c-a367-556b543e76ed	2026-09-24 11:40:41.669
4fb4cb2f-708a-4d74-952b-f3cae3bd6c99	fb318871-d894-4c01-9661-b44323c644eb	b01d4a26-361d-4463-a0cb-7113f1a0284f	2026-09-24 11:40:41.669
70f1b8c0-2b46-40d0-a6c9-f18c069a10d2	fb318871-d894-4c01-9661-b44323c644eb	eccd86ab-26b3-47d5-9197-399665a6da6f	2026-09-24 11:40:41.67
d5dae102-e4d7-486f-8544-8a7f4de57a90	fb318871-d894-4c01-9661-b44323c644eb	e8fc7620-ddac-43d6-aaf7-da2d681c8059	2026-09-24 11:40:41.671
09789e29-06a7-46d8-bd74-651a303864b2	fb318871-d894-4c01-9661-b44323c644eb	1b3abdaa-6ad1-4028-aa53-fd5ddf14d979	2026-09-24 11:40:41.672
e72ed68b-2343-4269-a38c-2edf2c0a956f	fb318871-d894-4c01-9661-b44323c644eb	16d4d5da-ebe8-4779-88ad-694cb89737b2	2026-09-24 11:40:41.674
08f3ebc2-87c5-4d7e-a0ac-c93ce0d2cde2	fb318871-d894-4c01-9661-b44323c644eb	b0b79e54-34ab-432f-a4ea-868134bc6a18	2026-09-24 11:40:41.676
b2dbec62-fd05-4117-863f-12f3039f57c4	fb318871-d894-4c01-9661-b44323c644eb	86b1e2bf-9506-445a-861b-bc1927bf84c2	2026-09-24 11:40:41.677
a0c1dffb-ef4c-42ab-ba58-ebdda1155a95	fb318871-d894-4c01-9661-b44323c644eb	7fdddefa-eae0-4e54-a63b-e0ab1e05640d	2026-09-24 11:40:41.679
df538f61-f73d-49be-b88a-11b7c3fe7e6f	fb318871-d894-4c01-9661-b44323c644eb	a811a6a7-0721-4d9c-be0d-1d1122955e28	2026-09-24 11:40:41.68
2ea47234-07eb-4ae7-bd18-cf00b6aa92e8	ef9c8fba-204b-42a9-aeb6-ea0555658d24	132b0ffc-80fa-4047-ad41-80dbb6dce885	2026-09-24 11:40:41.682
19d7c455-b700-45bd-b397-b9185d3585f6	ef9c8fba-204b-42a9-aeb6-ea0555658d24	1f2635d8-84b2-46cf-89b0-f554dd1066c6	2026-09-24 11:40:41.683
c5af1e3f-b7be-46c6-a0b5-d6f9c1b4e09e	ef9c8fba-204b-42a9-aeb6-ea0555658d24	c827b1d2-402b-4425-9476-6f6471e96b8f	2026-09-24 11:40:41.684
6d70c44e-d823-40ab-b1f2-e43831b219e5	ef9c8fba-204b-42a9-aeb6-ea0555658d24	f84f0af6-775c-419f-8b88-7e6f80af18a2	2026-09-24 11:40:41.685
28586f3d-ac6c-4a16-b3f9-18d1eb3699b1	ef9c8fba-204b-42a9-aeb6-ea0555658d24	13a57705-4aab-4ff0-abd4-33784105c5b6	2026-09-24 11:40:41.686
74f6c11c-d064-4257-9111-b75e9277d422	ef9c8fba-204b-42a9-aeb6-ea0555658d24	5c1e1292-d503-4479-b83b-b01dd5584a20	2026-09-24 11:40:41.687
b2fbb5ef-b48b-4ac9-ab9c-fc501f469e90	ef9c8fba-204b-42a9-aeb6-ea0555658d24	6fcd858a-bd4f-46d8-84c4-de7c09f2407d	2026-09-24 11:40:41.688
9317ddaa-c089-4837-b1ad-3602834cff4f	ef9c8fba-204b-42a9-aeb6-ea0555658d24	543bb816-2122-4277-8c17-e2414165f172	2026-09-24 11:40:41.689
3268f8d1-0933-4c90-99a0-5fdad5d5a0d6	ef9c8fba-204b-42a9-aeb6-ea0555658d24	15788d40-8eee-425c-8a79-c51797506efc	2026-09-24 11:40:41.69
75ef8cec-d448-42dd-96d2-fe6414b5c9bd	ef9c8fba-204b-42a9-aeb6-ea0555658d24	7a17a7af-2741-4fb8-9727-37052b57b6a1	2026-09-24 11:40:41.692
93533cc7-1b0f-452c-b64a-b0881e2e451c	ef9c8fba-204b-42a9-aeb6-ea0555658d24	e8fc7620-ddac-43d6-aaf7-da2d681c8059	2026-09-24 11:40:41.694
7da5780a-f060-4c4b-b259-56da39a41ca3	ef9c8fba-204b-42a9-aeb6-ea0555658d24	1b3abdaa-6ad1-4028-aa53-fd5ddf14d979	2026-09-24 11:40:41.695
1acf1cbe-8681-496f-809d-33da69a64e13	ef9c8fba-204b-42a9-aeb6-ea0555658d24	16d4d5da-ebe8-4779-88ad-694cb89737b2	2026-09-24 11:40:41.696
069b75b9-a219-446f-a63e-f91ce9963dd9	ef9c8fba-204b-42a9-aeb6-ea0555658d24	b0b79e54-34ab-432f-a4ea-868134bc6a18	2026-09-24 11:40:41.697
e92653df-5c72-427f-8ba2-1e82488d04e6	ef9c8fba-204b-42a9-aeb6-ea0555658d24	86b1e2bf-9506-445a-861b-bc1927bf84c2	2026-09-24 11:40:41.698
af905cb0-7f4c-4ded-8043-e3aa0110d145	78f4bd8d-61f7-4c33-ab36-933aa2550a74	543bb816-2122-4277-8c17-e2414165f172	2026-09-24 11:40:41.7
562781ad-0ad2-4f33-945e-9854c785e30e	78f4bd8d-61f7-4c33-ab36-933aa2550a74	3596b048-dcf8-449c-a367-556b543e76ed	2026-09-24 11:40:41.701
aaddc10c-d69b-4dd9-80e4-1c7b711259fc	78f4bd8d-61f7-4c33-ab36-933aa2550a74	eccd86ab-26b3-47d5-9197-399665a6da6f	2026-09-24 11:40:41.702
59dbf902-4033-4e3c-985b-3fa534113534	78f4bd8d-61f7-4c33-ab36-933aa2550a74	1b3abdaa-6ad1-4028-aa53-fd5ddf14d979	2026-09-24 11:40:41.703
ed1c30f5-a58e-452a-838d-c141277cb7f8	78f4bd8d-61f7-4c33-ab36-933aa2550a74	16d4d5da-ebe8-4779-88ad-694cb89737b2	2026-09-24 11:40:41.704
096634b0-11d8-4f0e-8b60-a2877ffea4af	78f4bd8d-61f7-4c33-ab36-933aa2550a74	b0b79e54-34ab-432f-a4ea-868134bc6a18	2026-09-24 11:40:41.705
fbaf8894-8acf-4040-8a14-0e41155a0d4f	78f4bd8d-61f7-4c33-ab36-933aa2550a74	86b1e2bf-9506-445a-861b-bc1927bf84c2	2026-09-24 11:40:41.705
84915e5e-18bb-48a9-aec3-07f8c1e0338b	78f4bd8d-61f7-4c33-ab36-933aa2550a74	a811a6a7-0721-4d9c-be0d-1d1122955e28	2026-09-24 11:40:41.706
240663b5-34e6-490b-91cf-b76c30f4c742	73c0396b-93a6-4a7e-933b-393d6720f5ad	543bb816-2122-4277-8c17-e2414165f172	2026-09-24 11:40:41.709
00243f97-54ed-4c86-a5fd-e2c3492bb87d	73c0396b-93a6-4a7e-933b-393d6720f5ad	15788d40-8eee-425c-8a79-c51797506efc	2026-09-24 11:40:41.71
80dc07c4-364e-4a3f-bc99-0196bd049d13	73c0396b-93a6-4a7e-933b-393d6720f5ad	7a17a7af-2741-4fb8-9727-37052b57b6a1	2026-09-24 11:40:41.712
6b52ea16-08b2-4404-8c16-43ac859e78d2	73c0396b-93a6-4a7e-933b-393d6720f5ad	3596b048-dcf8-449c-a367-556b543e76ed	2026-09-24 11:40:41.713
ae26dfef-2055-4d4d-b8d6-c17a2f0ce24f	73c0396b-93a6-4a7e-933b-393d6720f5ad	eccd86ab-26b3-47d5-9197-399665a6da6f	2026-09-24 11:40:41.713
f83a5e14-4900-486a-a59f-36bba46175ae	73c0396b-93a6-4a7e-933b-393d6720f5ad	e8fc7620-ddac-43d6-aaf7-da2d681c8059	2026-09-24 11:40:41.714
249c3e7b-c8d1-4eb5-b24f-efc49602dc02	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	16d4d5da-ebe8-4779-88ad-694cb89737b2	2026-09-24 11:40:41.717
651d5e0c-41b9-4463-bc61-083cbaabc783	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	7fdddefa-eae0-4e54-a63b-e0ab1e05640d	2026-09-24 11:40:41.717
7d200ee8-85d4-4f31-a23b-6c227179ba25	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	a811a6a7-0721-4d9c-be0d-1d1122955e28	2026-09-24 11:40:41.718
df996228-97b7-4b13-aadc-f02599ce56b6	3ee95952-f308-4049-a0b8-75c69d0dd8b0	543bb816-2122-4277-8c17-e2414165f172	2026-09-24 11:40:41.72
272f4175-7f8e-46e0-ab4e-df4cc0282e4c	3ee95952-f308-4049-a0b8-75c69d0dd8b0	b01d4a26-361d-4463-a0cb-7113f1a0284f	2026-09-24 11:40:41.722
87bcb067-cec5-4bc0-a7a8-8bdf7997656c	3ee95952-f308-4049-a0b8-75c69d0dd8b0	1b3abdaa-6ad1-4028-aa53-fd5ddf14d979	2026-09-24 11:40:41.723
762ae46e-f297-4c70-8fa6-fc7a66708df1	3ee95952-f308-4049-a0b8-75c69d0dd8b0	16d4d5da-ebe8-4779-88ad-694cb89737b2	2026-09-24 11:40:41.725
cafba5b5-a5d6-4750-ac24-ebbe2a4f40d1	fb318871-d894-4c01-9661-b44323c644eb	8a1025cd-5557-4209-9a19-23a57061dd2e	2026-09-25 04:43:21.269
e7af2da8-59fb-4699-99b5-a5a89e84694d	fb318871-d894-4c01-9661-b44323c644eb	6cc15a49-cae8-4926-85cc-d591d6f9d91c	2026-09-25 04:43:21.273
7c9286e4-1214-4145-95a0-4d872c74cbc0	fb318871-d894-4c01-9661-b44323c644eb	3bc3a1f4-15ed-4df1-93f5-c9ebd5133432	2026-09-25 04:43:21.275
60a21471-5255-4738-803e-19154d21e262	fb318871-d894-4c01-9661-b44323c644eb	1aca0e4a-bbcf-4384-9614-58ad679461b7	2026-09-25 04:43:21.277
a094de08-0cf1-4ec1-a12c-8db48a84f1d7	ef9c8fba-204b-42a9-aeb6-ea0555658d24	3596b048-dcf8-449c-a367-556b543e76ed	2026-09-25 04:43:21.28
43a998c4-9acb-4c16-9954-31b8be5d9d35	ef9c8fba-204b-42a9-aeb6-ea0555658d24	b01d4a26-361d-4463-a0cb-7113f1a0284f	2026-09-25 04:43:21.281
eaef5df6-8ca9-4663-b41e-015766d9fc4a	ef9c8fba-204b-42a9-aeb6-ea0555658d24	eccd86ab-26b3-47d5-9197-399665a6da6f	2026-09-25 04:43:21.282
339ba0a7-780f-4f6d-ab78-dace57348f16	ef9c8fba-204b-42a9-aeb6-ea0555658d24	8a1025cd-5557-4209-9a19-23a57061dd2e	2026-09-25 04:43:21.283
800ed076-5d64-421c-8a94-6773783623ae	ef9c8fba-204b-42a9-aeb6-ea0555658d24	6cc15a49-cae8-4926-85cc-d591d6f9d91c	2026-09-25 04:43:21.284
c51eb9c6-bba6-4afd-ae6f-7636f04a6494	ef9c8fba-204b-42a9-aeb6-ea0555658d24	3bc3a1f4-15ed-4df1-93f5-c9ebd5133432	2026-09-25 04:43:21.285
5dea8640-5ae7-49d1-aae9-58f908864bb1	ef9c8fba-204b-42a9-aeb6-ea0555658d24	1aca0e4a-bbcf-4384-9614-58ad679461b7	2026-09-25 04:43:21.286
c7b14582-7883-4ace-a78c-2cb4f59e6e70	78f4bd8d-61f7-4c33-ab36-933aa2550a74	6cc15a49-cae8-4926-85cc-d591d6f9d91c	2026-09-25 04:43:21.29
1458bdf8-9017-4ed7-92b7-230f140c6247	73c0396b-93a6-4a7e-933b-393d6720f5ad	b01d4a26-361d-4463-a0cb-7113f1a0284f	2026-09-25 04:43:21.294
3ceb2bb1-9b3b-4f76-a4ad-93063d9d34cb	73c0396b-93a6-4a7e-933b-393d6720f5ad	8a1025cd-5557-4209-9a19-23a57061dd2e	2026-09-25 04:43:21.296
5185e769-511b-4ff7-a46b-8c2653f7b10e	73c0396b-93a6-4a7e-933b-393d6720f5ad	6cc15a49-cae8-4926-85cc-d591d6f9d91c	2026-09-25 04:43:21.297
b766f229-0340-4a5b-bb5a-354149c7cd7c	73c0396b-93a6-4a7e-933b-393d6720f5ad	3bc3a1f4-15ed-4df1-93f5-c9ebd5133432	2026-09-25 04:43:21.298
ba989e21-e2e3-4d80-b7a0-f114a0764bc1	73c0396b-93a6-4a7e-933b-393d6720f5ad	1aca0e4a-bbcf-4384-9614-58ad679461b7	2026-09-25 04:43:21.299
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, "tenantId", code, name, description, "scopeType", "isSystem", "createdAt", "updatedAt") FROM stdin;
fb318871-d894-4c01-9661-b44323c644eb	\N	PLATFORM_ADMIN	Platform Administrator	Superuser access across the entire multi-tenant platform	GLOBAL	t	2026-09-24 11:40:41.649	2026-09-24 11:40:41.649
ef9c8fba-204b-42a9-aeb6-ea0555658d24	\N	TENANT_ADMIN	Tenant Administrator	Complete governance over a dealership group and all its firms/branches	TENANT	t	2026-09-24 11:40:41.682	2026-09-24 11:40:41.682
78f4bd8d-61f7-4c33-ab36-933aa2550a74	\N	BRANCH_MANAGER	Branch General Manager	Operational manager for a specific physical branch or showroom/workshop	BRANCH	t	2026-09-24 11:40:41.699	2026-09-24 11:40:41.699
73c0396b-93a6-4a7e-933b-393d6720f5ad	\N	HR_OFFICER	Human Resources Officer	Manages onboarding, attendance, leaves, and payroll records	TENANT	t	2026-09-24 11:40:41.708	2026-09-24 11:40:41.708
1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	\N	TECHNICIAN	Maintenance Technician	Executes repair work, logs materials, and updates ticket status	BRANCH	t	2026-09-24 11:40:41.716	2026-09-24 11:40:41.716
3ee95952-f308-4049-a0b8-75c69d0dd8b0	\N	EMPLOYEE	Dealership Staff	Standard employee self-service	BRANCH	t	2026-09-24 11:40:41.72	2026-09-24 11:40:41.72
\.


--
-- Data for Name: tenant_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_applications (id, "tenantId", "applicationId", status, "planName", "customConfig", features, "startsAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
6ce405bd-3ec4-414a-b72a-3792d27e1050	883663e1-917e-4fae-8f1d-9d89e749362b	dcf21321-05e6-43e6-814f-fca410032216	ACTIVE	ENTERPRISE	\N	\N	2026-09-24 11:40:41.732	\N	2026-09-24 11:40:41.732	2026-09-24 11:40:41.732
5e12122e-9710-46d6-973c-1eeb0a5b9aaa	883663e1-917e-4fae-8f1d-9d89e749362b	797bebbf-8645-4a9c-aef2-d3c2efccb3a0	ACTIVE	ENTERPRISE	\N	\N	2026-09-24 11:40:41.735	\N	2026-09-24 11:40:41.735	2026-09-24 11:40:41.735
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, code, name, "legalName", status, "subscriptionTier", "logoUrl", website, "primaryContact", "primaryEmail", "primaryPhone", "addressLine1", "addressLine2", city, state, pincode, country, timezone, currency, settings, metadata, "createdAt", "updatedAt") FROM stdin;
883663e1-917e-4fae-8f1d-9d89e749362b	BELLAD	Bellad Group	Bellad Enterprises Private Limited	ACTIVE	ENTERPRISE	\N	\N	Agastya Bellad	info@belladgroup.com	+91 836 2488888	\N	\N	Hubli	Karnataka	\N	India	Asia/Kolkata	INR	\N	\N	2026-09-24 11:40:41.727	2026-09-24 11:40:41.727
f0ea4625-4bb3-4f0a-8a67-77b53c0afb54	APEX	Apex Auto Group	Apex Automotive Network Private Limited	ACTIVE	ENTERPRISE	\N	\N	Vikram Malhotra	admin@apexauto.in	+91 22 61234567	\N	\N	Mumbai	Maharashtra	\N	India	Asia/Kolkata	INR	\N	\N	2026-09-24 11:40:41.73	2026-09-24 11:40:41.73
\.


--
-- Data for Name: user_role_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role_assignments (id, "userId", "roleId", "tenantId", "firmId", "brandId", "branchId", "departmentId", "scopeType", "assignedBy", "createdAt") FROM stdin;
68ed2816-dd1d-4d78-bcd1-32c5fe79c45e	84a1e6f3-f10c-411c-b6c5-95e693399416	ef9c8fba-204b-42a9-aeb6-ea0555658d24	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	\N	\N	TENANT	\N	2026-09-24 11:40:41.773
3ff45bca-3c67-48db-917e-3b65e5d759fb	8c1ba00f-b947-4bd7-b5b6-fe761580642f	73c0396b-93a6-4a7e-933b-393d6720f5ad	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	\N	\N	TENANT	\N	2026-09-24 11:40:41.778
bc667670-9b3a-4acb-b534-cb576ba06f97	169f0047-84b6-48a4-9d1c-621756017075	78f4bd8d-61f7-4c33-ab36-933aa2550a74	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	df42516a-ac2b-4757-ae1e-fa0eddd0c246	\N	BRANCH	\N	2026-09-24 11:40:41.785
035025cf-06d8-434f-b8af-3b098dc6c5b5	c473a25f-fa6d-46eb-98a5-09bd8c2a9057	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	df42516a-ac2b-4757-ae1e-fa0eddd0c246	\N	BRANCH	\N	2026-09-24 11:40:41.79
e4acbaf6-52ad-47a6-934f-ec0871339acb	b2837da8-54bd-4e9a-839a-b003aee5f333	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	7a5b0ba5-f0aa-4300-89f8-db5b1c1543bb	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-24 11:50:56.798
7f04e8ca-d0b5-4c9c-8827-5887fb094a53	cdb0fe3f-1e53-4b85-9175-dfb59e56c455	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	93f8b106-08f9-4cdc-b092-8c158089124d	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-24 11:51:27.794
62e72c09-3970-48a4-b6c1-23a0b0ac929e	9465af5c-f8e2-4651-b8e9-8147a5287578	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	25ba19dc-ac61-45d3-84ae-c040b243e85d	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-24 11:52:50.289
0583a170-2bff-4c90-b7b1-8fa3eacca6c2	3301d5a5-aaf5-4526-b4f9-d35c0dba2663	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	57446f6d-a45a-4c5a-bde5-da1e3720ffba	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-24 12:34:15.403
91b78790-6134-4b85-a046-c475d4e99760	aa904b30-b18d-4efc-9b1b-8515d7ecf267	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	a4676ae4-ebc1-41a9-ba24-64f74b2267b8	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-24 12:44:59.374
f366405f-cc88-4120-9ab1-b2d1c59382a3	75451fae-89f4-4ea4-aa2b-853f675178ae	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	f42de917-9e7f-4b90-ad97-86ba14bfc32f	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 04:30:44.128
5a04e5b3-7bda-4ea2-a71e-130a95e30c52	69303311-778f-4e50-8edf-089a31a5208b	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	c9a536ca-c3e2-4303-ae28-667a4e62bd4e	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 04:31:33.503
877211f3-734d-4767-b61b-d68605486294	f6a424fe-eebc-44cd-bb4c-3e2588b7db15	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	f0d519b4-ee1c-459f-b280-99cd1175ad2c	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 04:44:28.768
4dfb43d8-7d1f-4bc8-919c-3b3059e5fb1e	7c45990a-ea3e-4175-b50a-9ef3ea632bc9	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	a848252d-0e66-4fff-b30a-944ca039a049	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 04:45:09.196
72ba2e8f-a923-4583-bad2-4db3b18424ae	bbe58ab0-0f79-4aff-962b-a8616a28c119	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	d13e8634-a6bf-47c3-8188-20e61c6b5efc	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 04:45:39.424
829f68f1-81e0-4f11-bf1e-a7e00d431ca5	c2ea6a6b-1d36-4203-a396-d61633802998	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	c1251098-b4b5-4080-bdf6-0df3144bea5f	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 04:58:15.409
90ec90ac-6705-4c2c-90b4-57374470f149	27ede1d1-1daf-4bcb-af17-d6ede5b139aa	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	b6c26b29-2360-45cd-8cf3-295491a781b8	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 06:14:37.707
6355bfda-fe8c-4e8d-b4fb-9b6c77d79b05	fe168d08-76a9-4c13-a0f7-0a2ac243af5f	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	07f0ea1a-2bc5-4a7d-be9c-c0a9bdffc185	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 07:00:44.449
c5b863f7-d74b-406c-a31d-23d6669b2c3b	39216e9d-fe57-4080-81e6-702db4d18721	1c9fb1ee-3e01-41cf-9b41-e158d73f36ac	883663e1-917e-4fae-8f1d-9d89e749362b	\N	\N	f5828624-ed43-4cfd-9251-37b163b71e45	\N	BRANCH	84a1e6f3-f10c-411c-b6c5-95e693399416	2026-09-25 07:01:49.151
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "tenantId", "keycloakSub", email, username, "passwordHash", "firstName", "lastName", phone, "avatarUrl", status, "isPlatformAdmin", "lastLoginAt", "createdAt", "updatedAt") FROM stdin;
8c1ba00f-b947-4bd7-b5b6-fe761580642f	883663e1-917e-4fae-8f1d-9d89e749362b	\N	hr.bellad@belladgroup.com	hr.bellad	$2a$10$4dDx84o8a6642BMjTSfCre57nDiq2EvfypvicOnT7WZb6v6vCjuJ2	Pooja	Kulkarni	\N	\N	ACTIVE	f	\N	2026-09-24 11:40:41.776	2026-09-24 11:40:41.776
c473a25f-fa6d-46eb-98a5-09bd8c2a9057	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.hubli@belladgroup.com	tech.hubli	$2a$10$4dDx84o8a6642BMjTSfCre57nDiq2EvfypvicOnT7WZb6v6vCjuJ2	Suresh	Patil	\N	\N	ACTIVE	f	\N	2026-09-24 11:40:41.786	2026-09-24 11:40:41.786
27ede1d1-1daf-4bcb-af17-d6ede5b139aa	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790316877621@belladgroup.com	tech.floating.1790316877621	$2a$10$Tx6hvZH3qLzBF1kMRL4hj.Lsre0Jpn/c1aUBe0qZw0u/iescKY.HW	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 06:14:37.702	2026-09-25 06:14:37.793
75451fae-89f4-4ea4-aa2b-853f675178ae	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790310644043@belladgroup.com	tech.floating.1790310644043	$2a$10$GIOFWxyyo8zzWVjhqEZ/yeWR60AbbiS5Du7ziQYDmViHOS189V6LG	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 04:30:44.123	2026-09-25 04:30:44.215
3301d5a5-aaf5-4526-b4f9-d35c0dba2663	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790253255314@belladgroup.com	tech.floating.1790253255314	$2a$10$W9UnUc3MmgaTpkQiJG6pOu/yYr2HALzhncrbCy0FCYWrC4Y/JE0U2	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-24 12:34:15.398	2026-09-24 12:34:15.489
b2837da8-54bd-4e9a-839a-b003aee5f333	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790250656714@belladgroup.com	tech.floating.1790250656714	$2a$10$UcUU6gvizqbOhOw40enHeuOk8km57Bx4dmVsSSCykKp9ZxfFaW/uW	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-24 11:50:56.793	2026-09-24 11:50:56.885
7c45990a-ea3e-4175-b50a-9ef3ea632bc9	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790311509104@belladgroup.com	tech.floating.1790311509104	$2a$10$7HREwlUlqCv1JaxW0h0Rbu1ZKHll6kSbPt0A/n6G8rapr9y67mNVy	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 04:45:09.192	2026-09-25 04:45:09.278
cdb0fe3f-1e53-4b85-9175-dfb59e56c455	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790250687714@belladgroup.com	tech.floating.1790250687714	$2a$10$G8XvzkouIMAVVYVAkiToauDE8lv5GmGCNts4sdfd1X5Sog6MbiJli	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-24 11:51:27.789	2026-09-24 11:51:27.868
69303311-778f-4e50-8edf-089a31a5208b	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790310693420@belladgroup.com	tech.floating.1790310693420	$2a$10$emkFQnKOXcAJExwqtZPWz.tUYHGcIY6x5xO1/D74YC.lfl3.V1shq	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 04:31:33.498	2026-09-25 04:31:33.576
c2ea6a6b-1d36-4203-a396-d61633802998	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790312295322@belladgroup.com	tech.floating.1790312295322	$2a$10$VbSmoOGA.rOuV5VFGrF9iOkjV6ODYXYa8FdWG0NbW.CnYkBtCQn92	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 04:58:15.405	2026-09-25 04:58:15.49
9465af5c-f8e2-4651-b8e9-8147a5287578	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790250770214@belladgroup.com	tech.floating.1790250770214	$2a$10$AV3iC87Hma6WopBPcH/LGexAcfhII4XJIGwpdWJRGAAXoWoTYb4KK	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-24 11:52:50.286	2026-09-24 11:52:50.37
aa904b30-b18d-4efc-9b1b-8515d7ecf267	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790253899289@belladgroup.com	tech.floating.1790253899289	$2a$10$XOOJRLaGGn1PLs2ua9WdkudrGFTszyWquixjQmMSWqpGr3UJveO4u	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-24 12:44:59.367	2026-09-24 12:44:59.462
b07e3f44-ed75-4163-a6ed-58b72f14453d	f0ea4625-4bb3-4f0a-8a67-77b53c0afb54	\N	test.apex@apexauto.in	\N	$2a$10$P2Cc/AFF6E5yAZKCoDuiUeXrPox4hikX9PyKcqYhHrHnNiFSFWe0m	Apex	Admin	\N	\N	ACTIVE	f	2026-09-25 07:01:49.06	2026-09-24 11:50:56.596	2026-09-25 07:01:49.061
f6a424fe-eebc-44cd-bb4c-3e2588b7db15	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790311468682@belladgroup.com	tech.floating.1790311468682	$2a$10$W6OM4x7RK6YkIICVtQ5c9uqKFBTg3QYpodME33KNVAt6pdlw2J/oG	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 04:44:28.764	2026-09-25 04:44:28.84
bbe58ab0-0f79-4aff-962b-a8616a28c119	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790311539337@belladgroup.com	tech.floating.1790311539337	$2a$10$bFGsXWYOVzXuH5rfxYEfe.Aq/YpaO2.P7fNorK7lp8UynhICbGhJy	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 04:45:39.42	2026-09-25 04:45:39.497
39216e9d-fe57-4080-81e6-702db4d18721	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790319709076@belladgroup.com	tech.floating.1790319709076	$2a$10$mbU9r80dN4gI1F1oUwxZleBMrncRk0m0GRASpP315f4C9rdHo7qcW	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 07:01:49.147	2026-09-25 07:01:49.229
fe168d08-76a9-4c13-a0f7-0a2ac243af5f	883663e1-917e-4fae-8f1d-9d89e749362b	\N	tech.floating.1790319644359@belladgroup.com	tech.floating.1790319644359	$2a$10$PVIi2olrKolvPEncU57TduxTdJuVrNSpzxWVtRoMuilvGOdPkUg06	Anand	Kulkarni	+91 98450 77777	\N	SUSPENDED	f	\N	2026-09-25 07:00:44.443	2026-09-25 07:00:44.534
eaf9bc24-127f-4405-8b80-ad29b5e5058e	\N	\N	admin@ecosystem.com	platform.admin	$2a$10$4dDx84o8a6642BMjTSfCre57nDiq2EvfypvicOnT7WZb6v6vCjuJ2	Platform	SuperAdmin	\N	\N	ACTIVE	t	2026-09-25 07:01:50.076	2026-09-24 11:40:41.766	2026-09-25 07:01:50.078
84a1e6f3-f10c-411c-b6c5-95e693399416	883663e1-917e-4fae-8f1d-9d89e749362b	\N	md.bellad@belladgroup.com	agastya.bellad	$2a$10$4dDx84o8a6642BMjTSfCre57nDiq2EvfypvicOnT7WZb6v6vCjuJ2	Agastya	Bellad	\N	\N	ACTIVE	f	2026-09-25 07:01:50.185	2026-09-24 11:40:41.77	2026-09-25 07:01:50.186
169f0047-84b6-48a4-9d1c-621756017075	883663e1-917e-4fae-8f1d-9d89e749362b	\N	bm.hubli@belladgroup.com	bm.hubli	$2a$10$4dDx84o8a6642BMjTSfCre57nDiq2EvfypvicOnT7WZb6v6vCjuJ2	Rajesh	Sharma	\N	\N	ACTIVE	f	2026-09-25 07:01:50.311	2026-09-24 11:40:41.779	2026-09-25 07:01:50.312
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


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
-- Name: firm_brands firm_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firm_brands
    ADD CONSTRAINT firm_brands_pkey PRIMARY KEY (id);


--
-- Name: firms firms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firms
    ADD CONSTRAINT firms_pkey PRIMARY KEY (id);


--
-- Name: integration_events integration_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_pkey PRIMARY KEY (id);


--
-- Name: organization_memberships organization_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT organization_memberships_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tenant_applications tenant_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_applications
    ADD CONSTRAINT tenant_applications_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: user_role_assignments user_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: applications_appKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "applications_appKey_key" ON public.applications USING btree ("appKey");


--
-- Name: audit_logs_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON public.audit_logs USING btree ("tenantId", "createdAt");


--
-- Name: audit_logs_tenantId_entityType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_entityType_idx" ON public.audit_logs USING btree ("tenantId", "entityType");


--
-- Name: audit_logs_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_idx" ON public.audit_logs USING btree ("tenantId");


--
-- Name: branches_firmBrandId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branches_firmBrandId_idx" ON public.branches USING btree ("firmBrandId");


--
-- Name: branches_firmId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "branches_firmId_idx" ON public.branches USING btree ("firmId");


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
-- Name: departments_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "departments_branchId_idx" ON public.departments USING btree ("branchId");


--
-- Name: departments_tenantId_code_branchId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "departments_tenantId_code_branchId_key" ON public.departments USING btree ("tenantId", code, "branchId");


--
-- Name: departments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "departments_tenantId_idx" ON public.departments USING btree ("tenantId");


--
-- Name: firm_brands_brandId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firm_brands_brandId_idx" ON public.firm_brands USING btree ("brandId");


--
-- Name: firm_brands_firmId_brandId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "firm_brands_firmId_brandId_key" ON public.firm_brands USING btree ("firmId", "brandId");


--
-- Name: firm_brands_firmId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firm_brands_firmId_idx" ON public.firm_brands USING btree ("firmId");


--
-- Name: firm_brands_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firm_brands_tenantId_idx" ON public.firm_brands USING btree ("tenantId");


--
-- Name: firms_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "firms_tenantId_code_key" ON public.firms USING btree ("tenantId", code);


--
-- Name: firms_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firms_tenantId_idx" ON public.firms USING btree ("tenantId");


--
-- Name: integration_events_eventType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "integration_events_eventType_idx" ON public.integration_events USING btree ("eventType");


--
-- Name: integration_events_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX integration_events_status_idx ON public.integration_events USING btree (status);


--
-- Name: integration_events_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "integration_events_tenantId_idx" ON public.integration_events USING btree ("tenantId");


--
-- Name: organization_memberships_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "organization_memberships_branchId_idx" ON public.organization_memberships USING btree ("branchId");


--
-- Name: organization_memberships_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "organization_memberships_tenantId_idx" ON public.organization_memberships USING btree ("tenantId");


--
-- Name: organization_memberships_userId_branchId_departmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "organization_memberships_userId_branchId_departmentId_key" ON public.organization_memberships USING btree ("userId", "branchId", "departmentId");


--
-- Name: organization_memberships_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "organization_memberships_userId_idx" ON public.organization_memberships USING btree ("userId");


--
-- Name: permissions_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permissions_code_idx ON public.permissions USING btree (code);


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: permissions_domain_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permissions_domain_idx ON public.permissions USING btree (domain);


--
-- Name: role_permissions_permissionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "role_permissions_permissionId_idx" ON public.role_permissions USING btree ("permissionId");


--
-- Name: role_permissions_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "role_permissions_roleId_idx" ON public.role_permissions USING btree ("roleId");


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_tenantId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "roles_tenantId_code_key" ON public.roles USING btree ("tenantId", code);


--
-- Name: roles_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "roles_tenantId_idx" ON public.roles USING btree ("tenantId");


--
-- Name: tenant_applications_applicationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_applications_applicationId_idx" ON public.tenant_applications USING btree ("applicationId");


--
-- Name: tenant_applications_tenantId_applicationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tenant_applications_tenantId_applicationId_key" ON public.tenant_applications USING btree ("tenantId", "applicationId");


--
-- Name: tenant_applications_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_applications_tenantId_idx" ON public.tenant_applications USING btree ("tenantId");


--
-- Name: tenants_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_code_idx ON public.tenants USING btree (code);


--
-- Name: tenants_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_code_key ON public.tenants USING btree (code);


--
-- Name: tenants_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_status_idx ON public.tenants USING btree (status);


--
-- Name: user_role_assignments_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_role_assignments_branchId_idx" ON public.user_role_assignments USING btree ("branchId");


--
-- Name: user_role_assignments_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_role_assignments_roleId_idx" ON public.user_role_assignments USING btree ("roleId");


--
-- Name: user_role_assignments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_role_assignments_tenantId_idx" ON public.user_role_assignments USING btree ("tenantId");


--
-- Name: user_role_assignments_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_role_assignments_userId_idx" ON public.user_role_assignments USING btree ("userId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_keycloakSub_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_keycloakSub_idx" ON public.users USING btree ("keycloakSub");


--
-- Name: users_keycloakSub_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_keycloakSub_key" ON public.users USING btree ("keycloakSub");


--
-- Name: users_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_tenantId_idx" ON public.users USING btree ("tenantId");


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


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
-- Name: branches branches_firmBrandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "branches_firmBrandId_fkey" FOREIGN KEY ("firmBrandId") REFERENCES public.firm_brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branches branches_firmId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "branches_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES public.firms(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: departments departments_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firm_brands firm_brands_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firm_brands
    ADD CONSTRAINT "firm_brands_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firm_brands firm_brands_firmId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firm_brands
    ADD CONSTRAINT "firm_brands_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES public.firms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firm_brands firm_brands_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firm_brands
    ADD CONSTRAINT "firm_brands_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firms firms_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firms
    ADD CONSTRAINT "firms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: integration_events integration_events_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT "integration_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: organization_memberships organization_memberships_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT "organization_memberships_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: organization_memberships organization_memberships_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT "organization_memberships_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organization_memberships organization_memberships_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT "organization_memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: organization_memberships organization_memberships_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT "organization_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions permissions_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "permissions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenant_applications tenant_applications_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_applications
    ADD CONSTRAINT "tenant_applications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenant_applications tenant_applications_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_applications
    ADD CONSTRAINT "tenant_applications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role_assignments user_role_assignments_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_firmId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES public.firms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role_assignments user_role_assignments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role_assignments user_role_assignments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT "user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ppQgpgd4o4pwm4vjJwWew7vbzSuadJRk4YRAACHPCOt8TcNZlwaHYv2NS2X8ppj

