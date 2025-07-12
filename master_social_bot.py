#!/usr/bin/env python3
"""
Master Social Media Bot
Runs all social media bots in sequence.
"""

import os
import subprocess
import sys
import logging
import time
from datetime import datetime
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
        logging.FileHandler('master_social_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_bot(bot_name: str, script_path: str) -> bool:
    """Run a specific bot and return success status."""
    try:
        logger.info(f"🚀 Running {bot_name}...")
        start_time = time.time()
        
        result = subprocess.run(
            [sys.executable, script_path], 
            capture_output=True, 
            text=True,
            timeout=300  # 5 minute timeout per bot
        )
        
        end_time = time.time()
        duration = round(end_time - start_time, 2)
        
        if result.returncode == 0:
            logger.info(f"✅ {bot_name} completed successfully in {duration}s")
            if result.stdout.strip():
                logger.info(f"📝 {bot_name} output: {result.stdout.strip()}")
            return True
        else:
            logger.error(f"❌ {bot_name} failed after {duration}s")
            if result.stderr.strip():
                logger.error(f"🔴 {bot_name} error: {result.stderr.strip()}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"⏰ {bot_name} timed out after 5 minutes")
        return False
    except Exception as e:
        logger.error(f"💥 Error running {bot_name}: {e}")
        return False

def check_environment_variables() -> bool:
    """Check if all required environment variables are set."""
    required_vars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'OPENAI_API_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    logger.info("✅ All required environment variables are set")
    return True

def main():
    """Run all social media bots."""
    logger.info("🎯 Starting Master Social Media Bot")
    logger.info("=" * 50)
    
    # Check environment variables
    if not check_environment_variables():
        return 1
    
    # Define bots to run
    bots = [
        ("Twitter", "twitter_bot.py"),
        ("LinkedIn", "linkedin_bot.py"),
        ("Facebook", "facebook_bot.py"),
        ("Reddit", "reddit_bot.py")
    ]
    
    success_count = 0
    total_bots = len(bots)
    failed_bots = []
    
    start_time = time.time()
    
    for bot_name, script_path in bots:
        try:
            if run_bot(bot_name, script_path):
                success_count += 1
            else:
                failed_bots.append(bot_name)
            
            # Add delay between bots to avoid overwhelming APIs
            if bot_name != bots[-1][0]:  # Don't delay after the last bot
                logger.info("⏳ Waiting 30 seconds before next bot...")
                time.sleep(30)
                
        except KeyboardInterrupt:
            logger.info("🛑 Interrupted by user")
            return 1
    
    end_time = time.time()
    total_duration = round(end_time - start_time, 2)
    
    # Summary
    logger.info("=" * 50)
    logger.info(f"📊 Master Bot Summary")
    logger.info(f"⏱️  Total duration: {total_duration}s")
    logger.info(f"✅ Successful: {success_count}/{total_bots}")
    logger.info(f"❌ Failed: {total_bots - success_count}/{total_bots}")
    
    if failed_bots:
        logger.info(f"🔴 Failed bots: {', '.join(failed_bots)}")
    
    if success_count == total_bots:
        logger.info("🎉 All bots completed successfully!")
        return 0
    elif success_count > 0:
        logger.warning("⚠️  Some bots completed successfully, some failed")
        return 1
    else:
        logger.error("💥 All bots failed")
        return 1

if __name__ == "__main__":
    exit(main()) 