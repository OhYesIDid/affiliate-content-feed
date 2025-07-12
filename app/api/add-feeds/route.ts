import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Add missing feeds
    const missingFeeds = [
      {
        name: 'Hacker News',
        url: 'https://news.ycombinator.com/rss',
        category: 'tech',
        source: 'Hacker News',
        active: true
      },
      {
        name: 'Engadget',
        url: 'https://www.engadget.com/rss.xml',
        category: 'tech',
        source: 'Engadget',
        active: true
      }
    ];

    const results = [];
    
    for (const feed of missingFeeds) {
      try {
        // Check if feed already exists
        const { data: existing } = await supabase
          .from('rss_feeds')
          .select('id')
          .eq('url', feed.url)
          .single();
        
        if (existing) {
          results.push({
            name: feed.name,
            status: 'already_exists',
            message: 'Feed already exists in database'
          });
        } else {
          // Add new feed
          const { data, error } = await supabase
            .from('rss_feeds')
            .insert([feed])
            .select()
            .single();
          
          if (error) {
            results.push({
              name: feed.name,
              status: 'error',
              message: error.message
            });
          } else {
            results.push({
              name: feed.name,
              status: 'added',
              message: 'Feed added successfully',
              id: data.id
            });
          }
        }
      } catch (error) {
        results.push({
          name: feed.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get updated feed count
    const { data: allFeeds } = await supabase
      .from('rss_feeds')
      .select('id, name, active')
      .eq('active', true);

    return NextResponse.json({
      success: true,
      results,
      totalActiveFeeds: allFeeds?.length || 0,
      message: 'Feed addition completed'
    });

  } catch (error) {
    console.error('Error adding feeds:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add feeds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: feeds, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      feeds,
      total: feeds?.length || 0,
      active: feeds?.filter((f: any) => f.active).length || 0
    });

  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch feeds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 