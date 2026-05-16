// ===================================
// CALLSAFE — Contact Form System
// contact-form.js
// ===================================

(function () {
    'use strict';

    // ── DOM References ──────────────────────────────────────────
    const floatBtn     = document.getElementById('contactFloatBtn');
    const overlay      = document.getElementById('contactOverlay');
    const closeBtn     = document.getElementById('contactCloseBtn');
    const form         = document.getElementById('contactForm');
    const submitBtn    = document.getElementById('cfSubmitBtn');
    const successBox   = document.getElementById('cfSuccess');
    const successClose = document.getElementById('cfSuccessClose');

    if (!floatBtn || !overlay || !form) return; // guard: elements must exist

    // ── Open / Close ────────────────────────────────────────────
    function openModal() {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Focus first input after animation
        setTimeout(() => {
            const first = form.querySelector('input, select, textarea');
            if (first) first.focus();
        }, 350);
    }

    function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    floatBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    successClose.addEventListener('click', closeModal);

    // Close on backdrop click
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    // ── Validation ──────────────────────────────────────────────
    function setError(groupId, errorId, show) {
        const group = document.getElementById(groupId);
        const error = document.getElementById(errorId);
        if (!group || !error) return;

        if (show) {
            group.classList.add('has-error');
            const input = group.querySelector('input, select, textarea');
            if (input) input.classList.add('error');
        } else {
            group.classList.remove('has-error');
            const input = group.querySelector('input, select, textarea');
            if (input) input.classList.remove('error');
        }
    }

    function validateForm() {
        let valid = true;

        const name     = document.getElementById('cfName').value.trim();
        const email    = document.getElementById('cfEmail').value.trim();
        const category = document.getElementById('cfCategory').value;
        const message  = document.getElementById('cfMessage').value.trim();

        // Name
        const nameOk = name.length >= 2;
        setError('cfGroupName', 'cfErrorName', !nameOk);
        if (!nameOk) valid = false;

        // Email
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setError('cfGroupEmail', 'cfErrorEmail', !emailOk);
        if (!emailOk) valid = false;

        // Category
        const catOk = category !== '';
        setError('cfGroupCategory', 'cfErrorCategory', !catOk);
        if (!catOk) valid = false;

        // Message
        const msgOk = message.length >= 10;
        setError('cfGroupMessage', 'cfErrorMessage', !msgOk);
        if (!msgOk) valid = false;

        return valid;
    }

    // Live validation — clear error once user fixes a field
    ['cfName', 'cfEmail', 'cfCategory', 'cfMessage'].forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', function () {
            const groupMap = {
                cfName:     ['cfGroupName',     'cfErrorName'],
                cfEmail:    ['cfGroupEmail',     'cfErrorEmail'],
                cfCategory: ['cfGroupCategory',  'cfErrorCategory'],
                cfMessage:  ['cfGroupMessage',   'cfErrorMessage'],
            };
            const [gid, eid] = groupMap[id];
            setError(gid, eid, false);
        });
    });

    // ── Submit ──────────────────────────────────────────────────
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            name:     document.getElementById('cfName').value.trim(),
            email:    document.getElementById('cfEmail').value.trim(),
            phone:    document.getElementById('cfPhone').value.trim() || null,
            category: document.getElementById('cfCategory').value,
            message:  document.getElementById('cfMessage').value.trim(),
        };

        // Loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            const apiBase = (window.API_URL || 'http://localhost:3000/api');
            const response = await fetch(`${apiBase}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Serverfehler');
            }

            // Show success
            form.style.display = 'none';
            successBox.classList.add('show');
            form.reset();

        } catch (err) {
            console.error('Contact form error:', err);
            alert('Fehler beim Senden: ' + (err.message || 'Unbekannter Fehler. Bitte versuchen Sie es später erneut.'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });

    // Reset form visibility when modal is closed and reopened
    overlay.addEventListener('transitionend', function () {
        if (!overlay.classList.contains('open')) {
            // Reset after close animation
            setTimeout(function () {
                form.style.display = '';
                successBox.classList.remove('show');
                form.reset();
                // Clear all errors
                ['cfGroupName','cfGroupEmail','cfGroupCategory','cfGroupMessage'].forEach(function (gid) {
                    const g = document.getElementById(gid);
                    if (g) {
                        g.classList.remove('has-error');
                        const inp = g.querySelector('input, select, textarea');
                        if (inp) inp.classList.remove('error');
                    }
                });
            }, 50);
        }
    });

})();