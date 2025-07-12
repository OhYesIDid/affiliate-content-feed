import Link from 'next/link'
import { TrendingUp, Mail, Twitter, Facebook, Instagram, Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-secondary-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900">PriceSlashPal</h3>
                <p className="text-sm text-secondary-600">Smart Deals & Savings Discovery</p>
              </div>
            </div>
            <p className="text-secondary-600 mb-4 max-w-md">
              Discover the best deals, discounts, and money-saving opportunities with AI-powered content curation. 
              Save money on tech, finance, lifestyle, and more.
            </p>
            <div className="flex items-center space-x-4">
              <button className="btn-outline flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Subscribe to Deals</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/?category=tech" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Tech Deals
                </Link>
              </li>
              <li>
                <Link href="/?category=finance" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Finance
                </Link>
              </li>
              <li>
                <Link href="/?category=lifestyle" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/?category=deals" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Hot Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-900 mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/?category=business" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/?category=news" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Deal News
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-secondary-600">
              <span>© {currentYear} PriceSlashPal. Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for smart shoppers.</span>
            </div>

            {/* Social Links & Legal */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <a
                  href="https://twitter.com/priceslashpal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-600 hover:text-blue-500 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/priceslashpal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-600 hover:text-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/priceslashpal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-600 hover:text-pink-500 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-secondary-600">
                <Link href="/privacy" className="hover:text-secondary-900 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-secondary-900 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/affiliate-disclosure" className="hover:text-secondary-900 transition-colors">
                  Affiliate Disclosure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 