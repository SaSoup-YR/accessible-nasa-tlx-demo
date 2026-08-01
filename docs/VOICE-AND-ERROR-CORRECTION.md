# Voice-state, semantic-parsing and error-location corrections

Decision date: 21 July 2026

Version 0.8 retains these corrections in the shared questionnaire runner and adds
the mobile-centred error helper and bounded `Low` homophone handling.

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

## Version 0.7 ranked-alternative and audio-feedback correction

Further microphone testing on 27 July 2026 found that the browser sometimes returned
a harmless near-homophone such as `hello` as its first hypothesis even when `low` was
available as a lower-ranked hypothesis. Requesting only one hypothesis made the user
repeat an endpoint unnecessarily. Unrestricted fuzzy matching was rejected because a
Low/High error changes a rating between 0 and 100.

The recogniser now requests up to five ranked alternatives. The application:

1. rejects the entire result if any unresolved alternative contains negation,
   exclusion or uncertainty;
2. otherwise uses the first browser-ranked alternative that resolves to one complete
   visible answer;
3. never mines an answer number from arbitrary prose;
4. presents the chosen transcript, label, numeric value and factor as a proposal; and
5. requires explicit confirmation before changing an answer.

The Smiley prompt also tells the participant to say `zero` or `one hundred` if the
short endpoint words are not recognised. This is a reliable fallback route, not a
claim that the browser speech service has become accurate for every speaker or
device. The Web Speech API exposes ranked hypotheses and `maxAlternatives`, but the
underlying recognition implementation remains browser or platform dependent:
[Web Speech API specification](https://webaudio.github.io/web-speech-api/).

The final prompt puts the five numeric values first because they are less ambiguous
than the short words `Low`, `High` and `Poor`. The bounded parser also accepts a small
allowlist of complete-answer number and endpoint homophones and fixed English-label
transcription variants. It does not use edit-distance fuzzy matching. `pool`, arbitrary
similar words and illegal values remain rejected. The explicit proposal and confirmation step is therefore
the semantic boundary: recognition can help propose an answer but cannot silently
change the measurement.

The participant interface exposes one English voice control. It requests `en-GB`
and accepts a displayed value spoken as an English number for every supported
questionnaire. When the questionnaire itself is English, it also accepts one complete
complete visible English answer label, including a small set of meaning-preserving
transcription variants such as `agreed` for `agree`. Non-English label recognition, translation and
fuzzy matching are outside the tested boundary. A transcript that does not meet this
boundary leaves the response unchanged and produces a neutral retry message rather
than a form error. Permission, microphone, no-speech, network and abort failures are
reported as voice-service availability messages. Visible answer buttons always remain
available.

The parser rejects `not low`, `anything but low`, `other than high`, uncertainty,
multiple anchors and non-scale numbers such as `twenty three`. `Twenty three` is not
rounded to 20. Test cases cover number words, digit-by-digit speech, bounded homophones,
negation, illegal increments and ranked alternatives.

Where the browser exposes `SpeechRecognition.phrases` and `SpeechRecognitionPhrase`,
the current visible numbers, short number commands and English labels are supplied as
contextual hints with a moderate boost. This API remains experimental, so the code
feature-detects it and falls back to ordinary recognition if construction or assignment
fails. The required safety boundary therefore remains the bounded parser, visible
transcript, mandatory confirmation and permanently available answer buttons.

Built-in automatic audio now covers:

- each new rating, comparison and review step;
- the five Smiley labels and values when that presentation is active;
- selected ratings and pair choices;
- a voice or gaze proposal before confirmation;
- opened simpler help and a simpler-language mode change;
- a saved-position return summary and next action;
- validation, voice, storage and submission errors;
- result calculation, or a short automatic-finish message during a successful
  Qualtrics handoff.

This audio is an optional page-level speech-synthesis route, not a screen reader.
It deliberately does not narrate every changing gaze coordinate, calibration count or
background technical state because that would create continuous auditory load and
could interfere with the task. The interface continues to expose semantic headings,
native controls, focus movement and live regions to NVDA and VoiceOver independently.
When Qualtrics replaces the iframe after a successful handoff, browser speech that
belongs to the iframe may be interrupted; persistent completion wording therefore
belongs on the Qualtrics End-of-Survey page.

Speech-synthesis voice quality and gender are supplied by the browser and operating
system. Earlier code selected the first English voice returned by `getVoices()`;
voice ordering is not stable across devices and could select a compact, low-quality
tablet voice. The release now leaves the voice unset, requests English and uses the
device's configured system voice at a neutral rate, pitch and volume. A female voice
on one computer and a male voice on an iPhone is therefore not evidence of different
questionnaire content. Device voice availability, volume and quality must be recorded
as an interoperability observation rather than claimed as application-controlled.

During a normal Qualtrics handoff, the page displays a short `Submitting response`
status and advances automatically after 0.8 seconds. Built-in audio does not speak a
second transition message because it would add load and may be interrupted by
navigation. If native advancement fails, a second parent message produces one
concise visible and spoken correction: reconnect, keep or download a backup, then
use the restored Next button. The persistent Qualtrics final page carries the durable
completion message. It may use either Qualtrics' default text or the optional
generated wording.

If the browser already reports that it is offline, the parent sends this correction
after the 0.8-second handoff without starting Qualtrics' network request. A browser
that still reports online uses native advancement and the six-second watchdog, so a
slow but valid connection is not treated as a definite failure.

## Role and file boundary

Version 0.5 is one workflow with two role-specific pages, not one mixed page:

- `study.html` is used by the study conductor to prepare and normally lock support, generate a participant link and export same-device results;
- `index.html#study=...` is used by the participant to enter a pseudonymous code and answer the prepared questionnaire.

The current readable implementations are `source/src/study-conductor.ts` and
`source/src/accessible-nasa-tlx.ts`. Versioned single-file demonstrations under
`source/demo/` are deliberately participant-only and are not the conductor workflow.
