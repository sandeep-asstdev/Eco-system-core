require('dotenv').config();
const { execSync } = require('child_process');
const app = require('./app');
const prisma = require('./config/db');
const outboxPublisher = require('./services/outboxPublisher');

const PORT = process.env.PORT || 5000;

async function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ [HRFLOW_DB] WARNING: DATABASE_URL is not explicitly set in environment variables.');
    console.warn('👉 Please configure DATABASE_URL in your Render Dashboard -> Environment.');
  }

  try {
    await prisma.$connect();
    console.log('✅ [HRFLOW_DB] Connected to PostgreSQL (hrflow_db) successfully.');
    try {
      outboxPublisher.start(2000);
    } catch (pubErr) {
      console.warn('⚠️ [OUTBOX] Outbox publisher warning:', pubErr.message);
    }
  } catch (error) {
    if (process.platform === 'win32') {
      try {
        console.log('[HRFLOW_DB] Attempting local PostgreSQL service recovery...');
        execSync('sc start postgresql-x64-18', { stdio: 'ignore' });
        await new Promise(r => setTimeout(r, 1500));
        await prisma.$connect();
        console.log('✅ [HRFLOW_DB] Reconnected to PostgreSQL (hrflow_db) after service start.');
        outboxPublisher.start(2000);
        return;
      } catch (_) {}
    }
    console.warn('⚠️ [HRFLOW_DB] Database connection warning:', error.message);
    console.warn('👉 Ensure your PostgreSQL database is running and DATABASE_URL is reachable.');
  }
}

async function startServer() {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [HRFLOW_API] Server listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      // Connect to database in background so Render port check passes immediately
      checkDatabaseConnection();
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[HRFLOW_API] Port ${PORT} is already in use by an active instance.`);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
