const API_URL = 'http://localhost:3000/api';
window.API_URL = API_URL;

function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}
function getToken() {
    return localStorage.getItem('token');
}
window.getToken = getToken;

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}



async function checkNumberInDB(phoneNumber) {
    try {
        console.log('API.checkNumber reçu:', phoneNumber);

        const encodedPhone = encodeURIComponent(phoneNumber);
        const url = `${API_URL}/numbers/check/${encodedPhone}`;
        console.log('URL appelée:', url);

        const response = await fetch(url);
        console.log('Status réponse:', response.status);

        const rawText = await response.text();
        console.log('Réponse brute:', rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            throw new Error(`Réponse non JSON: ${rawText}`);
        }

        if (!response.ok) throw new Error(data.error || 'Erreur backend');

        if (!data.found) {
            return {
                status: 'warning',
                title: '⚠️ UNBEKANNT',
                reason: 'Diese Nummer wurde noch nicht gemeldet.',
                category: 'Unbekannt',
                action: 'Vorsichtig sein!'
            };
        }

        const titles = {
            safe: '✅ UNAUFFÄLLIG',
            warning: '⚠️ VORSICHT',
            danger: '🚨 BETRUG BESTÄTIGT'
        };

        return {
            status: data.status,
            title: titles[data.status] || '⚠️ UNBEKANNT',
            reason: data.message,
            category: data.data?.category || 'Unbekannt',
            action: data.status === 'danger'
                ? 'Sofort auflegen!'
                : 'Vorsichtig sein!'
        };
    } catch (error) {
        console.error('Check error complet:', error);

        return {
            status: 'warning',
            title: '⚠️ FEHLER',
            reason: `Fehler beim Abrufen: ${error.message || error}`,
            category: '',
            action: 'Später erneut versuchen'
        };
    }
}

async function reportNumberToDB(phoneNumber, category, details = '') {
    try {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phoneNumber,
                category: category || 'sonstiges',
                details: details
            })
        });
        
        if (response.ok) {
            console.log('✅ Report gespeichert');
            return true;
        } else {
            console.error('❌ Fehler beim Melden');
            return false;
        }
    } catch (error) {
        console.error('Report error:', error);
        return false;
    }
}

async function getStatisticsFromDB() {
    try {
        const response = await fetch(`${API_URL}/numbers/stats`, {
            headers: getAuthHeaders()
        });

        const text = await response.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Stats response is not JSON:', text);
            throw new Error('Stats response is not valid JSON');
        }

        if (!response.ok) {
            throw new Error(data.error || 'Fehler beim Laden der Statistiken');
        }

        return data.stats || data;
    } catch (error) {
        console.error('Stats error:', error);
        return {
            totalNumbers: 0,
            totalReports: 0,
            byCategory: {},
            byStatus: {}
        };
    }
}

async function getAllNumbersFromDB() {
    try {
        const response = await fetch(`${API_URL}/numbers`, {
            headers: getAuthHeaders()
        });

        const text = await response.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Numbers response is not JSON:', text);
            throw new Error('Numbers response is not valid JSON');
        }

        if (!response.ok) {
            throw new Error(data.error || 'Fehler beim Laden der Nummern');
        }

        return data.numbers || data || [];
    } catch (error) {
        console.error('Get numbers error:', error);
        return [];
    }
}

async function searchNumbersInDB(searchTerm) {
    try {
        const numbers = await getAllNumbersFromDB();
        
        // Frontend-Suche
        return numbers.filter(n => 
            n.phone && n.phone.includes(searchTerm)
        );
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}


window.API = {
    login,
    logout,
    isLoggedIn,
    isAdmin,
    getCurrentUser,
    checkNumber: checkNumberInDB,
    reportNumber: reportNumberToDB,
    getStatistics: getStatisticsFromDB,
    getAllNumbers: getAllNumbersFromDB,
    searchNumbers: searchNumbersInDB
};

window.DB = {
    checkNumber: checkNumberInDB,
    reportNumber: reportNumberToDB,
    getStatistics: getStatisticsFromDB,
    getAllNumbers: getAllNumbersFromDB,
    searchNumbers: searchNumbersInDB
};

console.log('✅ API Client geladen');
console.log('📊 Backend:', API_URL);
console.log('🔌 window.API & window.DB bereit!');

// ==========================================
// 🎯 QUIZ API FUNCTIONS (الإنشاء والتعديل والمسح)
// ==========================================

async function createQuiz(quizData) {
    try {
        const response = await fetch(`${API_URL}/quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim Erstellen des Quiz');
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error in createQuiz:', error);
        throw error;
    }
}

async function updateQuiz(quizId, quizData) {
    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim Aktualisieren des Quiz');
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error in updateQuiz:', error);
        throw error;
    }
}

async function deleteQuiz(quizId) {
    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim Löschen des Quiz');
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error in deleteQuiz:', error);
        throw error;
    }
}

// 🔗 ربط الدالات الجداد مع الـ window Object باش الـ Dashboard يقراهم
window.API.createQuiz = createQuiz;
window.API.updateQuiz = updateQuiz;
window.API.deleteQuiz = deleteQuiz;

console.log('🧠 Quiz API Funktionen erfolgreich an window.API gebunden!');