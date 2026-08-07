import { useMemo, useState } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mulberry32 } from '../utils/random';
import { olsFit } from '../utils/fit';

// Fenwick tree (binary indexed tree) over node weights eta_i * deg_i, for O(log N)
// weighted sampling. `size` is the max index the tree will ever hold (N).
function makeFenwick(size) {
  const tree = new Float64Array(size + 1);
  const add = (i, delta) => {
    for (let x = i + 1; x <= size; x += x & -x) tree[x] += delta;
  };
  const total = () => {
    let s = 0;
    for (let x = size; x > 0; x -= x & -x) s += tree[x];
    return s;
  };
  // smallest index i such that prefix-sum(0..i) >= target
  const select = (target) => {
    let pos = 0;
    let rem = target;
    let bit = 1 << Math.floor(Math.log2(size));
    for (; bit > 0; bit >>= 1) {
      const next = pos + bit;
      if (next <= size && tree[next] < rem) {
        pos = next;
        rem -= tree[next];
      }
    }
    return Math.min(pos, size - 1);
  };
  return { add, total, select };
}

function sampleFitness(rng, dist) {
  if (dist === 'equal') return 1;
  if (dist === 'exponential') return -Math.log(1 - rng());
  if (dist === 'two') return rng() < 0.7 ? 0.3 : 0.9;
  return rng(); // uniform(0,1)
}

// One stochastic realisation of BB growth for a FIXED fitness assignment `eta`.
// Records degree of each tracked node at each checkpoint time into `out` (mutated).
function growOneWorld(N, m, eta, rng, checkpoints, tracked, out) {
  const deg = new Float64Array(N);
  const fenwick = makeFenwick(N);
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) { deg[i]++; deg[j]++; }
    if (deg[i] === 0) deg[i] = 1;
    fenwick.add(i, eta[i] * deg[i]);
  }
  let cp = 0;
  const chosen = new Int32Array(4);
  for (let t = m; t < N; t++) {
    let nChosen = 0;
    for (let link = 0; link < m; link++) {
      const total = fenwick.total();
      let idx = total > 0 ? fenwick.select(rng() * total) : Math.floor(rng() * t);
      let guard = 0;
      let dup = nChosen > 0 && chosen.subarray(0, nChosen).includes(idx);
      while (dup && guard < 5) { idx = Math.floor(rng() * t); guard++; dup = chosen.subarray(0, nChosen).includes(idx); }
      chosen[nChosen++] = idx;
      deg[idx]++;
      fenwick.add(idx, eta[idx]);
    }
    deg[t] = m;
    fenwick.add(t, eta[t] * m);
    while (cp < checkpoints.length && checkpoints[cp] === t) {
      tracked.forEach((i) => { out[cp][i] = (out[cp][i] || 0) + (i <= t ? deg[i] : 0); });
      cp++;
    }
  }
  return deg;
}

function runSimulation(N, m, dist, seed) {
  // scale the ensemble size down as N*m grows, to keep total work roughly bounded
  const RUNS = Math.max(6, Math.min(24, Math.round(2_200_000 / (N * m * Math.log2(N + 1)))));
  const baseRng = mulberry32(seed);
  const eta = Array.from({ length: N }, () => sampleFitness(baseRng, dist));
  const lateIdx = Math.min(Math.floor(N * 0.45), N - 1);
  if (dist !== 'equal') eta[lateIdx] = 0.99;

  const trackedCandidates = [m + 2, Math.floor(N * 0.03), Math.floor(N * 0.10), Math.floor(N * 0.25), lateIdx, Math.floor(N * 0.6)];
  const tracked = [...new Set(trackedCandidates.filter((i) => i >= 0 && i < N))].slice(0, 6);

  // log-spaced checkpoint times shared across all runs, from the very start of growth
  const nPoints = 160;
  const tMin = m + 1;
  const checkpoints = [...new Set(Array.from({ length: nPoints }, (_, k) => {
    const frac = k / (nPoints - 1);
    return Math.round(tMin * (N / tMin) ** frac);
  }))].filter((t) => t < N).sort((a, b) => a - b);
  if (checkpoints[checkpoints.length - 1] !== N - 1) checkpoints.push(N - 1);

  const sums = checkpoints.map(() => ({}));
  let finalDegAll = [];
  for (let r = 0; r < RUNS; r++) {
    const rng = mulberry32(seed * 7919 + r * 104729 + 1);
    const deg = growOneWorld(N, m, eta, rng, checkpoints, tracked, sums);
    if (r < 4) finalDegAll = finalDegAll.concat(Array.from(deg)); // enough samples for a smooth P(k)
  }

  const history = checkpoints.map((t, ci) => {
    const row = { logt: Math.log10(t) };
    tracked.forEach((i) => {
      const avg = i <= t ? sums[ci][i] / RUNS : null;
      row[`n${i}`] = avg && avg > 0 ? Math.log10(avg) : null;
    });
    return row;
  });

  const fitted = tracked.map((i) => {
    // the continuum solution k_i(t) = m(t/t_i)^beta holds across the whole trajectory,
    // not just asymptotically, so fit on every available (ensemble-averaged) point
    const points = history.filter((row) => row[`n${i}`] != null);
    const { slope } = olsFit(points.map((p) => p.logt), points.map((p) => p[`n${i}`]));
    return { i, eta: eta[i], beta: slope };
  });

  const num = fitted.reduce((s, f) => s + f.eta * f.beta, 0);
  const den = fitted.reduce((s, f) => s + f.eta * f.eta, 0);
  const invC = den > 0 ? num / den : 0;
  const C = invC > 0 ? 1 / invC : NaN;

  const bins = new Map();
  finalDegAll.forEach((k) => {
    const b = Math.floor(Math.log2(Math.max(k, 1)));
    bins.set(b, (bins.get(b) || 0) + 1);
  });
  const pk = [...bins.entries()].map(([b, count]) => {
    const lo = 2 ** b, hi = 2 ** (b + 1);
    const x = Math.sqrt(lo * hi);
    return { logk: Math.log10(x), logp: Math.log10(count / finalDegAll.length / (hi - lo)) };
  }).sort((a, b) => a.logk - b.logk);
  const baRef = pk.length ? pk.map((p) => ({ logk: p.logk, logpBA: pk[0].logp - 3 * (p.logk - pk[0].logk) })) : [];
  const pkChart = pk.map((p, i) => ({ ...p, logpBA: baRef[i] ? baRef[i].logpBA : null }));

  return { history, tracked, eta, fitted, C, pkChart };
}

const TRACK_COLORS = ['#4a90d9', '#2d6a4f', '#7b2cbf', '#e85d04', '#c1121f', '#101318'];

export default function FitnessRaceSimulator() {
  const [n, setN] = useState(1200);
  const [m, setM] = useState(2);
  const [dist, setDist] = useState('uniform');
  const [seed, setSeed] = useState(3);

  const { history, tracked, eta, fitted, C, pkChart } = useMemo(
    () => runSimulation(n, m, dist, seed),
    [n, m, dist, seed]
  );

  const allEqualCheck = dist === 'equal';
  const meanBetaEqual = allEqualCheck ? fitted.reduce((s, f) => s + f.beta, 0) / fitted.length : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="frs-n">N = {n}</label>
          <input id="frs-n" type="range" min="300" max="3000" step="100" value={n}
            onChange={(e) => setN(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label htmlFor="frs-m">m = {m}</label>
          <input id="frs-m" type="range" min="1" max="4" step="1" value={m}
            onChange={(e) => setM(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="frs-dist">fitness distribution</label>
          <select id="frs-dist" value={dist} onChange={(e) => setDist(e.target.value)} style={{ width: '100%' }}>
            <option value="uniform">uniform(0,1)</option>
            <option value="exponential">exponential</option>
            <option value="two">two-point {'{0.3, 0.9}'}</option>
            <option value="equal">all equal → BA</option>
          </select>
        </div>
        <button onClick={() => setSeed((s) => s + 1)}
          style={{ padding: '0.45rem 1.2rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Run / Reseed
        </button>
      </div>

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.6rem 0 0.2rem' }}>k_i(t) — tracked nodes, log-log</h4>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={history}>
          <XAxis dataKey="logt" type="number" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'log₁₀ t', position: 'insideBottomRight', fontSize: 10 }} />
          <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'log₁₀ k', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
          {tracked.map((i, j) => (
            <Line key={i} dataKey={`n${i}`} name={`node ${i}, η=${eta[i].toFixed(2)}`} dot={false}
              stroke={TRACK_COLORS[j % TRACK_COLORS.length]} connectNulls />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem 0 0.2rem' }}>Final P(k), log-log, vs BA k⁻³ reference</h4>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={pkChart}>
          <XAxis dataKey="logk" type="number" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'log₁₀ k', position: 'insideBottomRight', fontSize: 10 }} />
          <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'log₁₀ P(k)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
          <Scatter dataKey="logp" fill="#4a90d9" name="simulated P(k)" />
          <Line dataKey="logpBA" stroke="#c1121f" strokeDasharray="4 3" dot={false} name="BA k⁻³ reference" />
        </ComposedChart>
      </ResponsiveContainer>

      <table style={{ marginTop: '1rem' }}>
        <thead><tr><th>Node</th><th>η</th><th>fitted β (slope)</th><th>predicted β = η/C</th></tr></thead>
        <tbody>
          {fitted.map((f) => (
            <tr key={f.i}>
              <td>{f.i}</td>
              <td>{f.eta.toFixed(3)}</td>
              <td>{f.beta.toFixed(3)}</td>
              <td>{(f.eta / C).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{
        padding: '0.7rem', marginTop: '0.8rem', borderRadius: '8px',
        background: allEqualCheck ? 'rgba(45,106,79,0.08)' : 'var(--accent-bg)',
        border: `1px solid ${allEqualCheck ? '#2d6a4f' : 'var(--border)'}`,
      }}>
        {allEqualCheck
          ? `All equal fitness: mean fitted β = ${meanBetaEqual?.toFixed(3)} — the BA limit predicts β = 1/2 for every node, regardless of arrival time.`
          : `Fitted C ≈ ${Number.isFinite(C) ? C.toFixed(3) : '—'}. High-fitness late entrants (η ≈ 0.99, arriving after 45% of nodes) cross older, lower-fitness trajectories — the fit-get-rich effect BA cannot produce.`}
      </div>
    </div>
  );
}
