# Render Backend Deployment Guide — PENSA TTU API

This guide walks you through deploying the **PENSA TTU Express Backend API** on [Render](https://render.com).

---

## Architecture Overview

```
┌─────────────────────────────────┐
│       Frontend (Vercel)         │
│   Vite / React Client           │
│   (VITE_API_URL set to Render)  │
└────────────────┬────────────────┘
                 │ HTTPS API calls
                 ▼
┌────────────────────────────────────────────────────────┐
│                   RENDER WEB SERVICE                   │
│                                                        │
│   Express Backend API (Node 20)                        │
│   - Endpoints: /api/*                                  │
│   - Health Check: /api/health or /health               │
│   - Sub-portals: /school, /operation-paga              │
└────────────────┬───────────────────────────────────────┘
                 │ Remote MySQL (Port 3306)
                 ▼
┌────────────────────────────────────────────────────────┐
│                   HOSTINGER MYSQL                      │
│   Host: srv852.hstgr.io                                │
│   - Main DB:   u197926764_cop                          │
│   - SEC DB:    u197926764_pensattu                     │
│   - School DB: u197926764_sch                          │
└────────────────────────────────────────────────────────┘
```

---

## Pre-Requisite: Enable Remote MySQL on Hostinger

Because Render assigns dynamic IP addresses to services, Hostinger must allow incoming connections:

1. Log in to **Hostinger hPanel**.
2. Navigate to **Databases** → **Remote MySQL**.
3. Under **IP (IPv4 or IPv6)**, enter `%` (wildcard to allow authorized connections with valid username/password).
4. Select each database:
   - `u197926764_cop`
   - `u197926764_pensattu`
   - `u197926764_sch`
5. Click **Create / Add**.

---

## Deployment Option 1: Automatic Blueprint (Recommended)

The repository includes a pre-configured `render.yaml` blueprint.

1. Push your updated code to GitHub:
   ```bash
   git add .
   git commit -m "Configure backend deployment for Render"
   git push origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** (top right) → **Blueprint**.
4. Select your **`pensattu2`** repository.
5. Render reads `render.yaml` automatically and creates the `pensa-ttu-api` Web Service.
6. Fill in the database passwords, JWT secrets, and Cloudinary keys prompted on the configuration screen.
7. Click **Apply**.

---

## Deployment Option 2: Manual Web Service Setup

If you prefer setting up the service manually in the Render UI:

1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository (`pensattu2`).
3. Fill in the service settings:
   - **Name**: `pensa-ttu-api` (or your preferred name)
   - **Region**: Frankfurt (or closest to your database server)
   - **Branch**: `main`
   - **Root Directory**: `.` *(leave blank / default root)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install --omit=dev --no-workspaces`
   - **Start Command**: `node server/server.js`
   - **Instance Type**: `Free`
4. Expand **Advanced** and set:
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`
5. Click **Add Environment Variable** to add the variables listed below.
6. Click **Create Web Service**.

---

## Required Environment Variables on Render

Copy these values from your local `.env` file into the Render **Environment** tab:

### 1. Main Database & Authentication
| Key | Example / Value | Description |
|---|---|---|
| `NODE_VERSION` | `20` | Node.js version |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port assigned by Render |
| `DB_HOST` | `srv852.hstgr.io` | Hostinger MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `u197926764_cop` | Main database user |
| `DB_PASSWORD` | *(from your .env)* | Main database password |
| `DB_NAME` | `u197926764_cop` | Main database name |
| `JWT_SECRET` | *(from your .env)* | JWT signing secret |

### 2. SEC Member Management Module
| Key | Example / Value | Description |
|---|---|---|
| `SEC_DB_HOST` | `srv852.hstgr.io` | SEC module DB host |
| `SEC_DB_PORT` | `3306` | SEC MySQL port |
| `SEC_DB_USER` | `u197926764_pensattu` | SEC database user |
| `SEC_DB_PASSWORD` | *(from your .env)* | SEC database password |
| `SEC_DB_NAME` | `u197926764_pensattu` | SEC database name |
| `SEC_JWT_SECRET` | *(from your .env)* | SEC JWT secret |

### 3. School Retreat & QR Scanner Module
| Key | Example / Value | Description |
|---|---|---|
| `SCHOOL_DB_HOST` | `srv852.hstgr.io` | School module DB host |
| `SCHOOL_DB_PORT` | `3306` | School MySQL port |
| `SCHOOL_DB_USER` | `u197926764_sch` | School database user |
| `SCHOOL_DB_PASSWORD` | *(from your .env)* | School database password |
| `SCHOOL_DB_NAME` | `u197926764_sch` | School database name |

### 4. Cloudinary (Media & Image Uploads)
| Key | Example / Value | Description |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | `kw3hzord` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `358291957249418` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | *(from your .env)* | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET`| `pensattu` | Cloudinary preset |

### 5. Prayer Admin, Alumni & Notifications
| Key | Example / Value | Description |
|---|---|---|
| `PRAYER_ADMIN_PASSWORD_HASH` | *(from your .env)* | Operation Paga student password hash |
| `ALUMNI_ADMIN_USER` | `Alumni` | Alumni admin username |
| `ALUMNI_ADMIN_PASS` | *(from your .env)* | Alumni admin password |
| `VAPID_PUBLIC_KEY` | *(from your .env)* | Web Push public key |
| `VAPID_PRIVATE_KEY` | *(from your .env)* | Web Push private key |
| `VAPID_SUBJECT` | `mailto:hello@pensattu.example` | Web Push contact mail |
| `ARKESEL_API_KEY` | *(optional)* | Arkesel SMS API key |
| `ARKESEL_SENDER_ID` | `PENSA-TTU` | Arkesel SMS Sender ID |

---

## Connect Your Frontend to Render Backend

Once Render finishes deploying, it gives you a public URL (e.g. `https://pensa-ttu-api.onrender.com`).

### If Frontend is on Vercel:
1. Go to your **Vercel Project** → **Settings** → **Environment Variables**.
2. Add / Update:
   ```env
   VITE_API_URL=https://pensa-ttu-api.onrender.com/api
   ```
3. Trigger a redeploy on Vercel (**Deployments** → **Redeploy** on latest commit).

---

## Verifying Deployment

Once the Render service status turns to **Live**:

1. **Root API Status**:
   Visit `https://pensa-ttu-api.onrender.com/`
   Expected response:
   ```json
   {
     "ok": true,
     "name": "PENSA TTU API",
     "status": "online"
   }
   ```

2. **Database & Services Health Check**:
   Visit `https://pensa-ttu-api.onrender.com/api/health`
   Expected response:
   ```json
   {
     "ok": true,
     "db": true,
     "databases": {
       "main": { "ok": true, "connected": true },
       "sec": { "ok": true, "connected": true },
       "school": { "ok": true, "connected": true }
     }
   }
   ```

3. **Sub-Portals**:
   - Retreat School: `https://pensa-ttu-api.onrender.com/school`
   - Operation Paga Prayer: `https://pensa-ttu-api.onrender.com/operation-paga`
   - Student Prayer Admin: `https://pensa-ttu-api.onrender.com/student-prayers`

---

## Note on Render Free Tier Spin-Down

Render's free tier spins down web services after **15 minutes of inactivity**. The first request after sleep takes approximately 30–50 seconds to wake up.
- To prevent cold start delays, you can use a free monitoring service like [UptimeRobot](https://uptimerobot.com) to ping `https://pensa-ttu-api.onrender.com/api/health` every 10 minutes.
- Alternatively, upgrading to Render's **Starter** tier (\$7/month) keeps the service running continuously with zero spin-down.

