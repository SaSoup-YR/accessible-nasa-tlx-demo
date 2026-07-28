# Accessible Questionnaire Platform Version 0.8 candidate

A public research prototype that separates questionnaire definitions from a shared
study-conductor, participant, accessibility-support, result and UCL Qualtrics
workflow.

- **[Prepare a study](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/study.html)**
- **[Open the participant technical demonstration](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/)**

Use synthetic codes only. Recruitment remains blocked until the supervisor has
reviewed and the frozen candidate has passed the real UCL Qualtrics re-test.

## Supported scope

Version 0.8 is questionnaire-independent within a declared profile; it does not
claim to support any questionnaire.

| Registered definition | Items and scale | Workflow | Scoring |
| --- | --- | --- | --- |
| Weighted NASA-TLX | 6 items, 0–100 in steps of 5 | ratings plus 15 pairs | weighted NASA-TLX |
| System Usability Scale | 10 items, 1–5 | ratings only | standard alternating SUS |

Questionnaire files are discovered from
[`source/instruments/*.questionnaire.json`](source/instruments/). JSON Schema plus
runtime semantic checks reject unsupported fields and incompatible scorers. Scoring
functions are an executable allowlist; JSON cannot inject code.

See
[`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md)
for the decision, evidence and explicit limits.

## Roles and collection

| Role | Entry point | Responsibility |
| --- | --- | --- |
| Study conductor | `study.html` | Selects a registered questionnaire, sets study/task context, prepares support defaults and policy, selects local or Qualtrics collection, and generates the participant configuration. |
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
from appearing in SUS. NASA-TLX smileys and simpler explanations remain experimental
support routes, not psychometrically equivalent replacements.

WCAG 2.2 is used as an engineering and test framework. The repository does not claim
complete WCAG conformance or disability-group benefit. See
[`docs/WCAG-2.2-COMPONENT-AUDIT.md`](docs/WCAG-2.2-COMPONENT-AUDIT.md).

## Result safety

The generic Qualtrics bridge:

- sends only to the exact configured HTTPS parent origin;
- accepts only a matching submission receipt;
- attempts a complete local backup before host contact;
- retains JSON/CSV recovery controls;
- restores navigation after staging or native-advance failure;
- moves the outer Qualtrics viewport for validated error/recovery reveal requests
  from its own iframe;
- records instrument identity, generic answers, scoring details, support provenance
  and lossless raw JSON chunks;
- contains no API token or secret.

Install and re-test the Version 0.8 package from
[`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md). Version 0.7
`ANTLX_*` fields are not compatible with the new generic `AQP_*` manifest.

## Repository map

| Purpose | Location |
| --- | --- |
| Questionnaire definitions and schema | [`source/instruments/`](source/instruments/) |
| Definition validation/registry | [`source/src/questionnaire-definition.ts`](source/src/questionnaire-definition.ts) |
| Allowlisted scoring | [`source/src/scoring.ts`](source/src/scoring.ts) |
| Participant runner | [`source/src/accessible-nasa-tlx.ts`](source/src/accessible-nasa-tlx.ts) |
| Conductor | [`source/src/study-conductor.ts`](source/src/study-conductor.ts) |
| Configuration/result schemas | [`source/src/study.ts`](source/src/study.ts) |
| Qualtrics child and parent bridge | [`source/src/result-sink.ts`](source/src/result-sink.ts), [`integrations/qualtrics/`](integrations/qualtrics/) |
| Current standalone participant runner | [`source/demo/accessible-questionnaire-platform-v0.8.html`](source/demo/accessible-questionnaire-platform-v0.8.html) |
| Frozen supervisor-reviewed v0.7 baseline | [`source/demo/accessible-nasa-tlx-v0.7.html`](source/demo/accessible-nasa-tlx-v0.7.html) |
| Architecture and extension rules | [`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md), [`docs/INSTRUMENT-DEFINITION-GUIDE.md`](docs/INSTRUMENT-DEFINITION-GUIDE.md) |
| Migration | [`docs/MIGRATION-V0.7-V0.8.md`](docs/MIGRATION-V0.7-V0.8.md) |
| Colour and WCAG audit | [`docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`](docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md), [`docs/WCAG-2.2-COMPONENT-AUDIT.md`](docs/WCAG-2.2-COMPONENT-AUDIT.md) |
| Technical risk register | [`docs/TECHNICAL-RISK-REGISTER.md`](docs/TECHNICAL-RISK-REGISTER.md) |
| Supervisor-change provenance | [`docs/SUPERVISOR-UPDATE-TRACE-2026-07-27.md`](docs/SUPERVISOR-UPDATE-TRACE-2026-07-27.md) |

Historical Version 0.5 and 0.6 standalone files remain in Git history but were
removed from the active tree to avoid ambiguous test candidates.

## Build and verify

```bash
cd source
npm ci
npm test
npm run build:release
```

Automation covers definition/scorer compatibility, NASA and SUS end-to-end workflows,
configuration migration, conservative voice parsing, direct and iframe-parent
focus/error movement, saved-session semantics, visible-state contrast, result
validation/export, exact-origin receipts, Qualtrics adverse paths, standalone
packaging and structural axe scans. Passing automation is software evidence, not
participant evidence.
