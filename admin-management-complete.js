// ===================================
// KOMPLETTES ADMIN MANAGEMENT SYSTEM
// Füge dies zu admin-system.js HINZU (am Ende)!
// ===================================

// ===================================
// 1. NUMMERN-VERWALTUNG (CRUD)
// ===================================

/**
 * Setup Numbers Management
 */
function setupNumbersManagement() {
    // Add Number Button
    const addBtn = document.getElementById('add-number-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showAddNumberModal());
    }
}

/**
 * Show Add Number Modal
 */
function showAddNumberModal() {
    const modalHTML = `
        <div id="add-number-modal" class="modal">
            <div class="modal-content">
                <h2>Nummer hinzufügen</h2>
                <form id="add-number-form">
                    <div class="form-group">
                        <label>Telefonnummer *</label>
                        <input type="tel" id="new-phone" placeholder="+49 30 1234567" required>
                    </div>
                    <div class="form-group">
                        <label>Kategorie *</label>
                        <select id="new-category" required>
                            <option value="">Bitte wählen...</option>
                            <option value="enkeltrick">Enkeltrick</option>
                            <option value="polizei">Falsche Polizisten</option>
                            <option value="schock">Schockanruf</option>
                            <option value="bank">Bank-Betrug</option>
                            <option value="techsupport">Tech-Support</option>
                            <option value="gewinnspiel">Gewinnspiel</option>
                            <option value="sonstiges">Sonstiges</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select id="new-status" required>
                            <option value="warning">Warning (Verdächtig)</option>
                            <option value="danger">Danger (Betrug bestätigt)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Anzahl Meldungen</label>
                        <input type="number" id="new-reports-count" value="1" min="1">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="flex: 1;">Hinzufügen</button>
                        <button type="button" class="btn btn-secondary" onclick="closeAddNumberModal()" style="flex: 1;">Abbrechen</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Form Submit Handler
    document.getElementById('add-number-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddNumber();
    });
}

/**
 * Handle Add Number
 */
async function handleAddNumber() {
    const phone = document.getElementById('new-phone').value.trim();
    const category = document.getElementById('new-category').value;
    const status = document.getElementById('new-status').value;
    const reports_count = parseInt(document.getElementById('new-reports-count').value);
    
    if (!phone || !category) {
        showNotification('Bitte alle Pflichtfelder ausfüllen', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Use report endpoint to add number
        const success = await window.API.reportNumber(phone, category, '(Manuell hinzugefügt)');
        
        if (success) {
            showNotification('Nummer erfolgreich hinzugefügt!', 'success');
            closeAddNumberModal();
            await loadAdminNumbersList();
        } else {
            showNotification('Fehler beim Hinzufügen', 'error');
        }
    } catch (error) {
        console.error('Add number error:', error);
        showNotification('Fehler beim Hinzufügen', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Close Add Number Modal
 */
function closeAddNumberModal() {
    const modal = document.getElementById('add-number-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Delete Number
 */
async function deleteNumber(phone) {
    if (!confirm(`Nummer ${phone} wirklich löschen?`)) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/numbers/${encodeURIComponent(phone)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            showNotification('Nummer gelöscht', 'success');
            await loadAdminNumbersList();
        } else {
            showNotification('Fehler beim Löschen', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Fehler beim Löschen', 'error');
    } finally {
        hideLoading();
    }
}

// ===================================
// 2. QUIZ-VERWALTUNG (CRUD)
// ===================================

/**
 * Load Quizzes for Admin
 */
async function loadAdminQuizzes() {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/quiz`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        displayQuizzesList(data.quizzes || []);
    } catch (error) {
        console.error('Load quizzes error:', error);
        showNotification('Fehler beim Laden der Quizze', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Display Quizzes List
 */
function displayQuizzesList(quizzes) {
    const container = document.getElementById('quizzes-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (quizzes.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Keine Quizze vorhanden</p>';
        return;
    }
    
    quizzes.forEach(quiz => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.style.cssText = 'background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ddd;';
        
        const publishedBadge = quiz.published 
            ? '<span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">Veröffentlicht</span>'
            : '<span style="background: #999; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">Entwurf</span>';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0;">${quiz.title}</h3>
                    <p style="margin: 0 0 8px 0; color: #666;">${quiz.description}</p>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${publishedBadge}
                        <span style="color: #666; font-size: 0.9rem;">Kategorie: ${quiz.category}</span>
                        <span style="color: #666; font-size: 0.9rem;">${quiz.questions?.length || 0} Fragen</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" onclick="editQuiz('${quiz.id}')" style="padding: 8px 16px;">✏️ Bearbeiten</button>
                    <button class="btn btn-danger" onclick="deleteQuiz('${quiz.id}')" style="padding: 8px 16px; background: #d32f2f;">🗑️ Löschen</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Show Add Quiz Modal
 */
function showAddQuizModal() {
    const modalHTML = `
        <div id="add-quiz-modal" class="modal">
            <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <h2>Quiz erstellen</h2>
                <form id="add-quiz-form">
                    <div class="form-group">
                        <label>Titel *</label>
                        <input type="text" id="quiz-title" required>
                    </div>
                    <div class="form-group">
                        <label>Beschreibung *</label>
                        <textarea id="quiz-description" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Kategorie *</label>
                        <select id="quiz-category" required>
                            <option value="">Bitte wählen...</option>
                            <option value="enkeltrick">Enkeltrick</option>
                            <option value="polizei">Falsche Polizisten</option>
                            <option value="bank">Bank-Betrug</option>
                            <option value="techsupport">Tech-Support</option>
                            <option value="gewinnspiel">Gewinnspiel</option>
                            <option value="allgemein">Allgemein</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="quiz-published">
                            Sofort veröffentlichen
                        </label>
                    </div>
                    
                    <h3>Fragen</h3>
                    <div id="questions-container"></div>
                    <button type="button" class="btn btn-secondary" onclick="addQuestionField()" style="margin: 10px 0;">+ Frage hinzufügen</button>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="flex: 1;">Quiz erstellen</button>
                        <button type="button" class="btn btn-secondary" onclick="closeAddQuizModal()" style="flex: 1;">Abbrechen</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add first question field
    addQuestionField();
    
    // Form Submit
    document.getElementById('add-quiz-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateQuiz();
    });
}

/**
 * Add Question Field
 */
let questionCounter = 0;
function addQuestionField() {
    questionCounter++;
    const container = document.getElementById('questions-container');
    
    const questionHTML = `
        <div class="question-block" id="question-${questionCounter}" style="background: #f5f5f5; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h4>Frage ${questionCounter}</h4>
            <div class="form-group">
                <label>Frage *</label>
                <input type="text" class="question-text" required>
            </div>
            <div class="form-group">
                <label>Antwort 1 *</label>
                <input type="text" class="option-1" required>
            </div>
            <div class="form-group">
                <label>Antwort 2 *</label>
                <input type="text" class="option-2" required>
            </div>
            <div class="form-group">
                <label>Antwort 3 *</label>
                <input type="text" class="option-3" required>
            </div>
            <div class="form-group">
                <label>Antwort 4 *</label>
                <input type="text" class="option-4" required>
            </div>
            <div class="form-group">
                <label>Richtige Antwort *</label>
                <select class="correct-answer" required>
                    <option value="0">Antwort 1</option>
                    <option value="1">Antwort 2</option>
                    <option value="2">Antwort 3</option>
                    <option value="3">Antwort 4</option>
                </select>
            </div>
            <div class="form-group">
                <label>Erklärung (optional)</label>
                <textarea class="explanation" rows="2"></textarea>
            </div>
            <button type="button" class="btn btn-danger" onclick="removeQuestion(${questionCounter})" style="background: #d32f2f;">Frage entfernen</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHTML);
}

/**
 * Remove Question
 */
function removeQuestion(id) {
    const question = document.getElementById(`question-${id}`);
    if (question) {
        question.remove();
    }
}

/**
 * Handle Create Quiz
 */
async function handleCreateQuiz() {
    const title = document.getElementById('quiz-title').value.trim();
    const description = document.getElementById('quiz-description').value.trim();
    const category = document.getElementById('quiz-category').value;
    const published = document.getElementById('quiz-published').checked;
    
    // Collect questions
    const questions = [];
    const questionBlocks = document.querySelectorAll('.question-block');
    
    questionBlocks.forEach(block => {
        const question = {
            question: block.querySelector('.question-text').value.trim(),
            options: [
                block.querySelector('.option-1').value.trim(),
                block.querySelector('.option-2').value.trim(),
                block.querySelector('.option-3').value.trim(),
                block.querySelector('.option-4').value.trim()
            ],
            correct_answer: parseInt(block.querySelector('.correct-answer').value),
            explanation: block.querySelector('.explanation').value.trim()
        };
        
        questions.push(question);
    });
    
    if (!title || !description || !category || questions.length === 0) {
        showNotification('Bitte alle Pflichtfelder ausfüllen und mindestens eine Frage hinzufügen', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                title,
                description,
                category,
                published,
                questions
            })
        });
        
        if (response.ok) {
            showNotification('Quiz erfolgreich erstellt!', 'success');
            closeAddQuizModal();
            await loadAdminQuizzes();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Fehler beim Erstellen', 'error');
        }
    } catch (error) {
        console.error('Create quiz error:', error);
        showNotification('Fehler beim Erstellen', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Close Add Quiz Modal
 */
function closeAddQuizModal() {
    const modal = document.getElementById('add-quiz-modal');
    if (modal) {
        modal.remove();
    }
    questionCounter = 0;
}

/**
 * Delete Quiz
 */
async function deleteQuiz(quizId) {
    if (!confirm('Quiz wirklich löschen? Alle Fragen und Ergebnisse werden gelöscht!')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            showNotification('Quiz gelöscht', 'success');
            await loadAdminQuizzes();
        } else {
            showNotification('Fehler beim Löschen', 'error');
        }
    } catch (error) {
        console.error('Delete quiz error:', error);
        showNotification('Fehler beim Löschen', 'error');
    } finally {
        hideLoading();
    }
}

// ===================================
// 3. TRAININGS-VERWALTUNG (CRUD)
// ===================================

/**
 * Load Training Modules
 */
async function loadAdminTrainings() {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/training`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        displayTrainingsList(data.modules || []);
    } catch (error) {
        console.error('Load trainings error:', error);
        showNotification('Fehler beim Laden der Trainings', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Display Trainings List
 */
function displayTrainingsList(modules) {
    const container = document.getElementById('trainings-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (modules.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Keine Trainings vorhanden</p>';
        return;
    }
    
    modules.forEach(module => {
        const card = document.createElement('div');
        card.className = 'training-card';
        card.style.cssText = 'background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ddd;';
        
        const publishedBadge = module.published 
            ? '<span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">Veröffentlicht</span>'
            : '<span style="background: #999; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">Entwurf</span>';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">${module.icon || '📚'}</div>
                    <h3 style="margin: 0 0 8px 0;">${module.title}</h3>
                    <p style="margin: 0 0 8px 0; color: #666;">${module.description}</p>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${publishedBadge}
                        <span style="color: #666; font-size: 0.9rem;">Kategorie: ${module.category}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" onclick="editTraining('${module.id}')" style="padding: 8px 16px;">✏️ Bearbeiten</button>
                    <button class="btn btn-danger" onclick="deleteTraining('${module.id}')" style="padding: 8px 16px; background: #d32f2f;">🗑️ Löschen</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Delete Training
 */
async function deleteTraining(trainingId) {
    if (!confirm('Training wirklich löschen?')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/training/${trainingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            showNotification('Training gelöscht', 'success');
            await loadAdminTrainings();
        } else {
            showNotification('Fehler beim Löschen', 'error');
        }
    } catch (error) {
        console.error('Delete training error:', error);
        showNotification('Fehler beim Löschen', 'error');
    } finally {
        hideLoading();
    }
}

// ===================================
// 4. INITIALIZATION
// ===================================

// Add to existing initializeAdminSystem() function:
function enhancedInitializeAdminSystem() {
    // Call original init
    initializeAdminSystem();
    
    // Setup additional management features
    setupNumbersManagement();
}

// Make functions global
window.closeAddNumberModal = closeAddNumberModal;
window.deleteNumber = deleteNumber;
window.showAddQuizModal = showAddQuizModal;
window.addQuestionField = addQuestionField;
window.removeQuestion = removeQuestion;
window.closeAddQuizModal = closeAddQuizModal;
window.deleteQuiz = deleteQuiz;
window.editQuiz = (id) => alert('Edit Quiz feature coming soon!');
window.loadAdminQuizzes = loadAdminQuizzes;
window.loadAdminTrainings = loadAdminTrainings;
window.deleteTraining = deleteTraining;
window.editTraining = (id) => alert('Edit Training feature coming soon!');

console.log('✅ Komplettes Admin Management System geladen');
