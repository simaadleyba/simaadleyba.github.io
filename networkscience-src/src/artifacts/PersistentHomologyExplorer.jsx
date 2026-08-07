import { useMemo, useState } from 'react';
import { mulberry32, sampleNormal } from '../utils/random';
import { makeUnionFind } from '../utils/unionFind';

const W = 380, H = 280, CX = 190, CY = 140;

function presetPoints(preset, n, seed) {
  const rng = mulberry32(seed);
  if (preset === 'two circles') {
    return Array.from({ length: n }, (_, i) => {
      const group = i % 2;
      const a = (2 * Math.PI * i) / n * 2 + sampleNormal(rng) * 0.025;
      const r = 55 + sampleNormal(rng) * 4;
      return [CX - 80 + group * 160 + r * Math.cos(a), CY + r * Math.sin(a)];
    });
  }
  if (preset === 'annulus') {
    return Array.from({ length: n }, () => {
      const a = rng() * 2 * Math.PI;
      const r = 45 + rng() * 35;
      return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    });
  }
  if (preset === 'figure eight') {
    return Array.from({ length: n }, (_, i) => {
      const group = i % 2;
      const a = (2 * Math.PI * i) / n * 2 + sampleNormal(rng) * 0.03;
      const r = 45 + sampleNormal(rng) * 4;
      const cx = group ? CX + 45 : CX - 45;
      return [cx + r * Math.cos(a), CY + r * Math.sin(a)];
    });
  }
  if (preset === 'random') {
    return Array.from({ length: n }, () => [CX + (rng() - 0.5) * 220, CY + (rng() - 0.5) * 220]);
  }
  if (preset === 'blobs') {
    return Array.from({ length: n }, (_, i) => {
      const group = i % 3;
      const cx = [CX - 110, CX + 20, CX + 110][group];
      const cy = [CY - 50, CY + 60, CY - 40][group];
      return [cx + sampleNormal(rng) * 18, cy + sampleNormal(rng) * 18];
    });
  }
  // 'circle'
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n + sampleNormal(rng) * 0.03;
    const r = 75 + sampleNormal(rng) * 4;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  });
}

function pairwiseDistances(points) {
  const n = points.length;
  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j, Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1])]);
    }
  }
  return pairs;
}

const TRIANGLE_CAP = 6000;

function betti(points, eps, pairs) {
  const n = points.length;
  const uf = makeUnionFind(n);
  const edges = [];
  const edgeId = new Map();
  pairs.forEach(([i, j, d]) => {
    if (d <= eps) {
      edgeId.set(`${i}-${j}`, edges.length);
      edges.push([i, j]);
      uf.union(i, j);
    }
  });
  const roots = new Set(points.map((_, i) => uf.find(i)));
  const tri = [];
  for (let i = 0; i < n && tri.length <= TRIANGLE_CAP; i++) {
    for (let j = i + 1; j < n && tri.length <= TRIANGLE_CAP; j++) {
      if (!edgeId.has(`${i}-${j}`)) continue;
      for (let k = j + 1; k < n; k++) {
        if (edgeId.has(`${i}-${k}`) && edgeId.has(`${j}-${k}`)) {
          tri.push([edgeId.get(`${i}-${j}`), edgeId.get(`${i}-${k}`), edgeId.get(`${j}-${k}`)]);
          if (tri.length > TRIANGLE_CAP) break;
        }
      }
    }
  }
  if (tri.length > TRIANGLE_CAP) return { edges, tri, b0: roots.size, b1: null, dense: true };

  // GF(2) rank of the triangle-to-edge boundary matrix via Gaussian elimination
  const pivots = new Map();
  let rank = 0;
  tri.forEach((cols) => {
    let row = new Set(cols);
    while (row.size) {
      const p = Math.max(...row);
      if (!pivots.has(p)) { pivots.set(p, row); rank++; break; }
      const pivotRow = pivots.get(p);
      pivotRow.forEach((x) => { row.has(x) ? row.delete(x) : row.add(x); });
    }
  });
  const b1 = edges.length - n + roots.size - rank;
  return { edges, tri, b0: roots.size, b1, dense: false };
}

// H0 barcode: exact birth/death of each connected-component bar via union-find over
// edges sorted by distance. The "elder rule" keeps the lowest-index point as each
// surviving component's identity, so every other point's bar dies when it merges in.
function h0Barcode(points, pairs) {
  const n = points.length;
  const sorted = [...pairs].sort((a, b) => a[2] - b[2]);
  const uf = makeUnionFind(n);
  const death = new Array(n).fill(Infinity);
  sorted.forEach(([i, j, d]) => {
    const ri = uf.find(i), rj = uf.find(j);
    if (ri === rj) return;
    const dying = Math.max(ri, rj);
    death[dying] = d;
    uf.union(i, j);
  });
  return death;
}

function betaSweep(points, pairs, steps) {
  if (points.length < 3) return [];
  const maxD = pairs.reduce((m, [, , d]) => Math.max(m, d), 0);
  return Array.from({ length: steps }, (_, s) => {
    const eps = (maxD * (s + 1)) / steps;
    const { b0, b1 } = betti(points, eps, pairs);
    return { eps, b0, b1: b1 == null ? 0 : b1 };
  });
}

const PRESETS = ['circle', 'two circles', 'annulus', 'figure eight', 'random', 'blobs'];

export default function PersistentHomologyExplorer() {
  const [preset, setPreset] = useState('two circles');
  const [n, setN] = useState(40);
  const [eps, setEps] = useState(60);
  const [seed, setSeed] = useState(2);
  const [customPts, setCustomPts] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const basePts = useMemo(() => presetPoints(preset, n, seed), [preset, n, seed]);
  const pts = customPts || basePts;
  const pairs = useMemo(() => pairwiseDistances(pts), [pts]);
  const d = useMemo(() => betti(pts, eps, pairs), [pts, eps, pairs]);
  const barcode = useMemo(() => h0Barcode(pts, pairs), [pts, pairs]);
  const sweep = useMemo(() => betaSweep(pts, pairs, 50), [pts, pairs]);
  const maxD = pairs.reduce((m, [, , dist]) => Math.max(m, dist), 1);

  const resetPoints = () => setCustomPts(null);

  const handleCanvasClick = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const base = customPts || pts;
    let nearest = -1, nearestD = Infinity;
    base.forEach(([px, py], i) => {
      const dist = Math.hypot(px - x, py - y);
      if (dist < nearestD) { nearestD = dist; nearest = i; }
    });
    if (nearestD < 8 && base.length > 3) {
      setCustomPts(base.filter((_, i) => i !== nearest));
    } else if (base.length < 60) {
      setCustomPts([...base, [x, y]]);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label htmlFor="ph-preset">preset</label>
          <select id="ph-preset" value={preset} onChange={(e) => { setPreset(e.target.value); setCustomPts(null); }} style={{ width: '100%' }}>
            {PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label htmlFor="ph-n">N = {n}</label>
          <input id="ph-n" type="range" min="20" max="60" value={n}
            onChange={(e) => { setN(+e.target.value); setCustomPts(null); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '2 1 220px' }}>
          <label htmlFor="ph-eps">ε = {eps.toFixed(0)}</label>
          <input id="ph-eps" type="range" min="3" max="160" value={eps}
            onChange={(e) => setEps(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <button onClick={() => setSeed((s) => s + 1)}
          style={{ padding: '0.45rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Reseed
        </button>
        {customPts && (
          <button onClick={resetPoints}
            style={{ padding: '0.45rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>
            Reset points
          </button>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px', cursor: 'crosshair' }}
        onClick={handleCanvasClick}>
        <title>Vietoris–Rips complex — click to add or remove a point</title>
        {d.tri.slice(0, 1200).map((tr, i) => {
          const ids = tr.map((e) => d.edges[e]).flat();
          const u = [...new Set(ids)];
          return u.length === 3 ? <polygon key={i} points={u.map((x) => pts[x].join(',')).join(' ')} fill="rgba(36,92,255,.10)" /> : null;
        })}
        {d.edges.map(([a, b], i) => (
          <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#aebfff" />
        ))}
        {hoverIdx != null && pts[hoverIdx] && (
          <circle cx={pts[hoverIdx][0]} cy={pts[hoverIdx][1]} r={eps} fill="none" stroke="#c1121f" strokeWidth="1" strokeDasharray="3 2" />
        )}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#245cff"
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
        ))}
      </svg>

      <div style={{ display: 'flex', gap: '1rem', padding: '0.7rem', background: 'var(--accent-bg)', borderRadius: '8px', margin: '0.8rem 0' }}>
        <b>β₀ = {d.b0}</b>
        <b>β₁ = {d.b1 == null ? '—' : d.b1}</b>
        <span style={{ color: 'var(--muted)' }}>V={pts.length}, E={d.edges.length}, triangles={d.tri.length}</span>
      </div>
      {d.dense && <div style={{ color: '#c1121f', marginBottom: '0.6rem' }}>too dense — reduce ε or point count</div>}

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.8rem 0 0.3rem' }}>Barcode — H₀ (exact) and H₁ (interval summary of β₁(ε))</h4>
      <svg viewBox="0 0 380 140" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
        <title>Persistence barcode — H0 component bars and H1(ε) interval summary</title>
        {barcode.map((death, i) => {
          const rowH = 90 / barcode.length;
          const x1 = 10;
          const x2 = 10 + (Number.isFinite(death) ? (death / maxD) * 340 : 340);
          return (
            <rect key={i} x={x1} y={6 + i * rowH} width={Math.max(1, x2 - x1)} height={Math.max(1, rowH - 0.5)}
              fill={Number.isFinite(death) ? '#4a90d9' : '#2d6a4f'} />
          );
        })}
        {sweep.map((s, i) => {
          const x = 10 + (s.eps / maxD) * 340;
          const barW = 340 / sweep.length;
          return s.b1 > 0 ? (
            <rect key={`b1-${i}`} x={x - barW / 2} y={102} width={barW} height={Math.min(28, s.b1 * 6)}
              fill="#e85d04" opacity="0.8" />
          ) : null;
        })}
        <line x1={10 + (eps / maxD) * 340} y1="0" x2={10 + (eps / maxD) * 340} y2="140" stroke="#c1121f" strokeWidth="1.5" />
        <text x="10" y="136" fontSize="8" fill="var(--muted)">H₀ bars above · H₁(ε) height below · red line = current ε</text>
      </svg>

      <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--muted)' }}>
        H₀ bars are exact (union-find birth/death); the green bar never dies (the last surviving component). The H₁ panel is an interval summary of β₁(ε) — a bar height at each ε step, not generator-level persistence pairs, since that needs a full boundary-matrix reduction across the whole filtration.
      </small>
    </div>
  );
}
