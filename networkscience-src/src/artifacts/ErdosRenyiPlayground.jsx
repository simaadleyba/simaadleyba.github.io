import { useState, useEffect, useCallback } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function generateGraph(N, p) {
  const nodes = Array.from({ length: N }, (_, i) => i);
  const edges = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (Math.random() < p) edges.push([i, j]);
    }
  }
  return { nodes, edges };
}

function buildAdj(nodes, edges) {
  const adj = {};
  nodes.forEach(n => (adj[n] = []));
  edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  return adj;
}

function getComponents(nodes, adj) {
  const visited = new Set();
  const components = [];
  nodes.forEach(start => {
    if (visited.has(start)) return;
    const comp = [];
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
      const curr = queue.shift();
      comp.push(curr);
      (adj[curr] || []).forEach(nb => {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
        }
      });
    }
    components.push(comp);
  });
  return components;
}

function bfsAllPairs(nodes, adj) {
  let total = 0, count = 0;
  nodes.forEach(s => {
    const dist = {};
    nodes.forEach(n => (dist[n] = Infinity));
    dist[s] = 0;
    const queue = [s];
    while (queue.length > 0) {
      const curr = queue.shift();
      (adj[curr] || []).forEach(nb => {
        if (dist[nb] === Infinity) {
          dist[nb] = dist[curr] + 1;
          queue.push(nb);
        }
      });
    }
    nodes.forEach(t => {
      if (t !== s && dist[t] !== Infinity) {
        total += dist[t];
        count++;
      }
    });
  });
  return count > 0 ? (total / count).toFixed(2) : 'N/A';
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

// Simple force-directed layout
function forceLayout(N, edges, iterations = 150) {
  const W = 380, H = 300;
  const pos = Array.from({ length: N }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.8,
    y: H / 2 + (Math.random() - 0.5) * H * 0.8,
    vx: 0,
    vy: 0,
  }));

  const k = Math.sqrt((W * H) / Math.max(N, 1));
  const adj = {};
  for (let i = 0; i < N; i++) adj[i] = [];
  edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });

  for (let iter = 0; iter < iterations; iter++) {
    const t = 1 - iter / iterations;
    const temp = 30 * t + 2;

    // Repulsion
    for (let i = 0; i < N; i++) {
      let fx = 0, fy = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const f = (k * k) / d;
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      }
      pos[i].vx = (pos[i].vx + fx * 0.1) * 0.85;
      pos[i].vy = (pos[i].vy + fy * 0.1) * 0.85;
    }

    // Attraction
    edges.forEach(([a, b]) => {
      const dx = pos[b].x - pos[a].x;
      const dy = pos[b].y - pos[a].y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const f = (d * d) / k;
      const fx = (dx / d) * f * 0.08;
      const fy = (dy / d) * f * 0.08;
      pos[a].vx += fx;
      pos[a].vy += fy;
      pos[b].vx -= fx;
      pos[b].vy -= fy;
    });

    // Apply and clamp
    pos.forEach(p => {
      p.x = Math.max(15, Math.min(W - 15, p.x + Math.max(-temp, Math.min(temp, p.vx))));
      p.y = Math.max(15, Math.min(H - 15, p.y + Math.max(-temp, Math.min(temp, p.vy))));
    });
  }
  return pos;
}

export default function ErdosRenyiPlayground() {
  const [N, setN] = useState(25);
  const [p, setP] = useState(0.12);
  const [graph, setGraph] = useState(null);
  const [layout, setLayout] = useState(null);
  const [computing, setComputing] = useState(false);

  const generate = useCallback(() => {
    setComputing(true);
    setTimeout(() => {
      const g = generateGraph(N, p);
      const pos = forceLayout(N, g.edges);
      setGraph(g);
      setLayout(pos);
      setComputing(false);
    }, 10);
  }, [N, p]);

  useEffect(() => {
    generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const adj = graph ? buildAdj(graph.nodes, graph.edges) : {};
  const maxDeg = graph ? Math.max(...graph.nodes.map(n => adj[n]?.length || 0), 1) : 1;

  const stats = graph
    ? (() => {
        const comps = getComponents(graph.nodes, adj);
        const degrees = graph.nodes.map(n => adj[n].length);
        const avgDeg = degrees.reduce((s, d) => s + d, 0) / N;
        const density = graph.edges.length / (N * (N - 1) / 2);
        const isConnected = comps.length === 1;
        const avgPath = isConnected && N <= 50 ? bfsAllPairs(graph.nodes, adj) : 'N/A';
        return { avgDeg, density, isConnected, numComponents: comps.length, avgPath };
      })()
    : null;

  const expectedAvgDeg = p * (N - 1);
  const expectedLinks = p * N * (N - 1) / 2;
  const pc = N > 1 ? Math.log(N) / N : 1;

  // Degree distribution histogram
  const degreeData = graph
    ? (() => {
        const counts = {};
        graph.nodes.forEach(n => {
          const d = adj[n].length;
          counts[d] = (counts[d] || 0) + 1;
        });
        const lambda = expectedAvgDeg;
        const maxK = Math.max(...Object.keys(counts).map(Number), Math.ceil(lambda * 2.5), 5);
        return Array.from({ length: maxK + 1 }, (_, k) => ({
          k,
          actual: +((counts[k] || 0) / N).toFixed(4),
          poisson: +poissonPMF(k, lambda).toFixed(4),
        }));
      })()
    : [];

  const getNodeColor = (deg) => {
    const t = maxDeg > 0 ? deg / maxDeg : 0;
    const r = Math.round(74 + (220 - 74) * t);
    const g = Math.round(144 + (80 - 144) * t);
    const b = Math.round(217 + (50 - 217) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ color: '#e0e4f0' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: '#8b9bd4', display: 'block', marginBottom: '0.3rem' }}>
            N = {N} nodes
          </label>
          <input
            type="range"
            min={5}
            max={80}
            value={N}
            onChange={e => setN(+e.target.value)}
            style={{ width: '100%', accentColor: '#5b6eae' }}
          />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: '#8b9bd4', display: 'block', marginBottom: '0.3rem' }}>
            p = {p.toFixed(2)} (edge probability)
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={p}
            onChange={e => setP(+e.target.value)}
            style={{ width: '100%', accentColor: '#5b6eae' }}
          />
        </div>
        <button
          onClick={generate}
          disabled={computing}
          style={{
            padding: '0.45rem 1.2rem',
            background: '#5b6eae',
            border: 'none',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            opacity: computing ? 0.6 : 1,
          }}
        >
          {computing ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {/* Critical threshold indicator */}
      <div
        style={{
          fontSize: '0.8rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          background: p >= pc ? 'rgba(45,106,79,0.3)' : 'rgba(200,50,50,0.2)',
          border: `1px solid ${p >= pc ? '#2d6a4f' : '#c1121f'}`,
          color: p >= pc ? '#6bcf9b' : '#ff8a8a',
        }}
      >
        p_c = ln(N)/N ≈ {pc.toFixed(3)} — Current p {p >= pc ? '≥' : '<'} p_c → graph is{' '}
        {p >= pc ? 'likely connected' : 'likely disconnected'}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Graph SVG */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          {graph && layout && (
            <svg
              viewBox="0 0 380 300"
              style={{ width: '100%', background: '#12141f', borderRadius: '8px' }}
            >
              {graph.edges.map(([a, b], i) => (
                <line
                  key={i}
                  x1={layout[a]?.x}
                  y1={layout[a]?.y}
                  x2={layout[b]?.x}
                  y2={layout[b]?.y}
                  stroke="#2a2d3e"
                  strokeWidth={1}
                />
              ))}
              {graph.nodes.map(id => {
                const pos = layout[id];
                if (!pos) return null;
                const deg = adj[id]?.length || 0;
                const r = Math.max(4, 3 + deg * 0.5);
                return (
                  <circle
                    key={id}
                    cx={pos.x}
                    cy={pos.y}
                    r={r}
                    fill={getNodeColor(deg)}
                    opacity={0.9}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* Stats panel */}
        {stats && (
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <div
              style={{
                background: '#12141f',
                borderRadius: '8px',
                padding: '0.8rem',
                fontSize: '0.82rem',
              }}
            >
              {[
                ['Expected ⟨k⟩', expectedAvgDeg.toFixed(2)],
                ['Actual ⟨k⟩', stats.avgDeg.toFixed(2)],
                ['Expected ⟨L⟩', expectedLinks.toFixed(1)],
                ['Actual L', graph.edges.length],
                ['Density ρ', stats.density.toFixed(3)],
                ['Components', stats.numComponents],
                ['Connected', stats.isConnected ? 'Yes' : 'No'],
                ['Avg path length', N <= 50 ? stats.avgPath : 'N > 50'],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}
                >
                  <span style={{ color: '#8b9bd4' }}>{label}</span>
                  <span
                    style={{
                      color:
                        label === 'Connected'
                          ? stats.isConnected
                            ? '#6bcf9b'
                            : '#ff8a8a'
                          : 'white',
                      fontFamily: 'monospace',
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Degree distribution chart */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.78rem', color: '#8b9bd4', marginBottom: '0.4rem' }}>
          Degree distribution — bars: actual, line: Poisson(λ={expectedAvgDeg.toFixed(2)})
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={degreeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="k"
              tick={{ fill: '#8b9bd4', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#8b9bd4', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#1a1d2e',
                border: '1px solid #3a3d50',
                color: 'white',
                fontSize: '0.75rem',
              }}
            />
            <Bar dataKey="actual" fill="#4a90d9" opacity={0.8} name="Actual P(k)" radius={[2, 2, 0, 0]} />
            <Line
              type="monotone"
              dataKey="poisson"
              stroke="#e85d04"
              strokeWidth={2}
              dot={false}
              name="Poisson"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
