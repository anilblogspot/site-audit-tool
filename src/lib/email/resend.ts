import { Resend } from 'resend';
import { AuditResults } from '@/types/audit';
import AuditReportEmail from './templates/report';

// Lazy initialization to avoid errors during build
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendAuditReportParams {
  to: string;
  name: string;
  businessName: string;
  websiteUrl: string;
  auditResults: AuditResults;
}

export async function sendAuditReport({
  to,
  name,
  businessName,
  websiteUrl,
  auditResults,
}: SendAuditReportParams): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from: process.env.EMAIL_FROM || 'Site Audit <audit@resend.dev>',
    to: [to],
    subject: `Website Audit Report for ${websiteUrl}`,
    react: AuditReportEmail({
      name,
      businessName,
      websiteUrl,
      auditResults,
    }),
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
