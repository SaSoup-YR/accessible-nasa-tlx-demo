# Tests

Run:

```bash
npm test
```

The exact checkpoint count is recorded in the root `BUILD-INFO.json` after each
verified release build.

- `questionnaire-definition.test.ts` — discovery, four definitions, semantic
  rejection, and weighted NASA-TLX, Raw TLX, SUS and UEQ-S scoring.
- `platform-component.test.ts` — complete SUS, Raw TLX and UEQ-S participant flows
  plus conductor link generation through the shared components.
- `content.test.ts` and `scoring.test.ts` — NASA content, pair invariants and
  weighted scoring compatibility.
- `voice-input.test.ts` — displayed values/labels, conservative ranked alternatives,
  mobile Low homophone, Performance anchors, negation, ambiguity and invalid values.
- `accessibility-utils.test.ts` — immediate, post-layout and delayed mobile error
  reveal plus visual-viewport coordinate fallback.
- `saved-session-announcement.test.ts` — recovery-action focus, accessible
  descriptions, delayed live-region change, prior-opt-in speech and replay.
- `component.test.ts` — participant navigation, support, recovery, speech, voice and
  gaze state.
- `study-component.test.ts` — configured participant gate, adjustment policies,
  provenance, backups, storage/network failures and host events.
- `study.test.ts` — v0.7 migration, strict Version 4 records, cross-instrument CSV union,
  storage behavior and corruption rejection.
- `result-sink.test.ts` — exact-origin receipts and parent-viewport reveal, generic
  60-field SUS staging, bounded handoff, watchdog and failure navigation.
- `conductor-component.test.ts` — role separation, two-instrument configuration,
  generated Qualtrics package, score-display-aware completion text and error focus.
- `accessibility.test.ts` — five axe structural scans including SUS.
- `focus-style.test.ts` — authored focus, control, selected, gaze and link contrast.
- `standalone.test.ts` — Version 0.8 single-file packaging and component boot.
- `webgazer-adapter.test.ts` — secure-context and dwell-state boundaries.

jsdom cannot validate the mobile visual viewport, rendered contrast,
assistive-technology/browser combinations, speech-service accuracy or webcam gaze
accuracy. Passing automation is technical evidence and does not establish complete
WCAG conformance, accessibility benefit or psychometric equivalence.
