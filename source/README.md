# Version 0.5 source snapshot

This directory is the readable source-and-test snapshot used to build the public Version 0.5 candidate. It is published so another researcher can inspect the measurement logic, role separation, configuration contract, result schema and verification tests.

The full dissertation history, earlier prototypes, audit evidence and decision trail remain in the private canonical repository `SaSoup-YR/accessible-hci-questionnaire-library`. Changes are implemented and tested there first, then released here in one direction. Do not maintain a separate implementation in this snapshot.

## Structure

- `src/nasa-tlx.ts` — instrument data and the fifteen unique pairs.
- `src/scoring.ts` — weight and weighted-score calculation.
- `src/study.ts` — versioned configuration/result schemas, link encoding, local saving and CSV/JSON export.
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

The study conductor prepares the questionnaire and participant adjustments are locked by default. A generated link opens the separate participant route with the configuration already applied. The conductor can enable optional personalisation only when the approved protocol requires it.

## Evidence boundary

This source demonstrates technical behaviour. It does not establish WCAG conformance, psychometric equivalence, improved comprehension, secure remote data collection or effectiveness for a disability group. The experimental gaze route remains Partial. Participant data collection remains subject to supervisor review and the applicable ethics and data-protection route.
