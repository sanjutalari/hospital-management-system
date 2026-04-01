# 🏥 HMS - Quick Start Guide

## For Local Development

### Prerequisites
- Node.js v18 or higher
- PostgreSQL (or use SQLite for quick testing)
- Git

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd hospatel-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` - Use these for quick local testing:
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=super_secret_jwt_key_for_development_only
JWT_REFRESH_SECRET=super_secret_refresh_key_for_development_only
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

The default values should work:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database (for SQLite)
npx prisma db push

# Seed with sample data
npm run db:seed
```

You'll see:
```
✅ Seed complete!
   Admin:   admin@hms.com   / admin123
   Doctor:  doctor@hms.com  / doctor123
   Patient: patient@hms.com / patient123
```

### 4. Start Development Servers

**Option A: Automated (Recommended)**
```bash
# From project root
python run_hms.py
```

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Database UI:** `npx prisma studio` (opens http://localhost:5555)

### 6. Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hms.com | admin123 |
| Doctor | doctor@hms.com | doctor123 |
| Patient | patient@hms.com | patient123 |

## For Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

### Quick Deploy to Render + Vercel

1. **Backend (Render)**
   - Push code to GitHub
   - Create new Web Service on Render
   - Root: `backend`
   - Build: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start: `npm start`
   - Add PostgreSQL database
   - Set environment variables

2. **Frontend (Vercel)**
   - Import GitHub repo on Vercel
   - Root: `frontend`
   - Framework: Vite
   - Add env vars (point to Render backend URL)

## Features Overview

### Patient Portal
- View/book appointments
- Access medical records
- Upload lab reports
- Chat with doctors
- AI health assistant

### Doctor Portal
- Manage appointments
- View patient profiles
- Create medical records
- Write prescriptions
- Chat with patients

### Admin Portal
- System statistics
- User management
- Activate/deactivate users
- View all data

## Troubleshooting

### "Database not found"
```bash
cd backend
npx prisma db push
npm run db:seed
```

### "Port already in use"
```bash
# Change PORT in backend/.env
PORT=3002

# Or kill process on port 3001
# Windows: netstat -ano | findstr :3001
# Then: taskkill /PID <PID> /F
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Cannot connect to database"
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Try SQLite: `DATABASE_URL="file:./dev.db"`

## Next Steps

1. **Customize branding** - Update colors in `frontend/tailwind.config.js`
2. **Add more doctors** - Use admin panel or seed script
3. **Configure Cloudinary** - For real file uploads
4. **Add OpenAI key** - For real AI assistant
5. **Set up monitoring** - Add error tracking

## Useful Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm run db:push      # Sync schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed sample data
npm run db:studio    # Open database UI
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Project Structure

```
hospatel-management-system/
├── backend/
│   ├── src/
│   │   ├── config/       # Database, logger, env validation
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Socket.io, utilities
│   │   └── server.js     # Entry point
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js       # Sample data
│   ├── logs/             # Application logs
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Auth context
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API client
│   │   └── utils/        # PDF generator, helpers
│   └── .env              # Environment variables
├── SETUP.md              # Detailed setup guide
├── DEPLOYMENT.md         # Production deployment guide
└── README.md             # Project overview
```

## Need Help?

- Check logs: `backend/logs/error.log`
- View database: `npx prisma studio`
- Test API: http://localhost:3001/api/health
- Review code: All files are well-commented

---

Happy coding! 🚀
