import { NextRequest, NextResponse } from 'next/server'
import { rss, RSS_FEEDS } from '../../../lib/rss'

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd add authentication here
    // const { user } = await auth(request)
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Starting content ingestion...')
    
    // Fetch and process RSS feeds
    const articles = await rss.fetchAndProcessFeeds()
    
    console.log(`Successfully processed ${articles.length} articles`)
    
    return NextResponse.json({
      success: true,
      message: `Processed ${articles.length} new articles`,
      articles: articles.length
    })
    
  } catch (error) {
    console.error('Error in content ingestion:', error)
    return NextResponse.json(
      { error: 'Failed to ingest content' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Content ingestion endpoint. Use POST to trigger ingestion.',
    feeds: RSS_FEEDS.length
  })
} 