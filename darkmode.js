// Global Dark Mode Management
class DarkModeManager {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        if (currentTheme === 'dark') {
            this.enableDarkMode();
        }

        // Listen for theme changes from other pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                if (e.newValue === 'dark') {
                    this.enableDarkMode();
                } else {
                    this.enableLightMode();
                }
            }
        });
    }

    enableDarkMode() {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.updateToggleUI(true);
    }

    enableLightMode() {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.updateToggleUI(false);
    }

    toggle() {
        if (document.documentElement.classList.contains('dark')) {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }
    }

    updateToggleUI(isDark) {
        const lightIcon = document.getElementById('lightIcon');
        const darkIcon = document.getElementById('darkIcon');
        const themeText = document.getElementById('themeText');
        const toggleSwitch = document.getElementById('toggleSwitch');

        if (!lightIcon || !darkIcon) return;

        if (isDark) {
            lightIcon.classList.add('opacity-0', 'scale-0');
            darkIcon.classList.remove('opacity-0', 'scale-0');
            darkIcon.classList.add('opacity-100', 'scale-100');
            if (themeText) themeText.textContent = 'Dark Mode';
            if (toggleSwitch) {
                toggleSwitch.classList.remove('translate-x-1');
                toggleSwitch.classList.add('translate-x-6');
                toggleSwitch.parentElement.classList.remove('bg-gray-200');
                toggleSwitch.parentElement.classList.add('bg-primary');
            }
        } else {
            lightIcon.classList.remove('opacity-0', 'scale-0');
            lightIcon.classList.add('opacity-100', 'scale-100');
            darkIcon.classList.add('opacity-0', 'scale-0');
            darkIcon.classList.remove('opacity-100', 'scale-100');
            if (themeText) themeText.textContent = 'Light Mode';
            if (toggleSwitch) {
                toggleSwitch.classList.remove('translate-x-6');
                toggleSwitch.classList.add('translate-x-1');
                toggleSwitch.parentElement.classList.remove('bg-primary');
                toggleSwitch.parentElement.classList.add('bg-gray-200');
            }
        }
    }

    createToggleButton() {
        return `
            <button id="darkModeToggle" class="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-xl transition-all duration-300 ease-in-out">
                <div class="flex items-center">
                    <div class="relative w-5 h-5 mr-3">
                        <svg id="lightIcon" class="absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 ease-in-out transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"></path>
                        </svg>
                        <svg id="darkIcon" class="absolute inset-0 w-5 h-5 text-indigo-400 transition-all duration-300 ease-in-out transform opacity-0 scale-0" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <span id="themeText" class="font-medium">Light Mode</span>
                </div>
                <div class="relative">
                    <div class="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-all duration-300 ease-in-out shadow-inner group-hover:shadow-lg">
                        <span id="toggleSwitch" class="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-2 ring-gray-200 dark:ring-gray-500 transition-all duration-300 ease-in-out translate-x-1 group-hover:ring-primary/50">
                            <span class="absolute inset-0 rounded-full bg-gradient-to-r from-gray-50 to-white shadow-sm"></span>
                        </span>
                    </div>
                </div>
            </button>
        `;
    }

    setupToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
}

// Initialize dark mode manager
const darkModeManager = new DarkModeManager();

// Auto-setup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    darkModeManager.setupToggle();
});

// Export for use in other scripts
window.darkModeManager = darkModeManager;