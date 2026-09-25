import prisma from '../../config/db.js';
import { encryptSecret, decryptSecret } from '@automobile-ecosystem/sdk';
import { getConnector, transformData } from './integrationHub.service.js';

const DEFAULT_PROVIDERS = [
  {
    code: 'REALBOOK',
    name: 'Realbook ERP Connector',
    description: 'Enterprise Financial Accounting, Automobile Dealership GST Invoices & Ledgers',
    providerType: 'ACCOUNTING',
    authType: 'API_KEY',
    configSchema: {
      companyCode: { type: 'string', required: true, label: 'Realbook Company Code' },
      licenseKey: { type: 'string', required: true, secret: true, label: 'License / Auth Key' },
      apiGatewayUrl: { type: 'string', required: false, label: 'Gateway URL' }
    },
    defaultFieldMappings: [
      { sourceField: 'invoice_no', targetField: 'invoiceNumber' },
      { sourceField: 'customer_gstin', targetField: 'gstin', transform: 'UPPERCASE' },
      { sourceField: 'total_amount', targetField: 'grandTotal', transform: 'TO_NUMBER' }
    ]
  },
  {
    code: 'TALLY',
    name: 'Tally Prime / Server Connector',
    description: 'Tally XML / JSON Gateway for Dealership Vouchers and Inventory Ledgers',
    providerType: 'ACCOUNTING',
    authType: 'BASIC',
    configSchema: {
      serverUrl: { type: 'string', required: true, label: 'Tally Gateway Endpoint' },
      companyName: { type: 'string', required: true, label: 'Tally Company Name' }
    }
  },
  {
    code: 'CUSTOM_REST',
    name: 'Generic REST API Connector',
    description: 'Connect custom dealership external systems, DMS or telematics servers via REST',
    providerType: 'REST',
    authType: 'BEARER',
    configSchema: {
      baseUrl: { type: 'string', required: true, label: 'Base API URL' },
      bearerToken: { type: 'string', required: false, secret: true, label: 'Bearer Token' }
    }
  },
  {
    code: 'WEBHOOK',
    name: 'Outbound Event Webhooks',
    description: 'Deliver signed JSON event webhooks to third-party endpoints on domain events',
    providerType: 'WEBHOOK',
    authType: 'HMAC',
    configSchema: {
      targetUrl: { type: 'string', required: true, label: 'Webhook Destination URL' },
      secretKey: { type: 'string', required: true, secret: true, label: 'HMAC Signing Secret' }
    }
  }
];

/**
 * Lists available integration providers (auto-seeds defaults on first call).
 */
export async function getProviders(req, res, next) {
  try {
    let providers = await prisma.integrationProvider.findMany({
      orderBy: { name: 'asc' }
    });

    if (providers.length === 0) {
      for (const p of DEFAULT_PROVIDERS) {
        await prisma.integrationProvider.upsert({
          where: { code: p.code },
          update: {},
          create: p
        });
      }
      providers = await prisma.integrationProvider.findMany({ orderBy: { name: 'asc' } });
    }

    res.json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
}

/**
 * Lists tenant-configured integrations.
 * Strictly conceals encrypted credentials from response for security.
 */
export async function getTenantIntegrations(req, res, next) {
  try {
    const tenantId = req.query.tenantId || req.tenantId;
    if (!tenantId && !req.isPlatformAdmin) {
      return res.status(400).json({ success: false, error: { message: 'tenantId is required.' } });
    }

    const where = tenantId ? { tenantId } : {};
    const integrations = await prisma.tenantIntegration.findMany({
      where,
      include: {
        provider: true,
        tenant: { select: { id: true, name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sanitized = integrations.map(intg => ({
      id: intg.id,
      tenantId: intg.tenantId,
      tenantName: intg.tenant?.name,
      providerId: intg.providerId,
      providerCode: intg.provider?.code,
      providerName: intg.provider?.name,
      providerType: intg.provider?.providerType,
      name: intg.name,
      status: intg.status,
      isConfigured: Boolean(intg.encryptedCredentials),
      fieldMappings: intg.fieldMappings,
      syncSchedule: intg.syncSchedule,
      lastSyncAt: intg.lastSyncAt,
      lastSyncStatus: intg.lastSyncStatus,
      lastError: intg.lastError,
      customConfig: intg.customConfig,
      createdAt: intg.createdAt
    }));

    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
}

/**
 * Configures or updates a tenant integration with AES-256-GCM encrypted credentials.
 */
export async function configureTenantIntegration(req, res, next) {
  try {
    const { providerCode, name, credentials, fieldMappings, syncSchedule, customConfig } = req.body;
    const tenantId = req.body.tenantId || req.tenantId;

    if (!tenantId || !providerCode || !credentials) {
      return res.status(400).json({
        success: false,
        error: { message: 'tenantId, providerCode, and credentials are required.' }
      });
    }

    const provider = await prisma.integrationProvider.findUnique({
      where: { code: providerCode.toUpperCase() }
    });

    if (!provider) {
      return res.status(404).json({ success: false, error: { message: `Provider '${providerCode}' not found.` } });
    }

    // Encrypt credentials using AES-256-GCM
    const encrypted = encryptSecret(credentials);

    const integration = await prisma.tenantIntegration.create({
      data: {
        tenantId,
        providerId: provider.id,
        name: name || `${provider.name} Integration`,
        status: 'ACTIVE',
        encryptedCredentials: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        fieldMappings: fieldMappings || provider.defaultFieldMappings || [],
        syncSchedule: syncSchedule || '0 */6 * * *',
        customConfig: customConfig || {}
      },
      include: { provider: true }
    });

    res.status(201).json({
      success: true,
      data: {
        id: integration.id,
        tenantId: integration.tenantId,
        providerCode: provider.code,
        name: integration.name,
        status: integration.status,
        isConfigured: true,
        fieldMappings: integration.fieldMappings,
        syncSchedule: integration.syncSchedule
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Triggers on-demand synchronization or dry-run for a configured integration.
 */
export async function triggerIntegrationSync(req, res, next) {
  try {
    const { id } = req.params;
    const { dryRun = false, sampleRecords = [] } = req.body;

    const integration = await prisma.tenantIntegration.findUnique({
      where: { id },
      include: { provider: true, tenant: true }
    });

    if (!integration) {
      return res.status(404).json({ success: false, error: { message: 'Integration not found.' } });
    }

    // Decrypt credentials
    const credentials = decryptSecret({
      ciphertext: integration.encryptedCredentials,
      iv: integration.iv,
      authTag: integration.authTag
    });

    const connector = getConnector(integration.provider.code, credentials);
    const connTest = await connector.testConnection();

    // If dry run, apply field transformations to provided or mock records
    let transformed = [];
    if (sampleRecords.length > 0) {
      transformed = sampleRecords.map(r => transformData(r, integration.fieldMappings));
    }

    // Record execution in IntegrationSyncLog
    const log = await prisma.integrationSyncLog.create({
      data: {
        tenantIntegrationId: integration.id,
        direction: 'INBOUND',
        status: connTest.connected !== false ? 'SUCCESS' : 'FAILED',
        recordsProcessed: transformed.length,
        recordsFailed: connTest.connected === false ? 1 : 0,
        details: {
          connectionStatus: connTest,
          dryRun,
          sampleTransformed: transformed.slice(0, 3)
        },
        errorMessage: connTest.error || null
      }
    });

    await prisma.tenantIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: log.status,
        lastError: connTest.error || null
      }
    });

    res.json({
      success: true,
      data: {
        syncId: log.id,
        status: log.status,
        provider: integration.provider.code,
        connectionTest: connTest,
        recordsProcessed: transformed.length,
        transformedSample: transformed.slice(0, 3)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves execution logs for an integration.
 */
export async function getSyncLogs(req, res, next) {
  try {
    const { id } = req.params;
    const logs = await prisma.integrationSyncLog.findMany({
      where: { tenantIntegrationId: id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

/**
 * Registers an outbound webhook subscription.
 */
export async function registerWebhook(req, res, next) {
  try {
    const { targetUrl, secretKey, events } = req.body;
    const tenantId = req.body.tenantId || req.tenantId;

    if (!tenantId || !targetUrl) {
      return res.status(400).json({ success: false, error: { message: 'tenantId and targetUrl are required.' } });
    }

    const webhook = await prisma.webhookSubscription.create({
      data: {
        tenantId,
        targetUrl,
        secretKey: secretKey || `whsec_${crypto.randomBytes(16).toString('hex')}`,
        events: Array.isArray(events) ? events : ['*']
      }
    });

    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    next(error);
  }
}
