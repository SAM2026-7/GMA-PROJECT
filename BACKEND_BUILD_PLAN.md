# GMA City Complex — Backend Build Plan

## 1. Project Overview
- **Frontend**: Static HTML/CSS/JS site with sections: Home, About, Programs, Service Times, Booking Form, Giving, Contact, Admin Submissions.
- **Current data flow**: Booking form writes to `localStorage`; admin page reads from `localStorage`.
- **Backend goal**: Replace client-side persistence with a real API + database, add email notifications, secure admin auth, and make the site production-ready.

---

## 2. Technology Stack (Recommended)

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 20+ | Consistent with typical JS stacks; easy to host |
| Framework | Express.js | Minimal, battle-tested, large ecosystem |
| Database | SQLite (better-sqlite3) | Zero-config, single file, perfect for a small org; can migrate to Postgres later |
| ORM | Knex.js | Query builder for migrations and SQL without a heavy ORM |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless admin auth; simple to implement |
| Email | Nodemailer + Ethereal or SMTP | Send booking confirmations and admin alerts |
| Validation | Zod | Schema validation for request bodies |
| API Docs | OpenAPI 3 (swagger-ui-express) | Auto-generated docs for future maintainers |
| Hosting | Render / Railway / Fly.io | Free/cheap tiers with one-click deploys |

Alternative stack (if you prefer no Node):
- **Firebase**: Firestore + Cloud Functions + Firebase Auth — fastest to ship, minimal server management.

---

## 3. Feature Breakdown

### 3.1 Core API Endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/submissions` | Create a booking submission | Public |
| `GET` | `/api/submissions` | List all submissions (paginated) | Admin |
| `GET` | `/api/submissions/:id` | Get single submission | Admin |
| `PATCH` | `/api/submissions/:id/status` | Update status (new, contacted, closed) | Admin |
| `DELETE` | `/api/submissions/:id` | Delete submission | Admin |
| `POST` | `/api/auth/login` | Admin login (returns JWT) | Public |
| `GET` | `/api/auth/me` | Verify current admin session | Admin |
| `GET` | `/health` | Health check / uptime | Public |

### 3.2 Data Model

**`submissions` table**
```sql
- id            INTEGER PRIMARY KEY AUTOINCREMENT
- name          TEXT NOT NULL
- phone         TEXT NOT NULL
- program       TEXT NOT NULL   -- 'Counselling' | 'Healing' | 'Prayer'
- preferred_date TEXT NOT NULL  -- ISO date string
- message       TEXT
- status        TEXT DEFAULT 'new' -- 'new' | 'contacted' | 'closed'
- submitted_at  TEXT NOT NULL    -- ISO timestamp
- created_at    TEXT NOT NULL DEFAULT (datetime('now'))
- updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
```

**`admins` table**
```sql
- id            INTEGER PRIMARY KEY AUTOINCREMENT
- email         TEXT UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- name          TEXT
- created_at    TEXT NOT NULL DEFAULT (datetime('now'))
```

---

## 4. Step-by-Step Implementation Plan

### Phase 0 — Setup
1. Initialize repo: `npm init -y`
2. Install dependencies:
   ```bash
   npm i express better-sqlite3 knex zod jsonwebtoken bcrypt nodemailer swagger-ui-express cors dotenv
   npm i -D tsx @types/express @types/better-sqlite3 @types/knex @types/zod @types/jsonwebtoken @types/bcrypt @types/nodemailer @types/cors typescript
   ```
3. Create folder structure:
   ```
   src/
     config/
     db/
     middleware/
     routes/
     controllers/
     services/
     utils/
     types/
     app.ts
     server.ts
   migrations/
   tests/
   .env.example
   tsconfig.json
   ```

### Phase 1 — Database & Migrations
1. Configure Knex with SQLite file (e.g., `data/gma.db`).
2. Write migrations:
   - `20240101000001_create_submissions.js`
   - `20240101000002_create_admins.js`
3. Seed initial admin (hash password with bcrypt, store in env or seed script).
4. Run `knex migrate:latest`.

### Phase 2 — Core API
1. **Express setup**: CORS, JSON body parser, helmet, morgan for logging.
2. **Database helper**: thin wrapper around `better-sqlite3` or Knex connection.
3. **Zod schemas**:
   - `CreateSubmissionSchema`
   - `UpdateSubmissionStatusSchema`
   - `LoginSchema`
4. **Routes & Controllers**:
   - Implement `POST /api/submissions` with validation.
   - Implement `GET /api/submissions` with pagination (`?page=1&limit=20`).
   - Implement `GET /api/submissions/:id`.
   - Implement `PATCH /api/submissions/:id/status`.
   - Implement `DELETE /api/submissions/:id`.
5. **Error handling**: centralized error handler middleware (4xx, 5xx).

### Phase 3 — Authentication
1. `POST /api/auth/login`: verify email/password, sign JWT (expiry 8h), return `{ token, admin }`.
2. `authMiddleware`: verify `Authorization: Bearer <token>`, attach `req.admin`.
3. Protect admin routes with `authMiddleware`.
4. Frontend: update `script.js` to `POST` booking form to `/api/submissions` instead of `localStorage`.

### Phase 4 — Email Notifications
1. Configure Nodemailer transporter (SMTP or Ethereal for testing).
2. **On new submission**:
   - Send confirmation to visitor: "Your booking for {program} on {date} has been received."
   - Send alert to admin: "New booking from {name} ({phone}) for {program}."
3. Create email templates (plain-text + optional HTML).
4. Make email sending optional/configurable via `ENABLE_EMAIL=true/false`.

### Phase 5 — Frontend Integration
1. Update `script.js`:
   - Replace `localStorage` calls with `fetch('/api/submissions', { method: 'POST', ... })`.
   - Handle success/error UI.
2. Update `submissions.html`:
   - Replace client-side render with `fetch('/api/submissions')`.
   - Add simple login gate (redirect to `#login` if no token).
   - Add status badges and delete/update controls.
3. Optional: add a lightweight login modal on the admin page.

### Phase 6 — Admin Dashboard (Optional but Recommended)
If you want a richer admin experience:
- Build a small React/Vue/HTMX dashboard at `/admin` to:
  - View paginated submissions.
  - Filter by program, status, date range.
  - Update status inline.
  - Export to CSV.
- This can be added later without touching the public API.

### Phase 7 — Testing
1. Unit tests (Vitest or Jest):
   - Zod validation schemas.
   - Auth logic (hashing, JWT).
   - Submission service methods.
2. Integration tests (supertest):
   - Full request/response cycle for each endpoint.
3. Seed script to insert test data.

### Phase 8 — Deployment
1. Add `Dockerfile` (multi-stage build with Node 20 Alpine).
2. Add `docker-compose.yml` (app + SQLite volume) for local dev.
3. Add `render.yaml` or `railway.toml` for one-click deploy.
4. Environment variables:
   ```env
   PORT=3000
   DATABASE_PATH=./data/gma.db
   JWT_SECRET=<strong-random-string>
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD_HASH=<bcrypt-hash>
   ENABLE_EMAIL=true
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=...
   SMTP_PASS=...
   ADMIN_ALERT_EMAIL=admin@example.com
   ```

---

## 5. Security & Production Readiness Checklist
- [ ] Enforce HTTPS (TLS termination at host/CDN).
- [ ] Rate-limit `POST /api/submissions` (express-rate-limit) to prevent spam.
- [ ] Sanitize all inputs (Zod handles types; consider `express-validator` or `DOMPurify` for message field).
- [ ] Set security headers (helmet).
- [ ] CORS allowlist (only your domain in production).
- [ ] JWT secret stored in env, never committed.
- [ ] SQL parameterized queries (Knex handles this).
- [ ] Backup SQLite file regularly (simple file copy or scheduled export).

---

## 6. File Structure (Target)

```
gma-backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── index.ts
│   ├── db/
│   │   └── knex.ts
│   ├── migrations/
│   │   ├── 20240101000001_create_submissions.ts
│   │   └── 20240101000002_create_admins.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── routes/
│   │   ├── submissions.ts
│   │   ├── auth.ts
│   │   └── health.ts
│   ├── controllers/
│   │   ├── submissionsController.ts
│   │   └── authController.ts
│   ├── services/
│   │   ├── submissionService.ts
│   │   ├── emailService.ts
│   │   └── adminService.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── migrations/          # Knex migrations (or keep inside src/db/migrations)
├── data/                # SQLite DB file (gitignored)
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── knexfile.ts
└── README.md
```

---

## 7. Suggested Timeline
| Day | Deliverable |
|---|---|
| 1 | Repo setup, DB schema, migrations, seed admin |
| 2 | Core API endpoints + validation |
| 3 | Auth middleware + login endpoint |
| 4 | Email service + submission confirmation emails |
| 5 | Frontend JS integration (replace localStorage) |
| 6 | Admin page auth + API integration |
| 7 | Testing (unit + integration) |
| 8 | Docker, deploy to Render/Railway, smoke test |

---

## 8. Immediate Next Steps
1. Confirm the tech stack (Node/Express + SQLite vs Firebase).
2. Initialize the repo and install dependencies.
3. Create the database schema and run migrations.
4. Build the first endpoint (`POST /api/submissions`) and test with Postman/curl.
5. Update the frontend to call the API instead of `localStorage`.
