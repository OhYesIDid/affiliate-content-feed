import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from './lib/auth'

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip authentication for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Check for admin session
    const sessionId = request.cookies.get('admin_session')?.value
    
    if (!sessionId) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // Validate session (this is a simplified check - in production, you'd want to validate the session properly)
    // For now, we'll just check if the session exists
    const session = AdminAuth.validateSession(sessionId)
    
    if (!session) {
      // Clear invalid session and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.set('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
} 