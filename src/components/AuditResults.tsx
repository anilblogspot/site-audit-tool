'use client';

import { AuditResults as AuditResultsType, SEOIssue } from '@/types/audit';
import ScoreCard from './ScoreCard';

interface AuditResultsProps {
  results: AuditResultsType;
  websiteUrl: string;
  businessName: string;
}

function IssuesList({ issues, title }: { issues: SEOIssue[]; title: string }) {
  if (issues.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              issue.type === 'error'
                ? 'bg-red-50 border-red-200'
                : issue.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">
                {issue.type === 'error'
                  ? '🔴'
                  : issue.type === 'warning'
                  ? '🟡'
                  : '🔵'}
              </span>
              <div>
                <p
                  className={`font-medium ${
                    issue.type === 'error'
                      ? 'text-red-800'
                      : issue.type === 'warning'
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                  }`}
                >
                  {issue.message}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    issue.type === 'error'
                      ? 'text-red-600'
                      : issue.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`}
                >
                  💡 {issue.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AuditResults({
  results,
  websiteUrl,
  businessName,
}: AuditResultsProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Website Audit Results
        </h1>
        <p className="text-gray-600">
          {businessName} • <span className="text-blue-600">{websiteUrl}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Audited on {new Date(results.auditDate).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Score */}
      <div className="flex justify-center">
        <ScoreCard title="Overall Score" score={results.overallScore} size="lg" />
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard
          title="SEO"
          score={results.seoScore}
          icon={
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <ScoreCard
          title="Performance"
          score={results.performanceScore}
          icon={
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <ScoreCard
          title="Security"
          score={results.securityScore}
          icon={
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>

      {/* Detailed SEO Results */}
      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔍</span> SEO Analysis
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Title Tag */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Title Tag</h4>
            {results.seo.title.exists ? (
              <>
                <p className="text-green-600 text-sm mb-1">✅ Present</p>
                <p className="text-gray-600 text-sm truncate">
                  &quot;{results.seo.title.content}&quot;
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Length: {results.seo.title.length} characters
                  {results.seo.title.isOptimal ? ' (optimal)' : ' (not optimal: 30-60 recommended)'}
                </p>
              </>
            ) : (
              <p className="text-red-600 text-sm">❌ Missing</p>
            )}
          </div>

          {/* Meta Description */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Meta Description</h4>
            {results.seo.metaDescription.exists ? (
              <>
                <p className="text-green-600 text-sm mb-1">✅ Present</p>
                <p className="text-gray-500 text-xs">
                  Length: {results.seo.metaDescription.length} characters
                  {results.seo.metaDescription.isOptimal ? ' (optimal)' : ' (120-160 recommended)'}
                </p>
              </>
            ) : (
              <p className="text-red-600 text-sm">❌ Missing</p>
            )}
          </div>

          {/* Headings */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Heading Structure</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">H1:</span>{' '}
                <span className={results.seo.headings.h1Count === 1 ? 'text-green-600' : 'text-yellow-600'}>
                  {results.seo.headings.h1Count}
                </span>
              </div>
              <div>
                <span className="text-gray-500">H2:</span> {results.seo.headings.h2Count}
              </div>
              <div>
                <span className="text-gray-500">H3:</span> {results.seo.headings.h3Count}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Images</h4>
            <p className="text-sm">
              <span className="text-green-600">{results.seo.images.withAlt}</span>
              <span className="text-gray-500">/{results.seo.images.total} with alt text</span>
            </p>
            {results.seo.images.withoutAlt > 0 && (
              <p className="text-yellow-600 text-xs mt-1">
                {results.seo.images.withoutAlt} images missing alt text
              </p>
            )}
          </div>

          {/* Links */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Links</h4>
            <p className="text-sm">
              Internal: {results.seo.links.internal} • External: {results.seo.links.external}
            </p>
          </div>

          {/* Technical SEO */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Technical SEO</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${results.seo.viewport ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Viewport {results.seo.viewport ? '✓' : '✗'}
              </span>
              <span className={`px-2 py-1 rounded ${results.seo.canonical.exists ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                Canonical {results.seo.canonical.exists ? '✓' : '✗'}
              </span>
              <span className={`px-2 py-1 rounded ${results.seo.robotsTxt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                robots.txt {results.seo.robotsTxt ? '✓' : '✗'}
              </span>
              <span className={`px-2 py-1 rounded ${results.seo.sitemap ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                sitemap.xml {results.seo.sitemap ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>

        <IssuesList issues={results.seo.issues} title="SEO Issues" />
      </section>

      {/* Detailed Performance Results */}
      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Performance Analysis
        </h2>

        {/* Core Web Vitals */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {results.performance.coreWebVitals.lcp !== null && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">LCP</p>
              <p className={`text-lg font-bold ${
                results.performance.coreWebVitals.lcp <= 2500 ? 'text-green-600' :
                results.performance.coreWebVitals.lcp <= 4000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMs(results.performance.coreWebVitals.lcp)}
              </p>
            </div>
          )}
          {results.performance.coreWebVitals.fcp !== null && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">FCP</p>
              <p className={`text-lg font-bold ${
                results.performance.coreWebVitals.fcp <= 1800 ? 'text-green-600' :
                results.performance.coreWebVitals.fcp <= 3000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMs(results.performance.coreWebVitals.fcp)}
              </p>
            </div>
          )}
          {results.performance.coreWebVitals.cls !== null && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">CLS</p>
              <p className={`text-lg font-bold ${
                results.performance.coreWebVitals.cls <= 0.1 ? 'text-green-600' :
                results.performance.coreWebVitals.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {results.performance.coreWebVitals.cls.toFixed(3)}
              </p>
            </div>
          )}
          {results.performance.coreWebVitals.ttfb !== null && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">TTFB</p>
              <p className={`text-lg font-bold ${
                results.performance.coreWebVitals.ttfb <= 800 ? 'text-green-600' :
                results.performance.coreWebVitals.ttfb <= 1800 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatMs(results.performance.coreWebVitals.ttfb)}
              </p>
            </div>
          )}
          {results.performance.pageSize > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Page Size</p>
              <p className={`text-lg font-bold ${
                results.performance.pageSize <= 3000000 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {formatBytes(results.performance.pageSize)}
              </p>
            </div>
          )}
        </div>

        {/* Opportunities */}
        {results.performance.opportunities.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Improvement Opportunities</h4>
            <div className="space-y-2">
              {results.performance.opportunities.map((opp, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-800">{opp.title}</p>
                  <p className="text-sm text-blue-600">{opp.savings}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <IssuesList issues={results.performance.issues} title="Performance Issues" />
      </section>

      {/* Detailed Security Results */}
      <section className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔒</span> Security Analysis
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* SSL/HTTPS */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">HTTPS & SSL</h4>
            <div className="space-y-1">
              <p className={`text-sm ${results.security.https ? 'text-green-600' : 'text-red-600'}`}>
                {results.security.https ? '✅' : '❌'} HTTPS
              </p>
              <p className={`text-sm ${results.security.ssl.valid ? 'text-green-600' : 'text-red-600'}`}>
                {results.security.ssl.valid ? '✅' : '❌'} SSL Certificate
              </p>
              <p className={`text-sm ${!results.security.mixedContent ? 'text-green-600' : 'text-yellow-600'}`}>
                {!results.security.mixedContent ? '✅' : '⚠️'} No Mixed Content
              </p>
            </div>
          </div>

          {/* Security Headers */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Security Headers</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className={results.security.headers.contentSecurityPolicy ? 'text-green-600' : 'text-red-600'}>
                {results.security.headers.contentSecurityPolicy ? '✅' : '❌'} CSP
              </span>
              <span className={results.security.headers.strictTransportSecurity ? 'text-green-600' : 'text-red-600'}>
                {results.security.headers.strictTransportSecurity ? '✅' : '❌'} HSTS
              </span>
              <span className={results.security.headers.xContentTypeOptions ? 'text-green-600' : 'text-red-600'}>
                {results.security.headers.xContentTypeOptions ? '✅' : '❌'} X-Content-Type
              </span>
              <span className={results.security.headers.xFrameOptions ? 'text-green-600' : 'text-red-600'}>
                {results.security.headers.xFrameOptions ? '✅' : '❌'} X-Frame-Options
              </span>
              <span className={results.security.headers.referrerPolicy ? 'text-green-600' : 'text-yellow-600'}>
                {results.security.headers.referrerPolicy ? '✅' : '⚠️'} Referrer-Policy
              </span>
              <span className={results.security.headers.xXssProtection ? 'text-green-600' : 'text-gray-400'}>
                {results.security.headers.xXssProtection ? '✅' : '–'} X-XSS-Protection
              </span>
            </div>
          </div>
        </div>

        <IssuesList issues={results.security.issues} title="Security Issues" />
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Need Help Improving Your Website?</h2>
        <p className="mb-4 text-blue-100">
          Our team of experts can help you fix these issues and boost your website&apos;s performance.
        </p>
        <a
          href="mailto:contact@yourcompany.com"
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
        >
          Get a Free Consultation
        </a>
      </section>
    </div>
  );
}
