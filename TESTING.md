# Version 0.8 technical test checklist

Use synthetic data only. Do not recruit until the candidate release, study
protocol and ethics/data route are approved.

Record commit, browser, operating system, device, test data, expected result,
observed result and Pass, Partial, Fail or Not supported.

## 1. Conductor and definition boundary

1. Open `study.html`.
2. Select weighted NASA-TLX. Confirm 6 items, 21 values, 15 comparisons and weighted
   scoring.
3. Select Raw TLX. Confirm the same six items, 21 values, no comparisons and
   unweighted-mean scoring.
4. Select SUS. Confirm 10 items, 5 values, no comparisons and SUS scoring.
5. Select UEQ-S. Confirm 8 semantic differentials, 7 response positions, no
   comparisons and overall/pragmatic/hedonic scoring.
6. Confirm SUS and UEQ-S remove smiley and simpler-wording controls while retaining
   presentation, audio, recovery, voice and gaze controls.
7. Generate, download and re-import one configuration for each instrument.
8. Import a result in the configuration input. Confirm `There is a problem` receives
   focus and is moved to the start of the visible viewport on desktop, iPhone and
   iPad.

## 2. Participant workflows

### NASA-TLX

1. Complete six ratings and all fifteen pair comparisons.
2. Check reversed Performance anchors: Good at 0 and Poor at 100.
3. Review and submit. Verify the Version 4 record has NASA identity, answers,
   weights, weighted score, support state and input routes.

### SUS

1. Confirm the exact ten statements and a 1–5 agreement scale.
2. Complete all ten items. Confirm that no pair page appears.
3. Use the ideal alternating pattern 5,1,5,1,5,1,5,1,5,1 and verify a SUS score of
   100.
4. Verify the Version 4 record has SUS identity, ten ratings, empty pair data,
   alternating contributions and the SUS score.

### Raw TLX

1. Confirm the six TLX items and 0–100 scale are retained.
2. Complete values 0, 20, 40, 60, 80 and 100. Confirm no pair page appears and the
   Raw workload score is 50.

### UEQ-S

1. Confirm the eight official adjective pairs and 1–7 semantic-differential
   positions.
2. Complete 7 for the first four and 1 for the last four. Confirm no pair page
   appears, the overall score is 0, pragmatic quality is 3 and hedonic quality is
   -3.

## 3. Errors, focus and recovery

1. Leave an item unanswered and press Next. Confirm an explicit error, programmatic
   focus and immediate movement to the start of the visible viewport on desktop,
   phone and tablet. Test both the
   direct participant page and the full-viewport participant page inside Qualtrics
   Preview.
2. Reload a recovery-enabled questionnaire midway. Re-enter or recover the
   pseudonymous code according to the shared-device procedure. Confirm focus moves
   to the saved-questionnaire region and its accessible description states the
   exact completed count and Resume/Erase choices. With automatic audio previously
   enabled, confirm the page attempts the same exact message; also test the explicit Hear
   saved-progress message fallback because mobile browsers may block speech after
   reload.
3. Test storage disabled/full. Confirm no crash or false local-save claim and retain
   in-memory JSON/CSV routes.
4. Test return-to-answer and resubmission after a host failure.

## 4. Voice input

1. Test displayed numeric values first; these are the recommended cross-device
   utterances.
2. In NASA smiley mode test Low, Closer to Low, Middle, Closer to High and High.
   On iPhone, record the actual transcript returned for Low; test `zero` as the
   documented reliable fallback.
3. Test Performance with Good, Closer to Good, Middle, Closer to Poor and Poor.
4. Confirm every accepted result is shown and announced as a proposal and requires
   explicit confirmation.
5. Confirm `not low`, `low or high`, `anything but low`, `twenty three`, `73`,
   conflicting recognition alternatives and two pair names are rejected.
6. Confirm exact safe aliases such as `hello` for Low are accepted only as the whole
   utterance and never inside a longer phrase.
7. Repeat on every target browser because Web Speech acoustic recognition is
   browser/OS behavior, not controlled by the parser.

## 5. Keyboard, screen reader, colour and reflow

1. Complete all four registered instruments keyboard-only.
2. Confirm radio groups use arrows and Tab leaves the group normally.
3. Confirm selected answers remain visible after focus moves, using a checked state
   and text/check marker as well as colour.
4. Test NVDA/Edge and VoiceOver/Safari reading and focus order.
5. Test 200% zoom, 320 CSS pixel reflow and text-spacing overrides.
6. Test forced-colours mode.
7. Verify the contrast values and claim boundary in
   `docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`.

## 6. Spoken guidance and gaze

1. Confirm spoken summaries reflect the active instrument and scale.
2. Trigger a selected answer, voice proposal, simpler help where available, restored
   session, error and completion state; verify each expected update.
3. Treat WebGazer target accuracy as Partial unless measured under an approved
   protocol. Test permission, positioning, calibration, proposal, confirmation,
   recalibration and camera stop without claiming independent eye control.

## 7. Qualtrics

Follow every normal and adverse test in
[`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md).

At minimum:

- install the complete Version 0.8 `AQP_*` package into a blank/copy survey;
- observe and export one row for each registered instrument;
- reconstruct each raw JSON record;
- close immediately after acknowledgement;
- submit while offline;
- reload midway;
- trigger a missing-answer error near the bottom of the full-viewport iframe and
  verify that its single mobile viewport reveals it;
- block/fill storage;
- force staging and native-advance failures;
- deliberately combine old and new generated HTML/JavaScript and confirm that the
  participant cannot start;
- verify the recorded-response/PDF summary;
- select Review and Publish, then verify a newly dated row rather than an older row;
- confirm the distribution bundle contains no secret and accepts only the configured
  origin.

Do not describe central collection as complete until the real UCL account contains
and exports both synthetic records.
