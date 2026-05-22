import { useState, useEffect, useRef, useMemo } from 'react';

// ── Seeded PRNG (LCG) ─────────────────────────────────────────────────────────
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
}

// ── Two Moons dataset ─────────────────────────────────────────────────────────
function generateTwoMoons(n = 400, noise = 0.18, seed = 42) {
  const rng = makeRng(seed);
  const data = [];
  const half = n >> 1;
  for (let i = 0; i < half; i++) {
    const angle = (Math.PI * i) / half;
    data.push([
      Math.cos(angle) + (rng() - 0.5) * 2 * noise,
      Math.sin(angle) + (rng() - 0.5) * 2 * noise,
      0,
    ]);
  }
  for (let i = 0; i < half; i++) {
    const angle = (Math.PI * i) / half;
    data.push([
      1 - Math.cos(angle) + (rng() - 0.5) * 2 * noise,
      0.5 - Math.sin(angle) + (rng() - 0.5) * 2 * noise,
      1,
    ]);
  }
  return data;
}

function shuffleData(data, seed) {
  const rng = makeRng(seed);
  const d = [...data];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// ── Decision tree ─────────────────────────────────────────────────────────────
function giniImpurity(data) {
  if (data.length === 0) return 0;
  const n = data.length;
  const c0 = data.filter(d => d[2] === 0).length;
  const p = c0 / n;
  return 1 - p * p - (1 - p) * (1 - p);
}

function majorityLabel(data) {
  const c0 = data.filter(d => d[2] === 0).length;
  return c0 >= data.length - c0 ? 0 : 1;
}

function buildTree(data, depth, maxDepth, minSamples) {
  const labels = new Set(data.map(d => d[2]));
  if (data.length < minSamples || depth >= maxDepth || labels.size === 1) {
    return { leaf: true, label: majorityLabel(data) };
  }

  let bestGini = Infinity, bestFeat = -1, bestThresh = 0;
  const parentGini = giniImpurity(data);

  for (const feat of [0, 1]) {
    const sorted = [...data].sort((a, b) => a[feat] - b[feat]);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i][feat] === sorted[i + 1][feat]) continue;
      const thresh = (sorted[i][feat] + sorted[i + 1][feat]) / 2;
      const left = data.filter(d => d[feat] < thresh);
      const right = data.filter(d => d[feat] >= thresh);
      if (left.length === 0 || right.length === 0) continue;
      const g = (left.length * giniImpurity(left) + right.length * giniImpurity(right)) / data.length;
      if (g < bestGini) { bestGini = g; bestFeat = feat; bestThresh = thresh; }
    }
  }

  if (bestFeat === -1 || bestGini >= parentGini) {
    return { leaf: true, label: majorityLabel(data) };
  }

  const left = data.filter(d => d[bestFeat] < bestThresh);
  const right = data.filter(d => d[bestFeat] >= bestThresh);
  return {
    leaf: false,
    feat: bestFeat,
    thresh: bestThresh,
    left: buildTree(left, depth + 1, maxDepth, minSamples),
    right: buildTree(right, depth + 1, maxDepth, minSamples),
  };
}

function predict(tree, pt) {
  if (tree.leaf) return tree.label;
  return pt[tree.feat] < tree.thresh ? predict(tree.left, pt) : predict(tree.right, pt);
}

function computeError(tree, data) {
  let err = 0;
  for (const d of data) { if (predict(tree, d) !== d[2]) err++; }
  return err / data.length;
}

// ── Component ─────────────────────────────────────────────────────────────────
const X_MIN = -1.6, X_MAX = 2.6, Y_MIN = -1.1, Y_MAX = 1.9;
const GRID = 80;

export default function OverfittingDemo() {
  const { trainData, testData } = useMemo(() => {
    const all = shuffleData(generateTwoMoons(400, 0.32, 42), 7);
    return { trainData: all.slice(0, 120), testData: all.slice(120) };
  }, []);

  const [maxDepth, setMaxDepth] = useState(10);
  const [minSamples, setMinSamples] = useState(2);
  const canvasRef = useRef(null);

  const currentTree = useMemo(
    () => buildTree(trainData, 0, maxDepth, minSamples),
    [trainData, maxDepth, minSamples]
  );

  const errorCurves = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const d = i + 1;
      const tree = buildTree(trainData, 0, d, minSamples);
      return { depth: d, train: computeError(tree, trainData), test: computeError(tree, testData) };
    });
  }, [trainData, testData, minSamples]);

  // Draw canvas whenever tree changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const CW = canvas.width, CH = canvas.height;

    ctx.clearRect(0, 0, CW, CH);

    const toX = (x) => ((x - X_MIN) / (X_MAX - X_MIN)) * CW;
    const toY = (y) => (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * CH;
    const cellW = CW / GRID, cellH = CH / GRID;
    const dx = (X_MAX - X_MIN) / GRID, dy = (Y_MAX - Y_MIN) / GRID;

    // Background grid
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x = X_MIN + (i + 0.5) * dx;
        const y = Y_MIN + (j + 0.5) * dy;
        const lbl = predict(currentTree, [x, y, 0]);
        ctx.fillStyle = lbl === 0 ? 'rgba(41,128,185,0.18)' : 'rgba(230,126,34,0.18)';
        ctx.fillRect(i * cellW, CH - (j + 1) * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Test points (lighter)
    for (const d of testData) {
      ctx.beginPath();
      ctx.arc(toX(d[0]), toY(d[1]), 3, 0, Math.PI * 2);
      ctx.fillStyle = d[2] === 0 ? 'rgba(41,128,185,0.45)' : 'rgba(230,126,34,0.45)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Train points (solid)
    for (const d of trainData) {
      ctx.beginPath();
      ctx.arc(toX(d[0]), toY(d[1]), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = d[2] === 0 ? '#2980B9' : '#E67E22';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }, [currentTree, trainData, testData]);

  // Error curve SVG
  const svgW = 300, svgH = 220;
  const mg = { top: 22, right: 20, bottom: 44, left: 50 };
  const PW = svgW - mg.left - mg.right;
  const PH = svgH - mg.top - mg.bottom;

  const xS = (d) => mg.left + ((d - 1) / 14) * PW;
  const maxErr = Math.max(0.05, ...errorCurves.map(e => Math.max(e.train, e.test))) * 1.15;
  const yS = (e) => mg.top + PH - (e / maxErr) * PH;

  const trainPath = errorCurves.map((e, i) =>
    `${i === 0 ? 'M' : 'L'} ${xS(e.depth).toFixed(1)} ${yS(e.train).toFixed(1)}`).join(' ');
  const testPath = errorCurves.map((e, i) =>
    `${i === 0 ? 'M' : 'L'} ${xS(e.depth).toFixed(1)} ${yS(e.test).toFixed(1)}`).join(' ');

  const trainErr = computeError(currentTree, trainData);
  const testErr = computeError(currentTree, testData);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>
            Max Depth:{' '}
            <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{maxDepth}</strong>
          </label>
          <input type="range" min="1" max="15" step="1" value={maxDepth}
            onChange={e => setMaxDepth(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '0.2rem' }}>
            Min Samples Split:{' '}
            <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{minSamples}</strong>
          </label>
          <input type="range" min="2" max="30" step="1" value={minSamples}
            onChange={e => setMinSamples(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>
      </div>

      {/* Panels */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: decision boundary */}
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem', textAlign: 'center', letterSpacing: '0.03em' }}>
            Decision Boundary
          </div>
          <canvas ref={canvasRef} width={320} height={280}
            style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', display: 'block' }} />
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            <span>Train error: <strong style={{ color: '#2980B9' }}>{(trainErr * 100).toFixed(1)}%</strong></span>
            <span>Test error: <strong style={{ color: '#E67E22' }}>{(testErr * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Right: error curves */}
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem', textAlign: 'center', letterSpacing: '0.03em' }}>
            Error vs Max Depth
          </div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', display: 'block' }}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => {
              const y = mg.top + PH - v * PH;
              return <line key={v} x1={mg.left} x2={mg.left + PW} y1={y} y2={y} stroke="#e2e4ea" strokeWidth="1" />;
            })}
            {/* Axes */}
            <line x1={mg.left} y1={mg.top} x2={mg.left} y2={mg.top + PH} stroke="#ccc" strokeWidth="1" />
            <line x1={mg.left} y1={mg.top + PH} x2={mg.left + PW} y2={mg.top + PH} stroke="#ccc" strokeWidth="1" />
            {/* X labels */}
            {[1, 3, 5, 7, 9, 11, 13, 15].map(d => (
              <text key={d} x={xS(d)} y={mg.top + PH + 14} textAnchor="middle" fontSize="10" fill="#888">{d}</text>
            ))}
            {/* Y labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => {
              const y = mg.top + PH - v * PH;
              return <text key={v} x={mg.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#888">
                {(v * maxErr).toFixed(2)}
              </text>;
            })}
            {/* Axis title */}
            <text x={mg.left + PW / 2} y={svgH - 2} textAnchor="middle" fontSize="11" fill="#888">
              Max Depth
            </text>
            <text transform={`translate(11,${mg.top + PH / 2}) rotate(-90)`}
              textAnchor="middle" fontSize="11" fill="#888">
              Error
            </text>
            {/* Curves */}
            <path d={trainPath} fill="none" stroke="#2980B9" strokeWidth="2.2" strokeLinejoin="round" />
            <path d={testPath} fill="none" stroke="#E67E22" strokeWidth="2.2" strokeLinejoin="round" />
            {/* Depth marker */}
            <line x1={xS(maxDepth)} x2={xS(maxDepth)} y1={mg.top} y2={mg.top + PH}
              stroke="#7B6FD6" strokeWidth="1.5" strokeDasharray="4,3" />
            <circle cx={xS(maxDepth)} cy={yS(trainErr)} r="4" fill="#2980B9" />
            <circle cx={xS(maxDepth)} cy={yS(testErr)} r="4" fill="#E67E22" />
            {/* Legend */}
            <rect x={mg.left + 6} y={mg.top + 4} width="90" height="44" rx="4"
              fill="white" stroke="#e2e4ea" strokeWidth="1" />
            <line x1={mg.left + 14} x2={mg.left + 30} y1={mg.top + 18} y2={mg.top + 18}
              stroke="#2980B9" strokeWidth="2.2" />
            <text x={mg.left + 34} y={mg.top + 22} fontSize="10" fill="#555">Train</text>
            <line x1={mg.left + 14} x2={mg.left + 30} y1={mg.top + 36} y2={mg.top + 36}
              stroke="#E67E22" strokeWidth="2.2" />
            <text x={mg.left + 34} y={mg.top + 40} fontSize="10" fill="#555">Test</text>
          </svg>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.6rem', marginBottom: 0, textAlign: 'center' }}>
        Solid dots = training points · Faint dots = test points · Purple dashed line = current depth
      </p>
    </div>
  );
}
