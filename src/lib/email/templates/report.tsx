import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { AuditResults, SEOIssue } from '@/types/audit';

interface AuditReportEmailProps {
  name: string;
  businessName: string;
  websiteUrl: string;
  auditResults: AuditResults;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

export default function AuditReportEmail({
  name,
  businessName,
  websiteUrl,
  auditResults,
}: AuditReportEmailProps) {
  const allIssues: SEOIssue[] = [
    ...auditResults.seo.issues,
    ...auditResults.performance.issues,
    ...auditResults.security.issues,
  ];

  const topIssues = allIssues
    .filter((issue) => issue.type === 'error' || issue.type === 'warning')
    .slice(0, 5);

  return (
    <Html>
      <Head />
      <Preview>
        {`Your website audit score: ${auditResults.overallScore}/100`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Website Audit Report</Heading>

          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            Thank you for using our website audit tool! Here&apos;s the complete
            analysis for <strong>{websiteUrl}</strong> ({businessName}).
          </Text>

          {/* Overall Score */}
          <Section style={scoreSection}>
            <Heading style={h2}>Overall Score</Heading>
            <div style={scoreCircle}>
              <Text
                style={{
                  ...scoreNumber,
                  color: getScoreColor(auditResults.overallScore),
                }}
              >
                {auditResults.overallScore}
              </Text>
              <Text style={scoreOutOf}>/100</Text>
            </div>
            <Text
              style={{
                ...scoreLabel,
                color: getScoreColor(auditResults.overallScore),
              }}
            >
              {getScoreLabel(auditResults.overallScore)}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Individual Scores */}
          <Section>
            <Heading style={h2}>Detailed Scores</Heading>

            <table style={scoresTable}>
              <tbody>
                <tr>
                  <td style={scoreCell}>
                    <Text style={scoreCategoryLabel}>SEO</Text>
                    <Text
                      style={{
                        ...scoreCategoryValue,
                        color: getScoreColor(auditResults.seoScore),
                      }}
                    >
                      {auditResults.seoScore}/100
                    </Text>
                  </td>
                  <td style={scoreCell}>
                    <Text style={scoreCategoryLabel}>Performance</Text>
                    <Text
                      style={{
                        ...scoreCategoryValue,
                        color: getScoreColor(auditResults.performanceScore),
                      }}
                    >
                      {auditResults.performanceScore}/100
                    </Text>
                  </td>
                  <td style={scoreCell}>
                    <Text style={scoreCategoryLabel}>Security</Text>
                    <Text
                      style={{
                        ...scoreCategoryValue,
                        color: getScoreColor(auditResults.securityScore),
                      }}
                    >
                      {auditResults.securityScore}/100
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Top Issues */}
          {topIssues.length > 0 && (
            <Section>
              <Heading style={h2}>Top Issues to Fix</Heading>
              {topIssues.map((issue, index) => (
                <div key={index} style={issueItem}>
                  <Text style={issueTitle}>
                    {issue.type === 'error' ? '🔴' : '🟡'} {issue.message}
                  </Text>
                  <Text style={issueRecommendation}>
                    ➡️ {issue.recommendation}
                  </Text>
                </div>
              ))}
            </Section>
          )}

          <Hr style={hr} />

          {/* Key Findings */}
          <Section>
            <Heading style={h2}>Key Findings</Heading>

            <Text style={findingCategory}>SEO:</Text>
            <ul style={findingList}>
              <li>
                Title Tag: {auditResults.seo.title.exists ? '✅' : '❌'}{' '}
                {auditResults.seo.title.exists
                  ? `"${auditResults.seo.title.content?.substring(0, 50)}..."`
                  : 'Missing'}
              </li>
              <li>
                Meta Description:{' '}
                {auditResults.seo.metaDescription.exists ? '✅' : '❌'}
              </li>
              <li>
                H1 Tags: {auditResults.seo.headings.h1Count} found
                {auditResults.seo.headings.h1Count === 1 ? ' ✅' : ' ⚠️'}
              </li>
              <li>
                Images: {auditResults.seo.images.withAlt}/
                {auditResults.seo.images.total} have alt text
              </li>
            </ul>

            <Text style={findingCategory}>Performance:</Text>
            <ul style={findingList}>
              {auditResults.performance.coreWebVitals.lcp && (
                <li>
                  LCP:{' '}
                  {(auditResults.performance.coreWebVitals.lcp / 1000).toFixed(
                    1
                  )}
                  s
                </li>
              )}
              {auditResults.performance.coreWebVitals.cls !== null && (
                <li>
                  CLS: {auditResults.performance.coreWebVitals.cls.toFixed(3)}
                </li>
              )}
              {auditResults.performance.pageSize > 0 && (
                <li>
                  Page Size:{' '}
                  {(auditResults.performance.pageSize / 1024 / 1024).toFixed(2)}{' '}
                  MB
                </li>
              )}
            </ul>

            <Text style={findingCategory}>Security:</Text>
            <ul style={findingList}>
              <li>HTTPS: {auditResults.security.https ? '✅' : '❌'}</li>
              <li>
                SSL Valid: {auditResults.security.ssl.valid ? '✅' : '❌'}
              </li>
              <li>
                Security Headers:{' '}
                {Object.values(auditResults.security.headers).filter(Boolean)
                  .length}
                /6 configured
              </li>
            </ul>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Heading style={h2}>Need Help Improving Your Website?</Heading>
            <Text style={text}>
              Our team of experts can help you fix these issues and improve your
              website&apos;s performance, SEO, and security.
            </Text>
            <Link href="mailto:contact@yourcompany.com" style={ctaButton}>
              Contact Us for a Free Consultation
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This report was generated on{' '}
            {new Date(auditResults.auditDate).toLocaleDateString()}. Scores may
            change over time as you make improvements or as external factors
            change.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const h2 = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: '600' as const,
  margin: '20px 0 15px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const scoreSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const scoreCircle = {
  display: 'inline-block',
  textAlign: 'center' as const,
};

const scoreNumber = {
  fontSize: '64px',
  fontWeight: 'bold' as const,
  margin: '0',
  lineHeight: '1',
};

const scoreOutOf = {
  fontSize: '24px',
  color: '#9ca3af',
  margin: '0',
};

const scoreLabel = {
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '10px 0 0',
};

const scoresTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const scoreCell = {
  textAlign: 'center' as const,
  padding: '15px',
  width: '33.33%',
};

const scoreCategoryLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 5px',
};

const scoreCategoryValue = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const issueItem = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '10px',
};

const issueTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 5px',
};

const issueRecommendation = {
  color: '#78350f',
  fontSize: '13px',
  margin: '0',
};

const findingCategory = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '15px 0 5px',
};

const findingList = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0',
  paddingLeft: '20px',
};

const ctaSection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  textDecoration: 'none',
};

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '10px 0',
};
