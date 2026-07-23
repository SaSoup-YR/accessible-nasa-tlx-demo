# Version 0.7 study workflow and architecture decision

Decision dates: 20–23 July 2026

## Supervisor questions addressed

The workflow must make explicit:

1. which interface belongs to the study conductor and which belongs to the participant;
2. why a participant with an impairment is not required to configure the questionnaire;
3. how a configuration is exported;
4. how complete answers are saved and returned to a remote researcher.

Version 0.7 treats these as architecture and governance requirements rather than adding another download button.

## Two roles, one implementation

- `study.html` is the study-conductor page.
- the configured `index.html#study=...` route is the participant page.
- shared TypeScript modules define the instrument, scoring, configuration, result and collection contracts.

The conductor creates a versioned configuration containing study context, support defaults, participant-adjustment policy, available input routes, score-display policy and result-collection mode. The participant link contains configuration only. It contains no identity, answer or secret.

## End-to-end workflows

### Local technical or supervised same-device test

1. The conductor selects local collection and generates a configuration.
2. The participant enters a synthetic or pseudonymous code and completes the prepared questionnaire.
3. The complete record is stored in the same browser.
4. The conductor returns to `study.html`, exports JSON/CSV, verifies the files and explicitly erases the local copy.

This mode is not remote collection and is vulnerable to browser-data clearing or device loss.

### Approved remote Qualtrics study

1. The conductor selects Qualtrics and pastes the survey/preview URL.
2. The configuration stores only the exact HTTPS Qualtrics origin.
3. The generated participant URL is placed in the Qualtrics iframe using the documented bridge.
4. The participant receives and opens the Qualtrics distribution link.
5. After questionnaire submission, the child page sends one versioned record to the verified parent window.
6. Qualtrics writes Embedded Data, returns a matching submission receipt and advances.
7. The researcher retrieves the response from Data & Analysis and exports it through the restricted UCL account.

Participant download-and-email is not the normal procedure.

## Participant autonomy without participant setup

The conductor always supplies usable defaults. Three policies support different research designs:

- **locked** for a controlled measurement condition;
- **presentation-only** for changes to text, automatic speech and recovery;
- **participant-choice** for a formative accessibility evaluation in which all optional support may be changed and changes are logged.

The Version 0.7 conductor starts with participant-choice because the current project evaluates an accessibility support cluster. This does not prevent a controlled protocol from selecting locked. In every policy, official NASA-TLX content and scoring remain fixed and no preference must be changed before Start.

The choice log provides setting, before/after value, stage and timestamp. Final settings and per-answer input routes are also saved. This creates a distinction between:

- what the researcher configured;
- what the participant selected;
- what interaction route produced each answer;
- the official NASA-TLX response and score.

## Result schema

JSON is the lossless record and CSV is the flattened analysis representation.

| Area | Contents |
| --- | --- |
| Provenance | schema, prototype, study, configuration and submission IDs |
| Identity boundary | pseudonymous participant code only |
| Timing | start, support-change and completion timestamps |
| Official answers | six ratings and fifteen pair choices |
| Presentation | random pair order and configured support |
| Calculation | six weights, adjusted ratings and weighted score |
| Actual support | final state, chronological changes, read-aloud/recovery/gaze metadata |
| Input provenance | route used for each rating and pair |
| Collection | local or Qualtrics route |

The validation function recalculates the score before accepting a stored result. Support metadata never enters scoring.

## Qualtrics integration choice

The selected bridge uses the browser's cross-origin messaging model because:

- GitHub Pages is static and cannot centrally store research responses;
- calling a Qualtrics or REDCap REST API from public client code would expose a token;
- the Qualtrics parent already owns the active response and can save Embedded Data without a public secret;
- exact origin and source-window checks restrict the receiver;
- a stable receipt and retry state avoid a false-success message.

The complete setup and cross-device verification procedure is in [`QUALTRICS-INTEGRATION.md`](QUALTRICS-INTEGRATION.md).

## Repository decision

The private `accessible-hci-questionnaire-library` is the canonical dissertation and evidence repository. The public `accessible-nasa-tlx-demo` repository is a readable release snapshot and GitHub Pages deployment. Public source, tests, integration instructions and build provenance are retained so another researcher can inspect and reproduce the implementation.

## Evaluation boundary

Technical tests demonstrate expected software behaviour. They do not demonstrate improved accessibility, psychometric equivalence, WebGazer accuracy or effectiveness for any impairment group. Those conclusions require an approved evaluation with relevant participants and defined outcomes.
