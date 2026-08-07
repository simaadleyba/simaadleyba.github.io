import { useMemo, useState } from 'react';

const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [2, 4], [5, 6], [5, 7], [6, 8], [6, 9], [8, 9], [4, 5]];
const layouts = Array.from({ length: 10 }, (_, i) => [i < 5 ? 80 + (i % 2) * 80 : 220 + (i % 2) * 80, 50 + (i % 5) * 48]);
const presets = {
  optimal: { label: 'Optimal', labels: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1] },
  suboptimal: { label: 'Suboptimal', labels: [2, 2, 2, 0, 1, 0, 0, 0, 0, 0] },
  one: { label: 'One community', labels: Array(10).fill(0) },
  singletons: { label: 'All singletons', labels: Array.from({ length: 10 }, (_, i) => i) },
};
const PALETTE = ['#4a90d9', '#e85d04', '#2d6a4f', '#7b2cbf', '#c1121f'];

function degrees() {
  const deg = new Array(10).fill(0);
  edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  return deg;
}

function modularity(labels) {
  const L = edges.length;
  const deg = degrees();
  const comms = {};
  labels.forEach((l, i) => { (comms[l] = comms[l] || []).push(i); });
  let Q = 0;
  const rows = [];
  Object.entries(comms).forEach(([c, nodes]) => {
    const nodeSet = new Set(nodes);
    let Lc = 0, kc = 0;
    edges.forEach(([a, b]) => { if (nodeSet.has(a) && nodeSet.has(b)) Lc++; });
    nodes.forEach((i) => { kc += deg[i]; });
    const frac = Lc / L;
    const expected = (kc / (2 * L)) ** 2;
    const contrib = frac - expected;
    Q += contrib;
    rows.push({ community: c, nodes, Lc, kc, frac, expected, contrib });
  });
  return { Q, rows };
}

export default function ModularityPlayground() {
  const [activePreset, setActivePreset] = useState('optimal');
  const [labels, setLabels] = useState([...presets.optimal.labels]);

  const selectPreset = (name) => {
    setActivePreset(name);
    setLabels([...presets[name].labels]);
  };

  const cycleNode = (i) => {
    setActivePreset(null);
    setLabels((prev) => prev.map((v, j) => (j === i ? (v + 1) % 4 : v)));
  };

  const { Q, rows } = useMemo(() => modularity(labels), [labels]);
  const badgeColor = Q > 0.05 ? '#2d6a4f' : Q < -0.05 ? '#c1121f' : 'var(--muted)';

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.entries(presets).map(([n, p]) => (
          <button
            key={n}
            onClick={() => selectPreset(n)}
            style={{
              padding: '0.45rem 0.9rem',
              background: activePreset === n ? 'var(--accent)' : 'var(--card-bg)',
              color: activePreset === n ? 'white' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 380 300" role="img" style={{ width: '100%', background: 'var(--accent-bg)', borderRadius: '8px' }}>
        <title>Modularity partition playground — click a node to cycle its community</title>
        {edges.map(([a, b], i) => (
          <line key={i} x1={layouts[a][0]} y1={layouts[a][1]} x2={layouts[b][0]} y2={layouts[b][1]} stroke="#aeb4c1" strokeWidth="1.5" />
        ))}
        {layouts.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="12"
            fill={PALETTE[labels[i] % PALETTE.length]}
            stroke="white"
            strokeWidth="1.5"
            onClick={() => cycleNode(i)}
            style={{ cursor: 'pointer' }}
          >
            <title>{`node ${i} — community ${labels[i]}`}</title>
          </circle>
        ))}
      </svg>
      <div style={{ fontSize: '1.3rem', padding: '0.8rem', background: 'var(--accent-bg)', borderRadius: '8px', margin: '0.8rem 0', border: `1px solid ${badgeColor}` }}>
        Q = <b style={{ color: badgeColor }}>{Q.toFixed(2)}</b>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '0.6rem' }}>computed live from the current partition — click nodes to change it</span>
      </div>
      <table>
        <thead>
          <tr><th>Community</th><th>L_C</th><th>k_C</th><th>L_C/L</th><th>(k_C/2L)²</th><th>Contribution</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.community}>
              <td><span style={{ display: 'inline-block', width: '0.7rem', height: '0.7rem', borderRadius: '50%', background: PALETTE[r.community % PALETTE.length], marginRight: '0.4rem' }} />{r.nodes.join(',')}</td>
              <td>{r.Lc}</td>
              <td>{r.kc}</td>
              <td>{r.frac.toFixed(3)}</td>
              <td>{r.expected.toFixed(3)}</td>
              <td>{r.contrib.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
