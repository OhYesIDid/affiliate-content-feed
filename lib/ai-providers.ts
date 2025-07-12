import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';
import { rateLimiter, MISTRAL_RATE_LIMIT, OPENAI_RATE_LIMIT } from './rate-limiter';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

// Rate limit keys
const MISTRAL_KEY = 'mistral-api';
const OPENAI_KEY = 'openai-api';

export interface AIResponse {
  content: string;
  provider: 'mistral' | 'openai';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function summarizeContent(content: string): Promise<AIResponse> {
  const prompt = `Summarize the following content in 2-3 sentences, focusing on the key points and making it engaging for social media:

${content}

Summary:`;

  // Try Mistral first
  if (process.env.MISTRAL_API_KEY) {
    if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await mistral.chat.complete({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 150,
        });
        const content = Array.isArray(response.choices[0]?.message?.content)
          ? response.choices[0]?.message?.content.map(c =>
              typeof c === 'string' ? c : ''
            ).join(' ')
          : (typeof response.choices[0]?.message?.content === 'string'
              ? response.choices[0]?.message?.content
              : 'Summary unavailable');
        return {
          content,
          provider: 'mistral',
          usage: {
            prompt_tokens: response.usage?.promptTokens || 0,
            completion_tokens: response.usage?.completionTokens || 0,
            total_tokens: response.usage?.totalTokens || 0,
          }
        };
      } catch (error) {
        console.error('Mistral API error:', error);
        // Fall through to OpenAI
      }
    } else {
      console.log(`Mistral rate limited. Remaining requests: ${rateLimiter.getRemaining(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS)}`);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    if (rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
        });

        return {
          content: response.choices[0]?.message?.content || 'Summary unavailable',
          provider: 'openai',
          usage: response.usage
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
      }
    } else {
      console.log(`OpenAI rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS)}`);
      throw new Error('All AI providers are rate limited');
    }
  }

  throw new Error('No AI API keys configured');
}

export async function generateTags(content: string): Promise<AIResponse> {
  const prompt = `Generate 3-5 relevant tags for the following content. Return only the tags separated by commas, no additional text:

${content}

Tags:`;

  // Try Mistral first
  if (process.env.MISTRAL_API_KEY) {
    if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await mistral.chat.complete({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 100,
        });
        const content = Array.isArray(response.choices[0]?.message?.content)
          ? response.choices[0]?.message?.content.map(c =>
              typeof c === 'string' ? c : ''
            ).join(' ')
          : (typeof response.choices[0]?.message?.content === 'string'
              ? response.choices[0]?.message?.content
              : 'Tags unavailable');
        return {
          content,
          provider: 'mistral',
          usage: {
            prompt_tokens: response.usage?.promptTokens || 0,
            completion_tokens: response.usage?.completionTokens || 0,
            total_tokens: response.usage?.totalTokens || 0,
          }
        };
      } catch (error) {
        console.error('Mistral API error:', error);
        // Fall through to OpenAI
      }
    } else {
      console.log(`Mistral rate limited. Remaining requests: ${rateLimiter.getRemaining(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS)}`);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    if (rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
        });

        return {
          content: response.choices[0]?.message?.content || 'Tags unavailable',
          provider: 'openai',
          usage: response.usage
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
      }
    } else {
      console.log(`OpenAI rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS)}`);
      throw new Error('All AI providers are rate limited');
    }
  }

  throw new Error('No AI API keys configured');
}

export async function categorizeContent(content: string): Promise<AIResponse> {
  const prompt = `Categorize the following content into one of these categories: Technology, Business, Science, Health, Entertainment, Politics, Sports, Lifestyle. Return only the category name, no additional text:

${content}

Category:`;

  // Try Mistral first
  if (process.env.MISTRAL_API_KEY) {
    if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await mistral.chat.complete({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 50,
        });
        const content = Array.isArray(response.choices[0]?.message?.content)
          ? response.choices[0]?.message?.content.map(c =>
              typeof c === 'string' ? c : ''
            ).join(' ')
          : (typeof response.choices[0]?.message?.content === 'string'
              ? response.choices[0]?.message?.content
              : 'Category unavailable');
        return {
          content,
          provider: 'mistral',
          usage: {
            prompt_tokens: response.usage?.promptTokens || 0,
            completion_tokens: response.usage?.completionTokens || 0,
            total_tokens: response.usage?.totalTokens || 0,
          }
        };
      } catch (error) {
        console.error('Mistral API error:', error);
        // Fall through to OpenAI
      }
    } else {
      console.log(`Mistral rate limited. Remaining requests: ${rateLimiter.getRemaining(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS)}`);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    if (rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
        });

        return {
          content: response.choices[0]?.message?.content || 'Category unavailable',
          provider: 'openai',
          usage: response.usage
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
      }
    } else {
      console.log(`OpenAI rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS)}`);
      throw new Error('All AI providers are rate limited');
    }
  }

  throw new Error('No AI API keys configured');
}

// Export rate limiter for monitoring
export { rateLimiter }; 