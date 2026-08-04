import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import LinearRegressionTableOfContents from './components/LinearRegressionTableOfContents';
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

const HOUSE_DATA = [[0.8, 1.4], [1.2, 1.8], [1.7, 2.5], [2.1, 2.6], [2.8, 3.6], [3.2, 3.7], [3.9, 4.7], [4.5, 4.9], [5.1, 6.0], [5.6, 6.2]];
const px = x => 44 + x / 6.2 * 566;
const py = y => 228 - y / 7 * 195;

function LineFitter() {
  const [intercept, setIntercept] = useState(60);
  const [slope, setSlope] = useState(95);
  const [outlier, setOutlier] = useState(0);
  const b = intercept / 100;
  const m = slope / 100;
  const points = HOUSE_DATA.map((point, index) => index === 8 ? [point[0], point[1] + outlier / 10] : point);
  const errors = points.map(([x, y]) => y - (b + m * x));
  const mse = errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length;
  return (
    <Artifact title="Interactive · Fit the house-price line">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="intercept w₀" value={b.toFixed(2)}><input aria-label="Line intercept" type="range" min="-50" max="200" value={intercept} onChange={event => setIntercept(Number(event.target.value))} /></Control>
        <Control label="slope w₁" value={m.toFixed(2)}><input aria-label="Line slope" type="range" min="20" max="180" value={slope} onChange={event => setSlope(Number(event.target.value))} /></Control>
        <Control label="outlier shift" value={(outlier / 10).toFixed(1)}><input aria-label="Outlier shift" type="range" min="-20" max="15" value={outlier} onChange={event => setOutlier(Number(event.target.value))} /></Control>
      </div>
      <svg viewBox="0 0 640 270" role="img" aria-label="House size and price scatter plot with residuals" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[1, 2, 3, 4, 5, 6].map(value => <g key={value}><line x1={px(value)} y1="33" x2={px(value)} y2="228" stroke={GRID} /><line x1="44" y1={py(value)} x2="610" y2={py(value)} stroke={GRID} /></g>)}
        <line x1="44" y1="228" x2="610" y2="228" stroke="#101318" />
        <line x1="44" y1="33" x2="44" y2="228" stroke="#101318" />
        <line x1={px(0)} y1={py(b)} x2={px(6.2)} y2={py(b + m * 6.2)} stroke={BLUE} strokeWidth="3" />
        {points.map(([x, y], index) => <g key={index}><line x1={px(x)} y1={py(y)} x2={px(x)} y2={py(b + m * x)} stroke={ORANGE} strokeDasharray="3 3" /><circle cx={px(x)} cy={py(y)} r="5" fill={index === 8 && outlier ? RED : GREEN} /></g>)}
        <text x="327" y="258" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(16,19,24,.68)">house size</text>
        <text x="15" y="132" textAnchor="middle" transform="rotate(-90 15 132)" fontFamily="monospace" fontSize="10" fill="rgba(16,19,24,.68)">price</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="mean squared error" value={mse.toFixed(3)} color={mse < 0.2 ? GREEN : RED} />
        <Metric label="root MSE" value={Math.sqrt(mse).toFixed(3)} color={ORANGE} />
        <Metric label="price at size 4" value={(b + 4 * m).toFixed(2)} color={PURPLE} />
      </div>
    </Artifact>
  );
}

function solveOls(points) {
  const meanX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  const numerator = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const denominator = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
  const slope = numerator / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

function ClosedFormExplorer() {
  const [influence, setInfluence] = useState(0);
  const points = HOUSE_DATA.map((point, index) => index === 9 ? [point[0], point[1] + influence / 10] : point);
  const fit = solveOls(points);
  const predictions = points.map(([x]) => fit.intercept + fit.slope * x);
  const sse = points.reduce((sum, point, index) => sum + (point[1] - predictions[index]) ** 2, 0);
  return (
    <Artifact title="Interactive · Closed-form OLS and leverage">
      <Control label="move the far-right point" value={(influence / 10).toFixed(1)}><input aria-label="High leverage point shift" type="range" min="-30" max="30" value={influence} onChange={event => setInfluence(Number(event.target.value))} /></Control>
      <svg viewBox="0 0 640 260" role="img" aria-label="Least squares line influenced by a high leverage point" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[1, 2, 3, 4, 5, 6].map(value => <g key={value}><line x1={px(value)} y1="33" x2={px(value)} y2="228" stroke={GRID} /><line x1="44" y1={py(value)} x2="610" y2={py(value)} stroke={GRID} /></g>)}
        <line x1="44" y1="228" x2="610" y2="228" stroke="#101318" /><line x1="44" y1="33" x2="44" y2="228" stroke="#101318" />
        <line x1={px(0)} y1={py(fit.intercept)} x2={px(6.2)} y2={py(fit.intercept + fit.slope * 6.2)} stroke={BLUE} strokeWidth="3" />
        {points.map(([x, y], index) => <circle key={index} cx={px(x)} cy={py(y)} r={index === 9 ? 7 : 5} fill={index === 9 ? RED : GREEN} />)}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="OLS intercept" value={fit.intercept.toFixed(3)} /><Metric label="OLS slope" value={fit.slope.toFixed(3)} color={PURPLE} /><Metric label="sum squared error" value={sse.toFixed(3)} color={ORANGE} />
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>A point far from the mean of <K l="x" /> has high leverage: moving it can rotate the fitted line substantially.</p>
    </Artifact>
  );
}

function runGradient(steps, rate) {
  let intercept = -0.5;
  let slope = 0.15;
  const history = [];
  for (let step = 0; step <= steps; step += 1) {
    const errors = HOUSE_DATA.map(([x, y]) => intercept + slope * x - y);
    const loss = errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length;
    history.push({ intercept, slope, loss });
    const gradB = 2 * errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const gradM = 2 * errors.reduce((sum, error, index) => sum + error * HOUSE_DATA[index][0], 0) / errors.length;
    intercept -= rate * gradB;
    slope -= rate * gradM;
  }
  return history;
}

function GradientExplorer() {
  const [steps, setSteps] = useState(12);
  const [rateValue, setRateValue] = useState(3);
  const rate = rateValue / 100;
  const history = runGradient(steps, rate);
  const current = history[history.length - 1];
  const maxLoss = Math.max(...history.map(point => Math.min(point.loss, 30)), 1);
  const lossPath = history.map((point, index) => `${index ? 'L' : 'M'} ${44 + index / Math.max(1, history.length - 1) * 566} ${220 - Math.min(point.loss, 30) / maxLoss * 178}`).join(' ');
  return (
    <Artifact title="Interactive · Gradient descent trajectory">
      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
        <Control label="updates" value={steps}><input aria-label="Gradient descent updates" type="range" min="0" max="60" value={steps} onChange={event => setSteps(Number(event.target.value))} /></Control>
        <Control label="learning rate η" value={rate.toFixed(2)}><input aria-label="Linear regression learning rate" type="range" min="1" max="12" value={rateValue} onChange={event => setRateValue(Number(event.target.value))} /></Control>
      </div>
      <svg viewBox="0 0 640 250" role="img" aria-label="Mean squared error over gradient descent updates" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[42, 86.5, 131, 175.5, 220].map(y => <line key={y} x1="44" y1={y} x2="610" y2={y} stroke={GRID} />)}
        <path d={lossPath} fill="none" stroke={BLUE} strokeWidth="3" />
        <circle cx="610" cy={220 - Math.min(current.loss, 30) / maxLoss * 178} r="6" fill={GREEN} />
        <text x="327" y="241" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(16,19,24,.68)">gradient updates</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="intercept" value={current.intercept.toFixed(3)} /><Metric label="slope" value={current.slope.toFixed(3)} color={PURPLE} /><Metric label="MSE" value={Number.isFinite(current.loss) ? current.loss.toFixed(3) : 'diverged'} color={current.loss < 0.25 ? GREEN : RED} />
      </div>
    </Artifact>
  );
}

function CollinearityExplorer() {
  const [correlation, setCorrelation] = useState(80);
  const rho = correlation / 100;
  const simpleSlope = 2 * rho - 1;
  return (
    <Artifact title="Interactive · A coefficient can reverse sign">
      <Control label="correlation corr(x₁,x₂)" value={rho.toFixed(2)}><input aria-label="Predictor correlation" type="range" min="-95" max="95" value={correlation} onChange={event => setCorrelation(Number(event.target.value))} /></Control>
      <div style={{ margin: '1.4rem 0', position: 'relative', height: 56, border: `1px solid ${GRID}`, background: '#f8f9fb' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#101318' }} />
        <div style={{ position: 'absolute', left: `${50 + Math.min(45, Math.max(-45, simpleSlope / 3 * 45))}%`, top: 10, width: 12, height: 36, transform: 'translateX(-6px)', background: simpleSlope >= 0 ? GREEN : RED, transition: 'left .15s' }} />
        <span style={{ position: 'absolute', left: 8, bottom: 4, fontSize: '0.65rem', color: 'var(--muted)' }}>negative</span><span style={{ position: 'absolute', right: 8, bottom: 4, fontSize: '0.65rem', color: 'var(--muted)' }}>positive</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}` }}>
        <Metric label="multiple-regression coefficient of x₂" value="−1.00" color={RED} note="holding x₁ fixed" />
        <Metric label="simple-regression slope on x₂" value={simpleSlope.toFixed(2)} color={simpleSlope >= 0 ? GREEN : RED} note="omitting x₁" />
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>For <K l="y=2x_1-x_2" /> with standardized predictors, regressing on <K l="x_2" /> alone gives slope <K l="2\rho-1" />. Correlation can hide or reverse the conditional effect.</p>
    </Artifact>
  );
}

function BasisExplorer() {
  const [degree, setDegree] = useState(1);
  const wiggle = Math.max(0, degree - 2);
  const curve = Array.from({ length: 121 }, (_, index) => {
    const x = -1 + index / 60;
    const base = 0.15 + 0.42 * x + 0.32 * x * x;
    const value = degree === 1 ? 0.32 + 0.42 * x : base + 0.055 * wiggle * Math.sin((degree + 1) * Math.PI * x) * (0.4 + Math.abs(x));
    return `${index ? 'L' : 'M'} ${44 + index / 120 * 566} ${220 - Math.max(-0.05, Math.min(1.05, value)) * 178}`;
  }).join(' ');
  const trainError = 0.30 / (degree + 1) + 0.008;
  const validationError = 0.045 + (degree - 3) ** 2 * 0.012;
  return (
    <Artifact title="Interactive · Polynomial complexity">
      <Control label="polynomial degree" value={degree}><input aria-label="Polynomial degree" type="range" min="1" max="10" value={degree} onChange={event => setDegree(Number(event.target.value))} /></Control>
      <svg viewBox="0 0 640 250" role="img" aria-label="Polynomial basis curve at adjustable degree" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        {[42, 86.5, 131, 175.5, 220].map(y => <line key={y} x1="44" y1={y} x2="610" y2={y} stroke={GRID} />)}
        <path d={curve} fill="none" stroke={BLUE} strokeWidth="3" />
        {[-0.85, -0.55, -0.25, 0.05, 0.3, 0.52, 0.78, 0.94].map((x, index) => { const y = 0.15 + 0.42 * x + 0.32 * x * x + [0.03, -0.02, 0.04, -0.03, 0.02, -0.04, 0.03, -0.02][index]; return <circle key={x} cx={44 + (x + 1) / 2 * 566} cy={220 - y * 178} r="5" fill={GREEN} />; })}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="training error" value={trainError.toFixed(3)} color={GREEN} /><Metric label="validation error" value={validationError.toFixed(3)} color={validationError < 0.08 ? GREEN : RED} note={degree < 2 ? 'underfitting' : degree > 5 ? 'overfitting risk' : 'useful complexity'} />
      </div>
    </Artifact>
  );
}

const RAW_WEIGHTS = [2.8, -2.2, 1.4, -0.75, 0.35];
function RegularizationExplorer() {
  const [penalty, setPenalty] = useState('ridge');
  const [lambdaValue, setLambdaValue] = useState(30);
  const lambda = lambdaValue / 20;
  const shrink = weight => {
    if (penalty === 'ridge') return weight / (1 + lambda);
    if (penalty === 'lasso') return Math.sign(weight) * Math.max(0, Math.abs(weight) - lambda * 0.55);
    const l1 = Math.sign(weight) * Math.max(0, Math.abs(weight) - lambda * 0.28);
    return l1 / (1 + lambda * 0.5);
  };
  const weights = RAW_WEIGHTS.map(shrink);
  return (
    <Artifact title="Interactive · Shrink the coefficients">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[['lasso', 'Lasso · L1'], ['ridge', 'Ridge · L2'], ['elastic', 'Elastic Net']].map(([value, label]) => <button key={value} type="button" aria-pressed={penalty === value} onClick={() => setPenalty(value)} style={{ padding: '0.45rem 0.75rem', border: `1px solid ${penalty === value ? BLUE : GRID}`, background: penalty === value ? '#eef2ff' : '#fff', color: penalty === value ? BLUE : 'var(--muted)', cursor: 'pointer' }}>{label}</button>)}
      </div>
      <Control label="regularization λ" value={lambda.toFixed(2)}><input aria-label="Regularization strength" type="range" min="0" max="80" value={lambdaValue} onChange={event => setLambdaValue(Number(event.target.value))} /></Control>
      <div style={{ display: 'grid', gap: '0.55rem', marginTop: '1.3rem' }}>
        {weights.map((weight, index) => <div key={index} style={{ display: 'grid', gridTemplateColumns: '38px 1fr 50px', gap: '0.7rem', alignItems: 'center', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem' }}><span>x{index + 1}</span><div style={{ height: 18, background: '#eef0f3', position: 'relative' }}><div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: GRID }} /><div style={{ position: 'absolute', left: weight < 0 ? `${50 + weight / 3 * 48}%` : '50%', width: `${Math.abs(weight) / 3 * 48}%`, top: 3, bottom: 3, background: weight < 0 ? RED : BLUE }} /></div><strong style={{ color: Math.abs(weight) < 0.001 ? 'var(--muted)' : weight < 0 ? RED : BLUE }}>{weight.toFixed(2)}</strong></div>)}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>{penalty === 'lasso' ? 'L1 can set coefficients exactly to zero, performing feature selection.' : penalty === 'ridge' ? 'L2 smoothly shares shrinkage across correlated features.' : 'Elastic Net combines sparse selection with stable group shrinkage.'}</p>
    </Artifact>
  );
}

export default function LinearRegressionApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div>
          <div className="ns-title">Linear Regression</div>
          <div className="ns-subtitle">Predict a continuous response with a weighted sum, fit it by least squares, and control complexity with basis functions and regularization.</div>
          <span className="tag">Residual geometry · convex optimization · regularization</span>
        </div>
      </header>

      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar"><LinearRegressionTableOfContents /></aside>
          <main className="ns-content">
            <section id="setup" className="ns-section">
              <h2>1. The Regression Setup</h2>
              <p>Regression learns from input–output pairs <K l="(x_i,y_i)" /> where the response is continuous: house price, temperature, demand, or lifetime. We separate systematic structure from unexplained variation:</p>
              <K block l="y_i=f(x_i)+\epsilon_i" />
              <p>The learning problem has two choices: a family of functions for <K l="f" />, and an objective that decides which member fits best. The word <em>linear</em> refers to linearity in the parameters, not necessarily in the raw input.</p>
            </section>

            <section id="residuals" className="ns-section">
              <h2>2. Models &amp; Residuals</h2>
              <p>The simplest model predicts a constant. Simple linear regression adds one slope; polynomial features can bend the curve:</p>
              <K block l="f(x;w)=w_0+w_1x\qquad\text{or}\qquad f(x;w)=w_0+w_1x+w_2x^2+\cdots" />
              <p>A residual <K l="e_i=y_i-\hat y_i" /> is the vertical distance between an observation and its prediction. Squaring residuals prevents cancellation and makes large misses especially expensive.</p>
              <LineFitter />
            </section>

            <section id="ols" className="ns-section">
              <h2>3. Ordinary Least Squares</h2>
              <p>Ordinary least squares chooses parameters that minimize mean squared error:</p>
              <K block l="J_n(w)=\frac{1}{n}\sum_{i=1}^{n}\left(y_i-f(x_i;w)\right)^2" />
              <p>For a line, setting both partial derivatives to zero yields a unique global minimum whenever the input varies. The fitted line passes through <K l="(\bar x,\bar y)" />.</p>
              <K block l="\hat w_1=\frac{\sum_i(x_i-\bar x)(y_i-\bar y)}{\sum_i(x_i-\bar x)^2},\qquad \hat w_0=\bar y-\hat w_1\bar x" />
              <ClosedFormExplorer />
            </section>

            <section id="normal-equation" className="ns-section">
              <h2>4. Matrix Form &amp; the Normal Equation</h2>
              <p>Stacking a column of ones beside the features turns every prediction into matrix multiplication:</p>
              <K block l="\hat y=Xw,\qquad J(w)=\frac{1}{n}\lVert y-Xw\rVert_2^2" />
              <K block l="\nabla J(w)=\frac{2}{n}X^T(Xw-y)=0\quad\Longrightarrow\quad \hat w=(X^TX)^{-1}X^Ty" />
              <div className="formula-card"><strong>Condition:</strong> the inverse exists only when the design matrix has full column rank. Duplicate or perfectly dependent features make <K l="X^TX" /> singular; in practice, solve the system with QR/SVD or add regularization instead of explicitly computing an inverse.</div>
            </section>

            <section id="gradient-descent" className="ns-section">
              <h2>5. Gradient Descent</h2>
              <p>The normal equation can be expensive when the number of features is large. Gradient descent follows the direction of steepest decrease:</p>
              <K block l="w^{(t+1)}=w^{(t)}-\eta\nabla J(w^{(t)}),\qquad \nabla J(w)=\frac{2}{n}X^T(Xw-y)" />
              <GradientExplorer />
              <p>Least-squares loss is convex, so a stable learning rate leads toward the global minimum. Feature scaling prevents one coordinate from dominating the gradient and speeds convergence.</p>
            </section>

            <section id="mle" className="ns-section">
              <h2>6. Gaussian Noise &amp; Maximum Likelihood</h2>
              <p>Assume independent Gaussian noise with constant variance:</p>
              <K block l="\epsilon_i\sim\mathcal N(0,\sigma^2)\quad\Longrightarrow\quad y_i\mid x_i,w\sim\mathcal N(w^Tx_i,\sigma^2)" />
              <K block l="\log p(y\mid X,w)=-\frac{n}{2}\log(2\pi\sigma^2)-\frac{1}{2\sigma^2}\sum_i(y_i-w^Tx_i)^2" />
              <p>All terms except the squared residuals are constant with respect to <K l="w" />. Therefore Gaussian maximum likelihood and ordinary least squares produce the same coefficient estimate. This equivalence also clarifies the assumptions behind classical uncertainty intervals.</p>
            </section>

            <section id="collinearity" className="ns-section">
              <h2>7. Multiple Regression &amp; Collinearity</h2>
              <p>With several features, each coefficient measures a conditional change: the change in prediction per unit of that feature while holding all others fixed.</p>
              <K block l="f(x;w)=w_0+\sum_{j=1}^{d}w_jx_j" />
              <p>When predictors are correlated, marginal and conditional relationships need not agree. Coefficients can become unstable because many weight combinations explain almost the same direction in the data.</p>
              <CollinearityExplorer />
            </section>

            <section id="basis" className="ns-section">
              <h2>8. Basis Functions &amp; Nonlinearity</h2>
              <p>A linear model can describe nonlinear patterns by transforming the input first:</p>
              <K block l="\phi(x)=[1,x,x^2,\ldots,x^d]^T,\qquad f(x;w)=w^T\phi(x)" />
              <p>The model remains linear in <K l="w" />, so the same least-squares machinery applies. More basis functions lower training error, but eventually fit noise instead of repeatable structure.</p>
              <BasisExplorer />
              <p>Select degree and other hyperparameters on validation data, not on the final test set.</p>
            </section>

            <section id="regularization" className="ns-section">
              <h2>9. Lasso, Ridge &amp; Elastic Net</h2>
              <p>Regularization adds a preference for smaller coefficients:</p>
              <K block l="\text{Ridge: }J(w)+\lambda\sum_jw_j^2\qquad \text{Lasso: }J(w)+\lambda\sum_j|w_j|" />
              <table>
                <thead><tr><th>Method</th><th>Penalty</th><th>Typical effect</th></tr></thead>
                <tbody><tr><td>Ridge</td><td>L2</td><td>Smooth shrinkage; stable with correlated features</td></tr><tr><td>Lasso</td><td>L1</td><td>Sparse solution; some coefficients become exactly zero</td></tr><tr><td>Elastic Net</td><td>L1 + L2</td><td>Sparsity plus grouped, stable shrinkage</td></tr></tbody>
              </table>
              <RegularizationExplorer />
              <p>Standardize continuous features to zero mean and unit variance before comparing penalties. Choose <K l="\lambda" /> by cross-validation, and fit the scaler using training data only.</p>
            </section>

            <section id="practice" className="ns-section">
              <h2>10. Practice, Strengths &amp; Limits</h2>
              <h3>Good practice</h3>
              <ul><li>Plot data and residuals; patterns reveal missing nonlinearity, changing variance, and outliers.</li><li>Separate training, validation, and test roles before tuning degree or regularization.</li><li>Inspect feature scales and correlations before interpreting coefficient magnitude.</li><li>Report predictive error on unseen data, not only <K l="R^2" /> or training fit.</li></ul>
              <h3>Limits</h3>
              <ul><li>OLS is sensitive to high-leverage observations and squared-error outliers.</li><li>Coefficient interpretation is associational unless the design supports causal claims.</li><li>Extrapolation beyond the observed feature range can be unreliable, especially for polynomials.</li><li>Non-constant variance, dependence, or non-Gaussian errors require care for inference even when predictions remain useful.</li></ul>
            </section>

            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Lecture acknowledgements include Alexander Ihler, Kevin Murphy, Tom Mitchell, Jeff Howbert, and Pedram Jahangiry.</p>
            </section>
          </main>
        </div>
      </div>

      <footer className="footer"><div className="footer-bg" aria-hidden="true" /><div className="footer-inner"><div className="footer-left"><p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p><p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', opacity: 0.6, fontFamily: 'var(--ff-mono)' }}>Machine Learning Study Guide · Built with React + KaTeX</p></div><p className="footer-copy">© 2026 — SIMA ADLEYBA</p></div></footer>
    </div>
  );
}
