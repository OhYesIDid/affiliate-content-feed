#!/usr/bin/env python3
"""
LinkedIn Bot for Affiliate Content Feed
Retrieves latest article from Supabase, summarizes it, and posts to LinkedIn.
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
        logging.FileHandler('linkedin_bot.log'),
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
            # Query for the most recent article that hasn't been posted to LinkedIn
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
            # Add platform-specific posted timestamp
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
    """Client for OpenAI API to generate LinkedIn post content."""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key must be set in environment variables")
        
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_linkedin_post(self, article: Dict) -> Optional[str]:
        """Generate a LinkedIn post from article content."""
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
            Create an engaging LinkedIn post about this article. The post should:
            - Be professional and business-focused
            - Include relevant hashtags (3-5 max)
            - Be engaging and encourage clicks
            - Include a call-to-action
            - Be under 1300 characters (LinkedIn limit)
            
            Article: {text_to_summarize}
            
            Format: Professional post with hashtags at the end
            """
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a professional content creator who writes engaging LinkedIn posts about tech and business articles.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 300,
                    'temperature': 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                post_text = result['choices'][0]['message']['content'].strip()
                
                # Add affiliate link if available
                affiliate_url = article.get('affiliate_url')
                if affiliate_url and len(post_text) < 1200:  # Leave room for URL
                    post_text += f"\n\nRead more: {affiliate_url}"
                
                # Ensure post is under LinkedIn's character limit
                if len(post_text) > 1300:
                    post_text = post_text[:1297] + "..."
                
                return post_text
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating LinkedIn post: {e}")
            return None

class LinkedInClient:
    """Client for LinkedIn API v2."""
    
    def __init__(self):
        self.access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        
        if not all([self.access_token, self.client_id, self.client_secret]):
            raise ValueError("LinkedIn API credentials must be set in environment variables")
        
        self.base_url = "https://api.linkedin.com/v2"
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
    
    def get_user_profile(self) -> Optional[Dict]:
        """Get current user's LinkedIn profile."""
        try:
            response = requests.get(
                f"{self.base_url}/me",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error getting LinkedIn profile: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting LinkedIn profile: {e}")
            return None
    
    def post_article(self, text: str, article_url: Optional[str] = None) -> Optional[str]:
        """Post an article to LinkedIn."""
        try:
            # Prepare the post data
            post_data = {
                "author": f"urn:li:person:{self.get_user_id()}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": text
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            # Add article URL if provided
            if article_url:
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [{
                    "status": "READY",
                    "description": {
                        "text": "Read the full article"
                    },
                    "media": article_url,
                    "title": {
                        "text": "Article Link"
                    }
                }]
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
            
            response = requests.post(
                f"{self.base_url}/ugcPosts",
                headers=self.headers,
                json=post_data
            )
            
            if response.status_code == 201:
                result = response.json()
                post_id = result.get('id')
                logger.info(f"Successfully posted to LinkedIn: {post_id}")
                return post_id
            else:
                logger.error(f"LinkedIn API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error posting to LinkedIn: {e}")
            return None
    
    def get_user_id(self) -> str:
        """Get the current user's LinkedIn ID."""
        profile = self.get_user_profile()
        if profile:
            return profile.get('id', '')
        return 'default_user_id'

class LinkedInBot:
    """Main bot class that orchestrates the LinkedIn posting process."""
    
    def __init__(self):
        self.supabase = SupabaseClient()
        self.openai = OpenAIClient()
        self.linkedin = LinkedInClient()
    
    def run(self) -> bool:
        """Main execution method."""
        try:
            logger.info("Starting LinkedIn bot execution...")
            
            # Get latest article
            article = self.supabase.get_latest_article()
            if not article:
                logger.info("No new articles to post")
                return False
            
            logger.info(f"Found article: {article.get('title', 'Unknown')}")
            
            # Generate LinkedIn post
            post_text = self.openai.generate_linkedin_post(article)
            if not post_text:
                logger.error("Failed to generate LinkedIn post")
                return False
            
            logger.info(f"Generated LinkedIn post: {post_text[:100]}...")
            
            # Post to LinkedIn
            affiliate_url = article.get('affiliate_url')
            post_id = self.linkedin.post_article(post_text, affiliate_url if affiliate_url else None)
            if not post_id:
                logger.error("Failed to post to LinkedIn")
                return False
            
            # Mark article as posted
            if self.supabase.mark_article_as_posted(article['id'], 'linkedin'):
                logger.info("Successfully completed LinkedIn post cycle")
                return True
            else:
                logger.warning("LinkedIn post successful but failed to mark article as posted")
                return True
                
        except Exception as e:
            logger.error(f"Error in LinkedIn bot execution: {e}")
            return False

def main():
    """Main entry point."""
    try:
        bot = LinkedInBot()
        success = bot.run()
        
        if success:
            logger.info("LinkedIn bot completed successfully")
        else:
            logger.warning("LinkedIn bot completed with issues")
            
    except Exception as e:
        logger.error(f"Fatal error in main: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 