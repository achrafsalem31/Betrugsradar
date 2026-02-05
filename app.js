// Country Selector Functionality
document.addEventListener('DOMContentLoaded', () => {
    const countryBtn = document.getElementById('countryBtn');
    const countryDropdown = document.getElementById('countryDropdown');
    const countryOptions = document.querySelectorAll('.country-option');
    const phonePrefix = document.getElementById('phonePrefix');
    const phoneInput = document.getElementById('phoneInput');
    const searchBtn = document.getElementById('searchBtn');

    // Toggle dropdown
    countryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        countryDropdown.classList.toggle('active');
        countryBtn.classList.toggle('active');
    });

    // Select country
    countryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const flag = option.dataset.flag;
            const name = option.dataset.name;
            const code = option.dataset.code;
            
            // Update button
            countryBtn.querySelector('.flag').textContent = flag;
            countryBtn.querySelector('.country-name').textContent = name;
            
            // Update prefix
            phonePrefix.textContent = code;
            
            // Close dropdown
            countryDropdown.classList.remove('active');
            countryBtn.classList.remove('active');
            
            // Focus input
            phoneInput.focus();
        });
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
        countryDropdown.classList.remove('active');
        countryBtn.classList.remove('active');
    });

    // Phone input formatting
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Format number based on length
        if (value.length > 0) {
            if (value.length <= 4) {
                value = value;
            } else if (value.length <= 7) {
                value = value.slice(0, 4) + ' ' + value.slice(4);
            } else {
                value = value.slice(0, 4) + ' ' + value.slice(4, 7) + value.slice(7, 11);
            }
        }
        
        e.target.value = value;
    });

    // Enter key to search
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Search button
    searchBtn.addEventListener('click', performSearch);

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card, .step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Header scroll effect
    let lastScroll = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Floating icons random movement
    const floatingIcons = document.querySelectorAll('.floating-icon');
    floatingIcons.forEach((icon, index) => {
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            icon.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 500);
    });
});

// Search functionality
function performSearch() {
    const phoneInput = document.getElementById('phoneInput');
    const phonePrefix = document.getElementById('phonePrefix');
    const number = phoneInput.value.trim();
    
    if (!number) {
        showNotification('Bitte geben Sie eine Telefonnummer ein', 'warning');
        return;
    }
    
    const fullNumber = phonePrefix.textContent + ' ' + number;
    
    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalContent = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span>Suche läuft...</span>';
    searchBtn.disabled = true;
    
    // Simulate search (in real app, this would be an API call)
    setTimeout(() => {
        searchBtn.innerHTML = originalContent;
        searchBtn.disabled = false;
        
        // Store number in sessionStorage
        sessionStorage.setItem('searchNumber', fullNumber);
        
        // Redirect to main app
        window.location.href = 'index.html';
    }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'warning' ? '#f59e0b' : '#10b981'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check for search number from previous session
window.addEventListener('load', () => {
    const savedNumber = sessionStorage.getItem('searchNumber');
    if (savedNumber && window.location.pathname.includes('index.html')) {
        // Auto-fill the number in the main app
        const checkInput = document.getElementById('phone-input');
        if (checkInput) {
            checkInput.value = savedNumber;
            sessionStorage.removeItem('searchNumber');
            
            // Show notification
            setTimeout(() => {
                showNotification('Nummer wurde eingefügt. Klicken Sie auf "Nummer Prüfen"', 'info');
            }, 500);
        }
    }
});

// PWA Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button if needed
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        });
    }
});

// Analytics tracking (placeholder)
function trackEvent(category, action, label) {
    console.log(`Track: ${category} - ${action} - ${label}`);
    // In production, integrate with Google Analytics or similar
}

// Track search attempts
document.getElementById('searchBtn')?.addEventListener('click', () => {
    trackEvent('Search', 'Click', 'Landing Page Search');
});

// Track navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        trackEvent('Navigation', 'Click', e.target.textContent);
    });
});

// Performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page loaded in: ${pageLoadTime}ms`);
        trackEvent('Performance', 'Page Load', pageLoadTime);
    }
});
