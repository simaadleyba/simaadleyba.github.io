import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import MleMapTableOfContents from './components/MleMapTableOfContents';
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
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
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
      <div style={{ color, fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
      {note && <div style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{note}</div>}
    </div>
  );
}

function CurvePlot({ curves, markers = [], yLabel = 'relative density' }) {
  const width = 640;
  const height = 250;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${yLabel} across theta`} style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}` }}>
      {[50, 100, 150, 200].map(y => <line key={y} x1="42" y1={y} x2="612" y2={y} stroke={GRID} />)}
      <line x1="42" y1="220" x2="612" y2="220" stroke="#101318" />
      {[0, 0.25, 0.5, 0.75, 1].map(value => (
        <g key={value}>
          <line x1={42 + value * 570} y1="220" x2={42 + value * 570} y2="225" stroke="#101318" />
          <text x={42 + value * 570} y="241" textAnchor="middle" fontSize="11" fill="rgba(16,19,24,.68)">{value}</text>
        </g>
      ))}
      {curves.map(curve => <path key={curve.label} d={curve.path} fill="none" stroke={curve.color} strokeWidth={curve.width || 3} strokeDasharray={curve.dash || 'none'} />)}
      {markers.map(marker => (
        <g key={marker.label}>
          <line x1={42 + marker.value * 570} y1="22" x2={42 + marker.value * 570} y2="220" stroke={marker.color} strokeWidth="1.5" strokeDasharray="5 4" />
          <text x={42 + marker.value * 570} y="17" textAnchor="middle" fontSize="10" fontFamily="monospace" fill={marker.color}>{marker.label}</text>
        </g>
      ))}
      <text x="327" y="246" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="rgba(16,19,24,.68)">θ</text>
    </svg>
  );
}

function makeCurve(values) {
  const max = Math.max(...values.map(point => point.y), Number.EPSILON);
  return values.map((point, index) => {
    const x = 42 + point.x * 570;
    const y = 220 - (point.y / max) * 185;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

function BernoulliExplorer() {
  const [heads, setHeads] = useState(3);
  const [tails, setTails] = useState(2);
  const total = heads + tails;
  const mle = total ? heads / total : 0.5;
  const candidates = Array.from({ length: 99 }, (_, index) => (index + 1) / 100);
  const logs = candidates.map(theta => heads * Math.log(theta) + tails * Math.log(1 - theta));
  const maxLog = Math.max(...logs);
  const likelihood = candidates.map((theta, index) => ({ x: theta, y: Math.exp(logs[index] - maxLog) }));
  const logMin = Math.min(...logs);
  const logCurve = candidates.map((theta, index) => ({ x: theta, y: (logs[index] - logMin) + 0.02 }));

  return (
    <Artifact title="Interactive · Bernoulli likelihood laboratory">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        <Control label="heads (αH)" value={heads}>
          <input aria-label="Observed heads" type="range" min="0" max="100" value={heads} onChange={event => setHeads(Number(event.target.value))} />
        </Control>
        <Control label="tails (αT)" value={tails}>
          <input aria-label="Observed tails" type="range" min="0" max="100" value={tails} onChange={event => setTails(Number(event.target.value))} />
        </Control>
      </div>
      <CurvePlot
        curves={[
          { label: 'likelihood', path: makeCurve(likelihood), color: BLUE },
          { label: 'log-likelihood', path: makeCurve(logCurve), color: ORANGE, dash: '7 5', width: 2 },
        ]}
        markers={[{ label: `MLE ${mle.toFixed(2)}`, value: mle, color: GREEN }]}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.8rem', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
        <span><span style={{ color: BLUE }}>━━</span> relative likelihood</span>
        <span><span style={{ color: ORANGE }}>┅┅</span> shifted log-likelihood</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="samples" value={total} />
        <Metric label="MLE" value={mle.toFixed(3)} color={GREEN} note="sample frequency" />
        <Metric label="log L at MLE" value={total ? (heads * Math.log(Math.max(mle, 1e-9)) + tails * Math.log(Math.max(1 - mle, 1e-9))).toFixed(2) : '0.00'} color={ORANGE} />
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.8rem 0 0' }}>Both curves peak at the same <K l="\theta" />. The log transform changes the vertical scale, not the maximizing parameter.</p>
    </Artifact>
  );
}

function SamplePlanner() {
  const [epsilon, setEpsilon] = useState(10);
  const [confidence, setConfidence] = useState(95);
  const eps = epsilon / 100;
  const delta = 1 - confidence / 100;
  const samples = Math.ceil(Math.log(2 / delta) / (2 * eps * eps));

  return (
    <Artifact title="Interactive · Hoeffding sample planner">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Control label="error tolerance (ε)" value={`±${eps.toFixed(2)}`}>
          <input aria-label="Error tolerance" type="range" min="3" max="25" value={epsilon} onChange={event => setEpsilon(Number(event.target.value))} />
        </Control>
        <Control label="confidence (1−δ)" value={`${confidence}%`}>
          <input aria-label="Required confidence" type="range" min="80" max="99" value={confidence} onChange={event => setConfidence(Number(event.target.value))} />
        </Control>
      </div>
      <div style={{ margin: '1.5rem 0', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '1rem', alignItems: 'center', borderTop: `1px solid ${GRID}`, borderBottom: `1px solid ${GRID}`, padding: '1rem 0' }}>
        <div>
          <div style={{ fontFamily: 'var(--ff-mono)', color: 'var(--muted)', fontSize: '0.7rem' }}>guaranteed sample bound</div>
          <strong style={{ color: BLUE, fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1 }}>{samples.toLocaleString()}</strong>
          <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>flips</span>
        </div>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: `7px solid ${BLUE}`, display: 'grid', placeItems: 'center', color: BLUE, fontWeight: 700 }}>{confidence}%</div>
      </div>
      <K block l={`N\\geq\\frac{\\ln(2/${delta.toFixed(2)})}{2(${eps.toFixed(2)})^2}=${samples}`} />
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>Demanding half the error tolerance requires roughly four times as many samples because <K l="N" /> grows as <K l="1/\epsilon^2" />.</p>
    </Artifact>
  );
}

function GaussianExplorer() {
  const [shift, setShift] = useState(0);
  const base = [24, 18, 12, 30];
  const points = [...base.slice(0, 3), base[3] + shift];
  const mean = points.reduce((sum, value) => sum + value, 0) / points.length;
  const variance = points.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / points.length;
  const sigma = Math.sqrt(variance);
  const minX = 5;
  const maxX = 48;
  const density = Array.from({ length: 101 }, (_, index) => {
    const value = minX + index / 100 * (maxX - minX);
    const y = Math.exp(-Math.pow(value - mean, 2) / (2 * Math.max(variance, 0.1)));
    return { value, y };
  });
  const path = density.map((point, index) => {
    const x = 42 + (point.value - minX) / (maxX - minX) * 570;
    const y = 198 - point.y * 145;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');

  return (
    <Artifact title="Interactive · Gaussian parameter fitting">
      <Control label="shift the fourth observation" value={`${shift >= 0 ? '+' : ''}${shift}°`}>
        <input aria-label="Fourth observation shift" type="range" min="-10" max="15" value={shift} onChange={event => setShift(Number(event.target.value))} />
      </Control>
      <svg viewBox="0 0 640 240" role="img" aria-label="Gaussian fit over four temperature observations" style={{ width: '100%', background: '#f8f9fb', border: `1px solid ${GRID}`, marginTop: '1.2rem' }}>
        <line x1="42" y1="198" x2="612" y2="198" stroke="#101318" />
        <path d={path} fill="none" stroke={BLUE} strokeWidth="3" />
        {points.map((value, index) => {
          const x = 42 + (value - minX) / (maxX - minX) * 570;
          return <g key={index}><line x1={x} y1="191" x2={x} y2="207" stroke={ORANGE} strokeWidth="3" /><text x={x} y="225" textAnchor="middle" fontSize="11" fill={ORANGE}>{value}</text></g>;
        })}
        <line x1={42 + (mean - minX) / (maxX - minX) * 570} y1="30" x2={42 + (mean - minX) / (maxX - minX) * 570} y2="198" stroke={GREEN} strokeDasharray="5 4" />
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="μ MLE" value={mean.toFixed(2)} color={GREEN} />
        <Metric label="σ² MLE" value={variance.toFixed(2)} color={PURPLE} note="divide by N" />
        <Metric label="σ MLE" value={sigma.toFixed(2)} color={BLUE} />
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.8rem 0 0' }}>Moving one observation shifts the sample mean and increases the fitted spread. Gaussian MLE exposes the same squared-error term used in regression.</p>
    </Artifact>
  );
}

function DiscreteMapDemo() {
  const [priorSix, setPriorSix] = useState(80);
  const priorThree = 100 - priorSix;
  const scoreThree = Math.pow(0.7, 2) * 0.3 * priorThree / 100;
  const scoreSix = Math.pow(0.4, 2) * 0.6 * priorSix / 100;
  const norm = scoreThree + scoreSix;
  const posteriorThree = scoreThree / norm;
  const posteriorSix = scoreSix / norm;
  const winner = posteriorSix > posteriorThree ? 0.6 : 0.3;

  return (
    <Artifact title="Interactive · Discrete MAP decision">
      <p style={{ marginTop: 0 }}>Observed data: one head and two tails. The parameter can only be <K l="\theta\in\{0.3,0.6\}" />.</p>
      <Control label="prior belief P(θ=0.6)" value={`${priorSix}%`}>
        <input aria-label="Prior probability for theta 0.6" type="range" min="1" max="99" value={priorSix} onChange={event => setPriorSix(Number(event.target.value))} />
      </Control>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1.2rem' }}>
        {[
          { theta: 0.3, prior: priorThree / 100, score: scoreThree, posterior: posteriorThree },
          { theta: 0.6, prior: priorSix / 100, score: scoreSix, posterior: posteriorSix },
        ].map(option => (
          <div key={option.theta} style={{ padding: '1rem', background: '#fff', borderTop: `3px solid ${winner === option.theta ? GREEN : GRID}` }}>
            <div style={{ color: 'var(--muted)', fontFamily: 'var(--ff-mono)', fontSize: '0.68rem' }}>θ = {option.theta}</div>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: winner === option.theta ? GREEN : 'var(--text)' }}>{(option.posterior * 100).toFixed(1)}%</strong>
            <div style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>posterior · unnormalized score {option.score.toFixed(4)}</div>
          </div>
        ))}
      </div>
      <p style={{ margin: '0.9rem 0 0' }}>MAP selects <strong style={{ color: GREEN }}><K l={`\\hat\\theta_{MAP}=${winner}`} /></strong>. With little data, changing the prior can change the answer.</p>
    </Artifact>
  );
}

function betaShape(theta, a, b) {
  return Math.pow(theta, a - 1) * Math.pow(1 - theta, b - 1);
}

function BetaExplorer() {
  const [betaH, setBetaH] = useState(2);
  const [betaT, setBetaT] = useState(2);
  const [heads, setHeads] = useState(3);
  const [tails, setTails] = useState(2);
  const posteriorH = betaH + heads;
  const posteriorT = betaT + tails;
  const mle = heads + tails ? heads / (heads + tails) : 0.5;
  const map = (posteriorH - 1) / (posteriorH + posteriorT - 2);
  const posteriorMean = posteriorH / (posteriorH + posteriorT);
  const thetaValues = Array.from({ length: 99 }, (_, index) => (index + 1) / 100);
  const priorValues = thetaValues.map(theta => ({ x: theta, y: betaShape(theta, betaH, betaT) }));
  const posteriorValues = thetaValues.map(theta => ({ x: theta, y: betaShape(theta, posteriorH, posteriorT) }));

  return (
    <Artifact title="Interactive · Beta–Bernoulli updater">
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Control label="prior heads (βH)" value={betaH}><input aria-label="Beta prior heads" type="range" min="2" max="20" value={betaH} onChange={event => setBetaH(Number(event.target.value))} /></Control>
          <Control label="prior tails (βT)" value={betaT}><input aria-label="Beta prior tails" type="range" min="2" max="20" value={betaT} onChange={event => setBetaT(Number(event.target.value))} /></Control>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Control label="observed heads (αH)" value={heads}><input aria-label="Beta observed heads" type="range" min="0" max="100" value={heads} onChange={event => setHeads(Number(event.target.value))} /></Control>
          <Control label="observed tails (αT)" value={tails}><input aria-label="Beta observed tails" type="range" min="0" max="100" value={tails} onChange={event => setTails(Number(event.target.value))} /></Control>
        </div>
      </div>
      <div style={{ marginTop: '1.3rem' }}>
        <CurvePlot
          curves={[
            { label: 'prior', path: makeCurve(priorValues), color: ORANGE, dash: '7 5', width: 2 },
            { label: 'posterior', path: makeCurve(posteriorValues), color: BLUE },
          ]}
          markers={[
            { label: `MLE ${mle.toFixed(2)}`, value: mle, color: GREEN },
            { label: `MAP ${map.toFixed(2)}`, value: map, color: PURPLE },
          ]}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.8rem', fontFamily: 'var(--ff-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
        <span><span style={{ color: ORANGE }}>┅┅</span> Beta({betaH}, {betaT}) prior</span>
        <span><span style={{ color: BLUE }}>━━</span> Beta({posteriorH}, {posteriorT}) posterior</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, background: GRID, border: `1px solid ${GRID}`, marginTop: '1rem' }}>
        <Metric label="MLE" value={mle.toFixed(3)} color={GREEN} />
        <Metric label="MAP / mode" value={map.toFixed(3)} color={PURPLE} />
        <Metric label="posterior mean" value={posteriorMean.toFixed(3)} color={BLUE} />
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0.8rem 0 0' }}>The posterior parameters are obtained by adding counts. Increase the observations and the prior’s pull becomes progressively smaller.</p>
    </Artifact>
  );
}

export default function MleMapApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <header className="ns-header">
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.35rem' }}><a href="/machinelearning/">Machine Learning</a>{' '}›{' '}</div>
          <div className="ns-title">MLE &amp; MAP</div>
          <div className="ns-subtitle">Two ways to estimate model parameters: follow the observed data alone, or combine the evidence with prior beliefs.</div>
          <span className="tag">Likelihood · estimation · Bayesian updating</span>
        </div>
      </header>

      <div className="container">
        <div className="ns-layout">
          <aside className="ns-sidebar"><MleMapTableOfContents /></aside>
          <main className="ns-content">
            <section id="density" className="ns-section">
              <h2>1. Density Estimation</h2>
              <p>Suppose someone hands you a thumbtack and asks for the probability that it lands nail-up. You cannot inspect an abstract probability directly, so you flip it and use the outcomes to estimate the data-generating distribution.</p>
              <div className="formula-card">
                <h3 style={{ marginTop: 0 }}>Density estimation as learning</h3>
                <p><strong>Data:</strong> independent observations with <K l="\alpha_H" /> heads and <K l="\alpha_T" /> tails.</p>
                <p><strong>Hypothesis:</strong> a Bernoulli distribution with unknown parameter <K l="\theta" />.</p>
                <p style={{ marginBottom: 0 }}><strong>Learning:</strong> optimize <K l="\theta" /> so the distribution explains the observations.</p>
              </div>
              <p>Three heads in five flips suggests <K l="P(H)=3/5" />. That empirical frequency is intuitive, but it is also the exact maximum-likelihood solution.</p>
            </section>

            <section id="bernoulli-mle" className="ns-section">
              <h2>2. Bernoulli Maximum Likelihood</h2>
              <p>For independent Bernoulli trials, <K l="P(H)=\theta" /> and <K l="P(T)=1-\theta" />. Independence turns the probability of the observed sequence into a product:</p>
              <K block l="P(\mathcal{D}\mid\theta)=\prod_{i=1}^{N}P(x_i\mid\theta)=\theta^{\alpha_H}(1-\theta)^{\alpha_T}" />
              <p>MLE chooses the parameter value that makes the observed data most probable.</p>
              <K block l="\hat\theta_{MLE}=\arg\max_\theta P(\mathcal{D}\mid\theta)" />
              <BernoulliExplorer />
              <h3>Derivation</h3>
              <K block l="\ell(\theta)=\alpha_H\ln\theta+\alpha_T\ln(1-\theta)" />
              <K block l="\frac{d\ell}{d\theta}=\frac{\alpha_H}{\theta}-\frac{\alpha_T}{1-\theta}=0\quad\Longrightarrow\quad\hat\theta_{MLE}=\frac{\alpha_H}{\alpha_H+\alpha_T}" />
            </section>

            <section id="log-likelihood" className="ns-section">
              <h2>3. Likelihood vs Log-Likelihood</h2>
              <p>Likelihood multiplies many probabilities. With 55 heads and 45 tails, even its maximum is around <K l="10^{-30}" />. Products this small are awkward numerically.</p>
              <table>
                <thead><tr><th>Objective</th><th>Bernoulli form</th><th>Practical behavior</th></tr></thead>
                <tbody>
                  <tr><td>Likelihood</td><td><K l="\theta^{\alpha_H}(1-\theta)^{\alpha_T}" /></td><td>Product can underflow toward zero</td></tr>
                  <tr><td>Log-likelihood</td><td><K l="\alpha_H\ln\theta+\alpha_T\ln(1-\theta)" /></td><td>Additive, stable, same maximizer</td></tr>
                </tbody>
              </table>
              <p>Because the logarithm is strictly increasing, the value of <K l="\theta" /> that maximizes likelihood also maximizes log-likelihood. The transform turns products into sums and derivatives into simpler expressions.</p>
            </section>

            <section id="sample-complexity" className="ns-section">
              <h2>4. How Much Data?</h2>
              <p>Three heads in five flips and 30 heads in 50 flips both give <K l="\hat\theta=0.6" />, but they do not carry equal certainty. More data narrows the estimator around the true parameter.</p>
              <K block l="P\left(|\hat\theta-\theta^*|\geq\epsilon\right)\leq 2e^{-2N\epsilon^2}" />
              <p>Hoeffding’s inequality bounds the chance that the estimate misses the truth by at least <K l="\epsilon" />. Solving for <K l="N" /> gives a probably approximately correct sample bound.</p>
              <SamplePlanner />
            </section>

            <section id="gaussian" className="ns-section">
              <h2>5. Gaussian Maximum Likelihood</h2>
              <p>For a continuous variable, we maximize a probability density. A Gaussian model has location <K l="\mu" /> and variance <K l="\sigma^2" />:</p>
              <K block l="\mathcal{N}(x\mid\mu,\sigma^2)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\left[-\frac{(x-\mu)^2}{2\sigma^2}\right]" />
              <p>The i.i.d. Gaussian log-likelihood contains a sum-of-squared-errors term. Differentiating gives the sample mean and the average squared deviation:</p>
              <K block l="\hat\mu_{MLE}=\frac{1}{N}\sum_{i=1}^{N}x_i\qquad\hat\sigma^2_{MLE}=\frac{1}{N}\sum_{i=1}^{N}(x_i-\hat\mu)^2" />
              <GaussianExplorer />
              <p>Not every likelihood has a closed-form optimum. When the derivative cannot be solved analytically, numerical methods such as gradient ascent optimize <K l="\ell(\theta)" /> iteratively.</p>
            </section>

            <section id="bayes" className="ns-section">
              <h2>6. Bayesian Updating</h2>
              <p>MLE uses only the observations. A Bayesian analysis also represents beliefs about <K l="\theta" /> before seeing the current data.</p>
              <K block l="p(\theta\mid\mathcal{D})=\frac{p(\mathcal{D}\mid\theta)p(\theta)}{p(\mathcal{D})}" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', borderTop: `1px solid ${GRID}`, borderBottom: `1px solid ${GRID}`, margin: '1.3rem 0' }}>
                {[
                  ['prior', 'belief before the new data', ORANGE],
                  ['likelihood', 'compatibility of data and parameter', GREEN],
                  ['posterior', 'updated belief after the data', BLUE],
                ].map(([label, text, color], index) => (
                  <div key={label} style={{ padding: '1rem', borderRight: index < 2 ? `1px solid ${GRID}` : 0, background: index === 1 ? '#f8f9fb' : '#fff' }}>
                    <strong style={{ color, display: 'block' }}>{label}</strong><span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{text}</span>
                  </div>
                ))}
              </div>
              <p>The evidence <K l="p(\mathcal{D})" /> normalizes the posterior so it integrates to one. A posterior from today can become the prior when tomorrow’s evidence arrives.</p>
            </section>

            <section id="map" className="ns-section">
              <h2>7. Maximum A Posteriori Estimation</h2>
              <p>MAP converts the posterior distribution into a point estimate by choosing its mode. Since the evidence does not depend on <K l="\theta" />, it can be omitted during optimization.</p>
              <K block l="\hat\theta_{MAP}=\arg\max_\theta p(\theta\mid\mathcal{D})=\arg\max_\theta p(\mathcal{D}\mid\theta)p(\theta)" />
              <DiscreteMapDemo />
              <p>A prior can encode domain knowledge, historical data, a deliberately weak uniform belief, or a mathematically convenient conjugate family. It should be declared and justified rather than hidden.</p>
            </section>

            <section id="beta" className="ns-section">
              <h2>8. Beta Conjugate Prior</h2>
              <p>The Beta family is conjugate to the Bernoulli likelihood: the posterior has the same form as the prior. Its two parameters behave like prior counts.</p>
              <K block l="p(\theta)=\operatorname{Beta}(\beta_H,\beta_T)\quad\Longrightarrow\quad p(\theta\mid\mathcal{D})=\operatorname{Beta}(\beta_H+\alpha_H,\beta_T+\alpha_T)" />
              <BetaExplorer />
              <K block l="\hat\theta_{MAP}=\frac{\alpha_H+\beta_H-1}{\alpha_H+\beta_H+\alpha_T+\beta_T-2}" />
              <p>The terms <K l="\beta_H-1" /> and <K l="\beta_T-1" /> act like extra heads and tails. With abundant data those fixed pseudocounts become negligible and MAP approaches MLE.</p>
            </section>

            <section id="comparison" className="ns-section">
              <h2>9. MLE vs MAP</h2>
              <table>
                <thead><tr><th></th><th>MLE</th><th>MAP</th></tr></thead>
                <tbody>
                  <tr><td><strong>Optimizes</strong></td><td><K l="p(\mathcal{D}\mid\theta)" /></td><td><K l="p(\theta\mid\mathcal{D})" /></td></tr>
                  <tr><td><strong>Uses</strong></td><td>Observed data</td><td>Observed data + prior</td></tr>
                  <tr><td><strong>Sparse data</strong></td><td>Can produce extreme estimates</td><td>Prior provides a fallback</td></tr>
                  <tr><td><strong>Abundant data</strong></td><td colSpan="2">Likelihood dominates; estimates usually converge</td></tr>
                </tbody>
              </table>
              <div className="formula-card">
                <h3 style={{ marginTop: 0 }}>Laplace smoothing is MAP</h3>
                <p>A <K l="\operatorname{Beta}(2,2)" /> prior adds one effective head and one effective tail:</p>
                <K block l="\hat\theta_{MAP}=\frac{\alpha_H+1}{\alpha_H+\alpha_T+2}" />
                <p style={{ marginBottom: 0 }}>This prevents an unobserved outcome from receiving probability zero.</p>
              </div>
            </section>

            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS512 Machine Learning, Assoc. Prof. Öznur Taştan (Sabancı University)</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Acknowledgements in the lecture material: slides adapted in part from Alexander Rakhlin, Tom Mitchell, and Carlos Guestrin.</p>
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
