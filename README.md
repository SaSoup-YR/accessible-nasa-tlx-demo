# Accessible NASA-TLX Version 0.5 candidate

A public, inspectable release of a full weighted NASA Task Load Index prototype with a separate study-conductor workflow and configurable accessibility support.

- **[Prepare a study and export same-device results](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html)**
- **[Open the participant questionnaire / technical demonstration](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/)**

Use synthetic test codes only. This candidate has not been approved for participant data collection.

## Who uses which page?

| Role | Page | Responsibility |
| --- | --- | --- |
| Study conductor | `study.html` | Enters study details, prepares starting support, generates and archives the configuration, gives out the participant link, and exports results. |
| Participant | `index.html` through the generated link | Enters a pseudonymous study code and completes the prepared questionnaire. No initial setup is required. |

The conductor can allow optional personal support changes when the protocol permits them. The final settings and actual input routes are recorded separately from the NASA-TLX score.

## What is saved and exported?

A completed record contains the study/configuration IDs, pseudonymous participant code, timestamps, prototype version, all six ratings, all fifteen pairwise choices, randomized pair order, weights, weighted score, configured support, final support state and input-route metadata.

JSON is the complete lossless record. CSV is the flattened analysis format.

### Current same-device mode

GitHub Pages is static hosting; it is not a research database. In the implemented mode, completed records stay in this site's browser storage on the device where the questionnaire was completed. Return to `study.html` in that same browser to export all records as CSV or JSON. Verify the export before using the erase control.

### Remote participants

A completion on another device does **not** appear on the conductor's device. The component emits a versioned `nasa-tlx-complete` browser event for a future approved host adapter. Do not use participant download-and-email as the normal collection procedure. Remote collection requires the supervisor-approved UCL platform, ethics/data-protection route and frozen prototype.

## Measurement and support boundary

The prototype preserves the six NASA-TLX dimensions, 0–100 ratings in five-point increments, reversed Performance direction, fifteen unique pairwise comparisons, factor weights and weighted-score calculation. Optional simpler explanations, smiley landmarks, audio, voice, recovery and experimental webcam gaze remain a separate interface layer. Webcam gaze is off by default because current accuracy evidence is Partial.

## Inspect and learn from the implementation

- [`source/`](source/) is the readable Version 0.5 source-and-test snapshot used for this release.
- [`docs/STUDY-WORKFLOW.md`](docs/STUDY-WORKFLOW.md) records the role, configuration, data and repository decisions.
- [`TESTING.md`](TESTING.md) gives an end-to-end technical checklist.
- [`BUILD-INFO.json`](BUILD-INFO.json) identifies the canonical commit and verification state used to produce this deployment.

The complete dissertation history and evidence remain in `accessible-hci-questionnaire-library`, the single canonical development repository. This public repository is a one-way release mirror, not a second independently edited implementation.

## Build and verify the source snapshot

```bash
cd source
npm ci
npm test
npm run build:standalone
```

The release passed 39 automated tests across nine files, including three axe-core structural scans, plus TypeScript and production builds. Automated and researcher-led tests do not establish WCAG conformance, psychometric equivalence, improved comprehension or accessibility for a disability group.
