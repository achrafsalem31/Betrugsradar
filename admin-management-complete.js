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
// TRAININGS-VERWALTUNG (CRUD) — vollständig
// Diesen Block ERSETZEN in admin-management-complete.js
// (Abschnitt "3. TRAININGS-VERWALTUNG")
// ===================================

// ──────────────────────────────────────────────────
// Laden & Anzeigen
// ──────────────────────────────────────────────────

async function loadAdminTrainings() {
    if (typeof showLoading === 'function') showLoading();
    try {
        const response = await fetch('http://localhost:3000/api/training', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        window.allTrainingModules = data.modules || [];
        displayTrainingsList(window.allTrainingModules);
    } catch (error) {
        console.error('Load trainings error:', error);
        if (typeof showNotification === 'function') showNotification('Fehler beim Laden der Trainings', 'error');
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

function displayTrainingsList(modules) {
    const container = document.getElementById('trainings-list');
    if (!container) return;
    container.innerHTML = '';

    if (!modules || modules.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Keine Trainings vorhanden. Erstellen Sie das erste Modul!</p>';
        return;
    }

    modules.forEach(module => {
        const card = document.createElement('div');
        card.className = 'training-card';
        card.style.cssText = 'background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ddd; display:flex; justify-content:space-between; align-items:flex-start; gap:16px;';

        const publishedBadge = module.published
            ? '<span style="background:#4caf50;color:white;padding:4px 12px;border-radius:12px;font-size:0.8rem;">✅ Veröffentlicht</span>'
            : '<span style="background:#999;color:white;padding:4px 12px;border-radius:12px;font-size:0.8rem;">📝 Entwurf</span>';

        card.innerHTML = `
            <div style="flex:1;">
                <div style="font-size:2rem;margin-bottom:8px;">${module.icon || '📚'}</div>
                <h3 style="margin:0 0 6px 0;">${module.title}</h3>
                <p style="margin:0 0 10px 0;color:#666;font-size:0.9rem;">${module.description}</p>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    ${publishedBadge}
                    <span style="color:#666;font-size:0.85rem;">Kategorie: <strong>${module.category}</strong></span>
                    <span style="color:#666;font-size:0.85rem;">Reihenfolge: ${module.order_index ?? 0}</span>
                </div>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
                <button class="btn btn-secondary" onclick="editTraining('${module.id}')" style="padding:8px 14px;">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteTraining('${module.id}')" style="padding:8px 14px;background:#d32f2f;color:white;border:none;border-radius:6px;cursor:pointer;">🗑️ Löschen</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ──────────────────────────────────────────────────
// Modal öffnen / schließen
// ──────────────────────────────────────────────────

function showAddTrainingModal() {
    _openTrainingModal(null);
}

function closeAddTrainingModal() {
    const modal = document.getElementById('addTrainingModal');
    if (modal) modal.style.display = 'none';
}

// ──────────────────────────────────────────────────
// Bearbeiten
// ──────────────────────────────────────────────────

window.editTraining = function(id) {
    const mod = window.allTrainingModules
        ? window.allTrainingModules.find(m => m.id == id)
        : null;
    if (!mod) { alert('Modul nicht gefunden'); return; }
    _openTrainingModal(mod);
};

// ──────────────────────────────────────────────────
// Löschen
// ──────────────────────────────────────────────────

async function deleteTraining(trainingId) {
    if (!confirm('Training-Modul wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden!')) return;
    if (typeof showLoading === 'function') showLoading();
    try {
        const response = await fetch(`http://localhost:3000/api/training/${trainingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.ok) {
            if (typeof showNotification === 'function') showNotification('Modul gelöscht', 'success');
            await loadAdminTrainings();
            // Frontend-Cache ebenfalls aktualisieren
            if (typeof initializeLearnPage === 'function') initializeLearnPage();
        } else {
            if (typeof showNotification === 'function') showNotification('Fehler beim Löschen', 'error');
        }
    } catch (error) {
        console.error('Delete training error:', error);
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// ──────────────────────────────────────────────────
// Intern: Modal bauen und öffnen
// ──────────────────────────────────────────────────

function _openTrainingModal(mod) {
    // Altes Modal entfernen, falls vorhanden
    const existing = document.getElementById('addTrainingModal');
    if (existing) existing.remove();

    const isEdit = !!mod;

    const modalHTML = `
    <div id="addTrainingModal" style="display:block;position:fixed;z-index:2000;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.55);overflow-y:auto;padding:40px 20px;">
      <div style="background:#fff;margin:auto;padding:30px;border-radius:14px;width:100%;max-width:720px;box-shadow:0 8px 32px rgba(0,0,0,0.25);position:relative;">

        <span onclick="closeAddTrainingModal()" style="position:absolute;right:20px;top:16px;font-size:26px;font-weight:bold;cursor:pointer;color:#666;">&times;</span>

        <h2 style="color:#2d5a3d;margin-bottom:22px;">${isEdit ? '📝 Modul bearbeiten' : '➕ Neues Lernmodul erstellen'}</h2>

        <form id="addTrainingForm" ${isEdit ? `data-edit-id="${mod.id}"` : ''}>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div>
              <label style="font-weight:600;display:block;margin-bottom:5px;">Titel *</label>
              <input type="text" id="trainingTitle" value="${isEdit ? _esc(mod.title) : ''}"
                style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;" required>
            </div>
            <div>
              <label style="font-weight:600;display:block;margin-bottom:5px;">Icon (Emoji)</label>
              <input type="text" id="trainingIcon" value="${isEdit ? _esc(mod.icon || '📚') : '📚'}"
                style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;" maxlength="4" placeholder="z.B. 👵">
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="font-weight:600;display:block;margin-bottom:5px;">Kurzbeschreibung *</label>
            <input type="text" id="trainingDescription" value="${isEdit ? _esc(mod.description) : ''}"
              style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;" required
              placeholder="Kurze Beschreibung des Lernmoduls">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div>
              <label style="font-weight:600;display:block;margin-bottom:5px;">Kategorie *</label>
              <select id="trainingCategory" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;" required>
                <option value="enkeltrick"  ${isEdit && mod.category === 'enkeltrick'  ? 'selected' : ''}>👵 Enkeltrick</option>
                <option value="polizei"     ${isEdit && mod.category === 'polizei'     ? 'selected' : ''}>👮 Falsche Polizisten</option>
                <option value="schock"      ${isEdit && mod.category === 'schock'      ? 'selected' : ''}>🚨 Schockanruf</option>
                <option value="bank"        ${isEdit && mod.category === 'bank'        ? 'selected' : ''}>🏦 Bank-Betrug</option>
                <option value="techsupport" ${isEdit && mod.category === 'techsupport' ? 'selected' : ''}>💻 Tech-Support</option>
                <option value="gewinnspiel" ${isEdit && mod.category === 'gewinnspiel' ? 'selected' : ''}>🎁 Gewinnspiel</option>
              </select>
            </div>
            <div>
              <label style="font-weight:600;display:block;margin-bottom:5px;">Reihenfolge</label>
              <input type="number" id="trainingOrder" value="${isEdit ? (mod.order_index ?? 0) : 0}" min="0"
                style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;">
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="font-weight:600;display:block;margin-bottom:5px;">
              Status
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="checkbox" id="trainingPublished" ${!isEdit || mod.published ? 'checked' : ''}
                style="width:18px;height:18px;">
              <span>Veröffentlicht (sofort im Lernen-Bereich sichtbar)</span>
            </label>
          </div>

          <div style="margin-bottom:20px;">
            <label style="font-weight:600;display:block;margin-bottom:8px;">Lerninhalt (HTML) *</label>
            <p style="font-size:0.82rem;color:#888;margin-bottom:6px;">
              Sie können HTML nutzen: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;,
              &lt;div class="warning-box"&gt;, &lt;div class="tip-box"&gt;
            </p>
            <textarea id="trainingContent" rows="14"
              style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;font-family:monospace;font-size:0.85rem;resize:vertical;"
              required placeholder="<h2>🚨 Titel</h2>&#10;<p>Beschreibung...</p>&#10;<div class=&quot;warning-box&quot;>...</div>">${isEdit ? _esc(mod.content) : ''}</textarea>
          </div>

          <div style="display:flex;gap:12px;justify-content:flex-end;">
            <button type="button" onclick="closeAddTrainingModal()"
              style="padding:11px 22px;border:2px solid #e0e0e0;border-radius:8px;background:#f5f5f5;font-weight:600;cursor:pointer;">
              Abbrechen
            </button>
            <button type="submit"
              style="padding:11px 28px;background:#2d5a3d;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:1rem;">
              💾 Speichern
            </button>
          </div>
        </form>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Außen-Klick schließt Modal
    document.getElementById('addTrainingModal').addEventListener('click', function(e) {
        if (e.target === this) closeAddTrainingModal();
    });

    // Form-Submit
    document.getElementById('addTrainingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await _saveTraining();
    });
}

// ──────────────────────────────────────────────────
// Intern: Speichern (POST oder PUT)
// ──────────────────────────────────────────────────

async function _saveTraining() {
    const form    = document.getElementById('addTrainingForm');
    const editId  = form ? form.dataset.editId : null;

    const payload = {
        title:       document.getElementById('trainingTitle').value.trim(),
        description: document.getElementById('trainingDescription').value.trim(),
        content:     document.getElementById('trainingContent').value.trim(),
        category:    document.getElementById('trainingCategory').value,
        icon:        document.getElementById('trainingIcon').value.trim() || '📚',
        published:   document.getElementById('trainingPublished').checked,
        order_index: parseInt(document.getElementById('trainingOrder').value || '0'),
    };

    if (!payload.title || !payload.description || !payload.content || !payload.category) {
        alert('Bitte alle Pflichtfelder ausfüllen (Titel, Beschreibung, Inhalt, Kategorie)');
        return;
    }

    if (typeof showLoading === 'function') showLoading();

    try {
        const url    = editId ? `http://localhost:3000/api/training/${editId}` : 'http://localhost:3000/api/training';
        const method = editId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const msg = editId ? 'Modul erfolgreich aktualisiert!' : 'Modul erfolgreich erstellt!';
            if (typeof showNotification === 'function') showNotification(msg, 'success');
            closeAddTrainingModal();
            await loadAdminTrainings();
            // Learn-Seite im Frontend ebenfalls neu laden
            if (typeof initializeLearnPage === 'function') initializeLearnPage();
        } else {
            const err = await response.json();
            alert('Fehler: ' + (err.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Save training error:', error);
        alert('Verbindungsfehler – bitte Backend prüfen.');
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// ──────────────────────────────────────────────────
// Hilfsfunktion: HTML-Sonderzeichen escapen (für value-Attribute)
// ──────────────────────────────────────────────────
function _esc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ──────────────────────────────────────────────────
// Global Exports
// ──────────────────────────────────────────────────
window.showAddTrainingModal  = showAddTrainingModal;
window.closeAddTrainingModal = closeAddTrainingModal;
window.loadAdminTrainings    = loadAdminTrainings;
window.deleteTraining        = deleteTraining;

console.log('✅ Training-Management CRUD vollständig geladen');

// Global Exports
window.showAddQuizModal = showAddQuizModal;
window.closeAddQuizModal = closeAddQuizModal;
window.addQuestionField = addQuestionField;
window.loadAdminQuizzes = loadAdminQuizzes;
window.loadAdminTrainings = loadAdminTrainings;
window.deleteQuiz = deleteQuiz;
window.deleteTraining = deleteTraining;

console.log('✅ Komplettes Admin Management System REFINED & READY');