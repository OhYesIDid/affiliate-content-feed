import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, originalUrl, affiliateUrl, timestamp } = body;

    // Validate required fields
    if (!articleId || !affiliateUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the affiliate click (you can extend this to store in database)
    console.log('Affiliate click tracked:', {
      articleId,
      originalUrl,
      affiliateUrl,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      ip: request.headers.get('x-forwarded-for') || request.ip
    });

    // You can store this in your database for analytics
    // Example: await db.createAffiliateClick({ articleId, affiliateUrl, timestamp });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track affiliate click' },
      { status: 500 }
    );
  }
} 