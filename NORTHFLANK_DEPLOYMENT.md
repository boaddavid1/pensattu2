# Northflank Deployment Guide — PENSA TTU Backend & MySQL

This guide walks you through deploying the **PENSA TTU Backend API** and **Managed MySQL Database** on [Northflank](https://northflank.com).

---

## Architecture Overview

```
┌─────────────────────────────────┐
│         Vercel (or App)         │
│         Frontend Client         │
└────────────────┬────────────────┘
                 │ Public HTTPS
                 ▼
┌────────────────────────────────────────────────────────┐
│                   NORTHFLANK PROJECT                   │
│                                                        │
│   ┌──────────────────────────┐                         │
│   │   Express API Service    │                         │
│   │   (Built via Dockerfile) │                         │
│   │   Port: 3001             │                         │
│   └────────────┬─────────────┘                         │
│                │ Private VPC Network (Fast & Secure)   │
│                ▼                                       │
│   ┌──────────────────────────┐                         │
│   │       MySQL Addon        │                         │
│   │       MySQL 8.0          │                         │
│   └──────────────────────────┘                         │
└────────────────────────────────────────────────────────┘
```

---

## Step 1: Create a Project on Northflank

1. Sign up or log in at [northflank.com](https://northflank.com).
2. Click **Create Project**.
3. Name it: `pensattu` (select your preferred region, e.g. Europe or US).

---

## Step 2: Create the MySQL Database Addon

1. Inside your project, click **Addons** in the left sidebar.
2. Click **Create Addon**.
3. Select **MySQL** (version `8.0`).
4. Set **Addon name**: `pensattu-db`.
5. Select your compute plan (the Developer plan or Starter plan).
6. Click **Create Addon**.
7. Once created, Northflank displays your database details:
   - **Internal Host**: e.g., `pensattu-db--<id>.northflank.internal`
   - **External Host**: (for connecting from your computer)
   - **Port**: `3306`
   - **Username**: (usually `root` or generated)
   - **Password**: (click to copy)
   - **Database**: `grace_harbor` (or default `northflank`)

---

## Step 3: Deploy the Backend Service

1. In your project, click **Services** in the left sidebar.
2. Click **Create Service** → Select **Combined Service** (Build and deploy from Git).
3. Set **Service name**: `pensattu-backend`.
4. Under **Source**:
   - Choose **GitHub**.
   - Select repository: **`pensattu2`**.
   - Branch: `main` (or your active branch).
5. Under **Build Configuration**:
   - Build Type: **Dockerfile**
   - Dockerfile path: `./Dockerfile` (default)
   - Context: `./` (default)
6. Under **Networking**:
   - Click **Add Port**.
   - Name: `http`
   - Port: `3001`
   - Protocol: `HTTP`
   - Enable **Public access** (generates a `*.northflank.app` domain).
7. Under **Health Checks**:
   - Type: `HTTP`
   - Path: `/api/health`
   - Port: `3001`
8. Under **Environment Variables**:
   You can either **Link Addon** (`pensattu-db`) or manually add:
   ```env
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=pensattu_secret_jwt_key_2026_dev
   SEC_JWT_SECRET=pensattu_sec_secret_jwt_key_2026

   # If using Northflank Addon Linking, these are injected automatically.
   # If setting manually, paste credentials from Step 2:
   DB_HOST=pensattu-db--<id>.northflank.internal
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=<YourAddonPassword>
   DB_NAME=grace_harbor
   ```
9. Click **Create Service**.

Northflank will now fetch your code, build the Docker container, run the health check, and assign a live URL like:
`https://pensattu-backend-xxxx.northflank.app`

---

## Step 4: Verify Deployment

1. Visit your public URL:
   `https://pensattu-backend-xxxx.northflank.app/api/health`
2. You should receive:
   ```json
   {
     "ok": true,
     "db": true,
     "message": "All databases connected"
   }
   ```
   *(On first boot, the Express server automatically runs `syncSchema()` to create all tables for the main site, SEC module, and retreat school).*

---

## Step 5: (Optional) Seed Initial Data into Northflank

To populate initial sermons, events, and ministries into your new Northflank MySQL database:

1. In Northflank, under **Addons** → **pensattu-db**, copy the **External Host**, **Port**, and **Password**.
2. On your local machine, run:
   ```bash
   node scripts/seed-db.js
   ```
   *(with `DB_HOST`, `DB_PASSWORD`, etc. set in `.env`)*
   or use Northflank's built-in phpMyAdmin / Database query editor to paste `database/seed.sql`.

---

## Step 6: Connect Your Frontend (Vercel)

If your frontend is deployed on Vercel:
1. In Vercel, go to **Settings** → **Environment Variables**.
2. Add:
   - `VITE_API_URL` = `https://pensattu-backend-xxxx.northflank.app/api`
3. Trigger a redeploy on Vercel.
Your frontend will now fetch all live data from your Northflank backend!
