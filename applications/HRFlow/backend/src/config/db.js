require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/hrflow_db?schema=public';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
