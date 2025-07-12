#!/usr/bin/env python3
"""
Facebook Bot for Affiliate Content Feed
Retrieves latest article from Supabase, summarizes it, and posts to Facebook.
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
        logging.FileHandler('facebook_bot.log'),
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
    """Client for OpenAI API to generate Facebook post content."""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key must be set in environment variables")
        
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_facebook_post(self, article: Dict) -> Optional[str]:
        """Generate a Facebook post from article content."""
        try:
            title = article.get('title', '')
            summary = article.get('summary', '')
            content = article.get('content', '')
            
            text_to_summarize = title
            if summary:
                text_to_summarize += f"\n\n{summary}"
            elif content:
                text_to_summarize += f"\n\n{content[:500]}..."
            
            prompt = f"""
            Create an engaging Facebook post about this article. The post should:
            - Be conversational and friendly
            - Include relevant hashtags (2-3 max)
            - Be engaging and encourage clicks
            - Include a call-to-action
            - Be under 63206 characters (Facebook limit)
            
            Article: {text_to_summarize}
            
            Format: Friendly post with hashtags at the end
            """
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a social media expert who creates engaging Facebook posts about tech and business articles.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 400,
                    'temperature': 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                post_text = result['choices'][0]['message']['content'].strip()
                
                # Add affiliate link if available
                affiliate_url = article.get('affiliate_url')
                if affiliate_url and len(post_text) < 63000:  # Leave room for URL
                    post_text += f"\n\nRead more: {affiliate_url}"
                
                # Ensure post is under Facebook's character limit
                if len(post_text) > 63206:
                    post_text = post_text[:63203] + "..."
                
                return post_text
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating Facebook post: {e}")
            return None

class FacebookClient:
    """Client for Facebook Graph API."""
    
    def __init__(self):
        self.access_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
        self.page_id = os.getenv('FACEBOOK_PAGE_ID')
        
        if not all([self.access_token, self.page_id]):
            raise ValueError("Facebook API credentials must be set in environment variables")
        
        self.base_url = "https://graph.facebook.com/v18.0"
        self.headers = {
            'Content-Type': 'application/json'
        }
    
    def get_page_info(self) -> Optional[Dict]:
        """Get Facebook page information."""
        try:
            response = requests.get(
                f"{self.base_url}/{self.page_id}",
                headers=self.headers,
                params={
                    'access_token': self.access_token,
                    'fields': 'name,id'
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error getting Facebook page info: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting Facebook page info: {e}")
            return None
    
    def post_link(self, message: str, link: str) -> Optional[str]:
        """Post a link to Facebook."""
        try:
            response = requests.post(
                f"{self.base_url}/{self.page_id}/feed",
                headers=self.headers,
                params={
                    'access_token': self.access_token,
                    'message': message,
                    'link': link
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                post_id = result.get('id')
                logger.info(f"Successfully posted to Facebook: {post_id}")
                return post_id
            else:
                logger.error(f"Facebook API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error posting to Facebook: {e}")
            return None
    
    def post_text(self, message: str) -> Optional[str]:
        """Post text-only content to Facebook."""
        try:
            response = requests.post(
                f"{self.base_url}/{self.page_id}/feed",
                headers=self.headers,
                params={
                    'access_token': self.access_token,
                    'message': message
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                post_id = result.get('id')
                logger.info(f"Successfully posted to Facebook: {post_id}")
                return post_id
            else:
                logger.error(f"Facebook API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error posting to Facebook: {e}")
            return None

class FacebookBot:
    """Main bot class that orchestrates the Facebook posting process."""
    
    def __init__(self):
        self.supabase = SupabaseClient()
        self.openai = OpenAIClient()
        self.facebook = FacebookClient()
    
    def run(self) -> bool:
        """Main execution method."""
        try:
            logger.info("Starting Facebook bot execution...")
            
            # Get latest article
            article = self.supabase.get_latest_article()
            if not article:
                logger.info("No new articles to post")
                return False
            
            logger.info(f"Found article: {article.get('title', 'Unknown')}")
            
            # Generate Facebook post
            post_text = self.openai.generate_facebook_post(article)
            if not post_text:
                logger.error("Failed to generate Facebook post")
                return False
            
            logger.info(f"Generated Facebook post: {post_text[:100]}...")
            
            # Post to Facebook
            affiliate_url = article.get('affiliate_url')
            if affiliate_url:
                post_id = self.facebook.post_link(post_text, affiliate_url)
            else:
                post_id = self.facebook.post_text(post_text)
            
            if not post_id:
                logger.error("Failed to post to Facebook")
                return False
            
            # Mark article as posted
            if self.supabase.mark_article_as_posted(article['id'], 'facebook'):
                logger.info("Successfully completed Facebook post cycle")
                return True
            else:
                logger.warning("Facebook post successful but failed to mark article as posted")
                return True
                
        except Exception as e:
            logger.error(f"Error in Facebook bot execution: {e}")
            return False

def main():
    """Main entry point."""
    try:
        bot = FacebookBot()
        success = bot.run()
        
        if success:
            logger.info("Facebook bot completed successfully")
        else:
            logger.warning("Facebook bot completed with issues")
            
    except Exception as e:
        logger.error(f"Fatal error in main: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 