import type { Metadata } from 'next';
import './globals.css';
import InclusyWidget from '@/components/InclusyWidget';

const SITE_URL = 'https://www.seanleduc.ca';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sean Leduc | The Inclusion Strategist | Financial Advisor & Keynote Speaker',
    template: '%s | Sean Leduc',
  },
  description:
    'Empowering individuals and corporations across Ontario with financial & insurance strategies, motivational keynote speaking on resilience, and inclusive community impact through U.N.I.T.E.',
  keywords: [
    'Financial Advisor Carleton Place',
    'Insurance Specialist Ottawa',
    'RDSP Specialist Ontario',
    'Keynote Motivational Speaker',
    'Life Insurance Strategy Ontario',
    'Corporate Group Benefits Ottawa',
    'Key Person Insurance Carleton Place',
    'U.N.I.T.E. Charity',
    'The Inclusion Strategist',
    'Sean Leduc',
  ],
  authors: [{ name: 'Sean Leduc', url: SITE_URL }],
  creator: 'Sean Leduc',
  publisher: 'Sean Leduc & Associates',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Sean Leduc | The Power of Perspective',
    description:
      'High-velocity financial strategy, corporate insurance, and motivational keynote speaking in Carleton Place & Ontario.',
    url: SITE_URL,
    siteName: 'Sean Leduc - The Inclusion Strategist',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sean Leduc | Financial Strategy & Keynote Speaker',
    description:
      'Ontario-wide financial advisory, RDSP planning, and motivational keynotes.',
    creator: '@seanleduc',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rich Structured Data for Google Local Business & Financial Service
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Sean Leduc - The Inclusion Strategist',
    image: `${SITE_URL}/og-image.jpg`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: '+1-613-555-0199', // Update with direct business phone
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Carleton Place',
      addressLocality: 'Carleton Place',
      addressRegion: 'ON',
      postalCode: 'K7C 3P1',
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.141,
      longitude: -76.145,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:30',
      closes: '17:00',
    },
    sameAs: [
      'https://www.linkedin.com/in/seanleduc',
      'https://www.facebook.com/seanleduc',
    ],
    areaServed: ['Carleton Place', 'Lanark County', 'Ottawa', 'Ontario'],
    description:
      'Financial Strategy, Life & Disability Insurance, Keyperson Solutions, RDSP Planning, and Keynote Speaking across Ontario.',
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
        <InclusyWidget />
      </body>
    </html>
  );
}
