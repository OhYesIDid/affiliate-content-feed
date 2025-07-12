import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// Session management
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const SESSION_COOKIE_NAME = 'admin_session'

export interface AdminUser {
  id: string
  username: string
  role: 'admin'
  lastLogin: Date
}

export class AdminAuth {
  private static sessions = new Map<string, { user: AdminUser; expires: number }>()

  static async authenticate(username: string, password: string): Promise<AdminUser | null> {
    // Check against environment variables
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const user: AdminUser = {
        id: 'admin-1',
        username: ADMIN_USERNAME,
        role: 'admin',
        lastLogin: new Date()
      }
      
      // Create session
      const sessionId = this.generateSessionId()
      const expires = Date.now() + SESSION_DURATION
      
      this.sessions.set(sessionId, { user, expires })
      
      return user
    }
    
    return null
  }

  static async validateSession(sessionId: string): Promise<AdminUser | null> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return null
    }
    
    // Check if session has expired
    if (Date.now() > session.expires) {
      this.sessions.delete(sessionId)
      return null
    }
    
    return session.user
  }

  static async logout(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  static cleanupExpiredSessions(): void {
    const now = Date.now()
    const entries = Array.from(this.sessions.entries())
    for (const [sessionId, session] of entries) {
      if (now > session.expires) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// Clean up expired sessions every hour
setInterval(() => {
  AdminAuth.cleanupExpiredSessions()
}, 60 * 60 * 1000)

// Helper functions for server-side auth
export async function getSessionFromRequest(request: NextRequest): Promise<AdminUser | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }
  
  return await AdminAuth.validateSession(sessionId)
}

export async function getSessionFromCookies(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }
  
  return await AdminAuth.validateSession(sessionId)
} 