import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import InclusyWidget from '@/components/InclusyWidget';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seanleduc.ca';

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sean Leduc | The Inclusion Strategist & Keynote Speaker',
    template: '%s | Sean Leduc',
  },
  description:
    'Ontario financial strategy & corporate advisory (IPPs, Life & Disability Insurance, Wealth Management), motivational keynote speaking, and U.N.I.T.E. Charity initiatives based in Carleton Place, ON.',
  keywords: [
    'Sean Leduc',
    'The Inclusion Strategist',
    'Financial Advisor Carleton Place',
    'Lanark County Financial Strategy',
    'Individual Pension Plan Ontario',
    'IPP Corporate Tax Retirement Canada',
    'Keynote Speaker Ontario',
    'Motivational Speaker Ottawa',
    'U.N.I.T.E. Charity',
    'The Power of Perspective',
    'Corporate Insurance Advisory',
    'RDSP & Disability Tax Credit Advisory',
  ],
  authors: [{ name: 'Sean Leduc', url: siteUrl }],
  creator: 'Sean Leduc',
  publisher: 'Sean Leduc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteUrl,
    title: 'Sean Leduc | The Inclusion Strategist & Keynote Speaker',
    description:
      'Empowering individuals and business owners across Ontario through corporate financial strategy, motivational speaking, and community outreach.',
    siteName: 'Sean Leduc - The Inclusion Strategist',
    images: [
      {
        url: `${siteUrl}/og`,
        width: 1200,
        height: 630,
        alt: 'Sean Leduc - The Inclusion Strategist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sean Leduc | The Inclusion Strategist & Keynote Speaker',
    description:
      'Financial Strategy, Motivational Keynote Speaking, and U.N.I.T.E. Charity in Ontario.',
    images: [`${siteUrl}/og`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org JSON-LD Structured Data for Local Business & Person Entity
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: 'Sean Leduc',
        jobTitle: 'Financial Strategist & Keynote Speaker',
        knowsAbout: [
          'Financial Strategy',
          'Individual Pension Plans (IPP)',
          'Corporate Insurance & Buy-Sell Funding',
          'Motivational Speaking',
          'Inclusion & Accessibility Advocacy',
        ],
        url: siteUrl,
      },
      {
        '@type': 'FinancialService',
        '@id': `${siteUrl}/#organization`,
        name: 'Sean Leduc - The Inclusion Strategist',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}/og`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Carleton Place',
          addressRegion: 'ON',
          addressCountry: 'CA',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 45.1406,
          longitude: -76.1419,
        },
        areaServed: [
          'Carleton Place',
          'Lanark County',
          'Ottawa',
          'Ontario',
        ],
        priceRange: '$$$',
      },
    ],
  };

  return (
    <html lang="en-CA" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col`}>
        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Global Gemini AI Assistant */}
        <InclusyWidget />
      </body>
    </html>
  );
}
