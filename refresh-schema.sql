-- Refresh PostgREST schema cache to fix column not found errors
-- Run this in your Supabase SQL Editor

-- Notify PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative: Drop and recreate the table to force cache refresh
DROP TABLE IF EXISTS ingestion_logs CASCADE;

-- Recreate ingestion_logs table
CREATE TABLE ingestion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  processed_count INTEGER DEFAULT 0 NOT NULL,
  error_count INTEGER DEFAULT 0 NOT NULL,
  duration INTEGER NOT NULL, -- Duration in milliseconds
  message TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_ingestion_logs_timestamp ON ingestion_logs(timestamp DESC);
CREATE INDEX idx_ingestion_logs_status ON ingestion_logs(status);

-- Add RLS (Row Level Security)
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on ingestion_logs" ON ingestion_logs
  FOR ALL USING (true);

-- Insert a test log entry to verify it works
INSERT INTO ingestion_logs (status, processed_count, error_count, duration, message, details)
VALUES ('success', 5, 0, 2500, 'Schema refresh test', 'This log entry was created after refreshing the schema cache');

-- Verify the table was created and works
SELECT * FROM ingestion_logs ORDER BY timestamp DESC LIMIT 5; 