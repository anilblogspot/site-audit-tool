import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import AuditResults from '@/components/AuditResults';
import mongoose from 'mongoose';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      title: 'Audit Not Found',
    };
  }

  await connectDB();
  const lead = await Lead.findById(id);

  if (!lead) {
    return {
      title: 'Audit Not Found',
    };
  }

  return {
    title: `Website Audit Results - ${lead.websiteUrl}`,
    description: `SEO, Performance, and Security audit results for ${lead.websiteUrl}`,
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();
  const lead = await Lead.findById(id).lean();

  if (!lead || !lead.auditResults) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AuditResults
          results={lead.auditResults}
          websiteUrl={lead.websiteUrl}
          businessName={lead.businessName}
        />

        {/* Back button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Audit Another Website
          </a>
        </div>
      </div>
    </main>
  );
}
