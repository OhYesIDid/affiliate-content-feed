# Affiliate Link Setup Guide

This guide will help you configure your affiliate links to earn commissions from your content.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Skimlinks (for general affiliate links)
SKIMLINKS_PUBLISHER_ID=your_skimlinks_publisher_id

# Amazon Associates (for Amazon product links)
AMAZON_AFFILIATE_TAG=your_amazon_tag
AMAZON_US_TAG=your_us_tag
AMAZON_UK_TAG=your_uk_tag
AMAZON_CA_TAG=your_ca_tag
AMAZON_DE_TAG=your_de_tag
AMAZON_FR_TAG=your_fr_tag
AMAZON_IT_TAG=your_it_tag
AMAZON_ES_TAG=your_es_tag
AMAZON_JP_TAG=your_jp_tag
AMAZON_IN_TAG=your_in_tag
AMAZON_AU_TAG=your_au_tag
```

## Affiliate Programs Setup

### 1. Skimlinks (Recommended for General Links)

Skimlinks automatically converts regular links to affiliate links for thousands of merchants.

**Setup:**
1. Sign up at [skimlinks.com](https://skimlinks.com)
2. Get your Publisher ID from the dashboard
3. Add `SKIMLINKS_PUBLISHER_ID=your_id` to `.env.local`
4. Enable Skimlinks in `lib/affiliate.ts` by setting `enabled: true`

**Benefits:**
- Works with thousands of merchants automatically
- No need to manually create affiliate links
- Supports major retailers like Amazon, Best Buy, Walmart, etc.

### 2. Amazon Associates

For Amazon-specific product links.

**Setup:**
1. Sign up for [Amazon Associates](https://affiliate-program.amazon.com)
2. Get your affiliate tag from the dashboard
3. Add your tags to `.env.local`
4. Enable Amazon in `lib/affiliate.ts` by setting `enabled: true`

**Benefits:**
- Higher commission rates for Amazon products
- Direct integration with Amazon's affiliate program
- Regional support for different Amazon domains

### 3. Custom Affiliate Programs

For specific merchants or programs.

**Setup:**
1. Edit `lib/affiliate.ts`
2. Add your custom patterns in the `custom.patterns` object
3. Enable custom patterns by setting `enabled: true`

**Example:**
```typescript
custom: {
  enabled: true,
  patterns: {
    'techcrunch.com': 'https://go.skimresources.com/?id=YOUR_ID&url={url}',
    'theverge.com': 'https://go.skimresources.com/?id=YOUR_ID&url={url}',
  },
},
```

## Configuration Options

### Enable/Disable Programs

Edit `lib/affiliate.ts` to enable/disable specific affiliate programs:

```typescript
export const affiliateConfig: AffiliateConfig = {
  skimlinks: {
    enabled: true, // Set to true to enable Skimlinks
    publisherId: process.env.SKIMLINKS_PUBLISHER_ID || '',
  },
  amazon: {
    enabled: true, // Set to true to enable Amazon Associates
    tag: process.env.AMAZON_AFFILIATE_TAG || '',
    // ... regions
  },
  custom: {
    enabled: false, // Set to true to enable custom patterns
    patterns: {
      // ... your custom patterns
    },
  },
};
```

### Priority Order

The system processes affiliate links in this order:
1. Amazon Associates (if enabled and URL matches)
2. Custom patterns (if enabled and URL matches)
3. Skimlinks (if enabled, as fallback)
4. Original URL (if no affiliate program matches)

## Testing Your Setup

1. **Test with new articles:**
   ```bash
   curl -X POST http://localhost:3000/api/ingest
   ```

2. **Check affiliate URLs:**
   - Visit an article page
   - Look for the "Support Our Site" section
   - Verify the affiliate program is displayed correctly

3. **Test affiliate clicks:**
   - Click the "Shop with Affiliate Link" button
   - Check the browser console for tracking logs
   - Verify the link opens with your affiliate parameters

## Analytics and Tracking

The system automatically tracks affiliate clicks. You can extend this by:

1. **Database tracking:** Uncomment the database call in `/api/analytics/affiliate-click/route.ts`
2. **External analytics:** Add your analytics service (Google Analytics, Mixpanel, etc.)
3. **Custom tracking:** Modify the tracking logic in `lib/affiliate.ts`

## Best Practices

1. **Transparency:** Always disclose affiliate relationships
2. **Relevance:** Only use affiliate links for relevant content
3. **Testing:** Regularly test your affiliate links
4. **Compliance:** Follow FTC guidelines for affiliate marketing
5. **Performance:** Monitor click-through rates and conversions

## Troubleshooting

### Links not converting to affiliate links:
- Check if the affiliate program is enabled
- Verify environment variables are set correctly
- Check the domain matches your affiliate program

### Tracking not working:
- Check browser console for errors
- Verify the `/api/analytics/affiliate-click` endpoint is working
- Check network tab for failed requests

### Amazon links not working:
- Verify your Amazon Associates account is approved
- Check that your affiliate tags are correct
- Ensure the Amazon domain is supported

## Revenue Optimization

1. **A/B Testing:** Test different affiliate link placements
2. **Content Strategy:** Focus on high-converting content
3. **Seasonal Campaigns:** Leverage seasonal shopping trends
4. **Multiple Programs:** Use different programs for different types of content
5. **Performance Monitoring:** Track which articles generate the most revenue

## Legal Compliance

- **FTC Disclosure:** Always disclose affiliate relationships
- **Privacy Policy:** Update your privacy policy to mention affiliate tracking
- **Terms of Service:** Include affiliate terms in your terms of service
- **Regional Compliance:** Follow local affiliate marketing laws

## Support

For issues with specific affiliate programs:
- **Skimlinks:** [support@skimlinks.com](mailto:support@skimlinks.com)
- **Amazon Associates:** [Amazon Associates Support](https://affiliate-program.amazon.com/help/contact-us)
- **Custom Programs:** Contact the specific affiliate program's support 