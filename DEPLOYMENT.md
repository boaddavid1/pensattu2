# Unified Vercel Deployment Guide

Deploy both the **Frontend (Vite / React)** and **Backend (Express API Serverless Functions)** together on **Vercel** under a single project and domain. Render is no longer required.

---

## Benefits of Deploying Everything on Vercel

1. **Zero Cold-Boot Spin-Up Delays**: Unlike free-tier Render instances which sleep after 15 minutes of inactivity and take 50+ seconds to boot, Vercel Serverless Functions start in milliseconds.
2. **Same Origin / No CORS Issues**: Both the frontend (`/`) and API (`/api/*`) share the exact same domain (e.g., `https://your-app.vercel.app`), completely eliminating cross-origin errors.
3. **Single Dashboard**: Manage all deployment logs, domains, and environment variables in one place.
4. **All Sub-Portals Included**: The retreat school (`/school`), Operation Paga prayer portal (`/operation-paga`), student prayers (`/student-prayers`), and Admin Control Panel (`/control-panel`) all deploy automatically from this single repository.

---

## Step 1: Allow Remote MySQL on Hostinger

Your MySQL databases are hosted at `srv852.hstgr.io`. Because Vercel serverless functions run across dynamic IP addresses, you **must** allow connections from any host:

1. Log in to **Hostinger hPanel**.
2. Go to **Databases** → **Remote MySQL**.
3. Under **IP (IPv4 or IPv6)**, enter `%` (the percentage symbol permits connection from any authorized IP using valid user credentials).
4. Select each database user (`u197926764_cop`, `u197926764_pensattu`, `u197926764_sch`).
5. Click **Create / Add**.

---

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** → **Project**.
3. Connect your GitHub account and import your repository (**pensattu2**).
4. In the configuration screen:
   - **Framework Preset**: Other (or Vite)
   - **Root Directory**: `./` (leave default)
   - **Build and Output Settings**: Defaults are read directly from `vercel.json`:
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/dist`

---

## Step 3: Add Environment Variables in Vercel

In the **Environment Variables** section of your Vercel project, add the following variables:

### Database & Authentication
| Variable | Value |
|---|---|
| `DB_HOST` | `srv852.hstgr.io` |
| `DB_PORT` | `3306` |
| `DB_USER` | `u197926764_cop` |
| `DB_PASSWORD` | `YourDatabasePassword` *(see local .env)* |
| `DB_NAME` | `u197926764_cop` |
| `JWT_SECRET` | `YourJwtSecret` *(see local .env)* |

### SEC Member Management Database
| Variable | Value |
|---|---|
| `SEC_DB_HOST` | `srv852.hstgr.io` |
| `SEC_DB_PORT` | `3306` |
| `SEC_DB_USER` | `u197926764_pensattu` |
| `SEC_DB_PASSWORD` | `YourSecDatabasePassword` *(see local .env)* |
| `SEC_DB_NAME` | `u197926764_pensattu` |
| `SEC_JWT_SECRET` | `sec-pensa-ttu-jwt-secret-2024` |

### School Retreat Module Database
| Variable | Value |
|---|---|
| `SCHOOL_DB_HOST` | `srv852.hstgr.io` |
| `SCHOOL_DB_PORT` | `3306` |
| `SCHOOL_DB_USER` | `u197926764_sch` |
| `SCHOOL_DB_PASSWORD` | `YourSchoolDatabasePassword` *(see local .env)* |
| `SCHOOL_DB_NAME` | `u197926764_sch` |
| `SCH_DB_HOST` | `srv852.hstgr.io` |
| `SCH_DB_PORT` | `3306` |
| `SCH_DB_USER` | `u197926764_sch` |
| `SCH_DB_PASSWORD` | `YourSchoolDatabasePassword` *(see local .env)* |
| `SCH_DB_NAME` | `u197926764_sch` |

### Cloudinary (Media & Image Uploads)
| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | `kw3hzord` |
| `CLOUDINARY_API_KEY` | `358291957249418` |
| `CLOUDINARY_API_SECRET` | `YourCloudinaryApiSecret` *(see local .env)* |
| `CLOUDINARY_UPLOAD_PRESET` | `pensattu` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `kw3hzord` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `pensattu` |

### Prayer Admin, SMS & Web Push
| Variable | Value |
|---|---|
| `PRAYER_ADMIN_PASSWORD_HASH` | `YourPasswordHash` *(see local .env)* |
| `ALUMNI_ADMIN_USER` | `Alumni` |
| `ALUMNI_ADMIN_PASS` | `YourAlumniPassword` *(see local .env)* |
| `VAPID_PUBLIC_KEY` | `BMNYBZ8ubnm3Te9ZxdCjThy_TvkcE87T_Gnnt7AEu4GI9ayVD--h1RgthZQkDJWyiCaVX-Et_4ZxTiLBpokdeNY` |
| `VAPID_PRIVATE_KEY` | `YourVapidPrivateKey` *(see local .env)* |
| `VAPID_SUBJECT` | `mailto:hello@pensattu.example` |
| `ARKESEL_API_KEY` | *(Optional SMS API key)* |
| `ARKESEL_SENDER_ID` | `PENSA-TTU` |

> **Note on `VITE_API_URL`**: You **do not** need `VITE_API_URL` when deploying everything to Vercel! The client Vite app and Express API share the exact same domain, so the client automatically calls `/api/*` directly.

---

## Step 4: Click Deploy & Verify

Click **Deploy**. Once the deployment finishes, verify that everything is working:

1. **API Health Check**:
   Visit `https://your-project.vercel.app/api/health`
   Should return:
   ```json
   { "ok": true, "db": true }
   ```

2. **Main Website**:
   Visit `https://your-project.vercel.app/`

3. **Admin Control Panel**:
   Visit `https://your-project.vercel.app/control-panel`

4. **Retreat School Portal**:
   - Registration: `https://your-project.vercel.app/school`
   - Gate Scanner: `https://your-project.vercel.app/school/admin`

5. **Operation Paga Prayer Portals**:
   - Prayer Requests: `https://your-project.vercel.app/operation-paga`
   - Student Prayer Admin: `https://your-project.vercel.app/student-prayers`

---

## Local Development

You can continue developing locally just like before:

```bash
# Run backend server locally on port 3001
npm run start
# or
npm run dev:server

# Run client Vite dev server
npm run dev:client
```
