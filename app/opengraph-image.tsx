import { ImageResponse } from 'next/og';
import { siteConfig } from '@/site.config';

export const runtime = 'edge';
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background:
            'linear-gradient(135deg, oklch(0.28 0.10 260) 0%, oklch(0.18 0.06 280) 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7, letterSpacing: 2, textTransform: 'uppercase' }}>
          {new URL(siteConfig.url).hostname}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{siteConfig.name}</div>
          <div style={{ fontSize: 32, opacity: 0.8, maxWidth: 900 }}>{siteConfig.description}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
