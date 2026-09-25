# DevOps, Local Development, & Production Deployment Architecture

## 1. Port & Network Topology

To prevent local development conflicts and support clean ingress routing, all ecosystem services are mapped to dedicated, deterministic ports:

| Service | Container / Process Name | Protocol | Port | Description |
|---|---|---|---|---|
| **API Gateway** | `ecosystem_nginx` | HTTP/HTTPS | `80` / `443` | Reverse proxy and edge routing |
| **Ecosystem Portal** | `ecosystem_portal_web` | HTTP | `3000` | React/Vite Admin Dashboard |
| **Ecosystem Core API**| `ecosystem_core_api` | HTTP | `4000` | Node.js Express Central Governance |
| **HRFlow Web** | `hrflow_web` | HTTP | `3001` | React/Vite HRMS Frontend |
| **HRFlow Backend** | `hrflow_api` | HTTP | `5001` | Express HRMS Backend |
| **MAINTLY Web** | `maintly_web` | HTTP | `3002` | React/Vite Maintenance Frontend |
| **MAINTLY Backend** | `maintly_api` | HTTP | `5002` | Express Maintenance Backend |
| **Keycloak IAM** | `ecosystem_keycloak` | HTTP | `8080` | OpenID Connect Identity Provider |
| **PostgreSQL 18** | `ecosystem_postgres18` | TCP | `5433` | Relational Database Engine |
| **Redis 7** | `ecosystem_redis` | TCP | `6379` | In-memory cache & BullMQ queue |
| **RabbitMQ** | `ecosystem_rabbitmq` | AMQP / HTTP | `5672` / `15672` | Message broker & management UI |

---

## 2. Docker Compose Specification (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # -------------------------------------------------------------
  # INFRASTRUCTURE SERVICES
  # -------------------------------------------------------------
  postgres:
    image: postgres:18-alpine
    container_name: ecosystem_postgres18
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_MULTIPLE_DATABASES: ecosystem_core_db,hrflow_db,maintly_db
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init-databases.sh:/docker-entrypoint-initdb.d/init-databases.sh
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: ecosystem_keycloak
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/ecosystem_core_db?currentSchema=keycloak
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: postgres
    ports:
      - "8080:8080"
    volumes:
      - ./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: ecosystem_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: ecosystem_rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped

  # -------------------------------------------------------------
  # CORE PLATFORM
  # -------------------------------------------------------------
  ecosystem-core-api:
    build:
      context: ./ecosystem-core
      dockerfile: Dockerfile
    container_name: ecosystem_core_api
    environment:
      PORT: 4000
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ecosystem_core_db?schema=public
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: automobile-ecosystem
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  # -------------------------------------------------------------
  # API GATEWAY (NGINX)
  # -------------------------------------------------------------
  gateway:
    image: nginx:alpine
    container_name: ecosystem_gateway
    ports:
      - "80:80"
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - ecosystem-core-api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

---

## 3. Nginx API Gateway Configuration (`infra/nginx/nginx.conf`)

```nginx
events { worker_connections 1024; }

http {
  upstream portal_upstream { server host.docker.internal:3000; }
  upstream hrflow_web_upstream { server host.docker.internal:3001; }
  upstream maintly_web_upstream { server host.docker.internal:3002; }
  
  upstream core_api_upstream { server host.docker.internal:4000; }
  upstream hrflow_api_upstream { server host.docker.internal:5001; }
  upstream maintly_api_upstream { server host.docker.internal:5002; }
  upstream keycloak_upstream { server host.docker.internal:8080; }

  server {
    listen 80;
    server_name localhost;

    # Frontend Applications Routing
    location / {
      proxy_pass http://portal_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    location /apps/hrflow/ {
      proxy_pass http://hrflow_web_upstream/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    location /apps/maintly/ {
      proxy_pass http://maintly_web_upstream/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    # API Routing
    location /api/v1/core/ {
      proxy_pass http://core_api_upstream/api/v1/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/v1/hr/ {
      proxy_pass http://hrflow_api_upstream/api/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/v1/maintenance/ {
      proxy_pass http://maintly_api_upstream/api/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Identity Provider Routing
    location /auth/ {
      proxy_pass http://keycloak_upstream/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

---

## 4. CI/CD Pipeline (GitHub Actions `.github/workflows/ci.yml`)

```yaml
name: Ecosystem CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-ecosystem-core:
    name: Test Ecosystem Core API
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: ecosystem-core/package-lock.json
      - name: Install Dependencies
        working-directory: ./ecosystem-core
        run: npm ci
      - name: Validate Prisma Schema
        working-directory: ./ecosystem-core
        run: npx prisma validate
      - name: Run Core Test Suite
        working-directory: ./ecosystem-core
        run: npm test

  test-hrflow:
    name: Test HRFlow Application
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: hrflow_db
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install & Run HRFlow Tests
        working-directory: ./applications/HRFlow/backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/hrflow_db?schema=public
          JWT_SECRET: test_jwt_secret_key_12345
        run: |
          npm ci
          npx prisma db push
          npm test

  test-maintly:
    name: Test MAINTLY Application
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: maintly_db
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install & Run MAINTLY Tests
        working-directory: ./applications/Maintly/backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/maintly_db?schema=public
          JWT_SECRET: maintly_test_jwt_secret_key_2026
        run: |
          npm ci
          npx prisma db push
          npm test
```

---

## 5. Backup & Recovery Strategy

1. **Daily Automated Logical Backups**:
   - `pg_dump -Fc -d ecosystem_core_db > /backups/ecosystem_core_$(date +%F).dump`
   - Stored in encrypted S3 / Azure Blob Storage with 30-day retention and point-in-time recovery (PITR).
2. **Zero-Data-Loss Rollback Strategy**:
   - Schema migrations must be backward-compatible (expand-contract pattern).
   - Never drop columns in the same release as code deployment.
