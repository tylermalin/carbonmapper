# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- Google Earth Engine service account key
- GitHub repository (optional but recommended)

### Step 1: Prepare Your Repository

1. Ensure all files are committed:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

1. **Add Service Account Key as Secret:**
   - Go to Settings → Secrets
   - Create a new secret named `GEE_SERVICE_ACCOUNT_KEY`
   - Paste the entire contents of your service account key JSON file

2. **Set Environment Variables:**
   - `GEE_KEY_FILE`: `/tmp/gee-key.json` (or create a script to write from secret)
   - `FRONTEND_ORIGIN`: Your Vercel domain (e.g., `https://your-project.vercel.app`)
   - `PORT`: `4000` (or leave default)

**Alternative Approach (Recommended):**

Create a startup script that writes the secret to a file:

1. Create `backend/setup-env.js`:
   ```javascript
   import fs from 'fs';
   const key = process.env.GEE_SERVICE_ACCOUNT_KEY;
   if (key) {
     fs.writeFileSync('/tmp/gee-key.json', key);
     process.env.GEE_KEY_FILE = '/tmp/gee-key.json';
   }
   ```

2. Update `backend/package.json`:
   ```json
   {
     "scripts": {
       "start": "node setup-env.js && node server.js"
     }
   }
   ```

### Step 4: Update Vercel Configuration

The `vercel.json` file is already configured, but you may need to adjust:

- **Build Command**: None needed (serverless functions)
- **Output Directory**: Not applicable
- **Install Command**: `cd backend && npm install`

### Step 5: Test Deployment

1. Visit your Vercel deployment URL
2. Test drawing a polygon on the map
3. Verify carbon calculations work
4. Check Vercel function logs for any errors

## Environment-Specific Configuration

### Development
```env
GEE_KEY_FILE=../service-account-key.json
PORT=4000
FRONTEND_ORIGIN=*
```

### Production (Vercel)
```env
GEE_KEY_FILE=/tmp/gee-key.json
FRONTEND_ORIGIN=https://your-project.vercel.app
PORT=4000
```

## Troubleshooting

### Common Issues

1. **"GEE_KEY_FILE missing or path not found"**
   - Ensure service account key is properly set as a Vercel secret
   - Verify the path in `GEE_KEY_FILE` environment variable
   - Check that the setup script runs before the server starts

2. **CORS Errors**
   - Verify `FRONTEND_ORIGIN` matches your Vercel domain exactly
   - Check that CORS middleware is configured correctly

3. **Function Timeout**
   - Google Earth Engine queries can take time
   - Consider increasing Vercel function timeout (Pro plan)
   - Or implement request queuing for large polygons

4. **Build Failures**
   - Ensure all dependencies are in `package.json`
   - Check Node.js version compatibility (18+)
   - Review build logs in Vercel dashboard

## Security Best Practices

1. **Never commit sensitive files:**
   - ✅ `service-account-key.json` is in `.gitignore`
   - ✅ `.env` files are in `.gitignore`

2. **Use Vercel Secrets:**
   - Store service account keys as Vercel secrets
   - Never hardcode credentials

3. **Environment Variables:**
   - Use different values for development and production
   - Restrict `FRONTEND_ORIGIN` in production

4. **API Rate Limiting:**
   - Consider adding rate limiting for production
   - Monitor API usage in Vercel dashboard

## Monitoring

- **Vercel Dashboard**: Monitor function invocations, errors, and performance
- **Google Earth Engine**: Monitor API quota usage
- **Application Logs**: Check Vercel function logs for debugging

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD for automatic deployments
4. Add rate limiting and security headers
5. Implement caching for frequently accessed data

