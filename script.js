let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currency = localStorage.getItem('currency') || 'INR'; // INR default currency

const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
const themeIcon = document.getElementById('themeIcon');
const menuBtn = document.getElementById('menuBtn');
const settingsDrawer = document.getElementById('settingsDrawer');
const closeDrawer = document.getElementById('closeDrawer');
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalExpenses = document.getElementById('totalExpenses');
const currencySelect = document.getElementById('currencySelect');
const resetData = document.getElementById('resetData');
const userNameInput = document.getElementById('userName');
const submitNameButton = document.getElementById('submitName');
const nameDisplay = document.getElementById('nameDisplay');
const nameInputContainer = document.getElementById('nameInputContainer');
const welcomeMessage = document.getElementById('welcomeMessage');
const editNameButton = document.getElementById('editName');

// Set the currency dropdown to the stored value or default to INR
currencySelect.value = currency;

// Check if dark mode is saved in localStorage or default to dark mode
const isDarkMode = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && true); // default to dark mode if not set
if (isDarkMode) {
    document.documentElement.classList.add('dark');
    themeText.innerText = 'Dark Mode';
    themeIcon.className = 'fas fa-moon';
} else {
    document.documentElement.classList.remove('dark');
    themeText.innerText = 'Light Mode';
    themeIcon.className = 'fas fa-sun';
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDarkMode = document.documentElement.classList.contains('dark');
    themeText.innerText = isDarkMode ? 'Dark Mode' : 'Light Mode';
    themeIcon.className = isDarkMode ? 'fas fa-moon' : 'fas fa-sun';

    // Save the theme preference in localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Menu drawer toggle
menuBtn.addEventListener('click', () => {
    settingsDrawer.classList.toggle('open');
});

closeDrawer.addEventListener('click', () => {
    settingsDrawer.classList.remove('open');
});

// Currency select handler
currencySelect.addEventListener('change', () => {
    currency = currencySelect.value;
    localStorage.setItem('currency', currency);
    updateExpenseList();
});

// Reset Data
resetData.addEventListener('click', () => {
    localStorage.removeItem('expenses');
    expenses = [];
    updateExpenseList();
});

// Add expense
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = new Date().toLocaleDateString();
    const uniqueID = Date.now();  // Unique ID based on timestamp

    if (!description || !amount || !category) return;

    expenses.push({ description, amount, category, date, uniqueID });
    localStorage.setItem('expenses', JSON.stringify(expenses));

    updateExpenseList();
    expenseForm.reset();  // Reset form fields
});

// Delete expense
function deleteExpense(id) {
    expenses = expenses.filter((expense) => expense.uniqueID !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseList();
}

// Update the expense list
function updateExpenseList() {
    expenseList.innerHTML = '';
    let total = 0;
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="py-2 px-4">${expense.date}</td>
            <td class="py-2 px-4">${expense.description}</td>
            <td class="py-2 px-4">${expense.category}</td>
            <td class="py-2 px-4">${currency} ${expense.amount.toFixed(2)}</td>
            <td class="py-2 px-4">
                <button onclick="deleteExpense(${expense.uniqueID})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        expenseList.appendChild(row);
        total += expense.amount;
    });
    totalExpenses.innerText = `${currency} ${total.toFixed(2)}`;
}

// Name input & display
submitNameButton.addEventListener('click', () => {
    const name = userNameInput.value;
    if (name) {
        localStorage.setItem('userName', name);
        welcomeMessage.classList.remove('hidden');
        nameDisplay.innerText = name;
        nameInputContainer.classList.add('hidden');
    }
});

// Edit name
editNameButton.addEventListener('click', () => {
    welcomeMessage.classList.add('hidden');
    nameInputContainer.classList.remove('hidden');
});

// Load saved data
window.onload = () => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
        welcomeMessage.classList.remove('hidden');
        nameDisplay.innerText = storedName;
        nameInputContainer.classList.add('hidden');
    }
    updateExpenseList();
};
