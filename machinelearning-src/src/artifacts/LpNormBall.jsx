import { useState, useMemo } from 'react';

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 110;
const SAMPLES = 500;

function computeLpBall(p) {
  const pts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const theta = (i / SAMPLES) * 2 * Math.PI;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const absCos = Math.abs(cosT);
    const absSin = Math.abs(sinT);

    let x, y;
    if (p >= 100) {
      // Chebyshev: scale so max(|x|,|y|) = 1
      const m = Math.max(absCos, absSin);
      x = m > 0 ? cosT / m : cosT;
      y = m > 0 ? sinT / m : sinT;
    } else {
      const norm = Math.pow(Math.pow(absCos, p) + Math.pow(absSin, p), 1 / p);
      x = norm > 0 ? cosT / norm : 0;
      y = norm > 0 ? sinT / norm : 0;
    }
    pts.push([CENTER + x * RADIUS, CENTER - y * RADIUS]);
  }
  return pts;
}

export default function LpNormBall() {
  const [p, setP] = useState(2);

  const effectiveP = p >= 50 ? 1000 : p;
  const pts = useMemo(() => computeLpBall(effectiveP), [effectiveP]);

  const pathD = pts
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`)
    .join(' ') + ' Z';

  const pLabel =
    p >= 50 ? 'p = ∞  (Chebyshev / L∞)' :
    p === 1 ? 'p = 1  (Manhattan / L1)' :
    p === 2 ? 'p = 2  (Euclidean / L2)' :
    p < 1   ? `p = ${p.toFixed(1)}  (non-convex)` :
              `p = ${p.toFixed(1)}`;

  const description =
    p < 1   ? 'Non-convex region — Lp is not a proper metric for p < 1. Ball extends sharply along axes.' :
    p < 1.5 ? 'Near-diamond (L1). The Manhattan distance "ball" is a rotated square.' :
    p < 2.5 ? 'Near-circle (L2). The familiar Euclidean unit sphere.' :
    p < 15  ? 'Rounding toward the unit square, approaching Chebyshev (L∞).' :
              'Approaches the L∞ unit square: max(|x|, |y|) = 1.';

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: '100%', maxWidth: `${SIZE}px`, display: 'block', margin: '0 auto' }}
      >
        {/* Dashed reference: unit square (L∞) */}
        <rect
          x={CENTER - RADIUS} y={CENTER - RADIUS}
          width={RADIUS * 2} height={RADIUS * 2}
          fill="none" stroke="var(--border)" strokeWidth={1} strokeDasharray="5 4"
        />
        {/* Dashed reference: unit circle (L2) */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS}
          fill="none" stroke="var(--border)" strokeWidth={1} strokeDasharray="5 4"
        />
        {/* Axes */}
        <line x1={18} y1={CENTER} x2={SIZE - 18} y2={CENTER} stroke="var(--border)" strokeWidth={1} />
        <line x1={CENTER} y1={18} x2={CENTER} y2={SIZE - 18} stroke="var(--border)" strokeWidth={1} />

        {/* Lp ball */}
        <path d={pathD} fill="rgba(91,110,174,0.13)" stroke="var(--accent)" strokeWidth={2.5} />

        {/* Axis labels */}
        <text x={SIZE - 14} y={CENTER - 6} textAnchor="end" fontSize={11} fill="var(--muted)">x</text>
        <text x={CENTER + 7} y={20} fontSize={11} fill="var(--muted)">y</text>

        {/* Tick: ±1 */}
        {[-1, 1].map(sign => (
          <g key={sign}>
            <line
              x1={CENTER + sign * RADIUS} y1={CENTER - 4}
              x2={CENTER + sign * RADIUS} y2={CENTER + 4}
              stroke="var(--muted)" strokeWidth={1}
            />
            <text
              x={CENTER + sign * RADIUS} y={CENTER + 16}
              textAnchor="middle" fontSize={10} fill="var(--muted)"
            >
              {sign === 1 ? '1' : '−1'}
            </text>
            <line
              x1={CENTER - 4} y1={CENTER - sign * RADIUS}
              x2={CENTER + 4} y2={CENTER - sign * RADIUS}
              stroke="var(--muted)" strokeWidth={1}
            />
            <text
              x={CENTER - 10} y={CENTER - sign * RADIUS + 4}
              textAnchor="end" fontSize={10} fill="var(--muted)"
            >
              {sign === 1 ? '1' : '−1'}
            </text>
          </g>
        ))}
        {/* Origin */}
        <circle cx={CENTER} cy={CENTER} r={2.5} fill="var(--accent)" />
      </svg>

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, minWidth: '210px' }}>
          {pLabel}
        </span>
        <input
          type="range" min={0.5} max={50} step={0.5} value={p}
          onChange={e => setP(Number(e.target.value))}
          style={{ flex: 1, maxWidth: '200px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--muted)' }}>
        <span>― ― unit square (L∞)</span>
        <span>○ unit circle (L2)</span>
        <span style={{ color: 'var(--accent)' }}>— current L<sub>p</sub> ball</span>
      </div>

      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>{description}</p>
    </div>
  );
}
