import { AuditResults } from '@/types/audit';
import { analyzeSEO } from './seo';
import { analyzePerformance } from './performance';
import { analyzeSecurity } from './security';

export async function performFullAudit(websiteUrl: string): Promise<AuditResults> {
  // Run all audits in parallel for faster results
  const [seoResult, performanceResult, securityResult] = await Promise.all([
    analyzeSEO(websiteUrl),
    analyzePerformance(websiteUrl),
    analyzeSecurity(websiteUrl),
  ]);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    seoResult.score * 0.35 +
    performanceResult.score * 0.35 +
    securityResult.score * 0.30
  );

  return {
    seoScore: seoResult.score,
    performanceScore: performanceResult.score,
    securityScore: securityResult.score,
    overallScore,
    seo: seoResult,
    performance: performanceResult,
    security: securityResult,
    auditDate: new Date(),
    websiteUrl,
  };
}

export { analyzeSEO } from './seo';
export { analyzePerformance } from './performance';
export { analyzeSecurity } from './security';
