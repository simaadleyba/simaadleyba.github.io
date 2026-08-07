export function jacobiEigen(input) {
  const n = input.length;
  const a = input.map(row => [...row]);
  const v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  for (let sweep = 0; sweep < 80 * Math.max(n, 1); sweep++) {
    let p = 0, q = 1, max = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(a[i][j]) > max) { max = Math.abs(a[i][j]); p = i; q = j; }
    if (max < 1e-10 || n < 2) break;
    const theta = .5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
    const c = Math.cos(theta), s = Math.sin(theta);
    for (let i = 0; i < n; i++) if (i !== p && i !== q) {
      const aip = a[i][p], aiq = a[i][q];
      a[i][p] = a[p][i] = c * aip - s * aiq;
      a[i][q] = a[q][i] = s * aip + c * aiq;
    }
    const app = a[p][p], aqq = a[q][q], apq = a[p][q];
    a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    a[p][q] = a[q][p] = 0;
    for (let i = 0; i < n; i++) { const vip = v[i][p], viq = v[i][q]; v[i][p] = c * vip - s * viq; v[i][q] = s * vip + c * viq; }
  }
  const order = a.map((row, i) => ({ value: row[i], i })).sort((x, y) => x.value - y.value);
  return { values: order.map(o => o.value), vectors: order.map(o => v.map(row => row[o.i])) };
}
