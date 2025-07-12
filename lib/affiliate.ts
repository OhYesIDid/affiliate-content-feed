// Affiliate link management system
export interface AffiliateConfig {
  skimlinks: {
    enabled: boolean;
    publisherId: string;
  };
  amazon: {
    enabled: boolean;
    tag: string;
    regions: {
      [key: string]: string; // region code -> tag
    };
  };
  custom: {
    enabled: boolean;
    patterns: {
      [key: string]: string; // domain pattern -> affiliate URL template
    };
  };
}

// Default affiliate configuration
export const affiliateConfig: AffiliateConfig = {
  skimlinks: {
    enabled: true, // Enable for testing - set to false in production if not using Skimlinks
    publisherId: process.env.SKIMLINKS_PUBLISHER_ID || 'test123', // Use test ID for development
  },
  amazon: {
    enabled: false,
    tag: process.env.AMAZON_AFFILIATE_TAG || '',
    regions: {
      'amazon.com': process.env.AMAZON_US_TAG || '',
      'amazon.co.uk': process.env.AMAZON_UK_TAG || '',
      'amazon.ca': process.env.AMAZON_CA_TAG || '',
      'amazon.de': process.env.AMAZON_DE_TAG || '',
      'amazon.fr': process.env.AMAZON_FR_TAG || '',
      'amazon.it': process.env.AMAZON_IT_TAG || '',
      'amazon.es': process.env.AMAZON_ES_TAG || '',
      'amazon.co.jp': process.env.AMAZON_JP_TAG || '',
      'amazon.in': process.env.AMAZON_IN_TAG || '',
      'amazon.com.au': process.env.AMAZON_AU_TAG || '',
    },
  },
  custom: {
    enabled: false,
    patterns: {
      'techcrunch.com': 'https://go.skimresources.com/?id=YOUR_ID&url={url}',
      'theverge.com': 'https://go.skimresources.com/?id=YOUR_ID&url={url}',
      'lifehacker.com': 'https://go.skimresources.com/?id=YOUR_ID&url={url}',
    },
  },
};

export const affiliate = {
  /**
   * Generate affiliate URL for a given original URL
   */
  async createAffiliateUrl(originalUrl: string): Promise<string> {
    if (!originalUrl) return originalUrl;

    try {
      const url = new URL(originalUrl);
      const domain = url.hostname.toLowerCase();

      // Check Amazon affiliate links first
      if (affiliateConfig.amazon.enabled) {
        const amazonUrl = this.createAmazonAffiliateUrl(originalUrl, domain);
        if (amazonUrl) return amazonUrl;
      }

      // Check custom patterns
      if (affiliateConfig.custom.enabled) {
        const customUrl = this.createCustomAffiliateUrl(originalUrl, domain);
        if (customUrl) return customUrl;
      }

      // Use Skimlinks as fallback
      if (affiliateConfig.skimlinks.enabled) {
        return this.createSkimlinksUrl(originalUrl);
      }

      // Return original URL if no affiliate program matches
      return originalUrl;
    } catch (error) {
      console.error('Error creating affiliate URL:', error);
      return originalUrl;
    }
  },

  /**
   * Create Amazon affiliate URL
   */
  createAmazonAffiliateUrl(originalUrl: string, domain: string): string | null {
    const regionTag = affiliateConfig.amazon.regions[domain];
    if (!regionTag) return null;

    try {
      const url = new URL(originalUrl);
      
      // Check if URL already has affiliate parameters
      if (url.searchParams.has('tag') || url.searchParams.has('linkCode')) {
        return originalUrl; // Already has affiliate parameters
      }

      // Add affiliate tag
      url.searchParams.set('tag', regionTag);
      
      return url.toString();
    } catch (error) {
      console.error('Error creating Amazon affiliate URL:', error);
      return null;
    }
  },

  /**
   * Create custom affiliate URL based on domain patterns
   */
  createCustomAffiliateUrl(originalUrl: string, domain: string): string | null {
    for (const [pattern, template] of Object.entries(affiliateConfig.custom.patterns)) {
      if (domain.includes(pattern)) {
        return template.replace('{url}', encodeURIComponent(originalUrl));
      }
    }
    return null;
  },

  /**
   * Create Skimlinks URL
   */
  createSkimlinksUrl(originalUrl: string): string {
    if (!affiliateConfig.skimlinks.publisherId) {
      return originalUrl;
    }
    
    return `https://go.skimresources.com/?id=${affiliateConfig.skimlinks.publisherId}&url=${encodeURIComponent(originalUrl)}`;
  },

  /**
   * Check if a URL is an affiliate link
   */
  isAffiliateLink(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // Check for affiliate parameters
      const hasAffiliateParams = urlObj.searchParams.has('tag') || 
                                urlObj.searchParams.has('linkCode') ||
                                urlObj.searchParams.has('id');
      
      // Check for known affiliate domains
      const isAffiliateDomain = domain.includes('skimresources.com') ||
                               domain.includes('amazon.com') ||
                               domain.includes('go2cloud.org');
      
      return hasAffiliateParams || isAffiliateDomain;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get affiliate program name for a URL
   */
  getAffiliateProgram(url: string): string {
    if (!url) return 'Direct';
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      if (domain.includes('amazon.com') || domain.includes('amazon.co.uk')) {
        return 'Amazon';
      }
      
      if (domain.includes('skimresources.com')) {
        return 'Skimlinks';
      }
      
      if (this.isAffiliateLink(url)) {
        return 'Affiliate';
      }
      
      return 'Direct';
    } catch (error) {
      return 'Direct';
    }
  },

  /**
   * Track affiliate click (for analytics)
   */
  async trackAffiliateClick(articleId: string, originalUrl: string, affiliateUrl: string): Promise<void> {
    try {
      // You can implement click tracking here
      // For example, send to your analytics service or database
      console.log(`Affiliate click tracked:`, {
        articleId,
        originalUrl,
        affiliateUrl,
        timestamp: new Date().toISOString(),
        program: this.getAffiliateProgram(affiliateUrl)
      });
      
      // Example: Send to your analytics endpoint
      // await fetch('/api/analytics/affiliate-click', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     articleId,
      //     originalUrl,
      //     affiliateUrl,
      //     program: this.getAffiliateProgram(affiliateUrl)
      //   })
      // });
      
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  }
}; 