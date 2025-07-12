import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance';

export async function GET() {
  try {
    const stats = {
      ai: performanceMonitor.getStats('ai_processing'),
      images: performanceMonitor.getStats('image_fetch'),
      database: performanceMonitor.getStats('database_operation'),
      recentErrors: performanceMonitor.getRecentErrors(5)
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance stats' },
      { status: 500 }
    );
  }
} 