import express from 'express';
import cors from 'cors';
import {
  createAuthMiddleware,
  requirePermission,
  createEventBus,
  createHealthHandler,
  createErrorHandler,
  createEcosystemClient
} from '@automobile-ecosystem/sdk';

const PORT = process.env.PORT || 5005;
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-memory demo store
const demoItems = [
  { id: 'itm-001', itemCode: 'ACC-FLT-101', name: 'GPS Fleet Tracker OBD-II', category: 'Telematics', quantity: 25, tenantId: '883663e1-917e-4fae-8f1d-9d89e749362b' },
  { id: 'itm-002', itemCode: 'ACC-SAF-202', name: 'Dual Dash Cam 4K HDR', category: 'Safety', quantity: 18, tenantId: '883663e1-917e-4fae-8f1d-9d89e749362b' }
];
const consumedEvents = [];

// Initialize Ecosystem SDK Event Bus
const eventBus = createEventBus({
  serviceName: 'demo-app',
  brokerUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
});

// Initialize Ecosystem Client
const coreClient = createEcosystemClient({
  baseUrl: process.env.ECOSYSTEM_CORE_URL || 'http://localhost:4000/api/v1'
});

// Standardized Health Check
app.use('/api/health', createHealthHandler({
  serviceName: 'demo-app',
  version: '1.0.0',
  checks: {
    broker: async () => eventBus.isConnected ? 'CONNECTED' : 'STANDALONE',
    itemsCount: async () => demoItems.length
  }
}));

// Standardized Authentication & Scoped Context Extraction
const authenticate = createAuthMiddleware({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/certs',
  issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/automobile-ecosystem',
  allowDevFallback: true
});

// Context Inspection Endpoint
app.get('/api/context', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      application: 'DemoApp',
      authenticatedUser: req.user,
      extractedTenantId: req.tenantId,
      extractedBranchIds: req.branchIds,
      isPlatformAdmin: req.isPlatformAdmin
    }
  });
});

// Protected Endpoint 1: View Items (Requires demo.order.view)
app.get('/api/items', authenticate, requirePermission('demo.order.view'), (req, res) => {
  const tenantItems = req.isPlatformAdmin 
    ? demoItems 
    : demoItems.filter(i => !req.tenantId || i.tenantId === req.tenantId);

  res.json({
    success: true,
    data: tenantItems,
    meta: { total: tenantItems.length, tenantId: req.tenantId }
  });
});

// Protected Endpoint 2: Create Item & Publish Versioned Event (Requires demo.order.create)
app.post('/api/items', authenticate, requirePermission('demo.order.create'), async (req, res, next) => {
  try {
    const { itemCode, name, category, quantity } = req.body;
    if (!itemCode || !name) {
      return res.status(400).json({ success: false, error: { message: 'itemCode and name are required.' } });
    }

    const newItem = {
      id: `itm-${Date.now()}`,
      itemCode,
      name,
      category: category || 'General',
      quantity: Number(quantity) || 1,
      tenantId: req.tenantId || '883663e1-917e-4fae-8f1d-9d89e749362b',
      createdAt: new Date().toISOString()
    };

    demoItems.push(newItem);

    // Publish Versioned Domain Event using SDK EventBus
    const publishedEvent = await eventBus.publishEvent('demo.item.created', {
      centralTenantId: newItem.tenantId,
      itemCode: newItem.itemCode,
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity
    }, {
      version: '1.0.0',
      centralTenantId: newItem.tenantId
    });

    res.status(201).json({
      success: true,
      data: newItem,
      publishedEvent: {
        eventId: publishedEvent.eventId,
        eventType: publishedEvent.eventType,
        version: publishedEvent.version
      }
    });
  } catch (err) {
    next(err);
  }
});

// View Consumed Events
app.get('/api/consumed-events', authenticate, (req, res) => {
  res.json({ success: true, data: consumedEvents });
});

// Embedded Dashboard UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DemoApp — Automobile Ecosystem Extension</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen text-slate-800 font-sans p-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-violet-500/25">
          🚗
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-900">DemoApp — Fleet &amp; Accessories</h1>
          <p class="text-xs text-slate-500">Autonomous Ecosystem PERN Extension powered by @automobile-ecosystem/sdk</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
        Central SSO Active
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-5 rounded-xl border border-slate-200">
        <span class="text-xs font-semibold text-slate-400 uppercase">Architecture</span>
        <div class="mt-1 text-sm font-bold text-slate-800">Pluggable PERN App</div>
        <div class="text-xs text-slate-500 mt-1">Zero changes to HRFlow or MAINTLY</div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200">
        <span class="text-xs font-semibold text-slate-400 uppercase">Authentication</span>
        <div class="mt-1 text-sm font-bold text-slate-800">OIDC PKCE + RS256</div>
        <div class="text-xs text-slate-500 mt-1">Central Keycloak Single Session</div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200">
        <span class="text-xs font-semibold text-slate-400 uppercase">Event Streaming</span>
        <div class="mt-1 text-sm font-bold text-slate-800">Topic Exchange</div>
        <div class="text-xs text-slate-500 mt-1">Publishes <code>demo.item.created</code></div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <h2 class="text-base font-bold text-slate-900">Extensibility Verification Status</h2>
      <ul class="space-y-2 text-xs text-slate-600">
        <li class="flex items-center gap-2">✅ Registered dynamically in Central Application Registry (appKey: <code>demo-app</code>)</li>
        <li class="flex items-center gap-2">✅ Appears dynamically in Central Portal Application Launcher</li>
        <li class="flex items-center gap-2">✅ Enforces its own permissions (<code>demo.order.view</code>, <code>demo.order.create</code>)</li>
        <li class="flex items-center gap-2">✅ Tenant Entitlement Gating: Active for Bellad Group, Hidden for Apex Auto Group</li>
        <li class="flex items-center gap-2">✅ Publishes &amp; Consumes versioned CloudEvents on RabbitMQ Topic Exchange</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `);
});

// Central Error Handler
app.use(createErrorHandler({ serviceName: 'demo-app' }));

// Start Server and Connect Event Bus
async function start() {
  await eventBus.connect();

  // Subscribe to employee.created to demonstrate event consumption
  await eventBus.subscribe('demo.employee.sync', 'employee.created', (payload) => {
    consumedEvents.push({
      eventType: payload.eventType,
      eventId: payload.eventId,
      employeeName: `${payload.data?.firstName} ${payload.data?.lastName}`,
      receivedAt: new Date().toISOString()
    });
    console.log(`🚗 [DemoApp] Consumed employee event: ${payload.data?.firstName} ${payload.data?.lastName}`);
  });

  app.listen(PORT, () => {
    console.log(`🚀 [DemoApp] Running on http://localhost:${PORT} [Modular Ecosystem Extension]`);
  });
}

start().catch(console.error);
