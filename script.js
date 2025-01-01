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

const editCategoryButton = document.getElementById('editCategory');
const categorySelect = document.getElementById('category');
const deleteCategoryButton = document.getElementById('deleteCategory');
const categoryNotification = document.getElementById('categoryNotification');

// Handle custom category input when the pencil icon is clicked
editCategoryButton.addEventListener('click', () => {
    const customCategory = prompt("Enter a custom category:");

    if (customCategory) {
        // Check if the category already exists
        const existingCategories = Array.from(categorySelect.options).map(option => option.value);

        if (!existingCategories.includes(customCategory)) {
            // Add the custom category to the dropdown
            const newOption = document.createElement('option');
            newOption.value = customCategory;
            newOption.textContent = customCategory;
            categorySelect.appendChild(newOption);

            // Show success notification
            categoryNotification.classList.remove('hidden');
            setTimeout(() => {
                categoryNotification.classList.add('hidden');
            }, 3000);  // Hide notification after 3 seconds
        } else {
            alert("This category already exists.");
        }
    }
});

// Handle deleting a custom category when the trash icon is clicked
deleteCategoryButton.addEventListener('click', () => {
    const selectedCategory = categorySelect.value;

    if (selectedCategory && selectedCategory !== "") {
        // Check if it's a custom category (not predefined)
        const predefinedCategories = ["Food", "BlinkIt", "Entertainment", "Shopping", "Bills", "Other"];
        
        if (!predefinedCategories.includes(selectedCategory)) {
            const optionToRemove = categorySelect.querySelector(`option[value="${selectedCategory}"]`);
            categorySelect.removeChild(optionToRemove);
        } else {
            alert("You cannot delete predefined categories.");
        }
    } else {
        alert("Please select a category to delete.");
    }
});

// Show delete button when a custom category is selected
categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    const predefinedCategories = ["Food", "BlinkIt", "Entertainment", "Shopping", "Bills", "Other"];

    // Show the delete button if a custom category is selected
    if (selectedCategory && !predefinedCategories.includes(selectedCategory)) {
        deleteCategoryButton.classList.remove('hidden');
    } else {
        deleteCategoryButton.classList.add('hidden');
    }
});

// Exchange rates (INR is the base currency)
const exchangeRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.65
};

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

    // Store the expense amount in INR, regardless of the selected currency
    expenses.push({ description, amount: amount / (exchangeRates[currency] || 1), category, date, uniqueID, currency: 'INR' });
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

// Convert amount from INR to selected currency
function convertCurrency(amount, targetCurrency) {
    if (targetCurrency === 'INR') {
        return amount; // No conversion needed if INR is selected
    }
    return amount * exchangeRates[targetCurrency]; // Convert using the exchange rate
}

// Update the expense list and convert amounts based on the selected currency
function updateExpenseList() {
    expenseList.innerHTML = '';
    let total = 0;

     // Sort expenses by date in descending order
    expenses.reverse().sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(expense => {
        const convertedAmount = convertCurrency(expense.amount, currency); // Convert amount based on selected currency
        const row = document.createElement('tr');
        row.className = 'border-b border-opacity-10';
        row.innerHTML = `
            <td class="py-2 px-4">${expense.date}</td>
            <td class="py-2 px-4">${expense.description}</td>
            <td class="py-2 px-4">${expense.category}</td>
            <td class="py-2 px-4">${currency} ${convertedAmount.toFixed(2)}</td>
            <td class="py-2 px-4">
                <button onclick="deleteExpense(${expense.uniqueID})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        expenseList.appendChild(row);
        total += convertedAmount;
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
