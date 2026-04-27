# 🚀 Setup & Installation Guide - Hospital Management System

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Visual Studio Code** (Optional) - [Download](https://code.visualstudio.com/)

### Verify Installations

```bash
node --version        # Should show v18+
npm --version         # Should show v9+
psql --version        # Should show PostgreSQL 14+
git --version         # Should show git version
```

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/sanjutalari/hospital-management-system.git

# Navigate to project directory
cd hospital-management-system

# List contents
ls -la
```

---

## Step 2: Setup Backend

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install all dependencies listed in `package.json`:
- express (Web framework)
- prisma (ORM)
- socket.io (Real-time events)
- jsonwebtoken (JWT auth)
- bcryptjs (Password hashing)
- dotenv (Environment variables)
- cors (Cross-origin requests)
- helmet (Security headers)
- morgan (HTTP logging)
- winston (Application logging)
- multer (File uploads)
- cloudinary (Cloud storage)

### 2.3 Create Database

#### Option A: PostgreSQL (Production)

```bash
# Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL service
# Windows: Services (pgAdmin 4)
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
psql -U postgres
CREATE DATABASE hms_db;
\q
```

#### Option B: SQLite (Development - Quickstart)

SQLite is automatically used if PostgreSQL is not available. No setup needed!

### 2.4 Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` with your configuration:

**For PostgreSQL:**
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/hms_db"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Cloudinary Configuration (Optional - for cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

**For SQLite:**
```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Rest same as above...
```

### 2.5 Initialize Prisma & Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 2.6 Verify Backend Setup

```bash
# Start backend server
npm start

# Expected output:
# ✓ Server running on http://localhost:5000
# ✓ Database connected
# ✓ Socket.io listening
```

The server should run without errors. Keep this terminal open or run in background.

---

## Step 3: Setup Frontend

### 3.1 Open New Terminal & Navigate to Frontend

```bash
# In a new terminal/command prompt
cd hospital-management-system/frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Create Frontend Environment File

Create `.env` file in frontend directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Optional: Analytics
REACT_APP_ENABLE_ANALYTICS=true
```

### 3.4 Start Frontend Development Server

```bash
npm start

# Browser should automatically open to http://localhost:3000
# If not, manually visit: http://localhost:3000
```

---

## Step 4: Verify Installation

### 4.1 Backend Verification

Terminal should show:
```
✓ Express server running on port 5000
✓ Database connected
✓ Prisma client ready
✓ Socket.io listening
```

### 4.2 Frontend Verification

- Browser opens to `http://localhost:3000`
- You should see the HMS login page
- No console errors

### 4.3 Test API Connection

```bash
# In a new terminal
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","database":"connected"}
```

---

## Step 5: Database Setup & Testing

### 5.1 Access Database via Prisma Studio

```bash
# In backend directory
npx prisma studio

# Opens http://localhost:5555
# Browse and manage your database
```

### 5.2 Seed Sample Data (Optional)

Create `backend/prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create sample patient
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'PATIENT',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  const patient = await prisma.patient.create({
    data: {
      code: 'PAT-0001',
      userId: patientUser.id,
      dateOfBirth: new Date('1990-01-15'),
      gender: 'M',
      bloodGroup: 'O+',
      address: '123 Main St',
      phoneNumber: '+1234567890',
    },
  });

  // Create sample doctor
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'DOCTOR',
      firstName: 'Jane',
      lastName: 'Smith',
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      code: 'DOC-0001',
      userId: doctorUser.id,
      specialization: 'Cardiologist',
      licenseNumber: 'MD123456',
      qualifications: 'MBBS, MD',
      experience: 10,
      consultationFee: 500,
    },
  });

  console.log('✓ Sample data seeded successfully');
  console.log('Patient:', patient);
  console.log('Doctor:', doctor);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seeding:

```bash
npx prisma db seed
```

---

## Step 6: User Testing

### 6.1 Create Test Account

1. Open `http://localhost:3000`
2. Click "Register" button
3. Fill in patient details:
   - Email: `testpatient@example.com`
   - Password: `TestPass123!`
   - Name: Test Patient
   - Blood Group: O+
4. Click "Register"

### 6.2 Login

1. Click "Login"
2. Enter credentials
3. You should be redirected to patient dashboard

### 6.3 Test Features

- View Profile
- Book Appointment (select a doctor)
- View Appointments
- Send Message to Doctor
- Upload Medical Report

---

## Step 7: Development Workflow

### 7.1 File Structure During Development

```
hospital-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   └── server.js         # Entry point
│   ├── schema.prisma         # Database schema
│   ├── package.json
│   ├── .env                  # Environment variables
│   └── node_modules/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API & Socket services
│   │   ├── context/          # React context
│   │   └── App.jsx           # Main component
│   ├── package.json
│   ├── .env                  # Frontend config
│   └── node_modules/
│
└── docs/                     # Documentation
```

### 7.2 Hot Reload Development

**Backend** (with nodemon):
```bash
cd backend
npm run dev
```

**Frontend** (automatic with React):
```bash
cd frontend
npm start
```

### 7.3 Making Changes

**Backend Changes:**
1. Edit files in `backend/src/`
2. Server auto-reloads (with nodemon)
3. Test with API calls

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Page auto-refreshes in browser
3. Check browser console for errors

---

## Step 8: Build for Production

### 8.1 Build Backend

```bash
cd backend

# Build (if applicable)
npm run build

# Start production server
npm start
```

### 8.2 Build Frontend

```bash
cd frontend

# Create production build
npm run build

# This creates an optimized `build/` folder
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Kill process using port 5000 (Backend)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres

# If error, restart PostgreSQL
# Windows: Services > PostgreSQL
# macOS: brew services restart postgresql
# Ubuntu: sudo service postgresql restart

# Or use SQLite instead (no setup needed)
DATABASE_URL="file:./dev.db"
```

### Issue: JWT Token Errors

```bash
# Make sure JWT_SECRET is set in .env
JWT_SECRET=your_secret_key

# Clear browser localStorage and login again
# In browser console: localStorage.clear()
```

### Issue: CORS Errors

```bash
# Check CORS_ORIGIN in backend .env
CORS_ORIGIN=http://localhost:3000

# Restart backend server
npm start
```

### Issue: Prisma Errors

```bash
# Reset database
npx prisma migrate reset

# This will:
# 1. Drop all tables
# 2. Run all migrations
# 3. Seed sample data

# Or manually:
npx prisma migrate dev --name init
```

### Issue: Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Performance Optimization

### Frontend

```bash
cd frontend

# Analyze bundle size
npm run build
npm install -g serve
serve -s build
```

### Backend

```bash
# Enable compression
npm install compression

# Add to server.js:
const compression = require('compression');
app.use(compression());
```

---

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` files
- Use `.env.example` template
- Rotate JWT_SECRET periodically

### 2. Database

- Use strong PostgreSQL password
- Enable SSL for production
- Regular backups

### 3. API Keys

- Store securely in environment variables
- Rotate Cloudinary keys regularly
- Use API key authentication for internal APIs

### 4. CORS

- Restrict to specific origins in production
- Don't use wildcard (*) in production

---

## Docker Setup (Optional)

### Create Dockerfile

```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/hms_db
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: hms_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up
```

---

## Next Steps

1. **Explore the Code** - Review the backend and frontend structure
2. **Run Tests** - Execute test suites
3. **Read Documentation** - Check API docs and architecture
4. **Customize** - Modify to fit your needs
5. **Deploy** - Follow deployment guide

---

## Getting Help

- **Documentation:** See `docs/` folder
- **GitHub Issues:** Report bugs and feature requests
- **API Docs:** See `API_DOCUMENTATION.md`
- **Architecture:** See `ARCHITECTURE.md`

---

## Useful Commands

```bash
# Backend
cd backend
npm start              # Start server
npm run dev           # Development with auto-reload
npm test              # Run tests
npm run build         # Build for production
npx prisma studio    # Open database UI

# Frontend
cd frontend
npm start             # Start dev server
npm run build         # Create production build
npm test              # Run tests
npm run eject         # Eject from create-react-app

# Git
git status           # Check status
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push origin main # Push to GitHub
```

---

**Last Updated:** April 27, 2026
**Version:** 1.0.0
**Status:** ✅ Ready for Production

