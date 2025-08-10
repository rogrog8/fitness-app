import { Storage } from './storage.js';
import { UI } from './ui.js';
import { foodDatabase as foodDataObject } from './food-db.js';

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
        this.foodDataArray = Object.entries(foodDataObject).map(([name, details]) => ({ name, ...details }));
        this.map = null;
        this.routeLine = null;
        this.athleticTimerInterval = null;
        this.athleticSeconds = 0;
        this.watchId = null;
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
        document.getElementById('athleticBtn').addEventListener('click', () => {
            this.ui.openModal(document.getElementById('athleticModal'));
            setTimeout(() => this.initMap(), 100);
        });
        document.getElementById('exerciseRefBtn').addEventListener('click', () => this.ui.openModal(document.getElementById('refModal')));
        document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', () => this.ui.closeModal(document.getElementById(btn.dataset.modalId))));
        document.getElementById('saveStrengthBtn').addEventListener('click', () => this.saveStrengthWorkout());
        document.getElementById('startAthleticBtn').addEventListener('click', () => this.startAthleticWorkout());
        document.getElementById('stopAthleticBtn').addEventListener('click', () => this.stopAthleticWorkout());
        // Riwayat
        this.ui.historyListEl.addEventListener('click', (e) => this.handleHistoryClick(e));
        this.ui.clearAllBtn.addEventListener('click', () => this.clearAllActivities());
        document.getElementById('reloadLocationBtn').addEventListener('click', () => this.initMap());
    }

    // --- METODE-METODE APLIKASI ---
    navigate(e) {
        const menuCard = e.target.closest('.menu-card');
        if (menuCard) { this.ui.showPage(menuCard.dataset.page); }
    }
    logActivity(logObject) {
        if (!this.fitnessDiary[this.today]) this.fitnessDiary[this.today] = [];
        logObject.id = Date.now();
        this.fitnessDiary[this.today].push(logObject);
        Storage.saveFitnessDiary(this.fitnessDiary);
        this.ui.renderUI(this.fitnessDiary[this.today], this.userProfile);
    }
    deleteLog(idToDelete) {
        if (!this.fitnessDiary[this.today]) return;
        this.fitnessDiary[this.today] = this.fitnessDiary[this.today].filter(item => String(item.id) !== idToDelete);
        Storage.saveFitnessDiary(this.fitnessDiary);
        this.ui.renderUI(this.fitnessDiary[this.today], this.userProfile);
    }
    clearAllActivities() {
        if (confirm('Are you sure you want to delete all activities for today? This cannot be undone.')) {
            this.fitnessDiary[this.today] = [];
            Storage.saveFitnessDiary(this.fitnessDiary);
            this.ui.renderUI(this.fitnessDiary[this.today] || [], this.userProfile);
        }
    }
    handleHistoryClick(e) {
        const deleteButton = e.target.closest('.delete-history-btn');
        if (deleteButton) {
            if (confirm('Are you sure you want to delete this entry?')) { this.deleteLog(deleteButton.dataset.id); }
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
        alert(`Your daily calorie goal has been updated to ${Math.round(tdee)} kcal!`);
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
        if (searchTerm.length < 3) { this.ui.foodListApiEl.innerHTML = ''; return; }
        this.ui.foodListApiEl.innerHTML = `<p style="text-align: center; color: var(--text-light);">Searching online...</p>`;
        try {
            const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&search_simple=1&action=process&json=1&page_size=10`);
            const data = await response.json();
            if (data.products && data.products.length > 0) {
                const formattedFoods = data.products.map(p => ({ name: p.product_name || 'Unknown', calories: p.nutriments['energy-kcal_100g'] || 0, serving: p.quantity || '100g' })).filter(f => f.calories > 0);
                this.ui.renderApiFoodList(formattedFoods);
            } else { this.ui.foodListApiEl.innerHTML = `<p style="text-align: center; color: var(--text-light);">No online results found.</p>`; }
        } catch (error) { console.error('Error fetching food data:', error); this.ui.foodListApiEl.innerHTML = `<p style="text-align: center; color: var(--danger);">Could not connect to online database.</p>`; }
    }
    addFood(e) {
        const addBtn = e.target.closest('.add-food-btn');
        if (addBtn) {
            const foodDetails = JSON.parse(addBtn.dataset.foodDetails);
            if (foodDetails) {
                this.logActivity({ type: 'food', ...foodDetails });
                alert(`${foodDetails.name} has been added to your log.`);
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
stopAthleticWorkout() {
    if(this.watchId) navigator.geolocation.clearWatch(this.watchId); if(this.athleticTimerInterval) clearInterval(this.athleticTimerInterval); this.watchId = null;
    const distance = parseFloat(document.getElementById('distanceDisplay').textContent) || 0;
    if (distance === 0 && this.athleticSeconds === 0) { this.ui.closeModal(document.getElementById('athleticModal')); return; }
    const calories = distance * 60;
    this.logActivity({ type: 'lari', name: 'Running', amount: distance, duration: this.athleticSeconds, calories });
    this.ui.closeModal(document.getElementById('athleticModal'));
    
    this.ui.startAthleticBtn.classList.remove('hidden');
    this.ui.stopAthleticBtn.classList.add('hidden');

    document.getElementById('distanceDisplay').textContent = '0.00';
    document.getElementById('athleticTimerDisplay').textContent = '00:00';

    // --- TAMBAHAN UNTUK MERESET PETA ---
    if (this.map) {
        this.map.remove(); // Hapus peta dari DOM
        this.map = null;   // Setel ulang properti map
        this.routeLine = null; // Setel ulang properti routeLine
    }
    // --- AKHIR TAMBAHAN ---
}
initMap() {
    if (this.map) return;
    const mapEl = document.getElementById('map');
    const reloadBtn = document.getElementById('reloadLocationBtn');
    if (!mapEl || !reloadBtn) return;

    reloadBtn.classList.add('hidden');
    mapEl.innerHTML = '<p style="text-align: center; padding-top: 20px; color: var(--text-light);">Mencari lokasi Anda...</p>';

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            mapEl.innerHTML = ''; 
            const userLocation = [pos.coords.latitude, pos.coords.longitude];
            this.map = L.map(mapEl).setView(userLocation, 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
        },
        (err) => {
            console.error(`ERROR(${err.code}): ${err.message}`);
            mapEl.innerHTML = `<p style="text-align: center; padding-top: 20px; color: var(--danger);">Gagal mendapatkan lokasi. Pastikan izin lokasi telah diberikan.</p>`;
            reloadBtn.classList.remove('hidden'); 
        },
        // --- BAGIAN YANG DIPERBARUI ---
        { 
            enableHighAccuracy: true,
            timeout: 10000, // Beri waktu 10 detik untuk mencari lokasi
            maximumAge: 0 // Jangan gunakan cache lokasi lama
        }
        // --- AKHIR BAGIAN YANG DIPERBARUI ---
    );
}
    startAthleticWorkout() {
        if (!navigator.geolocation) return alert('Geolocation is not supported by this browser.');
        let positions = []; this.athleticSeconds = 0;
        const distanceDisplay = document.getElementById('distanceDisplay'), athleticTimerDisplay = document.getElementById('athleticTimerDisplay');
        distanceDisplay.textContent = '0.00'; athleticTimerDisplay.textContent = '00:00';
        if (this.routeLine) this.map.removeLayer(this.routeLine);
        this.athleticTimerInterval = setInterval(() => { this.athleticSeconds++; athleticTimerDisplay.textContent = this.ui.formatTime(this.athleticSeconds); }, 1000);
        this.watchId = navigator.geolocation.watchPosition(position => {
            const { latitude, longitude } = position.coords;
            positions.push([latitude, longitude]);
            if (this.routeLine) this.map.removeLayer(this.routeLine);
            this.routeLine = L.polyline(positions, { color: 'blue' }).addTo(this.map);
            this.map.fitBounds(this.routeLine.getBounds());
            if (positions.length > 1) {
                let distance = 0;
                for (let i = 0; i < positions.length - 1; i++) { distance += L.latLng(positions[i]).distanceTo(L.latLng(positions[i + 1])); }
                distanceDisplay.textContent = (distance / 1000).toFixed(2);
            }
        }, () => alert('Could not get location.'), { enableHighAccuracy: true });

        // --- PERBAIKAN DI SINI ---
        // Menggunakan this.ui untuk mengakses elemen DOM
        this.ui.startAthleticBtn.classList.add('hidden');
        this.ui.stopAthleticBtn.classList.remove('hidden');
    }
    loadInitialData() {
        this.ui.currentDateEl.textContent = this.ui.formatDate(this.today);
        this.ui.renderFoodList(this.foodDataArray.slice(0, 10));
        this.ui.renderUI(this.fitnessDiary[this.today] || [], this.userProfile);
        this.ui.showPage('page-home');
    }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker berhasil didaftarkan:', registration);
      })
      .catch(registrationError => {
        console.log('Pendaftaran Service Worker gagal:', registrationError);
      });
  });
}
// Inisialisasi Aplikasi
const app = new App();