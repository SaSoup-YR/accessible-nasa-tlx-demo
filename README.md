# Accessible NASA-TLX Version 0.6 final-candidate

A public, inspectable release of a full weighted NASA Task Load Index prototype with a separate study-conductor workflow and configurable accessibility support.

- **[Prepare a study and export same-device results](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html)**
- **[Open the participant questionnaire / technical demonstration](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/)**

Use synthetic test codes only. This candidate has not been approved for participant data collection.

## Who uses which page?

| Role | Page | Responsibility |
| --- | --- | --- |
| Study conductor | `study.html` | Enters non-identifying study details, prepares support, selects the participant-personalisation policy, generates and archives the configuration, gives out the participant link, and exports same-device results. |
| Participant | `index.html` through the generated link | Enters the pseudonymous code supplied by the conductor and completes the prepared questionnaire. No initial accessibility setup is required. |

Prepared settings are the default. If the approved protocol permits personalisation, the conductor can allow participants to change only text size, automatic spoken guidance and interruption recovery. Simpler explanations and the standard/smiley answer presentation remain fixed by the study configuration. Permitted voice and gaze routes remain choices during answering, not participant setup obligations. Final settings and actual input routes are recorded separately from the NASA-TLX score.

Version 0.6 is one workflow with two role-specific pages. The conductor interface does not contain the participant questionnaire; it generates a link to the separate participant page. Both pages use the same instrument, scoring, configuration and result code.

## Where is each page in GitHub?

| Purpose | Readable source | Built/deployed file |
| --- | --- | --- |
| Study-conductor page | [`source/study.html`](source/study.html), [`source/src/study-conductor.ts`](source/src/study-conductor.ts) | [`study.html`](study.html) |
| Participant page | [`source/index.html`](source/index.html), [`source/src/accessible-nasa-tlx.ts`](source/src/accessible-nasa-tlx.ts) | [`index.html`](index.html) |
| Shared study/result schema | [`source/src/study.ts`](source/src/study.ts) | compiled into the hashed assets |
| Approved-host result contract | [`source/src/result-sink.ts`](source/src/result-sink.ts) | installed by the approved host platform, not by the participant link |
| Self-contained technical file | [`source/demo/accessible-nasa-tlx-v0.6.html`](source/demo/accessible-nasa-tlx-v0.6.html) | participant-only; see [`source/demo/README.md`](source/demo/README.md) |

## What is saved and exported?

A completed record contains the study/configuration IDs, pseudonymous participant code, timestamps, prototype version, all six ratings, all fifteen pairwise choices, randomized pair order, weights, weighted score, configured support, final support state and input-route metadata.

JSON is the complete lossless record. CSV is the flattened analysis format.

### Current same-device mode

GitHub Pages is static hosting; it is not a research database. In the implemented mode, completed records stay in this site's browser storage on the device where the questionnaire was completed. Return to `study.html` in that same browser to export all records as CSV or JSON. Verify the export before using the erase control.

### Remote participants and central collection

A raw GitHub Pages link has no central database, so a completion on another device does **not** appear on the conductor's device. Version 0.6 adds a tested `accessibleNasaTlxResultSink` contract for an approved host such as the UCL-selected Qualtrics or REDCap workflow. When the host installs the contract, completion is shown only after the host returns a receipt for the same submission ID; a failure keeps the participant on the review page with answers available for retry. No endpoint, API key or platform claim is embedded in the public link.

This makes the questionnaire host-ready but does not turn GitHub Pages into an approved research database. The platform must be selected in the ethics and data-management route and integrated before remote recruitment. Do not use participant download-and-email as the normal collection procedure. See [`docs/REMOTE-COLLECTION-AND-PERMISSIONS.md`](docs/REMOTE-COLLECTION-AND-PERMISSIONS.md).

## Measurement and support boundary

The prototype preserves the six NASA-TLX dimensions, 0–100 ratings in five-point increments, reversed Performance direction, fifteen unique pairwise comparisons, factor weights and weighted-score calculation. Optional simpler explanations, smiley landmarks, audio, voice, recovery and experimental webcam gaze remain a separate interface layer. Webcam gaze is off by default because current accuracy evidence is Partial.

## Inspect and learn from the implementation

- [`source/`](source/) is the readable Version 0.6 source-and-test snapshot used for this release.
- [`docs/STUDY-WORKFLOW.md`](docs/STUDY-WORKFLOW.md) records the role, configuration, data and repository decisions.
- [`docs/REMOTE-COLLECTION-AND-PERMISSIONS.md`](docs/REMOTE-COLLECTION-AND-PERMISSIONS.md) records the remote-result contract, permission split and activation boundary.
- [`docs/VOICE-AND-ERROR-CORRECTION.md`](docs/VOICE-AND-ERROR-CORRECTION.md) records the voice-state, smiley-state and error-focus correction.
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

The release passed 56 automated tests across eleven files, including four axe-core structural scans, plus TypeScript and production builds. Automated and researcher-led tests do not establish WCAG conformance, psychometric equivalence, improved comprehension or accessibility for a disability group.
