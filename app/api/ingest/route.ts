import { NextRequest, NextResponse } from 'next/server';
import { fetchAndProcessFeeds, RSS_FEEDS } from '@/lib/rss';
import { rateLimiter, MISTRAL_RATE_LIMIT, OPENAI_RATE_LIMIT } from '@/lib/rate-limiter';
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let processedCount = 0;
  let errorCount = 0;
  let status: 'success' | 'error' | 'partial' = 'success';
  let message = '';
  let details = '';

  try {
    console.log('Starting content ingestion...');
    
    // Check current rate limits
    const mistralRemaining = rateLimiter.getRemaining('mistral-api', MISTRAL_RATE_LIMIT.MAX_REQUESTS);
    const openaiRemaining = rateLimiter.getRemaining('openai-api', OPENAI_RATE_LIMIT.MAX_REQUESTS);
    
    console.log(`Rate limits - Mistral: ${mistralRemaining}/${MISTRAL_RATE_LIMIT.MAX_REQUESTS}, OpenAI: ${openaiRemaining}/${OPENAI_RATE_LIMIT.MAX_REQUESTS}`);
    
    processedCount = await fetchAndProcessFeeds();
    message = `Successfully processed ${processedCount} new articles`;
    
    // Log successful ingestion
    try {
      await db.createIngestionLog({
        status,
        processedCount,
        errorCount,
        duration: Date.now() - startTime,
        message,
        details: `Rate limits - Mistral: ${mistralRemaining}/${MISTRAL_RATE_LIMIT.MAX_REQUESTS}, OpenAI: ${openaiRemaining}/${OPENAI_RATE_LIMIT.MAX_REQUESTS}`
      });
    } catch (logError) {
      console.error('Failed to log ingestion:', logError);
      // Don't fail the entire request if logging fails
    }
    
    return NextResponse.json({
      success: true,
      processedCount,
      rateLimits: {
        mistral: {
          remaining: mistralRemaining,
          maxRequests: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
          windowMs: MISTRAL_RATE_LIMIT.WINDOW_MS
        },
        openai: {
          remaining: openaiRemaining,
          maxRequests: OPENAI_RATE_LIMIT.MAX_REQUESTS,
          windowMs: OPENAI_RATE_LIMIT.WINDOW_MS
        }
      }
    });
  } catch (error) {
    console.error('Error in ingest API:', error);
    
    errorCount = 1;
    status = 'error';
    message = 'Content ingestion failed';
    details = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed ingestion
    try {
      await db.createIngestionLog({
        status,
        processedCount,
        errorCount,
        duration: Date.now() - startTime,
        message,
        details
      });
    } catch (logError) {
      console.error('Failed to log ingestion error:', logError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: details,
        rateLimits: {
          mistral: {
            remaining: rateLimiter.getRemaining('mistral-api', MISTRAL_RATE_LIMIT.MAX_REQUESTS),
            maxRequests: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
            windowMs: MISTRAL_RATE_LIMIT.WINDOW_MS
          },
          openai: {
            remaining: rateLimiter.getRemaining('openai-api', OPENAI_RATE_LIMIT.MAX_REQUESTS),
            maxRequests: OPENAI_RATE_LIMIT.MAX_REQUESTS,
            windowMs: OPENAI_RATE_LIMIT.WINDOW_MS
          }
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const mistralRemaining = rateLimiter.getRemaining('mistral-api', MISTRAL_RATE_LIMIT.MAX_REQUESTS);
  const openaiRemaining = rateLimiter.getRemaining('openai-api', OPENAI_RATE_LIMIT.MAX_REQUESTS);
  
  return NextResponse.json({
    message: 'Content ingestion endpoint. Use POST to trigger ingestion.',
    feeds: RSS_FEEDS.length,
    rateLimits: {
      mistral: {
        remaining: mistralRemaining,
        maxRequests: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
        windowMs: MISTRAL_RATE_LIMIT.WINDOW_MS
      },
      openai: {
        remaining: openaiRemaining,
        maxRequests: OPENAI_RATE_LIMIT.MAX_REQUESTS,
        windowMs: OPENAI_RATE_LIMIT.WINDOW_MS
      }
    }
  });
} 