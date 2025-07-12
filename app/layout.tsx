import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'ContentFeed - AI-Powered Affiliate Content',
  description: 'Discover curated content with AI-powered summaries and affiliate tracking.',
  keywords: 'content, AI, affiliate, tech, finance, lifestyle, news',
  authors: [{ name: 'ContentFeed Team' }],
  robots: 'index, follow',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ContentFeed - AI-Powered Affiliate Content',
    description: 'Discover curated content with AI-powered summaries and affiliate tracking.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContentFeed - AI-Powered Affiliate Content',
    description: 'Discover curated content with AI-powered summaries and affiliate tracking.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://via.placeholder.com" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
} 