import { mulberry32 } from './random';

export function forceLayout(n, edges, opts = {}) {
  const width = opts.width || 380, height = opts.height || 300, iterations = opts.iterations || 100;
  const rng = mulberry32(opts.seed || 1);
  const pos = Array.from({ length: n }, () => ({ x: 20 + rng() * (width - 40), y: 20 + rng() * (height - 40) }));
  const k = Math.sqrt(width * height / Math.max(n, 1));
  for (let step = 0; step < iterations; step++) {
    const force = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y, d = Math.hypot(dx, dy) + 0.1;
      const f = k * k / d / 12; force[i].x += dx / d * f; force[i].y += dy / d * f; force[j].x -= dx / d * f; force[j].y -= dy / d * f;
    }
    edges.forEach(([a, b]) => {
      const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.hypot(dx, dy) + 0.1;
      const f = d * d / k / 30; force[a].x += dx / d * f; force[a].y += dy / d * f; force[b].x -= dx / d * f; force[b].y -= dy / d * f;
    });
    pos.forEach((p, i) => { p.x = Math.max(12, Math.min(width - 12, p.x + force[i].x)); p.y = Math.max(12, Math.min(height - 12, p.y + force[i].y)); });
  }
  return pos;
}
