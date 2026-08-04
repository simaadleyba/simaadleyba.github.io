import { useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import NaiveBayesTableOfContents from './components/NaiveBayesTableOfContents';
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
  return <div className="artifact-card"><h4>{title}</h4>{children}</div>;
}

function Control({ label, value, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', minWidth: 150, flex: 1 }}>
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
      <div style={{ color, fontSize: '1.2rem', fontWeight: 700, overflowWrap: 'anywhere' }}>{value}</div>
      {note && <div style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{note}</div>}
    </div>
  );
}

function ParameterExplorer() {
  const [features, setFeatures] = useState(10);
  const direct = Math.pow(2, features);
  const naive = 2 * features + 1;
  const ratio = direct / naive;
  const directWidth = 100;
  const naiveWidth = Math.max(1.5, Math.log10(naive + 1) / Math.log10(direct + 1) * 100);

  return (
    <Artifact title="Interactive · Parameter explosion">
      <Control label="binary features (n)" value={features}>
        <input aria-label="Number of binary features" type="range" min="1" max="30" value={features} onChange={event => setFeatures(Number(event.target.value))} />
      </Control>
      <div style={{ display: 'grid', gap: '1rem', margin: '1.4rem 0' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}><span>full table</span><strong>{direct.toLocaleString()}</strong></div>
          <div style={{ height: 28, background: '#eef0f4', marginTop: 5 }}><div style={{ width: `${directWidth}%`, height: '100%', background: ORANGE }} /></div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}><span>Naive Bayes</span><strong>{naive.toLocaleString()}</strong></div>
          <div style={{ height: 28, background: '#eef0f4', marginTop: 5 }}><div style={{ width: `${naiveWidth}%`, height: '100%', background: BLUE }} /></div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${GRID}`, paddingTop: '0.8rem', color: 'var(--muted)', fontSize: '0.82rem' }}>
        The direct conditional table is <strong style={{ color: ORANGE }}>{ratio.toLocaleString(undefined, { maximumFractionDigits: 0 })}×</strong> larger. At 30 features it requires more than a billion rows; Naive Bayes needs only 61 independent Bernoulli parameters including the class prior.
      </div>
    </Artifact>
  );
}

const TENNIS = {
  outlook: { values: ['sunny', 'overcast', 'rain'], yes: [2, 4, 3], no: [3, 0, 2] },
  temperature: { values: ['hot', 'mild', 'cool'], yes: [2, 4, 3], no: [2, 2, 1] },
  humidity: { values: ['high', 'normal'], yes: [3, 6], no: [4, 1] },
  wind: { values: ['strong', 'weak'], yes: [3, 6], no: [3, 2] },
};

function TennisExplorer() {
  const [selection, setSelection] = useState({ outlook: 'sunny', temperature: 'cool', humidity: 'high', wind: 'strong' });
  const [alpha, setAlpha] = useState(0);
  const classCounts = { yes: 9, no: 5 };
  const scores = ['yes', 'no'].map(label => {
    const prior = classCounts[label] / 14;
    const terms = Object.entries(TENNIS).map(([feature, spec]) => {
      const index = spec.values.indexOf(selection[feature]);
      return (spec[label][index] + alpha) / (classCounts[label] + alpha * spec.values.length);
    });
    const logScore = Math.log(prior) + terms.reduce((sum, value) => sum + Math.log(Math.max(value, 1e-300)), 0);
    return { label, prior, terms, logScore, raw: Math.exp(logScore) };
  });
  const maxLog = Math.max(...scores.map(score => score.logScore));
  const normalized = scores.map(score => ({ ...score, weight: Math.exp(score.logScore - maxLog) }));
  const weightSum = normalized.reduce((sum, score) => sum + score.weight, 0);
  const result = normalized.map(score => ({ ...score, posterior: score.weight / weightSum }));
  const winner = result[0].posterior > result[1].posterior ? 'Play = Yes' : 'Play = No';

  return (
    <Artifact title="Interactive · Should we play tennis?">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.8rem' }}>
        {Object.entries(TENNIS).map(([feature, spec]) => (
          <label key={feature} style={{ display: 'grid', gap: 4, color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}>
            {feature}
            <select aria-label={feature} value={selection[feature]} onChange={event => setSelection(current => ({ ...current, [feature]: event.target.value }))} style={{ width: '100%', padding: '0.55rem', background: '#fff', border: `1px solid ${GRID}`, color: 'var(--text)' }}>
              {spec.values.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Control label="Laplace pseudocount (α)" value={alpha}>
          <input aria-label="Tennis smoothing" type="range" min="0" max="3" step="1" value={alpha} onChange={event => setAlpha(Number(event.target.value))} />
        </Control>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {result.map(score => (
          <Metric key={score.label} label={`P(${score.label} | x)`} value={`${(score.posterior * 100).toFixed(1)}%`} color={score.label === 'yes' ? GREEN : RED} note={`log-score ${Number.isFinite(score.logScore) ? score.logScore.toFixed(2) : '−∞'}`} />
        ))}
      </div>
      <p style={{ margin: '0.9rem 0 0' }}>Prediction: <strong style={{ color: winner.endsWith('Yes') ? GREEN : RED }}>{winner}</strong>. Try “overcast” with <K l="\alpha=0" /> to see a zero conditional probability eliminate the No class.</p>
    </Artifact>
  );
}

const VOCAB = ['goal', 'tutor', 'variance', 'speed', 'drink', 'defence', 'performance', 'field'];
const TEXT_COUNTS = {
  sport: [7, 1, 2, 6, 2, 8, 7, 6],
  informatics: [1, 8, 7, 2, 1, 1, 8, 2],
};

function TextClassifier() {
  const [text, setText] = useState('goal speed field performance');
  const [model, setModel] = useState('multinomial');
  const [alpha, setAlpha] = useState(1);
  const tokens = useMemo(() => text.toLowerCase().match(/[a-z]+/g) || [], [text]);
  const vector = VOCAB.map(word => tokens.filter(token => token === word).length);
  const classDocs = { sport: 6, informatics: 5 };
  const scores = ['sport', 'informatics'].map(label => {
    const counts = TEXT_COUNTS[label];
    let logScore = Math.log(classDocs[label] / 11);
    if (model === 'multinomial') {
      const total = counts.reduce((sum, count) => sum + count, 0);
      vector.forEach((count, index) => {
        const probability = (counts[index] + alpha) / (total + alpha * VOCAB.length);
        logScore += count * Math.log(Math.max(probability, 1e-300));
      });
    } else {
      vector.forEach((count, index) => {
        const probability = Math.min(0.999999, (counts[index] + alpha) / (classDocs[label] + 2 * alpha));
        logScore += Math.log(Math.max(count > 0 ? probability : 1 - probability, 1e-300));
      });
    }
    return { label, logScore };
  });
  const maxLog = Math.max(...scores.map(score => score.logScore));
  const weights = scores.map(score => Math.exp(score.logScore - maxLog));
  const totalWeight = weights[0] + weights[1];
  const posteriors = scores.map((score, index) => ({ ...score, posterior: weights[index] / totalWeight }));
  const winner = posteriors[0].posterior > posteriors[1].posterior ? 'sport' : 'informatics';

  return (
    <Artifact title="Interactive · Bag-of-words classifier">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['bernoulli', 'multinomial'].map(option => (
          <button key={option} type="button" aria-pressed={model === option} onClick={() => setModel(option)} style={{ padding: '0.45rem 0.75rem', border: `1px solid ${model === option ? BLUE : GRID}`, background: model === option ? '#eef2ff' : '#fff', color: model === option ? BLUE : 'var(--muted)', cursor: 'pointer' }}>{option}</button>
        ))}
      </div>
      <label style={{ display: 'grid', gap: 5, color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}>
        document
        <textarea aria-label="Document text" rows="3" value={text} onChange={event => setText(event.target.value)} style={{ width: '100%', resize: 'vertical', padding: '0.75rem', border: `1px solid ${GRID}`, background: '#fff', color: 'var(--text)', font: 'inherit', lineHeight: 1.5 }} />
      </label>
      <div style={{ marginTop: '0.9rem' }}>
        <Control label="smoothing (α)" value={alpha.toFixed(1)}>
          <input aria-label="Text smoothing" type="range" min="0" max="3" step="0.5" value={alpha} onChange={event => setAlpha(Number(event.target.value))} />
        </Control>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '1rem 0' }}>
        {VOCAB.map((word, index) => <span key={word} style={{ padding: '0.25rem 0.45rem', background: vector[index] ? '#eef2ff' : '#f0f1f3', color: vector[index] ? BLUE : 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}>{word}:{model === 'bernoulli' ? Number(vector[index] > 0) : vector[index]}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: GRID, border: `1px solid ${GRID}` }}>
        {posteriors.map(score => <Metric key={score.label} label={score.label} value={`${(score.posterior * 100).toFixed(1)}%`} color={score.label === winner ? GREEN : 'var(--muted)'} note={`log-score ${score.logScore.toFixed(2)}`} />)}
      </div>
      <p style={{ margin: '0.8rem 0 0' }}>Predicted topic: <strong style={{ color: GREEN }}>{winner}</strong>. Bernoulli uses presence and absence; Multinomial preserves repeated word counts.</p>
    </Artifact>
  );
}

function gaussian(x, mean, sigma) {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
}

function GaussianExplorer() {
  const [measurement, setMeasurement] = useState(48);
  const [healthyPrior, setHealthyPrior] = useState(80);
  const models = [
    { label: 'healthy', mean: 36, sigma: 6, prior: healthyPrior / 100, color: GREEN },
    { label: 'diabetes', mean: 52, sigma: 7, prior: 1 - healthyPrior / 100, color: RED },
  ];
  const evaluated = models.map(model => ({ ...model, likelihood: gaussian(measurement, model.mean, model.sigma) }));
  const evidence = evaluated.reduce((sum, model) => sum + model.likelihood * model.prior, 0);
  const results = evaluated.map(model => ({ ...model, posterior: model.likelihood * model.prior / evidence }));
  const winner = results[0].posterior > results[1].posterior ? 'healthy' : 'diabetes';
  const curvePath = model => Array.from({ length: 121 }, (_, index) => {
    const xValue = 15 + index / 120 * 60;
    const x = 42 + index / 120 * 570;
    const y = 220 - gaussian(xValue, model.mean, model.sigma) * 2200;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');

  return (
    <Artifact title="Interactive · Gaussian Naive Bayes diagnosis">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Control label="measurement x" value={measurement}>
          <input aria-label="Patient measurement" type="range" min="20" max="70" value={measurement} onChange={event => setMeasurement(Number(event.target.value))} />
        </Control>
        <Control label="P(healthy)" value={`${healthyPrior}%`}>
          <input aria-label="Healthy class prior" type="range" min="10" max="90" value={healthyPrior} onChange={event => setHealthyPrior(Number(event.target.value))} />
        </Control>
      </div>
      <svg viewBox="0 0 640 250" role="img" aria-label="Healthy and diabetes class conditional Gaussian curves" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[60, 110, 160, 210].map(y => <line key={y} x1="42" y1={y} x2="612" y2={y} stroke={GRID} />)}
        <line x1="42" y1="220" x2="612" y2="220" stroke="#101318" />
        {models.map(model => <path key={model.label} d={curvePath(model)} fill="none" stroke={model.color} strokeWidth="3" />)}
        <line x1={42 + (measurement - 15) / 60 * 570} y1="22" x2={42 + (measurement - 15) / 60 * 570} y2="220" stroke={BLUE} strokeWidth="2" strokeDasharray="6 4" />
        <text x={42 + (measurement - 15) / 60 * 570} y="17" textAnchor="middle" fill={BLUE} fontFamily="monospace" fontSize="10">x={measurement}</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        {results.map(result => <Metric key={result.label} label={`P(${result.label} | x)`} value={`${(result.posterior * 100).toFixed(1)}%`} color={result.color} note={`density ${result.likelihood.toFixed(4)} · prior ${(result.prior * 100).toFixed(0)}%`} />)}
      </div>
      <p style={{ margin: '0.8rem 0 0' }}>Prediction: <strong style={{ color: winner === 'healthy' ? GREEN : RED }}>{winner}</strong>. Each class has its own mean and variance; the prior can move the boundary.</p>
    </Artifact>
  );
}

export default function NaiveBayesApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div>
          <div className="ns-title">Naive Bayes</div>
          <div className="ns-subtitle">A fast probabilistic classifier that replaces an impossible joint distribution with simple class-conditional feature models.</div>
          <span className="tag">Bayes rule · conditional independence · generative classification</span>
        </div>
      </header>

      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar"><NaiveBayesTableOfContents /></aside>
          <main className="ns-content">
            <section id="bayes-optimal" className="ns-section">
              <h2>1. Bayes Optimal Classifier</h2>
              <p>A classifier maps features <K l="X" /> to a target class <K l="Y" />. If the posterior distribution were known exactly, the minimum-error decision is to choose its largest entry:</p>
              <K block l="y^*=\arg\max_{y_k}P(Y=y_k\mid X=x)" />
              <p>Bayes’ rule expresses this posterior through a class-conditional likelihood and a prior:</p>
              <K block l="P(Y=y_k\mid X=x)=\frac{P(X=x\mid Y=y_k)P(Y=y_k)}{\sum_jP(X=x\mid Y=y_j)P(Y=y_j)}" />
              <p>For classification, the denominator is shared by every class, so comparing the unnormalized numerators is sufficient.</p>
            </section>

            <section id="parameter-problem" className="ns-section">
              <h2>2. The Parameter Problem</h2>
              <p>With <K l="n" /> Boolean features, directly tabulating <K l="P(Y\mid X_1,\ldots,X_n)" /> requires a row for every feature assignment: <K l="2^n" /> rows for a binary target. Most configurations will never appear when the sample is small relative to that table.</p>
              <ParameterExplorer />
              <p>Bayes’ rule alone does not solve this: the full likelihood <K l="P(X_1,\ldots,X_n\mid Y)" /> is still exponential. The decisive simplification is an independence assumption.</p>
            </section>

            <section id="assumption" className="ns-section">
              <h2>3. The “Naive” Assumption</h2>
              <p>Naive Bayes assumes features are conditionally independent once the class is known:</p>
              <K block l="P(X_1,\ldots,X_n\mid Y)=\prod_{i=1}^{n}P(X_i\mid Y)" />
              <p>Fever and cough may be associated in the population, but after conditioning on whether a patient has influenza, the model treats their remaining variation as independent.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', margin: '1.4rem 0', textAlign: 'center' }}>
                <div style={{ padding: '1rem', border: `1px solid ${GRID}`, background: '#fff' }}>Fever <K l="X_1" /></div>
                <div style={{ display: 'grid', gap: 5 }}><span style={{ color: BLUE }}>↖</span><strong style={{ color: BLUE }}>Flu Y</strong><span style={{ color: BLUE }}>↘</span></div>
                <div style={{ padding: '1rem', border: `1px solid ${GRID}`, background: '#fff' }}>Cough <K l="X_2" /></div>
              </div>
              <K block l="y^*=\arg\max_{y_k}P(Y=y_k)\prod_iP(X_i=x_i\mid Y=y_k)" />
            </section>

            <section id="categorical" className="ns-section">
              <h2>4. Categorical Naive Bayes</h2>
              <p>For each class and categorical feature, training stores relative frequencies. The classic tennis dataset contains nine Play=Yes days and five Play=No days, with weather counts estimated separately within each class.</p>
              <K block l="P(X_i=v\mid Y=y_k)=\frac{\operatorname{count}(X_i=v,Y=y_k)}{\operatorname{count}(Y=y_k)}" />
              <TennisExplorer />
            </section>

            <section id="underflow" className="ns-section">
              <h2>5. Compute Scores in Log Space</h2>
              <p>Multiplying hundreds or thousands of probabilities can underflow to exact zero. Sum logarithms instead:</p>
              <K block l="\log\left[P(Y=y_k)\prod_iP(X_i\mid Y=y_k)\right]=\log P(Y=y_k)+\sum_i\log P(X_i\mid Y=y_k)" />
              <p>The logarithm preserves ordering, so the class with the largest product also has the largest log-score. For normalized probabilities, subtract the largest log-score before exponentiating.</p>
              <div className="formula-card"><strong>Practical rule:</strong> train with counts, classify with log-probabilities, and normalize only when a posterior value is actually needed.</div>
            </section>

            <section id="text" className="ns-section">
              <h2>6. Naive Bayes for Text</h2>
              <p>Bag-of-words models discard word order and represent a document over a fixed vocabulary. This makes spam detection, sentiment, document type, and topic classification tractable.</p>
              <table>
                <thead><tr><th>Model</th><th>Feature</th><th>How absence behaves</th></tr></thead>
                <tbody>
                  <tr><td>Bernoulli</td><td>Binary presence <K l="X_t\in\{0,1\}" /></td><td>Absent words contribute <K l="1-P(w_t\mid y)" /></td></tr>
                  <tr><td>Multinomial</td><td>Integer count <K l="X_t\geq0" /></td><td>Absent words have exponent zero and contribute 1</td></tr>
                </tbody>
              </table>
              <TextClassifier />
            </section>

            <section id="smoothing" className="ns-section">
              <h2>7. Add-One Smoothing</h2>
              <p>An unseen word has MLE probability zero. In a product, one zero erases all other evidence for that class. Laplace smoothing adds a pseudocount <K l="\alpha" />:</p>
              <K block l="P(w_t\mid Y=y_k)=\frac{\alpha+\operatorname{count}(w_t,y_k)}{|V|\alpha+\sum_{t'}\operatorname{count}(w_{t'},y_k)}" />
              <p>With <K l="\alpha=1" />, every vocabulary term starts with one virtual observation. This is a MAP estimate under a symmetric Dirichlet prior and guarantees nonzero likelihoods.</p>
            </section>

            <section id="gaussian" className="ns-section">
              <h2>8. Gaussian Naive Bayes</h2>
              <p>For continuous features, exact-value frequency counts are not useful. Gaussian Naive Bayes fits a separate one-dimensional Gaussian for every feature–class pair:</p>
              <K block l="P(X_i=x\mid Y=y_k)=\frac{1}{\sqrt{2\pi\sigma_{ik}^2}}\exp\left[-\frac{(x-\mu_{ik})^2}{2\sigma_{ik}^2}\right]" />
              <K block l="\hat\mu_{ik}=\frac{1}{N_k}\sum_{j:Y_j=y_k}X_i^j\qquad\hat\sigma_{ik}^2=\frac{1}{N_k}\sum_{j:Y_j=y_k}(X_i^j-\hat\mu_{ik})^2" />
              <GaussianExplorer />
              <p>With many continuous features, the diagonal independence assumption replaces a full covariance matrix containing <K l="O(d^2)" /> parameters with per-feature means and variances. That can make very high-dimensional problems, including voxel-based brain imaging, learnable.</p>
            </section>

            <section id="missing" className="ns-section">
              <h2>9. Missing Values</h2>
              <p>If feature <K l="X_j" /> is missing for a test example, Naive Bayes can omit its factor rather than impute it:</p>
              <K block l="P(X_{observed}\mid Y)=\prod_{i\neq j}P(X_i\mid Y)" />
              <p>This follows from marginalization. Summing the missing feature over all its possible values contributes one:</p>
              <K block l="\sum_{x_j}P(X_j=x_j\mid Y)=1" />
              <div style={{ borderLeft: `3px solid ${BLUE}`, padding: '0.8rem 1rem', background: '#eef2ff' }}>The same logic works during prediction only when the model’s feature likelihoods and missingness assumptions remain appropriate. Missingness itself can sometimes carry information and deserve an indicator feature.</div>
            </section>

            <section id="practice" className="ns-section">
              <h2>10. Practice, Strengths &amp; Limits</h2>
              <h3>Why it remains useful</h3>
              <ul>
                <li>Training, storage, and prediction are fast; summary counts support cheap incremental updates.</li>
                <li>It naturally supports multiple classes and can mix categorical, Bernoulli, multinomial, and Gaussian features.</li>
                <li>Irrelevant features with similar class-conditional distributions tend to cancel in score comparisons.</li>
                <li>It is a dependable baseline for high-dimensional text problems.</li>
              </ul>
              <h3>The important caveat</h3>
              <p>Real features are rarely conditionally independent. Correlated evidence is effectively counted more than once, so Naive Bayes posteriors may be badly overconfident even when the class ranking is correct. Evaluate discrimination and calibration separately.</p>
              <table>
                <thead><tr><th>Remember</th><th>Consequence</th></tr></thead>
                <tbody>
                  <tr><td>Correct independence assumptions</td><td>Bayes-optimal decision within the modeled distributions</td></tr>
                  <tr><td>Violated independence</td><td>Classification may remain good; probability estimates can be unreliable</td></tr>
                  <tr><td>Streaming data</td><td>Store raw class/feature counts and update them per new example</td></tr>
                </tbody>
              </table>
            </section>

            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Lecture acknowledgements include Tom Mitchell, Alex Smola, Aarti Singh, Victor Lavrenko, Richard Zemel, Raquel Urtasun, and Sanja Fidler.</p>
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
