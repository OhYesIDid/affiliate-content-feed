-- Add missing RSS feeds to the database
-- Run this in your Supabase SQL Editor

INSERT INTO rss_feeds (name, url, category, source, active) VALUES
  ('Hacker News', 'https://news.ycombinator.com/rss', 'tech', 'Hacker News', true),
  ('Engadget', 'https://www.engadget.com/rss.xml', 'tech', 'Engadget', true)
ON CONFLICT (url) DO NOTHING;

-- Verify all feeds are active
SELECT name, url, category, active FROM rss_feeds ORDER BY name; 