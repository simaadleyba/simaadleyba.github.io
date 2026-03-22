import { useRef, useEffect } from 'react';
import katex from 'katex';

export default function FormulaCard({ latex, terms = [], title }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // Build colored latex string
    let coloredLatex = latex;
    if (terms.length > 0) {
      // Sort terms by symbol length descending to avoid partial replacements
      const sorted = [...terms].sort((a, b) => b.symbol.length - a.symbol.length);
      sorted.forEach(({ symbol, color }) => {
        const hexColor = color.replace('#', '');
        coloredLatex = coloredLatex.split(symbol).join(`\\textcolor[HTML]{${hexColor}}{${symbol}}`);
      });
    }

    try {
      katex.render(coloredLatex, ref.current, {
        throwOnError: false,
        displayMode: true,
        trust: true,
      });
    } catch (e) {
      // Fallback: render without colors
      try {
        katex.render(latex, ref.current, { throwOnError: false, displayMode: true });
      } catch (e2) {
        // silently fail
      }
    }
  }, [latex, terms]);

  return (
    <div className="formula-card">
      {title && (
        <div style={{
          fontSize: '0.78rem',
          color: 'var(--muted)',
          marginBottom: '0.5rem',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </div>
      )}
      <div ref={ref} style={{ overflowX: 'auto' }} />
      {terms.length > 0 && (
        <div className="formula-legend">
          {terms.map(({ color, label }, i) => (
            <div key={i} className="formula-legend-item">
              <div className="formula-legend-dot" style={{ background: color }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
