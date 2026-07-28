# Version 0.8 source

This directory builds the public Accessible Questionnaire Platform candidate.

## Structure

- `instruments/*.questionnaire.json` — versioned registered definitions.
- `instruments/questionnaire-definition.schema.json` — published structural schema.
- `src/questionnaire-definition.ts` — discovery and strict semantic validation.
- `src/scoring.ts` — allowlisted NASA-TLX and SUS scorers.
- `src/study.ts` — Version 4 configuration/result schemas and exports.
- `src/result-sink.ts` — exact-origin Qualtrics child sink and parent-viewport
  reveal request.
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

## Evidence boundary

This source demonstrates tested technical behavior for the supported definition
profile. It does not establish improved accessibility, full WCAG conformance,
psychometric equivalence, WebGazer accuracy or participant benefit. Recruitment
remains gated by supervisor review, approved ethics/information governance and the
real UCL Qualtrics synthetic test.
