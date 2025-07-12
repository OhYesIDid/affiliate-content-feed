'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Cookie, Database, Users } from 'lucide-react'
import Header from '../components/Header'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header backLinkText="Back to Home" />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg text-gray-600 mb-8">
                At PriceSlashPal, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-blue-600" />
                  Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Information You Provide</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>Email address (if you subscribe to our newsletter)</li>
                      <li>Comments or feedback you submit</li>
                      <li>Information you provide when contacting us</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>IP address and browser information</li>
                      <li>Pages visited and time spent on our site</li>
                      <li>Device information and operating system</li>
                      <li>Referral source and search terms</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Cookie className="w-6 h-6 mr-2 text-blue-600" />
                  How We Use Cookies
                </h2>
                <p className="mb-4 text-gray-600">
                  We use cookies and similar technologies to enhance your browsing experience and analyze site traffic.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                    <p className="text-gray-600">Required for basic site functionality and security.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                    <p className="text-gray-600">Help us understand how visitors use our site to improve performance.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Affiliate Cookies</h4>
                    <p className="text-gray-600">Track affiliate link clicks to ensure proper commission attribution.</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-2 text-blue-600" />
                  How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Provide and maintain our website services</li>
                  <li>Send you newsletters and promotional content (with your consent)</li>
                  <li>Track affiliate link performance and commissions</li>
                  <li>Analyze site usage to improve user experience</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Information Sharing
                </h2>
                <p className="mb-4 text-gray-600">
                  We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li><strong>Affiliate Partners:</strong> When you click affiliate links, we may share limited information for commission tracking</li>
                  <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our website</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                <p className="mb-4 text-gray-600">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Control cookie preferences through your browser settings</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-600">
                  Our website is not intended for children under 13 years of age. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe your child has provided 
                  us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                  new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@priceslashpal.com<br />
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