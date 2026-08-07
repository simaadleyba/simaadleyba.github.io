import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mulberry32 } from '../utils/random';
import { makeUnionFind } from '../utils/unionFind';

const SIZES = [16, 32, 64];
const RUNS = { 16: 40, 32: 20, 64: 12 };
const P_VALUES = Array.from({ length: 61 }, (_, i) => Math.round((0.45 + i * 0.005) * 1000) / 1000);
const PC_2D = 0.5927;

// one site-percolation realisation: returns {Pinf, S} (S excludes the spanning cluster)
function trial(L, p, rng) {
  const N = L * L;
  const on = new Uint8Array(N);
  for (let i = 0; i < N; i++) on[i] = rng() < p ? 1 : 0;
  const uf = makeUnionFind(N);
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const i = y * L + x;
      if (!on[i]) continue;
      if (x && on[i - 1]) uf.union(i, i - 1);
      if (y && on[i - L]) uf.union(i, i - L);
    }
  }
  const sizeOf = new Map();
  const topRoots = new Set(), bottomRoots = new Set();
  for (let i = 0; i < N; i++) {
    if (!on[i]) continue;
    const r = uf.find(i);
    sizeOf.set(r, (sizeOf.get(r) || 0) + 1);
    if (i < L) topRoots.add(r);
    if (i >= L * (L - 1)) bottomRoots.add(r);
  }
  let spanning = null;
  for (const r of topRoots) if (bottomRoots.has(r)) spanning = r;
  let largest = 0;
  let finiteSum = 0, finiteSumSq = 0;
  sizeOf.forEach((sz, r) => {
    largest = Math.max(largest, sz);
    if (r !== spanning) { finiteSum += sz; finiteSumSq += sz * sz; }
  });
  const S = finiteSum > 0 ? finiteSumSq / finiteSum : 0;
  return { Pinf: largest / N, S };
}

function linInterp(sortedPts, x) {
  if (x <= sortedPts[0].x) return sortedPts[0].y;
  if (x >= sortedPts[sortedPts.length - 1].x) return sortedPts[sortedPts.length - 1].y;
  let lo = 0, hi = sortedPts.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (sortedPts[mid].x < x) lo = mid; else hi = mid;
  }
  const a = sortedPts[lo], b = sortedPts[hi];
  const t = (x - a.x) / (b.x - a.x || 1);
  return a.y + t * (b.y - a.y);
}

function collapseQuality(curves) {
  // mean pairwise vertical deviation over each pair's overlapping x-range
  const sorted = curves.map((c) => [...c].sort((a, b) => a.x - b.x));
  let total = 0, count = 0;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const A = sorted[i], B = sorted[j];
      const lo = Math.max(A[0].x, B[0].x), hi = Math.min(A[A.length - 1].x, B[B.length - 1].x);
      if (lo >= hi) continue;
      const steps = 30;
      for (let s = 0; s <= steps; s++) {
        const x = lo + ((hi - lo) * s) / steps;
        total += Math.abs(linInterp(A, x) - linInterp(B, x));
        count++;
      }
    }
  }
  return count ? total / count : Infinity;
}

export default function FiniteSizeCollapse() {
  const [raw, setRaw] = useState(null);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState('S');
  const [pc, setPc] = useState(0.58);
  const [gamma, setGamma] = useState(2);
  const [nu, setNu] = useState(1.1);
  const [beta, setBeta] = useState(0.2);
  const cancelRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelRef.current = false;
    const jobs = [];
    SIZES.forEach((L) => P_VALUES.forEach((p, pi) => jobs.push({ L, p, pi })));
    const results = {};
    SIZES.forEach((L) => { results[L] = new Array(P_VALUES.length); });
    let idx = 0;
    const step = () => {
      if (cancelRef.current) return;
      const t0 = performance.now();
      while (idx < jobs.length && performance.now() - t0 < 12) {
        const { L, p, pi } = jobs[idx];
        const rng = mulberry32(L * 100000 + pi * 17 + 7);
        let sumPinf = 0, sumS = 0;
        const R = RUNS[L];
        for (let r = 0; r < R; r++) {
          const { Pinf, S } = trial(L, p, rng);
          sumPinf += Pinf; sumS += S;
        }
        results[L][pi] = { p, Pinf: sumPinf / R, S: sumS / R };
        idx++;
      }
      setProgress(idx / jobs.length);
      if (idx < jobs.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // light 3-point moving-average smoothing along p — the physical observables
        // are smooth in p, so this suppresses per-point MC noise without biasing the transition
        const smoothed = {};
        SIZES.forEach((L) => {
          const arr = results[L];
          smoothed[L] = arr.map((d, i) => {
            const lo = Math.max(0, i - 1), hi = Math.min(arr.length - 1, i + 1);
            let sS = 0, sP = 0, c = 0;
            for (let j = lo; j <= hi; j++) { sS += arr[j].S; sP += arr[j].Pinf; c++; }
            return { p: d.p, S: sS / c, Pinf: sP / c };
          });
        });
        setRaw(smoothed);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { cancelRef.current = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const collapsedS = useMemo(() => {
    if (!raw) return null;
    return SIZES.map((L) => raw[L].map((d) => ({ x: (d.p - pc) * L ** (1 / nu), y: d.S / L ** (gamma / nu) })));
  }, [raw, pc, gamma, nu]);

  const collapsedP = useMemo(() => {
    if (!raw) return null;
    return SIZES.map((L) => raw[L].map((d) => ({ x: (d.p - pc) * L ** (1 / nu), y: d.Pinf * L ** (beta / nu) })));
  }, [raw, pc, beta, nu]);

  const activeCollapsed = tab === 'S' ? collapsedS : collapsedP;
  const quality = useMemo(() => (activeCollapsed ? collapseQuality(activeCollapsed) : null), [activeCollapsed]);

  const snap = () => {
    setPc(PC_2D);
    setNu(4 / 3);
    if (tab === 'S') setGamma(43 / 18); else setBeta(5 / 36);
  };

  if (!raw) {
    return (
      <div>
        <div style={{ marginBottom: '0.5rem' }}>Simulating percolation for L = 16, 32, 64 (40/20/12 realisations per p)…</div>
        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  const rawSets = tab === 'S' ? SIZES.map((L) => raw[L]) : SIZES.map((L) => raw[L]);
  const rawKey = tab === 'S' ? 'S' : 'Pinf';

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <button onClick={() => setTab('S')} style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: tab === 'S' ? 'var(--accent)' : 'none', color: tab === 'S' ? 'white' : 'var(--text)', cursor: 'pointer' }}>S(p) collapse</button>
        <button onClick={() => setTab('P')} style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: tab === 'P' ? 'var(--accent)' : 'none', color: tab === 'P' ? 'white' : 'var(--text)', cursor: 'pointer' }}>P∞(p) collapse</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ flex: '1 1 170px' }}>p_c = {pc.toFixed(3)}<input type="range" min="0.55" max="0.63" step="0.001" value={pc} onChange={(e) => setPc(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} /></label>
        {tab === 'S' ? (
          <label style={{ flex: '1 1 170px' }}>γ = {gamma.toFixed(3)}<input type="range" min="1.5" max="3.5" step="0.01" value={gamma} onChange={(e) => setGamma(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} /></label>
        ) : (
          <label style={{ flex: '1 1 170px' }}>β = {beta.toFixed(3)}<input type="range" min="0.05" max="0.6" step="0.005" value={beta} onChange={(e) => setBeta(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} /></label>
        )}
        <label style={{ flex: '1 1 170px' }}>ν = {nu.toFixed(3)}<input type="range" min="0.8" max="2" step="0.01" value={nu} onChange={(e) => setNu(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} /></label>
        <button onClick={snap} style={{ padding: '0.45rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Snap to 2D values</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem' }}>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <b>Raw {tab === 'S' ? 'S(p)' : 'P∞(p)'}</b>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart>
              <XAxis dataKey="p" type="number" domain={[0.45, 0.75]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
              {rawSets.map((data, i) => (
                <Line key={SIZES[i]} data={data} dataKey={rawKey} stroke={['#4a90d9', '#e85d04', '#7b2cbf'][i]} dot={false} name={`L=${SIZES[i]}`} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <b>Collapsed {tab === 'S' ? 'S/L^(γ/ν)' : 'P∞·L^(β/ν)'}</b>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart>
              <XAxis dataKey="x" type="number" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
              {activeCollapsed.map((data, i) => (
                <Line key={SIZES[i]} data={data} dataKey="y" stroke={['#4a90d9', '#e85d04', '#7b2cbf'][i]} dot={false} name={`L=${SIZES[i]}`} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(() => {
        // the two tabs' y-quantities live on different scales (S/L^(γ/ν) ~ O(0.01), P∞·L^(β/ν) ~ O(0.1-1)),
        // so "good" and "bad" collapse quality use tab-specific bands
        const [goodMax, okMax] = tab === 'S' ? [0.020, 0.028] : [0.05, 0.15];
        const color = quality < goodMax ? '#2d6a4f' : quality < okMax ? '#e85d04' : '#c1121f';
        const bg = quality < goodMax ? 'rgba(45,106,79,0.08)' : quality < okMax ? 'rgba(232,93,4,0.08)' : 'rgba(193,18,31,0.07)';
        return (
          <div style={{ padding: '0.6rem', marginTop: '0.6rem', borderRadius: '8px', border: `1px solid ${color}`, background: bg }}>
            collapse quality {quality.toFixed(4)} (mean pairwise vertical deviation over the overlapping x-range) — lower is better
          </div>
        );
      })()}
    </div>
  );
}
