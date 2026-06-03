const appState = {
    currentPage: 'check',
    currentQuiz: null,
    currentQuestion: 0,
    quizScore: 0,
    quizAnswers: [],
    stats: {
        totalChecks: 0,
        totalReports: 0,
        totalQuizzes: 0,
        blacklistCount: 0
    },
    reportsByCategory: {
        enkeltrick: 0,
        polizei: 0,
        schock: 0,
        bank: 0,
        techsupport: 0,
        gewinnspiel: 0,
        sonstiges: 0
    }
};

const quizQuestions = {};
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin';
}


document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeCheckPage();
    initializeLearnPage();
    initializeQuizPage();
    initializeReportPage();
    initializePWA();
    loadStats();
    
    // 🎯 شحن الكويزات من Supabase ديريكت غير تشعل الصفحة!
    if (typeof loadAdminQuizzes === 'function') {
        loadAdminQuizzes();
    }
});

function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const logoutBtn = document.getElementById('logoutBtn');

    navBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const page = btn.dataset.page;
            
            if (page !== 'admin' && logoutBtn) {
                logoutBtn.style.display = 'none';
            }
            
            // Laisse admin-system.js gérer entièrement la navigation admin
            if (page === 'admin') {
                return;
            }

            switchPage(page);
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
        appState.currentPage = pageName;
    }
}

function initializeCheckPage() {
    const checkBtn = document.getElementById('check-btn');
    const phoneInput = document.getElementById('phone-input');
    
    checkBtn.addEventListener('click', () => checkNumber());
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkNumber();
    });
}

async function checkNumber() {
    const input = document.getElementById('phone-input');
    const number = input.value.trim();
    
    if (!number) {
        alert('Bitte geben Sie eine Telefonnummer ein');
        return;
    }
    
    showLoading();
    
    const result = await window.API.checkNumber(number);
    
    hideLoading();
    displayCheckResult(result);
    
    appState.stats.totalChecks++;
    saveStats();
}

function analyzeNumber(number) {
    const whitelisted = database.whitelist.find(item => 
        item.number === number
    );
    if (whitelisted) {
        return {
            status: 'safe',
            title: '✅ SICHER',
            reason: `Dies ist die offizielle Nummer: ${whitelisted.name}`,
            category: 'Offizielle Nummer',
            action: 'Sie können diese Nummer bedenkenlos annehmen.'
        };
    }
    
    const blacklisted = database.blacklist.find(item => 
        item.number === number
    );
    if (blacklisted) {
        const categoryNames = {
            enkeltrick: 'Enkeltrick',
            polizei: 'Falsche Polizisten',
            gewinnspiel: 'Gewinnspiel-Betrug',
            bank: 'Bank-Betrug',
            schock: 'Schockanruf',
            techsupport: 'Tech-Support'
        };
        
        return {
            status: 'danger',
            title: '🚨 BETRUG BESTÄTIGT',
            reason: `Diese Nummer wurde bereits ${blacklisted.reports}x als Betrug gemeldet!`,
            category: `Kategorie: ${categoryNames[blacklisted.category]}`,
            action: '⚠️ SOFORT AUFLEGEN! Nicht zurückrufen. Nummer blockieren.'
        };
    }
    
    return {
        status: 'warning',
        title: '⚠️ UNBEKANNT / VORSICHT',
        reason: 'Diese Nummer ist uns noch nicht bekannt.',
        category: 'Verdächtig bei: Geldforderung, Zeitdruck, Geheimniskrämerei',
        action: '💡 Bei Geldforderung sofort auflegen! Im Zweifel Nummer hier melden.'
    };
}

function displayCheckResult(result) {
    const resultDiv = document.getElementById('check-result');
    const resultCard = resultDiv.querySelector('.result-card');
    
    resultCard.querySelector('.result-status').className = `result-status ${result.status}`;
    resultCard.querySelector('.result-status').textContent = result.title;
    resultCard.querySelector('.result-title').textContent = result.title;
    resultCard.querySelector('.result-reason').textContent = result.reason;
    resultCard.querySelector('.result-category').textContent = result.category;
    resultCard.querySelector('.result-action').textContent = result.action;
    
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// ===================================
// LEARN PAGE — Dynamisch aus Supabase
// Diese Funktionen ERSETZEN den alten
// initializeLearnPage / showLearnDetail Block in app.js
// ===================================

// Globaler Cache: einmal laden, mehrfach nutzen
window.allTrainingModules = [];

/**
 * Lerninhalte von der API laden und Karten rendern.
 * Ersetzt: initializeLearnPage()
 */
async function initializeLearnPage() {
    const grid = document.querySelector('.learn-grid');
    const backBtn = document.querySelector('.back-btn');

    if (!grid) return;

    // Zurück-Button bleibt statisch
    if (backBtn) {
        backBtn.addEventListener('click', hideLearnDetail);
    }

    // Skeleton-Platzhalter während des Ladens
    grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:2rem; color:#666;">
            <div class="loading-spinner" style="margin:0 auto 1rem;"></div>
            <p>Lerninhalte werden geladen…</p>
        </div>`;

    try {
        const response = await fetch('http://localhost:3000/api/training');
        const data = await response.json();
        const modules = data.modules || [];

        // Globalen Cache befüllen (für Admin-Panel und showLearnDetail)
        window.allTrainingModules = modules;

        if (modules.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:2rem;color:#666;">Noch keine Lerninhalte vorhanden.</p>';
            return;
        }

        // Karten dynamisch rendern
        grid.innerHTML = '';
        modules.forEach(mod => {
            const card = document.createElement('div');
            card.className = 'learn-card';
            card.dataset.moduleId = mod.id;
            card.innerHTML = `
                <div class="card-icon">${mod.icon || '📚'}</div>
                <h3>${mod.title}</h3>
                <p>${mod.description}</p>
                <button class="btn btn-secondary">Mehr erfahren →</button>
            `;
            card.addEventListener('click', () => showLearnDetail(null, mod));
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('❌ Fehler beim Laden der Lerninhalte:', err);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:2rem;color:#d32f2f;">Fehler beim Laden der Lerninhalte. Bitte Server prüfen.</p>';
    }
}

/**
 * Lerninhalt-Detailansicht anzeigen.
 * Ersetzt: showLearnDetail(topic)
 *
 * @param {string|null} topic  - alter Schlüssel (wird ignoriert wenn mod übergeben)
 * @param {object|null} mod    - Modul-Objekt aus der DB
 */
function showLearnDetail(topic, mod) {
    // Entweder Modul direkt übergeben, oder im Cache nachschlagen
    let content = mod;
    if (!content && topic) {
        content = window.allTrainingModules.find(m => m.category === topic || m.id === topic);
    }
    // Fallback auf alten hardcodierten Inhalt (für Rückwärtskompatibilität)
    if (!content && topic && typeof learningContent !== 'undefined' && learningContent[topic]) {
        content = { title: learningContent[topic].title, content: learningContent[topic].content };
    }
    if (!content) return;

    const detailDiv = document.getElementById('learn-detail');
    const contentDiv = detailDiv.querySelector('.detail-content');

    contentDiv.innerHTML = content.content;

    document.querySelector('.learn-grid').style.display = 'none';
    detailDiv.classList.remove('hidden');
    detailDiv.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Zurück zur Übersicht
 */
function hideLearnDetail() {
    document.getElementById('learn-detail').classList.add('hidden');
    document.querySelector('.learn-grid').style.display = 'grid';
    document.querySelector('.page-header').scrollIntoView({ behavior: 'smooth' });
}

function initializeQuizPage() {
    const topicBtns = document.querySelectorAll('.quiz-topic-btn');
    const nextBtn = document.getElementById('quiz-next');
    const restartBtn = document.getElementById('quiz-restart');
    const reviewBtn = document.getElementById('quiz-review');
    
    topicBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            startQuiz(btn.dataset.quiz);
        });
    });
    
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', resetQuiz);
    reviewBtn.addEventListener('click', () => {
        resetQuiz();
    });
}

function startQuiz(topic) {
    appState.currentQuiz = topic;
    appState.currentQuestion = 0;
    appState.quizScore = 0;
    appState.quizAnswers = [];

    // 🎯 الـلـمـسـة الـسِّـحْـرِيَّـة:
    // إذا لقاو كويز جاي من Supabase كيطابق هاد الـ Category (Topic)، كنعوضو بيه الأسئلة ديريكت!
    if (window.allAdminQuizzes) {
        const dbQuiz = window.allAdminQuizzes.find(q => q.category === topic);
        if (dbQuiz && dbQuiz.questions) {
            // تحويل التسميات إذا كان الباكند كيرد correct_answer والـ Frontend باغي correct
            quizQuestions[topic] = dbQuiz.questions.map(q => ({
                question: q.question,
                scenario: q.scenario || '',
                options: q.options || [],
                correct: q.correct_answer !== undefined ? Number(q.correct_answer) : Number(q.correct),
                explanation: q.explanation || ''
            }));
            console.log(`🧠 Quiz für ${topic} erfolgreich aus Supabase geladen!`);
        }
    }
    
    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-container').classList.remove('hidden');
    
    loadQuestion();
}

function loadQuestion() {
    const questions = quizQuestions[appState.currentQuiz];
    const question = questions[appState.currentQuestion];
    
    document.getElementById('current-q').textContent = appState.currentQuestion + 1;
    document.getElementById('total-q').textContent = questions.length;
    document.getElementById('question-text').textContent = question.question;
    
    const progress = ((appState.currentQuestion) / questions.length) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
    
    const scenarioDiv = document.getElementById('quiz-scenario');
    if (question.scenario) {
        scenarioDiv.textContent = question.scenario;
        scenarioDiv.classList.remove('hidden');
    } else {
        scenarioDiv.classList.add('hidden');
    }
    
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'quiz-option';
        optionBtn.textContent = option;
        optionBtn.addEventListener('click', () => selectAnswer(index));
        optionsDiv.appendChild(optionBtn);
    });
    
    document.getElementById('quiz-feedback').classList.add('hidden');
    document.getElementById('quiz-next').classList.add('hidden');
}

function selectAnswer(selectedIndex) {
    const questions = quizQuestions[appState.currentQuiz];
    const question = questions[appState.currentQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach(opt => opt.classList.add('disabled'));
    
    options[selectedIndex].classList.add('selected');
    
    const isCorrect = selectedIndex === question.correct;
    
    if (isCorrect) {
        options[selectedIndex].classList.add('correct');
        appState.quizScore++;
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correct].classList.add('correct');
    }
    
    const feedbackDiv = document.getElementById('quiz-feedback');
    feedbackDiv.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `
        <h3>${isCorrect ? '✅ Richtig!' : '❌ Leider falsch'}</h3>
        <p>${question.explanation}</p>
    `;
    feedbackDiv.classList.remove('hidden');
    
    document.getElementById('quiz-next').classList.remove('hidden');
    
    appState.quizAnswers.push({
        question: question.question,
        selected: selectedIndex,
        correct: question.correct,
        isCorrect: isCorrect
    });
}

function nextQuestion() {
    const questions = quizQuestions[appState.currentQuiz];
    
    if (appState.currentQuestion < questions.length - 1) {
        appState.currentQuestion++;
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const questions = quizQuestions[appState.currentQuiz];
    const percentage = (appState.quizScore / questions.length) * 100;
    
    let message = '';
    if (percentage === 100) {
        message = '🎉 Perfekt! Sie sind bestens geschützt vor Betrügern!';
    } else if (percentage >= 80) {
        message = '👍 Sehr gut! Sie wissen, wie Sie sich schützen können.';
    } else if (percentage >= 60) {
        message = '✅ Gut gemacht! Schauen Sie sich die Lernmodule nochmal an.';
    } else {
        message = '📚 Üben Sie weiter! Die Lernmodule helfen Ihnen dabei.';
    }
    
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');
    document.getElementById('final-score').textContent = appState.quizScore;
    document.getElementById('total-q').textContent = questions.length;
    document.getElementById('results-message').textContent = message;
    
    appState.stats.totalQuizzes++;
    saveStats();
}

function resetQuiz() {
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-start').style.display = 'block';
    appState.currentQuiz = null;
}

function initializeReportPage() {
    const submitBtn = document.getElementById('submit-report');
    const newReportBtn = document.getElementById('new-report');
    
    submitBtn.addEventListener('click', submitReport);
    newReportBtn.addEventListener('click', resetReportForm);
}

async function submitReport() {
    const phone = document.getElementById('report-phone').value.trim();
    const category = document.getElementById('report-category').value;
    const details = document.getElementById('report-details').value.trim();
    
    if (!phone) {
        alert('Bitte geben Sie eine Telefonnummer ein');
        return;
    }
    
    showLoading();
    
    const success = await window.API.reportNumber(phone, category, details);
    
    hideLoading();
    
    if (success) {
        document.querySelector('.report-form').style.display = 'none';
        document.querySelector('.report-info').style.display = 'none';
        document.getElementById('report-success').classList.remove('hidden');
        
        appState.stats.totalReports++;
        if (category) {
            appState.reportsByCategory[category]++;
        }
        saveStats();
    } else {
        alert('Fehler beim Melden der Nummer');
    }
}

function resetReportForm() {
    document.getElementById('report-phone').value = '';
    document.getElementById('report-category').value = '';
    document.getElementById('report-details').value = '';
    
    document.querySelector('.report-form').style.display = 'block';
    document.querySelector('.report-info').style.display = 'flex';
    document.getElementById('report-success').classList.add('hidden');
}

function initializeAdminPage() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            if (tabName === 'stats') {
                updateStatsDisplay();
            } else if (tabName === 'numbers') {
                updateNumbersList();
            }
        });
    });
    
    updateStatsDisplay();
const refreshBtn = document.getElementById('refresh-numbers');
if (refreshBtn) refreshBtn.addEventListener('click', () => updateNumbersList());

const searchInput = document.getElementById('number-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim();
    updateNumbersList(term);
  });
}
}

async function updateStatsDisplay() {

    if (!isAdmin()) {
        console.log("⛔ Not admin → skip stats");
        return;
    }

    const statsResponse = await window.API.getStatistics();
    const stats = statsResponse.stats || statsResponse; // Kompatibilität
    const allNumbers = await window.API.getAllNumbers();
    
    document.getElementById('total-checks').textContent = appState.stats.totalChecks;
    document.getElementById('total-reports').textContent = stats.totalReports;
    document.getElementById('total-quizzes').textContent = appState.stats.totalQuizzes;
    document.getElementById('blacklist-count').textContent = stats.totalNumbers;
    
    displayCategoryStats(stats.byCategory);
    
    displayRecentNumbers(allNumbers.slice(0, 5));
}

async function updateNumbersList(searchTerm = '') {

  if (!isAdmin()) {
    console.log("⛔ Not admin → skip numbers");
    return;
  }

  const listDiv = document.getElementById('numbers-list');
  if (!listDiv) return;

  listDiv.innerHTML = '<p style="padding: 2rem; text-align: center;">Lade Daten...</p>';

  try {
    const numbers = searchTerm
      ? await window.DB.searchNumbers(searchTerm)
      : await window.DB.getAllNumbers();

    if (!numbers || numbers.length === 0) {
      listDiv.innerHTML = '<p style="padding: 2rem; text-align: center;">Keine Nummern gefunden</p>';
      return;
    }

    listDiv.innerHTML = '';

    numbers.forEach(num => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'number-item';

      const categoryLabel = getCategoryName(num.category);
      const count = num.reports_count ?? 0;

      const status =
        count >= 5 ? 'danger' :
        count >= 3 ? 'warning' :
        'safe';

      const statusLabel =
        status === 'danger' ? '🚨 Gefahr' :
        status === 'warning' ? '⚠️ Verdächtig' :
        '✅ Unauffällig';

      itemDiv.innerHTML = `
        <div>
          <strong>${num.phone}</strong><br>
          <small>${categoryLabel} | ${count} Meldungen | ${statusLabel}</small>
        </div>
      `;

      listDiv.appendChild(itemDiv);
    });

  } catch (err) {
    console.error('❌ Fehler beim Laden der Nummern:', err);
    listDiv.innerHTML = '<p style="padding: 2rem; text-align: center;">Fehler beim Laden (RLS/Netzwerk).</p>';
  }
}

       
function removeFromBlacklist(number) {
    const index = database.blacklist.findIndex(item => item.number === number);
    if (index > -1) {
        database.blacklist.splice(index, 1);
        updateNumbersList();
        appState.stats.blacklistCount = database.blacklist.length;
        saveStats();
    }
}

function saveStats() {
    localStorage.setItem('betrugsschutz_stats', JSON.stringify(appState.stats));
    localStorage.setItem('betrugsschutz_categories', JSON.stringify(appState.reportsByCategory));
}

function loadStats() {
    const savedStats = localStorage.getItem('betrugsschutz_stats');
    const savedCategories = localStorage.getItem('betrugsschutz_categories');
    
    if (savedStats) {
        appState.stats = JSON.parse(savedStats);
    }
    
    if (savedCategories) {
        appState.reportsByCategory = JSON.parse(savedCategories);
    }

}

function initializePWA() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installPrompt = document.getElementById('install-prompt');
        installPrompt.classList.remove('hidden');
        
        document.getElementById('install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                installPrompt.classList.add('hidden');
            }
        });
        
        document.querySelector('.install-close').addEventListener('click', () => {
            installPrompt.classList.add('hidden');
        });
    });
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(err => console.log('Service Worker registration failed:', err));
    }
}


window.removeFromBlacklist = removeFromBlacklist;

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
        item.innerHTML = `
            <span style="font-size: 1.5rem; margin-right: 10px;">${cat.icon}</span>
            <span style="flex: 1;">${cat.name}</span>
            <span style="font-weight: bold;">${count}</span>
        `;
        list.appendChild(item);
    });
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

/* --- CallSafe Footer JS --- */

const csYearEl = document.getElementById('cs-footer-year');
if (csYearEl) csYearEl.textContent = new Date().getFullYear();

const csFooterInstallBtn = document.getElementById('pwa-install-footer-btn');
const csFooterInstallLink = document.getElementById('pwa-footer-link');

function csTriggerPwaInstall(e) {
    e.preventDefault();
    const installBtn = document.getElementById('install-btn');
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt && !installPrompt.classList.contains('hidden')) {
        if (installBtn) installBtn.click();
    } else if (installPrompt) {
        installPrompt.classList.remove('hidden');
    }
}

if (csFooterInstallBtn) csFooterInstallBtn.addEventListener('click', csTriggerPwaInstall);
if (csFooterInstallLink) csFooterInstallLink.addEventListener('click', csTriggerPwaInstall);


/* ================================================
   CALLSAFE — SCHRITT 3: JS ans Ende von app.js
   ================================================ */

/* --- Modal öffnen / schließen --- */
function csOpenModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Hintergrund nicht scrollbar
}

function csCloseModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = ''; // Scroll wieder freigeben
}

// Schließen wenn man auf den dunklen Hintergrund klickt
document.querySelectorAll('.cs-info-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
});

// Schließen mit ESC-Taste
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.cs-info-overlay.open').forEach(overlay => {
            overlay.classList.remove('open');
        });
        document.body.style.overflow = '';
    }
});

/* --- Footer-Links verknüpfen --- */
document.addEventListener('DOMContentLoaded', function () {

    // Datenschutz-Link im Footer
    const linkDatenschutz = document.querySelector('[aria-label="Datenschutzerklärung"]');
    if (linkDatenschutz) {
        linkDatenschutz.addEventListener('click', function(e) {
            e.preventDefault();
            csOpenModal('csModalDatenschutz');
        });
    }

    // Über uns-Link im Footer
    const linkUeberUns = document.querySelector('[aria-label="Über uns"]');
    if (linkUeberUns) {
        linkUeberUns.addEventListener('click', function(e) {
            e.preventDefault();
            csOpenModal('csModalUeberUns');
        });
    }

    // Kontakt-Link im Footer
    const linkKontakt = document.querySelector('[aria-label="Kontaktdaten"]');
    if (linkKontakt) {
        linkKontakt.addEventListener('click', function(e) {
            e.preventDefault();
            csOpenModal('csModalKontakt');
        });
    }
});
