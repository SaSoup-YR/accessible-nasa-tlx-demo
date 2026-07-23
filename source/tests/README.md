# Tests

Run the automated suite with:

```bash
npm test
```

Current checkpoint: **56 tests pass across eleven files.**

- **content.test.ts** — six dimensions, fifteen unique pairs, 0–100 increments, Performance direction and valid smiley mappings.
- **scoring.test.ts** — weight invariants, deterministic score calculation and rejection of incomplete or invalid responses.
- **voice-input.test.ts** — valid rating parsing, Performance anchors, pair-factor matching and ambiguity rejection.
- **webgazer-adapter.test.ts** — secure-context boundary and uninterrupted/reset dwell behaviour.
- **standalone.test.ts** — Version 0.6 single-document structure, no Vite asset dependency, executable inline JavaScript syntax and compiled-component boot rendering.
- **result-sink.test.ts** — explicit host installation, same-submission receipt validation and false-success rejection.
- **component.test.ts** — ratings-before-pairs flow, pair-task clarity, definition non-duplication, adjustable text, one primary Smiley presentation, precision refinement, interruption recovery, audible guidance, voice lifecycle and fallback synchronisation, error focus, non-duplicated review numbering and confirmed gaze entry.
- **conductor-component.test.ts** — researcher/participant separation, locked personalisation default, participant-link generation, configuration/result file distinction and conductor error focus.
- **study.test.ts** — validated UTF-8 configuration links, identifier rejection, complete pseudonymous record storage, duplicate protection and stable CSV fields.
- **study-component.test.ts** — configured participant-code gate, locked prepared support, presentation-only permissions, configured-task spoken summary, local completion, approved-host receipt, host failure retention, score-display policy and host-event emission.
- **accessibility.test.ts** — axe-core structural scans of the demonstration introduction, supported rating screen, study-conductor setup and configured presentation-only route.

The jsdom accessibility scan excludes rendered colour contrast and cannot validate assistive-technology or webcam-model behaviour. The WebGazer integration test uses a mock engine; real camera accuracy still requires an HTTPS browser/manual test. The standalone test prevents packaging corruption but does not replace a browser walkthrough. A passing suite is not an accessibility, aMCI-benefit, gaze-accuracy or psychometric-equivalence claim.
