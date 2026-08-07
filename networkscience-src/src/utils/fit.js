export function olsFit(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0, sst = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
    sst += (ys[i] - my) ** 2;
  }
  const slope = den ? num / den : 0;
  const intercept = my - slope * mx;
  const sse = ys.reduce((s, y, i) => s + (y - intercept - slope * xs[i]) ** 2, 0);
  return { slope, intercept, r2: sst ? 1 - sse / sst : 1 };
}

export function logBin(values, base = 2) {
  const bins = new Map();
  values.forEach(v => {
    const i = Math.floor(Math.log(Math.max(v, 1e-12)) / Math.log(base));
    bins.set(i, (bins.get(i) || 0) + 1);
  });
  return [...bins].map(([i, count]) => {
    const lo = base ** i, hi = base ** (i + 1);
    return { x: Math.sqrt(lo * hi), y: count / values.length / (hi - lo) };
  }).sort((a, b) => a.x - b.x);
}

export function ccdf(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.map((x, i) => ({ x, y: (sorted.length - i) / sorted.length }));
}

export function hillEstimator(values, xmin) {
  const tail = values.filter(v => v >= xmin);
  const den = tail.reduce((s, x) => s + Math.log(x / xmin), 0);
  return den > 0 ? 1 + tail.length / den : NaN;
}
