import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

// GET - Retrieve all RSS feeds
export async function GET() {
  try {
    const feeds = await db.getRSSFeeds();
    
    return NextResponse.json({
      success: true,
      feeds,
      total: feeds.length
    });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    );
  }
} 