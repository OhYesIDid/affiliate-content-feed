import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ContentFeed - AI-Powered Affiliate Content',
  description: 'Discover curated content with AI-powered summaries and affiliate tracking.',
  keywords: 'content, AI, affiliate, tech, finance, lifestyle, news',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
          {children}
          <Toaster position="top-right" />
        </div>
        <Analytics />
      </body>
    </html>
  )
} 