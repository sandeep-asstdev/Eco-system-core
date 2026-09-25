import prisma from '../../config/db.js';
import crypto from 'crypto';
import { encryptSecret, decryptSecret } from '@automobile-ecosystem/sdk';

/**
 * Declarative Field Transformation Engine
 * Maps external provider data fields to ecosystem canonical data structures.
 */
export function transformData(sourceRecord, fieldMappings = []) {
  if (!fieldMappings || !Array.isArray(fieldMappings) || fieldMappings.length === 0) {
    return { ...sourceRecord };
  }

  const result = {};

  for (const mapping of fieldMappings) {
    const { sourceField, targetField, transform, defaultValue } = mapping;
    if (!targetField) continue;

    // Resolve source value (supports nested dot notation)
    let val = undefined;
    if (sourceField) {
      val = sourceField.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), sourceRecord);
    }

    if (val === undefined || val === null) {
      val = defaultValue !== undefined ? defaultValue : null;
    }

    // Apply transformation
    if (val !== null && val !== undefined) {
      switch (transform) {
        case 'UPPERCASE':
          val = String(val).toUpperCase();
          break;
        case 'LOWERCASE':
          val = String(val).toLowerCase();
          break;
        case 'TRIM':
          val = String(val).trim();
          break;
        case 'TO_NUMBER':
          val = Number(val);
          break;
        case 'TO_BOOLEAN':
          val = Boolean(val);
          break;
        case 'TO_DATE_ISO':
          val = new Date(val).toISOString();
          break;
        default:
          break;
      }
    }

    // Assign to target field (supports nested target)
    const targetParts = targetField.split('.');
    let current = result;
    for (let i = 0; i < targetParts.length - 1; i++) {
      const part = targetParts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    current[targetParts[targetParts.length - 1]] = val;
  }

  return result;
}

/**
 * Base Abstract Connector Interface
 */
export class BaseConnector {
  constructor(config = {}) {
    this.config = config;
    this.name = this.constructor.name;
  }

  async testConnection() {
    throw new Error(`${this.name} must implement testConnection()`);
  }

  async fetchData(queryOptions = {}) {
    throw new Error(`${this.name} must implement fetchData()`);
  }

  async pushData(records = []) {
    throw new Error(`${this.name} must implement pushData()`);
  }
}

/**
 * Generic REST API Connector
 */
export class RestApiConnector extends BaseConnector {
  async testConnection() {
    const { baseUrl, authType, apiKey, bearerToken, basicUser, basicPass } = this.config;
    if (!baseUrl) throw new Error('Base URL is required for REST API Connector.');

    const headers = { 'Accept': 'application/json' };
    if (authType === 'API_KEY' && apiKey) {
      headers['X-API-Key'] = apiKey;
    } else if (authType === 'BEARER' && bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    } else if (authType === 'BASIC' && basicUser && basicPass) {
      headers['Authorization'] = `Basic ${Buffer.from(`${basicUser}:${basicPass}`).toString('base64')}`;
    }

    try {
      const res = await fetch(baseUrl, { method: 'GET', headers, signal: AbortSignal.timeout(4000) });
      return {
        connected: res.ok,
        statusCode: res.status,
        message: res.ok ? 'Connection successful' : `Remote endpoint returned ${res.status}`
      };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  }

  async fetchData(queryOptions = {}) {
    const { baseUrl, endpoint = '' } = this.config;
    const url = `${baseUrl}${endpoint}`;
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`REST fetch failed with status ${res.status}`);
    return await res.json();
  }

  async pushData(payload = {}) {
    const { baseUrl, endpoint = '' } = this.config;
    const url = `${baseUrl}${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`REST push failed with status ${res.status}`);
    return await res.json();
  }
}

/**
 * Outbound Webhook Connector
 */
export class WebhookConnector extends BaseConnector {
  async pushData(eventPayload) {
    const { targetUrl, secretKey } = this.config;
    if (!targetUrl) throw new Error('Target URL required for Webhook Connector.');

    const bodyString = JSON.stringify(eventPayload);
    const signature = crypto.createHmac('sha256', secretKey || 'ecosystem-webhook-default')
      .update(bodyString)
      .digest('hex');

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ecosystem-Signature': signature,
        'X-Ecosystem-Event': eventPayload.eventType || 'webhook.event',
        'X-Ecosystem-Timestamp': new Date().toISOString()
      },
      body: bodyString,
      signal: AbortSignal.timeout(5000)
    });

    return {
      delivered: res.ok,
      statusCode: res.status
    };
  }
}

/**
 * Future Realbook / Financial ERP Connector Interface
 * Defines the contract for integration with Realbook without inventing unverified endpoints.
 */
export class RealbookConnector extends BaseConnector {
  /**
   * Realbook Authentication Contract
   * Expected inputs: { companyCode, licenseKey, userToken, apiGatewayUrl }
   */
  async authenticate(credentials) {
    if (!credentials?.companyCode || !credentials?.licenseKey) {
      return {
        authenticated: false,
        error: 'Realbook integration requires companyCode and licenseKey.'
      };
    }
    // Dry-run verification until official Realbook API specs are formalized
    return {
      authenticated: true,
      provider: 'REALBOOK',
      companyCode: credentials.companyCode,
      status: 'INTERFACE_READY',
      note: 'Connector ready for Realbook REST/SOAP gateway endpoints once published.'
    };
  }

  /**
   * Invoice Synchronization Contract
   */
  async syncInvoices({ fromDate, toDate, branchCode, limit = 50 }) {
    return {
      supported: true,
      provider: 'REALBOOK',
      action: 'SYNC_INVOICES',
      query: { fromDate, toDate, branchCode, limit },
      records: []
    };
  }

  /**
   * General Ledger / Chart of Accounts Contract
   */
  async syncLedgers({ financialYear, ledgerGroup }) {
    return {
      supported: true,
      provider: 'REALBOOK',
      action: 'SYNC_LEDGERS',
      query: { financialYear, ledgerGroup },
      records: []
    };
  }

  /**
   * Post Journal / Voucher Contract
   */
  async postVoucher(voucherData) {
    if (!voucherData.voucherType || !voucherData.amount) {
      throw new Error('Voucher requires voucherType and amount.');
    }
    return {
      posted: true,
      provider: 'REALBOOK',
      voucherNumber: `RBK-${Date.now()}`,
      status: 'PENDING_TRANSMISSION'
    };
  }

  async testConnection() {
    return await this.authenticate(this.config);
  }
}

/**
 * Connector Factory
 */
export function getConnector(providerCode, config = {}) {
  switch (providerCode.toUpperCase()) {
    case 'REALBOOK':
      return new RealbookConnector(config);
    case 'WEBHOOK':
      return new WebhookConnector(config);
    case 'CUSTOM_REST':
    case 'TALLY':
    default:
      return new RestApiConnector(config);
  }
}
