import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  ARTICLES: 'articles',
  USERS: 'users',
  BOOKMARKS: 'bookmarks',
  LIKES: 'likes',
  DIGEST_SUBSCRIPTIONS: 'digest_subscriptions',
  RSS_FEEDS: 'rss_feeds',
  INGESTION_LOGS: 'content_ingestion_logs',
} as const;

// Helper functions for database operations
export const db = {
  // Articles
  async getArticles(filters?: any, sort: string = 'created_at', order: 'desc' | 'asc' = 'desc') {
    let query = supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .order(sort, { ascending: order === 'asc' });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.url) {
      query = query.eq('url', filters.url);
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getArticle(id: string) {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createArticle(article: any) {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .insert(article)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateArticle(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.ARTICLES)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Bookmarks
  async getBookmarks(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.BOOKMARKS)
      .select(`
        *,
        articles (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async toggleBookmark(userId: string, articleId: string) {
    // Check if bookmark exists
    const { data: existing } = await supabase
      .from(TABLES.BOOKMARKS)
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from(TABLES.BOOKMARKS)
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return false; // Bookmark removed
    } else {
      // Add bookmark
      const { error } = await supabase
        .from(TABLES.BOOKMARKS)
        .insert({ user_id: userId, article_id: articleId });
      
      if (error) throw error;
      return true; // Bookmark added
    }
  },

  // Likes
  async toggleLike(userId: string, articleId: string) {
    // Check if like exists
    const { data: existing } = await supabase
      .from(TABLES.LIKES)
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();

    if (existing) {
      // Remove like
      const { error } = await supabase
        .from(TABLES.LIKES)
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return false; // Like removed
    } else {
      // Add like
      const { error } = await supabase
        .from(TABLES.LIKES)
        .insert({ user_id: userId, article_id: articleId });
      
      if (error) throw error;
      return true; // Like added
    }
  },

  // Digest subscriptions
  async subscribeToDigest(email: string, frequency: 'weekly' | 'daily' = 'weekly') {
    const { data, error } = await supabase
      .from(TABLES.DIGEST_SUBSCRIPTIONS)
      .upsert({ email, frequency })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // RSS Feeds
  async getRSSFeeds() {
    const { data, error } = await supabase
      .from(TABLES.RSS_FEEDS)
      .select('*')
      .eq('active', true);
    
    if (error) throw error;
    return data;
  },

  async updateRSSFeedLastFetched(feedId: string) {
    const { error } = await supabase
      .from(TABLES.RSS_FEEDS)
      .update({ last_fetched: new Date().toISOString() })
      .eq('id', feedId);
    
    if (error) throw error;
  },

  async getDigestSubscribers() {
    const { data, error } = await supabase
      .from(TABLES.DIGEST_SUBSCRIPTIONS)
      .select('*')
      .eq('active', true);
    
    if (error) throw error;
    return data || [];
  },

  // Ingestion Logs
  async createIngestionLog(log: {
    status: 'success' | 'error' | 'partial';
    processedCount: number;
    errorCount: number;
    duration: number;
    message: string;
    details?: string;
  }) {
    try {
      // Try PostgREST first
      const { data, error } = await supabase
        .from(TABLES.INGESTION_LOGS)
        .insert({
          ...log,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (postgrestError) {
      console.log('PostgREST failed, trying direct SQL...');
      
      // Fallback to direct SQL
      const { data: sqlData, error: sqlError } = await supabase.rpc('create_ingestion_log', {
        p_status: log.status,
        p_processed_count: log.processedCount,
        p_error_count: log.errorCount,
        p_duration: log.duration,
        p_message: log.message,
        p_details: log.details || null
      });
      
      if (sqlError) throw sqlError;
      return sqlData;
    }
  },

  async getIngestionLogs(limit: number = 20) {
    const { data, error } = await supabase
      .from(TABLES.INGESTION_LOGS)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getLatestIngestionLog() {
    const { data, error } = await supabase
      .from(TABLES.INGESTION_LOGS)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },
}; 