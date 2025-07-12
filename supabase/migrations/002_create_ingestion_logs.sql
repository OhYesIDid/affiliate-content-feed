-- Create ingestion_logs table
CREATE TABLE IF NOT EXISTS ingestion_logs (
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
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_timestamp ON ingestion_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_status ON ingestion_logs(status);

-- Add RLS (Row Level Security) if needed
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on ingestion_logs" ON ingestion_logs
  FOR ALL USING (true); 