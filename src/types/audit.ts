export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

export interface SEOAuditResult {
  score: number;
  title: {
    exists: boolean;
    content: string | null;
    length: number;
    isOptimal: boolean;
  };
  metaDescription: {
    exists: boolean;
    content: string | null;
    length: number;
    isOptimal: boolean;
  };
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    hasProperHierarchy: boolean;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
  };
  canonical: {
    exists: boolean;
    url: string | null;
  };
  openGraph: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasImage: boolean;
  };
  twitterCard: {
    hasCard: boolean;
    hasTitle: boolean;
    hasDescription: boolean;
  };
  robotsTxt: boolean;
  sitemap: boolean;
  viewport: boolean;
  issues: SEOIssue[];
}

export interface PerformanceAuditResult {
  score: number;
  loadTime: number;
  pageSize: number;
  requestCount: number;
  coreWebVitals: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
  };
  opportunities: {
    title: string;
    description: string;
    savings: string;
  }[];
  issues: SEOIssue[];
}

export interface SecurityAuditResult {
  score: number;
  ssl: {
    valid: boolean;
    issuer: string | null;
    expiryDate: string | null;
  };
  https: boolean;
  headers: {
    contentSecurityPolicy: boolean;
    xContentTypeOptions: boolean;
    xFrameOptions: boolean;
    strictTransportSecurity: boolean;
    xXssProtection: boolean;
    referrerPolicy: boolean;
  };
  mixedContent: boolean;
  issues: SEOIssue[];
}

export interface AuditResults {
  seoScore: number;
  performanceScore: number;
  securityScore: number;
  overallScore: number;
  seo: SEOAuditResult;
  performance: PerformanceAuditResult;
  security: SecurityAuditResult;
  auditDate: Date;
  websiteUrl: string;
}

export interface LeadFormData {
  name: string;
  businessName: string;
  email: string;
  whatsappNo: string;
  websiteUrl: string;
}

export interface Lead extends LeadFormData {
  _id: string;
  auditResults?: AuditResults;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
