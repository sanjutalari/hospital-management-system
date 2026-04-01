# 🚀 Deploy to Render - Step by Step Guide

## 📋 Pre-Deployment Checklist

Your project is ready to deploy! Here's what we have:
- ✅ GitHub repository: `https://github.com/sanjutalari/hospital-management-system.git`
- ✅ Backend configured with proper scripts
- ✅ Frontend configured with Vite build
- ✅ `render.yaml` blueprint file ready

---

## 🎯 Deployment Steps

### Step 1: Create Render Account
1. Go to **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up using your **GitHub account** (recommended)
4. Authorize Render to access your GitHub repositories

---

### Step 2: Deploy Using Blueprint (Easiest Method)

#### Option A: Deploy via Dashboard
1. Log in to Render dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `sanjutalari/hospital-management-system`
4. Render will detect the `render.yaml` file automatically
5. Click **"Apply"**

Render will automatically create:
- ✅ PostgreSQL Database (hms-db)
- ✅ Backend API (hms-api)
- ✅ Frontend Static Site (hms-frontend)

#### Option B: Deploy via URL (Alternative)
Go directly to:
```
https://render.com/deploy?repo=https://github.com/sanjutalari/hospital-management-system
```

---

### Step 3: Configure Environment Variables

Render will auto-generate most variables, but you may need to add:

#### Backend Environment Variables
These will be auto-configured from `render.yaml`:
- ✅ `DATABASE_URL` - Auto-linked from PostgreSQL
- ✅ `JWT_SECRET` - Auto-generated
- ✅ `NODE_ENV` - Set to `production`
- ✅ `FRONTEND_URL` - Auto-linked from frontend

**Optional (add manually if needed):**
- `CLOUDINARY_CLOUD_NAME` - For file uploads
- `CLOUDINARY_API_KEY` - For file uploads
- `CLOUDINARY_API_SECRET` - For file uploads
- `OPENAI_API_KEY` - For AI features (optional)

To add these:
1. Go to your `hms-api` service in Render dashboard
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add the key-value pairs

#### Frontend Environment Variables
Auto-configured:
- ✅ `VITE_API_URL` - Auto-linked to backend + `/api`

---

### Step 4: Monitor Deployment

1. **Watch Build Logs:**
   - Click on each service (hms-db, hms-api, hms-frontend)
   - View the **"Logs"** tab to watch deployment progress

2. **Expected Timeline:**
   - Database: ~2-3 minutes
   - Backend: ~5-7 minutes (npm install + prisma migrations)
   - Frontend: ~3-5 minutes (npm install + vite build)

3. **Successful Deployment Indicators:**
   - ✅ Database: "Your database is live"
   - ✅ Backend: "Live" badge appears, logs show "Server running on port..."
   - ✅ Frontend: "Live" badge appears, build completes successfully

---

### Step 5: Initialize Database

After backend is live:

1. **Automatic Migration:**
   - The backend `startCommand` includes `npx prisma db push`
   - This automatically creates the database schema

2. **Seed Initial Data (Optional):**
   - Go to your `hms-api` service
   - Click **"Shell"** tab
   - Run: `npm run db:seed`
   - This creates default admin/doctor/patient accounts

   Default credentials after seeding:
   ```
   Admin:   admin@hms.com   / admin123
   Doctor:  doctor@hms.com  / doctor123
   Patient: patient@hms.com / patient123
   ```

---

### Step 6: Get Your Deployment URLs

After deployment completes, you'll have:

1. **Backend API URL:**
   ```
   https://hms-api-XXXX.onrender.com
   ```

2. **Frontend URL:**
   ```
   https://hms-frontend-XXXX.onrender.com
   ```

3. **Database Internal URL:**
   ```
   (Internal connection - already configured in backend)
   ```

---

### Step 7: Verify Deployment

Test your deployment:

#### 1. Test Backend Health
Open in browser:
```
https://hms-api-XXXX.onrender.com/api/health
```
Expected response: `{"status":"ok"}`

#### 2. Test Frontend
Open in browser:
```
https://hms-frontend-XXXX.onrender.com
```
You should see the Hospital Management System login page

#### 3. Test Full Flow
1. Register a new patient account
2. Login with the account
3. Book an appointment
4. Try the chat feature

---

## 🔧 Troubleshooting

### Issue: Backend Build Fails

**Solution:**
1. Check the build logs in Render dashboard
2. Common fixes:
   - Ensure Node.js version is 18+ (check `package.json` engines field)
   - Verify all dependencies are in `dependencies` not `devDependencies`
   - Run locally: `cd backend && npm install && npm run build`

### Issue: Database Connection Error

**Symptoms:** Backend logs show "Can't connect to database"

**Solution:**
1. Go to `hms-db` service → Environment tab
2. Copy the **Internal Database URL**
3. Go to `hms-api` service → Environment tab
4. Update `DATABASE_URL` to match the internal URL
5. Redeploy backend

### Issue: Frontend Can't Connect to Backend

**Symptoms:** Network errors, API calls failing

**Solution:**
1. Check `hms-frontend` environment variables
2. Ensure `VITE_API_URL` is correct:
   ```
   VITE_API_URL=https://hms-api-XXXX.onrender.com/api
   ```
3. Redeploy frontend after updating

### Issue: CORS Errors

**Solution:**
1. Go to `hms-api` environment variables
2. Ensure `FRONTEND_URL` matches your frontend URL exactly:
   ```
   FRONTEND_URL=https://hms-frontend-XXXX.onrender.com
   ```
3. Redeploy backend

### Issue: Free Tier Sleeps After Inactivity

**Behavior:** First request takes 30-60 seconds (cold start)

**Solution:**
- This is expected on Render free tier
- Upgrade to paid plan ($7/month) for 24/7 uptime
- Or use UptimeRobot to ping your site every 5 minutes

---

## 💡 Important Notes

### Free Tier Limitations
- **Database:** 90 days retention, 1GB storage
- **Backend:** Spins down after 15 minutes of inactivity
- **Frontend:** Unlimited bandwidth, always on

### Security Recommendations
1. **Change Default Passwords:**
   ```
   After seeding, immediately change:
   - admin@hms.com password
   - doctor@hms.com password
   - patient@hms.com password
   ```

2. **Rotate JWT Secret:**
   - Generate new secret: `openssl rand -hex 64`
   - Update in Render environment variables

3. **Enable HTTPS:**
   - Automatic on Render (included free)

4. **Set Up Monitoring:**
   - Use Render's built-in metrics
   - Set up alerts for downtime

---

## 🔄 Updating Your Deployment

### Method 1: Auto-Deploy (Recommended)
1. Push changes to GitHub main branch
2. Render automatically detects and redeploys

### Method 2: Manual Deploy
1. Go to Render dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📊 Next Steps After Deployment

1. ✅ **Custom Domain (Optional):**
   - Go to service settings → Custom Domains
   - Add your domain (e.g., `yourhospital.com`)

2. ✅ **SSL Certificate:**
   - Automatic with Render (Let's Encrypt)

3. ✅ **Database Backups:**
   - Set up automatic backups in database settings
   - Free tier: manual backups only

4. ✅ **Monitoring:**
   - Set up UptimeRobot: https://uptimerobot.com
   - Monitor both backend and frontend

5. ✅ **Error Tracking:**
   - Optional: Add Sentry for error monitoring
   - Add to both backend and frontend

---

## 🆘 Need Help?

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status Page: https://status.render.com

### Project Issues
- Check `DEPLOYMENT.md` for detailed troubleshooting
- Review Render logs for specific errors
- Test locally first: `npm run dev` in both backend and frontend

---

## ✅ Deployment Success Checklist

After following all steps, verify:

- [ ] Database is live and accessible
- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Appointments can be created
- [ ] Chat features work
- [ ] File uploads work (if Cloudinary configured)
- [ ] Default admin login works
- [ ] HTTPS is enabled on all URLs

---

**🎉 Congratulations! Your Hospital Management System is now live on Render!**

Share your deployment URL:
```
https://hms-frontend-XXXX.onrender.com
```

---

*Last updated: April 2026*
