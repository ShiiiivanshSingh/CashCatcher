const PREDEFINED = ["Food","BlinkIt","Entertainment","Shopping","Bills","Other"];
const EXCHANGE   = { INR:1, USD:0.012, EUR:0.011, GBP:0.0095, JPY:1.65 };
const SYMBOLS    = { INR:"₹", USD:"$", EUR:"€", GBP:"£", JPY:"¥" };
const BCOLORS    = ['#6366f1','#8b5cf6','#06b6d4','#f59e0b','#ef4444','#22c55e','#ec4899','#f97316'];

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currency = localStorage.getItem('currency') || 'INR';

/* ── UTILS ─────────────────────────────────────────────── */
function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = color || 'var(--success)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function convertAmt(amtINR, cur) { return amtINR * (EXCHANGE[cur] || 1); }
function fmtAmt(amtINR, cur) { return (SYMBOLS[cur] || '') + convertAmt(amtINR, cur).toFixed(2); }

function setTodayDate() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  document.getElementById('expenseDate').value = `${y}-${m}-${d}`;
}

/* ── THEME ─────────────────────────────────────────────── */
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  document.getElementById('themeText').textContent = dark ? 'Dark Mode' : 'Light Mode';
  document.getElementById('themeIcon').className = dark ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

document.getElementById('themeToggle').addEventListener('click', () => {
  applyTheme(!document.documentElement.classList.contains('dark'));
});

/* ── CURRENCY ───────────────────────────────────────────── */
document.getElementById('currencySelect').addEventListener('change', function () {
  currency = this.value;
  localStorage.setItem('currency', currency);
  renderExpenses();
});

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

/* ── NAME FLOW ──────────────────────────────────────────── */
document.getElementById('startTracking').addEventListener('click', () => {
  showScreen('screen-name');
  setTimeout(() => document.getElementById('userName').focus(), 80);
});

function submitName() {
  const name = document.getElementById('userName').value.trim();
  if (!name) return;
  localStorage.setItem('userName', name);
  document.getElementById('nameDisplay').textContent = name;
  showScreen('screen-app');
  renderExpenses();
}
document.getElementById('submitName').addEventListener('click', submitName);
document.getElementById('userName').addEventListener('keypress', e => {
  if (e.key === 'Enter') submitName();
});

document.getElementById('editName').addEventListener('click', () => {
  document.getElementById('userName').value = localStorage.getItem('userName') || '';
  showScreen('screen-name');
});

/* ── CATEGORY ───────────────────────────────────────────── */
document.getElementById('category').addEventListener('change', function () {
  document.getElementById('deleteCategory').style.display =
    this.value && !PREDEFINED.includes(this.value) ? 'flex' : 'none';
});

document.getElementById('editCategory').addEventListener('click', () => {
  const cat = prompt('Enter a new category name:');
  if (!cat || !cat.trim()) return;
  const clean = cat.trim();
  const sel = document.getElementById('category');
  if (Array.from(sel.options).some(o => o.value === clean)) {
    showToast('Category already exists', '#f59e0b');
    return;
  }
  const opt = document.createElement('option');
  opt.value = clean;
  opt.textContent = clean;
  sel.appendChild(opt);
  sel.value = clean;
  document.getElementById('deleteCategory').style.display = 'flex';
  showToast('Category added!');
});

document.getElementById('deleteCategory').addEventListener('click', () => {
  const sel = document.getElementById('category');
  const val = sel.value;
  if (!val || PREDEFINED.includes(val)) return;
  sel.querySelector(`option[value="${CSS.escape(val)}"]`).remove();
  sel.value = '';
  document.getElementById('deleteCategory').style.display = 'none';
});

/* ── FORM SUBMIT ────────────────────────────────────────── */
document.getElementById('expenseForm').addEventListener('submit', e => {
  e.preventDefault();
  const desc    = document.getElementById('description').value.trim();
  const amt     = parseFloat(document.getElementById('amount').value);
  const cat     = document.getElementById('category').value;
  const dateVal = document.getElementById('expenseDate').value;
  if (!desc || !amt || !cat || !dateVal) return;

  const displayDate = new Date(dateVal + 'T00:00:00').toLocaleDateString();
  expenses.push({
    description: desc,
    amount: amt / (EXCHANGE[currency] || 1),
    category: cat,
    date: displayDate,
    uniqueID: Date.now()
  });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();

  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  document.getElementById('deleteCategory').style.display = 'none';
  setTodayDate();
  showToast('Expense added!');
});

/* ── DELETE ─────────────────────────────────────────────── */
function deleteExpense(id) {
  expenses = expenses.filter(ex => ex.uniqueID !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  showToast('Deleted', '#ef4444');
}

/* ── RENDER ─────────────────────────────────────────────── */
function renderExpenses() {
  const tbody  = document.getElementById('expenseList');
  const sorted = [...expenses].sort((a, b) => b.uniqueID - a.uniqueID);
  let total = 0;
  tbody.innerHTML = '';

  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-receipt"></i>No expenses yet — add your first one!</div></td></tr>`;
  } else {
    sorted.forEach(ex => {
      total += convertAmt(ex.amount, currency);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color:var(--muted);font-size:0.82rem;white-space:nowrap">${ex.date}</td>
        <td style="font-weight:500">${ex.description}</td>
        <td><span class="badge">${ex.category}</span></td>
        <td class="amount-cell">${fmtAmt(ex.amount, currency)}</td>
        <td>
          <button onclick="deleteExpense(${ex.uniqueID})"
            class="btn-icon ghost"
            style="width:30px;height:30px;font-size:0.75rem;color:var(--danger);border-color:transparent;">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  const sym = SYMBOLS[currency] || '';
  document.getElementById('totalExpenses').textContent = sym + total.toFixed(2);
  const txText = sorted.length ? `${sorted.length} transaction${sorted.length > 1 ? 's' : ''}` : '0 transactions';
  document.getElementById('expenseCount').textContent = sorted.length ? txText : '';
  document.getElementById('txCount').textContent = txText;

  const catTotals = {};
  expenses.forEach(ex => {
    catTotals[ex.category] = (catTotals[ex.category] || 0) + convertAmt(ex.amount, currency);
  });
  const catEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxCat = catEntries[0]?.[1] || 1;
  const breakdown = document.getElementById('categoryBreakdown');

  if (!catEntries.length) {
    breakdown.innerHTML = '<div style="color:var(--muted);font-size:0.82rem;">No data yet</div>';
  } else {
    breakdown.innerHTML = catEntries.slice(0, 6).map(([cat, val], i) => `
      <div class="cat-bar-row">
        <div class="cat-bar-label">
          <span>${cat}</span>
          <span>${sym}${val.toFixed(2)}</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width:${(val / maxCat * 100).toFixed(1)}%;background:${BCOLORS[i % BCOLORS.length]}"></div>
        </div>
      </div>`).join('');
  }
}

/* ── RESET ──────────────────────────────────────────────── */
document.getElementById('resetData').addEventListener('click', () => {
  if (!confirm('Reset all expense data? This cannot be undone.')) return;
  localStorage.removeItem('expenses');
  expenses = [];
  renderExpenses();
  closeDrawerFn();
  showToast('All data cleared', '#ef4444');
});

/* ── INIT ───────────────────────────────────────────────── */
(function init() {
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme ? savedTheme === 'dark' : true);
  document.getElementById('currencySelect').value = currency;
  setTodayDate();

  const name = localStorage.getItem('userName');
  if (name) {
    document.getElementById('nameDisplay').textContent = name;
    showScreen('screen-app');
    renderExpenses();
  } else {
    showScreen('screen-landing');
  }
})();
