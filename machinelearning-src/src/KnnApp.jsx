import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import katex from 'katex';
import KnnTableOfContents from './components/KnnTableOfContents';
import './styles/global.css';

const VoronoiBuilder      = lazy(() => import('./artifacts/VoronoiBuilder'));
const DecisionBoundary    = lazy(() => import('./artifacts/DecisionBoundary'));
const LpNormBall          = lazy(() => import('./artifacts/LpNormBall'));
const DistanceConcentration = lazy(() => import('./artifacts/DistanceConcentration'));

// ── KaTeX helpers ────────────────────────────────────────────────────────────

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

// ── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="ns-nav">
      <a className="nav-mark" href="/"><span className="dot"></span></a>
      <button
        className="ns-nav-burger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(o => !o)}
      >
        ☰
      </button>
      <div className={`ns-nav-links${menuOpen ? ' mobile-open' : ''}`}>
        <a href="/#about" onClick={() => setMenuOpen(false)}>about</a>
        <a href="/#research" onClick={() => setMenuOpen(false)}>research</a>
        <a href="/#experience" onClick={() => setMenuOpen(false)}>experience</a>
        <a href="/#education" onClick={() => setMenuOpen(false)}>education</a>
        <a href="/#studyguides" onClick={() => setMenuOpen(false)}>study guides</a>
        <a href="/#beyond" onClick={() => setMenuOpen(false)}>beyond</a>
        <a href="/" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>cv</a>
        <span className="nav-pipe">|</span>
        <a href="https://kimchikorelileriniskembesidir.com" className="field-notes" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>personal blog</a>
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

// ── Formula card helper ───────────────────────────────────────────────────────

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

// ── Main App ──────────────────────────────────────────────────────────────────

export default function KnnApp() {
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
          <div className="ns-title">k-Nearest Neighbors</div>
          <div className="ns-subtitle">
            Instance-based learning, distance metrics, voting, and the curse of dimensionality.
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar">
            <KnnTableOfContents />
          </aside>

          <main className="ns-content">

            {/* ── Section 1: 1-NN ── */}
            <section id="nn-1" className="ns-section">
              <h2>1. 1-NN Classifier</h2>

              <p>
                The simplest instance-based learner. There is no explicit training phase — just store the
                dataset. At prediction time, find the single closest training example and return its label.
              </p>
              <p>
                Given training set <K l="\{(\mathbf{x}^{(i)}, y^{(i)})\}_{i=1}^N" /> with{' '}
                <K l="\mathbf{x}^{(i)} \in \mathbb{R}^d" /> and <K l="y^{(i)} \in \{1,\dots,C\}" />,
                for a query point <K l="\mathbf{x}" />:
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>1-NN Algorithm</div>
                <KB l="i^* = \arg\min_{\textcolor{#E67E22}{i \in \{1,\dots,N\}}} \textcolor{#2980B9}{D}(\mathbf{x}^{(i)}, \mathbf{x})" />
                <KB l="\hat{y} = y^{(i^*)}" />
                <Legend items={[
                  { color: '#2980B9', label: 'D(·, ·) — chosen distance function' },
                  { color: '#E67E22', label: 'i ∈ {1,…,N} — search over all training examples' },
                ]} />
              </div>

              <p>
                The 1-NN decision boundary is <strong>piecewise linear</strong> and forms a subset of the{' '}
                <strong>Voronoi diagram</strong> of the training points. Each Voronoi cell contains all
                points in the space that are closest to a particular training example. The class boundary
                appears where adjacent Voronoi cells belong to different classes.
              </p>
              <p>
                Key point: 1-NN achieves 0 training error by construction, but this does not imply good
                generalization.
              </p>

              <ArtifactWrapper title="Interactive: Voronoi Diagram Builder">
                <VoronoiBuilder />
              </ArtifactWrapper>
            </section>

            {/* ── Section 2: k-NN Classification ── */}
            <section id="knn-classification" className="ns-section">
              <h2>2. k-NN Classification</h2>

              <p>
                Generalize 1-NN by considering the <K l="k" /> nearest neighbors. Let{' '}
                <K l="\mathcal{N}_k(\mathbf{x})" /> denote the indices of the <K l="k" /> training
                points with smallest distance to <K l="\mathbf{x}" />.
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>K-NN Classification</div>
                <KB l="\hat{y} = \arg\max_{\textcolor{#E67E22}{c \in \{1,\dots,C\}}} \sum_{\textcolor{#2980B9}{i \in \mathcal{N}_k(\mathbf{x})}} \mathbf{1}[y^{(i)} = c]" />
                <Legend items={[
                  { color: '#2980B9', label: 'ℕₖ(x) — set of k nearest neighbors of x' },
                  { color: '#E67E22', label: 'c — candidate class label' },
                ]} />
              </div>

              <p>
                The indicator function <K l="\mathbf{1}[\cdot]" /> returns 1 if the condition is true,
                0 otherwise. The prediction is the class with the most votes among the <K l="k" /> neighbors.
              </p>
              <p>
                This is a <strong>local model</strong>: instead of learning a single global function,
                kNN produces a different local approximation for each query point, determined by the query
                itself and the nearby training data.
              </p>
            </section>

            {/* ── Section 3: k-NN Regression ── */}
            <section id="knn-regression" className="ns-section">
              <h2>3. k-NN Regression</h2>

              <p>
                For continuous targets, replace majority vote with the mean of neighbor values:
              </p>

              <div className="formula-card">
                <div style={FC_TITLE}>K-NN Regression</div>
                <KB l="\hat{y} = \frac{1}{\textcolor{#2980B9}{k}} \sum_{\textcolor{#E67E22}{i \in \mathcal{N}_k(\mathbf{x})}} y^{(i)}" />
                <Legend items={[
                  { color: '#2980B9', label: 'k — number of neighbors' },
                  { color: '#E67E22', label: 'ℕₖ(x) — indices of the k closest training points' },
                ]} />
              </div>

              <p>
                With <K l="k=1" />, the prediction function interpolates every training point, producing a
                jagged step function. Increasing <K l="k" /> averages over more neighbors and smooths the
                prediction.
              </p>
            </section>

            {/* ── Section 4: Probabilistic View ── */}
            <section id="probabilistic-view" className="ns-section">
              <h2>4. Probabilistic View</h2>

              <p>kNN implicitly estimates a local class posterior:</p>

              <div className="formula-card">
                <div style={FC_TITLE}>Local Posterior Estimate</div>
                <KB l="\hat{P}(y = c \mid \mathbf{x}, \mathcal{D}) = \frac{1}{\textcolor{#2980B9}{k}} \sum_{\textcolor{#E67E22}{i \in \mathcal{N}_k(\mathbf{x}, \mathcal{D})}} \mathbf{1}[y^{(i)} = c]" />
                <Legend items={[
                  { color: '#2980B9', label: 'k — controls the resolution of the density estimate' },
                  { color: '#E67E22', label: 'ℕₖ(x, 𝒟) — k-nearest neighbors of x in dataset 𝒟' },
                ]} />
              </div>

              <p>
                This is a <strong>nonparametric estimate</strong> — the fraction of neighbors belonging
                to each class approximates the true posterior in the local region around <K l="\mathbf{x}" />.
                No assumptions about the functional form of the decision boundary are required.
              </p>
            </section>

            {/* ── Section 5: Effect of k ── */}
            <section id="effect-of-k" className="ns-section">
              <h2>5. Effect of k</h2>

              <p>
                <K l="k" /> controls the <strong>bias-variance tradeoff</strong>:
              </p>

              <ul>
                <li>
                  <strong>Small <K l="k" /></strong> (e.g. <K l="k=1" />): Low bias, high variance. The
                  decision boundary is jagged and sensitive to noise. Training error is 0 for <K l="k=1" />.
                </li>
                <li>
                  <strong>Large <K l="k" /></strong> (e.g. <K l="k=25" />): High bias, low variance. The
                  boundary smooths out. Individual noisy points have less influence.
                </li>
                <li>
                  <strong>Extreme <K l="k = N" /></strong>: Every query returns the majority class of the
                  entire training set. The classifier ignores the input entirely.
                </li>
              </ul>

              <p>
                Selecting <K l="k" />: use a validation set. Try different values, measure generalization
                error, pick the <K l="k" /> that minimizes it. For binary classification, odd <K l="k" />{' '}
                avoids ties. For multi-class, ties can be broken by: random choice, prior probability, or
                falling back to 1-NN among the tied neighbors.
              </p>

              <ArtifactWrapper title="Interactive: Decision Boundary vs k">
                <DecisionBoundary />
              </ArtifactWrapper>
            </section>

            {/* ── Section 6: Distance Measures ── */}
            <section id="distance-measures" className="ns-section">
              <h2>6. Distance Measures</h2>

              <p>
                The choice of distance function defines the geometry of "closeness" and can drastically
                affect performance. There is no universally best distance — it depends on the data and task.
              </p>

              <p>A <strong>distance metric</strong> <K l="d" /> must satisfy:</p>
              <ol>
                <li><K l="d(\mathbf{x}, \mathbf{y}) \geq 0" /> (non-negativity)</li>
                <li><K l="d(\mathbf{x}, \mathbf{y}) = 0 \iff \mathbf{x} = \mathbf{y}" /> (identity of indiscernibles)</li>
                <li><K l="d(\mathbf{x}, \mathbf{y}) = d(\mathbf{y}, \mathbf{x})" /> (symmetry)</li>
                <li><K l="d(\mathbf{x}, \mathbf{y}) \leq d(\mathbf{x}, \mathbf{z}) + d(\mathbf{z}, \mathbf{y})" /> (triangle inequality)</li>
              </ol>

              <h3>Minkowski Family</h3>

              <div className="formula-card">
                <div style={FC_TITLE}>Minkowski Distance (Lp Norm)</div>
                <KB l="D_p(\mathbf{x}, \mathbf{y}) = \left( \sum_{j=1}^{d} |x_j - y_j|^{\textcolor{#E67E22}{p}} \right)^{1/\textcolor{#E67E22}{p}}" />
                <Legend items={[
                  { color: '#E67E22', label: 'p — order of the norm' },
                ]} />
              </div>

              <table>
                <thead>
                  <tr>
                    <th>p</th>
                    <th>Name</th>
                    <th>Formula</th>
                    <th>Shape of "ball"</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Manhattan (L₁)</td>
                    <td><K l="\sum_j |x_j - y_j|" /></td>
                    <td>Diamond</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Euclidean (L₂)</td>
                    <td><K l="\sqrt{\sum_j (x_j - y_j)^2}" /></td>
                    <td>Circle</td>
                  </tr>
                  <tr>
                    <td>∞</td>
                    <td>Chebyshev (L∞)</td>
                    <td><K l="\max_j |x_j - y_j|" /></td>
                    <td>Square</td>
                  </tr>
                </tbody>
              </table>

              <h3>Hamming Distance</h3>
              <p>
                Number of positions where two vectors differ. Works for binary or categorical features.
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.88rem', background: 'var(--accent-bg)', padding: '0.5rem 0.8rem', borderRadius: '6px', color: 'var(--text)' }}>
                x = (red, tall, heavy), y = (green, tall, light) → d(x, y) = 2
              </p>

              <h3>Edit Distance (Levenshtein)</h3>
              <p>
                For strings: minimum number of insertions + deletions to transform one string into another.
                Computed via dynamic programming.
              </p>

              <h3>KL-Divergence</h3>
              <p>For probability distributions <K l="P, Q" />:</p>

              <div className="formula-card">
                <div style={FC_TITLE}>KL-Divergence</div>
                <KB l="D_{KL}(P \| Q) = \sum_i \textcolor{#2980B9}{P(i)} \log \frac{\textcolor{#2980B9}{P(i)}}{\textcolor{#E67E22}{Q(i)}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'P(i) — reference distribution' },
                  { color: '#E67E22', label: 'Q(i) — comparison distribution' },
                ]} />
              </div>

              <p>
                Note: KL-divergence is <strong>asymmetric</strong> (<K l="D_{KL}(P\|Q) \neq D_{KL}(Q\|P)" />)
                and is not a true metric. It can be symmetrized by averaging both directions.
              </p>

              <ArtifactWrapper title="Interactive: Lp Norm Ball Visualizer">
                <LpNormBall />
              </ArtifactWrapper>
            </section>

            {/* ── Section 7: Feature Scaling ── */}
            <section id="feature-scaling" className="ns-section">
              <h2>7. Feature Scaling</h2>

              <p>
                Features with large ranges dominate distance calculations, making features with small
                ranges effectively irrelevant.
              </p>
              <p>
                Example: if feature 1 (income) ranges [100, 1,000,000] and feature 2 (experience) ranges
                [0, 10], Euclidean distance is almost entirely determined by income.
              </p>

              <h3>Two common approaches</h3>

              <div className="formula-card">
                <div style={FC_TITLE}>Min-Max Normalization</div>
                <KB l="\tilde{x} = \frac{x - \textcolor{#E67E22}{a}}{\textcolor{#2980B9}{b} - \textcolor{#E67E22}{a}}" />
                <Legend items={[
                  { color: '#E67E22', label: 'a — minimum value of the feature' },
                  { color: '#2980B9', label: 'b — maximum value of the feature' },
                ]} />
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                  Maps all values to [0, 1].
                </p>
              </div>

              <div className="formula-card">
                <div style={FC_TITLE}>Z-Score Standardization</div>
                <KB l="\tilde{x} = \frac{x - \textcolor{#2980B9}{\mu}}{\textcolor{#E67E22}{\sigma}}" />
                <Legend items={[
                  { color: '#2980B9', label: 'μ — sample mean' },
                  { color: '#E67E22', label: 'σ — sample standard deviation' },
                ]} />
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                  Maps to zero mean and unit variance.
                </p>
              </div>
            </section>

            {/* ── Section 8: Voting Mechanisms ── */}
            <section id="voting-mechanisms" className="ns-section">
              <h2>8. Voting Mechanisms</h2>

              <h3>Uniform Voting</h3>
              <p>
                Each of the <K l="k" /> neighbors gets an equal vote. This is the standard majority vote
                described in Section 2.
              </p>

              <h3>Distance-Weighted Voting</h3>
              <p>Give closer neighbors more influence:</p>

              <div className="formula-card">
                <div style={FC_TITLE}>Weighted K-NN</div>
                <KB l="w_i = \frac{1}{\textcolor{#2980B9}{D(\mathbf{x}^{(i)}, \mathbf{x})} + \textcolor{#E67E22}{\epsilon}}" />
                <KB l="S_c = \sum_{\substack{\mathbf{x}^{(i)} \in \mathcal{N}_k(\mathbf{x}) \\ y^{(i)} = c}} w_i" />
                <KB l="\hat{y} = \arg\max_c\; S_c" />
                <Legend items={[
                  { color: '#2980B9', label: 'D(xⁱ, x) — distance from neighbor i to query' },
                  { color: '#E67E22', label: 'ε — small constant to avoid division by zero' },
                ]} />
              </div>

              <h3>Tie-Breaking Strategies</h3>
              <p>When classes are tied in votes:</p>
              <ul>
                <li>Use odd <K l="k" /> (only helps for binary classification)</li>
                <li>Pick the class with the higher prior probability</li>
                <li>Fall back to 1-NN among the tied neighbors</li>
                <li>Decide randomly</li>
              </ul>
            </section>

            {/* ── Section 9: Curse of Dimensionality ── */}
            <section id="curse-of-dimensionality" className="ns-section">
              <h2>9. Curse of Dimensionality</h2>

              <p>As <K l="d" /> grows, distance-based methods degrade because:</p>

              <ol>
                <li style={{ marginBottom: '0.7rem' }}>
                  <strong>Volume explosion</strong>: the number of bins needed to cover the space grows
                  as <K l="m^d" /> where <K l="m" /> is bins per dimension. Maintaining constant density
                  requires exponentially more data.
                </li>
                <li>
                  <strong>Distance concentration</strong>: in high dimensions, the distances between all
                  pairs of points converge. The ratio{' '}
                  <K l="\frac{d_{\max} - d_{\min}}{d_{\min}} \to 0" /> as <K l="d \to \infty" /> for
                  many distributions. When all points are nearly equidistant, the concept of "nearest
                  neighbor" becomes meaningless.
                </li>
              </ol>

              <p>
                kNN is one of the algorithms <strong>most affected</strong> by the curse of dimensionality,
                since its entire mechanism depends on meaningful distance comparisons.
              </p>
              <p>
                Mitigations: feature selection, dimensionality reduction (e.g. PCA), or using
                domain-specific distance functions.
              </p>

              <ArtifactWrapper title="Interactive: Distance Concentration Demo">
                <DistanceConcentration />
              </ArtifactWrapper>
            </section>

            {/* ── Section 10: Practical Considerations ── */}
            <section id="practical-considerations" className="ns-section">
              <h2>10. Practical Considerations</h2>

              <h3>Complexity</h3>
              <table>
                <thead>
                  <tr><th></th><th>Time</th><th>Space</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Training</strong></td>
                    <td><K l="O(1)" /></td>
                    <td><K l="O(Nd)" /></td>
                  </tr>
                  <tr>
                    <td><strong>Testing (per query)</strong></td>
                    <td><K l="O(Nd)" /></td>
                    <td><K l="O(N)" /></td>
                  </tr>
                </tbody>
              </table>

              <p>
                kNN is a <strong>lazy learner</strong>: no work at training time, all computation deferred
                to prediction. This is the opposite of the ideal — fast prediction, slow training is
                acceptable in most production settings.
              </p>

              <h3>Irrelevant Features</h3>
              <p>
                Adding irrelevant features hurts kNN disproportionately. In 1D, a query point's neighbors
                might be clearly from one class. Adding a noisy second dimension scatters those neighbors,
                changing which points are "closest" and degrading accuracy.
              </p>

              <h3>Redundant Features</h3>
              <p>
                Highly correlated features effectively multiply the scale of that factor in distance
                computation, biasing the classifier.
              </p>

              <h3>When to Consider kNN</h3>
              <ul>
                <li>Low-dimensional data (rule of thumb: <K l="d < 50" />, or use dimensionality reduction)</li>
                <li>Large training set available</li>
                <li>Need a simple, interpretable baseline</li>
                <li>Decision boundary is expected to be irregular</li>
              </ul>

              <h3>Speeding Up kNN</h3>
              <p>
                Brute-force <K l="O(Nd)" /> per query is prohibitive at scale. Production systems use
                approximate nearest neighbor (ANN) methods:
              </p>
              <ul>
                <li><strong>FAISS</strong> (Meta): clusters points into neighborhoods via quantization, searches only top clusters</li>
                <li><strong>Annoy</strong> (Spotify): builds random projection trees, searches only relevant leaf nodes</li>
                <li><strong>k-d trees</strong>: partition space along coordinate axes, prune branches during search (degrades in high <K l="d" />)</li>
              </ul>

              <h3>Advantages</h3>
              <ul>
                <li>No training phase</li>
                <li>Can learn complex, nonlinear decision boundaries</li>
                <li>Minimal assumptions (just smoothness + meaningful distance)</li>
                <li>Strong baseline — sometimes hard to beat</li>
              </ul>

              <h3>Disadvantages</h3>
              <ul>
                <li>Slow at prediction time (<K l="O(Nd)" /> per query)</li>
                <li>Stores entire training set in memory</li>
                <li>Sensitive to irrelevant / redundant features</li>
                <li>Performance degrades in high dimensions (curse of dimensionality)</li>
                <li>Choice of distance function is critical and problem-dependent</li>
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
      <footer className="footer">
        <div className="footer-bg" aria-hidden="true"></div>
        <div className="footer-inner">
          <div className="footer-left">
            <p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", opacity: 0.6, fontFamily: "var(--ff-mono)" }}>
              Machine Learning Study Guide · Built with React + KaTeX
            </p>
          </div>
          <p className="footer-copy">© 2026 — SIMA ADLEYBA</p>
        </div>
      </footer>
    </div>
  );
}
