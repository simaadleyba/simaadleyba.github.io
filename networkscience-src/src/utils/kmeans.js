export function kmeans(points, k, rng, restarts = 8) {
  let best = null;
  for (let run = 0; run < restarts; run++) {
    const centers = [points[Math.floor(rng() * points.length)]];
    while (centers.length < k) {
      const d2 = points.map(p => Math.min(...centers.map(c => p.reduce((s, x, i) => s + (x - c[i]) ** 2, 0))));
      let r = rng() * d2.reduce((a, b) => a + b, 0), idx = 0;
      for (; idx < d2.length - 1; idx++) { r -= d2[idx]; if (r <= 0) break; }
      centers.push(points[idx]);
    }
    let labels = Array(points.length).fill(0);
    for (let iter = 0; iter < 30; iter++) {
      labels = points.map(p => centers.reduce((bestI, c, i) => {
        const d = p.reduce((s, x, j) => s + (x - c[j]) ** 2, 0);
        return d < bestI.d ? { i, d } : bestI;
      }, { i: 0, d: Infinity }).i);
      for (let c = 0; c < k; c++) {
        const group = points.filter((_, i) => labels[i] === c);
        if (group.length) centers[c] = centers[c].map((_, j) => group.reduce((s, p) => s + p[j], 0) / group.length);
      }
    }
    const cost = points.reduce((s, p, i) => s + p.reduce((z, x, j) => z + (x - centers[labels[i]][j]) ** 2, 0), 0);
    if (!best || cost < best.cost) best = { labels, centers, cost };
  }
  return best;
}
