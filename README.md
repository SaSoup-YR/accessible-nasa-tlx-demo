# Accessible Questionnaire Platform

A public research prototype that separates questionnaire definitions from a shared
study-conductor, participant, accessibility-support, result and UCL Qualtrics
workflow.

- **[Prepare a study](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html?package=0.8.7-q7)**
- **[Open the participant technical demonstration](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/)**

Use synthetic codes during technical verification. Before real recruitment,
freeze the exact release, configuration and Qualtrics survey; complete the
cross-device preflight; and confirm that the final procedure is covered by the
project's existing approved protocol and data-management plan.

## Release status

The immutable evaluation baseline is **`v0.8.0-rc.2`**, paired with
Qualtrics bridge **`0.8.7-q7`**. It is intended for technical review and a
bounded formative evaluation. The tag is an immutable evidence point: any later
functional change requires a new tag and proportionate re-verification.

The current development branch adds reviewed Qualtrics QSF and LimeSurvey LSS
questionnaire import. It must receive a new release-candidate tag only after the
automated suite, release build and manual real-export checks pass. The existing
`v0.8.0-rc.2` tag is not moved.

### Structured-import candidate verification

The development branch currently passes:

- a clean lock-file installation;
- 18 test files containing 145 passing tests;
- 9 representative axe structural accessibility scans;
- TypeScript, production, standalone and synchronized release builds; and
- QSF/LSS fixture checks for order, values, labels, malformed input, unsupported
  types, logic, executable content, conversion, JSON round-trip, participant
  completion, scoring and result export.

Before a new tag is created, complete one manual conversion using a fresh,
real Qualtrics QSF export and one using a fresh, real LimeSurvey LSS export.
Compare each review and downloaded definition with its source, then complete a
synthetic local and Qualtrics result. Record any limitation discovered; otherwise
the next immutable candidate may be tagged `v0.8.0-rc.3`.

### Verification recorded for `v0.8.0-rc.2`

Automated verification:

- 17 test files passed, containing 130 passing tests;
- 8 axe structural accessibility scans passed;
- TypeScript, production, standalone and synchronized release builds passed;
- the local HTTP entry-point smoke test passed;
- the high-level production dependency audit reported 0 vulnerabilities.

Manual workflow verification:

- Weighted NASA-TLX, Raw TLX, SUS and UEQ-S were each reinstalled, completed and
  exported through UCL Qualtrics;
- a researcher-supplied questionnaire was created without code, downloaded as
  JSON, imported again and reproduced with the same items, scoring and result
  fields;
- its local result and Qualtrics accepted row, primary score, answers and raw JSON
  reconstruction were checked;
- normal online submission, automatic hand-off, disconnected submission warning,
  local backup, reconnect/retry, reload/interruption recovery and phone/tablet
  recovery paths were exercised.

These checks establish that the release behaves as specified in the tested
technical workflows. They do not establish that the platform is universally
accessible or that it improves a questionnaire's psychometric properties.

### Known limitations

- Novice-conductor and questionnaire-user evaluation is still pending. The current
  evidence supports an evaluation-ready prototype, not a completed user-study
  claim.
- The no-code custom path is deliberately bounded to 1–20 required single-choice
  items on one shared integer scale, with reviewed mean or sum scoring and optional
  reverse scoring. Structured import supports the same definition profile. It
  does not support free text, multiple answers, ranking, branching, arbitrary
  formulas or general matrix behaviour. Qualtrics single-answer Likert matrix
  rows may be expanded only when their order and numeric scale are explicit.
- Structural validation cannot determine copyright permission, measurement
  validity, population suitability or equivalence to an original instrument.
- Passing automated and manual technical checks is not a claim of complete WCAG
  2.2 conformance or coverage of every browser, screen reader and assistive-
  technology combination.
- Voice recognition depends on browser support and accepts only allowed displayed
  values or exact endpoint labels. Webcam gaze input remains experimental and
  requires conventional keyboard/pointer fallbacks.
- A disconnected submission is not centrally recorded until the connection is
  restored and Qualtrics accepts the response. The recovery copy remains on the
  same browser and device, so it should be downloaded before that local state is
  cleared.
- GitHub Pages hosts the application but does not store participant records.
  Remote collection requires the matching exact-origin Qualtrics bridge.
- Qualtrics may record IP address and approximate location unless the survey's
  anonymisation setting is enabled and confirmed in a new export.

## Supported scope

Version 0.8 is questionnaire-independent within a declared profile; it does not
claim to support any questionnaire.

| Registered definition | Items and scale type | Workflow | Scoring |
| --- | --- | --- | --- |
| Weighted NASA-TLX | 6 magnitude items, 0–100 in steps of 5 | ratings plus 15 pairs | weighted NASA-TLX |
| Raw TLX | 6 magnitude items, 0–100 in steps of 5 | ratings only | unweighted arithmetic mean |
| System Usability Scale | 10 agreement items, 1–5 | ratings only | standard alternating SUS |
| UEQ-S | 8 semantic differentials, 1–7 | ratings only | centred overall, pragmatic and hedonic means |
| Researcher supplied or safely imported | 1–20 integer single-choice items on one shared 0–100-bounded scale | ratings only | researcher-confirmed mean or sum, with optional reverse-scored items |

For both NASA-TLX definitions, the valid displayed and spoken values are
`0, 5, 10, …, 100`. Values such as `1`, `2`, `3` or `92` are deliberately
rejected rather than silently rounded. Raw TLX is the six-item unweighted form;
the weighted definition is the separate six-rating plus fifteen-comparison
workflow.

Built-in questionnaire files are discovered from
[`source/instruments/*.questionnaire.json`](source/instruments/). JSON Schema plus
runtime semantic checks reject unsupported fields and incompatible scorers. Scoring
functions are an executable allowlist; JSON cannot inject code.

On the conductor page, **Add your own questionnaire** provides:

- a reviewed import route for a Qualtrics `.qsf` survey export or LimeSurvey
  `.lss` survey-structure export;
- a no-code manual builder; and
- validated platform-definition JSON import.

External import detects the format, extracts only the supported questionnaire
content and shows three separate lists: imported safely, requires confirmation
and unsupported. Any unsupported active content blocks the whole conversion;
the platform does not create a partial questionnaire. Before conversion, the
researcher must confirm wording, order, displayed labels, numeric values,
mean/sum scoring and reverse-scored items. Imported markup becomes safe plain
text, and imported code is never executed.

The full validated definition is embedded in the study configuration,
participant link and result record, so another browser does not need a local
copy. Download the converted definition JSON with the protocol.

This remains a bounded definition profile, not an arbitrary survey uploader.
Free text, multiple answers, ranking, branching, unsupported matrices, custom
formula strings and executable code are rejected. Theme, navigation,
publication and notification settings remain in the source platform. The
platform validates structure and calculation; the conductor remains responsible
for permission, provenance, psychometric validity and study suitability.

See
[`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md)
for the decision, evidence and explicit limits.
Use
[`docs/CUSTOM-QUESTIONNAIRE-TEST.md`](docs/CUSTOM-QUESTIONNAIRE-TEST.md)
for a fixed-input local, JSON round-trip and Qualtrics test.
Use
[`docs/QUESTIONNAIRE-IMPORT.md`](docs/QUESTIONNAIRE-IMPORT.md)
for export, review, conversion and limitation details.

## Roles and collection

| Role | Entry point | Responsibility |
| --- | --- | --- |
| Study conductor | `study.html` | Selects a built-in questionnaire, safely imports a supported QSF/LSS export or validates a researcher-supplied definition; then sets study/task context, support defaults, policy and collection route. |
| Participant | generated `index.html#study=...` | Enters a pseudonymous code and answers the prepared instrument. No setup is required before starting. |
| UCL Qualtrics | activated distribution link | Hosts the participant iframe, stores the generic Version 4 record and returns a matching receipt. |

The raw GitHub page does not collect remotely. Central collection is activated only
inside the configured Qualtrics parent. Participants receive the activated Qualtrics
link, not the raw GitHub URL.

## Accessibility-support boundary

The shared runner provides keyboard and screen-reader structure, large text, built-in
spoken guidance, confirmed voice input, interruption recovery and experimental gaze
input. The conductor may lock presentation, permit presentation/audio/recovery
preferences, or permit all definition-approved choices.

Support changes and input routes are recorded separately and never enter scoring.
Instrument-specific capability checks prevent smileys or unvalidated simpler wording
from appearing in SUS or UEQ-S. Their standard response positions keep the official
endpoint labels without inventing meanings such as `Neutral` or `Agree` for
intermediate values. Confirmed voice input accepts a displayed number or an exact
official endpoint label. NASA-TLX smileys and simpler explanations remain experimental
support routes, not psychometrically equivalent replacements.

WCAG 2.2 is used as an engineering and test framework. The repository does not claim
complete WCAG conformance or disability-group benefit. See
[`docs/WCAG-2.2-COMPONENT-AUDIT.md`](docs/WCAG-2.2-COMPONENT-AUDIT.md).

## Result safety

The generic Qualtrics bridge:

- uses an exact-version two-way handshake and blocks starting when generated HTML,
  parent JavaScript and participant code do not match;
- presents the participant application as a full-browser viewport with one visible
  scrollbar instead of a clipped nested question panel;
- sends only to the exact configured HTTPS parent origin;
- accepts only a matching submission receipt;
- attempts a complete local backup before host contact;
- retains JSON/CSV recovery controls;
- restores navigation after staging or native-advance failure;
- records instrument identity, generic answers, scoring details, support provenance
  and lossless raw JSON chunks;
- contains no API token or secret.

Install and re-test the Version 0.8 package from
[`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md). Version 0.7
`ANTLX_*` fields are not compatible with the new generic `AQP_*` manifest. Existing
Version 0.7 rows are not deleted or backfilled: their values remain under
`ANTLX_*`, while their later-added `AQP_*` cells are expected to be blank.

## Repository map

| Purpose | Location |
| --- | --- |
| Questionnaire definitions and schema | [`source/instruments/`](source/instruments/) |
| Definition validation/registry | [`source/src/questionnaire-definition.ts`](source/src/questionnaire-definition.ts) |
| No-code custom definition builder | [`source/src/custom-questionnaire.ts`](source/src/custom-questionnaire.ts) |
| QSF/LSS review and conversion | [`source/src/platform-questionnaire-import.ts`](source/src/platform-questionnaire-import.ts) |
| Allowlisted scoring | [`source/src/scoring.ts`](source/src/scoring.ts) |
| Participant runner | [`source/src/accessible-nasa-tlx.ts`](source/src/accessible-nasa-tlx.ts) |
| Conductor | [`source/src/study-conductor.ts`](source/src/study-conductor.ts) |
| Configuration/result schemas | [`source/src/study.ts`](source/src/study.ts) |
| Qualtrics child and parent bridge | [`source/src/result-sink.ts`](source/src/result-sink.ts), [`integrations/qualtrics/`](integrations/qualtrics/) |
| Current standalone participant runner | [`source/demo/accessible-questionnaire-platform-v0.8.html`](source/demo/accessible-questionnaire-platform-v0.8.html) |
| Historical v0.7 baseline | [`source/demo/accessible-nasa-tlx-v0.7.html`](source/demo/accessible-nasa-tlx-v0.7.html) |
| Architecture and extension rules | [`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md), [`docs/INSTRUMENT-DEFINITION-GUIDE.md`](docs/INSTRUMENT-DEFINITION-GUIDE.md) |
| No-code custom-questionnaire test | [`docs/CUSTOM-QUESTIONNAIRE-TEST.md`](docs/CUSTOM-QUESTIONNAIRE-TEST.md) |
| Qualtrics/LimeSurvey import guide | [`docs/QUESTIONNAIRE-IMPORT.md`](docs/QUESTIONNAIRE-IMPORT.md) |
| Researcher-workflow evaluation plan | [`docs/IMPORT-WORKFLOW-EVALUATION.md`](docs/IMPORT-WORKFLOW-EVALUATION.md) |
| Migration | [`docs/MIGRATION-V0.7-V0.8.md`](docs/MIGRATION-V0.7-V0.8.md) |
| Colour and WCAG audit | [`docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`](docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md), [`docs/WCAG-2.2-COMPONENT-AUDIT.md`](docs/WCAG-2.2-COMPONENT-AUDIT.md) |
| Technical risk register | [`docs/TECHNICAL-RISK-REGISTER.md`](docs/TECHNICAL-RISK-REGISTER.md) |

Historical Version 0.5 and 0.6 standalone files remain in Git history but were
removed from the active tree to avoid ambiguous test candidates.

## Build and verify

```bash
cd source
npm ci
npm test
npm run build:release
```

Automation covers definition/scorer compatibility, weighted NASA-TLX, Raw TLX, SUS,
UEQ-S, researcher-supplied and QSF/LSS-imported end-to-end workflows,
configuration migration, conservative voice parsing, direct and iframe-parent
focus/error movement, saved-session semantics, visible-state contrast, result
validation/export, exact-origin receipts, Qualtrics adverse paths, standalone
packaging and structural axe scans. Passing automation is software evidence, not
participant evidence.
