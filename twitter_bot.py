#!/usr/bin/env python3
"""
Twitter Bot for Affiliate Content Feed
Retrieves latest article from Supabase, summarizes it, and posts to Twitter.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('twitter_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SupabaseClient:
    """Client for interacting with Supabase database."""
    
    def __init__(self):
        self.url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not self.url or not self.anon_key:
            raise ValueError("Supabase URL and anon key must be set in environment variables")
        
        self.headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json'
        }
    
    def get_latest_article(self) -> Optional[Dict]:
        """Retrieve the latest article from the database."""
        try:
            # Query for the most recent article that hasn't been tweeted
            query = """
            SELECT * FROM articles 
            WHERE tweeted_at IS NULL 
            ORDER BY published_at DESC 
            LIMIT 1
            """
            
            response = requests.post(
                f"{self.url}/rest/v1/rpc/exec_sql",
                headers=self.headers,
                json={'query': query}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return data[0]
            
            # Fallback: use direct table query
            response = requests.get(
                f"{self.url}/rest/v1/articles",
                headers=self.headers,
                params={
                    'select': '*',
                    'order': 'published_at.desc',
                    'limit': '1'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return data[0]
            
            logger.warning("No articles found in database")
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving latest article: {e}")
            return None
    
    def mark_article_as_tweeted(self, article_id: str) -> bool:
        """Mark an article as tweeted by updating the tweeted_at field."""
        try:
            response = requests.patch(
                f"{self.url}/rest/v1/articles",
                headers=self.headers,
                json={
                    'tweeted_at': datetime.utcnow().isoformat()
                },
                params={'id': f'eq.{article_id}'}
            )
            
            if response.status_code == 200:
                logger.info(f"Marked article {article_id} as tweeted")
                return True
            else:
                logger.error(f"Failed to mark article as tweeted: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error marking article as tweeted: {e}")
            return False

class OpenAIClient:
    """Client for OpenAI API to generate tweet summaries."""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key must be set in environment variables")
        
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_tweet(self, article: Dict) -> Optional[str]:
        """Generate a tweet summary from article content."""
        try:
            # Prepare the content for summarization
            title = article.get('title', '')
            summary = article.get('summary', '')
            content = article.get('content', '')
            
            # Use the most available content
            text_to_summarize = title
            if summary:
                text_to_summarize += f"\n\n{summary}"
            elif content:
                # Truncate content if too long
                text_to_summarize += f"\n\n{content[:500]}..."
            
            prompt = f"""
            Create an engaging tweet about this article. The tweet should:
            - Be under 280 characters
            - Include relevant hashtags (2-3 max)
            - Be engaging and encourage clicks
            - Include the affiliate link if available
            
            Article: {text_to_summarize}
            
            Format: Tweet text with hashtags at the end
            """
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a social media expert who creates engaging tweets about tech and business articles.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 150,
                    'temperature': 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                tweet_text = result['choices'][0]['message']['content'].strip()
                
                # Add affiliate link if available
                affiliate_url = article.get('affiliate_url')
                if affiliate_url and len(tweet_text) < 200:  # Leave room for URL
                    tweet_text += f"\n\n{affiliate_url}"
                
                # Ensure tweet is under 280 characters
                if len(tweet_text) > 280:
                    tweet_text = tweet_text[:277] + "..."
                
                return tweet_text
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating tweet: {e}")
            return None

class TwitterClient:
    """Client for Twitter API v2."""
    
    def __init__(self):
        self.bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.api_key = os.getenv('TWITTER_API_KEY')
        self.api_secret = os.getenv('TWITTER_API_SECRET')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        if not all([self.bearer_token, self.api_key, self.api_secret, 
                   self.access_token, self.access_token_secret]):
            raise ValueError("All Twitter API credentials must be set in environment variables")
        
        self.base_url = "https://api.twitter.com/2"
        self.headers = {
            'Authorization': f'Bearer {self.bearer_token}',
            'Content-Type': 'application/json'
        }
    
    def post_tweet(self, text: str) -> Optional[str]:
        """Post a tweet using Twitter API v2."""
        try:
            response = requests.post(
                f"{self.base_url}/tweets",
                headers=self.headers,
                json={'text': text}
            )
            
            if response.status_code == 201:
                result = response.json()
                tweet_id = result['data']['id']
                logger.info(f"Successfully posted tweet: {tweet_id}")
                return tweet_id
            else:
                logger.error(f"Twitter API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error posting tweet: {e}")
            return None
    
    def get_user_info(self) -> Optional[Dict]:
        """Get current user information."""
        try:
            response = requests.get(
                f"{self.base_url}/users/me",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error getting user info: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            return None

class TwitterBot:
    """Main bot class that orchestrates the entire process."""
    
    def __init__(self):
        self.supabase = SupabaseClient()
        self.openai = OpenAIClient()
        self.twitter = TwitterClient()
    
    def run(self) -> bool:
        """Main execution method."""
        try:
            logger.info("Starting Twitter bot execution...")
            
            # Get latest article
            article = self.supabase.get_latest_article()
            if not article:
                logger.info("No new articles to tweet")
                return False
            
            logger.info(f"Found article: {article.get('title', 'Unknown')}")
            
            # Generate tweet
            tweet_text = self.openai.generate_tweet(article)
            if not tweet_text:
                logger.error("Failed to generate tweet")
                return False
            
            logger.info(f"Generated tweet: {tweet_text}")
            
            # Post tweet
            tweet_id = self.twitter.post_tweet(tweet_text)
            if not tweet_id:
                logger.error("Failed to post tweet")
                return False
            
            # Mark article as tweeted
            if self.supabase.mark_article_as_tweeted(article['id']):
                logger.info("Successfully completed tweet cycle")
                return True
            else:
                logger.warning("Tweet posted but failed to mark article as tweeted")
                return True
                
        except Exception as e:
            logger.error(f"Error in bot execution: {e}")
            return False

def main():
    """Main entry point."""
    try:
        bot = TwitterBot()
        success = bot.run()
        
        if success:
            logger.info("Twitter bot completed successfully")
        else:
            logger.warning("Twitter bot completed with issues")
            
    except Exception as e:
        logger.error(f"Fatal error in main: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 