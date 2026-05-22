import { useState } from 'react';

const PRESET = {
  c1: { tp: 10, tn: 970, fp: 10, fn: 10 },
  c2: { tp: 90, tn: 890, fp: 10, fn: 10 },
};

function safeDiv(a, b) { return b > 0 ? a / b : null; }
function fmtN(v) { return v === null ? '—' : (v * 100).toFixed(1) + '%'; }

function classMetrics(c) {
  const { tp, tn, fp, fn } = c;
  const prec = safeDiv(tp, tp + fp);
  const rec  = safeDiv(tp, tp + fn);
  const f1   = prec !== null && rec !== null && (prec + rec) > 0
               ? 2 * prec * rec / (prec + rec) : null;
  return { prec, rec, f1 };
}

function ClassMatrix({ label, vals, onChange }) {
  const { tp, tn, fp, fn } = vals;

  const field = (key, fg) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: fg, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{key.toUpperCase()}</div>
      <input
        type="number" min={0} max={9999} value={vals[key]}
        onChange={e => onChange({ ...vals, [key]: Math.max(0, Number(e.target.value)) })}
        style={{
          width: '100%', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem',
          fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6,
          padding: '0.3rem', background: 'white', color: fg,
        }}
      />
    </div>
  );

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        <div style={{ background: '#ecfaf0', border: '1.5px solid #27AE60', borderRadius: 8, padding: '0.5rem' }}>{field('tp', '#1a7a42')}</div>
        <div style={{ background: '#fef3f2', border: '1.5px solid #E74C3C', borderRadius: 8, padding: '0.5rem' }}>{field('fn', '#a93226')}</div>
        <div style={{ background: '#fef3f2', border: '1.5px solid #E67E22', borderRadius: 8, padding: '0.5rem' }}>{field('fp', '#9a5000')}</div>
        <div style={{ background: '#eef5fb', border: '1.5px solid #2980B9', borderRadius: 8, padding: '0.5rem' }}>{field('tn', '#1a5276')}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '3px' }}>
        <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--muted)' }}>Pred. Pos</div>
        <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--muted)' }}>Pred. Neg</div>
      </div>

      {/* Per-class metrics */}
      {(() => {
        const { prec, rec, f1 } = classMetrics(vals);
        return (
          <div style={{ marginTop: '0.7rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[['Prec', prec], ['Rec', rec], ['F1', f1]].map(([name, v]) => (
              <div key={name} style={{ background: 'var(--accent-bg)', borderRadius: 6, padding: '0.35rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{name}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>{fmtN(v)}</div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

export default function MacroMicroDemo() {
  const [c1, setC1] = useState(PRESET.c1);
  const [c2, setC2] = useState(PRESET.c2);

  const m1 = classMetrics(c1);
  const m2 = classMetrics(c2);

  const avg = (a, b) => (a !== null && b !== null) ? (a + b) / 2 : null;
  const macroPr  = avg(m1.prec, m2.prec);
  const macroRec = avg(m1.rec,  m2.rec);
  const macroF1  = avg(m1.f1,   m2.f1);

  const sumTP = c1.tp + c2.tp, sumFP = c1.fp + c2.fp;
  const sumFN = c1.fn + c2.fn;
  const microPr  = safeDiv(sumTP, sumTP + sumFP);
  const microRec = safeDiv(sumTP, sumTP + sumFN);
  const microF1  = microPr !== null && microRec !== null && (microPr + microRec) > 0
                   ? 2 * microPr * microRec / (microPr + microRec) : null;

  const load = () => { setC1(PRESET.c1); setC2(PRESET.c2); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Edit confusion matrix counts directly.</div>
        <button onClick={load} style={{
          background: 'var(--accent-bg)', border: '1px solid var(--border)', borderRadius: 6,
          padding: '0.28rem 0.65rem', cursor: 'pointer',
          fontSize: '0.78rem', color: 'var(--accent)', fontFamily: 'inherit',
        }}>Load: Imbalanced — Class 1 dominant</button>
      </div>

      {/* Two matrices side by side */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <ClassMatrix label="Class 1" vals={c1} onChange={setC1} />
        <ClassMatrix label="Class 2" vals={c2} onChange={setC2} />
      </div>

      {/* Macro vs Micro summary */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.7rem' }}>Averaged Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '0.4rem', alignItems: 'center', fontSize: '0.82rem' }}>
          <div />
          {['Precision', 'Recall', 'F1'].map(h => (
            <div key={h} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</div>
          ))}
          {/* Macro row */}
          <div style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.78rem' }}>MACRO</div>
          {[macroPr, macroRec, macroF1].map((v, i) => (
            <div key={i} style={{ background: '#eef1f8', borderRadius: 6, padding: '0.4rem', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{fmtN(v)}</div>
          ))}
          {/* Micro row */}
          <div style={{ fontWeight: 700, color: '#E67E22', fontFamily: 'monospace', fontSize: '0.78rem' }}>MICRO</div>
          {[microPr, microRec, microF1].map((v, i) => (
            <div key={i} style={{ background: '#fff5ec', border: '1px solid #f5c38a', borderRadius: 6, padding: '0.4rem', textAlign: 'center', fontWeight: 700, color: '#9a5000' }}>{fmtN(v)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
