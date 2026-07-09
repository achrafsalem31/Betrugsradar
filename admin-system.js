console.log("ADMIN SYSTEM MODIFIED LOADED");
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminSystem();
});

function initializeAdminSystem() {
    
    const loginForm = document.getElementById('login-form');
    const loginModal = document.getElementById('login-modal');
    const adminBtn = document.querySelector('[data-page="admin"]');
    
    
    if (adminBtn) {
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if user is already logged in as admin
            if (window.API.isLoggedIn() && window.API.isAdmin()) {
                
                showPage('admin');
                loadAdminDashboard();
            } else {
                
                showLoginModal();
            }
        });
    }
    
    
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'login-form') {
        e.preventDefault();
        console.log("LOGIN SUBMIT DETECTED");
        await handleAdminLogin();
    }
});
    
    
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });
    }
}


function showLoginModal() {
    const modal = document.getElementById('login-modal');
    const errorMsg = document.getElementById('login-error');
    
    if (modal) {
        modal.classList.remove('hidden');
        
        
        if (errorMsg) {
            errorMsg.classList.add('hidden');
            errorMsg.textContent = '';
        }
        
       
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
    }
}


function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}


async function handleAdminLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.querySelector('#login-form button[type="submit"]');

    if (!email || !password) {
        showLoginError('Bitte E-Mail und Passwort eingeben');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Anmelden...';

    try {
        console.log('➡️ Login gestartet');

        const result = await window.API.login(email, password);

        console.log('LOGIN RESULT:', result);

        if (!result.success) {
            showLoginError(result.error || 'Login fehlgeschlagen');
            return;
        }

        if (result.user.role !== 'admin') {
            showLoginError('Kein Admin-Zugriff');
            return;
        }

        
        hideLoginModal();
        showPage('admin');
        loadAdminDashboard();
        showNotification('Erfolgreich eingeloggt!', 'success');

        
        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.style.setProperty('display', 'flex', 'important');
                console.log("🔥 Logout button forced to show");
            }
        }, 100);

    } catch (error) {
        console.error('❌ ERROR:', error);
        showLoginError('Fehler beim Login');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
} 

function showLoginError(message) {
    const errorMsg = document.getElementById('login-error');
    if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
    }
}


// ADMIN DASHBOARD


async function loadAdminDashboard() {
    console.log('📊 Loading Admin Dashboard...');
    
    // Check if still logged in
    if (!window.API.isLoggedIn() || !window.API.isAdmin()) {
        showLoginModal();
        return;
    }
    
    
    showLoading();
    
    try {
        await loadAdminStatistics();
        
        await loadAdminNumbersList();
        
       setupAdminEventListeners();
        
    } catch (error) {
        console.error('Dashboard error:', error);
        showNotification('Fehler beim Laden des Dashboards', 'error');
    } finally {
        hideLoading();
    }
}


async function loadAdminStatistics() {
    try {
        const stats = await window.API.getStatistics();
        
        document.getElementById('total-reports').textContent = stats.totalReports || 0;
        document.getElementById('blacklist-count').textContent = stats.totalNumbers || 0;
        
        displayCategoryStats(stats.byCategory || {});
        
        const allNumbers = await window.API.getAllNumbers();
        displayRecentNumbers(allNumbers.slice(0, 5));
        
    } catch (error) {
        console.error('Stats error:', error);
    }
}


function displayCategoryStats(byCategory) {
    const list = document.getElementById('category-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const categories = [
        { key: 'enkeltrick', name: 'Enkeltrick', icon: '👵' },
        { key: 'polizei', name: 'Falsche Polizisten', icon: '👮' },
        { key: 'schock', name: 'Schockanruf', icon: '🚨' },
        { key: 'bank', name: 'Bank-Betrug', icon: '🏦' },
        { key: 'techsupport', name: 'Tech-Support', icon: '💻' },
        { key: 'gewinnspiel', name: 'Gewinnspiel', icon: '🎁' },
        { key: 'sonstiges', name: 'Sonstiges', icon: '📞' }
    ];
    
    categories.forEach(cat => {
        const count = byCategory[cat.key] || 0;
        const item = document.createElement('div');
        item.className = 'category-item';
        item.style.cssText = 'display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee;';
        item.innerHTML = `
            <span style="font-size: 1.5rem; margin-right: 15px;">${cat.icon}</span>
            <span style="flex: 1; font-weight: 500;">${cat.name}</span>
            <span style="font-weight: bold; color: #2d5a3d;">${count}</span>
        `;
        list.appendChild(item);
    });
}

/**
 * Display Recent Numbers
 */
function displayRecentNumbers(numbers) {
    const list = document.getElementById('recent-numbers');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (numbers.length === 0) {
        list.innerHTML = '<p style="color: #666;">Noch keine Nummern gemeldet</p>';
        return;
    }
    
    numbers.forEach(num => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;';
        
        const statusColor = num.status === 'danger' ? '#d32f2f' : 
                           num.status === 'warning' ? '#f57c00' : '#388e3c';
        
        item.innerHTML = `
            <div>
                <strong>${num.phone}</strong><br>
                <small style="color: #666;">${getCategoryName(num.category)} - ${num.reports_count} Meldungen</small>
            </div>
            <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; background: ${statusColor}20; color: ${statusColor};">
                ${num.status.toUpperCase()}
            </span>
        `;
        list.appendChild(item);
    });
}


async function loadAdminNumbersList() {
    try {
        const numbers = await window.API.getAllNumbers();
        displayNumbersList(numbers);
    } catch (error) {
        console.error('Numbers list error:', error);
    }
}


function displayNumbersList(numbers) {
    const list = document.getElementById('numbers-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (numbers.length === 0) {
        list.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Keine Nummern in der Datenbank</p>';
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';
    
    table.innerHTML = `
        <thead>
            <tr style="background: #f5f5f5; text-align: left;">
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Telefonnummer</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Kategorie</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Meldungen</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Status</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Zuletzt gemeldet</th>
            </tr>
        </thead>
        <tbody id="numbers-table-body"></tbody>
    `;
    
    const tbody = table.querySelector('#numbers-table-body');
    
    numbers.forEach(num => {
        const row = document.createElement('tr');
        row.style.cssText = 'border-bottom: 1px solid #eee;';
        
        const statusColor = num.status === 'danger' ? '#d32f2f' : 
                           num.status === 'warning' ? '#f57c00' : '#388e3c';
        
        const statusBadge = `<span style="padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; background: ${statusColor}20; color: ${statusColor};">${num.status.toUpperCase()}</span>`;
        
        const date = new Date(num.updated_at).toLocaleDateString('de-DE');
        
        row.innerHTML = `
            <td style="padding: 12px; font-weight: 500;">${num.phone}</td>
            <td style="padding: 12px;">${getCategoryName(num.category)}</td>
            <td style="padding: 12px; text-align: center; font-weight: bold;">${num.reports_count}</td>
            <td style="padding: 12px;">${statusBadge}</td>
            <td style="padding: 12px; color: #666;">${date}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    list.appendChild(table);
}


function getCategoryName(category) {
    const names = {
        enkeltrick: 'Enkeltrick',
        polizei: 'Falsche Polizisten',
        schock: 'Schockanruf',
        bank: 'Bank-Betrug',
        techsupport: 'Tech-Support',
        gewinnspiel: 'Gewinnspiel',
        sonstiges: 'Sonstiges'
    };
    return names[category] || 'Unbekannt';
}


function setupAdminEventListeners() {
    const refreshBtn = document.getElementById('refresh-numbers');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            showLoading();
            await loadAdminNumbersList();
            hideLoading();
            showNotification('Liste aktualisiert', 'success');
        });
    }
    
    
    const searchInput = document.getElementById('number-search');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const searchTerm = e.target.value.trim();
            
            if (searchTerm.length === 0) {
                await loadAdminNumbersList();
            } else {
                const results = await window.API.searchNumbers(searchTerm);
                displayNumbersList(results);
            }
        });
    }
}


function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}


// NAVIGATION und LOGOUT CONTROL

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) targetPage.classList.add('active');
    
    const targetBtn = document.querySelector(`[data-page="${pageId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    const logoutBtn = document.getElementById('logoutBtn');
    const isLoggedIn = localStorage.getItem('token') !== null;
    
    if (logoutBtn) {
        if (isLoggedIn && pageId === 'admin') {
            logoutBtn.style.setProperty('display', 'flex', 'important');
        } else {
            logoutBtn.style.setProperty('display', 'none', 'important');
        }
    }
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('#logoutBtn');
    if (btn) {
        localStorage.removeItem('token');
        window.location.reload(); 
    }
});

window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('token') !== null;
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isLoggedIn && logoutBtn) {
        console.log("Admin session active");
        if (document.getElementById('admin-page').classList.contains('active')) {
            logoutBtn.style.setProperty('display', 'flex', 'important');
        }
    }
});

console.log('SYSTEM FULLY REFINED & READY');