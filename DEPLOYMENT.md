# Deployment Guide

## Frontend (Vercel)

1. Import the GitHub repo on [vercel.com](https://vercel.com).
2. Use the default settings — Vercel will use the root `vercel.json`.
3. Add these environment variables in the Vercel dashboard:

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=kw3hzord
VITE_CLOUDINARY_UPLOAD_PRESET=pensattu
```

## Backend (Render)

1. Create a free account on [render.com](https://render.com).
2. Click **New +** → **Blueprint** → connect your GitHub repo.
3. Render will read `render.yaml` and create a web service.
4. In the service's **Environment** tab, fill in all the secret values:

```
CLOUDINARY_CLOUD_NAME=kw3hzord
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=pensattu
DB_HOST=srv852.hstgr.io
DB_PORT=3306
DB_USER=u197926764_cop
DB_PASSWORD=Dwamena@90
DB_NAME=u197926764_cop
SEC_DB_NAME=u197926764_pensattu
SCHOOL_DB_HOST=srv852.hstgr.io
SCHOOL_DB_PORT=3306
SCHOOL_DB_USER=u197926764_sch
SCHOOL_DB_PASSWORD=Dwamena@90
SCHOOL_DB_NAME=u197926764_sch
JWT_SECRET=pensattu_secret_jwt_key_2026_dev
```

> The databases are hosted at `srv852.hstgr.io`. Ensure Remote MySQL in Hostinger hPanel allows connections from `%` (or Render's IP).

5. Click **Deploy**. Once it finishes, copy your Render web service URL (e.g., `https://pensa-ttu-api.onrender.com`).
6. Paste that URL into your Vercel `VITE_API_URL` environment variable:
   `VITE_API_URL=https://pensa-ttu-api.onrender.com/api`

## Deploying the School Retreat Module to Vercel

You can deploy the **school** module in either of two ways:

### Option A: Standalone Project on Vercel (Root Directory = `school`)
1. In Vercel, click **Add New Project** and pick this repo.
2. Under **Root Directory**, click **Edit** and select **`school`** (Vercel automatically detects it thanks to `school/package.json` and `school/vercel.json`).
3. Click **Deploy**.
4. The retreat portal will be live at `https://your-school-app.vercel.app` (with `/` for registration and `/admin` for gate scanner).

### Option B: Monorepo Root (Unified with the Main PENSA site)
1. Keep Root Directory as `./` in Vercel.
2. The main site deploys at `/`, and the retreat portal is available at:
   - Registration: `https://your-app.vercel.app/school`
   - Gate Scanner: `https://your-app.vercel.app/school/admin`


## Cloudinary note

Images are uploaded to the `pensattu` unsigned upload preset. The free Cloudinary plan should be enough for this site.
