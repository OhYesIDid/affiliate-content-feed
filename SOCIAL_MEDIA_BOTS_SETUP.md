# Social Media Bots Setup Guide

This guide will help you set up automated social media bots for your affiliate content feed across multiple platforms.

## Overview

The social media bots will:
- Retrieve the latest article from your Supabase database
- Generate platform-specific content using OpenAI
- Post to multiple social media platforms
- Track which articles have been posted to each platform

## Available Bots

1. **Twitter Bot** (`twitter_bot.py`) - Posts tweets with affiliate links
2. **LinkedIn Bot** (`linkedin_bot.py`) - Posts professional content to LinkedIn
3. **Facebook Bot** (`facebook_bot.py`) - Posts to Facebook pages
4. **Reddit Bot** (`reddit_bot.py`) - Posts to relevant subreddits

## Prerequisites

- Python 3.7+ installed
- Social media developer accounts
- Your existing Supabase and OpenAI API keys

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Database Schema Updates

Run these SQL commands in your Supabase dashboard to add tracking columns:

```sql
-- Add social media posting tracking columns
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS posted_to_twitter_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS posted_to_linkedin_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS posted_to_facebook_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS posted_to_reddit_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_twitter_posted 
ON articles(posted_to_twitter_at);

CREATE INDEX IF NOT EXISTS idx_articles_linkedin_posted 
ON articles(posted_to_linkedin_at);

CREATE INDEX IF NOT EXISTS idx_articles_facebook_posted 
ON articles(posted_to_facebook_at);

CREATE INDEX IF NOT EXISTS idx_articles_reddit_posted 
ON articles(posted_to_reddit_at);
```

## Step 3: Platform-Specific Setup

### Twitter Bot Setup

1. **Get Twitter API Credentials** (see `TWITTER_BOT_SETUP.md` for detailed instructions)
2. **Add to `.env.local`**:
   ```bash
   TWITTER_BEARER_TOKEN=your_bearer_token
   TWITTER_API_KEY=your_api_key
   TWITTER_API_SECRET=your_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
   ```

### LinkedIn Bot Setup

1. **Create LinkedIn App**:
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Request access to "Marketing Developer Platform"
   - Get OAuth 2.0 credentials

2. **Generate Access Token**:
   - Use LinkedIn's OAuth 2.0 flow
   - Request permissions: `r_liteprofile`, `w_member_social`
   - Get long-lived access token

3. **Add to `.env.local`**:
   ```bash
   LINKEDIN_ACCESS_TOKEN=your_access_token
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

### Facebook Bot Setup

1. **Create Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add "Pages" product
   - Get app credentials

2. **Get Page Access Token**:
   - Connect your Facebook page to the app
   - Generate page access token with `pages_manage_posts` permission

3. **Add to `.env.local`**:
   ```bash
   FACEBOOK_ACCESS_TOKEN=your_page_access_token
   FACEBOOK_PAGE_ID=your_page_id
   ```

### Reddit Bot Setup

1. **Create Reddit App**:
   - Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
   - Create a new app (script type)
   - Get client ID and secret

2. **Add to `.env.local`**:
   ```bash
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   REDDIT_USER_AGENT=AffiliateContentBot/1.0
   ```

## Step 4: Environment Variables

Complete `.env.local` file should include:

```bash
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key

# Twitter
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your_access_token
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Facebook
FACEBOOK_ACCESS_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_page_id

# Reddit
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=AffiliateContentBot/1.0
```

## Step 5: Test Individual Bots

Test each bot individually:

```bash
# Test Twitter bot
python twitter_bot.py

# Test LinkedIn bot
python linkedin_bot.py

# Test Facebook bot
python facebook_bot.py

# Test Reddit bot
python reddit_bot.py
```

## Step 6: Create Master Bot

Create a master bot that runs all platforms:

```python
# master_social_bot.py
#!/usr/bin/env python3
"""
Master Social Media Bot
Runs all social media bots in sequence.
"""

import subprocess
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_bot(bot_name: str, script_path: str) -> bool:
    """Run a specific bot and return success status."""
    try:
        logger.info(f"Running {bot_name}...")
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f"{bot_name} completed successfully")
            return True
        else:
            logger.error(f"{bot_name} failed: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"Error running {bot_name}: {e}")
        return False

def main():
    """Run all social media bots."""
    bots = [
        ("Twitter", "twitter_bot.py"),
        ("LinkedIn", "linkedin_bot.py"),
        ("Facebook", "facebook_bot.py"),
        ("Reddit", "reddit_bot.py")
    ]
    
    success_count = 0
    total_bots = len(bots)
    
    for bot_name, script_path in bots:
        if run_bot(bot_name, script_path):
            success_count += 1
    
    logger.info(f"Completed: {success_count}/{total_bots} bots successful")
    return 0 if success_count == total_bots else 1

if __name__ == "__main__":
    exit(main())
```

## Step 7: Automation

### Option 1: Cron Job (Linux/Mac)

```bash
# Run every 2 hours
0 */2 * * * cd /path/to/your/project && python master_social_bot.py
```

### Option 2: Windows Task Scheduler

1. Create a task to run every 2 hours
2. Program: `python`
3. Arguments: `master_social_bot.py`
4. Start in: Your project directory

### Option 3: GitHub Actions

Create `.github/workflows/social-media-bots.yml`:

```yaml
name: Social Media Bots

on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
  workflow_dispatch:  # Manual trigger

jobs:
  social-media:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
    
    - name: Run Social Media Bots
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
        TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
        TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
        TWITTER_ACCESS_TOKEN: ${{ secrets.TWITTER_ACCESS_TOKEN }}
        TWITTER_ACCESS_TOKEN_SECRET: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}
        LINKEDIN_ACCESS_TOKEN: ${{ secrets.LINKEDIN_ACCESS_TOKEN }}
        LINKEDIN_CLIENT_ID: ${{ secrets.LINKEDIN_CLIENT_ID }}
        LINKEDIN_CLIENT_SECRET: ${{ secrets.LINKEDIN_CLIENT_SECRET }}
        FACEBOOK_ACCESS_TOKEN: ${{ secrets.FACEBOOK_ACCESS_TOKEN }}
        FACEBOOK_PAGE_ID: ${{ secrets.FACEBOOK_PAGE_ID }}
        REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
        REDDIT_CLIENT_SECRET: ${{ secrets.REDDIT_CLIENT_SECRET }}
        REDDIT_USERNAME: ${{ secrets.REDDIT_USERNAME }}
        REDDIT_PASSWORD: ${{ secrets.REDDIT_PASSWORD }}
        REDDIT_USER_AGENT: ${{ secrets.REDDIT_USER_AGENT }}
      run: python master_social_bot.py
```

## Step 8: Monitoring

### Log Files

Each bot creates its own log file:
- `twitter_bot.log`
- `linkedin_bot.log`
- `facebook_bot.log`
- `reddit_bot.log`

### Check Logs

```bash
# Check all logs
tail -f *.log

# Check specific bot
tail -f twitter_bot.log
```

## Platform-Specific Notes

### Twitter
- **Rate Limit**: 300 tweets per 3 hours (Basic access)
- **Character Limit**: 280 characters
- **Best Practices**: Use hashtags, include images when possible

### LinkedIn
- **Rate Limit**: 100 posts per day
- **Character Limit**: 1300 characters
- **Best Practices**: Professional tone, business-focused content

### Facebook
- **Rate Limit**: Varies by page size
- **Character Limit**: 63,206 characters
- **Best Practices**: Engaging content, use images/videos

### Reddit
- **Rate Limit**: 1 post per 10 minutes per subreddit
- **Character Limit**: 300 characters for title
- **Best Practices**: Follow subreddit rules, no self-promotion

## Troubleshooting

### Common Issues

1. **"No articles found"**
   - Check if articles exist in database
   - Verify Supabase credentials
   - Check if articles are already marked as posted

2. **"API authentication failed"**
   - Verify API credentials
   - Check if tokens are expired
   - Ensure proper permissions

3. **"Rate limit exceeded"**
   - Reduce posting frequency
   - Implement exponential backoff
   - Check platform-specific limits

### Rate Limiting

Implement delays between posts:
```python
import time
time.sleep(60)  # Wait 1 minute between posts
```

### Error Recovery

Each bot includes error handling and will:
- Log all errors
- Continue execution if possible
- Mark articles as posted only on success

## Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** periodically
4. **Monitor API usage** to prevent abuse
5. **Use GitHub secrets** for automated deployments

## Next Steps

Once all bots are running:

1. **Monitor performance** - Check engagement rates across platforms
2. **A/B test** different content styles
3. **Optimize timing** - Find best posting times for each platform
4. **Scale up** - Consider adding more platforms (Instagram, TikTok, etc.)
5. **Add analytics** - Track click-through rates and conversions

## Support

For platform-specific issues:
- **Twitter**: [Twitter Developer Support](https://developer.twitter.com/en/support)
- **LinkedIn**: [LinkedIn Developer Support](https://developer.linkedin.com/support)
- **Facebook**: [Facebook Developer Support](https://developers.facebook.com/support/)
- **Reddit**: [Reddit API Documentation](https://www.reddit.com/dev/api/) 