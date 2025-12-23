
(function () {

    // IMPACT CONSTANTS
    const IMPACT = {
        llm: {
            // range: [low, median, high]
            // Electricity Wh/msg
            electricity_Wh: { low: 0.2, median: 0.3, high: 2.9 },
            // Carbon g CO2e/msg
            carbon_g: { low: 0.03, median: 0.05, high: 0.7 },
            // Water mL/msg
            water_ml: { low: 5, median: 10, high: 519 }
        },
        driving: {
            // 170 g CO2 / km
            carbon_g_per_km: 170
        },
        coffee: {
            // 250 g CO2/cup, 140 L water/cup
            carbon_g: 250,
            water_L: 140
        },
        burger: {
            // 2700 g CO2/burger, 2400 L water/burger
            carbon_g: 2700,
            water_L: 2400
        }
    };

    /**
     * Calculates raw impact for N messages at a given uncertainty level
     * @param {number} messages 
     * @param {string} level 'low', 'median', 'high'
     */
    function calculateImpact(messages, level = 'median') {
        const elec = messages * IMPACT.llm.electricity_Wh[level];
        const carbon = messages * IMPACT.llm.carbon_g[level];
        const water_ml = messages * IMPACT.llm.water_ml[level];

        return {
            electricity_Wh: elec,
            carbon_g: carbon,
            water_L: water_ml / 1000 // Convert ml to L for easier comparison
        };
    }

    /**
     * Calculates equivalents based on carbon predominantly? 
     * Or selects best metric for each?
     * 
     * Driving: Carbon based.
     * Coffee: Carbon based (or Water? Carbon is usually the intuitive one for coffee).
     * Burger: Carbon based.
     */
    function calculateEquivalents(impacts) {
        return {
            km_driven: impacts.carbon_g / IMPACT.driving.carbon_g_per_km,
            coffee_cups: impacts.carbon_g / IMPACT.coffee.carbon_g,
            burgers: impacts.carbon_g / IMPACT.burger.carbon_g
        };
    }

    // Export
    window.ImpactLogic = {
        calculateImpact,
        calculateEquivalents
    };

})();
