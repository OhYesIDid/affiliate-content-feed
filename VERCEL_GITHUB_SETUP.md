# Vercel + GitHub Actions Setup Guide

## Overview
This guide will help you deploy your affiliate content feed app using Vercel for hosting and GitHub Actions for automation.

## Step 1: Deploy to Vercel

### 1.1 Sign up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Vercel will automatically detect your `affiliate-content-feed` repository

### 1.2 Deploy Your App
1. **Click "New Project"**
2. **Import your GitHub repository:**
   - Select "Import Git Repository"
   - Choose `affiliate-content-feed` from the list
   - Click "Import"
3. **Configure the project:**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `.next` (should auto-detect)
   - Install Command: `npm install` (should auto-detect)

### 1.3 Configure Environment Variables
In your Vercel project dashboard:
1. **Go to "Settings" → "Environment Variables"**
2. **Add these environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_from_email
   RESEND_TO_EMAIL=your_to_email
   ```
3. **Click "Save"**

### 1.4 Deploy
1. **Click "Deploy"**
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## Step 2: Get Vercel Deployment Info

### 2.1 Get Vercel Token
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. **Click "Create Token"**
3. **Name it**: `GitHub Actions`
4. **Copy the token** (you'll need this for GitHub secrets)

### 2.2 Get Project Info
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```
2. **Login to Vercel:**
   ```bash
   vercel login
   ```
3. **Get project info:**
   ```bash
   vercel project ls
   ```
4. **Note down:**
   - Project ID
   - Org ID

## Step 3: Configure GitHub Secrets

### 3.1 Go to GitHub Repository Settings
1. Go to your GitHub repository: `https://github.com/OhYesIDid/affiliate-content-feed`
2. **Click "Settings" tab**
3. **Click "Secrets and variables" → "Actions"**

### 3.2 Add Vercel Secrets
Click "New repository secret" and add:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Your Vercel token from step 2.1 |
| `VERCEL_ORG_ID` | Your Vercel org ID from step 2.2 |
| `VERCEL_PROJECT_ID` | Your Vercel project ID from step 2.2 |

### 3.3 Add App Secrets
Add all your existing environment variables:

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | Your from email |
| `RESEND_TO_EMAIL` | Your to email |

### 3.4 Add Social Media API Secrets
Add your social media API credentials:

| Secret Name | Value |
|-------------|-------|
| `TWITTER_BEARER_TOKEN` | Your Twitter bearer token |
| `TWITTER_API_KEY` | Your Twitter API key |
| `TWITTER_API_SECRET` | Your Twitter API secret |
| `TWITTER_ACCESS_TOKEN` | Your Twitter access token |
| `TWITTER_ACCESS_SECRET` | Your Twitter access secret |
| `LINKEDIN_CLIENT_ID` | Your LinkedIn client ID |
| `LINKEDIN_CLIENT_SECRET` | Your LinkedIn client secret |
| `LINKEDIN_ACCESS_TOKEN` | Your LinkedIn access token |
| `FACEBOOK_ACCESS_TOKEN` | Your Facebook access token |
| `FACEBOOK_PAGE_ID` | Your Facebook page ID |
| `REDDIT_CLIENT_ID` | Your Reddit client ID |
| `REDDIT_CLIENT_SECRET` | Your Reddit client secret |
| `REDDIT_USERNAME` | Your Reddit username |
| `REDDIT_PASSWORD` | Your Reddit password |

## Step 4: Update GitHub Actions Workflow

### 4.1 Update the Vercel Domain
1. **Open `.github/workflows/vercel-deploy.yml`**
2. **Replace `your-vercel-domain.vercel.app`** with your actual Vercel domain
3. **Commit and push the changes**

## Step 5: Test the Setup

### 5.1 Test Deployment
1. **Make a small change** to your code
2. **Push to GitHub**
3. **Check the "Actions" tab** in your GitHub repository
4. **Verify the deployment job runs successfully**

### 5.2 Test Automation
1. **Go to "Actions" tab**
2. **Click on "Deploy to Vercel and Run Automation"**
3. **Click "Run workflow"**
4. **Select "main" branch**
5. **Click "Run workflow"**
6. **Check that both content ingestion and social media bots run**

## Step 6: Connect Your GoDaddy Domain

### 6.1 Add Custom Domain in Vercel
1. **Go to your Vercel project dashboard**
2. **Click "Settings" → "Domains"**
3. **Add your domain** (e.g., `yourdomain.com`)
4. **Vercel will provide DNS records**

### 6.2 Configure DNS in GoDaddy
1. **Log into your GoDaddy account**
2. **Go to "My Products" → "DNS"**
3. **Add the DNS records** provided by Vercel:
   - **Type**: CNAME
   - **Name**: @
   - **Value**: cname.vercel-dns.com
   - **TTL**: 600

### 6.3 Verify Domain
1. **Wait 5-10 minutes** for DNS propagation
2. **Your domain should now point to your Vercel app**

## Step 7: Monitor and Maintain

### 7.1 Check GitHub Actions
- **Go to "Actions" tab** regularly
- **Monitor automation runs**
- **Check for any failures**

### 7.2 Check Vercel Analytics
- **Go to your Vercel dashboard**
- **Check "Analytics" tab**
- **Monitor performance and errors**

### 7.3 Check Supabase
- **Monitor your database**
- **Check for new articles**
- **Verify affiliate link tracking**

## Benefits of This Setup

✅ **Vercel Hosting:**
- Fast global CDN
- Automatic deployments
- Easy custom domain setup
- Great Next.js support

✅ **GitHub Actions Automation:**
- Unlimited cron jobs
- Free tier (2,000 minutes/month)
- Reliable automation
- Easy monitoring

✅ **Cost Effective:**
- Vercel free tier: Generous limits
- GitHub Actions free tier: 2,000 minutes/month
- No additional hosting costs

## Troubleshooting

### Common Issues:

1. **Vercel deployment fails:**
   - Check environment variables
   - Verify build command
   - Check for TypeScript errors

2. **GitHub Actions fail:**
   - Check secrets are set correctly
   - Verify API keys are valid
   - Check for rate limits

3. **Domain not working:**
   - Wait for DNS propagation
   - Verify DNS records
   - Check Vercel domain settings

4. **Automation not running:**
   - Check GitHub Actions permissions
   - Verify cron schedule
   - Check for workflow errors

## Next Steps

1. **Set up monitoring** for your automation
2. **Configure email notifications** for failures
3. **Add more RSS feeds** to increase content
4. **Optimize affiliate link generation**
5. **Add analytics tracking**

Your affiliate content feed is now fully automated and deployed! 🚀 