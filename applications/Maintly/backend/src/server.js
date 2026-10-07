import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV, UPLOAD_PATH } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './modules/auth/auth.routes.js';
import orgRoutes from './modules/org/org.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import vendorRoutes from './modules/vendor/vendor.routes.js';
import purchaseRoutes from './modules/purchase/purchase.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import integrationRoutes from './modules/integrations/integration.routes.js';
import assetRoutes from './modules/assets/asset.routes.js';
import pmRoutes from './modules/pm/pm.routes.js';
import approvalRoutes from './modules/approvals/approval.routes.js';
import intelligenceRoutes from './modules/intelligence/intelligence.routes.js';
import { eventConsumer } from './services/eventConsumer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving with cross-origin access
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(UPLOAD_PATH));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'MAINTLY',
    tagline: 'Internal Maintenance & Operations Management',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internal/tenants', orgRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/pm', pmRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/intelligence', intelligenceRoutes);

// Central error handler
app.use(errorHandler);

let serverInstance = null;
if (process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(ENV.PORT, () => {
    console.log(`[MAINTLY_API] Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
    console.log(`[MAINTLY_API] Connected to PostgreSQL 18 on port 5433`);

    // Start background RabbitMQ employee sync consumer
    eventConsumer.start();
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[MAINTLY_API] Port ${ENV.PORT} is already in use by active instance; tests can run against active server.`);
      eventConsumer.start();
    } else {
      throw err;
    }
  });
}

export { serverInstance };
export default app;
