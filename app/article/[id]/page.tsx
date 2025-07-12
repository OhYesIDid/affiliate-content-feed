'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, Bookmark, Share2, ExternalLink, ShoppingCart, Tag } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  summary: string
  content: string
  url: string
  affiliate_url: string
  image_url: string
  source: string
  category: string
  tags: string[]
  likes_count: number
  created_at: string
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setArticle(data)
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  const handleLike = async () => {
    if (!article) return
    
    try {
      const response = await fetch(`/api/articles/${article.id}/like`, {
        method: 'POST'
      })
      if (response.ok) {
        setLiked(!liked)
        setArticle(prev => prev ? { ...prev, likes_count: prev.likes_count + (liked ? -1 : 1) } : null)
      }
    } catch (error) {
      console.error('Error liking article:', error)
    }
  }

  const handleBookmark = async () => {
    if (!article) return
    
    try {
      const response = await fetch(`/api/articles/${article.id}/bookmark`, {
        method: 'POST'
      })
      if (response.ok) {
        setBookmarked(!bookmarked)
      }
    } catch (error) {
      console.error('Error bookmarking article:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  const handleAffiliateClick = async (affiliateUrl: string) => {
    if (!article) return;
    
    try {
      // Track the affiliate click
      await fetch('/api/analytics/affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          originalUrl: article.url,
          affiliateUrl: affiliateUrl,
          timestamp: new Date().toISOString()
        })
      });
      
      // Open affiliate link in new tab
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      // Still open the link even if tracking fails
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  }

  const getAffiliateProgram = (url: string): string => {
    if (!url) return 'Direct';
    
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
      
      return 'Direct';
    } catch (error) {
      return 'Direct';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Articles
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  liked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{article.likes_count}</span>
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  bookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Article Header */}
          <div className="p-8 border-b">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {article.category}
              </span>
              <span>•</span>
              <span>{article.source}</span>
              <span>•</span>
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              {article.summary}
            </p>
          </div>

          {/* Article Image */}
          {article.image_url && (
            <div className="relative">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Affiliate Link Section */}
            {article.affiliate_url && article.affiliate_url !== article.url && (
              <div className="mt-8 pt-8 border-t">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Support Our Site</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {getAffiliateProgram(article.affiliate_url)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    When you purchase through our affiliate links, you support our content at no extra cost to you.
                  </p>
                  <button
                    onClick={() => handleAffiliateClick(article.affiliate_url)}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium w-full sm:w-auto"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Shop with Affiliate Link</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Read Original Article</span>
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Article</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
} 