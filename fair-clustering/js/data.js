
(function () {
    function generateData(n = 300) {
        const clusters = [
            { x: 300, y: 300, sigma: 40, probA: 0.9 }, // Mostly A
            { x: 500, y: 300, sigma: 40, probA: 0.1 }, // Mostly B
            { x: 400, y: 150, sigma: 30, probA: 0.5 }, // Mixed
        ];

        const width = 800; // Canvas abstract coords
        const height = 500;

        const data = [];
        for (let i = 0; i < n; i++) {
            const c = clusters[Math.floor(Math.random() * clusters.length)];
            // Box-Muller transform for Gaussian
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

            // Y coord
            const u2 = 1 - Math.random();
            const v2 = Math.random();
            const z2 = Math.sqrt(-2.0 * Math.log(u2)) * Math.cos(2.0 * Math.PI * v2);

            const x = c.x + z * c.sigma;
            const y = c.y + z2 * c.sigma;

            const group = Math.random() < c.probA ? 'A' : 'B';

            data.push({
                id: i,
                x: x,
                y: y,
                group: group,
                cluster: -1, // Assigned cluster index
                fixed: false
            });
        }
        return data;
    }

    // Export to global
    window.DataGen = {
        generateData: generateData
    };
})();
