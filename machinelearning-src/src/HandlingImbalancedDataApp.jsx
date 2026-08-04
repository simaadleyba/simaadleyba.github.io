import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import HandlingImbalancedDataTableOfContents from './components/HandlingImbalancedDataTableOfContents';
import './styles/global.css';

const BLUE = '#245cff';
const ORANGE = '#e67e22';
const GREEN = '#22995f';
const RED = '#d84a4a';
const PURPLE = '#7654d8';
const GRID = 'rgba(16, 19, 24, 0.14)';

function K({ l, block = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) katex.render(l, ref.current, { throwOnError: false, displayMode: block });
  }, [l, block]);
  return block ? <div ref={ref} style={{ overflowX: 'auto', margin: '0.8rem 0' }} /> : <span ref={ref} />;
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

function Artifact({ title, children }) { return <div className="artifact-card"><h4>{title}</h4>{children}</div>; }

function Control({ label, value, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', minWidth: 145, flex: 1 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem' }}>
        <span>{label}</span><strong style={{ color: BLUE }}>{value}</strong>
      </span>
      {children}
    </label>
  );
}

function Metric({ label, value, color = BLUE, note }) {
  return (
    <div style={{ background: '#fff', padding: '0.85rem 1rem', minWidth: 0 }}>
      <div style={{ color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.66rem' }}>{label}</div>
      <div style={{ color, fontSize: '1.2rem', fontWeight: 700 }}>{value}</div>
      {note && <div style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{note}</div>}
    </div>
  );
}

function MetricGrid({ children, columns = 3 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>{children}</div>;
}

function AccuracyTrap() {
  const [prevalence, setPrevalence] = useState(1);
  const [recall, setRecall] = useState(75);
  const [specificity, setSpecificity] = useState(95);
  const total = 10000;
  const positives = total * prevalence / 100;
  const negatives = total - positives;
  const tp = positives * recall / 100;
  const fn = positives - tp;
  const tn = negatives * specificity / 100;
  const fp = negatives - tn;
  const accuracy = (tp + tn) / total;
  const precision = tp / Math.max(1, tp + fp);
  const f1 = 2 * precision * (recall / 100) / Math.max(0.0001, precision + recall / 100);
  const baseline = negatives / total;
  return (
    <Artifact title="Interactive · The accuracy trap">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="positive prevalence" value={`${prevalence.toFixed(1)}%`}><input aria-label="Positive prevalence" type="range" min="1" max="30" step="0.5" value={prevalence} onChange={event => setPrevalence(Number(event.target.value))} /></Control>
        <Control label="model recall" value={`${recall}%`}><input aria-label="Model recall" type="range" min="0" max="100" value={recall} onChange={event => setRecall(Number(event.target.value))} /></Control>
        <Control label="specificity" value={`${specificity}%`}><input aria-label="Model specificity" type="range" min="70" max="100" value={specificity} onChange={event => setSpecificity(Number(event.target.value))} /></Control>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1.3rem' }}>
        <div style={{ background: '#fff', padding: '1rem' }}><strong style={{ color: GREEN }}>TP {Math.round(tp)}</strong><br /><span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>found rare positives</span></div>
        <div style={{ background: '#fff', padding: '1rem' }}><strong style={{ color: RED }}>FN {Math.round(fn)}</strong><br /><span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>missed positives</span></div>
        <div style={{ background: '#fff', padding: '1rem' }}><strong>FP {Math.round(fp)}</strong><br /><span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>false alarms</span></div>
        <div style={{ background: '#fff', padding: '1rem' }}><strong>TN {Math.round(tn)}</strong><br /><span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>correct negatives</span></div>
      </div>
      <MetricGrid columns={4}>
        <Metric label="accuracy" value={`${(accuracy * 100).toFixed(1)}%`} color={accuracy > baseline ? GREEN : RED} />
        <Metric label="always-negative accuracy" value={`${(baseline * 100).toFixed(1)}%`} color={ORANGE} />
        <Metric label="precision" value={`${(precision * 100).toFixed(1)}%`} color={PURPLE} />
        <Metric label="F1" value={f1.toFixed(3)} color={BLUE} />
      </MetricGrid>
    </Artifact>
  );
}

function PrevalenceStack() {
  const [rate, setRate] = useState(3);
  return (
    <Artifact title="Interactive · Rare means visually tiny">
      <Control label="positive events per 1,000" value={rate}><input aria-label="Rare events per thousand" type="range" min="1" max="100" value={rate} onChange={event => setRate(Number(event.target.value))} /></Control>
      <div style={{ height: 62, display: 'flex', border: `1px solid ${GRID}`, marginTop: '1.3rem', overflow: 'hidden' }}>
        <div style={{ width: `${rate / 10}%`, minWidth: 2, background: RED, transition: 'width .15s' }} title="positive" />
        <div style={{ flex: 1, background: '#dce4ff' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem' }}><span style={{ color: RED }}>{rate} positive</span><span>{1000 - rate} negative</span></div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>Fraud, phishing, churn, and disease may genuinely be rare. First ask whether the observed ratio reflects the population or a biased collection process.</p>
    </Artifact>
  );
}

const MINORITY = [[2.0, 2.0], [2.7, 2.8], [3.25, 1.9], [3.7, 3.2], [4.4, 2.4]];
const MAJORITY = [[0.5, 1.0], [0.8, 2.5], [1.0, 3.7], [1.35, 1.7], [1.45, 4.5], [2.0, 4.2], [2.4, 3.7], [2.8, 4.6], [3.2, 0.7], [3.8, 0.8], [4.3, 1.2], [4.7, 3.8], [5.0, 1.9], [5.3, 3.0], [5.6, 4.4], [0.4, 4.7], [5.7, 0.7], [4.8, 4.8]];
const sx = x => 44 + x / 6 * 566;
const sy = y => 225 - y / 5.4 * 190;

function SamplingExplorer() {
  const [method, setMethod] = useState('original');
  const shownMajority = method === 'under' ? MAJORITY.filter((_, index) => [1, 6, 9, 12, 15].includes(index)) : MAJORITY;
  const duplicates = method === 'over' ? [...MINORITY, ...MINORITY, ...MINORITY] : MINORITY;
  const synthetic = method === 'smote' ? MINORITY.flatMap((point, index) => index < MINORITY.length - 1 ? [[point[0] + 0.45 * (MINORITY[index + 1][0] - point[0]), point[1] + 0.45 * (MINORITY[index + 1][1] - point[1])]] : []) : [];
  return (
    <Artifact title="Interactive · Change only the training sample">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[['original', 'Original'], ['under', 'Undersample'], ['over', 'Oversample'], ['smote', 'SMOTE']].map(([value, label]) => <button key={value} type="button" aria-pressed={method === value} onClick={() => setMethod(value)} style={{ padding: '0.45rem 0.75rem', border: `1px solid ${method === value ? BLUE : GRID}`, background: method === value ? '#eef2ff' : '#fff', color: method === value ? BLUE : 'var(--muted)', cursor: 'pointer' }}>{label}</button>)}
      </div>
      <svg viewBox="0 0 640 260" role="img" aria-label="Class distribution after selected resampling method" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}` }}>
        {[1, 2, 3, 4, 5].map(value => <g key={value}><line x1={sx(value)} y1="35" x2={sx(value)} y2="225" stroke={GRID} /><line x1="44" y1={sy(value)} x2="610" y2={sy(value)} stroke={GRID} /></g>)}
        {shownMajority.map((point, index) => <circle key={`m${index}`} cx={sx(point[0])} cy={sy(point[1])} r="5" fill={BLUE} opacity="0.72" />)}
        {duplicates.map((point, index) => <rect key={`p${index}`} x={sx(point[0]) - 5 - (method === 'over' ? (index % 3 - 1) * 3 : 0)} y={sy(point[1]) - 5 - (method === 'over' ? (index % 3 - 1) * 3 : 0)} width="10" height="10" fill={RED} opacity={method === 'over' && index >= MINORITY.length ? 0.45 : 1} />)}
        {synthetic.map((point, index) => <circle key={`s${index}`} cx={sx(point[0])} cy={sy(point[1])} r="6" fill={ORANGE} stroke="#fff" strokeWidth="2" />)}
      </svg>
      <MetricGrid columns={3}><Metric label="majority training points" value={shownMajority.length} /><Metric label="minority presentations" value={duplicates.length + synthetic.length} color={RED} /><Metric label="new information" value={method === 'under' ? 'discarded' : method === 'over' ? 'none' : method === 'smote' ? 'interpolated' : 'unchanged'} color={method === 'smote' ? ORANGE : PURPLE} /></MetricGrid>
    </Artifact>
  );
}

function SmoteExplorer() {
  const [position, setPosition] = useState(45);
  const [neighbor, setNeighbor] = useState(2);
  const start = MINORITY[0];
  const end = MINORITY[neighbor];
  const t = position / 100;
  const synthetic = [start[0] + t * (end[0] - start[0]), start[1] + t * (end[1] - start[1])];
  return (
    <Artifact title="Interactive · One SMOTE interpolation">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="neighbor" value={`x${neighbor + 1}`}><input aria-label="SMOTE neighbor" type="range" min="1" max="4" value={neighbor} onChange={event => setNeighbor(Number(event.target.value))} /></Control>
        <Control label="interpolation λ" value={t.toFixed(2)}><input aria-label="SMOTE interpolation" type="range" min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} /></Control>
      </div>
      <svg viewBox="0 0 640 250" role="img" aria-label="Synthetic point interpolated between minority neighbors" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        <line x1={sx(start[0])} y1={sy(start[1])} x2={sx(end[0])} y2={sy(end[1])} stroke={ORANGE} strokeWidth="3" strokeDasharray="6 5" />
        {MAJORITY.map((point, index) => <circle key={`m${index}`} cx={sx(point[0])} cy={sy(point[1])} r="5" fill={BLUE} opacity="0.35" />)}
        {MINORITY.map((point, index) => <rect key={`p${index}`} x={sx(point[0]) - 5} y={sy(point[1]) - 5} width="10" height="10" fill={RED} />)}
        <circle cx={sx(synthetic[0])} cy={sy(synthetic[1])} r="8" fill={ORANGE} stroke="#fff" strokeWidth="3" />
      </svg>
      <K block l="x_{new}=x_i+\lambda(x_{zi}-x_i),\qquad 0\leq\lambda\leq1" />
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>SMOTE broadens the minority region without exact duplication. It can also cross into majority territory, especially with overlap or unreliable distances in high dimensions.</p>
    </Artifact>
  );
}

function CostExplorer() {
  const [fnCost, setFnCost] = useState(10);
  const [fpCost, setFpCost] = useState(1);
  const [probability, setProbability] = useState(20);
  const p = probability / 100;
  const negativeCost = p * fnCost;
  const positiveCost = (1 - p) * fpCost;
  const threshold = fpCost / (fpCost + fnCost);
  const decision = positiveCost < negativeCost ? 'flag positive' : 'predict negative';
  return (
    <Artifact title="Interactive · Minimize operational cost">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="false-negative cost" value={fnCost}><input aria-label="False negative cost" type="range" min="1" max="50" value={fnCost} onChange={event => setFnCost(Number(event.target.value))} /></Control>
        <Control label="false-positive cost" value={fpCost}><input aria-label="False positive cost" type="range" min="1" max="20" value={fpCost} onChange={event => setFpCost(Number(event.target.value))} /></Control>
        <Control label="predicted P(positive)" value={`${probability}%`}><input aria-label="Predicted positive probability" type="range" min="1" max="99" value={probability} onChange={event => setProbability(Number(event.target.value))} /></Control>
      </div>
      <MetricGrid columns={3}><Metric label="cost if predict negative" value={negativeCost.toFixed(2)} color={RED} /><Metric label="cost if flag positive" value={positiveCost.toFixed(2)} color={ORANGE} /><Metric label="lower-cost decision" value={decision} color={decision === 'flag positive' ? GREEN : BLUE} note={`optimal threshold ${(threshold * 100).toFixed(1)}%`} /></MetricGrid>
      <K block l="\text{predict positive if }pC_{FN}>(1-p)C_{FP}\quad\Longleftrightarrow\quad p>\frac{C_{FP}}{C_{FP}+C_{FN}}" />
    </Artifact>
  );
}

function WeightedLossExplorer() {
  const [weight, setWeight] = useState(10);
  const [minorityError, setMinorityError] = useState(40);
  const majorityLoss = 100 * 0.08;
  const minorityLoss = 10 * minorityError / 100 * weight;
  return (
    <Artifact title="Interactive · Reweight the training objective">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="minority class weight" value={`${weight}×`}><input aria-label="Minority class weight" type="range" min="1" max="30" value={weight} onChange={event => setWeight(Number(event.target.value))} /></Control>
        <Control label="minority mean loss" value={`${minorityError}%`}><input aria-label="Minority mean loss" type="range" min="5" max="95" value={minorityError} onChange={event => setMinorityError(Number(event.target.value))} /></Control>
      </div>
      <div style={{ display: 'grid', gap: '0.8rem', marginTop: '1.3rem' }}>
        {[['100 majority examples', majorityLoss, BLUE], ['10 minority examples', minorityLoss, RED]].map(([label, value, color]) => <div key={label} style={{ display: 'grid', gridTemplateColumns: '145px 1fr 55px', gap: '0.7rem', alignItems: 'center', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}><span>{label}</span><div style={{ height: 22, background: '#eef0f3' }}><div style={{ height: '100%', width: `${Math.min(100, value / Math.max(majorityLoss, minorityLoss, 1) * 100)}%`, background: color, transition: 'width .15s' }} /></div><strong style={{ color }}>{value.toFixed(1)}</strong></div>)}
      </div>
      <K block l="J(\theta)=\sum_{n=1}^{N}C_{y_n}\,\ell(y_n,f_\theta(x_n))" />
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>Weighting changes gradient influence without duplicating rows. It needs an estimator that supports sample or class weights and weights should be selected inside cross-validation.</p>
    </Artifact>
  );
}

export default function HandlingImbalancedDataApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <header className="ns-header"><div className="container"><div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div><div className="ns-title">Handling Imbalanced Data</div><div className="ns-subtitle">Evaluate rare-event classifiers honestly, reshape only the training signal, and align decisions with the real cost of false positives and false negatives.</div><span className="tag">Rare events · sampling · cost-sensitive learning</span></div></header>

      <div className="container"><div className="ns-layout"><aside className="ns-sidebar"><HandlingImbalancedDataTableOfContents /></aside><main className="ns-content">
        <section id="rare-events" className="ns-section">
          <h2>1. When the Event Is Rare</h2>
          <p>Class imbalance means that labels are not represented equally. A dataset might contain one fraudulent transaction among thousands of legitimate ones, or a tiny fraction of phishing messages among ordinary traffic.</p>
          <PrevalenceStack />
          <p>Imbalance may be real, as with rare fraud, or introduced by collection and selection. Before changing the model, ask whether broader or better sampling would reveal a different population ratio.</p>
        </section>

        <section id="accuracy-trap" className="ns-section">
          <h2>2. Accuracy Can Reward Failure</h2>
          <p>A classifier that always predicts the majority class can report excellent accuracy while finding no positive cases:</p>
          <K block l="\mathrm{Accuracy}=\frac{TP+TN}{TP+TN+FP+FN}" />
          <AccuracyTrap />
          <p>As prevalence falls, even a modest false-positive rate can create many more false alarms than true detections. A single headline accuracy hides that operational reality.</p>
        </section>

        <section id="metrics" className="ns-section">
          <h2>3. Metrics That Expose Minority Performance</h2>
          <K block l="\mathrm{Precision}=\frac{TP}{TP+FP},\qquad \mathrm{Recall}=\frac{TP}{TP+FN},\qquad F_1=2\frac{PR}{P+R}" />
          <table><thead><tr><th>View</th><th>Question answered</th><th>Use</th></tr></thead><tbody><tr><td>Confusion matrix</td><td>Which errors occur, and how many?</td><td>Always inspect counts and rates</td></tr><tr><td>Precision–recall curve</td><td>What detection/alarm trade-off follows the threshold?</td><td>Especially informative for rare positives</td></tr><tr><td>F-score</td><td>How can precision and recall be summarized?</td><td>Choose <K l="\beta" /> to reflect relative importance</td></tr><tr><td>ROC / partial AUC</td><td>How are TPR and FPR traded?</td><td>Use the operational FPR region</td></tr><tr><td>Average precision</td><td>How good is ranking across PR thresholds?</td><td>Compare against prevalence baseline</td></tr></tbody></table>
          <div className="formula-card"><strong>Metric choice is a decision choice.</strong> A fraud review queue may care about precision at a fixed capacity; screening may prioritize recall at an acceptable false-positive rate.</div>
        </section>

        <section id="resampling" className="ns-section">
          <h2>4. Modify the Training Data</h2>
          <p>Sampling methods alter how often each class appears during training. They do not change the real deployment prevalence.</p>
          <SamplingExplorer />
          <p>Balance is a hyperparameter, not a requirement. Try several class ratios inside cross-validation rather than assuming a 1:1 training set is optimal.</p>
        </section>

        <section id="undersampling" className="ns-section">
          <h2>5. Undersampling &amp; Boundary Cleaning</h2>
          <p>Random undersampling retains all <K l="k" /> minority examples and randomly selects <K l="k" /> majority examples. Training becomes cheaper, but potentially useful majority structure is discarded.</p>
          <table><thead><tr><th>Method</th><th>Rule</th><th>Main trade-off</th></tr></thead><tbody><tr><td>Random undersampling</td><td>Remove majority points at random</td><td>Fast, but loses information</td></tr><tr><td>Edited nearest neighbor</td><td>Remove points disagreeing with most neighbors</td><td>Cleans noisy or overlapping regions</td></tr><tr><td>Tomek links</td><td>Find opposite-class mutual nearest neighbors; remove the majority member</td><td>Clarifies an ambiguous boundary</td></tr></tbody></table>
          <p>Use aggressive undersampling only when the majority class is large enough that discarding observations will not erase important modes or boundary cases.</p>
        </section>

        <section id="smote" className="ns-section">
          <h2>6. Oversampling &amp; SMOTE</h2>
          <p>Random oversampling repeats minority examples. It preserves all observations, but repetition can encourage memorization and makes training slower. SMOTE instead interpolates between minority neighbors.</p>
          <SmoteExplorer />
          <table><thead><tr><th></th><th>Benefit</th><th>Risk</th></tr></thead><tbody><tr><td>Random oversampling</td><td>Simple; no majority data loss</td><td>Duplicates carry no new feature variation</td></tr><tr><td>SMOTE</td><td>Creates a denser minority region</td><td>May synthesize overlap or noise</td></tr></tbody></table>
        </section>

        <section id="costs" className="ns-section">
          <h2>7. Unequal Errors Need Unequal Decisions</h2>
          <p>In fraud detection, a missed fraudulent transaction may cost far more than a legitimate transaction sent for review. Cost-sensitive prediction chooses the action with the lower expected loss, not necessarily the class with probability above 0.5.</p>
          <CostExplorer />
          <p>Threshold selection can be separated from model fitting. Calibrated probabilities make the cost calculation meaningful; otherwise tune the threshold directly on validation data using the operational objective.</p>
        </section>

        <section id="weighted-loss" className="ns-section">
          <h2>8. Reweight the Loss</h2>
          <p>Instead of changing the rows, multiply each example’s loss by a class-specific cost. Minority mistakes then produce larger gradient updates:</p>
          <WeightedLossExplorer />
          <p>For an SVM, class-specific <K l="C_y" /> values make margin violations more expensive for one class. In many estimators, a balanced class-weight heuristic starts with weights inversely proportional to class frequency.</p>
        </section>

        <section id="workflow" className="ns-section">
          <h2>9. A Leakage-Safe Workflow</h2>
          <ol><li>Split the original data first, preferably with stratification.</li><li>Keep validation and test sets at their natural class distribution.</li><li>Apply resampling only to each training fold.</li><li>Fit scaling, neighbor methods, SMOTE, and the classifier inside one fold-aware pipeline.</li><li>Tune sampling ratio, class weights, and threshold using the metric tied to deployment.</li><li>Evaluate once on untouched test data and report confusion counts with uncertainty.</li></ol>
          <div className="formula-card"><strong>Never resample before splitting.</strong> Duplicated or synthetic relatives can leak across train and test. Never rebalance the final test set: changing <K l="P(Y)" /> changes precision and destroys the estimate of deployment performance.</div>
        </section>

        <section id="practice" className="ns-section">
          <h2>10. Choosing a Strategy</h2>
          <table><thead><tr><th>Situation</th><th>Useful first move</th></tr></thead><tbody><tr><td>Very large majority dataset</td><td>Moderate undersampling or boundary cleaning</td></tr><tr><td>Limited data; estimator supports weights</td><td>Class-weighted loss</td></tr><tr><td>Sparse minority coverage</td><td>Collect targeted data; cautiously compare SMOTE</td></tr><tr><td>Known asymmetric business costs</td><td>Calibrated probabilities plus cost-based threshold</td></tr><tr><td>Fixed review capacity</td><td>Precision/recall at top <K l="k" /> predictions</td></tr></tbody></table>
          <h3>Common failure modes</h3>
          <ul><li>Declaring success from accuracy alone.</li><li>Using 1:1 resampling without validation.</li><li>Generating synthetic points before the train/test split.</li><li>Assuming SMOTE is safe in high-dimensional or heavily overlapping space.</li><li>Reporting ROC AUC while ignoring the operational false-positive region.</li></ul>
        </section>

        <section id="references" className="ns-section">
          <h2>References &amp; Resources</h2>
          <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
          <p><a href="https://imbalanced-learn.org/stable/" target="_blank" rel="noopener">imbalanced-learn documentation</a> · <a href="https://github.com/scikit-learn-contrib/imbalanced-learn" target="_blank" rel="noopener">imbalanced-learn source</a></p>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Lecture acknowledgement: Piyush Rai.</p>
        </section>
      </main></div></div>

      <footer className="footer"><div className="footer-bg" aria-hidden="true" /><div className="footer-inner"><div className="footer-left"><p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p><p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', opacity: 0.6, fontFamily: 'var(--ff-mono)' }}>Machine Learning Study Guide · Built with React + KaTeX</p></div><p className="footer-copy">© 2026 — SIMA ADLEYBA</p></div></footer>
    </div>
  );
}
