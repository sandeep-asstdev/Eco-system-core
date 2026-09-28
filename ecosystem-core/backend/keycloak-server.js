/**
 * Canonical Keycloak OIDC Server is maintained in infra/keycloak/keycloak-server.js.
 * This entry point delegates to the canonical server to ensure identical behavior
 * with 1-click SSO launch bridge (/protocol/openid-connect/sso-launch).
 */
import '../../infra/keycloak/keycloak-server.js';
