'use client'

import Link from 'next/link'
import { ArrowLeft, DollarSign, Users, Eye, AlertCircle, CheckCircle, Info } from 'lucide-react'
import Header from '../components/Header'

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header backLinkText="Back to Home" />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Affiliate Disclosure</h1>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Transparency Commitment</h3>
                    <p className="text-blue-800">
                      At PriceSlashPal, we believe in complete transparency. This page explains how we earn money 
                      through affiliate partnerships and how it affects your experience on our website.
                    </p>
                  </div>
                </div>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-purple-600" />
                  What Are Affiliate Links?
                </h2>
                <p className="mb-4 text-gray-600">
                  Affiliate links are special URLs that allow us to earn a small commission when you make a purchase 
                  through our recommendations. These links help support our website and allow us to continue providing 
                  valuable content to our readers.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">No Extra Cost to You</h4>
                    </div>
                    <p className="text-green-800 text-sm">
                      Using our affiliate links doesn't increase the price you pay. The commission comes from the retailer's 
                      marketing budget, not your pocket.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Same Great Deals</h4>
                    </div>
                    <p className="text-blue-800 text-sm">
                      You get the same prices, discounts, and offers whether you use our links or go directly to the retailer.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-purple-600" />
                  How We Use Affiliate Links
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Product Recommendations</h3>
                    <p className="text-gray-600">
                      When we recommend products or services, we may include affiliate links. These recommendations 
                      are based on our research, analysis, and genuine belief that the product offers value to our readers.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Deal Discovery</h3>
                    <p className="text-gray-600">
                      We actively search for and curate the best deals and discounts. When we find great offers, 
                      we share them with you using affiliate links when available.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Content Creation</h3>
                    <p className="text-gray-600">
                      The revenue from affiliate links helps us create more content, improve our website, and continue 
                      providing valuable money-saving information.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-purple-600" />
                  Our Affiliate Partners
                </h2>
                <p className="mb-4 text-gray-600">
                  We work with various affiliate networks and individual retailers. Some of our major partners include:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Amazon Associates</h4>
                    <p className="text-gray-600 text-sm">
                      We participate in the Amazon Services LLC Associates Program, earning from qualifying purchases.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Skimlinks</h4>
                    <p className="text-gray-600 text-sm">
                      We use Skimlinks to automatically convert regular links to affiliate links where applicable.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Direct Partnerships</h4>
                    <p className="text-gray-600 text-sm">
                      We have direct affiliate relationships with various retailers and service providers.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Other Networks</h4>
                    <p className="text-gray-600 text-sm">
                      We may work with additional affiliate networks and programs as opportunities arise.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Commission Structure</h2>
                <p className="mb-4 text-gray-600">
                  Commission rates vary by retailer and product category. Typical commission rates range from 1% to 15% 
                  of the purchase price, depending on the retailer and product type.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Example Commission Scenarios:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Electronics: 1-4% commission</li>
                    <li>• Fashion & Apparel: 3-8% commission</li>
                    <li>• Home & Garden: 2-6% commission</li>
                    <li>• Digital Products: 5-15% commission</li>
                    <li>• Services: 5-20% commission</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment to You</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Honest Recommendations</h4>
                      <p className="text-gray-600">
                        We only recommend products and services we genuinely believe in. Our reviews and recommendations 
                        are based on research and analysis, not commission rates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Transparent Disclosure</h4>
                      <p className="text-gray-600">
                        We clearly disclose our affiliate relationships and provide this detailed disclosure page 
                        for complete transparency.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">No Pressure to Buy</h4>
                      <p className="text-gray-600">
                        We provide information and recommendations, but the decision to purchase is always yours. 
                        You can always shop directly with retailers if you prefer.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Quality Content First</h4>
                      <p className="text-gray-600">
                        Our primary goal is to provide valuable, accurate information. Affiliate revenue helps us 
                        maintain and improve our content, but it doesn't drive our editorial decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Identify Affiliate Links</h2>
                <p className="mb-4 text-gray-600">
                  While we strive to be transparent, here are some ways to identify affiliate links on our website:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Links that redirect through affiliate networks (you may see a brief redirect)</li>
                  <li>URLs that contain affiliate tracking parameters</li>
                  <li>Links that are clearly marked as affiliate links</li>
                  <li>Product recommendation sections that mention affiliate relationships</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">You Can:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>Use our affiliate links to support our work</li>
                      <li>Shop directly with retailers if you prefer</li>
                      <li>Contact us with questions about our affiliate relationships</li>
                      <li>Opt out of affiliate tracking through your browser settings</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">We Promise:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>To always be transparent about our affiliate relationships</li>
                      <li>To provide honest, unbiased recommendations</li>
                      <li>To never let affiliate commissions influence our content</li>
                      <li>To answer any questions you have about our practices</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions or Concerns?</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about our affiliate disclosure or practices, we're here to help. 
                  Please don't hesitate to reach out to us.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-700">
                    <strong>Email:</strong> affiliate@priceslashpal.com<br />
                    <strong>Subject:</strong> Affiliate Disclosure Question<br />
                    <strong>Response Time:</strong> Within 24-48 hours
                  </p>
                </div>
              </section>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">Legal Disclaimer</h3>
                    <p className="text-yellow-800">
                      This disclosure is provided for informational purposes only and does not constitute legal advice. 
                      For specific legal questions about affiliate marketing or disclosure requirements, please consult 
                      with a qualified attorney in your jurisdiction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 