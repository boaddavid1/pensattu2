# PENSA TTU Registration Portal

A standalone Vercel deployment of the PENSA TTU member registration form.
Self-contained: React frontend + Vercel serverless function that writes
directly to the `u197926764_pensattu` MySQL database.

## Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import the GitHub repo `boaddavid1/pensattu2`.
3. In **Root Directory**, select **`reg-portal`** (not the repo root).
4. Vercel will auto-detect Vite. Leave the build settings as-is (they come from `vercel.json`).
5. Add these **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | `srv852.hstgr.io` |
   | `DB_PORT` | `3306` |
   | `DB_USER` | `u197926764_pensattu` |
   | `DB_PASSWORD` | *(your DB password)* |
   | `DB_NAME` | `u197926764_pensattu` |
   | `ADMIN_TOKEN` | *(any random string — used to protect GET /api/reg)* |

6. Click **Deploy**.

After deploy, the registration form is live at your Vercel URL, and
`POST /api/reg` is handled by the serverless function in `api/reg.js`.

## Local development

```bash
cd reg-portal
npm install
npm run dev
```

The dev server runs on http://localhost:5175 and proxies `/api` to
http://localhost:3001 (set up in `vite.config.js`). For local API
testing, run the main project's Express server, or use `vercel dev`:

```bash
npm install -g vercel
vercel dev
```

## Structure

```
reg-portal/
├── api/
│   └── reg.js          # Vercel serverless function (POST submit + GET list)
├── public/
│   ├── pns.png         # PENSA logo
│   └── pns.svg
├── src/
│   ├── main.jsx        # React entry point
│   ├── Register.jsx    # 6-step registration wizard
│   └── Register.css    # Scoped styles (under .reg-page)
├── index.html
├── package.json
├── vercel.json         # Build config + rewrites + function settings
└── vite.config.js
```

## Admin access (optional)

`GET /api/reg` (list registrations) is protected. Set `ADMIN_TOKEN` to
a random string in Vercel env vars, then call:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "https://your-portal.vercel.app/api/reg"
```

For a full admin UI (search, filters, detail modal, delete), use the
main site's admin panel at `/admin/registrations` instead.
