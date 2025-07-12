'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, Database, Activity, Settings, BarChart3, Users, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

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
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch rate limits
      const rateLimitResponse = await fetch('/api/rate-limits')
      const rateLimits = await rateLimitResponse.json()
      
      // Fetch basic stats (you can expand this later)
      const statsResponse = await fetch('/api/articles')
      const articlesData = await statsResponse.json()
      
      setStats({
        totalArticles: articlesData.articles?.length || 0,
        totalSources: 6, // Hardcoded for now based on RSS_FEEDS
        lastIngestion: new Date().toISOString(), // You can store this in DB later
        rateLimits
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
              <button 
                onClick={handleRefreshStats}
                disabled={refreshing}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <a href="/" className="btn-secondary">
                Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Articles</p>
                <p className="text-2xl font-bold text-secondary-900">{stats?.totalArticles}</p>
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