export function makeUnionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const sizes = Array(n).fill(1);
  let count = n;
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (sizes[a] < sizes[b]) [a, b] = [b, a];
    parent[b] = a; sizes[a] += sizes[b]; count--;
    return true;
  }
  return { find, union, sizes, get count() { return count; } };
}
