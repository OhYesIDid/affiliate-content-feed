# Quick Start Guide - AI Affiliate Content Feed

## 🚀 Get Started in 15 Minutes

This guide will get your AI affiliate content feed app running locally for testing and development.

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## Step 1: Project Setup (2 minutes)

```bash
# Navigate to your project directory
cd your-project-folder

# Install dependencies
npm install

# Start development server
npm run dev
```

Your app should now be running at `http://localhost:3000`

## Step 2: Quick Database Setup (5 minutes)

### Option A: Use Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project named `ai-affiliate-feed`
3. Go to Settings → API and copy:
   - Project URL
   - Anon public key
4. Go to SQL Editor and run the database setup script from `scripts/setup-database.sql`

### Option B: Use Local Development (Skip for now)

For quick testing, the app will work with mock data without a database.

## Step 3: Basic Environment Setup (3 minutes)

```bash
# Copy environment template
cp env.example .env.local
```

Edit `.env.local` and add at minimum:

```env
# For basic functionality (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For AI features (optional for testing)
OPENAI_API_KEY=your_openai_key

# For email features (optional for testing)
RESEND_API_KEY=your_resend_key
FROM_EMAIL=test@example.com
```

## Step 4: Test Basic Functionality (5 minutes)

1. **Visit the homepage**: `http://localhost:3000`
   - You should see a content feed interface
   - Articles should load (mock data if no database)

2. **Test RSS ingestion**: `http://localhost:3000/api/ingest`
   - Should return success message
   - Check console for any errors

3. **Test article fetching**: `http://localhost:3000/api/articles`
   - Should return JSON array of articles

## Step 5: Add Real Content Sources (Optional)

Edit `lib/rss-production.ts` to add your preferred RSS feeds:

```typescript
const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  // Add your preferred feeds here
];
```

## Step 6: Test AI Features (Requires OpenAI API)

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add it to `.env.local`
3. Visit `http://localhost:3000/api/ingest` to test AI processing
4. Check that articles get summaries and tags

## Step 7: Test Email Digest (Requires Resend)

1. Get a Resend API key from [resend.com](https://resend.com)
2. Add it to `.env.local`
3. Subscribe to email digest on homepage
4. Visit `http://localhost:3000/api/digest` to test email sending

## 🎯 What You Should See

### Homepage (`http://localhost:3000`)
- Modern content feed interface
- Article cards with images and summaries
- Filter options (categories, tags)
- Email subscription form
- Search functionality

### API Endpoints
- `GET /api/articles` - Fetch articles
- `POST /api/ingest` - Trigger RSS ingestion
- `POST /api/subscribe` - Email subscription
- `POST /api/digest` - Send email digest

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
npm install
```

**Database connection errors**
- Check Supabase credentials in `.env.local`
- Verify database schema is set up

**API errors**
- Check browser console for details
- Verify environment variables are set

**Port already in use**
```bash
# Use different port
npm run dev -- -p 3001
```

### Getting Help

1. Check the browser console for error messages
2. Review the full setup guide in `SETUP_GUIDE.md`
3. Check the deployment guide in `DEPLOYMENT.md`

## 🚀 Next Steps

Once basic functionality works:

1. **Add real RSS feeds** to `lib/rss-production.ts`
2. **Set up affiliate networks** (Skimlinks, Awin, Amazon)
3. **Configure email templates** in `lib/email-digest.ts`
4. **Deploy to Vercel** using `DEPLOYMENT.md`
5. **Set up monitoring** and analytics

## 📊 Testing Checklist

- [ ] App loads without errors
- [ ] Articles display correctly
- [ ] RSS ingestion works
- [ ] AI processing functions (if OpenAI key set)
- [ ] Email subscription works (if Resend key set)
- [ ] Search and filters work
- [ ] Responsive design on mobile

## 🎉 Success!

Your AI affiliate content feed app is now running locally! 

**Ready to deploy?** Follow the `DEPLOYMENT.md` guide to get it live on the internet.

**Need to customize?** Check the full `SETUP_GUIDE.md` for detailed configuration options. 