import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const GRAPHS = {
  Star: {
    nodes: [0, 1, 2, 3, 4, 5, 6],
    edges: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]],
  },
  Barbell: {
    nodes: [0,1,2,3,4,5,6,7,8,9,10],
    edges: [
      [0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4],
      [4,5],
      [5,6],[5,7],[5,8],[5,9],[5,10],[6,7],[6,8],[6,9],[6,10],[7,8],[7,9],[7,10],[8,9],[8,10],[9,10],
    ],
  },
  Path: {
    nodes: [0,1,2,3,4,5],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5]],
  },
  Cycle: {
    nodes: [0,1,2,3,4,5],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
  },
  Communities: {
    nodes: [0,1,2,3,4,5,6,7,8],
    edges: [
      [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
      [3,4],
      [4,5],[4,6],[4,7],[4,8],[5,6],[5,7],[5,8],[6,7],[6,8],[7,8],
    ],
  },
};

function computeCircularLayout(nodes) {
  const n = nodes.length;
  const positions = {};
  nodes.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[id] = { x: 200 + 150 * Math.cos(angle), y: 200 + 150 * Math.sin(angle) };
  });
  return positions;
}

function getLayout(name, nodes) {
  if (name === 'Star') {
    const pos = {};
    pos[0] = { x: 200, y: 200 };
    nodes.slice(1).forEach((id, i) => {
      const angle = (2 * Math.PI * i) / (nodes.length - 1) - Math.PI / 2;
      pos[id] = { x: 200 + 160 * Math.cos(angle), y: 200 + 160 * Math.sin(angle) };
    });
    return pos;
  }
  if (name === 'Barbell') {
    const pos = {};
    [0,1,2,3].forEach((id, i) => {
      const angle = (2 * Math.PI * i / 4) - Math.PI / 2;
      pos[id] = { x: 110 + 70 * Math.cos(angle), y: 200 + 70 * Math.sin(angle) };
    });
    pos[4] = { x: 190, y: 200 };
    pos[5] = { x: 250, y: 200 };
    [6,7,8,9,10].forEach((id, i) => {
      const angle = (2 * Math.PI * i / 5) - Math.PI / 2;
      pos[id] = { x: 320 + 70 * Math.cos(angle), y: 200 + 70 * Math.sin(angle) };
    });
    return pos;
  }
  if (name === 'Path') {
    const pos = {};
    nodes.forEach((id, i) => { pos[id] = { x: 38 + i * 64, y: 200 }; });
    return pos;
  }
  if (name === 'Communities') {
    const pos = {};
    [0,1,2,3].forEach((id, i) => {
      const angle = (2 * Math.PI * i / 4) - Math.PI / 2;
      pos[id] = { x: 110 + 78 * Math.cos(angle), y: 200 + 78 * Math.sin(angle) };
    });
    pos[4] = { x: 230, y: 200 };
    [5,6,7,8].forEach((id, i) => {
      const angle = (2 * Math.PI * i / 4) - Math.PI / 2;
      pos[id] = { x: 320 + 62 * Math.cos(angle), y: 200 + 62 * Math.sin(angle) };
    });
    return pos;
  }
  return computeCircularLayout(nodes);
}

function buildAdj(nodes, edges) {
  const adj = {};
  nodes.forEach(n => (adj[n] = []));
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  return adj;
}

function bfsDistances(nodes, adj, source) {
  const dist = {};
  nodes.forEach(n => (dist[n] = Infinity));
  dist[source] = 0;
  const queue = [source];
  while (queue.length > 0) {
    const curr = queue.shift();
    (adj[curr] || []).forEach(nb => {
      if (dist[nb] === Infinity) { dist[nb] = dist[curr] + 1; queue.push(nb); }
    });
  }
  return dist;
}

function computeCentralities(nodes, edges) {
  const adj = buildAdj(nodes, edges);
  const N = nodes.length;

  const degree = {};
  nodes.forEach(v => (degree[v] = adj[v].length / (N - 1)));

  const closeness = {};
  nodes.forEach(v => {
    const dists = bfsDistances(nodes, adj, v);
    const totalDist = Object.values(dists).reduce((s, d) => s + (d === Infinity ? 0 : d), 0);
    const reachable = Object.values(dists).filter(d => d > 0 && d !== Infinity).length;
    closeness[v] = reachable > 0 ? reachable / totalDist : 0;
  });

  const betweenness = {};
  nodes.forEach(v => (betweenness[v] = 0));
  nodes.forEach(s => {
    const stack = [];
    const pred = {};
    const sigma = {};
    const dist = {};
    nodes.forEach(v => { pred[v] = []; sigma[v] = 0; dist[v] = -1; });
    sigma[s] = 1; dist[s] = 0;
    const queue = [s];
    while (queue.length > 0) {
      const v = queue.shift();
      stack.push(v);
      adj[v].forEach(w => {
        if (dist[w] < 0) { queue.push(w); dist[w] = dist[v] + 1; }
        if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; pred[w].push(v); }
      });
    }
    const delta = {};
    nodes.forEach(v => (delta[v] = 0));
    while (stack.length > 0) {
      const w = stack.pop();
      pred[w].forEach(v => { delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]); });
      if (w !== s) betweenness[w] += delta[w];
    }
  });
  const normFactor = N > 2 ? 2 / ((N - 1) * (N - 2)) : 1;
  nodes.forEach(v => (betweenness[v] *= normFactor));

  const eigen = {};
  nodes.forEach(v => (eigen[v] = 1.0 / N));
  for (let iter = 0; iter < 100; iter++) {
    const newEigen = {};
    nodes.forEach(v => { newEigen[v] = adj[v].reduce((s, nb) => s + eigen[nb], 0); });
    const maxVal = Math.max(...Object.values(newEigen), 1e-10);
    nodes.forEach(v => (eigen[v] = newEigen[v] / maxVal));
  }

  return { degree, closeness, betweenness, eigen };
}

const MEASURES = ['Degree', 'Closeness', 'Betweenness', 'Eigenvector'];
const GRAPH_NAMES = Object.keys(GRAPHS);

const btnBase = { padding: '0.28rem 0.65rem', fontSize: '0.78rem', borderRadius: '6px', cursor: 'pointer' };

export default function CentralityExplorer() {
  const [graphName, setGraphName] = useState('Star');
  const [measure, setMeasure] = useState('Degree');
  const [hoveredNode, setHoveredNode] = useState(null);

  const graph = GRAPHS[graphName];
  const { nodes, edges } = graph;
  const centralities = useMemo(() => computeCentralities(nodes, edges), [nodes, edges]);
  const positions = useMemo(() => getLayout(graphName, nodes), [graphName, nodes]);

  const measureKey = measure.toLowerCase();
  const scores = centralities[measureKey] || centralities.degree;
  const maxScore = Math.max(...Object.values(scores), 0.001);
  const maxNode = nodes.reduce((a, b) => (scores[a] > scores[b] ? a : b));

  const getColor = score => {
    const t = score / maxScore;
    const r = Math.round(74 + (220 - 74) * t);
    const g = Math.round(144 + (60 - 144) * t);
    const b = Math.round(217 + (50 - 217) * t);
    return `rgb(${r},${g},${b})`;
  };

  const barData = nodes
    .map(id => ({ name: `n${id}`, score: +(scores[id] || 0).toFixed(3) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Graph:</span>
          {GRAPH_NAMES.map(name => (
            <button key={name} onClick={() => setGraphName(name)} style={{
              ...btnBase,
              background: graphName === name ? 'var(--accent)' : 'var(--bg)',
              border: `1px solid ${graphName === name ? 'var(--accent)' : 'var(--border)'}`,
              color: graphName === name ? 'white' : 'var(--muted)',
            }}>{name}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Measure:</span>
          {MEASURES.map(m => (
            <button key={m} onClick={() => setMeasure(m)} style={{
              ...btnBase,
              background: measure === m ? '#d95b8f' : 'var(--bg)',
              border: `1px solid ${measure === m ? '#d95b8f' : 'var(--border)'}`,
              color: measure === m ? 'white' : 'var(--muted)',
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Graph + info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 400, background: 'var(--accent-bg)', borderRadius: '8px' }}>
            {edges.map(([a, b], i) => (
              <line key={i} x1={positions[a]?.x} y1={positions[a]?.y} x2={positions[b]?.x} y2={positions[b]?.y}
                stroke="#c5cad8" strokeWidth={1.5} />
            ))}
            {positions[maxNode] && (
              <circle cx={positions[maxNode].x} cy={positions[maxNode].y}
                r={Math.max(10, (scores[maxNode] / maxScore) * 22) + 7}
                fill="none" stroke="#d95b8f" strokeWidth={1.5} strokeDasharray="4 3" />
            )}
            {nodes.map(id => {
              const score = scores[id] || 0;
              const r = Math.max(8, (score / maxScore) * 22);
              const pos = positions[id];
              if (!pos) return null;
              return (
                <g key={id} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNode(id)} onMouseLeave={() => setHoveredNode(null)}>
                  <circle cx={pos.x} cy={pos.y} r={r} fill={getColor(score)}
                    stroke={hoveredNode === id ? 'white' : 'transparent'} strokeWidth={2} />
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: '10px', fill: 'white', fontWeight: 600, pointerEvents: 'none' }}>{id}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          {hoveredNode !== null ? (
            <div style={{ background: 'var(--accent-bg)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                Node {hoveredNode}
              </div>
              {['degree', 'closeness', 'betweenness', 'eigen'].map((m, i) => (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{MEASURES[i]}</span>
                  <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
                    {(centralities[m][hoveredNode] || 0).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--accent-bg)', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '0.5rem', color: 'var(--text)', fontWeight: 600 }}>Graph: {graphName}</div>
              <div style={{ color: 'var(--muted)' }}>Nodes: {nodes.length}</div>
              <div style={{ color: 'var(--muted)' }}>Edges: {edges.length}</div>
              <div style={{ marginTop: '0.8rem', color: 'var(--accent)', fontSize: '0.78rem' }}>
                ◎ = highest {measure.toLowerCase()} centrality
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.78rem' }}>
                Hover a node to see all scores
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
          {measure} centrality ranking
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#5b5b5b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5b5b5b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.8rem' }}
              cursor={{ fill: 'rgba(91,110,174,0.08)' }} />
            <Bar dataKey="score" radius={[3, 3, 0, 0]}>
              {barData.map((_, i) => <Cell key={i} fill={i === 0 ? '#d95b8f' : 'var(--accent)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
