import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, frequency = 'weekly' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Subscribe to digest
    const subscription = await db.subscribeToDigest(email, frequency)

    return NextResponse.json({
      success: true,
      message: `Subscribed to ${frequency} digest`,
      subscription
    })

  } catch (error) {
    console.error('Error subscribing to digest:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to digest' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // This endpoint would be called by a cron job to send weekly digests
    const articles = await db.getArticles({}, 'likes_count', 'desc')
    const topArticles = articles.slice(0, 10) // Top 10 articles

    // In a real app, you'd fetch all digest subscribers and send emails
    // For now, we'll just return the top articles
    return NextResponse.json({
      success: true,
      topArticles: topArticles.length,
      message: 'Digest ready to send'
    })

  } catch (error) {
    console.error('Error preparing digest:', error)
    return NextResponse.json(
      { error: 'Failed to prepare digest' },
      { status: 500 }
    )
  }
} 