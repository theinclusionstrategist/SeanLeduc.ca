import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Sean Leduc | The Inclusion Strategist';
  const subtitle =
    searchParams.get('subtitle') ||
    'Financial Strategy • Keynote Speaking • U.N.I.T.E. Charity';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#020617',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.15) 2%, transparent 0%)',
          backgroundSize: '50px 50px',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontWeight: 900,
            }}
          >
            SL
          </div>
          <span
            style={{
              color: '#60a5fa',
              fontSize: '20px',
              letterSpacing: '4px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Sean Leduc • Carleton Place, ON
          </span>
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '1000px',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: '24px',
            fontSize: '18px',
            color: '#38bdf8',
            fontWeight: 600,
          }}
        >
          <span>• Wealth & Corporate Advisory</span>
          <span>• Keynote Speaker</span>
          <span>• RDSP & Disability Planning</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
