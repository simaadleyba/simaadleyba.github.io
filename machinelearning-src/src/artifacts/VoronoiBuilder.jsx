import { useRef, useState, useEffect, useCallback } from 'react';

const WIDTH = 360;
const HEIGHT = 360;

const CLS_FILL = ['#2980B9', '#E67E22'];
const CLS_BG = [
  [180, 220, 245, 210],
  [255, 215, 165, 210],
];

export default function VoronoiBuilder() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [activeClass, setActiveClass] = useState(0);
  const [queryMode, setQueryMode] = useState(false);
  const [queryPoint, setQueryPoint] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (points.length === 0) {
      ctx.fillStyle = '#eef1f8';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#8b9bd4';
      ctx.font = '14px Noto Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click to place training points', WIDTH / 2, HEIGHT / 2 - 8);
      ctx.font = '12px Noto Sans, sans-serif';
      ctx.fillText('Toggle class using the buttons below', WIDTH / 2, HEIGHT / 2 + 14);
      return;
    }

    // One pass: classify each pixel and detect boundary
    const pixelCls = new Uint8Array(WIDTH * HEIGHT);
    const imgData = ctx.createImageData(WIDTH, HEIGHT);
    const d = imgData.data;

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        let minD = Infinity, cls = 0;
        for (const pt of points) {
          const dx = x - pt.x, dy = y - pt.y;
          const dist = dx * dx + dy * dy;
          if (dist < minD) { minD = dist; cls = pt.cls; }
        }
        const i = y * WIDTH + x;
        pixelCls[i] = cls;
        const c = CLS_BG[cls];
        const base = i * 4;
        d[base] = c[0]; d[base + 1] = c[1]; d[base + 2] = c[2]; d[base + 3] = c[3];
      }
    }

    // Decision boundary
    const hasMulti = points.some(p => p.cls !== points[0].cls);
    if (hasMulti) {
      for (let y = 1; y < HEIGHT - 1; y++) {
        for (let x = 1; x < WIDTH - 1; x++) {
          const c = pixelCls[y * WIDTH + x];
          if (
            pixelCls[y * WIDTH + x - 1] !== c ||
            pixelCls[y * WIDTH + x + 1] !== c ||
            pixelCls[(y - 1) * WIDTH + x] !== c ||
            pixelCls[(y + 1) * WIDTH + x] !== c
          ) {
            const base = (y * WIDTH + x) * 4;
            d[base] = 45; d[base + 1] = 45; d[base + 2] = 85; d[base + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Training points
    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = CLS_FILL[pt.cls];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Query point
    if (queryPoint && points.length > 0) {
      const nearest = points.reduce((best, pt) => {
        const dx = queryPoint.x - pt.x, dy = queryPoint.y - pt.y;
        const dist = dx * dx + dy * dy;
        const bdx = queryPoint.x - best.x, bdy = queryPoint.y - best.y;
        return dist < bdx * bdx + bdy * bdy ? pt : best;
      });

      // Dashed line to nearest
      ctx.beginPath();
      ctx.moveTo(queryPoint.x, queryPoint.y);
      ctx.lineTo(nearest.x, nearest.y);
      ctx.strokeStyle = 'rgba(80,80,80,0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Query circle
      ctx.beginPath();
      ctx.arc(queryPoint.x, queryPoint.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = CLS_FILL[nearest.cls] + '44';
      ctx.fill();
      ctx.strokeStyle = CLS_FILL[nearest.cls];
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = CLS_FILL[nearest.cls];
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', queryPoint.x, queryPoint.y);
      ctx.textBaseline = 'alphabetic';
    }
  }, [points, queryPoint]);

  useEffect(() => { draw(); }, [draw]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (queryMode) {
      setQueryPoint({ x, y });
    } else {
      setPoints(prev => [...prev, { x, y, cls: activeClass }]);
    }
  };

  const btnBase = {
    padding: '0.25rem 0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  };

  const predClass = queryPoint && points.length > 0
    ? points.reduce((best, pt) => {
        const dx = queryPoint.x - pt.x, dy = queryPoint.y - pt.y;
        const dist = dx * dx + dy * dy;
        const bdx = queryPoint.x - best.x, bdy = queryPoint.y - best.y;
        return dist < bdx * bdx + bdy * bdy ? pt : best;
      }).cls
    : null;

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          maxWidth: `${WIDTH}px`,
          cursor: queryMode ? 'crosshair' : 'copy',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'block',
        }}
      />

      <div style={{ marginTop: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Class:</span>
        {[0, 1].map(cls => (
          <button
            key={cls}
            onClick={() => { setActiveClass(cls); setQueryMode(false); }}
            style={{
              ...btnBase,
              border: `2px solid ${activeClass === cls && !queryMode ? CLS_FILL[cls] : 'var(--border)'}`,
              background: activeClass === cls && !queryMode ? CLS_FILL[cls] : 'transparent',
              color: activeClass === cls && !queryMode ? '#fff' : 'var(--muted)',
            }}
          >
            {cls === 0 ? 'A (blue)' : 'B (orange)'}
          </button>
        ))}

        <button
          onClick={() => setQueryMode(q => { if (q) setQueryPoint(null); return !q; })}
          style={{
            ...btnBase,
            border: `1px solid ${queryMode ? 'var(--accent)' : 'var(--border)'}`,
            background: queryMode ? 'var(--accent-bg)' : 'transparent',
            color: queryMode ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          {queryMode ? '✓ Query mode' : '⊕ Query point'}
        </button>

        <button
          onClick={() => { setPoints([]); setQueryPoint(null); setQueryMode(false); }}
          style={{ ...btnBase, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)' }}
        >
          Clear
        </button>
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)', minHeight: '1.2em' }}>
        {points.length === 0
          ? 'Add at least 2 points from different classes to see the Voronoi diagram.'
          : `${points.filter(p => p.cls === 0).length} class A · ${points.filter(p => p.cls === 1).length} class B${predClass !== null ? ` · Query → predicted class ${predClass === 0 ? 'A' : 'B'}` : ''}`}
      </div>
    </div>
  );
}
