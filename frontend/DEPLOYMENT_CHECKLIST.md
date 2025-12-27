# 🚀 Vercel Deployment Checklist

Use this checklist to verify your deployment before going live.

---

## ✅ Pre-Deployment Checklist

### 1. Code Changes Applied
- [ ] `index.html` - Removed hardcoded script tag
- [ ] `vite.config.mjs` - Added base path and sourcemap config
- [ ] `index.jsx` - Production alert removed
- [ ] `razorpayService.js` - Standardized API URL
- [ ] `package.json` - Updated build scripts

### 2. Environment Variables Configured in Vercel
- [ ] `VITE_API_BASE_URL` set to production backend URL
- [ ] Variables applied to all environments (Production, Preview, Development)
- [ ] Backend API is accessible from the internet (not localhost)

### 3. Backend Configuration
- [ ] Backend is deployed and accessible
- [ ] Backend returns production URLs (not localhost) for images
- [ ] CORS configured to allow your Vercel domain
- [ ] API endpoints tested with Postman/Thunder Client

### 4. Vercel Project Settings
- [ ] Root Directory: `frontend` (if monorepo)
- [ ] Framework Preset: `Vite`
- [ ] Build Command: `npm run build` or `vite build`
- [ ] Output Directory: `build`
- [ ] Node.js Version: 18.x or higher

---

## 🔍 Post-Deployment Verification

### 1. Check Deployment Logs
```bash
# Look for these success indicators:
✓ Building for production...
✓ Built in Xs
✓ Deployment successful
```

### 2. Test Production Site
- [ ] Open deployed URL in incognito/private browser
- [ ] Check browser console for errors (F12 → Console)
- [ ] Verify homepage loads correctly
- [ ] Test navigation between pages
- [ ] Check if product images load
- [ ] Test API calls (login, add to cart, etc.)

### 3. Common Console Errors to Check
```javascript
// BAD - Indicates API issues
Failed to fetch
CORS error
404 Not Found (for API calls)
localhost:8081 (should not appear in production)

// GOOD
No errors, or only non-critical warnings
```

### 4. Network Tab Verification (F12 → Network)
- [ ] API calls go to production backend (not localhost)
- [ ] Images load from correct domain
- [ ] No 404 errors for assets
- [ ] No CORS errors

---

## 🐛 Troubleshooting Guide

### Issue: Still seeing blank page
**Solutions**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check Console for JavaScript errors
3. Verify `VITE_API_BASE_URL` is set in Vercel
4. Redeploy after setting environment variables
5. Check if backend is accessible: `curl https://your-backend.com/api/health`

### Issue: Images not loading
**Solutions**:
1. Check Network tab - are images 404?
2. Verify backend returns production URLs
3. Check if images exist in `/public/assets/images/`
4. Ensure Vercel is serving static assets from `build` directory

### Issue: API calls fail with CORS error
**Solutions**:
1. Configure backend CORS to allow Vercel domain
2. Spring Boot example:
   ```java
   @CrossOrigin(origins = {"https://your-frontend.vercel.app"})
   ```
3. Or use environment variable for dynamic CORS

### Issue: 404 on page refresh
**Solutions**:
1. Verify `vercel.json` has correct rewrites (already configured)
2. Check that React Router is using `BrowserRouter` (already configured)

---

## 📝 Vercel Environment Variables Template

Copy and paste into Vercel dashboard:

```
Name: VITE_API_BASE_URL
Value: https://your-backend-api.com/api
Environments: Production, Preview, Development
```

---

## 🔄 Redeployment Steps

If you made changes:
1. Commit and push changes to Git
2. Vercel will auto-deploy (if connected to Git)
3. Or manually redeploy in Vercel dashboard
4. Wait for deployment to complete (~2-3 minutes)
5. Test in incognito browser
6. Clear CDN cache if using custom domain

---

## 📞 Quick Test Commands

### Test Backend Connectivity
```bash
# Replace with your backend URL
curl https://your-backend.com/api/products
```

### Test Frontend Deployment
```bash
# Check if site loads
curl -I https://your-frontend.vercel.app
# Should return: HTTP/2 200
```

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ No blank page
- ✅ No console errors
- ✅ Homepage loads with content
- ✅ Navigation works
- ✅ Images display correctly
- ✅ API calls work (can see products, add to cart, etc.)
- ✅ No localhost URLs in Network tab

---

## 🆘 Still Need Help?

1. Check Vercel deployment logs for build errors
2. Compare working local environment vs production
3. Verify all files committed to Git
4. Check if backend is publicly accessible
5. Review browser console for specific error messages

**Common Gotcha**: After adding environment variables in Vercel, you MUST redeploy for them to take effect!

