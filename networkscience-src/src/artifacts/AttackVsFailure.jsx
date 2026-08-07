import { useMemo, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { mulberry32 } from '../utils/random';
import { erdosRenyi, barabasiAlbert, buildAdj, degreeSequence, largestComponentFraction, moments } from '../utils/graph';

// static order: rank nodes once by their initial degree (or randomly), then remove in that fixed order
function staticCurve(n, edges, targeted, seed) {
  const rng = mulberry32(seed);
  const order = Array.from({ length: n }, (_, i) => i);
  if (targeted) {
    const d = degreeSequence(n, edges);
    order.sort((a, b) => d[b] - d[a]);
  } else {
    order.sort(() => rng() - 0.5);
  }
  const active = new Set(order);
  const out = [];
  for (let step = 0; step <= 100; step++) {
    const keep = Math.round(n * (1 - step / 100));
    while (active.size > keep) active.delete(order[n - active.size]);
    out.push(largestComponentFraction(n, edges, active));
  }
  return out;
}

// adaptive attack: after every single removal, recompute which surviving node has the
// highest degree WITHIN the surviving subgraph, and remove that one next
function adaptiveAttackCurve(n, edges, adj) {
  const active = new Set(Array.from({ length: n }, (_, i) => i));
  const liveDeg = adj.map((s) => s.size);
  const out = [];
  for (let step = 0; step <= 100; step++) {
    const keep = Math.round(n * (1 - step / 100));
    while (active.size > keep) {
      let best = -1, bestDeg = -1;
      active.forEach((v) => { if (liveDeg[v] > bestDeg) { bestDeg = liveDeg[v]; best = v; } });
      active.delete(best);
      adj[best].forEach((w) => { if (active.has(w)) liveDeg[w]--; });
    }
    out.push(largestComponentFraction(n, edges, active));
  }
  return out;
}

export default function AttackVsFailure() {
  const [n, setN] = useState(400);
  const [k, setK] = useState(4);
  const [seed, setSeed] = useState(4);
  const [adaptive, setAdaptive] = useState(false);

  const d = useMemo(() => {
    const rng = mulberry32(seed);
    const er = erdosRenyi(n, k / (n - 1), rng);
    const ba = barabasiAlbert(n, Math.max(1, Math.round(k / 2)), rng);
    const series = {
      erR: staticCurve(n, er, false, seed + 1),
      erA: adaptive ? adaptiveAttackCurve(n, er, buildAdj(n, er)) : staticCurve(n, er, true, seed + 2),
      baR: staticCurve(n, ba, false, seed + 3),
      baA: adaptive ? adaptiveAttackCurve(n, ba, buildAdj(n, ba)) : staticCurve(n, ba, true, seed + 4),
    };
    return {
      data: Array.from({ length: 101 }, (_, i) => ({ f: i / 100, ...Object.fromEntries(Object.entries(series).map(([a, v]) => [a, v[i]])) })),
      er: moments(degreeSequence(n, er)),
      ba: moments(degreeSequence(n, ba)),
    };
  }, [n, k, seed, adaptive]);

  const erFc = 1 - 1 / (d.er.kappa - 1);
  const baFc = 1 - 1 / (d.ba.kappa - 1);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ flex: '1 1 180px' }}>
          <div>N = {n}</div>
          <input type="range" min="200" max="1000" step="50" value={n} onChange={(e) => setN(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <label style={{ flex: '1 1 180px' }}>
          <div>⟨k⟩ ≈ {k}</div>
          <input type="range" min="2" max="8" value={k} onChange={(e) => setK(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: '1 1 220px' }}>
          <input type="checkbox" checked={adaptive} onChange={(e) => setAdaptive(e.target.checked)} />
          <span style={{ fontSize: '0.8rem' }}>recompute degrees after each removal (adaptive attack)</span>
        </label>
        <button onClick={() => setSeed((s) => s + 1)}
          style={{ padding: '0.45rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Regenerate
        </button>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={d.data}>
          <XAxis dataKey="f" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 1]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
          <Line dataKey="erR" name="ER / random" stroke="#4a90d9" dot={false} />
          <Line dataKey="erA" name="ER / attack" stroke="#2d6a4f" dot={false} />
          <Line dataKey="baR" name="BA / random" stroke="#e85d04" dot={false} />
          <Line dataKey="baA" name="BA / attack" stroke="#c1121f" dot={false} />
          <ReferenceLine x={erFc} stroke="#4a90d9" strokeDasharray="4 4" />
          <ReferenceLine x={baFc} stroke="#e85d04" strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ background: 'var(--accent-bg)', padding: '0.7rem', borderRadius: '8px' }}>
        ER κ={d.er.kappa.toFixed(2)}, predicted (Molloy–Reed, random-failure) f_c={erFc.toFixed(2)} · BA κ={d.ba.kappa.toFixed(2)}, predicted f_c={baFc.toFixed(2)}.
        {' '}BA survives random failure to f ≈ {d.data.findIndex((r) => r.baR < 0.05) === -1 ? '1.0' : (d.data.findIndex((r) => r.baR < 0.05) / 100).toFixed(2)} but its measured attack curve collapses far earlier, at f ≈ {(d.data.findIndex((r) => r.baA < 0.05) === -1 ? 1 : d.data.findIndex((r) => r.baA < 0.05) / 100).toFixed(2)} — well below the random-failure prediction, showing the hubs are the network's real weak point.
      </div>
    </div>
  );
}
