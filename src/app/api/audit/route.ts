import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { performFullAudit } from '@/lib/audit';
import { sendAuditReport } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, businessName, email, whatsappNo, websiteUrl } = body;

    // Validate required fields
    if (!name || !businessName || !email || !whatsappNo || !websiteUrl) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate URL format
    let normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create lead record
    const lead = await Lead.create({
      name,
      businessName,
      email,
      whatsappNo,
      websiteUrl: normalizedUrl,
      emailSent: false,
    });

    // Perform the audit
    let auditResults;
    try {
      auditResults = await performFullAudit(normalizedUrl);
    } catch (auditError) {
      console.error('Audit error:', auditError);
      return NextResponse.json(
        {
          error: 'Failed to audit website. Please check the URL and try again.',
          leadId: lead._id.toString()
        },
        { status: 500 }
      );
    }

    // Update lead with audit results
    lead.auditResults = auditResults;
    await lead.save();

    // Send email report
    let emailSent = false;
    try {
      await sendAuditReport({
        to: email,
        name,
        businessName,
        websiteUrl: normalizedUrl,
        auditResults,
      });
      lead.emailSent = true;
      await lead.save();
      emailSent = true;
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      leadId: lead._id.toString(),
      auditResults,
      emailSent,
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
