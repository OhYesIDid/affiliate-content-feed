'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, RotateCcw, Plus, X, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface FilterConfig {
  MIN_TITLE_LENGTH: number
  MAX_TITLE_LENGTH: number
  EXCLUDE_KEYWORDS: string[]
  INCLUDE_KEYWORDS: string[]
  MAX_AGE_HOURS: number
  SPAM_INDICATORS: string[]
}

export default function FilterConfigPage() {
  const [config, setConfig] = useState<FilterConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const router = useRouter()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/filter-config')
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.config)
      } else {
        toast.error('Failed to load filter configuration')
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Failed to load filter configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/filter-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Filter configuration saved successfully')
      } else {
        toast.error(data.error || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/filter-config', {
        method: 'PUT',
      })

      const data = await response.json()
      
      if (data.success) {
        setConfig(data.config)
        toast.success('Filter configuration reset to defaults')
      } else {
        toast.error(data.error || 'Failed to reset configuration')
      }
    } catch (error) {
      console.error('Error resetting config:', error)
      toast.error('Failed to reset configuration')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (updates: Partial<FilterConfig>) => {
    if (!config) return
    setConfig({ ...config, ...updates })
  }

  const addKeyword = (type: 'EXCLUDE_KEYWORDS' | 'INCLUDE_KEYWORDS', keyword: string) => {
    if (!config || !keyword.trim()) return
    const newKeywords = [...config[type], keyword.trim()]
    updateConfig({ [type]: newKeywords })
  }

  const removeKeyword = (type: 'EXCLUDE_KEYWORDS' | 'INCLUDE_KEYWORDS', index: number) => {
    if (!config) return
    const newKeywords = config[type].filter((_, i) => i !== index)
    updateConfig({ [type]: newKeywords })
  }

  const addSpamIndicator = (pattern: string) => {
    if (!config || !pattern.trim()) return
    const newPatterns = [...config.SPAM_INDICATORS, pattern.trim()]
    updateConfig({ SPAM_INDICATORS: newPatterns })
  }

  const removeSpamIndicator = (index: number) => {
    if (!config) return
    const newPatterns = config.SPAM_INDICATORS.filter((_, i) => i !== index)
    updateConfig({ SPAM_INDICATORS: newPatterns })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading filter configuration...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600">Failed to load configuration</p>
          <button onClick={fetchConfig} className="btn-primary mt-4">Retry</button>
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
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900">Filter Configuration</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                disabled={saving}
                className="btn-outline flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'general', label: 'General Settings' },
              { id: 'keywords', label: 'Keyword Filters' },
              { id: 'spam', label: 'Spam Detection' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Title Length Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Minimum Title Length
                  </label>
                  <input
                    type="number"
                    value={config.MIN_TITLE_LENGTH}
                    onChange={(e) => updateConfig({ MIN_TITLE_LENGTH: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                  <p className="text-xs text-secondary-500 mt-1">Articles with shorter titles will be skipped</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Maximum Title Length
                  </label>
                  <input
                    type="number"
                    value={config.MAX_TITLE_LENGTH}
                    onChange={(e) => updateConfig({ MAX_TITLE_LENGTH: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                  <p className="text-xs text-secondary-500 mt-1">Articles with longer titles will be skipped</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Time-Based Filters</h3>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Maximum Article Age (hours)
                </label>
                <input
                  type="number"
                  value={config.MAX_AGE_HOURS}
                  onChange={(e) => updateConfig({ MAX_AGE_HOURS: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                />
                <p className="text-xs text-secondary-500 mt-1">Articles older than this will be skipped</p>
              </div>
            </div>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Exclude Keywords</h3>
              <p className="text-sm text-secondary-600 mb-4">
                Articles containing these keywords will be skipped (case-insensitive)
              </p>
              <KeywordList
                keywords={config.EXCLUDE_KEYWORDS}
                onAdd={(keyword) => addKeyword('EXCLUDE_KEYWORDS', keyword)}
                onRemove={(index) => removeKeyword('EXCLUDE_KEYWORDS', index)}
                placeholder="e.g., sponsored, advertisement"
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Include Keywords</h3>
              <p className="text-sm text-secondary-600 mb-4">
                Articles must contain at least one of these keywords to be processed (case-insensitive)
              </p>
              <KeywordList
                keywords={config.INCLUDE_KEYWORDS}
                onAdd={(keyword) => addKeyword('INCLUDE_KEYWORDS', keyword)}
                onRemove={(index) => removeKeyword('INCLUDE_KEYWORDS', index)}
                placeholder="e.g., how to, guide, tips"
              />
            </div>
          </div>
        )}

        {/* Spam Detection Tab */}
        {activeTab === 'spam' && (
          <div className="card">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Spam Detection Patterns</h3>
            <p className="text-sm text-secondary-600 mb-4">
              Regular expressions to detect spam/clickbait titles
            </p>
            <SpamPatternList
              patterns={config.SPAM_INDICATORS}
              onAdd={addSpamIndicator}
              onRemove={removeSpamIndicator}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Keyword List Component
function KeywordList({ 
  keywords, 
  onAdd, 
  onRemove, 
  placeholder 
}: { 
  keywords: string[]
  onAdd: (keyword: string) => void
  onRemove: (index: number) => void
  placeholder: string
}) {
  const [newKeyword, setNewKeyword] = useState('')

  const handleAdd = () => {
    if (newKeyword.trim()) {
      onAdd(newKeyword)
      setNewKeyword('')
    }
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>
      
      <div className="space-y-2">
        {keywords.map((keyword, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded border">
            <span className="text-sm">{keyword}</span>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {keywords.length === 0 && (
          <p className="text-sm text-secondary-500 italic">No keywords added yet</p>
        )}
      </div>
    </div>
  )
}

// Spam Pattern List Component
function SpamPatternList({ 
  patterns, 
  onAdd, 
  onRemove 
}: { 
  patterns: string[]
  onAdd: (pattern: string) => void
  onRemove: (index: number) => void
}) {
  const [newPattern, setNewPattern] = useState('')

  const handleAdd = () => {
    if (newPattern.trim()) {
      onAdd(newPattern)
      setNewPattern('')
    }
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newPattern}
          onChange={(e) => setNewPattern(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g., [A-Z]{5,} (5+ consecutive caps)"
          className="input-field flex-1"
        />
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pattern</span>
        </button>
      </div>
      
      <div className="space-y-2">
        {patterns.map((pattern, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded border">
            <code className="text-sm font-mono">{pattern}</code>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {patterns.length === 0 && (
          <p className="text-sm text-secondary-500 italic">No patterns added yet</p>
        )}
      </div>
    </div>
  )
} 