/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    domains: [
      'images.unsplash.com', 
      'via.placeholder.com', 
      'picsum.photos', 
      'platform.theverge.com',
      'techcrunch.com',
      'www.theverge.com',
      'www.cnbc.com',
      'feeds.bbci.co.uk',
      'lifehacker.com',
      'news.ycombinator.com',
      'www.engadget.com',
      'cdn.vox-cdn.com',
      'www.bbc.com',
      'ichef.bbci.co.uk',
      'media.wired.com',
      'www.wired.com',
      'cdn.arstechnica.net',
      'arstechnica.com',
      'www.zdnet.com',
      'zdnet.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 