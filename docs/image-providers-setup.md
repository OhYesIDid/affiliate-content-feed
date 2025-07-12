# 🖼️ Free Image Provider Setup Guide

This guide will help you set up free image providers for your affiliate content feed app.

## 🎯 **Recommended Setup Order**

### **1. Unsplash API (Best Option)**
- **Free tier**: 5,000 requests per hour
- **Quality**: High-resolution, professional photos
- **Setup**: 
  1. Go to [https://unsplash.com/developers](https://unsplash.com/developers)
  2. Create a free account
  3. Create a new application
  4. Copy your `Access Key`
  5. Add to `.env.local`: `UNSPLASH_ACCESS_KEY=your_access_key_here`

### **2. Pexels API (Backup Option)**
- **Free tier**: 200 requests per hour
- **Quality**: High-quality stock photos
- **Setup**:
  1. Go to [https://www.pexels.com/api/](https://www.pexels.com/api/)
  2. Create a free account
  3. Get your API key
  4. Add to `.env.local`: `PEXELS_API_KEY=your_api_key_here`

### **3. Pixabay API (Additional Backup)**
- **Free tier**: 5,000 requests per hour
- **Quality**: Good variety of images
- **Setup**:
  1. Go to [https://pixabay.com/api/docs/](https://pixabay.com/api/docs/)
  2. Create a free account
  3. Get your API key
  4. Add to `.env.local`: `PIXABAY_API_KEY=your_api_key_here`

## 🔧 **Environment Variables**

Add these to your `.env.local` file:

```bash
# Image Providers
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key
PIXABAY_API_KEY=your_pixabay_api_key
```

## 🚀 **How It Works**

1. **Smart Image Selection**: The system tries to extract images from RSS feeds first
2. **AI-Powered Search**: If no image found, it searches for relevant images based on:
   - Article title
   - Content keywords
   - Category
3. **Fallback Chain**: Tries providers in order: Unsplash → Pexels → Pixabay → Placeholder
4. **Automatic Attribution**: All images are properly attributed to their creators

## 📊 **Usage Limits**

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| Unsplash | 5,000/hour | Primary choice |
| Pexels | 200/hour | Backup option |
| Pixabay | 5,000/hour | Additional backup |
| Placeholder | Unlimited | Always available |

## 🎨 **Image Quality Features**

- **Landscape Orientation**: Optimized for hero images
- **High Resolution**: 800x400 minimum
- **Relevant Content**: AI-powered keyword matching
- **Commercial Use**: All images are free for commercial use
- **Automatic Fallback**: Always provides an image

## 💡 **Tips for Best Results**

1. **Start with Unsplash**: It has the highest limits and best quality
2. **Add Pexels as backup**: Good for when Unsplash hits limits
3. **Monitor usage**: Check your API usage in provider dashboards
4. **Cache images**: Consider caching popular images to reduce API calls
5. **Category matching**: The system uses article categories for better image matching

## 🔍 **Testing the Setup**

Once configured, you can test the image service:

```bash
# Test image generation
curl "http://localhost:3000/api/test-images?query=artificial intelligence"
```

The system will automatically use the best available provider and fall back gracefully if any service is unavailable. 