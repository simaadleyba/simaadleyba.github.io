import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import katex from 'katex';
import DecisionTreesTableOfContents from './components/DecisionTreesTableOfContents';
import './styles/global.css';

const ImpurityExplorer = lazy(() => import('./artifacts/ImpurityExplorer'));
const OverfittingDemo  = lazy(() => import('./artifacts/OverfittingDemo'));

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
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '0.18rem 0.55rem',
        cursor: 'pointer',
        color: 'var(--muted)',
        fontSize: '0.72rem',
        fontFamily: 'inherit',
        lineHeight: 1.4,
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
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <div style={{
            position: 'fixed',
            top: 'calc(3.2rem + 1.2rem)',
            left: '1.5rem', right: '1.5rem', bottom: '1.5rem',
            zIndex: 1001,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(226,228,234,0.85)',
            borderRadius: '14px',
            boxShadow: '0 24px 80px rgba(91,110,174,0.18)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
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
  fontSize: '0.78rem',
  color: 'var(--muted)',
  marginBottom: '0.4rem',
  fontFamily: 'monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
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

// ── Loan Approval Tree SVG ───────────────────────────────────────────────────

function LoanTree() {
  const DW = 92, DH = 32;
  const LW = 72, LH = 28;

  const pos = {
    root:  { x: 362, y: 44,  d: true  },
    safe1: { x: 78,  y: 155, d: false, safe: true  },
    term1: { x: 258, y: 155, d: true  },
    inc:   { x: 548, y: 155, d: true  },
    risk1: { x: 188, y: 262, d: false, safe: false },
    safe2: { x: 328, y: 262, d: false, safe: true  },
    term2: { x: 478, y: 262, d: true  },
    risk2: { x: 635, y: 262, d: false, safe: false },
    risk3: { x: 418, y: 358, d: false, safe: false },
    safe3: { x: 548, y: 358, d: false, safe: true  },
  };

  const labels = { root: 'Credit?', term1: 'Term?', inc: 'Income?', term2: 'Term?' };

  const edges = [
    { f: 'root',  t: 'safe1', lbl: 'excellent' },
    { f: 'root',  t: 'term1', lbl: 'fair'      },
    { f: 'root',  t: 'inc',   lbl: 'poor'      },
    { f: 'term1', t: 'risk1', lbl: '3 years'   },
    { f: 'term1', t: 'safe2', lbl: '5 years'   },
    { f: 'inc',   t: 'term2', lbl: 'high'      },
    { f: 'inc',   t: 'risk2', lbl: 'low'       },
    { f: 'term2', t: 'risk3', lbl: '3 years'   },
    { f: 'term2', t: 'safe3', lbl: '5 years'   },
  ];

  const bot = (k) => pos[k].y + (pos[k].d ? DH / 2 : LH / 2);
  const top = (k) => pos[k].y - (pos[k].d ? DH / 2 : LH / 2);

  return (
    <svg viewBox="0 0 720 400" style={{ width: '100%', display: 'block', margin: '0.75rem 0' }}>
      <defs>
        <filter id="lt-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(({ f, t, lbl }) => {
        const x1 = pos[f].x, y1 = bot(f);
        const x2 = pos[t].x, y2 = top(t);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const goRight = x2 >= x1;
        return (
          <g key={`${f}-${t}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c5cae0" strokeWidth="1.6" />
            <text x={goRight ? mx + 7 : mx - 7} y={my + 4}
              textAnchor={goRight ? 'start' : 'end'}
              fontSize="10.5" fill="#7b8aaa" fontStyle="italic" fontFamily="inherit">
              {lbl}
            </text>
          </g>
        );
      })}

      {/* Decision nodes */}
      {Object.entries(pos).filter(([, v]) => v.d).map(([k, { x, y }]) => (
        <g key={k} filter="url(#lt-shadow)">
          <rect x={x - DW / 2} y={y - DH / 2} width={DW} height={DH} rx={7}
            fill="white" stroke="#5b6eae" strokeWidth="1.8" />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="12.5" fontWeight="500" fill="#242424" fontFamily="inherit">
            {labels[k]}
          </text>
        </g>
      ))}

      {/* Leaf nodes */}
      {Object.entries(pos).filter(([, v]) => !v.d).map(([k, { x, y, safe }]) => (
        <g key={k} filter="url(#lt-shadow)">
          <rect x={x - LW / 2} y={y - LH / 2} width={LW} height={LH} rx={14}
            fill={safe ? '#ecfaf0' : '#fef3f2'}
            stroke={safe ? '#27AE60' : '#E74C3C'}
            strokeWidth="1.6" />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="12.5" fontWeight="600"
            fill={safe ? '#1a7a42' : '#a93226'}
            fontFamily="inherit">
            {safe ? 'Safe' : 'Risky'}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function DecisionTreesApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>
            <a href="/machinelearning/">Machine Learning</a>
            {' '}›{' '}
          </div>
          <div className="ns-title">Decision Trees</div>
          <div className="ns-subtitle">
            Recursive partitioning, impurity measures, pruning, and regression trees.
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar">
            <DecisionTreesTableOfContents />
          </aside>

          <main className="ns-content">

            {/* ── Section 1: What is a Decision Tree? ── */}
            <section id="what-is" className="ns-section">
              <h2>1. What is a Decision Tree?</h2>

              <p>
                A decision tree is a model that makes predictions by recursively partitioning the input
                space using a sequence of simple binary tests. Each test checks a single feature, and the
                answer routes the example down the tree until it reaches a leaf, which gives the prediction.
              </p>

              <p>A decision tree has three types of nodes:</p>
              <ul>
                <li><strong>Internal node</strong> — performs a test on one feature (e.g.{' '}
                  <code>Credit = excellent?</code>)</li>
                <li><strong>Branch</strong> — the outgoing edge corresponding to one outcome of the test</li>
                <li><strong>Leaf node</strong> — stores the final prediction (a class label for classification,
                  a value for regression)</li>
              </ul>

              <p>
                Learned trees can be represented as sets of if-then rules. Each root-to-leaf path is one
                conjunction of conditions; the tree as a whole is a disjunction of those conjunctions.
                For example:
              </p>

              <pre style={{
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                background: 'var(--accent-bg)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                color: 'var(--text)',
                overflowX: 'auto',
                lineHeight: 1.65,
                margin: '0.75rem 0',
              }}>
{`IF   (Outlook = Sunny AND Humidity = High)
  OR (Outlook = Rain AND Wind = Strong)
THEN No`}
              </pre>

              <p>
                This makes decision trees highly interpretable — for a small tree, a human can read every
                rule directly.
              </p>

              <h3>Example: Loan Approval</h3>

              <p>
                A bank needs to decide whether to approve a loan. The relevant features are Credit history
                (excellent / fair / poor), Loan Term (3 years / 5 years), and Income (high / low).
                A learned tree might look like:
              </p>

              <LoanTree />

              <p>
                To predict for a new applicant with Credit=poor, Income=high, Term=5 years: start at root
                → go to <em>poor</em> branch → go to <em>high</em> branch → go to <em>5 years</em> branch
                → predict <strong>Safe</strong>.
              </p>
            </section>

            {/* ── Section 2: Decision Boundaries ── */}
            <section id="decision-boundaries" className="ns-section">
              <h2>2. Decision Boundaries</h2>

              <p>
                Decision trees with axis-aligned splits partition the feature space into axis-aligned
                rectangular regions. Each region corresponds to exactly one leaf, and all points in a
                region receive the same prediction.
              </p>
              <p>
                This is powerful for non-linear boundaries. A linear model draws one straight line across
                the space. A decision tree can approximate any boundary by subdividing the space finely —
                at the cost of more nodes.
              </p>
              <p>
                Key point: decision trees perform poorly when the true boundary is linear (a linear model
                beats them), but excel when the boundary is complex or irregular.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Axis-Aligned Split</div>
                <KB l="\text{Split on feature } \textcolor{#E67E22}{j} \text{ at threshold } \textcolor{#2980B9}{v}:" />
                <KB l="R_1(j, v) = \{\mathbf{x} \mid x_{\textcolor{#E67E22}{j}} < \textcolor{#2980B9}{v}\} \qquad R_2(j, v) = \{\mathbf{x} \mid x_{\textcolor{#E67E22}{j}} \geq \textcolor{#2980B9}{v}\}" />
                <Legend items={[
                  { color: '#E67E22', label: 'j — the feature index chosen for this split' },
                  { color: '#2980B9', label: 'v — the threshold value' },
                ]} />
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                  Each split adds one axis-aligned boundary line to the partition. The full tree defines a
                  set of non-overlapping rectangles that cover the input space.
                </p>
              </div>
            </section>

            {/* ── Section 3: The Learning Algorithm ── */}
            <section id="learning-algorithm" className="ns-section">
              <h2>3. The Learning Algorithm</h2>

              <p>
                Finding the optimal decision tree is NP-hard — the search space over all possible trees
                grows exponentially with the number of features and depth. In practice, a greedy top-down
                heuristic is used: at each node, pick the locally best split.
              </p>

              <pre style={{
                fontFamily: 'monospace',
                fontSize: '0.84rem',
                background: 'var(--accent-bg)',
                padding: '1rem 1.2rem',
                borderRadius: '8px',
                color: 'var(--text)',
                overflowX: 'auto',
                lineHeight: 1.75,
                margin: '0.75rem 0',
                border: '1px solid var(--border)',
              }}>
{`Algorithm: Decision Tree Induction (Main Loop)

1. A ← the "best" decision attribute for next node
2. Assign A as the decision attribute for node
3. For each value of A, create new descendant of node
4. Route training examples to leaf nodes
5. If training examples are perfectly classified → STOP
   else iterate over new leaf nodes`}
              </pre>

              <ul style={{ marginTop: '0.8rem' }}>
                <li>
                  At each node, all candidate features and all candidate split thresholds are evaluated;
                  the one with the highest information gain is chosen.
                </li>
                <li style={{ marginTop: '0.4rem' }}>
                  If examples reach a node but no attribute remains to split on, assign the{' '}
                  <strong>majority class</strong> of the examples at that node.
                </li>
                <li style={{ marginTop: '0.4rem' }}>
                  A feature that has already been tested along a path from root to the current node is not
                  considered again at that node.
                </li>
              </ul>

              <h3>Stopping Conditions</h3>
              <ul>
                <li>All instances at a node belong to the same class → make it a leaf</li>
                <li>No remaining attributes to split on → make it a leaf with majority class label</li>
                <li>
                  Early stopping: maximum depth reached, or node contains fewer than{' '}
                  <code>min_samples</code> examples
                </li>
              </ul>
            </section>

            {/* ── Section 4: Impurity Measures ── */}
            <section id="impurity-measures" className="ns-section">
              <h2>4. Impurity Measures</h2>

              <p>
                To choose the best split, we need a measure of how "impure" (mixed) the class distribution
                is at a node. A pure node (all one class) has impurity 0. The most mixed node (uniform
                distribution over all classes) has maximum impurity.
              </p>
              <p>Let <K l="p_c" /> be the proportion of class <K l="c" /> at a node.</p>

              <h3>Entropy</h3>
              <p>
                Entropy is the expected information content when observing the class label at a node. It
                derives from the self-information of each outcome{' '}
                <K l="I(x) = -\log_2 p(x)" />.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Entropy</div>
                <KB l="H = -\sum_{\textcolor{#E67E22}{c}} \textcolor{#2980B9}{p_c} \log_2 \textcolor{#2980B9}{p_c}" />
                <Legend items={[
                  { color: '#2980B9', label: 'pₐ — proportion of class c at the node' },
                  { color: '#E67E22', label: 'c — index over all classes' },
                ]} />
                <ul style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                  <li>Maximum value: <K l="\log_2 C" /> (uniform distribution over <K l="C" /> classes)</li>
                  <li>Minimum value: <K l="0" /> (all examples belong to one class)</li>
                  <li>Convention: <K l="0 \log_2 0 = 0" /></li>
                </ul>
              </div>

              <p>Examples for a binary node:</p>
              <ul>
                <li>
                  <K l="(p_+ = 1/2,\; p_- = 1/2)" />: <K l="H = 1" /> bit — maximum uncertainty
                </li>
                <li>
                  <K l="(p_+ = 3/4,\; p_- = 1/4)" />: <K l="H \approx 0.811" /> bits
                </li>
                <li>
                  <K l="(p_+ = 1,\; p_- = 0)" />: <K l="H = 0" /> bits — perfectly pure
                </li>
              </ul>

              <h3>Information Gain</h3>
              <p>
                Information gain measures how much a split on attribute <K l="A" /> reduces the entropy of
                the class label. It is the criterion used in the <strong>ID3</strong> and{' '}
                <strong>C4.5</strong> algorithms.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Information Gain</div>
                <KB l="IG(S, \textcolor{#E67E22}{A}) = H(\textcolor{#2980B9}{S}) - \sum_{\textcolor{#E67E22}{v \in \text{values}(A)}} \frac{|S_v|}{|S|} H(\textcolor{#2980B9}{S_v})" />
                <Legend items={[
                  { color: '#2980B9', label: 'S — current set of training examples at this node' },
                  { color: '#E67E22', label: 'A — the candidate attribute being evaluated' },
                ]} />
                <ul style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                  <li><K l="S_v" /> — subset of <K l="S" /> where attribute <K l="A" /> takes value <K l="v" /></li>
                  <li>The weighted average entropy of children is subtracted from parent entropy</li>
                  <li>Pick the attribute with the <strong>highest</strong> information gain</li>
                </ul>
              </div>

              <h3>Worked Example</h3>
              <p>Binary features <K l="X_1, X_2, X_3" />, binary labels:</p>

              <table>
                <thead>
                  <tr>
                    <th><K l="X_1" /></th>
                    <th><K l="X_2" /></th>
                    <th><K l="X_3" /></th>
                    <th><K l="Y" /></th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>1</td><td>1</td><td>+</td></tr>
                  <tr><td>1</td><td>1</td><td>0</td><td>+</td></tr>
                  <tr><td>0</td><td>0</td><td>1</td><td>−</td></tr>
                  <tr><td>1</td><td>0</td><td>0</td><td>−</td></tr>
                </tbody>
              </table>

              <p>
                Parent entropy: <K l="H = -(2/4)\log_2(2/4) - (2/4)\log_2(2/4) = 1" />
              </p>
              <ul>
                <li>
                  Split on <K l="X_1" />: children are <K l="\{+, +, -\}" /> and <K l="\{-\}" />.{' '}
                  <K l="H_1 = 0.918" />, <K l="H_2 = 0" />. <K l="IG = 1 - (3/4)(0.918) - (1/4)(0) = 0.311" />
                </li>
                <li>
                  Split on <K l="X_2" />: children are <K l="\{+, +\}" /> and <K l="\{-, -\}" />. Both
                  have <K l="H = 0" />. <K l="IG = 1 - 0 - 0 = 1.0" />{' '}
                  <strong>← best</strong>
                </li>
                <li>
                  Split on <K l="X_3" />: children are <K l="\{+, -\}" /> and <K l="\{+, -\}" />. Both
                  have <K l="H = 1" />. <K l="IG = 0" />{' '}
                  <strong>← worst</strong>
                </li>
              </ul>

              <h3>Gini Index</h3>
              <p>
                Used by the <strong>CART</strong> algorithm (scikit-learn's default). Measures the
                probability that a randomly chosen example would be misclassified if labeled according to
                the class distribution at the node.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Gini Index</div>
                <KB l="Gini(i) = 1 - \sum_{\textcolor{#E67E22}{c \in \mathcal{Y}}} \textcolor{#2980B9}{p_c}^2" />
                <Legend items={[
                  { color: '#2980B9', label: 'pₐ — relative frequency of class c at node i' },
                  { color: '#E67E22', label: '𝒴 — set of all classes' },
                ]} />
                <ul style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                  <li>Maximum: <K l="1 - 1/C" /> when distribution is uniform over <K l="C" /> classes</li>
                  <li>Minimum: <K l="0" /> when node is pure</li>
                  <li>No logarithm — faster to compute than entropy</li>
                </ul>
              </div>

              <p>For a split into children <K l="N_1" /> and <K l="N_2" /> from parent with <K l="n" /> examples:</p>

              <div className="formula-card">
                <div style={FC_TITLE}>Gini Split Criterion</div>
                <KB l="Gini_{split} = \frac{|N_1|}{n} \cdot Gini(N_1) + \frac{|N_2|}{n} \cdot Gini(N_2)" />
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.4rem 0 0' }}>
                  Pick the split that <strong>minimizes</strong> <K l="Gini_{split}" />.
                </p>
              </div>

              <h3>Misclassification Error</h3>
              <p>
                The fraction of examples at the node that do not belong to the majority class.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>Misclassification Error</div>
                <KB l="Error(i) = 1 - \max_{\textcolor{#E67E22}{c \in \mathcal{Y}}} \textcolor{#2980B9}{p_c}" />
                <Legend items={[
                  { color: '#2980B9', label: 'pₐ — proportion of class c at node i' },
                  { color: '#E67E22', label: '𝒴 — set of all classes' },
                ]} />
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>
                  Less sensitive to changes in class distribution than entropy or Gini. Mostly used as the
                  criterion for <strong>pruning</strong>, not for growing.
                </p>
              </div>

              <h3>Comparison</h3>

              <p>
                For a two-class problem, all three measures are consistent — they agree on which node is
                purer. Entropy is most sensitive to changes in class probabilities; Gini is slightly less so;
                Misclassification error is the least sensitive. In practice, Gini and Entropy produce similar
                trees.
              </p>

              <table>
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>Formula</th>
                    <th>Range</th>
                    <th>Used for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Entropy</td>
                    <td><K l="-\sum p_c \log_2 p_c" /></td>
                    <td><K l="[0,\, \log_2 C]" /></td>
                    <td>Splitting (ID3, C4.5)</td>
                  </tr>
                  <tr>
                    <td>Gini</td>
                    <td><K l="1 - \sum p_c^2" /></td>
                    <td><K l="[0,\, 1-1/C]" /></td>
                    <td>Splitting (CART)</td>
                  </tr>
                  <tr>
                    <td>Error</td>
                    <td><K l="1 - \max p_c" /></td>
                    <td><K l="[0,\, 1-1/C]" /></td>
                    <td>Pruning</td>
                  </tr>
                </tbody>
              </table>

              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '0.8rem' }}>
                <strong>Note:</strong> All impurity measures favor attributes with a large number of distinct
                values. The <strong>gain ratio</strong> (C4.5) normalizes information gain by the entropy
                of the attribute's value distribution to correct for this bias.
              </p>

              <ArtifactWrapper title="Interactive: Impurity Measure Explorer">
                <ImpurityExplorer />
              </ArtifactWrapper>
            </section>

            {/* ── Section 5: Split Structure ── */}
            <section id="split-structure" className="ns-section">
              <h2>5. Split Structure</h2>

              <p>
                The structure of the split at each node depends on the type of the feature being tested.
              </p>

              <h3>Nominal Attributes</h3>
              <ul>
                <li>
                  <strong>Multi-way split</strong>: one branch per distinct value (e.g. Credit →
                  excellent / fair / poor)
                </li>
                <li>
                  <strong>Binary split</strong>: group values into two subsets, find the grouping with
                  best impurity reduction
                </li>
              </ul>

              <h3>Ordinal Attributes</h3>
              <p>
                Same as nominal, but the natural ordering must be respected in binary splits (e.g.
                Size → {'{Small, Medium}'} vs {'{Large}'} is valid; {'{Small, Large}'} vs{' '}
                {'{Medium}'} violates ordering).
              </p>

              <h3>Continuous Attributes</h3>
              <p>
                For a continuous feature, the split is a threshold:{' '}
                <K l="A < v" /> vs. <K l="A \geq v" />. To find the best threshold:
              </p>
              <ol>
                <li>Sort all training values of the feature</li>
                <li>Candidate thresholds are the midpoints between consecutive values where the class label changes</li>
                <li>Evaluate information gain (or Gini reduction) at each candidate threshold</li>
                <li>Pick the threshold with the highest gain</li>
              </ol>
              <p>
                This reduces an infinite search to at most <K l="n-1" /> candidate thresholds for{' '}
                <K l="n" /> training examples.
              </p>
            </section>

            {/* ── Section 6: Overfitting and Pruning ── */}
            <section id="overfitting-pruning" className="ns-section">
              <h2>6. Overfitting and Pruning</h2>

              <p>
                A sufficiently deep decision tree will achieve zero training error — it can create one leaf
                per training example. This is overfitting: the tree memorizes noise and fails to generalize.
              </p>

              <p>The bias-variance tradeoff for trees:</p>
              <ul>
                <li>
                  <strong>Shallow tree</strong> (small depth): high bias, low variance — underfits, misses
                  real patterns
                </li>
                <li>
                  <strong>Deep tree</strong> (large depth): low bias, high variance — overfits, models noise
                </li>
              </ul>

              <p>Two strategies to control complexity:</p>

              <h3>Early Stopping (Pre-pruning)</h3>
              <p>Stop growing the tree before it becomes too complex. Common criteria:</p>
              <ul>
                <li>
                  <strong><code>max_depth</code></strong>: stop when the tree reaches a maximum depth
                </li>
                <li>
                  <strong><code>min_samples_split</code></strong>: stop splitting a node if it contains
                  fewer than this many examples — nodes with very few examples are unreliable and prone to
                  overfitting
                </li>
              </ul>
              <p>
                Both hyperparameters are tuned using a validation set: train trees with different values,
                measure generalization error, pick the values that minimize it.
              </p>

              <h3>Post-pruning</h3>
              <p>
                Grow the full tree first, then trim it bottom-up. For each internal node, ask: does
                replacing this subtree with a leaf (predicting the majority class of all examples in the
                subtree) improve or maintain performance on a validation set? If yes, prune.
              </p>
              <p>
                Post-pruning tends to produce better results than early stopping because the full tree is
                grown first and the pruning decision has global context.
              </p>

              <ArtifactWrapper title="Interactive: Overfitting Demo">
                <OverfittingDemo />
              </ArtifactWrapper>
            </section>

            {/* ── Section 7: Regression Trees ── */}
            <section id="regression" className="ns-section">
              <h2>7. Decision Trees for Regression</h2>

              <p>
                For regression problems, the structure is identical but the prediction and split criterion
                change:
              </p>
              <ul>
                <li>
                  <strong>Leaf prediction</strong>: the mean of the target values <K l="y^{(i)}" /> of
                  all training examples in that leaf
                </li>
                <li>
                  <strong>Split criterion</strong>: minimize the residual sum of squares (RSS) rather
                  than entropy or Gini
                </li>
              </ul>

              <div className="formula-card">
                <div style={FC_TITLE}>Regression Tree Split Criterion</div>
                <KB l="\min_{\textcolor{#E67E22}{j},\, \textcolor{#2980B9}{v}} \left[ \sum_{i:\, x^{(i)} \in R_1(j,v)} \left(y^{(i)} - \hat{y}_{R_1}\right)^2 + \sum_{i:\, x^{(i)} \in R_2(j,v)} \left(y^{(i)} - \hat{y}_{R_2}\right)^2 \right]" />
                <Legend items={[
                  { color: '#E67E22', label: 'j, v — feature index and threshold defining the split' },
                  { color: '#2980B9', label: 'ŷ_{Rₖ} — mean of y values in region Rₖ' },
                ]} />
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                  The optimal <K l="\hat{y}_{R_k}" /> for a given partition is always the mean of the
                  targets in that region.
                </p>
              </div>

              <p>
                The resulting prediction function is a step function — piecewise constant over the
                rectangular regions defined by the tree. Adding more nodes makes the steps finer and the
                function closer to the true signal, but at the risk of overfitting.
              </p>
            </section>

            {/* ── Section 8: Advantages & Disadvantages ── */}
            <section id="advantages-disadvantages" className="ns-section">
              <h2>8. Advantages &amp; Disadvantages</h2>

              <h3>Advantages</h3>
              <ul>
                <li>
                  No training phase cost beyond fitting: prediction at test time is{' '}
                  <K l="O(\text{depth})" /> — just follow branches
                </li>
                <li>Highly interpretable for small trees; each path is a human-readable rule</li>
                <li>
                  Handles mixed feature types (continuous, categorical, binary) without preprocessing
                </li>
                <li>No need to scale or normalize features</li>
                <li>
                  Multiple trees can be combined via ensemble methods (Random Forests, Gradient Boosting)
                </li>
                <li>
                  Implicitly performs feature selection: uninformative features are never split on
                </li>
              </ul>

              <h3>Disadvantages</h3>
              <ul>
                <li>
                  Prone to overfitting, especially on noisy data — requires pruning or depth constraints
                </li>
                <li>High variance: a small change in training data can produce a very different tree</li>
                <li>Greedy induction gives no global optimality guarantee</li>
                <li>
                  Axis-aligned splits struggle with oblique decision boundaries (a diagonal line requires
                  many splits to approximate)
                </li>
                <li>Single trees are typically outperformed by ensemble methods</li>
              </ul>
            </section>

            {/* ── References ── */}
            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
            </section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '1.8rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: '#7B6FD6', fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.02em', margin: '0 0 0.3rem' }}>
            adleyba [at] sabanciuniv [dot] edu
          </p>
          <p style={{ color: '#a0a0a0', fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
            Machine Learning Study Guide · Built with React + KaTeX
          </p>
          <a href="/machinelearning/" style={{ color: 'var(--accent)', fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none', opacity: 0.8 }}>
            machine learning
          </a>
          <span style={{ color: '#a0a0a0', fontSize: '0.78rem', margin: '0 0.4rem' }}>·</span>
          <a href="/" style={{ color: 'var(--accent)', fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none', opacity: 0.8 }}>
            back to portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
