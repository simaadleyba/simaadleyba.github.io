
(function () {
    const width = 800;
    const height = 400;

    let svg;
    let xScale, yScale;
    let pointsLayer, centersLayer, voronoiLayer;

    function init(containerId, data) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        svg = d3.select(container).append('svg')
            .attr('viewBox', `0 0 800 400`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        xScale = d3.scaleLinear().domain([0, 800]).range([0, 800]);
        yScale = d3.scaleLinear().domain([0, 400]).range([0, 400]);

        // Layers
        voronoiLayer = svg.append('g').attr('class', 'voronoi');
        pointsLayer = svg.append('g').attr('class', 'points');
        centersLayer = svg.append('g').attr('class', 'centers');

        // drawPoints(data); // Called explicitly later
    }

    function drawPoints(data) {
        if (!pointsLayer) return;
        const circles = pointsLayer.selectAll('circle')
            .data(data, d => d.id);

        circles.enter().append('circle')
            .attr('r', 5)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('fill', d => d.group === 'A' ? '#4a90e2' : '#f5a623')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8)
            .merge(circles)
            .transition().duration(500)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y));
    }

    function drawClusters(data, centers) {
        if (!processCenters(centers)) return;

        // Draw centers
        const cNodes = centersLayer.selectAll('rect')
            .data(centers);

        cNodes.enter().append('rect')
            .attr('width', 15).attr('height', 15)
            .attr('x', d => xScale(d.x) - 7.5)
            .attr('y', d => yScale(d.y) - 7.5)
            .attr('fill', '#333')
            .attr('transform', d => `rotate(45, ${xScale(d.x)}, ${yScale(d.y)})`)
            .merge(cNodes)
            .transition().duration(500)
            .attr('x', d => xScale(d.x) - 7.5)
            .attr('y', d => yScale(d.y) - 7.5);


        // Better: Colored Hulls for each cluster
        // Use d3.polygonHull
        const hulls = [];
        centers.forEach((c, i) => {
            const clusterPoints = data.filter(d => d.cluster === i).map(d => [xScale(d.x), yScale(d.y)]);
            // Add center to ensure hull exists even if 1 point
            clusterPoints.push([xScale(c.x), yScale(c.y)]);

            if (clusterPoints.length > 2) {
                const hull = d3.polygonHull(clusterPoints);
                if (hull) hulls.push({ id: i, path: hull });
            }
        });

        const hullPaths = voronoiLayer.selectAll('path')
            .data(hulls, d => d.id);

        hullPaths.enter().append('path')
            .attr('fill', '#999')
            .attr('fill-opacity', 0.1)
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .merge(hullPaths)
            .transition().duration(500)
            .attr('d', d => `M${d.path.join('L')}Z`);

        hullPaths.exit().remove();
    }

    function processCenters(centers) {
        return (centers && centers.length > 0);
    }

    window.Viz = {
        init,
        drawPoints,
        drawClusters
    };

})();
