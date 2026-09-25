/**
 * Versioned Event Contracts & Governance Catalog
 */

export const EVENT_OWNERSHIP = {
  'employee.*': { owner: 'hrflow', description: 'Employee master lifecycle events' },
  'maintenance.*': { owner: 'maintly', description: 'Maintenance ticket and purchase events' },
  'demo.*': { owner: 'demo-app', description: 'Demonstration and sample app events' },
  'workflow.*': { owner: 'ecosystem-core', description: 'Ecosystem approval workflow state events' },
  'tenant.*': { owner: 'ecosystem-core', description: 'Tenant governance and onboarding events' },
  'integration.*': { owner: 'ecosystem-core', description: 'Integration synchronization execution events' }
};

export const REGISTERED_EVENT_SCHEMAS = {
  'employee.created': {
    '1.0.0': {
      required: ['eventId', 'version', 'eventType', 'centralTenantId', 'hrEmployeeId', 'employeeCode', 'firstName', 'lastName'],
      properties: {
        centralTenantId: 'string',
        hrEmployeeId: 'string',
        employeeCode: 'string',
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        designation: 'string',
        centralBranchId: 'string'
      }
    }
  },

  'employee.updated': {
    '1.0.0': {
      required: ['eventId', 'version', 'eventType', 'centralTenantId', 'hrEmployeeId'],
      properties: {
        centralTenantId: 'string',
        hrEmployeeId: 'string',
        phone: 'string',
        designation: 'string'
      }
    }
  },

  'demo.item.created': {
    '1.0.0': {
      required: ['eventId', 'version', 'eventType', 'centralTenantId', 'itemCode', 'name'],
      properties: {
        centralTenantId: 'string',
        itemCode: 'string',
        name: 'string',
        category: 'string',
        quantity: 'number'
      }
    }
  },

  'workflow.instance.approved': {
    '1.0.0': {
      required: ['eventId', 'version', 'eventType', 'instanceId', 'workflowCode', 'centralTenantId'],
      properties: {
        instanceId: 'string',
        workflowCode: 'string',
        centralTenantId: 'string'
      }
    }
  }
};

/**
 * Validates backward compatibility between two event schema versions.
 * New version must NOT remove required fields from the older version.
 */
export function checkBackwardCompatibility(olderSchema, newerSchema) {
  const violations = [];

  // Check required fields
  const oldRequired = olderSchema.required || [];
  const newRequired = newerSchema.required || [];

  for (const reqField of oldRequired) {
    if (!newerSchema.properties || newerSchema.properties[reqField] === undefined) {
      violations.push(`Breaking change: Previously existing field '${reqField}' was removed.`);
    }
  }

  // Check property type consistency
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
  const typeSchemas = REGISTERED_EVENT_SCHEMAS[eventType];
  if (!typeSchemas) {
    return { valid: true, warning: `No registered schema found for event '${eventType}'.` };
  }

  const schema = typeSchemas[version];
  if (!schema) {
    return { valid: false, error: `Schema version '${version}' not registered for event '${eventType}'.` };
  }

  const missing = [];
  for (const reqField of schema.required) {
    // Check root or data object
    const hasField = payload[reqField] !== undefined || (payload.data && payload.data[reqField] !== undefined);
    if (!hasField) {
      missing.push(reqField);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required event fields: [${missing.join(', ')}] for schema ${eventType}@${version}`
    };
  }

  return { valid: true };
}
