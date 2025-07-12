'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, Scale, Shield, Users } from 'lucide-react'
import Header from '../components/Header'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header backLinkText="Back to Home" />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg text-gray-600 mb-8">
                Welcome to PriceSlashPal. By accessing and using our website, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-green-600" />
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600">
                  By accessing and using PriceSlashPal, you accept and agree to be bound by the terms and provision of this agreement. 
                  Additionally, when using this website's particular services, you shall be subject to any posted guidelines or rules 
                  applicable to such services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-green-600" />
                  Use License
                </h2>
                <p className="mb-4 text-gray-600">
                  Permission is granted to temporarily download one copy of the materials (information or software) on PriceSlashPal 
                  for personal, non-commercial transitory viewing only.
                </p>
                <p className="mb-4 text-gray-600">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                  <li>Attempt to decompile or reverse engineer any software contained on PriceSlashPal</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Scale className="w-6 h-6 mr-2 text-green-600" />
                  Affiliate Disclosure and Relationships
                </h2>
                <p className="mb-4 text-gray-600">
                  PriceSlashPal participates in various affiliate marketing programs, which means we may earn commissions 
                  from qualifying purchases made through links on our website.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Affiliate Links</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>We may include affiliate links in our content</li>
                      <li>These links help support our website at no additional cost to you</li>
                      <li>We only recommend products and services we believe in</li>
                      <li>Prices and availability may vary from time to time</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Additional Cost</h3>
                    <p className="text-gray-600">
                      Using our affiliate links does not increase the price you pay for products or services. 
                      The commission we earn comes from the retailer, not from you.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-green-600" />
                  Disclaimer
                </h2>
                <p className="mb-4 text-gray-600">
                  The materials on PriceSlashPal are provided on an 'as is' basis. PriceSlashPal makes no warranties, 
                  expressed or implied, and hereby disclaims and negates all other warranties including without limitation, 
                  implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                  of intellectual property or other violation of rights.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Content Accuracy</h3>
                    <p className="text-gray-600">
                      While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy, 
                      completeness, or timeliness of any information on our website. Prices, availability, and deals may 
                      change without notice.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Third-Party Content</h3>
                    <p className="text-gray-600">
                      Our website may contain links to third-party websites. We are not responsible for the content, 
                      privacy policies, or practices of any third-party websites.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitations</h2>
                <p className="mb-4 text-gray-600">
                  In no event shall PriceSlashPal or its suppliers be liable for any damages (including, without limitation, 
                  damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                  to use the materials on PriceSlashPal, even if PriceSlashPal or a PriceSlashPal authorized representative 
                  has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Conduct</h2>
                <p className="mb-4 text-gray-600">When using our website, you agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Use the website for any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>Violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability</li>
                  <li>Submit false or misleading information</li>
                  <li>Upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the website</li>
                  <li>Collect or track the personal information of others</li>
                  <li>Spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
                <p className="text-gray-600">
                  The content on PriceSlashPal, including but not limited to text, graphics, images, logos, and software, 
                  is the property of PriceSlashPal or its content suppliers and is protected by copyright and other 
                  intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
                <p className="text-gray-600">
                  We may terminate or suspend your access immediately, without prior notice or liability, for any reason 
                  whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-600">
                  These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to 
                  its conflict of law provisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-600">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will try to provide at least 30 days notice prior to any new terms 
                  taking effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@priceslashpal.com<br />
                    <strong>Address:</strong> [Your Business Address]<br />
                    <strong>Website:</strong> https://priceslashpal.com
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 