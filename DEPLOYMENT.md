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
DB_PASSWORD=your_db_password
DB_NAME=u197926764_cop
JWT_SECRET=your_jwt_secret
```

> Replace `your_db_password`, `your_api_key`, `your_api_secret`, and `your_jwt_secret` with the real values.

5. Click **Deploy**. Once it finishes, copy the Render URL (e.g., `https://pensa-ttu-api.onrender.com`).
6. Paste that URL into the Vercel `VITE_API_URL` env var.

## Database note

Your MySQL database is hosted at `srv852.hstgr.io`. Make sure the database allows incoming connections from Render. You may need to whitelist Render's IP ranges in your database provider's firewall.

## Cloudinary note

Images are uploaded to the `pensattu` unsigned upload preset. The free Cloudinary plan should be enough for this site.
