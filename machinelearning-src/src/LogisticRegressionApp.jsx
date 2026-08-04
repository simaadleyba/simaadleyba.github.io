import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import LogisticRegressionTableOfContents from './components/LogisticRegressionTableOfContents';
import './styles/global.css';

const BLUE = '#245cff';
const ORANGE = '#e67e22';
const GREEN = '#22995f';
const RED = '#d84a4a';
const PURPLE = '#7654d8';
const GRID = 'rgba(16, 19, 24, 0.14)';

const sigmoid = value => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, value))));

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

function SigmoidExplorer() {
  const [x, setX] = useState(2);
  const [weight, setWeight] = useState(1.5);
  const [bias, setBias] = useState(-1);
  const score = bias + weight * x;
  const probability = sigmoid(score);
  const odds = probability / (1 - probability);
  const curve = Array.from({ length: 121 }, (_, index) => {
    const input = -6 + index / 120 * 12;
    const value = sigmoid(bias + weight * input);
    const px = 44 + index / 120 * 566;
    const py = 218 - value * 178;
    return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(' ');
  const markerX = 44 + (x + 6) / 12 * 566;
  const markerY = 218 - probability * 178;

  return (
    <Artifact title="Interactive · Sigmoid probability laboratory">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="feature x" value={x.toFixed(1)}><input aria-label="Sigmoid feature value" type="range" min="-6" max="6" step="0.1" value={x} onChange={event => setX(Number(event.target.value))} /></Control>
        <Control label="weight w" value={weight.toFixed(1)}><input aria-label="Sigmoid weight" type="range" min="-4" max="4" step="0.1" value={weight} onChange={event => setWeight(Number(event.target.value))} /></Control>
        <Control label="bias b" value={bias.toFixed(1)}><input aria-label="Sigmoid bias" type="range" min="-5" max="5" step="0.1" value={bias} onChange={event => setBias(Number(event.target.value))} /></Control>
      </div>
      <svg viewBox="0 0 640 250" role="img" aria-label="Logistic sigmoid curve" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[40, 84.5, 129, 173.5, 218].map(y => <line key={y} x1="44" y1={y} x2="610" y2={y} stroke={GRID} />)}
        <line x1="44" y1="129" x2="610" y2="129" stroke={ORANGE} strokeDasharray="5 4" />
        <path d={curve} fill="none" stroke={BLUE} strokeWidth="3" />
        <circle cx={markerX} cy={markerY} r="6" fill={GREEN} stroke="#fff" strokeWidth="2" />
        <line x1={markerX} y1={markerY} x2={markerX} y2="218" stroke={GREEN} strokeDasharray="4 4" />
        <text x="327" y="241" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(16,19,24,.68)">feature x</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="logit z = b + wx" value={score.toFixed(2)} />
        <Metric label="P(Y=1 | x)" value={`${(probability * 100).toFixed(1)}%`} color={probability >= 0.5 ? GREEN : ORANGE} />
        <Metric label="odds" value={`${odds.toFixed(2)} : 1`} color={PURPLE} />
      </div>
    </Artifact>
  );
}

const POSITIVE_POINTS = [[1.2, 1.1], [2.1, 1.4], [3.1, 1.5], [4.2, 2.0], [3.6, 0.8]];
const NEGATIVE_POINTS = [[0.7, 3.2], [1.6, 3.7], [2.5, 3.0], [3.4, 4.2], [4.5, 3.7]];

function BoundaryExplorer() {
  const [w0, setW0] = useState(-1);
  const [w1, setW1] = useState(1.2);
  const [w2, setW2] = useState(-1);
  const toX = value => 45 + value / 5 * 550;
  const toY = value => 225 - value / 5 * 190;
  const yAt = x => (-w0 - w1 * x) / (Math.abs(w2) < 0.05 ? 0.05 : w2);
  const pointScore = point => w0 + w1 * point[0] + w2 * point[1];
  const correct = POSITIVE_POINTS.filter(point => pointScore(point) >= 0).length + NEGATIVE_POINTS.filter(point => pointScore(point) < 0).length;

  return (
    <Artifact title="Interactive · Linear decision boundary">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="bias w₀" value={w0.toFixed(1)}><input aria-label="Boundary bias" type="range" min="-5" max="5" step="0.1" value={w0} onChange={event => setW0(Number(event.target.value))} /></Control>
        <Control label="positive weight w₁" value={w1.toFixed(1)}><input aria-label="Positive feature weight" type="range" min="-3" max="3" step="0.1" value={w1} onChange={event => setW1(Number(event.target.value))} /></Control>
        <Control label="negative weight w₂" value={w2.toFixed(1)}><input aria-label="Negative feature weight" type="range" min="-3" max="3" step="0.1" value={w2} onChange={event => setW2(Number(event.target.value))} /></Control>
      </div>
      <svg viewBox="0 0 640 260" role="img" aria-label="Two-feature logistic regression boundary" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[1, 2, 3, 4].map(value => <g key={value}><line x1={toX(value)} y1="35" x2={toX(value)} y2="225" stroke={GRID} /><line x1="45" y1={toY(value)} x2="595" y2={toY(value)} stroke={GRID} /></g>)}
        <line x1="45" y1="225" x2="595" y2="225" stroke="#101318" />
        <line x1="45" y1="35" x2="45" y2="225" stroke="#101318" />
        <line x1={toX(0)} y1={toY(yAt(0))} x2={toX(5)} y2={toY(yAt(5))} stroke={BLUE} strokeWidth="3" />
        {POSITIVE_POINTS.map((point, index) => <circle key={`p${index}`} cx={toX(point[0])} cy={toY(point[1])} r="6" fill={GREEN} />)}
        {NEGATIVE_POINTS.map((point, index) => <rect key={`n${index}`} x={toX(point[0]) - 5} y={toY(point[1]) - 5} width="10" height="10" fill={RED} />)}
        <text x="320" y="250" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(16,19,24,.68)"># positive word</text>
        <text x="15" y="135" textAnchor="middle" transform="rotate(-90 15 135)" fontFamily="monospace" fontSize="10" fill="rgba(16,19,24,.68)"># negative word</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.8rem', color: 'var(--muted)', fontSize: '0.82rem' }}>
        <span><span style={{ color: GREEN }}>●</span> positive &nbsp; <span style={{ color: RED }}>■</span> negative</span>
        <strong style={{ color: correct >= 8 ? GREEN : ORANGE }}>{correct}/10 correctly separated</strong>
      </div>
    </Artifact>
  );
}

function LossExplorer() {
  const [probability, setProbability] = useState(70);
  const [label, setLabel] = useState(1);
  const p = probability / 100;
  const clipped = Math.max(0.001, Math.min(0.999, p));
  const loss = -(label * Math.log(clipped) + (1 - label) * Math.log(1 - clipped));
  const correctProbability = label ? p : 1 - p;

  return (
    <Artifact title="Interactive · Cross-entropy penalty">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[0, 1].map(value => <button key={value} type="button" aria-pressed={label === value} onClick={() => setLabel(value)} style={{ padding: '0.45rem 0.75rem', border: `1px solid ${label === value ? BLUE : GRID}`, background: label === value ? '#eef2ff' : '#fff', color: label === value ? BLUE : 'var(--muted)', cursor: 'pointer' }}>true y = {value}</button>)}
      </div>
      <Control label="predicted P(Y=1)" value={`${probability}%`}>
        <input aria-label="Predicted positive probability" type="range" min="1" max="99" value={probability} onChange={event => setProbability(Number(event.target.value))} />
      </Control>
      <div style={{ margin: '1.3rem 0', height: 30, display: 'flex', border: `1px solid ${GRID}` }}>
        <div style={{ width: `${probability}%`, background: BLUE, transition: 'width .15s' }} />
        <div style={{ flex: 1, background: '#e5e7eb' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: GRID, border: `1px solid ${GRID}` }}>
        <Metric label="probability assigned to truth" value={`${(correctProbability * 100).toFixed(0)}%`} color={correctProbability >= 0.5 ? GREEN : RED} />
        <Metric label="binary cross-entropy" value={loss.toFixed(3)} color={loss < 0.7 ? GREEN : RED} note={correctProbability < 0.2 ? 'confident mistakes are expensive' : '−log probability of truth'} />
      </div>
    </Artifact>
  );
}

const TRAINING = [
  { x: -2.2, y: 0 }, { x: -1.6, y: 0 }, { x: -1.0, y: 0 }, { x: -0.4, y: 0 },
  { x: 0.2, y: 1 }, { x: 0.8, y: 1 }, { x: 1.5, y: 1 }, { x: 2.2, y: 1 },
];

function runGradient(steps, learningRate) {
  let weight = -1.2;
  let bias = 0.8;
  const path = [{ weight, bias }];
  for (let step = 0; step < steps; step += 1) {
    let gradW = 0;
    let gradB = 0;
    TRAINING.forEach(sample => {
      const prediction = sigmoid(bias + weight * sample.x);
      gradW += (prediction - sample.y) * sample.x;
      gradB += prediction - sample.y;
    });
    weight -= learningRate * gradW / TRAINING.length;
    bias -= learningRate * gradB / TRAINING.length;
    path.push({ weight, bias });
  }
  return path;
}

function modelLoss(weight, bias) {
  return TRAINING.reduce((sum, sample) => {
    const p = Math.max(1e-8, Math.min(1 - 1e-8, sigmoid(bias + weight * sample.x)));
    return sum - sample.y * Math.log(p) - (1 - sample.y) * Math.log(1 - p);
  }, 0) / TRAINING.length;
}

function GradientExplorer() {
  const [steps, setSteps] = useState(12);
  const [learningRate, setLearningRate] = useState(50);
  const rate = learningRate / 100;
  const path = runGradient(steps, rate);
  const final = path[path.length - 1];
  const initialLoss = modelLoss(path[0].weight, path[0].bias);
  const finalLoss = modelLoss(final.weight, final.bias);
  const curve = Array.from({ length: 121 }, (_, index) => {
    const x = -3 + index / 120 * 6;
    const y = sigmoid(final.bias + final.weight * x);
    return `${index === 0 ? 'M' : 'L'} ${44 + index / 120 * 566} ${218 - y * 178}`;
  }).join(' ');

  return (
    <Artifact title="Interactive · Gradient descent training">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="gradient steps" value={steps}><input aria-label="Gradient steps" type="range" min="0" max="60" value={steps} onChange={event => setSteps(Number(event.target.value))} /></Control>
        <Control label="learning rate η" value={rate.toFixed(2)}><input aria-label="Learning rate" type="range" min="5" max="200" step="5" value={learningRate} onChange={event => setLearningRate(Number(event.target.value))} /></Control>
      </div>
      <svg viewBox="0 0 640 250" role="img" aria-label="Logistic curve fitted by gradient descent" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        <line x1="44" y1="218" x2="610" y2="218" stroke="#101318" />
        <line x1="44" y1="129" x2="610" y2="129" stroke={GRID} />
        <path d={curve} fill="none" stroke={BLUE} strokeWidth="3" />
        {TRAINING.map((sample, index) => <circle key={index} cx={44 + (sample.x + 3) / 6 * 566} cy={218 - sample.y * 178} r="5" fill={sample.y ? GREEN : RED} />)}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="weight" value={final.weight.toFixed(2)} />
        <Metric label="bias" value={final.bias.toFixed(2)} color={PURPLE} />
        <Metric label="mean loss" value={finalLoss.toFixed(3)} color={finalLoss < initialLoss ? GREEN : RED} note={`started at ${initialLoss.toFixed(3)}`} />
      </div>
    </Artifact>
  );
}

function RegularizationExplorer() {
  const [penalty, setPenalty] = useState('l2');
  const [strength, setStrength] = useState(1);
  const original = [2.8, -2.2, 1.2, 0.5, -0.15];
  const names = ['awesome', 'awful', 'great', 'length', 'punctuation'];
  const weights = original.map(value => penalty === 'l2'
    ? value / (1 + strength)
    : Math.sign(value) * Math.max(0, Math.abs(value) - strength * 0.7));

  return (
    <Artifact title="Interactive · Weight shrinkage">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['l2', 'l1'].map(option => <button key={option} type="button" aria-pressed={penalty === option} onClick={() => setPenalty(option)} style={{ padding: '0.45rem 0.8rem', border: `1px solid ${penalty === option ? BLUE : GRID}`, background: penalty === option ? '#eef2ff' : '#fff', color: penalty === option ? BLUE : 'var(--muted)', cursor: 'pointer' }}>{option.toUpperCase()}</button>)}
      </div>
      <Control label="regularization strength λ" value={strength.toFixed(1)}><input aria-label="Regularization strength" type="range" min="0" max="4" step="0.1" value={strength} onChange={event => setStrength(Number(event.target.value))} /></Control>
      <div style={{ display: 'grid', gap: '0.65rem', marginTop: '1.2rem' }}>
        {weights.map((weight, index) => (
          <div key={names[index]} style={{ display: 'grid', gridTemplateColumns: '95px 1fr 48px', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.68rem' }}>{names[index]}</span>
            <div style={{ height: 18, background: '#eef0f4', position: 'relative' }}><div style={{ position: 'absolute', left: weight < 0 ? `${50 + weight / 6 * 100}%` : '50%', width: `${Math.abs(weight) / 6 * 100}%`, height: '100%', background: weight < 0 ? RED : BLUE }} /></div>
            <strong style={{ color: weight === 0 ? 'var(--muted)' : weight < 0 ? RED : BLUE, textAlign: 'right', fontFamily: 'var(--ff-mono)', fontSize: '0.7rem' }}>{weight.toFixed(2)}</strong>
          </div>
        ))}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '1rem 0 0' }}>{penalty === 'l1' ? 'L1 applies constant shrinkage and can set weak coefficients exactly to zero.' : 'L2 smoothly shrinks every coefficient while usually retaining all features.'}</p>
    </Artifact>
  );
}

function SoftmaxExplorer() {
  const [logits, setLogits] = useState([0.6, 1.1, -1.5]);
  const max = Math.max(...logits);
  const exps = logits.map(logit => Math.exp(logit - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  const probabilities = exps.map(value => value / total);
  const labels = ['class A', 'class B', 'class C'];
  const colors = [BLUE, GREEN, ORANGE];

  return (
    <Artifact title="Interactive · Softmax scores">
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {logits.map((logit, index) => (
          <Control key={labels[index]} label={`${labels[index]} logit`} value={logit.toFixed(1)}>
            <input aria-label={`${labels[index]} logit`} type="range" min="-4" max="4" step="0.1" value={logit} onChange={event => setLogits(current => current.map((value, currentIndex) => currentIndex === index ? Number(event.target.value) : value))} />
          </Control>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {probabilities.map((probability, index) => <Metric key={labels[index]} label={labels[index]} value={`${(probability * 100).toFixed(1)}%`} color={colors[index]} />)}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.8rem 0 0' }}>Subtracting the largest logit before exponentiating preserves the probabilities while preventing numerical overflow.</p>
    </Artifact>
  );
}

export default function LogisticRegressionApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div>
          <div className="ns-title">Logistic Regression</div>
          <div className="ns-subtitle">A linear classifier that learns class probabilities directly through a sigmoid, conditional likelihood, and cross-entropy loss.</div>
          <span className="tag">Linear logits · probability · convex optimization</span>
        </div>
      </header>

      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar"><LogisticRegressionTableOfContents /></aside>
          <main className="ns-content">
            <section id="discriminative" className="ns-section">
              <h2>1. A Discriminative Model</h2>
              <p>Naive Bayes models <K l="P(X\mid Y)" /> and uses Bayes’ rule. Logistic regression models <K l="P(Y\mid X)" /> directly, spending its parameters on the decision boundary rather than the feature distribution.</p>
              <table>
                <thead><tr><th></th><th>Generative</th><th>Discriminative</th></tr></thead>
                <tbody>
                  <tr><td><strong>Example</strong></td><td>Naive Bayes</td><td>Logistic Regression</td></tr>
                  <tr><td><strong>Learns</strong></td><td><K l="P(X\mid Y), P(Y)" /></td><td><K l="P(Y\mid X)" /></td></tr>
                  <tr><td><strong>Geometry</strong></td><td>Class density models</td><td>Decision boundary</td></tr>
                </tbody>
              </table>
            </section>

            <section id="linear-score" className="ns-section">
              <h2>2. Linear Scores</h2>
              <p>A feature vector receives a weighted score:</p>
              <K block l="z=w_0+\sum_{i=1}^{d}w_ix_i=w^Tx+b" />
              <p>In sentiment analysis, positive words receive positive weights and negative words receive negative weights. The score is additive: a document with two “awesome” tokens and one “awful” token might receive <K l="2w_{awesome}+w_{awful}+b" />.</p>
              <div className="formula-card"><strong>Interpretation:</strong> increasing <K l="x_i" /> by one changes the log-odds by <K l="w_i" /> and multiplies the odds by <K l="e^{w_i}" />, holding other features fixed.</div>
            </section>

            <section id="sigmoid" className="ns-section">
              <h2>3. From Score to Probability</h2>
              <p>A raw linear score ranges over all real numbers. The sigmoid maps it smoothly into <K l="(0,1)" />:</p>
              <K block l="P(Y=1\mid X=x)=\sigma(z)=\frac{1}{1+e^{-z}}\qquad z=w^Tx+b" />
              <K block l="\log\frac{P(Y=1\mid x)}{1-P(Y=1\mid x)}=w^Tx+b" />
              <SigmoidExplorer />
            </section>

            <section id="boundary" className="ns-section">
              <h2>4. The Decision Boundary</h2>
              <p>At probability 0.5, the logit is zero. In two dimensions the boundary is a line; in three it is a plane; in higher dimensions it is a hyperplane.</p>
              <K block l="w_0+w_1x_1+w_2x_2=0" />
              <BoundaryExplorer />
              <p>The bias shifts the line parallel to itself. Changing feature coefficients rotates it. Scaling every coefficient by the same positive constant keeps the boundary fixed but makes the sigmoid steeper and probabilities more extreme.</p>
            </section>

            <section id="likelihood" className="ns-section">
              <h2>5. Conditional Likelihood &amp; Cross-Entropy</h2>
              <p>Training selects weights that assign high probability to every observed label. Maximizing conditional log-likelihood is equivalent to minimizing binary cross-entropy:</p>
              <K block l="\mathcal{L}(w)=-\sum_{i=1}^{N}\left[y_i\log p_i+(1-y_i)\log(1-p_i)\right]" />
              <LossExplorer />
              <p>When <K l="y=1" />, loss is <K l="-\log p" />; when <K l="y=0" />, it is <K l="-\log(1-p)" />. Confident correct predictions approach zero loss, while confident mistakes receive an unbounded penalty.</p>
            </section>

            <section id="optimization" className="ns-section">
              <h2>6. Gradient Descent</h2>
              <p>Logistic regression has no closed-form weight solution. Its negative log-likelihood is convex, so any local minimum is global. Batch gradient descent updates each feature weight through the residual:</p>
              <K block l="w_i^{(t+1)}=w_i^{(t)}-\eta\sum_jx_i^j\left(\hat p_j-y_j\right)" />
              <GradientExplorer />
              <p>A small learning rate converges slowly. A very large one can overshoot and oscillate. The sigmoid derivative <K l="\sigma'(z)=\sigma(z)(1-\sigma(z))" /> helps derive the update, while the cross-entropy combination simplifies the final residual to <K l="\hat p-y" />.</p>
            </section>

            <section id="regularization" className="ns-section">
              <h2>7. Why Regularize?</h2>
              <p>On perfectly separable data, increasing every weight magnitude makes predictions approach 0 and 1 without moving the boundary. Unregularized MLE can therefore push <K l="\|w\|\to\infty" />.</p>
              <p>A zero-mean Gaussian prior on weights produces an L2 penalty under MAP estimation:</p>
              <K block l="\arg\max_w\left[\log P(Y\mid X,w)-\frac{1}{2\sigma^2}\sum_jw_j^2\right]" />
              <K block l="\text{cost}=\text{cross-entropy}+\lambda\,\text{complexity penalty}" />
              <p>Regularization trades training fit for smaller, more stable coefficients. Features must be scaled consistently, and preprocessing parameters must be fitted on training data only.</p>
            </section>

            <section id="l1-l2" className="ns-section">
              <h2>8. L1 vs L2 Regularization</h2>
              <table>
                <thead><tr><th>Penalty</th><th>Form</th><th>Effect</th></tr></thead>
                <tbody>
                  <tr><td>L2 / Ridge</td><td><K l="\lambda\sum_jw_j^2" /></td><td>Smoothly shrinks all weights; rarely produces exact zeros</td></tr>
                  <tr><td>L1 / LASSO</td><td><K l="\lambda\sum_j|w_j|" /></td><td>Encourages sparse weights and implicit feature selection</td></tr>
                </tbody>
              </table>
              <RegularizationExplorer />
              <p>In scikit-learn, <K l="C" /> is inverse regularization strength: smaller <K l="C" /> means stronger shrinkage.</p>
            </section>

            <section id="softmax" className="ns-section">
              <h2>9. Multiclass Softmax Regression</h2>
              <p>For <K l="K>2" /> classes, logistic regression keeps one weight vector per class. Their real-valued scores, or logits, become a probability vector through softmax:</p>
              <K block l="P(Y=k\mid x,W)=\frac{e^{w_k^Tx}}{\sum_{j=1}^{K}e^{w_j^Tx}}" />
              <SoftmaxExplorer />
              <K block l="\mathcal{L}_{multi}=-\frac{1}{N}\sum_{i=1}^{N}\sum_{k=1}^{K}y_k^{(i)}\log\hat y_k^{(i)}" />
            </section>

            <section id="practice" className="ns-section">
              <h2>10. Practice, Strengths &amp; Limits</h2>
              <h3>Strengths</h3>
              <ul>
                <li>Fast <K l="O(d)" /> predictions with a natural probabilistic output.</li>
                <li>Convex training objective and straightforward regularization.</li>
                <li>Coefficients expose direction and strength of feature influence on log-odds.</li>
                <li>Extends directly to multiclass classification through softmax.</li>
              </ul>
              <h3>Limitations</h3>
              <ul>
                <li>The native boundary is linear. XOR-like structure requires transformed or interaction features, kernels, or nonlinear models.</li>
                <li>Coefficients are not comparable when feature scales differ.</li>
                <li>Separation, multicollinearity, class imbalance, and distribution shift can destabilize estimates or calibration.</li>
              </ul>
            </section>

            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Lecture acknowledgements include Jeff Howbert, Carlos Guestrin, Emily Fox, Richard Zemel, Raquel Urtasun, Sanja Fidler, and Leila Wehbe.</p>
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
