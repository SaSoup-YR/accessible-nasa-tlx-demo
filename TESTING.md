# Version 0.6 technical test checklist

Use synthetic data only. Do not recruit or collect participant data until the supervisor has reviewed the frozen candidate and the ethics/data-management route is confirmed.

## 1. Study-conductor setup

1. Open [the study-conductor page](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html).
2. Enter a non-identifying study ID such as `TLX-PILOT-01`, a title and an exact task label.
3. Choose the starting support. Keep **Prepared settings only** unless the approved protocol permits presentation-only personalisation.
4. If presentation-only personalisation is enabled, confirm that participants can change only text size, automatic spoken guidance and recovery. Simpler explanations and standard/smiley presentation must remain fixed.
5. Keep experimental gaze off unless gaze is specifically being tested.
6. Generate the participant link.
7. Download the configuration JSON, then import it and confirm that the same configuration ID and link are regenerated.
8. Try the configuration importer with a completed-result JSON. Confirm that it identifies the wrong file type and moves focus and the viewport to the visible error summary.

## 2. Participant route

1. Open the generated link in a new tab in the same browser.
2. Confirm that the study title, ID, task and prepared settings are already present.
3. Confirm that the support controls are absent when the configuration is locked.
4. Select **Hear a summary of this step** on the first page. Confirm that speech starts on the first request and names the configured task.
5. On a rating, recognise and confirm a spoken value, then immediately select **Next question**. Confirm that navigation advances once and the stored route is voice.
6. Start voice input again, then choose a visible value instead of confirming the proposal. Confirm that the proposal closes, the visible answer replaces it and **Next question** works.
7. With smiley landmarks configured, confirm a spoken landmark value. Confirm that the matching native smiley radio shows its selected state and focus indicator, and the precise scale reports the same value.
8. Enter a synthetic code such as `TEST-001`; do not enter a name or email address.
9. Complete six ratings and fifteen comparisons.
10. Review, correct and deliberately submit.
11. Confirm that the completion page says the record is local and offers JSON/CSV backup files.
12. If the score-display option was off, confirm that the participant page does not show the weighted score.

## 3. Conductor export

1. Return to `study.html` in the same browser and device.
2. Confirm the row shows the correct study ID, synthetic participant code, completion time and weighted score.
3. Export all results as JSON and CSV.
4. Check that JSON contains configuration, responses, calculation and support metadata.
5. Check that CSV contains rating, weight, weighted-rating, pair-choice and input-route columns.
6. Only after verifying both files, test the explicit erase control.

## 4. Remote collection boundary

### Raw GitHub Pages

Open the participant link in another browser profile or device. A result completed there must not appear in the first browser's conductor page. This confirms the static-hosting boundary.

### Approved host-adapter test

After the UCL-selected platform installs `window.accessibleNasaTlxResultSink`:

1. Complete from a second device.
2. Confirm the participant sees a platform receipt rather than the local-only message.
3. Confirm the same submission ID appears once in the researcher's restricted platform.
4. Simulate a failed save. Confirm the participant remains on Review, focus moves to the error, answers remain available and retry uses the same submission ID.
5. Confirm no credential appears in the participant URL, JavaScript bundle, browser storage or exported configuration.

## 5. Accessibility and resilience

Record each route as Pass, Partial, Fail or Not supported:

- keyboard-only navigation and visible focus;
- NVDA with Chrome or Edge, and VoiceOver with Safari as a separate check;
- standard and large text, 200% zoom and 320 CSS-pixel reflow;
- standard ratings, experimental smiley landmarks and precise-scale fallback;
- simpler explanations and built-in spoken guidance;
- confirmed voice input with visible-control fallback;
- save, close, reopen and resume with the same configuration and code;
- invalid/missing participant code and invalid configuration-link errors;
- webcam consent, positioning, calibration, dwell proposal, separate confirmation and camera stop;
- storage-disabled or storage-full failure messaging;
- CSV/JSON export in Chrome, Edge, Firefox and Safari;
- approved-host receipt, duplicate-submission and retry behaviour on a second device.

Webcam gaze remains experimental and current target accuracy is recorded as Partial. Technical operation is not evidence of reliable independent use.
