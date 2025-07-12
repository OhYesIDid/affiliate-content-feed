-- ContentFeed Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL UNIQUE,
  affiliate_url TEXT,
  image_url TEXT,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  ai_summary TEXT,
  ai_rewrite TEXT,
  seo_title TEXT,
  seo_description TEXT
);

-- Users Table (for future auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  digest_subscription BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}'
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Likes Table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Digest Subscriptions Table
CREATE TABLE IF NOT EXISTS digest_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- RSS Feeds Table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default RSS feeds
INSERT INTO rss_feeds (name, url, category, source) VALUES
  ('TechCrunch', 'https://techcrunch.com/feed/', 'tech', 'TechCrunch'),
  ('The Verge', 'https://www.theverge.com/rss/index.xml', 'tech', 'The Verge'),
  ('CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html', 'finance', 'CNBC'),
  ('BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'business', 'BBC'),
  ('Lifehacker', 'https://lifehacker.com/rss', 'lifestyle', 'Lifehacker')
ON CONFLICT (url) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_likes_count ON articles(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON bookmarks(article_id);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_article_id ON likes(article_id);

CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_email ON digest_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_active ON digest_subscriptions(active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digest_subscriptions_updated_at BEFORE UPDATE ON digest_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rss_feeds_updated_at BEFORE UPDATE ON rss_feeds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- Public read access for articles
CREATE POLICY "Articles are viewable by everyone" ON articles FOR SELECT USING (true);

-- Public read access for RSS feeds
CREATE POLICY "RSS feeds are viewable by everyone" ON rss_feeds FOR SELECT USING (true);

-- Insert access for articles (for content ingestion)
CREATE POLICY "Articles can be inserted by service" ON articles FOR INSERT WITH CHECK (true);

-- Update access for articles (for likes/bookmarks counts)
CREATE POLICY "Articles can be updated by service" ON articles FOR UPDATE USING (true);

-- Digest subscriptions can be created by anyone
CREATE POLICY "Digest subscriptions can be created by anyone" ON digest_subscriptions FOR INSERT WITH CHECK (true);

-- Digest subscriptions can be read by service
CREATE POLICY "Digest subscriptions are viewable by service" ON digest_subscriptions FOR SELECT USING (true); 