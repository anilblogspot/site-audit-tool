import * as cheerio from 'cheerio';
import { SEOAuditResult, SEOIssue } from '@/types/audit';

export async function analyzeSEO(url: string): Promise<SEOAuditResult> {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Ensure URL has protocol
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const urlObj = new URL(normalizedUrl);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  // Fetch the page
  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Title analysis
  const titleTag = $('title').first();
  const titleContent = titleTag.text().trim();
  const titleLength = titleContent.length;
  const titleIsOptimal = titleLength >= 30 && titleLength <= 60;

  if (!titleContent) {
    issues.push({
      type: 'error',
      message: 'Missing title tag',
      recommendation: 'Add a descriptive title tag between 30-60 characters',
    });
    score -= 15;
  } else if (!titleIsOptimal) {
    issues.push({
      type: 'warning',
      message: `Title length (${titleLength} chars) is ${titleLength < 30 ? 'too short' : 'too long'}`,
      recommendation: 'Keep title between 30-60 characters for optimal display in search results',
    });
    score -= 5;
  }

  // Meta description analysis
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || null;
  const metaDescLength = metaDesc?.length || 0;
  const metaDescIsOptimal = metaDescLength >= 120 && metaDescLength <= 160;

  if (!metaDesc) {
    issues.push({
      type: 'error',
      message: 'Missing meta description',
      recommendation: 'Add a meta description between 120-160 characters',
    });
    score -= 10;
  } else if (!metaDescIsOptimal) {
    issues.push({
      type: 'warning',
      message: `Meta description length (${metaDescLength} chars) is ${metaDescLength < 120 ? 'too short' : 'too long'}`,
      recommendation: 'Keep meta description between 120-160 characters',
    });
    score -= 3;
  }

  // Heading structure analysis
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;
  const h5Count = $('h5').length;
  const h6Count = $('h6').length;

  if (h1Count === 0) {
    issues.push({
      type: 'error',
      message: 'Missing H1 heading',
      recommendation: 'Add exactly one H1 heading that describes the page content',
    });
    score -= 10;
  } else if (h1Count > 1) {
    issues.push({
      type: 'warning',
      message: `Multiple H1 headings found (${h1Count})`,
      recommendation: 'Use only one H1 heading per page',
    });
    score -= 5;
  }

  const hasProperHierarchy = h1Count === 1 && h2Count > 0;

  // Image alt tag analysis
  const allImages = $('img');
  const imagesWithAlt = $('img[alt]:not([alt=""])');
  const totalImages = allImages.length;
  const imagesWithAltCount = imagesWithAlt.length;
  const imagesWithoutAltCount = totalImages - imagesWithAltCount;

  if (imagesWithoutAltCount > 0) {
    issues.push({
      type: 'warning',
      message: `${imagesWithoutAltCount} image(s) missing alt text`,
      recommendation: 'Add descriptive alt text to all images for accessibility and SEO',
    });
    score -= Math.min(imagesWithoutAltCount * 2, 10);
  }

  // Link analysis
  const allLinks = $('a[href]');
  let internalLinks = 0;
  let externalLinks = 0;

  allLinks.each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('/') || href.startsWith(baseUrl) || href.startsWith('#')) {
      internalLinks++;
    } else if (href.startsWith('http')) {
      externalLinks++;
    }
  });

  // Canonical URL
  const canonical = $('link[rel="canonical"]').attr('href') || null;
  if (!canonical) {
    issues.push({
      type: 'info',
      message: 'No canonical URL specified',
      recommendation: 'Add a canonical URL to prevent duplicate content issues',
    });
    score -= 3;
  }

  // Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');

  if (!ogTitle || !ogDesc || !ogImage) {
    issues.push({
      type: 'info',
      message: 'Incomplete Open Graph tags',
      recommendation: 'Add og:title, og:description, and og:image for better social sharing',
    });
    score -= 3;
  }

  // Twitter Card
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const twitterDesc = $('meta[name="twitter:description"]').attr('content');

  if (!twitterCard) {
    issues.push({
      type: 'info',
      message: 'Missing Twitter Card tags',
      recommendation: 'Add Twitter Card tags for better Twitter sharing',
    });
    score -= 2;
  }

  // Viewport meta tag
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    issues.push({
      type: 'error',
      message: 'Missing viewport meta tag',
      recommendation: 'Add viewport meta tag for mobile responsiveness',
    });
    score -= 10;
  }

  // Check for robots.txt
  let hasRobotsTxt = false;
  try {
    const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)' },
    });
    hasRobotsTxt = robotsResponse.ok;
  } catch {
    // robots.txt not found
  }

  if (!hasRobotsTxt) {
    issues.push({
      type: 'info',
      message: 'No robots.txt file found',
      recommendation: 'Add a robots.txt file to guide search engine crawlers',
    });
    score -= 2;
  }

  // Check for sitemap.xml
  let hasSitemap = false;
  try {
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)' },
    });
    hasSitemap = sitemapResponse.ok;
  } catch {
    // sitemap.xml not found
  }

  if (!hasSitemap) {
    issues.push({
      type: 'info',
      message: 'No sitemap.xml file found',
      recommendation: 'Add a sitemap.xml to help search engines discover your pages',
    });
    score -= 2;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    score,
    title: {
      exists: !!titleContent,
      content: titleContent || null,
      length: titleLength,
      isOptimal: titleIsOptimal,
    },
    metaDescription: {
      exists: !!metaDesc,
      content: metaDesc,
      length: metaDescLength,
      isOptimal: metaDescIsOptimal,
    },
    headings: {
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      h5Count,
      h6Count,
      hasProperHierarchy,
    },
    images: {
      total: totalImages,
      withAlt: imagesWithAltCount,
      withoutAlt: imagesWithoutAltCount,
    },
    links: {
      internal: internalLinks,
      external: externalLinks,
      broken: 0, // Would require async checking of each link
    },
    canonical: {
      exists: !!canonical,
      url: canonical,
    },
    openGraph: {
      hasTitle: !!ogTitle,
      hasDescription: !!ogDesc,
      hasImage: !!ogImage,
    },
    twitterCard: {
      hasCard: !!twitterCard,
      hasTitle: !!twitterTitle,
      hasDescription: !!twitterDesc,
    },
    robotsTxt: hasRobotsTxt,
    sitemap: hasSitemap,
    viewport: !!viewport,
    issues,
  };
}
