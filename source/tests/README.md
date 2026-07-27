# Tests

Run the automated suite with:

```bash
npm test
```

Current checkpoint: **77 tests pass across twelve files.**

- **content.test.ts** — six dimensions, fifteen unique pairs, 0–100 increments, Performance direction and valid smiley mappings.
- **scoring.test.ts** — weight invariants, deterministic score calculation and rejection of incomplete or invalid responses.
- **voice-input.test.ts** — valid rating and digit-sequence parsing, five-value smiley labels, Performance anchors, consistent ranked-alternative recovery, conflicting label/value rejection, pair-factor matching and rejection of negated, ambiguous or invalid answers.
- **webgazer-adapter.test.ts** — secure-context boundary and uninterrupted/reset dwell behaviour.
- **standalone.test.ts** — Version 0.7 single-document structure, no Vite asset dependency, executable inline JavaScript syntax and compiled-component boot rendering.
- **result-sink.test.ts** — explicit host installation, same-submission receipt validation, exact-origin Qualtrics messaging, complete 63-field staging, bounded automatic advance and failed-advance watchdog, direct-opening rejection, false-success rejection and restored parent navigation after staging failure or a missing iframe.
- **component.test.ts** — ratings-before-pairs flow, pair-task clarity, definition non-duplication, adjustable text, one primary Smiley presentation, precision refinement, interruption recovery, Smiley-aware audio, proposal/error/recovery/completion speech, exact voice-proposal announcement/focus, conservative alternative handling, fallback synchronisation, error focus, non-duplicated review numbering and confirmed gaze entry.
- **conductor-component.test.ts** — researcher/participant separation, participant-choice default, local and origin-bound Qualtrics configuration, the four-part installation package, placeholder rejection, configuration/result file distinction and conductor error focus.
- **study.test.ts** — validated UTF-8 configuration links, identifier rejection, complete pseudonymous record storage, duplicate/stale-backup control, full-storage failure handling and stable CSV/support-change fields.
- **study-component.test.ts** — configured participant-code gate, adjustment policies, support provenance, configured-task spoken summary, pre-host local backup, same-device post-close discovery, storage-full and network-failure paths, recovery controls, score-display policy and host-event emission.
- **accessibility.test.ts** — axe-core structural scans of the demonstration introduction, supported rating screen, study-conductor setup and configured presentation-only route.
- **focus-style.test.ts** — explicit 3:1-or-better non-text contrast calculation for the dark focus outline across the prototype's light surfaces, with a retained yellow visual halo.

The jsdom accessibility scan excludes rendered colour contrast and cannot validate assistive-technology or webcam-model behaviour. The WebGazer integration test uses a mock engine; real camera accuracy still requires an HTTPS browser/manual test. The standalone test prevents packaging corruption but does not replace a browser walkthrough. A passing suite is not an accessibility, aMCI-benefit, gaze-accuracy or psychometric-equivalence claim.
