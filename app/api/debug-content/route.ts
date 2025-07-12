import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { db } from '@/lib/supabase';

const parser = new Parser();

export async function GET() {
  try {
    const feeds = await db.getRSSFeeds();
    const results = [];
    
    for (const feed of feeds.slice(0, 2)) { // Test first 2 feeds
      try {
        const response = await fetch(feed.url);
        if (!response.ok) continue;
        
        const text = await response.text();
        const feedData = await parser.parseString(text);
        
        // Analyze first 3 items from each feed
        for (const item of feedData.items.slice(0, 3)) {
          const contentAnalysis = {
            feed: feed.name,
            title: item.title,
            hasContent: !!item.content,
            hasContentSnippet: !!item.contentSnippet,
            hasDescription: !!item.description,
            contentLength: item.content?.length || 0,
            contentSnippetLength: item.contentSnippet?.length || 0,
            descriptionLength: item.description?.length || 0,
            contentWords: item.content?.split(/\s+/).length || 0,
            contentSnippetWords: item.contentSnippet?.split(/\s+/).length || 0,
            descriptionWords: item.description?.split(/\s+/).length || 0,
            contentPreview: item.content?.substring(0, 200) || 'N/A',
            contentSnippetPreview: item.contentSnippet?.substring(0, 200) || 'N/A',
            descriptionPreview: item.description?.substring(0, 200) || 'N/A'
          };
          
          results.push(contentAnalysis);
        }
      } catch (error) {
        console.error(`Error analyzing ${feed.name}:`, error);
      }
    }
    
    return NextResponse.json({
      totalItems: results.length,
      analysis: results
    });
    
  } catch (error) {
    console.error('Error in debug content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 