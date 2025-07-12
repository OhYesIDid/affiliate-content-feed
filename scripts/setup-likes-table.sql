-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL, -- Using IP as a simple identifier for now
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_ip)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_ip ON article_likes(user_ip);

-- Add likes_count column to articles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'likes_count') THEN
    ALTER TABLE articles ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to update likes_count
CREATE OR REPLACE FUNCTION update_article_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles SET likes_count = likes_count - 1 WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update likes_count
DROP TRIGGER IF EXISTS trigger_update_article_likes_count ON article_likes;
CREATE TRIGGER trigger_update_article_likes_count
  AFTER INSERT OR DELETE ON article_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_article_likes_count();

-- Update existing articles to have a likes_count if they don't have one
UPDATE articles SET likes_count = 0 WHERE likes_count IS NULL; 