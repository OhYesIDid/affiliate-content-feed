import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import { summarizeContent, generateTags, categorizeContent } from './ai-providers';
import { affiliate } from './affiliate';

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

export async function fetchAndProcessFeeds() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const parser = new Parser();
  let processedCount = 0;

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching feed: ${feed.name}`);
      const feedData = await parser.parseURL(feed.url);
      
      // Limit to 12 articles per feed
      const articles = feedData.items.slice(0, 12);
      
      for (const item of articles) {
        try {
          // Check if article already exists
          const { data: existing } = await supabase
            .from('articles')
            .select('id')
            .eq('title', item.title)
            .single();

          if (existing) {
            console.log(`Article already exists: ${item.title}`);
            continue;
          }

          // Extract image from content or use default
          let imageUrl = feed.defaultImage;
          if (item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          } else if (item['media:content']) {
            imageUrl = item['media:content']['$'].url;
          } else if (item.enclosure && item.enclosure.type?.startsWith('image/')) {
            imageUrl = item.enclosure.url;
          }

          // Generate affiliate link
          const affiliateUrl = await affiliate.createAffiliateUrl(item.link || '');

          // AI processing with rate limiting
          let summary = 'Summary unavailable';
          let tags = 'Tags unavailable';
          let category = 'Technology';

          const content = item.contentSnippet || item.title || '';

          try {
            const summaryResponse = await summarizeContent(content);
            summary = summaryResponse.content;
            console.log(`Generated summary using ${summaryResponse.provider}`);
          } catch (error) {
            console.error('Error summarizing content:', error);
          }

          try {
            const tagsResponse = await generateTags(content);
            tags = tagsResponse.content;
            console.log(`Generated tags using ${tagsResponse.provider}`);
          } catch (error) {
            console.error('Error generating tags:', error);
          }

          try {
            const categoryResponse = await categorizeContent(content);
            category = categoryResponse.content;
            console.log(`Categorized content using ${categoryResponse.provider}`);
          } catch (error) {
            console.error('Error categorizing content:', error);
          }

          // Insert article into database
          const { error: insertError } = await supabase
            .from('articles')
            .insert({
              title: item.title || 'Untitled',
              content: content,
              summary: summary,
              url: item.link || '',
              affiliate_url: affiliateUrl,
              image_url: imageUrl,
              source: feed.name,
              category: category,
              tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            });

          if (insertError) {
            console.error('Error inserting article:', insertError);
            continue;
          }

          console.log(`Processed article: ${item.title}`);
          processedCount++;

        } catch (error) {
          console.error('Error processing article:', error);
        }
      }
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
    }
  }

  console.log(`Successfully processed ${processedCount} articles`);
  return processedCount;
} 