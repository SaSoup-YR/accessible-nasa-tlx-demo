# Version 0.7 technical test checklist

Use synthetic data only. Do not recruit or collect participant data until the supervisor has reviewed the frozen candidate and the ethics/data-management route is confirmed.

## 1. Study-conductor setup

1. Open [the study-conductor page](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html).
2. Enter a non-identifying study ID, participant-facing title and exact task label.
3. Confirm that **Prepared defaults with optional participant choice** is selected for an accessibility-support evaluation.
4. Switch among all three adjustment policies and confirm their descriptions distinguish controlled measurement from formative accessibility evaluation.
5. Generate a local configuration, download it, import it and confirm the same configuration ID/link.
6. Import a completed-result JSON and confirm that the visible error explains the wrong file type and receives focus.

## 2. Participant configuration and provenance

1. Open the generated local link.
2. Confirm that study/task context and prepared settings are already applied.
3. With participant-choice enabled, start without opening preferences; no setting is mandatory.
4. Change simpler explanations, answer presentation, text size, automatic audio and recovery at different stages.
5. Complete six ratings and fifteen pair comparisons using visible controls, keyboard and permitted voice/gaze routes.
6. Submit and export JSON/CSV.
7. Verify that the record contains the starting configuration, final support state, chronological support changes and per-answer input routes.
8. Confirm that changing support does not change the six official dimensions, rating values, pair count or scoring.

## 3. Voice, errors, recovery and gaze

1. Confirm and replace voice-proposed numeric and smiley answers; Next must work immediately and selected visuals must stay synchronized.
2. Trigger each validation/import/submission error and confirm focus and viewport move to the error summary.
3. Save, close and resume with the same configuration/code; the return summary and support-change history must be preserved.
4. Treat WebGazer target accuracy as Partial. Verify permission, positioning, calibration, proposal, separate confirmation, recalibration and camera stop without claiming accurate independent control.

## 4. Qualtrics cross-device collection

Complete every step in [`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md):

1. create the UCL Qualtrics survey and declare every Embedded Data field;
2. paste the generated iframe HTML and tested question JavaScript;
3. disable IP recording unless approved;
4. open the Qualtrics distribution/preview link on a second device;
5. complete `TEST-001` and confirm automatic Qualtrics advancement;
6. verify one central Data & Analysis row, all six ratings/weights, fifteen pair choices, support metadata and raw JSON chunks;
7. interrupt the network at submission and confirm Review/retry instead of false completion;
8. confirm the participant link/bundle contains no token and accepts receipts only from the configured Qualtrics origin.

Do not describe cross-device collection as activated until the synthetic row has been observed and exported from the actual UCL account.

## 5. Accessibility and resilience

Record Pass, Partial, Fail or Not supported for:

- keyboard-only navigation, native radios and visible focus;
- NVDA with Chrome/Edge and VoiceOver with Safari;
- standard/large text, 200% zoom and 320 CSS-pixel reflow;
- standard ratings, experimental smiley landmarks and precise-scale fallback;
- simpler explanations and built-in spoken summaries;
- confirmed voice with visible-control fallback;
- iPhone portrait/landscape;
- storage disabled/full;
- Qualtrics iframe title, focus order and screen-reader behaviour;
- Chrome, Edge, Firefox and Safari export/collection routes.

Automated structural scans, jsdom interaction tests and a mocked WebGazer engine do not establish accessibility, disability-group benefit, gaze accuracy or psychometric equivalence.
