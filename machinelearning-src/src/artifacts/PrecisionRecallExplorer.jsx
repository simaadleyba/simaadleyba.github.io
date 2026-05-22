import { useState, useRef, useCallback } from 'react';

const PRESETS = {
  'Well-separated classes':      { muPos: 0.72, muNeg: 0.28, sigPos: 0.10, sigNeg: 0.10 },
  'Heavily overlapping classes': { muPos: 0.58, muNeg: 0.42, sigPos: 0.18, sigNeg: 0.18 },
};

const N_POS = 100, N_NEG = 100;

function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429*t - 1.453152027)*t + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t*Math.exp(-a*a);
  return sign * y;
}

function gaussPDF(x, mu, sig) {
  return Math.exp(-0.5 * ((x - mu) / sig) ** 2) / (sig * Math.sqrt(2 * Math.PI));
}

function gaussSF(x, mu, sig) {
  return 0.5 * (1 - erf((x - mu) / (sig * Math.sqrt(2))));
}

function computePRCurve(cfg) {
  const pts = [];
  for (let i = 300; i >= 0; i--) {
    const tau = i / 300;
    const recall = gaussSF(tau, cfg.muPos, cfg.sigPos);
    const tp = N_POS * recall;
    const fp = N_NEG * gaussSF(tau, cfg.muNeg, cfg.sigNeg);
    const prec = tp + fp > 0 ? tp / (tp + fp) : null;
    if (prec !== null) pts.push({ tau, recall, prec });
  }
  return pts;
}

const DW = 400, DH = 110;
const PW = 220, PH = 220;

export default function PrecisionRecallExplorer() {
  const [presetKey, setPresetKey] = useState('Well-separated classes');
  const [tau, setTau] = useState(0.5);
  const svgRef = useRef(null);

  const cfg = PRESETS[presetKey];
  const prPts = computePRCurve(cfg);

  const recall = gaussSF(tau, cfg.muPos, cfg.sigPos);
  const tp = N_POS * recall;
  const fp = N_NEG * gaussSF(tau, cfg.muNeg, cfg.sigNeg);
  const prec = tp + fp > 0 ? tp / (tp + fp) : null;

  const updateTau = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setTau(Math.max(0.01, Math.min(0.99, x)));
  }, []);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateTau(e);
  };

  const xs = Array.from({ length: 301 }, (_, i) => i / 300);
  const maxD = Math.max(...xs.map(x => Math.max(gaussPDF(x, cfg.muPos, cfg.sigPos), gaussPDF(x, cfg.muNeg, cfg.sigNeg))));
  const scale = (DH - 8) / (maxD * 1.1);

  const toPath = (mu, sig) =>
    xs.map((x, i) => {
      const sx = x * DW, sy = DH - gaussPDF(x, mu, sig) * scale;
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)},${sy.toFixed(1)}`;
    }).join(' ');

  const negPath = toPath(cfg.muNeg, cfg.sigNeg);
  const posPath = toPath(cfg.muPos, cfg.sigPos);

  const prPath = prPts.map(({ recall: r, prec: p }, i) => {
    const x = (r * PW).toFixed(1), y = (PH - p * PH).toFixed(1);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  return (
    <div>
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.keys(PRESETS).map(k => (
          <button key={k} onClick={() => { setPresetKey(k); }} style={{
            background: presetKey === k ? 'var(--accent)' : 'var(--accent-bg)',
            color: presetKey === k ? 'white' : 'var(--accent)',
            border: '1px solid var(--border)', borderRadius: 6,
            padding: '0.28rem 0.65rem', cursor: 'pointer',
            fontSize: '0.78rem', fontFamily: 'inherit',
          }}>{k}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          {/* Distribution SVG */}
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score distributions — drag threshold
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${DW} ${DH}`}
            style={{ width: '100%', display: 'block', cursor: 'ew-resize', border: '1px solid var(--border)', borderRadius: 8, background: 'white' }}
            onPointerDown={onPointerDown}
            onPointerMove={e => e.buttons === 1 && updateTau(e)}
          >
            <path d={negPath + ` L ${DW},${DH} L 0,${DH} Z`} fill="rgba(231,76,60,0.18)" stroke="#E74C3C" strokeWidth="1.6" />
            <path d={posPath + ` L ${DW},${DH} L 0,${DH} Z`} fill="rgba(39,174,96,0.18)" stroke="#27AE60" strokeWidth="1.6" />
            <line x1={tau * DW} y1={0} x2={tau * DW} y2={DH} stroke="var(--accent)" strokeWidth="2" strokeDasharray="5,3" />
            <text x={Math.min(tau * DW + 4, DW - 40)} y={14} fontSize="10" fill="var(--accent)" fontFamily="monospace">τ={tau.toFixed(2)}</text>
          </svg>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.76rem', flexWrap: 'wrap' }}>
            <span><span style={{ color: '#27AE60', fontWeight: 700 }}>●</span> Positive class</span>
            <span><span style={{ color: '#E74C3C', fontWeight: 700 }}>●</span> Negative class</span>
          </div>

          {/* Current metrics */}
          <div style={{ marginTop: '0.9rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {[
              ['Precision', prec !== null ? prec.toFixed(3) : 'undef.'],
              ['Recall',    recall.toFixed(3)],
            ].map(([name, val]) => (
              <div key={name} style={{ background: 'var(--accent-bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{name}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PR plot */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PR Curve</div>
          <svg viewBox={`-28 -8 ${PW + 38} ${PH + 32}`} style={{ width: 230, display: 'block' }}>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <g key={v}>
                <line x1={0} y1={PH - v * PH} x2={PW} y2={PH - v * PH} stroke="#eee" strokeWidth="1" />
                <line x1={v * PW} y1={0} x2={v * PW} y2={PH} stroke="#eee" strokeWidth="1" />
                <text x={-4} y={PH - v * PH + 4} textAnchor="end" fontSize="9" fill="var(--muted)">{v.toFixed(2)}</text>
                <text x={v * PW} y={PH + 13} textAnchor="middle" fontSize="9" fill="var(--muted)">{v.toFixed(2)}</text>
              </g>
            ))}
            <rect x={0} y={0} width={PW} height={PH} fill="none" stroke="var(--border)" strokeWidth="1" />
            {/* Good corner annotation */}
            <text x={PW - 4} y={14} textAnchor="end" fontSize="9" fill="#27AE60" fontWeight="600">good ↑</text>
            {/* Bad corner annotation */}
            <text x={4} y={PH - 4} textAnchor="start" fontSize="9" fill="#E74C3C" fontWeight="600">bad ↓</text>
            {/* PR curve */}
            <path d={prPath} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
            {/* Current point */}
            {prec !== null && (
              <circle cx={recall * PW} cy={PH - prec * PH} r={5} fill="var(--accent)" stroke="white" strokeWidth="1.5" />
            )}
            {/* Axis labels */}
            <text x={PW / 2} y={PH + 26} textAnchor="middle" fontSize="10" fill="var(--muted)">Recall</text>
            <text x={-22} y={PH / 2} textAnchor="middle" fontSize="10" fill="var(--muted)" transform={`rotate(-90,-22,${PH / 2})`}>Precision</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
