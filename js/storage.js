class Storage {
    static getFitnessDiary() {
        return JSON.parse(localStorage.getItem('fitnessDiary')) || {};
    }

    static saveFitnessDiary(diary) {
        localStorage.setItem('fitnessDiary', JSON.stringify(diary));
    }

    static getUserProfile() {
        return JSON.parse(localStorage.getItem('userProfile')) || { dailyGoal: 2000 };
    }

    static saveUserProfile(profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
    }
    
    static getWeightHistory() {
        return localStorage.getItem('weightHistory') ? JSON.parse(localStorage.getItem('weightHistory')) : [];
    }

    static saveWeightHistory(history) {
        localStorage.setItem('weightHistory', JSON.stringify(history));
    }

    static getPersonalRecords() {
        return localStorage.getItem('personalRecords') ? JSON.parse(localStorage.getItem('personalRecords')) : {};
    }

    static savePersonalRecords(records) {
        localStorage.setItem('personalRecords', JSON.stringify(records));
    }
}