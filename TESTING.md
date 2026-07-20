# Version 0.5 technical test checklist

Use synthetic data only. Do not recruit or collect participant data until the supervisor has reviewed the frozen candidate and the ethics/data-management route is confirmed.

## 1. Study-conductor setup

1. Open [the study-conductor page](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html).
2. Enter a non-identifying study ID such as `TLX-PILOT-01`, a title and an exact task label.
3. Choose the starting support. Keep participant adjustments locked unless the approved protocol explicitly permits personalisation.
4. Keep experimental gaze off unless gaze is specifically being tested.
5. Generate the participant link.
6. Download the configuration JSON, then import it and confirm that the same configuration ID and link are regenerated.
7. Try the configuration importer with a completed-result JSON. Confirm that it identifies the wrong file type and moves focus and the viewport to the visible error summary.

## 2. Participant route

1. Open the generated link in a new tab in the same browser.
2. Confirm that the study title, ID, task and prepared settings are already present.
3. Confirm that the support controls are absent when the configuration is locked.
4. Select **Hear a summary of this step** on the first page. Confirm that speech starts on the first request and names the configured task.
5. On a rating, recognise and confirm a spoken value, then immediately select **Next question**. Confirm that navigation advances once and the stored route is voice.
6. Start voice input again, then choose a visible value instead of confirming the proposal. Confirm that the proposal closes, the visible answer replaces it and **Next question** works.
7. With smiley landmarks configured, confirm a spoken landmark value. Confirm that the matching native smiley radio shows its selected state and focus indicator, and the precise scale reports the same value.
5. Enter a synthetic code such as `TEST-001`; do not enter a name or email address.
6. Complete six ratings and fifteen comparisons.
7. Review, correct and deliberately submit.
8. Confirm that the completion page says the record is local and offers JSON/CSV backup files.
9. If the score-display option was off, confirm that the participant page does not show the weighted score.

## 3. Conductor export

1. Return to `study.html` in the same browser and device.
2. Confirm the row shows the correct study ID, synthetic participant code, completion time and weighted score.
3. Export all results as JSON and CSV.
4. Check that JSON contains configuration, responses, calculation and support metadata.
5. Check that CSV contains rating, weight, weighted-rating, pair-choice and input-route columns.
6. Only after verifying both files, test the explicit erase control.

## 4. Expected remote boundary

Open the participant link in another browser profile or device. A result completed there must not appear in the first browser's conductor page. This is expected for static GitHub Pages and confirms that remote collection still needs an approved host adapter.

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
- CSV/JSON export in Chrome, Edge, Firefox and Safari.

Webcam gaze remains experimental and current target accuracy is recorded as Partial. Technical operation is not evidence of reliable independent use.
