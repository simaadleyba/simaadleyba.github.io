import { Suspense, useEffect, useState } from 'react';

export default function ArtifactWrapper({ title, children }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = expanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [expanded]);

  const content = (
    <Suspense fallback={<div style={{ color: '#8b9bd4', fontSize: '0.9rem', padding: '1rem 0' }}>Loading interactive component...</div>}>
      {children}
    </Suspense>
  );

  const expandBtn = (
    <button
      onClick={() => setExpanded(e => !e)}
      title={expanded ? 'Close' : 'Expand to full view'}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '0.18rem 0.55rem',
        cursor: 'pointer',
        color: 'var(--muted)',
        fontSize: '0.72rem',
        fontFamily: 'inherit',
        lineHeight: 1.4,
      }}
    >
      {expanded ? '✕ Close' : '⤢ Expand'}
    </button>
  );

  return (
    <>
      <div className="artifact-card" style={{ display: expanded ? 'none' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h4 style={{ margin: 0 }}>{title}</h4>
          {expandBtn}
        </div>
        {content}
      </div>

      {expanded && (
        <>
          <div
            onClick={() => setExpanded(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(20, 22, 32, 0.22)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <div style={{
            position: 'fixed',
            top: 'calc(3.2rem + 1.2rem)',
            left: '1.5rem', right: '1.5rem', bottom: '1.5rem',
            zIndex: 1001,
            background: 'rgba(255, 255, 255, 0.90)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(226, 228, 234, 0.85)',
            borderRadius: '14px',
            boxShadow: '0 24px 80px rgba(91, 110, 174, 0.18)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {title}
              </span>
              {expandBtn}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {content}
            </div>
          </div>
        </>
      )}
    </>
  );
}
