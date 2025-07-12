#!/usr/bin/env python3
"""
Test script for Twitter Bot components
Run this to verify your setup before running the main bot.
"""

import os
import sys
import requests
try:
    from dotenv import load_dotenv
except ImportError:
    print("Warning: python-dotenv not installed. Install with: pip install python-dotenv")
    def load_dotenv():
        pass

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test that all required environment variables are set."""
    print("🔍 Testing environment variables...")
    
    required_vars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'OPENAI_API_KEY',
        'TWITTER_BEARER_TOKEN',
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            print(f"✅ {var}: {'*' * (len(value) - 4) + value[-4:] if len(value) > 4 else '*' * len(value)}")
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    print("✅ All environment variables are set")
    return True

def test_supabase_connection():
    """Test Supabase connection and database access."""
    print("\n🔍 Testing Supabase connection...")
    
    try:
        from twitter_bot import SupabaseClient
        client = SupabaseClient()
        
        # Test basic connection using direct API call
        response = requests.get(
            f"{client.url}/rest/v1/articles",
            headers=client.headers,
            params={'select': 'count', 'limit': '1'}
        )
        
        if response.status_code == 200:
            print("✅ Supabase connection successful")
        else:
            print(f"❌ Supabase connection failed: {response.status_code}")
            return False
        
        # Test article retrieval
        article = client.get_latest_article()
        if article:
            print(f"✅ Found article: {article.get('title', 'Unknown')[:50]}...")
        else:
            print("⚠️  No articles found in database")
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def test_openai_connection():
    """Test OpenAI API connection."""
    print("\n🔍 Testing OpenAI connection...")
    
    try:
        from twitter_bot import OpenAIClient
        client = OpenAIClient()
        
        # Test with a simple prompt
        test_article = {
            'title': 'Test Article',
            'summary': 'This is a test article for OpenAI API testing.',
            'content': 'Test content for OpenAI API testing.'
        }
        
        tweet = client.generate_tweet(test_article)
        if tweet:
            print(f"✅ OpenAI API working - Generated tweet: {tweet[:50]}...")
        else:
            print("❌ OpenAI API failed to generate tweet")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ OpenAI connection failed: {e}")
        return False

def test_twitter_connection():
    """Test Twitter API connection."""
    print("\n🔍 Testing Twitter connection...")
    
    try:
        from twitter_bot import TwitterClient
        client = TwitterClient()
        
        # Test user info retrieval
        user_info = client.get_user_info()
        if user_info:
            username = user_info.get('data', {}).get('username', 'Unknown')
            print(f"✅ Twitter API working - Connected as @{username}")
        else:
            print("❌ Twitter API failed to get user info")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Twitter connection failed: {e}")
        return False

def test_database_schema():
    """Test if the required database schema exists."""
    print("\n🔍 Testing database schema...")
    
    try:
        from twitter_bot import SupabaseClient
        client = SupabaseClient()
        
        # Test if tweeted_at column exists by trying to query it
        response = requests.get(
            f"{client.url}/rest/v1/articles",
            headers=client.headers,
            params={'select': 'tweeted_at', 'limit': '1'}
        )
        
        if response.status_code == 200:
            print("✅ Database schema looks correct")
            return True
        else:
            print(f"❌ Database schema issue: {response.status_code}")
            print("💡 You may need to run the database migration:")
            print("""
            ALTER TABLE articles 
            ADD COLUMN IF NOT EXISTS tweeted_at TIMESTAMP WITH TIME ZONE;
            """)
            return False
        
    except Exception as e:
        print(f"❌ Database schema issue: {e}")
        print("💡 You may need to run the database migration:")
        print("""
        ALTER TABLE articles 
        ADD COLUMN IF NOT EXISTS tweeted_at TIMESTAMP WITH TIME ZONE;
        """)
        return False

def main():
    """Run all tests."""
    print("🚀 Twitter Bot Setup Test")
    print("=" * 50)
    
    tests = [
        test_environment_variables,
        test_supabase_connection,
        test_openai_connection,
        test_twitter_connection,
        test_database_schema
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Twitter bot is ready to run.")
        print("💡 Run 'python twitter_bot.py' to start the bot.")
    else:
        print("⚠️  Some tests failed. Please fix the issues above before running the bot.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 