import Parser from 'rss-parser';
import { db } from './supabase';
import { rewriteArticle, summarizeContent, generateTags, categorizeContent } from './ai-providers';
import { affiliate } from './affiliate';
import { imageService } from './image-providers';
import { performanceMonitor, measurePerformance } from './performance';
import { queueAI } from './queue';
import { getCurrentConfig, ensureConfigLoaded } from './filter-config';

const parser = new Parser();

// Filtering functions
const shouldProcessArticle = async (item: any, feedName: string): Promise<{ shouldProcess: boolean; reason?: string }> => {
  const title = item.title || '';

  // Pick the content field with the most words
  const candidates = [
    item['content:encoded'],
    item.content,
    item.description,
    item.contentSnippet
  ].filter(Boolean);
  const content = candidates.sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)[0] || '';

  const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

  // Get global filter rules (ensure config is loaded)
  const rules = await ensureConfigLoaded();

  // 1. Basic validation
  if (!title || !item.link) {
    return { shouldProcess: false, reason: 'Missing title or link' };
  }

  // 2. Title length filter
  if (title.length < rules.MIN_TITLE_LENGTH || title.length > rules.MAX_TITLE_LENGTH) {
    return { shouldProcess: false, reason: `Title length ${title.length} outside range ${rules.MIN_TITLE_LENGTH}-${rules.MAX_TITLE_LENGTH}` };
  }

  // 3. Content length filter
  // (Word count filter removed)

  // 4. Age filter
  const ageHours = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
  if (ageHours > rules.MAX_AGE_HOURS) {
    return { shouldProcess: false, reason: `Article too old (${Math.round(ageHours)} hours)` };
  }

  // 5. Exclude keyword filter
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  for (const keyword of rules.EXCLUDE_KEYWORDS) {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerTitle.includes(lowerKeyword) || lowerContent.includes(lowerKeyword)) {
      return { shouldProcess: false, reason: `Contains excluded keyword: ${keyword}` };
    }
  }

  // 6. Include keyword filter (at least one must be present, but only if INCLUDE_KEYWORDS is non-empty)
  if (rules.INCLUDE_KEYWORDS.length > 0) {
    const hasIncludeKeyword = rules.INCLUDE_KEYWORDS.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return lowerTitle.includes(lowerKeyword) || lowerContent.includes(lowerKeyword);
    });

    if (!hasIncludeKeyword) {
      return { shouldProcess: false, reason: 'No relevant keywords found' };
    }
  }

  // 7. Spam detection
  for (const patternStr of rules.SPAM_INDICATORS) {
    try {
      const pattern = new RegExp(patternStr, 'i');
      if (pattern.test(title)) {
        return { shouldProcess: false, reason: 'Spam indicators detected in title' };
      }
    } catch (error) {
      console.warn(`Invalid regex pattern: ${patternStr}`);
    }
  }

  // 8. Language detection (basic English check)
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const hasEnglishWords = englishWords.some(word =>
    lowerTitle.includes(` ${word} `) || lowerContent.includes(` ${word} `)
  );
  if (!hasEnglishWords) {
    return { shouldProcess: false, reason: 'No English words detected' };
  }

  return { shouldProcess: true };
};

// Enhanced duplicate detection
const isDuplicateArticle = async (title: string, content: string): Promise<boolean> => {
  try {
    // Check for exact title match (most reliable for RSS feeds)
    const existingByTitle = await db.getArticles({ title });
    if (existingByTitle.length > 0) {
      console.log(`🔍 Duplicate found by exact title match: "${title}"`);
      return true;
    }

    // Removed similarity-based duplicate detection as it was too aggressive
    // URL-based checking in the main loop is sufficient for RSS feeds
    
    return false;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false; // Allow processing if we can't check
  }
};

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
  },
  // Affiliate-focused feeds
  {
    name: 'Slickdeals',
    url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',
    category: 'Deals',
    defaultImage: 'https://images.unsplash.com/photo-1607082349566-187342175e2f'
  },
  {
    name: 'DealNews',
    url: 'https://www.dealnews.com/rss.xml',
    category: 'Deals',
    defaultImage: 'https://images.unsplash.com/photo-1607082349566-187342175e2f'
  },
  {
    name: 'Woot',
    url: 'https://www.woot.com/feed',
    category: 'Deals',
    defaultImage: 'https://images.unsplash.com/photo-1607082349566-187342175e2f'
  },
  {
    name: 'The Wirecutter',
    url: 'https://thewirecutter.com/feed/',
    category: 'Reviews',
    defaultImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
  },
  {
    name: 'CNET Reviews',
    url: 'https://www.cnet.com/rss/reviews/',
    category: 'Reviews',
    defaultImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
  },
  {
    name: 'Tom\'s Guide',
    url: 'https://www.tomsguide.com/feeds/all.xml',
    category: 'Reviews',
    defaultImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
  },
  {
    name: 'Gear Patrol',
    url: 'https://gearpatrol.com/feed/',
    category: 'Lifestyle',
    defaultImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  },
  {
    name: 'The Strategist',
    url: 'https://nymag.com/strategist/rss.xml',
    category: 'Lifestyle',
    defaultImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  }
];

export async function fetchAndProcessFeeds(): Promise<{ processed: number; errors: string[]; filtered: number }> {
  const startTime = Date.now();
  let processed = 0;
  let filtered = 0;
  const errors: string[] = [];

  try {
    // Get the last ingestion timestamp to only process newer articles
    let lastIngestionTime: Date | null = null;
    try {
      const latestLog = await db.getLatestIngestionLog();
      if (latestLog && latestLog.timestamp) {
        lastIngestionTime = new Date(latestLog.timestamp);
        console.log(`📅 Last ingestion: ${lastIngestionTime.toISOString()}`);
      }
    } catch (error) {
      console.log('No previous ingestion log found, processing all articles');
    }

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

        for (const item of feedData.items) { // Process all items from each feed
          try {
            const title = item.title || 'Untitled';

            // Check if article already exists by URL
            if (!item.link) {
              errors.push(`Article "${item.title}" has no link`);
              continue;
            }

            // Skip articles published before the last ingestion
            if (lastIngestionTime && item.pubDate) {
              const articleDate = new Date(item.pubDate);
              if (articleDate <= lastIngestionTime) {
                console.log(`⏭️ Skipped "${title}": Published before last ingestion (${articleDate.toISOString()})`);
                filtered++;
                continue;
              }
            }

            const existing = await db.getArticles({ url: item.link });
            if (existing.length > 0) {
              console.log(`🔍 Duplicate found by URL: "${title}"`);
              continue;
            }

            // Pick the content field with the most words
            const candidates = [
              item['content:encoded'],
              item.content,
              item.description,
              item.contentSnippet
            ].filter(Boolean);
            const content = candidates.sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)[0] || '';

            // Apply comprehensive filtering before AI processing
            const filterResult = await shouldProcessArticle(item, feed.name);
            if (!filterResult.shouldProcess) {
              console.log(`⏭️ Skipped "${title}": ${filterResult.reason}`);
              filtered++;
              continue;
            }

            // Check for duplicate content
            const isDuplicate = await isDuplicateArticle(title, content);
            if (isDuplicate) {
              console.log(`⏭️ Skipped duplicate: "${title}"`);
              filtered++;
              continue;
            }

            // Extract image from content or use placeholder
            let imageUrl = item['media:content']?.['$']?.url || 
                          item['media:thumbnail']?.['$']?.url ||
                          extractImageFromContent(content) ||
                          await imageService.getRelevantImage(title, '', 'technology');

            // Generate affiliate link
            const affiliateUrl = await affiliate.createAffiliateUrl(item.link);

            // AI processing - all must succeed for article to be created
            let summary: string;
            let tags: string[];
            let category: string;
            let rewrittenContent: string;

            try {
              summary = await summarizeContent(content || title);
              if (!summary || summary === 'Summary unavailable') {
                throw new Error('Summary generation failed');
              }
            } catch (error) {
              errors.push(`Failed to summarize "${title}": ${error}`);
              continue; // Skip this article
            }

            try {
              tags = await generateTags(content || title);
              if (!tags || tags.length === 0) {
                throw new Error('Tag generation failed');
              }
            } catch (error) {
              errors.push(`Failed to generate tags for "${title}": ${error}`);
              continue; // Skip this article
            }

            try {
              category = await categorizeContent(content || title);
              if (!category || category === 'General') {
                throw new Error('Category generation failed');
              }
            } catch (error) {
              errors.push(`Failed to categorize "${title}": ${error}`);
              continue; // Skip this article
            }

            // Rewrite article content - this is critical
            try {
              const rewriteResult = await rewriteArticle(
                content || title,
                title,
                feed.name
              );
              rewrittenContent = rewriteResult.content;
              if (!rewrittenContent) {
                throw new Error('Content rewrite failed');
              }
            } catch (error) {
              errors.push(`Failed to rewrite "${title}": ${error}`);
              continue; // Skip this article
            }

            // Only create article if all AI processing succeeded
            const article = {
              title,
              summary,
              content: rewrittenContent,
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
            console.log(`✅ Successfully processed: ${title}`);
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
      message: `Processed ${processed} articles, filtered ${filtered} articles, with ${errors.length} errors`,
      details: errors.length > 0 ? errors.join('; ') : undefined
    });
  } catch (logError) {
    console.error('Failed to log ingestion:', logError);
  }

  console.log(`📊 Ingestion Summary: ${processed} processed, ${filtered} filtered, ${errors.length} errors`);
  return { processed, errors, filtered };
}

function extractImageFromContent(content: string): string | null {
  try {
    // Simple regex to extract first image from HTML content
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
    return imgMatch ? imgMatch[1] : null;
  } catch (error) {
    return null;
  }
} 