# Troubleshooting Guide - AI Affiliate Content Feed

## Quick Diagnosis

Before diving into specific issues, run these diagnostic commands:

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version

# Check if dependencies are installed
npm list --depth=0

# Check environment variables
echo $NODE_ENV
```

## Common Issues and Solutions

### 🚨 Critical Issues

#### 1. App Won't Start

**Symptoms**: `npm run dev` fails or app doesn't load

**Possible Causes**:
- Missing dependencies
- Port already in use
- Environment variables not set
- Node.js version incompatible

**Solutions**:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
# Kill process if needed
kill -9 <PID>

# Use different port
npm run dev -- -p 3001

# Check environment file
ls -la .env.local
```

#### 2. Database Connection Errors

**Symptoms**: "Supabase connection failed" or "Database error"

**Solutions**:

1. **Verify Supabase credentials**:
```bash
# Check environment variables
grep SUPABASE .env.local
```

2. **Test Supabase connection**:
```javascript
// Add this to a test file
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test connection
const { data, error } = await supabase.from('articles').select('*').limit(1)
console.log('Connection test:', error || 'Success')
```

3. **Check Supabase dashboard**:
- Verify project is active
- Check API keys are correct
- Ensure database is not paused

#### 3. OpenAI API Errors

**Symptoms**: "OpenAI API error" or content not being processed

**Solutions**:

1. **Check API key**:
```bash
# Verify API key is set
echo $OPENAI_API_KEY
```

2. **Test OpenAI connection**:
```javascript
// Test OpenAI API
const response = await fetch('https://api.openai.com/v1/models', {
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  }
})
console.log('OpenAI test:', response.status)
```

3. **Check usage limits**:
- Visit OpenAI dashboard
- Check billing and usage
- Verify payment method

### 🔧 Development Issues

#### 4. Hot Reload Not Working

**Symptoms**: Changes not reflecting in browser

**Solutions**:

```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check file watching
# On Windows, increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### 5. TypeScript Errors

**Symptoms**: Type errors in console or build fails

**Solutions**:

```bash
# Check TypeScript version
npx tsc --version

# Run type check
npx tsc --noEmit

# Fix common issues
npm run lint -- --fix
```

#### 6. Styling Issues

**Symptoms**: CSS not loading or Tailwind not working

**Solutions**:

```bash
# Rebuild Tailwind CSS
npx tailwindcss -i ./app/globals.css -o ./app/output.css --watch

# Check PostCSS config
cat postcss.config.js

# Verify Tailwind config
cat tailwind.config.js
```

### 🌐 API Issues

#### 7. RSS Ingestion Fails

**Symptoms**: `/api/ingest` returns errors or no content

**Debug Steps**:

1. **Check RSS feed URLs**:
```javascript
// Test individual feeds
const testFeed = async (url) => {
  try {
    const response = await fetch(url)
    const text = await response.text()
    console.log('Feed accessible:', response.status === 200)
    return text.length > 0
  } catch (error) {
    console.error('Feed error:', error)
    return false
  }
}
```

2. **Check network connectivity**:
```bash
# Test feed accessibility
curl -I https://techcrunch.com/feed/
```

3. **Verify RSS parser**:
```javascript
// Test RSS parsing
import Parser from 'rss-parser'
const parser = new Parser()
const feed = await parser.parseURL('https://techcrunch.com/feed/')
console.log('Feed items:', feed.items.length)
```

#### 8. Email Not Sending

**Symptoms**: Email subscription or digest not working

**Solutions**:

1. **Check Resend configuration**:
```bash
# Verify API key
echo $RESEND_API_KEY
```

2. **Test email sending**:
```javascript
// Test Resend API
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: process.env.FROM_EMAIL,
    to: 'test@example.com',
    subject: 'Test',
    html: '<p>Test email</p>'
  })
})
console.log('Email test:', response.status)
```

3. **Check domain verification**:
- Verify domain in Resend dashboard
- Check DNS records
- Wait for verification (24-48 hours)

### 🚀 Deployment Issues

#### 9. Vercel Build Fails

**Symptoms**: Build fails during deployment

**Solutions**:

1. **Check build logs**:
- Review Vercel build output
- Look for specific error messages
- Check environment variables

2. **Test build locally**:
```bash
# Test production build
npm run build

# Check for build errors
npm run lint
```

3. **Common build issues**:
```bash
# Fix dependency issues
npm audit fix

# Clear cache
npm run build -- --no-cache
```

#### 10. Environment Variables Not Working

**Symptoms**: App works locally but not in production

**Solutions**:

1. **Check Vercel environment variables**:
- Go to Vercel dashboard → Settings → Environment Variables
- Verify all variables are set
- Check environment scope (Production/Preview/Development)

2. **Test environment variables**:
```javascript
// Add this to debug
console.log('Environment check:', {
  hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasResend: !!process.env.RESEND_API_KEY
})
```

#### 11. Cron Jobs Not Running

**Symptoms**: Automated tasks not executing

**Solutions**:

1. **Check Vercel cron configuration**:
```json
// Verify vercel.json
{
  "crons": [
    {
      "path": "/api/ingest",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. **Test cron endpoints manually**:
```bash
# Test ingestion
curl -X POST https://your-app.vercel.app/api/ingest

# Test digest
curl -X POST https://your-app.vercel.app/api/digest
```

3. **Check Vercel logs**:
- Go to Vercel dashboard → Functions
- Check execution logs
- Monitor error rates

### 📊 Performance Issues

#### 12. Slow Page Loads

**Symptoms**: Pages take >3 seconds to load

**Solutions**:

1. **Optimize images**:
```javascript
// Use Next.js Image component
import Image from 'next/image'

// Add proper sizing
<Image
  src={article.image}
  alt={article.title}
  width={400}
  height={300}
  priority={true}
/>
```

2. **Implement caching**:
```javascript
// Add caching headers
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

3. **Optimize database queries**:
```sql
-- Add indexes for common queries
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
```

#### 13. API Timeout Errors

**Symptoms**: API calls timing out

**Solutions**:

1. **Increase timeout limits**:
```javascript
// Add timeout to fetch calls
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000)

const response = await fetch(url, {
  signal: controller.signal
})
clearTimeout(timeoutId)
```

2. **Implement retry logic**:
```javascript
const retry = async (fn, retries = 3) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return retry(fn, retries - 1)
    }
    throw error
  }
}
```

### 🔒 Security Issues

#### 14. CORS Errors

**Symptoms**: "CORS policy" errors in browser

**Solutions**:

```javascript
// Add CORS headers to API routes
export async function GET(request: Request) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
```

#### 15. Rate Limiting Issues

**Symptoms**: "Too many requests" errors

**Solutions**:

```javascript
// Implement rate limiting
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

export default function handler(req, res) {
  limiter(req, res, () => {
    // Your API logic here
  })
}
```

## Debugging Tools

### 1. Browser Developer Tools

```javascript
// Add debug logging
console.log('Debug info:', {
  environment: process.env.NODE_ENV,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  timestamp: new Date().toISOString()
})
```

### 2. Network Tab

- Check API response times
- Verify request/response headers
- Look for failed requests

### 3. Console Logs

```javascript
// Add structured logging
const log = (level, message, data = {}) => {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data
  }))
}
```

## Getting Help

### 1. Check Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### 2. Community Resources

- [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
- [Supabase Discord](https://discord.supabase.com)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### 3. Support Contacts

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **OpenAI**: [help.openai.com](https://help.openai.com)
- **Resend**: [resend.com/support](https://resend.com/support)

## Emergency Procedures

### Quick Rollback

```bash
# Revert to previous deployment
git log --oneline -5
git checkout <previous-commit>
git push origin main --force
```

### Database Recovery

```sql
-- Backup current data
pg_dump $DATABASE_URL > backup.sql

-- Restore from backup
psql $DATABASE_URL < backup.sql
```

### Environment Reset

```bash
# Reset environment variables
cp env.example .env.local
# Re-add your actual values
```

---

**Remember**: Always test changes in development before deploying to production. Keep backups of your database and code before making major changes. 