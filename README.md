# Site Audit Tool

A comprehensive website audit tool built with Next.js that captures leads, performs SEO/Performance/Security audits, sends email reports via Resend, and stores leads in MongoDB Atlas. Designed for WordPress iframe embedding.

## Features

- **Lead Capture Form**: Collects name, business name, email, WhatsApp number, and website URL
- **Comprehensive Website Audit**:
  - **SEO Analysis**: Title tags, meta descriptions, headings, images, links, Open Graph, Twitter Cards
  - **Performance Analysis**: Core Web Vitals via Google PageSpeed Insights API
  - **Security Analysis**: HTTPS, SSL, security headers, mixed content detection
- **Email Reports**: Professional HTML email reports sent via Resend
- **MongoDB Storage**: All leads and audit results stored in MongoDB Atlas
- **Responsive Design**: Works on all devices and optimized for iframe embedding

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas with Mongoose
- **Email**: Resend with React Email
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **Audit Libraries**: Cheerio (HTML parsing), Google PageSpeed Insights API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Resend account
- (Optional) Google Cloud account for PageSpeed API key

### Installation

1. Clone the repository and install dependencies:

```bash
cd site-audit-tool
npm install
```

2. Copy the environment example file:

```bash
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
RESEND_API_KEY=re_...
EMAIL_FROM=Site Audit <audit@yourdomain.com>
GOOGLE_PAGESPEED_API_KEY=... (optional)
NEXT_PUBLIC_SITE_URL=https://your-deployed-url.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |
| `EMAIL_FROM` | No | Sender email address (default: `Site Audit <audit@resend.dev>`) |
| `GOOGLE_PAGESPEED_API_KEY` | No | Google PageSpeed API key (recommended for higher rate limits) |
| `NEXT_PUBLIC_SITE_URL` | No | Your deployed site URL |

## API Endpoints

### POST /api/audit
Performs a website audit and stores lead information.

**Request Body:**
```json
{
  "name": "John Doe",
  "businessName": "Acme Inc",
  "email": "john@example.com",
  "whatsappNo": "+1234567890",
  "websiteUrl": "example.com"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "...",
  "auditResults": { ... },
  "emailSent": true
}
```

### GET /api/leads
Lists all leads with pagination (for admin purposes).

### GET /api/leads/[id]
Gets a single lead with audit details.

### POST /api/send-report
Resends the audit report email.

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel

3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `GOOGLE_PAGESPEED_API_KEY` (optional)
   - `NEXT_PUBLIC_SITE_URL`

4. Deploy!

## WordPress Integration

Add this iframe to your WordPress page:

```html
<iframe
  src="https://your-audit-tool.vercel.app"
  width="100%"
  height="800px"
  frameborder="0"
  style="border: none; max-width: 100%;">
</iframe>
```

## Customization

### Email Template
Edit `src/lib/email/templates/report.tsx` to customize the email report styling and content.

### Branding
- Update colors in `src/app/globals.css`
- Replace company information in the email template
- Modify the CTA sections in `src/components/AuditResults.tsx`

### Audit Logic
- SEO checks: `src/lib/audit/seo.ts`
- Performance checks: `src/lib/audit/performance.ts`
- Security checks: `src/lib/audit/security.ts`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Lead capture form
│   ├── audit/[id]/page.tsx   # Audit results page
│   └── api/
│       ├── audit/route.ts    # Perform website audit
│       ├── leads/route.ts    # List/manage leads
│       └── send-report/route.ts
├── components/
│   ├── LeadForm.tsx
│   ├── AuditResults.tsx
│   ├── ScoreCard.tsx
│   └── LoadingSpinner.tsx
├── lib/
│   ├── mongodb.ts
│   ├── audit/
│   │   ├── seo.ts
│   │   ├── performance.ts
│   │   └── security.ts
│   └── email/
│       ├── resend.ts
│       └── templates/report.tsx
├── models/
│   └── Lead.ts
└── types/
    └── audit.ts
```

## License

MIT
