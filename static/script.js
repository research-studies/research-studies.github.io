// FILE: static/script.js
// This is the corrected version with error handling improvements.
// All console statements removed to prevent participant contamination.
document.addEventListener('DOMContentLoaded', () => {
    const initialSetupDiv = document.getElementById('initial-setup');
    const chatInterfaceDiv = document.getElementById('chat-interface'); // Main div for chat + assessment
    const assessmentAreaDiv = document.getElementById('assessment-area'); // Now inside chatInterfaceDiv
    const finalPageDiv = document.getElementById('final-page');
    const errorMessageArea = document.getElementById('error-message-area');
    const instructionsPhaseDiv = document.getElementById('instructions-phase');
    const confirmInstructionsButton = document.getElementById('confirm-instructions-button');
    const demographicsModal = document.getElementById('demographics-modal');
    const modalContinueButton = document.getElementById('modal-continue-button');

    const finalInstructionsModal = document.getElementById('final-instructions-modal');
    const finalInstructionsButton = document.getElementById('final-instructions-button');

    // State flags for the new parallel logic
    let isBackendReady = false;
    let isUserReady = false;

    const initialForm = document.getElementById('initial-form');
    const initLoadingDiv = document.getElementById('init-loading');

    const messageList = document.getElementById('message-list');
    const userMessageInput = document.getElementById('user-message-input');
    const sendMessageButton = document.getElementById('send-message-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const aiRetryBanner = document.getElementById('ai-retry-banner'); // Banner shown during API retries (AI mode only)
    const chatInputContainer = document.getElementById('chat-input-container'); // Div containing text input and send button

    const confidenceSlider = document.getElementById('confidence-slider');
    const confidenceValueSpan = document.getElementById('confidence-value');
    const submitRatingButton = document.getElementById('submit-rating-button');
    const ratingLoadingDiv = document.getElementById('rating-loading');

    const feelsOffCheckbox = document.getElementById('feels-off-checkbox');
    const commentInputArea = document.getElementById('comment-input-area');
    const feelsOffCommentTextarea = document.getElementById('feels-off-comment');
    const submitCommentButton = document.getElementById('submit-comment-button');
    const commentLoadingDiv = document.getElementById('comment-loading');

    const finalDecisionText = document.getElementById('final-decision-text');
    const finalDecisionTimeText = document.getElementById('final-decision-time-text');
    const confidenceTrendData = document.getElementById('confidence-trend-data');
    const newSessionButton = document.getElementById('new-session-button');
    const loadResearcherDataButton = document.getElementById('load-researcher-data-button');
    const researcherDataContent = document.getElementById('researcher-data-content');
    const researcherDataSection = document.getElementById('researcher-data-section');

    const consentPhaseDiv = document.getElementById('consent-phase');
    const consentContentInterrogatorDiv = document.getElementById('consent-content-interrogator'); // NEW: Interrogator consent
    const consentContentWitnessDiv = document.getElementById('consent-content-witness'); // NEW: Witness consent
    const consentActionsDiv = document.getElementById('consent-actions');
    const consentDownloadPromptDiv = document.getElementById('consent-download-prompt');
    const agreeButton = document.getElementById('agree-button');
    const disagreeButton = document.getElementById('disagree-button');
    const downloadConsentButton = document.getElementById('download-consent-button');
    const skipConsentDownloadButton = document.getElementById('skip-consent-download-button');
    
    // NEW: Debrief and Summary Phase Elements
    const debriefPhaseDiv = document.getElementById('debrief-phase');
    const summaryPhaseDiv = document.getElementById('summary-phase');
    const downloadDebriefButton = document.getElementById('download-debrief-button');
    const continueAfterDebriefButton = document.getElementById('continue-after-debrief-button');

    const feedbackPhaseDiv = document.getElementById('feedback-phase');
    const submitFeedbackButton = document.getElementById('submit-feedback-button');
    // const skipFeedbackButton = document.getElementById('skip-feedback-button'); // REMOVED: Feedback is now mandatory
    const feedbackTextarea = document.getElementById('feedback-textarea');
    const mainContainer = document.querySelector('.container'); // For the disagree message

    // NEW: Human witness mode elements
    const roleAssignmentPhaseDiv = document.getElementById('role-assignment-phase');
    const waitingRoomPhaseDiv = document.getElementById('waiting-room-phase');
    const assignedRoleTitleSpan = document.getElementById('assigned-role-title');
    const enterWaitingRoomButton = document.getElementById('enter-waiting-room-button');

    // Pre-demographics instruction elements (paginated)
    const instructionPages = document.querySelectorAll('.instruction-page');
    const instructionPrevBtn = document.getElementById('instruction-prev-btn');
    const instructionNextBtn = document.getElementById('instruction-next-btn');
    const instructionPageIndicator = document.getElementById('instruction-page-indicator');
    const preDemoStyleNameSpan = document.getElementById('pre-demo-style-name');
    const preDemoStyleDescriptionSpan = document.getElementById('pre-demo-style-description');
    const preDemoStyleNameRepeatSpans = document.querySelectorAll('.pre-demo-style-name-repeat');
    let currentInstructionPage = 1;
    const totalInstructionPages = 3;

    // Post-demographics instruction elements (paginated)
    const postDemoPages = document.querySelectorAll('.post-demo-instruction-page');
    const postDemoPrevBtn = document.getElementById('post-demo-prev-btn');
    const postDemoNextBtn = document.getElementById('post-demo-next-btn');
    const postDemoPageIndicator = document.getElementById('post-demo-page-indicator');
    let currentPostDemoPage = 1;
    const totalPostDemoPages = 4;
    const waitingStatusP = document.getElementById('waiting-status');
    const elapsedTimeSpan = document.getElementById('elapsed-time');
    const waitingTimeoutWarningDiv = document.getElementById('waiting-timeout-warning');
    const leaveWaitingRoomButton = document.getElementById('leave-waiting-room-button');
    const interrogatorRatingUI = document.getElementById('interrogator-rating-ui');
    const witnessWaitingUI = document.getElementById('witness-waiting-ui');
    const witnessStyleNameSpan = document.getElementById('witness-style-name');
    const witnessStyleName2Span = document.getElementById('witness-style-name-2');
    const witnessStyleDescriptionP = document.getElementById('witness-style-description');

    // NEW: Witness end-of-study modal
    const witnessEndModal = document.getElementById('witness-end-modal');
    const witnessEndTitle = document.getElementById('witness-end-title');
    const witnessEndMessage = document.getElementById('witness-end-message');
    const witnessEndContinueButton = document.getElementById('witness-end-continue-button');

    // NEW: Interrogator connection issue modal (human mode partner dropout)
    const interrogatorConnectionModal = document.getElementById('interrogator-connection-modal');
    const interrogatorConnectionContinueButton = document.getElementById('interrogator-connection-continue-button');

    // NEW: AI connection failure modal (API retry failures)
    const aiConnectionModal = document.getElementById('ai-connection-modal');
    const aiConnectionTitle = document.getElementById('ai-connection-title');
    const aiConnectionMessage = document.getElementById('ai-connection-message');
    const aiConnectionButton = document.getElementById('ai-connection-button');

    // 1. Prolific Completion URLs
    const PROLIFIC_COMPLETION_URL = "https://app.prolific.com/submissions/complete?cc=CR0KFVQO";       // Completed study normally
    const PROLIFIC_NO_CONSENT_URL = "https://app.prolific.com/submissions/complete?cc=C120SCQ9";       // Declined consent
    const PROLIFIC_TIMED_OUT_URL = "https://app.prolific.com/submissions/complete?cc=C1B54A7Q";        // Waiting room timeout (no match)
    const PROLIFIC_PARTNER_DROPPED_URL = "https://app.prolific.com/submissions/complete?cc=C19WFTZR";  // Partner dropped mid-conversation
    const PROLIFIC_ABANDONED_URL = "https://app.prolific.com/submissions/complete?cc=CZSGWT2I";        // Page refresh/abandon
    const PROLIFIC_POST_STUDY_TIMEOUT_AI_URL = "https://app.prolific.com/submissions/complete?cc=CNEGS1RX";  // Completed conversation but AFK on feedback/demographics (AI witness)
    const PROLIFIC_POST_STUDY_TIMEOUT_HUMAN_URL = "https://app.prolific.com/submissions/complete?cc=C12UYMCR"; // Completed conversation but AFK on feedback/demographics (human witness)


    // 2. Production Mode Check
    const isProduction = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

    // Flag to suppress the beforeunload/unload abandon handler during intentional redirects
    // (e.g., timeout, completion, partner drop). Without this, every Prolific redirect
    // triggers the unload handler which sends CZSGWT2I (abandon) and overwrites the real code.
    let isIntentionalRedirect = false;

    // Belt-and-suspenders: both set the flag AND remove the event listeners entirely.
    // Call this before ANY intentional redirect to Prolific.
    function prepareIntentionalRedirect() {
        isIntentionalRedirect = true;
        window.removeEventListener('beforeunload', handleEarlyExit);
        window.removeEventListener('unload', handleActualExit);
    }

    // --- Railway API adapter (add right after `isProduction`) ---
    
    // DEBUG: Railway-only error logging function
    async function logToRailway(errorInfo) {
        try {
            const debugPayload = {
                error_type: errorInfo.type || 'Unknown',
                error_message: errorInfo.message || 'No message',
                session_id: sessionId || 'No session',
                current_turn: currentTurn || 'No turn',
                timestamp: new Date().toISOString(),
                stack_trace: errorInfo.stack || 'No stack trace',
                additional_context: errorInfo.context || {}
            };
            
            await fetch(`${API_BASE_URL}/debug_log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debugPayload)
            });
            // Silently fail - no logs or notifications to avoid participant contamination
        } catch (e) {
            // Silently fail - cannot risk any participant-visible errors
        }
    }
    
    // Route to correct backend based on URL parameter: ?v=1 (human) or ?v=2 (AI)
    const BACKEND_HUMAN = 'https://ai-turing-test-production.up.railway.app';
    const BACKEND_AI = 'https://fearless-illumination-production.up.railway.app';
    const urlVersion = new URLSearchParams(window.location.search).get('v');
    const API_BASE_URL = isProduction ? (urlVersion === '2' ? BACKEND_AI : BACKEND_HUMAN) : '';

    // Monkey-patch fetch so relative paths (starting with "/") hit Railway in production.
    // Local dev (localhost/127.0.0.1) stays unchanged.
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

    

    // --- LIKERT BUBBLE HANDLERS FOR INITIAL FORM ---
    const likertBubbles = document.querySelectorAll('.likert-bubble');
    likertBubbles.forEach(bubble => {
        bubble.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            
            const groupName = bubble.dataset.name;
            const value = bubble.dataset.value;
            
            // Remove selected class from all bubbles in this group
            document.querySelectorAll(`.likert-bubble[data-name="${groupName}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            
            // Add selected class to clicked bubble
            bubble.classList.add('selected');
            
            // Update the hidden input
            document.querySelector(`input[type="hidden"][name="${groupName}"]`).value = value;
        });
    });
    // --- END LIKERT BUBBLE HANDLERS ---

    // We generate a client-side ID for the consent form filename before the server gives us a session ID.
    // CRITICAL: Must persist across page refreshes to maintain role assignment (IRB compliance)
    let participantId = localStorage.getItem('participantId');
    if (!participantId) {
        participantId = self.crypto.randomUUID();
        localStorage.setItem('participantId', participantId);
    }

    // Try to compute prolificPid from URL parameters if present
    const urlParams = new URLSearchParams(window.location.search);
    const prolificPid = urlParams.get('PROLIFIC_PID') || urlParams.get('prolific_pid') || urlParams.get('prolificPID') || null;

    // NEW: Pre-assigned role (assigned on page load, before consent)
    let assignedRole = null; // 'interrogator' or 'witness'
    let assignedSocialStyle = null; // Social style if witness (e.g., 'WARM', 'PLAYFUL')
    let assignedSocialStyleDescription = null; // Description text
    // Participant-facing display label for the witness's assigned style. We STORE and SEND the raw
    // code (TURING/BLAND) everywhere data goes; the witness only ever SEES this label, so the
    // internal codename "TURING" (which could hint at a Turing test and break blinding) is never
    // shown. All-caps to match the attention-check distractors, so the correct option cannot be
    // singled out by formatting. BLAND falls through unchanged.
    const WITNESS_STYLE_DISPLAY = { TURING: 'CASUAL' };
    const styleLabel = (code) => WITNESS_STYLE_DISPLAY[code] || code;

    let sessionId = null; // Changed from localStorage.getItem('sessionId') to ensure clean start
    let currentTurn = 0;
    let aiResponseTimestamp = null;
    let progressInterval; // Moved from inside the form listener
    let lastConfidenceValue = 50; // NEW: Changed to 50 (0-100 scale, default 50%)
    let finalSummaryData = null; // NEW: To store summary data before showing feedback form

    // NEW: Binary choice tracking variables
    let binaryChoiceStartTime = null; // When AI message appears
    let binaryChoice = null; // 'human' or 'ai'
    let binaryChoiceTime = null; // Time taken to make binary choice
    let finalResponseReason = null; // Why the current final judgment is being collected
    let witnessBinaryShown = false; // #1 guard: ignore repeat witness final routing so an in-progress/submitted final isn't reset
    let buttonOrderRandomized = false; // For counterbalancing (currently disabled)

    // NEW: Enhanced reaction time tracking variables
    let confidenceStartTime = null; // When they first touch the slider (after binary choice)
    let sliderInteractionLog = []; // Log of all slider interactions

    // NEW: Message composition time tracking
    let messageCompositionStartTime = null; // When they first start typing a message

    // NEW: Fallback storage for failed network delay updates
    let pendingNetworkDelayUpdates = []; // Store failed updates for later retry
    
    // Timer variables
    let studyTimer = null;
    let studyStartTime = null;
    let synchronizedStartTimestamp = null; // NEW: Synchronized start time from backend (in milliseconds)
    let timeExpired = false;
    const STUDY_DURATION_MS = 7.5 * 60 * 1000; // 7.5 minutes in milliseconds

    // TIMEOUT CONSTANTS (no screen should have user waiting >2-3 min without action)
    const CONSENT_TIMEOUT_MS = 3 * 60 * 1000;      // 3 minutes for consent
    const SCREEN_TIMEOUT_MS = 2 * 60 * 1000;       // 2 minutes for other screens
    const WAITING_ROOM_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes for waiting room
    const CONVERSATION_INACTIVITY_MS = 2 * 60 * 1000; // 2 minutes inactivity for any participant during conversation
    const POST_STUDY_TIMEOUT_MS = 3 * 60 * 1000;         // 3 minutes for post-study screens (feedback, demographics)

    // Track conversation inactivity timer (all participants during conversation)
    let conversationInactivityTimer = null;

    function startConversationInactivityTimer() {
        clearConversationInactivityTimer();
        conversationInactivityTimer = setTimeout(() => {
            logToRailway({
                type: 'CONVERSATION_INACTIVITY_TIMEOUT',
                message: 'Participant inactive for 2 minutes during conversation - redirecting to Prolific',
                context: { role: currentRole, isHumanPartner }
            });
            logUiEvent('conversation_inactivity_timeout');
            endStudyWithScenario('conversation_inactivity', 'conversation_inactivity');
        }, CONVERSATION_INACTIVITY_MS);
    }

    function resetConversationInactivityTimer() {
        if (conversationInactivityTimer) {
            startConversationInactivityTimer();
        }
    }

    function clearConversationInactivityTimer() {
        if (conversationInactivityTimer) {
            clearTimeout(conversationInactivityTimer);
            conversationInactivityTimer = null;
        }
    }

    // Track active screen timers so we can clear them on navigation
    let currentScreenTimer = null;
    let currentScreenName = null; // Track which screen timer is for
    let screenActivityHandler = null; // reset-on-activity listener for post-study data-entry screens
    let lastScreenTimerBumpAt = 0;    // debounce so a burst of keystrokes doesn't thrash the timer

    function clearScreenTimer() {
        if (currentScreenTimer) {
            clearTimeout(currentScreenTimer);
            currentScreenTimer = null;
        }
        // Detach any reset-on-activity listeners so they never leak into the next screen.
        if (screenActivityHandler) {
            ['input', 'change', 'click', 'keydown'].forEach(ev =>
                document.removeEventListener(ev, screenActivityHandler, true));
            screenActivityHandler = null;
        }
        currentScreenName = null;
    }

    // Record timeout to database for analytics (fire-and-forget, don't block redirect)
    async function recordTimeoutToDatabase(screenName) {
        try {
            await fetch('/record_timeout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant_id: participantId,
                    session_id: sessionId,
                    timeout_screen: screenName
                })
            });
        } catch (e) {
            // Silently fail - don't block the redirect
            logToRailway({
                type: 'RECORD_TIMEOUT_ERROR',
                message: `Failed to record timeout: ${e.message}`,
                context: { screen: screenName }
            });
        }
    }

    function startScreenTimer(timeoutMs, screenName, onTimeout, resetOnActivity = false) {
        clearScreenTimer();
        currentScreenName = screenName;

        logToRailway({
            type: 'SCREEN_TIMER_STARTED',
            message: `Started ${timeoutMs/1000}s timer for ${screenName}`,
            context: { screen: screenName, timeout_ms: timeoutMs, reset_on_activity: resetOnActivity }
        });

        const fire = async () => {
            logToRailway({
                type: 'SCREEN_TIMEOUT',
                message: `Screen timeout on ${screenName} after ${timeoutMs/1000}s`,
                context: { screen: screenName }
            });
            logUiEvent('screen_timeout', { screen: screenName, timeout_ms: timeoutMs });

            // Record timeout to database before executing callback
            await recordTimeoutToDatabase(screenName);

            onTimeout();
        };
        currentScreenTimer = setTimeout(fire, timeoutMs);

        // On post-study data-entry screens (feedback, demographics) this is an INACTIVITY timer, not a
        // fixed deadline: any interaction re-arms it, so an actively-engaged-but-slow participant is
        // never timed out. Only genuine idleness (no events for the full window) fires it. Debounced so
        // a burst of keystrokes doesn't thrash the timer.
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

    function recordCompletionCode(code) {
        const id = sessionId || participantId;
        if (id) {
            navigator.sendBeacon(`${API_BASE_URL}/record_completion_code`, JSON.stringify({
                session_id: id,
                completion_code: code
            }));
        }
    }

    function redirectToProlificTimeout() {
        clearScreenTimer();
        prepareIntentionalRedirect();
        recordCompletionCode('C1B54A7Q');
        if (isProduction) {
            window.location.href = PROLIFIC_TIMED_OUT_URL;
        } else {
            alert('DEV MODE: Screen timeout - would redirect to Prolific timeout URL');
        }
    }

    function redirectToProlificCompletion() {
        clearScreenTimer();
        prepareIntentionalRedirect();
        recordCompletionCode('CR0KFVQO');
        if (isProduction) {
            window.location.href = PROLIFIC_COMPLETION_URL;
        } else {
            alert('DEV MODE: Screen timeout - would redirect to Prolific completion URL');
        }
    }

    function redirectToProlificPostStudyTimeout() {
        clearScreenTimer();
        prepareIntentionalRedirect();
        // Use condition-specific codes so researcher can distinguish in Prolific
        const isAiCondition = urlVersion === '2';
        const code = isAiCondition ? 'CNEGS1RX' : 'C12UYMCR';
        const url = isAiCondition ? PROLIFIC_POST_STUDY_TIMEOUT_AI_URL : PROLIFIC_POST_STUDY_TIMEOUT_HUMAN_URL;
        recordCompletionCode(code);
        if (isProduction) {
            window.location.href = url;
        } else {
            alert(`DEV MODE: Post-study timeout (${isAiCondition ? 'AI' : 'human'} condition) - would redirect with code ${code}`);
        }
    }

    // === Exit-scenario taxonomy (decisions #3/#4): one clear message per situation ===
    // Each non-normal exit has its own title/body (participant-fault vs system-fault wording)
    // and a Prolific completion code. To distinguish scenarios in Prolific, create dedicated
    // completion codes and swap the `code` values below; several currently reuse the configured
    // "timed out" code (C1B54A7Q) so payments keep working until new codes are created.
    const PROLIFIC_COMPLETE_BASE = "https://app.prolific.com/submissions/complete?cc=";
    const postStudyCode = () => (urlVersion === '2' ? 'CNEGS1RX' : 'C12UYMCR'); // condition-specific (completed the task)
    // Prolific completion codes grouped by how the submission should be handled (see EXIT_SCENARIOS `fault`):
    //   SYSTEM_FAULT_CODE       — no-fault non-completion (no match / connection / technical) -> approve & pay.
    //   PARTICIPANT_INACTIVE_CODE — participant went inactive/abandoned -> your discretion (review before approving).
    // TODO(prolific): create a NEW completion code in the study for the inactive group and paste it below.
    //   It intentionally defaults to SYSTEM_FAULT_CODE so no participant ever receives an invalid code if not yet set.
    const SYSTEM_FAULT_CODE = 'C1B54A7Q';
    const PARTICIPANT_INACTIVE_CODE = 'C1B54A7Q'; // <-- replace with the new Prolific code (e.g. 'CXXXXXXXX')
    const EXIT_SCENARIOS = {
        // --- Pre-conversation, participant inactive (their action needed) ---
        consent_timeout:         { title: "Session timed out",  fault: "participant", code: PARTICIPANT_INACTIVE_CODE, body: "You didn't continue past the consent screen in time, so the session has ended." },
        instructions_timeout:    { title: "Session timed out",  fault: "participant", code: PARTICIPANT_INACTIVE_CODE, body: "You were inactive on the instructions for too long, so the session has ended." },
        pre_chat_timeout:        { title: "Session timed out",  fault: "participant", code: PARTICIPANT_INACTIVE_CODE, body: "You were inactive before the conversation began, so the session has ended." },
        conversation_inactivity: { title: "Conversation ended", fault: "participant", code: PARTICIPANT_INACTIVE_CODE, body: "You were inactive during the conversation for too long, so it ended early." },
        // --- System / bad luck (explicitly reassure: not their fault, still paid) ---
        no_match:                { title: "No partner available",          fault: "system", code: SYSTEM_FAULT_CODE, body: "We couldn't match you with a partner in time. This is not your fault — you will still be paid for your time." },
        backend_cleanup:         { title: "Connection lost while waiting", fault: "system", code: SYSTEM_FAULT_CODE, body: "We lost your connection while you were waiting to be matched. This is not your fault — you will still be paid for your time." },
        technical_issue:         { title: "Technical issue",               fault: "system", code: SYSTEM_FAULT_CODE, body: "A technical problem interrupted the study before it could finish. This is not your fault — you will still be paid for your time." },
        // --- Post-conversation (finished the task; reassure they're paid) ---
        demographics_timeout:    { title: "Survey timed out", fault: "post", codeFn: postStudyCode, body: "You completed the conversation, but the final survey timed out. You have completed the task and will be paid." },
        post_study_issue:        { title: "Thanks for completing the conversation", fault: "post", codeFn: postStudyCode, body: "There was an issue capturing your final response, but you have completed the task and will be paid. You'll be redirected shortly." },
        // Reload guard (04Aug26): participant reloaded AFTER entering the conversation. Can't restart
        // (would strand their partner and reset their data). Their earlier data is preserved. Code
        // CZSGWT2I is the abandon/review bucket — switch to an auto-pay code if you prefer.
        already_in_study:        { title: "You've already started this study", fault: "post", code: 'CZSGWT2I', body: "This study can't be restarted once it has begun. Your earlier responses were saved, and you'll be paid for your participation. Redirecting you to Prolific." },
    };

    // Show the scenario's message, record it, then redirect (with a safety auto-continue).
    // Pass screenNameForDb only when the caller hasn't already recorded the timeout_screen.
    function endStudyWithScenario(scenarioId, screenNameForDb) {
        const sc = EXIT_SCENARIOS[scenarioId] || EXIT_SCENARIOS.technical_issue;
        const code = sc.codeFn ? sc.codeFn() : sc.code;
        clearScreenTimer();
        if (screenNameForDb) recordTimeoutToDatabase(screenNameForDb);
        prepareIntentionalRedirect();
        recordCompletionCode(code);
        logUiEvent('exit_scenario', { scenario: scenarioId, fault: sc.fault, code });
        logToRailway({ type: 'EXIT_SCENARIO', message: `Exit: ${scenarioId} (${sc.fault})`, context: { scenarioId, code } });

        const go = () => {
            if (isProduction) window.location.href = PROLIFIC_COMPLETE_BASE + code;
            else alert(`DEV MODE: exit '${scenarioId}' (${sc.fault}) -> code ${code}`);
        };
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = `
            <div class="modal-content">
                <h3 style="text-align: center; margin-top: 0;">${sc.title}</h3>
                <p style="text-align: center;">${sc.body}</p>
                <button id="exit-scenario-btn" style="margin: 20px auto; display: block;">Continue</button>
            </div>`;
        document.body.appendChild(overlay);
        document.getElementById('exit-scenario-btn').addEventListener('click', go);
        // Safety net: never strand them on the modal — auto-continue after 10s.
        setTimeout(go, 10000);
    }

    // NEW: Tab visibility tracking
    let tabHiddenStartTime = null;
    let cumulativeTabHiddenMs = 0;
    let turnTabHiddenInstances = []; // per-instance hidden durations (ms) within the current turn window
    let pendingRatingBeacon = null;  // FIX D1b: unconfirmed rating payload, beaconed on pagehide
    let suspiciousBehaviorTrackingEnabled = false;
    let pageInactiveStartTime = null;
    let lastPageInactivityDurationMs = 0;
    let lastPageInactivityEndedAt = null;

    // NEW: Human witness mode variables
    let currentRole = null;  // 'interrogator' or 'witness'
    let partnerSessionId = null;
    let firstMessageSender = null;
    let partnerDroppedFlag = false;  // Track when partner has dropped (for interrogator delayed handling)
    let isHumanPartner = false;
    let waitingForPartner = false;
    let matchCheckInterval = null;
    let waitingTimerInterval = null; // NEW: Separate interval for waiting room timer
    let partnerPollInterval = null;
    let backgroundDropoutCheckInterval = null; // Lightweight check for partner_dropped while composing
    let intermittentBubbleTimeout = null; // NEW: Track intermittent bubble animation timeout
    let isShowingIntermittentBubbles = false; // NEW: Flag to track if intermittent bubbles are active
    let interrogatorConnectionModalTimeout = null; // C1: cancel modal auto-close if user clicks through

    // --- NEW: SLIDER VALUE DISPLAY LOGIC ---
    const allSliders = document.querySelectorAll('#initial-form input[type="range"]');
    allSliders.forEach(slider => {
        const valueSpan = slider.nextElementSibling;
        if (valueSpan && valueSpan.classList.contains('slider-value')) {
            // Set initial value on page load
            valueSpan.textContent = slider.value;

            // Add listener to update value in real-time
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
            });
        }
    });
    // --- END NEW SLIDER LOGIC ---

    // --- Helper Functions ---
    // Normalize server timestamps that might be seconds or milliseconds.
    function tsToMs(ts) {
        if (ts == null) return null;
        const n = Number(ts);
        // If it's already in ms (>= ~2001-09), return as-is, else convert seconds -> ms
        return n >= 1e12 ? n : n * 1000;
    }

    function showError(message) {
        errorMessageArea.textContent = message;
        errorMessageArea.style.display = 'block';
        // Scroll to error so it's visible even on maximized windows
        errorMessageArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            errorMessageArea.style.display = 'none';
        }, 5000);
    }

    // Helper: extract a readable error message from API JSON result
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
                const field = Array.isArray(detail.loc) ? detail.loc[detail.loc.length - 1] : null;
                const msg = detail.msg || detail.message || JSON.stringify(detail);
                return field ? `${field}: ${msg}` : msg;
            }
            return String(detail);
        } catch (e) {
            return fallback || 'An unexpected error occurred.';
        }
    }

    // Lock/unlock all controls inside the initial demographics form
    function setInitialFormControlsDisabled(disabled) {
        if (!initialForm) return;
        const controls = initialForm.querySelectorAll('input, select, textarea, button');
        controls.forEach(el => {
            if (el.tagName === 'INPUT' && el.type === 'hidden') {
                return; // keep hidden inputs enabled so values submit in FormData
            }
            el.disabled = disabled;
        });
    }

    // NEW: UI event logger
    async function logUiEvent(event, metadata = {}) {
        try {
            await fetch('/log_ui_event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event,
                    ts_client: Date.now() / 1000,
                    metadata,
                    participant_id: participantId,
                    prolific_pid: prolificPid,
                    session_id: sessionId
                })
            });
        } catch (e) {
            // Silently fail - cannot risk any participant-visible errors
        }
    }

    function enableSuspiciousBehaviorTracking() {
        suspiciousBehaviorTrackingEnabled = true;
        logSuspiciousEvent('automation_fingerprint', {
            timestamp: Date.now(),
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
                input_type: event.inputType || null,
                turn: currentTurn,
                timestamp: Date.now(),
                role: currentRole
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
                message_word_count: text.trim() ? text.trim().split(/\s+/).length : 0,
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
                    turn: currentTurn,
                    timestamp: Date.now(),
                    role: currentRole,
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
                    turn: currentTurn,
                    timestamp: now,
                    role: currentRole,
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
                if (!['insertText', 'deleteContentBackward', 'deleteContentForward'].includes(inputType)) {
                    logSuspiciousEvent('beforeinput', {
                        field: fieldName,
                        input_type: inputType,
                        data_char_count: event.data ? event.data.length : 0,
                        input_text: inputType === 'insertFromPaste' ? (event.data || null) : null,
                        turn: currentTurn,
                        timestamp: Date.now(),
                        role: currentRole,
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
                        turn: currentTurn,
                        timestamp: now,
                        role: currentRole,
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
                    turn: currentTurn,
                    timestamp: Date.now(),
                    role: currentRole,
                    target: describeEventTarget(event.target),
                    is_trusted: event.isTrusted
                });
            });
        }

        reset();
        return { reset, buildSummary };
    }

    const chatInputProvenanceTracker = createInputProvenanceTracker(userMessageInput, 'chat_message');
    const feedbackInputProvenanceTracker = createInputProvenanceTracker(feedbackTextarea, 'feedback');

    // NEW: finalize without session (e.g., consent declined)
    async function finalizeNoSession(reason) {
        try {
            await fetch('/finalize_no_session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant_id: participantId,
                    prolific_pid: prolificPid,
                    reason
                })
            });
        } catch (e) {
            // Silently fail - cannot risk any participant-visible errors
        }
    }

    // NEW: log when conversation actually starts (timer begins)
    async function logConversationStart() {
        try {
            await fetch('/log_conversation_start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId
                })
            });
            
            logToRailway({
                type: 'CONVERSATION_START',
                message: 'Conversation timer started - actual chat beginning',
                context: { session_id: sessionId }
            });
        } catch (e) {
            // Silently fail - cannot risk any participant-visible errors
            logToRailway({
                type: 'CONVERSATION_START_ERROR',
                message: 'Failed to log conversation start',
                context: { error: e.message }
            });
        }
    }

    

    // Update timer message based on current study state (called when time expired and state changes)
    function updateTimerMessage() {
        if (!timeExpired) return;

        const timerDisplay = document.getElementById('timer-display');
        let timeExpiredMessage;

        if (assessmentAreaDiv.style.display === 'block') {
            // State 3: Rating phase - check which phase of rating
            if (binaryChoice === null) {
                // On binary choice screen - need both choice and rating
                timeExpiredMessage = "Time's up! Finish your choice and rating.";
            } else {
                // On confidence slider - just need rating
                timeExpiredMessage = "Time's up! Finish your rating.";
            }
        } else if (typingIndicator.style.display === 'flex') {
            // State 2: Waiting for AI response (typing indicator visible)
            timeExpiredMessage = 'Time limit reached! Waiting for response, then make a final decision.';
        } else if (chatInputContainer.style.display === 'none') {
            // State 2b: Message sent, waiting for response (typing indicator not yet visible)
            timeExpiredMessage = 'Time limit reached! Waiting for response, then make a final decision.';
        } else {
            // State 1: Before sending message
            timeExpiredMessage = 'Time limit reached! Please send your message to receive your last response to judge.';
        }

        timerDisplay.innerHTML = timeExpiredMessage;
    }

    // Start the 20-minute countdown timer
    function startStudyTimer() {
        // NEW: Use synchronized timestamp from backend if available, otherwise fallback to local time
        studyStartTime = synchronizedStartTimestamp || Date.now();
        const timerDisplay = document.getElementById('timer-display');
        const countdownTimer = document.getElementById('countdown-timer');

        // Show the timer
        timerDisplay.style.display = 'block';

        // Log which timestamp source was used for debugging
        logToRailway({
            type: 'STUDY_TIMER_STARTED',
            message: synchronizedStartTimestamp ? 'Timer started with synchronized backend timestamp' : 'Timer started with local timestamp (fallback)',
            context: {
                synchronized_timestamp: synchronizedStartTimestamp,
                local_timestamp: Date.now(),
                difference_ms: synchronizedStartTimestamp ? (synchronizedStartTimestamp - Date.now()) : 0
            }
        });

        studyTimer = setInterval(() => {
            const elapsed = Date.now() - studyStartTime;
            const remaining = Math.max(0, STUDY_DURATION_MS - elapsed);
            
            // Format time as MM:SS
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            countdownTimer.textContent = timeText;
            
            // Change color when time is running out
            if (remaining <= 60000) { // Last minute - red
                timerDisplay.style.background = 'rgba(220, 53, 69, 0.9)';
            } else if (remaining <= 180000) { // Last 3 minutes - orange
                timerDisplay.style.background = 'rgba(255, 193, 7, 0.9)';
            }
            
            // Time expired
            if (remaining === 0) {
                clearInterval(studyTimer);
                clearConversationInactivityTimer(); // No longer needed — study timer handles end
                timeExpired = true;
                timerDisplay.style.background = 'rgba(220, 53, 69, 0.9)';
                timerDisplay.style.fontSize = '14px';
                timerDisplay.style.width = '300px';

                // NEW: Handle timer expiry for witnesses (show modal)
                if (currentRole === 'witness') {
                    logToRailway({
                        type: 'WITNESS_TIMER_EXPIRED',
                        message: 'Timer expired for witness - showing modal',
                        context: { role: currentRole }
                    });

                    // Stop partner polling and intermittent bubbles
                    if (partnerPollInterval) {
                        clearInterval(partnerPollInterval);
                        partnerPollInterval = null;
                    }
                    stopIntermittentBubbles();

                    // Hide chat UI
                    chatInputContainer.style.display = 'none';
                    timerDisplay.style.display = 'none';

                    // Go straight to binary choice (no modal)
                    showWitnessBinaryChoice('time_expired');
                } else {
                    // Interrogator flow
                    updateTimerMessage();
                    stopIntermittentBubbles(); // Stop any lingering typing bubbles

                    if (assessmentAreaDiv.style.display === 'block') {
                        // Already in assessment phase - just show message
                        if (binaryChoice === null) {
                            showError('Time expired! Please complete your Human/AI choice and confidence assessment to continue.');
                        } else {
                            showError('Time expired! Please complete your confidence assessment to continue.');
                        }
                    } else if (isHumanPartner && waitingForPartner) {
                        // Human mode: waiting for partner response when timer expired.
                        // FIX (04Aug26, T2.3): guard the one-shot fetch on turn so it cannot
                        // re-deliver a message the running 2s poll already delivered (which reset
                        // binary_choice_time_ms — the DDM's primary observation — and drew a
                        // duplicate bubble on the final turn). Together with the backend delivery
                        // idempotency this fully prevents the double-delivery. NOTE: we do NOT stop
                        // the poll before this fetch — if the partner's message is still in transit
                        // the poll must stay alive to deliver it; we clear it only when WE deliver.
                        fetch(`/check_partner_message?session_id=${sessionId}`)
                            .then(r => r.json())
                            .then(result => {
                                if (result.new_message && result.turn > currentTurn) {
                                    // Message ready now — stop the poll, display it, show assessment
                                    if (partnerPollInterval) { clearInterval(partnerPollInterval); partnerPollInterval = null; }
                                    stopBackgroundDropoutCheck();
                                    stopIntermittentBubbles();
                                    chatInputContainer.style.display = 'none';

                                    logToRailway({
                                        type: 'INTERROGATOR_TIMER_EXPIRED_MESSAGE_FOUND',
                                        message: 'Timer expired, partner message ready - displaying for final assessment',
                                        context: { turn: result.turn }
                                    });

                                    addMessageToUI(result.message_text, 'assistant');
                                    currentTurn = result.turn;
                                    // FIX F5 (01Aug26): anchor timing to THIS message's delivery —
                                    // previously left at the previous message's stamp, inflating
                                    // reading/decision time for this final turn
                                    aiResponseTimestamp = result.timestamp;
                                    waitingForPartner = false;
                                    cumulativeTabHiddenMs = 0;
                                    turnTabHiddenInstances = [];
                                    typingIndicator.style.display = 'none';

                                    assessmentAreaDiv.style.display = 'block';
                                    interrogatorRatingUI.style.display = 'block';
                                    binaryChoice = null;
                                    binaryChoiceStartTime = Date.now();
                                    binaryChoiceInProgress = false;
                                    binaryChoiceSection.style.display = 'block';
                                    confidenceSection.style.display = 'none';
                                    choiceHumanButton.disabled = false;
                                    choiceAiButton.disabled = false;

                                    const assessmentTitle = assessmentAreaDiv.querySelector('h4');
                                    if (assessmentTitle) {
                                        assessmentTitle.style.display = 'none';
                                    }
                                    updateTimerMessage();
                                    // C5: this branch builds the final assessment manually (not via
                                    // showInterrogatorFinalAssessment), so arm the same backstop here.
                                    finalResponseReason = finalResponseReason || 'time_expired_message_at_zero';
                                    armInterrogatorFinalAssessmentBackstop();
                                } else if (result.partner_typing) {
                                    // Message exists but in artificial delay — let existing poll
                                    // keep running. It will show typing bubbles, deliver the message
                                    // when delay finishes, and show assessment. timeExpired flag
                                    // ensures rating submission routes to feedback after.
                                    logToRailway({
                                        type: 'INTERROGATOR_TIMER_EXPIRED_MESSAGE_DELAYED',
                                        message: 'Timer expired, partner message in artificial delay - letting poll deliver it',
                                        context: { role: currentRole }
                                    });
                                } else {
                                    // No new message. If they have prior partner evidence, collect
                                    // a final judgment explicitly before feedback.
                                    if (partnerPollInterval) {
                                        clearInterval(partnerPollInterval);
                                        partnerPollInterval = null;
                                    }
                                    stopBackgroundDropoutCheck();
                                    stopIntermittentBubbles();
                                    chatInputContainer.style.display = 'none';

                                    logToRailway({
                                        type: 'INTERROGATOR_TIMER_EXPIRED_NO_MESSAGE',
                                        message: 'Timer expired, no new partner message',
                                        context: { role: currentRole }
                                    });

                                    document.getElementById('timer-display').style.display = 'none';
                                    const partnerMessageCount = messageList.querySelectorAll('.message-bubble.assistant').length;
                                    if (partnerMessageCount > 0) {
                                        showInterrogatorFinalAssessment(
                                            'time_expired_no_new_partner_message',
                                            "Time's up. Please make your final assessment:"
                                        );
                                    } else {
                                        showMainPhase('feedback');
                                        feedbackTextarea.focus();
                                    }
                                }
                            })
                            .catch(() => {
                                // Fetch failed — safe fallback: route to feedback
                                if (partnerPollInterval) {
                                    clearInterval(partnerPollInterval);
                                    partnerPollInterval = null;
                                }
                                stopBackgroundDropoutCheck();
                                stopIntermittentBubbles();
                                chatInputContainer.style.display = 'none';
                                document.getElementById('timer-display').style.display = 'none';
                                showMainPhase('feedback');
                                feedbackTextarea.focus();
                            });
                    } else if (isHumanPartner && !waitingForPartner) {
                        // Human mode: interrogator was composing when timer expired.
                        // They already assessed the last message they received.
                        // Witness is already gone — no one to send to, nothing new to assess.
                        // Route straight to feedback/comment form.
                        logToRailway({
                            type: 'INTERROGATOR_TIMER_EXPIRED_COMPOSING',
                            message: 'Timer expired while composing in human mode - already assessed last message, routing to feedback',
                            context: { role: currentRole }
                        });

                        if (partnerPollInterval) {
                            clearInterval(partnerPollInterval);
                            partnerPollInterval = null;
                        }
                        stopBackgroundDropoutCheck();
                        stopIntermittentBubbles();

                        chatInputContainer.style.display = 'none';
                        document.getElementById('timer-display').style.display = 'none';

                        addSystemMessage("Time's up! Your partner has finished the conversation.");

                        const partnerMessageCount = messageList.querySelectorAll('.message-bubble.assistant').length;
                        if (partnerMessageCount > 0) {
                            showInterrogatorFinalAssessment(
                                'time_expired_while_composing',
                                "Time's up. Please make your final assessment:"
                            );
                        } else {
                            showMainPhase('feedback');
                            feedbackTextarea.focus();
                        }
                    } else if (!isHumanPartner) {
                        // A1: AI mode, timer expired while composing. Per design (decision #5) the
                        // interrogator should send one last message to get a final AI response to
                        // judge, so we do NOT force-end here. Arm a backstop so a non-responder who
                        // walks away is redirected with a labeled reason instead of stuck with no timer.
                        // Sending a message clears this via clearScreenTimer() in handleSendMessage.
                        startScreenTimer(POST_STUDY_TIMEOUT_MS, 'ai_compose_after_expiry', showPostStudyIssueRedirect);
                    }
                }
            }
        }, 1000);
    }

    // This function checks if both user and backend are ready, then proceeds
    function tryProceedToChat() {
        logToRailway({
            type: 'TRY_PROCEED_TO_CHAT',
            message: 'tryProceedToChat called',
            context: { isBackendReady, isUserReady }
        });

        if (isBackendReady && isUserReady) {
            // Stop waiting room timer now that we're leaving
            if (waitingTimerInterval) {
                clearInterval(waitingTimerInterval);
                waitingTimerInterval = null;
            }

            // Stop and hide the loading animation at the last possible moment
            clearInterval(progressInterval);
            initLoadingDiv.style.display = 'none';

            // Ensure the instruction pop-up is hidden
            finalInstructionsModal.style.display = 'none';

            // Switch to the main chat page view
            showMainPhase('chat_and_assessment_flow');

            // NEW: Update conversation header for witnesses in human mode
            const conversationHeader = document.getElementById('conversation-header');
            if (currentRole === 'witness' && isHumanPartner && assignedSocialStyle && assignedSocialStyleDescription) {
                // Show style instructions for witness
                conversationHeader.innerHTML = `<strong>Style: ${styleLabel(assignedSocialStyle)}</strong><br><span style="font-size: 0.9em; font-weight: normal;">${assignedSocialStyleDescription}</span>`;
            } else if (currentRole === 'interrogator') {
                // Interrogator: show task reminder with randomized order
                const humanFirst = Math.random() < 0.5;
                const promptOrder = humanFirst ? 'human_first' : 'ai_first';
                const orderText = humanFirst
                    ? 'Determine if your partner is human or AI.'
                    : 'Determine if your partner is AI or human.';
                conversationHeader.innerHTML = `<span style="font-size: 0.9em;"><strong>Your task:</strong> ${orderText}</span>`;

                logUiEvent('interrogator_prompt_order', { order: promptOrder, text: orderText });
            } else {
                conversationHeader.textContent = 'Conversation';
            }

            // Configure UI based on role
            assessmentAreaDiv.style.display = 'none';

            if (currentRole === 'witness') {
                // Witnesses don't see rating UI, only chat
                interrogatorRatingUI.style.display = 'none';

                // Check if witness sends first message
                if (firstMessageSender === 'witness') {
                    witnessWaitingUI.style.display = 'none';
                    chatInputContainer.style.display = 'flex';
                    userMessageInput.disabled = false;
                    sendMessageButton.disabled = false;
                    userMessageInput.focus();
                } else {
                    // Waiting for interrogator's first message
                    // Hide text box completely (consistent with later rounds), show waiting UI
                    chatInputContainer.style.display = 'none';
                    witnessWaitingUI.style.display = 'block';
                    waitingForPartner = true;
                    startPartnerResponsePolling();
                }
            } else {
                // Interrogators see normal UI (rating area shown after AI response)
                interrogatorRatingUI.style.display = 'block';
                witnessWaitingUI.style.display = 'none';
                chatInputContainer.style.display = 'flex';

                // Check if interrogator sends first message
                if (firstMessageSender === 'interrogator' || !isHumanPartner) {
                    userMessageInput.disabled = false;
                    sendMessageButton.disabled = false;
                    userMessageInput.focus();

                    // NEW: Start continuous polling for interrogators in human mode
                    // This ensures they detect partner dropouts even when idle
                    if (isHumanPartner) {
                        startPartnerResponsePolling();
                    }

                    // Start 2-min inactivity timer for AI witness interrogator
                    startConversationInactivityTimer();
                } else {
                    // Waiting for witness's first message (shouldn't happen since interrogator always goes first)
                    userMessageInput.disabled = true;
                    sendMessageButton.disabled = true;
                    waitingForPartner = true;
                    startPartnerResponsePolling();
                }
            }

            // START THE 7.5-MINUTE TIMER AND LOG CONVERSATION START
            // FIX: Reset synchronizedStartTimestamp to NOW, not the backend's proceed_to_chat_at time
            // The backend time is for synchronizing when both users SHOULD start, but we need to track
            // when the conversation ACTUALLY starts (which may be delayed due to network, user actions, etc.)
            synchronizedStartTimestamp = Date.now();
            startStudyTimer();

            // Log when conversation actually begins
            logConversationStart();
        }
    }

    function showMainPhase(phase) {
        // Hide all phases first
        consentPhaseDiv.style.display = 'none';
        instructionsPhaseDiv.style.display = 'none';
        initialSetupDiv.style.display = 'none';
        roleAssignmentPhaseDiv.style.display = 'none'; // NEW
        waitingRoomPhaseDiv.style.display = 'none'; // NEW
        chatInterfaceDiv.style.display = 'none';
        finalPageDiv.style.display = 'none';
        feedbackPhaseDiv.style.display = 'none';

        // Clear any existing screen timer when changing phases
        clearScreenTimer();
        // Clear AI interrogator inactivity timer when leaving conversation
        clearConversationInactivityTimer();

        if (phase === 'consent') {
            consentPhaseDiv.style.display = 'block';
            // 3 minute timeout for consent
            startScreenTimer(CONSENT_TIMEOUT_MS, 'consent', () => endStudyWithScenario('consent_timeout'));
        }
        else if (phase === 'instructions') {
            instructionsPhaseDiv.style.display = 'block';
            // 2 minute timeout for pre-demo instructions
            startScreenTimer(SCREEN_TIMEOUT_MS, 'instructions', () => endStudyWithScenario('instructions_timeout'));
        }
        else if (phase === 'demographics') {
            initialSetupDiv.style.display = 'block';
            // 3 minutes of INACTIVITY for demographics (resets on any interaction) — post-study timeout
            // code (they completed the conversation). An actively-filling-but-slow participant is never
            // cut off; only someone idle for 3 straight minutes times out.
            startScreenTimer(POST_STUDY_TIMEOUT_MS, 'demographics', () => endStudyWithScenario('demographics_timeout'), true);
        }
        else if (phase === 'role-assignment') {
            roleAssignmentPhaseDiv.style.display = 'block';
            // 2 minute timeout for post-demo instructions
            startScreenTimer(SCREEN_TIMEOUT_MS, 'role-assignment', () => endStudyWithScenario('pre_chat_timeout'));
        }
        else if (phase === 'waiting-room') {
            waitingRoomPhaseDiv.style.display = 'block';
            // Waiting room has its own timeout logic in startMatchPolling (2 min)
            // No need for screen timer here
        }
        else if (phase === 'chat_and_assessment_flow') {
            chatInterfaceDiv.style.display = 'block';
            // Conversation has its own 7.5 min study timer
            // No screen timer here
        }
        else if (phase === 'feedback') {
            feedbackPhaseDiv.style.display = 'block';
            // 3 minutes of INACTIVITY for feedback (resets on any interaction) — auto-submit and advance
            // to demographics only after the participant has genuinely stopped for the full window.
            startScreenTimer(POST_STUDY_TIMEOUT_MS, 'feedback', autoSubmitFeedback, true);
        }
        else if (phase === 'final') {
            finalPageDiv.style.display = 'block';
            // 2 minute timeout for debrief - redirect to Prolific completion
            startScreenTimer(SCREEN_TIMEOUT_MS, 'debrief', redirectToProlificCompletion);
        }
    }

    // Auto-submit feedback on timeout — saves whatever they typed and advances
    function autoSubmitFeedback() {
        const feedbackText = feedbackTextarea.value.trim();
        const feedbackInputProvenance = feedbackInputProvenanceTracker.buildSummary(feedbackText);
        logSuspiciousEvent('feedback_input_provenance', {
            ...feedbackInputProvenance,
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            auto_submitted: true
        });
        logToRailway({
            type: 'FEEDBACK_AUTO_SUBMIT',
            message: 'Auto-submitting feedback due to timeout',
            context: { feedback_text: feedbackText || '(timeout - no feedback)', has_text: !!feedbackText }
        });

        const shouldSubmitFeedback = !!feedbackText || (currentRole === 'witness' && !!binaryChoice);

        // Submit typed feedback and always preserve a witness final belief if one was made.
        if (shouldSubmitFeedback && sessionId) {
            const payload = {
                session_id: sessionId,
                comment: feedbackText || '(timeout - no feedback)',
                input_provenance_summary: feedbackInputProvenance
            };
            if (currentRole === 'witness' && binaryChoice) {
                payload.binary_choice = binaryChoice;
                payload.binary_choice_time_ms = binaryChoiceTime;
                payload.final_response_reason = finalResponseReason || 'witness_feedback_timeout';
            }
            fetch('/submit_final_comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }).catch(() => {}); // Fire-and-forget
        }

        // Advance to demographics regardless
        feedbackInputProvenanceTracker.reset();
        showMainPhase('demographics');
    }



    function scrollToBottom() {
        const chatWindow = document.querySelector('.chat-window');
        // We use the setTimeout trick to make sure the browser has rendered the new content
        setTimeout(() => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 0);
    }

    // NEW: Get or assign role on page load (BEFORE consent form)
    async function getOrAssignRole() {
        /**
         * CRITICAL: Role assignment MUST happen on page load, BEFORE consent form.
         * This ensures we show the correct consent form (interrogator vs witness).
         * Role is PERMANENT for participant_id (IRB compliance).
         */
        logToRailway({
            type: 'GET_OR_ASSIGN_ROLE_CALLED',
            message: 'Calling /get_or_assign_role on page load',
            context: { participantId, prolificPid }
        });

        try {
            const response = await fetch('/get_or_assign_role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participant_id: participantId,
                    prolific_pid: prolificPid
                })
            });

            if (!response.ok) {
                throw new Error(`Role assignment failed: ${response.statusText}`);
            }

            const result = await response.json();

            // RELOAD GUARD: participant already entered the conversation in a prior load.
            // Do not re-consent or re-queue — route them to Prolific. Their partner is routed
            // to finish separately (via the /report_abandonment beacon).
            if (result.already_in_study) {
                logToRailway({ type: 'RELOAD_BLOCKED', message: 'Already in study on reload; routing to Prolific', context: { participantId } });
                endStudyWithScenario('already_in_study');
                return false;
            }

            // Store assigned role and social style
            assignedRole = result.role;
            assignedSocialStyle = result.social_style || null;
            assignedSocialStyleDescription = result.social_style_description || null;

            // Set study mode immediately (available from page load)
            isHumanPartner = result.study_mode === "HUMAN_WITNESS";

            logToRailway({
                type: 'ROLE_ASSIGNED',
                message: `Role assigned: ${assignedRole}`,
                context: {
                    role: assignedRole,
                    social_style: assignedSocialStyle,
                    is_existing: result.is_existing,
                    study_mode: result.study_mode,
                    isHumanPartner: isHumanPartner
                }
            });

            return true;
        } catch (error) {
            logToRailway({
                type: 'ROLE_ASSIGNMENT_ERROR',
                message: 'Failed to assign role',
                context: { error: error.message }
            });

            // Show error to user - this is critical for study flow
            showError('Failed to assign role. Please refresh the page. If this persists, contact the researcher.');
            return false;
        }
    }

    // NEW: Human witness mode functions
    async function enterWaitingRoom() {
        logToRailway({
            type: 'ENTER_WAITING_ROOM_CALLED',
            message: 'enterWaitingRoom function called',
            context: {}
        });
        try {
            const response = await fetch('/enter_waiting_room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            const result = await response.json();
            logToRailway({
                type: 'ENTER_WAITING_ROOM_RESPONSE',
                message: 'Received response from enter_waiting_room',
                context: result
            });

            isHumanPartner = !result.ai_partner;

            // NEW FLOW: Don't show any intermediate screen
            // Just set the mode flag and wait for "I understand" click
            logToRailway({
                type: 'MODE_DETERMINED',
                message: 'Study mode determined, waiting for "I understand" click',
                context: { isHumanPartner, ai_partner: result.ai_partner }
            });

            // For AI mode, set role now
            if (result.ai_partner) {
                currentRole = 'interrogator';
            }
            // For human mode, role will be assigned when "I understand" is clicked
        } catch (error) {
            logToRailway({
                type: 'WAITING_ROOM_ERROR',
                message: `Failed to enter waiting room: ${error.message}`,
                context: { error: error }
            });
            showError('Failed to enter waiting room. Please refresh and try again.');
        }
    }

    function showReadyToJoinScreen() {
        // Show generic ready screen (for human mode - no role assigned yet)
        showMainPhase('role-assignment'); // Reuse same phase
        assignedRoleTitleSpan.textContent = 'READY TO JOIN';
        // Hide both instruction sets
        document.querySelectorAll('.interrogator-post-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.witness-post-content').forEach(el => el.style.display = 'none');
        // Hide pagination, show button directly
        document.getElementById('post-demo-instructions-container').style.display = 'none';
        enterWaitingRoomButton.style.display = 'block';
    }

    // Show the correct pre-demographics instructions based on role and mode (paginated)
    function showPreDemoInstructions() {
        // Determine if user is witness (human mode only) or interrogator (both modes)
        const isWitness = assignedRole === 'witness' && isHumanPartner;

        // Show/hide content based on role
        const interrogatorContents = document.querySelectorAll('.instruction-content.interrogator-content');
        const witnessContents = document.querySelectorAll('.instruction-content.witness-content');

        interrogatorContents.forEach(el => {
            el.style.display = isWitness ? 'none' : 'block';
        });
        witnessContents.forEach(el => {
            el.style.display = isWitness ? 'block' : 'none';
        });

        // Populate style name for witness
        if (isWitness && assignedSocialStyle) {
            if (preDemoStyleNameSpan) {
                preDemoStyleNameSpan.textContent = styleLabel(assignedSocialStyle);
            }
            if (preDemoStyleDescriptionSpan && assignedSocialStyleDescription) {
                preDemoStyleDescriptionSpan.textContent = assignedSocialStyleDescription;
            }
            preDemoStyleNameRepeatSpans.forEach(span => {
                span.textContent = styleLabel(assignedSocialStyle);
            });
        }

        // Reset to page 1
        currentInstructionPage = 1;
        updateInstructionPage();

        logToRailway({
            type: 'PRE_DEMO_INSTRUCTIONS_SHOWN',
            message: 'Pre-demographics instructions displayed (paginated)',
            context: {
                role: assignedRole,
                isHumanPartner: isHumanPartner,
                socialStyle: assignedSocialStyle,
                totalPages: totalInstructionPages
            }
        });
    }

    // Update which instruction page is visible and navigation state
    function updateInstructionPage() {
        // Show/hide pages
        instructionPages.forEach((page, index) => {
            page.style.display = (index + 1 === currentInstructionPage) ? 'block' : 'none';
        });

        // Update page indicator
        if (instructionPageIndicator) {
            instructionPageIndicator.textContent = `${currentInstructionPage} / ${totalInstructionPages}`;
        }

        // Update navigation buttons
        if (instructionPrevBtn) {
            instructionPrevBtn.style.visibility = (currentInstructionPage === 1) ? 'hidden' : 'visible';
        }

        if (instructionNextBtn) {
            if (currentInstructionPage === totalInstructionPages) {
                // On last page - hide Next, show Continue button
                instructionNextBtn.style.display = 'none';
                confirmInstructionsButton.style.display = 'block';
            } else {
                instructionNextBtn.style.display = 'inline-block';
                confirmInstructionsButton.style.display = 'none';
            }
        }

        logToRailway({
            type: 'INSTRUCTION_PAGE_CHANGED',
            message: `Viewing instruction page ${currentInstructionPage}/${totalInstructionPages}`,
            context: { page: currentInstructionPage }
        });
    }

    // Update which post-demo instruction page is visible and navigation state
    function updatePostDemoPage() {
        // Show/hide pages
        postDemoPages.forEach((page, index) => {
            page.style.display = (index + 1 === currentPostDemoPage) ? 'block' : 'none';
        });

        const postDemoNav = document.getElementById('post-demo-nav');

        // Update page indicator
        if (postDemoPageIndicator) {
            postDemoPageIndicator.textContent = `${currentPostDemoPage} / ${totalPostDemoPages}`;
        }

        // Update Back button
        if (postDemoPrevBtn) {
            postDemoPrevBtn.style.visibility = (currentPostDemoPage === 1) ? 'hidden' : 'visible';
        }

        if (currentPostDemoPage === totalPostDemoPages) {
            // Last page (attention check) - change Next to Submit Answer
            if (postDemoNextBtn) {
                postDemoNextBtn.style.display = 'inline-block';
                postDemoNextBtn.textContent = 'Submit Answer';
            }
            enterWaitingRoomButton.style.display = 'none';
            populateAttentionCheck();
        } else {
            // Not last page - show Next, hide Enter Waiting Room
            if (postDemoNextBtn) {
                postDemoNextBtn.style.display = 'inline-block';
                postDemoNextBtn.textContent = 'Next →';
            }
            enterWaitingRoomButton.style.display = 'none';
        }

        logToRailway({
            type: 'POST_DEMO_PAGE_CHANGED',
            message: `Viewing post-demo instruction page ${currentPostDemoPage}/${totalPostDemoPages}`,
            context: { page: currentPostDemoPage }
        });
    }

    // --- ATTENTION CHECK LOGIC ---
    let attentionCheckAttempts = 0;
    let attentionCheckCorrectIndex = -1;

    const FAKE_STYLES = [
        { name: 'ANALYTICAL', traits: 'methodical, logical, focused on facts and data' },
        { name: 'RESERVED', traits: 'quiet, observant, speaks only when necessary' },
        { name: 'ENTHUSIASTIC', traits: 'excited, energetic, uses lots of exclamation points' }
    ];

    // Extract traits from full description (removes "Use this strategy..." prefix)
    function extractTraits(fullDescription) {
        if (!fullDescription) return '';
        // Match text after "you're " or "is to " or "is that you're "
        const match = fullDescription.match(/(?:you're |is to |is that you're )(.+)/i);
        return match ? match[1] : fullDescription;
    }

    const INTERROGATOR_OPTIONS = [
        { text: 'Select Human or AI, then adjust a confidence slider', correct: true },
        { text: 'Type a response as quickly as possible', correct: false },
        { text: 'Rate the message on a 5-star scale', correct: false },
        { text: 'Wait for the next message automatically', correct: false }
    ];

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    let attentionCheckPopulated = false;

    function populateAttentionCheck() {
        // Only populate once
        if (attentionCheckPopulated) return;
        attentionCheckPopulated = true;

        const questionEl = document.getElementById('attention-check-question');
        const errorEl = document.getElementById('attention-check-error');

        // Reset state
        attentionCheckAttempts = 0;
        errorEl.style.display = 'none';
        document.querySelectorAll('input[name="attention-check"]').forEach(r => r.checked = false);

        let options = [];

        if (currentRole === 'witness') {
            // Witness: select their assigned style from 1 real + 3 fake
            questionEl.textContent = 'What conversation style were you assigned?';

            const realTraits = extractTraits(assignedSocialStyleDescription);
            const realOption = {
                text: `${styleLabel(assignedSocialStyle)} - ${realTraits}`,
                correct: true
            };

            const fakeOptions = FAKE_STYLES.map(fake => ({
                text: `${fake.name} - ${fake.traits}`,
                correct: false
            }));

            options = shuffleArray([realOption, ...fakeOptions]);
        } else {
            // Interrogator: select what they do after each message
            questionEl.textContent = 'What is your task after each message from your partner?';
            options = shuffleArray([...INTERROGATOR_OPTIONS]);
        }

        // Find correct index and populate options
        options.forEach((opt, index) => {
            const spanEl = document.getElementById(`attention-option-${index}`);
            spanEl.textContent = opt.text;
            if (opt.correct) {
                attentionCheckCorrectIndex = index;
            }
        });

        logToRailway({
            type: 'ATTENTION_CHECK_SHOWN',
            message: 'Attention check displayed',
            context: { role: currentRole, correctIndex: attentionCheckCorrectIndex }
        });
    }

    function validateAttentionCheck() {
        const selected = document.querySelector('input[name="attention-check"]:checked');
        const errorEl = document.getElementById('attention-check-error');

        if (!selected) {
            errorEl.textContent = 'Please select an answer.';
            errorEl.style.display = 'block';
            return false;
        }

        attentionCheckAttempts++;
        const selectedIndex = parseInt(selected.value);
        const isCorrect = selectedIndex === attentionCheckCorrectIndex;

        logToRailway({
            type: 'ATTENTION_CHECK_SUBMITTED',
            message: 'Attention check answer submitted',
            context: {
                role: currentRole,
                selectedIndex,
                correctIndex: attentionCheckCorrectIndex,
                isCorrect,
                attempt: attentionCheckAttempts
            }
        });

        if (isCorrect) {
            errorEl.style.display = 'none';
            logToRailway({
                type: 'ATTENTION_CHECK_PASSED',
                message: 'Attention check passed',
                context: { role: currentRole, attempts: attentionCheckAttempts }
            });
            return true;
        } else {
            errorEl.textContent = "That's not quite right. Please read the instructions again and try again.";
            errorEl.style.display = 'block';
            logToRailway({
                type: 'ATTENTION_CHECK_FAILED_ATTEMPT',
                message: 'Attention check wrong answer',
                context: { role: currentRole, attempt: attentionCheckAttempts, selectedIndex }
            });
            return false;
        }
    }

    // --- END ATTENTION CHECK LOGIC ---

    function showRoleInstructionsInWaitingRoom(role, socialStyle = null, socialStyleDescription = null) {
        // REMOVED: No longer showing instructions in waiting room
        // User already read 3 pages of instructions before clicking "Enter Waiting Room"
        return;
    }

    function waitUntilProceedTime(proceedAtTimestamp) {
        // DESIGN FIX: Both players wait until the same synchronized time
        // Backend calculates: max(interrogator_entered, witness_entered) + 10 seconds
        const now = Date.now();
        const proceedAtMs = proceedAtTimestamp * 1000; // Convert Unix timestamp (seconds) to milliseconds
        const waitTimeMs = proceedAtMs - now;

        // NEW: Store synchronized start timestamp for timer synchronization
        synchronizedStartTimestamp = proceedAtMs;

        if (waitTimeMs > 0) {
            const secondsRemaining = Math.ceil(waitTimeMs / 1000);
            waitingStatusP.innerHTML = `<span style="color: #28a745; font-weight: bold;">Match found! Please wait...</span>`;

            logToRailway({
                type: 'WAITING_FOR_SYNCHRONIZED_PROCEED',
                message: 'Waiting for synchronized proceed time (both players >= 10s)',
                context: {
                    proceed_at_timestamp: proceedAtTimestamp,
                    wait_time_ms: waitTimeMs,
                    seconds_remaining: secondsRemaining
                }
            });

            // Update countdown every second
            const countdownInterval = setInterval(() => {
                const remaining = Math.ceil((proceedAtMs - Date.now()) / 1000);
                if (remaining > 0) {
                    waitingStatusP.innerHTML = `<span style="color: #28a745; font-weight: bold;">Match found! Please wait...</span>`;
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // Wait until proceed time, then proceed
            setTimeout(() => {
                clearInterval(countdownInterval);
                logToRailway({
                    type: 'SYNCHRONIZED_PROCEED_TIME_REACHED',
                    message: 'Both players have had >=10s, proceeding to chat together',
                    context: {
                        instructions_shown_at: window.instructionsShownAt,
                        total_wait_ms: Date.now() - window.instructionsShownAt
                    }
                });
                tryProceedToChat();
            }, waitTimeMs);
        } else {
            // Proceed time already passed (shouldn't happen, but handle it)
            logToRailway({
                type: 'PROCEED_TIME_ALREADY_PASSED',
                message: 'Proceed time already elapsed, proceeding immediately',
                context: { wait_time_ms: waitTimeMs }
            });
            setTimeout(() => {
                tryProceedToChat();
            }, 1500);
        }
    }

    function showRoleAssignment(role) {
        logToRailway({
            type: 'SHOW_ROLE_ASSIGNMENT',
            message: 'showRoleAssignment called',
            context: { role }
        });
        showMainPhase('role-assignment');

        assignedRoleTitleSpan.textContent = (role === 'interrogator') ? 'DETECTIVE' : (role === 'witness') ? 'RESPONDENT' : role.toUpperCase();

        // Show/hide role-specific content across all post-demo pages
        document.querySelectorAll('.interrogator-post-content').forEach(el => {
            el.style.display = (role === 'interrogator') ? 'block' : 'none';
        });
        document.querySelectorAll('.witness-post-content').forEach(el => {
            el.style.display = (role === 'witness') ? 'block' : 'none';
        });

        // Reset to page 1
        currentPostDemoPage = 1;
        updatePostDemoPage();

        logUiEvent('role_assigned', { role: role });
    }

    function startMatchPolling() {
        const startTime = Date.now();

        // NEW: Separate timer update (runs every 1 second)
        waitingTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            elapsedTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000); // Update every 1 second

        // Match checking (runs every 1 second)
        matchCheckInterval = setInterval(async () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);

            // Auto-timeout after 2 minutes (120 seconds) - checked BEFORE fetch
            // so network errors can't prevent the timeout from firing
            if (elapsed >= 120) {
                clearInterval(matchCheckInterval);
                clearInterval(waitingTimerInterval);
                handleMatchTimeout();
                return;
            }

            // Check for match
            try {
                const response = await fetch(`/check_match_status?session_id=${sessionId}`);
                const result = await response.json();

                // FIX BUG 1: Check if backend cleanup killed our session
                if (result.timed_out) {
                    clearInterval(matchCheckInterval);
                    clearInterval(waitingTimerInterval);

                    logToRailway({
                        type: 'SESSION_CLEANED_UP_BY_BACKEND',
                        message: `Backend cleanup marked session as ${result.cleanup_reason} - redirecting to Prolific`,
                        context: { cleanup_reason: result.cleanup_reason }
                    });

                    logUiEvent('backend_cleanup_timeout', {
                        cleanup_reason: result.cleanup_reason
                    });

                    // System-fault: lost their connection while waiting — explain + reassure.
                    endStudyWithScenario('backend_cleanup', `backend_cleanup_${result.cleanup_reason}`);
                    return;
                }

                // Show "Finding new partner..." if user was re-queued after partner dropped
                if (result.was_requeued && !result.matched) {
                    waitingStatusP.innerHTML = '<span style="color: #ffc107; font-weight: bold;">Partner disconnected. Finding new partner...</span>';
                }

                if (result.matched) {
                    clearInterval(matchCheckInterval);
                    // DON'T stop waitingTimerInterval yet - let it keep counting until chat starts
                    partnerSessionId = result.partner_session_id;
                    firstMessageSender = result.first_message_sender;

                    // Get synchronized proceed time from backend (Unix timestamp in seconds)
                    const proceedAtTimestamp = result.proceed_to_chat_at;

                    logToRailway({
                        type: 'MATCH_FOUND_DEBUG',
                        message: 'Match found - checking proceed_at_timestamp',
                        context: {
                            proceed_at_timestamp: proceedAtTimestamp,
                            proceed_at_type: typeof proceedAtTimestamp,
                            proceed_at_is_null: proceedAtTimestamp === null,
                            proceed_at_is_undefined: proceedAtTimestamp === undefined,
                            current_time_seconds: Date.now() / 1000
                        }
                    });

                    logUiEvent('match_found', {
                        partner_id: partnerSessionId,
                        time_waiting: elapsed,
                        first_sender: firstMessageSender,
                        proceed_at: proceedAtTimestamp
                    });

                    // Backend is ready now that real match is found
                    isBackendReady = true;

                    // Brief delay to show "Match found!" message
                    waitingStatusP.innerHTML = '<span style="color: #28a745; font-weight: bold;">Match found! Starting conversation...</span>';

                    // DESIGN FIX: Wait until synchronized proceed time
                    if (proceedAtTimestamp && proceedAtTimestamp > 0) {
                        waitUntilProceedTime(proceedAtTimestamp);
                    } else {
                        logToRailway({
                            type: 'PROCEED_TIME_MISSING',
                            message: 'proceed_to_chat_at is null/undefined - proceeding immediately (BUG!)',
                            context: { proceed_at: proceedAtTimestamp }
                        });
                        // Fallback: proceed immediately (this is the bug!)
                        // Use current time as synchronized start since backend didn't provide one
                        synchronizedStartTimestamp = Date.now();
                        tryProceedToChat();
                    }
                }

            } catch (error) {
                logToRailway({
                    type: 'MATCH_CHECK_ERROR',
                    message: `Error checking match status: ${error.message}`,
                    context: { elapsed_seconds: elapsed }
                });
            }
        }, 1000); // Poll every 1 second
    }

    async function handleMatchTimeout() {
        logUiEvent('match_timeout');

        logToRailway({
            type: 'MATCH_TIMEOUT_REDIRECT',
            message: 'No match found after 2 minutes - auto-redirecting to Prolific',
            context: { role: currentRole }
        });

        // System/bad-luck: no partner found — explain it's not their fault, still paid.
        endStudyWithScenario('no_match', 'waiting_room');
    }

    function simulateAIMatch() {
        // Simulate finding AI partner after 5-10 seconds
        const simulatedWaitTime = Math.random() * 5000 + 5000; // 5-10 seconds

        // Update elapsed time display during simulated wait
        const startTime = Date.now();
        const timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            elapsedTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);

        setTimeout(() => {
            clearInterval(timerInterval);
            waitingStatusP.innerHTML = '<span style="color: #28a745; font-weight: bold;">Match found! Starting conversation...</span>';

            // Backend is ready now that "match" is found
            logToRailway({
                type: 'SIMULATED_MATCH_FOUND',
                message: 'Simulated match found - setting isBackendReady to true',
                context: { isBackendReady_before: isBackendReady, isUserReady }
            });
            isBackendReady = true;
            logToRailway({
                type: 'FLAGS_AFTER_SIMULATED_MATCH',
                message: 'Flags after setting isBackendReady',
                context: { isBackendReady, isUserReady }
            });

            setTimeout(() => {
                tryProceedToChat();
            }, 3000);
        }, simulatedWaitTime);
    }

    function addSystemMessage(text) {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', 'system');
        messageBubble.textContent = text;
        messageBubble.style.cssText = 'background-color: #f8f9fa; color: #666; text-align: center; font-style: italic; border: 1px dashed #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;';
        messageList.appendChild(messageBubble);
        scrollToBottom();
    }

    function startPartnerResponsePolling() {
        if (partnerPollInterval) {
            clearInterval(partnerPollInterval);
        }

        // Stop background dropout check if running - main polling takes over
        stopBackgroundDropoutCheck();

        // Start with typing indicator hidden - will show when partner actually types
        typingIndicator.style.display = 'none';
        scrollToBottom();

        // Track how long we've been waiting for partner
        let lastActivityTime = Date.now();
        const PARTNER_TIMEOUT_MS = 120000; // 2 minutes (resets if partner is typing, catches real dropouts)

        partnerPollInterval = setInterval(async () => {
            // Check if partner has been inactive too long
            const elapsedMs = Date.now() - lastActivityTime;
            if (elapsedMs >= PARTNER_TIMEOUT_MS) {
                clearInterval(partnerPollInterval);
                partnerPollInterval = null;

                logToRailway({
                    type: 'PARTNER_TIMEOUT',
                    message: 'Partner inactive for 2 minutes - assuming dropout',
                    context: { elapsed_ms: elapsedMs }
                });

                handlePartnerDropout('timeout');
                return;
            }

            try {
                // Check for both typing status AND new messages in parallel
                const [messageResponse, typingResponse] = await Promise.all([
                    fetch(`/check_partner_message?session_id=${sessionId}`),
                    fetch(`/check_partner_typing?session_id=${sessionId}`)
                ]);

                const result = await messageResponse.json();
                const typingResult = await typingResponse.json();

                // NEW: Handle artificial delay (partner_typing from check_partner_message)
                // This signals partner sent message but it's being artificially delayed
                // HARMONIZED (Jones et al. 2025): the indicator display is scripted by the
                // post-send timer and stopped on delivery — NEVER driven by the partner's
                // real typing, so its texture carries no witness-type information.
                // Real typing / delay signals are used ONLY to reset the inactivity timer.
                if (result.partner_typing || typingResult.is_typing) {
                    lastActivityTime = Date.now(); // Reset timer - partner is active
                }

                if (result.new_message) {
                    // NEW: Verify message is actually newer (prevent duplicates/out-of-order)
                    if (result.turn <= currentTurn) {
                        logToRailway({
                            type: 'MESSAGE_ORDER_WARNING',
                            message: 'Received message with turn <= currentTurn (possible duplicate)',
                            context: { received_turn: result.turn, current_turn: currentTurn }
                        });
                        return; // Skip this message, keep polling
                    }

                    clearInterval(partnerPollInterval);
                    partnerPollInterval = null;

                    // Start background dropout check while composing (human mode only)
                    // This ensures we detect if partner drops out while we're typing
                    if (isHumanPartner) {
                        startBackgroundDropoutCheck();
                    }

                    // NEW: Stop intermittent bubbles if they were running
                    if (isShowingIntermittentBubbles) {
                        stopIntermittentBubbles();
                    }

                    // Add partner's message to UI
                    addMessageToUI(result.message_text, 'assistant');

                    currentTurn = result.turn;
                    aiResponseTimestamp = result.timestamp;
                    waitingForPartner = false;

                    // Reset tab-visibility tracking for the new turn (01Aug26: parity with
                    // the AI path — previously the human path never reset these)
                    cumulativeTabHiddenMs = 0;
                    turnTabHiddenInstances = [];

                    // Hide typing indicator (important for clean UI)
                    typingIndicator.style.display = 'none';

                    // Show appropriate UI based on role
                    if (currentRole === 'interrogator') {
                        // Show rating UI for interrogator
                        assessmentAreaDiv.style.display = 'block';
                        chatInputContainer.style.display = 'none';
                        assessmentAreaDiv.querySelector('h4').textContent = "Your Assessment";

                        // Update timer message for rating phase
                        updateTimerMessage();

                        // Show binary choice section, hide confidence section
                        binaryChoiceSection.style.display = 'block';
                        confidenceSection.style.display = 'none';
                        confidenceSlider.disabled = false;

                        // Reset binary choice tracking for new turn
                        binaryChoice = null;
                        binaryChoiceStartTime = Date.now();
                        binaryChoiceTime = null;
                        binaryChoiceInProgress = false; // Reset double-click protection
                        finalResponseReason = null;
                        choiceHumanButton.disabled = false; // Re-enable buttons
                        choiceAiButton.disabled = false;

                        // FIX C4-gap (03Aug26): same rescue as the AI path — post-expiry
                        // assessment is final; arm the backstop so a stall can't strand them.
                        if (timeExpired) {
                            finalResponseReason = finalResponseReason || 'time_expired';
                            armInterrogatorFinalAssessmentBackstop();
                        }
                    } else {
                        // Witness - enable message input
                        witnessWaitingUI.style.display = 'none';  // Hide waiting spinner
                        chatInputContainer.style.display = 'flex';
                        userMessageInput.disabled = false;
                        sendMessageButton.disabled = false;
                        userMessageInput.focus();
                    }
                }

                // Check for study completion first (partner finished normally)
                if (result.study_completed) {
                    clearInterval(partnerPollInterval);
                    partnerPollInterval = null;
                    handleStudyCompleted();
                    return;
                }

                // Check for partner dropout (partner actually disconnected)
                if (result.partner_dropped) {
                    clearInterval(partnerPollInterval);
                    partnerPollInterval = null;
                    handlePartnerDropout('left');
                }

            } catch (error) {
                logToRailway({
                    type: 'PARTNER_POLLING_ERROR',
                    message: `Error polling for partner message: ${error.message}`
                });
            }
        }, 2000); // Poll every 2 seconds
    }

    // Lightweight background check for partner_dropped status while user is composing
    // This runs at a slower rate and ONLY checks for dropout/completion - no message handling
    function startBackgroundDropoutCheck() {
        // Clear any existing background check
        if (backgroundDropoutCheckInterval) {
            clearInterval(backgroundDropoutCheckInterval);
        }

        backgroundDropoutCheckInterval = setInterval(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/check_partner_message?session_id=${sessionId}`);
                const result = await response.json();

                // Only care about dropout and completion - ignore new messages (main polling handles those)
                if (result.partner_dropped) {
                    clearInterval(backgroundDropoutCheckInterval);
                    backgroundDropoutCheckInterval = null;

                    logToRailway({
                        type: 'BACKGROUND_CHECK_DETECTED_DROPOUT',
                        message: 'Background check detected partner dropout while composing',
                        context: { role: currentRole }
                    });

                    handlePartnerDropout('left');
                    return;
                }

                if (result.study_completed) {
                    clearInterval(backgroundDropoutCheckInterval);
                    backgroundDropoutCheckInterval = null;

                    logToRailway({
                        type: 'BACKGROUND_CHECK_DETECTED_COMPLETION',
                        message: 'Background check detected study completion while composing',
                        context: { role: currentRole }
                    });

                    handleStudyCompleted();
                    return;
                }
            } catch (error) {
                logToRailway({
                    type: 'BACKGROUND_DROPOUT_CHECK_ERROR',
                    message: `Error in background dropout check: ${error.message}`
                });
            }
        }, 5000); // Check every 5 seconds (slower than main polling)
    }

    function stopBackgroundDropoutCheck() {
        if (backgroundDropoutCheckInterval) {
            clearInterval(backgroundDropoutCheckInterval);
            backgroundDropoutCheckInterval = null;
        }
    }

    function handleStudyCompleted() {
        logUiEvent('partner_completed_study');

        // Clean up timer
        if (studyTimer) {
            clearInterval(studyTimer);
        }
        document.getElementById('timer-display').style.display = 'none';

        // Stop partner polling
        if (partnerPollInterval) {
            clearInterval(partnerPollInterval);
            partnerPollInterval = null;
        }

        // Stop background dropout check if running
        stopBackgroundDropoutCheck();

        // NEW: Only witnesses should see this (interrogator completed)
        if (currentRole === 'witness') {
            chatInputContainer.style.display = 'none';
            assessmentAreaDiv.style.display = 'none';

            logToRailway({
                type: 'WITNESS_SEES_PARTNER_COMPLETED',
                message: 'Witness routed to binary choice - interrogator completed study',
                context: { role: currentRole }
            });

            // Go straight to binary choice (no modal)
            showWitnessBinaryChoice('partner_completed');
        } else {
            // This shouldn't happen for interrogators (they trigger their own completion)
            logToRailway({
                type: 'UNEXPECTED_STUDY_COMPLETED_FOR_INTERROGATOR',
                message: 'WARNING: Interrogator received study_completed signal - should not happen',
                context: { role: currentRole }
            });
        }
    }

    async function handlePartnerDropout(reason = 'timeout') {
        // reason: 'left' = partner closed browser, 'timeout' = 2-min inactivity
        logUiEvent('partner_dropped', { reason });

        // Kill any scripted typing animation so bubbles can't flicker under the dropout modal
        stopIntermittentBubbles();

        // Stop partner polling
        if (partnerPollInterval) {
            clearInterval(partnerPollInterval);
            partnerPollInterval = null;
        }

        // Stop background dropout check if running
        stopBackgroundDropoutCheck();

        // Check message counts - determines if we can re-queue or need to go to final choice
        const messageCount = messageList.childElementCount;
        // Count only messages FROM partner (assistant class) - this is what matters for assessment
        const partnerMessageCount = messageList.querySelectorAll('.message-bubble.assistant').length;

        logToRailway({
            type: 'PARTNER_DROPOUT_MESSAGE_CHECK',
            message: `Partner dropped - checking message counts`,
            context: { total_messages: messageCount, partner_messages: partnerMessageCount, role: currentRole }
        });

        // Report to backend and check if we should be re-queued
        try {
            const response = await fetch(`${API_BASE_URL}/report_partner_dropped`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            const result = await response.json();

            logToRailway({
                type: 'REPORT_PARTNER_DROPPED_RESPONSE',
                message: `Backend response for partner dropout`,
                context: { result, total_messages: messageCount, partner_messages: partnerMessageCount }
            });

            // If re-queued (no messages, under 4 min total wait), go back to waiting room
            if (result.requeued) {
                logUiEvent('partner_dropped_requeued');

                logToRailway({
                    type: 'PARTNER_DROPPED_REQUEUED',
                    message: 'Partner dropped but re-queued for new match - returning to waiting room',
                    context: { role: currentRole }
                });

                // Clean up conversation state
                if (studyTimer) {
                    clearInterval(studyTimer);
                    studyTimer = null;
                }
                document.getElementById('timer-display').style.display = 'none';

                // Reset conversation UI
                messageList.innerHTML = '';
                partnerSessionId = null;
                firstMessageSender = null;
                isBackendReady = false;

                // Return to waiting room with "Finding new partner..." message
                showMainPhase('waiting-room');
                waitingStatusP.innerHTML = '<span style="color: #ffc107; font-weight: bold;">Partner disconnected. Finding new partner...</span>';

                // Show instructions again as reminder
                showRoleInstructionsInWaitingRoom(currentRole);

                // Restart match polling (will use original waiting_room_entered_at for FIFO)
                startMatchPolling();
                return;
            }

            // If timed out (exceeded 4 min total wait) AND no partner messages, redirect to Prolific
            if (result.timed_out && partnerMessageCount === 0) {
                logUiEvent('partner_dropout_timeout_exceeded', { total_messages: messageCount, partner_messages: partnerMessageCount });

                logToRailway({
                    type: 'PARTNER_DROPPED_TIMEOUT_EXCEEDED',
                    message: 'Partner dropped and total wait time exceeded with no partner messages - redirecting to Prolific',
                    context: { role: currentRole, total_messages: messageCount, partner_messages: partnerMessageCount }
                });

                // Clean up timer
                if (studyTimer) {
                    clearInterval(studyTimer);
                }
                document.getElementById('timer-display').style.display = 'none';

                // Record timeout to database
                recordTimeoutToDatabase('partner_timeout_exceeded_total_wait');
                recordCompletionCode('C19WFTZR');

                // Show popup explaining what happened before redirecting
                const overlay2 = document.createElement('div');
                overlay2.className = 'modal-overlay';
                overlay2.style.display = 'flex';
                overlay2.innerHTML = `
                    <div class="modal-content">
                        <h3 style="text-align: center; margin-top: 0;">Study Ended</h3>
                        <p style="text-align: center;">Unfortunately, your conversation partner disconnected before the conversation could begin and we were unable to find a new match. Thank you for your time — you will be redirected shortly.</p>
                        <button id="partner-dropped-timeout-btn" style="margin: 20px auto; display: block;">Continue</button>
                    </div>
                `;
                document.body.appendChild(overlay2);
                document.getElementById('partner-dropped-timeout-btn').addEventListener('click', () => {
                    prepareIntentionalRedirect();
                    if (isProduction) {
                        window.location.href = PROLIFIC_PARTNER_DROPPED_URL;
                    } else {
                        alert('DEV MODE: Partner dropped, exceeded total wait time. Would redirect to Prolific partner-dropped URL.');
                    }
                });
                return;
            }

        } catch (err) {
            logToRailway({
                type: 'REPORT_PARTNER_DROPPED_ERROR',
                message: `Failed to report partner dropout: ${err.message}`,
                context: { session_id: sessionId }
            });
            // Fall through to original logic on error
        }

        // If we get here with 0 partner messages, redirect to Prolific
        // (they may have sent messages, but never received any to assess)
        if (partnerMessageCount === 0) {
            // No messages received from partner - nothing to assess, redirect to Prolific
            logToRailway({
                type: 'PARTNER_DROPOUT_NO_PARTNER_MESSAGES',
                message: 'Partner dropped before sending any messages - redirecting to Prolific timeout',
                context: { role: currentRole, total_messages: messageCount, partner_messages: partnerMessageCount }
            });

            logUiEvent('partner_dropout_no_partner_messages', { total_messages: messageCount });

            // Clean up timer
            if (studyTimer) {
                clearInterval(studyTimer);
            }
            document.getElementById('timer-display').style.display = 'none';

            // Record timeout to database
            recordTimeoutToDatabase('partner_timeout_no_messages');
            recordCompletionCode('C19WFTZR');

            // Show popup explaining what happened before redirecting
            // Use a simple dynamically created modal to avoid triggering witness-specific handlers
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.display = 'flex';
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3 style="text-align: center; margin-top: 0;">Study Ended</h3>
                    <p style="text-align: center;">Unfortunately, your conversation partner disconnected before the conversation could begin. Thank you for your time — you will be redirected shortly.</p>
                    <button id="partner-dropped-redirect-btn" style="margin: 20px auto; display: block;">Continue</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.getElementById('partner-dropped-redirect-btn').addEventListener('click', () => {
                prepareIntentionalRedirect();
                if (isProduction) {
                    window.location.href = PROLIFIC_PARTNER_DROPPED_URL;
                } else {
                    alert('DEV MODE: Partner dropped before sending any messages. Would redirect to Prolific partner-dropped URL.');
                }
            });
            return;
        }

        // ≥1 partner message: Continue to final choice flow (they have something to assess)

        // Different handling based on role
        if (currentRole === 'witness') {
            // WITNESS: Show modal immediately - their study is over
            // Clean up timer
            if (studyTimer) {
                clearInterval(studyTimer);
            }
            document.getElementById('timer-display').style.display = 'none';

            chatInputContainer.style.display = 'none';
            assessmentAreaDiv.style.display = 'none';

            logToRailway({
                type: 'WITNESS_SEES_PARTNER_DROPOUT',
                message: 'Witness routed to binary choice - partner was inactive/dropped',
                context: { role: currentRole }
            });

            // Go straight to binary choice (no modal)
            showWitnessBinaryChoice(`partner_dropped_${reason}`);

        } else {
            // INTERROGATOR: Route to completion flow automatically
            partnerDroppedFlag = true;

            // Clean up timer
            if (studyTimer) {
                clearInterval(studyTimer);
            }
            document.getElementById('timer-display').style.display = 'none';

            // Hide chat input (can't send more messages)
            chatInputContainer.style.display = 'none';

            // Check if there's an unrated message (assessment area is visible)
            const hasUnratedMessage = assessmentAreaDiv.style.display === 'block';

            if (hasUnratedMessage) {
                // They have an unrated last message - keep assessment visible, show notification
                finalResponseReason = `partner_dropped_with_unrated_message_${reason}`;
                logToRailway({
                    type: 'INTERROGATOR_PARTNER_DROPPED_WITH_UNRATED',
                    message: 'Partner dropped - interrogator has unrated message, showing notification and keeping assessment visible',
                    context: { role: currentRole }
                });

                // Show brief notification modal
                interrogatorConnectionModal.style.display = 'flex';

                // Auto-close after 4 seconds (cancellable if user clicks Continue first — C1)
                interrogatorConnectionModalTimeout = setTimeout(() => {
                    interrogatorConnectionModalTimeout = null;
                    interrogatorConnectionModal.style.display = 'none';

                    // Update assessment UI to indicate this is final rating
                    const assessmentTitle = assessmentAreaDiv.querySelector('h4');
                    if (assessmentTitle) {
                        assessmentTitle.textContent = "Your partner has disconnected. Please submit your final rating for this message:";
                    }

                    logToRailway({
                        type: 'INTERROGATOR_NOTIFIED_SUBMIT_FINAL_RATING',
                        message: 'Auto-closed notification, interrogator can now submit final rating',
                        context: { role: currentRole }
                    });
                }, 4000);

            } else {
                // No unrated message - but they still need to make a FINAL assessment
                // Show the assessment UI for their final judgment
                logToRailway({
                    type: 'INTERROGATOR_PARTNER_DROPPED_NO_UNRATED',
                    message: 'Partner dropped - showing final assessment UI',
                    context: { role: currentRole }
                });

                // Show brief notification modal
                interrogatorConnectionModal.style.display = 'flex';

                // Auto-close after 3 seconds and show final assessment (cancellable — C1)
                interrogatorConnectionModalTimeout = setTimeout(() => {
                    interrogatorConnectionModalTimeout = null;
                    interrogatorConnectionModal.style.display = 'none';

                    showInterrogatorFinalAssessment(
                        `partner_dropped_no_unrated_message_${reason}`,
                        "Your partner has disconnected. Please make your final assessment:"
                    );

                    logToRailway({
                        type: 'INTERROGATOR_SHOWN_FINAL_ASSESSMENT',
                        message: 'Auto-closed notification, showing final assessment UI',
                        context: { role: currentRole }
                    });
                }, 3000);
            }
        }
    }

    function addMessageToUI(text, sender) {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', sender);
        messageBubble.textContent = text;
        messageList.appendChild(messageBubble);

        // FIX: Wait for the browser to render the new message before scrolling.
        // This ensures scrollHeight has the correct, updated value.
        scrollToBottom();

        // Log to Railway only
        logToRailway({
            type: 'UI_DEBUG',
            message: `Added message from ${sender}. messageList.childElementCount: ${messageList.childElementCount}`,
            context: {
                function: 'addMessageToUI',
                sender: sender,
                message_count: messageList.childElementCount
            }
        });
    }

    function generateAndDownloadPdf(content, filename) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // --- NEW: Page Layout Logic ---
            const leftMargin = 15;
            const topMargin = 20;
            const bottomMargin = 20;
            const lineHeight = 7; // Adjust this value to increase/decrease line spacing
            let y = topMargin; // This will be our vertical cursor

            // Get the dimensions of the page
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const usableWidth = pageWidth - (leftMargin * 2);

            doc.setFontSize(12);

            // Split the text into lines that fit the page width
            const lines = doc.splitTextToSize(content, usableWidth);
            
            // Loop through each line of text
            lines.forEach(line => {
                // Check if adding the next line would go off the page
                if (y + lineHeight > pageHeight - bottomMargin) {
                    doc.addPage();      // If so, add a new page
                    y = topMargin;      // and reset our vertical cursor to the top
                }
                
                // Add the line of text to the page
                doc.text(line, leftMargin, y);
                
                // Move the vertical cursor down for the next line
                y += lineHeight;
            });
            // --- END: New Logic ---

            doc.save(filename);
            // Log to Railway only
            logToRailway({
                type: 'PDF_DOWNLOAD',
                message: `PDF "${filename}" download initiated`,
                context: { filename: filename }
            });

        } catch (error) {
            // Log to Railway only
            logToRailway({
                type: 'PDF_GENERATION_ERROR',
                message: error.message,
                stack: error.stack,
                context: { filename: filename }
            });
            showError('There was a problem generating the PDF download. Please contact the researcher.');
        }
    }

    // --- NEW: Consent Logic ---
    agreeButton.addEventListener('click', () => {
        logUiEvent('consent_agree_clicked');
        enableSuspiciousBehaviorTracking();
        // When user agrees, hide the main text and buttons, and show the download prompt.
        consentContentInterrogatorDiv.style.display = 'none';
        consentContentWitnessDiv.style.display = 'none';
        consentActionsDiv.style.display = 'none';
        consentDownloadPromptDiv.style.display = 'block';
    });

    disagreeButton.addEventListener('click', async () => {
        logUiEvent('consent_disagree_clicked');
        await finalizeNoSession('consent_disagreed');

        // --- MODIFICATION START ---
        prepareIntentionalRedirect();
        recordCompletionCode('C120SCQ9');
        if (isProduction) {
            window.location.href = PROLIFIC_NO_CONSENT_URL;
        } else {
            // Keep the original behavior for local testing
            mainContainer.innerHTML = `
                <h2>Study Ended (DEV MODE)</h2>
                <p>You must consent to participate. In production, you would be redirected to Prolific.</p>
            `;
        }
    });

    skipConsentDownloadButton.addEventListener('click', () => {
        logUiEvent('consent_skip_download_clicked');

        // Attach beforeunload early so dropout between consent and demographics is caught
        if (isProduction && handleEarlyExit && !earlyExitAttached) {
            window.addEventListener('beforeunload', handleEarlyExit);
            window.addEventListener('unload', handleActualExit);
            earlyExitAttached = true;
        }

        // If they skip download, just move to the next phase.
        showMainPhase('instructions'); // CHANGE 'initial' to 'instructions'
        showPreDemoInstructions(); // Show role/mode-specific instructions
    });

    downloadConsentButton.addEventListener('click', () => {
        logUiEvent('consent_download_clicked');
        const timestamp = new Date().toLocaleString();

        // Role-specific consent text matching IRB-approved forms
        let consentText;
        if (assignedRole === 'interrogator') {
            consentText = `
CONSENT TO PARTICIPATE IN RESEARCH
Principal Investigator: Nykko Vitali (nvitali@fas.harvard.edu)
Faculty Sponsor: Jason Mitchell
Participant ID: ${participantId}
Prolific ID: ${prolificPid || 'N/A'}

[CONSENT RECORDED: Participant agreed to participate on ${timestamp}]

About this Study
You are being asked to participate in a research study. This form provides you with information about the study.

Purpose of Research
This research examines how people evaluate text-based conversations and how these judgments change over time.

What You Will Be Asked to Do
If you agree to participate, you will:
- Engage in a text-based conversation with another person or with a Large Language Model (such as Chat-GPT)
- Determine if you're talking to a human or an AI each turn
- Rate your confidence in that guess on a sliding scale (0% = completely guessing, 100% = completely certain)
- Provide a comment about your experience at the end of the conversation
- Complete a brief demographic questionnaire at the end
- The total time commitment will be approximately 15 minutes
- You are free to share information as you see fit during the conversation but should not share more than you would be willing to share with a stranger

Your Rights as a Participant
- Your participation is voluntary.
- You may stop at any time.
- You may choose not to answer any question.
- You may not be told everything about the purpose of this research study initially, but you will be fully informed after completion.

Risks and Benefits
- You may be matched with a human participant, and due to the unpredictable nature of online conversations your conversational partner may use language you consider offensive
- While there are no direct benefits to you, your participation helps advance our understanding of human-AI interaction and judgment processes

Compensation
- You will receive compensation equivalent to $8.00 per hour for your participation through the online platform
- You will be compensated for your time spent on the study if you leave as a result of your partner saying something offensive during the course of the conversation
- You will be compensated for your time spent on the study if your partner leaves early for any reason

Confidentiality
- Your responses will be stored securely
- If you are matched with an AI, conversations are processed under Harvard's institutional agreement; your responses will not be used to train AI models
- Data will be analyzed without any identifying information
- Only researchers will have access to the data
- Anonymized results derived from your data may be shared in scientific databases for transparency of our research process
- Any personally identifying information you may share during conversations will be removed from analyses and will not be used in research outputs
- Analyses (quantitative and qualitative) will be carried out on any text you write during the study

Questions or Concerns?
- For questions about the research: Contact the Principal Investigator at nvitali@fas.harvard.edu
- For questions about your rights as a participant: Contact cuhs@harvard.edu

Agreement to Participate
By clicking "I agree" below, you indicate that:
- You are at least 18 years old.
- You have read and understood this consent form.
- You voluntarily agree to participate.
- You understand you can withdraw at any time.

[PARTICIPANT ACCEPTED THE ABOVE TERMS ON ${new Date().toLocaleString()}]
            `;
        } else {
            consentText = `
CONSENT TO PARTICIPATE IN RESEARCH
Principal Investigator: Nykko Vitali (nvitali@fas.harvard.edu)
Faculty Sponsor: Jason Mitchell
Participant ID: ${participantId}
Prolific ID: ${prolificPid || 'N/A'}

[CONSENT RECORDED: Participant agreed to participate on ${timestamp}]

About this Study
You are being asked to participate in a research study. This form provides you with information about the study.

Purpose of Research
This research examines how people evaluate text-based conversations and how these judgments change over time.

What You Will Be Asked to Do
If you agree to participate, you will:
- Engage in a text-based conversation with another person
- Emulate an assigned conversation style throughout your conversation
- Provide a comment about your experience at the end of the conversation
- Complete a brief demographic questionnaire at the end
- The total time commitment will be approximately 15 minutes
- You are free to share information as you see fit during the conversation but should not share more than you would be willing to share with a stranger

Your Rights as a Participant
- Your participation is voluntary.
- You may stop at any time.
- You may choose not to answer any question.
- You may not be told everything about the purpose of this research study initially, but you will be fully informed after completion.

Risks and Benefits
- You will be matched with a participant, and due to the unpredictable nature of online conversations your conversational partner may use language you consider offensive
- While there are no direct benefits to you, your participation helps advance our understanding of human interaction and judgment processes

Compensation
- You will receive compensation equivalent to $8.00 per hour for your participation through the online platform
- You will be compensated for your time spent on the study if you leave as a result of your partner saying something offensive during the course of the conversation
- You will be compensated for your time spent on the study if your partner leaves early for any reason

Confidentiality
- Your responses will be stored securely
- Data will be analyzed without any identifying information
- Only researchers will have access to the data
- Anonymized results derived from your data may be shared in scientific databases for transparency of our research process
- Any personally identifying information you may share during conversations will be removed from analyses and will not be used in research outputs
- Analyses (quantitative and qualitative) will be carried out on any text you write during the study

Questions or Concerns?
- For questions about the research: Contact the Principal Investigator at nvitali@fas.harvard.edu
- For questions about your rights as a participant: Contact cuhs@harvard.edu

Agreement to Participate
By clicking "I agree" below, you indicate that:
- You are at least 18 years old.
- You have read and understood this consent form.
- You voluntarily agree to participate.
- You understand you can withdraw at any time.

[PARTICIPANT ACCEPTED THE ABOVE TERMS ON ${new Date().toLocaleString()}]
            `;
        }
        
        generateAndDownloadPdf(consentText, `Consent_Form_${participantId}.pdf`);

        // Attach beforeunload early so dropout between consent and demographics is caught
        if (isProduction && handleEarlyExit && !earlyExitAttached) {
            window.addEventListener('beforeunload', handleEarlyExit);
            window.addEventListener('unload', handleActualExit);
            earlyExitAttached = true;
        }

        // Move to the next phase after starting the download.
        showMainPhase('instructions'); // CHANGE 'initial' to 'instructions'
        showPreDemoInstructions(); // Show role/mode-specific instructions
    });

    // --- Prolific Dropout and Completion Logic ---
    let handleEarlyExit = null; // Declare the variable first
    let handleActualExit = null; // Handler for when they actually leave
    let earlyExitAttached = false; // Prevent double-attach

    if (isProduction) {
        // 1. DEFINE the function that will handle premature exits (beforeunload)
        handleEarlyExit = (event) => {
            // Skip if this is an intentional redirect (timeout, completion, partner drop, etc.)
            if (isIntentionalRedirect) return;

            // Show browser warning dialog
            logUiEvent('navigation_warning_shown', {
                timestamp: Date.now(),
                turn: currentTurn,
                sessionId: sessionId,
                role: currentRole
            });

            event.preventDefault();
            event.returnValue = ''; // Required for Chrome
            return ''; // Required for some browsers
        };

        // 2. DEFINE handler for when they ACTUALLY leave (clicked "Leave" in dialog)
        handleActualExit = () => {
            // Skip if this is an intentional redirect (timeout, completion, partner drop, etc.)
            if (isIntentionalRedirect) return;

            logToRailway({
                type: 'USER_ABANDONED_STUDY',
                message: 'User confirmed navigation away from study',
                context: {
                    sessionId: sessionId,
                    turn: currentTurn,
                    role: currentRole
                }
            });

            // Send beacon to backend IMMEDIATELY (works even as page unloads)
            // Use participantId as fallback when sessionId isn't set yet
            // (e.g., dropout between consent and demographics submission)
            if (sessionId || participantId) {
                const payload = JSON.stringify({
                    session_id: sessionId,
                    participant_id: participantId,
                    prolific_pid: prolificPid,
                    reason: 'navigation_abandonment'
                });

                // Send to backend to mark abandoned and notify partner
                navigator.sendBeacon(`${API_BASE_URL}/report_abandonment`, payload);
            }

            // Redirect to Prolific abandoned (page refresh/close)
            recordCompletionCode('CZSGWT2I');
            window.location.href = PROLIFIC_ABANDONED_URL;
        };
    }

    // 1. First, we define the function that shows the summary page.
    // It MUST come before the buttons that use it.
    function showSummaryPhase() {
        debriefPhaseDiv.style.display = 'none';
        summaryPhaseDiv.style.display = 'block';
    }

    // 2. Now, we create the event listener for the debrief download button.
    downloadDebriefButton.addEventListener('click', () => {
        const debriefText = `
STUDY DEBRIEF FORM
Date: ${new Date().toLocaleString()}
Participant ID: ${participantId}
Prolific ID: ${prolificPid || 'N/A'}
Session ID: ${sessionId || 'N/A'}

Thank you for participating in our research study. Now that you have completed the study, we would like to explain its purpose in more detail.

Purpose of the Research
This study examines how people detect AI-generated communication and the cognitive processes underlying these judgments. We are specifically interested in understanding whether individuals possess implicit detection abilities, such as gut feelings, for identifying AI, even when they cannot explicitly articulate their suspicions. We also are investigating which specific conversational tactics most effectively lead humans to believe they are interacting with another human rather than AI.

Why We Did Not Tell You Everything Initially
When participants know exactly what researchers are studying, it can sometimes influence their responses and make them hyper-aware of potential AI "tells" or tactics. To get natural responses about your evolving confidence during the conversation, we did not tell you specifically that we were studying particular humanization tactics or measuring implicit detection processes. You were told the study involved determining whether you were talking to a human or AI, which was true, but we did not disclose our specific interest in how particular conversational strategies influence your moment-to-moment judgments.

The Complete Picture
In this study, you either engaged in a conversation while providing ratings about whether you believed you were interacting with a human or AI, or you were told to emulate a particular conversation style while chatting with another human. What you may not have realized is that:

- If you made decisions your partner was either an AI or a human. If you were told to adopt a specific persona, your partner was always a human.

- Your ratings and the time you took to make each rating allow us to model how evidence accumulated in your mind toward an "AI" or "human" decision. This helps us understand the cognitive processes behind AI belief.

- Our hypothesis is that people possess subtle, implicit abilities to detect AI-generated communication that may not always rise to conscious awareness. We also predict that certain conversational tactics will be more effective at convincing humans they are talking to another person. By analyzing your moment-to-moment confidence changes alongside the specific tactics the AI or human used, we can better understand which strategies most effectively influence human judgment of AI authenticity.

Questions or Concerns
If you have any questions about this research, please contact the Principal Investigator, Nykko Vitali, at nvitali@fas.harvard.edu. If you have any concerns about your rights as a research participant, you may contact cuhs@harvard.edu

Use of Your Data
If you are comfortable with us using your responses now that you know the full purpose of the study, you don't need to do anything. If you would prefer that we not use your responses, please reach out to the Principal Investigator and let them know. We will then remove your data from the study and delete it.

Thank you again for your participation!

        `;
        generateAndDownloadPdf(debriefText, `Debrief_Form_${sessionId || participantId}.pdf`);

        // Clear participantId so next session gets fresh role assignment
        localStorage.removeItem('participantId');

        if (isProduction) {
            prepareIntentionalRedirect();

            // Redirect to Prolific after a short delay to ensure download starts
            recordCompletionCode('CR0KFVQO');
            setTimeout(() => {
                window.location.href = PROLIFIC_COMPLETION_URL;
            }, 500);
        } else {
            // For local testing, just proceed to the summary page
            showSummaryPhase();
        }
    });

    // 3. We create the event listener for the continue button.
    continueAfterDebriefButton.addEventListener('click', () => {
        // Clear participantId so next session gets fresh role assignment
        localStorage.removeItem('participantId');

        if (isProduction) {
            prepareIntentionalRedirect();
            recordCompletionCode('CR0KFVQO');
            window.location.href = PROLIFIC_COMPLETION_URL;
        } else {
            // For local testing, just proceed to the summary page
            showSummaryPhase();
        }
    });

    // Route witness directly to binary choice (no modal)
    function showWitnessBinaryChoice(reason) {
        // #1 guard: this can be called twice — once by the witness's own 7.5-min timer
        // ('time_expired') and again by the partner-drop detector ('partner_dropped_*'). The second
        // call would reset binaryChoiceInProgress/finalResponseReason and re-render the buttons
        // mid-submit, clobbering an in-flight final. First call wins; ignore any later re-route.
        if (witnessBinaryShown) {
            logToRailway({
                type: 'WITNESS_BINARY_REROUTE_IGNORED',
                message: 'Ignored repeat witness binary-choice routing (final already shown)',
                context: { existingReason: finalResponseReason, newReason: reason }
            });
            return;
        }
        witnessBinaryShown = true;
        finalResponseReason = reason;
        logUiEvent('witness_routed_to_binary_choice', { reason });

        logToRailway({
            type: 'WITNESS_ROUTED_TO_BINARY_CHOICE',
            message: `Witness routed to binary choice - reason: ${reason}`,
            context: { role: currentRole, turn: currentTurn, reason }
        });

        // Show binary choice UI for witness
        showMainPhase('chat_and_assessment_flow');

        // Hide chat-specific elements, show assessment
        const chatWindow = document.querySelector('.chat-window');
        if (chatWindow) chatWindow.style.display = 'none';
        chatInputContainer.style.display = 'none';

        // Hide the style header — witness is done chatting
        const conversationHeader = document.getElementById('conversation-header');
        if (conversationHeader) {
            conversationHeader.style.display = 'none';
            conversationHeader.innerHTML = '';
        }

        // Show context message for partner dropout/completion (not for timer expired)
        let contextMessage = '';
        if (reason === 'partner_dropped_left') {
            contextMessage = 'Your conversation partner has disconnected. The study has ended. You will now be routed to finish the study.';
        } else if (reason === 'partner_dropped_timeout') {
            contextMessage = 'Your conversation partner was inactive for too long. The study has ended. You will now be routed to finish the study.';
        } else if (reason === 'partner_completed') {
            contextMessage = 'The conversation has completed. Please indicate whether you believe your partner was Human or AI below.';
        }

        // Remove any previous context message
        const existingMsg = document.getElementById('witness-end-context-message');
        if (existingMsg) existingMsg.remove();

        if (contextMessage) {
            const msgDiv = document.createElement('div');
            msgDiv.id = 'witness-end-context-message';
            msgDiv.style.cssText = 'text-align: center; padding: 12px; margin-bottom: 15px; background: #f8f9fa; border-radius: 6px; color: #333;';
            msgDiv.textContent = contextMessage;
            assessmentAreaDiv.insertBefore(msgDiv, assessmentAreaDiv.firstChild);
        }

        // Show assessment area and its content
        assessmentAreaDiv.style.display = 'block';
        interrogatorRatingUI.style.display = 'block';

        // Reset binary choice state
        binaryChoice = null;
        binaryChoiceStartTime = Date.now();
        binaryChoiceInProgress = false;

        // Show binary choice buttons and enable them
        binaryChoiceSection.style.display = 'block';
        confidenceSection.style.display = 'none';

        choiceHumanButton.disabled = false;
        choiceAiButton.disabled = false;

        // Update prompt for witness
        const binaryPrompt = document.getElementById('binary-choice-prompt');
        if (binaryPrompt) {
            binaryPrompt.textContent = 'Now that you have finished chatting with your partner, please tell us whether you believe your partner was a Human or an AI by selecting one of the buttons below:';
        }

        // Update assessment title
        const assessmentTitle = assessmentAreaDiv.querySelector('h4');
        if (assessmentTitle) {
            assessmentTitle.textContent = "Your Final Assessment";
        }

        // Start 2-minute timer for witness final response. T2: they already finished the
        // conversation, so use the post-study issue redirect (correct code + "you'll be paid"
        // message), not the waiting-room timeout code.
        startScreenTimer(SCREEN_TIMEOUT_MS, 'witness_final_response', showPostStudyIssueRedirect);
    }

    function showInterrogatorFinalAssessment(reason, titleText = "Please make your final assessment:") {
        finalResponseReason = reason;

        if (partnerPollInterval) {
            clearInterval(partnerPollInterval);
            partnerPollInterval = null;
        }
        stopBackgroundDropoutCheck();
        stopIntermittentBubbles();

        chatInputContainer.style.display = 'none';
        assessmentAreaDiv.style.display = 'block';
        interrogatorRatingUI.style.display = 'block';
        witnessWaitingUI.style.display = 'none';

        binaryChoice = null;
        binaryChoiceStartTime = Date.now();
        binaryChoiceTime = null;
        binaryChoiceInProgress = false;
        // 01Aug26: scope tab-visibility tracking to the final-assessment window
        cumulativeTabHiddenMs = 0;
        turnTabHiddenInstances = [];
        binaryChoiceSection.style.display = 'block';
        confidenceSection.style.display = 'none';
        choiceHumanButton.disabled = false;
        choiceAiButton.disabled = false;

        const assessmentTitle = assessmentAreaDiv.querySelector('h4');
        if (assessmentTitle) {
            assessmentTitle.textContent = titleText;
            assessmentTitle.style.display = 'block';
        }

        logToRailway({
            type: 'INTERROGATOR_FINAL_ASSESSMENT_SHOWN',
            message: 'Final assessment UI shown for interrogator',
            context: { reason, role: currentRole, turn: currentTurn }
        });

        // C5: backstop — never leave the interrogator stuck on the final assessment with no exit.
        armInterrogatorFinalAssessmentBackstop();
    }

    // Shared "you finished — issue capturing your answer, you'll still be paid" exit, used for
    // post-conversation capture failures (interrogator + witness final-assessment timeouts).
    // Delegates to the exit-scenario taxonomy so all exits share one message/code source of truth.
    function showPostStudyIssueRedirect() {
        endStudyWithScenario('post_study_issue');
    }

    // C5: arm the 2-min backstop on the interrogator final assessment. Saves any choice already
    // made, then routes to the post-study issue redirect. A successful submit (showMainPhase) clears it.
    function armInterrogatorFinalAssessmentBackstop() {
        startScreenTimer(SCREEN_TIMEOUT_MS, 'interrogator_final_assessment', () => {
            if (binaryChoice) {
                submitInterrogatorFinalChoiceWithRetry(binaryChoice, 'final_assessment_timeout');
            }
            showPostStudyIssueRedirect();
        });
    }

    // Keep modal button as fallback (shouldn't be needed now)
    witnessEndContinueButton.addEventListener('click', () => {
        witnessEndModal.style.display = 'none';
        showWitnessBinaryChoice('modal_continue');

        logToRailway({
            type: 'WITNESS_BINARY_CHOICE_SHOWN',
            message: 'Witness binary choice UI displayed - will route to comment after selection',
            context: {
                role: currentRole,
                turn: currentTurn,
                binaryChoiceSectionVisible: binaryChoiceSection ? binaryChoiceSection.style.display : 'unknown',
                assessmentAreaVisible: assessmentAreaDiv.style.display
            }
        });
    });

    // C1: "Continue to Final Assessment" must COLLECT the final rating, not skip to feedback.
    interrogatorConnectionContinueButton.addEventListener('click', () => {
        logUiEvent('interrogator_connection_modal_continue_clicked');

        // Cancel any pending auto-close so it can't re-fire and reset the assessment.
        if (interrogatorConnectionModalTimeout) {
            clearTimeout(interrogatorConnectionModalTimeout);
            interrogatorConnectionModalTimeout = null;
        }

        // Hide modal
        interrogatorConnectionModal.style.display = 'none';

        // Clean up timer
        if (studyTimer) {
            clearInterval(studyTimer);
        }
        document.getElementById('timer-display').style.display = 'none';

        // Honor the label: take them to the final assessment (collect the rating).
        const partnerMessageCount = messageList.querySelectorAll('.message-bubble.assistant').length;
        const assessmentPending = assessmentAreaDiv.style.display === 'block'
            && binaryChoiceSection.style.display === 'block' && binaryChoice === null;

        if (partnerMessageCount === 0) {
            // Nothing to judge (defensive — modal normally only shows with >=1 partner message)
            showMainPhase('feedback');
            logToRailway({
                type: 'INTERROGATOR_PROCEEDED_TO_FEEDBACK',
                message: 'Connection modal continue with no partner message - feedback',
                context: { role: currentRole }
            });
        } else if (assessmentPending) {
            // Assessment already on screen — keep it, just set the final title.
            const assessmentTitle = assessmentAreaDiv.querySelector('h4');
            if (assessmentTitle) {
                assessmentTitle.textContent = "Your partner has disconnected. Please make your final assessment:";
                assessmentTitle.style.display = 'block';
            }
            logToRailway({
                type: 'INTERROGATOR_CONTINUE_TO_PENDING_ASSESSMENT',
                message: 'Connection modal continue - kept pending final assessment visible',
                context: { role: currentRole }
            });
        } else {
            showInterrogatorFinalAssessment(
                finalResponseReason || 'partner_connection_issue',
                'Your partner disconnected. Please make your final assessment:'
            );
            logToRailway({
                type: 'INTERROGATOR_CONTINUE_TO_FINAL_ASSESSMENT',
                message: 'Connection modal continue - showing final assessment to collect rating',
                context: { role: currentRole }
            });
        }
    });

    // NEW: AI connection failure modal button - handles both scenarios
    aiConnectionButton.addEventListener('click', () => {
        const scenario = aiConnectionButton.dataset.scenario;

        logUiEvent('ai_connection_modal_button_clicked', { scenario: scenario });

        // Hide modal
        aiConnectionModal.style.display = 'none';

        if (scenario === 'end_study') {
            // Check if AI ever sent any messages
            const aiMessageCount = messageList.querySelectorAll('.message-bubble.assistant').length;

            if (aiMessageCount === 0) {
                // AI never responded — technical/system fault, not the participant's.
                logToRailway({
                    type: 'AI_FAILURE_NO_MESSAGES',
                    message: 'AI connection failed and never sent any messages - redirecting to Prolific',
                    context: { scenario: 'end_study', aiMessageCount: 0 }
                });
                endStudyWithScenario('technical_issue', 'ai_connection_no_messages');
                return;
            }

            // ≥1 AI messages received: collect a final judgment before feedback.
            // Clean up timer
            if (studyTimer) {
                clearInterval(studyTimer);
            }
            document.getElementById('timer-display').style.display = 'none';

            showInterrogatorFinalAssessment(
                'ai_connection_failed_after_messages',
                'The connection failed. Please make your final assessment:'
            );

            logToRailway({
                type: 'AI_FAILURE_END_STUDY',
                message: 'AI connection failed with timer expired - routing to final assessment',
                context: { scenario: 'end_study', aiMessageCount: aiMessageCount }
            });

        } else {
            // Scenario 1: Time remaining - just dismiss, user can retry sending message
            logToRailway({
                type: 'AI_FAILURE_RETRY',
                message: 'AI connection failed but time remaining - user can retry sending message',
                context: { scenario: 'retry' }
            });
            // Chat input is already enabled from catch block - user can just send again
        }
    });

    // Instruction pagination navigation
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
            if (currentInstructionPage < totalInstructionPages) {
                currentInstructionPage++;
                updateInstructionPage();
                logUiEvent('instruction_next_clicked', { page: currentInstructionPage });
            }
        });
    }

    confirmInstructionsButton.addEventListener('click', async () => {
        logUiEvent('instructions_understand_clicked', { finalPage: currentInstructionPage });
        confirmInstructionsButton.disabled = true;

        try {
            // Initialize study (without demographics - those come after the conversation)
            const data = {
                participant_id: participantId,
                prolific_pid: prolificPid,
                role: assignedRole,
                social_style: assignedSocialStyle
            };

            const response = await fetch('/initialize_study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Failed to initialize study.');
            }

            sessionId = result.session_id;
            localStorage.setItem('sessionId', sessionId);
            currentTurn = 0;
            messageList.innerHTML = '';

            // Attach beforeunload if not already attached
            if (isProduction && handleEarlyExit && !earlyExitAttached) {
                window.addEventListener('beforeunload', handleEarlyExit);
                window.addEventListener('unload', handleActualExit);
                earlyExitAttached = true;
            }

            // Determine AI vs human mode
            await enterWaitingRoom();

            // Show post-demo instructions with role assignment
            if (isHumanPartner) {
                currentRole = assignedRole;

                if (currentRole === 'witness' && assignedSocialStyle) {
                    witnessStyleNameSpan.textContent = styleLabel(assignedSocialStyle);
                    if (witnessStyleName2Span) witnessStyleName2Span.textContent = styleLabel(assignedSocialStyle);
                    witnessStyleDescriptionP.textContent = assignedSocialStyleDescription || '';
                }

                showRoleAssignment(currentRole);
            } else {
                currentRole = 'interrogator';
                showRoleAssignment('interrogator');
            }
        } catch (error) {
            logToRailway({
                type: 'INITIALIZATION_ERROR',
                message: `Study initialization failed: ${error.message}`,
                context: { error: error }
            });
            confirmInstructionsButton.disabled = false;
            showError('Failed to initialize study. Please refresh and try again.');
        }
    });

    modalContinueButton.addEventListener('click', () => {
        logUiEvent('demographics_modal_continue_clicked');
        demographicsModal.style.display = 'none';
        // Demographics modal no longer needed - demographics moved to after conversation
    });

    // Post-demographics instruction pagination navigation
    if (postDemoPrevBtn) {
        postDemoPrevBtn.addEventListener('click', () => {
            if (currentPostDemoPage > 1) {
                currentPostDemoPage--;
                updatePostDemoPage();
                logUiEvent('post_demo_prev_clicked', { page: currentPostDemoPage });
            }
        });
    }

    if (postDemoNextBtn) {
        postDemoNextBtn.addEventListener('click', () => {
            if (currentPostDemoPage === totalPostDemoPages) {
                // On attention check page - validate before proceeding
                if (validateAttentionCheck()) {
                    // Correct! Hide nav and show Enter Waiting Room button
                    document.getElementById('post-demo-nav').style.display = 'none';
                    enterWaitingRoomButton.style.display = 'block';
                }
                // If wrong, validateAttentionCheck shows error, user can retry
            } else if (currentPostDemoPage < totalPostDemoPages) {
                currentPostDemoPage++;
                updatePostDemoPage();
                logUiEvent('post_demo_next_clicked', { page: currentPostDemoPage });
            }
        });
    }

    // finalInstructionsButton handler removed - initialization now happens directly on form submit
    // --- Event Listeners ---
    // handleEarlyExit already declared above, no need to redeclare

    initialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        logUiEvent('demographics_form_submitted');

        // Pre-validate and build data before submitting
        const formData = new FormData(initialForm);

        // Validate required Likert bubbles
        const requiredLikerts = ['self_detection_speed', 'others_detection_speed', 'ai_capabilities_rating', 'trust_in_ai'];
        for (const field of requiredLikerts) {
            if (!formData.get(field)) {
                showError("Please select a value for all rating questions.");
                return;
            }
        }

        // Validate AI usage frequency and models
        const ai_usage_frequency_val = formData.get('ai_usage_frequency');
        if (!ai_usage_frequency_val) {
            showError("Please select your AI usage frequency.");
            return;
        }
        const ai_models_used_vals = formData.getAll('ai_models_used');
        if (ai_usage_frequency_val !== '0' && ai_models_used_vals.length === 0) {
            showError("Since you use AI chatbots, please select at least one model you have used.");
            return;
        }
        if (ai_usage_frequency_val === '0' && ai_models_used_vals.length > 0) {
            showError("You selected 'Never' for AI usage, but also selected specific models. Please correct your selection.");
            return;
        }

        // Validate demographics
        const ageStr = formData.get('age');
        const genderVal = formData.get('gender');
        const educationVal = formData.get('education');
        const incomeVal = formData.get('income');
        const ethnicityVals = formData.getAll('ethnicity');

        const ageNum = parseInt(ageStr, 10);
        if (!ageStr || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
            showError("Please enter a valid age (18-100).");
            return;
        }
        if (!genderVal) {
            showError("Please select a gender.");
            return;
        }
        if (!educationVal) {
            showError("Please select your highest education level.");
            return;
        }
        if (!incomeVal) {
            showError("Please select your annual household income.");
            return;
        }
        if (ethnicityVals.length === 0) {
            showError("Please select at least one ethnicity option.");
            return;
        }

        // Validate new demographics
        const politicalAffiliationVal = formData.get('political_affiliation');
        if (!politicalAffiliationVal) {
            showError("Please select your political affiliation.");
            return;
        }
        const socialMediaVals = formData.getAll('social_media');
        if (socialMediaVals.length === 0) {
            showError("Please select at least one social media platform option (or 'None').");
            return;
        }
        // Enforce 'None' as an exclusive selection
        if (socialMediaVals.includes('none') && socialMediaVals.length > 1) {
            showError("If you select 'None', please don't select other platforms.");
            return;
        }
        const internetUsageVal = formData.get('internet_usage_per_week');
        if (!internetUsageVal) {
            showError("Please select your hours of internet use per week.");
            return;
        }

        const data = {
            session_id: sessionId,
            ai_usage_frequency: parseInt(ai_usage_frequency_val, 10),
            ai_models_used: ai_models_used_vals,
            self_detection_speed: parseInt(formData.get('self_detection_speed'), 10),
            others_detection_speed: parseInt(formData.get('others_detection_speed'), 10),
            ai_capabilities_rating: parseInt(formData.get('ai_capabilities_rating'), 10),
            trust_in_ai: parseInt(formData.get('trust_in_ai'), 10),
            age: ageNum,
            gender: genderVal,
            education: educationVal,
            ethnicity: formData.getAll('ethnicity'),
            income: incomeVal,
            political_affiliation: politicalAffiliationVal,
            social_media_platforms: socialMediaVals,
            internet_usage_per_week: parseInt(internetUsageVal, 10)
        };

        // Disable form while submitting
        initialForm.querySelector('button').disabled = true;
        setInitialFormControlsDisabled(true);

        logToRailway({
            type: 'DEMOGRAPHICS_SUBMITTING',
            message: 'Submitting demographics after conversation',
            context: { session_id: sessionId }
        });

        try {
            const response = await fetch('/submit_demographics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Failed to submit demographics.');
            }

            logToRailway({
                type: 'DEMOGRAPHICS_SUBMITTED_SUCCESS',
                message: 'Demographics submitted - routing to debrief',
                context: { role: currentRole }
            });

            // Proceed to debrief
            showMainPhase('final');
            if (currentRole === 'witness' || !finalSummaryData) {
                // Witness or no summary data: show debrief directly
                debriefPhaseDiv.style.display = 'block';
                summaryPhaseDiv.style.display = 'none';
            } else {
                // Interrogator with summary data: show summary + debrief
                displayFinalPage(finalSummaryData);
            }

        } catch (error) {
            logToRailway({
                type: 'DEMOGRAPHICS_SUBMIT_ERROR',
                message: `Demographics submission failed: ${error.message}`,
                context: { error: error }
            });
            const formButton = initialForm.querySelector('button');
            if (formButton) formButton.disabled = false;
            setInitialFormControlsDisabled(false);
            showError('Failed to submit demographics. Please try again.');
        }
    });
    
    // *** FIX: ADDING THE MISSING EVENT LISTENERS BACK ***
    sendMessageButton.addEventListener('click', handleSendMessage);
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // NEW: Real typing detection for human-human conversations
    let typingSignalTimeout = null;
    userMessageInput.addEventListener('input', () => {
        // Reset inactivity timer on any typing
        resetConversationInactivityTimer();

        // NEW: Track message composition time (for ALL modes - witness and interrogator)
        if (messageCompositionStartTime === null && userMessageInput.value.trim().length > 0) {
            messageCompositionStartTime = Date.now();
            logToRailway({
                type: 'MESSAGE_COMPOSITION_START',
                message: 'User started typing message',
                context: { role: currentRole, timestamp: messageCompositionStartTime }
            });
        }

        // Only send typing signals in human partner mode
        if (!isHumanPartner || !sessionId || waitingForPartner) {
            return;
        }

        // Debounce: Send signal at most once per second
        if (typingSignalTimeout) {
            clearTimeout(typingSignalTimeout);
        }

        // Send typing signal
        fetch('/signal_typing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
        }).catch(err => {
            // Silent fail - typing indicators are not critical
            console.log('Typing signal failed:', err);
        });

        // Set timeout to stop sending if user stops typing for 2 seconds
        typingSignalTimeout = setTimeout(() => {
            typingSignalTimeout = null;
        }, 2000);
    });

    // "Enter Waiting Room" button - shown on page 3 of post-demo instructions
    enterWaitingRoomButton.addEventListener('click', async () => {
        logUiEvent('enter_waiting_room_clicked');
        logToRailway({
            type: 'ENTER_WAITING_ROOM_CLICKED',
            message: 'Enter Waiting Room clicked after post-demo instructions',
            context: { isHumanPartner, role: currentRole }
        });

        showMainPhase('waiting-room');

        if (isHumanPartner) {
            // HUMAN MODE: NOW actually join the waiting room (marks session as "waiting" in DB)
            // FIX: This was previously called right after demographics, which was wrong
            try {
                const joinResponse = await fetch('/join_waiting_room', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                });
                const joinResult = await joinResponse.json();

                if (!joinResponse.ok) {
                    throw new Error(joinResult.detail || 'Failed to join waiting room');
                }

                logToRailway({
                    type: 'JOIN_WAITING_ROOM_SUCCESS',
                    message: 'Successfully joined waiting room (marked as waiting in DB)',
                    context: { role: currentRole, match_status: joinResult.match_status }
                });
            } catch (error) {
                logToRailway({
                    type: 'JOIN_WAITING_ROOM_ERROR',
                    message: `Failed to join waiting room: ${error.message}`,
                    context: { error: error.message }
                });
                showError('Failed to enter waiting room. Please refresh and try again.');
                return;
            }

            isUserReady = true;

            logToRailway({
                type: 'HUMAN_MODE_ENTERING_WAITING_ROOM',
                message: 'Human mode - entering waiting room after post-demo instructions',
                context: { role: currentRole, isUserReady: true }
            });

            // Show role instructions IN waiting room as reminder
            showRoleInstructionsInWaitingRoom(currentRole);

            // Start 10-second minimum timer
            window.instructionsShownAt = Date.now();

            // Start polling for match
            startMatchPolling();
        } else {
            // AI MODE: Go to waiting room + simulate match
            isUserReady = true;

            logToRailway({
                type: 'AI_MODE_ENTERING_WAITING_ROOM',
                message: 'AI mode - entering waiting room after post-demo instructions',
                context: { isUserReady: true }
            });

            // Simulate finding AI partner
            simulateAIMatch();
        }
    });

    leaveWaitingRoomButton.addEventListener('click', async () => {
        logUiEvent('leave_waiting_room_clicked');

        // Redirect to Prolific with timeout code
        prepareIntentionalRedirect();
        recordCompletionCode('C1B54A7Q');
        if (isProduction) {
            window.location.href = PROLIFIC_TIMED_OUT_URL;
        } else {
            alert('DEV MODE: Would redirect to Prolific timeout URL');
        }
    });

    // NEW: Binary choice button event listeners
    const choiceHumanButton = document.getElementById('choice-human-button');
    const choiceAiButton = document.getElementById('choice-ai-button');
    const binaryChoiceSection = document.getElementById('binary-choice-section');
    const confidenceSection = document.getElementById('confidence-section');
    const chosenLabel = document.getElementById('chosen-label');

    // COMMENTED OUT: Counterbalancing button order - can be enabled if advisor approves
    // function randomizeButtonOrder() {
    //     const buttonsContainer = document.getElementById('binary-choice-buttons');
    //     if (Math.random() < 0.5) {
    //         buttonsContainer.appendChild(choiceHumanButton);
    //         buttonsContainer.appendChild(choiceAiButton);
    //         buttonOrderRandomized = false;
    //     } else {
    //         buttonsContainer.appendChild(choiceAiButton);
    //         buttonsContainer.appendChild(choiceHumanButton);
    //         buttonOrderRandomized = true;
    //     }
    // }
    // randomizeButtonOrder(); // Call this when assessment area is first shown

    // NEW: Flag to prevent double-clicking binary choice buttons
    let binaryChoiceInProgress = false;

    choiceHumanButton.addEventListener('click', () => {
        handleBinaryChoice('human');
    });

    choiceAiButton.addEventListener('click', () => {
        handleBinaryChoice('ai');
    });

    async function submitWitnessFinalChoiceWithRetry(choice, reason) {
        if (!sessionId) return false;
        const payload = {
            session_id: sessionId,
            binary_choice: choice,
            binary_choice_time_ms: binaryChoiceTime,
            final_response_reason: reason || finalResponseReason || 'witness_final_choice_click'
        };

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch('/submit_witness_final_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (response.ok) return true;
            } catch (error) {
                logToRailway({
                    type: 'WITNESS_FINAL_CHOICE_SAVE_ERROR',
                    message: error.message,
                    context: { attempt, choice, reason: payload.final_response_reason }
                });
            }
        }

        try {
            const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
            navigator.sendBeacon(`${API_BASE_URL}/submit_witness_final_choice`, blob);
        } catch (error) {
            logToRailway({
                type: 'WITNESS_FINAL_CHOICE_BEACON_ERROR',
                message: error.message,
                context: { choice, reason: payload.final_response_reason }
            });
        }
        return false;
    }

    // C3: persist the interrogator's FINAL binary direction immediately (retry + beacon),
    // so it survives even if they never move the confidence slider or lose connection.
    // Confidence + collected=true arrive later via /submit_rating (is_final_response).
    async function submitInterrogatorFinalChoiceWithRetry(choice, reason) {
        if (!sessionId) return false;
        const payload = {
            session_id: sessionId,
            binary_choice: choice,
            binary_choice_time_ms: binaryChoiceTime,
            final_response_reason: reason || finalResponseReason || 'interrogator_final_choice_click'
        };
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch('/submit_interrogator_final_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (response.ok) return true;
            } catch (error) {
                logToRailway({
                    type: 'INTERROGATOR_FINAL_CHOICE_SAVE_ERROR',
                    message: error.message,
                    context: { attempt, choice, reason: payload.final_response_reason }
                });
            }
        }
        try {
            const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
            navigator.sendBeacon(`${API_BASE_URL}/submit_interrogator_final_choice`, blob);
        } catch (error) {
            logToRailway({
                type: 'INTERROGATOR_FINAL_CHOICE_BEACON_ERROR',
                message: error.message,
                context: { choice, reason: payload.final_response_reason }
            });
        }
        return false;
    }

    async function handleBinaryChoice(choice) {
        // PROTECTION: Prevent double-clicking - only process first click
        if (binaryChoiceInProgress) {
            logToRailway({
                type: 'BINARY_CHOICE_DOUBLE_CLICK_PREVENTED',
                message: `Double-click prevented - already processing choice`,
                context: {
                    attempted_choice: choice,
                    locked_choice: binaryChoice,
                    turn: currentTurn
                }
            });
            return; // Ignore subsequent clicks
        }

        // Lock immediately on first click
        binaryChoiceInProgress = true;

        // Disable both buttons immediately to prevent double-clicking
        choiceHumanButton.disabled = true;
        choiceAiButton.disabled = true;

        // Record the choice and timing
        binaryChoice = choice;
        binaryChoiceTime = Date.now() - binaryChoiceStartTime;

        // Log the choice
        logToRailway({
            type: 'BINARY_CHOICE_MADE',
            message: `User selected: ${choice}`,
            context: {
                choice: choice,
                time_taken_ms: binaryChoiceTime,
                turn: currentTurn,
                role: currentRole
            }
        });

        // NEW: Check if witness - if so, skip confidence slider and go to comment
        if (currentRole === 'witness') {
            // Witness: Skip confidence slider, show comment box
            logToRailway({
                type: 'WITNESS_SKIPPING_TO_COMMENT',
                message: 'Witness selected binary choice, routing to comment box',
                context: { choice: choice }
            });

            await submitWitnessFinalChoiceWithRetry(choice, finalResponseReason || 'witness_final_choice_click');

            // Hide assessment area
            assessmentAreaDiv.style.display = 'none';

            // Show feedback phase for comment
            showMainPhase('feedback');
            feedbackTextarea.focus();

            // Re-enable binary choice for next time (if needed)
            binaryChoiceInProgress = false;
            choiceHumanButton.disabled = false;
            choiceAiButton.disabled = false;

            return; // Skip confidence slider
        }

        // INTERROGATOR: Show confidence slider
        // C3: if this is the FINAL assessment, persist the binary direction NOW (before the
        // slider) so it survives even if they stall on the slider or lose connection.
        const isFinalAssessment = !!finalResponseReason || timeExpired || partnerDroppedFlag;
        if (isFinalAssessment) {
            submitInterrogatorFinalChoiceWithRetry(
                choice, finalResponseReason || (timeExpired ? 'time_expired' : 'final_choice')
            ); // fire-and-forget; confidence completes it via /submit_rating
        }
        // Hide binary choice, show confidence slider
        binaryChoiceSection.style.display = 'none';
        confidenceSection.style.display = 'block';
        // Ensure slider is enabled for interaction on this step
        confidenceSlider.disabled = false;
        // Capitalize properly: "ai" → "AI", "human" → "Human"
        chosenLabel.textContent = choice === 'ai' ? 'AI' : choice.charAt(0).toUpperCase() + choice.slice(1);

        // Reset confidence slider to 50% for new choice
        confidenceSlider.value = 50;
        confidenceValueSpan.textContent = '--'; // Hide value until interaction to avoid bias

        // NEW: Hide slider thumb initially to avoid bias from previous round
        confidenceSlider.classList.add('pristine');

        // Don't set confidenceStartTime here - let mousedown/touchstart set it on first actual touch
        // This ensures clicking directly on any position (including 50%) registers as valid interaction
        confidenceStartTime = null;
        sliderInteractionLog = []; // Reset slider interaction log
        submitRatingButton.disabled = false; // Enable submit button
    }

    // NEW: Track when user first interacts with confidence slider
    confidenceSlider.addEventListener('mousedown', () => {
        // Remove pristine class to show thumb on first interaction
        confidenceSlider.classList.remove('pristine');
        // Show the actual value now that user has interacted
        confidenceValueSpan.textContent = confidenceSlider.value;

        const baseMs = tsToMs(aiResponseTimestamp);
        // Always log on first touch (when confidenceStartTime is null)
        if (confidenceStartTime === null && baseMs) {
            confidenceStartTime = Date.now();
            sliderInteractionLog.push({
                event: 'slider_first_touch',
                timestamp: Date.now(),
                timestampFromResponse: Date.now() - baseMs,
                value: parseFloat(confidenceSlider.value)
            });
        }
    });

    confidenceSlider.addEventListener('touchstart', () => {
        // Remove pristine class to show thumb on first interaction
        confidenceSlider.classList.remove('pristine');
        // Show the actual value now that user has interacted
        confidenceValueSpan.textContent = confidenceSlider.value;

        const baseMs = tsToMs(aiResponseTimestamp);
        // Always log on first touch (when confidenceStartTime is null)
        if (confidenceStartTime === null && baseMs) {
            confidenceStartTime = Date.now();
            sliderInteractionLog.push({
                event: 'slider_first_touch',
                timestamp: Date.now(),
                timestampFromResponse: Date.now() - baseMs,
                value: parseFloat(confidenceSlider.value)
            });
        }
    });

    // MODIFIED event listener for confidence slider to handle activation and enabling submit
    confidenceSlider.addEventListener('input', () => {
        let value = parseInt(confidenceSlider.value); // Now 0-100 scale

        // NEW: Track all slider movements for enhanced timing analysis
        const baseMs = tsToMs(aiResponseTimestamp);
        if (confidenceStartTime && baseMs) {
            sliderInteractionLog.push({
                event: 'slider_move',
                timestamp: Date.now(),
                timestampFromResponse: Date.now() - baseMs,
                timestampFromFirstTouch: Date.now() - confidenceStartTime,
                value: value
            });
        }

        // Update the displayed value
        confidenceValueSpan.textContent = value;

        // Submit button is already enabled by handleBinaryChoice
        // No special restrictions - any value 0-100 is valid
    });

    function animateTypingIndicator(messageLength) {
        // Show indicator immediately
        typingIndicator.style.display = 'flex';
        scrollToBottom();

        // Tag this animation run so stale timeouts can't re-show the indicator later
        const runId = String(Date.now());
        typingIndicator.dataset.runId = runId;

        // That's it - just show it and leave it on until the message arrives
        return null;
    }

    // NEW: Intermittent bubble animation for artificial delay in human mode
    // Shows/hides bubbles with randomized timing to simulate ongoing typing
    function startIntermittentBubbles() {
        // Clear any existing timeout
        if (intermittentBubbleTimeout) {
            clearTimeout(intermittentBubbleTimeout);
            intermittentBubbleTimeout = null;
        }

        isShowingIntermittentBubbles = true;

        function scheduleBubbleCycle() {
            if (!isShowingIntermittentBubbles) return; // Stop if flag is disabled

            // Random show duration: 2-5 seconds
            const showDuration = (Math.random() * 3000) + 2000;

            // Show bubbles
            typingIndicator.style.display = 'flex';
            scrollToBottom();

            intermittentBubbleTimeout = setTimeout(() => {
                if (!isShowingIntermittentBubbles) return;

                // Hide bubbles
                typingIndicator.style.display = 'none';

                // Random hide duration: 1-3 seconds
                const hideDuration = (Math.random() * 2000) + 1000;

                intermittentBubbleTimeout = setTimeout(() => {
                    if (!isShowingIntermittentBubbles) return;
                    scheduleBubbleCycle(); // Restart cycle
                }, hideDuration);
            }, showDuration);
        }

        // Start the cycle
        scheduleBubbleCycle();
    }

    function stopIntermittentBubbles() {
        isShowingIntermittentBubbles = false;

        if (intermittentBubbleTimeout) {
            clearTimeout(intermittentBubbleTimeout);
            intermittentBubbleTimeout = null;
        }

        // Hide bubbles
        typingIndicator.style.display = 'none';
    }




    // NEW: Retry logic for API requests - now returns network delay
    async function sendMessageWithRetry(messageText, typingDelaySeconds, messageCompositionTimeSeconds = null, inputProvenanceSummary = null, maxRetries = 3) {
        const apiCallStartTime = Date.now();

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Show retry banner for AI mode only (after first attempt fails)
                if (attempt > 1 && !isHumanPartner && aiRetryBanner) {
                    aiRetryBanner.style.display = 'block';
                    logToRailway({
                        type: 'AI_RETRY_BANNER_SHOWN',
                        message: `Showing retry banner (attempt ${attempt}/${maxRetries})`,
                        context: { attempt: attempt }
                    });
                }

                // Log retry attempt to Railway
                logToRailway({
                    type: 'API_REQUEST_ATTEMPT',
                    message: `Sending message to server (attempt ${attempt}/${maxRetries})`,
                    context: {
                        session_id: sessionId,
                        message_length: messageText.length,
                        attempt: attempt,
                        max_retries: maxRetries,
                        composition_time_seconds: messageCompositionTimeSeconds,
                        input_provenance_category: inputProvenanceSummary ? inputProvenanceSummary.provenance_category : null
                    }
                });

                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 40000); // 40 seconds timeout

                const response = await fetch('/send_message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        message: messageText,
                        typing_indicator_delay_seconds: typingDelaySeconds,
                        message_composition_time_seconds: messageCompositionTimeSeconds,
                        input_provenance_summary: inputProvenanceSummary,
                        time_remaining_display: document.getElementById('countdown-timer')?.textContent || null
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const result = await response.json();

                if (response.ok) {
                    // Hide retry banner on success
                    if (aiRetryBanner) {
                        aiRetryBanner.style.display = 'none';
                    }

                    // Calculate network delay for successful response
                    const apiCallEndTime = Date.now();
                    const networkDelayMs = apiCallEndTime - apiCallStartTime;
                    const networkDelaySeconds = networkDelayMs / 1000;

                    // Success - log and return with network delay
                    logToRailway({
                        type: 'API_RESPONSE_SUCCESS',
                        message: `Received response from /send_message (attempt ${attempt})`,
                        context: {
                            response_ok: response.ok,
                            turn: result.turn,
                            ai_response_length: result.ai_response ? result.ai_response.length : 0,
                            attempt: attempt,
                            network_delay_ms: networkDelayMs,
                            network_delay_seconds: networkDelaySeconds
                        }
                    });
                    return { response, result, networkDelaySeconds, attempts: attempt };
                } else {
                    // API error - log and continue to retry
                    logToRailway({
                        type: 'API_ERROR',
                        message: `API error on attempt ${attempt}/${maxRetries}`,
                        context: {
                            response_ok: response.ok,
                            response_status: response.status,
                            result: result,
                            attempt: attempt
                        }
                    });
                    if (attempt === maxRetries) {
                        // Hide retry banner before throwing
                        if (aiRetryBanner) {
                            aiRetryBanner.style.display = 'none';
                        }
                        throw new Error(`API error after ${maxRetries} attempts: ${response.status}`);
                    }
                }
            } catch (error) {
                // Network/fetch error - log and continue to retry
                logToRailway({
                    type: 'NETWORK_ERROR',
                    message: `Network error on attempt ${attempt}/${maxRetries}: ${error.message}`,
                    context: {
                        error_name: error.name,
                        error_message: error.message,
                        attempt: attempt,
                        max_retries: maxRetries
                    }
                });
                if (attempt === maxRetries) {
                    // Hide retry banner before throwing
                    if (aiRetryBanner) {
                        aiRetryBanner.style.display = 'none';
                    }
                    throw error;
                }

                // No delay - retry immediately
            }
        }
    }

    // NEW: Retry logic for network delay updates with fallback storage and metadata tracking
    async function updateNetworkDelayWithRetry(sessionId, turn, networkDelaySeconds, sendAttempts = 1, maxRetries = 2) {
        const metadata = {
            status: null,
            attempts_required: 0,
            failure_types: [],
            fallback_reason: null,
            retry_delays: []
        };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            metadata.attempts_required = attempt;
            try {
                logToRailway({
                    type: 'NETWORK_DELAY_UPDATE_ATTEMPT',
                    message: `Updating network delay (attempt ${attempt}/${maxRetries})`,
                    context: {
                        session_id: sessionId,
                        turn: turn,
                        network_delay_seconds: networkDelaySeconds,
                        attempt: attempt
                    }
                });

                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout (increased from 15s)
                
                const response = await fetch('/update_network_delay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        turn: turn,
                        network_delay_seconds: networkDelaySeconds,
                        send_attempts: sendAttempts,
                        metadata: metadata
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (response.ok) {
                    // Success - set status and return metadata
                    metadata.status = attempt === 1 ? 'primary_success' : 'retry_success';
                    logToRailway({
                        type: 'NETWORK_DELAY_UPDATED',
                        message: `Network delay successfully updated (attempt ${attempt})`,
                        context: {
                            network_delay_seconds: networkDelaySeconds,
                            turn: turn,
                            session_id: sessionId,
                            attempt: attempt,
                            metadata: metadata
                        }
                    });
                    return { success: true, metadata };
                } else {
                    // API error - track error type and continue to retry
                    const errorType = `${response.status}_error`;
                    metadata.failure_types.push(errorType);
                    
                    logToRailway({
                        type: 'NETWORK_DELAY_API_ERROR',
                        message: `Network delay update API error (attempt ${attempt}/${maxRetries})`,
                        context: {
                            response_status: response.status,
                            attempt: attempt,
                            turn: turn,
                            error_type: errorType
                        }
                    });
                    if (attempt === maxRetries) throw new Error(`API error after ${maxRetries} attempts: ${response.status}`);
                }
            } catch (error) {
                // Network/fetch error - track error type and continue to retry
                const errorType = error.name === 'AbortError' ? 'timeout' : 
                                 error.name === 'TypeError' ? 'network_error' : 
                                 error.name || 'unknown_error';
                metadata.failure_types.push(errorType);
                
                logToRailway({
                    type: 'NETWORK_DELAY_NETWORK_ERROR',
                    message: `Network delay update network error (attempt ${attempt}/${maxRetries}): ${error.message}`,
                    context: {
                        error_name: error.name,
                        error_message: error.message,
                        error_type: errorType,
                        attempt: attempt,
                        turn: turn
                    }
                });
                
                if (attempt === maxRetries) {
                    // All retries failed - set fallback status and store for fallback
                    metadata.status = 'fallback_used';
                    metadata.fallback_reason = `All ${maxRetries} retries failed: ${error.message}`;

                    const fallbackData = {
                        session_id: sessionId,
                        turn: turn,
                        network_delay_seconds: networkDelaySeconds,
                        failure_reason: error.message,
                        calculated_at: Date.now(),
                        retry_attempts: maxRetries,
                        metadata: metadata
                    };
                    pendingNetworkDelayUpdates.push(fallbackData);

                    logToRailway({
                        type: 'NETWORK_DELAY_FALLBACK_STORED',
                        message: 'All retries failed - stored for fallback processing',
                        context: {
                            fallback_data: fallbackData,
                            pending_count: pendingNetworkDelayUpdates.length
                        }
                    });
                    return { success: false, metadata };
                }

                // Wait briefly before retry (reduced backoff)
                const backoffMs = 2000; // Fixed 2 second delay instead of exponential
                metadata.retry_delays.push(backoffMs);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
        }
    }

    async function handleSendMessage() {
        const messageText = userMessageInput.value.trim();
        if (!messageText || !sessionId) return;

        // Clear inactivity timer — user is actively participating
        clearConversationInactivityTimer();
        // A1: sending cancels the AI-mode post-expiry backstop (no-op outside that case).
        clearScreenTimer();

        // NEW: Calculate message composition time
        let messageCompositionTimeSeconds = null;
        if (messageCompositionStartTime) {
            messageCompositionTimeSeconds = (Date.now() - messageCompositionStartTime) / 1000;
            logToRailway({
                type: 'MESSAGE_COMPOSITION_TIME',
                message: 'Message composition time calculated',
                context: {
                    role: currentRole,
                    composition_time_seconds: messageCompositionTimeSeconds,
                    message_length: messageText.length
                }
            });
        }

        // NEW: Check if partner has dropped - show modal instead of sending
        if (partnerDroppedFlag) {
            logToRailway({
                type: 'INTERROGATOR_TRIED_TO_SEND_AFTER_DROPOUT',
                message: 'Interrogator tried to send message after partner dropped - showing connection modal',
                context: { role: currentRole }
            });

            // Show connection issue modal
            interrogatorConnectionModal.style.display = 'flex';
            return; // Don't send the message
        }

        // Check if it's our turn (for human-human conversations)
        if (waitingForPartner) {
            showError("Please wait for your partner to respond first.");
            return;
        }

        const inputProvenanceSummary = chatInputProvenanceTracker.buildSummary(messageText);
        logSuspiciousEvent('message_input_provenance', {
            ...inputProvenanceSummary,
            turn: currentTurn + 1,
            timestamp: Date.now(),
            role: currentRole
        });
        if (inputProvenanceSummary.large_message_after_inactivity) {
            logSuspiciousEvent('large_message_after_inactivity', {
                field: 'chat_message',
                turn: currentTurn + 1,
                timestamp: Date.now(),
                role: currentRole,
                message_length_chars: inputProvenanceSummary.message_length_chars,
                last_page_inactivity_duration_ms: inputProvenanceSummary.last_page_inactivity_duration_ms,
                time_since_page_inactivity_ended_ms: inputProvenanceSummary.time_since_page_inactivity_ended_ms
            });
        }

        addMessageToUI(messageText, 'user');

        // Reset composition time tracker for next message
        messageCompositionStartTime = null;
        chatInputProvenanceTracker.reset();

        userMessageInput.value = '';
        userMessageInput.disabled = true;
        sendMessageButton.disabled = true;
        chatInputContainer.style.display = 'none';
        assessmentAreaDiv.style.display = 'none';

        // HARMONIZED (Jones et al. 2025): the typing animation is scripted and IDENTICAL
        // across conditions — triggered 2 + U(0,3)s after send in BOTH modes, independent
        // of witness type and of the partner's real typing. Runs until delivery.
        const indicatorDelay = 2000 + Math.random() * 3000;

        // Log to Railway only
        logToRailway({
            type: 'TYPING_INDICATOR_DEBUG',
            message: `Waiting ${(indicatorDelay/1000).toFixed(1)}s before showing typing indicator`,
            context: { delay_seconds: indicatorDelay/1000 }
        });

        setTimeout(() => {
            if (assessmentAreaDiv.style.display === 'none' && chatInputContainer.style.display === 'none') {
                // Same intermittent animation in both modes; stopped on message delivery
                if (!isShowingIntermittentBubbles) {
                    startIntermittentBubbles();
                }
                if (!isHumanPartner) {
                    // Update timer message for State 1→2 transition (now waiting for AI response)
                    updateTimerMessage();
                }
            }
        }, indicatorDelay);

        try {
            // Use new retry logic that returns network delay and attempt count
            const { response, result, networkDelaySeconds, attempts } = await sendMessageWithRetry(
                messageText,
                indicatorDelay / 1000,
                messageCompositionTimeSeconds,
                inputProvenanceSummary
            );

            // If we get here, the retry succeeded - hide typing indicator and process response
            typingIndicator.dataset.runId = String((Number(typingIndicator.dataset.runId) || 0) + 1);
            stopIntermittentBubbles();
            typingIndicator.style.display = 'none';

            // NEW: Check if this is a human partner conversation
            if (result.human_partner) {
                // Partner gone (dropped / server redeploy). The backend refuses to substitute an AI
                // reply in the human condition, so route to the dropout flow instead of waiting on a
                // dead partner or rendering a bot message.
                if (result.partner_unavailable) {
                    handlePartnerDropout('left');
                    return;
                }
                // Message routed to partner - now wait for their response
                waitingForPartner = true;
                currentTurn = result.turn;

                // Start polling for partner's response
                startPartnerResponsePolling();
                return; // Exit early - don't process AI response
            }

            // AI response (normal flow)
            addMessageToUI(result.ai_response, 'assistant');

            // FIX (01Aug26): the assessment UI + RT clock now start IMMEDIATELY after the
            // message renders — the network-delay telemetry POST (moved below) used to sit
            // between them, deflating AI-condition binary RTs relative to the human
            // condition, where message and clock start in the same tick.
            currentTurn = result.turn;
            aiResponseTimestamp = result.timestamp;

            // Reset tab visibility tracking for new turn
            cumulativeTabHiddenMs = 0;
            turnTabHiddenInstances = [];

            // --- MODIFIED: Binary choice + slider setup logic ---
            assessmentAreaDiv.style.display = 'block';
            chatInputContainer.style.display = 'none';
            assessmentAreaDiv.querySelector('h4').textContent = "Your Assessment";

            // Update timer message for State 2→3 transition (now rating phase)
            updateTimerMessage();

            // NEW: Show binary choice section, hide confidence section
            binaryChoiceSection.style.display = 'block';
            confidenceSection.style.display = 'none';
            // Ensure slider is interactable for the upcoming choice step
            confidenceSlider.disabled = false;

            // NEW: Reset binary choice tracking for new turn
            binaryChoice = null;
            binaryChoiceStartTime = Date.now(); // Start timing for binary choice
            binaryChoiceTime = null;
            binaryChoiceInProgress = false; // Reset double-click protection
            finalResponseReason = null;
            choiceHumanButton.disabled = false; // Re-enable buttons
            choiceAiButton.disabled = false;

            // FIX C4-gap (03Aug26): if the timer already expired, THIS assessment is the
            // final one — arm the same 2-min rescue backstop the other final paths have,
            // so a participant who clicks a choice then stalls is saved + redirected
            // instead of stranded (found live: L3 walk-away test).
            if (timeExpired) {
                finalResponseReason = finalResponseReason || 'time_expired';
                armInterrogatorFinalAssessmentBackstop();
            }

            // Reset timing variables for this turn
            confidenceStartTime = null;
            sliderInteractionLog = [];

            // REMOVED: Old slider initialization logic - now handled by handleBinaryChoice()
            // Slider is no longer shown initially - binary choice comes first

            // Reset other UI elements
            submitRatingButton.style.display = 'block';
            feelsOffCheckbox.checked = false;
            commentInputArea.style.display = 'none';
            feelsOffCommentTextarea.value = '';
            messageList.scrollTop = messageList.scrollHeight;

            // Network-delay telemetry (moved here 01Aug26 — see FIX comment above):
            // runs AFTER the assessment UI is live so it can never delay the RT clock.
            const backendRetryData = result.backend_retry_metadata || { retry_attempts: 0, retry_time_seconds: 0 };
            const totalNetworkDelaySeconds = networkDelaySeconds + backendRetryData.retry_time_seconds;
            const totalAttempts = attempts + backendRetryData.retry_attempts;
            const updateResult = await updateNetworkDelayWithRetry(sessionId, result.turn, totalNetworkDelaySeconds, totalAttempts);

            if (!updateResult.success) {
                // All retries failed - data is stored in pendingNetworkDelayUpdates for later processing
                logToRailway({
                    type: 'NETWORK_DELAY_FINAL_FAILURE',
                    message: 'Network delay update failed after all retries - stored for fallback',
                    context: {
                        network_delay_seconds: networkDelaySeconds,
                        turn: result.turn,
                        session_id: sessionId,
                        pending_fallbacks: pendingNetworkDelayUpdates.length,
                        metadata: updateResult.metadata
                    }
                });
            }

        } catch (error) {
            // If we reach here, all retries failed - log the final failure
            logToRailway({
                type: 'CRITICAL_FAILURE',
                message: `All retries failed: ${error.message}`,
                stack: error.stack,
                context: {
                    function: 'handleSendMessage',
                    time_expired: timeExpired,
                    user_message_length: messageText.length,
                    final_error: true
                }
            });

            // Hide typing indicator and reset UI
            typingIndicator.style.display = 'none';
            userMessageInput.disabled = false;
            sendMessageButton.disabled = false;
            chatInputContainer.style.display = 'flex';
            assessmentAreaDiv.style.display = 'none';

            // NEW: Show appropriate modal based on whether time expired
            if (timeExpired) {
                // Scenario 2: Timer expired - end study
                aiConnectionMessage.textContent = "The connection between you and your partner failed. Click below to complete the study.";
                aiConnectionButton.textContent = "Complete Study";
                aiConnectionButton.dataset.scenario = "end_study";

                logToRailway({
                    type: 'AI_CONNECTION_FAILURE_TIME_EXPIRED',
                    message: 'AI connection failed after timer expired - showing end study modal',
                    context: { timeExpired: true }
                });
            } else {
                // Scenario 1: Time remaining - allow retry
                aiConnectionMessage.textContent = "Looks like the connection between you and your partner isn't stable. Try sending your message again, please.";
                aiConnectionButton.textContent = "OK";
                aiConnectionButton.dataset.scenario = "retry";

                logToRailway({
                    type: 'AI_CONNECTION_FAILURE_CAN_RETRY',
                    message: 'AI connection failed with time remaining - showing retry modal',
                    context: { timeExpired: false }
                });
            }

            aiConnectionModal.style.display = 'flex';
        }
    }


    submitRatingButton.addEventListener('click', async () => {
        if (!sessionId) return;

        // NEW: Validate binary choice was made
        if (!binaryChoice) {
            logToRailway({
                type: 'SUBMIT_ERROR',
                message: 'Submit attempt without binary choice',
                context: { turn: currentTurn }
            });
            return; // Should not happen due to UI flow, but safety check
        }

        // NEW: Validate slider has been touched before submission
        if (!confidenceStartTime || sliderInteractionLog.length === 0) {
            showError('Please move the confidence slider before submitting.');
            logToRailway({
                type: 'SUBMIT_ERROR_NO_SLIDER_INTERACTION',
                message: 'Submit attempt without slider interaction',
                context: {
                    turn: currentTurn,
                    confidenceStartTime: confidenceStartTime,
                    sliderInteractionLog_length: sliderInteractionLog.length
                }
            });
            return;
        }

        // NEW: For time expired, we no longer restrict confidence values
        // The binary choice (Human/AI) is the main decision, confidence is always 0-100%

        if (feelsOffCheckbox.checked && feelsOffCommentTextarea.value.trim() === '') {
            // SILENT: No participant-visible error - just prevent submission
            return;
        }

        ratingLoadingDiv.style.display = 'block';
        submitRatingButton.disabled = true;
        confidenceSlider.disabled = true;

        const confidencePercent = parseInt(confidenceSlider.value); // 0-100 scale
        const confidence = confidencePercent / 100; // Convert to 0-1 for backend compatibility
        lastConfidenceValue = confidencePercent; // NEW: Save the submitted value (0-100) for the next round

        // NEW: Calculate enhanced timing data
        let decisionTimeSeconds = null;
        let readingTimeSeconds = null;
        let activeDecisionTimeSeconds = null;

        const baseMs = tsToMs(aiResponseTimestamp);
        if (baseMs) {
            // NEW: Log the final submitted value to ensure data integrity
            sliderInteractionLog.push({
                event: 'slider_submit',
                timestamp: Date.now(),
                timestampFromResponse: Date.now() - baseMs,
                timestampFromFirstTouch: confidenceStartTime ? Date.now() - confidenceStartTime : null,
                value: confidence
            });
            
            decisionTimeSeconds = (Date.now() - baseMs) / 1000;
            if (confidenceStartTime) {
                // User touched slider: split into reading + active time
                readingTimeSeconds = (confidenceStartTime - baseMs) / 1000;
                activeDecisionTimeSeconds = (Date.now() - confidenceStartTime) / 1000;
            } else {
                // User never touched slider: all time is reading, zero active
                readingTimeSeconds = decisionTimeSeconds;
                activeDecisionTimeSeconds = 0;
            }
        } else {
            // Log to Railway only
            logToRailway({
                type: 'TIMING_WARNING',
                message: 'aiResponseTimestamp missing; timing metrics will be null',
                context: { function: 'submitRatingButton' }
            });
        }

        // Log to Railway only
        logToRailway({
            type: 'RATING_SUBMISSION',
            message: 'Submitting rating with binary choice and timing metrics',
            context: {
                binary_choice: binaryChoice,
                binary_choice_time_ms: binaryChoiceTime,
                confidence_percent: confidencePercent,
                confidence_normalized: confidence,
                decision_time_seconds: decisionTimeSeconds,
                reading_time_seconds: readingTimeSeconds,
                active_decision_time_seconds: activeDecisionTimeSeconds,
                turn: currentTurn
            }
        });

        // C2: the final rating is irreplaceable — retry it, and beacon as a last resort.
        const isFinal = timeExpired || partnerDroppedFlag || !!finalResponseReason;
        // reading-activity counters are valid for this turn only if they belong to the current message
        const _raBase = tsToMs(aiResponseTimestamp);
        const _raValid = (readingActivityBase === _raBase);
        submittedBase = _raBase; // stop trajectory sampling for this turn
        const ratingPayload = {
            session_id: sessionId,
            binary_choice: binaryChoice, // 'human' or 'ai'
            binary_choice_time_ms: binaryChoiceTime, // Time taken to make binary choice
            confidence: confidence, // 0-1 scale (converted from 0-100)
            confidence_percent: confidencePercent, // 0-100 scale (original)
            decision_time_seconds: decisionTimeSeconds,
            reading_time_seconds: readingTimeSeconds,
            active_decision_time_seconds: activeDecisionTimeSeconds,
            slider_interaction_log: sliderInteractionLog,
            // 01Aug26: tab-visibility data now rides the reliable, retried rating payload
            // (per-instance durations enable the prereg's ">3s single instance" exclusion;
            // the fire-and-forget ui-event stream remains as a redundant backup)
            tab_hidden_instances_ms: turnTabHiddenInstances,
            max_tab_hidden_instance_ms: turnTabHiddenInstances.length ? Math.max(...turnTabHiddenInstances) : 0,
            cumulative_tab_hidden_ms: cumulativeTabHiddenMs,
            // reading-phase engagement (null/0 if no such event before first slider touch this turn)
            reading_first_mouse_move_ms: _raValid ? firstMouseMoveMs : null,
            reading_first_scroll_ms: _raValid ? firstScrollMs : null,
            reading_first_keypress_ms: _raValid ? firstKeypressMs : null,
            reading_mouse_move_count: _raValid ? readingMouseMoveCount : 0,
            reading_scroll_count: _raValid ? readingScrollCount : 0,
            reading_keypress_count: _raValid ? readingKeypressCount : 0,
            mouse_trajectory: _raValid ? mouseTrajectory : [], // [x,y,ms-from-appearance] sampled ~20Hz over the assessment phase
            is_final_response: isFinal,
            final_response_reason: finalResponseReason || (timeExpired ? 'time_expired' : null)
        };

        // FIX D1b (03Aug26): protect the in-flight rating against instant tab-close.
        // Stashed now, cleared on server confirmation; the pagehide handler beacons
        // any unconfirmed payload. Server dedupes by turn, so double-delivery is safe.
        pendingRatingBeacon = JSON.stringify(ratingPayload);
        let result = null, ok = false, usedBeacon = false;
        const maxAttempts = 2; // 01Aug26: retry non-final ratings too (server now replaces duplicates by turn, so a re-send is safe)
        for (let attempt = 1; attempt <= maxAttempts && !ok; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for rating submission
                const response = await fetch('/submit_rating', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ratingPayload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    result = await response.json();
                    ok = true;
                    pendingRatingBeacon = null;   // confirmed saved; nothing to rescue
                }
            } catch (error) {
                logToRailway({
                    type: 'RATING_SUBMIT_ATTEMPT_FAILED',
                    message: error.message,
                    context: { attempt, isFinal }
                });
            }
        }

        if (!ok && isFinal) {
            // Total fetch failure on the final rating — beacon it so it still reaches the server.
            try {
                navigator.sendBeacon(`${API_BASE_URL}/submit_rating`,
                    new Blob([JSON.stringify(ratingPayload)], { type: 'text/plain' }));
                usedBeacon = true;
            } catch (error) {}
        }

        logToRailway({
            type: 'RATING_RESPONSE',
            message: 'Rating submission outcome',
            context: { ok, usedBeacon, study_over: result ? result.study_over : null, isFinal }
        });

        try {
            if (ok && result) {
                if (result.study_over) {
                    // Clean up timer
                    if (studyTimer) {
                        clearInterval(studyTimer);
                    }
                    document.getElementById('timer-display').style.display = 'none';

                    // MODIFICATION START
                    finalSummaryData = result.session_data_summary; // Store data
                    showMainPhase('feedback'); // Go to feedback phase first
                } else {
                    // NEW: Check if partner has dropped after rating submission
                    if (partnerDroppedFlag) {
                        logToRailway({
                            type: 'INTERROGATOR_FINISHED_RATING_AFTER_DROPOUT',
                            message: 'Interrogator finished rating after partner dropped - routing to feedback',
                            context: { role: currentRole }
                        });

                        // Hide rating UI
                        assessmentAreaDiv.style.display = 'none';

                        // Route directly to feedback (comment then debrief)
                        showMainPhase('feedback');
                        feedbackTextarea.focus();

                    } else if (feelsOffCheckbox.checked && feelsOffCommentTextarea.value.trim() !== '') {
                        assessmentAreaDiv.querySelector('h4').textContent = "Rating Submitted. Now, please submit your comment:";
                        submitRatingButton.style.display = 'none';
                        confidenceSlider.style.display = 'none';
                        confidenceValueSpan.style.display = 'none';
                        document.getElementById('submit-rating-button').previousElementSibling.style.display = 'none';
                        document.getElementById('comment-section').style.display = 'block';
                        if (!commentInputArea.style.display || commentInputArea.style.display === 'none') {
                            commentInputArea.style.display = 'block';
                        }
                        feelsOffCommentTextarea.focus();
                        chatInputContainer.style.display = 'none';
                    } else {
                        assessmentAreaDiv.style.display = 'none';
                        chatInputContainer.style.display = 'flex';
                        userMessageInput.disabled = false;
                        sendMessageButton.disabled = false;
                        userMessageInput.focus();

                        // NEW: Restart continuous polling for interrogators in human mode
                        // After rating, they're back to idle state and need to detect partner dropouts
                        if (currentRole === 'interrogator' && isHumanPartner && !partnerPollInterval) {
                            startPartnerResponsePolling();
                        }

                        // Restart 2-min inactivity timer for AI witness interrogator
                        if (!timeExpired) startConversationInactivityTimer();

                        // Update timer message for State 3→1 transition (back to chat input)
                        updateTimerMessage();
                    }
                }
            } else if (usedBeacon) {
                // C2: final rating was beaconed — assume accepted (server banner confirms) and advance.
                if (studyTimer) {
                    clearInterval(studyTimer);
                }
                document.getElementById('timer-display').style.display = 'none';
                showMainPhase('feedback');
            } else {
                // Non-final failure — allow retry (today's behavior).
                submitRatingButton.disabled = false;
                confidenceSlider.disabled = false;
            }
        } finally {
            ratingLoadingDiv.style.display = 'none';
        }
    });

    submitFeedbackButton.addEventListener('click', async () => {
        const commentText = feedbackTextarea.value.trim();
        const feedbackInputProvenance = feedbackInputProvenanceTracker.buildSummary(commentText);

        // Validate that feedback is provided (mandatory)
        if (!commentText) {
            showError('Please provide feedback about the conversation before continuing.');
            return;
        }

        submitFeedbackButton.disabled = true;

        try {
            // Send final comment to the correct endpoint
            // NEW: Include binary choice for witnesses
            const payload = {
                session_id: sessionId,
                comment: commentText,
                input_provenance_summary: feedbackInputProvenance
            };

            // If witness, include their binary choice
            if (currentRole === 'witness' && binaryChoice) {
                payload.binary_choice = binaryChoice;
                payload.binary_choice_time_ms = binaryChoiceTime;
                payload.final_response_reason = finalResponseReason || 'witness_feedback_submission';
            }

            await fetch('/submit_final_comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            logSuspiciousEvent('feedback_input_provenance', {
                ...feedbackInputProvenance,
                turn: currentTurn,
                timestamp: Date.now(),
                role: currentRole,
                auto_submitted: false
            });
        } catch (error) {
            // Log to Railway only
            logToRailway({
                type: 'FEEDBACK_SUBMISSION_ERROR',
                message: error.message,
                stack: error.stack,
                context: { function: 'submitFeedbackButton' }
            });
        }

        // Route to demographics form (moved from pre-study to post-feedback)
        logToRailway({
            type: 'FEEDBACK_SUBMITTED_ROUTING_TO_DEMOGRAPHICS',
            message: 'Feedback submitted - routing to demographics form',
            context: { role: currentRole }
        });
        feedbackInputProvenanceTracker.reset();
        showMainPhase('demographics');
    });

    // Skip button removed - feedback is now mandatory for interrogators

    submitCommentButton.addEventListener('click', async () => {
        if (!sessionId) {
            // SILENT: No participant-visible error - just prevent submission
            return;
        }
        // LEGACY CODE REMOVED - this checkbox validation can never be reached in current UI flow

        const commentText = feelsOffCommentTextarea.value.trim();
        if (commentText === '') {
            // SILENT: No participant-visible error - just prevent submission
            return;
        }

        commentLoadingDiv.style.display = 'block';
        submitCommentButton.disabled = true;
        feelsOffCheckbox.disabled = true;

        try {
            const response = await fetch('/submit_comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, comment: commentText }),
            });
            const result = await response.json();
            if (response.ok) {
                // Log to Railway only
                logToRailway({
                    type: 'COMMENT_SUBMISSION_SUCCESS',
                    message: 'Comment submitted successfully',
                    context: { function: 'submitCommentButton' }
                });
                feelsOffCommentTextarea.value = '';
                feelsOffCheckbox.checked = false;
                commentInputArea.style.display = 'none';

                if (finalPageDiv.style.display === 'none') {
                    assessmentAreaDiv.style.display = 'none';
                    chatInputContainer.style.display = 'flex';
                    userMessageInput.disabled = false;
                    sendMessageButton.disabled = false;
                    userMessageInput.focus();
                }
            } else {
                // SILENT: No participant-visible error - logged to Railway only
            }
        } catch (error) {
            // SILENT: No participant-visible error - logged to Railway only
            // Error already logged to Railway if needed
        } finally {
            commentLoadingDiv.style.display = 'none';
            if (commentInputArea.style.display !== 'none') {
                 submitCommentButton.disabled = false;
                 feelsOffCheckbox.disabled = false;
            }
        }
    });

    feelsOffCheckbox.addEventListener('change', () => {
        commentInputArea.style.display = feelsOffCheckbox.checked ? 'block' : 'none';
    });

    function displayFinalPage(summary) {
        // MODIFIED: This function now just populates the data.
        // The visibility is controlled by the new event listeners.
        finalDecisionText.textContent = `You determined that you were ${summary.ai_detected ? 'talking to an AI' : 'talking to a human'}.`;
        if (summary.final_decision_time) {
            finalDecisionTimeText.textContent = `Time taken to make final decision: ${parseFloat(summary.final_decision_time).toFixed(2)} seconds.`;
        }
        let trendText = "Turn | Confidence | Decision Time (s)\n";
        trendText += "---------------------------------------\n";
        if (summary.confidence_ratings) {
            summary.confidence_ratings.forEach(r => {
                trendText += `${String(r.turn).padEnd(4)} | ${parseFloat(r.confidence).toFixed(2).padEnd(10)} | ${r.decision_time_seconds ? parseFloat(r.decision_time_seconds).toFixed(2) : 'N/A'}\n`;
            });
        }
        confidenceTrendData.textContent = trendText;
        researcherDataSection.style.display = 'block';
        researcherDataContent.textContent = "";

        // Show the first part of the final page
        debriefPhaseDiv.style.display = 'block';
        summaryPhaseDiv.style.display = 'none';
    }

    newSessionButton.addEventListener('click', () => {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('participantId');
        sessionId = null;
        currentTurn = 0;
        aiResponseTimestamp = null;
        lastConfidenceValue = 0.5; // Reset for new session
        // NEW: Reset timing variables
        confidenceStartTime = null;
        sliderInteractionLog = [];
        messageList.innerHTML = '';
        initialForm.reset();
        
        // Manually reset sliders and their value displays to default
        allSliders.forEach(slider => {
            slider.value = slider.defaultValue;
            const valueSpan = slider.nextElementSibling;
            if (valueSpan && valueSpan.classList.contains('slider-value')) {
                valueSpan.textContent = slider.defaultValue;
            }
        });

        researcherDataSection.style.display = 'none';
        researcherDataContent.textContent = '';
        showMainPhase('consent');
        //  reset the consent form's state for the new session
        if (assignedRole === 'witness') {
            consentContentInterrogatorDiv.style.display = 'none';
            consentContentWitnessDiv.style.display = 'block';
        } else {
            consentContentInterrogatorDiv.style.display = 'block';
            consentContentWitnessDiv.style.display = 'none';
        }
        consentActionsDiv.style.display = 'block';
        consentDownloadPromptDiv.style.display = 'none';
    });

    loadResearcherDataButton.addEventListener('click', async () => {
        if (!sessionId) {
            researcherDataContent.textContent = "No active session ID to load data for.";
            return;
        }
        loadResearcherDataButton.disabled = true;
        researcherDataContent.textContent = "Loading researcher data...";
        try {
            const response = await fetch(`/get_researcher_data/${sessionId}`);
            if (!response.ok) {
                const errorText = await response.text();
                researcherDataContent.textContent = `Error loading researcher data: ${response.status} ${response.statusText}. Details: ${errorText}`;
                return;
            }
            const data = await response.json();
            researcherDataContent.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            researcherDataContent.textContent = `Error fetching or parsing researcher data: ${error.message}`;
            // Log to Railway only
            logToRailway({
                type: 'RESEARCHER_DATA_ERROR',
                message: error.message,
                stack: error.stack,
                context: { function: 'loadResearcherDataButton' }
            });
        } finally {
            loadResearcherDataButton.disabled = false;
        }
    });

    // --- Initial Page Load ---
    localStorage.removeItem('sessionId');
    aiResponseTimestamp = null;
    // NEW: Reset timing variables
    confidenceStartTime = null;
    sliderInteractionLog = [];

    // NEW: CRITICAL - Assign role BEFORE showing consent form (IRB compliance)
    // Role must be assigned first so we can show the correct consent form
    (async () => {
        const roleAssigned = await getOrAssignRole();
        if (roleAssigned) {
            // Role assigned successfully - show appropriate consent form
            if (assignedRole === 'interrogator') {
                consentContentInterrogatorDiv.style.display = 'block';
                consentContentWitnessDiv.style.display = 'none';
            } else if (assignedRole === 'witness') {
                consentContentInterrogatorDiv.style.display = 'none';
                consentContentWitnessDiv.style.display = 'block';
            }

            // Show the consent phase
            showMainPhase('consent');

            logToRailway({
                type: 'CONSENT_FORM_SHOWN',
                message: `Showing ${assignedRole} consent form`,
                context: { role: assignedRole }
            });
        } else {
            // Role assignment failed - error already shown to user
            // Don't proceed to consent form
        }
    })();

    // Log page load event with basic metadata
    logUiEvent('page_load', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || null,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        screenWidth: screen.width,
        screenHeight: screen.height
    });

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

    // NEW: reading-phase engagement telemetry — mouse/scroll/key BEFORE first slider touch.
    // Self-resets per assessment turn (keyed on aiResponseTimestamp); only counts the
    // reading window (confidenceStartTime === null). first_*_ms are relative to message appearance (baseMs).
    let readingActivityBase = null;
    let firstMouseMoveMs = null, firstScrollMs = null, firstKeypressMs = null;
    let readingMouseMoveCount = 0, readingScrollCount = 0, readingKeypressCount = 0;
    // NEW: mouse-trajectory sampling across the whole assessment phase (msg appearance -> submit)
    let mouseTrajectory = [], lastTrajSampleMs = 0, submittedBase = null;
    function noteReadingActivity(kind) {
        const baseMs = tsToMs(aiResponseTimestamp);
        if (!baseMs) return;
        if (readingActivityBase !== baseMs) { // new assessment turn -> reset
            readingActivityBase = baseMs;
            firstMouseMoveMs = firstScrollMs = firstKeypressMs = null;
            readingMouseMoveCount = readingScrollCount = readingKeypressCount = 0;
            mouseTrajectory = []; lastTrajSampleMs = 0;
        }
        if (confidenceStartTime !== null) return; // reading window only (pre first-touch)
        const dt = Date.now() - baseMs;
        if (kind === 'mouse') { readingMouseMoveCount++; if (firstMouseMoveMs === null) firstMouseMoveMs = dt; }
        else if (kind === 'scroll') { readingScrollCount++; if (firstScrollMs === null) firstScrollMs = dt; }
        else { readingKeypressCount++; if (firstKeypressMs === null) firstKeypressMs = dt; }
    }
    document.addEventListener('mousemove', (e) => {
        noteReadingActivity('mouse');
        const baseMs = tsToMs(aiResponseTimestamp);
        if (!baseMs || submittedBase === baseMs) return; // stop after submit until next turn
        const now = Date.now();
        if (now - lastTrajSampleMs >= 50) { // throttle ~20 Hz
            lastTrajSampleMs = now;
            mouseTrajectory.push([Math.round(e.clientX), Math.round(e.clientY), now - baseMs]);
        }
    }, { passive: true });
    document.addEventListener('scroll', () => noteReadingActivity('scroll'), { passive: true, capture: true });
    document.addEventListener('keydown', () => noteReadingActivity('key'), { passive: true });

    // NEW: Tab visibility tracking
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabHiddenStartTime = Date.now();
            markPageInactiveStart();
            logSuspiciousEvent('tab_hidden', {
                turn: currentTurn,
                timestamp: tabHiddenStartTime
            });
        } else {
            markPageInactiveEnd();
            if (tabHiddenStartTime) {
                const hiddenDuration = Date.now() - tabHiddenStartTime;
                cumulativeTabHiddenMs += hiddenDuration;
                turnTabHiddenInstances.push(hiddenDuration);
                logSuspiciousEvent('tab_visible', {
                    turn: currentTurn,
                    hidden_duration_ms: hiddenDuration,
                    cumulative_hidden_ms: cumulativeTabHiddenMs,
                    timestamp: Date.now()
                });
                tabHiddenStartTime = null;
            }
        }
    });

    // FIX D1b (03Aug26): if the tab dies while a rating is mid-flight, fire it as a
    // beacon (text/plain body avoids a CORS preflight during unload; the backend
    // parses the JSON body regardless, and dedupes by turn if both copies arrive).
    window.addEventListener('pagehide', () => {
        if (pendingRatingBeacon) {
            try {
                navigator.sendBeacon(`${API_BASE_URL}/submit_rating`,
                    new Blob([pendingRatingBeacon], { type: 'text/plain' }));
            } catch (e) {}
            pendingRatingBeacon = null;
        }
    });

    window.addEventListener('blur', () => {
        markPageInactiveStart();
        logSuspiciousEvent('window_blur', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole
        });
    });

    window.addEventListener('focus', () => {
        const inactiveDuration = markPageInactiveEnd();
        logSuspiciousEvent('window_focus', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            inactive_duration_ms: inactiveDuration
        });
    });

    document.addEventListener('paste', (event) => {
        const pastedText = event.clipboardData ? event.clipboardData.getData('text') : '';
        logUntrustedInputEvent(event, 'document');
        logSuspiciousEvent('paste', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            target: describeEventTarget(event.target),
            pasted_char_count: pastedText.length,
            pasted_word_count: pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0,
            pasted_text: pastedText,
            is_trusted: event.isTrusted
        });
    }, true);

    document.addEventListener('copy', (event) => {
        const selectionText = window.getSelection ? String(window.getSelection()) : '';
        logUntrustedInputEvent(event, 'document');
        logSuspiciousEvent('copy', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            target: describeEventTarget(event.target),
            selected_char_count: selectionText.length,
            selected_word_count: selectionText.trim() ? selectionText.trim().split(/\s+/).length : 0,
            is_trusted: event.isTrusted
        });
    }, true);

    document.addEventListener('contextmenu', (event) => {
        logUntrustedInputEvent(event, 'document');
        logSuspiciousEvent('contextmenu', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
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
                turn: currentTurn,
                timestamp: Date.now(),
                role: currentRole,
                selected_char_count: selectionText.length,
                selected_word_count: selectionText.trim() ? selectionText.trim().split(/\s+/).length : 0
            });
        }, 750);
    });

    window.addEventListener('pagehide', () => {
        logSuspiciousEvent('pagehide', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            sessionId: sessionId
        });
    });

    window.addEventListener('pageshow', (event) => {
        const inactiveDuration = markPageInactiveEnd();
        logSuspiciousEvent('page_lifecycle_pageshow', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            persisted: event.persisted,
            inactive_duration_ms: inactiveDuration
        });
    });

    document.addEventListener('freeze', () => {
        markPageInactiveStart();
        logSuspiciousEvent('page_lifecycle_freeze', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole
        });
    });

    document.addEventListener('resume', () => {
        const inactiveDuration = markPageInactiveEnd();
        logSuspiciousEvent('page_lifecycle_resume', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            inactive_duration_ms: inactiveDuration
        });
    });

    window.addEventListener('beforeunload', () => {
        if (isIntentionalRedirect) return;
        logSuspiciousEvent('page_lifecycle_beforeunload', {
            turn: currentTurn,
            timestamp: Date.now(),
            role: currentRole,
            sessionId: sessionId
        });
    });

    // NEW: Periodic status ping for monitoring (logs to Railway every 30 seconds)
    // Helps researcher see interrogator/witness balance and catch issues early
    let statusPingInterval = null;

    async function doStatusPing() {
        try {
            const response = await fetch('/study_status_ping');
            const result = await response.json();

            if (result.status === 'ok') {
                // Log summary to Railway for visual monitoring
                logToRailway({
                    type: 'STATUS_PING',
                    message: `📊 I: ${result.interrogators.total} (${result.interrogators.waiting}W/${result.interrogators.in_conversation}C) | W: ${result.witnesses.total} (${result.witnesses.waiting}W/${result.witnesses.in_conversation}C) | Δ: ${result.waiting_mismatch}`,
                    context: {
                        study_mode: result.study_mode,
                        interrogators: result.interrogators,
                        witnesses: result.witnesses,
                        waiting_mismatch: result.waiting_mismatch,
                        total_mismatch: result.total_mismatch,
                        role_counter: result.role_counter
                    }
                });
            }
        } catch (error) {
            // Silently fail - this is just monitoring, shouldn't disrupt user
        }
    }

    // Start status ping interval (every 30 seconds)
    // Only run if we have a session (after role assignment)
    setTimeout(() => {
        if (participantId) {
            // Initial ping
            doStatusPing();

            // Then every 30 seconds
            statusPingInterval = setInterval(doStatusPing, 30000);
        }
    }, 5000); // Wait 5 seconds after page load to start

});
