import { NextResponse } from 'next/server';
import { aiQueue } from '@/lib/queue';

export async function GET() {
  try {
    const status = aiQueue.getStatus();
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch queue status' },
      { status: 500 }
    );
  }
} 