import { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PowerLawExplorer() {
  const [alpha, setAlpha] = useState(2.5);
  const [kMin, setKMin] = useState(1);
  const [view, setView] = useState('linear');

  const kMax = 80;

  const data = useMemo(() => {
    const ks = Array.from({ length: kMax - kMin + 1 }, (_, i) => kMin + i);
    const raw = ks.map(k => Math.pow(k, -alpha));
    const Z = raw.reduce((a, b) => a + b, 0);
    return ks.map((k, i) => ({
      k,
      pk: +(raw[i] / Z).toFixed(5),
      logK: +Math.log10(k).toFixed(4),
      logPk: +Math.log10(raw[i] / Z).toFixed(4),
    }));
  }, [alpha, kMin]);

  const linearData = data.slice(0, Math.min(50, data.length));
  const logData = data.filter(d => isFinite(d.logPk));

  const meanDeg = alpha > 2 ? (alpha - 1) / (alpha - 2) * kMin : null;
  const varFinite = alpha > 3;

  const btnStyle = active => ({
    padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '5px', cursor: 'pointer',
    background: active ? 'var(--accent)' : 'var(--bg)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    color: active ? 'white' : 'var(--muted)',
  });

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>
            α = {alpha.toFixed(1)}
          </label>
          <input type="range" min={1.5} max={4} step={0.1} value={alpha}
            onChange={e => setAlpha(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>
            k_min = {kMin}
          </label>
          <input type="range" min={1} max={10} step={1} value={kMin}
            onChange={e => setKMin(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.8rem', fontSize: '0.82rem' }}>
        <span style={{ color: 'var(--muted)' }}>⟨k⟩ = <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
          {meanDeg != null ? meanDeg.toFixed(2) : '∞'}
        </span></span>
        <span style={{ color: 'var(--muted)' }}>Var(k) = <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
          {varFinite ? 'finite' : '∞'}
        </span></span>
        <span style={{ color: 'var(--muted)' }}>Regime: <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
          {alpha <= 2 ? 'α ≤ 2' : alpha <= 3 ? '2 < α ≤ 3' : 'α > 3'}
        </span></span>
      </div>

      {/* Regime badges */}
      {alpha <= 2 && (
        <div style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: '4px',
          background: 'rgba(193,18,31,0.07)', border: '1px solid #c1121f', color: '#c1121f', marginBottom: '0.7rem' }}>
          α ≤ 2: mean degree diverges as N → ∞ — not realizable in large finite networks
        </div>
      )}
      {alpha > 2 && alpha <= 3 && (
        <div style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: '4px',
          background: 'rgba(232,93,4,0.08)', border: '1px solid #e85d04', color: '#b8441a', marginBottom: '0.7rem' }}>
          2 &lt; α ≤ 3: finite mean, divergent variance — most real-world scale-free networks (WWW, citations, metabolic)
        </div>
      )}
      {alpha > 3 && (
        <div style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: '4px',
          background: 'rgba(45,106,79,0.08)', border: '1px solid #2d6a4f', color: '#1a6b4a', marginBottom: '0.7rem' }}>
          α &gt; 3: both mean and variance finite — network behaves closer to a random (Poisson) graph
        </div>
      )}

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <button onClick={() => setView('linear')} style={btnStyle(view === 'linear')}>Linear</button>
        <button onClick={() => setView('loglog')} style={btnStyle(view === 'loglog')}>Log-Log</button>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <ComposedChart
          data={view === 'linear' ? linearData : logData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey={view === 'linear' ? 'k' : 'logK'}
            type="number"
            domain={view === 'linear' ? [kMin, 'auto'] : ['auto', 'auto']}
            tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: view === 'linear' ? 'degree k' : 'log₁₀(k)', fill: '#5b5b5b', fontSize: 10, position: 'insideBottomRight', offset: 0 }}
            tickFormatter={v => view === 'loglog' ? v.toFixed(1) : v}
          />
          <YAxis
            dataKey={view === 'linear' ? 'pk' : 'logPk'}
            tick={{ fill: '#5b5b5b', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={v => view === 'loglog' ? v.toFixed(1) : v}
          />
          <Tooltip
            contentStyle={{ background: 'white', border: '1px solid #e2e4ea', color: '#242424', fontSize: '0.75rem' }}
            formatter={(v, name) => [+v.toFixed(4), name]}
          />
          {view === 'linear'
            ? <Bar dataKey="pk" fill="var(--accent)" opacity={0.82} name="P(k)" radius={[2, 2, 0, 0]} />
            : <Line type="monotone" dataKey="logPk" stroke="var(--accent)" strokeWidth={2.5} dot={false} name="log₁₀ P(k)" />
          }
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
        {view === 'loglog'
          ? `Slope = −α = −${alpha.toFixed(1)}. A straight line in log-log space is the signature of a power law.`
          : 'Heavy tail: most nodes have low degree, but a few hubs have very high degree.'}
      </div>
    </div>
  );
}
