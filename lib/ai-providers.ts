import OpenAI from 'openai';
import { Mistral } from '@mistralai/mistralai';
import { rateLimiter, MISTRAL_RATE_LIMIT, OPENAI_RATE_LIMIT, OPENROUTER_RATE_LIMIT } from './rate-limiter';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

// OpenRouter with proper configuration
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
    'X-Title': 'AI Affiliates Content Feed', // Optional but recommended
  },
});

// Debug OpenRouter API key (only show first few characters)
const openrouterKey = process.env.OPENROUTER_API_KEY;
if (openrouterKey) {
  console.log(`OpenRouter API key found: ${openrouterKey.substring(0, 8)}...`);
} else {
  console.log('OpenRouter API key not found in environment variables');
}

// Free models available through OpenRouter (in order of preference)
const FREE_MODELS = [
  'google/gemini-flash-1.5',           // Primary choice - fast and reliable
  'meta-llama/llama-3.1-8b-instruct',  // Meta's free model
  'microsoft/phi-3-mini-4k-instruct',  // Microsoft's free model
  'google/gemini-flash-1.5-2m',        // Alternative Gemini model
];

// Rate limit keys
const MISTRAL_KEY = 'mistral-api';
const OPENAI_KEY = 'openai-api';
const OPENROUTER_KEY = 'openrouter-api';

export interface AIResponse {
  content: string;
  provider: 'mistral' | 'openai' | 'openrouter';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Add exponential backoff utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const exponentialBackoff = async (attempt: number, baseDelay: number = 1000) => {
  const waitTime = baseDelay * Math.pow(2, attempt);
  console.log(`⏳ Waiting ${waitTime}ms before retry (attempt ${attempt + 1})`);
  await delay(waitTime);
};

// Helper function to clean up formatting issues in AI-generated content
const cleanContentFormatting = (content: string): string => {
  return content
    // Fix double ## headers - replace ## with #
    .replace(/^##\s+/gm, '# ')
    // Fix HTML h3 tags - replace <h3>text</h3> with ### text
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    // Fix HTML h2 tags - replace <h2>text</h2> with ## text
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    // Fix HTML h1 tags - replace <h1>text</h1> with # text
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Fix multiple spaces
    .replace(/\s+/g, ' ')
    // Fix multiple newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim();
};

export async function rewriteArticle(content: string, title: string, source: string): Promise<AIResponse> {
  // Calculate original content word count
  const originalWordCount = content.trim().split(/\s+/).length;
  
  // Determine target word count based on original
  let targetWordCount = originalWordCount;
  
  // If original is very short (< 50 words), expand to 200-300 words
  if (originalWordCount < 50) {
    targetWordCount = Math.floor(Math.random() * 100) + 200; // 200-300 words
  }
  // If original is very long (> 1000 words), condense to 600-800 words
  else if (originalWordCount > 1000) {
    targetWordCount = Math.floor(Math.random() * 200) + 600; // 600-800 words
  }
  // For medium-length content, keep within 20% of original length
  else {
    const variance = Math.floor(originalWordCount * 0.2); // 20% variance
    targetWordCount = originalWordCount + (Math.floor(Math.random() * variance * 2) - variance);
    // Ensure minimum of 100 words
    targetWordCount = Math.max(targetWordCount, 100);
  }

  const prompt = `You are a professional content writer specializing in affiliate marketing and SEO-optimized content. Rewrite the following article into a completely original, engaging piece that provides value to readers while naturally incorporating affiliate opportunities.

ORIGINAL TITLE: ${title}
ORIGINAL SOURCE: ${source}
ORIGINAL CONTENT: ${content}
ORIGINAL WORD COUNT: ${originalWordCount} words
TARGET WORD COUNT: ${targetWordCount} words (±10% tolerance)

WRITING GUIDELINES:
1. **Content Structure (${targetWordCount} words):**
   - Compelling introduction that hooks the reader
   - Well-structured paragraphs with clear subheadings
   - Engaging conclusion with call-to-action
   - Maintain similar length to original (${targetWordCount} words)

2. **SEO Optimization:**
   - Use relevant keywords naturally throughout the content
   - Include LSI (Latent Semantic Indexing) keywords
   - Optimize for featured snippets with clear, concise answers
   - Use proper heading structure (H2, H3)
   - IMPORTANT: Use Markdown formatting only - # for main headers, ## for subheaders, ### for sub-subheaders
   - DO NOT use HTML tags like <h3> or <h2>
   - DO NOT use double ## for headers

3. **Affiliate Content Integration:**
   - Naturally mention products/services when relevant
   - Include comparison language ("best," "top," "leading")
   - Add value propositions and benefits
   - Use action-oriented language

4. **Writing Style:**
   - Conversational and engaging tone
   - Use active voice and clear sentences
   - Include relevant statistics or examples when possible
   - Make it scannable with bullet points or numbered lists

5. **Value Addition:**
   - Provide insights beyond the original content
   - Include practical tips or actionable advice
   - Address reader pain points and solutions
   - Add context and background information

6. **Technical Requirements:**
   - Completely original content (no plagiarism)
   - Maintain factual accuracy from the original
   - Include relevant internal linking opportunities
   - Optimize for social sharing
   - STRICT WORD COUNT: Aim for exactly ${targetWordCount} words (±10% tolerance)

REWRITTEN ARTICLE:`;

  // Check if providers are available
  const openrouterAvailable = process.env.OPENROUTER_API_KEY && rateLimiter.isAllowed(OPENROUTER_KEY, OPENROUTER_RATE_LIMIT.MAX_REQUESTS, OPENROUTER_RATE_LIMIT.WINDOW_MS);
  const mistralAvailable = process.env.MISTRAL_API_KEY && rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS);
  const openaiAvailable = process.env.OPENAI_API_KEY && rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS);
  
  // If all providers are rate limited, throw error
  if (!openrouterAvailable && !mistralAvailable && !openaiAvailable) {
    console.log('All AI providers are rate limited');
    throw new Error('All AI providers are rate limited');
  }

    // Try OpenRouter first if available (primary provider)
  if (openrouterAvailable) {
    try {
      console.log('Using OpenRouter for article rewrite');
      const response = await tryFreeModels(
        [{ role: 'user', content: prompt }],
        Math.max(800, targetWordCount * 1.5),
        'article rewrite'
      );
      return {
        content: cleanContentFormatting(response.choices[0]?.message?.content || 'Article rewrite unavailable'),
        provider: 'openrouter',
        usage: response.usage
      };
    } catch (error: any) {
      console.error('All OpenRouter models failed:', error);
      // If it's a rate limit error, mark as rate limited
      if (error.message.includes('rate_limit') || error.status === 429) {
        console.log('OpenRouter rate limit exceeded, marking as rate limited');
        rateLimiter['limits'].set(OPENROUTER_KEY, {
          count: OPENROUTER_RATE_LIMIT.MAX_REQUESTS,
          resetTime: Date.now() + OPENROUTER_RATE_LIMIT.WINDOW_MS
        });
      }
      // Fall through to other providers
    }
  } else {
    console.log(`OpenRouter rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENROUTER_KEY, OPENROUTER_RATE_LIMIT.MAX_REQUESTS)}`);
  }

  // Try Mistral as fallback if available
  if (mistralAvailable) {
    try {
      const response = await mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: Math.max(800, targetWordCount * 1.5), // Dynamic token limit based on target word count
      });
      const content = Array.isArray(response.choices[0]?.message?.content)
        ? response.choices[0]?.message?.content.map((c: any) =>
            typeof c === 'string' ? c : ''
          ).join(' ')
        : (typeof response.choices[0]?.message?.content === 'string'
            ? response.choices[0]?.message?.content
            : 'Article rewrite unavailable');
      return {
        content: cleanContentFormatting(content),
        provider: 'mistral',
        usage: {
          prompt_tokens: response.usage?.promptTokens || 0,
          completion_tokens: response.usage?.completionTokens || 0,
          total_tokens: response.usage?.totalTokens || 0,
        }
      };
    } catch (error: any) {
      console.error('Mistral API error:', error);
      // If it's a rate limit error, mark as rate limited
      if (error.status === 429 || error.code === '3505') {
        console.log('Mistral rate limit exceeded, marking as rate limited');
        rateLimiter['limits'].set(MISTRAL_KEY, {
          count: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
          resetTime: Date.now() + MISTRAL_RATE_LIMIT.WINDOW_MS
        });
      }
      // Fall through to OpenAI only if it's available
    }
  } else {
    console.log(`Mistral rate limited. Remaining requests: ${rateLimiter.getRemaining(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS)}`);
  }

  // Fallback to OpenAI if available
  if (openaiAvailable) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: Math.max(800, targetWordCount * 1.5), // Dynamic token limit based on target word count
      });
      return {
        content: cleanContentFormatting(response.choices[0]?.message?.content || 'Article rewrite unavailable'),
        provider: 'openai',
        usage: response.usage
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      // If it's a rate limit error, mark as rate limited
      if (error.status === 429 || error.code === 'insufficient_quota') {
        console.log('OpenAI rate limit exceeded, marking as rate limited');
        rateLimiter['limits'].set(OPENAI_KEY, {
          count: OPENAI_RATE_LIMIT.MAX_REQUESTS,
          resetTime: Date.now() + OPENAI_RATE_LIMIT.WINDOW_MS
        });
      }
      throw error;
    }
  } else {
    console.log(`OpenAI rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS)}`);
    throw new Error('All AI providers are rate limited');
  }

  throw new Error('No AI API keys configured');
}

// Helper function to try multiple free models with fallback (one attempt per model)
const tryFreeModels = async (messages: any[], maxTokens: number, operation: string): Promise<any> => {
  // Debug API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log(`OpenRouter API key check: ${apiKey ? `Found (${apiKey.substring(0, 8)}...)` : 'NOT FOUND'}`);
  
  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying ${model} for ${operation}`);
      
      // Use fetch directly to test OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Affiliates Content Feed',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`Successfully used ${model} for ${operation}`);
      return result;
    } catch (error: any) {
      console.error(`${model} failed for ${operation}:`, error.message);
      
      // If it's an authentication error, stop trying other models
      if (error.message.includes('401') || error.message.includes('No auth credentials')) {
        console.error('OpenRouter authentication failed - stopping all model attempts');
        throw new Error('OpenRouter authentication failed');
      }
      
      // Move to next model immediately after one error (no retries)
      continue;
    }
  }
  throw new Error(`All free models failed for ${operation}`);
};

// Helper function to extract text content from Mistral API response
const extractMistralContent = (responseContent: string | any[] | null | undefined): string => {
  if (typeof responseContent === 'string') {
    return responseContent;
  } else if (Array.isArray(responseContent)) {
    return responseContent.map(chunk => {
      if (typeof chunk === 'string') return chunk;
      if (chunk && typeof chunk === 'object' && 'text' in chunk) {
        return (chunk as any).text || '';
      }
      return '';
    }).join('');
  }
  return '';
};

export const summarizeContent = async (content: string): Promise<string> => {
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if providers are available
      const openrouterAvailable = rateLimiter.isAllowed(OPENROUTER_KEY, OPENROUTER_RATE_LIMIT.MAX_REQUESTS, OPENROUTER_RATE_LIMIT.WINDOW_MS);
      const mistralAvailable = rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS);
      const openaiAvailable = rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS);
      
      // If all providers are rate limited, don't retry
      if (!openrouterAvailable && !mistralAvailable && !openaiAvailable) {
        console.log('All AI providers are rate limited, skipping retry');
        return 'Summary unavailable';
      }
      
      // Try OpenRouter first if available (primary provider)
      if (openrouterAvailable) {
        console.log(`Using OpenRouter for summarizeContent (attempt ${attempt + 1})`);
        try {
          const result = await tryFreeModels(
            [
              {
                role: 'user',
                content: `Summarize this content in 2-3 sentences, maintaining key information:\n\n${content}`
              }
            ],
            150,
            'summarization'
          );
          
          return result.choices[0]?.message?.content || 'Summary unavailable';
        } catch (error: any) {
          console.error('All OpenRouter models failed for summarization:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.message.includes('rate_limit') || error.status === 429) {
            console.log('OpenRouter rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(OPENROUTER_KEY, {
              count: OPENROUTER_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + OPENROUTER_RATE_LIMIT.WINDOW_MS
            });
          }
          // Fall through to other providers
        }
      } else {
        console.log(`OpenRouter rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENROUTER_KEY, OPENROUTER_RATE_LIMIT.MAX_REQUESTS)}`);
      }

      // Try Mistral as fallback if available
      if (mistralAvailable) {
        console.log(`Using Mistral for summarizeContent (attempt ${attempt + 1})`);
        try {
          const result = await mistral.chat.complete({
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'user',
                content: `Summarize this content in 2-3 sentences, maintaining key information:\n\n${content}`
              }
            ],
            maxTokens: 150,
          });
          
          const responseContent = result.choices[0]?.message?.content;
          const contentString = extractMistralContent(responseContent);
          return contentString || 'Summary unavailable';
        } catch (error: any) {
          console.error('Mistral API error:', error);
          // If it's a rate limit error, mark as rate limited and don't retry
          if (error.status === 429 || error.code === '3505') {
            console.log('Mistral rate limit exceeded, marking as rate limited');
            // Force rate limit by setting count to max
            rateLimiter['limits'].set(MISTRAL_KEY, {
              count: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + MISTRAL_RATE_LIMIT.WINDOW_MS
            });
          }
          // Fall through to OpenAI only if it's available
        }
      } else {
        console.log(`Mistral rate limited. Remaining requests: ${rateLimiter.getRemaining(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS)}`);
      }
      
      // Fallback to OpenAI only if available
      if (openaiAvailable) {
        console.log(`Using OpenAI for summarizeContent (attempt ${attempt + 1})`);
        try {
          const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that creates concise, engaging summaries of articles. Focus on the key points and main takeaways.'
              },
              {
                role: 'user',
                content: `Please summarize this article in 2-3 sentences:\n\n${content}`
              }
            ],
            max_tokens: 150,
            temperature: 0.7,
          });

          return result.choices[0]?.message?.content || 'Summary unavailable';
        } catch (error: any) {
          console.error('OpenAI API error:', error);
          // If it's a rate limit error, mark as rate limited and don't retry
          if (error.status === 429 || error.code === 'insufficient_quota') {
            console.log('OpenAI rate limit exceeded, marking as rate limited');
            // Force rate limit by setting count to max
            rateLimiter['limits'].set(OPENAI_KEY, {
              count: OPENAI_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + OPENAI_RATE_LIMIT.WINDOW_MS
            });
          }
          throw error;
        }
      } else {
        console.log(`OpenAI rate limited. Remaining requests: ${rateLimiter.getRemaining(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS)}`);
      }
      
      // If we get here, both providers failed but we should retry if we have attempts left
      if (attempt < maxRetries - 1) {
        await exponentialBackoff(attempt);
        continue;
      }
    } catch (error) {
      console.error('Error summarizing content:', error);
      if (attempt < maxRetries - 1) {
        await exponentialBackoff(attempt);
        continue;
      }
    }
  }
  
  return 'Summary unavailable';
};

export const generateTags = async (content: string): Promise<string[]> => {
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if providers are available
      const openrouterAvailable = rateLimiter.isAllowed(OPENROUTER_KEY, OPENROUTER_RATE_LIMIT.MAX_REQUESTS, OPENROUTER_RATE_LIMIT.WINDOW_MS);
      const mistralAvailable = rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS);
      const openaiAvailable = rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS);
      
      // If all providers are rate limited, don't retry
      if (!openrouterAvailable && !mistralAvailable && !openaiAvailable) {
        console.log('All AI providers are rate limited, skipping retry');
        return ['general'];
      }
      
      // Try OpenRouter first if available (primary provider)
      if (openrouterAvailable) {
        try {
          const result = await tryFreeModels(
            [
              {
                role: 'user',
                content: `Generate 3-5 relevant tags for this content. Return only the tags separated by commas:\n\n${content}`
              }
            ],
            100,
            'tag generation'
          );
          
          const tags = result.choices[0]?.message?.content?.split(',').map((tag: string) => tag.trim()) || [];
          console.log('Generated tags using openrouter');
          return tags;
        } catch (error: any) {
          console.error('All OpenRouter models failed for tag generation:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.message.includes('rate_limit') || error.status === 429) {
            console.log('OpenRouter rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(OPENROUTER_KEY, {
              count: OPENROUTER_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + OPENROUTER_RATE_LIMIT.WINDOW_MS
            });
          }
          // Fall through to other providers
        }
      }

      // Try Mistral as fallback if available
      if (mistralAvailable) {
        try {
          const result = await mistral.chat.complete({
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'user',
                content: `Generate 3-5 relevant tags for this content. Return only the tags separated by commas:\n\n${content}`
              }
            ],
            maxTokens: 100,
          });
          
          const responseContent = result.choices[0]?.message?.content;
          const contentString = extractMistralContent(responseContent);
          const tags = contentString.split(',').map((tag: string) => tag.trim()) || [];
          console.log('Generated tags using mistral');
          return tags;
        } catch (error: any) {
          console.error('Mistral API error:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.status === 429 || error.code === '3505') {
            console.log('Mistral rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(MISTRAL_KEY, {
              count: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + MISTRAL_RATE_LIMIT.WINDOW_MS
            });
          }
          throw error;
        }
      }
      
      // Try OpenAI as fallback if available
      if (openaiAvailable) {
        try {
          const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Generate 3-5 relevant tags for this content. Return only the tags separated by commas:\n\n${content}`
              }
            ],
            max_tokens: 100,
          });
          
          const tags = result.choices[0]?.message?.content?.split(',').map((tag: string) => tag.trim()) || [];
          console.log('Generated tags using openai');
          return tags;
        } catch (error: any) {
          console.error('OpenAI API error:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.status === 429 || error.code === 'insufficient_quota') {
            console.log('OpenAI rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(OPENAI_KEY, {
              count: OPENAI_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + OPENAI_RATE_LIMIT.WINDOW_MS
            });
          }
          throw error;
        }
      }
      
      // If we get here, both providers failed but we should retry if we have attempts left
      if (attempt < maxRetries - 1) {
        await exponentialBackoff(attempt);
        continue;
      }
      
      throw new Error('All AI providers are rate limited');
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error('Error generating tags:', error);
        return ['general'];
      }
      // Continue to next attempt
    }
  }
  
  return ['general'];
};

export const categorizeContent = async (content: string): Promise<string> => {
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if providers are available
      const openrouterAvailable = rateLimiter.isAllowed(OPENROUTER_KEY, OPENROUTER_RATE_LIMIT.MAX_REQUESTS, OPENROUTER_RATE_LIMIT.WINDOW_MS);
      const mistralAvailable = rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS);
      const openaiAvailable = rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS);
      
      // If all providers are rate limited, don't retry
      if (!openrouterAvailable && !mistralAvailable && !openaiAvailable) {
        console.log('All AI providers are rate limited, skipping retry');
        return 'General';
      }
      
      // Try OpenRouter first if available (primary provider)
      if (openrouterAvailable) {
        try {
          const result = await tryFreeModels(
            [
              {
                role: 'user',
                content: `Categorize this content into one of these categories: Technology, Business, Lifestyle, Entertainment, Science, Politics, Sports, Health. Return only the category name:\n\n${content}`
              }
            ],
            50,
            'categorization'
          );
          
          const category = result.choices[0]?.message?.content?.trim() || 'General';
          console.log('Categorized content using openrouter');
          return category;
        } catch (error: any) {
          console.error('All OpenRouter models failed for categorization:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.message.includes('rate_limit') || error.status === 429) {
            console.log('OpenRouter rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(OPENROUTER_KEY, {
              count: OPENROUTER_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + OPENROUTER_RATE_LIMIT.WINDOW_MS
            });
          }
          // Fall through to other providers
        }
      }

      // Try Mistral as fallback if available
      if (mistralAvailable) {
        try {
          const result = await mistral.chat.complete({
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'user',
                content: `Categorize this content into one of these categories: Technology, Business, Lifestyle, Entertainment, Science, Politics, Sports, Health. Return only the category name:\n\n${content}`
              }
            ],
            maxTokens: 50,
          });
          
          const responseContent = result.choices[0]?.message?.content;
          const contentString = extractMistralContent(responseContent);
          const category = contentString.trim() || 'General';
          console.log('Categorized content using mistral');
          return category;
        } catch (error: any) {
          console.error('Mistral API error:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.status === 429 || error.code === '3505') {
            console.log('Mistral rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(MISTRAL_KEY, {
              count: MISTRAL_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + MISTRAL_RATE_LIMIT.WINDOW_MS
            });
          }
          throw error;
        }
      }
      
      // Try OpenAI as fallback if available
      if (openaiAvailable) {
        try {
          const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Categorize this content into one of these categories: Technology, Business, Lifestyle, Entertainment, Science, Politics, Sports, Health. Return only the category name:\n\n${content}`
              }
            ],
            max_tokens: 50,
          });
          
          const category = result.choices[0]?.message?.content?.trim() || 'General';
          console.log('Categorized content using openai');
          return category;
        } catch (error: any) {
          console.error('OpenAI API error:', error);
          // If it's a rate limit error, mark as rate limited
          if (error.status === 429 || error.code === 'insufficient_quota') {
            console.log('OpenAI rate limit exceeded, marking as rate limited');
            rateLimiter['limits'].set(OPENAI_KEY, {
              count: OPENAI_RATE_LIMIT.MAX_REQUESTS,
              resetTime: Date.now() + OPENAI_RATE_LIMIT.WINDOW_MS
            });
          }
          throw error;
        }
      }
      
      // If we get here, both providers failed but we should retry if we have attempts left
      if (attempt < maxRetries - 1) {
        await exponentialBackoff(attempt);
        continue;
      }
      
      throw new Error('All AI providers are rate limited');
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error('Error categorizing content:', error);
        return 'General';
      }
      // Continue to next attempt
    }
  }
  
  return 'General';
};

export async function rewriteArticleWithStyle(content: string, title: string, source: string, style: 'informative' | 'persuasive' | 'review' | 'how-to' = 'informative'): Promise<AIResponse> {
  // Calculate original content word count
  const originalWordCount = content.trim().split(/\s+/).length;
  
  // Determine target word count based on original
  let targetWordCount = originalWordCount;
  
  // If original is very short (< 50 words), expand to 200-300 words
  if (originalWordCount < 50) {
    targetWordCount = Math.floor(Math.random() * 100) + 200; // 200-300 words
  }
  // If original is very long (> 1000 words), condense to 600-800 words
  else if (originalWordCount > 1000) {
    targetWordCount = Math.floor(Math.random() * 200) + 600; // 600-800 words
  }
  // For medium-length content, keep within 20% of original length
  else {
    const variance = Math.floor(originalWordCount * 0.2); // 20% variance
    targetWordCount = originalWordCount + (Math.floor(Math.random() * variance * 2) - variance);
    // Ensure minimum of 100 words
    targetWordCount = Math.max(targetWordCount, 100);
  }

  const stylePrompts = {
    informative: `Write an informative, educational article that explains the topic clearly and provides valuable insights. Focus on facts, analysis, and helpful information.`,
    persuasive: `Write a persuasive article that convinces readers of the value or importance of the topic. Use compelling arguments and emotional appeals.`,
    review: `Write a review-style article that evaluates the topic, compares options, and provides recommendations. Include pros/cons and ratings.`,
    'how-to': `Write a how-to guide that provides step-by-step instructions and practical advice. Make it actionable and easy to follow.`
  };

  const prompt = `You are a professional content writer. Rewrite the following article in a ${style} style.

ORIGINAL TITLE: ${title}
ORIGINAL SOURCE: ${source}
ORIGINAL CONTENT: ${content}
ORIGINAL WORD COUNT: ${originalWordCount} words
TARGET WORD COUNT: ${targetWordCount} words (±10% tolerance)

STYLE: ${stylePrompts[style]}

ADDITIONAL REQUIREMENTS:
- Write exactly ${targetWordCount} words of completely original content (±10% tolerance)
- Maintain key facts and information from the original
- Use engaging, conversational writing style
- Optimize for affiliate content naturally
- Include clear structure with subheadings
- Make it SEO-friendly with relevant keywords
- Add value beyond the original content
- STRICT WORD COUNT: Aim for exactly ${targetWordCount} words
- IMPORTANT: Use Markdown formatting only - # for main headers, ## for subheaders, ### for sub-subheaders
- DO NOT use HTML tags like <h3> or <h2>
- DO NOT use double ## for headers

REWRITTEN ARTICLE:`;

  // Try Mistral first
  if (process.env.MISTRAL_API_KEY) {
    if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
      try {
        const response = await mistral.chat.complete({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: Math.max(800, targetWordCount * 1.5), // Dynamic token limit based on target word count
        });
        const content = Array.isArray(response.choices[0]?.message?.content)
          ? response.choices[0]?.message?.content.map(c =>
              typeof c === 'string' ? c : ''
            ).join(' ')
          : (typeof response.choices[0]?.message?.content === 'string'
              ? response.choices[0]?.message?.content
              : 'Article rewrite unavailable');
        return {
          content: cleanContentFormatting(content),
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
          max_tokens: Math.max(800, targetWordCount * 1.5), // Dynamic token limit based on target word count
        });
        return {
          content: cleanContentFormatting(response.choices[0]?.message?.content || 'Article rewrite unavailable'),
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