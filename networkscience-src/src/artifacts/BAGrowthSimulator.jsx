import { useState, useEffect, useRef, useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SVG_SIZE = 300;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const GOLDEN = 2.39996; // golden angle (radians)

function getPos(i, N) {
  const maxR = SVG_SIZE * 0.43;
  const r = maxR * Math.sqrt((i + 1) / Math.max(N, 1));
  const angle = i * GOLDEN;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function buildInitial(m) {
  const m0 = Math.max(m, 2);
  const degree = {};
  const edges = [];
  for (let i = 0; i < m0; i++) degree[i] = 0;
  for (let i = 0; i < m0; i++) {
    for (let j = i + 1; j < m0; j++) {
      edges.push([i, j]);
      degree[i]++;
      degree[j]++;
    }
  }
  return { nodeCount: m0, degree, edges };
}

function stepBA(state, m) {
  const { nodeCount, degree, edges } = state;
  const newId = nodeCount;

  // Build probability pool: each node i appears degree[i] times
  const pool = [];
  for (let i = 0; i < nodeCount; i++) {
    const d = degree[i] || 0;
    for (let t = 0; t < d; t++) pool.push(i);
  }
  if (pool.length === 0) {
    // Fallback: uniform attachment
    for (let i = 0; i < nodeCount; i++) pool.push(i);
  }

  const connected = new Set();
  const newEdges = [];
  const newDegree = { ...degree, [newId]: 0 };
  let attempts = 0;

  while (connected.size < Math.min(m, nodeCount) && attempts < 10000) {
    attempts++;
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (!connected.has(target)) {
      connected.add(target);
      newEdges.push([newId, target]);
      newDegree[newId]++;
      newDegree[target]++;
      pool.push(newId);
      pool.push(target);
    }
  }

  return {
    nodeCount: nodeCount + 1,
    degree: newDegree,
    edges: [...edges, ...newEdges],
  };
}

function getNodeColor(deg, maxDeg) {
  const t = Math.min(1, deg / Math.max(maxDeg, 1));
  const r = Math.round(91 + (217 - 91) * t);
  const g = Math.round(110 + (60 - 110) * t);
  const b = Math.round(174 + (50 - 174) * t);
  return `rgb(${r},${g},${b})`;
}

export default function BAGrowthSimulator() {
  const [N, setN] = useState(80);
  const [m, setM] = useState(2);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState(() => buildInitial(2));
  const intervalRef = useRef(null);

  const reset = (newM = m, newN = N) => {
    setRunning(false);
    setState(buildInitial(newM));
    void newN; // N only affects stopping condition and positions
  };

  // Clear interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.nodeCount >= N) {
            setRunning(false);
            return prev;
          }
          return stepBA(prev, m);
        });
      }, 60);
    }
  }, [running, N, m]);

  const positions = useMemo(() =>
    Array.from({ length: N }, (_, i) => getPos(i, N)),
  [N]);

  // Log-log degree distribution
  const logDistData = useMemo(() => {
    const { degree, nodeCount } = state;
    const hist = {};
    Object.values(degree).forEach(d => { hist[d] = (hist[d] || 0) + 1; });
    return Object.entries(hist)
      .filter(([k]) => +k >= 1)
      .map(([k, cnt]) => ({
        logK: +Math.log10(+k).toFixed(3),
        logP: +Math.log10(cnt / nodeCount).toFixed(3),
      }))
      .sort((a, b) => a.logK - b.logK);
  }, [state]);

  const maxDeg = Math.max(...Object.values(state.degree), 1);

  const handlePlay = () => {
    if (state.nodeCount >= N) {
      setState(buildInitial(m));
      setRunning(true);
    } else {
      setRunning(r => !r);
    }
  };

  const btnBase = { padding: '0.3rem 0.85rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.8rem' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>
            N = {N} nodes
          </label>
          <input type="range" min={20} max={150} step={10} value={N} disabled={running}
            onChange={e => { setN(+e.target.value); reset(m, +e.target.value); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>
            m = {m} edges / new node
          </label>
          <input type="range" min={1} max={5} step={1} value={m} disabled={running}
            onChange={e => { setM(+e.target.value); reset(+e.target.value); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
      </div>

      {/* Buttons + counter */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem' }}>
        <button onClick={handlePlay} style={{
          ...btnBase, background: running ? '#d95b8f' : 'var(--accent)', border: 'none', color: 'white',
        }}>
          {running ? '⏸ Pause' : state.nodeCount >= N ? '↺ Restart' : '▶ Play'}
        </button>
        <button onClick={() => reset()} style={{
          ...btnBase, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)',
        }}>
          Reset
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>
          {state.nodeCount} / {N} nodes · {state.edges.length} edges
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Graph */}
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
            {state.edges.map(([a, b], i) => {
              const pa = positions[a], pb = positions[b];
              if (!pa || !pb) return null;
              return (
                <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke="#c5cad8" strokeWidth={0.7} opacity={0.55} />
              );
            })}
            {Array.from({ length: state.nodeCount }, (_, id) => {
              const pos = positions[id];
              if (!pos) return null;
              const deg = state.degree[id] || 0;
              const r = Math.max(2.5, Math.min(11, 2.5 + deg * 0.7));
              return (
                <circle key={id} cx={pos.x} cy={pos.y} r={r}
                  fill={getNodeColor(deg, maxDeg)} opacity={0.9} />
              );
            })}
          </svg>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem', textAlign: 'center' }}>
            Node size and color reflect degree. Hubs = dark blue.
          </div>
        </div>

        {/* Log-log degree distribution */}
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
            Degree distribution (log-log)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={logDistData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="logK" type="number" domain={['auto', 'auto']}
                tick={{ fill: '#5b5b5b', fontSize: 9 }} axisLine={false} tickLine={false}
                label={{ value: 'log(k)', fill: '#5b5b5b', fontSize: 9, position: 'insideBottomRight', offset: 0 }}
                tickFormatter={v => v.toFixed(1)} />
              <YAxis dataKey="logP" type="number" domain={['auto', 'auto']}
                tick={{ fill: '#5b5b5b', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={v => v.toFixed(1)} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.72rem' }}
                formatter={v => [v.toFixed(2)]}
              />
              <Line type="monotone" dataKey="logP" stroke="var(--accent)" strokeWidth={2}
                dot={{ r: 3, fill: 'var(--accent)' }} name="log P(k)" />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
            {state.nodeCount >= N
              ? 'Slope ≈ −3 as predicted by the BA model'
              : 'Converges to slope −3 as N grows'}
          </div>
        </div>
      </div>
    </div>
  );
}
