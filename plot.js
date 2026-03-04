const SYMBOLS  = { INR:"₹", USD:"$", EUR:"€", GBP:"£", JPY:"¥" };
const EXCHANGE = { INR:1, USD:0.012, EUR:0.011, GBP:0.0095, JPY:1.65 };
const COLORS   = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#ef4444','#22c55e','#ec4899','#f97316'];

const currency = localStorage.getItem('currency') || 'INR';
const sym = SYMBOLS[currency] || '₹';

function toDisplay(v) { return v * (EXCHANGE[currency] || 1); }
function fmt(v) { return sym + toDisplay(v).toFixed(2); }
function isDark() { return document.documentElement.classList.contains('dark'); }

/* ── THEME ─────────────────────────────────────────────── */
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  document.getElementById('themeText').textContent = dark ? 'Dark Mode' : 'Light Mode';
  document.getElementById('themeIcon').className = dark ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

document.getElementById('themeToggle').addEventListener('click', () => applyTheme(!isDark()));

/* ── DRAWER ─────────────────────────────────────────────── */
function openDrawer() {
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('settingsDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawerFn() {
  document.getElementById('settingsDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('menuBtn').addEventListener('click', openDrawer);
document.getElementById('closeDrawer').addEventListener('click', closeDrawerFn);
document.getElementById('drawerOverlay').addEventListener('click', closeDrawerFn);

/* ── CHART HELPERS ──────────────────────────────────────── */
function legendOpts() {
  return { labels: { color: isDark() ? '#e8e9f0' : '#111218', font: { family: 'DM Sans' }, boxWidth: 12, padding: 14 } };
}
function scaleOpts() {
  const grid = isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const tick = isDark() ? '#6b6e85' : '#7a7d96';
  return {
    x: { ticks: { color: tick, font: { family: 'DM Sans' } }, grid: { color: grid } },
    y: { beginAtZero: true, ticks: { color: tick, font: { family: 'DM Sans' } }, grid: { color: grid } }
  };
}
function tooltipFmt() {
  return { callbacks: { label: ctx => ` ${sym}${Number(ctx.parsed).toFixed(2)}` } };
}

/* ── RENDER EMPTY ───────────────────────────────────────── */
function renderEmpty() {
  document.getElementById('mainContent').innerHTML = `
    <div class="card">
      <div class="plot-empty-state">
        <i class="fas fa-chart-pie"></i>
        <p>No expense data yet.</p>
        <a href="index.html" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Add Expenses</a>
      </div>
    </div>`;
}

/* ── RENDER CHARTS ──────────────────────────────────────── */
function renderCharts(expenses) {
  const catData = {}, monthData = {}, dowData = {}, dateData = {};
  let total = 0;

  expenses.forEach(ex => {
    const a = ex.amount || 0;
    total += a;
    catData[ex.category] = (catData[ex.category] || 0) + a;

    const d = new Date(ex.date);
    const mo  = isNaN(d) ? 0 : d.getMonth();
    const dow = isNaN(d) ? 0 : d.getDay();

    if (!monthData[ex.category]) monthData[ex.category] = Array(12).fill(0);
    monthData[ex.category][mo] += a;
    dowData[dow] = (dowData[dow] || 0) + a;
    dateData[ex.date] = (dateData[ex.date] || 0) + a;
  });

  const topCat = Object.entries(catData).sort((a, b) => b[1] - a[1])[0];
  const dowArr = Array(7).fill(0);
  Object.keys(dowData).forEach(d => { dowArr[+d] = dowData[d]; });
  const peakDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dowArr.indexOf(Math.max(...dowArr))];

  document.getElementById('mainContent').innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Total Spent</div>
        <div class="stat-value">${fmt(total)}</div>
        <div class="stat-sub">${expenses.length} transaction${expenses.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Top Category</div>
        <div class="stat-value" style="font-size:1rem;font-family:inherit">${topCat ? topCat[0] : '—'}</div>
        <div class="stat-sub">${topCat ? fmt(topCat[1]) : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Peak Day</div>
        <div class="stat-value" style="font-size:1rem;font-family:inherit">${peakDay}</div>
        <div class="stat-sub">most spending</div>
      </div>
    </div>
    <div class="charts-grid">
      <div class="card"><div class="card-title">Spending Distribution</div><canvas id="categoryPieChart"></canvas></div>
      <div class="card"><div class="card-title">Expenditure by Day</div><canvas id="dayPieChart"></canvas></div>
      <div class="card"><div class="card-title">Monthly Breakdown</div><canvas id="categoryBarChart"></canvas></div>
      <div class="card"><div class="card-title">Spending by Day of Week</div><canvas id="spendingHeatmap"></canvas></div>
    </div>
    <div class="card chart-full">
      <div class="card-title">Spending Trends Over Time</div>
      <canvas id="spendingLineChart" style="max-height:320px"></canvas>
    </div>`;

  new Chart(document.getElementById('categoryPieChart'), {
    type: 'doughnut',
    data: { labels: Object.keys(catData), datasets: [{ data: Object.values(catData).map(toDisplay), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 6 }] },
    options: { responsive: true, cutout: '58%', plugins: { legend: legendOpts(), tooltip: tooltipFmt() } }
  });

  new Chart(document.getElementById('dayPieChart'), {
    type: 'doughnut',
    data: { labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], datasets: [{ data: dowArr.map(toDisplay), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 6 }] },
    options: { responsive: true, cutout: '58%', plugins: { legend: legendOpts(), tooltip: tooltipFmt() } }
  });

  new Chart(document.getElementById('categoryBarChart'), {
    type: 'bar',
    data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: Object.keys(monthData).map((cat, i) => ({
        label: cat,
        data: monthData[cat].map(toDisplay),
        backgroundColor: COLORS[i % COLORS.length],
        borderRadius: 4, borderWidth: 0
      }))
    },
    options: { responsive: true, scales: scaleOpts(), plugins: { legend: legendOpts() } }
  });

  new Chart(document.getElementById('spendingHeatmap'), {
    type: 'bar',
    data: {
      labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      datasets: [{ label: 'Spending', data: dowArr.map(toDisplay), backgroundColor: COLORS, borderRadius: 4, borderWidth: 0 }]
    },
    options: { responsive: true, scales: scaleOpts(), plugins: { legend: { display: false } } }
  });

  const sortedDates = Object.keys(dateData).sort((a, b) => new Date(a) - new Date(b));
  new Chart(document.getElementById('spendingLineChart'), {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: [{
        label: 'Daily Spending',
        data: sortedDates.map(d => toDisplay(dateData[d])),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true, tension: 0.4, pointRadius: 4,
        pointBackgroundColor: '#6366f1', borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: { ...scaleOpts(), x: { ...scaleOpts().x, ticks: { ...scaleOpts().x.ticks, maxTicksLimit: 10 } } },
      plugins: { legend: legendOpts() }
    }
  });
}

/* ── INIT ───────────────────────────────────────────────── */
(function init() {
  applyTheme(localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme'));
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  if (!expenses.length) renderEmpty();
  else renderCharts(expenses);
})();
