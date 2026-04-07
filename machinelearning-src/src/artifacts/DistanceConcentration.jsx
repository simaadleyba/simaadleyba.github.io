import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const N_POINTS = 150;
const N_BINS = 28;

// Seeded RNG
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Box-Muller: standard normal sample
function boxMuller(rng) {
  const u1 = Math.max(rng(), 1e-10);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function computeHistogram(d) {
  const rng = mulberry32(42);
  // Generate N_POINTS × d matrix of standard normals
  const pts = Array.from({ length: N_POINTS }, () =>
    Array.from({ length: d }, () => boxMuller(rng))
  );

  // All pairwise distances
  const dists = [];
  for (let i = 0; i < N_POINTS; i++) {
    for (let j = i + 1; j < N_POINTS; j++) {
      let sum = 0;
      for (let k = 0; k < d; k++) {
        const diff = pts[i][k] - pts[j][k];
        sum += diff * diff;
      }
      dists.push(Math.sqrt(sum));
    }
  }

  const dMin = Math.min(...dists);
  const dMax = Math.max(...dists);
  const range = dMax - dMin || 1;
  const binWidth = range / N_BINS;

  const counts = new Array(N_BINS).fill(0);
  for (const dist of dists) {
    const bin = Math.min(Math.floor((dist - dMin) / binWidth), N_BINS - 1);
    counts[bin]++;
  }

  const data = counts.map((count, i) => ({
    x: (dMin + (i + 0.5) * binWidth).toFixed(2),
    count,
  }));

  const ratio = ((dMax - dMin) / dMin).toFixed(3);
  return { data, dMin: dMin.toFixed(2), dMax: dMax.toFixed(2), ratio: parseFloat(ratio) };
}

export default function DistanceConcentration() {
  const [d, setD] = useState(2);

  const { data, dMin, dMax, ratio } = useMemo(() => computeHistogram(d), [d]);

  const insight =
    d <= 3   ? 'Low-dimensional: distances span a wide range — nearest and farthest neighbors are very different.' :
    d <= 10  ? 'As d grows, the distribution begins to tighten.' :
    d <= 30  ? 'The histogram is narrowing. Distances are concentrating around their mean.' :
    d <= 80  ? 'Strong concentration: most pairwise distances are nearly equal.' :
               'All pairwise distances are nearly identical. The notion of "nearest neighbor" is almost meaningless.';

  const ratioColor = ratio < 0.05 ? '#c0392b' : ratio < 0.2 ? '#e67e22' : '#2d6a4f';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          Dimensions d ={' '}
          <strong style={{ color: 'var(--text)', minWidth: '2.2rem', display: 'inline-block' }}>{d}</strong>
        </span>
        <input
          type="range" min={1} max={200} step={1} value={d}
          onChange={e => setD(Number(e.target.value))}
          style={{ flex: 1, maxWidth: '220px' }}
        />
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 9, fill: 'var(--muted)' }}
            interval={Math.floor(N_BINS / 5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: 6 }}
            formatter={(v) => [v, 'pairs']}
            labelFormatter={(l) => `dist ≈ ${l}`}
          />
          <Bar dataKey="count" fill="var(--accent)" opacity={0.72} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '0.7rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--muted)' }}>
        <span>d<sub>min</sub> = <strong style={{ color: 'var(--text)' }}>{dMin}</strong></span>
        <span>d<sub>max</sub> = <strong style={{ color: 'var(--text)' }}>{dMax}</strong></span>
        <span>
          (d<sub>max</sub> − d<sub>min</sub>) / d<sub>min</sub> ={' '}
          <strong style={{ color: ratioColor }}>{ratio.toFixed(3)}</strong>
        </span>
      </div>

      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        {insight}
      </p>
    </div>
  );
}
