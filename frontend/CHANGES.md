# Frontend adaptation notes

New frontend for the "Fool Me With AI" study, adapted from the live Turing-test site
(`research-studies.github.io-main/`). Files: `index.html`, `static/script.js`, `static/style.css`.
Plain HTML/CSS/JS, no build step, no new external dependencies.

## Kept from the existing frontend

- Visual design and CSS: page/container, form layout, Likert bubbles, checkbox groups, chat window
  and message bubbles, slider track/thumb with the "pristine" hidden-thumb state (generalised from
  `#confidence-slider` to `.rating-slider` so two sliders share it), slider end labels, modal
  overlay, spinner, progress bar, instruction pagination, attention-check option styling (now
  `.check-option`), fixed timer badge, `.error-message`, the defensive `button > *` rule, and the
  bouncing-dots indicator (now `#assistant-working`, shown while a reply is pending).
- `isProduction` detection and the `window.fetch` monkey-patch, verbatim. The two backend constants
  are replaced by one `BACKEND_URL = 'https://PLACEHOLDER-backend.up.railway.app'`; on
  localhost/127.0.0.1 the page uses `LOCAL_BACKEND_URL = 'http://127.0.0.1:8011'`.
- Prolific completion pattern: `PROLIFIC_COMPLETE_BASE + code`, `prepareIntentionalRedirect()`,
  production redirect vs. dev-mode notice. Codes are the constants `PROLIFIC_COMPLETION_CODE`,
  `PROLIFIC_NO_CONSENT_CODE`, `PROLIFIC_NO_STATEMENT_CODE` (all `PLACEHOLDER_...` strings). The
  backend's own codes are used when they are not placeholders.
- Consent phase (interrogator variant only) with the agree / disagree buttons and the optional PDF
  download (`generateAndDownloadPdf` + the existing jsPDF CDN script). Consent text rewritten for
  this study; it still needs IRB wording review.
- Instructions pagination component and its prev/next/indicator mechanics; the last page turns
  Next into "Submit answers" and the confirm button appears only after the check is passed.
- Attention-check mechanics (`shuffleArray`, populate once, validate, error text, attempt logging)
  reused as a two-question comprehension check (bonus rule, stated purpose).
- Initial survey form structure and the Likert bubble handlers (hidden input per group, now scoped
  to the containing form) reused for cue elicitation, the post-task manipulation check, and
  demographics.
- `logUiEvent` (now feeds the telemetry queue), the input-provenance tracker
  (`createInputProvenanceTracker`: paste, drop, beforeinput types, large text jumps, typing speed,
  focus time, untrusted events; plus a `syncValue()` so programmatic edits such as "Use this" are
  not flagged), the suspicious-behaviour listeners (automation fingerprint, tab hidden/visible with
  durations, window blur/focus, document paste/copy/contextmenu/selection, pagehide/pageshow/
  freeze/resume/beforeunload), and the screen-timer utility (`startScreenTimer` /
  `clearScreenTimer` with reset-on-activity). Screen timers now only log `screen_inactive` after
  3 minutes idle and drive the timeout-mode backstop; they never eject a participant.
- Confidence slider markup and interaction logging (first touch, every move, submit), now for two
  sliders with times in ms from screen open.
- Feedback textarea pattern (mandatory text, provenance summary) for the two post-task textareas.
- Demographics form: every original question kept, `novalidate` plus the pointed error box and
  the same validation rules; four questions added from the SPEC data model (AI writing frequency,
  detector familiarity, writing frequency, English first language). Sent as `{answers: {...}}`.
- Final page / debrief structure (download button, continue) and the error helpers `showError`,
  `getApiErrorMessage` (extended with `describeApiError` for the backend's `{error: ...}` codes).

## Removed

Roles and witness/interrogator assignment, the second consent form, waiting room and match
polling, partner polling, partner typing indicator and intermittent bubbles, partner dropout
handling and its modals, witness screens and modals, network-delay updates, the binary human/AI
choice and per-turn comment, the researcher-data section, the summary chart, the "new session"
button, the status ping, `logToRailway` (`/debug_log`), the abandon redirect on unload
(`report_abandonment`, `record_completion_code`), the exit-scenario taxonomy with per-condition
codes, the demographics and final-instructions modals, mouse-trajectory and reading-activity
sampling (turn-based; no equivalent here), and the client-side `participantId` UUID (the server
session token replaces it).

## Added (SPEC section 3 order)

1. Landing: reads `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`, calls `POST /api/session/start`,
   stores the token in `localStorage` (`foolme_session_token`), shows a retry button if the call
   fails, then shows consent. Consent posts `{consented: true}`; declining posts
   `{consented: false}` and redirects with the returned code (or the placeholder constant).
2. Cue elicitation: free text plus nine 1-7 ratings (overly formal, em dashes, repetitive sentence
   structure, excessive transitions, generic examples, no personal detail, too-polished grammar,
   certain vocabulary, predictable paragraph structure) and an optional "anything else" text
   (sent as `checklist.other_text`, covering SPEC's "other").
3. Instructions: four pages showing `topic_text`, `purpose_text`, `min_words`, `time_cap_min`,
   `bonus_rule_text`, a feedback/no-feedback note, and the comprehension check (bonus outcome,
   stated purpose). Distractors avoid the other conditions' amounts and purposes.
4. Workspace: left pane chat with "your writing assistant" (the model family is never shown),
   prompt textarea (Enter sends, Shift+Enter newline), message list, `POST /prompt` with
   `attach_essay: true` and the current essay; each reply has "Use this as my statement"
   (`POST /apply`). Right pane: editor with live word count against `min_words`, "Start over"
   (confirm, clears editor, next Done is `source: "regenerate"`), "Done with this change"
   (enabled only when word count >= min_words and text differs from the last recorded version;
   `POST /revision` with `source: "manual"` or `"regenerate"`, plus `prompt_id` when the text was
   seeded from a reply). Countdown from `time_cap_min`; at zero the workspace locks and the last
   recorded version goes to the rating screen in timeout mode. Inline handling of `too_short`
   (offers "Put it in the editor" for a short reply), `unchanged`, `time_cap`,
   `already_submitted`, network failures (retry buttons).
5. Rating screen: version heading, collapsible text preview, Pangram verdict panel (label plus
   "Passed" / "Not yet" / unavailable) only when `condition_feedback` is true and the version
   response carried a detector block; two 0-100 sliders with first-touch/move/submit logging;
   KEEP EDITING (`POST /rate decision=continue`) and SUBMIT (`POST /rate decision=submit`, then
   `POST /submit`). Timeout mode hides KEEP EDITING, uses `decision=timeout`,
   `censored: true`, and auto-submits after 90 s idle so nobody is stranded.
6. Result page: verdict, passed / did not pass, bonus awarded and amount in plain words; handles
   `scoring_unavailable` and `already_submitted`. Raw scores are never shown.
7. Post-task questions: what changed and why, which edits helped most, mattered 1-7, recalled
   bonus (text), recalled purpose (text). `POST /post_survey`.
8. Demographics (reused form) `POST /demographics {answers}`.
9. Final page: debrief, `GET /complete`, completion code shown, "Finish" redirects to Prolific.
   On `not_submitted` (time ran out with no statement) the page explains and offers the
   `PROLIFIC_NO_STATEMENT_CODE` path instead of a dead end.
- Telemetry batched every 10 s and on hide/pagehide/freeze via `fetch(..., {keepalive: true})`
  in chunks of 40 events (browsers cap keepalive bodies at 64 KB). Events:
  `{event, at_ms, payload, version_id?}` with `at_ms` relative to session start and
  `payload.epoch_ms` absolute.
- Resume after refresh: the token, condition data, progress flags, essay draft, chat, versions,
  and pending rating are kept in `localStorage` (`foolme_state_v1`, 6-hour window, same
  PROLIFIC_PID). A refresh returns to the same screen; the timer continues from the original
  workspace-open time; state is cleared on Finish.
- Client-side errors (`error`, `unhandledrejection`) are logged as telemetry, never shown.

## Endpoints the page calls

| Call | Payload | Response fields used |
|---|---|---|
| `POST /api/session/start` | `{prolific_pid, study_id, session_id, user_agent}` | `session_token, condition_feedback, condition_stakes, bonus_usd, purpose_text, topic_text, min_words, time_cap_min, bonus_rule_text` (`model_family` is received but never displayed) |
| `POST /api/session/{tok}/consent` | `{consented: true}` or `{consented: false}` | `completion_code` on decline |
| `POST /api/session/{tok}/cues` | `{free_text, checklist: {overly_formal..predictable_paragraphs: 1-7, other_text?}}` | `ok` |
| `POST /api/session/{tok}/prompt` | `{prompt_text, attach_essay: true, essay_text}` | `prompt_id, reply_text, latency_ms, error` |
| `POST /api/session/{tok}/apply` | `{prompt_id}` | `version_id, seq, word_count, detector` |
| `POST /api/session/{tok}/revision` | `{essay_text, source: "manual"\|"regenerate", prompt_id?}` | `version_id, seq, word_count, detector`; errors `too_short`, `unchanged` (400), `time_cap`, `already_submitted` (409) |
| `POST /api/session/{tok}/rate` | `{version_id, conf_human, conf_detector, decision: continue\|submit\|timeout, seconds_on_screen, slider_log: {events:[{slider, event, t_ms, value}], human_touched, detector_touched, mode, cumulative_tab_hidden_ms}}` | `ok` |
| `POST /api/session/{tok}/submit` | `{version_id, censored}` | `final.{pangram_label, passed, bonus_awarded, bonus_usd, scoring_unavailable, already_submitted}` (`pangram_score_ai` is ignored) |
| `POST /api/session/{tok}/telemetry` | `{events: [{event, at_ms, payload, version_id?}]}` | `ok` |
| `POST /api/session/{tok}/post_survey` | `{what_changed_text, most_helpful_text, checklist: {}, manip_mattered_1to7, manip_recalled_bonus, manip_recalled_purpose}` | `ok` |
| `POST /api/session/{tok}/demographics` | `{answers: {ai_usage_frequency, ai_models_used[], ai_writing_frequency, detector_familiarity, writing_frequency, ai_capabilities_rating, trust_in_ai, age, gender, education, english_first_language, ethnicity[], income, political_affiliation, social_media_platforms[], internet_usage_per_week}}` | `ok` |
| `GET /api/session/{tok}/complete` | none | `completion_code` (a `PLACEHOLDER` value falls back to the frontend constant) |

## Mismatches noticed between SPEC.md and app/main.py (backend not changed)

1. `GET /complete`: SPEC says `-> {code}`; main.py returns `{completion_code, bonus_awarded, bonus_usd}`. The page uses `completion_code`.
2. `POST /submit`: SPEC lists `{pangram_label, passed, bonus_awarded, bonus_usd}`; main.py also returns `pangram_score_ai` (a raw detector score sent to the participant's browser; the page ignores it and never displays it, but it is visible in dev tools) plus `scoring_unavailable`, and on a repeat call `{pangram_label: null, passed, bonus_awarded, bonus_usd, already_submitted: true}`.
3. `POST /revision` detector block: SPEC says `{pangram: {score_ai, label}}`; main.py adds `passed` and `unavailable`, and `score_ai` is sent to the feedback group's browser even though only the label should be shown. The page shows only label and passed.
4. `POST /prompt`: SPEC says `{prompt_id, reply_text, latency_ms}`; main.py also returns `seq` and `error` (`"model_unavailable"`) and can return HTTP 200 with `reply_text: null`. The page treats that as a retryable failure.
5. `POST /rate`: main.py additionally accepts `seconds_on_screen` (not in SPEC); the page sends it.
6. `POST /submit`: main.py accepts `censored` (not in SPEC section 5, though section 3.9 requires a censored flag); the page sends `censored: true` on the time-cap path.
7. `POST /revision` `source`: SPEC allows `manual|regenerate`; main.py also accepts `llm_apply`. The page never sends `llm_apply` itself (that is `/apply`).
8. Time cap: SPEC 3.4 implies the timer starts when the workspace opens, but main.py sets `workspace_opened_at` on the first `/prompt` or `/revision` (there is no "workspace opened" call). The server cap therefore starts later than the page's timer and is always at least as lenient (plus a 1-minute grace), so the page's timer is authoritative for the participant. `Version.minutes_since_start` is measured from that later server time.
9. SPEC 3.9 says the time-cap path force-submits the latest revision, but if no revision exists (never reached 250 words) the backend has nothing to submit and `GET /complete` returns 409 `not_submitted`. The page tries to record the editor text first; if that fails it shows a plain explanation and the `PROLIFIC_NO_STATEMENT_CODE` path. A no-statement completion code, or a backend path that completes such a session, would be cleaner.
10. SPEC 3.2 lists an "other" checklist item; the checklist schema is a free dict, so the page sends `other_text` when filled.
11. SPEC 4 `post_survey.checklist_json`: no checklist is specified for the post survey in section 3.7; the page sends `checklist: {}`.
12. `/health` exists in main.py but not in SPEC (not used by the page).
13. CORS: `config.CORS_ORIGINS` defaults include `localhost:8000`, `127.0.0.1:8000`, `localhost:5500`, `127.0.0.1:5500`. For local development serve the frontend from one of those, e.g. `python3 -m http.server 8000 --directory frontend`, with uvicorn on 8011 as in the backend README.
14. Prolific codes: `config.PROLIFIC_COMPLETION_CODE` / `PROLIFIC_NO_CONSENT_CODE` default to `"PLACEHOLDER"`; the page treats any code starting with `PLACEHOLDER` as missing and falls back to its own constants, so both sides need real codes before the pilot.

## Owner to-do before the pilot

- Fill `BACKEND_URL` and the three `PROLIFIC_*_CODE` constants at the top of `static/script.js`.
  While this frontend was being written, SPEC section 11 and the backend README were updated to
  name the live service: `https://backend-production-8c45.up.railway.app` (health at `/health`).
  `BACKEND_URL` was left as the requested placeholder; it is a one-line change. Sections 3 and 5
  of the SPEC did not change, and `app/main.py` / `app/schemas.py` were not modified, so the
  contract above is current.
- Make sure the deployed `CORS_ORIGINS` includes `https://research-studies.github.io`.
- Keep `PURPOSE_SHORT` (script.js, comprehension check) in sync with `topics.PURPOSE_BY_STAKES`.
- Review the rewritten consent and debrief wording (index.html and the two PDF strings in script.js).
- Decide whether to keep the optional consent/debrief PDF download (jsPDF from cdnjs, already used by the old site). Dropping it means removing the `<script>` tag, `generateAndDownloadPdf`, and the two download buttons.

## Verification

- `node --check static/script.js` passes.
- Headless Chrome (DevTools protocol) walked the whole flow against the backend running locally in
  `FAKE_LLM=1 FAKE_DETECTORS=1` mode: start, consent, cues (with a pointed validation error),
  instructions and comprehension check (wrong answers blocked, correct answers unlock), workspace
  (word count, Done gating, prompt, reply, `too_short` apply path with the "Put it in the editor"
  action, apply, rating with pristine sliders and button gating, KEEP EDITING, manual edit, Done,
  SUBMIT), result, post survey, demographics (pointed Likert error), completion code, dev-mode
  redirect notice, state cleared on Finish; plus a second session covering resume after refresh on
  the instructions screen and mid-essay (draft and chat restored), Start over with
  `source=regenerate`, and the forced time-cap path (timeout notice, KEEP EDITING hidden,
  `decision=timeout`, `censored=True` on the server). Telemetry, ratings and versions rows were
  confirmed through the admin CSV export. No page exceptions.
