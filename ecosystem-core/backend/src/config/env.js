import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/ecosystem_core_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'ecosystem_core_master_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'automobile-ecosystem',
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'ecosystem-core-api',
  KEYCLOAK_JWKS_URI: process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/certs',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};
