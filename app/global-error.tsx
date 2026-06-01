'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a0a0a',
          color: '#e5e5e5',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>Application error</h1>
          <p style={{ marginTop: 8, color: '#a3a3a3', fontSize: 14 }}>
            A critical error prevented the app from rendering.
          </p>
          {error.digest && (
            <p style={{ marginTop: 8, color: '#737373', fontSize: 12, fontFamily: 'monospace' }}>
              {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #404040',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
