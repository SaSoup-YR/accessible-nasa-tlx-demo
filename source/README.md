# Version 0.6 source snapshot

This directory is the readable source-and-test snapshot used to build the public Version 0.6 final-candidate. It is published so another researcher can inspect the measurement logic, role separation, configuration contract, result schema, approved-host boundary and verification tests.

The full dissertation history, earlier prototypes, audit evidence and decision trail remain in the private canonical repository `SaSoup-YR/accessible-hci-questionnaire-library`. Changes are implemented and tested there first, then released here in one direction. Do not maintain a separate implementation in this snapshot.

## Structure

- `src/nasa-tlx.ts` — instrument data and the fifteen unique pairs.
- `src/scoring.ts` — weight and weighted-score calculation.
- `src/study.ts` — versioned configuration/result schemas, link encoding, local saving and CSV/JSON export.
- `src/result-sink.ts` — provider-neutral, receipt-validated contract for an approved host platform.
- `src/study-conductor.ts` — conductor configuration and result-export page.
- `src/accessible-nasa-tlx.ts` — participant questionnaire component.
- `tests/` — measurement, interaction, study-workflow, standalone and structural-accessibility checks.

## Run

```bash
npm ci
npm test
npm run dev
npm run build:standalone
```

The participant development route is `/`; the study-conductor route is `/study.html`.

The study conductor prepares the questionnaire and participant adjustments are locked by default. A generated link opens the separate participant route with the configuration already applied. If the approved protocol permits it, the conductor can allow only text-size, automatic-audio and recovery preferences. Simpler explanations and the standard/smiley answer presentation remain fixed.

`demo/accessible-nasa-tlx-v0.6.html` is intentionally participant-only. It is not a second study-conductor implementation; see `demo/README.md` for the file and hosting boundary.

## Evidence boundary

This source demonstrates technical behaviour. It does not establish WCAG conformance, psychometric equivalence, improved comprehension, secure remote data collection or effectiveness for a disability group. The experimental gaze route remains Partial. Participant data collection remains subject to supervisor review and the applicable ethics and data-protection route.
