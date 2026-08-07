import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { mulberry32 } from '../utils/random';
import { makeUnionFind } from '../utils/unionFind';

const PC = 0.5927;

function lattice(L, p, seed) {
  const rng = mulberry32(seed);
  const on = Array.from({ length: L * L }, () => rng() < p);
  const uf = makeUnionFind(L * L);
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const i = y * L + x;
      if (!on[i]) continue;
      if (x && on[i - 1]) uf.union(i, i - 1);
      if (y && on[i - L]) uf.union(i, i - L);
    }
  }
  const groups = new Map();
  on.forEach((v, i) => {
    if (v) {
      const r = uf.find(i);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(i);
    }
  });
  let spanning = null;
  for (const [r, cells] of groups) {
    if (cells.some((i) => i < L) && cells.some((i) => i >= L * (L - 1))) spanning = r;
  }
  const sizes = [...groups].filter(([r]) => r !== spanning).map(([, a]) => a.length);
  const largest = Math.max(...[...groups.values()].map((a) => a.length), 0);
  const S = sizes.length ? sizes.reduce((s, x) => s + x * x, 0) / sizes.reduce((s, x) => s + x, 0) : 0;
  return { on, uf, groups, spanning, largest, S };
}

// summary-only pass used by the sweep (skips building the group-membership arrays
// beyond what's needed for Pinf and S, since the sweep only needs the scalars)
function sweepPoint(L, p, seed) {
  const d = lattice(L, p, seed);
  return { Pinf: d.largest / d.on.length, S: d.S };
}

export default function PercolationLattice() {
  const [L, setL] = useState(48);
  const [p, setP] = useState(0.55);
  const [seed, setSeed] = useState(5);
  const [R, setR] = useState(6);
  const [sweepData, setSweepData] = useState(null);
  const [sweepProgress, setSweepProgress] = useState(null);
  const cancelRef = useRef(false);
  const rafRef = useRef(null);

  const d = useMemo(() => lattice(L, p, seed), [L, p, seed]);

  useEffect(() => () => { cancelRef.current = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const runSweep = () => {
    cancelRef.current = false;
    setSweepProgress(0);
    const pValues = [];
    for (let pv = 0.30; pv <= 0.8001; pv += 0.01) pValues.push(Math.round(pv * 1000) / 1000);
    const results = new Array(pValues.length);
    let idx = 0;

    const step = () => {
      if (cancelRef.current) return;
      const stepsThisFrame = 1;
      for (let s = 0; s < stepsThisFrame && idx < pValues.length; s++, idx++) {
        const pv = pValues[idx];
        let sumPinf = 0, sumS = 0;
        for (let r = 0; r < R; r++) {
          const { Pinf, S } = sweepPoint(L, pv, seed * 1000 + idx * 37 + r);
          sumPinf += Pinf; sumS += S;
        }
        results[idx] = { p: pv, Pinf: sumPinf / R, S: sumS / R };
      }
      setSweepProgress(idx / pValues.length);
      if (idx < pValues.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setSweepData([...results]);
        setSweepProgress(null);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const abortSweep = () => {
    cancelRef.current = true;
    setSweepProgress(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ flex: '1 1 160px' }}>
          <div>L = {L}</div>
          <input type="range" min="24" max="64" step="8" value={L} onChange={(e) => setL(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <label style={{ flex: '1 1 160px' }}>
          <div>p = {p.toFixed(3)}</div>
          <input type="range" min="0" max="1" step=".005" value={p} onChange={(e) => setP(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <button onClick={() => setSeed((s) => s + 1)}
          style={{ padding: '0.45rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Reseed
        </button>
      </div>

      <svg viewBox={`0 0 ${L} ${L}`} role="img" style={{ width: '100%', maxHeight: '420px', background: 'var(--bg)', imageRendering: 'pixelated', marginTop: '0.8rem' }}>
        <title>Site percolation lattice</title>
        {d.on.map((v, i) => v && (
          <rect key={i} x={i % L} y={Math.floor(i / L)} width="1" height="1"
            fill={d.uf.find(i) === d.spanning ? '#245cff' : ['#aebfff', '#8ea8e8', '#c3cff5'][d.uf.find(i) % 3]} />
        ))}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0.7rem', background: 'var(--accent-bg)', borderRadius: '8px', marginTop: '0.6rem' }}>
        <span>occupied {(d.on.filter(Boolean).length / d.on.length).toFixed(3)}</span>
        <span>clusters {d.groups.size}</span>
        <span>largest {d.largest}</span>
        <span>P∞ {(d.largest / d.on.length).toFixed(3)}</span>
        <span>S {d.S.toFixed(2)}</span>
        <b>{d.spanning !== null ? 'spanning' : 'not spanning'}</b>
      </div>
      <small>S excludes the spanning cluster.</small>

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem 0 0.4rem' }}>Sweep p from 0.30 to 0.80, averaged over R realisations</h4>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '0.6rem' }}>
        <label style={{ flex: '1 1 160px' }}>
          <div>R = {R}</div>
          <input type="range" min="1" max="20" value={R} onChange={(e) => setR(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        {sweepProgress == null ? (
          <button onClick={runSweep}
            style={{ padding: '0.45rem 1.2rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Run sweep
          </button>
        ) : (
          <button onClick={abortSweep}
            style={{ padding: '0.45rem 1.2rem', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>
            Cancel ({Math.round(sweepProgress * 100)}%)
          </button>
        )}
      </div>
      {sweepProgress != null && (
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.6rem' }}>
          <div style={{ width: `${sweepProgress * 100}%`, height: '100%', background: 'var(--accent)' }} />
        </div>
      )}

      {sweepData && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>P∞(p)</div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={sweepData}>
                <XAxis dataKey="p" type="number" domain={[0.3, 0.8]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
                <ReferenceLine x={PC} stroke="#c1121f" strokeDasharray="4 3" label={{ value: 'p_c', fontSize: 10, fill: '#c1121f' }} />
                <Line dataKey="Pinf" stroke="#245cff" dot={false} name="P∞" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>S(p) — mean finite-cluster size</div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={sweepData}>
                <XAxis dataKey="p" type="number" domain={[0.3, 0.8]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
                <ReferenceLine x={PC} stroke="#c1121f" strokeDasharray="4 3" label={{ value: 'p_c', fontSize: 10, fill: '#c1121f' }} />
                <Line dataKey="S" stroke="#e85d04" dot={false} name="S" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
