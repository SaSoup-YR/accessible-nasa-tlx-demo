# WCAG 2.2 component audit

Prototype: Accessible Questionnaire Platform Version 0.8

Audit date: 28 July 2026

## Claim boundary

This is a criterion-by-criterion implementation audit of the authored prototype.
It is not a WCAG certification and does not establish that the complete UCL
Qualtrics survey, its theme, the participant information sheet or a particular
browser/assistive-technology combination conforms.

WCAG 2.2 is used as an engineering and evaluation framework because accessible is
otherwise too vague to test. It is not treated as evidence that the questionnaire
is usable by every disabled participant or that optional presentations are
psychometrically equivalent.

Primary references:

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding 1.4.3 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Understanding 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Understanding 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [Understanding 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [Understanding 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## Implementation status

| Criterion | Authored evidence | Current status |
| --- | --- | --- |
| 1.1.1 Non-text Content | Smiley cues have numeric and textual labels; webcam preview is positioning feedback, not the only instruction | Pass in authored component; manual AT check required |
| 1.3.1 Info and Relationships | Native headings, lists, fieldsets, legends, labels, tables and definition lists | Automated structural scan passed; manual reading-order check required |
| 1.3.2 Meaningful Sequence | One-page-at-a-time DOM order matches visual order | Automated structure plus keyboard test; manual mobile check required |
| 1.4.1 Use of Color | Selected badges/check marks, checked state, error text and focus geometry accompany colour | Pass in authored states |
| 1.4.3 Contrast Minimum | Body, secondary, link, button and error text ratios meet AA thresholds in tested authored surfaces | Token regression test passed; external theme excluded |
| 1.4.10 Reflow | Single-column mobile layouts and horizontally scrollable research tables | Manual 320 CSS pixel and 400% reflow test required |
| 1.4.11 Non-text Contrast | Control, selected, focus, error and gaze indicators exceed 3:1 | Calculated and regression-tested; native/Qualtrics controls require manual check |
| 1.4.12 Text Spacing | Layout uses flexible containers without fixed text heights | Manual text-spacing bookmarklet check required |
| 2.1.1 Keyboard | Native controls; hidden rating radios retain radio semantics and arrow navigation | Automated interaction tests and researcher keyboard test passed |
| 2.1.2 No Keyboard Trap | Modal gaze setup includes cancel; ordinary controls preserve navigation | Automated/manual adverse check required for every gaze state |
| 2.4.1 Bypass Blocks | Skip link to participant or conductor main content | Pass |
| 2.4.3 Focus Order | New page heading focused; errors are focused and repeatedly revealed after responsive layout; recovery focuses the described Resume action; voice confirmation focuses its confirm button | Automated focus/reveal tests passed; iOS/iPadOS visual-centering re-test required |
| 2.4.7 Focus Visible | 3 px dark outline plus 6 px yellow halo, including hidden-radio wrappers | Contrast regression test passed |
| 2.5.3 Label in Name | Visible button wording is present in accessible names | Automated content/axe checks; manual voice-control check required |
| 2.5.8 Target Size Minimum | Primary actions and rating controls exceed 24 by 24 CSS pixels | CSS evidence; manual mobile measurement required |
| 3.2.2 On Input | Selecting an answer does not automatically change page; explicit Next/Confirm remains | Pass |
| 3.3.1 Error Identification | Missing/invalid input produces a text error summary, not colour alone | Pass in code; mobile centring re-test required |
| 3.3.2 Labels or Instructions | Scale anchors, response values, participant-code format and setup examples are provided | Pass in authored flows |
| 3.3.3 Error Suggestion | Errors state the required correction; voice proposals require confirmation | Pass for known validation states |
| 3.3.4 Error Prevention | Review before score/submission; host receipt must match submission ID; backups remain available | Pass in implementation; live Qualtrics adverse re-test required |
| 4.1.2 Name, Role, Value | Native radio, checkbox, button, details and form controls; status/live regions | Automated axe scan passed; NVDA/VoiceOver manual check required |
| 4.1.3 Status Messages | Polite status regions and assertive error alerts; saved recovery creates a delayed live-region change; built-in audio is separate from screen-reader output | Pass in structure; external screen-reader and duplicate-speech combinations require manual check |

## Mobile error correction

Both participant and conductor error handlers now:

1. render an explicit `There is a problem` summary;
2. focus it with `preventScroll`;
3. reveal it immediately rather than relying on focus scrolling;
4. repeat after two animation frames for Lit rendering and mobile
   visual-viewport changes;
5. repeat after 160 ms for delayed iOS/iPadOS viewport settling;
6. use a visual-viewport coordinate fallback when `scrollIntoView` leaves the
   target outside the visible area;
7. inside Qualtrics, send a bounded exact-origin reveal request so the parent
   survey viewport moves as well as the iframe;
8. retain a large block scroll margin.

The immediate, retry, coordinate-fallback and parent-bridge paths have regression
tests. A real iPhone and iPad re-test remains necessary because jsdom does not
implement their visual viewport or the live UCL Qualtrics theme.

## Saved-session recovery announcement

When recovery data are found, the page focuses `Resume saved questionnaire`. The
button's accessible description includes the saved response count and the
Resume/Erase choice, so the information does not depend only on a live-region
announcement. The page then creates a delayed polite live-region change. If the
participant had already enabled automatic built-in audio, the same message is sent
to speech synthesis; a user-activated replay remains available because a mobile
browser may block automatic speech immediately after reload.

This separates three mechanisms: visible focus for sighted users, semantic focus
and status for external screen readers, and optional browser-generated speech.
None is presented as a substitute for the others.

## Speech-recognition boundary

Web Speech recognition quality is supplied by the browser and operating system.
The prototype can constrain interpretation but cannot retrain the acoustic model.
For NASA smiley endpoints it therefore:

- requests up to five recognition alternatives;
- accepts only exact, allowlisted labels or valid displayed numbers;
- rejects negation, uncertainty, conflicts and invalid increments;
- accepts the narrowly observed `hello` homophone only as the complete utterance
  for the `Low` endpoint;
- requires an explicit labelled confirmation;
- recommends the displayed number when a short endpoint word is unreliable.

This is safer than fuzzy matching. A false rejection leaves visible controls
available; a false acceptance could reverse a score.

## Required pre-recruitment evidence

Repeat and record:

- iPhone and iPad missing-answer errors in both orientations;
- keyboard and visible-focus states in Edge;
- NVDA and VoiceOver reading/focus order;
- 200% zoom, 320 CSS pixel reflow and text-spacing overrides;
- forced-colours mode;
- NASA-TLX and SUS end-to-end runs;
- Qualtrics close-early, offline, reload, storage-full, oversized-record and
  failed-native-navigation cases.
