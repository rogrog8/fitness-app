export class UI {
    constructor() {
        // Pemilihan semua elemen DOM
        this.pages = document.querySelectorAll('.page');
        this.mainMenu = document.querySelector('.main-menu');
        this.backButtons = document.querySelectorAll('.back-btn');
        this.currentDateEl = document.getElementById('currentDate');
        this.calorieGoalEl = document.getElementById('calorieGoal');
        this.caloriesInEl = document.getElementById('caloriesIn');
        this.caloriesOutEl = document.getElementById('caloriesOut');
        this.caloriesRemainingEl = document.getElementById('caloriesRemaining');
        this.dashboardSection = document.getElementById('dashboardSection');
        this.historyListEl = document.getElementById('historyList');
        this.dailyChartCanvas = document.getElementById('dailyCalorieChart');
        this.chartLegendEl = document.getElementById('chartLegend');
        this.foodListLocalEl = document.getElementById('food-list-local');
        this.foodListApiEl = document.getElementById('food-list-api');
        this.tdeeResultEl = document.getElementById('tdee-result');
        this.calculatorResultEl = document.getElementById('calculator-result');
        this.foodSearchEl = document.getElementById('food-search');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.dailyChart = null;
        this.calorieColors = ['#FF6B35', '#E05725', '#2D3436', '#FFD1B3', '#636E72', '#B2BEC3'];
    }

    showPage(pageIdToShow) {
        this.pages.forEach(page => {
            page.id === pageIdToShow ? page.classList.remove('hidden') : page.classList.add('hidden');
        });
    }

    openModal(modal) { modal.classList.remove('hidden'); }
    closeModal(modal) { modal.classList.add('hidden'); }

    renderUI(todayData, userProfile) {
        let totalCaloriesIn = 0, totalCaloriesOut = 0;
        const exerciseData = [];
        todayData.sort((a, b) => b.id - a.id);
        todayData.forEach(item => {
            if (item.type === 'food') {
                totalCaloriesIn += item.calories;
            } else if (['push-up', 'sit-up', 'squat', 'plank', 'lari'].includes(item.type)) {
                totalCaloriesOut += item.calories;
                exerciseData.push(item);
            }
        });
        
        // ==========================================================
        // PERBAIKAN LOGIKA UTAMA DI SINI
        // Target Bertambah jika Makan, Berkurang jika Olahraga
        // ==========================================================
        const remaining = userProfile.dailyGoal + totalCaloriesIn - totalCaloriesOut;

        this.calorieGoalEl.textContent = Math.round(userProfile.dailyGoal);
        this.caloriesInEl.textContent = Math.round(totalCaloriesIn);
        this.caloriesOutEl.textContent = Math.round(totalCaloriesOut);
        this.caloriesRemainingEl.textContent = Math.round(remaining);
        
        if (todayData.length > 0) {
            this.dashboardSection.classList.remove('hidden');
            this.clearAllBtn.classList.remove('hidden');
            this.historyListEl.innerHTML = '';
            todayData.forEach(item => this.renderHistoryItem(item));
            const chartLabels = exerciseData.map(item => item.type.replace('-', ' '));
            const chartData = exerciseData.map(item => Math.round(item.calories));
            if (exerciseData.length > 0) {
                this.renderOrUpdateChart(chartLabels, chartData);
            } else {
                if (this.dailyChart) this.dailyChart.destroy();
                this.chartLegendEl.innerHTML = '';
            }
        } else {
            this.dashboardSection.classList.add('hidden');
            this.clearAllBtn.classList.add('hidden');
        }
    }

    renderHistoryItem(item) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        let icon = '❓', detailsHTML = '', calorieDisplay = '';
        switch(item.type) {
            case 'food':
                icon = '🍎';
                detailsHTML = `Serving: ${item.serving}`;
                calorieDisplay = `<span>+${Math.round(item.calories)} kcal</span>`; // Makan menambah target
                break;
            case 'stress':
                 // Tidak menampilkan kalori untuk stres
                icon = '🧘';
                detailsHTML = `Stress level recorded: ${item.level}`;
                break;
            default: // Olahraga
                icon = '💪';
                detailsHTML = `Amount: ${item.amount.toFixed(item.type === 'lari' ? 2 : 0)} ${this.getUnit(item.type)}`;
                if (item.duration) detailsHTML += ` &middot; Time: ${this.formatTime(item.duration)}`;
                calorieDisplay = `<span style="color: var(--danger);">${-Math.round(item.calories)} kcal</span>`; // Olahraga mengurangi target
                break;
        }
        historyItem.innerHTML = `<div class="history-item-details-container"><div class="history-item-header"><span style="text-transform: capitalize;">${icon} ${item.name || item.type.replace('-', ' ')}</span>${calorieDisplay}</div><div class="history-item-details">${detailsHTML}</div></div><button class="delete-history-btn" data-id="${item.id}" title="Delete this entry">&times;</button>`;
        this.historyListEl.appendChild(historyItem);
    }

    renderFoodList(foods, title = null) {
        const container = title ? this.foodListLocalEl : this.foodListApiEl;
        container.innerHTML = '';
        if (!foods || foods.length === 0) {
            if (title === null) {
                container.innerHTML = `<p style="text-align: center; color: var(--text-light);">No online results found.</p>`;
            }
            return;
        }

        if (title) {
            container.innerHTML = `<h3 class="results-heading">${title}</h3>`;
        }
        foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `<div class="food-item-info"><strong style="text-transform: capitalize;">${food.name}</strong><span>${Math.round(food.calories)} kcal per ${food.serving}</span></div><button class="add-food-btn" data-food-details='${JSON.stringify(food)}'>+</button>`;
            container.appendChild(foodItem);
        });
    }

    renderApiFoodList(foods) {
        const container = this.foodListApiEl;
        container.innerHTML = '';
        if (!foods || foods.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-light);">No online results found.</p>`;
            return;
        }
        container.innerHTML = `<h3 class="results-heading">Online Results</h3>`;
        foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `<div class="food-item-info"><strong style="text-transform: capitalize;">${food.name}</strong><span>${Math.round(food.calories)} kcal per ${food.serving}</span></div><button class="add-food-btn" data-food-details='${JSON.stringify(food)}'>+</button>`;
            container.appendChild(foodItem);
        });
    }

    renderOrUpdateChart(labels, data) {
        if (this.dailyChart) this.dailyChart.destroy();
        this.dailyChart = new Chart(this.dailyChartCanvas, { type: 'pie', data: { labels: labels, datasets: [{ label: 'Calories Burned', data: data, backgroundColor: this.calorieColors, borderColor: '#FFFFFF', borderWidth: 2, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } } } });
        let legendHTML = '';
        if (this.dailyChart && this.dailyChart.data.labels.length > 0) {
            this.dailyChart.data.labels.forEach((label, i) => {
                const value = this.dailyChart.data.datasets[0].data[i];
                const color = this.calorieColors[i % this.calorieColors.length];
                legendHTML += `<div class="legend-item"><div class="legend-label"><span class="legend-color" style="background-color: ${color};"></span>${label}</div><span class="legend-value">${value} kcal</span></div>`;
            });
        }
        this.chartLegendEl.innerHTML = legendHTML;
    }
    
    formatDate(dateString) { const date = new Date(dateString + 'T00:00:00'); const options = { weekday: 'long', day: 'numeric', month: 'long' }; return date.toLocaleDateString('en-US', options); }
    formatTime(totalSeconds) { const mins = Math.floor(totalSeconds / 60); const secs = totalSeconds % 60; return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    getUnit(exercise) { if (['lari', 'running'].includes(exercise)) return 'km'; if (exercise === 'plank') return 'seconds'; return 'reps'; }
}