'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Calendar, Globe, FileText, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Article {
  id: string
  title: string
  source: string
  created_at: string
  url: string
  category?: string
  tags?: string[]
  isOnHomepage?: boolean
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    // Filter articles based on search term
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.category && article.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredArticles(filtered)
  }, [searchTerm, articles])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles?limit=1000') // Get all articles
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      const data = await response.json()
      
      // Mark articles that would appear on homepage (first 12 by created_at desc)
      const articlesWithHomepageStatus = data.articles.map((article: Article, index: number) => ({
        ...article,
        isOnHomepage: index < 12
      }))
      
      setArticles(articlesWithHomepageStatus)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleArticleClick = (article: Article) => {
    // Open article in new tab
    window.open(article.url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading articles...</p>
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
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">All Articles</h1>
                <p className="text-sm text-secondary-600">{filteredArticles.length} articles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search articles by title, source, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Homepage
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="max-w-sm">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                          {article.title}
                        </p>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600">
                                +{article.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-secondary-400 mr-1" />
                        <span className="text-sm text-secondary-900">{article.source}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {article.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {article.category}
                        </span>
                      ) : (
                        <span className="text-sm text-secondary-500">-</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-secondary-400 mr-1" />
                        <span className="text-sm text-secondary-900">
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {article.isOnHomepage ? (
                        <div className="flex items-center">
                          <Home className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-700 font-medium">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Home className="w-4 h-4 text-secondary-400 mr-1" />
                          <span className="text-sm text-secondary-500">No</span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <button
                        onClick={() => handleArticleClick(article)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        View Article
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">No articles found</p>
          </div>
        )}
      </div>
    </div>
  )
} 