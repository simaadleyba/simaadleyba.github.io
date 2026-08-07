import { useMemo, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mulberry32 } from '../utils/random';
import { ringLattice, randomRegular, buildAdj } from '../utils/graph';

function responseP(shape, phi, k) {
  if (shape === 'threshold') return k >= phi ? 1 : 0;
  if (shape === 'diminish') return 1 - Math.exp(-k / phi);
  if (shape === 'critical') return 1 / (1 + Math.exp(-(k - phi)));
  return Math.min(1, (k * Math.exp(-k / phi)) / phi * 2.7); // peak-then-decline
}

function runCentola(edges, N, shape, phi, rng, maxRounds) {
  const adj = buildAdj(N, edges);
  const nSeeds = Math.max(1, Math.round(N * 0.04));
  const order = Array.from({ length: N }, (_, i) => i).sort(() => rng() - 0.5);
  const adopted = new Set(order.slice(0, nSeeds));
  const history = [adopted.size / N];
  for (let round = 0; round < maxRounds; round++) {
    const newAdopters = [];
    for (let i = 0; i < N; i++) {
      if (adopted.has(i)) continue;
      let k = 0;
      adj[i].forEach((j) => { if (adopted.has(j)) k++; });
      if (k > 0 && rng() < responseP(shape, phi, k)) newAdopters.push(i);
    }
    if (newAdopters.length === 0) { history.push(history[history.length - 1]); if (history.length > 3 && history.at(-1) === history.at(-2) && history.at(-2) === history.at(-3)) break; continue; }
    newAdopters.forEach((i) => adopted.add(i));
    history.push(adopted.size / N);
  }
  return history;
}

function averageRuns(buildEdges, N, shape, phi, seedBase, R, maxRounds) {
  const runs = [];
  for (let r = 0; r < R; r++) {
    const rng = mulberry32(seedBase * 1013 + r * 7919 + 1);
    runs.push(runCentola(buildEdges(rng), N, shape, phi, rng, maxRounds));
  }
  const maxLen = Math.max(...runs.map((h) => h.length));
  const avg = Array.from({ length: maxLen }, (_, t) => {
    const vals = runs.map((h) => (t < h.length ? h[t] : h[h.length - 1]));
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  });
  const timeToHalf = avg.findIndex((v) => v >= 0.5);
  return { history: avg, finalFraction: avg[avg.length - 1], timeToHalf: timeToHalf === -1 ? null : timeToHalf };
}

const PRESETS = [{ N: 98, Z: 6 }, { N: 128, Z: 8 }, { N: 144, Z: 6 }];

export default function ExposureCurveLab() {
  const [shape, setShape] = useState('peak');
  const [phi, setPhi] = useState(3);
  const [presetIdx, setPresetIdx] = useState(0);
  const [R, setR] = useState(8);
  const [seed, setSeed] = useState(1);
  const [centolaResult, setCentolaResult] = useState(null);

  const curveData = useMemo(() => Array.from({ length: 16 }, (_, k) => ({
    k,
    p: responseP(shape, phi, k),
    twitter: Math.min(1, (k * Math.exp(-k / 4)) / 4 * 2.7),
  })), [shape, phi]);

  const { N, Z } = PRESETS[presetIdx];

  const runReplication = () => {
    const maxRounds = 40;
    const lattice = averageRuns((rng) => ringLattice(N, Z), N, shape, phi, seed, R, maxRounds);
    const random = averageRuns((rng) => randomRegular(N, Z, rng), N, shape, phi, seed + 1, R, maxRounds);
    const maxLen = Math.max(lattice.history.length, random.history.length);
    const chart = Array.from({ length: maxLen }, (_, t) => ({
      t,
      lattice: t < lattice.history.length ? lattice.history[t] : lattice.history.at(-1),
      random: t < random.history.length ? random.history[t] : random.history.at(-1),
    }));
    setCentolaResult({ chart, lattice, random });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 0.4rem' }}>Curve designer</h4>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 140px' }}>
              response
              <select value={shape} onChange={(e) => setShape(e.target.value)} style={{ width: '100%' }}>
                <option value="threshold">threshold(φ)</option>
                <option value="diminish">diminishing returns</option>
                <option value="critical">critical mass</option>
                <option value="peak">peak then decline</option>
              </select>
            </label>
            <label style={{ flex: '1 1 120px' }}>
              shape parameter {phi}
              <input type="range" min="1" max="8" value={phi} onChange={(e) => setPhi(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </label>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={curveData}>
              <XAxis dataKey="k" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'k adopting neighbours', position: 'insideBottomRight', fontSize: 9 }} />
              <YAxis domain={[0, 1]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
              <Line dataKey="p" stroke="#245cff" dot={false} name="P(adopt|k)" />
              <Line dataKey="twitter" stroke="#c1121f" strokeDasharray="4 4" dot={false} name="Twitter hashtag shape (ref.)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 0.4rem' }}>Centola replication — clustered lattice vs random</h4>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <label style={{ flex: '1 1 140px' }}>
              N, Z
              <select value={presetIdx} onChange={(e) => setPresetIdx(+e.target.value)} style={{ width: '100%' }}>
                {PRESETS.map((pr, i) => <option key={i} value={i}>N={pr.N}, Z={pr.Z}</option>)}
              </select>
            </label>
            <label style={{ flex: '1 1 100px' }}>
              R = {R}
              <input type="range" min="1" max="20" value={R} onChange={(e) => setR(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </label>
            <button onClick={() => setSeed((s) => s + 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>Reseed</button>
          </div>
          <button onClick={runReplication} style={{ padding: '0.45rem 1.1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '0.5rem' }}>
            Run replication
          </button>
          {centolaResult && (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={centolaResult.chart}>
                  <XAxis dataKey="t" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'round', position: 'insideBottomRight', fontSize: 9 }} />
                  <YAxis domain={[0, 1]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
                  <Line dataKey="lattice" stroke="#4a90d9" dot={false} name="clustered lattice" />
                  <Line dataKey="random" stroke="#e85d04" dot={false} name="random regular" />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '1rem', padding: '0.6rem', background: 'var(--accent-bg)', borderRadius: '8px', fontSize: '0.8rem' }}>
                <span>lattice: final {(centolaResult.lattice.finalFraction * 100).toFixed(1)}%, t½={centolaResult.lattice.timeToHalf ?? '—'}</span>
                <span>random: final {(centolaResult.random.finalFraction * 100).toFixed(1)}%, t½={centolaResult.random.timeToHalf ?? '—'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '0.6rem', background: 'var(--accent-bg)', borderRadius: '8px', marginTop: '0.6rem' }}>
        Clustered networks reinforce complex responses (critical mass, peak-then-decline) despite their larger diameter; random shortcuts favour simple contagion (diminishing returns). Run the replication above to see which network wins for the response shape currently selected.
      </div>
    </div>
  );
}
