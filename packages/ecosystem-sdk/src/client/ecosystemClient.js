export class EcosystemClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.ECOSYSTEM_CORE_URL || 'http://localhost:4000/api/v1';
    this.serviceKey = config.serviceKey || process.env.INTERNAL_SERVICE_KEY || 'ecosystem-internal-service-secret-key-2026';
    this.timeout = config.timeout || 5000;
  }

  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Service-Key': this.serviceKey,
      ...options.headers
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.error?.message || `Ecosystem request failed with HTTP ${response.status}`;
        const error = new Error(errorMsg);
        error.statusCode = response.status;
        error.details = data?.error;
        throw error;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Retrieves tenant details.
   */
  async getTenant(tenantId) {
    const res = await this._request(`/tenants/${tenantId}`);
    return res.data;
  }

  /**
   * Retrieves branches belonging to a tenant.
   */
  async getBranches(tenantId) {
    const res = await this._request(`/org/branches?tenantId=${tenantId}`);
    return res.data;
  }

  /**
   * Records an immutable central audit log.
   */
  async recordAuditLog({ tenantId, userId, action, entityType, entityId, oldValue, newValue }) {
    return await this._request('/audit', {
      method: 'POST',
      body: JSON.stringify({
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        oldValue,
        newValue
      })
    }).catch(err => {
      console.warn('Failed to record remote audit log:', err.message);
      return null;
    });
  }

  /**
   * Triggers a workflow instance.
   */
  async triggerWorkflow({ triggerEvent, entityType, entityId, contextData, tenantId, initiatedBy }) {
    return await this._request('/workflows/trigger', {
      method: 'POST',
      headers: { 'X-Tenant-Id': tenantId },
      body: JSON.stringify({
        triggerEvent,
        entityType,
        entityId,
        contextData,
        initiatedBy
      })
    });
  }
}

export function createEcosystemClient(config) {
  return new EcosystemClient(config);
}
