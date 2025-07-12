import Parser from 'rss-parser';
import { db } from './supabase';
import { ai } from './openai';

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'ContentFeed/1.0 (+https://yourdomain.com)'
  }
});

export const rssProduction = {
  async fetchAndProcessFeeds() {
    try {
      console.log('Starting production RSS feed processing...');
      
      // Get RSS feeds from database
      const feeds = await db.getRSSFeeds();
      const processedArticles = [];

      for (const feed of feeds) {
        if (!feed.active) continue;
        
        try {
          console.log(`Processing feed: ${feed.name}`);
          
          // Parse RSS feed
          const feedData = await parser.parseURL(feed.url);
          
          // Process articles (limit to 10 per feed to avoid rate limits)
          for (const item of feedData.items.slice(0, 10)) {
            try {
              // Check if article already exists
              if (!item.link) {
                console.log(`Article "${item.title}" has no link, skipping`);
                continue;
              }
              
              const existing = await db.getArticles({ url: item.link });
              if (existing && existing.length > 0) {
                console.log(`Article already exists: ${item.title}`);
                continue;
              }

              // Process content with AI (with error handling)
              const content = item.contentSnippet || item.content || '';
              let aiSummary = '';
              let tags: string[] = [];
              let category = feed.category;
              let rewrittenContent = content;

              try {
                // Only process with AI if we have content
                if (content.length > 50) {
                  aiSummary = await ai.summarizeContent(content, item.title || '');
                  tags = await ai.generateTags(content, item.title || '');
                  category = await ai.categorizeContent(content, item.title || '');
                  
                  // Rewrite content for SEO
                  try {
                    const seoRewrite = await ai.rewriteForSEO(content, item.title || '');
                    if (seoRewrite) {
                      rewrittenContent = seoRewrite;
                    }
                  } catch (rewriteError) {
                    console.error(`Content rewrite failed for ${item.title}:`, rewriteError);
                    // Keep original content if rewrite fails
                  }
                }
              } catch (aiError) {
                console.error(`AI processing failed for ${item.title}:`, aiError);
                // Fallback to basic processing
                aiSummary = item.contentSnippet || '';
                tags = [feed.category, feed.source];
              }

              // Create affiliate URL
              const affiliateUrl = await this.createAffiliateUrl(item.link || '');

              // Extract image from content or use placeholder
              const imageUrl = this.extractImageFromContent(item.content || '') || 
                             item.enclosure?.url || 
                             this.getRandomImage();

              const article = {
                title: item.title || '',
                summary: aiSummary || item.contentSnippet || '',
                content: rewrittenContent,
                url: item.link || '',
                affiliate_url: affiliateUrl,
                image_url: imageUrl,
                source: feed.source,
                category: category,
                tags: tags,
                published_at: item.pubDate || new Date().toISOString(),
                likes_count: 0,
                bookmarks_count: 0,
                ai_summary: aiSummary,
              };

              const savedArticle = await db.createArticle(article);
              processedArticles.push(savedArticle);
              
              console.log(`✅ Processed: ${article.title}`);
              
              // Rate limiting - wait 2 seconds between articles
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } catch (articleError) {
              console.error(`Error processing article from ${feed.name}:`, articleError);
              continue;
            }
          }

          // Update last_fetched timestamp
          await db.updateRSSFeedLastFetched(feed.id);
          
          // Wait between feeds to be respectful
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (feedError) {
          console.error(`Error processing feed ${feed.name}:`, feedError);
          continue;
        }
      }

      console.log(`✅ Production processing complete. Processed ${processedArticles.length} new articles.`);
      return processedArticles;
      
    } catch (error) {
      console.error('Production RSS processing failed:', error);
      throw error;
    }
  },

  async createAffiliateUrl(originalUrl: string): Promise<string> {
    try {
      // Skimlinks integration
      if (process.env.SKIMLINKS_ID) {
        return `https://go.skimresources.com/?id=${process.env.SKIMLINKS_ID}&url=${encodeURIComponent(originalUrl)}`;
      }
      
      // Amazon affiliate integration
      if (originalUrl.includes('amazon.com') && process.env.AMAZON_AFFILIATE_TAG) {
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}tag=${process.env.AMAZON_AFFILIATE_TAG}`;
      }
      
      // Awin integration (if you have it)
      if (process.env.AWIN_ID) {
        return `https://www.awin1.com/cread.php?awinmid=${process.env.AWIN_ID}&awinaffid=YOUR_AFFILIATE_ID&clickref=&p=${encodeURIComponent(originalUrl)}`;
      }
      
      return originalUrl;
    } catch (error) {
      console.error('Error creating affiliate URL:', error);
      return originalUrl;
    }
  },

  extractImageFromContent(content: string): string | null {
    try {
      // Simple regex to extract first image from HTML content
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      return imgMatch ? imgMatch[1] : null;
    } catch (error) {
      return null;
    }
  },

  getRandomImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      'https://images.unsplash.com/photo-1551434678-e076c223a692',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    ];
    
    return images[Math.floor(Math.random() * images.length)];
  },

  async scheduleFeedUpdates() {
    console.log('🕐 Starting scheduled feed update...');
    const articles = await this.fetchAndProcessFeeds();
    console.log(`📊 Scheduled update complete: ${articles.length} new articles`);
    return articles;
  }
}; 