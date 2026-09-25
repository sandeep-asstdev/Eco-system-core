/**
 * Standardized health check handler for ecosystem micro-applications.
 */
export function createHealthHandler({ serviceName, version = '1.0.0', checks = {} }) {
  const startTime = Date.now();

  return async function healthCheck(req, res) {
    const memory = process.memoryUsage();
    const results = {};
    let isHealthy = true;

    for (const [name, checkFn] of Object.entries(checks)) {
      try {
        const start = Date.now();
        const checkRes = await checkFn();
        results[name] = {
          status: 'UP',
          latencyMs: Date.now() - start,
          details: checkRes || undefined
        };
      } catch (err) {
        isHealthy = false;
        results[name] = {
          status: 'DOWN',
          error: err.message
        };
      }
    }

    const payload = {
      service: serviceName,
      status: isHealthy ? 'UP' : 'DEGRADED',
      version,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
      },
      checks: Object.keys(results).length > 0 ? results : undefined
    };

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: payload
    });
  };
}
