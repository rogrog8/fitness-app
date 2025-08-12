class UI {
    constructor() {
        // Pemilihan semua elemen DOM
        this.pages = document.querySelectorAll('.page');
        this.mainMenu = document.querySelector('.main-menu');
        // KODE BARU di ui.js
        this.backButtons = document.querySelectorAll('.back-btn:not(#backToFitnessBtn):not(#backToWorkoutBtn)');
        this.currentDateEl = document.getElementById('currentDate');
        this.workoutDateDisplayEl = document.getElementById('workout-date-display');
        console.log('Elemen tanggal workout:', this.workoutDateDisplayEl);
        
        // Elemen Kalori & Riwayat
        this.calorieGoalEl = document.getElementById('calorieGoal');
        this.caloriesInEl = document.getElementById('caloriesIn');
        this.caloriesOutEl = document.getElementById('caloriesOut');
        this.caloriesRemainingEl = document.getElementById('caloriesRemaining');
        this.remainingLabelEl = document.getElementById('remainingLabel');
        this.remainingSubtextEl = document.getElementById('remainingSubtext');
        this.dashboardSection = document.getElementById('dashboardSection');
        this.historyListEl = document.getElementById('historyList');
        this.dailyChartCanvas = document.getElementById('dailyCalorieChart');
        this.chartLegendEl = document.getElementById('chartLegend');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // Elemen Makanan
        this.foodListLocalEl = document.getElementById('food-list-local');
        this.foodListApiEl = document.getElementById('food-list-api');
        this.foodSearchEl = document.getElementById('food-search');

        // Elemen Kalkulator
        this.tdeeResultEl = document.getElementById('tdee-result');
        this.calculatorResultEl = document.getElementById('calculator-result');
        
        // Elemen Weight Tracker
        this.weightChartCanvas = document.getElementById('weightChart');
        this.weightHistoryListEl = document.getElementById('weight-history-list');
        this.weightForm = document.getElementById('weight-form');
        this.weightInput = document.getElementById('weight-input');
        this.clearWeightBtn = document.getElementById('clear-weight-btn');

        // Elemen PR Tracker
        this.prForm = document.getElementById('pr-form');
        this.prExerciseSelect = document.getElementById('pr-exercise');
        this.prValueInput = document.getElementById('pr-value');
        this.prUnitEl = document.getElementById('pr-unit');
        this.prListEl = document.getElementById('pr-list');
        this.clearPrBtn = document.getElementById('clear-pr-btn');
        
        // Elemen Water Tracker
        this.waterCountEl = document.getElementById('water-count');
        this.waterTargetEl = document.getElementById('water-target');
        this.waterProgressEl = document.getElementById('water-progress');
        this.addWaterBtn = document.getElementById('add-water-btn');
        this.subtractWaterBtn = document.getElementById('subtract-water-btn');
        this.waterLinesContainer = document.getElementById('water-lines-container');

        // Properti Chart
        this.dailyChart = null;
        this.weightChart = null;
        this.calorieColors = ['#FF6B35', '#E05725', '#2D3436', '#FFD1B3', '#636E72', '#B2BEC3'];
    }

// GANTI DENGAN FUNGSI BARU INI
    showPage(pageIdToShow) {
    // ================================================================
    // BAGIAN BARU UNTUK MENGONTROL HEADER
    // ================================================================
    
    // 1. Tentukan halaman mana saja yang akan menyembunyikan header
    // Ganti atau tambahkan ID halaman sesuai kebutuhan Anda
    const pagesWithHiddenHeader = [
    'page-workout', 
    'page-calculator', 
    'page-food',
    'page-weight-tracker', // <-- TAMBAHKAN ID INI
    'page-pr-tracker'
    ];

    // 2. Cek apakah halaman yang akan ditampilkan ada di dalam daftar
    if (pagesWithHiddenHeader.includes(pageIdToShow)) {
        // Jika YA, tambahkan class ke body untuk sembunyikan header
        document.body.classList.add('header-hidden');
    } else {
        // Jika TIDAK (misal: kembali ke home), hapus class agar header muncul lagi
        document.body.classList.remove('header-hidden');
    }
    
    // ================================================================
    // Kode Anda yang sudah ada untuk menampilkan halaman (JANGAN DIHAPUS)
    // ================================================================
    this.pages.forEach(page => {
        if (page.id === pageIdToShow) {
            page.classList.remove('hidden');
        } else {
            page.classList.add('hidden');
        }
    });
}

    openModal(modal) { if(modal) modal.classList.remove('hidden'); }
    closeModal(modal) { if(modal) modal.classList.add('hidden'); }

    renderUI(todayData, userProfile) {
        const data = todayData || [];
        let totalCaloriesIn = 0;
        let totalCaloriesOut = 0;
        const exerciseData = [];

        data.forEach(item => {
            if (item.type === 'food') {
                totalCaloriesIn += item.calories;
            } else if (item.calories) {
                totalCaloriesOut += item.calories;
                exerciseData.push(item);
            }
        });

        const waterIntake = todayData ? (todayData.water || 0) : 0;
        this.renderWaterTracker(waterIntake, 8);

        const remaining = (userProfile.dailyGoal || 0) - totalCaloriesIn + totalCaloriesOut;
        this.calorieGoalEl.textContent = Math.round(userProfile.dailyGoal || 0);
        this.caloriesInEl.textContent = Math.round(totalCaloriesIn);
        this.caloriesOutEl.textContent = Math.round(totalCaloriesOut);
        
        this.remainingLabelEl.textContent = 'Jatah Hari Ini';
        this.caloriesRemainingEl.textContent = Math.round(remaining);
        this.remainingSubtextEl.textContent = 'Olahraga akan menambah jatah ini';
        this.remainingSubtextEl.style.color = '#FFFFFF';

        if (data.length > 0 || waterIntake > 0) {
            this.dashboardSection.classList.remove('hidden');
            
            if (data.length > 0) {
                this.clearAllBtn.classList.remove('hidden');
                this.historyListEl.innerHTML = '';
                data.sort((a, b) => b.id - a.id).forEach(item => this.renderHistoryItem(item));
            } else {
                this.clearAllBtn.classList.add('hidden');
                this.historyListEl.innerHTML = '<p>No activities logged for today.</p>';
            }
            
            const chartLabels = exerciseData.map(item => item.name);
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
            this.historyListEl.innerHTML = '<p>No activities logged for today.</p>';
        }
    }

    renderHistoryItem(item) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        let icon = '❓', detailsHTML = '', calorieDisplay = '';
        const name = item.name || item.type.replace('-', ' ');

        switch(item.type) {
            case 'food':
                icon = '🍎';
                detailsHTML = `Serving: ${item.serving}`;
                calorieDisplay = `<span>-${Math.round(item.calories)} kcal</span>`;
                break;
            default:
                icon = '💪';
                detailsHTML = `Amount: ${item.amount.toFixed(item.type === 'lari' ? 2 : 0)} ${this.getUnit(item.type)}`;
                if (item.duration) detailsHTML += ` &middot; Time: ${this.formatTime(item.duration)}`;
                calorieDisplay = `<span style="color: var(--success);">+${Math.round(item.calories)} kcal</span>`;
                break;
        }
        
        historyItem.innerHTML = `
            <div class="history-item-details-container">
                <div class="history-item-header">
                    <span style="text-transform: capitalize;">${icon} ${name}</span>
                    ${calorieDisplay}
                </div>
                <div class="history-item-details">${detailsHTML}</div>
            </div>
            <button class="delete-history-btn" data-id="${item.id}" title="Delete this entry">&times;</button>
        `;
        this.historyListEl.appendChild(historyItem);
    }
    
    renderFoodList(foods, title = "Common Foods") {
        const container = this.foodListLocalEl;
        container.innerHTML = `<h3 class="results-heading">${title}</h3>`;
        if (!foods || foods.length === 0) return;
        foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `<div class="food-item-info"><strong style="text-transform: capitalize;">${food.name}</strong><span>${Math.round(food.calories)} kcal per ${food.serving}</span></div><button class="add-food-btn" data-food-details='${JSON.stringify(food)}'>+</button>`;
            container.appendChild(foodItem);
        });
    }
    // Letakkan fungsi ini di dalam class UI di file ui.js
// Misalnya, di bawah fungsi renderFoodList

    renderApiFoodList(foods) {
    const container = this.foodListApiEl;
    container.innerHTML = '<h3 class="results-heading">Online Results</h3>';

    if (!foods || foods.length === 0) {
        container.innerHTML += '<p style="text-align: center; color: var(--text-light);">No online results found.</p>';
        return;
    }

    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        // Menggunakan JSON.stringify untuk data-food-details
        const foodDetails = JSON.stringify({
            name: food.name,
            calories: food.calories,
            serving: food.serving,
            type: 'food'
        });
        foodItem.innerHTML = `<div class="food-item-info"><strong style="text-transform: capitalize;">${food.name}</strong><span>${Math.round(food.calories)} kcal per ${food.serving}</span></div><button class="add-food-btn" data-food-details='${foodDetails}'>+</button>`;
        container.appendChild(foodItem);
    });
    }

    renderOrUpdateChart(labels, data) {
        if (this.dailyChart) this.dailyChart.destroy();
        this.dailyChart = new Chart(this.dailyChartCanvas, { type: 'pie', data: { labels: labels, datasets: [{ data: data, backgroundColor: this.calorieColors }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
        
        let legendHTML = '';
        labels.forEach((label, i) => {
            legendHTML += `<div class="legend-item"><div class="legend-label"><span class="legend-color" style="background-color: ${this.calorieColors[i % this.calorieColors.length]};"></span><span style="text-transform: capitalize;">${label}</span></div><span class="legend-value">${data[i]} kcal</span></div>`;
        });
        this.chartLegendEl.innerHTML = legendHTML;
    }

    renderWeightPage(history) {
        this.weightHistoryListEl.innerHTML = '';
        this.weightHistoryListEl.innerHTML = '';
        if (history.length === 0) {
        this.weightHistoryListEl.innerHTML = '<p>No weight history yet.</p>';
        if (this.weightChart) this.weightChart.destroy();
        // Sembunyikan tombol jika tidak ada riwayat
        this.clearWeightBtn.classList.add('hidden');
        return;
        }
            // Tampilkan tombol jika ADA riwayat
        this.clearWeightBtn.classList.remove('hidden');

        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const entryDate = new Date(entry.date).toLocaleDateString('en-GB');
            item.innerHTML = `<div class="history-item-header"><span>⚖️ ${entryDate}</span> <span class="history-separator">&middot;</span> <span>${entry.weight} kg</span></div>`;
            this.weightHistoryListEl.appendChild(item);
        });

        if (this.weightChart) this.weightChart.destroy();
        const chartData = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = chartData.map(entry => new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
        const data = chartData.map(entry => entry.weight);
        
        this.weightChart = new Chart(this.weightChartCanvas, {
            type: 'line',
            data: { labels: labels, datasets: [{ label: 'Weight (kg)', data: data, borderColor: 'var(--primary)', fill: true, tension: 0.1, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: 'var(--primary)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } }, plugins: { legend: { display: false } } }
        });
    }

    populatePRExercises(exercises) {
        this.prExerciseSelect.innerHTML = '';
        for (const key in exercises) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            this.prExerciseSelect.appendChild(option);
        }
    }

    renderPRPage(records, exercises) {
    this.prListEl.innerHTML = '';
    if (Object.keys(records).length === 0) {
        this.prListEl.innerHTML = '<p>No personal records yet. Add your first one!</p>';
        // Sembunyikan tombol jika tidak ada record
        this.clearPrBtn.classList.add('hidden'); 
        return;
    }

    // Tampilkan tombol jika ADA record
    this.clearPrBtn.classList.remove('hidden'); 

    for (const key in records) {
        const record = records[key];
        const exerciseName = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const unit = exercises[key] || '';
        const recordDate = new Date(record.date).toLocaleDateString('en-GB');
        const item = document.createElement('div');
        item.className = 'pr-item';
        item.innerHTML = `<div class="pr-item-icon">🏆</div><div class="pr-item-details"><strong>${exerciseName}</strong><span>${record.value} ${unit}</span></div><div class="pr-item-date">${recordDate}</div>`;
        this.prListEl.appendChild(item);
    }
    }

    renderWaterTracker(current, target) {
        if (!this.waterCountEl) return;
        const count = current || 0;
        const targetCount = target || 8;

        this.waterCountEl.textContent = count;
        this.waterTargetEl.textContent = targetCount;
        const percentage = Math.min((count / targetCount) * 100, 100);
        this.waterProgressEl.style.width = `${percentage}%`;

        if (this.waterLinesContainer) {
            this.waterLinesContainer.innerHTML = '';
            const colors = ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e'];
            for (let i = 0; i < count; i++) {
                const line = document.createElement('div');
                line.className = 'water-line';
                line.style.backgroundColor = colors[i % colors.length];
                this.waterLinesContainer.appendChild(line);
            }
        }
    }

    formatDate(dateString) { return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }); }
    formatTime(totalSeconds) { const mins = Math.floor(totalSeconds / 60); const secs = totalSeconds % 60; return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }
    getUnit(exercise) { if (exercise === 'plank') return 'seconds'; return 'reps'; }
}