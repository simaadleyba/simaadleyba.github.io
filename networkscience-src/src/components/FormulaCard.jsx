import { useRef, useEffect } from 'react';
import katex from 'katex';

function KatexInline({ latex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, { throwOnError: false, displayMode: false, trust: true });
    } catch (e) {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex]);
  return <span ref={ref} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
}

export default function FormulaCard({ latex, terms = [], title }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // Build colored latex string — single regex pass to avoid re-processing injected hex values
    // Wrapping each replacement in {…} so they are valid in superscript/subscript positions
    let coloredLatex = latex;
    if (terms.length > 0) {
      const sorted = [...terms].sort((a, b) => b.symbol.length - a.symbol.length);
      const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(sorted.map(t => escRe(t.symbol)).join('|'), 'g');
      const symbolMap = Object.fromEntries(sorted.map(t => [t.symbol, t.color.replace('#', '')]));
      coloredLatex = latex.replace(pattern, match => `{\\textcolor{#${symbolMap[match]}}{${match}}}`);
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
          {terms.map(({ symbol, color, label }, i) => {
            const dashIdx = label.indexOf(' — ');
            const desc = dashIdx !== -1 ? label.slice(dashIdx + 3) : label;
            return (
              <div key={i} className="formula-legend-item">
                <div className="formula-legend-dot" style={{ background: color }} />
                <KatexInline latex={symbol} />
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}> — {desc}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
