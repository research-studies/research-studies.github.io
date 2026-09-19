// FILE: static/script.js
// Frontend for the "Fool Me With AI" writing study. Adapted from the Turing-test study frontend:
// the utilities (fetch routing, telemetry, input provenance, screen timers, slider logging, forms)
// are kept; the roles / waiting room / partner machinery is gone; the screens follow SPEC section 3.
// No console statements: nothing participant-visible may leak from debugging.
document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================================
    // DOM references
    // =====================================================================================
    const mainContainer = document.querySelector('.container');
    const errorMessageArea = document.getElementById('error-message-area');
    const timerDisplay = document.getElementById('timer-display');
    const countdownTimer = document.getElementById('countdown-timer');

    const blockingModal = document.getElementById('blocking-modal');
    const blockingModalTitle = document.getElementById('blocking-modal-title');
    const blockingModalMessage = document.getElementById('blocking-modal-message');
    const blockingModalButton = document.getElementById('blocking-modal-button');

    // Phase 0: loading
    const loadingPhaseDiv = document.getElementById('loading-phase');
    const loadingRow = document.getElementById('loading-row');
    const loadingText = document.getElementById('loading-text');
    const startErrorDiv = document.getElementById('start-error');
    const startRetryButton = document.getElementById('start-retry-button');

    // Phase 1: consent
    const consentPhaseDiv = document.getElementById('consent-phase');
    const consentContentDiv = document.getElementById('consent-content');
    const consentActionsDiv = document.getElementById('consent-actions');
    const consentErrorDiv = document.getElementById('consent-error');
    const consentDownloadPromptDiv = document.getElementById('consent-download-prompt');
    const agreeButton = document.getElementById('agree-button');
    const disagreeButton = document.getElementById('disagree-button');
    const downloadConsentButton = document.getElementById('download-consent-button');
    const skipConsentDownloadButton = document.getElementById('skip-consent-download-button');

    // Phase 2: cues
    const cuesPhaseDiv = document.getElementById('cues-phase');
    const cuesForm = document.getElementById('cues-form');
    const cuesFreeText = document.getElementById('cues-free-text');
    const cuesOtherText = document.getElementById('cues-other-text');
    const cuesSubmitButton = document.getElementById('cues-submit-button');
    const cuesLoadingDiv = document.getElementById('cues-loading');

    // Phase 3: instructions
    const instructionsPhaseDiv = document.getElementById('instructions-phase');
    const instructionPages = document.querySelectorAll('.instruction-page');
    const instructionPrevBtn = document.getElementById('instruction-prev-btn');
    const instructionNextBtn = document.getElementById('instruction-next-btn');
    const instructionNav = document.getElementById('instruction-nav');
    const instructionPageIndicator = document.getElementById('instruction-page-indicator');
    const confirmInstructionsButton = document.getElementById('confirm-instructions-button');
    const comprehensionErrorEl = document.getElementById('comprehension-check-error');
    let currentInstructionPage = 1;
    const totalInstructionPages = 4;

    // Phase 4: workspace
    const workspacePhaseDiv = document.getElementById('workspace-phase');
    const wsTopicText = document.getElementById('ws-topic-text');
    const wsPurposeText = document.getElementById('ws-purpose-text');
    const wsBonusReminder = document.getElementById('ws-bonus-reminder');
    const timeUpBanner = document.getElementById('time-up-banner');
    const messageList = document.getElementById('message-list');
    const assistantWorking = document.getElementById('assistant-working');
    const chatErrorDiv = document.getElementById('chat-error');
    const promptInput = document.getElementById('prompt-input');
    const sendPromptButton = document.getElementById('send-prompt-button');
    const essayEditor = document.getElementById('essay-editor');
    const wordCountEl = document.getElementById('word-count');
    const wordCountStatusEl = document.getElementById('word-count-status');
    const essayErrorDiv = document.getElementById('essay-error');
    const essayWorkingDiv = document.getElementById('essay-working');
    const startOverButton = document.getElementById('start-over-button');
    const doneButton = document.getElementById('done-button');

    // Phase 5: rating
    const ratingPhaseDiv = document.getElementById('rating-phase');
    const ratingHeading = document.getElementById('rating-heading');
    const timeoutNotice = document.getElementById('timeout-notice');
    const detectorPanel = document.getElementById('detector-panel');
    const detectorLabelEl = document.getElementById('detector-label');
    const detectorPassEl = document.getElementById('detector-pass');
    const ratingVersionInfo = document.getElementById('rating-version-info');
    const ratingEssayPreview = document.getElementById('rating-essay-preview');
    const sliderHuman = document.getElementById('slider-human');
    const sliderHumanValue = document.getElementById('slider-human-value');
    const sliderDetector = document.getElementById('slider-detector');
    const sliderDetectorValue = document.getElementById('slider-detector-value');
    const ratingHint = document.getElementById('rating-hint');
    const ratingErrorDiv = document.getElementById('rating-error');
    const ratingLoadingDiv = document.getElementById('rating-loading');
    const keepEditingButton = document.getElementById('keep-editing-button');
    const submitFinalButton = document.getElementById('submit-final-button');

    // Phase 6: result
    const resultPhaseDiv = document.getElementById('result-phase');
    const resultVerdict = document.getElementById('result-verdict');
    const resultPassed = document.getElementById('result-passed');
    const resultBonus = document.getElementById('result-bonus');
    const resultNote = document.getElementById('result-note');
    const resultContinueButton = document.getElementById('result-continue-button');

    // Phase 7: post-task survey
    const postSurveyPhaseDiv = document.getElementById('post-survey-phase');
    const postSurveyForm = document.getElementById('post-survey-form');
    const postWhatChanged = document.getElementById('post-what-changed');
    const postMostHelpful = document.getElementById('post-most-helpful');
    const postRecalledBonus = document.getElementById('post-recalled-bonus');
    const postRecalledPurpose = document.getElementById('post-recalled-purpose');
    const postSurveyLoadingDiv = document.getElementById('post-survey-loading');

    // Phase 8: demographics
    const demographicsPhaseDiv = document.getElementById('demographics-phase');
    const demographicsForm = document.getElementById('demographics-form');
    const demographicsLoadingDiv = document.getElementById('demographics-loading');

    // Phase 9: final page
    const finalPageDiv = document.getElementById('final-page');
    const completionStatus = document.getElementById('completion-status');
    const completionCodeText = document.getElementById('completion-code-text');
    const completionCodeEl = document.getElementById('completion-code');
    const completionErrorDiv = document.getElementById('completion-error');
    const completeRetryButton = document.getElementById('complete-retry-button');
    const downloadDebriefButton = document.getElementById('download-debrief-button');
    const finishButton = document.getElementById('finish-button');
    const devNotice = document.getElementById('dev-notice');

    // =====================================================================================
    // 1. Prolific completion codes (the owner fills these; the backend also returns codes)
    // =====================================================================================
    const PROLIFIC_COMPLETE_BASE = "https://app.prolific.com/submissions/complete?cc=";
    const PROLIFIC_COMPLETION_CODE = 'PLACEHOLDER_COMPLETION_CODE';       // Completed study normally
    const PROLIFIC_NO_CONSENT_CODE = 'PLACEHOLDER_NO_CONSENT_CODE';       // Declined consent
    const PROLIFIC_NO_STATEMENT_CODE = 'PLACEHOLDER_NO_STATEMENT_CODE';   // Time ran out with no statement to score
    const PROLIFIC_COMPLETION_URL = PROLIFIC_COMPLETE_BASE + PROLIFIC_COMPLETION_CODE;
    const PROLIFIC_NO_CONSENT_URL = PROLIFIC_COMPLETE_BASE + PROLIFIC_NO_CONSENT_CODE;

    // =====================================================================================
    // 2. Production Mode Check + backend routing
    // =====================================================================================
    const isProduction = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

    // One backend. In production the page is served from GitHub Pages and the API lives on Railway.
    // In local development the page is served from a different port than the API (uvicorn on 8011).
    const BACKEND_URL = 'https://backend-production-8c45.up.railway.app';
    const LOCAL_BACKEND_URL = 'http://127.0.0.1:8011';
    const API_BASE_URL = isProduction ? BACKEND_URL : LOCAL_BACKEND_URL;

    // Monkey-patch fetch so relative paths (starting with "/") hit the backend.
    (() => {
    const RAW_FETCH = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        try {
        const url = typeof input === 'string' ? input : input.url;
        if (url.startsWith('/')) {
            return RAW_FETCH(`${API_BASE_URL}${url}`, init);
        }
        return RAW_FETCH(input, init);
        } catch {
        return RAW_FETCH(input, init);
        }
    };
    })();

    // Flag to suppress the beforeunload warning during intentional redirects to Prolific.
    let isIntentionalRedirect = false;

    // =====================================================================================
    // URL parameters from Prolific
    // =====================================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const prolificPid = urlParams.get('PROLIFIC_PID') || urlParams.get('prolific_pid') || urlParams.get('prolificPID') || null;
    const prolificStudyId = urlParams.get('STUDY_ID') || urlParams.get('study_id') || '';
    const prolificSessionId = urlParams.get('SESSION_ID') || urlParams.get('session_id') || '';

    // =====================================================================================
    // State
    // =====================================================================================
    const pageLoadedAt = Date.now();
    let sessionToken = null;
    let startData = null;            // response of POST /api/session/start
    let sessionStartedAt = null;     // epoch ms when /start succeeded (telemetry at_ms is relative to this)
    let currentPhase = null;
    let phaseEnteredAt = null;

    // Progress flags (drive resume after a refresh)
    let consentDone = false;
    let cuesDone = false;
    let checkPassed = false;
    let resultAcknowledged = false;
    let postSurveyDone = false;
    let demographicsDone = false;

    // Workspace state
    let workspaceOpenedAt = null;    // epoch ms
    let timerInterval = null;
    let timeExpired = false;
    let versions = [];               // {version_id, seq, word_count, source, text, detector, created_at}
    let lastVersionId = null;
    let lastVersionText = null;
    let pendingSource = 'manual';    // 'manual' | 'regenerate' (set by Start over)
    let editorSeedPromptId = null;   // set when an assistant reply was placed in the editor without /apply
    let chatMessages = [];           // {id, role:'user'|'assistant', text, prompt_id, applied, failed}
    let chatBusy = false;
    let essayBusy = false;
    let workspaceLocked = false;

    // Rating / submission state
    let ratingContext = null;        // {version, mode:'normal'|'timeout', openedAt, sliderLog, touched:{human,detector}, rated}
    let ratingPending = null;        // version whose rating screen was open (for resume)
    let ratingBusy = false;
    let isSubmitted = false;
    let finalResult = null;          // /submit -> final block
    let noStatement = false;         // time ran out and there was nothing to submit
    let completionCode = null;

    // Tracking state
    let suspiciousBehaviorTrackingEnabled = false;
    let tabHiddenStartTime = null;
    let cumulativeTabHiddenMs = 0;
    let pageInactiveStartTime = null;
    let lastPageInactivityDurationMs = 0;
    let lastPageInactivityEndedAt = null;

    // =====================================================================================
    // Local persistence (a refresh must not lose the session or the essay)
    // =====================================================================================
    const STATE_KEY = 'foolme_state_v1';
    const TOKEN_KEY = 'foolme_session_token';
    const RESUME_WINDOW_MS = 6 * 60 * 60 * 1000;

    function saveState() {
        if (!sessionToken || !startData) return;
        try {
            const state = {
                token: sessionToken,
                startData,
                sessionStartedAt,
                prolificPid,
                phase: currentPhase,
                consentDone, cuesDone, checkPassed, resultAcknowledged, postSurveyDone, demographicsDone,
                workspaceOpenedAt, timeExpired,
                versions, lastVersionId, lastVersionText, pendingSource, editorSeedPromptId,
                chatMessages,
                essayDraft: essayEditor ? essayEditor.value : '',
                ratingPending,
                isSubmitted, finalResult, noStatement, completionCode,
                savedAt: Date.now()
            };
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
            localStorage.setItem(TOKEN_KEY, sessionToken);
        } catch (e) {
            // Storage may be full or blocked; the study still works without resume.
        }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STATE_KEY);
            if (!raw) return null;
            const state = JSON.parse(raw);
            if (!state || !state.token || !state.startData) return null;
            return state;
        } catch (e) {
            return null;
        }
    }

    function clearState() {
        try {
            localStorage.removeItem(STATE_KEY);
            localStorage.removeItem(TOKEN_KEY);
        } catch (e) {
            // ignore
        }
    }

    let essayDraftSaveTimeout = null;
    function scheduleDraftSave() {
        if (essayDraftSaveTimeout) clearTimeout(essayDraftSaveTimeout);
        essayDraftSaveTimeout = setTimeout(() => { essayDraftSaveTimeout = null; saveState(); }, 1000);
    }

    // =====================================================================================
    // Helper functions
    // =====================================================================================
    function showError(message) {
        errorMessageArea.textContent = message;
        errorMessageArea.style.display = 'block';
        setTimeout(() => {
            errorMessageArea.style.display = 'none';
        }, 6000);
    }

    // Helper: extract a readable error message from API JSON result (FastAPI shapes)
    function getApiErrorMessage(result, fallback) {
        try {
            if (!result) return fallback || 'An unexpected error occurred.';
            const detail = result.detail;
            if (!detail) return fallback || 'An unexpected error occurred.';
            if (Array.isArray(detail)) {
                const msgs = detail.map(d => {
                    if (!d) return '';
                    const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null;
                    const msg = d.msg || d.message || (typeof d === 'string' ? d : JSON.stringify(d));
                    return field ? `${field}: ${msg}` : msg;
                });
                return msgs.join(' ');
            }
            if (typeof detail === 'object') {
                if (detail.error) return describeApiError(detail.error, detail, fallback);
                const field = Array.isArray(detail.loc) ? detail.loc[detail.loc.length - 1] : null;
                const msg = detail.msg || detail.message || JSON.stringify(detail);
                return field ? `${field}: ${msg}` : msg;
            }
            return String(detail);
        } catch (e) {
            return fallback || 'An unexpected error occurred.';
        }
    }

    // Plain-language text for each backend error code (app/main.py)
    function describeApiError(code, detail, fallback) {
        const d = detail || {};
        switch (code) {
            case 'too_short':
                return `The statement has ${d.word_count} words. It needs at least ${d.min_words} words.`;
            case 'unchanged':
                return 'This text is the same as your last recorded version. Make a change before you click Done.';
            case 'time_cap':
                return 'Time is up for the writing part.';
            case 'already_submitted':
                return 'Your statement has already been submitted.';
            case 'empty_prompt':
                return 'Type a message before you send it.';
            case 'prompt_not_found':
                return 'That reply is no longer available. Please ask the assistant again.';
            case 'version_not_found':
                return 'That version could not be found. Please try again.';
            case 'not_submitted':
                return 'The statement has not been submitted yet.';
            case 'model_unavailable':
                return 'The assistant could not reply this time. Please try again.';
            case 'unknown_session':
                return 'Your session could not be found on the server.';
            default:
                return fallback || 'Something went wrong. Please try again.';
        }
    }

    // POST JSON to the backend; throws an Error with .status / .code / .detail on failure
    async function apiPost(path, body) {
        const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        });
        return handleApiResponse(response);
    }

    async function apiGet(path) {
        const response = await fetch(path, { method: 'GET' });
        return handleApiResponse(response);
    }

    async function handleApiResponse(response) {
        let result = null;
        try { result = await response.json(); } catch (e) { result = null; }
        if (!response.ok) {
            let code = null;
            if (result && result.detail && typeof result.detail === 'object' && !Array.isArray(result.detail) && result.detail.error) {
                code = result.detail.error;
            } else if (response.status === 404 && result && result.detail === 'unknown session') {
                code = 'unknown_session';
            }
            const err = new Error(getApiErrorMessage(result, `The server returned an error (${response.status}).`));
            err.status = response.status;
            err.code = code;
            err.detail = result ? result.detail : null;
            throw err;
        }
        return result;
    }

    function isNetworkError(err) {
        return err && typeof err.status === 'undefined';
    }

    // Same tokenization as the backend's word_count() so the live count matches the server
    function countWords(text) {
        const m = (text || '').match(/\b[\w'’-]+\b/g);
        return m ? m.length : 0;
    }

    function formatMoney(usd) {
        const n = Number(usd || 0);
        return `$${n.toFixed(2)}`;
    }

    function formatClock(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function firstSentence(text) {
        const t = (text || '').trim();
        const m = t.match(/^[^.!?]+[.!?]?/);
        return m ? m[0].trim() : t;
    }

    function minWords() {
        return (startData && Number(startData.min_words)) || 250;
    }

    // Inline error box with an optional retry button (never a dead end)
    function showInlineError(box, message, retryLabel, retryFn) {
        box.textContent = '';
        const text = document.createElement('span');
        text.textContent = message;
        box.appendChild(text);
        if (retryLabel && retryFn) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = retryLabel;
            btn.addEventListener('click', () => {
                hideInlineError(box);
                retryFn();
            });
            box.appendChild(document.createElement('br'));
            box.appendChild(btn);
        }
        box.style.display = 'block';
    }

    function hideInlineError(box) {
        box.style.display = 'none';
        box.textContent = '';
    }

    function showBlockingModal(title, message, buttonLabel, onClick) {
        blockingModalTitle.textContent = title;
        blockingModalMessage.textContent = message;
        blockingModalButton.textContent = buttonLabel || 'Continue';
        blockingModalButton.onclick = () => {
            blockingModal.style.display = 'none';
            if (onClick) onClick();
        };
        blockingModal.style.display = 'flex';
    }

    // Lock/unlock all controls inside a form (hidden inputs stay enabled so FormData sees them)
    function setFormControlsDisabled(form, disabled) {
        if (!form) return;
        const controls = form.querySelectorAll('input, select, textarea, button');
        controls.forEach(el => {
            if (el.tagName === 'INPUT' && el.type === 'hidden') {
                return;
            }
            el.disabled = disabled;
        });
    }

    // Form error pointing at the exact missed question (from the demographics form fix)
    function showFormError(form, msg, anchorEl) {
        let box = form.querySelector('.form-error-box');
        if (!box) {
            box = document.createElement('div');
            box.className = 'form-error-box';
            box.style.cssText = 'background:#fdecea;color:#b71c1c;border:1px solid #f5c6cb;border-radius:6px;padding:10px 14px;margin:10px 0;font-weight:bold;';
            form.insertBefore(box, form.firstChild);
        }
        box.textContent = msg;
        const target = anchorEl || box;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (anchorEl) {
            anchorEl.style.outline = '3px solid #e53935';
            anchorEl.style.outlineOffset = '4px';
            setTimeout(() => { anchorEl.style.outline = ''; anchorEl.style.outlineOffset = ''; }, 4000);
        }
    }

    function clearFormError(form) {
        const box = form.querySelector('.form-error-box');
        if (box) box.remove();
    }

    function likertGroupEl(form, name) {
        const bubble = form.querySelector(`.likert-bubble[data-name="${name}"]`);
        return bubble ? bubble.parentElement : null;
    }

    // =====================================================================================
    // Telemetry: batched every ~10 s and on page hide (POST /api/session/{tok}/telemetry)
    // =====================================================================================
    const telemetryQueue = [];
    const TELEMETRY_FLUSH_MS = 10000;
    const TELEMETRY_MAX_QUEUE = 2000;

    function nowMs() {
        return Date.now() - (sessionStartedAt || pageLoadedAt);
    }

    // UI event logger. at_ms is relative to session start; the payload carries the absolute time.
    function logUiEvent(event, payload = {}, versionId = undefined) {
        try {
            const entry = {
                event: String(event).slice(0, 64),
                at_ms: nowMs(),
                payload: Object.assign({ epoch_ms: Date.now(), phase: currentPhase }, payload || {})
            };
            const vid = (typeof versionId !== 'undefined') ? versionId : lastVersionId;
            if (vid) entry.version_id = vid;
            telemetryQueue.push(entry);
            if (telemetryQueue.length > TELEMETRY_MAX_QUEUE) telemetryQueue.splice(0, telemetryQueue.length - TELEMETRY_MAX_QUEUE);
            if (telemetryQueue.length >= 200) flushTelemetry(false);
        } catch (e) {
            // Silently fail - cannot risk any participant-visible errors
        }
    }

    let telemetryInFlight = false;
    async function flushTelemetry(useKeepalive) {
        if (!sessionToken || telemetryQueue.length === 0) return;
        if (telemetryInFlight && !useKeepalive) return;
        // keepalive bodies are capped at 64 KB by browsers: send small chunks on page hide
        const chunkSize = useKeepalive ? 40 : 500;
        const events = telemetryQueue.splice(0, chunkSize);
        telemetryInFlight = true;
        try {
            await fetch(`/api/session/${sessionToken}/telemetry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events }),
                keepalive: !!useKeepalive
            });
        } catch (e) {
            // Put the events back so the next flush retries them (bounded queue)
            telemetryQueue.unshift(...events);
            if (telemetryQueue.length > TELEMETRY_MAX_QUEUE) telemetryQueue.length = TELEMETRY_MAX_QUEUE;
        } finally {
            telemetryInFlight = false;
        }
        if (useKeepalive && telemetryQueue.length > 0) flushTelemetry(true);
    }

    setInterval(() => flushTelemetry(false), TELEMETRY_FLUSH_MS);

    // =====================================================================================
    // Suspicious-behavior tracking and input provenance (paste / drop / typing anomalies)
    // =====================================================================================
    function enableSuspiciousBehaviorTracking() {
        if (suspiciousBehaviorTrackingEnabled) return;
        suspiciousBehaviorTrackingEnabled = true;
        logSuspiciousEvent('automation_fingerprint', {
            navigator_webdriver: !!navigator.webdriver,
            user_agent_length: navigator.userAgent ? navigator.userAgent.length : 0,
            platform: navigator.platform || null,
            language_count: navigator.languages ? navigator.languages.length : null,
            plugin_count: navigator.plugins ? navigator.plugins.length : null,
            max_touch_points: navigator.maxTouchPoints || 0
        });
    }

    function logSuspiciousEvent(event, metadata = {}) {
        if (!suspiciousBehaviorTrackingEnabled) return;
        logUiEvent(event, metadata);
    }

    function describeEventTarget(target) {
        if (!target) return null;
        return {
            tag: target.tagName || null,
            id: target.id || null,
            name: target.name || null,
            type: target.type || null,
            className: typeof target.className === 'string' ? target.className : null
        };
    }

    function logUntrustedInputEvent(event, fieldName) {
        if (event && event.isTrusted === false) {
            logSuspiciousEvent('untrusted_input_event', {
                field: fieldName,
                event_type: event.type,
                input_type: event.inputType || null
            });
        }
    }

    function classifyInputProvenance(state) {
        const signals = [
            state.pasteCount > 0,
            state.dropCount > 0,
            state.largeJumpCount > 0,
            state.beforeinputPasteCount > 0,
            state.beforeinputDropCount > 0,
            state.beforeinputReplacementCount > 0
        ].filter(Boolean).length;

        if (state.keydownCount === 0 && signals === 0) return 'unknown';
        if (signals === 0) return 'typed_only';
        if (signals > 1 || (signals === 1 && state.keydownCount > 0)) return 'mixed';
        if (state.pasteCount > 0 || state.beforeinputPasteCount > 0) return 'pasted';
        if (state.dropCount > 0 || state.beforeinputDropCount > 0) return 'dropped';
        if (state.largeJumpCount > 0 || state.beforeinputReplacementCount > 0) return 'large_jump';
        return 'unknown';
    }

    function createInputProvenanceTracker(element, fieldName) {
        const state = {};

        function reset() {
            state.firstInputTimestamp = null;
            state.lastInputTimestamp = null;
            state.lastKeyTimestamp = null;
            state.focusStartTimestamp = null;
            state.lastValue = element ? element.value : '';
            state.keydownCount = 0;
            state.backspaceDeleteCount = 0;
            state.pasteCount = 0;
            state.dropCount = 0;
            state.beforeinputCount = 0;
            state.beforeinputPasteCount = 0;
            state.beforeinputDropCount = 0;
            state.beforeinputReplacementCount = 0;
            state.largeJumpCount = 0;
            state.untrustedEventCount = 0;
            state.textareaFocusCount = 0;
            state.textareaBlurCount = 0;
            state.charsInserted = 0;
            state.maxGrowthJumpChars = 0;
            state.longPauseCount = 0;
            state.maxPauseMs = 0;
            state.editCount = 0;
            state.totalFocusedMs = 0;
        }

        // Programmatic changes (Use this / Start over) must not count as a growth anomaly
        function syncValue() {
            state.lastValue = element ? element.value : '';
        }

        function noteUntrusted(event) {
            if (event && event.isTrusted === false) {
                state.untrustedEventCount += 1;
                logUntrustedInputEvent(event, fieldName);
            }
        }

        function buildSummary(submittedText) {
            const now = Date.now();
            const text = submittedText || '';
            const compositionMs = state.firstInputTimestamp ? now - state.firstInputTimestamp : null;
            const activeFocusedMs = state.focusStartTimestamp ? now - state.focusStartTimestamp : 0;
            const totalFocusedMs = state.totalFocusedMs + activeFocusedMs;
            const charsPerSecond = compositionMs && compositionMs > 0
                ? text.length / (compositionMs / 1000)
                : null;
            const timeSincePageInactiveEndedMs = lastPageInactivityEndedAt ? now - lastPageInactivityEndedAt : null;
            const largeMessageAfterInactivity = (
                text.length >= 120 &&
                lastPageInactivityDurationMs >= 15000 &&
                timeSincePageInactiveEndedMs !== null &&
                timeSincePageInactiveEndedMs <= 30000
            );

            return {
                field: fieldName,
                provenance_category: classifyInputProvenance(state),
                message_length_chars: text.length,
                message_word_count: countWords(text),
                first_input_timestamp_ms: state.firstInputTimestamp,
                last_input_timestamp_ms: state.lastInputTimestamp,
                composition_time_ms: compositionMs,
                total_focused_ms: totalFocusedMs,
                keydown_count: state.keydownCount,
                backspace_delete_count: state.backspaceDeleteCount,
                paste_count: state.pasteCount,
                drop_count: state.dropCount,
                beforeinput_count: state.beforeinputCount,
                beforeinput_paste_count: state.beforeinputPasteCount,
                beforeinput_drop_count: state.beforeinputDropCount,
                beforeinput_replacement_count: state.beforeinputReplacementCount,
                large_jump_count: state.largeJumpCount,
                max_growth_jump_chars: state.maxGrowthJumpChars,
                chars_inserted_observed: state.charsInserted,
                chars_per_second: charsPerSecond,
                long_pause_count: state.longPauseCount,
                max_pause_ms: state.maxPauseMs,
                edit_count: state.editCount,
                textarea_focus_count: state.textareaFocusCount,
                textarea_blur_count: state.textareaBlurCount,
                untrusted_event_count: state.untrustedEventCount,
                last_page_inactivity_duration_ms: lastPageInactivityDurationMs,
                time_since_page_inactivity_ended_ms: timeSincePageInactiveEndedMs,
                large_message_after_inactivity: largeMessageAfterInactivity,
                navigator_webdriver: !!navigator.webdriver
            };
        }

        if (element) {
            element.addEventListener('focus', (event) => {
                state.textareaFocusCount += 1;
                state.focusStartTimestamp = Date.now();
                noteUntrusted(event);
                logSuspiciousEvent('textarea_focus', {
                    field: fieldName,
                    is_trusted: event.isTrusted
                });
            });

            element.addEventListener('blur', (event) => {
                const now = Date.now();
                state.textareaBlurCount += 1;
                if (state.focusStartTimestamp) {
                    state.totalFocusedMs += now - state.focusStartTimestamp;
                    state.focusStartTimestamp = null;
                }
                noteUntrusted(event);
                logSuspiciousEvent('textarea_blur', {
                    field: fieldName,
                    is_trusted: event.isTrusted
                });
            });

            element.addEventListener('keydown', (event) => {
                const now = Date.now();
                if (state.lastKeyTimestamp) {
                    const pauseMs = now - state.lastKeyTimestamp;
                    if (pauseMs >= 10000) state.longPauseCount += 1;
                    state.maxPauseMs = Math.max(state.maxPauseMs, pauseMs);
                }
                state.keydownCount += 1;
                if (event.key === 'Backspace' || event.key === 'Delete') {
                    state.backspaceDeleteCount += 1;
                }
                state.lastKeyTimestamp = now;
                noteUntrusted(event);
            });

            element.addEventListener('beforeinput', (event) => {
                state.beforeinputCount += 1;
                const inputType = event.inputType || 'unknown';
                if (inputType === 'insertFromPaste') state.beforeinputPasteCount += 1;
                if (inputType === 'insertFromDrop') state.beforeinputDropCount += 1;
                if (inputType === 'insertReplacementText' || inputType === 'insertFromYank') {
                    state.beforeinputReplacementCount += 1;
                }
                noteUntrusted(event);
                if (!['insertText', 'deleteContentBackward', 'deleteContentForward', 'insertLineBreak', 'insertParagraph'].includes(inputType)) {
                    logSuspiciousEvent('beforeinput', {
                        field: fieldName,
                        input_type: inputType,
                        data_char_count: event.data ? event.data.length : 0,
                        input_text: inputType === 'insertFromPaste' ? (event.data || '').slice(0, 2000) : null,
                        is_trusted: event.isTrusted
                    });
                }
            });

            element.addEventListener('input', (event) => {
                const now = Date.now();
                const newValue = element.value;
                const previousValue = state.lastValue || '';
                const delta = newValue.length - previousValue.length;
                const elapsedSinceLastInputMs = state.lastInputTimestamp ? now - state.lastInputTimestamp : null;

                if (!state.firstInputTimestamp && newValue.trim().length > 0) {
                    state.firstInputTimestamp = now;
                }

                if (delta > 0) state.charsInserted += delta;
                if (delta !== 0) state.editCount += 1;
                if (delta >= 80 && (elapsedSinceLastInputMs === null || elapsedSinceLastInputMs <= 1500 || state.keydownCount === 0)) {
                    state.largeJumpCount += 1;
                    state.maxGrowthJumpChars = Math.max(state.maxGrowthJumpChars, delta);
                    logSuspiciousEvent('text_growth_anomaly', {
                        field: fieldName,
                        growth_chars: delta,
                        elapsed_since_last_input_ms: elapsedSinceLastInputMs,
                        keydown_count: state.keydownCount,
                        is_trusted: event.isTrusted
                    });
                }

                state.lastInputTimestamp = now;
                state.lastValue = newValue;
                noteUntrusted(event);
            });

            element.addEventListener('paste', (event) => {
                state.pasteCount += 1;
                noteUntrusted(event);
            });

            element.addEventListener('drop', (event) => {
                state.dropCount += 1;
                noteUntrusted(event);
                logSuspiciousEvent('drop', {
                    field: fieldName,
                    target: describeEventTarget(event.target),
                    is_trusted: event.isTrusted
                });
            });
        }

        reset();
        return { reset, buildSummary, syncValue };
    }

    const cuesProvenanceTracker = createInputProvenanceTracker(cuesFreeText, 'cues_free_text');
    const promptProvenanceTracker = createInputProvenanceTracker(promptInput, 'chat_prompt');
    const essayProvenanceTracker = createInputProvenanceTracker(essayEditor, 'essay');
    const postWhatChangedTracker = createInputProvenanceTracker(postWhatChanged, 'post_what_changed');
    const postMostHelpfulTracker = createInputProvenanceTracker(postMostHelpful, 'post_most_helpful');

    // =====================================================================================
    // Screen timers (inactivity). In this study they only log or run a backstop; they never eject.
    // =====================================================================================
    let currentScreenTimer = null;
    let currentScreenName = null;
    let screenActivityHandler = null;
    let lastScreenTimerBumpAt = 0;
    const SCREEN_INACTIVITY_LOG_MS = 3 * 60 * 1000;   // log 'screen_inactive' after 3 min without input
    const RATING_TIMEOUT_BACKSTOP_MS = 90 * 1000;      // timeout-mode rating screen auto-submits after 90 s idle

    function clearScreenTimer() {
        if (currentScreenTimer) {
            clearTimeout(currentScreenTimer);
            currentScreenTimer = null;
        }
        if (screenActivityHandler) {
            ['input', 'change', 'click', 'keydown'].forEach(ev =>
                document.removeEventListener(ev, screenActivityHandler, true));
            screenActivityHandler = null;
        }
        currentScreenName = null;
    }

    function startScreenTimer(timeoutMs, screenName, onTimeout, resetOnActivity = false) {
        clearScreenTimer();
        currentScreenName = screenName;

        const fire = () => {
            logUiEvent('screen_timeout', { screen: screenName, timeout_ms: timeoutMs });
            onTimeout();
        };
        currentScreenTimer = setTimeout(fire, timeoutMs);

        // Inactivity semantics: any interaction re-arms the timer (debounced against key bursts)
        if (resetOnActivity) {
            screenActivityHandler = () => {
                const now = Date.now();
                if (now - lastScreenTimerBumpAt < 1000) return;
                lastScreenTimerBumpAt = now;
                if (currentScreenTimer) {
                    clearTimeout(currentScreenTimer);
                    currentScreenTimer = setTimeout(fire, timeoutMs);
                }
            };
            ['input', 'change', 'click', 'keydown'].forEach(ev =>
                document.addEventListener(ev, screenActivityHandler, true));
        }
    }

    // =====================================================================================
    // Likert bubble handlers (all forms)
    // =====================================================================================
    const likertBubbles = document.querySelectorAll('.likert-bubble');
    likertBubbles.forEach(bubble => {
        bubble.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission

            const groupName = bubble.dataset.name;
            const value = bubble.dataset.value;
            const form = bubble.closest('form');

            const scope = form || document;
            scope.querySelectorAll(`.likert-bubble[data-name="${groupName}"]`).forEach(b => {
                b.classList.remove('selected');
            });

            bubble.classList.add('selected');

            const hidden = scope.querySelector(`input[type="hidden"][name="${groupName}"]`);
            if (hidden) hidden.value = value;
            logUiEvent('likert_selected', { group: groupName, value: Number(value) });
        });
    });

    // =====================================================================================
    // Phase switching
    // =====================================================================================
    const PHASE_DIVS = {
        loading: loadingPhaseDiv,
        consent: consentPhaseDiv,
        cues: cuesPhaseDiv,
        instructions: instructionsPhaseDiv,
        workspace: workspacePhaseDiv,
        rating: ratingPhaseDiv,
        result: resultPhaseDiv,
        post_survey: postSurveyPhaseDiv,
        demographics: demographicsPhaseDiv,
        final: finalPageDiv
    };

    function showMainPhase(phase) {
        const previous = currentPhase;
        if (previous && phaseEnteredAt) {
            logUiEvent('screen_exit', { screen: previous, ms_on_screen: Date.now() - phaseEnteredAt });
        }

        Object.values(PHASE_DIVS).forEach(div => { if (div) div.style.display = 'none'; });
        const target = PHASE_DIVS[phase];
        if (target) target.style.display = 'block';

        clearScreenTimer();
        currentPhase = phase;
        phaseEnteredAt = Date.now();
        mainContainer.classList.toggle('wide', phase === 'workspace');
        timerDisplay.style.display = (workspaceOpenedAt && (phase === 'workspace' || phase === 'rating') && !isSubmitted && !noStatement) ? 'block' : 'none';
        window.scrollTo({ top: 0, behavior: 'auto' });

        logUiEvent('screen_enter', { screen: phase });

        // Inactivity log for every screen (never ejects; the rating timeout backstop is set separately)
        if (phase !== 'rating' && phase !== 'loading') {
            startScreenTimer(SCREEN_INACTIVITY_LOG_MS, phase, () => {
                logUiEvent('screen_inactive', { screen: phase, inactive_ms: SCREEN_INACTIVITY_LOG_MS });
            }, true);
        }

        saveState();
    }

    // =====================================================================================
    // Prolific redirects
    // =====================================================================================
    function prepareIntentionalRedirect() {
        isIntentionalRedirect = true;
        if (handleEarlyExit) window.removeEventListener('beforeunload', handleEarlyExit);
    }

    function isPlaceholderCode(code) {
        return !code || String(code).toUpperCase().startsWith('PLACEHOLDER');
    }

    function redirectToProlific(code, context) {
        prepareIntentionalRedirect();
        logUiEvent('prolific_redirect', { code, context: context || null });
        flushTelemetry(true);
        const url = PROLIFIC_COMPLETE_BASE + code;
        if (isProduction) {
            setTimeout(() => { window.location.href = url; }, 300);
        } else {
            showBlockingModal('DEV MODE', `Production would redirect to Prolific now with code ${code} (${context || 'completion'}).`, 'OK');
        }
    }

    // =====================================================================================
    // Session start / resume
    // =====================================================================================
    async function startSession() {
        showMainPhase('loading');
        loadingRow.style.display = 'flex';
        startErrorDiv.style.display = 'none';
        startRetryButton.style.display = 'none';

        try {
            const result = await apiPost('/api/session/start', {
                prolific_pid: prolificPid || 'ANON',
                study_id: prolificStudyId,
                session_id: prolificSessionId,
                user_agent: navigator.userAgent || ''
            });
            if (!result || !result.session_token) throw new Error('The server did not return a session.');

            sessionToken = result.session_token;
            startData = result;
            sessionStartedAt = Date.now();
            try { localStorage.setItem(TOKEN_KEY, sessionToken); } catch (e) { /* ignore */ }

            populateStaticTexts();
            saveState();
            flushTelemetry(false);
            showMainPhase('consent');
        } catch (error) {
            loadingRow.style.display = 'none';
            const msg = isNetworkError(error)
                ? 'We could not reach the study server. Please check your connection and try again.'
                : `We could not start your session. ${error.message}`;
            startErrorDiv.textContent = msg;
            startErrorDiv.style.display = 'block';
            startRetryButton.style.display = 'inline-block';
            logUiEvent('session_start_failed', { message: error.message });
        }
    }

    startRetryButton.addEventListener('click', () => {
        logUiEvent('session_start_retry_clicked');
        startSession();
    });

    function populateStaticTexts() {
        if (!startData) return;
        const mw = minWords();
        document.querySelectorAll('.consent-min-words').forEach(el => { el.textContent = String(mw); });
        document.querySelectorAll('.consent-time-cap').forEach(el => { el.textContent = String(startData.time_cap_min || 25); });

        document.getElementById('instr-topic-text').textContent = startData.topic_text || '';
        document.getElementById('instr-purpose-text').textContent = startData.purpose_text || '';
        document.getElementById('instr-min-words').textContent = String(mw);
        document.getElementById('instr-time-cap').textContent = String(startData.time_cap_min || 25);
        document.getElementById('instr-bonus-rule-text').textContent = startData.bonus_rule_text || '';
        document.getElementById('instr-feedback-note').textContent = startData.condition_feedback
            ? 'Because you are in the group that sees the detector, its verdict for each version is shown on the rating screen after every change.'
            : 'Because you are in the group that does not see the detector while writing, you will see its verdict only after you submit.';

        wsTopicText.textContent = startData.topic_text || '';
        wsPurposeText.textContent = startData.purpose_text || '';
        wsBonusReminder.textContent = startData.bonus_rule_text || '';
        wordCountEl.textContent = `0 / ${mw} words`;
    }

    function resumeSession(saved) {
        sessionToken = saved.token;
        startData = saved.startData;
        sessionStartedAt = saved.sessionStartedAt || Date.now();
        consentDone = !!saved.consentDone;
        cuesDone = !!saved.cuesDone;
        checkPassed = !!saved.checkPassed;
        resultAcknowledged = !!saved.resultAcknowledged;
        postSurveyDone = !!saved.postSurveyDone;
        demographicsDone = !!saved.demographicsDone;
        workspaceOpenedAt = saved.workspaceOpenedAt || null;
        timeExpired = !!saved.timeExpired;
        versions = Array.isArray(saved.versions) ? saved.versions : [];
        lastVersionId = saved.lastVersionId || null;
        lastVersionText = saved.lastVersionText || null;
        pendingSource = saved.pendingSource || 'manual';
        editorSeedPromptId = saved.editorSeedPromptId || null;
        chatMessages = Array.isArray(saved.chatMessages) ? saved.chatMessages : [];
        ratingPending = saved.ratingPending || null;
        isSubmitted = !!saved.isSubmitted;
        finalResult = saved.finalResult || null;
        noStatement = !!saved.noStatement;
        completionCode = saved.completionCode || null;

        populateStaticTexts();
        essayEditor.value = saved.essayDraft || '';
        essayProvenanceTracker.syncValue();
        renderChat();
        updateWordCount();

        logUiEvent('session_resumed', { saved_phase: saved.phase, versions: versions.length });

        if (consentDone) enableSuspiciousBehaviorTracking();

        if (!consentDone) { showMainPhase('consent'); return; }
        if (!cuesDone) { showMainPhase('cues'); return; }
        if (!checkPassed) { showInstructions(); return; }
        if (noStatement && !resultAcknowledged) { showNoStatementResult(); return; }
        if (!isSubmitted && !noStatement) {
            if (ratingPending) {
                openRatingScreen(ratingPending, timeExpired ? 'timeout' : 'normal');
            } else {
                openWorkspace(true);
            }
            return;
        }
        if (!resultAcknowledged) { showResult(); return; }
        if (!postSurveyDone) { showMainPhase('post_survey'); return; }
        if (!demographicsDone) { showMainPhase('demographics'); return; }
        showFinalPage();
    }

    // =====================================================================================
    // Consent (POST /api/session/{tok}/consent)
    // =====================================================================================
    agreeButton.addEventListener('click', async () => {
        logUiEvent('consent_agree_clicked');
        agreeButton.disabled = true;
        disagreeButton.disabled = true;
        hideInlineError(consentErrorDiv);
        try {
            await apiPost(`/api/session/${sessionToken}/consent`, { consented: true });
            consentDone = true;
            enableSuspiciousBehaviorTracking();
            saveState();
            // Hide the main text and buttons, show the download prompt
            consentContentDiv.style.display = 'none';
            consentActionsDiv.style.display = 'none';
            consentDownloadPromptDiv.style.display = 'block';
        } catch (error) {
            agreeButton.disabled = false;
            disagreeButton.disabled = false;
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            showInlineError(consentErrorDiv, 'We could not record your consent. Please try again.', 'Try again', () => agreeButton.click());
            logUiEvent('consent_post_failed', { message: error.message });
        }
    });

    disagreeButton.addEventListener('click', async () => {
        logUiEvent('consent_disagree_clicked');
        agreeButton.disabled = true;
        disagreeButton.disabled = true;
        let code = PROLIFIC_NO_CONSENT_CODE;
        try {
            const result = await apiPost(`/api/session/${sessionToken}/consent`, { consented: false });
            if (result && !isPlaceholderCode(result.completion_code)) code = result.completion_code;
        } catch (error) {
            // The decline still stands; use the frontend code
        }
        clearState();
        if (isProduction) {
            redirectToProlific(code, 'no_consent');
        } else {
            mainContainer.innerHTML = `
                <h2>Study Ended (DEV MODE)</h2>
                <p>You must consent to participate. In production, you would be redirected to Prolific with code ${code}.</p>
            `;
        }
    });

    skipConsentDownloadButton.addEventListener('click', () => {
        logUiEvent('consent_skip_download_clicked');
        showMainPhase('cues');
    });

    downloadConsentButton.addEventListener('click', () => {
        logUiEvent('consent_download_clicked');
        const timestamp = new Date().toLocaleString();
        const consentText = `
CONSENT TO PARTICIPATE IN RESEARCH
Principal Investigator: Nykko Vitali (nvitali@fas.harvard.edu)
Faculty Sponsor: Jason Mitchell
Prolific ID: ${prolificPid || 'N/A'}

[CONSENT RECORDED: Participant agreed to participate on ${timestamp}]

About this Study
You are being asked to participate in a research study. This form gives you information about the study.

Purpose of Research
This research examines how people write with AI writing assistants and how they judge whether a piece of writing looks human-written.

What You Will Be Asked to Do
If you agree to participate, you will:
- Answer a few short questions about what makes writing look AI-generated to you
- Write a short personal statement (at least ${minWords()} words) with the help of an AI writing assistant that we assign to you. You can ask the assistant for text, edit the text yourself, or start over
- Each time you finish a change, rate how likely a person and an AI detector would be to judge the statement as human-written, and decide whether to keep editing or to submit
- Have your submitted statement scored by an AI-detection service
- Answer short questions about the task, then complete a brief demographic questionnaire
- The writing part has a time limit of ${startData ? startData.time_cap_min : 25} minutes. The total time commitment is approximately 30 minutes
- Please do not include information that could identify you or another person in your writing

Your Rights as a Participant
- Your participation is voluntary.
- You may stop at any time.
- You may choose not to answer any question.

Risks and Benefits
- There are no known risks beyond those of everyday computer use
- While there are no direct benefits to you, your participation helps advance our understanding of how people work with AI writing tools

Compensation
- You will receive the base payment listed on Prolific for your participation
- Some participants are offered a bonus that depends on how the AI-detection service rates their final statement. Whether you are offered a bonus, its amount, and the rule for earning it are shown to you in plain words before you start writing
- Any bonus is paid through Prolific after the study closes

Confidentiality
- Your responses will be stored securely
- The text you write and your messages to the assistant are sent to the assistant's provider and to AI-detection services for scoring. Your Prolific ID is never sent to these services
- Data will be analyzed without any identifying information
- Only researchers will have access to the data
- Anonymized results derived from your data may be shared in scientific databases for transparency of our research process
- Any personally identifying information you may include in your writing will be removed from analyses and will not be used in research outputs

Questions or Concerns?
- For questions about the research: Contact the Principal Investigator at nvitali@fas.harvard.edu
- For questions about your rights as a participant: Contact cuhs@harvard.edu

Agreement to Participate
By clicking "I agree", you indicated that:
- You are at least 18 years old.
- You have read and understood this consent form.
- You voluntarily agree to participate.
- You understand you can withdraw at any time.

[PARTICIPANT ACCEPTED THE ABOVE TERMS ON ${timestamp}]
        `;
        generateAndDownloadPdf(consentText, `Consent_Form_${sessionToken || 'participant'}.pdf`);
        showMainPhase('cues');
    });

    function generateAndDownloadPdf(content, filename) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const leftMargin = 15;
            const topMargin = 20;
            const bottomMargin = 20;
            const lineHeight = 7;
            let y = topMargin;

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const usableWidth = pageWidth - (leftMargin * 2);

            doc.setFontSize(12);
            const lines = doc.splitTextToSize(content, usableWidth);
            lines.forEach(line => {
                if (y + lineHeight > pageHeight - bottomMargin) {
                    doc.addPage();
                    y = topMargin;
                }
                doc.text(line, leftMargin, y);
                y += lineHeight;
            });

            doc.save(filename);
            logUiEvent('pdf_download', { filename });
        } catch (error) {
            logUiEvent('pdf_generation_error', { filename, message: error && error.message });
            showError('The PDF could not be generated. You can continue; contact the researcher if you need a copy.');
        }
    }

    function handleUnknownSession() {
        logUiEvent('unknown_session');
        showBlockingModal(
            'Session not found',
            'Your session could not be found on the server. Click Start again to begin a new session.',
            'Start again',
            () => { clearState(); window.location.reload(); }
        );
    }

    // =====================================================================================
    // Cue elicitation (POST /api/session/{tok}/cues)
    // =====================================================================================
    const CUE_FIELDS = ['overly_formal', 'em_dashes', 'repetitive_structure', 'excessive_transitions', 'generic_examples',
                        'no_personal_detail', 'polished_grammar', 'certain_vocabulary', 'predictable_paragraphs'];

    cuesForm.setAttribute('novalidate', 'novalidate');
    cuesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        logUiEvent('cues_form_submitted');
        clearFormError(cuesForm);

        const freeText = cuesFreeText.value.trim();
        if (!freeText) {
            showFormError(cuesForm, 'Please describe in your own words what makes writing look AI-generated to you.', cuesFreeText);
            return;
        }
        const formData = new FormData(cuesForm);
        const checklist = {};
        for (const field of CUE_FIELDS) {
            const v = formData.get(field);
            if (!v) {
                showFormError(cuesForm, 'Please answer the highlighted rating question.', likertGroupEl(cuesForm, field));
                return;
            }
            checklist[field] = parseInt(v, 10);
        }
        const other = cuesOtherText.value.trim();
        if (other) checklist.other_text = other;

        const provenance = cuesProvenanceTracker.buildSummary(freeText);
        logUiEvent('cues_input_provenance', provenance);

        setFormControlsDisabled(cuesForm, true);
        cuesLoadingDiv.style.display = 'block';
        try {
            await apiPost(`/api/session/${sessionToken}/cues`, { free_text: freeText, checklist });
            cuesDone = true;
            saveState();
            cuesLoadingDiv.style.display = 'none';
            showInstructions();
        } catch (error) {
            cuesLoadingDiv.style.display = 'none';
            setFormControlsDisabled(cuesForm, false);
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            showFormError(cuesForm, 'We could not save your answers. Please click Continue again.', null);
            logUiEvent('cues_post_failed', { message: error.message });
        }
    });

    // =====================================================================================
    // Instructions (paginated) + comprehension check
    // =====================================================================================
    function showInstructions() {
        currentInstructionPage = 1;
        instructionNav.style.display = 'flex';
        confirmInstructionsButton.style.display = 'none';
        updateInstructionPage();
        showMainPhase('instructions');
    }

    function updateInstructionPage() {
        instructionPages.forEach((page, index) => {
            page.style.display = (index + 1 === currentInstructionPage) ? 'block' : 'none';
        });

        if (instructionPageIndicator) {
            instructionPageIndicator.textContent = `${currentInstructionPage} / ${totalInstructionPages}`;
        }

        if (instructionPrevBtn) {
            instructionPrevBtn.style.visibility = (currentInstructionPage === 1) ? 'hidden' : 'visible';
        }

        if (instructionNextBtn) {
            if (currentInstructionPage === totalInstructionPages) {
                // Last page (comprehension check): Next becomes Submit answers
                instructionNextBtn.style.display = 'inline-block';
                instructionNextBtn.textContent = 'Submit answers';
                populateComprehensionCheck();
            } else {
                instructionNextBtn.style.display = 'inline-block';
                instructionNextBtn.textContent = 'Next →';
            }
        }
        logUiEvent('instruction_page_viewed', { page: currentInstructionPage });
    }

    if (instructionPrevBtn) {
        instructionPrevBtn.addEventListener('click', () => {
            if (currentInstructionPage > 1) {
                currentInstructionPage--;
                updateInstructionPage();
                logUiEvent('instruction_prev_clicked', { page: currentInstructionPage });
            }
        });
    }

    if (instructionNextBtn) {
        instructionNextBtn.addEventListener('click', () => {
            if (currentInstructionPage === totalInstructionPages) {
                if (validateComprehensionCheck()) {
                    checkPassed = true;
                    saveState();
                    instructionNav.style.display = 'none';
                    confirmInstructionsButton.style.display = 'block';
                }
            } else if (currentInstructionPage < totalInstructionPages) {
                currentInstructionPage++;
                updateInstructionPage();
                logUiEvent('instruction_next_clicked', { page: currentInstructionPage });
            }
        });
    }

    confirmInstructionsButton.addEventListener('click', () => {
        logUiEvent('instructions_confirmed');
        openWorkspace(false);
    });

    // --- Comprehension check (bonus rule + stated purpose), from the attention-check mechanics ---
    // Short forms must stay in sync with topics.PURPOSE_BY_STAKES in the backend.
    const PURPOSE_SHORT = {
        low: 'A personal blog post',
        medium: 'A cover letter for a job application',
        high: 'A scholarship application'
    };
    let comprehensionAttempts = 0;
    let checkQ1CorrectIndex = -1;
    let checkQ2CorrectIndex = -1;
    let comprehensionPopulated = false;

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function populateComprehensionCheck() {
        if (comprehensionPopulated) return;
        comprehensionPopulated = true;
        comprehensionAttempts = 0;
        comprehensionErrorEl.style.display = 'none';

        const bonus = Number(startData.bonus_usd || 0);
        const q1Correct = bonus > 0
            ? `I earn a ${formatMoney(bonus)} bonus.`
            : 'Nothing changes. There is no bonus in this task.';
        const q1Distractors = bonus > 0
            ? ['I earn a $5.00 bonus.', 'Nothing changes. There is no bonus in this task.', 'The statement is sent back to me for another change.']
            : ['I earn a $5.00 bonus.', 'I earn a $1.00 bonus.', 'The statement is sent back to me for another change.'];
        const q1Options = shuffleArray([{ text: q1Correct, correct: true }, ...q1Distractors.map(t => ({ text: t, correct: false }))]);

        const q2Correct = PURPOSE_SHORT[startData.condition_stakes] || firstSentence(startData.purpose_text);
        const q2Distractors = ['A newspaper opinion column', 'A message to a friend', 'A school essay assignment'];
        const q2Options = shuffleArray([{ text: q2Correct, correct: true }, ...q2Distractors.map(t => ({ text: t, correct: false }))]);

        document.getElementById('check-q1-text').textContent =
            'According to your bonus rule, what happens if the detector rates your final statement as more likely written by a human?';
        document.getElementById('check-q2-text').textContent =
            'According to the instructions, what is the statement for?';

        q1Options.forEach((opt, index) => {
            document.getElementById(`check-q1-option-${index}`).textContent = opt.text;
            if (opt.correct) checkQ1CorrectIndex = index;
        });
        q2Options.forEach((opt, index) => {
            document.getElementById(`check-q2-option-${index}`).textContent = opt.text;
            if (opt.correct) checkQ2CorrectIndex = index;
        });
        document.querySelectorAll('input[name="check-q1"], input[name="check-q2"]').forEach(r => { r.checked = false; });

        logUiEvent('comprehension_check_shown', { q1_correct_index: checkQ1CorrectIndex, q2_correct_index: checkQ2CorrectIndex });
    }

    function validateComprehensionCheck() {
        const s1 = document.querySelector('input[name="check-q1"]:checked');
        const s2 = document.querySelector('input[name="check-q2"]:checked');
        if (!s1 || !s2) {
            comprehensionErrorEl.textContent = 'Please answer both questions.';
            comprehensionErrorEl.style.display = 'block';
            return false;
        }
        comprehensionAttempts++;
        const i1 = parseInt(s1.value, 10);
        const i2 = parseInt(s2.value, 10);
        const ok1 = i1 === checkQ1CorrectIndex;
        const ok2 = i2 === checkQ2CorrectIndex;
        logUiEvent('comprehension_check_submitted', { attempt: comprehensionAttempts, q1_selected: i1, q2_selected: i2, q1_correct: ok1, q2_correct: ok2 });

        if (ok1 && ok2) {
            comprehensionErrorEl.style.display = 'none';
            logUiEvent('comprehension_check_passed', { attempts: comprehensionAttempts });
            return true;
        }
        comprehensionErrorEl.textContent = ok1
            ? 'The second answer is not quite right. Please go back to the instructions, then try again.'
            : (ok2 ? 'The first answer is not quite right. Please go back to your bonus rule, then try again.'
                   : 'Those answers are not quite right. Please go back and read the instructions again, then try again.');
        comprehensionErrorEl.style.display = 'block';
        return false;
    }

    // =====================================================================================
    // Workspace (chat + editor + timer)
    // =====================================================================================
    function openWorkspace(resumed) {
        if (!workspaceOpenedAt) {
            workspaceOpenedAt = Date.now();
            logUiEvent('workspace_opened', { time_cap_min: startData.time_cap_min, min_words: minWords() });
        } else if (!resumed) {
            logUiEvent('workspace_returned', { versions: versions.length });
        }
        attachEarlyExitWarning();
        hideInlineError(chatErrorDiv);
        hideInlineError(essayErrorDiv);
        essayWorkingDiv.style.display = 'none';
        renderChat();
        updateWordCount();
        showMainPhase('workspace'); notifyWorkspaceOpen();
        if (timeExpired || workspaceLocked) {
            lockWorkspace();
            if (!isSubmitted) handleTimeExpired('resume');
            return;
        }
        startWorkspaceTimer();
    }

    // --- Timer ---
    function startWorkspaceTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(timerTick, 500);
        timerTick();
    }

    function stopWorkspaceTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function timeCapMs() {
        return Number(startData.time_cap_min || 25) * 60 * 1000;
    }

    function timerTick() {
        if (!workspaceOpenedAt || timeExpired) return;
        const remaining = workspaceOpenedAt + timeCapMs() - Date.now();
        countdownTimer.textContent = formatClock(remaining);
        timerDisplay.classList.toggle('warning', remaining <= 60 * 1000);
        if (remaining <= 0 && !timeExpired) {
            handleTimeExpired('client_timer');
        }
    }

    // --- Word count / Done button state ---
    function updateWordCount() {
        const text = essayEditor.value;
        const wc = countWords(text);
        const mw = minWords();
        wordCountEl.textContent = `${wc} / ${mw} words`;
        wordCountEl.classList.toggle('short', wc < mw);
        wordCountEl.classList.toggle('ok', wc >= mw);

        const unchanged = text.trim() === (lastVersionText || '').trim();
        if (wc < mw) {
            wordCountStatusEl.textContent = `${mw - wc} more ${mw - wc === 1 ? 'word' : 'words'} needed`;
        } else if (unchanged && lastVersionText !== null) {
            wordCountStatusEl.textContent = 'No changes since your last version';
        } else {
            wordCountStatusEl.textContent = 'Ready. Click Done when you finish this change.';
        }
        updateDoneButtonState();
    }

    function updateDoneButtonState() {
        const text = essayEditor.value;
        const wc = countWords(text);
        const unchanged = text.trim() === (lastVersionText || '').trim();
        doneButton.disabled = workspaceLocked || essayBusy || timeExpired || isSubmitted || wc < minWords() || (unchanged && lastVersionText !== null) || !text.trim();
        startOverButton.disabled = workspaceLocked || essayBusy || timeExpired || isSubmitted || !text.trim();
    }

    essayEditor.addEventListener('input', () => {
        updateWordCount();
        scheduleDraftSave();
    });

    // --- Chat rendering ---
    function renderChat() {
        messageList.innerHTML = '';
        chatMessages.forEach(msg => renderMessage(msg));
        scrollChatToBottom();
    }

    function renderMessage(msg) {
        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble', msg.role);
        bubble.textContent = msg.text || '';
        bubble.dataset.messageId = msg.id;
        messageList.appendChild(bubble);

        if (msg.role === 'assistant' && msg.prompt_id && msg.text) {
            const actions = document.createElement('div');
            actions.className = 'message-actions';
            actions.dataset.messageId = msg.id;
            if (msg.applied) {
                const note = document.createElement('span');
                note.className = 'applied-note';
                note.textContent = 'Used as your statement';
                actions.appendChild(note);
            } else {
                const useBtn = document.createElement('button');
                useBtn.type = 'button';
                useBtn.className = 'apply-button';
                useBtn.textContent = 'Use this as my statement';
                useBtn.disabled = workspaceLocked || timeExpired || isSubmitted;
                useBtn.addEventListener('click', () => handleApply(msg, useBtn));
                actions.appendChild(useBtn);
            }
            messageList.appendChild(actions);
        }
    }

    function addChatMessage(role, text, extra = {}) {
        const msg = Object.assign({ id: `m${Date.now()}_${Math.floor(Math.random() * 1e6)}`, role, text, prompt_id: null, applied: false }, extra);
        chatMessages.push(msg);
        renderMessage(msg);
        scrollChatToBottom();
        saveState();
        return msg;
    }

    function scrollChatToBottom() {
        const chatWindow = document.querySelector('.chat-window');
        if (!chatWindow) return;
        setTimeout(() => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 0);
    }

    function setChatBusy(busy) {
        chatBusy = busy;
        sendPromptButton.disabled = busy || workspaceLocked || timeExpired || isSubmitted;
        promptInput.disabled = busy || workspaceLocked || timeExpired || isSubmitted;
        assistantWorking.style.display = busy ? 'flex' : 'none';
        if (busy) scrollChatToBottom();
    }

    // --- Send a prompt (POST /api/session/{tok}/prompt) ---
    async function handleSendPrompt(retryText) {
        if (chatBusy || workspaceLocked || timeExpired || isSubmitted) return;
        const text = (typeof retryText === 'string') ? retryText : promptInput.value.trim();
        if (!text) return;
        hideInlineError(chatErrorDiv);

        if (typeof retryText !== 'string') {
            const provenance = promptProvenanceTracker.buildSummary(text);
            logUiEvent('prompt_input_provenance', provenance);
            addChatMessage('user', text);
            promptInput.value = '';
            promptProvenanceTracker.reset();
        }

        const essayText = essayEditor.value;
        logUiEvent('prompt_sent', { chars: text.length, words: countWords(text), essay_words: countWords(essayText), retry: typeof retryText === 'string' });
        setChatBusy(true);
        try {
            const result = await apiPost(`/api/session/${sessionToken}/prompt`, {
                prompt_text: text,
                attach_essay: true,
                essay_text: essayText
            });
            setChatBusy(false);
            if (!result || result.error || !result.reply_text) {
                logUiEvent('prompt_reply_unavailable', { prompt_id: result ? result.prompt_id : null, error: result ? result.error : 'no_result' });
                showInlineError(chatErrorDiv, 'The assistant could not reply this time.', 'Send again', () => handleSendPrompt(text));
                return;
            }
            addChatMessage('assistant', result.reply_text, { prompt_id: result.prompt_id });
            logUiEvent('prompt_reply_received', { prompt_id: result.prompt_id, reply_words: countWords(result.reply_text), latency_ms: result.latency_ms }, null);
        } catch (error) {
            setChatBusy(false);
            logUiEvent('prompt_post_failed', { code: error.code || null, status: error.status || null, message: error.message });
            if (error.code === 'time_cap') { handleTimeExpired('server'); return; }
            if (error.code === 'already_submitted') { recoverSubmitted(); return; }
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            if (error.code === 'empty_prompt') { showInlineError(chatErrorDiv, error.message); return; }
            const msg = isNetworkError(error)
                ? 'We could not reach the server. Check your connection, then send again.'
                : `The message could not be sent. ${error.message}`;
            showInlineError(chatErrorDiv, msg, 'Send again', () => handleSendPrompt(text));
        }
    }

    sendPromptButton.addEventListener('click', () => handleSendPrompt());
    promptInput.addEventListener('keydown', (e) => {
        // Enter sends; Shift+Enter makes a new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendPrompt();
        }
    });

    // --- Apply an assistant reply (POST /api/session/{tok}/apply) ---
    async function handleApply(msg, buttonEl) {
        if (essayBusy || chatBusy || workspaceLocked || timeExpired || isSubmitted) return;
        hideInlineError(chatErrorDiv);
        hideInlineError(essayErrorDiv);
        essayBusy = true;
        if (buttonEl) buttonEl.disabled = true;
        essayEditor.readOnly = true;
        essayWorkingDiv.textContent = 'Putting this reply in your statement...';
        essayWorkingDiv.style.display = 'block';
        updateDoneButtonState();
        logUiEvent('apply_clicked', { prompt_id: msg.prompt_id, reply_words: countWords(msg.text) });

        try {
            const result = await apiPost(`/api/session/${sessionToken}/apply`, { prompt_id: msg.prompt_id });
            const appliedText = (msg.text || '').trim();
            essayEditor.value = appliedText;
            essayProvenanceTracker.reset();
            essayProvenanceTracker.syncValue();
            msg.applied = true;
            pendingSource = 'manual';
            editorSeedPromptId = null;
            const version = recordVersion(result, 'llm_apply', appliedText, msg.prompt_id);
            finishEssayBusy();
            renderChat();
            updateWordCount();
            openRatingScreen(version, 'normal');
        } catch (error) {
            finishEssayBusy();
            if (buttonEl) buttonEl.disabled = false;
            logUiEvent('apply_failed', { prompt_id: msg.prompt_id, code: error.code || null, status: error.status || null, message: error.message });
            if (error.code === 'time_cap') { handleTimeExpired('server'); return; }
            if (error.code === 'already_submitted') { recoverSubmitted(); return; }
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            if (error.code === 'too_short') {
                showInlineError(chatErrorDiv,
                    `${error.message} Ask the assistant to make it longer, or put it in the editor and add to it yourself.`,
                    'Put it in the editor', () => seedEditorFromReply(msg));
                return;
            }
            if (error.code === 'unchanged') {
                showInlineError(chatErrorDiv, 'This reply is the same as your last recorded version. Ask for a different change, or edit the text yourself.');
                return;
            }
            if (error.code === 'prompt_not_found') {
                showInlineError(chatErrorDiv, error.message);
                return;
            }
            const text = isNetworkError(error)
                ? 'We could not reach the server. Check your connection, then try again.'
                : `This reply could not be applied. ${error.message}`;
            showInlineError(chatErrorDiv, text, 'Try again', () => handleApply(msg, null));
        }
    }

    // Place a reply in the editor without recording a version (the next Done is source=manual with prompt_id)
    function seedEditorFromReply(msg) {
        if (workspaceLocked || timeExpired || isSubmitted) return;
        essayEditor.value = (msg.text || '').trim();
        essayProvenanceTracker.syncValue();
        editorSeedPromptId = msg.prompt_id;
        logUiEvent('reply_seeded_into_editor', { prompt_id: msg.prompt_id, words: countWords(essayEditor.value) });
        updateWordCount();
        saveState();
        essayEditor.focus();
    }

    function finishEssayBusy() {
        essayBusy = false;
        essayEditor.readOnly = workspaceLocked || timeExpired || isSubmitted;
        essayWorkingDiv.style.display = 'none';
        updateDoneButtonState();
    }

    // --- Done with this change (POST /api/session/{tok}/revision) ---
    async function handleDone() {
        if (essayBusy || workspaceLocked || timeExpired || isSubmitted) return;
        const text = essayEditor.value;
        const wc = countWords(text);
        const mw = minWords();
        hideInlineError(essayErrorDiv);

        if (wc < mw) {
            showInlineError(essayErrorDiv, `The statement has ${wc} words. It needs at least ${mw} words.`);
            return;
        }
        if (text.trim() === (lastVersionText || '').trim()) {
            showInlineError(essayErrorDiv, 'This text is the same as your last recorded version. Make a change before you click Done.');
            return;
        }

        const source = pendingSource;
        const body = { essay_text: text, source };
        if (editorSeedPromptId) body.prompt_id = editorSeedPromptId;

        const provenance = essayProvenanceTracker.buildSummary(text);
        logUiEvent('essay_input_provenance', Object.assign({ source }, provenance));
        logUiEvent('done_clicked', { source, words: wc, chars: text.length });

        essayBusy = true;
        essayEditor.readOnly = true;
        essayWorkingDiv.textContent = 'Saving this version...';
        essayWorkingDiv.style.display = 'block';
        updateDoneButtonState();

        try {
            const result = await apiPost(`/api/session/${sessionToken}/revision`, body);
            const version = recordVersion(result, source, text, editorSeedPromptId);
            pendingSource = 'manual';
            editorSeedPromptId = null;
            essayProvenanceTracker.reset();
            essayProvenanceTracker.syncValue();
            finishEssayBusy();
            updateWordCount();
            openRatingScreen(version, 'normal');
        } catch (error) {
            finishEssayBusy();
            logUiEvent('revision_failed', { code: error.code || null, status: error.status || null, message: error.message, source });
            if (error.code === 'time_cap') { handleTimeExpired('server'); return; }
            if (error.code === 'already_submitted') { recoverSubmitted(); return; }
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            if (error.code === 'too_short' || error.code === 'unchanged') {
                showInlineError(essayErrorDiv, error.message);
                return;
            }
            const msg = isNetworkError(error)
                ? 'We could not reach the server. Check your connection, then try again.'
                : `This version could not be saved. ${error.message}`;
            showInlineError(essayErrorDiv, msg, 'Try again', () => handleDone());
        }
    }

    doneButton.addEventListener('click', handleDone);

    // --- Start over: clears the editor; the next Done is source=regenerate ---
    startOverButton.addEventListener('click', () => {
        if (essayBusy || workspaceLocked || timeExpired || isSubmitted) return;
        const text = essayEditor.value;
        if (!text.trim()) return;
        const ok = window.confirm('Clear the editor and start over? Your last recorded version is kept on our side.');
        logUiEvent('start_over_clicked', { confirmed: ok, chars_cleared: ok ? text.length : 0, words_cleared: ok ? countWords(text) : 0 });
        if (!ok) return;
        essayEditor.value = '';
        essayProvenanceTracker.reset();
        essayProvenanceTracker.syncValue();
        pendingSource = 'regenerate';
        editorSeedPromptId = null;
        hideInlineError(essayErrorDiv);
        updateWordCount();
        saveState();
        essayEditor.focus();
    });

    function recordVersion(result, source, text, promptId) {
        const version = {
            version_id: result.version_id,
            seq: result.seq,
            word_count: result.word_count,
            source,
            prompt_id: promptId || null,
            text,
            detector: result.detector || null,
            created_at: Date.now()
        };
        versions.push(version);
        lastVersionId = version.version_id;
        lastVersionText = text;
        ratingPending = version;
        logUiEvent('version_recorded', {
            seq: version.seq, source, word_count: version.word_count,
            detector_shown: !!(result.detector && result.detector.pangram),
            minutes_since_workspace_open: workspaceOpenedAt ? (Date.now() - workspaceOpenedAt) / 60000 : null
        }, version.version_id);
        saveState();
        return version;
    }

    function lockWorkspace() {
        workspaceLocked = true;
        promptInput.disabled = true;
        sendPromptButton.disabled = true;
        essayEditor.readOnly = true;
        doneButton.disabled = true;
        startOverButton.disabled = true;
        document.querySelectorAll('.apply-button').forEach(b => { b.disabled = true; });
        timeUpBanner.style.display = 'block';
    }

    // --- Time cap ---
    let timeExpiredHandling = false;
    async function handleTimeExpired(trigger) {
        if (isSubmitted || noStatement) return;
        if (!timeExpired) {
            timeExpired = true;
            logUiEvent('time_cap_reached', { trigger, versions: versions.length, editor_words: countWords(essayEditor.value) });
        }
        stopWorkspaceTimer();
        countdownTimer.textContent = '00:00';
        timerDisplay.classList.add('warning');
        lockWorkspace();
        saveState();
        if (timeExpiredHandling) return;
        timeExpiredHandling = true;

        try {
            if (currentPhase === 'rating' && ratingContext) {
                switchRatingToTimeoutMode();
                return;
            }
            if (versions.length > 0) {
                openRatingScreen(versions[versions.length - 1], 'timeout');
                return;
            }
            // No recorded version yet: try to record the editor text so there is something to submit
            const text = essayEditor.value;
            if (text.trim() && countWords(text) >= minWords()) {
                try {
                    const result = await apiPost(`/api/session/${sessionToken}/revision`, { essay_text: text, source: pendingSource });
                    const version = recordVersion(result, pendingSource, text, editorSeedPromptId);
                    openRatingScreen(version, 'timeout');
                    return;
                } catch (error) {
                    logUiEvent('time_cap_autosave_failed', { code: error.code || null, message: error.message });
                    if (error.code === 'already_submitted') { recoverSubmitted(); return; }
                }
            }
            showNoStatementResult();
        } finally {
            timeExpiredHandling = false;
        }
    }

    // The server says the session is already submitted (e.g. after a refresh): fetch the final block
    async function recoverSubmitted() {
        logUiEvent('recover_submitted');
        try {
            const result = await apiPost(`/api/session/${sessionToken}/submit`, { version_id: lastVersionId || 'unknown', censored: !!timeExpired });
            finalResult = result.final;
            isSubmitted = true;
            ratingPending = null;
            stopWorkspaceTimer();
            saveState();
            showResult();
        } catch (error) {
            showBlockingModal('Already submitted', 'Your statement was already submitted. Click Continue to go on to the final questions.', 'Continue', () => {
                isSubmitted = true;
                ratingPending = null;
                finalResult = finalResult || { pangram_label: null, passed: null, bonus_awarded: null, bonus_usd: startData.bonus_usd, unavailable: true };
                saveState();
                showResult();
            });
        }
    }

    // =====================================================================================
    // Rating screen (POST /api/session/{tok}/rate, then /submit)
    // =====================================================================================
    function openRatingScreen(version, mode) {
        ratingContext = {
            version,
            mode: mode || 'normal',
            openedAt: Date.now(),
            sliderLog: [],
            touched: { human: false, detector: false },
            rated: false
        };
        ratingPending = version;
        ratingBusy = false;

        // Reset both sliders to 50 with a hidden thumb (no anchoring on the previous version)
        [sliderHuman, sliderDetector].forEach(s => { s.value = 50; s.disabled = false; s.classList.add('pristine'); });
        sliderHumanValue.textContent = '–';
        sliderDetectorValue.textContent = '–';
        hideInlineError(ratingErrorDiv);
        ratingLoadingDiv.style.display = 'none';

        ratingHeading.textContent = `Rate version ${Number(version.seq) + 1}`;
        ratingVersionInfo.textContent = `Version ${Number(version.seq) + 1} · ${version.word_count} words · ${describeSource(version.source)}`;
        ratingEssayPreview.textContent = version.text || '';

        renderDetectorPanel(version);

        keepEditingButton.style.display = ratingContext.mode === 'timeout' ? 'none' : 'inline-block';
        timeoutNotice.style.display = ratingContext.mode === 'timeout' ? 'block' : 'none';
        submitFinalButton.textContent = ratingContext.mode === 'timeout' ? 'Submit my final statement' : 'Submit as my final statement';
        ratingHint.textContent = 'Move both sliders to continue.';
        updateRatingButtons();

        logUiEvent('rating_screen_opened', { seq: version.seq, mode: ratingContext.mode, detector_shown: detectorPanel.style.display !== 'none' }, version.version_id);
        showMainPhase('rating');
        if (ratingContext.mode === 'timeout') armTimeoutBackstop();
    }

    function describeSource(source) {
        if (source === 'llm_apply') return 'assistant reply used as-is';
        if (source === 'regenerate') return 'written after starting over';
        return 'edited by you';
    }

    // Pangram verdict panel: label + passed / not yet. Never shows the raw score.
    function renderDetectorPanel(version) {
        const shown = !!(startData && startData.condition_feedback && version.detector && version.detector.pangram);
        detectorPanel.className = 'detector-panel';
        if (!shown) {
            detectorPanel.style.display = 'none';
            return;
        }
        const p = version.detector.pangram;
        if (p.unavailable || (p.label === null && p.passed === null)) {
            detectorPanel.classList.add('unavailable');
            detectorLabelEl.textContent = 'Verdict unavailable';
            detectorPassEl.textContent = 'The detector could not score this version. You can keep editing or submit.';
        } else {
            detectorLabelEl.textContent = humanizeVerdict(p.label);
            const passed = p.passed === true;
            detectorPanel.classList.add(passed ? 'pass' : 'fail');
            detectorPassEl.textContent = passed ? 'Passed' : 'Not yet';
        }
        detectorPanel.style.display = 'block';
    }

    function humanizeVerdict(label) {
        const l = String(label || '').trim().toLowerCase();
        if (!l) return 'No verdict';
        if (l === 'human' || l.includes('human')) return 'More likely written by a human';
        if (l === 'ai' || l.includes('ai')) return 'More likely written by an AI';
        return `Verdict: ${label}`;
    }

    function updateRatingButtons() {
        if (!ratingContext) return;
        const both = ratingContext.touched.human && ratingContext.touched.detector;
        const ready = !ratingBusy && (both || ratingContext.mode === 'timeout');
        keepEditingButton.disabled = !ready || ratingContext.mode === 'timeout';
        submitFinalButton.disabled = !ready;
        ratingHint.style.display = both ? 'none' : 'block';
    }

    // Slider interaction logging: first touch, moves, submit (ms from screen open)
    function attachSliderLogging(slider, valueSpan, key) {
        const onFirstTouch = () => {
            if (!ratingContext) return;
            slider.classList.remove('pristine');
            valueSpan.textContent = slider.value;
            if (!ratingContext.touched[key]) {
                ratingContext.touched[key] = true;
                ratingContext.sliderLog.push({
                    slider: key,
                    event: 'slider_first_touch',
                    t_ms: Date.now() - ratingContext.openedAt,
                    value: parseFloat(slider.value)
                });
                updateRatingButtons();
            }
        };
        slider.addEventListener('mousedown', onFirstTouch);
        slider.addEventListener('touchstart', onFirstTouch, { passive: true });
        slider.addEventListener('keydown', onFirstTouch);
        slider.addEventListener('input', () => {
            if (!ratingContext) return;
            onFirstTouch();
            ratingContext.sliderLog.push({
                slider: key,
                event: 'slider_move',
                t_ms: Date.now() - ratingContext.openedAt,
                value: parseInt(slider.value, 10)
            });
            valueSpan.textContent = slider.value;
        });
    }
    attachSliderLogging(sliderHuman, sliderHumanValue, 'human');
    attachSliderLogging(sliderDetector, sliderDetectorValue, 'detector');

    keepEditingButton.addEventListener('click', () => submitRating('continue'));
    submitFinalButton.addEventListener('click', () => submitRating(ratingContext && ratingContext.mode === 'timeout' ? 'timeout' : 'submit'));

    function switchRatingToTimeoutMode() {
        if (!ratingContext) return;
        ratingContext.mode = 'timeout';
        keepEditingButton.style.display = 'none';
        timeoutNotice.style.display = 'block';
        submitFinalButton.textContent = 'Submit my final statement';
        updateRatingButtons();
        logUiEvent('rating_switched_to_timeout', {}, ratingContext.version.version_id);
        armTimeoutBackstop();
    }

    // Timeout mode never strands anyone: after 90 s without input, the rating is submitted as is
    function armTimeoutBackstop() {
        startScreenTimer(RATING_TIMEOUT_BACKSTOP_MS, 'rating_timeout_backstop', () => {
            if (ratingContext && !ratingBusy && !isSubmitted) {
                logUiEvent('rating_auto_submitted_after_timeout', { human_touched: ratingContext.touched.human, detector_touched: ratingContext.touched.detector }, ratingContext.version.version_id);
                submitRating('timeout');
            }
        }, true);
    }

    async function submitRating(decision) {
        if (!ratingContext || ratingBusy || !sessionToken) return;
        const ctx = ratingContext;
        const both = ctx.touched.human && ctx.touched.detector;
        if (!both && ctx.mode !== 'timeout') {
            showInlineError(ratingErrorDiv, 'Please move both sliders before you continue.');
            return;
        }
        clearScreenTimer();
        hideInlineError(ratingErrorDiv);
        ratingBusy = true;
        updateRatingButtons();
        ratingLoadingDiv.textContent = decision === 'continue' ? 'Saving your ratings...' : 'Saving your ratings and submitting...';
        ratingLoadingDiv.style.display = 'block';
        sliderHuman.disabled = true;
        sliderDetector.disabled = true;

        const confHuman = parseInt(sliderHuman.value, 10);
        const confDetector = parseInt(sliderDetector.value, 10);
        const tSubmit = Date.now() - ctx.openedAt;

        if (!ctx.rated) {
            ctx.sliderLog.push({ slider: 'human', event: 'slider_submit', t_ms: tSubmit, value: confHuman });
            ctx.sliderLog.push({ slider: 'detector', event: 'slider_submit', t_ms: tSubmit, value: confDetector });
            const payload = {
                version_id: ctx.version.version_id,
                conf_human: confHuman,
                conf_detector: confDetector,
                decision,
                seconds_on_screen: tSubmit / 1000,
                slider_log: {
                    events: ctx.sliderLog,
                    human_touched: ctx.touched.human,
                    detector_touched: ctx.touched.detector,
                    mode: ctx.mode,
                    cumulative_tab_hidden_ms: cumulativeTabHiddenMs
                }
            };
            try {
                await apiPost(`/api/session/${sessionToken}/rate`, payload);
                ctx.rated = true;
                logUiEvent('rating_submitted', { decision, conf_human: confHuman, conf_detector: confDetector, seconds_on_screen: tSubmit / 1000 }, ctx.version.version_id);
            } catch (error) {
                logUiEvent('rating_post_failed', { decision, code: error.code || null, status: error.status || null, message: error.message }, ctx.version.version_id);
                if (error.code === 'unknown_session') { handleUnknownSession(); return; }
                ratingBusy = false;
                ratingLoadingDiv.style.display = 'none';
                sliderHuman.disabled = false;
                sliderDetector.disabled = false;
                updateRatingButtons();
                const msg = isNetworkError(error)
                    ? 'We could not reach the server. Check your connection, then try again.'
                    : `Your ratings could not be saved. ${error.message}`;
                showInlineError(ratingErrorDiv, msg, 'Try again', () => submitRating(decision));
                if (ctx.mode === 'timeout') armTimeoutBackstop();
                return;
            }
        }

        if (decision === 'continue') {
            ratingContext = null;
            ratingPending = null;
            ratingBusy = false;
            ratingLoadingDiv.style.display = 'none';
            saveState();
            if (timeExpired) {
                // Time ran out while they were rating: this version is now the final one
                openRatingScreen(ctx.version, 'timeout');
                return;
            }
            openWorkspace(false);
            return;
        }

        await doFinalSubmit(ctx.version.version_id, decision === 'timeout');
    }

    async function doFinalSubmit(versionId, censored) {
        ratingLoadingDiv.textContent = 'Submitting your statement and getting the final verdict...';
        ratingLoadingDiv.style.display = 'block';
        try {
            const result = await apiPost(`/api/session/${sessionToken}/submit`, { version_id: versionId, censored: !!censored });
            finalResult = result.final;
            isSubmitted = true;
            ratingContext = null;
            ratingPending = null;
            ratingBusy = false;
            stopWorkspaceTimer();
            logUiEvent('final_submitted', { censored: !!censored, passed: finalResult ? finalResult.passed : null, bonus_awarded: finalResult ? finalResult.bonus_awarded : null }, versionId);
            saveState();
            showResult();
        } catch (error) {
            logUiEvent('submit_post_failed', { code: error.code || null, status: error.status || null, message: error.message }, versionId);
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            ratingLoadingDiv.style.display = 'none';
            const msg = isNetworkError(error)
                ? 'Your ratings were saved, but we could not reach the server to submit the statement. Check your connection, then try again.'
                : `Your ratings were saved, but the statement could not be submitted. ${error.message}`;
            showInlineError(ratingErrorDiv, msg, 'Submit again', () => doFinalSubmit(versionId, censored));
        }
    }

    // =====================================================================================
    // Result page
    // =====================================================================================
    function showResult() {
        const f = finalResult || {};
        const bonus = Number((f.bonus_usd !== undefined && f.bonus_usd !== null) ? f.bonus_usd : (startData.bonus_usd || 0));
        resultVerdict.className = '';
        resultPassed.className = '';

        if (f.unavailable) {
            resultVerdict.textContent = 'Your statement was submitted.';
            resultPassed.textContent = 'We could not load the final verdict right now. The research team will review it.';
            resultBonus.textContent = bonus > 0 ? `Your bonus rule was a ${formatMoney(bonus)} bonus if the statement is rated more likely human than AI.` : 'This task had no bonus.';
        } else if (f.scoring_unavailable || (f.pangram_label === null && f.passed === null)) {
            resultVerdict.textContent = 'Your statement was submitted, but the detector could not score it right now.';
            resultPassed.textContent = 'The research team will score it and review any bonus you are owed.';
            resultBonus.textContent = bonus > 0 ? `Your bonus rule was a ${formatMoney(bonus)} bonus if the statement is rated more likely human than AI.` : 'This task had no bonus.';
        } else {
            const passed = f.passed === true;
            resultVerdict.textContent = f.pangram_label
                ? `The detector's verdict on your final statement: ${humanizeVerdict(f.pangram_label)}.`
                : `The detector's verdict on your final statement: ${passed ? 'passed' : 'did not pass'}.`;
            resultPassed.textContent = passed ? 'Your statement passed.' : 'Your statement did not pass.';
            resultPassed.className = passed ? 'verdict-pass' : 'verdict-fail';
            if (bonus > 0) {
                resultBonus.textContent = f.bonus_awarded
                    ? `You earned the ${formatMoney(bonus)} bonus. It will be paid through Prolific after the study closes.`
                    : `You did not earn the ${formatMoney(bonus)} bonus.`;
            } else {
                resultBonus.textContent = 'This task had no bonus.';
            }
        }
        resultNote.textContent = f.already_submitted ? 'This statement had already been submitted earlier.' : '';
        showMainPhase('result');
    }

    // Time ran out and there was no statement of at least min_words to record
    function showNoStatementResult() {
        noStatement = true;
        stopWorkspaceTimer();
        logUiEvent('no_statement_at_time_cap', { editor_words: countWords(essayEditor.value) });
        resultVerdict.className = '';
        resultPassed.className = 'verdict-fail';
        resultVerdict.textContent = 'Time is up.';
        resultPassed.textContent = `No statement of at least ${minWords()} words was recorded, so there is nothing for the detector to score.`;
        resultBonus.textContent = Number(startData.bonus_usd || 0) > 0 ? 'No bonus was earned.' : 'This task had no bonus.';
        resultNote.textContent = 'Please continue to the final questions.';
        saveState();
        showMainPhase('result');
    }

    resultContinueButton.addEventListener('click', () => {
        resultAcknowledged = true;
        logUiEvent('result_continue_clicked');
        saveState();
        showMainPhase('post_survey');
    });

    // =====================================================================================
    // Post-task questions (POST /api/session/{tok}/post_survey)
    // =====================================================================================
    postSurveyForm.setAttribute('novalidate', 'novalidate');
    postSurveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        logUiEvent('post_survey_submitted');
        clearFormError(postSurveyForm);

        const whatChanged = postWhatChanged.value.trim();
        const mostHelpful = postMostHelpful.value.trim();
        const formData = new FormData(postSurveyForm);
        const mattered = formData.get('manip_mattered');
        const recalledBonus = postRecalledBonus.value.trim();
        const recalledPurpose = postRecalledPurpose.value.trim();

        if (!whatChanged) { showFormError(postSurveyForm, 'Please tell us what you changed and why.', postWhatChanged); return; }
        if (!mostHelpful) { showFormError(postSurveyForm, 'Please tell us which edits helped most.', postMostHelpful); return; }
        if (!mattered) { showFormError(postSurveyForm, 'Please answer the highlighted rating question.', likertGroupEl(postSurveyForm, 'manip_mattered')); return; }
        if (!recalledBonus) { showFormError(postSurveyForm, 'Please write your bonus amount, or "none".', postRecalledBonus); return; }
        if (!recalledPurpose) { showFormError(postSurveyForm, 'Please write the stated purpose of the statement.', postRecalledPurpose); return; }

        logUiEvent('post_survey_input_provenance', { what_changed: postWhatChangedTracker.buildSummary(whatChanged), most_helpful: postMostHelpfulTracker.buildSummary(mostHelpful) });

        setFormControlsDisabled(postSurveyForm, true);
        postSurveyLoadingDiv.style.display = 'block';
        try {
            await apiPost(`/api/session/${sessionToken}/post_survey`, {
                what_changed_text: whatChanged,
                most_helpful_text: mostHelpful,
                checklist: {},
                manip_mattered_1to7: parseInt(mattered, 10),
                manip_recalled_bonus: recalledBonus,
                manip_recalled_purpose: recalledPurpose
            });
            postSurveyDone = true;
            saveState();
            postSurveyLoadingDiv.style.display = 'none';
            showMainPhase('demographics');
        } catch (error) {
            postSurveyLoadingDiv.style.display = 'none';
            setFormControlsDisabled(postSurveyForm, false);
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            showFormError(postSurveyForm, 'We could not save your answers. Please click Continue again.', null);
            logUiEvent('post_survey_post_failed', { message: error.message });
        }
    });

    // =====================================================================================
    // Demographics (POST /api/session/{tok}/demographics {answers})
    // =====================================================================================
    // Native validation on this form tries to focus REQUIRED-but-hidden likert inputs, which Chrome
    // cannot focus. Bypass native validation; the handler validates and points at the missed question.
    demographicsForm.setAttribute('novalidate', 'novalidate');

    demographicsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        logUiEvent('demographics_form_submitted');
        clearFormError(demographicsForm);

        const formData = new FormData(demographicsForm);

        // Validate required Likert bubbles first, pointing at the exact missed group
        const requiredLikerts = ['ai_writing_frequency', 'detector_familiarity', 'writing_frequency', 'ai_capabilities_rating', 'trust_in_ai'];
        for (const field of requiredLikerts) {
            if (!formData.get(field)) {
                showFormError(demographicsForm, 'Please answer the highlighted rating question.', likertGroupEl(demographicsForm, field));
                return;
            }
        }

        // Validate everything else (selects, numbers) without native focus-hidden bugs
        if (!demographicsForm.checkValidity()) {
            const inv = demographicsForm.querySelector(':invalid');
            let anchor = inv;
            if (inv && inv.offsetParent === null) {
                anchor = likertGroupEl(demographicsForm, inv.name);
            }
            showFormError(demographicsForm, 'Please answer the highlighted question.', anchor);
            return;
        }

        const ai_usage_frequency_val = formData.get('ai_usage_frequency');
        if (!ai_usage_frequency_val) {
            showFormError(demographicsForm, 'Please select your AI usage frequency.', demographicsForm.querySelector('[name="ai_usage_frequency"]'));
            return;
        }
        const ai_models_used_vals = formData.getAll('ai_models_used');
        if (ai_usage_frequency_val !== '0' && ai_models_used_vals.length === 0) {
            showFormError(demographicsForm, 'Since you use AI chatbots, please select at least one model you have used.', demographicsForm.querySelector('[name="ai_models_used"]').closest('.checkbox-group'));
            return;
        }
        if (ai_usage_frequency_val === '0' && ai_models_used_vals.length > 0) {
            showFormError(demographicsForm, "You selected 'Never' for AI usage, but also selected specific models. Please correct your selection.", demographicsForm.querySelector('[name="ai_models_used"]').closest('.checkbox-group'));
            return;
        }

        const ageStr = formData.get('age');
        const ageNum = parseInt(ageStr, 10);
        if (!ageStr || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
            showFormError(demographicsForm, 'Please enter a valid age (18-100).', demographicsForm.querySelector('[name="age"]'));
            return;
        }
        const ethnicityVals = formData.getAll('ethnicity');
        if (ethnicityVals.length === 0) {
            showFormError(demographicsForm, 'Please select at least one ethnicity option.', demographicsForm.querySelector('[name="ethnicity"]').closest('.checkbox-group'));
            return;
        }
        const socialMediaVals = formData.getAll('social_media');
        if (socialMediaVals.length === 0) {
            showFormError(demographicsForm, "Please select at least one social media platform option (or 'None').", demographicsForm.querySelector('[name="social_media"]').closest('.checkbox-group'));
            return;
        }
        if (socialMediaVals.includes('none') && socialMediaVals.length > 1) {
            showFormError(demographicsForm, "If you select 'None', please don't select other platforms.", demographicsForm.querySelector('[name="social_media"]').closest('.checkbox-group'));
            return;
        }

        const answers = {
            ai_usage_frequency: parseInt(ai_usage_frequency_val, 10),
            ai_models_used: ai_models_used_vals,
            ai_writing_frequency: parseInt(formData.get('ai_writing_frequency'), 10),
            detector_familiarity: parseInt(formData.get('detector_familiarity'), 10),
            writing_frequency: parseInt(formData.get('writing_frequency'), 10),
            ai_capabilities_rating: parseInt(formData.get('ai_capabilities_rating'), 10),
            trust_in_ai: parseInt(formData.get('trust_in_ai'), 10),
            age: ageNum,
            gender: formData.get('gender'),
            education: formData.get('education'),
            english_first_language: formData.get('english_first_language'),
            ethnicity: ethnicityVals,
            income: formData.get('income'),
            political_affiliation: formData.get('political_affiliation'),
            social_media_platforms: socialMediaVals,
            internet_usage_per_week: parseInt(formData.get('internet_usage_per_week'), 10)
        };

        setFormControlsDisabled(demographicsForm, true);
        demographicsLoadingDiv.style.display = 'flex';
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = '60%';

        try {
            await apiPost(`/api/session/${sessionToken}/demographics`, { answers });
            if (progressBar) progressBar.style.width = '100%';
            demographicsDone = true;
            saveState();
            demographicsLoadingDiv.style.display = 'none';
            showFinalPage();
        } catch (error) {
            demographicsLoadingDiv.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
            setFormControlsDisabled(demographicsForm, false);
            if (error.code === 'unknown_session') { handleUnknownSession(); return; }
            showFormError(demographicsForm, 'We could not save your answers. Please click Submit again.', null);
            logUiEvent('demographics_post_failed', { message: error.message });
        }
    });

    // =====================================================================================
    // Final page: debrief + GET /api/session/{tok}/complete + redirect to Prolific
    // =====================================================================================

    // Tell the server the workspace is on screen so its time-cap clock matches the page timer.
    let workspaceOpenSent = false;
    function notifyWorkspaceOpen() {
        if (workspaceOpenSent || !sessionToken) return;
        workspaceOpenSent = true;
        apiPost(`/api/session/${sessionToken}/workspace_open`, {})
            .catch(err => { workspaceOpenSent = false; logUiEvent('workspace_open_failed', { message: err && err.message }); });
    }
    function showFinalPage() {
        showMainPhase('final');
        timerDisplay.style.display = 'none';
        if (completionCode) {
            renderCompletionCode(completionCode);
        } else {
            fetchCompletionCode();
        }
    }

    async function fetchCompletionCode() {
        completionStatus.textContent = 'Getting your completion code...';
        completionStatus.style.display = 'block';
        hideInlineError(completionErrorDiv);
        completeRetryButton.style.display = 'none';
        finishButton.disabled = true;

        try {
            const result = await apiGet(`/api/session/${sessionToken}/complete`);
            const code = (result && !isPlaceholderCode(result.completion_code)) ? result.completion_code : PROLIFIC_COMPLETION_CODE;
            completionCode = code;
            logUiEvent('completion_code_received', { from_server: !!(result && !isPlaceholderCode(result.completion_code)) });
            saveState();
            renderCompletionCode(code);
        } catch (error) {
            logUiEvent('complete_get_failed', { code: error.code || null, status: error.status || null, message: error.message });
            if (error.code === 'not_submitted') {
                // Nothing was submitted (time ran out with no statement). Ask the backend to close the
                // session as a no-statement completion, then fetch the real code; fall back if refused.
                try {
                    await apiPost(`/api/session/${sessionToken}/submit`, { version_id: null, censored: true });
                    logUiEvent('no_statement_submit_ok', {});
                    return fetchCompletionCode();
                } catch (e2) {
                    logUiEvent('no_statement_submit_failed', { code: e2.code || null, message: e2.message });
                }
                completionCode = PROLIFIC_NO_STATEMENT_CODE;
                completionStatus.textContent = 'Your answers were saved. Because no statement was submitted, the study could not be completed in the usual way.';
                showInlineError(completionErrorDiv, 'Please return to Prolific with the button below and message the researcher if you have questions.');
                renderCompletionCode(completionCode, true);
                return;
            }
            completionStatus.textContent = 'We could not get your completion code.';
            const msg = isNetworkError(error)
                ? 'The server could not be reached. Check your connection, then try again.'
                : `${error.message}`;
            showInlineError(completionErrorDiv, msg);
            completeRetryButton.style.display = 'inline-block';
            // After the first failure, still let them leave with the frontend code
            finishButton.disabled = false;
            completionCode = completionCode || PROLIFIC_COMPLETION_CODE;
        }
    }

    function renderCompletionCode(code, keepStatus) {
        if (!keepStatus) completionStatus.textContent = 'Your answers were saved. Thank you.';
        completionCodeEl.textContent = code;
        completionCodeText.style.display = 'block';
        completeRetryButton.style.display = 'none';
        finishButton.disabled = false;
        if (!isProduction) {
            devNotice.style.display = 'block';
            devNotice.textContent = `DEV MODE: Finish would redirect to ${PROLIFIC_COMPLETE_BASE}${code}`;
        }
    }

    completeRetryButton.addEventListener('click', () => {
        logUiEvent('complete_retry_clicked');
        fetchCompletionCode();
    });

    downloadDebriefButton.addEventListener('click', () => {
        logUiEvent('debrief_download_clicked');
        const debriefText = `
STUDY DEBRIEF FORM
Date: ${new Date().toLocaleString()}
Prolific ID: ${prolificPid || 'N/A'}

Thank you for participating in our research study. Here is a short summary of what it was about.

Purpose of the Research
This study examines how people revise AI-assisted writing when it needs to pass as human-written, and when they decide that the writing is good enough to stop. We record each version of the statement, the detector's verdict on it, your two ratings, and your decision to keep editing or to submit.

What Varied Between Participants
Participants were randomly assigned to different stated purposes for the statement and different bonus amounts. Some participants saw the detector's verdict after every change; others saw it only at the end. The assigned writing assistant also varied. Everyone wrote the same kind of statement.

The stated purpose was a scenario for the writing task. Your statement was not sent to any employer, committee, or blog. It was scored only by AI-detection services for this study.

Your Bonus
If you were offered a bonus and earned it, it will be paid through Prolific after the study closes.

Questions or Concerns
If you have any questions about this research, please contact the Principal Investigator, Nykko Vitali, at nvitali@fas.harvard.edu. If you have any concerns about your rights as a research participant, you may contact cuhs@harvard.edu.

Use of Your Data
If you are comfortable with us using your responses, you do not need to do anything. If you would prefer that we not use your responses, please contact the Principal Investigator and we will remove your data from the study and delete it.

Thank you again for your participation!
        `;
        generateAndDownloadPdf(debriefText, `Debrief_Form_${sessionToken || 'participant'}.pdf`);
    });

    finishButton.addEventListener('click', () => {
        const code = completionCode || PROLIFIC_COMPLETION_CODE;
        logUiEvent('finish_clicked', { code });
        clearState();
        redirectToProlific(code, 'completion');
    });

    // =====================================================================================
    // Leave-page warning while writing (production only; no abandon redirect in this study)
    // =====================================================================================
    let handleEarlyExit = null;
    let earlyExitAttached = false;

    if (isProduction) {
        handleEarlyExit = (event) => {
            if (isIntentionalRedirect) return;
            if (currentPhase !== 'workspace' && currentPhase !== 'rating') return;
            logUiEvent('navigation_warning_shown', { versions: versions.length });
            event.preventDefault();
            event.returnValue = ''; // Required for Chrome
            return '';
        };
    }

    function attachEarlyExitWarning() {
        if (isProduction && handleEarlyExit && !earlyExitAttached) {
            window.addEventListener('beforeunload', handleEarlyExit);
            earlyExitAttached = true;
        }
    }

    // =====================================================================================
    // Global tracking listeners (tab visibility, focus, paste/copy, page lifecycle)
    // =====================================================================================
    function markPageInactiveStart() {
        if (!pageInactiveStartTime) {
            pageInactiveStartTime = Date.now();
        }
    }

    function markPageInactiveEnd() {
        if (!pageInactiveStartTime) return null;
        lastPageInactivityDurationMs = Date.now() - pageInactiveStartTime;
        lastPageInactivityEndedAt = Date.now();
        pageInactiveStartTime = null;
        return lastPageInactivityDurationMs;
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabHiddenStartTime = Date.now();
            markPageInactiveStart();
            logSuspiciousEvent('tab_hidden', { versions: versions.length });
            flushTelemetry(true);
            saveState();
        } else {
            markPageInactiveEnd();
            if (tabHiddenStartTime) {
                const hiddenDuration = Date.now() - tabHiddenStartTime;
                cumulativeTabHiddenMs += hiddenDuration;
                logSuspiciousEvent('tab_visible', {
                    hidden_duration_ms: hiddenDuration,
                    cumulative_hidden_ms: cumulativeTabHiddenMs
                });
                tabHiddenStartTime = null;
            }
            // Catch up the countdown after a background tab throttled the interval
            if (workspaceOpenedAt && !isSubmitted) timerTick();
        }
    });

    window.addEventListener('blur', () => {
        markPageInactiveStart();
        logSuspiciousEvent('window_blur', {});
    });

    window.addEventListener('focus', () => {
        const inactiveDuration = markPageInactiveEnd();
        logSuspiciousEvent('window_focus', { inactive_duration_ms: inactiveDuration });
    });

    document.addEventListener('paste', (event) => {
        const pastedText = event.clipboardData ? event.clipboardData.getData('text') : '';
        logUntrustedInputEvent(event, 'document');
        logSuspiciousEvent('paste', {
            target: describeEventTarget(event.target),
            pasted_char_count: pastedText.length,
            pasted_word_count: countWords(pastedText),
            pasted_text: pastedText.slice(0, 2000),
            is_trusted: event.isTrusted
        });
    }, true);

    document.addEventListener('copy', (event) => {
        const selectionText = window.getSelection ? String(window.getSelection()) : '';
        logUntrustedInputEvent(event, 'document');
        logSuspiciousEvent('copy', {
            target: describeEventTarget(event.target),
            selected_char_count: selectionText.length,
            selected_word_count: countWords(selectionText),
            is_trusted: event.isTrusted
        });
    }, true);

    document.addEventListener('drop', (event) => {
        logSuspiciousEvent('document_drop', {
            target: describeEventTarget(event.target),
            is_trusted: event.isTrusted
        });
    }, true);

    document.addEventListener('contextmenu', (event) => {
        logUntrustedInputEvent(event, 'document');
        logSuspiciousEvent('contextmenu', {
            target: describeEventTarget(event.target),
            is_trusted: event.isTrusted
        });
    }, true);

    let selectionLogTimeout = null;
    document.addEventListener('selectionchange', () => {
        if (!suspiciousBehaviorTrackingEnabled || selectionLogTimeout) return;
        selectionLogTimeout = setTimeout(() => {
            selectionLogTimeout = null;
            const selectionText = window.getSelection ? String(window.getSelection()) : '';
            if (!selectionText || selectionText.length < 8) return;
            logSuspiciousEvent('text_selection', {
                selected_char_count: selectionText.length,
                selected_word_count: countWords(selectionText)
            });
        }, 750);
    });

    window.addEventListener('pagehide', () => {
        logSuspiciousEvent('pagehide', { versions: versions.length });
        saveState();
        flushTelemetry(true);
    });

    window.addEventListener('pageshow', (event) => {
        const inactiveDuration = markPageInactiveEnd();
        logSuspiciousEvent('page_lifecycle_pageshow', { persisted: event.persisted, inactive_duration_ms: inactiveDuration });
    });

    document.addEventListener('freeze', () => {
        markPageInactiveStart();
        logSuspiciousEvent('page_lifecycle_freeze', {});
        flushTelemetry(true);
    });

    document.addEventListener('resume', () => {
        const inactiveDuration = markPageInactiveEnd();
        logSuspiciousEvent('page_lifecycle_resume', { inactive_duration_ms: inactiveDuration });
    });

    window.addEventListener('beforeunload', () => {
        if (isIntentionalRedirect) return;
        logSuspiciousEvent('page_lifecycle_beforeunload', { versions: versions.length });
        saveState();
        flushTelemetry(true);
    });

    // Client-side errors go to telemetry so the researcher can see them; the participant never does.
    window.addEventListener('error', (event) => {
        try {
            logUiEvent('js_error', {
                message: String(event.message || '').slice(0, 500),
                source: String(event.filename || '').slice(0, 200),
                line: event.lineno || null,
                col: event.colno || null
            });
        } catch (e) { /* ignore */ }
    });
    window.addEventListener('unhandledrejection', (event) => {
        try {
            const reason = event.reason;
            logUiEvent('js_unhandled_rejection', {
                message: String(reason && reason.message ? reason.message : reason).slice(0, 500)
            });
        } catch (e) { /* ignore */ }
    });

    // =====================================================================================
    // Init: resume a saved session or start a new one
    // =====================================================================================
    logUiEvent('page_load', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || null,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        screenWidth: screen.width,
        screenHeight: screen.height,
        has_prolific_pid: !!prolificPid
    });

    (() => {
        const saved = loadState();
        const fresh = saved && saved.savedAt && (Date.now() - saved.savedAt) < RESUME_WINDOW_MS;
        const samePerson = saved && ((saved.prolificPid || null) === (prolificPid || null));
        if (saved && fresh && samePerson) {
            resumeSession(saved);
        } else {
            clearState();
            startSession();
        }
    })();

});
