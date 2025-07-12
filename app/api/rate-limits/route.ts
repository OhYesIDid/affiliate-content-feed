import { NextResponse } from 'next/server';
import { rateLimiter, MISTRAL_RATE_LIMIT, OPENAI_RATE_LIMIT } from '@/lib/rate-limiter';

export async function GET() {
  const mistralRemaining = rateLimiter.getRemaining('mistral-api', MISTRAL_RATE_LIMIT.MAX_REQUESTS);
  const openaiRemaining = rateLimiter.getRemaining('openai-api', OPENAI_RATE_LIMIT.MAX_REQUESTS);
  
  const mistralTimeUntilReset = rateLimiter.getTimeUntilReset('mistral-api');
  const openaiTimeUntilReset = rateLimiter.getTimeUntilReset('openai-api');

  return NextResponse.json({
    mistral: {
      remaining: mistralRemaining,
      maxRequests: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
      windowMs: MISTRAL_RATE_LIMIT.WINDOW_MS,
      timeUntilReset: mistralTimeUntilReset,
      isRateLimited: mistralRemaining === 0
    },
    openai: {
      remaining: openaiRemaining,
      maxRequests: OPENAI_RATE_LIMIT.MAX_REQUESTS,
      windowMs: OPENAI_RATE_LIMIT.WINDOW_MS,
      timeUntilReset: openaiTimeUntilReset,
      isRateLimited: openaiRemaining === 0
    },
    timestamp: new Date().toISOString()
  });
} 