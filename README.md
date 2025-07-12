# ContentFeed - AI-Powered Affiliate Content Feed

A modern web application that automatically ingests content from RSS feeds, processes it with AI, and displays it in a beautiful feed with affiliate tracking.

## 🚀 Features

### Core Functionality
- **RSS Feed Ingestion**: Automatically fetch content from multiple RSS feeds
- **AI Content Processing**: GPT-4 powered summarization, tagging, and categorization
- **Affiliate Link Tracking**: Automatic affiliate link generation for monetization
- **Modern Feed UI**: Clean, responsive design with search and filtering
- **User Interactions**: Like, bookmark, and share articles
- **Email Digest**: Weekly email digest of top content
- **Real-time Updates**: Fresh content automatically added to the feed

### Content Sources
- **Tech**: TechCrunch, The Verge
- **Finance**: CNBC, BBC Business
- **Lifestyle**: Lifehacker
- **Custom**: Easy to add more RSS feeds

### AI Features
- **Smart Summarization**: GPT-4 generates engaging summaries
- **Auto-tagging**: Relevant tags automatically generated
- **Content Categorization**: Articles sorted into appropriate categories
- **SEO Optimization**: Content rewritten for better search rankings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Email**: Resend
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd affiliate-content-feed
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Optional: Affiliate tracking
SKIMLINKS_ID=your_skimlinks_id
AMAZON_AFFILIATE_TAG=your_amazon_tag
```

### 3. Database Setup (Supabase)

Create the following tables in your Supabase database:

#### Articles Table
```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL,
  affiliate_url TEXT,
  image_url TEXT,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  ai_summary TEXT,
  ai_rewrite TEXT
);
```

#### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  digest_subscription BOOLEAN DEFAULT FALSE
);
```

#### Bookmarks Table
```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);
```

#### Likes Table
```sql
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);
```

#### Digest Subscriptions Table
```sql
CREATE TABLE digest_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎯 Usage

### Content Ingestion
The app automatically fetches content from RSS feeds. To manually trigger ingestion:

```bash
curl -X POST http://localhost:3000/api/ingest
```

### Adding New RSS Feeds
Edit `lib/rss.ts` to add new RSS feeds:

```typescript
export const RSS_FEEDS = [
  {
    name: 'Your Feed Name',
    url: 'https://your-feed-url.com/rss',
    category: 'tech', // or 'finance', 'business', 'lifestyle', 'deals', 'news'
    source: 'Your Source Name'
  },
  // ... more feeds
];
```

### Affiliate Integration
Configure affiliate tracking in `lib/rss.ts`:

```typescript
async createAffiliateUrl(originalUrl: string): Promise<string> {
  // Skimlinks
  if (process.env.SKIMLINKS_ID) {
    return `https://go.skimresources.com/?id=${process.env.SKIMLINKS_ID}&url=${encodeURIComponent(originalUrl)}`;
  }
  
  // Amazon affiliate
  if (originalUrl.includes('amazon.com') && process.env.AMAZON_AFFILIATE_TAG) {
    return `${originalUrl}?tag=${process.env.AMAZON_AFFILIATE_TAG}`;
  }
  
  return originalUrl;
}
```

## 📊 API Endpoints

### GET /api/articles
Fetch articles with filtering and pagination.

**Query Parameters:**
- `category`: Filter by category
- `source`: Filter by source
- `tags`: Comma-separated tags
- `sort`: Sort field (created_at, likes_count)
- `order`: Sort order (asc, desc)
- `limit`: Number of articles (default: 20)
- `offset`: Pagination offset (default: 0)

### POST /api/ingest
Trigger content ingestion from RSS feeds.

### POST /api/digest
Subscribe to email digest.

**Body:**
```json
{
  "email": "user@example.com",
  "frequency": "weekly"
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Customization

### Styling
Modify `tailwind.config.js` to customize colors and styling.

### RSS Feeds
Add or modify RSS feeds in `lib/rss.ts`.

### AI Prompts
Customize AI processing prompts in `lib/openai.ts`.

### Email Templates
Create custom email templates for the digest in `app/api/digest/route.ts`.

## 📈 Performance

- **Image Optimization**: Next.js automatic image optimization
- **Lazy Loading**: Images and content loaded on demand
- **Caching**: Supabase caching for fast queries
- **CDN**: Vercel's global CDN for fast delivery

## 🔒 Security

- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: All user inputs validated
- **CORS**: Configured for production domains
- **Rate Limiting**: Implement rate limiting for API endpoints

## 🆘 Troubleshooting

### Common Issues

1. **RSS Feed Not Loading**
   - Check feed URL is accessible
   - Verify CORS settings
   - Check network connectivity

2. **AI Processing Failing**
   - Verify OpenAI API key
   - Check API quota limits
   - Review error logs

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check database permissions
   - Ensure tables exist

### Getting Help
- Check the console for error messages
- Review the browser's network tab
- Check Supabase logs
- Verify environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Open an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**ContentFeed** - Making AI-powered content curation accessible to everyone. 