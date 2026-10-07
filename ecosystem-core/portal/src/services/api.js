const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('ecosystem_token') || null;
    this.tenantId = localStorage.getItem('ecosystem_tenant_id') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('ecosystem_token', token);
    } else {
      localStorage.removeItem('ecosystem_token');
    }
  }

  setTenantId(tenantId) {
    this.tenantId = tenantId;
    if (tenantId) {
      localStorage.setItem('ecosystem_tenant_id', tenantId);
    } else {
      localStorage.removeItem('ecosystem_tenant_id');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.tenantId) {
      headers['x-tenant-id'] = this.tenantId;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          console.warn('[API] 401 Unauthorized encountered.');
        }
        const error = new Error(data?.error?.message || `HTTP ${response.status}: Request failed`);
        error.status = response.status;
        error.code = data?.error?.code;
        error.details = data?.error;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  put(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiService();
