import { useState } from 'react';

function entropy(p) {
  if (p <= 0 || p >= 1) return 0;
  return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
}

function gini(p) {
  return 2 * p * (1 - p);
}

function error(p) {
  return 1 - Math.max(p, 1 - p);
}

export default function ImpurityExplorer() {
  const [p, setP] = useState(0.5);

  const svgW = 520;
  const svgH = 240;
  const m = { top: 20, right: 24, bottom: 44, left: 52 };
  const W = svgW - m.left - m.right;
  const H = svgH - m.top - m.bottom;

  const xS = (v) => m.left + v * W;
  const yS = (v) => m.top + H - v * H;

  const nPoints = 300;
  const pts = Array.from({ length: nPoints + 1 }, (_, i) => i / nPoints);

  const makePath = (fn) =>
    pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xS(v).toFixed(2)} ${yS(fn(v)).toFixed(2)}`).join(' ');

  const eVal = entropy(p).toFixed(3);
  const gVal = gini(p).toFixed(3);
  const errVal = error(p).toFixed(3);

  const cx = xS(p);

  return (
    <div>
      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.25rem' }}>
          Proportion of class A:{' '}
          <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>p = {p.toFixed(2)}</strong>
        </label>
        <input
          type="range" min="0" max="1" step="0.01" value={p}
          onChange={e => setP(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: 'visible', display: 'block' }}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <line key={v}
            x1={m.left} x2={m.left + W}
            y1={yS(v)} y2={yS(v)}
            stroke="#e2e4ea" strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={m.top + H} stroke="#ccc" strokeWidth="1" />
        <line x1={m.left} y1={m.top + H} x2={m.left + W} y2={m.top + H} stroke="#ccc" strokeWidth="1" />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <text key={v} x={m.left - 8} y={yS(v) + 4} textAnchor="end" fontSize="11" fill="#888">{v}</text>
        ))}

        {/* X-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <text key={v} x={xS(v)} y={m.top + H + 16} textAnchor="middle" fontSize="11" fill="#888">{v}</text>
        ))}

        {/* Axis titles */}
        <text x={m.left + W / 2} y={svgH - 2} textAnchor="middle" fontSize="12" fill="#888">
          p (proportion of class A)
        </text>
        <text
          transform={`translate(12, ${m.top + H / 2}) rotate(-90)`}
          textAnchor="middle" fontSize="12" fill="#888"
        >
          impurity
        </text>

        {/* Curves */}
        <path d={makePath(entropy)} fill="none" stroke="#2980B9" strokeWidth="2.5" />
        <path d={makePath(gini)} fill="none" stroke="#E67E22" strokeWidth="2.5" />
        <path d={makePath(error)} fill="none" stroke="#27AE60" strokeWidth="2.5" strokeDasharray="6,3" />

        {/* Vertical cursor line */}
        <line
          x1={cx} x2={cx} y1={m.top} y2={m.top + H}
          stroke="#7B6FD6" strokeWidth="1.5" strokeDasharray="4,3"
        />

        {/* Dots at cursor */}
        <circle cx={cx} cy={yS(entropy(p))} r="4.5" fill="#2980B9" />
        <circle cx={cx} cy={yS(gini(p))} r="4.5" fill="#E67E22" />
        <circle cx={cx} cy={yS(error(p))} r="4.5" fill="#27AE60" />

        {/* Legend box */}
        <rect x={m.left + W - 168} y={m.top + 4} width="164" height="76" rx="5"
          fill="white" stroke="#e2e4ea" strokeWidth="1" />
        <line x1={m.left + W - 158} x2={m.left + W - 138} y1={m.top + 20} y2={m.top + 20}
          stroke="#2980B9" strokeWidth="2.5" />
        <text x={m.left + W - 132} y={m.top + 24} fontSize="11" fill="#555">
          Entropy = {eVal}
        </text>
        <line x1={m.left + W - 158} x2={m.left + W - 138} y1={m.top + 40} y2={m.top + 40}
          stroke="#E67E22" strokeWidth="2.5" />
        <text x={m.left + W - 132} y={m.top + 44} fontSize="11" fill="#555">
          Gini = {gVal}
        </text>
        <line x1={m.left + W - 158} x2={m.left + W - 138} y1={m.top + 60} y2={m.top + 60}
          stroke="#27AE60" strokeWidth="2.5" strokeDasharray="6,3" />
        <text x={m.left + W - 132} y={m.top + 64} fontSize="11" fill="#555">
          Error = {errVal}
        </text>
      </svg>

      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.4rem 0 0', textAlign: 'center' }}>
        All three measures peak at p = 0.5 (maximum uncertainty) and reach 0 at p = 0 or p = 1 (pure node).
      </p>
    </div>
  );
}
