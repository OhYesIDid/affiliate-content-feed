# Twitter Bot Setup Guide

This guide will help you set up the Twitter bot to automatically tweet your latest articles from the affiliate content feed.

## Prerequisites

1. Python 3.7+ installed
2. Twitter Developer Account
3. Your existing Supabase and OpenAI API keys

## Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Get Twitter API Credentials

### 1. Create a Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Apply for a developer account (Basic access is free)
4. Wait for approval (usually takes 1-2 days)

### 2. Create a Twitter App

1. Once approved, go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create App" or "Create Project"
3. Fill in the required information:
   - App name: "Affiliate Content Bot" (or your preferred name)
   - Use case: Select "Making a bot"
   - Description: "Automated bot for sharing affiliate content"

### 3. Get API Keys and Tokens

1. In your app dashboard, go to "Keys and Tokens"
2. Generate the following credentials:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token**

### 4. Generate Access Tokens

1. In the same "Keys and Tokens" section, scroll down to "Authentication Tokens"
2. Click "Generate" for Access Token and Secret
3. Make sure to select "Read and Write" permissions

### 5. Copy All Credentials

You'll need these 5 values:
- `TWITTER_BEARER_TOKEN`
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

## Step 3: Update Environment Variables

Add the Twitter credentials to your `.env.local` file:

```bash
# Twitter API v2 (for Twitter Bot)
TWITTER_BEARER_TOKEN=your_bearer_token_here
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

## Step 4: Update Database Schema

The bot needs a `tweeted_at` column to track which articles have been tweeted. Run this SQL in your Supabase dashboard:

```sql
-- Add tweeted_at column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS tweeted_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_tweeted_at 
ON articles(tweeted_at);

-- Add index for ordering by published_at
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
ON articles(published_at DESC);
```

## Step 5: Test the Bot

### Manual Test

Run the bot manually to test it:

```bash
python twitter_bot.py
```

The bot will:
1. Find the latest untweeted article
2. Generate a tweet using OpenAI
3. Post it to Twitter
4. Mark the article as tweeted

### Check Logs

The bot creates a `twitter_bot.log` file with detailed logs. Check it for any errors:

```bash
tail -f twitter_bot.log
```

## Step 6: Automate the Bot

### Option 1: Cron Job (Linux/Mac)

Add to your crontab to run every hour:

```bash
# Edit crontab
crontab -e

# Add this line to run every hour
0 * * * * cd /path/to/your/project && python twitter_bot.py
```

### Option 2: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to run every hour
4. Action: Start a program
5. Program: `python`
6. Arguments: `twitter_bot.py`
7. Start in: Your project directory

### Option 3: GitHub Actions (Recommended)

Create `.github/workflows/twitter-bot.yml`:

```yaml
name: Twitter Bot

on:
  schedule:
    - cron: '0 * * * *'  # Run every hour
  workflow_dispatch:  # Allow manual trigger

jobs:
  tweet:
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
    
    - name: Run Twitter Bot
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
        TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
        TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
        TWITTER_ACCESS_TOKEN: ${{ secrets.TWITTER_ACCESS_TOKEN }}
        TWITTER_ACCESS_TOKEN_SECRET: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}
      run: python twitter_bot.py
```

Add the secrets to your GitHub repository settings.

## Step 7: Customize Tweet Generation

### Modify Tweet Style

Edit the `generate_tweet` method in `twitter_bot.py` to customize:

- Tweet tone (professional, casual, humorous)
- Hashtag strategy
- Call-to-action style
- Character limit handling

### Example Customizations

```python
# Add your brand hashtag
tweet_text += " #YourBrand"

# Add emoji for engagement
tweet_text = "🚀 " + tweet_text

# Custom call-to-action
tweet_text += "\n\nRead more 👇"
```

## Troubleshooting

### Common Issues

1. **"No articles found"**
   - Check if articles exist in your database
   - Verify Supabase credentials
   - Check if all articles are already marked as tweeted

2. **"Twitter API error"**
   - Verify all Twitter credentials are correct
   - Check if your Twitter app has write permissions
   - Ensure you haven't exceeded rate limits

3. **"OpenAI API error"**
   - Check your OpenAI API key
   - Verify you have sufficient credits
   - Check if you've exceeded rate limits

4. **"Failed to mark article as tweeted"**
   - Check Supabase permissions
   - Verify the `tweeted_at` column exists
   - Check database connection

### Rate Limits

- **Twitter**: 300 tweets per 3 hours (for Basic access)
- **OpenAI**: Varies by plan, typically 3 requests per minute for free tier

### Monitoring

The bot logs all activities to `twitter_bot.log`. Monitor this file to:

- Track successful tweets
- Identify errors
- Monitor API usage
- Debug issues

## Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** periodically
4. **Monitor API usage** to prevent abuse
5. **Use GitHub secrets** for automated deployments

## Next Steps

Once the bot is running:

1. **Monitor performance** - Check engagement rates
2. **A/B test** different tweet styles
3. **Optimize timing** - Find best posting times
4. **Scale up** - Consider posting multiple times per day
5. **Add analytics** - Track click-through rates

## Support

If you encounter issues:

1. Check the logs in `twitter_bot.log`
2. Verify all environment variables are set
3. Test API credentials individually
4. Check Twitter Developer Portal for status updates 