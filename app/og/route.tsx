import { ImageResponse } from 'next/og';

// Edge runtime ensures sub-100ms image generation globally
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Support dynamic page titles via search parameter (e.g. /og?title=Motivational+Speaking)
    const hasTitle = searchParams.has('title');
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 90)
      : 'Transforming Strategic Growth Through The Power of Perspective';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#020617',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
            color: '#f8fafc',
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(37, 99, 235, 0.28) 0%, rgba(2, 6, 23, 1) 70%)',
          }}
        >
          {/* Header Brand Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '24px',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
              }}
            >
              SL
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
                Sean Leduc
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#60a5fa',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}
              >
                The Inclusion Strategist
              </span>
            </div>
          </div>

          {/* Main Headline Body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '960px',
            }}
          >
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                margin: 0,
                color: '#ffffff',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '22px',
                color: '#94a3b8',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Financial & Corporate Advisory &bull; Keynote Speaker &bull; U.N.I.T.E. Charity
            </p>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid #1e293b',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                }}
              />
              <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>
                Carleton Place &bull; Ontario-Wide Practice
              </span>
            </div>
            <span style={{ fontSize: '18px', color: '#3b82f6', fontWeight: '700' }}>
              seanleduc.ca
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate OpenGraph image: ${errorMessage}`, {
      status: 500,
    });
  }
}
