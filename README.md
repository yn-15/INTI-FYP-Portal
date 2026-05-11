# INTI FYP Management System

Industry Collaboration & Final Year Project Management System  
**INTI International College Subang**

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vite + React + React Router         |
| Icons      | Lucide React                        |
| Backend    | Node.js + Express                   |
| ORM        | Prisma                              |
| Database   | PostgreSQL                          |
| Auth       | JWT (JSON Web Tokens) + bcrypt      |
| Deploy FE  | Netlify                             |
| Deploy BE  | Railway                             |

---

## Project Structure

```
fyp-project/
├── fyp-frontend/     ← React frontend
├── fyp-backend/      ← Express + Prisma backend
├── netlify.toml      ← Netlify deployment config
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (local) OR a free Railway PostgreSQL database

---

### Step 1 — Clone and install

```bash
# Frontend
cd fyp-frontend
npm install

# Backend
cd ../fyp-backend
npm install
```

---

### Step 2 — Configure backend environment

```bash
cd fyp-backend
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/fyp_db"
JWT_SECRET="your-long-random-secret-here"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

---

### Step 3 — Set up the database

```bash
cd fyp-backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with demo data
npm run db:seed
```

---

### Step 4 — Run the development servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd fyp-backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd fyp-frontend
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## Demo Credentials

| Role             | Email                                    | Password        |
|------------------|------------------------------------------|-----------------|
| Admin            | admin@newinti.edu.my                     | Admin@1234      |
| Lecturer (IT)    | robina.tinawin@newinti.edu.my            | Lecturer@1234   |
| Lecturer (Biz)   | jonathan.lee@newinti.edu.my              | Lecturer@1234   |
| Student (IT)     | J22013456@student.newinti.edu.my         | Student@1234    |
| Student (IT)     | J22013789@student.newinti.edu.my         | Student@1234    |
| Employer         | ahmad.razif@abctech.com                  | Employer@1234   |
| Employer         | sarah.wong@xyzsolutions.com              | Employer@1234   |

---

## Deployment

### Frontend — Netlify

1. Push the monorepo to GitHub
2. Connect to Netlify → New Site from GitHub
3. Netlify auto-reads `netlify.toml` — no extra config needed
4. Set environment variable in Netlify:  
   `VITE_API_URL` = your Railway backend URL

### Backend — Railway

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub → select `fyp-backend` folder
3. Add a PostgreSQL plugin in Railway
4. Set environment variables:
   - `DATABASE_URL` (auto-set by Railway PostgreSQL plugin)
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Netlify URL)
5. After deploy, run migrations:  
   `npx prisma migrate deploy`  
   `npm run db:seed`

---

## API Endpoints

| Method | Endpoint                        | Access          |
|--------|---------------------------------|-----------------|
| POST   | /api/auth/register              | Public          |
| POST   | /api/auth/login                 | Public          |
| GET    | /api/auth/me                    | Authenticated   |
| GET    | /api/users                      | Admin           |
| GET    | /api/users/pending              | Admin           |
| POST   | /api/users                      | Admin           |
| PUT    | /api/users/:id/approve          | Admin           |
| PUT    | /api/users/:id/reject           | Admin           |
| PUT    | /api/users/:id/deactivate       | Admin           |
| GET    | /api/proposals                  | All (scoped)    |
| POST   | /api/proposals                  | Employer        |
| PUT    | /api/proposals/:id/approve      | Lecturer        |
| PUT    | /api/proposals/:id/reject       | Lecturer        |
| POST   | /api/proposals/selection        | Student         |
| DELETE | /api/proposals/selection        | Student (≤7d)   |
| GET    | /api/teams                      | Admin/Lecturer  |
| POST   | /api/teams                      | Lecturer        |
| PUT    | /api/teams/:id/assign           | Lecturer        |
| PUT    | /api/teams/:id/confirm          | Lecturer        |
| GET    | /api/chat/:proposalId           | Lecturer/Employer/Admin |
| POST   | /api/chat/:proposalId           | Lecturer/Employer |
| GET    | /api/notifications              | All             |
| POST   | /api/notifications              | Admin/Lecturer  |
| GET    | /api/reports/admin              | Admin           |
| GET    | /api/reports/lecturer           | Lecturer        |
| GET    | /api/audit                      | Admin           |

---

## Registration Email Rules

| Role     | Email Format                          |
|----------|---------------------------------------|
| Student  | `J[StudentID]@student.newinti.edu.my` |
| Lecturer | `[name]@newinti.edu.my`               |
| Employer | Any non-INTI company email            |

All accounts are **Pending** until approved by Admin.  
Admin assigns department (IT or Business) during approval.
