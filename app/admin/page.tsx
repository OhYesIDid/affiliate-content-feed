'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, Database, Activity, Settings, BarChart3, Users, FileText, LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { performanceMonitor } from '@/lib/performance';

interface SystemStats {
  totalArticles: number
  totalSources: number
  lastIngestion: string
  rateLimits: {
    mistral: {
      remaining: number
      maxRequests: number
      timeUntilReset: number
    }
    openai: {
      remaining: number
      maxRequests: number
      timeUntilReset: number
    }
  }
  ingestionLogs: IngestionLogEntry[]
}

interface IngestionLogEntry {
  id: string
  timestamp: string
  status: 'success' | 'error' | 'partial'
  processedCount: number
  errorCount: number
  duration: number
  message: string
  details?: string
}

interface AdminUser {
  id: string
  username: string
  role: string
}

export default function AdminDashboard() {
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
    fetchUser()
  }, [])

  // Add performance monitoring
  useEffect(() => {
    const fetchPerformanceStats = async () => {
      try {
        const response = await fetch('/api/admin/performance');
        const data = await response.json();
        if (data.success) {
          setPerformanceStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching performance stats:', error);
      }
    };

    fetchPerformanceStats();
    const interval = setInterval(fetchPerformanceStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/admin/user')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch rate limits
      const rateLimitResponse = await fetch('/api/rate-limits')
      const rateLimits = await rateLimitResponse.json()
      
      // Fetch basic stats (you can expand this later)
      const statsResponse = await fetch('/api/articles')
      const articlesData = await statsResponse.json()
      
      // Fetch ingestion logs
      const logsResponse = await fetch('/api/admin/ingestion-logs?limit=10')
      const logsData = await logsResponse.json()
      const ingestionLogs = logsData.success ? logsData.logs : []
      
      // Get last ingestion time from the most recent log
      const lastIngestion = ingestionLogs.length > 0 ? ingestionLogs[0].timestamp : null
      
      setStats({
        totalArticles: articlesData.total || 0,
        totalSources: 6, // Hardcoded for now based on RSS_FEEDS
        lastIngestion: lastIngestion || new Date().toISOString(), // Use latest log or current time
        rateLimits,
        ingestionLogs
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load system stats')
    } finally {
      setLoading(false)
    }
  }

  const handleIngestContent = async () => {
    try {
      setIngesting(true)
      toast.loading('Ingesting new content...', { id: 'ingest' })
      
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to ingest content')
      }
      
      const result = await response.json()
      toast.success(`Successfully processed ${result.processedCount} new articles!`, { id: 'ingest' })
      
      // Refresh stats
      await fetchStats()
    } catch (error) {
      console.error('Error ingesting content:', error)
      toast.error('Failed to ingest content. Please try again.', { id: 'ingest' })
    } finally {
      setIngesting(false)
    }
  }

  const handleRefreshStats = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
    toast.success('Stats refreshed!')
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Logged out successfully')
        router.push('/admin/login')
      } else {
        toast.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <User className="w-4 h-4" />
                  <span>Welcome, {user.username}</span>
                </div>
              )}
              <button 
                onClick={handleRefreshStats}
                disabled={refreshing}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
              <a href="/" className="btn-outline">
                Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Monitoring Section */}
        {performanceStats && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceStats.ai && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">AI Processing</h3>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">{performanceStats.ai.successRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-sm text-gray-600">Avg: {performanceStats.ai.avgDuration.toFixed(0)}ms</p>
                  </div>
                </div>
              )}
              
              {performanceStats.images && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Image Fetching</h3>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">{performanceStats.images.successRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-sm text-gray-600">Avg: {performanceStats.images.avgDuration.toFixed(0)}ms</p>
                  </div>
                </div>
              )}
              
              {performanceStats.database && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Database Operations</h3>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">{performanceStats.database.successRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-sm text-gray-600">Avg: {performanceStats.database.avgDuration.toFixed(0)}ms</p>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Recent Errors</h3>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">{performanceStats.recentErrors?.length || 0}</p>
                  <p className="text-sm text-gray-600">Last 5 Errors</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/articles')}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Articles</p>
                <p className="text-2xl font-bold text-secondary-900">{stats?.totalArticles}</p>
                <p className="text-xs text-secondary-500 mt-1">Click to view all articles</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">RSS Sources</p>
                <p className="text-2xl font-bold text-secondary-900">{stats?.totalSources}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Mistral API</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats?.rateLimits.mistral.remaining}/{stats?.rateLimits.mistral.maxRequests}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">OpenAI API</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats?.rateLimits.openai.remaining}/{stats?.rateLimits.openai.maxRequests}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Ingestion Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">Content Ingestion</h2>
            <div className="text-sm text-secondary-600">
              Last ingestion: {stats?.lastIngestion ? new Date(stats.lastIngestion).toLocaleString() : 'Never'}
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-secondary-600">
              Manually trigger content ingestion from RSS feeds. This will fetch new articles and process them with AI.
            </p>
            
            <button 
              onClick={handleIngestContent}
              disabled={ingesting}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${ingesting ? 'animate-spin' : ''}`} />
              <span>{ingesting ? 'Ingesting Content...' : 'Ingest New Content'}</span>
            </button>

            {/* Ingestion Log */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Ingestion Runs</h3>
              
              {stats?.ingestionLogs && stats.ingestionLogs.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {stats.ingestionLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' :
                          log.status === 'error' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{log.message}</p>
                          <p className="text-xs text-secondary-600">
                            {new Date(log.timestamp).toLocaleString()} • 
                            {log.processedCount} processed • 
                            {log.errorCount} errors • 
                            {log.duration}ms
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-secondary-500">
                        {log.status === 'success' ? '✓ Success' :
                         log.status === 'error' ? '✗ Error' :
                         '⚠ Partial'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <p>No ingestion runs recorded yet.</p>
                  <p className="text-sm">Run your first ingestion to see logs here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rate Limits Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">API Rate Limits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-900">Mistral AI</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Remaining Requests:</span>
                  <span className="font-medium">{stats?.rateLimits.mistral.remaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Max Requests:</span>
                  <span className="font-medium">{stats?.rateLimits.mistral.maxRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Time Until Reset:</span>
                  <span className="font-medium">
                    {stats?.rateLimits.mistral.timeUntilReset ? 
                      `${Math.ceil(stats.rateLimits.mistral.timeUntilReset / 1000)}s` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-900">OpenAI</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Remaining Requests:</span>
                  <span className="font-medium">{stats?.rateLimits.openai.remaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Max Requests:</span>
                  <span className="font-medium">{stats?.rateLimits.openai.maxRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Time Until Reset:</span>
                  <span className="font-medium">
                    {stats?.rateLimits.openai.timeUntilReset ? 
                      `${Math.ceil(stats.rateLimits.openai.timeUntilReset / 1000)}s` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 