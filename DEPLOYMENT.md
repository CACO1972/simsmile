# 🚀 SimSmile Deployment Guide

This guide explains how to deploy SimSmile to various platforms now that the deployment issues have been fixed.

## ✅ What Was Fixed

### 1. GitHub Actions Workflow
- **Problem**: Workflow was trying to run `grunt` which doesn't exist in this project
- **Solution**: Updated to use proper Vite build commands (`npm run build`)
- **File**: `.github/workflows/build-deploy.yml`

### 2. Linting Errors
- **Problem**: 15 TypeScript errors preventing successful builds
- **Solution**: Fixed all `any` types and empty interfaces
- **Files**: 
  - `src/components/CameraCapture.tsx`
  - `src/pages/IALab.tsx`
  - `src/components/ui/command.tsx`
  - `src/components/ui/textarea.tsx`
  - `supabase/functions/simulate-smile/index.ts`
  - `tailwind.config.ts`

### 3. Deployment Configurations
- **Added**: `vercel.json` for Vercel deployment
- **Added**: `netlify.toml` for Netlify deployment

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ Node.js 18.x or higher installed
2. ✅ A Supabase project set up
3. ✅ Environment variables configured (see below)
4. ✅ Access to your deployment platform (Vercel, Netlify, etc.)

## 🔐 Environment Variables

Create a `.env` file (or set in your deployment platform):

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration (Optional - has defaults)
VITE_API_TIMEOUT=30000
VITE_MAX_RETRY_ATTEMPTS=3
VITE_IMAGE_QUALITY_THRESHOLD=0.85

# Features (Optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Security (Optional)
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_REQUESTS_PER_MINUTE=20

# External Services (Optional)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA_TRACKING_ID=your_ga_id
```

## 🌐 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required variables from the list above

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

**Auto-deployment**: Push to `main` branch to trigger automatic deployment.

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize site**:
   ```bash
   netlify init
   ```

4. **Configure Environment Variables** in Netlify Dashboard:
   - Go to Site Settings > Build & Deploy > Environment
   - Add all required variables

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

**Auto-deployment**: Connect your GitHub repo in Netlify dashboard for automatic deployments.

### Option 3: Manual Build & Deploy

For custom hosting (AWS, GCP, Azure, etc.):

1. **Build the project**:
   ```bash
   npm install
   npm run build
   ```

2. **Output**: The `dist/` folder contains the production-ready files

3. **Upload**: Upload the contents of `dist/` to your web server

4. **Configure**: 
   - Point your web server to serve `index.html` for all routes
   - Set up proper HTTPS/SSL
   - Configure security headers (see below)

## 🔧 Post-Deployment Configuration

### Security Headers

Ensure your web server sends these security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=()
Content-Security-Policy: default-src 'self'
```

Both `vercel.json` and `netlify.toml` already include these configurations.

### Supabase Edge Functions

Don't forget to deploy your Supabase edge functions:

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy functions**:
   ```bash
   supabase functions deploy simulate-smile
   ```

## ✅ Verify Deployment

After deployment, verify these key features:

1. **Homepage loads** correctly
2. **Camera access** works (requires HTTPS)
3. **Image upload** from gallery works
4. **AI analysis** completes successfully
5. **Results display** properly
6. **All routes** are accessible (no 404s)

### Test URLs:
- Homepage: `https://your-domain.com/`
- Terms: `https://your-domain.com/terminos`
- Privacy: `https://your-domain.com/privacidad`

## 🐛 Troubleshooting

### Build Fails
- **Check Node version**: Must be 18.x or higher
- **Clear cache**: `rm -rf node_modules package-lock.json && npm install`
- **Check environment variables**: Ensure all required vars are set

### Camera Not Working
- **HTTPS Required**: Camera API only works on HTTPS
- **Permissions**: User must grant camera permissions
- **Check browser**: Use Chrome 90+, Firefox 88+, or Safari 14+

### Supabase Connection Issues
- **Verify credentials**: Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **CORS settings**: Ensure your domain is allowed in Supabase dashboard
- **RLS policies**: Check Row Level Security policies are configured

### GitHub Actions Failing
- **Check workflow file**: `.github/workflows/build-deploy.yml`
- **Verify Node version**: Workflow tests on 18.x, 20.x, 22.x
- **Check secrets**: GitHub secrets should be set if using private packages

## 📊 Monitoring

### Performance Monitoring
- Use Lighthouse to check performance scores
- Target: Lighthouse score > 90
- Monitor Core Web Vitals

### Error Tracking
- Set up Sentry with `VITE_SENTRY_DSN`
- Monitor error rates in production
- Set up alerts for critical errors

### Analytics
- Configure Google Analytics with `VITE_GA_TRACKING_ID`
- Track key user flows:
  - Photo capture success rate
  - Analysis completion rate
  - Contact form submissions

## 🔄 Continuous Deployment

The GitHub Actions workflow now properly handles CI/CD:

1. **On Push to `main`**: Runs build and lint
2. **On Pull Request**: Tests build across Node 18.x, 20.x, 22.x
3. **Artifacts**: Uploads build artifacts for Node 20.x

To enable auto-deployment:
- **Vercel**: Connect GitHub repo in Vercel dashboard
- **Netlify**: Connect GitHub repo in Netlify dashboard
- **Custom**: Add deployment step to `.github/workflows/build-deploy.yml`

## 📝 Additional Notes

### Camera Features
This app requires camera access. Ensure:
- Deployment is on HTTPS
- Privacy policy is accessible
- Camera permissions are requested properly

### MediaPipe Integration
The app uses MediaPipe for facial analysis:
- Large WASM files (~20MB) need to be served
- Consider CDN for better performance
- Check CSP headers allow WASM execution

### Supabase Storage
If using Supabase Storage for images:
- Configure bucket policies
- Set up RLS rules
- Configure CORS for your domain

## 🆘 Support

If you encounter issues:

1. Check this deployment guide first
2. Review the main README.md
3. Check GitHub Issues
4. Contact support (see README for details)

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)

---

**Last Updated**: November 2025  
**Version**: 2.0.0
