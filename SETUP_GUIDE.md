# AI Affiliate Content Feed App - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Database Setup](#supabase-database-setup)
4. [OpenAI API Setup](#openai-api-setup)
5. [Resend Email Setup](#resend-email-setup)
6. [Affiliate Network Setup](#affiliate-network-setup)
7. [Environment Configuration](#environment-configuration)
8. [Database Initialization](#database-initialization)
9. [Testing the Setup](#testing-the-setup)
10. [Vercel Deployment](#vercel-deployment)
11. [Production Configuration](#production-configuration)
12. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### Required Accounts
- [GitHub](https://github.com) - for code repository
- [Supabase](https://supabase.com) - for database and authentication
- [OpenAI](https://openai.com) - for AI content processing
- [Resend](https://resend.com) - for email delivery
- [Vercel](https://vercel.com) - for hosting and deployment
- [Skimlinks](https://skimlinks.com) or [Awin](https://awin.com) - for affiliate tracking

### Required Software
- Node.js 18+ 
- npm or yarn
- Git
- A code editor (VS Code recommended)

## Local Development Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to your project directory
cd your-project-folder

# Install dependencies
npm install

# Verify installation
npm run dev
```

### Step 2: Verify Project Structure

Ensure you have the following key files:
- `package.json` - dependencies and scripts
- `lib/supabase.ts` - Supabase client configuration
- `lib/openai.ts` - OpenAI integration
- `lib/rss-production.ts` - RSS feed processing
- `lib/email-digest.ts` - Email digest service
- `scripts/setup-database.sql` - Database schema
- `vercel.json` - Vercel configuration
- `env.example` - Environment variables template

## Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `ai-affiliate-feed`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for setup to complete (2-3 minutes)

### Step 2: Get Database Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### Step 3: Initialize Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `scripts/setup-database.sql`
3. Paste and execute the SQL script
4. Verify tables are created:
   - `articles`
   - `categories`
   - `tags`
   - `email_subscribers`
   - `user_interactions`

### Step 4: Configure Row Level Security (RLS)

1. Go to Authentication → Policies
2. Enable RLS on all tables
3. Create policies for public read access on articles
4. Create policies for authenticated users on interactions

## OpenAI API Setup

### Step 1: Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Add payment method (required for API usage)

### Step 2: Generate API Key

1. Go to API Keys section
2. Click "Create new secret key"
3. Name it: `ai-affiliate-feed`
4. Copy the key immediately (you won't see it again)

### Step 3: Set Usage Limits

1. Go to Billing → Usage limits
2. Set soft limit: $50/month
3. Set hard limit: $100/month
4. Enable email notifications

## Resend Email Setup

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### Step 2: Add Domain (Optional but Recommended)

1. Go to Domains section
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for verification (can take 24-48 hours)

### Step 3: Get API Key

1. Go to API Keys section
2. Click "Create API Key"
3. Name it: `ai-affiliate-feed`
4. Copy the key

## Affiliate Network Setup

### Option 1: Skimlinks

1. Go to [skimlinks.com](https://skimlinks.com)
2. Sign up for an account
3. Add your website
4. Get your publisher ID
5. Configure link rewriting settings

### Option 2: Awin

1. Go to [awin.com](https://awin.com)
2. Sign up for an account
3. Add your website
4. Get your publisher ID
5. Configure link rewriting settings

### Option 3: Amazon Associates

1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Sign up for Associates program
3. Get your tracking ID
4. Configure link format

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp env.example .env.local
```

### Step 2: Configure Environment Variables

Edit `.env.local` with your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Affiliate Networks
SKIMLINKS_PUBLISHER_ID=your_skimlinks_publisher_id
AWIN_PUBLISHER_ID=your_awin_publisher_id
AMAZON_TRACKING_ID=your_amazon_tracking_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Step 3: Generate Encryption Key

```bash
# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Initialization

### Step 1: Run Database Setup

```bash
# The database schema should already be set up from Supabase setup
# Verify tables exist in Supabase dashboard
```

### Step 2: Add Sample Data (Optional)

```bash
# Start the development server
npm run dev

# Visit http://localhost:3000/api/ingest to trigger RSS ingestion
# This will populate the database with sample articles
```

## Testing the Setup

### Step 1: Test Database Connection

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Check browser console for any Supabase connection errors

### Step 2: Test RSS Ingestion

1. Visit `http://localhost:3000/api/ingest`
2. Check the response for success/error messages
3. Verify articles appear in your Supabase dashboard

### Step 3: Test AI Processing

1. Check the console logs during ingestion
2. Verify articles have summaries and tags
3. Check OpenAI usage in your OpenAI dashboard

### Step 4: Test Email Digest

1. Subscribe to email digest on the homepage
2. Visit `http://localhost:3000/api/digest` to trigger digest
3. Check your email for the digest

## Vercel Deployment

### Step 1: Prepare for Deployment

1. Commit all changes to Git:
```bash
git add .
git commit -m "Initial setup complete"
git push origin main
```

2. Ensure `.env.local` is in `.gitignore`

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Configure Environment Variables

1. In Vercel dashboard, go to Settings → Environment Variables
2. Add all variables from your `.env.local` file
3. Set environment to "Production"
4. Add variables for Preview and Development environments

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at your Vercel URL

## Production Configuration

### Step 1: Configure Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

### Step 2: Set Up Cron Jobs

1. Vercel cron jobs are configured in `vercel.json`
2. Verify they're running in Vercel dashboard
3. Check logs for any errors

### Step 3: Configure Monitoring

1. Set up Vercel Analytics (optional)
2. Configure error tracking (Sentry recommended)
3. Set up uptime monitoring

## Monitoring and Maintenance

### Daily Tasks

1. Check Vercel deployment logs
2. Monitor OpenAI API usage
3. Check email delivery rates
4. Review affiliate link performance

### Weekly Tasks

1. Review RSS feed sources
2. Update content categories
3. Analyze user engagement
4. Check database performance

### Monthly Tasks

1. Review and update affiliate networks
2. Analyze revenue performance
3. Update AI prompts if needed
4. Backup database

### Troubleshooting Common Issues

#### RSS Ingestion Fails
- Check RSS feed URLs are accessible
- Verify OpenAI API key and limits
- Check Supabase connection

#### Email Digest Not Sending
- Verify Resend API key
- Check email domain verification
- Review email templates

#### Affiliate Links Not Working
- Verify affiliate network credentials
- Check link rewriting logic
- Test affiliate network dashboard

#### Performance Issues
- Check Vercel function execution time
- Monitor database query performance
- Review OpenAI API response times

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **API Keys**: Rotate keys regularly
3. **Database**: Use RLS policies
4. **Rate Limiting**: Implement on API routes
5. **Input Validation**: Validate all user inputs
6. **HTTPS**: Always use HTTPS in production

## Scaling Considerations

1. **Database**: Consider read replicas for high traffic
2. **Caching**: Implement Redis for frequently accessed data
3. **CDN**: Use Vercel's edge network
4. **Queue**: Consider background job processing
5. **Monitoring**: Set up comprehensive logging

## Support and Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Resend Documentation](https://resend.com/docs)

---

**Need Help?** If you encounter any issues during setup, check the troubleshooting section above or refer to the specific platform documentation. 