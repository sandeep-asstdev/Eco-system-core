/**
 * Canonical Schema Registry for Cross-Application Automobile Dealership Data.
 * Defines shared data entities without imposing a single monolithic database.
 */

export const CANONICAL_IDENTIFIERS = {
  TENANT: {
    name: 'centralTenantId',
    format: 'uuid',
    example: '883663e1-917e-4fae-8f1d-9d89e749362b',
    description: 'Central dealership corporate group identifier'
  },
  FIRM: {
    name: 'centralFirmId',
    format: 'uuid',
    example: 'd19e0b12-9c98-4c12-9c1a-88e9bb123456',
    description: 'Legal corporate operating entity'
  },
  BRAND: {
    name: 'centralBrandId',
    format: 'uuid',
    example: 'b81a9c12-3b4c-5d6e-7f8a-901234567890',
    description: 'OEM franchise brand (e.g. Hyundai, Tata Motors, MG)'
  },
  BRANCH: {
    name: 'centralBranchId',
    format: 'uuid',
    example: 'df42516a-ac2b-4757-ae1e-fa0eddd0c246',
    description: 'Physical showroom, workshop or bodyshop outlet'
  },
  USER: {
    name: 'centralUserId',
    format: 'uuid',
    example: '84a1e6f3-f10c-411c-b6c5-95e693399416',
    description: 'Central identity provider subject identifier'
  },
  CUSTOMER: {
    name: 'centralCustomerId',
    format: 'uuid',
    example: 'cst-7711-bba-45',
    description: 'Canonical customer profile shared across Sales, CRM, and Service'
  },
  VEHICLE: {
    name: 'vin',
    format: 'string(17)',
    example: 'MALBA51CLAM123456',
    description: 'Standard 17-character ISO 3779 Vehicle Identification Number'
  }
};

export const COMMON_SCHEMAS = {
  EmployeeReference: {
    type: 'object',
    required: ['employeeCode', 'firstName', 'lastName', 'email', 'status', 'centralTenantId'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      centralTenantId: { type: 'string', format: 'uuid' },
      centralBranchId: { type: 'string', format: 'uuid', nullable: true },
      hrEmployeeId: { type: 'string', nullable: true },
      employeeCode: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string', nullable: true },
      designation: { type: 'string', nullable: true },
      department: { type: 'string', nullable: true },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ON_NOTICE'] }
    }
  },

  VehicleReference: {
    type: 'object',
    required: ['vin', 'registrationNumber', 'brand', 'model', 'centralTenantId'],
    properties: {
      vin: { type: 'string', minLength: 17, maxLength: 17 },
      registrationNumber: { type: 'string' },
      brand: { type: 'string' },
      model: { type: 'string' },
      variant: { type: 'string', nullable: true },
      color: { type: 'string', nullable: true },
      fuelType: { type: 'string', enum: ['PETROL', 'DIESEL', 'EV', 'CNG', 'HYBRID'] },
      centralTenantId: { type: 'string', format: 'uuid' },
      currentBranchId: { type: 'string', format: 'uuid', nullable: true }
    }
  },

  CustomerReference: {
    type: 'object',
    required: ['name', 'phone', 'centralTenantId'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      centralTenantId: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string', format: 'email', nullable: true },
      pan: { type: 'string', nullable: true },
      gstin: { type: 'string', nullable: true }
    }
  }
};
