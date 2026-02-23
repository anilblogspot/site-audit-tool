import { PerformanceAuditResult, SEOIssue } from '@/types/audit';

interface PageSpeedResult {
  lighthouseResult?: {
    categories?: {
      performance?: {
        score?: number;
      };
    };
    audits?: {
      [key: string]: {
        score?: number;
        numericValue?: number;
        displayValue?: string;
        title?: string;
        description?: string;
      };
    };
  };
  loadingExperience?: {
    metrics?: {
      LARGEST_CONTENTFUL_PAINT_MS?: { percentile?: number };
      FIRST_INPUT_DELAY_MS?: { percentile?: number };
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: { percentile?: number };
      FIRST_CONTENTFUL_PAINT_MS?: { percentile?: number };
      EXPERIMENTAL_TIME_TO_FIRST_BYTE?: { percentile?: number };
    };
  };
}

export async function analyzePerformance(url: string): Promise<PerformanceAuditResult> {
  const issues: SEOIssue[] = [];
  const opportunities: { title: string; description: string; savings: string }[] = [];

  // Ensure URL has protocol
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  // Use Google PageSpeed Insights API
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const apiUrl = apiKey
    ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&category=performance&key=${apiKey}`
    : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&category=performance`;

  let performanceScore = 50; // Default score
  let loadTime = 0;
  let pageSize = 0;
  let requestCount = 0;
  let lcp: number | null = null;
  let fid: number | null = null;
  let cls: number | null = null;
  let fcp: number | null = null;
  let ttfb: number | null = null;

  try {
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data: PageSpeedResult = await response.json();

      // Extract performance score
      const lighthouseScore = data.lighthouseResult?.categories?.performance?.score;
      if (lighthouseScore !== undefined) {
        performanceScore = Math.round(lighthouseScore * 100);
      }

      // Extract Core Web Vitals from field data or lab data
      const metrics = data.loadingExperience?.metrics;
      const audits = data.lighthouseResult?.audits;

      // LCP (Largest Contentful Paint)
      if (metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile) {
        lcp = metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile;
      } else if (audits?.['largest-contentful-paint']?.numericValue) {
        lcp = audits['largest-contentful-paint'].numericValue;
      }

      // FID (First Input Delay)
      if (metrics?.FIRST_INPUT_DELAY_MS?.percentile) {
        fid = metrics.FIRST_INPUT_DELAY_MS.percentile;
      }

      // CLS (Cumulative Layout Shift)
      if (metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile) {
        cls = metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100;
      } else if (audits?.['cumulative-layout-shift']?.numericValue) {
        cls = audits['cumulative-layout-shift'].numericValue;
      }

      // FCP (First Contentful Paint)
      if (metrics?.FIRST_CONTENTFUL_PAINT_MS?.percentile) {
        fcp = metrics.FIRST_CONTENTFUL_PAINT_MS.percentile;
      } else if (audits?.['first-contentful-paint']?.numericValue) {
        fcp = audits['first-contentful-paint'].numericValue;
      }

      // TTFB (Time to First Byte)
      if (metrics?.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile) {
        ttfb = metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile;
      } else if (audits?.['server-response-time']?.numericValue) {
        ttfb = audits['server-response-time'].numericValue;
      }

      // Speed Index for load time
      if (audits?.['speed-index']?.numericValue) {
        loadTime = Math.round(audits['speed-index'].numericValue);
      }

      // Total page weight
      if (audits?.['total-byte-weight']?.numericValue) {
        pageSize = Math.round(audits['total-byte-weight'].numericValue);
      }

      // Network requests
      if (audits?.['network-requests']?.numericValue) {
        requestCount = Math.round(audits['network-requests'].numericValue);
      }

      // Extract opportunities
      const opportunityAudits = [
        'render-blocking-resources',
        'unused-css-rules',
        'unused-javascript',
        'modern-image-formats',
        'offscreen-images',
        'unminified-css',
        'unminified-javascript',
        'efficient-animated-content',
        'uses-responsive-images',
      ];

      for (const auditKey of opportunityAudits) {
        const audit = audits?.[auditKey];
        if (audit && audit.score !== undefined && audit.score < 1) {
          opportunities.push({
            title: audit.title || auditKey,
            description: audit.description || '',
            savings: audit.displayValue || 'Potential savings available',
          });
        }
      }

      // Add issues based on Core Web Vitals thresholds
      if (lcp !== null && lcp > 2500) {
        issues.push({
          type: lcp > 4000 ? 'error' : 'warning',
          message: `Largest Contentful Paint is ${(lcp / 1000).toFixed(1)}s (should be < 2.5s)`,
          recommendation: 'Optimize largest content element loading time',
        });
      }

      if (cls !== null && cls > 0.1) {
        issues.push({
          type: cls > 0.25 ? 'error' : 'warning',
          message: `Cumulative Layout Shift is ${cls.toFixed(3)} (should be < 0.1)`,
          recommendation: 'Add size attributes to images and embeds, avoid inserting content above existing content',
        });
      }

      if (fcp !== null && fcp > 1800) {
        issues.push({
          type: fcp > 3000 ? 'error' : 'warning',
          message: `First Contentful Paint is ${(fcp / 1000).toFixed(1)}s (should be < 1.8s)`,
          recommendation: 'Reduce server response time and eliminate render-blocking resources',
        });
      }

      if (ttfb !== null && ttfb > 800) {
        issues.push({
          type: ttfb > 1800 ? 'error' : 'warning',
          message: `Time to First Byte is ${ttfb}ms (should be < 800ms)`,
          recommendation: 'Optimize server response time or use a CDN',
        });
      }

      // Page size warning
      if (pageSize > 3000000) { // 3MB
        issues.push({
          type: 'warning',
          message: `Page size is ${(pageSize / 1000000).toFixed(1)}MB (should be < 3MB)`,
          recommendation: 'Compress images, minify CSS/JS, and remove unused code',
        });
      }

    }
  } catch (error) {
    // If PageSpeed API fails, provide basic performance info
    issues.push({
      type: 'info',
      message: 'Could not fetch detailed performance metrics',
      recommendation: 'Performance analysis limited. Try again later.',
    });
  }

  // Add general recommendations if score is low
  if (performanceScore < 50) {
    issues.push({
      type: 'error',
      message: 'Overall performance needs significant improvement',
      recommendation: 'Focus on optimizing images, reducing JavaScript, and improving server response time',
    });
  } else if (performanceScore < 75) {
    issues.push({
      type: 'warning',
      message: 'Performance could be improved',
      recommendation: 'Review the opportunities listed to improve page speed',
    });
  }

  return {
    score: performanceScore,
    loadTime,
    pageSize,
    requestCount,
    coreWebVitals: {
      lcp,
      fid,
      cls,
      fcp,
      ttfb,
    },
    opportunities: opportunities.slice(0, 5), // Top 5 opportunities
    issues,
  };
}
