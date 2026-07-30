# Version 0.8 source

This directory builds the public Accessible Questionnaire Platform candidate.

## Structure

- `instruments/*.questionnaire.json` — versioned registered definitions.
- `instruments/questionnaire-definition.schema.json` — published structural schema.
- `src/questionnaire-definition.ts` — discovery, embedded-definition resolution and strict semantic validation.
- `src/custom-questionnaire.ts` — bounded no-code questionnaire builder and import validation.
- `src/platform-questionnaire-import.ts` — fail-closed Qualtrics QSF and LimeSurvey LSS review and conversion.
- `src/scoring.ts` — allowlisted instrument scorers plus reviewed generic mean and sum scorers.
- `src/study.ts` — Version 4 configuration/result schemas and exports.
- `src/result-sink.ts` — exact-origin, exact-build Qualtrics handshake and child
  result sink.
- `src/study-conductor.ts` — researcher configuration and collection setup.
- `src/accessible-nasa-tlx.ts` — shared participant runner; filename retained for
  implementation provenance.
- `tests/` — instrument, workflow, accessibility, collection and packaging checks.

## Run

```bash
npm ci
npm test
npm run dev
npm run build:release
```

Development routes are `/` for participants and `/study.html` for conductors.
`demo/accessible-questionnaire-platform-v0.8.html` is participant-only and cannot
collect centrally from `file://`.

The conductor can also build a researcher-supplied questionnaire, import a
validated platform-definition JSON file, or review and convert a supported
Qualtrics QSF or LimeSurvey LSS export without editing TypeScript. This path is
deliberately limited to 1–20 required integer single-choice items on one shared
scale, with a researcher-confirmed mean or sum and optional reverse scoring.
Unsupported active content blocks the whole conversion. The validated definition
is embedded in the configuration, participant link and result record. Arbitrary
JavaScript, custom formulas, branching and unsupported response types fail
closed.

## Evidence boundary

This source demonstrates tested technical behavior for the supported definition
profile. It does not establish improved accessibility, full WCAG conformance,
psychometric equivalence, WebGazer accuracy or participant benefit. Recruitment
uses a frozen release and configuration, a successful real UCL Qualtrics
synthetic test, and procedures covered by the project's existing approved
protocol and information-governance plan.
