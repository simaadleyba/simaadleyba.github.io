/**
 * Finance Tracker Logic
 * Fetches data from Google Sheets (CSV published) and renders dashboard
 */

// Global State
const state = {
    transactions: [],
    filteredTransactions: [],
    filters: {
        startDate: null,
        endDate: null,
        cards: new Set(),
        categories: new Set()
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 20
    },
    charts: {
        category: null,
        trend: null
    }
};

// Utils
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    showLoading(true);
    try {
        await fetchData();
        setupFilters();
        updateDashboard();
        setupEventListeners();
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Data Fetching
async function fetchData() {
    // Check if config exists and has the CSV URL
    if (!CONFIG.csvUrl || CONFIG.csvUrl.includes('YOUR_PUBLISHED_CSV_URL_HERE')) {
        throw new Error('Configuration missing. Please set the csvUrl in config.js');
    }

    const response = await fetch(CONFIG.csvUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // Skip header row if it exists (usually starts with "Date")
    const startIdx = (rows.length > 0 && rows[0][0] === 'Date') ? 1 : 0;
    const dataRows = rows.slice(startIdx);

    // Columns expected: 
    // 0:Date, 1:Amount, 2:Currency, 3:Category, 4:Card, 5:Description, 6:EmailDate, 7:EmailID
    state.transactions = dataRows.map(row => {
        if (row.length < 5) return null; // Skip empty/malformed rows

        // Amount parsing: "1.098,00" -> 1098.00
        let amount = 0;
        // Check if amount is string (needs cleaning) or number
        if (row[1]) {
            let val = row[1];
            if (typeof val === 'string') {
                // Clean currency symbols, spaces
                let clean = val.replace(/[^\d.,-]/g, '');
                // Turkish format: dots are thousands, comma is decimal
                // Remove dots, replace comma with dot
                clean = clean.replace(/\./g, '').replace(',', '.');
                amount = parseFloat(clean);
            } else {
                amount = Number(val);
            }
        }

        if (isNaN(amount)) amount = 0;

        return {
            date: new Date(row[0]),
            amount: amount,
            currency: row[2] || 'TL',
            category: row[3] || 'Unknown',
            card: row[4] || 'Unknown',
            description: row[5] || '',
            id: row[7] || ''
        };
    }).filter(t => t !== null) // Remove nulls
        .sort((a, b) => b.date - a.date); // Sort by date desc

    // Initialize filters
    if (!state.filters.startDate) {
        state.filters.startDate = new Date();
        state.filters.startDate.setDate(state.filters.startDate.getDate() - 30); // Last 30 days default
    }
    if (!state.filters.endDate) {
        state.filters.endDate = new Date();
    }

    // Populate unique sets
    const cards = new Set(state.transactions.map(t => t.card).filter(Boolean));
    const categories = new Set(state.transactions.map(t => t.category).filter(Boolean));

    state.filters.cards = cards;
    state.filters.categories = categories;

    renderFilterOptions(cards, categories);
}

// Simple CSV Parser that handles quoted fields
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++;
            } else {
                // Toggle quote
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            // End of line
            if (char === '\r' && nextChar === '\n') i++; // Handle CRLF

            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    // Push last field/row if exists
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
}

// Logic
function filterTransactions() {
    state.filteredTransactions = state.transactions.filter(t => {
        const inDateRange = t.date >= state.filters.startDate && t.date <= state.filters.endDate;
        const inCard = state.filters.cards.has(t.card);
        const inCategory = state.filters.categories.has(t.category);

        // Search text check
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const matchesSearch = !searchInput ||
            (t.description && t.description.toLowerCase().includes(searchInput)) ||
            (t.category && t.category.toLowerCase().includes(searchInput)) ||
            (t.card && t.card.toLowerCase().includes(searchInput));

        return inDateRange && inCard && inCategory && matchesSearch;
    });
}

function updateDashboard() {
    filterTransactions();

    // reset page
    state.pagination.currentPage = 1;

    renderSummary();
    renderCharts();
    renderTable();
}

// Rendering
function renderFilterOptions(cards, categories) {
    const cardContainer = document.querySelector('#cardFilterDropdown .dropdown-content');
    cardContainer.innerHTML = '';
    cards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" checked value="${card}" data-type="card">
                ${card}
            </label>
        `;
        cardContainer.appendChild(div);
    });

    const catContainer = document.querySelector('#categoryFilterDropdown .dropdown-content');
    catContainer.innerHTML = '';
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" checked value="${cat}" data-type="category">
                ${cat}
            </label>
        `;
        catContainer.appendChild(div);
    });
}

function renderSummary() {
    const data = state.filteredTransactions;

    // 1. Total Spent
    const total = data.reduce((sum, t) => sum + t.amount, 0);

    // 2. Daily Average
    let daysDiff = 1;
    if (state.filters.startDate && state.filters.endDate) {
        const diffTime = Math.abs(state.filters.endDate - state.filters.startDate);
        daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }
    const dailyAvg = total / daysDiff;

    // 3. Trend
    const duration = state.filters.endDate - state.filters.startDate;
    const prevEnd = new Date(state.filters.startDate);
    const prevStart = new Date(prevEnd.getTime() - duration);

    const prevData = state.transactions.filter(t => {
        const inDate = t.date >= prevStart && t.date < prevEnd;
        const inCard = state.filters.cards.has(t.card);
        const inCategory = state.filters.categories.has(t.category);
        return inDate && inCard && inCategory;
    });

    const prevTotal = prevData.reduce((sum, t) => sum + t.amount, 0);
    let trendText = '-';
    let trendColor = 'var(--text)';

    if (prevTotal > 0) {
        const change = ((total - prevTotal) / prevTotal) * 100;
        const symbol = change > 0 ? '+' : '';
        trendText = `${symbol}${change.toFixed(1)}%`;
        trendColor = change > 0 ? '#E76F51' : '#2A9D8F';
    } else if (total > 0 && prevTotal === 0) {
        trendText = '+Inf%';
    }

    // 4. Top Category
    const catTotals = {};
    data.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCats.length > 0 ? sortedCats[0] : null;

    document.getElementById('totalSpent').textContent = formatCurrency(total);

    // Daily Average
    const daEl = document.getElementById('dailyAverage');
    if (daEl) daEl.textContent = formatCurrency(dailyAvg);

    // Trend
    const trendEl = document.getElementById('trendIndicator');
    if (trendEl) {
        trendEl.textContent = trendText;
        trendEl.style.color = trendColor;
    }

    document.getElementById('topCategory').textContent = topCat ? topCat[0] : '-';
}

function renderTable() {
    const tbody = document.querySelector('#transactionsTable tbody');
    tbody.innerHTML = '';

    const start = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
    const end = start + state.pagination.itemsPerPage;
    const pageData = state.filteredTransactions.slice(start, end);

    pageData.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(t.date)}</td>
            <td>${formatCurrency(t.amount)}</td>
            <td>${t.category}</td>
            <td>${t.card}</td>
            <td>${t.description}</td>
        `;
        tbody.appendChild(tr);
    });

    // Pagination controls
    const totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${state.pagination.currentPage} of ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = state.pagination.currentPage === 1;
    document.getElementById('nextPage').disabled = state.pagination.currentPage >= totalPages;
}

function renderCharts() {
    // New Palette
    const colors = [
        '#16425B', // Yale Blue
        '#2F6690', // Baltic Blue
        '#3A7CA5', // Steel Blue
        '#81C3D7', // Sky Blue (Light)
        '#D9DCD6'  // Dust Grey
    ];

    // 1. Category Pie Chart
    const catTotals = {};
    state.filteredTransactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    // Sort by value desc
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const labels = sortedCats.map(x => x[0]);
    const data = sortedCats.map(x => x[1]);

    const ctxCat = document.getElementById('categoryChart').getContext('2d');

    if (state.charts.category) state.charts.category.destroy();

    state.charts.category = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            },
            cutout: '60%'
        }
    });

    // 2. Trend Line Chart
    const dateGroups = {};
    const sortedTrans = [...state.filteredTransactions].sort((a, b) => a.date - b.date);

    sortedTrans.forEach(t => {
        const dateKey = t.date.toISOString().split('T')[0]; // YYYY-MM-DD
        dateGroups[dateKey] = (dateGroups[dateKey] || 0) + t.amount;
    });

    const dates = Object.keys(dateGroups);
    const amounts = Object.values(dateGroups);

    const ctxTrend = document.getElementById('trendChart').getContext('2d');

    if (state.charts.trend) state.charts.trend.destroy();

    state.charts.trend = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Spending',
                data: amounts,
                borderColor: '#16425B',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(47, 102, 144, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    display: false // Hide long list of dates
                },
                y: {
                    display: false,
                    beginAtZero: true
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Dropdowns
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.parentElement.classList.toggle('open');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    });

    document.querySelectorAll('.dropdown-content').forEach(c => {
        c.addEventListener('click', e => e.stopPropagation());
        c.addEventListener('change', (e) => {
            if (e.target.tagName === 'INPUT') {
                const val = e.target.value;
                const type = e.target.dataset.type;
                const checked = e.target.checked;

                if (type === 'card') {
                    checked ? state.filters.cards.add(val) : state.filters.cards.delete(val);
                } else if (type === 'category') {
                    checked ? state.filters.categories.add(val) : state.filters.categories.delete(val);
                }
                updateDashboard();
            }
        });
    });

    // Date Inputs
    const startIn = document.getElementById('startDate');
    const endIn = document.getElementById('endDate');

    startIn.addEventListener('change', (e) => {
        if (e.target.value) {
            state.filters.startDate = new Date(e.target.value);
            updateDashboard();
        }
    });

    endIn.addEventListener('change', (e) => {
        if (e.target.value) {
            state.filters.endDate = new Date(e.target.value);
            // End of day
            state.filters.endDate.setHours(23, 59, 59);
            updateDashboard();
        }
    });

    // Quick Ranges
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const range = btn.dataset.range;
            const end = new Date();
            const start = new Date();

            if (range === 'all') {
                start.setFullYear(2020);
            } else {
                start.setDate(end.getDate() - parseInt(range));
            }

            state.filters.startDate = start;
            state.filters.endDate = end;

            // Update inputs
            startIn.valueAsDate = start;
            endIn.valueAsDate = end;

            updateDashboard();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', () => {
        updateDashboard();
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (state.pagination.currentPage > 1) {
            state.pagination.currentPage--;
            renderTable();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
        if (state.pagination.currentPage < totalPages) {
            state.pagination.currentPage++;
            renderTable();
        }
    });
}
