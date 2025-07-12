'use client'

import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center justify-center w-full px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Go Back
    </button>
  )
} 