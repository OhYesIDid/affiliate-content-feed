interface ImageProvider {
  name: string;
  searchImages(query: string): Promise<string[]>;
}

class UnsplashProvider implements ImageProvider {
  name = 'unsplash';
  private apiKey: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.apiKey = process.env.UNSPLASH_ACCESS_KEY || '';
  }

  async searchImages(query: string): Promise<string[]> {
    if (!this.apiKey) {
      console.warn('Unsplash API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((photo: any) => photo.urls.regular);
    } catch (error) {
      console.error('Error fetching from Unsplash:', error);
      return [];
    }
  }
}

class PexelsProvider implements ImageProvider {
  name = 'pexels';
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/v1';

  constructor() {
    this.apiKey = process.env.PEXELS_API_KEY || '';
  }

  async searchImages(query: string): Promise<string[]> {
    if (!this.apiKey) {
      console.warn('Pexels API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            'Authorization': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      return data.photos.map((photo: any) => photo.src.large);
    } catch (error) {
      console.error('Error fetching from Pexels:', error);
      return [];
    }
  }
}

class PixabayProvider implements ImageProvider {
  name = 'pixabay';
  private apiKey: string;
  private baseUrl = 'https://pixabay.com/api';

  constructor() {
    this.apiKey = process.env.PIXABAY_API_KEY || '';
  }

  async searchImages(query: string): Promise<string[]> {
    if (!this.apiKey) {
      console.warn('Pixabay API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/?key=${this.apiKey}&q=${encodeURIComponent(query)}&per_page=5&orientation=horizontal&image_type=photo`
      );

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      return data.hits.map((hit: any) => hit.webformatURL);
    } catch (error) {
      console.error('Error fetching from Pixabay:', error);
      return [];
    }
  }
}

// Fallback provider with placeholder images
class PlaceholderProvider implements ImageProvider {
  name = 'placeholder';
  
  async searchImages(query: string): Promise<string[]> {
    // Generate relevant placeholder images based on category
    const category = this.extractCategory(query);
    const placeholders = [
      `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center`, // Tech
      `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center`, // Business
      `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center`, // Lifestyle
      `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center`, // General
    ];
    
    return [placeholders[Math.floor(Math.random() * placeholders.length)]];
  }

  private extractCategory(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('tech') || lowerQuery.includes('ai') || lowerQuery.includes('software')) return 'tech';
    if (lowerQuery.includes('business') || lowerQuery.includes('finance') || lowerQuery.includes('economy')) return 'business';
    if (lowerQuery.includes('lifestyle') || lowerQuery.includes('health') || lowerQuery.includes('fitness')) return 'lifestyle';
    return 'general';
  }
}

// Add caching for image searches
const imageCache = new Map<string, string>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedImage {
  url: string;
  timestamp: number;
}

export class ImageService {
  private providers: ImageProvider[];

  constructor() {
    this.providers = [
      new UnsplashProvider(),
      new PexelsProvider(),
      new PixabayProvider(),
      new PlaceholderProvider(), // Always available as fallback
    ];
  }

  async getRelevantImage(title: string, content: string, category?: string): Promise<string> {
    const searchQuery = this.generateSearchQuery(title, content, category);
    const cacheKey = `single_${searchQuery}`;
    
    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached) {
      const cachedImage: CachedImage = JSON.parse(cached);
      if (Date.now() - cachedImage.timestamp < CACHE_DURATION) {
        console.log('📸 Using cached image for:', searchQuery);
        return cachedImage.url;
      }
    }

    // Try providers in order until we get an image
    for (const provider of this.providers) {
      try {
        const images = await provider.searchImages(searchQuery);
        if (images.length > 0) {
          console.log(`Found image using ${provider.name} for: ${title}`);
          // Cache the result
          const imageUrl = images[0];
          imageCache.set(cacheKey, JSON.stringify({
            url: imageUrl,
            timestamp: Date.now()
          }));
          return imageUrl;
        }
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        continue; // Try next provider
      }
    }

    // Fallback to placeholder
    console.log(`Using placeholder image for: ${title}`);
    const placeholderUrl = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center';
    imageCache.set(cacheKey, JSON.stringify({
      url: placeholderUrl,
      timestamp: Date.now()
    }));
    return placeholderUrl;
  }

  private generateSearchQuery(title: string, content: string, category?: string): string {
    // Extract key terms from title
    const titleWords = title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3);

    // Add category if available
    const queryParts = [...titleWords];
    if (category) {
      queryParts.unshift(category.toLowerCase());
    }

    // Create a focused search query
    return queryParts.join(' ').trim() || 'technology';
  }

  async getMultipleImages(query: string, count: number = 3): Promise<string[]> {
    const cacheKey = `multiple_${query}_${count}`;
    
    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached) {
      const cachedImages: CachedImage = JSON.parse(cached);
      if (Date.now() - cachedImages.timestamp < CACHE_DURATION) {
        console.log('🖼️ Using cached images for:', query);
        return JSON.parse(cachedImages.url);
      }
    }

    for (const provider of this.providers) {
      try {
        const images = await provider.searchImages(query);
        if (images.length >= count) {
          // Cache the result
          const imageUrls = images.slice(0, count);
          imageCache.set(cacheKey, JSON.stringify({
            url: JSON.stringify(imageUrls),
            timestamp: Date.now()
          }));
          return imageUrls;
        }
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        continue;
      }
    }

    // Fallback to placeholder images
    const placeholderUrls = Array(count).fill('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center');
    imageCache.set(cacheKey, JSON.stringify({
      url: JSON.stringify(placeholderUrls),
      timestamp: Date.now()
    }));
    return placeholderUrls;
  }
}

// Export singleton instance
export const imageService = new ImageService(); 