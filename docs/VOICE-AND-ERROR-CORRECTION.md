# Voice-state, semantic-parsing and error-location corrections

Decision date: 21 July 2026

## Trigger

Researcher-led browser testing identified three related failures:

1. after a spoken rating was recognised and confirmed, **Next question** could appear to do nothing;
2. after a spoken proposal, choosing a visible numeric rating could still leave navigation unresponsive;
3. a confirmed spoken landmark changed the stored 0–100 answer but did not update the checked state of the visible smiley radio group.

A separate conductor test showed that importing a completed-result JSON into the configuration importer produced an error above the current viewport without moving focus to it.

## Root-cause analysis

The navigation failure was a speech-recognition lifecycle race. One-shot browser recognition may already have ended after producing a result. The previous cleanup path called `stop()` again without handling `InvalidStateError`. Because cleanup ran at the start of the navigation event, the exception stopped the remainder of **Next question** processing. This explains why the defect followed a voice attempt but was absent in a manual-only flow.

The smiley defect came from coupling two distinct state dimensions. The visual checked state required both the selected value and a `smiley-landmark` input-route label. A confirmed voice response correctly stored the rating and its `voice` provenance, but the route condition prevented the corresponding visible landmark from becoming checked.

The import problem combined ambiguous terminology with incomplete focus management. Configuration JSON and completed-result JSON are intentionally different schemas, but the control did not explain that boundary. The import catch path rendered an alert without focusing or scrolling it into view.

## Correction

- Recognition cleanup is now idempotent. It detaches callbacks, clears the active instance and catches the already-ended state instead of allowing it to interrupt navigation.
- Stale recognition callbacks are ignored by checking instance identity.
- A visible manual or gaze answer cancels any pending voice proposal before replacing it.
- Smiley checked state now follows the official selected value. Input-route provenance remains separately recorded as voice, manual or gaze and is not used to suppress the visible answer.
- After voice confirmation, focus moves to the matching native answer control. This preserves a visible focus indicator and gives assistive technology a concrete selected control after the confirmation panel is removed.
- Participant and conductor error helpers now focus and scroll the visible error summary.
- The configuration importer explicitly states that it accepts the file downloaded from **Configuration ready**. A completed-result object or result array receives a file-type-specific error.

## Regression evidence

Automated component tests now cover:

- a confirmed spoken rating followed immediately by **Next question**, including a recogniser whose repeated `stop()` throws `InvalidStateError`;
- a pending spoken proposal replaced by a visible rating, followed by successful navigation;
- a confirmed spoken smiley landmark synchronised with the native radio group;
- a confirmed spoken pair choice followed by successful navigation;
- missing-answer focus on the participant error summary;
- completed-result JSON rejected by the configuration importer with focus on the conductor error summary.

These tests establish internal state, navigation and focus behaviour in the tested code. They do not establish speech-recognition accuracy across browsers, screen-reader usability or participant benefit. Those remain manual and, if approved, participant-evaluation questions.

## Version 0.7 landmark-phrase correction

Testing on 27 July 2026 exposed a separate semantic parsing defect. The recogniser
transcribed `Close to Low` and `Closer to High` correctly, but the parser searched only
for the words `low` and `high`. It therefore proposed the endpoint values 0 and 100
instead of the visible landmark values 25 and 75.

The parser now treats the five visible labels as a five-value set:

| Spoken label | Ordinary dimensions | Performance |
| --- | ---: | ---: |
| Low or Good | 0 | 0 |
| Closer to Low or Closer to Good | 25 | 25 |
| Middle | 50 | 50 |
| Closer to High or Closer to Poor | 75 | 75 |
| High or Poor | 100 | 100 |

`Close to` and the common recognition variant `Closer too` are accepted for the
intermediate landmarks. A phrase containing a negation, uncertainty, two anchors or a
numeric value that conflicts with its spoken label is rejected. Every accepted
transcript remains a proposal: it is announced with its label, value and factor and
must be explicitly confirmed.

The smiley-mode prompt now reads the visible label choices and their five values.
Saying `smiley landmarks` is not a rating answer and is deliberately not interpreted
as one; answer-presentation choice is configured before the rating task.

## Role and file boundary

Version 0.5 is one workflow with two role-specific pages, not one mixed page:

- `study.html` is used by the study conductor to prepare and normally lock support, generate a participant link and export same-device results;
- `index.html#study=...` is used by the participant to enter a pseudonymous code and answer the prepared questionnaire.

The current readable implementations are `source/src/study-conductor.ts` and
`source/src/accessible-nasa-tlx.ts`. Versioned single-file demonstrations under
`source/demo/` are deliberately participant-only and are not the conductor workflow.
