import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { getCurrentConfig, updateFilterConfig, resetFilterConfig } from '@/lib/filter-config';

// GET - Retrieve current filter configuration
export async function GET() {
  try {
    const config = getCurrentConfig();
    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching filter config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter configuration' },
      { status: 500 }
    );
  }
}

// POST - Update filter configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    // Validate the configuration
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'MIN_TITLE_LENGTH', 'MAX_TITLE_LENGTH', 'EXCLUDE_KEYWORDS', 
      'INCLUDE_KEYWORDS', 'MAX_AGE_HOURS', 'SPAM_INDICATORS'
    ];

    for (const field of requiredFields) {
      if (!(field in config)) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    const numericFields = ['MIN_TITLE_LENGTH', 'MAX_TITLE_LENGTH', 'MAX_AGE_HOURS'];
    for (const field of numericFields) {
      if (typeof config[field] !== 'number' || config[field] < 0) {
        return NextResponse.json(
          { success: false, error: `${field} must be a positive number` },
          { status: 400 }
        );
      }
    }

    // Validate arrays
    const arrayFields = ['EXCLUDE_KEYWORDS', 'INCLUDE_KEYWORDS', 'SPAM_INDICATORS'];
    for (const field of arrayFields) {
      if (!Array.isArray(config[field])) {
        return NextResponse.json(
          { success: false, error: `${field} must be an array` },
          { status: 400 }
        );
      }
    }



    // Validate title length logic
    if (config.MIN_TITLE_LENGTH >= config.MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { success: false, error: 'MIN_TITLE_LENGTH must be less than MAX_TITLE_LENGTH' },
        { status: 400 }
      );
    }

    // Update the runtime configuration
    await updateFilterConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Filter configuration updated successfully',
      config
    });
  } catch (error) {
    console.error('Error updating filter config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update filter configuration' },
      { status: 500 }
    );
  }
}

// PUT - Reset to default configuration
export async function PUT() {
  try {
    // Reset to default configuration
    await resetFilterConfig();
    const config = getCurrentConfig();

    return NextResponse.json({
      success: true,
      message: 'Filter configuration reset to defaults',
      config
    });
  } catch (error) {
    console.error('Error resetting filter config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset filter configuration' },
      { status: 500 }
    );
  }
} 