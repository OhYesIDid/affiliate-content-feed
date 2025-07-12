import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('admin_session')?.value
    
    if (sessionId) {
      await AdminAuth.logout(sessionId)
    }
    
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )
    
    // Clear the session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 