
(function () {

    const slider = document.getElementById('llm-slider');
    const valDisplay = document.getElementById('llm-val');
    const toggleBtns = document.querySelectorAll('.toggle-btn');

    let currentLevel = 'median';

    function init() {
        if (!slider) return;

        slider.addEventListener('input', update);

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                toggleBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                currentLevel = e.target.dataset.level;
                update();
            });
        });

        update();
    }

    function update() {
        const messages = parseInt(slider.value);
        valDisplay.textContent = messages.toLocaleString();

        const impacts = ImpactLogic.calculateImpact(messages, currentLevel);
        const equivalents = ImpactLogic.calculateEquivalents(impacts);

        // Update Equivalents
        updateValue('val-drive', equivalents.km_driven, 1);
        updateValue('val-coffee', equivalents.coffee_cups, 1);
        updateValue('val-burger', equivalents.burgers, 1);

        // Update Raw Metrics
        document.getElementById('raw-elec').textContent = formatMetric(impacts.electricity_Wh, 'Wh');
        document.getElementById('raw-co2').textContent = formatMetric(impacts.carbon_g, 'g CO₂e');
        document.getElementById('raw-water').textContent = formatMetric(impacts.water_L * 1000, 'mL', true); // Show mL usually, or L if huge? 
        // Logic returned L. Let's format intelligently.
    }

    function updateValue(id, val, decimals = 0) {
        const el = document.getElementById(id);
        if (el) {
            // If < 0.1, show more precision?
            if (val > 0 && val < 1) {
                el.innerText = val.toFixed(1);
            } else {
                el.innerText = Math.round(val).toLocaleString();
            }
        }
    }

    function formatMetric(val, unit, isWater = false) {
        // Water special case: if > 1000 mL, show L
        if (isWater && val >= 1000) {
            return (val / 1000).toFixed(1) + ' L';
        }

        if (val > 10000) {
            // 12.5 kg?
            if (unit === 'g CO₂e') return (val / 1000).toFixed(1) + ' kg CO₂e';
            if (unit === 'Wh') return (val / 1000).toFixed(1) + ' kWh';
        }

        return Math.round(val).toLocaleString() + ' ' + unit;
    }

    document.addEventListener('DOMContentLoaded', init);

})();
