'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Bookmark, Heart, Share2, ExternalLink, Mail, TrendingUp, Tag, Settings } from 'lucide-react'
import { Article, SearchFilters, SortOption } from '../types'
import { mockArticles } from '../data/mockArticles'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: 'all', name: 'All', color: 'bg-secondary-100 text-secondary-800' },
    { id: 'tech', name: 'Tech', color: 'bg-blue-100 text-blue-800' },
    { id: 'finance', name: 'Finance', color: 'bg-green-100 text-green-800' },
    { id: 'business', name: 'Business', color: 'bg-purple-100 text-purple-800' },
    { id: 'lifestyle', name: 'Lifestyle', color: 'bg-pink-100 text-pink-800' },
    { id: 'deals', name: 'Deals', color: 'bg-orange-100 text-orange-800' },
    { id: 'news', name: 'News', color: 'bg-red-100 text-red-800' },
  ]

  useEffect(() => {
    fetchArticles()
  }, [filters, sortBy])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.source) params.append('source', filters.source)
      params.append('sort', sortBy === 'newest' ? 'created_at' : 'likes_count')
      params.append('order', 'desc')
      
      const response = await fetch(`/api/articles?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
      // Fallback to mock data if API fails
      setArticles(mockArticles)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async (articleId: string) => {
    try {
      // For demo purposes, we'll just show a toast
      // In a real app, you'd check if user is logged in and call db.toggleBookmark
      toast.success('Article bookmarked!')
    } catch (error) {
      toast.error('Failed to bookmark article')
    }
  }

  const handleLike = async (articleId: string) => {
    try {
      // For demo purposes, we'll just show a toast
      // In a real app, you'd check if user is logged in and call db.toggleLike
      toast.success('Article liked!')
    } catch (error) {
      toast.error('Failed to like article')
    }
  }

  const handleShare = (article: Article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.affiliate_url || article.url,
      })
    } else {
      navigator.clipboard.writeText(article.affiliate_url || article.url)
      toast.success('Link copied to clipboard!')
    }
  }

  const getAffiliateProgram = (url: string): string => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      if (domain.includes('amazon.com') || domain.includes('amazon.co.uk')) {
        return 'Amazon';
      }
      
      if (domain.includes('skimresources.com')) {
        return 'Skimlinks';
      }
      
      if (urlObj.searchParams.has('tag') || urlObj.searchParams.has('linkCode')) {
        return 'Affiliate';
      }
      
      return '';
    } catch (error) {
      return '';
    }
  }

  const filteredArticles = articles.filter(article => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    if (selectedCategory !== 'all') {
      return article.category === selectedCategory
    }
    return true
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">ContentFeed</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="btn-outline flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles, tags, or sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? category.color
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-field w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            <div className="text-sm text-secondary-600">
              {filteredArticles.length} articles found
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="article-card animate-pulse">
                <div className="w-full h-48 bg-secondary-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No articles found</h3>
            <p className="text-secondary-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block">
                <article className="article-card hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={article.image_url || 'https://via.placeholder.com/400x200'}
                    alt={article.title}
                    className="article-image"
                  />
                  <div className="article-content">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`badge badge-${article.category === 'tech' ? 'primary' : 'secondary'}`}>
                          {article.category}
                        </span>
                        {article.affiliate_url && article.affiliate_url !== article.url && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{getAffiliateProgram(article.affiliate_url)}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-secondary-500">{article.source}</span>
                    </div>
                    
                    <h2 className="article-title hover:text-primary-600 transition-colors">
                      {article.title}
                    </h2>
                    
                    <p className="article-summary">{article.summary}</p>
                    
                    <div className="flex flex-wrap mb-4">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="article-meta">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleLike(article.id)
                          }}
                          className="flex items-center space-x-1 text-secondary-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{article.likes_count}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleBookmark(article.id)
                          }}
                          className="flex items-center space-x-1 text-secondary-500 hover:text-primary-500 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                          <span>{article.bookmarks_count}</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleShare(article)
                          }}
                          className="text-secondary-500 hover:text-secondary-700 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        
                        <span className="text-secondary-500 hover:text-primary-600 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 