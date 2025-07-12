import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import BackButton from './components/BackButton'

export const metadata: Metadata = {
  title: 'Page Not Found - ContentFeed',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-red-600">404</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-secondary-600 mb-8">
            The page you are looking for could not be found. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Link>
          
          <BackButton />
        </div>
      </div>
    </div>
  )
} 