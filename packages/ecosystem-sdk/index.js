// @automobile-ecosystem/sdk - Main Entry Point

export * from './src/auth/authMiddleware.js';
export * from './src/events/eventBus.js';
export * from './src/client/ecosystemClient.js';
export * from './src/health/healthHandler.js';
export * from './src/errors/ecosystemErrors.js';
export * from './src/utils/cryptoUtils.js';
export * from './src/contracts/schemaRegistry.js';
export * from './src/contracts/eventContracts.js';
export * from './src/contracts/manifestSchema.js';

export const SDK_VERSION = '1.1.0';
