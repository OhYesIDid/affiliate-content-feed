import Parser from 'rss-parser';
import { db } from './supabase';
import { ai } from './openai';
import { affiliate } from './affiliate';

const parser = new Parser();

// Sample RSS feeds for different categories
export const RSS_FEEDS = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'tech',
    source: 'TechCrunch'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'tech',
    source: 'The Verge'
  },
  {
    name: 'CNBC',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'finance',
    source: 'CNBC'
  },
  {
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'business',
    source: 'BBC'
  },
  {
    name: 'Lifehacker',
    url: 'https://lifehacker.com/rss',
    category: 'lifestyle',
    source: 'Lifehacker'
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    category: 'tech',
    source: 'Hacker News'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'tech',
    source: 'Ars Technica'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'tech',
    source: 'Wired'
  },
  {
    name: 'Mashable',
    url: 'https://mashable.com/feed',
    category: 'tech',
    source: 'Mashable'
  },
  {
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    category: 'tech',
    source: 'Engadget'
  }
];

export const rss = {
  async fetchAndProcessFeeds() {
    const processedArticles: any[] = [];

    // Check current article count and limit if needed
    const existingArticles = await db.getArticles();
    if (existingArticles.length >= 12) {
      console.log(`Already have ${existingArticles.length} articles, skipping ingestion`);
      return processedArticles;
    }

    // Track OpenAI quota status
    let openaiQuotaExceeded = false;

    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Fetching feed: ${feed.name}`);
        const feedData = await parser.parseURL(feed.url);
        
        for (const item of feedData.items.slice(0, 2)) { // Limit to 2 articles per feed to keep total manageable
          try {
            // Check if OpenAI quota is exceeded
            if (openaiQuotaExceeded) {
              console.log('OpenAI quota exceeded, skipping remaining articles');
              break;
            }

            // Check if article already exists
            const existing = await db.getArticles({ url: item.link });
            if (existing && existing.length > 0) {
              console.log(`Article already exists: ${item.title}`);
              continue;
            }

            // Process content with AI
            const content = item.contentSnippet || item.content || '';
            
            try {
              const aiSummary = await ai.summarizeContent(content, item.title || '');
              const tags = await ai.generateTags(content, item.title || '');
              const category = await ai.categorizeContent(content, item.title || '');

              // Create affiliate URL using the affiliate system
              const affiliateUrl = await affiliate.createAffiliateUrl(item.link || '');

              // Improved image extraction
              let imageUrl = item.enclosure?.url
                || item["media:content"]?.url
                || item["media:thumbnail"]?.url
                || this.getRandomImage();

              const article = {
                title: item.title || '',
                summary: aiSummary || item.contentSnippet || '',
                content: content,
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
              
              console.log(`Processed article: ${article.title}`);
              
            } catch (aiError: any) {
              // Check if it's an OpenAI quota error
              if (aiError?.status === 429 || aiError?.code === 'insufficient_quota' || 
                  aiError?.message?.includes('quota') || aiError?.message?.includes('429')) {
                console.log('OpenAI quota exceeded, stopping AI processing');
                openaiQuotaExceeded = true;
                
                // Save article without AI processing
                // Improved image extraction
                let imageUrl = item.enclosure?.url
                  || item["media:content"]?.url
                  || item["media:thumbnail"]?.url
                  || this.getRandomImage();
                const affiliateUrl = await affiliate.createAffiliateUrl(item.link || '');
                const article = {
                  title: item.title || '',
                  summary: item.contentSnippet || '',
                  content: content,
                  url: item.link || '',
                  affiliate_url: affiliateUrl,
                  image_url: imageUrl,
                  source: feed.source,
                  category: feed.category,
                  tags: [],
                  published_at: item.pubDate || new Date().toISOString(),
                  likes_count: 0,
                  bookmarks_count: 0,
                  ai_summary: '',
                };

                const savedArticle = await db.createArticle(article);
                processedArticles.push(savedArticle);
                
                console.log(`Saved article without AI processing: ${article.title}`);
                break; // Stop processing more articles
              } else {
                console.error(`AI processing error for article from ${feed.name}:`, aiError);
              }
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`Error processing article from ${feed.name}:`, error);
          }
        }
              } catch (error) {
          console.error(`Error fetching feed ${feed.name}:`, error);
        }
        
        // Check if we should stop processing feeds due to OpenAI quota
        if (openaiQuotaExceeded) {
          console.log('OpenAI quota exceeded, stopping feed processing');
          break;
        }
      }

      return processedArticles;
  },



  getRandomImage(): string {
    // Placeholder images for articles without images - removed query parameters to fix Vercel cropn error
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
    // This function can be called by a cron job or scheduled task
    console.log('Starting scheduled feed update...');
    const articles = await this.fetchAndProcessFeeds();
    console.log(`Processed ${articles.length} new articles`);
    return articles;
  }
}; 