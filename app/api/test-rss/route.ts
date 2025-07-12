import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { RSS_FEEDS } from '@/lib/rss';
import { db } from '@/lib/supabase';

const parser = new Parser();

export async function GET() {
  const results = [];
  
  try {
    // First check feeds from database
    const dbFeeds = await db.getRSSFeeds();
    console.log(`Found ${dbFeeds.length} feeds in database`);
    
    for (const feed of dbFeeds) {
      try {
        console.log(`Testing feed: ${feed.name} (${feed.url})`);
        
        const response = await fetch(feed.url);
        const status = response.status;
        const ok = response.ok;
        
        if (ok) {
          const text = await response.text();
          const feedData = await parser.parseString(text);
          
          results.push({
            name: feed.name,
            url: feed.url,
            status: 'success',
            httpStatus: status,
            itemCount: feedData.items?.length || 0,
            lastItemTitle: feedData.items?.[0]?.title || 'No items',
            lastItemDate: feedData.items?.[0]?.pubDate || 'No date',
            active: feed.active
          });
        } else {
          results.push({
            name: feed.name,
            url: feed.url,
            status: 'failed',
            httpStatus: status,
            error: `HTTP ${status}`,
            active: feed.active
          });
        }
      } catch (error) {
        results.push({
          name: feed.name,
          url: feed.url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          active: feed.active
        });
      }
    }
    
    // Also test the hardcoded feeds from RSS_FEEDS
    console.log(`Testing ${RSS_FEEDS.length} hardcoded feeds`);
    
    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Testing hardcoded feed: ${feed.name} (${feed.url})`);
        
        const response = await fetch(feed.url);
        const status = response.status;
        const ok = response.ok;
        
        if (ok) {
          const text = await response.text();
          const feedData = await parser.parseString(text);
          
          results.push({
            name: `${feed.name} (hardcoded)`,
            url: feed.url,
            status: 'success',
            httpStatus: status,
            itemCount: feedData.items?.length || 0,
            lastItemTitle: feedData.items?.[0]?.title || 'No items',
            lastItemDate: feedData.items?.[0]?.pubDate || 'No date',
            source: 'hardcoded'
          });
        } else {
          results.push({
            name: `${feed.name} (hardcoded)`,
            url: feed.url,
            status: 'failed',
            httpStatus: status,
            error: `HTTP ${status}`,
            source: 'hardcoded'
          });
        }
      } catch (error) {
        results.push({
          name: `${feed.name} (hardcoded)`,
          url: feed.url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          source: 'hardcoded'
        });
      }
    }
    
  } catch (error) {
    console.error('Error testing RSS feeds:', error);
    return NextResponse.json(
      { error: 'Failed to test RSS feeds', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
  
  const summary = {
    total: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    errors: results.filter(r => r.status === 'error').length,
    totalItems: results.filter(r => r.status === 'success').reduce((sum, r) => sum + (r.itemCount || 0), 0)
  };
  
  return NextResponse.json({
    summary,
    feeds: results
  });
} 