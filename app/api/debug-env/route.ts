import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    adminUsername: process.env.ADMIN_USERNAME || 'not set',
    adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV,
    defaultUsername: 'admin',
    defaultPassword: 'admin123'
  })
} 