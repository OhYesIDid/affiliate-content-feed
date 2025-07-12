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

// Add exponential backoff utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const exponentialBackoff = async (attempt: number, baseDelay: number = 1000) => {
  const waitTime = baseDelay * Math.pow(2, attempt);
  console.log(`⏳ Waiting ${waitTime}ms before retry (attempt ${attempt + 1})`);
  await delay(waitTime);
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
          ? response.choices[0]?.message?.content.map((c: any) =>
              typeof c === 'string' ? c : ''
            ).join(' ')
          : (typeof response.choices[0]?.message?.content === 'string'
              ? response.choices[0]?.message?.content
              : 'Article rewrite unavailable');
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
          max_tokens: Math.max(800, targetWordCount * 1.5), // Dynamic token limit based on target word count
        });
        return {
          content: response.choices[0]?.message?.content || 'Article rewrite unavailable',
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
      // Try Mistral first
      if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
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
        } catch (error) {
          console.error('Mistral API error:', error);
          throw error;
        }
      } else {
        // Fallback to OpenAI
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
        } catch (error) {
          console.error('OpenAI API error:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error summarizing content:', error);
      throw error;
    }
  }
  
  return 'Summary unavailable';
};

export const generateTags = async (content: string): Promise<string[]> => {
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try Mistral first
      if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
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
        } catch (error) {
          console.error('Mistral API error:', error);
          throw error;
        }
      }
      
      // Try OpenAI as fallback
      if (rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS)) {
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
          
          const tags = result.choices[0]?.message?.content?.split(',').map(tag => tag.trim()) || [];
          console.log('Generated tags using openai');
          return tags;
        } catch (error) {
          console.error('OpenAI API error:', error);
          throw error;
        }
      }
      
      // If both are rate limited, wait and retry
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
      // Try Mistral first
      if (rateLimiter.isAllowed(MISTRAL_KEY, MISTRAL_RATE_LIMIT.MAX_REQUESTS, MISTRAL_RATE_LIMIT.WINDOW_MS)) {
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
        } catch (error) {
          console.error('Mistral API error:', error);
          throw error;
        }
      }
      
      // Try OpenAI as fallback
      if (rateLimiter.isAllowed(OPENAI_KEY, OPENAI_RATE_LIMIT.MAX_REQUESTS, OPENAI_RATE_LIMIT.WINDOW_MS)) {
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
        } catch (error) {
          console.error('OpenAI API error:', error);
          throw error;
        }
      }
      
      // If both are rate limited, wait and retry
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
          max_tokens: Math.max(800, targetWordCount * 1.5), // Dynamic token limit based on target word count
        });
        return {
          content: response.choices[0]?.message?.content || 'Article rewrite unavailable',
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