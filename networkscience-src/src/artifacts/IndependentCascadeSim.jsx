import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IC_EDGES, IC_LAYOUT } from '../data/icGraph';
import { mulberry32 } from '../utils/random';

const NODES = 'abcdefghi'.split('');

function runOnce(rng, seeds, pOverride) {
  const active = new Set(seeds);
  const front = [...seeds];
  while (front.length) {
    const v = front.shift();
    IC_EDGES.filter((e) => e[0] === v).forEach(([, w, p]) => {
      if (!active.has(w) && rng() < (pOverride ?? p)) { active.add(w); front.push(w); }
    });
  }
  return active;
}

// full round-by-round trace: one entry per round with which edges were attempted and
// whether each fired, so a "Step" button can walk through it deterministically
function traceRounds(seed, seedNodes, pOverride) {
  const rng = mulberry32(seed);
  const active = new Set(seedNodes);
  const history = [{ round: 0, newlyActive: [...seedNodes], attempts: [] }];
  let frontier = [...seedNodes];
  let round = 0;
  while (frontier.length && round < 20) {
    round++;
    const nextFrontier = [];
    const attempts = [];
    frontier.forEach((v) => {
      IC_EDGES.filter((e) => e[0] === v).forEach(([, w, pr]) => {
        if (active.has(w)) return;
        const prob = pOverride ?? pr;
        const fired = rng() < prob;
        attempts.push({ from: v, to: w, prob, fired });
        if (fired) { active.add(w); nextFrontier.push(w); }
      });
    });
    history.push({ round, newlyActive: nextFrontier, attempts });
    frontier = nextFrontier;
  }
  return history;
}

function expectedSpread(seedNodes, pOverride, baseSeed, trials) {
  let sum = 0;
  const activationCount = Object.fromEntries(NODES.map((n) => [n, 0]));
  for (let i = 0; i < trials; i++) {
    const rng = mulberry32(baseSeed * 7919 + i * 104729 + 1);
    const active = runOnce(rng, seedNodes, pOverride);
    sum += active.size;
    active.forEach((n) => { activationCount[n]++; });
  }
  return { sigma: sum / trials, activationProb: Object.fromEntries(NODES.map((n) => [n, activationCount[n] / trials])) };
}

function greedyInfluence(k, pOverride, baseSeed, trials) {
  const chosen = [];
  const results = [];
  for (let step = 0; step < k; step++) {
    let best = null, bestSigma = -Infinity;
    NODES.forEach((n) => {
      if (chosen.includes(n)) return;
      const { sigma } = expectedSpread([...chosen, n], pOverride, baseSeed + step * 97 + n.charCodeAt(0), trials);
      if (sigma > bestSigma) { bestSigma = sigma; best = n; }
    });
    chosen.push(best);
    results.push({ k: step + 1, seeds: [...chosen], sigma: bestSigma });
  }
  return results;
}

export default function IndependentCascadeSim() {
  const [seeds, setSeeds] = useState(new Set(['a', 'e', 'f', 'g']));
  const [seed, setSeed] = useState(1);
  const [p, setP] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [mcResult, setMcResult] = useState(null);
  const [greedyResult, setGreedyResult] = useState(null);

  const trace = useMemo(() => traceRounds(seed, [...seeds], p), [seed, seeds, p]);
  const clampedStep = Math.min(stepIdx, trace.length - 1);
  const active = new Set(trace.slice(0, clampedStep + 1).flatMap((r) => r.newlyActive));
  const currentAttempts = trace[clampedStep].attempts;
  const spentEdges = new Set(trace.slice(0, clampedStep).flatMap((r) => r.attempts.map((a) => `${a.from}-${a.to}`)));

  const runMonteCarlo = () => setMcResult(expectedSpread([...seeds], p, seed, 10000));
  const runGreedy = () => setGreedyResult(greedyInfluence(3, p, seed + 500, 1000));

  const toggleSeed = (n) => {
    setSeeds((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });
    setStepIdx(0); setMcResult(null); setGreedyResult(null);
  };

  return (
    <div>
      <label htmlFor="ic-p">global p override {p === null ? 'off (use per-edge probabilities)' : p.toFixed(2)}</label>
      <input id="ic-p" type="range" min="0" max=".8" step=".05" value={p ?? 0} onChange={(e) => { setP(+e.target.value); setStepIdx(0); setMcResult(null); setGreedyResult(null); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
      <button onClick={() => { setP(null); setStepIdx(0); setMcResult(null); setGreedyResult(null); }} style={{ marginTop: '0.3rem', padding: '0.3rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>
        use per-edge probabilities
      </button>

      <svg viewBox="0 0 380 260" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px', marginTop: '0.6rem' }}>
        <title>Independent cascade graph — click nodes to toggle seeds</title>
        {IC_EDGES.map(([a, b, pr], i) => {
          const key = `${a}-${b}`;
          const thisRound = currentAttempts.find((at) => at.from === a && at.to === b);
          const spent = spentEdges.has(key);
          let stroke = '#999';
          if (thisRound) stroke = thisRound.fired ? '#2d6a4f' : '#c1121f';
          else if (spent) stroke = '#ddd';
          return (
            <g key={i}>
              <line x1={IC_LAYOUT[a][0]} y1={IC_LAYOUT[a][1]} x2={IC_LAYOUT[b][0]} y2={IC_LAYOUT[b][1]} stroke={stroke} strokeWidth={thisRound ? 2 : 1} />
              <text x={(IC_LAYOUT[a][0] + IC_LAYOUT[b][0]) / 2} y={(IC_LAYOUT[a][1] + IC_LAYOUT[b][1]) / 2} fontSize="8" fill="var(--muted)">{(p ?? pr).toFixed(2)}</text>
            </g>
          );
        })}
        {NODES.map((n) => (
          <g key={n} onClick={() => toggleSeed(n)} style={{ cursor: 'pointer' }}>
            <circle cx={IC_LAYOUT[n][0]} cy={IC_LAYOUT[n][1]} r="13" fill={active.has(n) ? '#245cff' : 'white'} stroke="#245cff" strokeWidth={seeds.has(n) ? 3 : 1.5} />
            <text x={IC_LAYOUT[n][0]} y={IC_LAYOUT[n][1] + 4} textAnchor="middle" fill={active.has(n) ? 'white' : '#245cff'}>{n}</text>
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
        <button onClick={() => setStepIdx((s) => Math.min(s + 1, trace.length - 1))} style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>
          Step (round {clampedStep}/{trace.length - 1})
        </button>
        <button onClick={() => { setSeed((s) => s + 1); setStepIdx(0); setMcResult(null); setGreedyResult(null); }}
          style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
          New run
        </button>
        <span style={{ padding: '0.45rem 0.7rem', background: 'var(--accent-bg)', borderRadius: '6px' }}>active {active.size}/9</span>
      </div>

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem 0 0.4rem' }}>Monte Carlo — 10,000 runs</h4>
      <button onClick={runMonteCarlo} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}>
        Run 10,000 trials
      </button>
      {mcResult && (
        <>
          <div style={{ padding: '0.5rem', background: 'var(--accent-bg)', borderRadius: '8px', marginBottom: '0.5rem' }}>expected spread σ(S) = {mcResult.sigma.toFixed(3)}</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={NODES.map((n) => ({ node: n, prob: mcResult.activationProb[n] }))}>
              <XAxis dataKey="node" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
              <Bar dataKey="prob" fill="#4a90d9" name="activation probability" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      <h4 style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '1rem 0 0.4rem' }}>Greedy influence maximisation (budget k = 1..3)</h4>
      <button onClick={runGreedy} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}>
        Compute greedy seed sets
      </button>
      {greedyResult && (
        <table>
          <thead><tr><th>k</th><th>chosen seeds</th><th>σ(S)</th></tr></thead>
          <tbody>
            {greedyResult.map((r) => (
              <tr key={r.k}><td>{r.k}</td><td>{r.seeds.join(', ')}</td><td>{r.sigma.toFixed(3)}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      <small style={{ display: 'block', marginTop: '0.6rem', color: 'var(--muted)' }}>
        {p === null ? 'Using each edge\'s own probability.' : 'All edges use the overridden global p — this reduces to a network SIR model.'}
      </small>
    </div>
  );
}
