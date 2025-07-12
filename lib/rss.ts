import Parser from 'rss-parser';
import { db } from './supabase';
import { rewriteArticle, summarizeContent, generateTags, categorizeContent } from './ai-providers';
import { affiliate } from './affiliate';
import { imageService } from './image-providers';
import { performanceMonitor, measurePerformance } from './performance';
import { queueAI } from './queue';

const parser = new Parser();

export const RSS_FEEDS = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology',
    defaultImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Technology',
    defaultImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
  },
  {
    name: 'CNBC',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'Business',
    defaultImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
  },
  {
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Business',
    defaultImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692'
  },
  {
    name: 'Lifehacker',
    url: 'https://lifehacker.com/rss',
    category: 'Lifestyle',
    defaultImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    category: 'Technology',
    defaultImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176'
  },
  {
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    category: 'Technology',
    defaultImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
  }
];

export async function fetchAndProcessFeeds(): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  console.log('Starting content ingestion...');

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching feed: ${feed.name}`);
      
      const feedData = await measurePerformance('rss_fetch', async () => {
        const response = await fetch(feed.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
      });

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(feedData, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');

      for (const item of Array.from(items)) {
        try {
          const title = item.querySelector('title')?.textContent?.trim() || '';
          const link = item.querySelector('link')?.textContent?.trim() || '';
          const description = item.querySelector('description')?.textContent?.trim() || '';
          const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
          const content = item.querySelector('content\\:encoded')?.textContent?.trim() || description;

          // Check if article already exists
          const existingArticle = await db
            .from('articles')
            .select('id')
            .eq('url', link)
            .single();

          if (existingArticle.data) {
            console.log(`Article already exists: ${title}`);
            continue;
          }

          // Extract image from content
          const imageMatch = content.match(/<img[^>]+src="([^"]+)"/i);
          let imageUrl = imageMatch ? imageMatch[1] : '';

          // If no image found, try to get one from image providers
          if (!imageUrl) {
            try {
              imageUrl = await measurePerformance('image_fetch', async () => {
                return await imageService.getRelevantImage(title, content, '');
              });
            } catch (error) {
              console.error('Error fetching image:', error);
              imageUrl = '';
            }
          }

          // Queue AI operations instead of processing immediately
          const aiOperations = await Promise.allSettled([
            queueAI.summarize(content, 2),
            queueAI.tag(content, 1),
            queueAI.categorize(content, 1),
            queueAI.rewrite(content, title, feed.name, 3)
          ]);

          // Generate affiliate link
          const affiliateUrl = await affiliate.createAffiliateUrl(link);

          // Insert article with placeholder AI content (will be updated by queue)
          const { data: article, error: insertError } = await db
            .from('articles')
            .insert({
              title,
              content: content.substring(0, 500) + '...', // Truncated original content
              rewritten_content: 'Processing...', // Will be updated by queue
              summary: 'Processing...', // Will be updated by queue
              tags: ['processing'],
              category: 'Processing',
              url: link,
              affiliate_url: affiliateUrl,
              image_url: imageUrl,
              source: feed.name,
              published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
              created_at: new Date().toISOString(),
              ai_operations_queued: true
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting article:', insertError);
            errors.push(`Failed to insert article: ${title}`);
            continue;
          }

          console.log(`Processed article: ${title}`);
          processed++;

        } catch (error) {
          console.error(`Error processing article:`, error);
          errors.push(`Failed to process article: ${error}`);
        }
      }

    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
      errors.push(`Failed to fetch feed ${feed.name}: ${error}`);
    }
  }

  console.log(`Successfully processed ${processed} articles`);
  return { processed, errors };
} 