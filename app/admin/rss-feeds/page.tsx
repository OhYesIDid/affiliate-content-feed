"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  source: string;
  active: boolean;
  last_fetched: string | null;
  created_at: string;
}

export default function AdminRSSFeedsPage() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/rss-feeds');
      const data = await response.json();
      if (data.success) {
        setFeeds(data.feeds);
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-600" />
            </button>
            <h1 className="text-2xl font-bold text-secondary-900">RSS Feeds</h1>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">All RSS Feeds</h2>
          {loading ? (
            <div className="text-secondary-600">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">URL</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Active</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Last Fetched</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {feeds.map(feed => (
                    <tr key={feed.id}>
                      <td className="px-4 py-2 font-medium text-secondary-900">{feed.name}</td>
                      <td className="px-4 py-2 text-blue-600 underline break-all"><a href={feed.url} target="_blank" rel="noopener noreferrer">{feed.url}</a></td>
                      <td className="px-4 py-2">{feed.category}</td>
                      <td className="px-4 py-2">{feed.source}</td>
                      <td className="px-4 py-2">{feed.active ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2">{feed.last_fetched ? new Date(feed.last_fetched).toLocaleString() : '-'}</td>
                      <td className="px-4 py-2">{new Date(feed.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {feeds.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-secondary-500">No RSS feeds found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 