import { SecurityAuditResult, SEOIssue } from '@/types/audit';

export async function analyzeSecurity(url: string): Promise<SecurityAuditResult> {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Ensure URL has protocol
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const urlObj = new URL(normalizedUrl);
  const isHttps = urlObj.protocol === 'https:';

  // Check HTTPS
  if (!isHttps) {
    issues.push({
      type: 'error',
      message: 'Website is not using HTTPS',
      recommendation: 'Install an SSL certificate and redirect HTTP to HTTPS',
    });
    score -= 30;
  }

  // Fetch the page to check headers
  let headers: Headers | null = null;
  try {
    const response = await fetch(normalizedUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)',
      },
    });
    headers = response.headers;
  } catch {
    // If HEAD fails, try GET
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)',
        },
      });
      headers = response.headers;
    } catch {
      issues.push({
        type: 'error',
        message: 'Could not connect to website',
        recommendation: 'Ensure the website is accessible',
      });
      score -= 20;
    }
  }

  // Security headers check
  const securityHeaders = {
    contentSecurityPolicy: false,
    xContentTypeOptions: false,
    xFrameOptions: false,
    strictTransportSecurity: false,
    xXssProtection: false,
    referrerPolicy: false,
  };

  if (headers) {
    // Content-Security-Policy
    const csp = headers.get('content-security-policy');
    securityHeaders.contentSecurityPolicy = !!csp;
    if (!csp) {
      issues.push({
        type: 'warning',
        message: 'Missing Content-Security-Policy header',
        recommendation: 'Add a Content-Security-Policy header to prevent XSS attacks',
      });
      score -= 10;
    }

    // X-Content-Type-Options
    const xcto = headers.get('x-content-type-options');
    securityHeaders.xContentTypeOptions = xcto?.toLowerCase() === 'nosniff';
    if (!securityHeaders.xContentTypeOptions) {
      issues.push({
        type: 'warning',
        message: 'Missing or invalid X-Content-Type-Options header',
        recommendation: 'Add "X-Content-Type-Options: nosniff" header',
      });
      score -= 5;
    }

    // X-Frame-Options
    const xfo = headers.get('x-frame-options');
    securityHeaders.xFrameOptions = !!xfo && ['deny', 'sameorigin'].includes(xfo.toLowerCase());
    if (!securityHeaders.xFrameOptions) {
      issues.push({
        type: 'warning',
        message: 'Missing or invalid X-Frame-Options header',
        recommendation: 'Add "X-Frame-Options: DENY" or "SAMEORIGIN" to prevent clickjacking',
      });
      score -= 5;
    }

    // Strict-Transport-Security (HSTS)
    const hsts = headers.get('strict-transport-security');
    securityHeaders.strictTransportSecurity = !!hsts;
    if (!hsts && isHttps) {
      issues.push({
        type: 'warning',
        message: 'Missing Strict-Transport-Security header',
        recommendation: 'Add HSTS header to enforce HTTPS connections',
      });
      score -= 10;
    }

    // X-XSS-Protection (deprecated but still checked)
    const xxss = headers.get('x-xss-protection');
    securityHeaders.xXssProtection = xxss === '1; mode=block' || xxss === '1';
    // Don't deduct points for this as it's deprecated

    // Referrer-Policy
    const rp = headers.get('referrer-policy');
    securityHeaders.referrerPolicy = !!rp;
    if (!rp) {
      issues.push({
        type: 'info',
        message: 'Missing Referrer-Policy header',
        recommendation: 'Add a Referrer-Policy header to control referrer information',
      });
      score -= 3;
    }
  }

  // Check for mixed content by fetching the page
  let hasMixedContent = false;
  if (isHttps) {
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)',
        },
      });
      const html = await response.text();

      // Simple check for http:// references in src and href attributes
      const httpReferences = html.match(/(?:src|href)=["']http:\/\//gi);
      if (httpReferences && httpReferences.length > 0) {
        hasMixedContent = true;
        issues.push({
          type: 'warning',
          message: `Potential mixed content detected (${httpReferences.length} HTTP resources)`,
          recommendation: 'Update all resource URLs to use HTTPS',
        });
        score -= 10;
      }
    } catch {
      // Ignore errors during mixed content check
    }
  }

  // SSL check (basic - just verify HTTPS works)
  let sslValid = false;
  let sslIssuer: string | null = null;
  let sslExpiry: string | null = null;

  if (isHttps) {
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)',
        },
      });
      sslValid = response.ok || response.status < 500;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('certificate') || errorMessage.includes('SSL')) {
        issues.push({
          type: 'error',
          message: 'SSL certificate issue detected',
          recommendation: 'Check your SSL certificate validity and configuration',
        });
        score -= 20;
      }
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Add overall recommendation if score is low
  if (score < 50) {
    issues.push({
      type: 'error',
      message: 'Website security needs significant improvement',
      recommendation: 'Prioritize adding HTTPS and security headers',
    });
  }

  return {
    score,
    ssl: {
      valid: sslValid,
      issuer: sslIssuer,
      expiryDate: sslExpiry,
    },
    https: isHttps,
    headers: securityHeaders,
    mixedContent: hasMixedContent,
    issues,
  };
}
