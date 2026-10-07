# Deployment Guide: Vercel & Render

This guide outlines how to deploy the **Automobile Ecosystem** monorepo to **Vercel** (Frontends) and **Render** (Backends).

---

## 1. Frontends Deployment (Vercel)

Each frontend is a Vite + React Single-Page Application (SPA) configured with `vercel.json` rewrite rules to prevent 404s on route refresh.

In Vercel, create **3 separate projects** pointing to the same GitHub repository (`https://github.com/sandeep-asstdev/Eco-system-core`), selecting the respective **Root Directory**:

### A. Ecosystem Portal
* **Root Directory**: `ecosystem-core/portal`
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  ```env
  VITE_API_URL=https://<your-ecosystem-core-render-url>/api/v1
  VITE_KEYCLOAK_URL=https://<your-keycloak-url>
  VITE_KEYCLOAK_REALM=automobile-ecosystem
  VITE_KEYCLOAK_CLIENT_ID=ecosystem-portal
  ```

### B. HRFlow Frontend
* **Root Directory**: `applications/HRFlow/frontend`
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  ```env
  VITE_API_URL=https://<your-hrflow-render-url>/api
  VITE_KEYCLOAK_URL=https://<your-keycloak-url>
  VITE_KEYCLOAK_REALM=automobile-ecosystem
  VITE_KEYCLOAK_CLIENT_ID=hrflow-web
  ```

### C. MAINTLY Frontend
* **Root Directory**: `applications/Maintly/frontend`
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**:
  ```env
  VITE_API_URL=https://<your-maintly-render-url>/api
  VITE_KEYCLOAK_URL=https://<your-keycloak-url>
  VITE_KEYCLOAK_REALM=automobile-ecosystem
  VITE_KEYCLOAK_CLIENT_ID=maintly-web
  ```

---

## 2. Backends Deployment (Render)

### Option 1: Automated Deployment via Blueprint (`render.yaml`)
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository `sandeep-asstdev/Eco-system-core`.
4. Render will parse `render.yaml` and provision all 3 services automatically.
5. Provide your PostgreSQL database connection strings in the environment variable prompts.

### Option 2: Manual Web Service Setup on Render

#### Service 1: Ecosystem Core API
* **Type**: Web Service (Node.js)
* **Root Directory**: `ecosystem-core/backend`
* **Build Command**: `npm install && npx prisma generate`
* **Start Command**: `node src/server.js`
* **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=10000
  DATABASE_URL=postgresql://<user>:<password>@<host>/ecosystem_core_db?sslmode=require
  JWT_SECRET=<strong-random-secret>
  CLIENT_URL=https://<your-portal-vercel-url>
  KEYCLOAK_URL=https://<your-keycloak-url>
  ```

#### Service 2: HRFlow API
* **Type**: Web Service (Node.js)
* **Root Directory**: `applications/HRFlow/backend`
* **Build Command**: `npm install && npx prisma generate`
* **Start Command**: `node src/server.js`
* **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=10000
  DATABASE_URL=postgresql://<user>:<password>@<host>/hrflow_db?sslmode=require
  JWT_SECRET=<strong-random-secret>
  ECOSYSTEM_CORE_API_URL=https://<your-ecosystem-core-render-url>/api/v1
  KEYCLOAK_URL=https://<your-keycloak-url>
  ```

#### Service 3: MAINTLY API
* **Type**: Web Service (Node.js)
* **Root Directory**: `applications/Maintly/backend`
* **Build Command**: `npm install && npx prisma generate`
* **Start Command**: `node src/server.js`
* **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=10000
  DATABASE_URL=postgresql://<user>:<password>@<host>/maintly_db?sslmode=require
  JWT_SECRET=<strong-random-secret>
  HRFLOW_API_URL=https://<your-hrflow-render-url>/api
  KEYCLOAK_URL=https://<your-keycloak-url>
  ```

---

## 3. Database Migration Checklist for Production
When connecting to production PostgreSQL instances on Render/Supabase/Neon:
```bash
# Push schema to production databases
cd ecosystem-core/backend && DATABASE_URL="<core-db-url>" npx prisma db push
cd applications/HRFlow/backend && DATABASE_URL="<hrflow-db-url>" npx prisma db push
cd applications/Maintly/backend && DATABASE_URL="<maintly-db-url>" npx prisma db push
```
