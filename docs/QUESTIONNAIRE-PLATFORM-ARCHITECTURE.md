# Questionnaire-independent platform decision and migration boundary

## Decision

Move toward a definition-driven accessible questionnaire platform, but do not claim that Version 0.7 already supports “any questionnaire”.

The defensible claim for this architecture increment is narrower:

> The existing NASA-TLX implementation now has a validated external instrument-definition boundary and a scoring engine demonstrated with both weighted NASA-TLX and a non-TLX ten-item five-point scoring profile.

That claim is testable. “Supports any questionnaire” is not: instruments can require free text, branching, matrices, ranking, repeated measures, multimedia, adaptive logic, translations, specialised scoring and licensing rules. A distinction-level dissertation should state that limitation instead of turning an extensible design into an unsupported universal claim.

## Where the boundary actually falls

The hypothesis that only `nasa-tlx.ts` and `scoring.ts` are instrument-specific is useful but incomplete.

| Area | Reusable now | Still NASA-TLX-specific |
| --- | --- | --- |
| Conductor workflow | Study/task labels, support policy, collection choice | NASA-TLX promises, fixed answer mode descriptions and score display |
| Accessibility support | Large text, simple-language policy, automatic audio, recovery, voice/gaze infrastructure | NASA scale landmarks and factor-specific voice vocabulary |
| Participant shell | Focus management, error summary, progress, review, submission and recovery patterns | `ratings → pairs → review` state machine and six/15/21 counts |
| Provenance | Support-change log and input-route concept | Rating/pair route fields and stage vocabulary |
| Collection | Origin-bound Qualtrics receipt protocol and local backup | Embedded Data manifest, result validator and CSV field names |
| Data model | Versioning, study identity, timing and collection metadata | NASA instrument identity, ratings, pairwise choices and `TlxResult` |
| Scoring | Validation-before-scoring principle | Weighted pairwise formula and NASA dimension identifiers |

Therefore replacing two files would create configurable constants, not an instrument-independent platform.

## Implemented architecture increment

### 1. External definition files

Definitions live in `source/instruments/`. A definition declares:

- stable instrument identity and version;
- provenance and source URL;
- numeric-scale items, prompts, accessible alternatives and anchors;
- ordered sections;
- an optional all-pairs phase;
- one of a small set of declarative scoring strategies.

NASA-TLX content, scale values, smiley landmarks, order and pair generation now come from `nasa-tlx.json`. The current participant component retains a typed compatibility adapter so this migration does not change the evaluated Version 0.7 interaction.

### 2. Validation as a trust boundary

`instrument-definition.ts` rejects:

- malformed or duplicate identifiers;
- missing prompts, provenance or HTTPS source URLs;
- invalid ranges and steps;
- unknown section, pairwise or scoring references;
- unsupported scoring strategies;
- incomplete and out-of-range responses.

Definitions cannot embed JavaScript. Arbitrary `eval` or downloaded scoring code would turn a questionnaire file into executable code, complicate content security, auditability and research reproducibility. New scoring behaviours must be added as reviewed, deterministic strategies with tests.

### 3. Generic scoring evidence

The engine currently supports:

- `unscored` response export;
- `linear-composite` scoring with per-item affine transforms, sum/mean aggregation and final scaling;
- `weighted-pairwise` scoring for full NASA-TLX.

The NASA adapter and the generic engine are tested to return the same weights, adjusted ratings and weighted score. A SUS-compatible scoring profile proves that the same engine can score an alternating ten-item five-point instrument without importing NASA types.

The SUS profile deliberately uses placeholder prompt labels. It demonstrates workflow and scoring but must not be administered until the researcher inserts wording obtained from an authorised source and verifies the resulting definition against the cited instrument.

## What this increment does not yet prove

- The participant renderer does not yet select arbitrary definitions at runtime.
- The conductor does not yet import, preview and lock a definition.
- Version 3 result and recovery schemas remain NASA-specific.
- Qualtrics fields remain the Version 0.7 NASA-TLX manifest.
- Voice parsing is not yet generated from each definition’s aliases and scale labels.
- Only numeric scales and all-pairs weighting are represented.
- Psychometric equivalence is not established by software equivalence.

These are not minor omissions. Until the first five are migrated and a second instrument completes the full conductor-to-export path, the product should be described as an accessible NASA-TLX with a demonstrated platform boundary, not as a completed general platform.

## Recommended migration sequence

1. **Freeze Version 0.7 evidence.** Complete the accessibility re-test and evaluation on the stable NASA-TLX route.
2. **Generalise records.** Introduce a Version 4 envelope with `instrumentId`, `instrumentVersion`, definition digest, generic item responses, generic input-route provenance and strategy-specific score payload.
3. **Build one generic numeric-scale renderer.** It should consume section/item definitions while reusing focus, error, audio, recovery, gaze and review services.
4. **Move voice prompts to definitions.** Generate permitted values, anchors and aliases; retain conservative ambiguity and negation rejection.
5. **Add conductor import and preview.** Validate JSON, show provenance and unsupported features, preview every state, and export the exact locked definition/digest.
6. **Generalise collection.** Send one lossless Version 4 JSON record plus a small stable analysis manifest; do not generate unbounded Qualtrics fields from arbitrary item names.
7. **Run a second instrument end to end.** SUS is a useful contrast because it removes pairwise weighting and reverses alternating items. UEQ-S should follow only after bipolar semantic-differential rendering and subscale scoring are defined.
8. **Evaluate the platform claim.** Compare cold setup time, manual steps, configuration errors and successful exports for NASA-TLX and the second instrument.

## Falsification tests for the dissertation claim

A platform claim should be rejected if any of these remain true:

- adding the second instrument requires editing the participant component;
- adding it requires a new Qualtrics bridge rather than a new definition/manifest;
- accessibility announcements or recovery logic are duplicated in an instrument component;
- a definition can silently change scoring after data collection starts;
- the exported record cannot identify the exact definition used;
- the second instrument passes software tests but its authorised wording, scoring or psychometric interpretation is not verified.

## Evaluation measures

Measure the workflow contribution separately from software correctness:

| Construct | Measure |
| --- | --- |
| Setup efficiency | Time from definition file to a runnable participant link |
| Manual burden | Number of hand-edited fields and copy/paste steps |
| Learnability | Completion and error rate for a researcher following the guide cold |
| Instrument portability | Source-code edits required for the second supported instrument |
| Data integrity | Complete, definition-linked records recovered after reload, early close and sink failure |
| Accessibility reuse | Proportion of support behaviours exercised through shared services rather than instrument-specific code |

Automated tests can establish deterministic behaviour and regression resistance. They cannot establish usability, accessibility for a disability group, or psychometric validity; those require the planned human evaluation and instrument-specific verification.
