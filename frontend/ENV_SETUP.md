# Environment Variables Setup for Vercel Deployment

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### 1. VITE_API_BASE_URL
**Description**: Backend API base URL (with /api suffix)  
**Production Value**: `https://your-backend-domain.com/api`  
**Example**: `https://api.petco.com/api`

### 2. NODE_ENV (Optional)
**Description**: Application environment  
**Value**: `production`

---

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your backend API URL (e.g., `https://api.petco.com/api`)
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**
6. **Redeploy** your application for changes to take effect

---

## Local Development Setup

Create a `.env` file in the `frontend` directory:

```env
# .env (for local development)
VITE_API_BASE_URL=http://localhost:8081/api
NODE_ENV=development
```

**Note**: Never commit `.env` files to version control. The `.env.example` file is provided as a template.

---

## Verifying Environment Variables

After deployment, check the Vercel build logs to ensure variables are loaded:
- Look for: "✓ Environment variables loaded"
- Or inspect: Settings → Environment Variables in Vercel dashboard

---

## Backend Image URL Fix

If your backend returns image URLs with `localhost`, you need to configure your backend to return production URLs:

### Spring Boot Configuration (application.properties):
```properties
# Backend configuration
app.base-url=${APP_BASE_URL:http://localhost:8080}
app.image-base-url=${APP_IMAGE_BASE_URL:http://localhost:8080}
```

### Set these in your backend hosting platform:
- `APP_BASE_URL`: Your backend production URL
- `APP_IMAGE_BASE_URL`: Your backend production URL (or CDN URL)

Then update your backend controller to use these values when returning image URLs.

