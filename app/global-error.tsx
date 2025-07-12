'use client'

import type { Metadata } from 'next'
import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RefreshCw, AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Something went wrong!
              </h1>
              <p className="text-secondary-600 mb-8">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-secondary-600 hover:text-secondary-800">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-secondary-100 rounded text-xs text-secondary-800 overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
} 