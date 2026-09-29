/**
 * Versioned Event Contracts & Governance Catalog
 * Standardized Event Contracts conforming to the Ecosystem Event Envelope Specification.
 */

import crypto from 'crypto';

export const EVENT_OWNERSHIP = {
  'employee.*': { owner: 'hrflow', description: 'Employee master lifecycle events' },
  'maintenance.*': { owner: 'maintly', description: 'Maintenance ticket and purchase events' },
  'inventory.*': { owner: 'inventory', description: 'Vehicle and parts inventory events' },
  'purchase.*': { owner: 'purchase', description: 'Procurement and purchase order events' },
  'vehicle.*': { owner: 'sales', description: 'Vehicle billing and invoice events' },
  'demo.*': { owner: 'demo-app', description: 'Demonstration and sample app events' },
  'workflow.*': { owner: 'ecosystem-core', description: 'Ecosystem approval workflow state events' },
  'tenant.*': { owner: 'ecosystem-core', description: 'Tenant governance and onboarding events' },
  'integration.*': { owner: 'ecosystem-core', description: 'Integration synchronization execution events' }
};

export const REGISTERED_EVENT_SCHEMAS = {
  // --- Employee Master Lifecycle Contracts (v1) ---
  'employee.created.v1': {
    version: 1,
    required: ['employeeId', 'employeeCode', 'displayName', 'employmentStatus'],
    properties: {
      employeeId: 'string',
      employeeCode: 'string',
      displayName: 'string',
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      departmentId: 'string',
      departmentName: 'string',
      designationId: 'string',
      designationName: 'string',
      employmentStatus: 'string',
      branchId: 'string'
    }
  },

  'employee.updated.v1': {
    version: 1,
    required: ['employeeId', 'employeeCode'],
    properties: {
      employeeId: 'string',
      employeeCode: 'string',
      displayName: 'string',
      departmentId: 'string',
      designationId: 'string',
      designationName: 'string',
      employmentStatus: 'string',
      phone: 'string'
    }
  },

  'employee.transferred.v1': {
    version: 1,
    required: ['employeeId', 'employeeCode', 'fromBranchId', 'toBranchId'],
    properties: {
      employeeId: 'string',
      employeeCode: 'string',
      fromBranchId: 'string',
      toBranchId: 'string',
      effectiveDate: 'string',
      departmentId: 'string'
    }
  },

  'employee.deactivated.v1': {
    version: 1,
    required: ['employeeId', 'employeeCode', 'employmentStatus'],
    properties: {
      employeeId: 'string',
      employeeCode: 'string',
      employmentStatus: 'string', // 'INACTIVE', 'TERMINATED', 'RESIGNED'
      reason: 'string',
      effectiveDate: 'string'
    }
  },

  'employee.reactivated.v1': {
    version: 1,
    required: ['employeeId', 'employeeCode', 'employmentStatus'],
    properties: {
      employeeId: 'string',
      employeeCode: 'string',
      employmentStatus: 'string', // 'ACTIVE'
      reactivatedAt: 'string'
    }
  },

  // --- Maintenance Operations Contracts (v1) ---
  'maintenance.ticket.created.v1': {
    version: 1,
    required: ['ticketId', 'ticketNumber', 'priority', 'status'],
    properties: {
      ticketId: 'string',
      ticketNumber: 'string',
      title: 'string',
      priority: 'string',
      status: 'string',
      branchId: 'string',
      assignedToEmployeeId: 'string'
    }
  },

  'maintenance.ticket.completed.v1': {
    version: 1,
    required: ['ticketId', 'ticketNumber', 'completedAt'],
    properties: {
      ticketId: 'string',
      ticketNumber: 'string',
      completedAt: 'string',
      resolvedByEmployeeId: 'string',
      totalCost: 'number'
    }
  },

  // --- Procurement & Inventory Contracts (v1) ---
  'purchase.request.created.v1': {
    version: 1,
    required: ['requestId', 'requestNumber', 'amount'],
    properties: {
      requestId: 'string',
      requestNumber: 'string',
      amount: 'number',
      requestedByEmployeeId: 'string',
      departmentId: 'string'
    }
  },

  'purchase.order.approved.v1': {
    version: 1,
    required: ['orderId', 'orderNumber', 'approvedBy'],
    properties: {
      orderId: 'string',
      orderNumber: 'string',
      amount: 'number',
      approvedBy: 'string',
      approvedAt: 'string'
    }
  },

  'inventory.stock.updated.v1': {
    version: 1,
    required: ['itemCode', 'newQuantity', 'branchId'],
    properties: {
      itemCode: 'string',
      newQuantity: 'number',
      previousQuantity: 'number',
      branchId: 'string'
    }
  },

  'vehicle.invoice.created.v1': {
    version: 1,
    required: ['invoiceId', 'invoiceNumber', 'vin', 'totalAmount'],
    properties: {
      invoiceId: 'string',
      invoiceNumber: 'string',
      vin: 'string',
      totalAmount: 'number',
      customerId: 'string',
      branchId: 'string'
    }
  },

  // --- Demo & Workflow Contracts ---
  'demo.item.created.v1': {
    version: 1,
    required: ['itemCode', 'name'],
    properties: {
      itemCode: 'string',
      name: 'string',
      category: 'string',
      quantity: 'number'
    }
  },

  // Legacy mappings for backward compatibility
  'employee.created': {
    version: 1,
    required: ['hrEmployeeId', 'employeeCode', 'firstName'],
    properties: {
      centralTenantId: 'string',
      hrEmployeeId: 'string',
      employeeCode: 'string',
      firstName: 'string',
      lastName: 'string'
    }
  },
  'employee.updated': {
    version: 1,
    required: ['hrEmployeeId'],
    properties: {
      hrEmployeeId: 'string',
      phone: 'string'
    }
  },
  'demo.item.created': {
    version: 1,
    required: ['itemCode', 'name'],
    properties: {
      itemCode: 'string',
      name: 'string'
    }
  }
};

/**
 * Creates an event envelope conforming to the Ecosystem Standard Event Specification.
 */
export function createEventEnvelope(options) {
  const {
    eventType,
    eventVersion = 1,
    sourceApp,
    tenantId,
    firmId = null,
    branchId = null,
    correlationId = crypto.randomUUID(),
    occurredAt = new Date().toISOString(),
    data = {}
  } = options;

  if (!eventType) throw new Error("'eventType' is required to create an event envelope.");
  if (!sourceApp) throw new Error("'sourceApp' is required to create an event envelope.");
  if (!tenantId) throw new Error("'tenantId' is required to create an event envelope.");

  return {
    eventId: options.eventId || crypto.randomUUID(),
    eventType,
    eventVersion,
    sourceApp,
    tenantId,
    firmId,
    branchId,
    occurredAt,
    correlationId,
    data,
    // Backward compatibility aliases for existing consumers
    centralTenantId: tenantId,
    centralBranchId: branchId,
    hrEmployeeId: data.employeeId || data.hrEmployeeId || null,
    employeeCode: data.employeeCode || null,
    firstName: data.firstName || (data.displayName ? data.displayName.split(' ')[0] : ''),
    lastName: data.lastName || (data.displayName ? data.displayName.split(' ').slice(1).join(' ') : ''),
    email: data.email || null,
    phone: data.phone || null,
    department: data.departmentName || null,
    designation: data.designationName || null,
    status: data.employmentStatus || 'ACTIVE',
    timestamp: occurredAt
  };
}

/**
 * Validates an event envelope against the standard specification.
 */
export function validateEventEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, error: 'Event envelope must be a valid object.' };
  }

  const requiredFields = ['eventId', 'eventType', 'sourceApp', 'tenantId', 'occurredAt', 'data'];
  const missing = requiredFields.filter(f => !envelope[f] && envelope[f] !== 0);

  if (missing.length > 0) {
    return { valid: false, error: `Envelope missing required fields: [${missing.join(', ')}]` };
  }

  // Validate data payload if schema is registered
  const schema = REGISTERED_EVENT_SCHEMAS[envelope.eventType];
  if (schema && schema.required) {
    const dataMissing = schema.required.filter(f => envelope.data[f] === undefined && envelope[f] === undefined);
    if (dataMissing.length > 0) {
      return { valid: false, error: `Payload missing schema required fields: [${dataMissing.join(', ')}] for '${envelope.eventType}'` };
    }
  }

  return { valid: true };
}

/**
 * Validates backward compatibility between two event schema versions.
 */
export function checkBackwardCompatibility(olderSchema, newerSchema) {
  const violations = [];
  const oldRequired = olderSchema.required || [];
  const newRequired = newerSchema.required || [];

  for (const reqField of oldRequired) {
    if (!newerSchema.properties || newerSchema.properties[reqField] === undefined) {
      violations.push(`Breaking change: Previously existing field '${reqField}' was removed.`);
    }
  }

  if (olderSchema.properties && newerSchema.properties) {
    for (const [propName, propType] of Object.entries(olderSchema.properties)) {
      if (newerSchema.properties[propName] && newerSchema.properties[propName] !== propType) {
        violations.push(`Breaking change: Field '${propName}' type changed from '${propType}' to '${newerSchema.properties[propName]}'.`);
      }
    }
  }

  return {
    isCompatible: violations.length === 0,
    violations
  };
}

/**
 * Validates an event payload against its registered schema.
 */
export function validateEventPayload(eventType, version, payload) {
  const schema = REGISTERED_EVENT_SCHEMAS[eventType];
  if (!schema) {
    return { valid: true, warning: `No registered schema found for event '${eventType}'.` };
  }

  const missing = [];
  for (const reqField of schema.required) {
    const hasField = payload[reqField] !== undefined || (payload.data && payload.data[reqField] !== undefined);
    if (!hasField) {
      missing.push(reqField);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required event fields: [${missing.join(', ')}] for schema '${eventType}'`
    };
  }

  return { valid: true };
}
