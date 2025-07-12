import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import Footer from './components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'PriceSlashPal - Smart Deals & Savings Discovery',
  description: 'Discover the best deals, discounts, and money-saving opportunities with AI-powered content curation.',
  keywords: 'deals, discounts, savings, affiliate, tech, finance, lifestyle, shopping',
  authors: [{ name: 'PriceSlashPal Team' }],
  robots: 'index, follow',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'PriceSlashPal - Smart Deals & Savings Discovery',
    description: 'Discover the best deals, discounts, and money-saving opportunities with AI-powered content curation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PriceSlashPal - Smart Deals & Savings Discovery',
    description: 'Discover the best deals, discounts, and money-saving opportunities with AI-powered content curation.',
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
        <Footer />
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
} 