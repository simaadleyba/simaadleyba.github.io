
// Main.js - No imports, uses globals DataGen, Clustering, Viz

// State
let data = [];
let centers = [];
let k = 3;
let alpha = 0.0;

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Debug checks
    if (typeof d3 === 'undefined') {
        const msg = 'Error: D3.js not loaded. Check internet connection.';
        console.error(msg);
        document.getElementById('chart-container').innerHTML = `<div style="color:red">${msg}</div>`;
        return;
    }

    if (typeof DataGen === 'undefined' || typeof Clustering === 'undefined' || typeof Viz === 'undefined') {
        const msg = 'Error: Scripts not loaded correctly.';
        console.error(msg);
        document.getElementById('chart-container').innerHTML = `<div style="color:red">${msg}</div>`;
        return;
    }

    try {
        data = DataGen.generateData(300);
        console.log("Data generated:", data.length);

        centers = Clustering.initializeCenters(data, k);

        // Initial standard K-Means to ensure positions
        runClustering();

        // Initialize Viz
        const container = document.getElementById('canvas-container');
        if (!container) {
            console.error("Canvas container not found");
            return;
        }

        Viz.init('canvas-container', data);

        // Explicitly draw
        Viz.drawPoints(data);
        Viz.drawClusters(data, centers);

        setupScroll();
        setupControls();

    } catch (e) {
        console.error("Initialization error:", e);
        document.getElementById('chart-container').innerHTML = `<div style="color:red">JS Error: ${e.message}</div>`;
    }
});

function runClustering() {
    // Run simplified clustering loop
    for (let i = 0; i < 5; i++) {
        Clustering.assignClusters(data, centers);
        if (alpha > 0) {
            Clustering.enforceFairness(data, centers, alpha);
        }
        Clustering.updateCenters(data, centers);
    }

    const cost = Clustering.calculateCost(data, centers);
    updateChart(cost);
}

function setupControls() {
    const slider = document.getElementById('fairness-slider');
    const display = document.getElementById('alpha-value');

    slider.addEventListener('input', (e) => {
        alpha = parseFloat(e.target.value);
        display.textContent = alpha.toFixed(2);

        runClustering();
        Viz.drawPoints(data);
        Viz.drawClusters(data, centers);
    });
}

function setupScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                handleSection(id);

                // Highlight active step
                document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.step').forEach(step => {
        observer.observe(step);
    });
}

function handleSection(id) {
    switch (id) {
        case 'act-1':
            // Geometry alone
            // User enabled from start
            if (alpha !== 0) {
                alpha = 0;
                updateSlider(0, false); // Active
                runClustering();
                updateViz();
            } else {
                updateSlider(null, false); // Active
            }
            break;
        case 'act-2':
            updateSlider(null, false); // Enable it earlier per user request
            break;
        case 'act-3':
            // Simply enable it
            updateSlider(null, false);
            break;
        case 'act-4':
            // Don't force to 0.2. Just enable.
            updateSlider(null, false);
            break;
        case 'act-5':
            updateSlider(null, false);
            break;
    }
}

function updateSlider(val, disabled) {
    const slider = document.getElementById('fairness-slider');
    const display = document.getElementById('alpha-value');

    if (val !== null) {
        slider.value = val;
        alpha = val;
        display.innerText = val.toFixed(2);
    }
    slider.disabled = disabled;
}

function updateViz() {
    Viz.drawPoints(data);
    Viz.drawClusters(data, centers);
}

function updateChart(cost) {
    const container = document.getElementById('chart-container');
    const avgCost = Math.round(cost / data.length);
    container.innerHTML = `<div style="font-size: 0.8rem; color: #555; margin-top: 5px;">Avg Squared Distance: <strong>${avgCost}</strong></div>`;
}
