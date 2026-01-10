# Netlify Deployment Guide

This guide will walk you through deploying your portfolio frontend to Netlify with automatic CI/CD pipeline.

## Prerequisites

- GitHub account with this repository
- Netlify account (free tier works perfectly)
- Production backend API URL

## Step-by-Step Deployment

### 1. Prepare Your Repository

The `netlify-deployment` branch is already configured with all necessary files:
- ✅ `netlify.toml` - Build and deployment configuration
- ✅ `public/_headers` - Security and caching headers
- ✅ `.env.production.example` - Environment variables template

### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your **`Personal-Website`** repository
6. Configure build settings:

   ```
   Branch to deploy: netlify-deployment
   Build command: npm run build
   Publish directory: dist
   ```

7. Click **"Show advanced"** → **"New variable"** to add environment variables

### 3. Configure Environment Variables

In the Netlify dashboard, add these environment variables:

#### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.com/api` | Your production backend API URL |

#### Optional Variables (add if using these services)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_RECAPTCHA_SITE_KEY` | Your reCAPTCHA key | Google reCAPTCHA v2 site key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Your cloud name | Cloudinary configuration |
| `VITE_APP_NAME` | `mehedinaeem` | Custom app name (optional) |
| `VITE_APP_AUTHOR` | `Full-Stack Developer` | Custom author (optional) |

> [!TIP]
> You can skip optional variables. The app will work fine without them.

### 4. Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://random-name-123456.netlify.app`

### 5. Custom Domain (Optional)

To use your own domain:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure DNS

## Automatic Deployments (CI/CD)

Once configured, Netlify will automatically:

- ✅ Deploy when you push to `netlify-deployment` branch
- ✅ Build and test your code
- ✅ Show deploy previews for pull requests
- ✅ Rollback if deployment fails

### To Deploy Updates

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin netlify-deployment
```

Netlify will automatically detect the push and deploy the new version!

## Build Status Badge (Optional)

Add a build status badge to your README:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

Replace `YOUR-SITE-ID` and `YOUR-SITE-NAME` with your actual values from Netlify dashboard.

## Troubleshooting

### Build Fails

**Issue**: Build fails with dependency errors

**Solution**: Check the build logs in Netlify dashboard. Usually caused by:
- Missing environment variables
- Node version mismatch (we're using Node 20)
- Package installation issues

### 404 on Page Refresh

**Issue**: Direct URLs or page refresh returns 404

**Solution**: Already configured! The `netlify.toml` file includes SPA redirect rules.

### API Calls Fail

**Issue**: Can't connect to backend

**Solution**: 
- Verify `VITE_API_BASE_URL` is set correctly in Netlify environment variables
- Check backend CORS settings allow your Netlify domain
- Ensure backend is running and accessible

### Environment Variables Not Working

**Issue**: Environment variables not being picked up

**Solution**:
- Redeploy after adding variables (not automatic)
- Make sure variable names start with `VITE_`
- Check for typos in variable names

## Managing Deployments

### Deploy Contexts

You can configure different settings for:
- **Production** (netlify-deployment branch)
- **Deploy Previews** (pull requests)
- **Branch Deploys** (other branches)

### Rollback

If something goes wrong:
1. Go to **Deploys** in Netlify dashboard
2. Find the last working deployment
3. Click **"Publish deploy"**

### Deploy Previews

Every pull request gets its own preview URL:
- Useful for testing before merging
- Automatically created for PRs to `netlify-deployment`
- Includes all environment variables

## Performance Optimization

Already configured in this setup:

- ✅ **Asset Caching**: Static assets cached for 1 year
- ✅ **Compression**: Automatic Brotli/Gzip compression
- ✅ **CDN**: Global edge network
- ✅ **Security Headers**: XSS protection, frame options, etc.

## Next Steps

1. ✅ Deploy your site
2. ✅ Add environment variables
3. ✅ Test all features
4. Configure custom domain (optional)
5. Enable deploy notifications (Slack, email, etc.)
6. Set up form handling (if using Netlify Forms)

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)

---

**Happy Deploying! 🚀**
