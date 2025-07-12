-- Create filter_config table for persistent storage of filter configuration
CREATE TABLE IF NOT EXISTS filter_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO filter_config (id, config) VALUES (
    1,
    '{
        "MIN_WORD_COUNT": 10,
        "MAX_WORD_COUNT": 5000,
        "MIN_TITLE_LENGTH": 10,
        "MAX_TITLE_LENGTH": 200,
        "EXCLUDE_KEYWORDS": [
            "sponsored", "advertisement", "advertorial", "paid post", "promoted",
            "breaking news", "live updates", "just in", "urgent",
            "click here", "read more", "learn more", "find out",
            "subscribe", "newsletter", "sign up", "join now",
            "limited time", "act now", "don''t miss out", "exclusive",
            "photo gallery", "slideshow", "pictures", "images",
            "video", "watch", "see what happened"
        ],
        "INCLUDE_KEYWORDS": [
            "how to", "guide", "tips", "tricks", "tutorial", "step by step",
            "review", "comparison", "vs", "versus", "best", "top", "worst",
            "analysis", "explained", "why", "what is", "understanding",
            "technology", "tech", "software", "app", "platform", "tool",
            "ai", "artificial intelligence", "machine learning", "automation",
            "business", "finance", "investment", "market", "economy",
            "startup", "entrepreneur", "strategy", "marketing", "growth",
            "health", "fitness", "lifestyle", "wellness", "diet", "exercise",
            "travel", "vacation", "destination", "trip",
            "product", "service", "solution", "feature", "benefit",
            "industry", "sector", "market", "trend", "innovation", "future"
        ],
        "MAX_AGE_HOURS": 72,
        "SPAM_INDICATORS": [
            "[A-Z]{5,}", "!{2,}", "\\\\?{2,}", "\\\\d{1,2}%\\\\s*off",
            "free\\\\s+download", "limited\\\\s+time", "act\\\\s+now",
            "don''t\\\\s+miss", "exclusive\\\\s+offer", "one\\\\s+time\\\\s+only"
        ]
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_filter_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_filter_config_updated_at
    BEFORE UPDATE ON filter_config
    FOR EACH ROW
    EXECUTE FUNCTION update_filter_config_updated_at(); 