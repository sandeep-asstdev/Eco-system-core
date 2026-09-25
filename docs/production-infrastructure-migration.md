# Production Infrastructure & Enterprise Migration Guide

## 1. Executive Summary

During development, the Automobile Ecosystem utilized lightweight, dedicated Node.js identity and message broker services:
1. Custom OIDC Identity Provider (`infra/keycloak/keycloak-server.js`) on port `8080`.
2. Custom AMQP/HTTP Message Broker (`infra/rabbitmq/rabbitmq-server.js`) on ports `5672` and `15672`.

This guide documents the enterprise migration plan to official production-grade infrastructure:
- **Identity & Access Management**: Official Quarkus Keycloak 24+ container with PostgreSQL backend and high-availability clustering.
- **Message Broker & Event Streaming**: Official RabbitMQ 3.13+ Erlang cluster with durable exchanges, queues, and Dead-Letter Exchanges (DLX).

---

## 2. Official Keycloak 24+ Production Migration

### 2.1 Architecture Topology
```
[Client / Browser] ➔ [Nginx Ingress / SSL Termination :443] ➔ [Keycloak Quarkus Cluster :8080]
                                                                         │
                                                                         ▼
                                                       [PostgreSQL 18: keycloak_db]
```

### 2.2 Docker Compose Production Manifest
Add to `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  keycloak-db:
    image: postgres:18-alpine
    container_name: ecosystem-keycloak-db
    environment:
      POSTGRES_DB: keycloak_db
      POSTGRES_USER: keycloak_admin
      POSTGRES_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
    volumes:
      - keycloak_data:/var/lib/postgresql/data
    networks:
      - ecosystem_internal

  keycloak:
    image: quay.io/keycloak/keycloak:24.0.5
    container_name: ecosystem-keycloak
    command: start --optimized --import-realm
    environment:
      KC_DB: postgres
      KC_DB_URL_HOST: keycloak-db
      KC_DB_URL_DATABASE: keycloak_db
      KC_DB_USERNAME: keycloak_admin
      KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
      KC_HOSTNAME: auth.dealershipecosystem.in
      KC_HTTP_RELATIVE_PATH: /
      KC_PROXY_HEADERS: xforwarded
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    volumes:
      - ./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro
    ports:
      - "8080:8080"
    depends_on:
      - keycloak-db
    networks:
      - ecosystem_internal

volumes:
  keycloak_data:

networks:
  ecosystem_internal:
```

### 2.3 Realm & Client Configuration Migration
The existing realm configuration in [infra/keycloak/realm-export.json](file:///c:/Users/User/Desktop/Automobile_Ecosystem/infra/keycloak/realm-export.json) is 100% compliant with Keycloak 24+:
- **Realm**: `automobile-ecosystem`
- **Clients**:
  - `ecosystem-portal`: Public client, Standard Flow + PKCE (S256), Redirect URIs: `http://localhost:3000/*`
  - `hrflow-web`: Public client, Standard Flow + PKCE (S256), Redirect URIs: `http://localhost:3001/*`
  - `maintly-web`: Public client, Standard Flow + PKCE (S256), Redirect URIs: `http://localhost:3002/*`
  - `demo-web`: Public client, Standard Flow + PKCE (S256), Redirect URIs: `http://localhost:3005/*`
  - `ecosystem-core-api`: Bearer-only resource server with JWKS validation
- **Zero Client Code Changes**: Because our applications use standard OIDC discovery (`/.well-known/openid-configuration`) and JWKS (`/protocol/openid-connect/certs`), switching to official Keycloak requires zero modifications to application code.

---

## 3. Official RabbitMQ 3.13+ Production Migration

### 3.1 Docker Compose Production Manifest
```yaml
services:
  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    container_name: ecosystem-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-guest}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD:-guest}
      RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS: "-rabbit disk_free_limit 2GB"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./infra/rabbitmq/definitions.json:/etc/rabbitmq/definitions.json:ro
      - ./infra/rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
    ports:
      - "5672:5672"     # AMQP 0-9-1
      - "15672:15672"   # Management HTTP UI & REST API
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ecosystem_internal
```

### 3.2 Automated Declarations (`infra/rabbitmq/definitions.json`)
Pre-provisions topic exchanges, dead-letter exchanges, and queues:
```json
{
  "exchanges": [
    { "name": "automobile.events.topic", "type": "topic", "durable": true, "auto_delete": false },
    { "name": "automobile.events.dlx", "type": "direct", "durable": true, "auto_delete": false }
  ],
  "queues": [
    {
      "name": "maintly.employee.sync",
      "durable": true,
      "auto_delete": false,
      "arguments": {
        "x-dead-letter-exchange": "automobile.events.dlx",
        "x-dead-letter-routing-key": "dlq.maintly.employee.sync"
      }
    },
    { "name": "maintly.employee.sync.dlq", "durable": true, "auto_delete": false }
  ],
  "bindings": [
    { "source": "automobile.events.topic", "destination": "maintly.employee.sync", "destination_type": "queue", "routing_key": "employee.#" },
    { "source": "automobile.events.dlx", "destination": "maintly.employee.sync.dlq", "destination_type": "queue", "routing_key": "dlq.maintly.employee.sync" }
  ]
}
```

---

## 4. Production Security Hardening & Isolation Controls

1. **Secrets Management**:
   - AES-256-GCM encryption is applied to all tenant integration credentials in `tenant_integrations` and webhook secrets in `webhook_subscriptions`.
   - Master key is supplied via `ENCRYPTION_MASTER_KEY` environment variable. Plain-text credentials are never stored or returned in client API responses.
2. **Least-Privilege Service-to-Service Authentication**:
   - Background jobs and inter-service API calls utilize dedicated `X-Internal-Service-Key` headers or scoped client-credentials JWT tokens.
3. **Strict Cross-Tenant Isolation**:
   - Every database query in Prisma requires tenant scoping (`where: { tenantId }`).
   - Every event payload validates `centralTenantId` before applying mutations.
4. **Rate Limiting**:
   - Express rate limiting active on `/api/v1/auth`, `/api/v1/integrations`, and `/api/v1/workflows`.
5. **Request Tracing**:
   - `X-Correlation-ID` header generated on every ingress request and passed downstream across all HTTP and event bus communications.
