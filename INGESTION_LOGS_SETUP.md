# Ingestion Logs Setup Guide

This guide will help you set up the backend logging functionality for tracking content ingestion runs in your admin dashboard.

## Overview

The ingestion logs system tracks:
- **Timestamps** of each ingestion run
- **Status** (success, error, partial)
- **Performance metrics** (processed count, error count, duration)
- **Messages** and **details** for debugging

## Database Setup

### 1. Create the Database Table

Run the following SQL in your Supabase SQL Editor:

```sql
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
```

### 2. Alternative: Use the Setup Script

You can also run the complete setup script:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/setup-ingestion-logs.sql`
4. Click "Run" to execute

## What's Been Implemented

### 1. Database Functions (`lib/supabase.ts`)

Added new functions to the `db` object:

- `createIngestionLog()` - Creates a new log entry
- `getIngestionLogs(limit)` - Retrieves recent logs
- `getLatestIngestionLog()` - Gets the most recent log

### 2. API Endpoints

#### Updated `/api/ingest` (POST)
- Now tracks start time, duration, and performance metrics
- Logs successful and failed ingestion runs
- Includes rate limit information in log details

#### New `/api/admin/ingestion-logs` (GET)
- Returns recent ingestion logs
- Supports `limit` query parameter (default: 20)
- Used by the admin dashboard

### 3. Admin Dashboard Updates

The admin dashboard now:
- Fetches real ingestion logs from the database
- Displays logs in the "Recent Ingestion Runs" section
- Shows actual timestamps, performance metrics, and status
- Updates automatically after each ingestion run

## Testing the Implementation

### 1. Run the Database Migration

Execute the SQL script in your Supabase SQL Editor.

### 2. Test the Logging

1. Go to your admin dashboard (`/admin`)
2. Click "Ingest New Content"
3. Check the "Recent Ingestion Runs" section
4. You should see a new log entry with:
   - Status indicator (green for success, red for error)
   - Timestamp
   - Performance metrics
   - Duration in milliseconds

### 3. Test Error Logging

To test error logging, you can temporarily break your RSS feeds or API keys and run an ingestion. The system will log the error with details.

## Log Entry Structure

Each log entry contains:

```typescript
{
  id: string;                    // UUID
  timestamp: string;             // ISO timestamp
  status: 'success' | 'error' | 'partial';
  processedCount: number;        // Number of articles processed
  errorCount: number;           // Number of errors encountered
  duration: number;             // Duration in milliseconds
  message: string;              // Human-readable message
  details?: string;             // Additional details/error info
  created_at: string;           // Creation timestamp
}
```

## Monitoring and Maintenance

### Viewing Logs

- **Admin Dashboard**: Real-time view of recent logs
- **Database**: Direct access via Supabase Dashboard
- **API**: Programmatic access via `/api/admin/ingestion-logs`

### Log Retention

By default, logs are kept indefinitely. You may want to implement log rotation:

```sql
-- Example: Delete logs older than 30 days
DELETE FROM ingestion_logs 
WHERE timestamp < NOW() - INTERVAL '30 days';
```

### Performance Considerations

- Logs are indexed by timestamp for fast queries
- The admin dashboard limits to 10 recent logs by default
- Consider implementing pagination for large log volumes

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" error**
   - Make sure you've run the SQL migration
   - Check that the table name is exactly `ingestion_logs`

2. **Permission denied errors**
   - Verify RLS policies are set up correctly
   - Check that your Supabase API keys have the right permissions

3. **Logs not appearing**
   - Check the browser console for API errors
   - Verify the `/api/admin/ingestion-logs` endpoint is working
   - Ensure your admin authentication is working

### Debug Mode

To enable more detailed logging, you can add console logs to the ingest API:

```typescript
// In app/api/ingest/route.ts
console.log('Creating ingestion log:', { status, processedCount, duration });
```

## Next Steps

Once the basic logging is working, consider:

1. **Log Analytics**: Add charts and graphs to the admin dashboard
2. **Alerting**: Set up notifications for failed ingestion runs
3. **Performance Monitoring**: Track trends in ingestion duration and success rates
4. **Log Export**: Add functionality to export logs for analysis

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the server logs for API errors
3. Verify your Supabase connection and permissions
4. Ensure all environment variables are set correctly 