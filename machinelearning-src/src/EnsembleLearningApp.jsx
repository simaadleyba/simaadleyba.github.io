import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import EnsembleLearningTableOfContents from './components/EnsembleLearningTableOfContents';
import './styles/global.css';

const BLUE = '#245cff';
const ORANGE = '#e67e22';
const GREEN = '#22995f';
const RED = '#d84a4a';
const PURPLE = '#7654d8';
const GRID = 'rgba(16, 19, 24, 0.14)';

function K({ l, block = false }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) katex.render(l, ref.current, { throwOnError: false, displayMode: block }); }, [l, block]);
  return block ? <div ref={ref} style={{ overflowX: 'auto', margin: '0.8rem 0' }} /> : <span ref={ref} />;
}
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <nav className="ns-nav"><a className="nav-mark" href="/"><span className="dot" /></a><button className="ns-nav-burger" aria-label="Toggle menu" onClick={() => setMenuOpen(open => !open)}>☰</button><div className={`ns-nav-links${menuOpen ? ' mobile-open' : ''}`}>{['about', 'research', 'experience', 'education', 'studyguides', 'beyond'].map(item => <a key={item} href={`/#${item}`} onClick={() => setMenuOpen(false)}>{item === 'studyguides' ? 'study guides' : item}</a>)}<a href="/" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>cv</a><span className="nav-pipe">|</span><a href="https://kimchikorelileriniskembesidir.com" className="field-notes" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>personal blog</a></div></nav>;
}
function Artifact({ title, children }) { return <div className="artifact-card"><h4>{title}</h4>{children}</div>; }
function Control({ label, value, children }) { return <label style={{ display: 'grid', gap: '0.35rem', minWidth: 145, flex: 1 }}><span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem' }}><span>{label}</span><strong style={{ color: BLUE }}>{value}</strong></span>{children}</label>; }
function Metric({ label, value, color = BLUE, note }) { return <div style={{ background: '#fff', padding: '0.85rem 1rem', minWidth: 0 }}><div style={{ color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.66rem' }}>{label}</div><div style={{ color, fontSize: '1.2rem', fontWeight: 700 }}>{value}</div>{note && <div style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{note}</div>}</div>; }
function MetricGrid({ children }) { return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>{children}</div>; }

function binomialMajority(n, p) {
  let probability = 0;
  const start = Math.floor(n / 2) + 1;
  for (let k = start; k <= n; k += 1) {
    let choose = 1;
    for (let i = 1; i <= k; i += 1) choose *= (n - i + 1) / i;
    probability += choose * p ** k * (1 - p) ** (n - k);
  }
  return probability;
}

function VotingExplorer() {
  const [members, setMembers] = useState(9);
  const [accuracy, setAccuracy] = useState(65);
  const p = accuracy / 100;
  const ensemble = binomialMajority(members, p);
  const majority = Math.floor(members / 2) + 1;
  return <Artifact title="Interactive · Condorcet-style majority vote"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="independent voters" value={members}><input aria-label="Number of ensemble voters" type="range" min="1" max="31" step="2" value={members} onChange={event => setMembers(Number(event.target.value))} /></Control><Control label="each voter accuracy" value={`${accuracy}%`}><input aria-label="Individual voter accuracy" type="range" min="40" max="85" value={accuracy} onChange={event => setAccuracy(Number(event.target.value))} /></Control></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: '1.3rem' }}>{Array.from({ length: members }, (_, index) => <div key={index} style={{ width: 22, height: 22, borderRadius: '50%', background: index < majority ? GREEN : '#dce4ff', border: `1px solid ${GRID}` }} />)}</div><MetricGrid><Metric label="individual accuracy" value={`${accuracy}%`} color={accuracy > 50 ? GREEN : RED} /><Metric label="majority threshold" value={`${majority} / ${members}`} color={PURPLE} /><Metric label="ensemble accuracy" value={`${(ensemble * 100).toFixed(1)}%`} color={ensemble > p ? GREEN : RED} /></MetricGrid><p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>The gain assumes errors are independent. If every member makes the same mistake, adding votes changes nothing; diversity is as important as member quality.</p></Artifact>;
}

function seededSample(seed, n) {
  let state = seed + 1;
  return Array.from({ length: n }, () => { state = (state * 1664525 + 1013904223) % 4294967296; return Math.floor(state / 4294967296 * n); });
}
function BootstrapExplorer() {
  const [seed, setSeed] = useState(3);
  const [size, setSize] = useState(12);
  const sample = seededSample(seed, size);
  const counts = Array.from({ length: size }, (_, index) => sample.filter(value => value === index).length);
  const oob = counts.filter(count => count === 0).length;
  return <Artifact title="Interactive · Draw a bootstrap training set"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="bootstrap draw" value={seed}><input aria-label="Bootstrap draw seed" type="range" min="0" max="20" value={seed} onChange={event => setSeed(Number(event.target.value))} /></Control><Control label="original rows n" value={size}><input aria-label="Bootstrap sample size" type="range" min="6" max="24" value={size} onChange={event => setSize(Number(event.target.value))} /></Control></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(42px, 1fr))', gap: 5, marginTop: '1.3rem' }}>{counts.map((count, index) => <div key={index} style={{ minHeight: 54, display: 'grid', placeItems: 'center', background: count === 0 ? '#f6d8d8' : count > 1 ? '#eef2ff' : '#fff', border: `1px solid ${count === 0 ? RED : GRID}`, fontFamily: 'var(--ff-mono)', fontSize: '0.68rem' }}><span>row {index + 1}</span><strong style={{ color: count === 0 ? RED : count > 1 ? BLUE : GREEN }}>{count}×</strong></div>)}</div><MetricGrid><Metric label="unique rows" value={`${size - oob} / ${size}`} color={GREEN} /><Metric label="out-of-bag rows" value={oob} color={RED} /><Metric label="OOB fraction" value={`${(oob / size * 100).toFixed(1)}%`} color={ORANGE} note="approaches 36.8% as n grows" /></MetricGrid></Artifact>;
}

function VarianceExplorer() {
  const [trees, setTrees] = useState(50);
  const [correlation, setCorrelation] = useState(25);
  const rho = correlation / 100;
  const ratio = rho + (1 - rho) / trees;
  return <Artifact title="Interactive · Correlation sets the variance floor"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="ensemble size B" value={trees}><input aria-label="Bagging ensemble size" type="range" min="1" max="300" value={trees} onChange={event => setTrees(Number(event.target.value))} /></Control><Control label="error correlation ρ" value={rho.toFixed(2)}><input aria-label="Base learner correlation" type="range" min="0" max="100" value={correlation} onChange={event => setCorrelation(Number(event.target.value))} /></Control></div><div style={{ height: 48, display: 'flex', border: `1px solid ${GRID}`, marginTop: '1.3rem' }}><div style={{ width: `${ratio * 100}%`, background: ratio < 0.35 ? GREEN : ORANGE, transition: 'width .15s' }} /><div style={{ flex: 1, background: '#edf0f3' }} /></div><K block l="\operatorname{Var}(\bar f)=\sigma^2\left(\rho+\frac{1-\rho}{B}\right)" /><MetricGrid><Metric label="variance retained" value={`${(ratio * 100).toFixed(1)}%`} color={ratio < 0.35 ? GREEN : RED} /><Metric label="variance removed" value={`${((1 - ratio) * 100).toFixed(1)}%`} color={BLUE} /><Metric label="infinite-B floor" value={`${correlation}%`} color={PURPLE} /></MetricGrid></Artifact>;
}

function FeatureLotteryExplorer() {
  const [features, setFeatures] = useState(20);
  const [candidates, setCandidates] = useState(4);
  const [strong, setStrong] = useState(3);
  const adjustedStrong = Math.min(strong, features);
  const missProbability = (() => { let value = 1; for (let i = 0; i < Math.min(candidates, features); i += 1) value *= (features - adjustedStrong - i) / Math.max(1, features - i); return Math.max(0, value); })();
  const seeStrong = 1 - missProbability;
  return <Artifact title="Interactive · Random-forest feature lottery"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="total features p" value={features}><input aria-label="Total random forest features" type="range" min="5" max="50" value={features} onChange={event => { const next = Number(event.target.value); setFeatures(next); setCandidates(value => Math.min(value, next)); setStrong(value => Math.min(value, next)); }} /></Control><Control label="candidates per split m" value={candidates}><input aria-label="Features considered per split" type="range" min="1" max={features} value={candidates} onChange={event => setCandidates(Number(event.target.value))} /></Control><Control label="strong features" value={adjustedStrong}><input aria-label="Strong predictive features" type="range" min="1" max={features} value={adjustedStrong} onChange={event => setStrong(Number(event.target.value))} /></Control></div><div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(features, 25)}, minmax(5px, 1fr))`, gap: 3, marginTop: '1.3rem' }}>{Array.from({ length: Math.min(features, 25) }, (_, index) => <div key={index} style={{ height: 36, background: index < adjustedStrong ? GREEN : '#dce4ff', border: `1px solid ${GRID}` }} />)}</div><MetricGrid><Metric label="chance split sees signal" value={`${(seeStrong * 100).toFixed(1)}%`} color={GREEN} /><Metric label="chance it misses signal" value={`${(missProbability * 100).toFixed(1)}%`} color={RED} /><Metric label="candidate fraction" value={`${(candidates / features * 100).toFixed(0)}%`} color={PURPLE} /></MetricGrid><p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>Considering fewer features decorrelates trees, but too small a candidate set can hide useful predictors and weaken every split.</p></Artifact>;
}

function AdaBoostExplorer() {
  const [error, setError] = useState(25);
  const [round, setRound] = useState(1);
  const e = Math.min(0.499, error / 100);
  const alpha = 0.5 * Math.log((1 - e) / e);
  const multiplier = Math.exp(2 * alpha);
  const hardWeight = multiplier ** round;
  return <Artifact title="Interactive · AdaBoost focuses on mistakes"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="weak learner error ε" value={`${error}%`}><input aria-label="AdaBoost weak learner error" type="range" min="5" max="49" value={error} onChange={event => setError(Number(event.target.value))} /></Control><Control label="repeatedly missed rounds" value={round}><input aria-label="AdaBoost missed rounds" type="range" min="1" max="6" value={round} onChange={event => setRound(Number(event.target.value))} /></Control></div><K block l="\alpha_t=\frac{1}{2}\log\frac{1-\epsilon_t}{\epsilon_t},\qquad w_i\leftarrow w_i\exp(-\alpha_t y_i h_t(x_i))" /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: GRID, border: `1px solid ${GRID}` }}><div style={{ background: '#fff', padding: '1rem' }}><div style={{ height: 24, width: `${Math.min(100, 100 / Math.max(1, hardWeight))}%`, background: GREEN }} /><small>correctly classified weight</small></div><div style={{ background: '#fff', padding: '1rem' }}><div style={{ height: 24, width: '100%', background: RED }} /><small>repeatedly missed weight</small></div></div><MetricGrid><Metric label="learner vote α" value={alpha.toFixed(3)} color={BLUE} /><Metric label="error-weight multiplier" value={`${multiplier.toFixed(2)}×`} color={ORANGE} /><Metric label="relative hard-case weight" value={`${hardWeight.toFixed(1)}×`} color={RED} /></MetricGrid></Artifact>;
}

const BOOST_DATA = [[0, 1.2], [1, 1.5], [2, 2.2], [3, 4.0], [4, 4.6], [5, 3.9], [6, 2.7], [7, 3.2], [8, 5.2]];
function fitStump(xs, residuals) {
  let best = { error: Infinity, threshold: 0, left: 0, right: 0 };
  for (let split = 0.5; split < 8; split += 1) {
    const leftValues = residuals.filter((_, index) => xs[index] < split);
    const rightValues = residuals.filter((_, index) => xs[index] >= split);
    const left = leftValues.reduce((a, b) => a + b, 0) / leftValues.length;
    const right = rightValues.reduce((a, b) => a + b, 0) / rightValues.length;
    const error = residuals.reduce((sum, value, index) => sum + (value - (xs[index] < split ? left : right)) ** 2, 0);
    if (error < best.error) best = { error, threshold: split, left, right };
  }
  return best;
}
function runBoosting(rounds, rate) {
  const xs = BOOST_DATA.map(point => point[0]);
  const ys = BOOST_DATA.map(point => point[1]);
  let predictions = ys.map(() => ys.reduce((a, b) => a + b, 0) / ys.length);
  for (let round = 0; round < rounds; round += 1) {
    const residuals = ys.map((value, index) => value - predictions[index]);
    const stump = fitStump(xs, residuals);
    predictions = predictions.map((value, index) => value + rate * (xs[index] < stump.threshold ? stump.left : stump.right));
  }
  return { predictions, mse: ys.reduce((sum, value, index) => sum + (value - predictions[index]) ** 2, 0) / ys.length };
}
function GradientBoostingExplorer() {
  const [rounds, setRounds] = useState(4);
  const [rateValue, setRateValue] = useState(20);
  const rate = rateValue / 100;
  const result = runBoosting(rounds, rate);
  const cx = x => 44 + x / 8 * 566;
  const cy = y => 225 - y / 6 * 188;
  const path = result.predictions.map((value, index) => `${index ? 'L' : 'M'} ${cx(index)} ${cy(value)}`).join(' ');
  return <Artifact title="Interactive · Fit residuals stage by stage"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="boosting rounds" value={rounds}><input aria-label="Gradient boosting rounds" type="range" min="0" max="30" value={rounds} onChange={event => setRounds(Number(event.target.value))} /></Control><Control label="learning rate η" value={rate.toFixed(2)}><input aria-label="Gradient boosting learning rate" type="range" min="5" max="100" step="5" value={rateValue} onChange={event => setRateValue(Number(event.target.value))} /></Control></div><svg viewBox="0 0 640 260" role="img" aria-label="Gradient boosting prediction fitted to residuals" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>{[1, 2, 3, 4, 5].map(value => <g key={value}><line x1="44" y1={cy(value)} x2="610" y2={cy(value)} stroke={GRID} /><line x1={cx(value)} y1="37" x2={cx(value)} y2="225" stroke={GRID} /></g>)}<path d={path} fill="none" stroke={BLUE} strokeWidth="3" />{BOOST_DATA.map((point, index) => <circle key={index} cx={cx(point[0])} cy={cy(point[1])} r="6" fill={GREEN} />)}</svg><MetricGrid><Metric label="training MSE" value={result.mse.toFixed(3)} color={result.mse < 0.5 ? GREEN : ORANGE} /><Metric label="rounds" value={rounds} color={PURPLE} /><Metric label="total step scale" value={(rounds * rate).toFixed(2)} color={BLUE} /></MetricGrid></Artifact>;
}

export default function EnsembleLearningApp() {
  return <div style={{ background: 'var(--bg)', minHeight: '100vh' }}><Navbar /><header className="ns-header"><div className="container"><div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div><div className="ns-title">Ensemble Learning</div><div className="ns-subtitle">Combine diverse models so their shared signal survives while individual variance and errors cancel, from voting and bagging to forests, boosting, and stacking.</div><span className="tag">Diversity · bootstrap aggregation · sequential correction</span></div></header>
  <div className="container"><div className="ns-layout"><aside className="ns-sidebar"><EnsembleLearningTableOfContents /></aside><main className="ns-content">
    <section id="idea" className="ns-section"><h2>1. Why Combine Models?</h2><p>An ensemble aggregates several base learners instead of trusting one fitted model. The combination helps when members are individually useful and make different errors.</p><K block l="\hat f_{ens}(x)=\sum_{b=1}^{B}\alpha_b\hat f_b(x)" /><table><thead><tr><th>Design axis</th><th>Question</th></tr></thead><tbody><tr><td>Member quality</td><td>Is each learner better than chance or a simple baseline?</td></tr><tr><td>Diversity</td><td>Do members fail on different examples?</td></tr><tr><td>Aggregation</td><td>Average, majority vote, weighted vote, or learned combiner?</td></tr><tr><td>Training relation</td><td>Independent/parallel, sequential, or stacked?</td></tr></tbody></table><div className="formula-card"><strong>Central trade-off:</strong> a collection of identical strong models behaves like one model. Deliberate randomness or different inductive biases create the diversity an ensemble needs.</div></section>

    <section id="voting" className="ns-section"><h2>2. Majority &amp; Probability Voting</h2><p>Hard voting takes the most frequent predicted class. Soft voting averages class probabilities and can weight better-calibrated members more heavily.</p><K block l="\hat y=\operatorname{mode}\{h_1(x),\ldots,h_B(x)\},\qquad \hat p(y\mid x)=\sum_b\alpha_b\hat p_b(y\mid x)" /><VotingExplorer /></section>

    <section id="bagging" className="ns-section"><h2>3. Bootstrap Aggregating</h2><p>Bagging trains the same unstable learning algorithm on many bootstrap samples drawn with replacement, then averages regression outputs or votes for classification.</p><BootstrapExplorer /><ol><li>Draw <K l="B" /> size-<K l="n" /> bootstrap datasets from the training set.</li><li>Fit one base learner independently to each draw.</li><li>Aggregate all predictions with equal or validated weights.</li></ol><p>Deep decision trees are a natural base learner: each tree has low bias and high variance, while averaging stabilizes the irregular boundaries.</p></section>

    <section id="variance" className="ns-section"><h2>4. How Averaging Reduces Variance</h2><p>For base predictions with common variance <K l="\sigma^2" /> and pairwise correlation <K l="\rho" />, averaging <K l="B" /> members retains:</p><VarianceExplorer /><p>Increasing <K l="B" /> reduces the independent component but cannot remove correlated error. This is why adding randomness to the data and feature space matters.</p></section>

    <section id="forests" className="ns-section"><h2>5. Random Forests</h2><p>A random forest adds feature subsampling to bagged trees. At each split, the tree searches only a random subset of predictors. Strong features can no longer force every tree down the same path.</p><FeatureLotteryExplorer /><table><thead><tr><th>Parameter</th><th>Effect</th></tr></thead><tbody><tr><td>Number of trees</td><td>More stable averaging; slower training and inference</td></tr><tr><td>Features per split</td><td>Smaller values increase diversity but may weaken splits</td></tr><tr><td>Tree depth / leaf size</td><td>Controls base-tree complexity and local smoothness</td></tr></tbody></table><p>Permutation importance measures the performance drop after shuffling a feature. Impurity importance is faster but can favor high-cardinality or frequently split variables.</p></section>

    <section id="oob" className="ns-section"><h2>6. Out-of-Bag Evaluation</h2><p>A bootstrap sample contains about <K l="1-e^{-1}\approx63.2\%" /> unique training observations. The remaining <K l="36.8\%" /> are out of bag for that member.</p><K block l="P(\text{row omitted})=\left(1-\frac{1}{n}\right)^n\longrightarrow e^{-1}" /><p>For each training observation, aggregate predictions only from trees that did not train on it. OOB error offers an internal validation estimate and enables permutation importance without reserving another split, though a final untouched test set is still required.</p></section>

    <section id="adaboost" className="ns-section"><h2>7. AdaBoost</h2><p>AdaBoost trains weak classifiers sequentially. Each round increases attention on examples the current ensemble misclassifies and gives more voting weight to accurate learners.</p><AdaBoostExplorer /><K block l="H(x)=\operatorname{sign}\left(\sum_{t=1}^{T}\alpha_t h_t(x)\right)" /><p>A learner with error below 0.5 receives a positive vote. Very noisy labels and outliers can accumulate large weights, so learning rate, early stopping, and robust variants matter.</p></section>

    <section id="gradient-boosting" className="ns-section"><h2>8. Gradient Boosting</h2><p>Gradient boosting adds a weak learner that follows the negative gradient of the current loss. Under squared error, that target is the residual:</p><K block l="r_i^{(t)}=y_i-F_{t-1}(x_i),\qquad F_t(x)=F_{t-1}(x)+\eta h_t(x)" /><GradientBoostingExplorer /><p>Small learning rates usually need more rounds but can generalize better. Tree depth controls interaction order; row/feature subsampling adds stochastic regularization. Validation-based early stopping limits overfitting.</p></section>

    <section id="stacking" className="ns-section"><h2>9. Stacking &amp; Blending</h2><p>Stacking trains heterogeneous base models, then learns a meta-model from their predictions:</p><K block l="z_i=[h_1(x_i),\ldots,h_B(x_i)],\qquad \hat y_i=g(z_i)" /><div className="formula-card"><strong>Leakage rule:</strong> the meta-model must train on out-of-fold base predictions. Predictions from a base learner on rows it already fitted are optimistically biased and let the stacker memorize training behavior.</div><ol><li>Split training data into folds.</li><li>Fit each base model on all other folds and predict the held-out fold.</li><li>Assemble complete out-of-fold prediction columns.</li><li>Fit the meta-model on those columns.</li><li>Refit base models on all training data for test-time inputs.</li></ol></section>

    <section id="practice" className="ns-section"><h2>10. Choosing &amp; Validating an Ensemble</h2><table><thead><tr><th>Need</th><th>Good starting point</th></tr></thead><tbody><tr><td>Stabilize high-variance trees</td><td>Bagging</td></tr><tr><td>Strong tabular baseline with low tuning burden</td><td>Random forest</td></tr><tr><td>Maximize structured/tabular predictive accuracy</td><td>Regularized gradient boosting</td></tr><tr><td>Combine genuinely different model families</td><td>Soft voting or leakage-safe stacking</td></tr><tr><td>Fast parallel training</td><td>Bagging / random forest</td></tr></tbody></table><h3>Checks that matter</h3><ul><li>Compare against the strongest single member and a simple baseline.</li><li>Measure error correlation, not only individual scores.</li><li>Tune and stop within cross-validation; preserve a final test set.</li><li>Calibrate probabilities when decisions consume probability values.</li><li>Report compute, latency, memory, and interpretability costs alongside accuracy.</li></ul></section>

    <section id="references" className="ns-section"><h2>References &amp; Resources</h2><p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p></section>
  </main></div></div>
  <footer className="footer"><div className="footer-bg" aria-hidden="true" /><div className="footer-inner"><div className="footer-left"><p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p><p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', opacity: 0.6, fontFamily: 'var(--ff-mono)' }}>Machine Learning Study Guide · Built with React + KaTeX</p></div><p className="footer-copy">© 2026 — SIMA ADLEYBA</p></div></footer></div>;
}
