# Version 0.7 source snapshot

This directory builds the public Version 0.7 release candidate. It exposes the instrument, scoring, two-role study workflow, auditable support preferences, receipt validation, Qualtrics child sink and automated tests.

The private `SaSoup-YR/accessible-hci-questionnaire-library` repository remains the canonical dissertation/evidence source. This public snapshot supports inspection and reproducibility.

## Structure

- `src/nasa-tlx.ts` — six dimensions, anchors, rating values and fifteen pairs.
- `src/scoring.ts` — full weighted NASA-TLX calculation.
- `src/study.ts` — Version 0.7 configuration/result schemas, local export and support-change provenance.
- `src/result-sink.ts` — provider contract and exact-origin Qualtrics child-to-parent sink.
- `src/study-conductor.ts` — researcher setup, participant policies and local/Qualtrics collection choice.
- `src/accessible-nasa-tlx.ts` — participant questionnaire.
- `tests/` — measurement, interaction, workflow, collection, packaging and structural-accessibility checks.

The matching Qualtrics parent script, HTML and Embedded Data manifest are in repository-root [`integrations/qualtrics/`](../integrations/qualtrics/).

## Run

```bash
npm ci
npm test
npm run dev
npm run build:standalone
```

The development routes are `/` for participants and `/study.html` for conductors. `demo/accessible-nasa-tlx-v0.7.html` is a participant-only technical file and cannot collect centrally from `file://`.

## Evidence boundary

This source demonstrates technical behaviour. It does not establish that the interface is more accessible for a disability group, that optional presentations are psychometrically equivalent or that WebGazer provides accurate independent control. Participant data collection remains gated by supervisor review, ethics/information-governance requirements and a successful synthetic Qualtrics cross-device test.
