# Twitter Bot for Affiliate Content Feed

Automatically tweet your latest articles from the affiliate content feed using AI-generated summaries.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables** (add to `.env.local`):
   ```bash
   # Twitter API v2
   TWITTER_BEARER_TOKEN=your_bearer_token
   TWITTER_API_KEY=your_api_key
   TWITTER_API_SECRET=your_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
   ```

3. **Update database schema:**
   ```sql
   ALTER TABLE articles 
   ADD COLUMN IF NOT EXISTS tweeted_at TIMESTAMP WITH TIME ZONE;
   ```

4. **Test the setup:**
   ```bash
   python test_twitter_bot.py
   ```

5. **Run the bot:**
   ```bash
   python twitter_bot.py
   ```

## What it does

- Retrieves the latest untweeted article from your Supabase database
- Uses OpenAI to generate an engaging tweet (under 280 characters)
- Posts the tweet with affiliate links
- Marks the article as tweeted to avoid duplicates

## Files

- `twitter_bot.py` - Main bot script
- `test_twitter_bot.py` - Test script to verify setup
- `requirements.txt` - Python dependencies
- `TWITTER_BOT_SETUP.md` - Detailed setup guide

## Automation

See `TWITTER_BOT_SETUP.md` for automation options:
- Cron jobs
- Windows Task Scheduler  
- GitHub Actions

## Troubleshooting

Run the test script first:
```bash
python test_twitter_bot.py
```

Check logs:
```bash
tail -f twitter_bot.log
``` 