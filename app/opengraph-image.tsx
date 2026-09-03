import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Barnx — Barnabas Mikel';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          color: '#050505',
          padding: '64px 72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, fontWeight: 800 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#050505',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
            }}
          >
            B
          </div>
          Barnx
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 960 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, marginBottom: 24 }}>BUILD • AUTOMATE • SCALE</div>
          <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 900, letterSpacing: -3 }}>Barnabas Mikel</div>
          <div style={{ fontSize: 31, lineHeight: 1.35, marginTop: 22, color: '#424242' }}>
            Frontend-Focused Full-Stack Engineer building modern web applications with AI-powered features and intelligent automations.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 20, color: '#666666' }}>
          <span>React · Vue · Next.js · TypeScript · Node.js · Docker</span>
          <span>barnx-portfolio-v2.vercel.app</span>
        </div>
      </div>
    ),
    size,
  );
}
