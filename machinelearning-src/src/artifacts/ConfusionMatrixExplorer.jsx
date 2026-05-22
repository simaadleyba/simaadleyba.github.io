import { useState } from 'react';

const PRESETS = {
  'Balanced':                     { tp: 45, tn: 45, fp: 5,  fn: 5  },
  'High Precision / Low Recall':  { tp: 10, tn: 85, fp: 2,  fn: 40 },
  'High Recall / Low Precision':  { tp: 48, tn: 20, fp: 30, fn: 2  },
  'Imbalanced (99% negative)':    { tp: 0,  tn: 99, fp: 0,  fn: 1  },
};

function computeMetrics(tp, tn, fp, fn) {
  const total = tp + tn + fp + fn;
  const acc   = total > 0            ? (tp + tn) / total           : null;
  const prec  = (tp + fp) > 0        ? tp / (tp + fp)              : null;
  const rec   = (tp + fn) > 0        ? tp / (tp + fn)              : null;
  const spec  = (tn + fp) > 0        ? tn / (tn + fp)              : null;
  const f1    = prec !== null && rec !== null && (prec + rec) > 0
                  ? 2 * prec * rec / (prec + rec) : null;
  const denom = Math.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn));
  const mcc   = denom > 0            ? (tp*tn - fp*fn) / denom     : null;
  return { acc, prec, rec, spec, f1, mcc };
}

function Pct({ v }) {
  if (v === null) return <span style={{ color: '#E67E22', fontStyle: 'italic', fontSize: '0.9rem' }}>undef.</span>;
  return <span>{(v * 100).toFixed(1)}%</span>;
}

function MCC({ v }) {
  if (v === null) return <span style={{ color: '#E67E22', fontStyle: 'italic', fontSize: '0.9rem' }}>undef.</span>;
  return <span>{v.toFixed(3)}</span>;
}

export default function ConfusionMatrixExplorer() {
  const [vals, setVals] = useState({ tp: 45, tn: 45, fp: 5, fn: 5 });

  const set = (k, v) => setVals(prev => ({ ...prev, [k]: Number(v) }));
  const { tp, tn, fp, fn } = vals;
  const m = computeMetrics(tp, tn, fp, fn);

  return (
    <div>
      {/* Preset buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
        {Object.entries(PRESETS).map(([name, preset]) => (
          <button
            key={name}
            onClick={() => setVals(preset)}
            style={{
              background: 'var(--accent-bg)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0.28rem 0.65rem', cursor: 'pointer',
              fontSize: '0.78rem', color: 'var(--accent)', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >{name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sliders */}
        <div>
          {[
            ['tp', 'TP — True Positives',  '#27AE60'],
            ['fn', 'FN — False Negatives', '#E74C3C'],
            ['fp', 'FP — False Positives', '#E67E22'],
            ['tn', 'TN — True Negatives',  '#2980B9'],
          ].map(([key, label, color]) => (
            <div key={key} style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', color, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace' }}>{vals[key]}</span>
              </div>
              <input type="range" min={0} max={100} value={vals[key]}
                onChange={e => set(key, e.target.value)}
                style={{ width: '100%', accentColor: color }} />
            </div>
          ))}
        </div>

        {/* Confusion matrix grid */}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center', marginBottom: '0.4rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confusion Matrix
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            {[
              { key: 'tp', label: 'TP', val: tp, bg: '#ecfaf0', border: '#27AE60', fg: '#1a7a42', sub: 'True Positive'  },
              { key: 'fn', label: 'FN', val: fn, bg: '#fef3f2', border: '#E74C3C', fg: '#a93226', sub: 'False Negative' },
              { key: 'fp', label: 'FP', val: fp, bg: '#fef3f2', border: '#E67E22', fg: '#9a5000', sub: 'False Positive' },
              { key: 'tn', label: 'TN', val: tn, bg: '#eef5fb', border: '#2980B9', fg: '#1a5276', sub: 'True Negative'  },
            ].map(({ label, val, bg, border, fg, sub }) => (
              <div key={label} style={{
                background: bg, border: `1.5px solid ${border}`, borderRadius: 9,
                padding: '0.7rem 0.5rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.68rem', color: fg, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: fg, lineHeight: 1.1 }}>{val}</div>
                <div style={{ fontSize: '0.62rem', color: fg, opacity: 0.75, marginTop: '0.1rem' }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '3px' }}>
            <div style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--muted)' }}>Pred. Positive</div>
            <div style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--muted)' }}>Pred. Negative</div>
          </div>
        </div>
      </div>

      {/* Live metrics */}
      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem' }}>
        {[
          ['Accuracy',    <Pct v={m.acc}  />],
          ['Precision',   <Pct v={m.prec} />],
          ['Recall',      <Pct v={m.rec}  />],
          ['Specificity', <Pct v={m.spec} />],
          ['F1 Score',    <Pct v={m.f1}   />],
          ['MCC',         <MCC v={m.mcc}  />],
        ].map(([name, val]) => (
          <div key={name} style={{
            background: 'var(--accent-bg)', borderRadius: 8,
            padding: '0.55rem 0.7rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{name}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.2rem' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
