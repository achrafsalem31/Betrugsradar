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
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin';
}

const database = {
    blacklist: [
        { number: '030 98765432', category: 'enkeltrick', reports: 12 },
        { number: '+49 40 12345678', category: 'polizei', reports: 8 },
        { number: '0221 555666', category: 'gewinnspiel', reports: 15 },
        { number: '089 777888', category: 'bank', reports: 6 }
    ],
    whitelist: [
        { number: '110', name: 'Polizei Notruf' },
        { number: '112', name: 'Feuerwehr Notruf' },
        { number: '116 116', name: 'Sperr-Notruf' }
    ],
    reports: []
};

const learningContent = {
    enkeltrick: {
        title: 'Enkeltrick',
        icon: '👵',
        description: 'So funktioniert der Enkeltrick und wie Sie sich schützen',
        content: `
            <h2>🚨 Was ist der Enkeltrick?</h2>
            <p>Beim Enkeltrick geben sich Betrüger am Telefon als Verwandte aus – oft als Enkel, Nichte oder Neffe. Sie erzählen eine dringende Notlage und fordern Geld.</p>
            
            <div class="warning-box">
                <h3>⚠️ Typische Aussagen:</h3>
                <ul>
                    <li>"Hallo Oma/Opa, rate mal wer dran ist!"</li>
                    <li>"Ich hatte einen Unfall und brauche dringend Geld"</li>
                    <li>"Ich bin in der Türkei verhaftet worden"</li>
                    <li>"Ich möchte eine Wohnung kaufen, brauche aber schnell Geld"</li>
                </ul>
            </div>

            <h3>✅ So schützen Sie sich:</h3>
            <ul>
                <li><strong>Legen Sie sofort auf!</strong> Echte Verwandte verstehen das.</li>
                <li>Rufen Sie Ihre Verwandten unter der Ihnen bekannten Nummer zurück</li>
                <li>Nennen Sie niemals Namen am Telefon ("Bist du es, Klaus?")</li>
                <li>Übergeben Sie niemals Geld an Fremde</li>
                <li>Sprechen Sie mit Vertrauenspersonen</li>
            </ul>

            <div class="tip-box">
                <h3>💡 Merksatz:</h3>
                <p><strong>"Echte Enkel fragen nicht am Telefon nach Geld!"</strong></p>
            </div>

            <h3>📞 Was tun im Ernstfall?</h3>
            <ul>
                <li>Sofort die Polizei unter 110 anrufen</li>
                <li>Nummer bei der Bundesnetzagentur melden</li>
                <li>Mit Familie und Freunden darüber sprechen</li>
            </ul>
        `
    },
    polizei: {
        title: 'Falsche Polizisten',
        icon: '👮',
        description: 'Erkennen Sie falsche Polizeibeamte',
        content: `
            <h2>🚨 Falsche Polizisten</h2>
            <p>Betrüger geben sich als Polizeibeamte aus und behaupten, dass Ihre Wertsachen in Gefahr sind. Sie fordern Sie auf, Geld und Schmuck "zur sicheren Verwahrung" herauszugeben.</p>
            
            <div class="warning-box">
                <h3>⚠️ Typische Maschen:</h3>
                <ul>
                    <li>"Wir sind von der Polizei. In Ihrer Nachbarschaft gab es Einbrüche"</li>
                    <li>"Ihr Name steht auf einer Liste von Einbrechern"</li>
                    <li>"Wir müssen Ihre Wertsachen in Sicherheit bringen"</li>
                    <li>"Ein Mitarbeiter Ihrer Bank ist verhaftet worden"</li>
                </ul>
            </div>

            <h3>✅ Die echte Polizei:</h3>
            <ul>
                <li>Fordert niemals am Telefon Geld oder Wertsachen</li>
                <li>Holt niemals Bargeld oder Schmuck bei Ihnen ab</li>
                <li>Fragt niemals nach PINs oder TANs</li>
                <li>Übt niemals Druck aus</li>
            </ul>

            <div class="tip-box">
                <h3>💡 Merksatz:</h3>
                <p><strong>"Die echte Polizei holt kein Geld ab!"</strong></p>
            </div>

            <h3>📞 Richtig reagieren:</h3>
            <ul>
                <li>Legen Sie sofort auf</li>
                <li>Rufen Sie selbst die 110 an (nicht zurückrufen!)</li>
                <li>Öffnen Sie niemandem die Tür</li>
                <li>Übergeben Sie niemals Geld an Fremde</li>
            </ul>
        `
    },
    schock: {
        title: 'Schockanrufe',
        icon: '🚨',
        description: 'Schockanrufe erkennen und richtig reagieren',
        content: `
            <h2>🚨 Schockanrufe</h2>
            <p>Bei Schockanrufen wird eine dramatische Notsituation vorgetäuscht, um Sie unter Druck zu setzen und zu schnellen Geldzahlungen zu bewegen.</p>
            
            <div class="warning-box">
                <h3>⚠️ Typische Szenarien:</h3>
                <ul>
                    <li>"Ihr Sohn/Tochter hatte einen schweren Unfall"</li>
                    <li>"Ihr Enkel hat jemanden überfahren und braucht Kaution"</li>
                    <li>"Ein Familienmitglied wurde verhaftet"</li>
                    <li>"Es droht eine Gefängnisstrafe ohne sofortige Zahlung"</li>
                </ul>
            </div>

            <h3>✅ So durchschauen Sie den Betrug:</h3>
            <ul>
                <li>Echte Polizei oder Staatsanwaltschaft fordert kein Geld am Telefon</li>
                <li>Kautionen werden nicht bar übergeben</li>
                <li>Bei echten Notfällen haben Sie Zeit, sich zu vergewissern</li>
                <li>Druck und Zeitnot sind typische Betrugsmerkmale</li>
            </ul>

            <div class="tip-box">
                <h3>💡 Merksatz:</h3>
                <p><strong>"Bei Schock erst mal stoppen - auflegen!"</strong></p>
            </div>

            <h3>📞 Richtige Reaktion:</h3>
            <ul>
                <li>Sofort auflegen, auch wenn es schwerfällt</li>
                <li>Tief durchatmen und Ruhe bewahren</li>
                <li>Angebliches Familienmitglied direkt anrufen</li>
                <li>Mit Vertrauenspersonen sprechen</li>
                <li>Polizei unter 110 informieren</li>
            </ul>
        `
    },
    bank: {
        title: 'Bank / TAN-Betrug',
        icon: '🏦',
        description: 'Schützen Sie Ihre Bankdaten',
        content: `
            <h2>🚨 Bank- und TAN-Betrug</h2>
            <p>Betrüger geben sich als Bankmitarbeiter aus und behaupten, es gäbe Probleme mit Ihrem Konto. Sie fordern Kontodaten, PINs oder TANs.</p>
            
            <div class="warning-box">
                <h3>⚠️ Typische Anrufe:</h3>
                <ul>
                    <li>"Ihr Konto wurde gesperrt, wir brauchen Ihre PIN"</li>
                    <li>"Verdächtige Abbuchungen - nennen Sie uns Ihre TAN"</li>
                    <li>"Wir müssen Ihr Konto verifizieren"</li>
                    <li>"Aktualisieren Sie Ihre Daten in dieser SMS/E-Mail"</li>
                </ul>
            </div>

            <h3>✅ Wichtig zu wissen:</h3>
            <ul>
                <li>Ihre Bank ruft Sie nie unaufgefordert an</li>
                <li>Bankmitarbeiter fragen niemals nach PIN oder TAN</li>
                <li>Seriöse Links kommen nicht per SMS</li>
                <li>Echte Banken setzen Sie niemals unter Zeitdruck</li>
            </ul>

            <div class="tip-box">
                <h3>💡 Merksatz:</h3>
                <p><strong>"PIN und TAN sind nur für mich - niemals weitergeben!"</strong></p>
            </div>

            <h3>📞 So reagieren Sie richtig:</h3>
            <ul>
                <li>Legen Sie sofort auf</li>
                <li>Geben Sie niemals PIN, TAN oder Passwörter weiter</li>
                <li>Klicken Sie nicht auf Links in SMS oder E-Mails</li>
                <li>Rufen Sie Ihre Bank unter der bekannten Nummer an</li>
                <li>Im Zweifelsfall persönlich zur Bankfiliale gehen</li>
            </ul>
        `
    },
    techsupport: {
        title: 'Tech-Support Betrug',
        icon: '💻',
        description: 'Falsche Microsoft-Mitarbeiter erkennen',
        content: `
            <h2>🚨 Tech-Support Betrug</h2>
            <p>Betrüger geben sich als Microsoft-Mitarbeiter oder IT-Techniker aus und behaupten, Ihr Computer hätte ein Problem oder einen Virus.</p>
            
            <div class="warning-box">
                <h3>⚠️ Typische Behauptungen:</h3>
                <ul>
                    <li>"Wir sind von Microsoft, Ihr Computer ist infiziert"</li>
                    <li>"Wir haben verdächtige Aktivitäten festgestellt"</li>
                    <li>"Ihr Windows-Lizenz läuft ab"</li>
                    <li>"Installieren Sie dieses Programm zur Fernwartung"</li>
                </ul>
            </div>

            <h3>✅ Die Wahrheit:</h3>
            <ul>
                <li>Microsoft ruft Privatpersonen niemals unaufgefordert an</li>
                <li>Echte Fehlermeldungen kommen nicht per Telefon</li>
                <li>Fernwartungssoftware nur nach eigener Anfrage installieren</li>
                <li>Seriöse Firmen fordern kein Geld am Telefon</li>
            </ul>

            <div class="tip-box">
                <h3>💡 Merksatz:</h3>
                <p><strong>"Microsoft ruft nicht an - das ist Betrug!"</strong></p>
            </div>

            <h3>📞 Richtig handeln:</h3>
            <ul>
                <li>Sofort auflegen ohne Diskussion</li>
                <li>Niemals Fernzugriff auf Ihren Computer gewähren</li>
                <li>Keine Software von Unbekannten installieren</li>
                <li>Bei Unsicherheit: Computerexperten im Bekanntenkreis fragen</li>
                <li>Nummer melden und andere warnen</li>
            </ul>
        `
    },
    gewinnspiel: {
        title: 'Gewinnspiel-Betrug',
        icon: '🎁',
        description: 'Falsche Gewinnversprechen durchschauen',
        content: `
            <h2>🚨 Gewinnspiel-Betrug</h2>
            <p>Sie erhalten einen Anruf: "Herzlichen Glückwunsch, Sie haben gewonnen!" Doch um den Gewinn zu erhalten, sollen Sie erst Geld zahlen.</p>
            
            <div class="warning-box">
                <h3>⚠️ Typische Maschen:</h3>
                <ul>
                    <li>"Sie haben 50.000 Euro gewonnen!"</li>
                    <li>"Zahlen Sie nur die Bearbeitungsgebühr von 900 Euro"</li>
                    <li>"Überweisen Sie die Steuern im Voraus"</li>
                    <li>"Kaufen Sie Gutscheine für die Zustellung"</li>
                </ul>
            </div>

            <h3>✅ Echte Gewinnspiele:</h3>
            <ul>
                <li>Fordern niemals Geld im Voraus</li>
                <li>Benötigen keine "Bearbeitungsgebühren"</li>
                <li>Steuern werden vom Gewinn abgezogen, nicht vorher bezahlt</li>
                <li>Setzen Sie nicht unter Zeitdruck</li>
            </ul>

            <div class="tip-box">
                <h3>💡 Merksatz:</h3>
                <p><strong>"Echter Gewinn kostet nichts!"</strong></p>
            </div>

            <h3>📞 So reagieren Sie:</h3>
            <ul>
                <li>Auflegen - seriöse Gewinnspiele rufen nicht an</li>
                <li>Niemals Geld zahlen für einen angeblichen Gewinn</li>
                <li>Keine persönlichen Daten am Telefon nennen</li>
                <li>Bei echten Gewinnspielen: Schriftlich bestätigen lassen</li>
                <li>Im Zweifel Verbraucherzentrale kontaktieren</li>
            </ul>
        `
    }
};

const quizQuestions = {
    enkeltrick: [
        {
            question: 'Ein Anrufer sagt: "Hallo Oma, rate mal wer dran ist!" Was sollten Sie tun?',
            scenario: '"Hallo Oma, ich bin\'s! Rate mal wer dran ist! Ich habe ein großes Problem..."',
            options: [
                'Namen raten: "Bist du es, Michael?"',
                'Sofort auflegen und unter bekannter Nummer zurückrufen',
                'Fragen was passiert ist',
                'Nachfragen wo er anruft'
            ],
            correct: 1,
            explanation: 'Richtig! Legen Sie sofort auf. Echte Verwandte nennen ihren Namen. Rufen Sie unter der Ihnen bekannten Nummer zurück.'
        },
        {
            question: 'Ihr "Enkel" braucht dringend 5.000 Euro für einen Autokauf. Was tun?',
            options: [
                'Sofort zur Bank gehen',
                'Auflegen und echten Enkel unter bekannter Nummer anrufen',
                'Fragen ob er das Geld abholen kommt',
                'Nach der Kontonummer fragen'
            ],
            correct: 1,
            explanation: 'Genau! Legen Sie auf und rufen Sie Ihren Enkel unter der Nummer an, die Sie kennen. Echte Verwandte fragen nicht am Telefon nach Geld.'
        },
        {
            question: 'Was ist das wichtigste Warnsignal beim Enkeltrick?',
            options: [
                'Der Anrufer spricht zu schnell',
                'Es wird Geld gefordert und Zeitdruck aufgebaut',
                'Die Nummer ist unterdrückt',
                'Der Anruf kommt vormittags'
            ],
            correct: 1,
            explanation: 'Richtig! Geldforderung + Zeitdruck = Betrug. Echte Notfälle lassen Zeit zum Nachdenken.'
        }
    ],
    polizei: [
        {
            question: 'Die "Polizei" ruft an und sagt, Einbrecher hätten Ihre Adresse. Sie sollen Wertsachen rausgeben. Was stimmt?',
            scenario: '"Guten Tag, hier spricht Kommissar Müller. In Ihrer Nachbarschaft gab es Einbrüche. Wir müssen Ihre Wertsachen in Sicherheit bringen."',
            options: [
                'Das ist normal, die Polizei will helfen',
                'Das ist Betrug - echte Polizei holt kein Geld ab',
                'Ich sollte fragen welche Dienststelle',
                'Ich vereinbare einen Termin'
            ],
            correct: 1,
            explanation: 'Absolut richtig! Die echte Polizei holt niemals Geld oder Wertsachen bei Ihnen ab. Das ist 100% Betrug!'
        },
        {
            question: 'Wie können Sie einen echten Polizisten von einem Betrüger unterscheiden?',
            options: [
                'Echte Polizisten nennen eine Dienstnummer',
                'Echte Polizei fordert niemals Geld am Telefon',
                'Echte Polizisten rufen von 110 an',
                'Echte Polizisten haben einen Ausweis'
            ],
            correct: 1,
            explanation: 'Korrekt! Die echte Polizei fordert niemals telefonisch Geld, PINs oder Wertsachen. Dienstnummern können gefälscht werden.'
        },
        {
            question: 'Ein "Polizist" steht vor Ihrer Tür und will Schmuck "sicherstellen". Was tun?',
            options: [
                'Tür öffnen und Ausweis zeigen lassen',
                'Tür geschlossen lassen und 110 anrufen',
                'Durch Spion schauen ob Uniform',
                'Nachbarn holen'
            ],
            correct: 1,
            explanation: 'Richtig! Tür zu lassen und selbst die 110 anrufen. Echte Polizei versteht das und bestätigt es.'
        }
    ],
    bank: [
        {
            question: 'Ihre "Bank" ruft an und braucht zur Sicherheit Ihre TAN. Richtig oder falsch?',
            scenario: '"Guten Tag, hier ist Ihre Sparkasse. Wir haben verdächtige Aktivitäten festgestellt. Zur Verifizierung brauchen wir eine TAN von Ihnen."',
            options: [
                'Richtig - die Bank braucht das zur Sicherheit',
                'Falsch - Banken fragen niemals nach PIN oder TAN',
                'Richtig - aber nur bei Sicherheitsproblemen',
                'Falsch - nur die PIN darf man nennen'
            ],
            correct: 1,
            explanation: 'Absolut richtig! Ihre Bank fragt niemals nach PIN, TAN oder Passwort. Niemals! Das ist immer Betrug.'
        },
        {
            question: 'Sie bekommen eine SMS: "Ihr Konto wurde gesperrt. Klicken Sie hier." Was tun?',
            options: [
                'Sofort auf den Link klicken',
                'SMS löschen und Bank unter bekannter Nummer anrufen',
                'Antworten und nach Details fragen',
                'Link erst am Computer öffnen'
            ],
            correct: 1,
            explanation: 'Genau richtig! SMS löschen und selbst bei Ihrer Bank anrufen. Echte Banken verschicken keine Links per SMS.'
        },
        {
            question: 'Woran erkennen Sie einen Betrugsversuch der "Bank"?',
            options: [
                'Zeitdruck und Drohungen',
                'Unbekannte Telefonnummer',
                'Forderung nach PIN/TAN',
                'Alle genannten Punkte'
            ],
            correct: 3,
            explanation: 'Perfekt! Alle Punkte sind Warnzeichen. Zeitdruck, unbekannte Nummer UND Forderung nach Zugangsdaten = Betrug!'
        }
    ],
    allgemein: [
        {
            question: 'Was ist der beste Schutz vor Telefonbetrug?',
            options: [
                'Niemals ans Telefon gehen',
                'Bei Geldforderung oder Druck sofort auflegen',
                'Immer nett sein am Telefon',
                'Nur mit Verwandten sprechen'
            ],
            correct: 1,
            explanation: 'Richtig! Geldforderung oder Druck = sofort auflegen. Echte Verwandte und Behörden verstehen das.'
        },
        {
            question: 'Sie sind unsicher ob ein Anruf echt ist. Was ist am sichersten?',
            scenario: 'Ein Anrufer behauptet, von einer Behörde zu sein und drängt Sie zu schnellem Handeln.',
            options: [
                'Dem Anrufer vertrauen',
                'Auflegen und selbst die offizielle Nummer anrufen',
                'Nachbarn um Rat fragen',
                'Zurückrufen unter der angezeigten Nummer'
            ],
            correct: 1,
            explanation: 'Perfekt! Auflegen und selbst die offizielle Nummer (aus Telefonbuch/Internet) anrufen. Angezeigte Nummern können gefälscht sein.'
        },
        {
            question: 'Welche Aussage ist richtig?',
            options: [
                'Polizei holt manchmal Geld zur Sicherheit ab',
                'Microsoft ruft bei Computerproblemen an',
                'Echte Gewinne kosten niemals Geld',
                'Banken fragen nach TAN bei Sicherheitschecks'
            ],
            correct: 2,
            explanation: 'Genau! Echte Gewinne kosten nichts. Alle anderen Aussagen sind falsch und typisch für Betrug.'
        },
        {
            question: 'Ein Anrufer setzt Sie unter Zeitdruck: "Sie müssen JETZT entscheiden!" Was bedeutet das?',
            options: [
                'Es ist wirklich dringend',
                'Typisches Zeichen für Betrug',
                'Seriöses Angebot',
                'Ich sollte schnell handeln'
            ],
            correct: 1,
            explanation: 'Richtig! Zeitdruck ist ein klassisches Betrugszeichen. Seriöse Angebote geben Ihnen Bedenkzeit.'
        },
        {
            question: 'Was sollten Sie NIEMALS am Telefon weitergeben?',
            options: [
                'Ihren Vornamen',
                'PIN, TAN, Passwörter',
                'Ihre Stadt',
                'Dass Sie zu Hause sind'
            ],
            correct: 1,
            explanation: 'Absolut korrekt! PIN, TAN, Passwörter niemals am Telefon nennen. Auch nicht bei vermeintlich offiziellen Anrufern!'
        }
    ]
};

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

function initializeLearnPage() {
    const learnCards = document.querySelectorAll('.learn-card');
    const backBtn = document.querySelector('.back-btn');
    
    learnCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.dataset.topic;
            showLearnDetail(topic);
        });
    });
    
    if (backBtn) {
        backBtn.addEventListener('click', hideLearnDetail);
    }
}

function showLearnDetail(topic) {
    const content = learningContent[topic];
    if (!content) return;
    
    const detailDiv = document.getElementById('learn-detail');
    const contentDiv = detailDiv.querySelector('.detail-content');
    
    contentDiv.innerHTML = content.content;
    
    document.querySelector('.learn-grid').style.display = 'none';
    detailDiv.classList.remove('hidden');
    detailDiv.scrollIntoView({ behavior: 'smooth' });
}

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

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
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

function displayRecentNumbers(numbers) {
    const list = document.getElementById('recent-numbers');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (numbers.length === 0) {
        list.innerHTML = '<p>Noch keine Nummern gemeldet</p>';
        return;
    }
    
    numbers.forEach(num => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 10px; border-bottom: 1px solid #eee;';
        item.innerHTML = `
            <strong>${num.phone}</strong><br>
            <small>${getCategoryName(num.category)} - ${num.reports_count} Meldungen</small>
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
