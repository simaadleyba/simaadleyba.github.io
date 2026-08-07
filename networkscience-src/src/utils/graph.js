import { makeUnionFind } from './unionFind';
import { randInt, shuffle } from './random';

export function buildAdj(n, edges) {
  const adj = Array.from({ length: n }, () => new Set());
  edges.forEach(([a, b]) => { if (a !== b) { adj[a].add(b); adj[b].add(a); } });
  return adj;
}

export function components(n, edges, active = null) {
  const uf = makeUnionFind(n);
  edges.forEach(([a, b]) => {
    if ((!active || active.has(a)) && (!active || active.has(b))) uf.union(a, b);
  });
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    if (active && !active.has(i)) continue;
    const r = uf.find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(i);
  }
  return [...groups.values()];
}

export function bfsDistances(adj, start) {
  const d = Array(adj.length).fill(Infinity); d[start] = 0;
  const q = [start];
  for (let h = 0; h < q.length; h++) {
    const v = q[h];
    adj[v].forEach(w => { if (!Number.isFinite(d[w])) { d[w] = d[v] + 1; q.push(w); } });
  }
  return d;
}

export function largestComponentFraction(n, edges, active = null) {
  const total = active ? active.size : n;
  if (!total) return 0;
  return Math.max(...components(n, edges, active).map(c => c.length), 0) / n;
}

export function degreeSequence(n, edges) {
  const d = Array(n).fill(0);
  edges.forEach(([a, b]) => { d[a]++; d[b]++; });
  return d;
}

export function moments(degrees) {
  const k1 = degrees.reduce((a, b) => a + b, 0) / degrees.length;
  const k2 = degrees.reduce((a, b) => a + b * b, 0) / degrees.length;
  return { k1, k2, kappa: k1 ? k2 / k1 : 0 };
}

export function configModel(degrees, rng) {
  const stubs = [];
  degrees.forEach((d, i) => { for (let j = 0; j < d; j++) stubs.push(i); });
  shuffle(rng, stubs);
  const edges = [], seen = new Set();
  for (let i = 0; i + 1 < stubs.length; i += 2) {
    const a = stubs[i], b = stubs[i + 1], key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a !== b && !seen.has(key)) { seen.add(key); edges.push([a, b]); }
  }
  return edges;
}

export function erdosRenyi(n, p, rng) {
  const edges = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rng() < p) edges.push([i, j]);
  return edges;
}

export function barabasiAlbert(n, m, rng) {
  const edges = [], degrees = Array(n).fill(0);
  const initial = Math.min(n, m + 1);
  for (let i = 0; i < initial; i++) for (let j = i + 1; j < initial; j++) {
    edges.push([i, j]); degrees[i]++; degrees[j]++;
  }
  for (let v = initial; v < n; v++) {
    const targets = new Set();
    while (targets.size < Math.min(m, v)) {
      const total = degrees.slice(0, v).reduce((a, b) => a + b, 0);
      let r = rng() * total, pick = 0;
      for (; pick < v - 1; pick++) { r -= degrees[pick]; if (r <= 0) break; }
      targets.add(pick);
    }
    targets.forEach(t => { edges.push([v, t]); degrees[v]++; degrees[t]++; });
  }
  return edges;
}

export function ringLattice(n, z) {
  const edges = [];
  for (let i = 0; i < n; i++) for (let d = 1; d <= z / 2; d++) if (i < (i + d) % n) edges.push([i, (i + d) % n]);
  return edges;
}

export function randomRegular(n, z, rng) {
  return configModel(Array(n).fill(z), rng);
}

export function edgeBetweenness(n, edges) {
  const adj = buildAdj(n, edges), score = new Map();
  edges.forEach(([a, b]) => score.set(a < b ? `${a}-${b}` : `${b}-${a}`, 0));
  for (let s = 0; s < n; s++) {
    const stack = [], pred = Array.from({ length: n }, () => []), sigma = Array(n).fill(0), dist = Array(n).fill(-1);
    sigma[s] = 1; dist[s] = 0; const q = [s];
    for (let h = 0; h < q.length; h++) {
      const v = q[h]; stack.push(v);
      adj[v].forEach(w => {
        if (dist[w] < 0) { q.push(w); dist[w] = dist[v] + 1; }
        if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; pred[w].push(v); }
      });
    }
    const delta = Array(n).fill(0);
    while (stack.length) {
      const w = stack.pop();
      pred[w].forEach(v => {
        const c = sigma[w] ? sigma[v] / sigma[w] * (1 + delta[w]) : 0;
        const key = v < w ? `${v}-${w}` : `${w}-${v}`;
        score.set(key, (score.get(key) || 0) + c); delta[v] += c;
      });
    }
  }
  score.forEach((v, k) => score.set(k, v / 2));
  return score;
}
