import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import HandlingMissingDataTableOfContents from './components/HandlingMissingDataTableOfContents';
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
function ChoiceButtons({ choices, value, onChange }) { return <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>{choices.map(([id, label]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)} style={{ padding: '0.45rem 0.75rem', border: `1px solid ${value === id ? BLUE : GRID}`, background: value === id ? '#eef2ff' : '#fff', color: value === id ? BLUE : 'var(--muted)', cursor: 'pointer' }}>{label}</button>)}</div>; }

const MECHANISMS = {
  mcar: { title: 'MCAR · unrelated to all data', example: 'A sensor packet is lost because of a random network fault.', observed: 'Missingness does not depend on observed or missing values.', risk: 'Complete cases remain representative, though power is lost.' },
  mar: { title: 'MAR · explained by observed data', example: 'Income is more often missing for younger applicants, and age is observed.', observed: 'Missingness can depend on observed features.', risk: 'Condition on those observed predictors when imputing.' },
  mnar: { title: 'MNAR · depends on the missing value', example: 'Very high earners are less likely to report their income.', observed: 'Missingness depends on the unseen value or outcome.', risk: 'Ordinary imputation may remain biased; sensitivity analysis is needed.' },
};

function MissingnessExplorer() {
  const [mechanism, setMechanism] = useState('mar');
  const item = MECHANISMS[mechanism];
  return <Artifact title="Interactive · What caused the missingness?"><ChoiceButtons choices={[["mcar", "MCAR"], ["mar", "MAR"], ["mnar", "MNAR"]]} value={mechanism} onChange={setMechanism} /><div style={{ border: `1px solid ${GRID}`, background: '#fff', padding: '1.2rem' }}><strong style={{ color: mechanism === 'mnar' ? RED : BLUE }}>{item.title}</strong><p>{item.example}</p><p style={{ color: 'var(--muted)', marginBottom: 0 }}>{item.observed}<br /><strong>Implication:</strong> {item.risk}</p></div></Artifact>;
}

const RAW_ROWS = [
  ['excellent', '3 yrs', 'high', 'safe'], ['fair', '?', 'low', 'risky'], ['fair', '3 yrs', 'high', 'safe'], ['poor', '5 yrs', 'high', 'risky'], ['excellent', '3 yrs', 'low', 'risky'], ['fair', '5 yrs', 'high', 'safe'], ['poor', '?', 'high', 'risky'], ['poor', '5 yrs', 'low', 'safe'], ['fair', '?', 'high', 'safe'],
];

function EncodingExplorer() {
  const [encoding, setEncoding] = useState('explicit');
  const token = encoding === 'explicit' ? 'NaN' : encoding === 'zero' ? '0' : '';
  return <Artifact title="Interactive · Missing is not the number zero"><ChoiceButtons choices={[["explicit", "Explicit NaN"], ["zero", "Encoded as 0"], ["blank", "Blank string"]]} value={encoding} onChange={setEncoding} /><div style={{ overflowX: 'auto' }}><table style={{ margin: 0 }}><thead><tr><th>Applicant</th><th>Term</th><th>Parser sees</th></tr></thead><tbody><tr><td>A</td><td>3 years</td><td>valid category</td></tr><tr><td>B</td><td style={{ color: RED }}>{token || '(empty)'}</td><td>{encoding === 'explicit' ? 'missing marker' : encoding === 'zero' ? 'valid numeric zero' : 'possibly missing text'}</td></tr><tr><td>C</td><td>5 years</td><td>valid category</td></tr></tbody></table></div><p style={{ color: encoding === 'explicit' ? GREEN : RED, fontSize: '0.82rem', marginBottom: 0 }}>{encoding === 'explicit' ? 'Good: the pipeline can detect and handle this value deliberately.' : encoding === 'zero' ? 'Danger: zero may enter distances and dot products as a real measurement.' : 'Danger: different parsers may treat empty text inconsistently.'}</p></Artifact>;
}

function DeletionExplorer() {
  const [missingRate, setMissingRate] = useState(10);
  const [features, setFeatures] = useState(12);
  const rows = 1000;
  const completeRate = (1 - missingRate / 100) ** features;
  const completeRows = Math.round(rows * completeRate);
  return <Artifact title="Interactive · How listwise deletion compounds"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="missing chance per cell" value={`${missingRate}%`}><input aria-label="Missing chance per cell" type="range" min="1" max="40" value={missingRate} onChange={event => setMissingRate(Number(event.target.value))} /></Control><Control label="features checked" value={features}><input aria-label="Features checked for deletion" type="range" min="1" max="40" value={features} onChange={event => setFeatures(Number(event.target.value))} /></Control></div><div style={{ height: 42, display: 'flex', marginTop: '1.3rem', border: `1px solid ${GRID}` }}><div style={{ width: `${completeRate * 100}%`, background: GREEN, transition: 'width .15s' }} /><div style={{ flex: 1, background: '#f6d8d8' }} /></div><MetricGrid><Metric label="complete rows retained" value={`${completeRows} / ${rows}`} color={completeRows > 600 ? GREEN : RED} /><Metric label="rows discarded" value={rows - completeRows} color={RED} /><Metric label="retention formula" value={`${(completeRate * 100).toFixed(1)}%`} color={PURPLE} note={`(1 − ${missingRate / 100})^${features}`} /></MetricGrid></Artifact>;
}

const IMPUTE_DATA = [{ group: 'A', value: 10 }, { group: 'A', value: 12 }, { group: 'A', value: 14 }, { group: 'B', value: 34 }, { group: 'B', value: 38 }, { group: 'B', value: null }];
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; }

function SimpleImputationExplorer() {
  const [method, setMethod] = useState('mean');
  const observed = IMPUTE_DATA.filter(row => row.value !== null).map(row => row.value);
  const groupB = IMPUTE_DATA.filter(row => row.group === 'B' && row.value !== null).map(row => row.value);
  const estimate = method === 'mean' ? observed.reduce((a, b) => a + b, 0) / observed.length : method === 'median' ? median(observed) : groupB.reduce((a, b) => a + b, 0) / groupB.length;
  const completed = [...observed, estimate];
  const mean = completed.reduce((a, b) => a + b, 0) / completed.length;
  const variance = completed.reduce((sum, value) => sum + (value - mean) ** 2, 0) / completed.length;
  return <Artifact title="Interactive · A guess is a modeling choice"><ChoiceButtons choices={[["mean", "Global mean"], ["median", "Global median"], ["group", "Group-conditional"]]} value={method} onChange={setMethod} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(38px, 1fr))', gap: 5, alignItems: 'end', height: 170, borderBottom: `1px solid ${GRID}`, padding: '0 0.5rem' }}>{IMPUTE_DATA.map((row, index) => { const value = row.value ?? estimate; return <div key={index} style={{ display: 'grid', alignItems: 'end', height: '100%', textAlign: 'center' }}><div style={{ height: `${value / 42 * 125}px`, background: row.value === null ? ORANGE : row.group === 'A' ? BLUE : PURPLE, minHeight: 4 }} /><span style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.65rem', paddingTop: 4 }}>{row.value === null ? '?' : value}</span><span style={{ color: 'var(--muted)', fontSize: '0.62rem' }}>{row.group}</span></div>; })}</div><MetricGrid><Metric label="imputed value" value={estimate.toFixed(1)} color={ORANGE} /><Metric label="completed variance" value={variance.toFixed(1)} color={PURPLE} /><Metric label="assumption" value={method === 'group' ? 'group matters' : 'one population'} color={method === 'group' ? GREEN : RED} /></MetricGrid><p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>Global mean and median ignore the visible group structure. Even a sensible point estimate understates uncertainty and can compress variance.</p></Artifact>;
}

const NEIGHBORS = [{ x: 1, y: 12 }, { x: 2, y: 14 }, { x: 3.3, y: 19 }, { x: 5, y: 31 }, { x: 6, y: 35 }, { x: 7.5, y: 39 }];
function KnnImputationExplorer() {
  const [targetX, setTargetX] = useState(4);
  const [k, setK] = useState(3);
  const ranked = [...NEIGHBORS].sort((a, b) => Math.abs(a.x - targetX) - Math.abs(b.x - targetX));
  const selected = ranked.slice(0, k);
  const estimate = selected.reduce((sum, point) => sum + point.y, 0) / k;
  const cx = x => 44 + x / 8 * 566;
  const cy = y => 222 - y / 44 * 180;
  return <Artifact title="Interactive · KNN imputation from observed neighbors"><div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}><Control label="target observed feature" value={targetX.toFixed(1)}><input aria-label="KNN target observed feature" type="range" min="5" max="75" value={targetX * 10} onChange={event => setTargetX(Number(event.target.value) / 10)} /></Control><Control label="neighbors k" value={k}><input aria-label="KNN imputation neighbors" type="range" min="1" max="6" value={k} onChange={event => setK(Number(event.target.value))} /></Control></div><svg viewBox="0 0 640 255" role="img" aria-label="K nearest neighbors used to estimate a missing feature" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>{[1, 2, 3, 4, 5, 6, 7].map(value => <g key={value}><line x1={cx(value)} y1="35" x2={cx(value)} y2="222" stroke={GRID} /><line x1="44" y1={cy(value * 6)} x2="610" y2={cy(value * 6)} stroke={GRID} /></g>)}{NEIGHBORS.map((point, index) => { const chosen = selected.includes(point); return <circle key={index} cx={cx(point.x)} cy={cy(point.y)} r={chosen ? 8 : 5} fill={chosen ? GREEN : BLUE} opacity={chosen ? 1 : 0.35} />; })}<line x1={cx(targetX)} y1="35" x2={cx(targetX)} y2="222" stroke={ORANGE} strokeDasharray="5 4" /><circle cx={cx(targetX)} cy={cy(estimate)} r="8" fill={ORANGE} stroke="#fff" strokeWidth="3" /></svg><K block l="\hat x_{ij}=\frac{1}{k}\sum_{r\in N_k(i)}x_{rj}" /><MetricGrid><Metric label="imputed value" value={estimate.toFixed(1)} color={ORANGE} /><Metric label="nearest range" value={`${Math.min(...selected.map(p => p.x)).toFixed(1)}–${Math.max(...selected.map(p => p.x)).toFixed(1)}`} color={GREEN} /><Metric label="neighbors used" value={k} color={PURPLE} /></MetricGrid></Artifact>;
}

function TreeRoutingExplorer() {
  const [route, setRoute] = useState('low');
  const outcomes = { high: { result: 'continue to Term', risk: 'mixed branch', color: ORANGE }, low: { result: 'predict Risky', risk: 'low/unknown branch', color: RED }, separate: { result: 'missingness leaf', risk: 'learn missing signal', color: PURPLE } };
  const outcome = outcomes[route];
  return <Artifact title="Interactive · Where should a missing split go?"><p style={{ color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.78rem' }}>Applicant: Credit = poor · Income = ? · Term = 5 years</p><ChoiceButtons choices={[["high", "Route with high"], ["low", "Route with low"], ["separate", "Own missing branch"]]} value={route} onChange={setRoute} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: GRID, border: `1px solid ${GRID}` }}><div style={{ padding: '1rem', background: '#fff', textAlign: 'center' }}>Credit<br /><strong>poor</strong></div><div style={{ padding: '1rem', background: '#fff', textAlign: 'center' }}>Income<br /><strong style={{ color: RED }}>?</strong></div><div style={{ padding: '1rem', background: '#fff', textAlign: 'center' }}>Outcome<br /><strong style={{ color: outcome.color }}>{outcome.result}</strong></div></div><p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>A tree can learn the default direction that maximizes training gain, use a surrogate split, or treat missing as a category. The deployed model must repeat exactly that routing rule.</p></Artifact>;
}

function PipelineExplorer() {
  const [testShift, setTestShift] = useState(20);
  const trainMean = 42;
  const testMean = 42 + testShift;
  const leakedMean = (4 * trainMean + testMean) / 5;
  return <Artifact title="Interactive · Leakage changes the learned fill value"><Control label="test-set mean shift" value={`${testShift >= 0 ? '+' : ''}${testShift}`}><input aria-label="Test set mean shift" type="range" min="-30" max="50" value={testShift} onChange={event => setTestShift(Number(event.target.value))} /></Control><MetricGrid><Metric label="train-only imputer" value={trainMean.toFixed(1)} color={GREEN} note="valid for validation/test" /><Metric label="fit on all data" value={leakedMean.toFixed(1)} color={RED} note="test information leaked" /><Metric label="test-set mean" value={testMean.toFixed(1)} color={PURPLE} note="must remain unseen" /></MetricGrid><div className="formula-card"><strong>Correct order:</strong> split → fit imputer on training fold → transform training and validation → fit model. Save the fitted imputer with the model and reuse it at prediction time.</div></Artifact>;
}

export default function HandlingMissingDataApp() {
  return <div style={{ background: 'var(--bg)', minHeight: '100vh' }}><Navbar /><header className="ns-header"><div className="container"><div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div><div className="ns-title">Handling Missing Data</div><div className="ns-subtitle">Diagnose why values are absent, preserve useful observations, and make every deletion, imputation, or native routing rule reproducible at prediction time.</div><span className="tag">Missingness · imputation · leakage-safe pipelines</span></div></header>

  <div className="container"><div className="ns-layout"><aside className="ns-sidebar"><HandlingMissingDataTableOfContents /></aside><main className="ns-content">
    <section id="incomplete" className="ns-section"><h2>1. Data Is Not Always Fully Observed</h2><p>Real datasets contain blanks from non-response, sensor failure, optional fields, and administrative gaps. An incomplete vector can block a dot product, distance, or decision-tree branch:</p><K block l="x_i=(x_{i1},\ldots,?,\ldots,x_{id})" /><div style={{ overflowX: 'auto' }}><table><thead><tr><th>Credit</th><th>Term</th><th>Income</th><th>Outcome</th></tr></thead><tbody>{RAW_ROWS.slice(0, 6).map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell} style={{ color: value === '?' ? RED : undefined, fontWeight: value === '?' ? 700 : undefined }}>{value}</td>)}</tr>)}</tbody></table></div><p>Missingness can occur in training, at prediction time, or both. A usable solution must define behavior for every phase where it can appear.</p></section>

    <section id="mechanisms" className="ns-section"><h2>2. The Missingness Mechanism</h2><p>The pattern of absence determines whether deletion or imputation is plausibly unbiased. Distinguish missing completely at random (MCAR), missing at random conditional on observed features (MAR), and missing not at random (MNAR).</p><MissingnessExplorer /><p>A missingness indicator <K l="M_j=\mathbb{1}[X_j\text{ missing}]" /> can itself contain predictive signal. That signal may be operationally useful, but it can also encode unstable collection practices or sensitive group differences.</p></section>

    <section id="encoding" className="ns-section"><h2>3. Detect &amp; Encode Missing Values</h2><p>Missing values may appear as empty strings, <code>NaN</code>, <code>NA</code>, <code>?</code>, sentinel numbers such as −999, or even zero. Inventory these conventions before modeling.</p><EncodingExplorer /><ul><li>Normalize every known sentinel into one explicit missing representation.</li><li>Check missing rates by feature, row, time period, target, and relevant subgroup.</li><li>Verify whether zero is a valid measurement before treating it as absence.</li></ul></section>

    <section id="deletion" className="ns-section"><h2>4. Delete Rows or Features?</h2><p>Complete-case analysis removes every row with any required field missing. Dropping a feature retains rows but discards that variable’s signal. Both choices can bias the data when absence is systematic.</p><DeletionExplorer /><table><thead><tr><th>Action</th><th>Benefit</th><th>Cost</th></tr></thead><tbody><tr><td>Drop incomplete rows</td><td>Simple; works with any estimator</td><td>Can lose many cases and shift the sample</td></tr><tr><td>Drop sparse features</td><td>Retains all observations</td><td>Removes potentially useful signal</td></tr></tbody></table><p>Deletion also fails to solve missing values arriving at prediction time unless the affected feature was removed globally.</p></section>

    <section id="simple-imputation" className="ns-section"><h2>5. Simple Imputation</h2><p>For numerical features, common baselines use the training mean or median; categorical features use the mode or a dedicated “unknown” category.</p><SimpleImputationExplorer /><p>Imputation is itself a prediction problem. A filled-in value is an estimate, not an observation. Add a missingness indicator when the fact that a value was absent may matter.</p></section>

    <section id="knn-imputation" className="ns-section"><h2>6. KNN &amp; Model-Based Imputation</h2><p>KNN imputation finds similar cases using jointly observed features and averages or votes on the missing coordinate. It can preserve local relationships that global summaries erase.</p><KnnImputationExplorer /><p>Distance must be computed only on comparable observed features, with appropriate scaling. Larger <K l="k" /> is smoother but less local; high-dimensional distance and widespread missingness can make neighbors unreliable. Regression, expectation-maximization, and multiple imputation offer model-based alternatives.</p></section>

    <section id="native" className="ns-section"><h2>7. Algorithms That Handle Missingness Natively</h2><p>Some algorithms can avoid a separate fill-in step. In Naive Bayes, an unobserved feature can be marginalized out:</p><K block l="\sum_{x_j}P(X_j=x_j\mid Y)=1" /><p>The missing factor contributes one, so the remaining observed likelihood terms determine the class. Tree methods may learn a default branch, a surrogate split, or an explicit missing category.</p><TreeRoutingExplorer /></section>

    <section id="pipeline" className="ns-section"><h2>8. The Same Rule at Train &amp; Prediction Time</h2><p>Every statistic used to fill data is a learned parameter. It must be estimated from the training fold only and stored alongside the estimator.</p><PipelineExplorer /><K block l="\widehat\mu_{train}=\frac{1}{|T|}\sum_{i\in T,\,x_{ij}\ observed}x_{ij}" /><p>The pipeline must also define what happens when a whole feature or unexpected category is absent in a production batch.</p></section>

    <section id="pitfalls" className="ns-section"><h2>9. Imputation Pitfalls</h2><ul><li><strong>Impossible values:</strong> unconditional filling can create nonsensical feature combinations across groups.</li><li><strong>Variance compression:</strong> repeated means look more certain than genuine observations.</li><li><strong>MNAR bias:</strong> observed cases may not reveal the missing-value distribution.</li><li><strong>Target leakage:</strong> using outcomes or future information to impute features inflates validation.</li><li><strong>Train–serve skew:</strong> a notebook-only transform may not exist in production.</li></ul><div className="formula-card"><strong>Audit the completed data.</strong> Compare distributions before and after imputation, inspect results by subgroup, flag imputed cells, and test conclusions across plausible methods.</div></section>

    <section id="practice" className="ns-section"><h2>10. Choosing a Strategy</h2><table><thead><tr><th>Situation</th><th>Reasonable starting point</th></tr></thead><tbody><tr><td>Few MCAR rows missing</td><td>Complete-case baseline, with retention reported</td></tr><tr><td>Skewed numerical feature</td><td>Median plus missingness indicator</td></tr><tr><td>Observed features explain absence</td><td>Conditional or model-based imputation</td></tr><tr><td>Strong local feature structure</td><td>Cross-validated KNN imputation</td></tr><tr><td>Tree estimator supports missing values</td><td>Compare native routing against imputation</td></tr><tr><td>Likely MNAR</td><td>Domain model and sensitivity analysis</td></tr></tbody></table><h3>Minimum reporting</h3><ul><li>Missing rates and encodings before cleaning.</li><li>The assumed missingness mechanism and why it is plausible.</li><li>Statistics fitted on training data only.</li><li>Performance and subgroup checks with the full pipeline.</li><li>Sensitivity to deletion and alternative imputation rules.</li></ul></section>

    <section id="references" className="ns-section"><h2>References &amp; Resources</h2><p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p><p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Some lecture slides are adapted from Emily Fox and Carlos Guestrin.</p></section>
  </main></div></div>

  <footer className="footer"><div className="footer-bg" aria-hidden="true" /><div className="footer-inner"><div className="footer-left"><p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p><p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', opacity: 0.6, fontFamily: 'var(--ff-mono)' }}>Machine Learning Study Guide · Built with React + KaTeX</p></div><p className="footer-copy">© 2026 — SIMA ADLEYBA</p></div></footer></div>;
}
