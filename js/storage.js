// js/storage.js
export class Storage {
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
}