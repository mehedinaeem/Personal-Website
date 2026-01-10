# 🚀 Quick Netlify Deployment Guide

## What I've Prepared for You

✅ Created `netlify-deployment` branch  
✅ Enhanced Netlify configuration  
✅ Added security headers  
✅ Created environment variables template  
✅ Full deployment documentation

## Quick Start: Deploy in 5 Minutes

### 1. Go to Netlify
Visit: https://app.netlify.com/

### 2. Import Project
- Click **"Add new site"** → **"Import an existing project"**
- Choose **GitHub**
- Select **`Personal-Website`** repository

### 3. Configure Build
```
Branch: netlify-deployment
Build command: npm run build
Publish directory: dist
```

### 4. Add Environment Variable (Required)
```
VITE_API_BASE_URL = https://your-backend-url.com/api
```

### 5. Deploy!
Click **"Deploy site"** and wait 2-3 minutes.

## After Deployment

Your site will be live at: `https://random-name-123456.netlify.app`

### Optional: Custom Domain
Site Settings → Domain Management → Add custom domain

### Automatic Updates
Every push to `netlify-deployment` branch auto-deploys! 🎉

## Need More Details?
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

## Commit & Push This Branch
```bash
git add .
git commit -m "Configure Netlify deployment with CI/CD"
git push origin netlify-deployment
```

---

**Ready to deploy? Follow the steps above!** 🚀
