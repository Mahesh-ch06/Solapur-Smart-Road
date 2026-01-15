# 🚀 Vercel Deployment Guide

## Quick Deploy (5 Minutes)

### Step 1: Prepare Your Code

Your app is ready! Just make sure you have:
- ✅ Vercel configuration (`vercel.json`) - Already created
- ✅ Build scripts in package.json - Already configured
- ✅ Environment variables documented - See below

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
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

4. **Follow the prompts**:
   - Setup and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - What's your project's name? `solapur-road-rescuer`
   - In which directory is your code located? `./`
   - Want to modify settings? **N**

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via Vercel Dashboard

1. **Visit**: https://vercel.com/new

2. **Import Git Repository**:
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository
   - Or upload your project folder directly

3. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables** (See Step 3 below)

5. **Click "Deploy"**

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

#### Required Variables:

```
VITE_SUPABASE_URL=https://ugxzmisewrugyefjpfcs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneHptaXNld3J1Z3llZmpwZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODc4NTgsImV4cCI6MjA4Mzk2Mzg1OH0.bljwdjlxWV_HsREXPNirSWHzf3XDmYUUdS7PkkXV5Ls
```

#### Email Notifications (Optional but Recommended):

```
VITE_EMAILJS_SERVICE_ID=service_r6i1e2r
VITE_EMAILJS_TEMPLATE_ID=template_1nvghvd
VITE_EMAILJS_PUBLIC_KEY=oB-mfKG_R1QOJUEIT
```

**Important**: 
- Add these to **Production**, **Preview**, and **Development** environments
- Click "Save" after adding all variables

### Step 4: Update Supabase Settings

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard

2. **Navigate to**: Authentication → URL Configuration

3. **Add Vercel URLs**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs:
     - `https://your-app.vercel.app/**`
     - `https://your-app.vercel.app/admin/**`

4. **Save changes**

### Step 5: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`

2. **Test features**:
   - ✅ Submit a report
   - ✅ Check if it appears in Supabase
   - ✅ Login to admin panel
   - ✅ Change report status
   - ✅ Verify email notifications work

## 🔧 Deployment Configuration

### vercel.json

The app includes a `vercel.json` configuration with:
- SPA routing (all routes point to index.html)
- Optimal caching for assets
- Vite framework preset

### Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Dev Command**: `npm run dev`

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. **In Vercel Dashboard** → Your Project → Settings → Domains

2. **Add Domain**: `your-domain.com`

3. **Configure DNS**:
   - Add A record: `76.76.21.21`
   - Or CNAME record: `cname.vercel-dns.com`

4. **Wait for propagation** (5-10 minutes)

## 🔄 Automatic Deployments

### With Git Integration:

Once connected to Git:
- **Push to main** → Auto-deploy to production
- **Push to other branches** → Auto-deploy preview
- **Pull requests** → Preview deployments with unique URLs

### Manual Deployments:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)

1. **Enable**: Project Settings → Analytics → Enable

2. **View metrics**:
   - Page views
   - Performance
   - Real User Monitoring (RUM)

### Vercel Speed Insights

1. **Install** (already included with Vercel deployment)

2. **Add to your app** (optional for detailed metrics):
   ```bash
   npm install @vercel/speed-insights
   ```

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. Environment variables are set correctly
2. All dependencies are in package.json
3. Build command is `npm run build`

**View build logs**:
- Vercel Dashboard → Deployments → Click on deployment → View logs

### 404 on Refresh

**Solution**: Already configured in `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables Not Working

**Check:**
1. Variables start with `VITE_` (required for Vite)
2. Added to all environments (Production, Preview, Development)
3. Redeploy after adding variables

**Redeploy**:
```bash
vercel --prod --force
```

### Admin Login Not Working

**Fix**: Update Supabase redirect URLs
- Add `https://your-app.vercel.app/**` to Supabase Auth settings

### Emails Not Sending

**Check:**
1. EmailJS environment variables are set in Vercel
2. EmailJS template is active
3. Check browser console for errors

## 🚀 Performance Optimization

### Already Configured:

✅ **Asset caching** (1 year)
✅ **SPA routing** (instant navigation)
✅ **Vite optimizations** (code splitting, tree shaking)

### Additional Optimizations:

1. **Enable Vercel Analytics**: Free performance monitoring

2. **Add Compression**: Already handled by Vercel

3. **Image Optimization**: 
   ```bash
   npm install @vercel/image
   ```

## 💰 Pricing

### Vercel Free Tier Includes:

- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ HTTPS & SSL
- ✅ Global CDN
- ✅ Automatic CI/CD
- ✅ Preview deployments

**Perfect for this project!** You won't need to upgrade unless you get massive traffic.

## 📝 Deployment Checklist

Before going live:

- [ ] Environment variables added to Vercel
- [ ] Supabase redirect URLs updated
- [ ] Database schema deployed to Supabase
- [ ] Admin account created
- [ ] EmailJS configured and tested
- [ ] Test report submission
- [ ] Test admin login
- [ ] Test email notifications
- [ ] Test on mobile devices
- [ ] Custom domain configured (optional)

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Deployment Docs**: https://vercel.com/docs/deployments/overview
- **Environment Variables**: https://vercel.com/docs/environment-variables

## 🎉 Post-Deployment

Once deployed:

1. **Share your URL**: `https://your-app.vercel.app`

2. **Monitor usage**:
   - Vercel Dashboard → Analytics
   - Supabase Dashboard → Database usage

3. **Update citizens**: Share the URL via:
   - Social media
   - Local government website
   - Community groups
   - Posters/flyers

## 🔄 Continuous Deployment

### Recommended Git Workflow:

1. **Create repository** on GitHub

2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/solapur-road-rescuer.git
   git push -u origin main
   ```

3. **Connect to Vercel**: 
   - Vercel Dashboard → Import Project → Select GitHub repo

4. **Automatic deployments**: 
   - Every push to main = new production deployment
   - Feature branches = preview deployments

---

**Ready to deploy!** Run `vercel` in your terminal to get started. 🚀
