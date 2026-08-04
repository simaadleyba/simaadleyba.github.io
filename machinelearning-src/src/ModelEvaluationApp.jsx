import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import ModelEvaluationTableOfContents from './components/ModelEvaluationTableOfContents';
import './styles/global.css';

const BLUE = '#245cff';
const ORANGE = '#e67e22';
const GREEN = '#22995f';
const RED = '#d84a4a';
const GRID = 'rgba(16, 19, 24, 0.14)';

function K({ l, block = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) katex.render(l, ref.current, { throwOnError: false, displayMode: block });
  }, [l, block]);
  return block
    ? <div ref={ref} style={{ overflowX: 'auto', margin: '0.8rem 0' }} />
    : <span ref={ref} />;
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="ns-nav">
      <a className="nav-mark" href="/"><span className="dot" /></a>
      <button className="ns-nav-burger" aria-label="Toggle menu" onClick={() => setMenuOpen(open => !open)}>☰</button>
      <div className={`ns-nav-links${menuOpen ? ' mobile-open' : ''}`}>
        {['about', 'research', 'experience', 'education', 'studyguides', 'beyond'].map(item => (
          <a key={item} href={`/#${item}`} onClick={() => setMenuOpen(false)}>{item === 'studyguides' ? 'study guides' : item}</a>
        ))}
        <a href="/" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>cv</a>
        <span className="nav-pipe">|</span>
        <a href="https://kimchikorelileriniskembesidir.com" className="field-notes" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>personal blog</a>
      </div>
    </nav>
  );
}

function Artifact({ title, children }) {
  return (
    <div className="artifact-card">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function Control({ label, value, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', minWidth: 160, flex: 1 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
        <span>{label}</span><strong style={{ color: 'var(--accent)' }}>{value}</strong>
      </span>
      {children}
    </label>
  );
}

function ComplexityExplorer() {
  const [complexity, setComplexity] = useState(3);
  const [noise, setNoise] = useState(30);
  const trainError = Math.max(5, 66 - complexity * 6 - noise * 0.12);
  const testError = 13 + Math.pow(complexity - 4, 2) * 2.6 + noise * 0.36;
  const status = complexity < 3 ? 'underfitting' : complexity > 6 ? 'overfitting' : 'useful range';
  const statusColor = status === 'useful range' ? GREEN : status === 'underfitting' ? ORANGE : RED;
  const linePath = Array.from({ length: 81 }, (_, i) => {
    const x = i / 80;
    const base = 0.52 - 0.3 * Math.sin(x * Math.PI * 1.6);
    const underfit = complexity < 3 ? (0.5 - base) * (3 - complexity) * 0.4 : 0;
    const overfit = complexity > 5 ? Math.sin(x * Math.PI * (complexity - 2)) * (complexity - 5) * 0.025 : 0;
    const y = base + underfit + overfit;
    return `${i === 0 ? 'M' : 'L'} ${36 + x * 548} ${18 + y * 210}`;
  }).join(' ');
  const points = Array.from({ length: 18 }, (_, i) => {
    const x = i / 17;
    const jitter = Math.sin(i * 12.9898) * noise * 0.42;
    return { x: 36 + x * 548, y: 18 + (0.52 - 0.3 * Math.sin(x * Math.PI * 1.6)) * 210 + jitter };
  });

  return (
    <Artifact title="Interactive · Complexity and generalization">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <Control label="model complexity" value={complexity}>
          <input aria-label="Model complexity" type="range" min="1" max="10" value={complexity} onChange={event => setComplexity(Number(event.target.value))} />
        </Control>
        <Control label="sample noise" value={`${noise}%`}>
          <input aria-label="Sample noise" type="range" min="0" max="60" value={noise} onChange={event => setNoise(Number(event.target.value))} />
        </Control>
      </div>
      <svg viewBox="0 0 620 260" role="img" aria-label="Data points and fitted curve" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}` }}>
        {[60, 110, 160, 210].map(y => <line key={y} x1="36" y1={y} x2="584" y2={y} stroke={GRID} />)}
        <path d={linePath} fill="none" stroke={BLUE} strokeWidth="3" />
        {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill="#fff" stroke="#101318" strokeWidth="1.4" />)}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1px', background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        {[
          ['training error', `${trainError.toFixed(1)}%`, BLUE],
          ['validation error', `${testError.toFixed(1)}%`, ORANGE],
          ['diagnosis', status, statusColor],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: '#fff', padding: '0.9rem' }}>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.68rem', color: 'var(--muted)' }}>{label}</div>
            <div style={{ color, fontWeight: 700, fontSize: '1.05rem' }}>{value}</div>
          </div>
        ))}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.8rem 0 0' }}>
        Training error keeps falling as flexibility grows. Validation error is U-shaped because a model can be too rigid or start following sample-specific noise.
      </p>
    </Artifact>
  );
}

function SplitPlanner() {
  const [total, setTotal] = useState(1000);
  const [train, setTrain] = useState(60);
  const [validation, setValidation] = useState(20);
  const [positiveRate, setPositiveRate] = useState(12);
  const test = 100 - train - validation;
  const segments = [
    ['train', train, BLUE], ['validation', validation, ORANGE], ['test', test, GREEN],
  ];

  const updateTrain = (next) => setTrain(Math.min(Number(next), 95 - validation));
  const updateValidation = (next) => setValidation(Math.min(Number(next), 95 - train));

  return (
    <Artifact title="Interactive · Three-way split planner">
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        <Control label="examples" value={total.toLocaleString()}>
          <input aria-label="Number of examples" type="range" min="100" max="5000" step="100" value={total} onChange={event => setTotal(Number(event.target.value))} />
        </Control>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Control label="training share" value={`${train}%`}>
            <input aria-label="Training share" type="range" min="40" max="80" value={train} onChange={event => updateTrain(event.target.value)} />
          </Control>
          <Control label="validation share" value={`${validation}%`}>
            <input aria-label="Validation share" type="range" min="5" max="35" value={validation} onChange={event => updateValidation(event.target.value)} />
          </Control>
          <Control label="positive class" value={`${positiveRate}%`}>
            <input aria-label="Positive class rate" type="range" min="1" max="50" value={positiveRate} onChange={event => setPositiveRate(Number(event.target.value))} />
          </Control>
        </div>
      </div>
      <div style={{ display: 'flex', height: 52, margin: '1.4rem 0 0.9rem', border: `1px solid ${GRID}` }}>
        {segments.map(([label, share, color]) => (
          <div key={label} style={{ width: `${share}%`, background: color, color: '#fff', display: 'grid', placeItems: 'center', minWidth: share > 0 ? 42 : 0, transition: 'width 0.2s' }}>
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}>{share}%</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.7rem' }}>
        {segments.map(([label, share, color]) => {
          const count = Math.round(total * share / 100);
          return (
            <div key={label} style={{ borderTop: `2px solid ${color}`, paddingTop: '0.55rem' }}>
              <strong style={{ display: 'block', textTransform: 'capitalize' }}>{label}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{count.toLocaleString()} rows · ≈{Math.round(count * positiveRate / 100)} positive</span>
            </div>
          );
        })}
      </div>
      <p style={{ color: test < 10 ? RED : 'var(--muted)', fontSize: '0.82rem', margin: '0.9rem 0 0' }}>
        {test < 10 ? 'A very small test set can make the final estimate unstable.' : 'Stratification preserves the class proportions shown here in every partition.'}
      </p>
    </Artifact>
  );
}

function CrossValidationExplorer() {
  const [folds, setFolds] = useState(5);
  const [iteration, setIteration] = useState(1);
  useEffect(() => { if (iteration > folds) setIteration(folds); }, [folds, iteration]);
  const syntheticScores = Array.from({ length: folds }, (_, i) => 0.79 + ((i * 7 + folds * 3) % 11) / 100);
  const mean = syntheticScores.reduce((sum, score) => sum + score, 0) / folds;

  return (
    <Artifact title="Interactive · K-fold cross-validation">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Control label="number of folds (K)" value={folds}>
          <input aria-label="Number of folds" type="range" min="3" max="10" value={folds} onChange={event => setFolds(Number(event.target.value))} />
        </Control>
        <Control label="current iteration" value={`${iteration} / ${folds}`}>
          <input aria-label="Cross-validation iteration" type="range" min="1" max={folds} value={iteration} onChange={event => setIteration(Number(event.target.value))} />
        </Control>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${folds}, minmax(20px, 1fr))`, gap: 4, margin: '1.5rem 0 0.7rem' }}>
        {Array.from({ length: folds }, (_, i) => {
          const heldOut = i === iteration - 1;
          return (
            <div key={i} style={{ height: 70, display: 'grid', placeItems: 'center', background: heldOut ? ORANGE : BLUE, color: '#fff', transition: 'background 0.15s' }}>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', writingMode: folds > 7 ? 'vertical-rl' : 'initial' }}>{heldOut ? 'validate' : 'train'}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--muted)', fontSize: '0.82rem' }}>
        <span>fold {iteration} score: <strong style={{ color: ORANGE }}>{syntheticScores[iteration - 1].toFixed(2)}</strong></span>
        <span>mean score: <strong style={{ color: BLUE }}>{mean.toFixed(3)}</strong></span>
      </div>
      <K block l={`\\text{CV score}=\\frac{1}{${folds}}\\sum_{i=1}^{${folds}}\\text{score}_i`} />
    </Artifact>
  );
}

const LEAK_FEATURES = [
  { id: 'age', label: 'age', safe: true, gain: 2 },
  { id: 'history', label: 'past purchases', safe: true, gain: 5 },
  { id: 'session', label: 'final session length', safe: false, gain: 13 },
  { id: 'future', label: 'future surgery', safe: false, gain: 20 },
  { id: 'global', label: 'globally normalized feature', safe: false, gain: 8 },
];

function LeakageLab() {
  const [selected, setSelected] = useState(['age', 'history']);
  const toggle = id => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const chosen = LEAK_FEATURES.filter(feature => selected.includes(feature.id));
  const leaked = chosen.filter(feature => !feature.safe);
  const auc = Math.min(0.99, 0.61 + chosen.reduce((sum, feature) => sum + feature.gain, 0) / 100);

  return (
    <Artifact title="Interactive · Leakage detector">
      <p style={{ marginTop: 0 }}>You are predicting a customer decision at the start of a visit. Choose the features your pipeline uses.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', margin: '1rem 0' }}>
        {LEAK_FEATURES.map(feature => {
          const active = selected.includes(feature.id);
          return (
            <button
              key={feature.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(feature.id)}
              style={{ padding: '0.45rem 0.7rem', border: `1px solid ${active ? BLUE : GRID}`, background: active ? '#eef2ff' : '#fff', color: active ? BLUE : 'var(--muted)', cursor: 'pointer' }}
            >
              {active ? '✓ ' : '+ '}{feature.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', borderTop: `1px solid ${GRID}`, paddingTop: '1rem' }}>
        <div>
          <strong style={{ color: leaked.length ? RED : GREEN }}>{leaked.length ? 'Leak detected' : 'No obvious leak'}</strong>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
            {leaked.length ? `${leaked.map(feature => feature.label).join(', ')} would not legitimately exist at prediction time.` : 'The selected inputs are available at prediction time.'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', color: 'var(--muted)', fontSize: '0.68rem' }}>apparent AUC</div>
          <strong style={{ color: leaked.length ? RED : BLUE, fontSize: '1.6rem' }}>{auc.toFixed(2)}</strong>
        </div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.8rem 0 0' }}>A suspiciously large offline score can be a warning, not a victory. Ask whether every feature is available in exactly the same form at deployment.</p>
    </Artifact>
  );
}

function Flow({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, borderTop: `1px solid ${GRID}`, borderBottom: `1px solid ${GRID}`, margin: '1.2rem 0', overflowX: 'auto' }}>
      {items.map((item, index) => (
        <div key={item.title} style={{ minWidth: 130, padding: '1rem', borderRight: index < items.length - 1 ? `1px solid ${GRID}` : 0, background: index % 2 ? '#f8f9fb' : '#fff' }}>
          <div style={{ color: BLUE, fontFamily: 'var(--ff-mono)', fontSize: '0.68rem' }}>0{index + 1}</div>
          <strong style={{ display: 'block', margin: '0.25rem 0' }}>{item.title}</strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function ModelEvaluationApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div>
          <div className="ns-title">Model Evaluation</div>
          <div className="ns-subtitle">How to choose a model, estimate how it will generalize, and keep test information out of the training process.</div>
          <span className="tag">Model selection · validation · data leakage</span>
        </div>
      </header>

      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar"><ModelEvaluationTableOfContents /></aside>
          <main className="ns-content">
            <section id="models" className="ns-section">
              <h2>1. Models &amp; Hyperparameters</h2>
              <p>The same learning algorithm can produce many candidate models. In k-nearest neighbors we change <K l="k" />; in a decision tree we change its depth or number of leaves; in polynomial regression we change the degree; in an SVM we choose a kernel and penalty.</p>
              <div className="formula-card">
                <h3 style={{ marginTop: 0 }}>Parameter versus hyperparameter</h3>
                <p><strong>Parameters</strong> are inferred from training data: regression coefficients, split points, neural-network weights and biases. <strong>Hyperparameters</strong> configure the learning process or model capacity: <K l="k" /> in kNN, a learning rate, a regularization strength, or a layer count.</p>
                <K block l="\underbrace{\lambda}_{\text{hyperparameter}}\;\longrightarrow\;\text{training algorithm}\;\longrightarrow\;\underbrace{\hat{\theta}_{\lambda}}_{\text{learned parameters}}" />
              </div>
              <p>Hyperparameter tuning sits outside model training. If <K l="k" /> were chosen only by kNN training error, <K l="k=1" /> would win by memorizing every training example. We therefore need data that parameter fitting did not see.</p>
            </section>

            <section id="generalization" className="ns-section">
              <h2>2. Generalization</h2>
              <p>A useful model predicts labels or values for previously unseen examples. Estimating that ability requires an unseen labeled set and a quantitative performance metric.</p>
              <K block l="\widehat{R}_{\text{test}}(f)=\frac{1}{N_{\text{test}}}\sum_{i=1}^{N_{\text{test}}} L\bigl(f(x_i),y_i\bigr)" />
              <p>The training loss can always be pushed downward by increasing flexibility. What we care about is expected loss on new draws from the data-generating process, not how precisely a model remembers one sample.</p>
              <div style={{ borderLeft: `3px solid ${BLUE}`, padding: '0.8rem 1rem', background: '#eef2ff' }}><strong>The one commandment:</strong> the test set remains untouched until training, feature choices, and hyperparameter selection are completely finished.</div>
            </section>

            <section id="complexity" className="ns-section">
              <h2>3. Model Complexity</h2>
              <p><strong>Underfitting</strong> means the predictor is too inflexible to capture the signal. Both training and test error stay high. <strong>Overfitting</strong> means the predictor is flexible enough to fit sample noise: training error is low while test error rises.</p>
              <ComplexityExplorer />
              <h3>Changing the diagnosis</h3>
              <table>
                <thead><tr><th>Problem</th><th>Useful interventions</th><th>What usually does not help</th></tr></thead>
                <tbody>
                  <tr><td>Underfitting</td><td>Add informative features; allow a more complex model; reduce excessive regularization</td><td>Collecting more examples for a model family that cannot represent the pattern</td></tr>
                  <tr><td>Overfitting</td><td>Collect more examples; reduce features; regularize; choose a simpler model</td><td>Increasing model complexity further</td></tr>
                </tbody>
              </table>
            </section>

            <section id="holdout" className="ns-section">
              <h2>4. Three-Way Holdout</h2>
              <p>A three-way split gives each subset one job. The <strong>training set</strong> fits parameters. The <strong>validation set</strong> guides hyperparameters, features, and algorithm choices. The <strong>test set</strong> is used once for final assessment.</p>
              <SplitPlanner />
              <Flow items={[
                { title: 'Split', text: 'Isolate train, validation, and test data.' },
                { title: 'Tune', text: 'Train candidates; compare validation performance.' },
                { title: 'Choose', text: 'Freeze the algorithm, features, and hyperparameters.' },
                { title: 'Retrain', text: 'Fit the chosen setup on train + validation.' },
                { title: 'Test once', text: 'Report final performance on untouched test data.' },
              ]} />
              <p>Holdout is simple, but it spends valuable data and can be unstable when validation or test sets are small. Different random partitions may yield noticeably different scores.</p>
            </section>

            <section id="cross-validation" className="ns-section">
              <h2>5. Cross-Validation</h2>
              <p><K l="K" />-fold cross-validation recycles the non-test data. It trains <K l="K" /> models, each time using one fold for validation and the remaining <K l="K-1" /> folds for training. Every example is validated exactly once.</p>
              <CrossValidationExplorer />
              <h3>Variants</h3>
              <ul>
                <li><strong>Repeated cross-validation</strong> averages results across multiple random fold assignments to reduce split variance.</li>
                <li><strong>Leave-one-out cross-validation (LOOCV)</strong> uses <K l="K=N" />. Each model trains on <K l="N-1" /> examples, but the method requires <K l="N" /> training runs and the models are highly correlated.</li>
                <li><strong>Nested cross-validation</strong> uses an inner loop for hyperparameter selection and an outer loop for generalization estimates. It is useful when the dataset is too small to reserve a fixed test set.</li>
              </ul>
            </section>

            <section id="special-splits" className="ns-section">
              <h2>6. Special Splitting</h2>
              <h3>Stratified data</h3>
              <p>For imbalanced classification, stratification preserves class proportions across train, validation, and test sets. Group-based stratification may also be necessary for attributes such as patient, lesion, household, or data source.</p>
              <h3>Temporal data</h3>
              <p>Random cross-validation is invalid when observations depend on time: it can use future information to predict the past. Use expanding or rolling windows that train only on history and validate on a later interval.</p>
              <div style={{ display: 'grid', gap: 5, margin: '1.2rem 0' }}>
                {[3, 5, 7].map((trainBlocks, row) => (
                  <div key={trainBlocks} style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
                    {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ height: 32, background: i < trainBlocks ? BLUE : i === trainBlocks ? ORANGE : '#e4e7ec', opacity: i > trainBlocks + 1 ? 0.45 : 1 }} title={i < trainBlocks ? 'past: train' : i === trainBlocks ? 'next: validate' : 'future: unavailable'} />)}
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}><span style={{ color: BLUE }}>■</span> historical training window &nbsp; <span style={{ color: ORANGE }}>■</span> next validation window &nbsp; <span style={{ color: '#b2b7c0' }}>■</span> future data</p>
            </section>

            <section id="final-model" className="ns-section">
              <h2>7. Final Model &amp; Baselines</h2>
              <p>After validation identifies the algorithm, features, and hyperparameters, rebuild that chosen model using all non-test data. Report the error on the untouched test set. A deployment model may then be retrained on all available labeled data.</p>
              <div className="formula-card">
                <h3 style={{ marginTop: 0 }}>Always compare against a baseline</h3>
                <ul style={{ marginBottom: 0 }}>
                  <li><strong>Classification:</strong> predict the majority class for every example.</li>
                  <li><strong>Regression:</strong> predict the training-set mean or median for every example.</li>
                </ul>
              </div>
              <p>A complex model that does not outperform an uninformative baseline has not demonstrated predictive value. For example, 95% accuracy on a dataset whose majority class is 95% is no improvement at all.</p>
            </section>

            <section id="leakage" className="ns-section">
              <h2>8. Leakage &amp; Shortcuts</h2>
              <p><strong>Data leakage</strong> introduces target information during training that would not legitimately be available when the model is used. Obvious cases include using the label as a feature or mixing test rows into training. Many cases are subtler.</p>
              <LeakageLab />
              <h3>Common leakage paths</h3>
              <ul>
                <li><strong>Post-outcome features:</strong> total session length when predicting whether a visitor will leave, or future surgery when predicting a diagnosis.</li>
                <li><strong>Near duplicates:</strong> different views of the same lesion or repeated records split across train and test.</li>
                <li><strong>Preprocessing before splitting:</strong> global normalization, missing-value imputation, outlier removal, or feature selection computed using the full dataset.</li>
                <li><strong>Identifiers:</strong> collection-order IDs may encode the class if one class was gathered before another.</li>
                <li><strong>Hidden confounders:</strong> rulers near skin lesions, hospital-specific image markers, borders, scanner styles, or lighting conditions.</li>
              </ul>
              <h3>Shortcut learning</h3>
              <p>A model optimizes the supplied objective, not the human-intended concept. If location, text markers, or acquisition artifacts predict the label more easily than the real phenomenon, the model may adopt that shortcut. In-distribution test scores can remain excellent while performance collapses at another hospital, time period, or location.</p>
            </section>

            <section id="checklist" className="ns-section">
              <h2>9. Evaluation Checklist</h2>
              <ol>
                <li>Define the prediction moment and verify that every feature exists at that moment.</li>
                <li>Split by the true unit of independence: patient, lesion, user, household, source, or time.</li>
                <li>Fit every preprocessing step inside the training partition or cross-validation fold.</li>
                <li>Use validation or an inner CV loop for every modeling decision.</li>
                <li>Compare with simple baselines and inspect surprising results.</li>
                <li>Use feature influence, perturbation tests, and alternative evaluation scenarios to look for shortcuts.</li>
                <li>Touch the test set once, after the full modeling protocol is frozen.</li>
                <li>When possible, confirm offline estimates with controlled real-world deployment.</li>
              </ol>
            </section>

            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
              <ul style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                <li>Geirhos, R., et al. (2020). Shortcut Learning in Deep Neural Networks. <em>Nature Machine Intelligence</em>.</li>
                <li>DeGrave, A. J., Janizek, J. D., &amp; Lee, S.-I. (2021). AI for radiographic COVID-19 detection selects shortcuts over signal. <em>Nature Machine Intelligence</em>.</li>
              </ul>
            </section>
          </main>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-bg" aria-hidden="true" />
        <div className="footer-inner">
          <div className="footer-left">
            <p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', opacity: 0.6, fontFamily: 'var(--ff-mono)' }}>Machine Learning Study Guide · Built with React + KaTeX</p>
          </div>
          <p className="footer-copy">© 2026 — SIMA ADLEYBA</p>
        </div>
      </footer>
    </div>
  );
}
