// Configuration
const CONFIG = {
    GA_ID: 'G-FRRNN9FLRG',
    CONSENT_KEY: 'analytics_consent'
};

// Language management
const translations = {
    ru: {
        title: 'Согласие на использование файлов cookie',
        description: 'Мы используем файлы cookie для анализа использования сайта и улучшения вашего опыта. Продолжая использовать наш сайт, вы соглашаетесь с использованием файлов cookie.',
        acceptAll: 'Принять все',
        rejectAll: 'Отклонить все',
        settings: 'Настройки',
        settingsTitle: 'Настройки файлов cookie',
        analyticsTitle: 'Google Analytics',
        analyticsDescription: 'Мы используем Google Analytics для понимания того, как посетители взаимодействуют с нашим сайтом.',
        saveSettings: 'Сохранить настройки'
    },
    en: {
        title: 'Cookie Consent',
        description: 'We use cookies to analyze site usage and improve your experience. By continuing to use our site, you agree to our use of cookies.',
        acceptAll: 'Accept All',
        rejectAll: 'Reject All',
        settings: 'Settings',
        settingsTitle: 'Cookie Settings',
        analyticsTitle: 'Google Analytics',
        analyticsDescription: 'We use Google Analytics to understand how visitors interact with our website.',
        saveSettings: 'Save Settings'
    }
};

function getInitialLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('ru') ? 'ru' : 'en';
}

function updateLanguage(lang) {
    const elements = {
        title: document.querySelector('.consent-dialog h3 .title-text'),
        description: document.querySelector('.consent-dialog p'),
        acceptAll: document.getElementById('accept-all'),
        rejectAll: document.getElementById('reject-all'),
        settings: document.getElementById('settings-button'),
        settingsTitle: document.querySelector('.settings-content h3'),
        analyticsTitle: document.querySelector('.setting-info h4'),
        analyticsDescription: document.querySelector('.setting-info p'),
        saveSettings: document.getElementById('save-settings')
    };

    const translation = translations[lang];
    for (const [key, element] of Object.entries(elements)) {
        if (element) {
            element.textContent = translation[key];
        }
    }
}

// Consent management
let gtag = null;

function showConsentDialog() {
    const dialog = document.getElementById('consent-dialog');
    if (dialog) dialog.style.display = 'flex';
}

function hideConsentDialog() {
    const dialog = document.getElementById('consent-dialog');
    if (dialog) dialog.style.display = 'none';
}

function showSettingsDialog() {
    const dialog = document.getElementById('settings-dialog');
    if (dialog) {
        dialog.style.display = 'flex';
        // Set toggle state based on current consent
        const analyticsToggle = document.getElementById('analytics-toggle');
        if (analyticsToggle) {
            const consent = localStorage.getItem(CONFIG.CONSENT_KEY);
            // If no consent is stored, default to true in settings dialog
            analyticsToggle.checked = consent === null ? true : consent === 'true';

            // If GA is enabled, ensure it's loaded
            if (analyticsToggle.checked && !gtag) {
                loadGoogleAnalytics();
            }
        }
    }
}

function hideSettingsDialog() {
    const dialog = document.getElementById('settings-dialog');
    if (dialog) dialog.style.display = 'none';
}

function loadGoogleAnalytics() {
    console.log('Loading Google Analytics...');
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_ID}`;
    script.onload = () => console.log('Google Analytics script loaded successfully');
    script.onerror = () => console.error('Failed to load Google Analytics script');
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    gtag = function () {
        console.log('GA Event:', arguments[0], arguments[1]);
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', CONFIG.GA_ID, {
        'consent_mode': 'advanced',
        'analytics_storage': 'granted'
    });
    console.log('Google Analytics initialized with ID:', CONFIG.GA_ID);
}

function setConsent(accepted) {
    localStorage.setItem(CONFIG.CONSENT_KEY, accepted);
    hideConsentDialog();

    if (accepted) {
        loadGoogleAnalytics();
    } else {
        // Disable analytics
        if (gtag) {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    }
}

function saveSettings() {
    const analyticsToggle = document.getElementById('analytics-toggle');
    if (analyticsToggle) {
        setConsent(analyticsToggle.checked);
        hideSettingsDialog();
    }
}

// Initialize consent management
document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    const initialLang = getInitialLanguage();
    updateLanguage(initialLang);

    // Set up language switcher
    const langRuBtn = document.getElementById('lang-ru');
    const langEnBtn = document.getElementById('lang-en');

    if (langRuBtn && langEnBtn) {
        langRuBtn.addEventListener('click', () => {
            updateLanguage('ru');
            langRuBtn.classList.add('active');
            langEnBtn.classList.remove('active');
        });

        langEnBtn.addEventListener('click', () => {
            updateLanguage('en');
            langEnBtn.classList.add('active');
            langRuBtn.classList.remove('active');
        });

        // Set initial active language button
        document.getElementById(`lang-${initialLang}`).classList.add('active');
    }

    // Add event listeners only after DOM is loaded
    const acceptButton = document.getElementById('accept-all');
    const rejectButton = document.getElementById('reject-all');
    const settingsButton = document.getElementById('settings-button');
    const closeSettings = document.getElementById('close-settings');
    const saveSettingsButton = document.getElementById('save-settings');

    if (acceptButton) acceptButton.addEventListener('click', () => setConsent(true));
    if (rejectButton) rejectButton.addEventListener('click', () => setConsent(false));
    if (settingsButton) settingsButton.addEventListener('click', showSettingsDialog);
    if (closeSettings) closeSettings.addEventListener('click', hideSettingsDialog);
    if (saveSettingsButton) saveSettingsButton.addEventListener('click', saveSettings);

    // Check consent state
    const consent = localStorage.getItem(CONFIG.CONSENT_KEY);

    if (consent === null) {
        // No consent stored - show dialog for new users
        showConsentDialog();
    } else if (consent === 'true') {
        // Consent was previously given - load GA
        loadGoogleAnalytics();
    }
    // If consent is 'false', do nothing - GA won't be loaded
});