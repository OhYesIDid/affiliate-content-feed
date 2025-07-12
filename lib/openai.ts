import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ai = {
  async summarizeContent(content: string, title: string) {
    try {
      const prompt = `Summarize this article in 2-3 sentences for a content feed. Focus on the key points and make it engaging:

Title: ${title}
Content: ${content.substring(0, 2000)}...`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a content curator who creates engaging summaries for a tech and lifestyle content feed."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error summarizing content:', error);
      return '';
    }
  },

  async rewriteForSEO(content: string, title: string) {
    try {
      const prompt = `Rewrite this article title and content to be more SEO-friendly and engaging for social media sharing. Keep the same key information but make it more compelling:

Original Title: ${title}
Original Content: ${content.substring(0, 1500)}...

Provide:
1. A new SEO-optimized title (max 60 characters)
2. A rewritten introduction paragraph (max 200 words)
3. 5 relevant hashtags for social media`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert who optimizes content for better search rankings and social media engagement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error rewriting content:', error);
      return '';
    }
  },

  async generateTags(content: string, title: string) {
    try {
      const prompt = `Generate 5-8 relevant tags for this article. Focus on tech, lifestyle, business, or finance keywords that would help users discover this content:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Return only the tags, separated by commas, no additional text.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a content tagging expert who creates relevant, searchable tags for articles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.5,
      });

      const tags = completion.choices[0]?.message?.content?.trim() || '';
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    } catch (error) {
      console.error('Error generating tags:', error);
      return [];
    }
  },

  async categorizeContent(content: string, title: string) {
    try {
      const prompt = `Categorize this article into one of these categories: tech, finance, lifestyle, business, deals, news. Choose the most appropriate category:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Return only the category name, nothing else.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a content categorization expert."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 20,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content?.trim().toLowerCase() || 'news';
    } catch (error) {
      console.error('Error categorizing content:', error);
      return 'news';
    }
  }
}; 