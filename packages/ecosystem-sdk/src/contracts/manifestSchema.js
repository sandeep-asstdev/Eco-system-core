/**
 * Application Manifest Specification and Validation
 * Standardized metadata specification for ecosystem applications.
 */

export const ALLOWED_CATEGORIES = [
  'HR',
  'OPERATIONS',
  'INVENTORY',
  'SALES',
  'CRM',
  'FINANCE',
  'SERVICE',
  'DEMO',
  'PLATFORM'
];

/**
 * Validates an Application Manifest JSON object.
 * @param {object} manifest - The manifest object to validate
 * @returns {{ valid: boolean, errors: string[], sanitized?: object }}
 */
export function validateAppManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { valid: false, errors: ['Manifest must be a valid JSON object.'] };
  }

  // 1. manifestVersion
  if (!manifest.manifestVersion || typeof manifest.manifestVersion !== 'string') {
    errors.push("'manifestVersion' is required (e.g. '1.0').");
  }

  // 2. appKey
  if (!manifest.appKey || typeof manifest.appKey !== 'string') {
    errors.push("'appKey' is required and must be a string.");
  } else if (!/^[a-z0-9_-]{2,50}$/.test(manifest.appKey.trim())) {
    errors.push("'appKey' must be lowercase alphanumeric with hyphens or underscores (2-50 characters).");
  }

  // 3. name
  if (!manifest.name || typeof manifest.name !== 'string' || manifest.name.trim().length < 2) {
    errors.push("'name' is required (minimum 2 characters).");
  }

  // 4. version
  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push("'version' is required (e.g. '1.0.0').");
  }

  // 5. category
  const category = (manifest.category || 'OPERATIONS').toUpperCase().trim();
  if (!ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`'category' must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  // 6. URLs (frontendUrl, apiUrl, healthUrl)
  const validateUrl = (urlStr, fieldName, required = true) => {
    if (!urlStr) {
      if (required) errors.push(`'${fieldName}' is required.`);
      return;
    }
    try {
      const u = new URL(urlStr);
      if (!['http:', 'https:'].includes(u.protocol)) {
        errors.push(`'${fieldName}' must use http or https protocol.`);
      }
    } catch (_) {
      errors.push(`'${fieldName}' is not a valid absolute URL: ${urlStr}`);
    }
  };

  validateUrl(manifest.frontendUrl || manifest.baseUrl, 'frontendUrl');
  validateUrl(manifest.apiUrl, 'apiUrl');
  if (manifest.healthUrl) {
    validateUrl(manifest.healthUrl, 'healthUrl', false);
  }

  // 7. Authentication Configuration
  if (manifest.auth) {
    if (typeof manifest.auth !== 'object') {
      errors.push("'auth' must be an object.");
    } else {
      if (manifest.auth.type && !['OIDC', 'SAML', 'NONE'].includes(manifest.auth.type.toUpperCase())) {
        errors.push("'auth.type' must be 'OIDC', 'SAML', or 'NONE'.");
      }
      if (manifest.auth.redirectUris) {
        if (!Array.isArray(manifest.auth.redirectUris)) {
          errors.push("'auth.redirectUris' must be an array of URL strings.");
        } else {
          manifest.auth.redirectUris.forEach((uri, idx) => {
            validateUrl(uri, `auth.redirectUris[${idx}]`, true);
          });
        }
      }
    }
  }

  // 8. Permissions Array
  if (manifest.permissions !== undefined && !Array.isArray(manifest.permissions)) {
    errors.push("'permissions' must be an array of permission strings.");
  } else if (Array.isArray(manifest.permissions)) {
    manifest.permissions.forEach((perm, idx) => {
      if (typeof perm !== 'string' || !/^[a-z0-9_.-]+$/i.test(perm)) {
        errors.push(`Invalid permission format at index ${idx}: '${perm}'. Must use dot notation (e.g. 'inventory.stock.read').`);
      }
    });
  }

  // 9. Publishes & Subscribes Arrays
  const validateEventList = (events, fieldName) => {
    if (events !== undefined && !Array.isArray(events)) {
      errors.push(`'${fieldName}' must be an array of event strings.`);
    } else if (Array.isArray(events)) {
      events.forEach((ev, idx) => {
        if (typeof ev !== 'string' || !/^[a-z0-9_.-]+$/i.test(ev)) {
          errors.push(`Invalid event name in '${fieldName}' at index ${idx}: '${ev}'.`);
        }
      });
    }
  };

  validateEventList(manifest.publishes, 'publishes');
  validateEventList(manifest.subscribes, 'subscribes');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Return clean sanitized manifest
  const sanitized = {
    manifestVersion: String(manifest.manifestVersion).trim(),
    appKey: String(manifest.appKey).toLowerCase().trim(),
    name: String(manifest.name).trim(),
    description: manifest.description ? String(manifest.description).trim() : null,
    version: String(manifest.version).trim(),
    category,
    icon: manifest.icon ? String(manifest.icon).trim() : 'AppWindow',
    frontendUrl: (manifest.frontendUrl || manifest.baseUrl).trim(),
    apiUrl: manifest.apiUrl.trim(),
    healthUrl: manifest.healthUrl ? manifest.healthUrl.trim() : `${manifest.apiUrl.replace(/\/+$/, '')}/api/health`,
    auth: {
      type: manifest.auth?.type ? manifest.auth.type.toUpperCase() : 'OIDC',
      redirectUris: Array.isArray(manifest.auth?.redirectUris) 
        ? manifest.auth.redirectUris.map(u => String(u).trim()) 
        : [`${(manifest.frontendUrl || manifest.baseUrl).replace(/\/+$/, '')}/callback`]
    },
    permissions: Array.isArray(manifest.permissions) ? [...new Set(manifest.permissions.map(p => String(p).trim()))] : [],
    publishes: Array.isArray(manifest.publishes) ? [...new Set(manifest.publishes.map(e => String(e).trim()))] : [],
    subscribes: Array.isArray(manifest.subscribes) ? [...new Set(manifest.subscribes.map(e => String(e).trim()))] : []
  };

  return { valid: true, errors: [], sanitized };
}
