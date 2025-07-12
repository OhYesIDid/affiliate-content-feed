// RSS Filtering Configuration
// This configuration can be modified at runtime through the admin interface

import { supabase } from './supabase';

// Default configuration
const DEFAULT_CONFIG = {
  // Title length filters
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  
  // Keyword filters (case-insensitive)
  EXCLUDE_KEYWORDS: [
    // Sponsored/Advertisement content
    'sponsored', 'advertisement', 'advertorial', 'paid post', 'promoted',
    
    // Breaking news (usually low value)
    'breaking news', 'live updates', 'just in', 'urgent',
    
    // Clickbait patterns
    'click here', 'read more', 'learn more', 'find out',
    
    // Newsletter/Subscription content
    'subscribe', 'newsletter', 'sign up', 'join now',
    
    // Generic marketing terms
    'limited time', 'act now', 'don\'t miss out', 'exclusive',
    
    // Low-value content indicators
    'photo gallery', 'slideshow', 'pictures', 'images',
    'video', 'watch', 'see what happened'
  ],
  
  // Include keywords (articles must contain at least one)
  INCLUDE_KEYWORDS: [
    // How-to and educational content
    'how to', 'guide', 'tips', 'tricks', 'tutorial', 'step by step',
    
    // Review and comparison content
    'review', 'comparison', 'vs', 'versus', 'best', 'top', 'worst',
    
    // Analysis and explanation content
    'analysis', 'explained', 'why', 'what is', 'understanding',
    
    // Technology content
    'technology', 'tech', 'software', 'app', 'platform', 'tool',
    'ai', 'artificial intelligence', 'machine learning', 'automation',
    
    // Business and finance content
    'business', 'finance', 'investment', 'market', 'economy',
    'startup', 'entrepreneur', 'strategy', 'marketing', 'growth',
    
    // Lifestyle and health content
    'health', 'fitness', 'lifestyle', 'wellness', 'diet', 'exercise',
    'travel', 'vacation', 'destination', 'trip',
    
    // Product and service content
    'product', 'service', 'solution', 'feature', 'benefit',
    
    // Industry-specific terms
    'industry', 'sector', 'market', 'trend', 'innovation', 'future',
    
    // News and general content (more inclusive)
    'news', 'announces', 'launches', 'releases', 'introduces',
    'partnership', 'acquisition', 'merger', 'funding', 'investment',
    'update', 'new', 'latest', 'recent', 'announcement'
  ],
  
  // Time-based filters
  MAX_AGE_HOURS: 72, // Only process articles from last 72 hours
  
  // Spam detection patterns (as strings for easier editing)
  SPAM_INDICATORS: [
    '[A-Z]{5,}', // Too many consecutive caps
    '!{2,}', // Multiple exclamation marks
    '\\?{2,}', // Multiple question marks
    '\\d{1,2}%\\s*off', // Percentage off patterns
    'free\\s+download',
    'limited\\s+time',
    'act\\s+now',
    'don\'t\\s+miss',
    'exclusive\\s+offer',
    'one\\s+time\\s+only'
  ]
};

// Runtime configuration that can be modified
let runtimeConfig: typeof DEFAULT_CONFIG | null = null;

// Export the current configuration
export const FILTER_CONFIG = runtimeConfig || DEFAULT_CONFIG;

// Function to load configuration from database
const loadConfigFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('filter_config')
      .select('config')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading config from DB:', error);
      return null;
    }
    
    if (data && data.config) {
      return data.config;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading config from DB:', error);
    return null;
  }
};

// Function to save configuration to database
const saveConfigToDB = async (config: typeof DEFAULT_CONFIG) => {
  try {
    const { error } = await supabase
      .from('filter_config')
      .upsert({ 
        id: 1, // Single row for configuration
        config: config,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving config to DB:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving config to DB:', error);
    return false;
  }
};

// Initialize configuration from database
const initializeConfig = async () => {
  const dbConfig = await loadConfigFromDB();
  if (dbConfig) {
    runtimeConfig = { ...DEFAULT_CONFIG, ...dbConfig };
    console.log('Filter configuration loaded from database');
  } else {
    // Save default config to database
    await saveConfigToDB(DEFAULT_CONFIG);
    console.log('Default filter configuration saved to database');
  }
};

// Function to update the configuration at runtime
export const updateFilterConfig = async (newConfig: typeof DEFAULT_CONFIG) => {
  runtimeConfig = { ...newConfig };
  
  // Save to database
  const saved = await saveConfigToDB(newConfig);
  if (saved) {
    console.log('Filter configuration updated and saved to database:', runtimeConfig);
  } else {
    console.log('Filter configuration updated (in-memory only):', runtimeConfig);
  }
};

// Function to ensure config is loaded
export const ensureConfigLoaded = async () => {
  if (!runtimeConfig) {
    await initializeConfig();
  }
  return runtimeConfig || DEFAULT_CONFIG;
};

// Initialize on module load
initializeConfig();

// Function to reset to defaults
export const resetFilterConfig = async () => {
  runtimeConfig = { ...DEFAULT_CONFIG };
  
  // Save to database
  const saved = await saveConfigToDB(DEFAULT_CONFIG);
  if (saved) {
    console.log('Filter configuration reset to defaults and saved to database');
  } else {
    console.log('Filter configuration reset to defaults (in-memory only)');
  }
};

// Function to get current config
export const getCurrentConfig = () => {
  return { ...(runtimeConfig || DEFAULT_CONFIG) };
}; 