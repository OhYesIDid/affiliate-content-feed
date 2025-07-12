#!/usr/bin/env python3
"""
Reddit Bot for Affiliate Content Feed
Retrieves latest article from Supabase, summarizes it, and posts to relevant subreddits.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import logging
try:
    from dotenv import load_dotenv
except ImportError:
    print("Warning: python-dotenv not installed. Install with: pip install python-dotenv")
    def load_dotenv():
        pass

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('reddit_bot.log'),
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
    
    def mark_article_as_posted(self, article_id: str, platform: str) -> bool:
        """Mark an article as posted to a specific platform."""
        try:
            field_name = f"posted_to_{platform}_at"
            
            response = requests.patch(
                f"{self.url}/rest/v1/articles",
                headers=self.headers,
                json={
                    field_name: datetime.utcnow().isoformat()
                },
                params={'id': f'eq.{article_id}'}
            )
            
            if response.status_code == 200:
                logger.info(f"Marked article {article_id} as posted to {platform}")
                return True
            else:
                logger.error(f"Failed to mark article as posted to {platform}: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error marking article as posted to {platform}: {e}")
            return False

class OpenAIClient:
    """Client for OpenAI API to generate Reddit post content."""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key must be set in environment variables")
        
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_reddit_title(self, article: Dict) -> Optional[str]:
        """Generate a Reddit post title from article content."""
        try:
            title = article.get('title', '')
            summary = article.get('summary', '')
            
            text_to_summarize = title
            if summary:
                text_to_summarize += f"\n\n{summary}"
            
            prompt = f"""
            Create an engaging Reddit post title about this article. The title should:
            - Be under 300 characters
            - Be interesting and clickable
            - Follow Reddit's rules and guidelines
            - Not be clickbait
            - Be relevant to the article content
            
            Article: {text_to_summarize}
            
            Format: Just the title, no quotes or extra formatting
            """
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a Reddit expert who creates engaging, rule-compliant post titles.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 100,
                    'temperature': 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                reddit_title = result['choices'][0]['message']['content'].strip()
                
                # Remove quotes if present
                if reddit_title.startswith('"') and reddit_title.endswith('"'):
                    reddit_title = reddit_title[1:-1]
                
                # Ensure title is under Reddit's limit
                if len(reddit_title) > 300:
                    reddit_title = reddit_title[:297] + "..."
                
                return reddit_title
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating Reddit title: {e}")
            return None

class RedditClient:
    """Client for Reddit API."""
    
    def __init__(self):
        self.client_id = os.getenv('REDDIT_CLIENT_ID')
        self.client_secret = os.getenv('REDDIT_CLIENT_SECRET')
        self.username = os.getenv('REDDIT_USERNAME')
        self.password = os.getenv('REDDIT_PASSWORD')
        self.user_agent = os.getenv('REDDIT_USER_AGENT', 'AffiliateContentBot/1.0')
        
        if not all([self.client_id, self.client_secret, self.username, self.password]):
            raise ValueError("Reddit API credentials must be set in environment variables")
        
        self.access_token = None
        self.base_url = "https://oauth.reddit.com"
        self.headers = {
            'User-Agent': self.user_agent
        }
    
    def authenticate(self) -> bool:
        """Authenticate with Reddit API."""
        try:
            auth_response = requests.post(
                'https://www.reddit.com/api/v1/access_token',
                headers=self.headers,
                data={
                    'grant_type': 'password',
                    'username': self.username,
                    'password': self.password
                },
                auth=(self.client_id, self.client_secret)
            )
            
            if auth_response.status_code == 200:
                token_data = auth_response.json()
                self.access_token = token_data.get('access_token')
                self.headers['Authorization'] = f'Bearer {self.access_token}'
                logger.info("Successfully authenticated with Reddit")
                return True
            else:
                logger.error(f"Reddit authentication failed: {auth_response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error authenticating with Reddit: {e}")
            return False
    
    def get_subreddit_suggestions(self, article: Dict) -> List[str]:
        """Get relevant subreddits for an article."""
        # Default subreddits based on category
        category = article.get('category', '').lower()
        source = article.get('source', '').lower()
        
        subreddits = []
        
        if 'tech' in category or 'technology' in source:
            subreddits.extend(['technology', 'tech', 'programming', 'webdev'])
        elif 'business' in category or 'business' in source:
            subreddits.extend(['business', 'entrepreneur', 'startups'])
        elif 'finance' in category or 'finance' in source:
            subreddits.extend(['personalfinance', 'investing', 'wallstreetbets'])
        elif 'deals' in category or 'deals' in source:
            subreddits.extend(['deals', 'frugal', 'shopping'])
        
        # Add general subreddits
        subreddits.extend(['news', 'worldnews'])
        
        return subreddits[:3]  # Limit to 3 subreddits
    
    def post_link(self, subreddit: str, title: str, url: str) -> Optional[str]:
        """Post a link to a subreddit."""
        try:
            if not self.access_token:
                if not self.authenticate():
                    return None
            
            response = requests.post(
                f"{self.base_url}/api/submit",
                headers=self.headers,
                data={
                    'sr': subreddit,
                    'title': title,
                    'url': url,
                    'kind': 'link'
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'data' in result and 'id' in result['data']:
                    post_id = result['data']['id']
                    logger.info(f"Successfully posted to r/{subreddit}: {post_id}")
                    return post_id
                else:
                    logger.error(f"Unexpected Reddit response format: {result}")
                    return None
            else:
                logger.error(f"Reddit API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error posting to Reddit: {e}")
            return None

class RedditBot:
    """Main bot class that orchestrates the Reddit posting process."""
    
    def __init__(self):
        self.supabase = SupabaseClient()
        self.openai = OpenAIClient()
        self.reddit = RedditClient()
    
    def run(self) -> bool:
        """Main execution method."""
        try:
            logger.info("Starting Reddit bot execution...")
            
            # Get latest article
            article = self.supabase.get_latest_article()
            if not article:
                logger.info("No new articles to post")
                return False
            
            logger.info(f"Found article: {article.get('title', 'Unknown')}")
            
            # Generate Reddit title
            reddit_title = self.openai.generate_reddit_title(article)
            if not reddit_title:
                logger.error("Failed to generate Reddit title")
                return False
            
            logger.info(f"Generated Reddit title: {reddit_title}")
            
            # Get relevant subreddits
            subreddits = self.reddit.get_subreddit_suggestions(article)
            logger.info(f"Targeting subreddits: {subreddits}")
            
            # Post to subreddits
            posted_count = 0
            affiliate_url = article.get('affiliate_url') or article.get('url')
            
            for subreddit in subreddits:
                try:
                    post_id = self.reddit.post_link(subreddit, reddit_title, affiliate_url)
                    if post_id:
                        posted_count += 1
                        logger.info(f"Successfully posted to r/{subreddit}")
                    
                    # Add delay between posts to respect rate limits
                    import time
                    time.sleep(60)  # Wait 1 minute between posts
                    
                except Exception as e:
                    logger.error(f"Error posting to r/{subreddit}: {e}")
                    continue
            
            if posted_count > 0:
                # Mark article as posted
                if self.supabase.mark_article_as_posted(article['id'], 'reddit'):
                    logger.info(f"Successfully completed Reddit post cycle - posted to {posted_count} subreddits")
                    return True
                else:
                    logger.warning("Reddit posts successful but failed to mark article as posted")
                    return True
            else:
                logger.error("Failed to post to any subreddits")
                return False
                
        except Exception as e:
            logger.error(f"Error in Reddit bot execution: {e}")
            return False

def main():
    """Main entry point."""
    try:
        bot = RedditBot()
        success = bot.run()
        
        if success:
            logger.info("Reddit bot completed successfully")
        else:
            logger.warning("Reddit bot completed with issues")
            
    except Exception as e:
        logger.error(f"Fatal error in main: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 