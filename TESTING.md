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
2. Confirm that the proposed answer is spoken by the screen reader and that focus moves to the confirmation button whose name contains the exact proposed value or factor.
3. In smiley mode, first say the displayed numeric values `zero`, `twenty five`, `fifty`, `seventy five` and `one hundred`. Then say `close to low`, `closer to low`, `middle`, `closer to high` and the two endpoints. Confirm proposals are 25, 25, 50, 75, 0/100 as displayed; repeat Performance with Good/Poor anchors. Record whether the recogniser returns the exact homophones `lo`, `hi` or `pour`, which the bounded parser accepts only as a proposal.
4. Say `not low`, `anything but low`, `other than high`, `low or high`, `closer to low or high`, `closer to low 100`, `twenty three`, `73`, `closer to pool` and both names in one comparison. Confirm that no answer is proposed or selected.
5. Trigger each validation/import/submission error and confirm focus and viewport move to the error summary.
6. Save and reload the same tab. Confirm that the pseudonymous code is restored for that tab, focus moves to the saved-session offer and the participant still chooses Resume or Erase. Close the tab, then separately test the approved shared-device procedure.
7. Enable automatic built-in audio and confirm that a Smiley question speaks its five labels and values rather than only a generic 0–100 range. Trigger a voice proposal, simpler help, a missing-answer error, a restored session and local completion; record whether each event is spoken.
8. Treat WebGazer target accuracy as Partial. Verify permission, positioning, calibration, proposal, separate confirmation, recalibration and camera stop without claiming accurate independent control.

## 4. Qualtrics cross-device collection

Complete every step in [`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md):

1. create the UCL Qualtrics survey and declare every Embedded Data field;
2. use the four labelled copy blocks on `study.html`; do not upload repository files or paste the static HTML template unchanged;
3. paste the complete generated question HTML in the Text/Graphic question's HTML/source view and the tested JavaScript in that question's JavaScript editor;
4. disable IP recording unless approved;
5. open the Qualtrics distribution/preview link on a second device;
6. complete `TEST-001` and confirm automatic Qualtrics advancement;
7. verify one central Data & Analysis row, all six ratings/weights, fifteen pair choices, support metadata and raw JSON chunks;
8. interrupt the network at submission and confirm Review/retry instead of false completion;
9. confirm that the 1.5-second in-frame handoff says no download is required, then verify the persistent End-of-Survey page; do not treat the emergency JSON/CSV buttons as a timed participant task;
10. in a copied synthetic survey only, test the failed-advance watchdog and restored native navigation where this can be done safely;
11. confirm the participant link/bundle contains no token and accepts receipts only from the configured Qualtrics origin;
12. run every case in [`docs/FAILURE-RECOVERY-VERIFICATION.md`](docs/FAILURE-RECOVERY-VERIFICATION.md), recording expected and observed outcomes.

Do not describe cross-device collection as activated until the synthetic row has been observed and exported from the actual UCL account.

## 5. Accessibility and resilience

Record Pass, Partial, Fail or Not supported for:

- keyboard-only navigation, native radios and visible focus;
- persistent selected states after focus moves away, including visible check/`Selected` markers;
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

Use [`docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`](docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md)
for the authored 1.4.11 ratios, the 1.4.1 non-colour indicators and the remaining
forced-colours/mobile/Qualtrics manual checks.
