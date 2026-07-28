# Accessible NASA-TLX Version 0.7 release candidate

A public, inspectable implementation of the full weighted NASA Task Load Index with separate study-conductor and participant roles, configurable accessibility support, auditable participant preferences and an origin-bound UCL Qualtrics collection bridge.

- **[Prepare a study](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html)**
- **[Open the participant technical demonstration](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/)**

Use synthetic codes only. The supervisor must review this release candidate before participant data collection.

## Role and collection model

| Role | Entry point | Responsibility |
| --- | --- | --- |
| Study conductor | `study.html` | Defines the study/task, prepares support defaults, selects the participant-adjustment policy and local or Qualtrics collection, generates the configuration and exports local test records. |
| Participant | generated `index.html#study=...` configuration inside the approved study route | Enters a pseudonymous code, completes six ratings and fifteen comparisons and submits one versioned record. No accessibility setup is required before starting. |
| UCL Qualtrics | activated Qualtrics distribution link | Hosts the participant page in an iframe, stores the complete record in the researcher's Qualtrics response and returns a matching receipt. |

The public GitHub demonstration still saves only in the current browser. Central collection is activated only when the conductor selects Qualtrics, enters the exact HTTPS survey origin and embeds the generated participant URL in the Qualtrics question. Participants receive the Qualtrics distribution link, not the raw GitHub URL.

See [`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md) for the copy-paste bridge, Embedded Data field manifest and mandatory synthetic cross-device check.

## Participant adjustment decision

The conductor always provides usable starting settings. Version 0.7 offers three protocol-level policies:

| Policy | Appropriate use |
| --- | --- |
| Prepared settings only | Controlled NASA-TLX condition where support presentation must remain fixed. |
| Display, audio and recovery preferences | Participant may change text size, automatic speech and interruption recovery; wording support and rating presentation remain fixed. |
| Prepared defaults with optional participant choice | Recommended for this project's formative accessibility evaluation. Participant may change optional support without being required to configure it. |

For the third policy, every change records the setting, old value, new value, questionnaire stage and timestamp. The result also records final settings and each rating/pair input route. These metadata never enter the NASA-TLX calculation. Official dimensions, anchors, values, fifteen pairs and weighted scoring remain unchanged.

## Cross-device result safety

The Qualtrics bridge:

- sends results only to the exact HTTPS parent origin stored in the signed-off configuration;
- validates the source window and message origin in both directions;
- uses a stable submission ID and accepts only a matching receipt;
- attempts a complete local backup before contacting Qualtrics and keeps JSON/CSV backup controls available;
- treats the 1.5-second parent handoff as a submission interval rather than a download task, and restores native navigation if automatic advancement does not unload the page;
- leaves answers on Review when Qualtrics fails or times out, allowing retry, answer editing or backup export;
- makes a same-device completed backup discoverable after an accidental close, while clearly separating that evidence from a recorded Qualtrics response;
- places no Qualtrics API token or other secret in GitHub or the participant browser;
- stores analysis fields plus a lossless JSON record split into bounded Embedded Data chunks.

UCL guidance allows Qualtrics for information that is not highly confidential. If the study links identities, diagnoses or other highly confidential data, obtain UCL information-governance advice; REDCap in the Data Safe Haven may be required. The supplied prototype asks only for a study-issued pseudonymous code, but support-use metadata still requires an approved data-management decision.

## Repository map

| Purpose | Readable source or document | Built/deployed output |
| --- | --- | --- |
| Study conductor | [`source/src/study-conductor.ts`](source/src/study-conductor.ts) | [`study.html`](study.html) |
| Participant questionnaire | [`source/src/accessible-nasa-tlx.ts`](source/src/accessible-nasa-tlx.ts) | [`index.html`](index.html) |
| Instrument definitions and generic scoring boundary | [`source/instruments/`](source/instruments/) and [`source/src/instrument-definition.ts`](source/src/instrument-definition.ts) | compiled into the current NASA-TLX release |
| Configuration/result schema and exports | [`source/src/study.ts`](source/src/study.ts) | compiled asset |
| Receipt and Qualtrics child sink | [`source/src/result-sink.ts`](source/src/result-sink.ts) | compiled asset |
| Qualtrics parent bridge | [`integrations/qualtrics/`](integrations/qualtrics/) | pasted into the approved Qualtrics survey |
| Standalone technical file | [`source/demo/accessible-nasa-tlx-v0.7.html`](source/demo/accessible-nasa-tlx-v0.7.html) | participant-only; no central collection from `file://` |
| Study workflow decision | [`docs/STUDY-WORKFLOW.md`](docs/STUDY-WORKFLOW.md) | public evidence |
| Collection and permission rationale | [`docs/REMOTE-COLLECTION-AND-PERMISSIONS.md`](docs/REMOTE-COLLECTION-AND-PERMISSIONS.md) | public evidence |
| Failure and recovery verification | [`docs/FAILURE-RECOVERY-VERIFICATION.md`](docs/FAILURE-RECOVERY-VERIFICATION.md) | public test evidence |
| Non-text contrast and use-of-colour audit | [`docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`](docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md) | calculated state/indicator evidence and manual limits |
| Technical risk register | [`docs/TECHNICAL-RISK-REGISTER.md`](docs/TECHNICAL-RISK-REGISTER.md) | open and remaining pre-recruitment risks |
| Questionnaire-independent architecture decision | [`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md) | implemented boundary, limitations and migration tests |
| Supervisor update trace | [`docs/SUPERVISOR-UPDATE-TRACE-2026-07-27.md`](docs/SUPERVISOR-UPDATE-TRACE-2026-07-27.md) | provenance and retained design decisions |

The private `accessible-hci-questionnaire-library` remains the canonical dissertation/evidence repository. This public repository is the tested release snapshot and stable GitHub Pages deployment.

## Build and verify

```bash
cd source
npm ci
npm test
npm run build:release
```

The automated suite covers scoring, schema validation, role separation, participant-policy boundaries, support-change provenance, Qualtrics origin/receipt behaviour, adverse submission paths, conservative voice parsing, persistent non-colour selection, calculated control/focus/gaze contrast, same-tab recovery, voice/gaze state, standalone packaging and four axe-core structural scans. Passing automation does not establish accessibility for a disability group, complete WCAG conformance, psychometric equivalence, WebGazer accuracy or a participant benefit. Those claims require manual checks and the approved evaluation.
