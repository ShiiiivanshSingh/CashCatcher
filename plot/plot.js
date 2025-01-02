window.onload = function () {
    console.log("DOM fully loaded");

    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('settingsDrawer').classList.toggle('hidden');
    });

    document.getElementById('closeDrawer').addEventListener('click', () => {
        document.getElementById('settingsDrawer').classList.add('hidden');
    });

    const categoryData = {};
    const monthlyData = {};
    const dayOfWeekData = {};
    const expenseBreakdown = [];

    expenses.forEach(expense => {
        if (!categoryData[expense.category]) {
            categoryData[expense.category] = 0;
        }
        categoryData[expense.category] += expense.amount;

        const month = new Date(expense.date).getMonth();
        if (!monthlyData[expense.category]) {
            monthlyData[expense.category] = Array(12).fill(0);
        }
        monthlyData[expense.category][month] += expense.amount;

        const dayOfWeek = new Date(expense.date).getDay();
        if (!dayOfWeekData[dayOfWeek]) {
            dayOfWeekData[dayOfWeek] = 0;
        }
        dayOfWeekData[dayOfWeek] += expense.amount;

        expenseBreakdown.push({
            description: expense.description,
            amount: expense.amount
        });
    });

    console.log("Expense Data:", expenses);

    const categoryLabels = Object.keys(categoryData);
    const categoryValues = Object.values(categoryData);
    new Chart(document.getElementById('categoryPieChart'), {
        type: 'pie',
        data: {
            labels: categoryLabels,
            datasets: [{
                label: 'Spending Distribution',
                data: categoryValues,
                backgroundColor: ['#ff9800', '#f44336', '#4caf50', '#2196f3', '#9c27b0'],
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    titleColor: 'white',
                    bodyColor: 'white'
                }
            }
        }
    });

    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayValues = Object.values(dayOfWeekData);
    new Chart(document.getElementById('dayPieChart'), {
        type: 'pie',
        data: {
            labels: dayLabels,
            datasets: [{
                label: 'Expenditure by Day',
                data: dayValues,
                backgroundColor: ['#9c27b0', '#2196f3', '#4caf50', '#b9df94', '#4caf50', '#e91e63', '#8bc34a'],
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    titleColor: 'white',
                    bodyColor: 'white'
                }
            }
        }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    new Chart(document.getElementById('categoryBarChart'), {
        type: 'bar',
        data: {
            labels: months,
            datasets: Object.keys(monthlyData).map(category => ({
                label: category,
                data: monthlyData[category],
                backgroundColor: '#4caf50',
                borderColor: '#388e3c',
                borderWidth: 0
            }))
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });

    const dateData = {};
    expenses.forEach(expense => {
        const date = expense.date;
        if (!dateData[date]) {
            dateData[date] = 0;
        }
        dateData[date] += expense.amount;
    });
    const dateLabels = Object.keys(dateData);
    const dateValues = Object.values(dateData);
    new Chart(document.getElementById('spendingLineChart'), {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'Spending Trends',
                data: dateValues,
                borderColor: '#2196f3',
                backgroundColor: '#64b5f6',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });

    const heatmapData = Array(7).fill(0);
    Object.keys(dayOfWeekData).forEach(day => {
        heatmapData[day] = dayOfWeekData[day];
    });
    new Chart(document.getElementById('spendingHeatmap'), {
        type: 'bar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Spending by Day of Week',
                data: heatmapData,
                backgroundColor: '#ff5722',
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });
};
