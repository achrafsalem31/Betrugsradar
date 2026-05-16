// ===================================
// KOMPLETTES ADMIN MANAGEMENT SYSTEM
// ===================================

// ===================================
// 1. NUMMERN-VERWALTUNG (CRUD)
// ===================================

function setupNumbersManagement() {
    const addBtn = document.getElementById('add-number-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showAddNumberModal());
    }
}

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
    
    document.getElementById('add-number-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddNumber();
    });
}

async function handleAddNumber() {
    const phone = document.getElementById('new-phone').value.trim();
    const category = document.getElementById('new-category').value;
    
    if (!phone || !category) {
        alert('Bitte alle Pflichtfelder ausfüllen');
        return;
    }
    
    if (typeof showLoading === 'function') showLoading();
    
    try {
        const success = await window.API.reportNumber(phone, category, '(Manuell hinzugefügt)');
        if (success) {
            alert('Nummer erfolgreich hinzugefügt!');
            closeAddNumberModal();
            if (typeof updateNumbersList === 'function') await updateNumbersList();
        } else {
            alert('Fehler beim Hinzufügen');
        }
    } catch (error) {
        console.error('Add number error:', error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

function closeAddNumberModal() {
    const modal = document.getElementById('add-number-modal');
    if (modal) modal.remove();
}

async function deleteNumber(phone) {
    if (!confirm(`Nummer ${phone} wirklich löschen?`)) return;
    if (typeof showLoading === 'function') showLoading();
    
    try {
        const response = await fetch(`${window.API_URL}/numbers/${encodeURIComponent(phone)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            alert('Nummer gelöscht');
            if (typeof updateNumbersList === 'function') await updateNumbersList();
        } else {
            alert('Fehler beim Löschen');
        }
    } catch (error) {
        console.error('Delete error:', error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// ===================================
// 2. QUIZ-VERWALTUNG (CRUD)
// ===================================

async function loadAdminQuizzes() {
    if (typeof showLoading === 'function') showLoading();
    
    try {
        const response = await fetch('http://localhost:3000/api/quiz');
        const data = await response.json();
        
        window.allAdminQuizzes = data.quizzes || [];
        
        if (typeof displayQuizzesList === 'function') {
            displayQuizzesList(window.allAdminQuizzes);
        }
    } catch (error) {
        console.error('Load quizzes error:', error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

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

function showAddQuizModal() {
    const modal = document.getElementById('addQuizModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.remove('hidden');
        
        const form = document.getElementById('addQuizForm');
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
        
        const modalTitle = document.getElementById('quizModalTitle');
        if (modalTitle) modalTitle.innerText = '➕ Neues Quiz erstellen';
        
        const container = document.getElementById('questionsContainer');
        if (container) {
            container.innerHTML = '';
            addQuestionField();
        }
    }
}

function closeAddQuizModal() {
    const modal = document.getElementById('addQuizModal');
    if (modal) modal.style.display = 'none';
}

let questionCounter = 0;
function addQuestionField() {
    questionCounter++;
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    const questionHTML = `
        <div class="question-block card p-3 mb-3" id="question-${questionCounter}" style="background: #f5f5f5; padding: 15px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ddd;">
            <h4>Frage</h4>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Frage *</label>
                <input type="text" class="form-control question-text" style="width: 100%; padding: 8px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Szenario / Kontext (Optional)</label>
                <textarea class="form-control question-scenario" rows="2" style="width: 100%; padding: 8px;"></textarea>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Option 1 *</label>
                <input type="text" class="form-control option-input" style="width: 100%; padding: 8px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Option 2 *</label>
                <input type="text" class="form-control option-input" style="width: 100%; padding: 8px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Option 3 *</label>
                <input type="text" class="form-control option-input" style="width: 100%; padding: 8px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Option 4 *</label>
                <input type="text" class="form-control option-input" style="width: 100%; padding: 8px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Richtige Antwort *</label>
                <select class="form-select correct-answer-select" style="width: 100%; padding: 8px;" required>
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Erklärung *</label>
                <textarea class="form-control question-explanation" rows="2" style="width: 100%; padding: 8px;" required></textarea>
            </div>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('question-${questionCounter}').remove()" style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Frage entfernen</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHTML);
}

window.editQuiz = async (id) => {
    try {
        console.log('🎯 [EDIT] دالة التعديل بدات للـ ID:', id);

        const quizToEdit = window.allAdminQuizzes ? window.allAdminQuizzes.find(q => q.id == id) : null;
        if (!quizToEdit) {
            alert('Quiz konnte nicht gefunden werden!');
            return;
        }

        const modal = document.getElementById('addQuizModal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.remove('hidden');
        }

        const modalTitle = document.getElementById('quizModalTitle');
        if (modalTitle) modalTitle.innerText = '📝 Quiz bearbeiten';

        document.getElementById('quizTitle').value = quizToEdit.title || '';
        document.getElementById('quizDescription').value = quizToEdit.description || '';
        document.getElementById('quizCategory').value = quizToEdit.category || 'enkeltrick';

        const form = document.getElementById('addQuizForm');
        if (form) form.dataset.editId = id;

        const container = document.getElementById('questionsContainer');
        if (container) {
            container.innerHTML = ''; 

            const questionsList = quizToEdit.questions || quizToEdit.quiz_questions || [];
            
            if (questionsList.length > 0) {
                questionsList.forEach((q, index) => {
                    const questionIndex = index;
                    const questionHtml = `
                        <div class="question-block card p-3 mb-3" id="question-edit-${questionIndex}" style="background: #f5f5f5; padding: 15px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ddd;">
                            <h4>Frage ${questionIndex + 1}</h4>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Frage *</label>
                                <input type="text" class="form-control question-text" value="${q.question || ''}" style="width: 100%; padding: 8px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Szenario (Optional)</label>
                                <textarea class="form-control question-scenario" rows="2" style="width: 100%; padding: 8px;">${q.scenario || ''}</textarea>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Option 1 *</label>
                                <input type="text" class="form-control option-input" value="${q.options && q.options[0] ? q.options[0] : ''}" style="width: 100%; padding: 8px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Option 2 *</label>
                                <input type="text" class="form-control option-input" value="${q.options && q.options[1] ? q.options[1] : ''}" style="width: 100%; padding: 8px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Option 3 *</label>
                                <input type="text" class="form-control option-input" value="${q.options && q.options[2] ? q.options[2] : ''}" style="width: 100%; padding: 8px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Option 4 *</label>
                                <input type="text" class="form-control option-input" value="${q.options && q.options[3] ? q.options[3] : ''}" style="width: 100%; padding: 8px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Richtige Antwort *</label>
                                <select class="form-select correct-answer-select" style="width: 100%; padding: 8px;">
                                    <option value="0" ${q.correct_answer == 0 || q.correct == 0 ? 'selected' : ''}>Option 1</option>
                                    <option value="1" ${q.correct_answer == 1 || q.correct == 1 ? 'selected' : ''}>Option 2</option>
                                    <option value="2" ${q.correct_answer == 2 || q.correct == 2 ? 'selected' : ''}>Option 3</option>
                                    <option value="3" ${q.correct_answer == 3 || q.correct == 3 ? 'selected' : ''}>Option 4</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label>Erklärung *</label>
                                <textarea class="form-control question-explanation" rows="2" style="width: 100%; padding: 8px;" required>${q.explanation || ''}</textarea>
                            </div>
                            <button type="button" class="btn btn-danger btn-sm mt-2" onclick="document.getElementById('question-edit-${questionIndex}').remove()" style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Frage löschen</button>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', questionHtml);
                });
                console.log('✅ [EDIT] تم شحن كاع الأسئلة د سوبابيس فـ الـ Modal بنجاح كامل!');
            }
        }
    } catch (error) {
        console.error('❌ [EDIT] Error:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addQuizForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const quizId = form.dataset.editId;
            const title = document.getElementById('quizTitle').value.trim();
            const description = document.getElementById('quizDescription').value.trim();
            const category = document.getElementById('quizCategory').value;
            
            const questions = [];
            const blocks = document.querySelectorAll('.question-block');
            
            blocks.forEach(block => {
                const optionsInputs = block.querySelectorAll('.option-input');
                const question = {
                    question: block.querySelector('.question-text').value.trim(),
                    scenario: block.querySelector('.question-scenario').value.trim() || null,
                    options: [
                        optionsInputs[0].value.trim(),
                        optionsInputs[1].value.trim(),
                        optionsInputs[2].value.trim(),
                        optionsInputs[3].value.trim()
                    ],
                    correct_answer: parseInt(block.querySelector('.correct-answer-select').value),
                    explanation: block.querySelector('.question-explanation').value.trim()
                };
                questions.push(question);
            });

            if (typeof showLoading === 'function') showLoading();

            try {
                let url = 'http://localhost:3000/api/quiz';
                let method = 'POST';

                if (quizId) {
                    url = `http://localhost:3000/api/quiz/${quizId}`;
                    method = 'PUT';
                }

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ title, description, category, published: true, questions })
                });

                if (response.ok) {
                    alert(quizId ? 'Quiz erfolgreich aktualisiert!' : 'Quiz erfolgreich erstellt!');
                    closeAddQuizModal();
                    await loadAdminQuizzes();
                } else {
                    alert('Fehler beim Speichern des Quiz');
                }
            } catch (error) {
                console.error('Save quiz error:', error);
            } finally {
                if (typeof hideLoading === 'function') hideLoading();
            }
        });
    }
});

async function deleteQuiz(quizId) {
    if (!confirm('Quiz wirklich löschen? Alle Fragen werden gelöscht!')) return;
    if (typeof showLoading === 'function') showLoading();
    
    try {
        const response = await fetch(`http://localhost:3000/api/quiz/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            alert('Quiz gelöscht');
            await loadAdminQuizzes();
        } else {
            alert('Fehler beim Löschen');
        }
    } catch (error) {
        console.error('Delete quiz error:', error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// ===================================
// 3. TRAININGS-VERWALTUNG (CRUD)
// ===================================

async function loadAdminTrainings() {
    if (typeof showLoading === 'function') showLoading();
    try {
        const response = await fetch(`http://localhost:3000/api/training`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        displayTrainingsList(data.modules || []);
    } catch (error) {
        console.error('Load trainings error:', error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

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
                    <button class="btn btn-secondary" onclick="alert('Coming soon')">✏️ Bearbeiten</button>
                    <button class="btn btn-danger" onclick="deleteTraining('${module.id}')" style="padding: 8px 16px; background: #d32f2f;">🗑️ Löschen</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function deleteTraining(trainingId) {
    if (!confirm('Training wirklich löschen?')) return;
    if (typeof showLoading === 'function') showLoading();
    try {
        const response = await fetch(`http://localhost:3000/api/training/${trainingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
            alert('Training gelöscht');
            await loadAdminTrainings();
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// Global Exports
window.showAddQuizModal = showAddQuizModal;
window.closeAddQuizModal = closeAddQuizModal;
window.addQuestionField = addQuestionField;
window.loadAdminQuizzes = loadAdminQuizzes;
window.loadAdminTrainings = loadAdminTrainings;
window.deleteQuiz = deleteQuiz;
window.deleteTraining = deleteTraining;

console.log('✅ Komplettes Admin Management System REFINED & READY');