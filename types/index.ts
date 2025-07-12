export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  affiliate_url?: string;
  image_url?: string;
  source: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
  likes_count: number;
  bookmarks_count: number;
  ai_summary?: string;
  ai_rewrite?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  digest_subscription: boolean;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface DigestSubscription {
  id: string;
  email: string;
  frequency: 'weekly' | 'daily';
  created_at: string;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  source?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

export type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'; 