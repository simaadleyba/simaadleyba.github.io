import { useMemo, useState } from 'react';
import { KARATE_EDGES, KARATE_LAYOUT, KARATE_GROUND_TRUTH } from '../data/karate';
import { jacobiEigen } from '../utils/jacobiEigen';
import { kmeans } from '../utils/kmeans';
import { mulberry32 } from '../utils/random';

const N = 34;
const PALETTE = ['#4a90d9', '#e85d04', '#2d6a4f', '#7b2cbf', '#c1121f'];

function buildGraph() {
  const A = Array.from({ length: N }, () => Array(N).fill(0));
  const deg = Array(N).fill(0);
  KARATE_EDGES.forEach(([a, b]) => { A[a][b] = A[b][a] = 1; deg[a]++; deg[b]++; });
  return { A, deg };
}

// pairwise (Rand-index style) agreement — cluster labels are only meaningful up to
// permutation, so raw label equality would be wrong for any k
function pairwiseAgreement(labels) {
  let consistent = 0, total = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const sameNow = labels[i] === labels[j];
      const sameGT = KARATE_GROUND_TRUTH[i] === KARATE_GROUND_TRUTH[j];
      if (sameNow === sameGT) consistent++;
      total++;
    }
  }
  return consistent / total;
}

function clusterVariant(A, deg, variant, k, seed) {
  // unnormalised: L = D - A. symmetric: L_sym = D^-1/2 L D^-1/2.
  // random-walk: L_rw = D^-1 L is not symmetric, but shares eigenvalues with L_sym —
  // its eigenvectors are D^-1/2 * (the L_sym eigenvectors), so we solve the symmetric
  // problem once and rescale rather than needing a non-symmetric eigensolver.
  const useSym = variant !== 'unnormalised';
  const L = A.map((row, i) => row.map((x, j) => {
    if (i === j) return useSym ? 1 : deg[i];
    return useSym ? -x / Math.sqrt(deg[i] * deg[j]) : -x;
  }));
  const eig = jacobiEigen(L);
  const rawVectors = Array.from({ length: k }, (_, j) => eig.vectors[j]);
  const vectors = variant === 'randomwalk'
    ? rawVectors.map((vec) => vec.map((val, i) => val / Math.sqrt(deg[i] || 1)))
    : rawVectors;
  const pts = Array.from({ length: N }, (_, i) => vectors.map((vec) => vec[i]));
  const km = kmeans(pts, k, mulberry32(seed), 12);
  return { labels: km.labels, pts, eigenvalues: eig.values.slice(0, k), agreement: pairwiseAgreement(km.labels) };
}

const VARIANTS = [
  { id: 'unnormalised', label: 'unnormalised (L)' },
  { id: 'symmetric', label: 'symmetric normalised (L_sym)' },
  { id: 'randomwalk', label: 'random-walk (L_rw)' },
];

export default function SpectralClusteringDemo() {
  const [k, setK] = useState(2);
  const [variant, setVariant] = useState('unnormalised');

  const { A, deg } = useMemo(() => buildGraph(), []);

  const allVariants = useMemo(
    () => Object.fromEntries(VARIANTS.map((v) => [v.id, clusterVariant(A, deg, v.id, k, 4)])),
    [A, deg, k]
  );
  const d = allVariants[variant];

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ flex: '1 1 140px' }}>
          k = {k}
          <input type="range" min="2" max="5" value={k} onChange={(e) => setK(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <label style={{ flex: '1 1 220px' }}>
          Laplacian variant
          <select value={variant} onChange={(e) => setVariant(e.target.value)} style={{ width: '100%' }}>
            {VARIANTS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>eigenvector strip (u₁)</div>
          <svg viewBox="0 0 60 300" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
            <title>Sorted eigenvector strip with cluster boundaries</title>
            {(() => {
              const order = d.pts.map((p, i) => ({ i, val: p[Math.min(1, k - 1)] })).sort((a, b) => a.val - b.val);
              const rowH = 300 / N;
              return order.map((o, idx) => {
                const changesCluster = idx > 0 && d.labels[order[idx - 1].i] !== d.labels[o.i];
                return (
                  <g key={o.i}>
                    <rect x="0" y={idx * rowH} width="60" height={rowH} fill={PALETTE[d.labels[o.i] % PALETTE.length]} opacity="0.75" />
                    {changesCluster && <line x1="0" y1={idx * rowH} x2="60" y2={idx * rowH} stroke="#101318" strokeWidth="1.5" />}
                  </g>
                );
              });
            })()}
          </svg>
        </div>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>karate graph</div>
          <svg viewBox="0 0 380 300" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
            <title>Spectral clustering of karate club</title>
            {KARATE_EDGES.map(([a, b], i) => <line key={i} x1={KARATE_LAYOUT[a][0]} y1={KARATE_LAYOUT[a][1]} x2={KARATE_LAYOUT[b][0]} y2={KARATE_LAYOUT[b][1]} stroke="#ccd0da" />)}
            {KARATE_LAYOUT.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={PALETTE[d.labels[i] % PALETTE.length]} />)}
          </svg>
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>2-D embedding (u₂ vs u₃)</div>
          {k < 3 ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-bg)', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', padding: '0 1rem' }}>
              increase k to 3+ to see u₂ vs u₃
            </div>
          ) : (
            <svg viewBox="0 0 220 220" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
              <title>2-D spectral embedding scatter, second vs third eigenvector</title>
              {(() => {
                const xs = d.pts.map((p) => p[1]);
                const ys = d.pts.map((p) => p[2]);
                const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(...ys), yMax = Math.max(...ys);
                const sx = (v) => 20 + ((v - xMin) / (xMax - xMin || 1)) * 180;
                const sy = (v) => 20 + ((v - yMin) / (yMax - yMin || 1)) * 180;
                return d.pts.map((p, i) => (
                  <circle key={i} cx={sx(p[1])} cy={sy(p[2])} r="4" fill={PALETTE[d.labels[i] % PALETTE.length]} />
                ));
              })()}
            </svg>
          )}
        </div>
      </div>

      <table style={{ marginTop: '0.8rem' }}>
        <thead><tr><th>variant</th><th>agreement with ground truth</th></tr></thead>
        <tbody>
          {VARIANTS.map((v) => (
            <tr key={v.id} style={{ fontWeight: v.id === variant ? 700 : 400 }}>
              <td>{v.label}</td>
              <td>{(allVariants[v.id].agreement * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--muted)' }}>
        Normalisation is not cosmetic — the three variants weight node degree differently and can land on visibly different partitions.
      </small>
    </div>
  );
}
