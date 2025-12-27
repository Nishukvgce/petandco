# 🎯 Vercel Blank Page - Root Cause & Fixes

## 🔴 Root Cause Analysis

Your React + Vite app showed a blank page on Vercel due to **4 critical issues**:

1. **Missing Environment Variables**: All API services defaulted to `localhost` URLs (most common cause)
2. **Inconsistent Env Variables**: Different services used different variable names
3. **Backend localhost URLs**: Backend returns localhost image URLs in production
4. **Production Alerts**: Error boundaries showed blocking alerts in production

**Note**: The script tag in `index.html` is correct and needed for Vite to work in both development and production!

---

## ✅ Fixes Applied

### File Changes Made:

#### 1. **frontend/vite.config.mjs**
- ✅ Added: `base: '/'` for correct asset paths
- ✅ Changed: `sourcemap: false` for smaller production bundles

#### 2. **frontend/src/index.jsx**
- ✅ Changed: Alerts only show in development mode
- ✅ Added: Root element existence check

#### 3. **frontend/src/services/razorpayService.js**
- ✅ Standardized: Now uses `VITE_API_BASE_URL` (consistent with other services)

#### 4. **frontend/package.json**
- ✅ Updated: Removed `--sourcemap` flag from build script
- ✅ Added: `vercel-build` script

---

## 🔧 Required Actions (DO THIS NOW!)

### Step 1: Set Environment Variables in Vercel

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add this variable:
   ```
   Name: VITE_API_BASE_URL
   Value: https://your-backend-api-url.com/api
   Environment: Production, Preview, Development
   ```
3. Click **Save**

### Step 2: Redeploy Your Application

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **⋯ (three dots)** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 3: Test Your Deployment

1. Open deployed URL in **incognito browser**
2. Press **F12** → **Console** tab
3. Verify:
   - ✅ No blank page
   - ✅ No console errors
   - ✅ Homepage loads with content
   - ✅ No "localhost" URLs in Network tab

---

## 🎯 Environment Variable Format

### ✅ Correct Format:
```
VITE_API_BASE_URL=https://api.yourbackend.com/api
```

### ❌ Incorrect Formats:
```
# Missing https://
VITE_API_BASE_URL=api.yourbackend.com/api

# Missing /api suffix (if your backend uses it)
VITE_API_BASE_URL=https://api.yourbackend.com

# Using localhost (won't work in production!)
VITE_API_BASE_URL=http://localhost:8081/api
```

---

## 🐛 Still Seeing Blank Page?

### Debug Checklist:

1. **Check Browser Console (F12)**
   ```
   Look for errors like:
   - "Failed to fetch"
   - "CORS error"  
   - "404 Not Found"
   - Any mention of "localhost"
   ```

2. **Verify Environment Variable is Set**
   ```
   Vercel Dashboard → Settings → Environment Variables
   Must show: VITE_API_BASE_URL = your-backend-url
   ```

3. **Check Vercel Build Logs**
   ```
   Deployments → Click on deployment → View Build Logs
   Look for: "✓ built in Xs"
   ```

4. **Test Backend Accessibility**
   ```bash
   # Your backend must be accessible from the internet
   curl https://your-backend-api.com/api/health
   # Should return 200 OK
   ```

5. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete (Chrome/Edge)
   Cmd+Shift+Delete (Mac)
   Select "Cached images and files"
   ```

---

## 📱 Backend Configuration Needed

Your backend **must**:

1. **Return production URLs for images**
   ```java
   // Spring Boot example
   @Value("${app.base-url}")
   private String baseUrl;
   
   // Return: https://api.yourbackend.com/uploads/image.jpg
   // NOT: http://localhost:8080/uploads/image.jpg
   ```

2. **Enable CORS for your Vercel domain**
   ```java
   @CrossOrigin(origins = {"https://your-frontend.vercel.app"})
   ```

3. **Be publicly accessible** (not localhost, not behind firewall)

---

## 🚀 Quick Verification Commands

### Test if your changes work locally:
```bash
cd frontend
npm run build
npm run serve
# Open http://localhost:4173
# Should show your app (not blank page)
```

### Verify environment variables in Vercel:
```bash
# In Vercel dashboard
Settings → Environment Variables → Should see VITE_API_BASE_URL
```

---

## ✨ Success Indicators

You'll know it's working when:

- ✅ Vercel deployment shows green checkmark
- ✅ Opening site shows homepage (not blank)
- ✅ Browser console shows no errors
- ✅ Products/images load correctly
- ✅ Network tab shows API calls to production URL (not localhost)

---

## 📞 Need More Help?

1. Read: `DEPLOYMENT_CHECKLIST.md` (comprehensive guide)
2. Read: `ENV_SETUP.md` (environment variable details)
3. Check Vercel build logs for specific errors
4. Verify backend is accessible: `curl your-backend-url/api/health`

---

## 🎉 Expected Result After Fixes

- **Before**: Blank white page, console errors about localhost
- **After**: Full homepage loads, all features work, no console errors

**Remember**: You MUST add `VITE_API_BASE_URL` in Vercel settings and redeploy!

