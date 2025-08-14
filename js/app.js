function debounce(func, delay = 500) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

class App {
    constructor() {
        this.ui = new UI();
        this.fitnessDiary = Storage.getFitnessDiary();
        this.userProfile = Storage.getUserProfile() || { dailyGoal: 0 };
        this.today = new Date().toISOString().split('T')[0];
        this.foodDataArray = Object.entries(foodDatabase).map(([name, details]) => ({ name, ...details }));
        
        this.weightHistory = Storage.getWeightHistory();
        this.personalRecords = Storage.getPersonalRecords();
        this.prExercises = {
            'push-up': 'reps',
            'sit-up': 'reps',
            'squat': 'kg',
            'plank': 'seconds',
            '5k-run': 'minutes'
        };
        
        this.loadEventListeners();
        this.loadInitialData();
    }

    loadEventListeners() {
    // Navigasi
    this.ui.mainMenu.addEventListener('click', (e) => this.navigate(e));
    this.ui.backButtons.forEach(btn => btn.addEventListener('click', () => this.ui.showPage('page-home')));
    
    // Kalkulator
    document.getElementById('calorie-calculator-form').addEventListener('submit', (e) => this.calculateAndSaveTDEE(e));
    
    // Makanan
    document.getElementById('food-search').addEventListener('input', (e) => this.handleFoodSearch(e));
    document.getElementById('page-food').addEventListener('click', (e) => this.addFood(e));
    
    // Workout & Modal
    document.getElementById('strengthBtn').addEventListener('click', () => this.ui.openModal(document.getElementById('strengthModal')));
    document.getElementById('exerciseRefBtn').addEventListener('click', () => this.ui.openModal(document.getElementById('refModal')));
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', () => this.ui.closeModal(document.getElementById(btn.dataset.modalId))));
    document.getElementById('saveStrengthBtn').addEventListener('click', () => this.saveStrengthWorkout());
    
    // Tombol Aksi Baru
    document.getElementById('weightTrackerBtn').addEventListener('click', () => {
        this.ui.showPage('page-weight-tracker');
        this.ui.renderWeightPage(this.weightHistory);
        // Tambahkan kode ini di akhir fungsi renderWeightPage(history) di ui.js
    const backToFitnessBtn = document.getElementById('backToFitnessBtn');
    if (backToFitnessBtn) {
    backToFitnessBtn.addEventListener('click', () => {
        // Asumsi 'app' adalah instance global dari kelas App
        app.ui.showPage('page-workout');
    });
    }
    });

    // KODE BARU YANG SUDAH DIPERBAIKI
    document.getElementById('prTrackerBtn').addEventListener('click', () => {
        this.ui.showPage('page-pr-tracker');
        this.ui.renderPRPage(this.personalRecords, this.prExercises);

        // DAFTARKAN EVENT LISTENER DI SINI
        // Kita tambahkan 'once: true' agar event hanya ditambahkan sekali
        this.ui.prExerciseSelect.addEventListener('change', (e) => {
            const selectedExercise = e.target.value;
            // Baris penyebab error sudah kita nonaktifkan
            // this.ui.prUnitEl.textContent = this.prExercises[selectedExercise];
        }, { once: true });
    });

    // Form Fitur Baru
    this.ui.weightForm.addEventListener('submit', (e) => this.saveWeightEntry(e));
    this.ui.prForm.addEventListener('submit', (e) => this.savePersonalRecord(e));

    // Water Tracker
    this.ui.addWaterBtn.addEventListener('click', () => this.updateWaterIntake(1));
    this.ui.subtractWaterBtn.addEventListener('click', () => this.updateWaterIntake(-1));

    // Riwayat
    this.ui.historyListEl.addEventListener('click', (e) => this.handleHistoryClick(e));
    this.ui.clearAllBtn.addEventListener('click', () => this.clearAllActivities());
    
    // Tombol "Back to Genie Fitness" di halaman Weight Tracker
    const backToFitnessBtn = document.getElementById('backToFitnessBtn');
    if (backToFitnessBtn) {
        backToFitnessBtn.addEventListener('click', () => {
            this.ui.showPage('page-workout');
        });
    }

    // Tombol "Back to Genie Fitness" di halaman Personal Records
    const backToWorkoutBtn = document.getElementById('backToWorkoutBtn');
    if (backToWorkoutBtn) {
        backToWorkoutBtn.addEventListener('click', () => {
            this.ui.showPage('page-workout');
        });
    }
    document.getElementById('clear-pr-btn').addEventListener('click', () => this.clearAllPersonalRecords());
    document.getElementById('clear-weight-btn').addEventListener('click', () => this.clearAllWeightHistory());
    }

    navigate(e) {
        const menuCard = e.target.closest('.menu-card');
        if (!menuCard) return;
        const pageId = menuCard.dataset.page;
        this.ui.showPage(pageId);
    }
    
    saveWeightEntry(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const weightInput = this.ui.weightInput;
        const weight = parseFloat(weightInput.value);

        if (!weight || weight <= 0) {
            alert('Please enter a valid weight.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const todayEntryIndex = this.weightHistory.findIndex(entry => entry.date === today);
        if (todayEntryIndex > -1) {
            this.weightHistory[todayEntryIndex].weight = weight;
        } else {
            this.weightHistory.push({ date: today, weight: weight });
        }
        Storage.saveWeightHistory(this.weightHistory);
        this.ui.renderWeightPage(this.weightHistory);
        alert('Weight saved successfully!');
        weightInput.value = '';
    }

    // Method baru untuk menghapus semua riwayat berat badan
    clearAllWeightHistory() {
    if (confirm('Are you sure you want to delete weight history?')) {

        // 1. Kosongkan data riwayat di aplikasi
        this.weightHistory = [];

        // 2. Simpan array kosong ke dalam storage
        Storage.saveWeightHistory(this.weightHistory);

        // 3. Perbarui tampilan UI untuk menampilkan daftar yang kosong
        this.ui.renderWeightPage(this.weightHistory);
    }
    }

    savePersonalRecord(e) {
        e.preventDefault();
        const exercise = this.ui.prExerciseSelect.value;
        const value = parseFloat(this.ui.prValueInput.value);

        if (!exercise || !value || value <= 0) {
            alert('Please fill all fields with valid values.');
            return;
        }
        const currentRecord = this.personalRecords[exercise];
        if (currentRecord && value <= currentRecord.value && exercise !== '5k-run') {
            alert(`Your current record is ${currentRecord.value}. Keep trying!`);
            return;
        }
        if (currentRecord && value >= currentRecord.value && exercise === '5k-run') {
            alert(`Your current record is ${currentRecord.value} minutes. Keep trying!`);
            return;
        }
        this.personalRecords[exercise] = {
            value: value,
            date: new Date().toISOString().split('T')[0]
        };
        Storage.savePersonalRecords(this.personalRecords);
        this.ui.renderPRPage(this.personalRecords, this.prExercises);
        this.ui.prValueInput.value = '';
        alert('New personal record saved!');
    }
    // Method baru untuk menghapus semua personal record
    clearAllPersonalRecords() {
    // 1. Minta konfirmasi pengguna untuk mencegah kesalahan
    if (confirm('Are you sure you want to delete personal record?')) {

        // 2. Kosongkan data record di aplikasi
        this.personalRecords = {}; 

        // 3. Simpan objek kosong ke dalam storage
        Storage.savePersonalRecords(this.personalRecords);

        // 4. Perbarui tampilan UI untuk menampilkan daftar yang kosong
        this.ui.renderPRPage(this.personalRecords, this.prExercises);
    }
    }
    
updateWaterIntake(change) {
    // Jika data hari ini belum ada, buat struktur objek baru
    if (!this.fitnessDiary[this.today]) {
        this.fitnessDiary[this.today] = { activities: [], water: 0 };
    }
    let currentWater = this.fitnessDiary[this.today].water || 0;
    currentWater = Math.max(0, currentWater + change);
    // Simpan jumlah air di properti 'water'
    this.fitnessDiary[this.today].water = currentWater;
    Storage.saveFitnessDiary(this.fitnessDiary);
    this.ui.renderUI(this.fitnessDiary[this.today], this.userProfile);
}

logActivity(logObject) {
    const todayEntry = this.fitnessDiary[this.today];

    // PERBAIKAN: Cek jika data hari ini tidak ada ATAU formatnya salah (masih array)
    if (!todayEntry || Array.isArray(todayEntry)) {
        // Jika ya, buat struktur objek yang benar.
        const oldWater = (Array.isArray(todayEntry) && todayEntry.water) ? todayEntry.water : 0;
        this.fitnessDiary[this.today] = { activities: (Array.isArray(todayEntry) ? todayEntry : []), water: oldWater };
    }

    logObject.id = Date.now();
    this.fitnessDiary[this.today].activities.push(logObject); // Sekarang ini pasti aman
    Storage.saveFitnessDiary(this.fitnessDiary);
    this.ui.renderUI(this.fitnessDiary[this.today], this.userProfile);
}
deleteLog(idToDelete) {
    if (!this.fitnessDiary[this.today]) return;
    // Lakukan filter pada array 'activities'
    this.fitnessDiary[this.today].activities = this.fitnessDiary[this.today].activities.filter(item => String(item.id) !== idToDelete);
    Storage.saveFitnessDiary(this.fitnessDiary);
    this.ui.renderUI(this.fitnessDiary[this.today], this.userProfile);
}
clearAllActivities() {
    if (confirm('Are you sure you want to delete all activities?')) {
        if (this.fitnessDiary[this.today]) {
            // Hanya kosongkan array 'activities', biarkan data air tetap ada
            this.fitnessDiary[this.today].activities = [];
            Storage.saveFitnessDiary(this.fitnessDiary);
            this.ui.renderUI(this.fitnessDiary[this.today], this.userProfile);
        }
    }
}
    handleHistoryClick(e) {
        const deleteButton = e.target.closest('.delete-history-btn');
        if (deleteButton) {
            if (confirm('Are you sure?')) { this.deleteLog(deleteButton.dataset.id); }
        }
    }
    calculateAndSaveTDEE(e) {
        e.preventDefault();
        const form = document.getElementById('calorie-calculator-form');
        const gender = form.elements['gender'].value, age = Number(form.elements['age'].value), weight = Number(form.elements['weight'].value), height = Number(form.elements['height'].value), activityLevel = Number(form.elements['activity-level'].value);
        if(!age || !weight || !height) return alert('Please fill all fields.');
        let bmr = (gender === 'male') ? (10 * weight + 6.25 * height - 5 * age + 5) : (10 * weight + 6.25 * height - 5 * age - 161);
        const tdee = bmr * activityLevel;
        this.userProfile.dailyGoal = tdee;
        Storage.saveUserProfile(this.userProfile);
        this.ui.tdeeResultEl.textContent = Math.round(tdee);
        this.ui.calculatorResultEl.classList.remove('hidden');
        alert(`Daily calorie goal updated to ${Math.round(tdee)} kcal!`);
        this.ui.renderUI(this.fitnessDiary[this.today] || [], this.userProfile);
    }
    handleFoodSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const localResults = this.foodDataArray.filter(food => food.name.toLowerCase().includes(searchTerm));
        this.ui.renderFoodList(localResults);
        this.debouncedSearchAPI(searchTerm);
    }
    debouncedSearchAPI = debounce(searchTerm => this.searchFoodAPI(searchTerm));
    async searchFoodAPI(searchTerm) {
        if (searchTerm.length < 3) {
            this.ui.foodListApiEl.innerHTML = '';
            return;
        }
        this.ui.foodListApiEl.innerHTML = `<p style="text-align: center;">Searching...</p>`;
        try {
            const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&search_simple=1&action=process&json=1&page_size=10`);
            const data = await response.json();
            if (data.products && data.products.length > 0) {
                const formattedFoods = data.products.map(p => ({ name: p.product_name || 'Unknown', calories: p.nutriments['energy-kcal_100g'] || 0, serving: p.quantity || '100g' })).filter(f => f.calories > 0);
                this.ui.renderApiFoodList(formattedFoods);
            } else { this.ui.foodListApiEl.innerHTML = `<p style="text-align: center;">No online results.</p>`; }
        } catch (error) { console.error('Error fetching food data:', error); this.ui.foodListApiEl.innerHTML = `<p style="text-align: center; color: red;">Could not connect.</p>`; }
    }
    addFood(e) {
        const addBtn = e.target.closest('.add-food-btn');
        if (addBtn) {
            const foodDetails = JSON.parse(addBtn.dataset.foodDetails);
            if (foodDetails) {
                this.logActivity({ type: 'food', name: foodDetails.name, calories: foodDetails.calories, serving: foodDetails.serving });
                alert(`${foodDetails.name} has been added.`);
                this.ui.foodSearchEl.value = '';
                this.ui.renderFoodList(this.foodDataArray.slice(0, 10), 'Common Foods');
                this.ui.foodListApiEl.innerHTML = '';
            }
        }
    }
    saveStrengthWorkout() {
        const strengthTypeEl = document.getElementById('strengthType'), strengthAmountEl = document.getElementById('strengthAmount');
        const type = strengthTypeEl.value, amount = parseInt(strengthAmountEl.value);
        if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount.');
        let calories = 0;
        switch (type) { case 'push-up': calories = amount * 0.5; break; case 'sit-up': calories = amount * 0.4; break; case 'squat': calories = amount * 0.6; break; case 'plank': calories = amount * 0.3; break; }
        const duration = (type === 'plank') ? amount : 0;
        this.logActivity({ type, name: type.replace('-', ' '), amount, duration, calories });
        this.ui.closeModal(document.getElementById('strengthModal'));
        strengthAmountEl.value = '';
    }
    
    loadInitialData() {
        // 1. BUAT variabel 'formattedDate' dan simpan hasil format tanggal di dalamnya
    const formattedDate = this.ui.formatDate(this.today);

// 2. Gunakan variabel itu untuk elemen tanggal di header utama
    this.ui.currentDateEl.textContent = formattedDate;

// 3. Gunakan LAGI variabel yang sama untuk elemen tanggal di halaman fitness
    if (this.ui.workoutDateDisplayEl) {
    this.ui.workoutDateDisplayEl.textContent = formattedDate;
    }
        this.ui.renderFoodList(this.foodDataArray.slice(0, 10));
        
        const todayData = this.fitnessDiary[this.today] || [];
        this.ui.renderUI(todayData, this.userProfile);
        
        this.ui.populatePRExercises(this.prExercises);
        // this.ui.prUnitEl.textContent = this.prExercises[this.ui.prExerciseSelect.value];
        
        this.ui.showPage('page-home');
        // Di dalam fungsi loadInitialData()
        this.ui.renderFoodList(this.foodDataArray.slice(0, 5));
    }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered.')).catch(err => console.log('SW registration failed:', err));
  });
}

const app = new App();