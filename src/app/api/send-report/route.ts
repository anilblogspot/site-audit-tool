import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { sendAuditReport } from '@/lib/email/resend';
import mongoose from 'mongoose';

// POST /api/send-report - Resend audit report email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return NextResponse.json(
        { error: 'Invalid lead ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (!lead.auditResults) {
      return NextResponse.json(
        { error: 'No audit results found for this lead' },
        { status: 400 }
      );
    }

    // Send the email
    try {
      await sendAuditReport({
        to: lead.email,
        name: lead.name,
        businessName: lead.businessName,
        websiteUrl: lead.websiteUrl,
        auditResults: lead.auditResults,
      });

      lead.emailSent = true;
      await lead.save();

      return NextResponse.json({
        success: true,
        message: 'Report sent successfully',
      });

    } catch (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send report error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
