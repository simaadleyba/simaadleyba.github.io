import { useState, useRef, useCallback } from 'react';

const PRESETS = {
  'Well-separated classes':    { muPos: 0.72, muNeg: 0.28, sigPos: 0.10, sigNeg: 0.10 },
  'Heavily overlapping classes': { muPos: 0.58, muNeg: 0.42, sigPos: 0.18, sigNeg: 0.18 },
};

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

function computeROC(cfg) {
  const pts = [];
  for (let i = 0; i <= 300; i++) {
    const tau = i / 300;
    pts.push({ tau, tpr: gaussSF(tau, cfg.muPos, cfg.sigPos), fpr: gaussSF(tau, cfg.muNeg, cfg.sigNeg) });
  }
  return pts;
}

function computeAUC(cfg) {
  // Integrate TPR w.r.t. FPR as tau sweeps 1→0 (FPR: 0→1)
  let auc = 0;
  let pFpr = gaussSF(1.0, cfg.muNeg, cfg.sigNeg);
  let pTpr = gaussSF(1.0, cfg.muPos, cfg.sigPos);
  for (let i = 1; i <= 1000; i++) {
    const tau = 1 - i / 1000;
    const tpr = gaussSF(tau, cfg.muPos, cfg.sigPos);
    const fpr = gaussSF(tau, cfg.muNeg, cfg.sigNeg);
    auc += (fpr - pFpr) * (tpr + pTpr) / 2;
    pFpr = fpr; pTpr = tpr;
  }
  return Math.max(0, Math.min(1, auc));
}

const DW = 400, DH = 110;
const RW = 220, RH = 220;

export default function RocCurveBuilder() {
  const [presetKey, setPresetKey] = useState('Well-separated classes');
  const [tau, setTau] = useState(0.5);
  const svgRef = useRef(null);

  const cfg = PRESETS[presetKey];
  const rocPts = computeROC(cfg);
  const auc = computeAUC(cfg);

  const tpr = gaussSF(tau, cfg.muPos, cfg.sigPos);
  const fpr = gaussSF(tau, cfg.muNeg, cfg.sigNeg);

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
      const sx = x * DW;
      const sy = DH - gaussPDF(x, mu, sig) * scale;
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)},${sy.toFixed(1)}`;
    }).join(' ');

  const negPath = toPath(cfg.muNeg, cfg.sigNeg);
  const posPath = toPath(cfg.muPos, cfg.sigPos);

  const rocSorted = [...rocPts].sort((a, b) => b.tau - a.tau);
  const rocPath = rocSorted.map(({ fpr: f, tpr: t }, i) => {
    const x = (f * RW).toFixed(1), y = (RH - t * RH).toFixed(1);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  return (
    <div>
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.keys(PRESETS).map(k => (
          <button key={k} onClick={() => setPresetKey(k)} style={{
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
          <div style={{ marginTop: '0.9rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[['TPR', tpr.toFixed(3)], ['FPR', fpr.toFixed(3)], ['AUC', auc.toFixed(3)]].map(([name, val]) => (
              <div key={name} style={{ background: 'var(--accent-bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{name}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROC plot */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROC Curve</div>
          <svg viewBox={`-28 -8 ${RW + 38} ${RH + 32}`} style={{ width: 230, display: 'block' }}>
            {/* Axes grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <g key={v}>
                <line x1={0} y1={RH - v * RH} x2={RW} y2={RH - v * RH} stroke="#eee" strokeWidth="1" />
                <line x1={v * RW} y1={0} x2={v * RW} y2={RH} stroke="#eee" strokeWidth="1" />
                <text x={-4} y={RH - v * RH + 4} textAnchor="end" fontSize="9" fill="var(--muted)">{v.toFixed(2)}</text>
                <text x={v * RW} y={RH + 13} textAnchor="middle" fontSize="9" fill="var(--muted)">{v.toFixed(2)}</text>
              </g>
            ))}
            {/* Axes borders */}
            <rect x={0} y={0} width={RW} height={RH} fill="none" stroke="var(--border)" strokeWidth="1" />
            {/* Random classifier diagonal */}
            <line x1={0} y1={RH} x2={RW} y2={0} stroke="#ddd" strokeWidth="1.2" strokeDasharray="5,4" />
            {/* ROC curve */}
            <path d={rocPath} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
            {/* Current point */}
            <circle cx={fpr * RW} cy={RH - tpr * RH} r={5} fill="var(--accent)" stroke="white" strokeWidth="1.5" />
            {/* Axis labels */}
            <text x={RW / 2} y={RH + 26} textAnchor="middle" fontSize="10" fill="var(--muted)">FPR</text>
            <text x={-22} y={RH / 2} textAnchor="middle" fontSize="10" fill="var(--muted)" transform={`rotate(-90,-22,${RH / 2})`}>TPR</text>
            {/* AUC label */}
            <text x={RW - 4} y={16} textAnchor="end" fontSize="9.5" fill="var(--accent)" fontWeight="600">AUC={auc.toFixed(3)}</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
