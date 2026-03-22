import { useState, useEffect, useRef } from 'react';

const NODES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const EDGES = [
  [0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[5,8],[6,9],[7,9],[8,9],[3,5]
];

const POSITIONS = {
  0: { x: 60,  y: 80  },
  1: { x: 160, y: 40  },
  2: { x: 160, y: 140 },
  3: { x: 260, y: 40  },
  4: { x: 260, y: 120 },
  5: { x: 260, y: 200 },
  6: { x: 360, y: 60  },
  7: { x: 360, y: 160 },
  8: { x: 360, y: 240 },
  9: { x: 460, y: 140 },
};

function buildAdj() {
  const adj = {};
  NODES.forEach(n => (adj[n] = []));
  EDGES.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  return adj;
}

const ADJ = buildAdj();

function bfs(start) {
  const dist = {};
  const prev = {};
  NODES.forEach(n => { dist[n] = Infinity; prev[n] = null; });
  dist[start] = 0;
  const queue = [start];
  while (queue.length > 0) {
    const curr = queue.shift();
    (ADJ[curr] || []).forEach(nb => {
      if (dist[nb] === Infinity) {
        dist[nb] = dist[curr] + 1;
        prev[nb] = curr;
        queue.push(nb);
      }
    });
  }
  return { dist, prev };
}

function getPath(prev, start, end) {
  const path = [];
  let curr = end;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }
  if (path[0] !== start) return [];
  return path;
}

function computeGraphStats() {
  let totalDist = 0, pairs = 0, maxDist = 0;
  NODES.forEach(s => {
    const { dist } = bfs(s);
    NODES.forEach(t => {
      if (t > s && dist[t] !== Infinity) {
        totalDist += dist[t];
        pairs++;
        maxDist = Math.max(maxDist, dist[t]);
      }
    });
  });
  return { diameter: maxDist, avgPath: pairs > 0 ? (totalDist / pairs).toFixed(2) : 'N/A' };
}

const { diameter, avgPath } = computeGraphStats();

const DISTANCE_COLORS = [
  '#f0c040', '#4a90d9', '#2d6a4f', '#e85d04', '#c1121f',
  '#7b2d8b', '#1a6b4a', '#8b4513', '#4682b4', '#888888',
];

export default function PathExplorer() {
  const [mode, setMode] = useState('shortest');
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [bfsStep, setBfsStep] = useState(0);
  const [bfsData, setBfsData] = useState(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const handleNodeClick = id => {
    if (mode === 'shortest') {
      if (selected.length === 0) {
        setSelected([id]);
        setResult(null);
      } else if (selected.length === 1 && selected[0] !== id) {
        const start = selected[0];
        const { dist, prev } = bfs(start);
        const path = getPath(prev, start, id);
        setSelected([start, id]);
        setResult({ type: 'path', path, length: dist[id] });
      } else {
        setSelected([id]);
        setResult(null);
      }
    } else {
      // BFS mode
      const { dist } = bfs(id);
      const layers = {};
      NODES.forEach(n => {
        if (dist[n] !== Infinity) {
          if (!layers[dist[n]]) layers[dist[n]] = [];
          layers[dist[n]].push(n);
        }
      });
      const maxDist = Math.max(...Object.keys(layers).map(Number));
      setBfsData({ dist, layers, maxDist, start: id });
      setBfsStep(0);
      setSelected([id]);
      setResult({ type: 'bfs' });
      clearTimeout(timerRef.current);
      setAnimating(false);
    }
  };

  const handleStep = () => {
    if (bfsData && bfsStep < bfsData.maxDist) {
      setBfsStep(s => s + 1);
    }
  };

  const handlePlay = () => {
    if (!bfsData) return;
    setAnimating(true);
    let step = bfsStep;
    const go = () => {
      if (step < bfsData.maxDist) {
        step++;
        setBfsStep(step);
        timerRef.current = setTimeout(go, 600);
      } else {
        setAnimating(false);
      }
    };
    timerRef.current = setTimeout(go, 600);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const resetMode = m => {
    setMode(m);
    setSelected([]);
    setResult(null);
    setBfsData(null);
    setBfsStep(0);
    setAnimating(false);
    clearTimeout(timerRef.current);
  };

  const getNodeColor = id => {
    if (mode === 'shortest' && result?.type === 'path') {
      if (result.path.includes(id)) return '#f0c040';
    }
    if (mode === 'bfs' && bfsData) {
      const d = bfsData.dist[id];
      if (d !== undefined && d !== Infinity && d <= bfsStep) {
        return DISTANCE_COLORS[d] || '#4a90d9';
      }
      return '#2a2d3e';
    }
    if (selected.includes(id)) return '#f0c040';
    return '#4a90d9';
  };

  const isPathEdge = (a, b) => {
    if (result?.type !== 'path' || result.path.length < 2) return false;
    return result.path.some(
      (n, i) =>
        i < result.path.length - 1 &&
        ((result.path[i] === a && result.path[i + 1] === b) ||
          (result.path[i] === b && result.path[i + 1] === a))
    );
  };

  return (
    <div style={{ color: '#e0e4f0' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['shortest', 'bfs'].map(m => (
          <button
            key={m}
            onClick={() => resetMode(m)}
            style={{
              padding: '0.35rem 0.9rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              background: mode === m ? '#5b6eae' : '#2a2d3e',
              border: `1px solid ${mode === m ? '#5b6eae' : '#3a3d50'}`,
              color: mode === m ? 'white' : '#8b9bd4',
            }}
          >
            {m === 'shortest' ? 'Shortest Path' : 'BFS Traversal'}
          </button>
        ))}
        {mode === 'bfs' && bfsData && (
          <>
            <button
              onClick={handleStep}
              disabled={bfsStep >= bfsData.maxDist || animating}
              style={{
                padding: '0.35rem 0.7rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#2a2d3e',
                border: '1px solid #3a3d50',
                color: '#8b9bd4',
                opacity: bfsStep >= bfsData.maxDist || animating ? 0.5 : 1,
              }}
            >
              Step
            </button>
            <button
              onClick={handlePlay}
              disabled={bfsStep >= bfsData.maxDist || animating}
              style={{
                padding: '0.35rem 0.7rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#2d6a4f',
                border: '1px solid #2d6a4f',
                color: 'white',
                opacity: bfsStep >= bfsData.maxDist || animating ? 0.5 : 1,
              }}
            >
              Play
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.8rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#8b9bd4' }}>
          Diameter: <span style={{ color: 'white', fontFamily: 'monospace' }}>{diameter}</span>
        </span>
        <span style={{ color: '#8b9bd4' }}>
          Avg path length: <span style={{ color: 'white', fontFamily: 'monospace' }}>{avgPath}</span>
        </span>
        {result?.type === 'path' && result.path.length > 1 && (
          <span style={{ color: '#f0c040' }}>
            Path length: <span style={{ fontFamily: 'monospace' }}>{result.length}</span>
            {' '}→ {result.path.join(' → ')}
          </span>
        )}
        {mode === 'bfs' && bfsData && (
          <span style={{ color: '#4a90d9' }}>
            BFS layer: <span style={{ fontFamily: 'monospace' }}>{bfsStep}</span> / {bfsData.maxDist}
          </span>
        )}
      </div>

      {/* Instruction */}
      <div style={{ fontSize: '0.78rem', color: '#8b9bd4', marginBottom: '0.8rem' }}>
        {mode === 'shortest'
          ? selected.length === 0
            ? 'Click a source node'
            : selected.length === 1
            ? 'Click a target node'
            : 'Showing shortest path — click a node to reset'
          : 'Click a node to start BFS'}
      </div>

      {/* SVG */}
      <svg
        viewBox="0 0 540 290"
        style={{ width: '100%', background: '#12141f', borderRadius: '8px', maxHeight: 290 }}
      >
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={POSITIONS[a].x}
            y1={POSITIONS[a].y}
            x2={POSITIONS[b].x}
            y2={POSITIONS[b].y}
            stroke={isPathEdge(a, b) ? '#f0c040' : '#2a2d3e'}
            strokeWidth={isPathEdge(a, b) ? 3 : 1.5}
          />
        ))}
        {NODES.map(id => {
          const pos = POSITIONS[id];
          const color = getNodeColor(id);
          const bfsDist = mode === 'bfs' && bfsData && bfsData.dist[id] <= bfsStep ? bfsData.dist[id] : null;
          return (
            <g key={id} style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(id)}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={18}
                fill={color}
                stroke={selected.includes(id) ? 'white' : 'transparent'}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '11px', fill: 'white', fontWeight: 700, pointerEvents: 'none' }}
              >
                {id}
              </text>
              {bfsDist !== null && (
                <text
                  x={pos.x + 16}
                  y={pos.y - 16}
                  textAnchor="middle"
                  style={{ fontSize: '10px', fill: '#f0c040', fontWeight: 700, pointerEvents: 'none' }}
                >
                  {bfsDist}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* BFS layer legend */}
      {mode === 'bfs' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
          {[0, 1, 2, 3, 4].map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
              <div
                style={{ width: 10, height: 10, borderRadius: '50%', background: DISTANCE_COLORS[d] }}
              />
              <span style={{ color: '#8b9bd4' }}>d={d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
