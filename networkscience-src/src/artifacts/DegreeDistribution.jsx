import { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function binomialCoeff(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) result *= (n - i) / (i + 1);
  return result;
}

function binomialPMF(k, n, p) {
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return binomialCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function factorial(n) {
  if (n > 170) return Infinity;
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function poissonPMF(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

export default function DegreeDistribution() {
  const [N, setN] = useState(30);
  const [p, setP] = useState(0.15);

  const meanK = p * (N - 1);
  const sigmaK = Math.sqrt(p * (1 - p) * (N - 1));
  const relativeWidth = meanK > 0 ? sigmaK / meanK : 0;
  const maxK = Math.min(N - 1, Math.ceil(meanK + 4 * sigmaK + 5));

  const data = useMemo(() => Array.from({ length: maxK + 1 }, (_, k) => ({
    k,
    binomial: +binomialPMF(k, N - 1, p).toFixed(5),
    poisson: +poissonPMF(k, meanK).toFixed(5),
  })), [N, p, maxK, meanK]);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>N = {N} nodes</label>
          <input type="range" min={10} max={200} value={N} onChange={e => setN(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>p = {p.toFixed(2)}</label>
          <input type="range" min={0.01} max={0.5} step={0.01} value={p} onChange={e => setP(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.82rem' }}>
        <span style={{ color: 'var(--muted)' }}>⟨k⟩ = <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{meanK.toFixed(2)}</span></span>
        <span style={{ color: 'var(--muted)' }}>σ_k = <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{sigmaK.toFixed(2)}</span></span>
        <span style={{ color: 'var(--muted)' }}>σ_k / ⟨k⟩ = <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{relativeWidth.toFixed(3)}</span></span>
      </div>

      {N > 50 && (
        <div style={{
          fontSize: '0.78rem', padding: '0.3rem 0.6rem', borderRadius: '4px',
          background: 'rgba(45,106,79,0.1)', border: '1px solid #2d6a4f', color: '#1a6b4a', marginBottom: '0.8rem',
        }}>
          Large N: Binomial ≈ Poisson — the distributions are converging and σ_k/⟨k⟩ → 0
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
          <XAxis dataKey="k" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'degree k', fill: '#5b5b5b', fontSize: 10, position: 'insideBottom', offset: -10 }} />
          <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
          <Legend wrapperStyle={{ color: '#5b5b5b', fontSize: '0.78rem', paddingTop: '4px' }} />
          <Bar dataKey="binomial" fill="var(--accent)" opacity={0.75} name="Binomial P(k)" radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="poisson" stroke="#e85d04" strokeWidth={2.5} dot={false} name="Poisson approx" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
