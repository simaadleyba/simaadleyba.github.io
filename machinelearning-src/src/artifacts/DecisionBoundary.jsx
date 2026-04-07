import { useRef, useEffect, useState, useMemo } from 'react';

const CANVAS_SIZE = 300;
const GRID = 120;

// Dataset: two classes separated by the anti-diagonal (y = 1 − x).
// Class 0 (blue)   lives in the upper-left  half-plane (y + x < 1).
// Class 1 (orange) lives in the lower-right half-plane (y + x > 1).
// A handful of noise points sit in enemy territory; at k=1 they produce
// visible islands, by k≈5 they're outvoted and the boundary becomes a
// smooth diagonal — making the bias-variance tradeoff visually obvious.
const DATASET = [
  // ── Class 0 — clear upper-left region ──────────────────────────
  { x: 0.10, y: 0.14, cls: 0 }, { x: 0.22, y: 0.07, cls: 0 },
  { x: 0.38, y: 0.10, cls: 0 }, { x: 0.08, y: 0.32, cls: 0 },
  { x: 0.18, y: 0.48, cls: 0 }, { x: 0.28, y: 0.38, cls: 0 },
  { x: 0.46, y: 0.16, cls: 0 }, { x: 0.32, y: 0.26, cls: 0 },
  { x: 0.06, y: 0.60, cls: 0 }, { x: 0.14, y: 0.70, cls: 0 },
  // ── Class 0 — boundary zone (creates wiggles at small k) ────────
  { x: 0.50, y: 0.32, cls: 0 }, { x: 0.40, y: 0.46, cls: 0 },
  { x: 0.60, y: 0.24, cls: 0 },
  // ── Class 0 — noise in class-1 territory (islands at k=1) ───────
  { x: 0.70, y: 0.62, cls: 0 }, { x: 0.60, y: 0.78, cls: 0 },

  // ── Class 1 — clear lower-right region ──────────────────────────
  { x: 0.90, y: 0.86, cls: 1 }, { x: 0.76, y: 0.92, cls: 1 },
  { x: 0.92, y: 0.70, cls: 1 }, { x: 0.64, y: 0.88, cls: 1 },
  { x: 0.80, y: 0.74, cls: 1 }, { x: 0.86, y: 0.56, cls: 1 },
  { x: 0.92, y: 0.42, cls: 1 }, { x: 0.70, y: 0.56, cls: 1 },
  { x: 0.54, y: 0.84, cls: 1 }, { x: 0.40, y: 0.78, cls: 1 },
  // ── Class 1 — boundary zone ─────────────────────────────────────
  { x: 0.56, y: 0.58, cls: 1 }, { x: 0.46, y: 0.66, cls: 1 },
  { x: 0.66, y: 0.44, cls: 1 },
  // ── Class 1 — noise in class-0 territory (islands at k=1) ───────
  { x: 0.26, y: 0.20, cls: 1 }, { x: 0.16, y: 0.36, cls: 1 },
];

const N = DATASET.length;

// Classify a point using k-NN
function knnClassify(px, py, k) {
  const dists = DATASET.map(pt => ({
    d: (px - pt.x) ** 2 + (py - pt.y) ** 2,
    cls: pt.cls,
  }));
  dists.sort((a, b) => a.d - b.d);
  let count0 = 0;
  for (let i = 0; i < k; i++) count0 += dists[i].cls === 0 ? 1 : 0;
  return count0 >= k - count0 ? 0 : 1;
}

export default function DecisionBoundary() {
  const canvasRef = useRef(null);
  const [k, setK] = useState(3);

  const trainError = useMemo(() => {
    if (k === 1) return '0.0';
    let errors = 0;
    for (const pt of DATASET) {
      const dists = DATASET.map(other => ({
        d: (pt.x - other.x) ** 2 + (pt.y - other.y) ** 2,
        cls: other.cls,
      }));
      dists.sort((a, b) => a.d - b.d);
      // k=1 always picks self → exclude self by using indices 1..k
      let count0 = 0;
      for (let i = 1; i <= k; i++) count0 += dists[i]?.cls === 0 ? 1 : 0;
      const pred = count0 >= k - count0 ? 0 : 1;
      if (pred !== pt.cls) errors++;
    }
    return (errors / N * 100).toFixed(1);
  }, [k]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Compute GRID×GRID classification
    const gridCls = new Uint8Array(GRID * GRID);
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const px = (gx + 0.5) / GRID;
        const py = (gy + 0.5) / GRID;
        gridCls[gy * GRID + gx] = knnClassify(px, py, k);
      }
    }

    // Build low-res ImageData
    const lowRes = new ImageData(GRID, GRID);
    for (let i = 0; i < GRID * GRID; i++) {
      const base = i * 4;
      if (gridCls[i] === 0) {
        lowRes.data[base] = 205; lowRes.data[base + 1] = 228; lowRes.data[base + 2] = 252; lowRes.data[base + 3] = 255;
      } else {
        lowRes.data[base] = 255; lowRes.data[base + 1] = 224; lowRes.data[base + 2] = 185; lowRes.data[base + 3] = 255;
      }
    }

    // Scale up via offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = GRID; offscreen.height = GRID;
    offscreen.getContext('2d').putImageData(lowRes, 0, 0);

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(offscreen, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Training points
    const scale = CANVAS_SIZE;
    for (const pt of DATASET) {
      ctx.beginPath();
      ctx.arc(pt.x * scale, pt.y * scale, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = pt.cls === 0 ? '#2980B9' : '#E67E22';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [k]);

  const errorColor = parseFloat(trainError) === 0 ? '#2d6a4f' : parseFloat(trainError) > 20 ? '#E67E22' : 'var(--text)';

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ width: '100%', maxWidth: `${CANVAS_SIZE}px`, display: 'block', borderRadius: '8px', border: '1px solid var(--border)' }}
      />

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            k = <strong style={{ color: 'var(--text)', minWidth: '1.8rem', display: 'inline-block' }}>{k}</strong>
          </span>
          <input
            type="range" min={1} max={N} step={2} value={k}
            onChange={e => setK(Number(e.target.value))}
            style={{ flex: 1, maxWidth: '220px' }}
          />
        </div>

        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
          Training error:{' '}
          <strong style={{ color: errorColor }}>{k === 1 ? '0.0' : trainError}%</strong>
          {k === 1 && <span style={{ marginLeft: '0.6rem', color: '#5b8a5b' }}>← 1-NN always fits training set perfectly</span>}
          {k === N && <span style={{ marginLeft: '0.6rem', color: '#E67E22' }}>← k=N predicts global majority class</span>}
        </div>
      </div>

      <div style={{ marginTop: '0.6rem', display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
        {[['#2980B9', 'Class A'], ['#E67E22', 'Class B']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
