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
  const startTime = Date.now();
  let processed = 0;
  const errors: string[] = [];

  try {
    const feeds = await db.getRSSFeeds();
    
    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url);
        if (!response.ok) {
          errors.push(`Failed to fetch ${feed.name}: ${response.status}`);
          continue;
        }

        const text = await response.text();
        const parser = new Parser();
        const feedData = await parser.parseString(text);

        for (const item of feedData.items.slice(0, 10)) { // Limit to 10 items per feed
          try {
            const title = item.title || 'Untitled';
            
            // Check if article already exists
            const existing = await db.getArticles({ url: item.link });
            if (existing.length > 0) {
              continue;
            }

            // Extract image from content or use placeholder
            let imageUrl = item['media:content']?.['$']?.url || 
                          item['media:thumbnail']?.['$']?.url ||
                          extractImageFromContent(item.content) ||
                          await getRelevantImage(title, 'technology');

            // Generate affiliate link
            const affiliateUrl = await generateAffiliateLink(item.link);

            // AI processing with rate limiting
            let summary = 'Summary unavailable';
            let tags: string[] = [];
            let category = 'news';

            try {
              summary = await summarizeContent(item.content || item.contentSnippet || title);
            } catch (error) {
              errors.push(`Failed to summarize "${title}": ${error}`);
            }

            try {
              tags = await generateTags(item.content || item.contentSnippet || title);
            } catch (error) {
              errors.push(`Failed to generate tags for "${title}": ${error}`);
            }

            try {
              category = await categorizeContent(item.content || item.contentSnippet || title);
            } catch (error) {
              errors.push(`Failed to categorize "${title}": ${error}`);
            }

            // Create article
            const article = {
              title,
              summary,
              content: item.content || item.contentSnippet || '',
              url: item.link,
              affiliate_url: affiliateUrl,
              image_url: imageUrl,
              source: feed.name,
              category,
              tags,
              published_at: item.pubDate || new Date().toISOString(),
              created_at: new Date().toISOString(),
              likes_count: 0,
              bookmarks_count: 0,
            };

            await db.createArticle(article);
            processed++;
          } catch (error) {
            errors.push(`Failed to process article "${item.title}": ${error}`);
          }
        }

        // Update last fetched timestamp
        await db.updateRSSFeedLastFetched(feed.id);
      } catch (error) {
        errors.push(`Failed to process feed ${feed.name}: ${error}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to fetch feeds: ${error}`);
  }

  const duration = Date.now() - startTime;
  
  // Log ingestion
  try {
    await db.createIngestionLog({
      status: errors.length === 0 ? 'success' : errors.length < processed ? 'partial' : 'error',
      processedCount: processed,
      errorCount: errors.length,
      duration,
      message: `Processed ${processed} articles with ${errors.length} errors`,
      details: errors.length > 0 ? errors.join('; ') : undefined
    });
  } catch (logError) {
    console.error('Failed to log ingestion:', logError);
  }

  return { processed, errors };
} 