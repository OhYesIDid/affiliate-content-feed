import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing ingestion logging...');
    
    // Test creating a log entry
    const testLog = await db.createIngestionLog({
      status: 'success',
      processedCount: 10,
      errorCount: 0,
      duration: 1500,
      message: 'Test log entry from API',
      details: 'This is a test to verify logging works'
    });
    
    console.log('✅ Test log created:', testLog);
    
    // Fetch recent logs
    const recentLogs = await db.getIngestionLogs(5);
    console.log('📋 Recent logs:', recentLogs);
    
    return NextResponse.json({
      success: true,
      testLog,
      recentLogs,
      message: 'Logging test completed successfully'
    });
  } catch (error) {
    console.error('❌ Logging test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
} 