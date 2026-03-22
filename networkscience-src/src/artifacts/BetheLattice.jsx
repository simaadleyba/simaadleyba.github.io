import { useState, useMemo } from 'react';

function buildBetheLattice(k, d) {
  const nodes = [];
  const edges = [];
  let id = 0;

  nodes.push({ id: 0, parent: null, depth: 0 });
  id++;

  const queue = [{ nodeId: 0, depth: 0 }];
  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift();
    if (depth >= d) continue;

    const numChildren = depth === 0 ? k : k - 1;
    for (let c = 0; c < numChildren; c++) {
      if (nodes.length >= 500) break;
      const childId = id++;
      nodes.push({ id: childId, parent: nodeId, depth: depth + 1 });
      edges.push([nodeId, childId]);
      queue.push({ nodeId: childId, depth: depth + 1 });
    }
  }

  return { nodes, edges };
}

function computeRadialLayout(nodes, width, height) {
  const positions = {};
  const cx = width / 2;
  const cy = height / 2;

  const byDepth = {};
  nodes.forEach(n => {
    if (!byDepth[n.depth]) byDepth[n.depth] = [];
    byDepth[n.depth].push(n.id);
  });

  const maxDepth = Math.max(...nodes.map(n => n.depth), 0);
  const maxRadius = Math.min(width, height) / 2 - 22;

  positions[0] = { x: cx, y: cy };

  // Track angle ranges per node for proportional subdivision
  const angleRange = { 0: { start: 0, end: 2 * Math.PI } };

  for (let depth = 1; depth <= maxDepth; depth++) {
    const r = (depth / (maxDepth + 0.5)) * maxRadius;
    const nodesAtDepth = byDepth[depth] || [];

    // Group siblings by parent
    const siblingGroups = {};
    nodesAtDepth.forEach(id => {
      const node = nodes.find(n => n.id === id);
      const parent = node.parent;
      if (!siblingGroups[parent]) siblingGroups[parent] = [];
      siblingGroups[parent].push(id);
    });

    Object.entries(siblingGroups).forEach(([parentId, siblings]) => {
      const pRange = angleRange[+parentId] || { start: 0, end: 2 * Math.PI };
      const rangeSize = pRange.end - pRange.start;
      const sliceSize = rangeSize / siblings.length;

      siblings.forEach((id, i) => {
        const angle = pRange.start + sliceSize * (i + 0.5);
        positions[id] = {
          x: cx + r * Math.cos(angle - Math.PI / 2),
          y: cy + r * Math.sin(angle - Math.PI / 2),
        };
        angleRange[id] = {
          start: pRange.start + sliceSize * i,
          end: pRange.start + sliceSize * (i + 1),
        };
      });
    });
  }

  return positions;
}

const DEPTH_COLORS = [
  '#f0c040', '#4a90d9', '#2d6a4f', '#e85d04',
  '#c1121f', '#7b2d8b', '#1a6b4a',
];

export default function BetheLattice() {
  const [k, setK] = useState(3);
  const [d, setD] = useState(3);

  const { nodes, edges } = useMemo(() => buildBetheLattice(k, d), [k, d]);
  const positions = useMemo(
    () => computeRadialLayout(nodes, 400, 360),
    [nodes]
  );

  const levelCounts = useMemo(() => {
    const counts = [1];
    for (let l = 1; l <= d; l++) {
      counts.push(l === 1 ? k : k * Math.pow(k - 1, l - 1));
    }
    return counts;
  }, [k, d]);

  const totalNodes = nodes.length;
  const theoreticalTotal =
    k === 2
      ? 1 + 2 * d
      : Math.round(1 + (k * (Math.pow(k - 1, d) - 1)) / (k - 2));

  return (
    <div style={{ color: '#e0e4f0' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ fontSize: '0.8rem', color: '#8b9bd4', display: 'block', marginBottom: '0.3rem' }}>
            k = {k} (coordination number)
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={k}
            onChange={e => setK(+e.target.value)}
            style={{ width: '100%', accentColor: '#5b6eae' }}
          />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ fontSize: '0.8rem', color: '#8b9bd4', display: 'block', marginBottom: '0.3rem' }}>
            d = {d} (depth)
          </label>
          <input
            type="range"
            min={1}
            max={6}
            value={d}
            onChange={e => setD(+e.target.value)}
            style={{ width: '100%', accentColor: '#5b6eae' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {/* SVG visualization */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <svg
            viewBox="0 0 400 360"
            style={{ width: '100%', background: '#12141f', borderRadius: '8px' }}
          >
            {edges.map(([a, b], i) => {
              const pa = positions[a];
              const pb = positions[b];
              if (!pa || !pb) return null;
              return (
                <line
                  key={i}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke="#2a2d3e"
                  strokeWidth={1.2}
                />
              );
            })}
            {nodes.map(({ id, depth }) => {
              const pos = positions[id];
              if (!pos) return null;
              const r = Math.max(3, 9 - depth * 1.0);
              return (
                <circle
                  key={id}
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={DEPTH_COLORS[depth % DEPTH_COLORS.length]}
                  opacity={0.9}
                />
              );
            })}
          </svg>
          {nodes.length >= 500 && (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#e85d04',
                marginTop: '0.4rem',
                textAlign: 'center',
              }}
            >
              Rendering capped at 500 nodes
            </div>
          )}
        </div>

        {/* Stats panel */}
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <div
            style={{
              background: '#12141f',
              borderRadius: '8px',
              padding: '0.8rem',
              fontSize: '0.82rem',
            }}
          >
            <div
              style={{
                color: '#8b9bd4',
                marginBottom: '0.6rem',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Node Counts by Level
            </div>
            {levelCounts.map((count, level) => (
              <div
                key={level}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: DEPTH_COLORS[level % DEPTH_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#8b9bd4' }}>Level {level}:</span>
                <span style={{ color: 'white', fontFamily: 'monospace' }}>{count}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid #2a2d3e',
                marginTop: '0.6rem',
                paddingTop: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: '#8b9bd4' }}>Actual N</span>
                <span style={{ color: '#f0c040', fontFamily: 'monospace', fontWeight: 700 }}>
                  {totalNodes}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b9bd4' }}>Formula N</span>
                <span style={{ color: '#6bcf9b', fontFamily: 'monospace' }}>{theoreticalTotal}</span>
              </div>
            </div>
          </div>

          {/* Depth legend */}
          <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {Array.from({ length: d + 1 }, (_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: DEPTH_COLORS[i % DEPTH_COLORS.length],
                  }}
                />
                <span style={{ color: '#8b9bd4' }}>d={i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
