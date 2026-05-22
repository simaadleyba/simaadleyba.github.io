import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import katex from 'katex';
import EvaluationMetricsTableOfContents from './components/EvaluationMetricsTableOfContents';
import './styles/global.css';

const ConfusionMatrixExplorer = lazy(() => import('./artifacts/ConfusionMatrixExplorer'));
const RocCurveBuilder          = lazy(() => import('./artifacts/RocCurveBuilder'));
const PrecisionRecallExplorer  = lazy(() => import('./artifacts/PrecisionRecallExplorer'));
const MacroMicroDemo           = lazy(() => import('./artifacts/MacroMicroDemo'));

// ── KaTeX helpers ─────────────────────────────────────────────────────────────

function K({ l }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current)
      katex.render(l, ref.current, { throwOnError: false, displayMode: false, trust: true });
  }, [l]);
  return <span ref={ref} />;
}

function KB({ l }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current)
      katex.render(l, ref.current, { throwOnError: false, displayMode: true, trust: true });
  }, [l]);
  return <div ref={ref} style={{ overflowX: 'auto', margin: '0.75rem 0' }} />;
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="ns-nav">
      <button className="ns-nav-burger" aria-label="Toggle menu" onClick={() => setMenuOpen(o => !o)}>
        ☰
      </button>
      <div className={`ns-nav-links${menuOpen ? ' mobile-open' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>about</a>
        <a href="/#research" onClick={() => setMenuOpen(false)}>research</a>
        <a href="/#experience" onClick={() => setMenuOpen(false)}>experience</a>
        <a href="/#education" onClick={() => setMenuOpen(false)}>education</a>
        <a href="/#beyond" onClick={() => setMenuOpen(false)}>beyond</a>
        <a href="/#" onClick={() => setMenuOpen(false)}>cv</a>
      </div>
    </nav>
  );
}

// ── Artifact wrapper ──────────────────────────────────────────────────────────

function ArtifactWrapper({ title, children }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = expanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [expanded]);

  const content = (
    <Suspense fallback={<div style={{ color: '#8b9bd4', fontSize: '0.9rem', padding: '1rem 0' }}>Loading…</div>}>
      {children}
    </Suspense>
  );

  const expandBtn = (
    <button
      onClick={() => setExpanded(e => !e)}
      title={expanded ? 'Close' : 'Expand'}
      style={{
        background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
        padding: '0.18rem 0.55rem', cursor: 'pointer', color: 'var(--muted)',
        fontSize: '0.72rem', fontFamily: 'inherit', lineHeight: 1.4,
      }}
    >
      {expanded ? '✕ Close' : '⤢ Expand'}
    </button>
  );

  return (
    <>
      <div className="artifact-card" style={{ display: expanded ? 'none' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h4 style={{ margin: 0 }}>{title}</h4>
          {expandBtn}
        </div>
        {content}
      </div>

      {expanded && (
        <>
          <div
            onClick={() => setExpanded(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(20,22,32,0.22)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <div style={{
            position: 'fixed',
            top: 'calc(3.2rem + 1.2rem)', left: '1.5rem', right: '1.5rem', bottom: '1.5rem',
            zIndex: 1001, background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(226,228,234,0.85)', borderRadius: '14px',
            boxShadow: '0 24px 80px rgba(91,110,174,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0,
            }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {title}
              </span>
              {expandBtn}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>{content}</div>
          </div>
        </>
      )}
    </>
  );
}

// ── Formula card helpers ──────────────────────────────────────────────────────

const FC_TITLE = {
  fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.4rem',
  fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
};

function Legend({ items }) {
  return (
    <div className="formula-legend">
      {items.map(({ color, label }, i) => (
        <div key={i} className="formula-legend-item">
          <div className="formula-legend-dot" style={{ background: color }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Static confusion matrix (section 2) ──────────────────────────────────────

function StaticConfusionMatrix() {
  const cells = [
    { label: 'TP', desc: 'True Positive',  sub: 'correct',      bg: '#ecfaf0', border: '#27AE60', fg: '#1a7a42' },
    { label: 'FN', desc: 'False Negative', sub: 'Type II error', bg: '#fef3f2', border: '#E74C3C', fg: '#a93226' },
    { label: 'FP', desc: 'False Positive', sub: 'Type I error',  bg: '#fef3f2', border: '#E67E22', fg: '#9a5000' },
    { label: 'TN', desc: 'True Negative',  sub: 'correct',       bg: '#eef5fb', border: '#2980B9', fg: '#1a5276' },
  ];
  return (
    <div style={{ margin: '1.2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '5px', maxWidth: 480 }}>
        <div />
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, padding: '0.2rem 0' }}>Predicted Positive</div>
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, padding: '0.2rem 0' }}>Predicted Negative</div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, writingMode: 'vertical-rl', transform: 'rotate(180deg)', padding: '0 0.2rem', lineHeight: 1.2, textAlign: 'center' }}>
          Actually Positive
        </div>
        <div style={{ background: cells[0].bg, border: `1.5px solid ${cells[0].border}`, borderRadius: 9, padding: '0.8rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: cells[0].fg }}>{cells[0].label}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: cells[0].fg }}>{cells[0].desc}</div>
          <div style={{ fontSize: '0.68rem', color: cells[0].fg, opacity: 0.75 }}>{cells[0].sub}</div>
        </div>
        <div style={{ background: cells[1].bg, border: `1.5px solid ${cells[1].border}`, borderRadius: 9, padding: '0.8rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: cells[1].fg }}>{cells[1].label}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: cells[1].fg }}>{cells[1].desc}</div>
          <div style={{ fontSize: '0.68rem', color: cells[1].fg, opacity: 0.75 }}>{cells[1].sub}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, writingMode: 'vertical-rl', transform: 'rotate(180deg)', padding: '0 0.2rem', lineHeight: 1.2, textAlign: 'center' }}>
          Actually Negative
        </div>
        <div style={{ background: cells[2].bg, border: `1.5px solid ${cells[2].border}`, borderRadius: 9, padding: '0.8rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: cells[2].fg }}>{cells[2].label}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: cells[2].fg }}>{cells[2].desc}</div>
          <div style={{ fontSize: '0.68rem', color: cells[2].fg, opacity: 0.75 }}>{cells[2].sub}</div>
        </div>
        <div style={{ background: cells[3].bg, border: `1.5px solid ${cells[3].border}`, borderRadius: 9, padding: '0.8rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: cells[3].fg }}>{cells[3].label}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: cells[3].fg }}>{cells[3].desc}</div>
          <div style={{ fontSize: '0.68rem', color: cells[3].fg, opacity: 0.75 }}>{cells[3].sub}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function EvaluationMetricsApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>
            <a href="/machinelearning/">Machine Learning</a>{' '}›{' '}
          </div>
          <div className="ns-title">Evaluation Metrics</div>
          <div className="ns-subtitle">
            How we measure whether a model is actually good — from confusion matrices to ROC curves.
          </div>
        </div>
      </header>

      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar">
            <EvaluationMetricsTableOfContents />
          </aside>

          <main className="ns-content">

            {/* ── Section 1: Binary Classification Setup ── */}
            <section id="setup" className="ns-section">
              <h2>1. Binary Classification Setup</h2>

              <p>
                Evaluation metrics require a setup: we have inputs <K l="\mathbf{x}" />, a true binary
                label <K l="y \in \{0, 1\}" />, and a model <K l="\hat{y} = h(\mathbf{x})" />.
              </p>

              <p>Two families of models produce predictions differently:</p>

              <table>
                <thead>
                  <tr><th>Model type</th><th>Example</th><th>Output type</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Hard-label models</strong></td>
                    <td>kNN, Decision Trees</td>
                    <td>Class directly. A soft score can be extracted (e.g. fraction of neighbors voting positive).</td>
                  </tr>
                  <tr>
                    <td><strong>Score-based models</strong></td>
                    <td>Logistic Regression, SVM</td>
                    <td>Real-valued score. A threshold <K l="\tau" /> converts this to a label: predict positive if score <K l="\geq \tau" />, negative otherwise.</td>
                  </tr>
                </tbody>
              </table>

              <p>
                The <strong>positive class</strong> must be explicitly designated. In imbalanced settings, the
                minority class is conventionally treated as the positive class.
              </p>
            </section>

            {/* ── Section 2: Confusion Matrix ── */}
            <section id="confusion-matrix" className="ns-section">
              <h2>2. Confusion Matrix</h2>

              <p>
                At a fixed threshold <K l="\tau" />, every prediction falls into one of four cells.
                Correct predictions lie on the diagonal (green); errors are off-diagonal (red/orange).
              </p>

              <StaticConfusionMatrix />

              <ul>
                <li><strong>False Positive (FP)</strong> — "False Alarm": predicted positive, actually negative. <em>Type I error.</em></li>
                <li><strong>False Negative (FN)</strong> — "Miss": predicted negative, actually positive. <em>Type II error.</em></li>
              </ul>

              <p style={{ marginTop: '0.8rem', background: 'var(--accent-bg)', borderLeft: '3px solid var(--accent)', padding: '0.6rem 0.9rem', borderRadius: '0 6px 6px 0', fontSize: '0.88rem' }}>
                All point metrics in the next section depend on the chosen threshold <K l="\tau" />. Changing <K l="\tau" /> changes all four counts simultaneously.
              </p>
            </section>

            {/* ── Section 3: Point Metrics ── */}
            <section id="point-metrics" className="ns-section">
              <h2>3. Point Metrics</h2>

              <p>All metrics below are computed at a fixed threshold.</p>

              {/* ACCURACY */}
              <div className="formula-card">
                <div style={FC_TITLE}>Accuracy</div>
                <KB l="\text{Acc} = \frac{\textcolor{#2980B9}{TP + TN}}{\textcolor{#E67E22}{TP + TN + FP + FN}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'TP + TN — correctly classified examples' },
                  { color: '#E67E22', label: 'TP + TN + FP + FN — total examples' },
                ]} />
                <p style={{ marginTop: '0.8rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Limitation:</strong> In imbalanced settings, accuracy is misleading. A classifier that predicts everything
                  as the majority class achieves high accuracy while ignoring the minority class entirely. Example:
                  9990 negatives + 10 positives → predicting all negative gives 99.9% accuracy, but recall on the
                  positive class is 0.
                </p>
              </div>

              {/* PRECISION */}
              <div className="formula-card">
                <div style={FC_TITLE}>Precision (Positive Predictive Value)</div>
                <KB l="\text{Pr} = \frac{\textcolor{#2980B9}{TP}}{\textcolor{#E67E22}{TP + FP}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'TP — true positives' },
                  { color: '#E67E22', label: 'TP + FP — all predicted positives' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Of everything the model called positive, how many actually were?
                </p>
              </div>

              {/* RECALL */}
              <div className="formula-card">
                <div style={FC_TITLE}>Recall (Sensitivity / True Positive Rate)</div>
                <KB l="\text{Rec} = \frac{\textcolor{#2980B9}{TP}}{\textcolor{#E67E22}{TP + FN}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'TP — true positives' },
                  { color: '#E67E22', label: 'TP + FN — all actual positives' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Of everything that was actually positive, how many did the model catch?
                </p>
              </div>

              {/* SPECIFICITY */}
              <div className="formula-card">
                <div style={FC_TITLE}>Specificity (True Negative Rate)</div>
                <KB l="\text{Spe} = \frac{\textcolor{#2980B9}{TN}}{\textcolor{#E67E22}{TN + FP}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'TN — true negatives' },
                  { color: '#E67E22', label: 'TN + FP — all actual negatives' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  The negative-class analogue of recall.
                </p>
              </div>

              {/* F1 */}
              <div className="formula-card">
                <div style={FC_TITLE}>F1 Score</div>
                <KB l="F_1 = \frac{2}{\textcolor{#2980B9}{\text{Recall}^{-1}} + \textcolor{#E67E22}{\text{Precision}^{-1}}} = \frac{2 \cdot \textcolor{#2980B9}{\text{Pr}} \cdot \textcolor{#E67E22}{\text{Rec}}}{\textcolor{#2980B9}{\text{Pr}} + \textcolor{#E67E22}{\text{Rec}}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'Precision' },
                  { color: '#E67E22', label: 'Recall' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Harmonic mean of precision and recall. Penalizes extreme imbalance between the two — a model
                  with perfect recall but zero precision gets <K l="F_1 = 0" />.
                </p>
              </div>

              {/* General F-score */}
              <div className="formula-card">
                <div style={FC_TITLE}>General F-Score</div>
                <KB l="F_\beta = \frac{(1 + \textcolor{#E67E22}{\beta^2}) \cdot \text{Pr} \cdot \text{Rec}}{(\textcolor{#E67E22}{\beta^2} \cdot \text{Pr}) + \text{Rec}}" />
                <Legend items={[
                  { color: '#E67E22', label: 'β — weighting parameter: β > 1 favors recall, β < 1 favors precision, β = 1 recovers F₁' },
                ]} />
              </div>

              {/* MCC */}
              <div className="formula-card">
                <div style={FC_TITLE}>Matthews Correlation Coefficient (MCC)</div>
                <KB l="MCC = \frac{\textcolor{#2980B9}{TP \cdot TN} - \textcolor{#E67E22}{FP \cdot FN}}{\sqrt{(TP+FP)(TP+FN)(TN+FP)(TN+FN)}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'TP·TN — agreement signal' },
                  { color: '#E67E22', label: 'FP·FN — disagreement signal' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  MCC is a special case of the Pearson correlation coefficient for binary classification.
                  Bounded in <K l="[-1, 1]" />: <K l="+1" /> = perfect, <K l="0" /> = random, <K l="-1" /> = perfectly
                  inverted. Especially reliable under class imbalance.
                </p>
              </div>

              <ArtifactWrapper title="INTERACTIVE: CONFUSION MATRIX EXPLORER">
                <ConfusionMatrixExplorer />
              </ArtifactWrapper>
            </section>

            {/* ── Section 4: Threshold & PR Tradeoff ── */}
            <section id="threshold-tradeoff" className="ns-section">
              <h2>4. Threshold &amp; the Precision-Recall Tradeoff</h2>

              <p>
                The threshold <K l="\tau" /> is a knob. Moving it changes all four confusion matrix counts simultaneously.
              </p>

              <ul>
                <li><strong>Raising <K l="\tau" /></strong> (more conservative): fewer predicted positives → precision tends to rise, recall tends to fall.</li>
                <li><strong>Lowering <K l="\tau" /></strong> (more liberal): more predicted positives → recall rises, precision tends to fall.</li>
              </ul>

              <p>
                There is no free lunch: to catch more true positives (higher recall), you must accept more false positives
                (lower precision). The right tradeoff is application-dependent:
              </p>

              <ul>
                <li><strong>Medical screening:</strong> prefer high recall — missing a disease is costly.</li>
                <li><strong>Spam filter:</strong> prefer high precision — falsely flagging legitimate email is costly.</li>
              </ul>

              <p style={{ marginTop: '1rem' }}>
                The table below illustrates how recall changes as a threshold is lowered on a hypothetical
                score-based classifier with 100 positive and 900 negative examples:
              </p>

              <table>
                <thead>
                  <tr><th>Threshold τ</th><th>Predicted Positives</th><th>TP</th><th>FP</th><th>Precision</th><th>Recall</th></tr>
                </thead>
                <tbody>
                  {[
                    ['0.95', '3',  '3',  '0',  '100%', '3%'],
                    ['0.75', '18', '15', '3',  '83%',  '15%'],
                    ['0.50', '62', '48', '14', '77%',  '48%'],
                    ['0.25', '140','82', '58', '59%',  '82%'],
                    ['0.05', '310','96', '214','31%',  '96%'],
                  ].map(row => (
                    <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ── Section 5: ROC Curve & AUC ── */}
            <section id="roc-curve" className="ns-section">
              <h2>5. ROC Curve &amp; AUC</h2>

              <p>
                As <K l="\tau" /> sweeps from 1 to 0, each threshold produces a (FPR, TPR) point.
                The <strong>ROC curve</strong> traces all such points.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>True Positive Rate (TPR)</div>
                <KB l="\text{TPR} = \frac{\textcolor{#2980B9}{TP}}{\textcolor{#E67E22}{TP + FN}} = \text{Recall}" />
                <Legend items={[
                  { color: '#2980B9', label: 'TP — true positives' },
                  { color: '#E67E22', label: 'TP + FN — all actual positives' },
                ]} />
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>False Positive Rate (FPR)</div>
                <KB l="\text{FPR} = \frac{\textcolor{#E67E22}{FP}}{\textcolor{#2980B9}{TN + FP}} = 1 - \text{Specificity}" />
                <Legend items={[
                  { color: '#E67E22', label: 'FP — false positives' },
                  { color: '#2980B9', label: 'TN + FP — all actual negatives' },
                ]} />
              </div>

              <p>Key reference points:</p>
              <ul>
                <li><strong>Random classifier:</strong> diagonal line from (0, 0) to (1, 1), AUC = 0.5.</li>
                <li><strong>Perfect classifier:</strong> point at (0, 1), AUC = 1.0.</li>
                <li><strong>AUC</strong> (Area Under the ROC Curve): scalar summary of performance across all thresholds. Higher is better. Partial AUC can be computed over a restricted FPR range.</li>
              </ul>

              <ArtifactWrapper title="INTERACTIVE: ROC CURVE BUILDER">
                <RocCurveBuilder />
              </ArtifactWrapper>
            </section>

            {/* ── Section 6: Precision-Recall Curve ── */}
            <section id="pr-curve" className="ns-section">
              <h2>6. Precision-Recall Curve &amp; Average Precision</h2>

              <p>
                The ROC curve can be optimistic under severe class imbalance because FPR uses TN in its denominator —
                and when negatives vastly outnumber positives, many false positives can still produce a low FPR.
                The <strong>PR curve</strong> avoids this by comparing TP with FN and FP only.
              </p>

              <p>
                The PR curve plots Precision (y-axis) vs. Recall (x-axis) as the threshold varies. The ideal
                corner is top-right (high precision <em>and</em> high recall). Unlike ROC, PR curves are not
                monotone — precision can go up or down as recall increases.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Average Precision</div>
                <KB l="\text{AveP} = \sum_{\textcolor{#2980B9}{k=1}}^{n} \textcolor{#E67E22}{P(k)} \, \Delta r(k)" />
                <Legend items={[
                  { color: '#2980B9', label: 'k — index over data points ranked by decision score (descending)' },
                  { color: '#E67E22', label: 'P(k) — precision at threshold k' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <K l="\Delta r(k)" /> is the change in recall between thresholds <K l="k" /> and <K l="k{-}1" />.
                  AveP is the area under the PR curve. Widely used; handles class imbalance well.
                </p>
              </div>

              <ArtifactWrapper title="INTERACTIVE: PRECISION-RECALL CURVE EXPLORER">
                <PrecisionRecallExplorer />
              </ArtifactWrapper>
            </section>

            {/* ── Section 7: Multi-Class Averaging ── */}
            <section id="multiclass" className="ns-section">
              <h2>7. Multi-Class Averaging</h2>

              <p>
                When there are <K l="C > 2" /> classes, binary metrics (precision, recall, F1) must be aggregated.
                Two main strategies:
              </p>

              <h3>Macro-averaging</h3>
              <p>Compute the metric independently for each class, then take the unweighted mean.</p>

              <div className="formula-card">
                <div style={FC_TITLE}>Macro-F1</div>
                <KB l="\text{Macro-F1} = \frac{1}{\textcolor{#E67E22}{C}} \sum_{\textcolor{#2980B9}{c=1}}^{C} F_1^{(c)}" />
                <Legend items={[
                  { color: '#2980B9', label: 'c — class index' },
                  { color: '#E67E22', label: 'C — total number of classes' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Treats all classes equally regardless of frequency. Sensitive to performance on rare classes.
                </p>
              </div>

              <h3>Micro-averaging</h3>
              <p>
                Pool all TP, FP, FN counts across classes, then compute the metric once on the pooled counts.
                Dominated by the most frequent class.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Macro vs Micro Precision</div>
                <KB l="\text{Macro-Pr} = \frac{1}{\textcolor{#E67E22}{C}} \sum_{c=1}^{C} \frac{TP_c}{TP_c + FP_c}" />
                <KB l="\text{Micro-Pr} = \frac{\textcolor{#2980B9}{\sum_c TP_c}}{\textcolor{#E67E22}{\sum_c (TP_c + FP_c)}}" />
                <Legend items={[
                  { color: '#2980B9', label: '∑TP_c — pooled true positives' },
                  { color: '#E67E22', label: '∑(TP_c + FP_c) — pooled predicted positives' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  sklearn also provides a <code style={{ fontFamily: 'monospace', background: 'var(--accent-bg)', padding: '0.05rem 0.3rem', borderRadius: 3 }}>'weighted'</code> average:
                  per-class metric weighted by support (number of true instances per class) — adjusts for imbalance
                  without fully ignoring rare classes.
                </p>
              </div>

              <ArtifactWrapper title="INTERACTIVE: MACRO VS MICRO DEMO">
                <MacroMicroDemo />
              </ArtifactWrapper>
            </section>

            {/* ── Section 8: Regression Metrics ── */}
            <section id="regression-metrics" className="ns-section">
              <h2>8. Regression Metrics</h2>

              <p>
                For continuous targets <K l="y_i \in \mathbb{R}" />, classification metrics do not apply.
                All metrics below compare true values <K l="y_i" /> with predictions <K l="\hat{y}_i" />.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Mean Absolute Error (MAE)</div>
                <KB l="\text{MAE} = \frac{1}{\textcolor{#E67E22}{n}} \sum_{\textcolor{#2980B9}{i=1}}^{n} |y_i - \hat{y}_i|" />
                <Legend items={[
                  { color: '#2980B9', label: '|yᵢ − ŷᵢ| — absolute residual' },
                  { color: '#E67E22', label: 'n — number of samples' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Robust to outliers. In the same units as <K l="y" />.
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>Mean Squared Error (MSE)</div>
                <KB l="\text{MSE} = \frac{1}{\textcolor{#E67E22}{n}} \sum_{\textcolor{#2980B9}{i=1}}^{n} (y_i - \hat{y}_i)^2" />
                <Legend items={[
                  { color: '#2980B9', label: '(yᵢ − ŷᵢ)² — squared residual' },
                  { color: '#E67E22', label: 'n — number of samples' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Penalizes large errors more heavily than MAE. Units are squared — harder to interpret directly.
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>Root Mean Squared Error (RMSE)</div>
                <KB l="\text{RMSE} = \sqrt{\frac{1}{\textcolor{#E67E22}{n}} \sum_{\textcolor{#2980B9}{i=1}}^{n} (y_i - \hat{y}_i)^2}" />
                <Legend items={[
                  { color: '#2980B9', label: '(yᵢ − ŷᵢ)² — squared residual' },
                  { color: '#E67E22', label: 'n — number of samples' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Restores units of <K l="y" />. Still sensitive to outliers.
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>R² (Coefficient of Determination)</div>
                <KB l="R^2 = 1 - \frac{\textcolor{#E67E22}{\sum_i (y_i - \hat{y}_i)^2}}{\textcolor{#2980B9}{\sum_i (y_i - \bar{y})^2}}" />
                <Legend items={[
                  { color: '#E67E22', label: '∑(yᵢ − ŷᵢ)² — residual sum of squares (SSR)' },
                  { color: '#2980B9', label: '∑(yᵢ − ȳ)² — total sum of squares (SST)' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Proportion of variance explained by the model. <K l="R^2 = 1" /> is perfect;{' '}
                  <K l="R^2 = 0" /> means the model does no better than predicting the mean;{' '}
                  <K l="R^2 < 0" /> is possible (model worse than the mean).
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>Mean Absolute Percentage Error (MAPE)</div>
                <KB l="\text{MAPE} = \frac{1}{\textcolor{#E67E22}{n}} \sum_{\textcolor{#2980B9}{i=1}}^{n} \left| \frac{y_i - \hat{y}_i}{y_i} \right|" />
                <Legend items={[
                  { color: '#2980B9', label: '|yᵢ − ŷᵢ| — absolute residual' },
                  { color: '#E67E22', label: 'yᵢ — true value (denominator)' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Scale-independent, expressed as a percentage. Undefined when <K l="y_i = 0" />.
                </p>
              </div>
            </section>

            {/* ── Section 9: Domain-Specific Metrics ── */}
            <section id="domain-metrics" className="ns-section">
              <h2>9. Domain-Specific Metrics</h2>

              <p>A brief reference for metrics designed for specific tasks.</p>

              <div className="formula-card">
                <div style={FC_TITLE}>BLEU Score (Machine Translation)</div>
                <KB l="\text{BLEU} = \textcolor{#2980B9}{\text{BP}} \cdot \exp\!\left( \sum_{n=1}^{N} \textcolor{#E67E22}{w_n} \log p_n \right)" />
                <KB l="\text{BP} = \begin{cases} 1 & \text{if } c > r \\ e^{1 - r/c} & \text{if } c \leq r \end{cases}" />
                <Legend items={[
                  { color: '#2980B9', label: 'BP — brevity penalty (discourages short candidate translations)' },
                  { color: '#E67E22', label: 'wₙ — weight per n-gram order (typically wₙ = 1/N)' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  <K l="p_n" /> is the modified n-gram precision; <K l="c" /> is the candidate length; <K l="r" /> is the reference length.
                  Measures overlap between a model-generated translation and a human reference. Not a true metric (not symmetric), but widely used.
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>Intersection over Union (IoU) — Object Detection</div>
                <KB l="\text{IoU} = \frac{\textcolor{#2980B9}{\text{Area of Intersection}}}{\textcolor{#E67E22}{\text{Area of Union}}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'Intersection — overlap between predicted bounding box and ground truth box' },
                  { color: '#E67E22', label: 'Union — total area covered by either box' },
                ]} />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  Ranges from 0 (no overlap) to 1 (perfect overlap). A threshold of 0.5 is a common convention
                  for "correct detection."
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>Concordance Index (C-Index) — Survival Prediction</div>
                <KB l="C = \frac{\text{number of concordant pairs}}{\text{number of comparable pairs}}" />
                <p style={{ marginTop: '0.7rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                  A comparable pair <K l="(i, j)" /> requires that subject <K l="i" /> experienced the event
                  before <K l="j" /> (and <K l="i" />'s observation is not censored). The pair is concordant if
                  the model assigns a higher risk score to <K l="i" />. Ranges from 0.5 (random) to 1.0 (perfect
                  ordering). Analogous to AUC for survival data.
                </p>
              </div>
            </section>

            {/* ── Section 10: Metrics in Practice ── */}
            <section id="metrics-practice" className="ns-section">
              <h2>10. A Note on Metrics in Practice</h2>

              <div style={{
                background: '#fffbf0',
                border: '1px solid #f5c38a',
                borderLeft: '4px solid #E67E22',
                borderRadius: '0 10px 10px 0',
                padding: '1.2rem 1.5rem',
                margin: '1rem 0 1.5rem',
              }}>
                <div style={{ fontWeight: 700, color: '#9a5000', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Metrics are necessary, but not sufficient.
                </div>
                <p style={{ color: 'var(--text)', fontSize: '0.92rem', marginBottom: '0.7rem' }}>
                  A model that achieves high AUC on a benchmark can still fail catastrophically in deployment if
                  the data distribution shifts, if class imbalance differs from training, or if the cost of FP and
                  FN is asymmetric in ways the metric doesn't capture.
                </p>
                <p style={{ color: 'var(--text)', fontSize: '0.92rem', marginBottom: '0.7rem' }}>
                  A spam filter optimized for F1 might pass every email containing a new phishing template it
                  hasn't seen. A clinical classifier with 0.95 AUC might still overwhelm doctors with false alarms
                  if deployed on a healthier population.
                </p>
                <p style={{ color: 'var(--text)', fontSize: '0.92rem', margin: 0 }}>
                  Metrics guide development — they do not guarantee real-world value. Always verify that model
                  behavior is meaningful in the context it's meant to serve.
                </p>
              </div>
            </section>

            {/* ── References ── */}
            <section id="references" className="ns-section">
              <h2>References</h2>
              <ol style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                <li>Powers, D. M. W. (2011). Evaluation: From Precision, Recall and F-Measure to ROC, Informedness, Markedness and Correlation. <em>JMLR</em>.</li>
                <li>Fawcett, T. (2006). An introduction to ROC analysis. <em>Pattern Recognition Letters</em>, 27(8), 861–874.</li>
                <li>Davis, J., &amp; Goadrich, M. (2006). The relationship between precision-recall and ROC curves. <em>ICML</em>.</li>
                <li>Chicco, D., &amp; Jurman, G. (2020). The advantages of the Matthews correlation coefficient (MCC) over F1 score and accuracy. <em>BMC Genomics</em>.</li>
                <li>Papineni, K., et al. (2002). BLEU: a method for automatic evaluation of machine translation. <em>ACL</em>.</li>
              </ol>
            </section>

          </main>
        </div>
      </div>

      <footer style={{ padding: '1.8rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: '#7B6FD6', fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.02em', margin: '0 0 0.3rem' }}>
            adleyba [at] sabanciuniv [dot] edu
          </p>
          <p style={{ color: '#a0a0a0', fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
            Machine Learning Study Guide · Built with React + KaTeX
          </p>
          <a href="/machinelearning/" style={{ color: 'var(--accent)', fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none', opacity: 0.8 }}>
            ← back to machine learning
          </a>
        </div>
      </footer>
    </div>
  );
}
