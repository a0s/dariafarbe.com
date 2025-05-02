// Consent management
const CONSENT_KEY = 'analytics_consent';
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
            const consent = localStorage.getItem(CONSENT_KEY);
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
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-FRRNN9FLRG';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    gtag = function () { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-FRRNN9FLRG', {
        'consent_mode': 'advanced',
        'analytics_storage': 'granted'
    });
}

function setConsent(accepted) {
    localStorage.setItem(CONSENT_KEY, accepted);
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
    const consent = localStorage.getItem(CONSENT_KEY);

    if (consent === null) {
        // No consent stored - show dialog for new users
        showConsentDialog();
    } else if (consent === 'true') {
        // Consent was previously given - load GA
        loadGoogleAnalytics();
    }
    // If consent is 'false', do nothing - GA won't be loaded
});