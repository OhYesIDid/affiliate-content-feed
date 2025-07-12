# 🚀 ContentFeed Production Deployment Guide

This guide will walk you through deploying your ContentFeed app to production on Vercel with all the necessary services configured.

## 📋 Prerequisites

Before deploying, you'll need accounts for these services:

- [Vercel](https://vercel.com) - Hosting
- [Supabase](https://supabase.com) - Database
- [OpenAI](https://openai.com) - AI Processing
- [Resend](https://resend.com) - Email Service
- [Skimlinks](https://skimlinks.com) - Affiliate Tracking (optional)
- [Amazon Associates](https://affiliate-program.amazon.com) - Amazon Affiliate (optional)

## 🔧 Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `contentfeed-prod`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Click "Run" to execute the script

### 1.3 Get API Credentials
1. Go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Save these for the next step

## 🤖 Step 2: Set Up OpenAI

### 2.1 Get API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys**
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)

### 2.2 Set Usage Limits
1. Go to **Usage** > **Billing**
2. Set up payment method
3. Set usage limits to control costs:
   - **Soft limit**: $20/month
   - **Hard limit**: $50/month

## 📧 Step 3: Set Up Resend Email

### 3.1 Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 3.2 Configure Domain (Optional but Recommended)
1. Go to **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS setup instructions
4. This allows you to send from `digest@yourdomain.com`

### 3.3 Get API Key
1. Go to **API Keys**
2. Click "Create API Key"
3. Copy the key

## 🔗 Step 4: Set Up Affiliate Tracking (Optional)

### 4.1 Skimlinks
1. Go to [skimlinks.com](https://skimlinks.com)
2. Sign up for publisher account
3. Get your publisher ID

### 4.2 Amazon Associates
1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Sign up for Associates program
3. Get your affiliate tag

## 🚀 Step 5: Deploy to Vercel

### 5.1 Prepare Your Code
1. Make sure all your code is committed to GitHub
2. Update `env.example` with your actual values
3. Create `.env.local` with your production values

### 5.2 Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 5.3 Set Environment Variables
In your Vercel project settings, add these environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email
RESEND_API_KEY=your_resend_api_key

# Affiliate (optional)
SKIMLINKS_ID=your_skimlinks_id
AMAZON_AFFILIATE_TAG=your_amazon_tag

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 5.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## ⚙️ Step 6: Configure Custom Domain

### 6.1 Add Domain in Vercel
1. Go to your Vercel project
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Follow DNS setup instructions

### 6.2 Update Environment Variables
Update `NEXT_PUBLIC_SITE_URL` to your custom domain.

## 🔄 Step 7: Set Up Automated Content Ingestion

### 7.1 Using Vercel Cron Jobs (Recommended)
Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/ingest",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

This will:
- Fetch new content every 6 hours
- Send weekly digest every Monday at 9 AM

### 7.2 Manual Testing
Test your endpoints:
```bash
# Test content ingestion
curl -X POST https://yourdomain.com/api/ingest

# Test digest generation
curl -X GET https://yourdomain.com/api/digest
```

## 📊 Step 8: Monitor and Optimize

### 8.1 Set Up Analytics
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property for your domain
3. Add tracking code to your app

### 8.2 Monitor Performance
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Monitor database usage
- **OpenAI Usage**: Track API costs
- **Resend Dashboard**: Monitor email delivery

### 8.3 Set Up Alerts
1. **Vercel**: Set up deployment notifications
2. **Supabase**: Monitor database limits
3. **OpenAI**: Set usage alerts
4. **Resend**: Monitor email delivery rates

## 🔒 Step 9: Security and Optimization

### 9.1 Security Headers
Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 9.2 Performance Optimization
1. **Image Optimization**: Already configured with Next.js
2. **Caching**: Vercel handles CDN caching
3. **Database Indexes**: Already set up in SQL script
4. **Rate Limiting**: Consider adding API rate limiting

## 📈 Step 10: Scale and Monetize

### 10.1 Monitor Growth
- Track user engagement
- Monitor affiliate click-through rates
- Analyze popular content categories

### 10.2 Optimize Revenue
- A/B test affiliate link placement
- Experiment with different content sources
- Optimize email digest timing

### 10.3 Scale Infrastructure
- **Supabase**: Upgrade to Pro plan when needed
- **Vercel**: Upgrade for more bandwidth
- **OpenAI**: Monitor and adjust usage limits

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript errors
   - Check dependency versions

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Monitor connection limits

3. **AI Processing Failures**
   - Check OpenAI API key
   - Monitor rate limits
   - Verify API quotas

4. **Email Delivery Issues**
   - Check Resend API key
   - Verify domain configuration
   - Monitor spam scores

### Getting Help
- **Vercel**: Check deployment logs
- **Supabase**: Use SQL editor for debugging
- **OpenAI**: Check API documentation
- **Resend**: Monitor delivery dashboard

## 🎉 You're Live!

Your ContentFeed app is now production-ready with:
- ✅ Automated content ingestion
- ✅ AI-powered processing
- ✅ Email digest system
- ✅ Affiliate tracking
- ✅ Professional hosting
- ✅ Custom domain
- ✅ Security headers
- ✅ Performance optimization

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Start promoting your content feed
4. Monitor and optimize performance
5. Scale as needed

Happy publishing! 🚀 

## ⚙️ Step 6: Configure Custom Domain

### 6.1 Add Domain in Vercel
1. Go to your Vercel project
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Follow DNS setup instructions

### 6.2 Update Environment Variables
Update `NEXT_PUBLIC_SITE_URL` to your custom domain.

## 🔄 Step 7: Set Up Automated Content Ingestion

### 7.1 Using Vercel Cron Jobs (Recommended)
Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/ingest",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

This will:
- Fetch new content every 6 hours
- Send weekly digest every Monday at 9 AM

### 7.2 Manual Testing
Test your endpoints:
```bash
# Test content ingestion
curl -X POST https://yourdomain.com/api/ingest

# Test digest generation
curl -X GET https://yourdomain.com/api/digest
```

## 📊 Step 8: Monitor and Optimize

### 8.1 Set Up Analytics
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property for your domain
3. Add tracking code to your app

### 8.2 Monitor Performance
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Monitor database usage
- **OpenAI Usage**: Track API costs
- **Resend Dashboard**: Monitor email delivery

### 8.3 Set Up Alerts
1. **Vercel**: Set up deployment notifications
2. **Supabase**: Monitor database limits
3. **OpenAI**: Set usage alerts
4. **Resend**: Monitor email delivery rates

## 🔒 Step 9: Security and Optimization

### 9.1 Security Headers
Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 9.2 Performance Optimization
1. **Image Optimization**: Already configured with Next.js
2. **Caching**: Vercel handles CDN caching
3. **Database Indexes**: Already set up in SQL script
4. **Rate Limiting**: Consider adding API rate limiting

## 📈 Step 10: Scale and Monetize

### 10.1 Monitor Growth
- Track user engagement
- Monitor affiliate click-through rates
- Analyze popular content categories

### 10.2 Optimize Revenue
- A/B test affiliate link placement
- Experiment with different content sources
- Optimize email digest timing

### 10.3 Scale Infrastructure
- **Supabase**: Upgrade to Pro plan when needed
- **Vercel**: Upgrade for more bandwidth
- **OpenAI**: Monitor and adjust usage limits

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript errors
   - Check dependency versions

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Monitor connection limits

3. **AI Processing Failures**
   - Check OpenAI API key
   - Monitor rate limits
   - Verify API quotas

4. **Email Delivery Issues**
   - Check Resend API key
   - Verify domain configuration
   - Monitor spam scores

### Getting Help
- **Vercel**: Check deployment logs
- **Supabase**: Use SQL editor for debugging
- **OpenAI**: Check API documentation
- **Resend**: Monitor delivery dashboard

## 🎉 You're Live!

Your ContentFeed app is now production-ready with:
- ✅ Automated content ingestion
- ✅ AI-powered processing
- ✅ Email digest system
- ✅ Affiliate tracking
- ✅ Professional hosting
- ✅ Custom domain
- ✅ Security headers
- ✅ Performance optimization

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Start promoting your content feed
4. Monitor and optimize performance
5. Scale as needed

Happy publishing! 🚀 

## ⚙️ Step 6: Configure Custom Domain

### 6.1 Add Domain in Vercel
1. Go to your Vercel project
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Follow DNS setup instructions

### 6.2 Update Environment Variables
Update `NEXT_PUBLIC_SITE_URL` to your custom domain.

## 🔄 Step 7: Set Up Automated Content Ingestion

### 7.1 Using Vercel Cron Jobs (Recommended)
Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/ingest",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

This will:
- Fetch new content every 6 hours
- Send weekly digest every Monday at 9 AM

### 7.2 Manual Testing
Test your endpoints:
```bash
# Test content ingestion
curl -X POST https://yourdomain.com/api/ingest

# Test digest generation
curl -X GET https://yourdomain.com/api/digest
```

## 📊 Step 8: Monitor and Optimize

### 8.1 Set Up Analytics
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property for your domain
3. Add tracking code to your app

### 8.2 Monitor Performance
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Monitor database usage
- **OpenAI Usage**: Track API costs
- **Resend Dashboard**: Monitor email delivery

### 8.3 Set Up Alerts
1. **Vercel**: Set up deployment notifications
2. **Supabase**: Monitor database limits
3. **OpenAI**: Set usage alerts
4. **Resend**: Monitor email delivery rates

## 🔒 Step 9: Security and Optimization

### 9.1 Security Headers
Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 9.2 Performance Optimization
1. **Image Optimization**: Already configured with Next.js
2. **Caching**: Vercel handles CDN caching
3. **Database Indexes**: Already set up in SQL script
4. **Rate Limiting**: Consider adding API rate limiting

## 📈 Step 10: Scale and Monetize

### 10.1 Monitor Growth
- Track user engagement
- Monitor affiliate click-through rates
- Analyze popular content categories

### 10.2 Optimize Revenue
- A/B test affiliate link placement
- Experiment with different content sources
- Optimize email digest timing

### 10.3 Scale Infrastructure
- **Supabase**: Upgrade to Pro plan when needed
- **Vercel**: Upgrade for more bandwidth
- **OpenAI**: Monitor and adjust usage limits

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript errors
   - Check dependency versions

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Monitor connection limits

3. **AI Processing Failures**
   - Check OpenAI API key
   - Monitor rate limits
   - Verify API quotas

4. **Email Delivery Issues**
   - Check Resend API key
   - Verify domain configuration
   - Monitor spam scores

### Getting Help
- **Vercel**: Check deployment logs
- **Supabase**: Use SQL editor for debugging
- **OpenAI**: Check API documentation
- **Resend**: Monitor delivery dashboard

## 🎉 You're Live!

Your ContentFeed app is now production-ready with:
- ✅ Automated content ingestion
- ✅ AI-powered processing
- ✅ Email digest system
- ✅ Affiliate tracking
- ✅ Professional hosting
- ✅ Custom domain
- ✅ Security headers
- ✅ Performance optimization

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Start promoting your content feed
4. Monitor and optimize performance
5. Scale as needed

Happy publishing! 🚀 