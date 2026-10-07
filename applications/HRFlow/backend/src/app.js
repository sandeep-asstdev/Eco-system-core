const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./modules/auth/authRoutes');
const tenantRoutes = require('./modules/tenants/tenantRoutes');
const branchRoutes = require('./modules/branches/branchRoutes');
const vacancyRoutes = require('./modules/vacancies/vacancyRoutes');
const joiningRoutes = require('./modules/joining/joiningRoutes');
const employeeRoutes = require('./modules/employees/employeeRoutes');
const approvalRoutes = require('./modules/approvals/approvalRoutes');
const payrollRoutes = require('./modules/payroll/payrollRoutes');
const advanceRoutes = require('./modules/advances/advanceRoutes');
const attendanceRoutes = require('./modules/attendance/attendanceRoutes');
const exitRoutes = require('./modules/exit/exitRoutes');
const reportRoutes = require('./modules/reports/reportRoutes');
const notificationRoutes = require('./modules/notifications/notificationRoutes');
const auditRoutes = require('./modules/audit/auditRoutes');
const searchRoutes = require('./modules/search/searchRoutes');
const fileRoutes = require('./modules/files/fileRoutes');
const organizationMastersRoutes = require('./modules/organizationMasters/organizationMastersRoutes');
const integrationRoutes = require('./modules/integrations/integrationRoutes');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'HRFlow SaaS Multi-Tenant HRMS API',
    ecosystem: 'Automobile Ecosystem Phase 5 Integrated',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internal/tenants', tenantRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/joining', joiningRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exit', exitRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/organization-masters', organizationMastersRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/integrations', integrationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
