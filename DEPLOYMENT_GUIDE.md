# Deployment Guide: Railway + GitHub Actions

## Overview
This guide will help you deploy your affiliate content feed app to Railway (for hosting) and GitHub Actions (for automation), avoiding Vercel's 2-cron-job limit.

## Step 1: Deploy to Railway

### 1.1 Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Railway gives you $5/month credit (very generous for this app)

### 1.2 Deploy Your App
1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your `affiliate-content-feed` repository**
4. **Railway will auto-detect it's a Next.js app**

### 1.3 Configure Environment Variables
In your Railway project dashboard:
1. **Go to "Variables" tab**
2. **Add these environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   RESEND_API_KEY=your_resend_api_key
   ```

### 1.4 Deploy
1. **Click "Deploy"**
2. **Wait for build to complete**
3. **Your app will be available at: `https://your-app-name.railway.app`**

## Step 2: Set Up GitHub Actions

### 2.1 Add GitHub Secrets
In your GitHub repository:
1. **Go to Settings → Secrets and variables → Actions**
2. **Add these repository secrets:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   RESEND_API_KEY
   SUPABASE_URL
   TWITTER_BEARER_TOKEN
   TWITTER_API_KEY
   TWITTER_API_SECRET
   TWITTER_ACCESS_TOKEN
   TWITTER_ACCESS_SECRET
   LINKEDIN_CLIENT_ID
   LINKEDIN_CLIENT_SECRET
   LINKEDIN_ACCESS_TOKEN
   FACEBOOK_ACCESS_TOKEN
   FACEBOOK_PAGE_ID
   REDDIT_CLIENT_ID
   REDDIT_CLIENT_SECRET
   REDDIT_USERNAME
   REDDIT_PASSWORD
   ```

### 2.2 Update GitHub Actions URLs
After deploying to Railway, update the URLs in the workflow files:
1. **Edit `.github/workflows/content-ingestion.yml`**
2. **Replace `https://your-railway-app.railway.app` with your actual Railway URL**

## Step 3: Connect Your GoDaddy Domain

### 3.1 Get Railway Domain Info
1. **In Railway dashboard, go to "Settings" → "Domains"**
2. **Railway will provide DNS records**

### 3.2 Configure GoDaddy DNS
In your GoDaddy domain settings:
1. **Go to DNS Management**
2. **Add the CNAME record provided by Railway**
3. **Wait for DNS propagation (up to 48 hours)**

## Step 4: Test Your Setup

### 4.1 Test Content Ingestion
1. **Go to GitHub → Actions**
2. **Find "Content Ingestion" workflow**
3. **Click "Run workflow" → "Run workflow"**
4. **Check that it completes successfully**

### 4.2 Test Social Media Bots
1. **Go to GitHub → Actions**
2. **Find "Social Media Bots" workflow**
3. **Click "Run workflow" → "Run workflow"**
4. **Check that it posts to your social media accounts**

## Automation Schedule

### Content Ingestion
- **Frequency**: Every 4 hours
- **GitHub Actions**: `0 */4 * * *`
- **Purpose**: Fetch new articles from RSS feeds

### Social Media Bots
- **Frequency**: Twice daily (9 AM and 6 PM)
- **GitHub Actions**: `0 9,18 * * *`
- **Purpose**: Post AI-generated content to social media

## Monitoring

### Railway Monitoring
- **Railway dashboard**: Monitor app performance
- **Logs**: Check for any errors
- **Usage**: Track your $5/month credit usage

### GitHub Actions Monitoring
- **Actions tab**: Monitor workflow runs
- **Notifications**: Get email alerts for failures
- **Logs**: Detailed logs for debugging

## Cost Breakdown

### Railway
- **Free tier**: $5/month credit
- **Your app**: ~$2-3/month
- **Remaining**: $2-3/month for other projects

### GitHub Actions
- **Free tier**: 2,000 minutes/month
- **Your workflows**: ~100 minutes/month
- **Remaining**: 1,900 minutes/month

## Troubleshooting

### Common Issues

1. **Build fails on Railway**
   - Check environment variables
   - Verify `railway.json` configuration

2. **GitHub Actions fail**
   - Check repository secrets
   - Verify workflow file syntax

3. **Domain not working**
   - Wait for DNS propagation
   - Check CNAME record in GoDaddy

### Support
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **GitHub Actions**: [docs.github.com/en/actions](https://docs.github.com/en/actions)

## Next Steps

1. **Deploy to Railway**
2. **Set up GitHub Actions**
3. **Connect your domain**
4. **Test automation**
5. **Monitor performance**
6. **Scale as needed**

This setup gives you unlimited automation while staying within free/affordable limits! 