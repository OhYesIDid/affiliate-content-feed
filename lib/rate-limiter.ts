interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if a request is allowed based on rate limit
   * @param key - Unique identifier for the rate limit (e.g., 'mistral-api')
   * @param maxRequests - Maximum requests allowed in the time window
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    // If maxRequests is 0, never allow requests
    if (maxRequests === 0) {
      return false;
    }
    
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First request
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    // Check if window has reset
    if (now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    // Check if we're within limits
    if (entry.count < maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining requests for a key
   * @param key - Unique identifier for the rate limit
   * @param maxRequests - Maximum requests allowed
   * @returns number of remaining requests, or 0 if rate limited
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry) return maxRequests;

    const now = Date.now();
    if (now > entry.resetTime) return maxRequests;

    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get time until reset for a key
   * @param key - Unique identifier for the rate limit
   * @returns milliseconds until reset, or 0 if no limit active
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clear(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit constants
export const MISTRAL_RATE_LIMIT = {
  MAX_REQUESTS: 3,
  WINDOW_MS: 60 * 1000 // 1 minute
};

export const OPENAI_RATE_LIMIT = {
  MAX_REQUESTS: 0,
  WINDOW_MS: 60 * 1000 // 1 minute
};

export const OPENROUTER_RATE_LIMIT = {
  MAX_REQUESTS: 20,
  WINDOW_MS: 60 * 1000 // 1 minute
}; 