import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

    // Check if user already liked this article
    const { data: existingLike } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_ip', userIp)
      .single()

    if (existingLike) {
      // User already liked, so unlike
      await supabase
        .from('article_likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_ip', userIp)

      return NextResponse.json({ 
        success: true, 
        liked: false,
        message: 'Article unliked successfully' 
      })
    } else {
      // User hasn't liked, so like
      await supabase
        .from('article_likes')
        .insert({
          article_id: articleId,
          user_ip: userIp
        })

      return NextResponse.json({ 
        success: true, 
        liked: true,
        message: 'Article liked successfully' 
      })
    }

  } catch (error) {
    console.error('Error in like endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to update like status' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

    // Check if user has liked this article
    const { data: existingLike } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_ip', userIp)
      .single()

    return NextResponse.json({ 
      liked: !!existingLike
    })

  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json({ liked: false })
  }
} 