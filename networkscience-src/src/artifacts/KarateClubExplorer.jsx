import { useMemo, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ReferenceDot, ResponsiveContainer } from 'recharts';
import { KARATE_EDGES, KARATE_GROUND_TRUTH, KARATE_LAYOUT } from '../data/karate';
import { edgeBetweenness } from '../utils/graph';
import { makeUnionFind } from '../utils/unionFind';

const N = 34;
const M = KARATE_EDGES.length;

function degrees() {
  const d = Array(N).fill(0);
  KARATE_EDGES.forEach(([a, b]) => { d[a]++; d[b]++; });
  return d;
}

function modularity(labels, edges = KARATE_EDGES, m = M) {
  const comms = {};
  labels.forEach((l, i) => { (comms[l] = comms[l] || []).push(i); });
  const deg = Array(N).fill(0);
  edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  let Q = 0;
  Object.values(comms).forEach((nodes) => {
    const set = new Set(nodes);
    let Lc = 0, kc = 0;
    edges.forEach(([a, b]) => { if (set.has(a) && set.has(b)) Lc++; });
    nodes.forEach((i) => { kc += deg[i]; });
    Q += Lc / m - (kc / (2 * m)) ** 2;
  });
  return Q;
}

// Newman's greedy modularity maximisation (CNM): start from singletons, repeatedly
// merge the pair of adjacent communities giving the largest Delta-Q, recording the
// full merge history (labels + Q) at every step so the UI can step through it.
function greedyHistory() {
  const deg = degrees();
  let labels = Array.from({ length: N }, (_, i) => i);
  const history = [{ labels: [...labels], Q: modularity(labels) }];
  // e[i][j] = fraction of edges between community i and j; a[i] = fraction of degree in i
  let e = new Map();
  KARATE_EDGES.forEach(([u, v]) => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    e.set(key, (e.get(key) || 0) + 1 / M);
  });
  let a = deg.map((d) => d / (2 * M));
  let comms = new Set(labels);

  for (let step = 0; step < N - 1 && comms.size > 1; step++) {
    let bestDQ = -Infinity, bestPair = null;
    const commList = [...comms];
    for (let i = 0; i < commList.length; i++) {
      for (let j = i + 1; j < commList.length; j++) {
        const ci = commList[i], cj = commList[j];
        const key = ci < cj ? `${ci}-${cj}` : `${cj}-${ci}`;
        const eij = e.get(key) || 0;
        if (eij <= 0) continue;
        const dQ = 2 * (eij - a[ci] * a[cj]);
        if (dQ > bestDQ) { bestDQ = dQ; bestPair = [ci, cj]; }
      }
    }
    if (!bestPair) break;
    const [ci, cj] = bestPair;
    // merge cj into ci
    labels = labels.map((l) => (l === cj ? ci : l));
    const newE = new Map();
    e.forEach((val, key) => {
      const [x, y] = key.split('-').map(Number);
      const nx = x === cj ? ci : x, ny = y === cj ? ci : y;
      if (nx === ny) return;
      const nkey = nx < ny ? `${nx}-${ny}` : `${ny}-${nx}`;
      newE.set(nkey, (newE.get(nkey) || 0) + val);
    });
    e = newE;
    a[ci] += a[cj];
    comms.delete(cj);
    history.push({ labels: [...labels], Q: modularity(labels) });
  }
  return history;
}

// Girvan-Newman: repeatedly remove the highest-betweenness edge, recompute components
// as communities, recompute betweenness on the shrunken edge set, record history.
function girvanNewmanHistory() {
  let remaining = [...KARATE_EDGES];
  const history = [];
  const componentLabels = (edges) => {
    const uf = makeUnionFind(N);
    edges.forEach(([a, b]) => uf.union(a, b));
    const rootId = new Map();
    return Array.from({ length: N }, (_, i) => {
      const r = uf.find(i);
      if (!rootId.has(r)) rootId.set(r, rootId.size);
      return rootId.get(r);
    });
  };
  // Q is always scored against the ORIGINAL full graph (edges=KARATE_EDGES, m=M) —
  // removing edges is only the algorithmic device for finding the next partition,
  // not a change to what "good partition" means
  history.push({ labels: componentLabels(remaining), Q: modularity(componentLabels(remaining)), removedEdge: null, topEdges: [] });
  while (remaining.length > 0) {
    const bc = edgeBetweenness(N, remaining);
    const ranked = [...bc.entries()].sort((a, b) => b[1] - a[1]);
    const [topKey] = ranked[0];
    const [u, v] = topKey.split('-').map(Number);
    remaining = remaining.filter(([a, b]) => !((a === u && b === v) || (a === v && b === u)));
    const labels = componentLabels(remaining);
    history.push({ labels, Q: modularity(labels), removedEdge: [u, v], topEdges: ranked.slice(0, 5).map(([k, v2]) => ({ key: k, score: v2 })) });
  }
  return history;
}

const PALETTE = ['#4a90d9', '#e85d04', '#2d6a4f', '#7b2cbf', '#c1121f', '#101318', '#245cff', '#aebfff'];

export default function KarateClubExplorer() {
  const [algorithm, setAlgorithm] = useState('ground');
  const [step, setStep] = useState(0);

  const greedy = useMemo(() => greedyHistory(), []);
  const gn = useMemo(() => girvanNewmanHistory(), []);

  const history = algorithm === 'greedy' ? greedy : algorithm === 'gn' ? gn : null;
  const maxStepIdx = history ? history.length - 1 : 0;
  const clampedStep = Math.min(step, maxStepIdx);
  const current = algorithm === 'ground' ? KARATE_GROUND_TRUTH : history[clampedStep].labels;
  const q = modularity(current);
  const communities = new Set(current).size;
  // pairwise agreement (Rand-index style): community labels are only meaningful up to
  // permutation, so comparing raw label equality would be wrong — compare co-membership
  const agreement = useMemo(() => {
    let consistent = 0, total = 0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const sameNow = current[i] === current[j];
        const sameGT = KARATE_GROUND_TRUTH[i] === KARATE_GROUND_TRUTH[j];
        if (sameNow === sameGT) consistent++;
        total++;
      }
    }
    return consistent / total;
  }, [current]);

  const qHistory = history ? history.map((h, i) => ({ step: i, Q: h.Q })) : [];
  const bestStep = history ? qHistory.reduce((best, r) => (r.Q > best.Q ? r : best), qHistory[0]) : null;

  const topEdges = algorithm === 'gn' && clampedStep < gn.length ? gn[clampedStep].topEdges : [];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ flex: '1 1 200px' }}>
          <div>algorithm</div>
          <select value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setStep(0); }} style={{ width: '100%' }}>
            <option value="ground">Ground truth</option>
            <option value="greedy">Greedy modularity (Newman)</option>
            <option value="gn">Girvan–Newman (link betweenness)</option>
          </select>
        </label>
        {history && (
          <label style={{ flex: '1 1 220px' }}>
            <div>step {clampedStep} / {maxStepIdx}</div>
            <input type="range" min="0" max={maxStepIdx} value={clampedStep} onChange={(e) => setStep(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </label>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
        <svg viewBox="0 0 380 300" role="img" style={{ flex: '1 1 300px', width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
          <title>Zachary karate club network</title>
          {KARATE_EDGES.map(([a, b], i) => {
            // an edge is "present" at this GN step if it hasn't been removed yet
            const stillPresent = algorithm !== 'gn' || !gn.slice(1, clampedStep + 1)
              .some((h) => h.removedEdge && ((h.removedEdge[0] === a && h.removedEdge[1] === b) || (h.removedEdge[0] === b && h.removedEdge[1] === a)));
            return (
              <line key={i} x1={KARATE_LAYOUT[a][0]} y1={KARATE_LAYOUT[a][1]} x2={KARATE_LAYOUT[b][0]} y2={KARATE_LAYOUT[b][1]}
                stroke={stillPresent ? '#c7ccd8' : '#e4e6ec'} strokeWidth={stillPresent ? 1 : 1} strokeDasharray={stillPresent ? undefined : '2 2'} />
            );
          })}
          {KARATE_LAYOUT.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="7" fill={PALETTE[current[i] % PALETTE.length]} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="6" fill="white">{i + 1}</text>
            </g>
          ))}
        </svg>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          {history ? (
            <ResponsiveContainer width="100%" height={190}>
              <ComposedChart data={qHistory}>
                <XAxis dataKey="step" tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }} />
                <Line dataKey="Q" dot={false} stroke="#245cff" />
                {bestStep && <ReferenceDot x={bestStep.step} y={bestStep.Q} r={5} fill="#c1121f" stroke="none" />}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>
              Q-vs-step is only tracked for the algorithmic partitions
            </div>
          )}
          <div style={{ background: 'var(--accent-bg)', padding: '0.6rem', borderRadius: '8px' }}>
            Q = {q.toFixed(3)} · communities = {communities} · ground-truth agreement = {(agreement * 100).toFixed(1)}%
            {bestStep && <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--muted)' }}>max Q = {bestStep.Q.toFixed(3)} at step {bestStep.step}</div>}
          </div>
          {algorithm === 'gn' && topEdges.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ color: 'var(--muted)', marginBottom: '0.2rem' }}>next edges by betweenness:</div>
              {topEdges.map((e) => <div key={e.key}>{e.key}: {e.score.toFixed(1)}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
