# MAINTLY Database Schema Documentation (PostgreSQL 18)

## Overview
MAINTLY utilizes **PostgreSQL 18** managed through **Prisma ORM**. The database runs locally on port 5433 with database name `maintly_db`.

## Core Entities & Relationships

### 1. Tenancy & Organization
- `tenants`: Primary tenant account record (`id`, `name`, `slug`, `code`, `status`, `createdAt`, `updatedAt`).
- `brands`: Subsidiary brands under a tenant (`id`, `tenantId`, `name`, `code`, `description`). Unique constraint: `[tenantId, code]`.
- `branches`: Physical locations/showrooms/workshops (`id`, `tenantId`, `brandId`, `name`, `code`, `city`, `state`, `pincode`). Unique constraint: `[tenantId, code]`.
- `departments`: Functional divisions (`id`, `tenantId`, `name`, `code`). Unique constraint: `[tenantId, code]`.
- `users`: User identity (`id`, `tenantId`, `email`, `passwordHash`, `firstName`, `lastName`, `role`, `status`).
- `user_branch_accesses`: Many-to-many user-branch permission table (`id`, `userId`, `branchId`, `isPrimary`).

### 2. Master Data
- `maintenance_types`: Configurable categories (`id`, `tenantId`, `name`, `code`, `icon`, `color`, `sortOrder`, `isActive`).
  Initial 12 categories: Carpentry, Civil, Electrical, IT, New Construction, Other, Plumbing, Printing, Purchase, Quote Required, Real Estate, Vendor Payment.
- `vendors`: External repair contractors and suppliers (`id`, `tenantId`, `name`, `contactPerson`, `phone`, `email`, `address`, `gstin`, `category`, `isActive`).

### 3. Maintenance Requests Core
- `maintenance_requests`:
  - `id`: UUID primary key
  - `requestNumber`: Format `REQ-YYYY-XXXX` (Tenant unique composite: `[tenantId, requestNumber]`)
  - `tenantId`, `brandId`, `branchId`, `departmentId`, `maintenanceTypeId`
  - `requesterId`, `assignedToId`, `assignedById`, `approvedById`, `rejectedById`, `dissatisfiedById`
  - `priority`: Enum `HIGH`, `MEDIUM`, `LOW`
  - `approvalStatus`: Enum `PENDING`, `APPROVED`, `REJECTED`, `NOT_REQUIRED`
  - `workStatus`: Enum `DRAFT`, `SUBMITTED`, `PENDING_APPROVAL`, `APPROVED`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_PURCHASE`, `WAITING_FOR_VENDOR`, `COMPLETED`, `CLOSED`, `REJECTED`, `REOPENED`
  - `location`, `subject`, `description`
  - `requiredDate`: Target SLA completion date
  - `startedAt`, `completedAt`, `closedAt`, `rejectedAt`, `dissatisfiedAt`
  - `estimatedCost`, `actualCost`
  - `isDissatisfied`, `dissatisfactionReason`, `completionRemarks`, `rejectionReason`

### 4. Supporting & Historical Sub-tables
- `maintenance_request_assignments`: Historical assignment records (`id`, `tenantId`, `requestId`, `assignedToId`, `assignedById`, `notes`, `active`).
- `maintenance_request_status_histories`: Immutable state transition log (`id`, `tenantId`, `requestId`, `fromStatus`, `toStatus`, `changedById`, `remarks`).
- `maintenance_request_comments`: Internal and requester collaboration notes (`id`, `tenantId`, `requestId`, `userId`, `comment`, `isInternal`).
- `maintenance_request_materials`: Consumed parts and labor (`id`, `tenantId`, `requestId`, `materialName`, `quantity`, `unit`, `unitCost`, `totalCost`, `addedById`).
- `maintenance_request_attachments`: Uploaded photos and docs (`id`, `tenantId`, `requestId`, `originalFilename`, `storedFilename`, `fileUrl`, `mimeType`, `fileSize`, `attachmentType`).

### 5. Procurement
- `purchase_requests`: Linked requisitions (`id`, `tenantId`, `maintenanceRequestId`, `prNumber`, `status`, `vendorId`, `estimatedTotal`, `actualTotal`, `poReference`).
- `purchase_items`: Line items requisitioned (`id`, `purchaseRequestId`, `itemName`, `quantity`, `unit`, `estimatedPrice`, `quotedPrice`, `actualPrice`).
- `quotations`: Supplier quotes (`id`, `tenantId`, `purchaseRequestId`, `vendorId`, `quoteNumber`, `amount`, `status`).

### 6. Governance
- `notifications`: In-app alert queue (`id`, `tenantId`, `userId`, `title`, `message`, `type`, `isRead`).
- `audit_logs`: Immutable security audit log (`id`, `tenantId`, `userId`, `action`, `entity`, `entityId`, `details`, `ipAddress`, `userAgent`).

## Database Indexes
- `tenantId` indexed on all tenant-owned tables for fast isolated partitioning.
- `branchId`, `workStatus`, `priority`, `requiredDate`, `createdAt`, `assignedToId` indexed on `maintenance_requests` for sub-millisecond dashboard and filter performance.
