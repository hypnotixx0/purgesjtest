// Configuration
const CONFIG = {
    PROXY_URL: 'https://sjet.us', // Scramjet proxy URL
    SITE_NAME: '/Purge',
    SITE_SUBTITLE: 'Scramjet Proxy'
};

// DOM Elements
const elements = {
    urlInput: document.getElementById('urlInput'),
    goBtn: document.getElementById('goBtn'),
    proxyFrame: document.getElementById('proxyFrame'),
    proxyIframe: document.getElementById('proxyIframe'),
    currentUrl: document.getElementById('currentUrl'),
    backBtn: document.getElementById('backBtn'),
    forwardBtn: document.getElementById('forwardBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    newTabBtn: document.getElementById('newTabBtn'),
    closeProxyBtn: document.getElementById('closeProxyBtn'),
    themeBtn: document.getElementById('themeBtn'),
    quickLinks: document.querySelectorAll('.quick-link')
};

// State
let currentTheme = localStorage.getItem('theme') || 'dark';

// Initialize
function init() {
    setupEventListeners();
    applyTheme(currentTheme);
    loadFromURL();
}

// Event Listeners
function setupEventListeners() {
    elements.goBtn.addEventListener('click', navigateToUrl);
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') navigateToUrl();
    });
    
    elements.backBtn.addEventListener('click', () => {
        elements.proxyIframe.contentWindow?.history.back();
    });
    
    elements.forwardBtn.addEventListener('click', () => {
        elements.proxyIframe.contentWindow?.history.forward();
    });
    
    elements.refreshBtn.addEventListener('click', () => {
        elements.proxyIframe.contentWindow?.location.reload();
    });
    
    elements.newTabBtn.addEventListener('click', () => {
        const currentSrc = elements.proxyIframe.src;
        if (currentSrc) {
            window.open(currentSrc, '_blank');
        }
    });
    
    elements.closeProxyBtn.addEventListener('click', closeProxy);
    
    elements.themeBtn.addEventListener('click', toggleTheme);
    
    elements.quickLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = e.target.dataset.url;
            elements.urlInput.value = url;
            navigateToUrl();
        });
    });
    
    // Handle iframe load events
    elements.proxyIframe.addEventListener('load', () => {
        updateUrlDisplay();
    });
}

// Navigation
function navigateToUrl() {
    let url = elements.urlInput.value.trim();
    
    if (!url) return;
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        const proxyUrl = `${CONFIG.PROXY_URL}/${url}`;
        elements.proxyIframe.src = proxyUrl;
        showProxyFrame();
        updateUrlDisplay(url);
        
        // Save to URL for sharing
        updateBrowserUrl(url);
    } catch (error) {
        console.error('Navigation error:', error);
        alert('Error navigating to URL. Please check the URL and try again.');
    }
}

// Proxy Frame Management
function showProxyFrame() {
    elements.proxyFrame.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProxy() {
    elements.proxyFrame.classList.add('hidden');
    elements.proxyIframe.src = '';
    document.body.style.overflow = 'auto';
    clearBrowserUrl();
}

function updateUrlDisplay(url = '') {
    if (url) {
        elements.currentUrl.textContent = url;
    } else if (elements.proxyIframe.src) {
        // Extract original URL from proxy URL
        const proxySrc = elements.proxyIframe.src;
        const originalUrl = proxySrc.replace(`${CONFIG.PROXY_URL}/`, '');
        elements.currentUrl.textContent = originalUrl;
    }
}

// URL Management (for sharing links)
function updateBrowserUrl(url) {
    const state = { url };
    const title = `${CONFIG.SITE_NAME} - ${url}`;
    const newUrl = `/${btoa(url)}`;
    
    history.pushState(state, title, newUrl);
}

function clearBrowserUrl() {
    history.pushState({}, CONFIG.SITE_NAME, '/');
}

function loadFromURL() {
    const path = window.location.pathname.slice(1);
    if (path) {
        try {
            const url = atob(path);
            if (url) {
                elements.urlInput.value = url;
                navigateToUrl();
            }
        } catch (error) {
            console.error('Error loading URL from path:', error);
        }
    }
}

// Theme Management
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    elements.themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// Handle browser navigation
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.url) {
        elements.urlInput.value = event.state.url;
        navigateToUrl();
    } else {
        closeProxy();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export for potential module use
export { init, navigateToUrl, closeProxy, toggleTheme };