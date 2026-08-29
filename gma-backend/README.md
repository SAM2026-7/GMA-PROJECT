# GMA City Complex — Backend API

Node.js + Express + SQLite backend for the GMA City Complex frontend.

## Quick Start

```bash
cd gma-backend
npm install
npm run migrate
npm run seed
npm run dev
```

Server runs on `http://localhost:3000`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/submissions` | No | Create booking submission |
| `GET` | `/api/submissions` | Yes | List all submissions (paginated) |
| `GET` | `/api/submissions/:id` | Yes | Get single submission |
| `PATCH` | `/api/submissions/:id/status` | Yes | Update status |
| `DELETE` | `/api/submissions/:id` | Yes | Delete submission |
| `POST` | `/api/auth/login` | No | Admin login (returns JWT) |
| `GET` | `/api/auth/me` | Yes | Verify admin session |

## Environment Variables

Copy `.env.example` to `.env` and update values:

```env
PORT=3000
DATABASE_PATH=./data/gma.db
JWT_SECRET=<strong-random-string>
JWT_EXPIRY=8h
ADMIN_EMAIL=admin@gmacitycomplex.org
ADMIN_PASSWORD=admin123
ENABLE_EMAIL=false
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user
SMTP_PASS=your-ethereal-pass
ADMIN_ALERT_EMAIL=admin@gmacitycomplex.org
CORS_ORIGIN=http://localhost:3000,http://localhost:5500,file://
```

## Admin Login

Default credentials (from `.env`):
- Email: `admin@gmacitycomplex.org`
- Password: `admin123`

Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then re-run `npm run seed`.

## Frontend Integration

The frontend (`script.js`) automatically detects if it's running on `localhost:3000` or `localhost:5500` (Live Server) and routes API calls to `http://localhost:3000`. In production, it uses `window.location.origin`.

## Database

- SQLite file stored at `data/gma.db` (gitignored)
- Schema is in `migrations/schema.sql`
- Run `npm run migrate` to create tables
- Run `npm run seed` to create the default admin

## Testing

```bash
npm run test
```

## Deploy

1. Push to GitHub
2. Connect to Render / Railway / Fly.io
3. Set environment variables
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

## Project Structure

```
gma-backend/
├── src/
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Entry point
│   ├── config/          # Environment config
│   ├── db/              # SQLite database layer
│   ├── middleware/      # Auth, errors, rate limiting
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── utils/           # Zod validators
│   └── types/           # TypeScript interfaces
├── migrations/
│   └── schema.sql       # Database schema
├── data/                # SQLite DB (gitignored)
├── package.json
├── tsconfig.json
├── knexfile.ts
└── .env.example
```
