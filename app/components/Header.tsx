'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Mail, ArrowLeft } from 'lucide-react'

interface HeaderProps {
  showBackLink?: boolean
  backLinkText?: string
  backLinkHref?: string
  showSubscribe?: boolean
  showActions?: boolean
  children?: React.ReactNode
}

export default function Header({ 
  showBackLink = true, 
  backLinkText = "Back to Articles", 
  backLinkHref = "/",
  showSubscribe = true,
  showActions = false,
  children 
}: HeaderProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  
  // Don't show back link on homepage
  const shouldShowBackLink = showBackLink && !isHomePage

  return (
    <>
      {/* Main Header - Always shows branding */}
      <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-14 h-14 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 20L12 16L16 18L24 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 10L20 14L16 12L8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">PriceSlashPal</h1>
                <p className="text-sm text-secondary-600">Smart Deals & Savings Discovery</p>
              </div>
            </div>
            
            {/* Right side - Actions or Subscribe */}
            <div className="flex items-center space-x-4">
              {children}
              {showSubscribe && (
                <button className="btn-outline flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Subscribe</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation - Shows back link and page-specific actions */}
      {shouldShowBackLink && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <Link href={backLinkHref} className="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{backLinkText}</span>
              </Link>
              <div className="flex items-center space-x-4">
                {/* Additional page-specific actions can go here */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 