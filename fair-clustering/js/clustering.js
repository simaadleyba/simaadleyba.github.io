
(function () {
    function distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    function initializeCenters(data, k) {
        // Randomly pick k points as initial centers
        const centers = [];
        const indices = new Set();
        while (indices.size < k) {
            const idx = Math.floor(Math.random() * data.length);
            if (!indices.has(idx)) {
                indices.add(idx);
                centers.push({ x: data[idx].x, y: data[idx].y, id: indices.size });
            }
        }
        return centers;
    }

    function assignClusters(data, centers) {
        let changed = false;
        data.forEach(p => {
            let minDist = Infinity;
            let bestC = -1;
            centers.forEach((c, i) => {
                const d = distance(p, c);
                if (d < minDist) {
                    minDist = d;
                    bestC = i;
                }
            });
            if (p.cluster !== bestC) {
                p.cluster = bestC;
                changed = true;
            }
        });
        return changed;
    }

    function updateCenters(data, centers) {
        centers.forEach((c, i) => {
            const points = data.filter(p => p.cluster === i);
            if (points.length === 0) return; // Empty cluster handling

            const sumX = points.reduce((s, p) => s + p.x, 0);
            const sumY = points.reduce((s, p) => s + p.y, 0);
            c.x = sumX / points.length;
            c.y = sumY / points.length;
        });
    }

    function calculateCost(data, centers) {
        return data.reduce((sum, p) => {
            if (p.cluster === -1) return sum;
            return sum + distance(p, centers[p.cluster]) ** 2;
        }, 0);
    }

    // Heuristic for Fair Assignment
    // Adjusts assignments to satisfy alpha constraint: count(Group X) / total >= alpha
    function enforceFairness(data, centers, alpha) {
        // Naive iterative swapper
        // We only swap if a cluster is violating.
        // Constraint: Balanced representation.

        // Safety break
        let maxIter = 100;
        let currentIter = 0;

        while (currentIter < maxIter) {
            let violations = false;

            // Check each cluster
            for (let i = 0; i < centers.length; i++) {
                const clusterPoints = data.filter(p => p.cluster === i);
                const total = clusterPoints.length;
                if (total === 0) continue;

                const countA = clusterPoints.filter(p => p.group === 'A').length;
                const countB = clusterPoints.filter(p => p.group === 'B').length;

                const ratioA = countA / total;
                const ratioB = countB / total;

                // Target counts needed
                // If RatioA < alpha, we need more A (or fewer B).
                // Strategy: Pull nearest A from neighbor, OR Push furthest B to neighbor.
                // Let's try "Pull nearest deficit-group member" first.

                if (ratioA < alpha) {
                    violations = true;
                    // Need more A. Find closest 'A' point NOT in this cluster.
                    // Sort all non-cluster 'A' points by distance to this center.
                    const candidates = data.filter(p => p.cluster !== i && p.group === 'A');
                    candidates.sort((a, b) => distance(a, centers[i]) - distance(b, centers[i]));

                    if (candidates.length > 0) {
                        // Reassign best candidate
                        candidates[0].cluster = i;
                    }
                } else if (ratioB < alpha) {
                    violations = true;
                    // Need more B.
                    const candidates = data.filter(p => p.cluster !== i && p.group === 'B');
                    candidates.sort((a, b) => distance(a, centers[i]) - distance(b, centers[i]));

                    if (candidates.length > 0) {
                        candidates[0].cluster = i;
                    }
                }
            }

            if (!violations) break;
            currentIter++;
        }

        return currentIter;
    }

    window.Clustering = {
        initializeCenters,
        assignClusters,
        updateCenters,
        calculateCost,
        enforceFairness
    };
})();
