const { execSync } = require('child_process');
const app = require('./app');
const prisma = require('./config/db');
const outboxPublisher = require('./services/outboxPublisher');

const PORT = process.env.PORT || 5000;

async function ensureDatabaseConnected(maxRetries = 5, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('Connected to PostgreSQL (hrflow_db) via Prisma successfully.');
      return;
    } catch (error) {
      if (attempt === 1) {
        console.warn(`[HRFLOW_DB] PostgreSQL connection failed (attempt 1/${maxRetries}). Auto-starting postgresql-x64-18 service...`);
        try {
          if (process.platform === 'win32') {
            execSync('sc start postgresql-x64-18', { stdio: 'ignore' });
          }
        } catch (_) {}
      }
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`[HRFLOW_DB] Retrying connection in ${delayMs / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

async function startServer() {
  try {
    // Verify database connection with auto-heal retry
    await ensureDatabaseConnected();

    // Start background transactional outbox publisher
    outboxPublisher.start(2000);

    const server = app.listen(PORT, () => {
      console.log(`HRFlow Backend Server running on http://localhost:${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[HRFLOW_API] Port ${PORT} is already in use by an active instance.`);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
