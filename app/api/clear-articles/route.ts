import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE() {
  try {
    // Clear all articles from the database using direct Supabase access
    const { data, error, count } = await supabase
      .from('articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all articles

    if (error) {
      console.error('Error clearing articles:', error);
      return NextResponse.json(
        { error: 'Failed to clear articles', details: error.message },
        { status: 500 }
      );
    }

    console.log(`🗑️ Cleared articles from database`);
    
    return NextResponse.json({
      success: true,
      message: 'Cleared all articles from database',
      clearedCount: count || 0
    });
    
  } catch (error) {
    console.error('Error in clear articles:', error);
    return NextResponse.json(
      { error: 'Failed to clear articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 