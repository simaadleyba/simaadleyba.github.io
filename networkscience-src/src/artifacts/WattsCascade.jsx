import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mulberry32 } from '../utils/random';
import { erdosRenyi, buildAdj } from '../utils/graph';
import { forceLayout } from '../utils/layout';

function runCascade(n, adj, phi, startNode) {
  let current = new Set([startNode]);
  for (let t = 0; t < 60; t++) {
    const next = new Set(current);
    for (let i = 0; i < n; i++) {
      if (!next.has(i) && adj[i].size && [...adj[i]].filter((x) => current.has(x)).length / adj[i].size > phi) {
        next.add(i);
      }
    }
    if (next.size === current.size) break;
    current = next;
  }
  return current.size;
}

function cascadeHistogram(n, adj, phi, seed, trials) {
  const rng = mulberry32(seed * 9973 + 3);
  const sizes = [];
  for (let t = 0; t < trials; t++) {
    sizes.push(runCascade(n, adj, phi, Math.floor(rng() * n)));
  }
  const bins = new Map();
  sizes.forEach((s) => {
    const b = Math.floor(Math.log2(Math.max(s, 1)));
    bins.set(b, (bins.get(b) || 0) + 1);
  });
  const pts = [...bins.entries()].map(([b, count]) => {
    const lo = 2 ** b, hi = 2 ** (b + 1);
    const x = Math.sqrt(lo * hi);
    return { logS: Math.log10(x), logP: Math.log10(count / trials / (hi - lo)) };
  }).sort((a, b) => a.logS - b.logS);
  const ref = pts.length ? pts.map((p) => ({ logS: p.logS, logPRef: pts[0].logP - 1.5 * (p.logS - pts[0].logS) })) : [];
  const meanSize = sizes.reduce((s, x) => s + x, 0) / sizes.length;
  return { pts: pts.map((p, i) => ({ ...p, logPRef: ref[i]?.logPRef })), meanSize };
}

const PHI_STEPS = 16, K_STEPS = 16, PHASE_TRIALS = 15;

export default function WattsCascade() {
  const [n, setN] = useState(160);
  const [k, setK] = useState(4);
  const [phi, setPhi] = useState(0.25);
  const [seed, setSeed] = useState(2);
  const [round, setRound] = useState(0);
  const [histTrials, setHistTrials] = useState(null);
  const [phase, setPhase] = useState(null);
  const [phaseProgress, setPhaseProgress] = useState(null);
  const cancelRef = useRef(false);
  const rafRef = useRef(null);

  const d = useMemo(() => {
    const edges = erdosRenyi(n, k / (n - 1), mulberry32(seed));
    const adj = buildAdj(n, edges);
    const states = [new Set([seed % n])];
    for (let t = 0; t < 50; t++) {
      const next = new Set(states.at(-1));
      for (let i = 0; i < n; i++) {
        if (!next.has(i) && adj[i].size && [...adj[i]].filter((x) => next.has(x)).length / adj[i].size > phi) next.add(i);
      }
      if (next.size === states.at(-1).size) break;
      states.push(next);
    }
    return { edges, adj, states, pos: forceLayout(n, edges, { seed, iterations: 35 }) };
  }, [n, k, phi, seed]);

  const failed = d.states[Math.min(round, d.states.length - 1)];

  useEffect(() => () => { cancelRef.current = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const runHistogram = () => {
    setHistTrials(cascadeHistogram(n, d.adj, phi, seed, 500));
  };

  const runPhaseDiagram = () => {
    cancelRef.current = false;
    setPhaseProgress(0);
    const cells = [];
    for (let pi = 0; pi < PHI_STEPS; pi++) {
      for (let ki = 0; ki < K_STEPS; ki++) {
        cells.push({ phiV: (pi + 0.5) / PHI_STEPS, kV: 1 + (ki + 0.5) * (10 / K_STEPS) });
      }
    }
    const results = new Array(cells.length);
    let idx = 0;
    const nPhase = Math.min(n, 150);
    const step = () => {
      if (cancelRef.current) return;
      for (let c = 0; c < 4 && idx < cells.length; c++, idx++) {
        const { phiV, kV } = cells[idx];
        const rng = mulberry32(seed * 131 + idx * 7 + 1);
        const edges = erdosRenyi(nPhase, kV / (nPhase - 1), rng);
        const adj = buildAdj(nPhase, edges);
        let sum = 0;
        for (let t = 0; t < PHASE_TRIALS; t++) sum += runCascade(nPhase, adj, phiV, Math.floor(rng() * nPhase));
        results[idx] = { phi: phiV, k: kV, meanSize: sum / PHASE_TRIALS / nPhase };
      }
      setPhaseProgress(idx / cells.length);
      if (idx < cells.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPhase({ cells: [...results], nPhase });
        setPhaseProgress(null);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <label style={{ flex: '1 1 140px' }}>
          <div>N {n}</div>
          <input type="range" min="100" max="400" step="20" value={n} onChange={(e) => { setN(+e.target.value); setRound(0); setHistTrials(null); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <label style={{ flex: '1 1 140px' }}>
          <div>⟨k⟩ {k}</div>
          <input type="range" min="2" max="10" value={k} onChange={(e) => { setK(+e.target.value); setRound(0); setHistTrials(null); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <label style={{ flex: '1 1 140px' }}>
          <div>φ {phi.toFixed(2)}</div>
          <input type="range" min="0" max="1" step=".02" value={phi} onChange={(e) => { setPhi(+e.target.value); setRound(0); setHistTrials(null); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <button onClick={() => setRound((r) => Math.min(r + 1, d.states.length - 1))} style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>Step</button>
        <button onClick={() => setRound(d.states.length - 1)} style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>Run to completion</button>
        <button onClick={() => { setSeed((s) => s + 1); setRound(0); setHistTrials(null); }} style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>Reseed</button>
      </div>

      <svg viewBox="0 0 380 300" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px', marginTop: '0.6rem' }}>
        <title>Watts threshold cascade</title>
        {d.edges.map(([a, b], i) => <line key={i} x1={d.pos[a].x} y1={d.pos[a].y} x2={d.pos[b].x} y2={d.pos[b].y} stroke="#ccd2df" />)}
        {d.pos.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={failed.has(i) ? '#c1121f' : '#aebfff'} />)}
      </svg>
      <div style={{ padding: '0.6rem', background: 'var(--accent-bg)', borderRadius: '8px', marginTop: '0.4rem' }}>
        round {Math.min(round, d.states.length - 1)} · failed {failed.size}/{n} ({(failed.size / n * 100).toFixed(1)}%) · final cascade {d.states.at(-1).size}
      </div>

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem 0 0.4rem' }}>Cascade-size distribution — 500 seeded-failure trials</h4>
      <button onClick={runHistogram} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}>
        Run 500 trials
      </button>
      {histTrials && (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={histTrials.pts}>
              <XAxis dataKey="logS" type="number" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'log₁₀ S', position: 'insideBottomRight', fontSize: 10 }} />
              <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'log₁₀ P(S)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
              <Bar dataKey="logP" fill="#4a90d9" name="P(S)" />
              <Line dataKey="logPRef" stroke="#c1121f" strokeDasharray="4 3" dot={false} name="S⁻¹·⁵ reference" />
            </ComposedChart>
          </ResponsiveContainer>
          <small style={{ color: 'var(--muted)' }}>
            mean cascade size {histTrials.meanSize.toFixed(1)}/{n}. The S⁻¹·⁵ line only matches near the critical (φ, ⟨k⟩) — off-critical parameters will visibly diverge from it.
          </small>
        </>
      )}

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem 0 0.4rem' }}>Phase diagram over (φ, ⟨k⟩) — mean cascade size</h4>
      {phaseProgress == null ? (
        <button onClick={runPhaseDiagram} style={{ padding: '0.45rem 1.1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Compute phase diagram
        </button>
      ) : (
        <button onClick={() => { cancelRef.current = true; setPhaseProgress(null); }} style={{ padding: '0.45rem 1.1rem', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>
          Cancel ({Math.round(phaseProgress * 100)}%)
        </button>
      )}
      {phaseProgress != null && (
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', margin: '0.5rem 0' }}>
          <div style={{ width: `${phaseProgress * 100}%`, height: '100%', background: 'var(--accent)' }} />
        </div>
      )}
      {phase && (
        <svg viewBox="0 0 300 300" role="img" style={{ width: '100%', maxWidth: '320px', background: 'var(--bg)', borderRadius: '8px', marginTop: '0.5rem' }}>
          <title>Phase diagram — mean cascade size over threshold and mean degree</title>
          {phase.cells.map((c, i) => {
            const x = (c.phi) * 280 + 10;
            const y = 290 - ((c.k - 1) / 10) * 280;
            const cw = 280 / PHI_STEPS, ch = 280 / K_STEPS;
            const t = Math.min(1, c.meanSize * 2.2);
            const color = t < 0.5
              ? `rgb(${Math.round(238 + t * 2 * (74 - 238))},${Math.round(242 + t * 2 * (144 - 242))},${Math.round(255 + t * 2 * (217 - 255))})`
              : `rgb(${Math.round(74 + (t - 0.5) * 2 * (193 - 74))},${Math.round(144 + (t - 0.5) * 2 * (18 - 144))},${Math.round(217 + (t - 0.5) * 2 * (31 - 217))})`;
            return <rect key={i} x={x - cw / 2} y={y - ch / 2} width={cw} height={ch} fill={color} />;
          })}
          <text x="10" y="299" fontSize="9" fill="var(--muted)">φ →</text>
          <text x="0" y="10" fontSize="9" fill="var(--muted)">⟨k⟩ ↑</text>
        </svg>
      )}
    </div>
  );
}
