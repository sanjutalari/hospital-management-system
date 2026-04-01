# 🚀 Production Deployment Checklist

## Pre-Deployment Checklist

### Backend Setup
- [ ] **Environment Variables**
  - [ ] Copy `.env.example` to `.env`
  - [ ] Generate strong JWT secrets: `openssl rand -hex 64`
  - [ ] Set `NODE_ENV=production`
  - [ ] Configure PostgreSQL `DATABASE_URL`
  - [ ] Add Cloudinary credentials (cloud_name, api_key, api_secret)
  - [ ] Add OpenAI API key (optional, for real AI)
  - [ ] Set `FRONTEND_URL` to your deployed frontend domain

- [ ] **Database**
  - [ ] Set up PostgreSQL database (Supabase/Render/Railway)
  - [ ] Test database connection
  - [ ] Run migrations: `npm run db:migrate:deploy`
  - [ ] Seed initial data: `npm run db:seed`

- [ ] **Dependencies**
  - [ ] Run `npm install --production`
  - [ ] Ensure all peer dependencies are satisfied

### Frontend Setup
- [ ] **Environment Variables**
  - [ ] Copy `.env.example` to `.env`
  - [ ] Set `VITE_API_URL` to backend URL + `/api`
  - [ ] Set `VITE_SOCKET_URL` to backend URL (without /api)

- [ ] **Build**
  - [ ] Run `npm run build`
  - [ ] Test production build locally: `npm run preview`

## Deployment Steps

### Option 1: Render + Vercel (Recommended)

#### Backend Deployment (Render)
1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** hms-backend
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for production)
5. Add Environment Variables (from .env.example)
6. Add PostgreSQL database:
   - Click "New +" → "PostgreSQL"
   - Copy connection string to `DATABASE_URL`
7. Deploy!

#### Frontend Deployment (Vercel)
1. Create account at https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api`
   - `VITE_SOCKET_URL`: Your Render backend URL
6. Deploy!

### Option 2: Railway (Full Stack)
1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Add PostgreSQL database
4. Configure backend service:
   - **Root Directory:** `backend`
   - Add all environment variables
   - Railway will auto-detect and deploy
5. Configure frontend service:
   - **Root Directory:** `frontend`
   - Add environment variables
   - Railway will auto-detect and deploy

## Post-Deployment

### Verification
- [ ] Test backend health: `https://your-backend.com/api/health`
- [ ] Test frontend loads correctly
- [ ] Test user registration
- [ ] Test user login
- [ ] Test admin login (`admin@hms.com` / `admin123`)
- [ ] Test appointment booking
- [ ] Test file upload (if Cloudinary configured)
- [ ] Test real-time chat
- [ ] Test AI assistant (if OpenAI configured)

### Security
- [ ] Verify HTTPS is enabled (automatic on Render/Vercel)
- [ ] Test CORS configuration
- [ ] Verify rate limiting is active
- [ ] Check that demo credentials are NOT in production .env
- [ ] Enable 2FA on hosting platforms
- [ ] Set up error monitoring (optional: Sentry)

### Database Backups
- [ ] **Supabase:** Automatic daily backups (7 days retention on free tier)
- [ ] **Render PostgreSQL:** Manual backups via dashboard
- [ ] Set up automatic backup schedule if available

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Better Uptime)
- [ ] Monitor error logs in Render/Vercel dashboards
- [ ] Check `/logs` directory for errors
- [ ] Monitor database performance

## Default Credentials

After running seed script:
```
Admin:   admin@hms.com   / admin123
Doctor:  doctor@hms.com  / doctor123
Patient: patient@hms.com / patient123
```

**⚠️ IMPORTANT:** Change these credentials immediately in production!

## Environment URLs

Update these in your `.env` files:

### Development
```
Backend:  http://localhost:3001
Frontend: http://localhost:5173
```

### Production (Example)
```
Backend:  https://hms-backend.onrender.com
Frontend: https://hms-frontend.vercel.app
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from your host IP
- Ensure SSL mode is set (add `?sslmode=require` to PostgreSQL URL)

### CORS Errors
- Verify `FRONTEND_URL` in backend .env matches your frontend domain
- Check both HTTP and HTTPS variants

### Build Failures
- Run `npm clean-install` to reinstall dependencies
- Check Node.js version (requires v18+)
- Verify all environment variables are set

### File Upload Not Working
- Verify all three Cloudinary env vars are set
- Test credentials in Cloudinary dashboard
- Check file size limits (default 10MB)

## Scaling Considerations

### Database
- Free tier PostgreSQL: 1GB storage, 1 million rows
- Upgrade when approaching limits
- Consider read replicas for high traffic

### Backend
- Start with 512MB RAM instance
- Monitor memory usage
- Scale horizontally with load balancer if needed

### Frontend
- Vercel/Netlify handle scaling automatically
- CDN distribution included

## Maintenance

### Regular Tasks
- [ ] Monitor logs weekly
- [ ] Check database size monthly
- [ ] Review and rotate JWT secrets quarterly
- [ ] Update dependencies monthly
- [ ] Backup database before major changes

### Updates
```bash
# Update dependencies
npm update

# Update Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate

# Run migrations
npm run db:migrate:deploy
```

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs

## Rollback Plan

If deployment fails:
1. Revert to previous Git commit
2. Redeploy from working commit
3. Restore database from backup if needed
4. Check logs for error details

---

**Last Updated:** April 2026
