# 🏥 HMS — Setup & Deployment Guide

## Prerequisites
- Node.js v18+
- PostgreSQL 14+ (local or cloud)
- Cloudinary account (free tier is fine)
- Git

---

## 1. Clone & Install Dependencies

```bash
# Clone the repo
git clone https://github.com/your-repo/hospital-management-system.git
cd hospital-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. PostgreSQL Setup

### Option A — Local PostgreSQL
```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Create database
psql -U postgres -c "CREATE DATABASE hms_db;"
```

### Option B — Cloud (Supabase — free)
1. Go to https://supabase.com → New Project
2. Copy the **Connection string** from Settings → Database
3. Paste into `DATABASE_URL` in your `.env`

---

## 3. Environment Variables

```bash
# Backend
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hms_db
JWT_SECRET=<generate with: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 64>
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

```bash
# Frontend
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

## 4. Run Database Migrations

```bash
cd backend

# Push schema to database (development)
npx prisma db push

# OR create a proper migration (production)
npx prisma migrate dev --name init

# Seed with sample data (optional)
npm run db:seed

# Open Prisma Studio to inspect data
npm run db:studio
```

---

## 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Running on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# → Running on http://localhost:5173
```

---

## 6. Seed Sample Data

Run `npm run db:seed` to create:
- Admin doctor: `doctor@hms.com` / `doctor123`
- Sample patient: `patient@hms.com` / `patient123`
- Sample appointments and medical records

---

## 7. API Endpoints Reference

### Authentication
| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | /api/auth/login       | Public  | Login (both roles)       |
| POST   | /api/auth/register/patient | Public | Register patient    |
| POST   | /api/auth/refresh     | Public  | Refresh access token     |
| POST   | /api/auth/logout      | Auth    | Logout                   |
| GET    | /api/auth/me          | Auth    | Get current user         |

### Appointments
| Method | Endpoint                        | Access  | Description                 |
|--------|---------------------------------|---------|-----------------------------|
| POST   | /api/appointments               | Patient | Book appointment            |
| GET    | /api/appointments/patient       | Patient | My appointments             |
| GET    | /api/appointments/doctor        | Doctor  | Doctor's appointments       |
| PATCH  | /api/appointments/:id/status    | Doctor  | Accept/reject/complete      |

### Medical Records
| Method | Endpoint                        | Access  | Description                 |
|--------|---------------------------------|---------|-----------------------------|
| POST   | /api/doctors/records            | Doctor  | Add record + prescriptions  |
| GET    | /api/patients/me/records        | Patient | My medical records          |
| GET    | /api/doctors/patients           | Doctor  | Patient list                |
| GET    | /api/doctors/patients/:id       | Doctor  | Full patient profile        |

### Reports (Files)
| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | /api/reports          | Patient | Upload PDF report        |
| GET    | /api/reports/me       | Patient | My reports               |
| GET    | /api/reports/patient/:id | Doctor | Patient's reports    |
| DELETE | /api/reports/:id      | Patient | Delete report            |

### Chat
| Method | Endpoint                  | Access | Description              |
|--------|---------------------------|--------|--------------------------|
| GET    | /api/chat/conversations   | Auth   | List conversations       |
| GET    | /api/chat/:userId         | Auth   | Message history          |

---

## 8. Deployment

### Backend → Render

1. Push backend to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo, select `backend/` as root
4. Settings:
   - **Build command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start command**: `npm start`
5. Add all environment variables from `.env`
6. Free tier: uses PostgreSQL add-on (add from Render dashboard)

### Frontend → Vercel

1. Push frontend to GitHub
2. Go to https://vercel.com → New Project
3. Import repo, set **Root Directory** to `frontend/`
4. Framework preset: **Vite**
5. Environment variables:
   - `VITE_API_URL` = your Render backend URL + `/api`
   - `VITE_SOCKET_URL` = your Render backend URL
6. Deploy → done!

### Database → Supabase (Production)

1. https://supabase.com → New project
2. Copy **Connection string** (URI format)
3. Set as `DATABASE_URL` in Render environment variables
4. Run `npx prisma migrate deploy` on first deploy

---

## 9. Cloudinary Setup

1. Sign up at https://cloudinary.com (free)
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Create folder `hms/reports` in Media Library (optional, auto-created)
4. Update `.env` with credentials

---

## 10. Project Commands Cheat Sheet

```bash
# Backend
npm run dev          # Start dev server (nodemon)
npm run start        # Start production server
npm run db:push      # Sync schema to DB (dev only)
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed sample data

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 11. Bonus Features Implementation Notes

### AI Suggestions (Optional)
- Add an endpoint `POST /api/ai/suggest` that passes patient symptoms to OpenAI API
- Use `gpt-4o-mini` for cost efficiency
- Return possible diagnoses (marked clearly as AI-assisted, not definitive)

### Push Notifications
- Use `web-push` npm package for browser push notifications
- Store subscription objects in a new `PushSubscriptions` table
- Fire from `notification.service.js` whenever appointment status changes

### Admin Panel
- Create admin user via seed script with `role: 'ADMIN'`
- Add routes protected by `authorize('ADMIN')`
- Admin can view all patients, doctors, appointments, deactivate accounts

---

## File Storage Notes

Reports are stored on **Cloudinary** with:
- Folder: `hms/reports/{patientId}/`
- Resource type: `raw` (for PDFs) or `image` for scans
- The `cloudinary_id` is stored in DB for deletion
- URLs are permanent (use `secure_url`)

For local development without Cloudinary, you can swap to `multer-disk-storage`:
```js
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
```

---

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT access tokens expire in 15 minutes
- [x] Refresh tokens stored hashed in DB, rotate on use
- [x] Helmet.js sets security headers
- [x] Rate limiting on all API routes (100 req/15min)
- [x] Role-based access control on every protected route
- [x] Input validation with express-validator
- [x] SQL injection prevented by Prisma ORM (parameterized queries)
- [x] CORS restricted to frontend URL only
- [x] File uploads restricted to PDF/image types, size-limited
- [ ] Add HTTPS (automatic on Render/Vercel)
- [ ] Add request logging (Winston or Morgan) for production
- [ ] Set up database backups on Supabase/Render
