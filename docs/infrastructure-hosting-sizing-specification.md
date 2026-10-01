# Enterprise Infrastructure Sizing & Hosting Specification Document
**Automobile Dealership Enterprise Ecosystem Platform**
*(Current Core + Scalable Provisioning for 10+ Domain Applications)*

---

## Executive Summary & Purpose

This technical specification provides the complete infrastructure requirements, hardware sizing, network architecture, database provisioning, and hosting recommendations for the **Automobile Dealership Software Ecosystem**. 

It outlines the baseline requirements for current operations (Ecosystem Core, HRFlow, Maintly) as well as the linear capacity scaling model required to host **10 additional enterprise automotive applications** (e.g., CRM, Billing, Spares, Workshop, PDI, Insurance) on the same unified multi-tenant platform.

---

## 1. Application Overview

### 1.1 Application Scope & Target Users
* **What the Platform Does**: A unified, multi-tenant digital dealership operating system tailored for large automotive groups and multi-franchise conglomerates. It consolidates organizational governance, Single Sign-On (SSO), Scoped Role-Based Access Control (RBAC), and transactional domain workflows across all dealership functions.
* **Domain Applications**:
  * **Current Active**:
    1. *Ecosystem Core & Admin Portal*: Group governance, tenant/firm/branch hierarchy, user directory, app registry, integration sync monitor.
    2. *HRFlow*: Employee master, digital onboarding, Indian attendance & biometric integration, statutory payroll (PF, ESI, TDS), exit clearance workflows.
    3. *Maintly*: Workshop/facility maintenance, breakdown ticketing, asset register, preventive maintenance schedules, SLA breach engine, vendor purchase advice.
  * **Planned 10 Applications** (incorporating into the same mesh):
    4. *Enquiry CRM & Lead Pipeline*: Test drive scheduling, lead tracking, OEM integration.
    5. *Vehicle Quotation & Billing*: Proforma invoicing, GST calculation, RTO/registration tracking.
    6. *Spare Parts & Inventory*: Counter sales, workshop requisitions, stock replenishment.
    7. *Job Card & Bodyshop Management*: Bay allocation, service advisor tracking, insurance estimates.
    8. *Stockyard & Vehicle PDI*: Chassis tracking, transit damage logging, gate passes.
    9. *Insurance & Warranty*: Policy renewals, claims processing, extended warranty desk.
    10. *Finance & Loan Desk*: Bank payout tracking, hire-purchase processing.
    11. *Customer Loyalty & Service Booking*: Appointment scheduling, service history.
    12. *Used Car Valuation & Exchange*: Vehicle inspection, refurbished inventory.
    13. *Accounts, Vendor Payouts & Taxation*: Reconciliation, e-invoicing, vendor advice settlement.
* **Target Users**:
  * **Internal Staff (90%)**: Showroom executives, service advisors, mechanics, parts managers, accounts, HR, general managers, CXOs.
  * **External Vendors / Contractors (7%)**: Facility repairers, OEM auditors, third-party stock assessors.
  * **Customer Touchpoints (3%)**: Web portal for job status, quotation acceptance, and appointments.

### 1.2 User Projections (Current Launch vs. 06–12 Month Scale)

| Metric | Launch Stage (3 Apps) | 06–12 Month Stage (All 13 Apps) |
|---|---|---|
| **Dealership Groups (Tenants)** | 2 – 5 Conglomerates | 15 – 30 Conglomerates |
| **Physical Branches / Outlets** | 15 – 30 Showrooms / Workshops | 150 – 300 Physical Facilities |
| **Total Registered User Accounts** | 1,500 – 2,500 Users | 10,000 – 15,000 Users |
| **Concurrent Active Users (Peak)** | **300 – 500 Concurrent Users** | **2,000 – 3,500 Concurrent Users** |

### 1.3 Expected Peak Load & Traffic Patterns
* **Launch Stage**:
  * **Average Throughput**: 30 – 50 requests/second (RPS).
  * **Peak Throughput**: 120 – 180 RPS.
  * **Daily Transactions**: ~250,000 – 400,000 HTTP requests / event dispatches per day.
* **10-App Scale (13 Total Apps)**:
  * **Average Throughput**: 350 – 550 RPS.
  * **Peak Throughput**: 1,200 – 2,000 RPS.
  * **Daily Transactions**: 3,500,000 – 5,500,000 transactions/day.
* **Traffic Peak Windows**:
  * **Morning Influx (09:00 AM – 11:30 AM)**: Biometric attendance punch-ins, workshop vehicle intake, parts counter openings.
  * **Evening Rush (05:00 PM – 07:30 PM)**: Vehicle deliveries, job card bill closures, attendance punch-outs, daily cash reconciliation.
  * **Month-End Spikes**: 28th to 5th of each month (payroll runs, sales target incentive calculations, vehicle delivery quota sprints).

### 1.4 Architecture Pattern
* **Containerized Microservices & Event-Driven Topology**:
  * **Frontend**: Decentralized React Single Page Applications (SPAs) unified under a shared Nginx Ingress Reverse Proxy and central Keycloak SSO authentication realm.
  * **Backend**: Node.js/Express domain microservices. Each application maintains its own domain models and database schemas to ensure loose coupling.
  * **Asynchronous Event Mesh**: AMQP RabbitMQ 3.13 cluster with durable Topic Exchanges and Dead-Letter Exchanges (DLX) for cross-service eventual consistency (e.g. employee onboarding in HRFlow dynamically provisions users and branch access in Maintly, CRM, and Billing).
  * **Platform Extensibility**: Applications register via metadata manifests (`manifest.json`) without recompiling the core portal.

### 1.5 System Tiers & Involved Components
1. **Edge / Ingress Tier**: Nginx Reverse Proxy with TLS 1.3 termination, rate limiting, and gzip compression.
2. **Identity & Auth Tier**: Keycloak 24+ (Quarkus) OIDC Server with RS256 token signing and PKCE.
3. **Application Presentation Tier**: React 18 SPAs compiled to static assets.
4. **API & Service Tier**: Node.js microservices exposing RESTful APIs with correlation tracking.
5. **Event & Message Streaming Tier**: RabbitMQ message broker with persistence.
6. **In-Memory Cache & Job Queue Tier**: Redis 7 cluster for fast session lookup, idempotency keys, and BullMQ task queues.
7. **Persistence Tier**: High-Availability PostgreSQL 18 cluster with dedicated databases per service domain.

---

## 2. Technology Stack

| Tier | Technology / Framework | Version | Purpose |
|---|---|---|---|
| **Backend Runtime** | Node.js (Active LTS) | `v20.x / v22.x LTS` | Event-driven non-blocking I/O API layer |
| **API Framework** | Express.js | `4.19+` | REST API routing and middleware pipelines |
| **ORM / Data Access** | Prisma ORM | `5.19+` | Type-safe migrations, queries, and connection management |
| **Frontend Framework** | React 18 + Vite | `18.3+` | Single Page Applications with fast client-side rendering |
| **Styling & UI Engine** | TailwindCSS + Lucide Icons | `3.4+` | Responsive automotive administrative interfaces |
| **Identity Provider (IdP)** | Keycloak (Quarkus) | `24.0.5+` | Enterprise OIDC, OAuth 2.0, SSO, and token issuance |
| **Ingress Web Server** | Nginx Alpine | `1.25+ / mainline` | SSL termination, path-based routing, HTTP/2 proxying |
| **Message Broker** | RabbitMQ (Erlang) | `3.13-management` | Durable AMQP event bus with DLX support |
| **Cache & Queue** | Redis | `7.2-alpine` | Key-value caching, rate limits, BullMQ asynchronous workers |
| **Database Engine** | PostgreSQL | `18-alpine / 16+` | ACID relational databases with JSONB, RLS, and B-Tree indexes |
| **Containerization** | Docker Engine & Docker Compose | `26.0+ / Compose v2` | Containerized packaging and multi-container orchestration |
| **Container Orchestration (Prod)**| Kubernetes / Managed K8s (EKS / AKS / RKE2) | `1.29+` | Multi-node high availability, auto-scaling, and rolling updates |

---

## 3. Operating System & Licensing

### 3.1 Preferred Operating System
* **Primary Recommendation**: **Ubuntu Server 24.04 LTS (Noble Numbat)** or **Ubuntu 22.04 LTS (x86_64 / amd64)**.
* **Alternative Enterprise Option**: **Red Hat Enterprise Linux (RHEL) 9.3+** or **Rocky Linux 9.3+**.
* **Kernel Specifications**: Linux Kernel 6.5+ with standard cgroup v2 support for Docker/K8s container resource enforcement.

### 3.2 Licensing Requirements
* **Application & Platform Stack**: **100% Open Source / Permissive Licenses** (MIT, Apache 2.0, PostgreSQL License, MPL 2.0).
  * **Zero runtime software license fees** required for the application stack.
* **Host OS & Enterprise Support**:
  * If **Ubuntu 24.04 LTS**: Free standard community updates. Optional Canonical Ubuntu Pro for 10-year enterprise SLA.
  * If **RHEL 9**: The hosting provider or client provides Red Hat Enterprise Linux Server subscription.
* **SSL/TLS Certificates**: Automated Let's Encrypt Wildcard Certificates via certbot/ACME (zero cost), or corporate enterprise Sectigo/DigiCert SAN Wildcard SSL provided by customer.

---

## 4. Compute Sizing (vCPU & RAM)

### 4.1 Granular Component Resource Allocation

#### Baseline Launch (Current 3 Services + Core Infra)
| Component | Instances / Pods | vCPU (Per Node) | RAM (Per Node) | Total vCPU | Total RAM |
|---|---|---|---|---|---|
| **Nginx Ingress / Gateway** | 2 (Active/Passive HA) | 2 vCPU | 2 GB | 4 vCPU | 4 GB |
| **Keycloak IdP (Quarkus JVM)** | 2 (Clustered HA) | 2 vCPU | 4 GB | 4 vCPU | 8 GB |
| **Ecosystem Core API** | 2 | 1 vCPU | 2 GB | 2 vCPU | 4 GB |
| **HRFlow Backend API** | 2 | 1 vCPU | 2 GB | 2 vCPU | 4 GB |
| **Maintly Backend API** | 2 | 1 vCPU | 2 GB | 2 vCPU | 4 GB |
| **Static Frontends (Portal, HR, Maintly)** | Consolidated Nginx | Shared | Shared | 1 vCPU | 1 GB |
| **RabbitMQ Event Broker** | 2 (Quorum / Clustered) | 2 vCPU | 4 GB | 4 vCPU | 8 GB |
| **Redis Cache / Worker** | 2 (Primary + Sentinel) | 1 vCPU | 2 GB | 2 vCPU | 4 GB |
| **PostgreSQL 18 (Dedicated)** | 2 (Primary + Replica) | 4 vCPU | 16 GB | 8 vCPU | 32 GB |
| **OS & Monitoring Overhead** | - | 2 vCPU | 4 GB | 2 vCPU | 4 GB |
| **Launch Total Required** | - | - | - | **31 vCPU** | **73 GB RAM** |

---

#### Full 13-App Enterprise Scale (Current + 10 Additional Apps)
*Adding 10 domain applications (CRM, Billing, Spares, Bodyshop, PDI, Insurance, Finance, Loyalty, Valuation, Accounts).*
*Each domain app backend runs 2 container instances for HA (0.75 vCPU, 1.5 GB RAM footprint).*

| Tier / Workload | Container Replicas | Aggregate vCPU | Aggregate RAM |
|---|---|---|---|
| **Edge Gateway / Ingress (Nginx)** | 4 | 8 vCPU | 8 GB |
| **Keycloak 24+ Cluster** | 3 | 6 vCPU | 16 GB |
| **Ecosystem Core Services** | 4 | 4 vCPU | 8 GB |
| **12 Domain APIs (2 replicas × 12 apps)** | 24 | 24 vCPU | 48 GB |
| **Static Frontend Pods (13 SPAs)** | Consolidated / CDN | 2 vCPU | 4 GB |
| **RabbitMQ 3.13 Message Cluster** | 3 (Mirroring) | 6 vCPU | 16 GB |
| **Redis 7 Cluster** | 3 (Sentinel / Sharded)| 4 vCPU | 8 GB |
| **Database: PostgreSQL 18 Primary** | 1 (Dedicated Node) | 8 – 16 vCPU | 32 – 64 GB |
| **Database: PostgreSQL 18 Standby** | 1 (Dedicated Node) | 8 – 16 vCPU | 32 – 64 GB |
| **Monitoring (Prometheus/Grafana/Loki)**| 1 | 4 vCPU | 8 GB |
| **Total Production Sizing (13 Apps)** | **~50 Containers** | **74 – 90 vCPU** | **184 – 248 GB RAM** |

### 4.2 GPU Requirements
* **Current & 10-App Baseline**: **Zero (0) GPU required**. All computational logic comprises standard I/O, relational indexing, REST processing, and AMQP event dispatching.
* *Optional Future Consideration*: If client deploys optical character recognition (OCR for vehicle RC books/driving licenses) or on-premise AI inspection vision models, a single NVIDIA T4/A10G (16–24 GB VRAM) node can be attached separately.

### 4.3 Environments Required
Three distinct environments must be provisioned:

```
[ Developer Local Workstations ]
               │
               ▼
[ DEV / STAGING Environment ] (1 VM: 8 vCPU, 32 GB RAM, 250 GB SSD)
  • Single-instance Docker Compose stack
  • Sanitized demo data for integration testing and new app onboarding
               │
               ▼
[ UAT / PRE-PRODUCTION ] (Optional for Large Dealership QA: 16 vCPU, 64 GB RAM)
  • Exact mirror of production topology for release sign-off
               │
               ▼
[ PRODUCTION ENVIRONMENT ] (High-Availability Multi-Node Cluster)
  • Clustered Application Nodes + Clustered Database Nodes + Backup Storage
```

---

## 5. Storage Sizing & File Storage

### 5.1 Storage Breakdown

| Workload | Storage Type | Launch Volume (3 Apps) | 12–24 Month Volume (13 Apps) | Performance Requirement |
|---|---|---|---|---|
| **OS, Logs & Container Images** | NVMe / SSD | 100 GB | 300 GB | Standard I/O (3,000 IOPS) |
| **PostgreSQL Relational Data** | NVMe (RAID 10) | 100 GB | 1,000 GB (1 TB) | High IOPS (10,000+ IOPS) |
| **RabbitMQ Message Logs** | SSD | 30 GB | 100 GB | Sequential write speed |
| **Redis In-Memory Persistence** | SSD | 20 GB | 50 GB | Fast dump/AOF writing |
| **Document & Media Object Storage**| S3-Compatible / MinIO | 250 GB | 3,000 – 5,000 GB (3–5 TB) | High capacity, durable storage |

### 5.2 File Uploads & Unstructured Data Profiles
* **HRFlow**: Employee identity documents (Aadhaar, PAN, driving licenses, resumes, signed contracts, salary slips).
* **Maintly**: Facility asset images, equipment manuals, equipment breakdown photos, invoice receipts, vendor quotes.
* **Upcoming 10 Apps**:
  * *CRM & Billing*: Customer KYC, vehicle delivery sign-off photos, insurance cover notes.
  * *Job Card & Bodyshop*: High-resolution accident damage photos (5–10 photos per repair order), job card scanned physical signatures.
  * *Used Car*: 360-degree vehicle inspection photographs.
* **Storage Protocol Recommended**:
  * **MinIO High-Performance Object Storage** (Self-hosted S3-compatible) or **AWS S3 / Azure Blob Storage**.
  * File uploads bypass the Node.js API servers via Presigned Upload URLs, directly landing in encrypted object buckets, preventing server memory saturation.

---

## 6. Databases Architecture & Backup Strategy

### 6.1 Database Engine & Topology
* **Database Engine**: **PostgreSQL 18** (or PostgreSQL 16 LTS).
* **Database Isolation Model (Database-per-Domain)**:
  To prevent cascading failures and guarantee autonomous service independence, each application utilizes its own database within the high-availability PostgreSQL cluster:
  * `ecosystem_core_db` (Tenants, Firms, Brands, Branches, Roles, Permissions, Registry, Outbox)
  * `keycloak_db` (User credentials, OIDC sessions, client keys)
  * `hrflow_db` (Employees, Attendance, Leaves, Payroll, Deductions)
  * `maintly_db` (Tickets, SLA rules, Asset registry, Work orders, Maintenance schedules)
  * *`crm_db`, `billing_db`, `inventory_db`, `bodyshop_db`, etc.* (Each new domain app receives its own autonomous database).
* **Connection Pooling**: **PgBouncer** connection pooler deployed in transaction pooling mode. Allows handling 5,000+ client connections while capping PostgreSQL server connections to 200–400 active workers.

### 6.2 High Availability (HA) Configuration
* **Primary-Standby Streaming Replication**:
  * **Node 1 (Primary)**: Active read/write database.
  * **Node 2 (Synchronous / Near-Synchronous Standby)**: Hot replica in a separate physical availability zone / rack.
  * **Automated Failover**: Managed via **Patroni + etcd** or cloud-native HA (AWS Aurora / RDS Multi-AZ / Azure Flexible HA) ensuring Zero Data Loss (RPO = 0, RTO < 30 seconds).

### 6.3 Backup Frequency & Retention Policy
1. **Continuous Write-Ahead Log (WAL) Archiving**:
   * WAL files streamed every 60 seconds to isolated remote S3/MinIO bucket.
   * Enables **Point-In-Time Recovery (PITR)** to any second within the past 14 days.
2. **Automated Daily Snapshots**:
   * Full database snapshot taken every night at 02:30 AM (non-peak window).
   * Retained for **30 days**.
3. **Weekly & Monthly Archives**:
   * Weekly snapshots retained for 12 weeks.
   * Monthly financial-year end snapshots retained for **7 years** (mandatory for Indian automotive tax and corporate audit compliance).
4. **Disaster Recovery (Offsite)**:
   * Encrypted backups automatically replicated to a secondary geographic region / remote data center.

---

## 7. Network, Connectivity & Security

### 7.1 Internet Bandwidth & Peak Traffic
* **Launch (3 Apps)**: 50 Mbps committed burstable to 100 Mbps uplink/downlink.
* **10-App Enterprise Scale**: **200 Mbps committed bandwidth burstable to 500 Mbps / 1 Gbps**.
* Monthly outbound egress estimated: 1.5 TB (launch) to 8 TB (full 13-app scale with heavy photo uploads).

### 7.2 Public IP, Domains & Certificates
* **Public IPv4 Addresses**: Minimum **2 Elastic Public IPs** (for redundant Ingress Load Balancers / WAN failover).
* **DNS & Domains**:
  * Unified Top-Level Domain (e.g. `dealershipecosystem.in` or client internal domain).
  * Subdomain / Routing Pattern:
    * `portal.dealershipecosystem.in` (Central Portal & Admin)
    * `auth.dealershipecosystem.in` (Keycloak SSO & OpenID Connect)
    * `api.dealershipecosystem.in` (Ingress API Gateway)
    * `assets.dealershipecosystem.in` (Object storage / CDN)
    * Or path-based via unified ingress: `dealershipecosystem.in/hr/`, `dealershipecosystem.in/maintly/`, etc.
* **SSL/TLS Certificates**: 1 Wildcard Certificate (`*.dealershipecosystem.in`) with TLS 1.3 encryption and HSTS headers.

### 7.3 Connectivity to Dealership Branches & Corporate Offices
* **Branch Showrooms & Remote Workshops**:
  * Access is secured over public HTTPS (port 443) with Keycloak OIDC authentication and Web Application Firewall (WAF) filtering.
* **Internal ERP / DMS Interconnect (Optional / Recommended for Enterprise)**:
  * **IPsec Site-to-Site VPN** or **Leased Line (MPLS)** between the cloud hosting infrastructure and the dealership group's central headquarters for legacy SAP/DMS sync.
* **Biometric Device Connectivity**:
  * Biometric attendance machines in physical branches communicate with the cloud via outbound HTTPS/MQTT webhooks or a dedicated WireGuard/IPsec branch gateway.

### 7.4 Load Balancer, Firewall & WAF Requirements
* **External Load Balancer**: Layer 7 Application Load Balancer (ALB) or HAProxy with health checks (`/health` probes on all services).
* **Web Application Firewall (WAF)**:
  * OWASP Top 10 mitigation rules (SQL injection, XSS, CSRF protection).
  * Bot control and geo-fencing (restricted to India / dealership operating regions).
  * Rate limiting: 30 requests/second per IP burstable to 50 requests/second on public authentication endpoints.
* **Network Segmentation & Security Groups**:
  * **Public DMZ (Port 443, 80)**: Only Load Balancers and Nginx Ingress exposed.
  * **Private App Subnet**: Node.js APIs, Keycloak, RabbitMQ, Redis (zero direct public internet access).
  * **Isolated Database Subnet**: PostgreSQL nodes accessible exclusively by application subnets on port 5432.

---

## 8. Physical / Virtual Machine Bill of Materials (Hosting Options)

To host the entire platform smoothly, choose **Option A (Cloud IaaS)** or **Option B (Dedicated On-Premise/Bare-Metal Virtualization)**:

### Option A: Cloud IaaS (AWS / Azure / GCP)

| Tier | Recommended Instance Type (AWS Reference) | Specification | Quantity |
|---|---|---|---|
| **Ingress & In-Memory Cache** | `t4g.xlarge` / `c6g.xlarge` | 4 vCPU, 8 GB RAM | 2 Nodes |
| **Application Cluster Nodes (Kubernetes/Docker)** | `m6g.2xlarge` or `t4g.2xlarge` | 8 vCPU, 32 GB RAM | 4 Nodes |
| **Primary Database (RDS Postgres / Aurora)** | `db.m6g.2xlarge` (Multi-AZ) | 8 vCPU, 32 GB RAM, 1TB NVMe | 1 Multi-AZ Pair |
| **RabbitMQ & Keycloak Cluster** | `m6g.xlarge` | 4 vCPU, 16 GB RAM | 2 Nodes |
| **Object Storage** | AWS S3 / Azure Blob | S3 Standard (Tiered) | 3 – 5 TB |

---

### Option B: Dedicated Bare-Metal / Colocation Data Center (Proxmox / VMware ESXi)

For dealership groups hosting on private servers or data centers:
* **Server 1 (App Node 01)**: 32 Cores (e.g. AMD EPYC 7502P / Intel Xeon Silver), 128 GB RAM, 2x 1TB NVMe (RAID 1).
* **Server 2 (App Node 02 & HA Standby)**: 32 Cores, 128 GB RAM, 2x 1TB NVMe (RAID 1).
* **Server 3 (Database & Storage Master)**: 16 Cores, 64 GB RAM, 4x 2TB Enterprise NVMe (RAID 10) + 12TB SATA HDD for archival backups and MinIO.

---

## 9. Comprehensive System Architecture Diagram

```
                                      PUBLIC INTERNET / DEALERSHIP BRANCHES
                                                       │
                                                       ▼ [HTTPS :443]
                                     ┌───────────────────────────────────┐
                                     │   CLOUD WAF & LAYER 7 BALANCER    │
                                     │   (TLS 1.3 Termination, DDoS)     │
                                     └─────────────────┬─────────────────┘
                                                       │
                                                       ▼
                                     ┌───────────────────────────────────┐
                                     │     UNIFIED NGINX REVERSE PROXY   │
                                     │        (Port 80/443 Internal)     │
                                     └─────┬───────────────────────┬─────┘
                                           │                       │
                        ┌──────────────────┴──────────┐            │
                        ▼                             ▼            ▼
             ┌─────────────────────┐       ┌──────────────────────────────┐
             │ STATIC SPAS (HTML5) │       │   KEYCLOAK 24+ OIDC CLUSTER  │
             │ • Ecosystem Portal  │       │   • Central Identity / SSO   │
             │ • HRFlow Web        │       │   • JWT RS256 Token Issuer   │
             │ • Maintly Web       │       │   • Scoped Org Claims        │
             │ • 10 Domain Apps    │       └──────────────┬───────────────┘
             └─────────────────────┘                      │
                                                          │ [Token Verification]
 ─────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────
 PRIVATE APPLICATION NETWORK                              ▼
             ┌─────────────────────────────────────────────────────────────┐
             │                  MICROSERVICES API LAYER                    │
             │                                                             │
             │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
             │  │  ECOSYSTEM CORE  │  │   HRFLOW API     │  │  MAINTLY  │  │
             │  │   (Port 4000)    │  │   (Port 5001)    │  │(Port 5002)│  │
             │  └────────┬─────────┘  └────────┬─────────┘  └─────┬─────┘  │
             │           │                     │                  │        │
             │  ┌────────┴─────────┐  ┌────────┴─────────┐  ┌─────┴─────┐  │
             │  │ CRM & LEADS API  │  │ VEHICLE BILLING  │  │  SPARES   │  │
             │  │   (Port 5003)    │  │   (Port 5004)    │  │(Port 5005)│  │
             │  └────────┬─────────┘  └────────┬─────────┘  └─────┬─────┘  │
             │           │                     │                  │        │
             │  ┌────────┴─────────┐  ┌────────┴─────────┐  ┌─────┴─────┐  │
             │  │ BODYSHOP / JOBS  │  │ PDI & STOCKYARD  │  │  OTHER 4  │  │
             │  │   (Port 5006)    │  │   (Port 5007)    │  │(Port 5008+)│ │
             │  └────────┬─────────┘  └────────┬─────────┘  └─────┬─────┘  │
             └───────────┼─────────────────────┼──────────────────┼────────┘
                         │                     │                  │
         ┌───────────────┴─────────────────────┴──────────────────┴────────────────┐
         ▼                                                                         ▼
┌─────────────────────────────────┐                               ┌─────────────────────────────────┐
│     RABBITMQ 3.13 EVENT MESH    │                               │     REDIS 7 IN-MEMORY CLUSTER   │
│  • Durable Topic Exchanges      │                               │  • Session Cache                │
│  • Dead-Letter Exchanges (DLX)  │                               │  • Token Revocation Lists       │
│  • Cross-App Event Sync         │                               │  • BullMQ Task Queues           │
└─────────────────────────────────┘                               └─────────────────────────────────┘
 ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 ISOLATED DATA PERSISTENCE LAYER
                                 ┌───────────────────────────────────┐
                                 │     PGBOUNCER CONNECTION POOLER   │
                                 └─────────────────┬─────────────────┘
                                                   │
                                                   ▼
                                 ┌───────────────────────────────────┐
                                 │    POSTGRESQL 18 HIGH-AVAILABILITY│
                                 │    (Patroni / Multi-AZ Streaming) │
                                 ├───────────────────────────────────┤
                                 │ • ecosystem_core_db               │
                                 │ • keycloak_db                     │
                                 │ • hrflow_db                       │
                                 │ • maintly_db                      │
                                 │ • crm_db, billing_db, spares_db...│
                                 └─────────────────┬─────────────────┘
                                                   │
                                                   ▼ [Continuous WAL & Snapshots]
                                 ┌───────────────────────────────────┐
                                 │    S3 / MINIO OBJECT STORAGE      │
                                 │  • Document & Media Files         │
                                 │  • Automated PITR Backups         │
                                 └───────────────────────────────────┘
```

---

## 10. Checklist for Infrastructure Team / Hosting Vendor Handover

1. [ ] **Provision Base Virtual Machines / Cloud VPC** with private and public subnets in the designated region.
2. [ ] **Set up Public Ingress**: Provision 2 Public IPs, DNS A-Records, and assign Wildcard SSL certificate.
3. [ ] **Deploy Core Services**:
   - PostgreSQL 18 Primary + Standby with automated daily snapshot policies.
   - Redis 7 instance with persistence enabled (`appendonly yes`).
   - RabbitMQ 3.13 instance with management plugin (`15672`) and disk alarm thresholds.
   - Keycloak 24+ configured with PostgreSQL `keycloak_db` and imported realm.
4. [ ] **Configure Storage**: Provision S3 bucket or MinIO cluster with 1TB initial SSD storage and presigned URL access.
5. [ ] **CI/CD Deployment Pipelines**: Configure Docker container registry (ECR / ACR / Harbor) and GitHub Actions deploy runners.
6. [ ] **Monitoring & Alerting**: Deploy Prometheus, Grafana, and Node Exporter with alerts for CPU > 80%, RAM > 85%, and Disk Free < 20%.
