import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const tags = searchParams.get('tags')?.split(',')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '12') // Changed default to 12
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters: any = {}
    if (category) filters.category = category
    if (source) filters.source = source
    if (tags) filters.tags = tags

    const articles = await db.getArticles(filters, sort, order as 'desc' | 'asc')
    
    // Apply pagination with max limit of 12
    const maxLimit = Math.min(limit, 12)
    const paginatedArticles = articles.slice(offset, offset + maxLimit)
    
    return NextResponse.json({
      articles: paginatedArticles,
      total: articles.length,
      hasMore: offset + limit < articles.length
    })
    
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
} 