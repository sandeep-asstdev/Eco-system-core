# Universal Ecosystem Integration Contract

**Specification Version**: 1.1.0  
**Target Audience**: Developers building applications in Python, Go, Java, C#, Flutter/Dart, PHP, Rust, or Node.js without the JavaScript SDK.

---

## 1. Overview

Any application can participate as a first-class citizen in the Automobile Dealership Ecosystem by implementing three standardized components:
1. **Application Manifest (`/manifest.json`)**
2. **Central Keycloak OIDC Authentication**
3. **RabbitMQ Topic Exchange Event Integration**

---

## 2. Standard Application Manifest (`GET /manifest.json`)

Your service must expose an unauthenticated HTTP GET endpoint delivering its JSON manifest:

```json
{
  "manifestVersion": "1.0",
  "appKey": "inventory",
  "name": "Vehicle & Parts Inventory",
  "version": "1.0.0",
  "category": "INVENTORY",
  "frontendUrl": "https://inventory.dealership.com",
  "apiUrl": "https://inventory-api.dealership.com",
  "healthUrl": "https://inventory-api.dealership.com/api/health",
  "auth": {
    "type": "OIDC",
    "redirectUris": [
      "https://inventory.dealership.com/callback"
    ]
  },
  "permissions": [
    "inventory.stock.read",
    "inventory.stock.create",
    "inventory.order.create"
  ],
  "publishes": [
    "inventory.stock.updated.v1",
    "inventory.stock.low.v1"
  ],
  "subscribes": [
    "employee.created.v1",
    "employee.transferred.v1",
    "employee.deactivated.v1"
  ]
}
```

---

## 3. Authentication & SSO Contract (OIDC)

### 3.1 Single Sign-On (SSO) Flow
1. When launched from the Central Portal, users are redirected to:
   ```
   http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/sso-launch?appKey=<your-appKey>&token=<portal-jwt>
   ```
2. The Keycloak server issues an authorization code and redirects to your configured callback URL:
   ```
   https://inventory.dealership.com/callback?code=<AUTH_CODE>
   ```
3. Your frontend exchanges the code by sending `POST` to Keycloak:
   ```http
   POST /realms/automobile-ecosystem/protocol/openid-connect/token HTTP/1.1
   Host: localhost:8080
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code&client_id=<your-appKey>-web&code=<AUTH_CODE>&redirect_uri=https://inventory.dealership.com/callback
   ```

### 3.2 Backend JWT Verification
Backend APIs must validate Bearer tokens using the JWKS endpoint:
```
http://localhost:8080/realms/automobile-ecosystem/protocol/openid-connect/certs
```
Verify the token with algorithm `RS256` and extract standard claims:
* `tenant_id` / `tenantId`: Active Dealership Group UUID
* `branch_ids` / `branchIds`: Authorized dealership branch outlet UUIDs
* `permissions`: Array of granted permission strings (e.g. `inventory.stock.read`)

---

## 4. Asynchronous Event Protocol (RabbitMQ)

### 4.1 Broker Connection
* **Protocol**: AMQP 0-9-1 (Default port: `5672`) or REST HTTP API (`http://localhost:15672/api/publish`).
* **Topic Exchange**: `automobile.events.topic` (Durable).
* **Dead-Letter Exchange**: `automobile.events.dlx` (Direct).

### 4.2 Standard Event Envelope
All published events must strictly use this JSON envelope:

```json
{
  "eventId": "3c90c3cc-0d44-4b50-8888-825590c9b0e1",
  "eventType": "inventory.stock.updated.v1",
  "eventVersion": 1,
  "sourceApp": "inventory",
  "tenantId": "883663e1-917e-4fae-8f1d-9d89e749362b",
  "firmId": null,
  "branchId": "df42516a-ac2b-4757-ae1e-fa0eddd0c246",
  "occurredAt": "2026-09-29T10:00:00.000Z",
  "correlationId": "corr-1790660000",
  "data": {
    "itemCode": "ACC-FLT-101",
    "newQuantity": 35,
    "previousQuantity": 25,
    "branchId": "df42516a-ac2b-4757-ae1e-fa0eddd0c246"
  }
}
```

### 4.3 Publishing Rules
* Publish to exchange: `automobile.events.topic`
* Routing key: Equal to `eventType` (e.g. `inventory.stock.updated.v1`).
* Message properties: `deliveryMode: 2` (Persistent), `contentType: "application/json"`.

### 4.4 Consuming Rules & Idempotency
* **Queue Name**: `<your-appKey>.events`
* Declare queue with Dead-Letter Exchange argument:
  ```json
  { "x-dead-letter-exchange": "automobile.events.dlx", "x-dead-letter-routing-key": "dlq.<your-appKey>.events" }
  ```
* Bind your queue to `automobile.events.topic` with the pattern of events you subscribe to (e.g. `employee.#` or `employee.*.v1`).
* **Idempotency**: Store `eventId` in a processed-events table. If an event is re-delivered, acknowledge immediately and discard duplicate processing.

---

## 5. Health Check Endpoint

Expose a GET `/api/health` endpoint returning JSON:
```json
{
  "status": "UP",
  "service": "inventory",
  "version": "1.0.0",
  "timestamp": "2026-09-29T10:00:00Z"
}
```
HTTP status code `200` signifies healthy.
