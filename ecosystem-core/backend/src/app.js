import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenants/tenants.routes.js';
import internalTenantRoutes from './modules/tenants/internalTenants.routes.js';
import orgRoutes from './modules/org/org.routes.js';
import userRoutes from './modules/users/users.routes.js';
import applicationRoutes from './modules/applications/applications.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';
import integrationRoutes from './modules/integrations/integrations.routes.js';
import workflowRoutes from './modules/workflows/workflow.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

const app = express();

// Global Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.use('/api/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

// Core Platform API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/internal/tenants', internalTenantRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/org', orgRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/audit', auditRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist on ecosystem-core-api.`
    }
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
