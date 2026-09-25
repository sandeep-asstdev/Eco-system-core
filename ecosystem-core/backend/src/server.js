import app from './app.js';
import { ENV } from './config/env.js';
import prisma from './config/db.js';

let serverInstance = null;

async function startServer() {
  try {
    // Optional connection check
    try {
      await prisma.$connect();
      console.log('✅ [ECOSYSTEM_CORE] Connected to PostgreSQL 18 database.');
    } catch (dbErr) {
      console.warn('⚠️ [ECOSYSTEM_CORE] Database connection warning:', dbErr.message);
    }

    serverInstance = app.listen(ENV.PORT, () => {
      console.log(`🚀 [ECOSYSTEM_CORE] Central Platform API running on http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[ECOSYSTEM_CORE] Port ${ENV.PORT} already in use. Proceeding with active instance.`);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('❌ Failed to start Ecosystem Core API:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { serverInstance };
export default app;
