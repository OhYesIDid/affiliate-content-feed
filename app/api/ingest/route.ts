import { NextRequest, NextResponse } from 'next/server';
import { fetchAndProcessFeeds, RSS_FEEDS } from '@/lib/rss';
import { rateLimiter, MISTRAL_RATE_LIMIT, OPENAI_RATE_LIMIT } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting content ingestion...');
    
    // Check current rate limits
    const mistralRemaining = rateLimiter.getRemaining('mistral-api', MISTRAL_RATE_LIMIT.MAX_REQUESTS);
    const openaiRemaining = rateLimiter.getRemaining('openai-api', OPENAI_RATE_LIMIT.MAX_REQUESTS);
    
    console.log(`Rate limits - Mistral: ${mistralRemaining}/${MISTRAL_RATE_LIMIT.MAX_REQUESTS}, OpenAI: ${openaiRemaining}/${OPENAI_RATE_LIMIT.MAX_REQUESTS}`);
    
    const processedCount = await fetchAndProcessFeeds();
    
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
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
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