# PENSA TTU — Full-Stack Website

A church website built with **React + Vite**, **Node.js + Express**, and **MySQL**.

## Project Structure

```
pensa_v2/
├── client/          # React frontend (Vite)
├── server/          # Express API
├── database/        # MySQL schema and seed data
├── index.html       # Original static site (kept for reference)
└── README.md
```

## Requirements

- Node.js 18+ (you have v24.1.0)
- npm 9+ (you have v11.3.0)
- MySQL 8.0+ (or MariaDB)

## Database Setup

1. Create the database and tables:

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

2. Update `server/.env` with your MySQL credentials:

   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=grace_harbor
   ```

## Install & Run

Open two terminals.

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Server runs at http://localhost:3001

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at http://localhost:5173

The Vite dev server proxies `/api/*` requests to the Express backend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | DB health check |
| GET | `/api/ministries` | List ministries |
| GET | `/api/sermons` | Latest sermons |
| GET | `/api/team` | Leadership team |
| GET | `/api/events` | Upcoming events |
| POST | `/api/visits` | Plan a visit form |
| POST | `/api/subscribers` | Newsletter signup |
| POST | `/api/contact` | Contact form |

## Notes

- The frontend uses Unsplash images as placeholders. Replace the `image_url` values in `database/seed.sql` and component source files with your own photos.
- The site is fully responsive for mobile, tablet, and desktop.
