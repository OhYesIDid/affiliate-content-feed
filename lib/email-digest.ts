import { Resend } from 'resend';
import { db } from './supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailDigest = {
  async sendWeeklyDigest() {
    try {
      console.log('📧 Starting weekly digest generation...');

      // Get top articles from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const articles = await db.getArticles({}, 'likes_count', 'desc');
      const topArticles = articles.slice(0, 10); // Top 10 articles

      if (topArticles.length === 0) {
        console.log('No articles found for digest');
        return;
      }

      // Get all active digest subscribers
      const subscribers = await db.getDigestSubscribers();

      if (subscribers.length === 0) {
        console.log('No digest subscribers found');
        return;
      }

      console.log(`📬 Sending digest to ${subscribers.length} subscribers`);

      // Generate email content
      const emailContent = this.generateDigestEmail(topArticles);

      // Send emails to all subscribers
      const emailPromises = subscribers.map(subscriber => 
        this.sendDigestEmail(subscriber.email, emailContent, topArticles)
      );

      const results = await Promise.allSettled(emailPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`✅ Digest sent: ${successful} successful, ${failed} failed`);

      return {
        total: subscribers.length,
        successful,
        failed
      };

    } catch (error) {
      console.error('❌ Error sending weekly digest:', error);
      throw error;
    }
  },

  generateDigestEmail(articles: any[]) {
    const articlesHtml = articles.map((article, index) => `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #1f2937;">
          <a href="${article.affiliate_url || article.url}" style="color: #3b82f6; text-decoration: none;">
            ${article.title}
          </a>
        </h3>
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
          ${article.summary}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af;">
          <span>${article.source} • ${article.category}</span>
          <span>❤️ ${article.likes_count} • 🔖 ${article.bookmarks_count}</span>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ContentFeed Weekly Digest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; text-align: center;">
              📰 ContentFeed Weekly Digest
            </h1>
            <p style="color: rgba(255,255,255,0.9); text-align: center; margin: 10px 0 0 0;">
              Your curated selection of the week's best content
            </p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px;">
              🔥 Top Articles This Week
            </h2>
            
            ${articlesHtml}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                Want more great content? Visit our website for the latest updates.
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Visit ContentFeed
              </a>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>
              You're receiving this because you subscribed to ContentFeed's weekly digest.<br>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/unsubscribe" style="color: #3b82f6;">
                Unsubscribe
              </a>
            </p>
          </div>
        </body>
      </html>
    `;
  },

  async sendDigestEmail(email: string, htmlContent: string, articles: any[]) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ContentFeed <digest@yourdomain.com>',
        to: [email],
        subject: `📰 ContentFeed Weekly Digest - ${articles.length} Top Articles`,
        html: htmlContent,
      });

      if (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw error;
      }

      console.log(`✅ Email sent to ${email}:`, data.id);
      return data;

    } catch (error) {
      console.error(`❌ Error sending email to ${email}:`, error);
      throw error;
    }
  },

  async sendWelcomeEmail(email: string) {
    try {
      const welcomeHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px; text-align: center;">
                🎉 Welcome to ContentFeed!
              </h1>
            </div>

            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="margin: 0 0 20px 0; color: #1f2937;">
                You're all set! 🚀
              </h2>
              
              <p style="color: #6b7280; margin-bottom: 20px;">
                Thank you for subscribing to ContentFeed's weekly digest. You'll receive our curated selection of the best content every week, featuring:
              </p>

              <ul style="color: #6b7280; margin-bottom: 30px;">
                <li>🤖 AI-powered summaries and insights</li>
                <li>📱 Curated content from top sources</li>
                <li>💡 Exclusive deals and recommendations</li>
                <li>🎯 Personalized content based on your interests</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  Explore ContentFeed
                </a>
              </div>
            </div>

            <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
              <p>
                Questions? Reply to this email or visit our website.<br>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/unsubscribe" style="color: #3b82f6;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: 'ContentFeed <welcome@yourdomain.com>',
        to: [email],
        subject: '🎉 Welcome to ContentFeed!',
        html: welcomeHtml,
      });

      if (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        throw error;
      }

      console.log(`✅ Welcome email sent to ${email}:`, data.id);
      return data;

    } catch (error) {
      console.error(`❌ Error sending welcome email to ${email}:`, error);
      throw error;
    }
  }
}; 