# Accessible Questionnaire Platform: researcher workflow and validation proposal

Status: proposal for supervisor review. It does not change the released
`v0.8.0-rc.4` participant or researcher implementation.

## 1. Contribution and design rule

The contribution is an accessible questionnaire platform rather than one
accessible questionnaire. A shared participant runner reuses keyboard and
screen-reader structure, large text, spoken guidance, confirmed voice input,
interruption recovery, result provenance and the UCL Qualtrics bridge across the
supported questionnaire profile.

The current researcher page places import, review, study setup, accessibility
defaults, collection, generation and saved results on one long page. The proposed
workflow separates decisions that can fail independently and shows one main task
at a time.

Screen boundaries follow two rules:

1. Import review maps one-to-one to an external fidelity property because items,
   response options, findings and scoring can each fail independently.
2. Internal settings are grouped only when they support one clear decision.
   Participant support and input policy are separate so that a single screen does
   not become another crowded settings page.

The flow is route-aware rather than fixed at ten screens. Built-in and already
validated AQP definitions skip import-only stages.

## 2. Proposed researcher flow

The longest route, for a QSF/LSS/LSG/LSQ import, has eleven stages:

1. Choose the source: built-in, source-platform export, AQP definition or manual
   builder.
2. Upload the file and choose the relevant group or rating set when the source
   contains several compatible scopes.
3. Review item count, order, IDs and exact participant-visible wording.
4. Review response-label order and numeric values.
5. Resolve warnings and unsupported content. Any active unsupported content blocks
   conversion.
6. Confirm the scoring strategy, reverse-scored items and expected range.
7. Enter the study ID, title and task label.
8. Set participant support defaults: text size, spoken guidance and interruption
   recovery.
9. Set input and participant-choice policy: confirmed voice input and which
   prepared settings participants may change. Experimental gaze input remains
   outside the normal study path unless the protocol explicitly requires it.
10. Choose result collection: **This browser only** for technical work, or the
    approved exact-origin UCL Qualtrics route.
11. Review the complete configuration, generate the participant link/package and
    run one synthetic response.

Every stage shows the current step, completed steps, one next action and a Back
action. A failed check keeps the researcher on the relevant stage and explains
what must be corrected.

## 3. Implementation boundary and regression risk

The redesign preserves questionnaire parsing, scoring and participant logic. It
does introduce wizard state management, so it is a functional change rather than
only a visual rearrangement.

Before implementation, the state contract must define which reviewed values are
kept, when they are invalidated and what is never stored. Rejected or raw source
files must not persist. A valid reviewed draft may persist locally only with a
clear **Start again** action.

Automated and manual regression tests must cover every stage:

- Next and Back;
- browser Back and Forward;
- reload;
- closing and reopening the tab;
- abandoning and starting again;
- changing an earlier source choice after later stages were completed;
- keyboard focus and error announcement; and
- 320 CSS-pixel reflow and 200% zoom.

The existing participant, recovery, voice-safety and Qualtrics tests remain
release gates. The wizard should be implemented in a separate pull request and
must not move the immutable `v0.8.0-rc.4` tag.

## 4. Technical validation

Technical validation asks whether a supported imported questionnaire retains its
meaning and calculation. It does not ask whether an AQP file can reproduce only
itself.

For each QSF, LSS, LSG and LSQ test file:

1. Record the source-platform screenshot or report, file hash, language, scope,
   item IDs, item order, exact wording, response labels, numeric values and scoring
   rule.
2. Create the expected record independently from the importer. Enter the same
   source information twice, at least 24 hours apart, compare both entries and
   resolve every difference against the source. If feasible, ask a second person
   to check a sample.
3. Import the untouched source file and compare the normalised result with the
   resolved expected record field by field.
4. Render and complete a synthetic participant response. Recalculate the expected
   score independently and compare the result and export.
5. Treat silent omission, changed order or wording, wrong numeric values, wrong
   score or an unblocked unsupported item as a failure.

Re-importing a downloaded AQP JSON definition is a separate **round-trip
consistency** test. It is useful evidence for portability, but it is not evidence
that the original QSF or LimeSurvey source was imported faithfully.

The technical evidence supports only the declared single-choice integer profile.
It does not establish copyright permission, psychometric validity, complete WCAG
conformance or support for all questionnaire types.

## 5. Empirical validation

The feasible dissertation study should be a formative usability study, not a
score-equivalence study.

Repeating the same short questionnaire in an established interface and AQP would
create memory and carry-over bias. Counterbalancing would change order but would
not remove recall. An established interface may also be inaccessible to a target
participant; adding researcher assistance would introduce a different confound.
The study should therefore not claim equivalence from that design.

The primary questions are:

1. Can a researcher import, review and prepare a supported questionnaire without
   code?
2. Can target users complete the prepared questionnaire, recover from an
   interruption and correct input safely?
3. Which barriers, errors and support preferences remain?

Use one realistic task and one questionnaire administration per participant.
Recruit people who use the relevant access method, such as a screen reader or
voice input/control. Report completion, errors, time, help requests and observed
barriers, followed by a short interview. NASA-TLX may remain the first empirical
instrument because it has the strongest existing technical baseline, while the
QSF/LSS/LSG/LSQ matrix supplies technical evidence that the architecture is not
limited to NASA-TLX.

If target users cannot be recruited in time, run only an expert and technical
pilot. Non-disabled participants simulating assistive technology may find basic
defects but must not be presented as evidence of disabled-user usability or
benefit. The dissertation claim must be reduced accordingly. Formal score
equivalence can be future work with a separate approved design.

## 6. Repository name and safe migration

Proposed product and repository name:

- product: **Accessible Questionnaire Platform**;
- repository slug: **`accessible-questionnaire-platform`**.

The display name, package name and generic `AQP_*` result fields already use the
platform identity. Historical NASA-TLX filenames and tags remain where changing
them would weaken traceability.

Do not rename the live repository until the Pages URL migration is verified.
GitHub redirects repository and Git URLs after a rename, but it does not redirect
project-site URLs. The current Pages path is also used by the exact-origin
Qualtrics bridge.

Preferred sequence:

1. Keep `v0.8.0-rc.4` unchanged as the evidence baseline.
2. If a stable custom domain is available, configure and verify it before the
   repository rename. Otherwise, document the unavoidable Pages URL change and
   update every public study link in one controlled release window.
3. Change repository documentation and source references to the new canonical
   location on a new candidate branch.
4. Rename the repository only after the new Pages and recovery plan are ready.
5. Update local remotes, README links, generated packages, allowed origins and all
   documentation. Do not create a new repository under the old name, because that
   would remove GitHub's repository redirects.
6. Regenerate the Qualtrics HTML/JavaScript package with the new origin, install all
   required parts into a copied survey and submit one newly dated synthetic row.
7. Verify the participant page, researcher page, old-link behaviour, offline
   recovery and exact-origin Qualtrics receipt before publishing a new candidate
   tag.

## 7. Decisions requested

Supervisor confirmation is requested for:

1. the route-aware staged workflow and its task-division rule;
2. a usability-first empirical study without a score-equivalence claim;
3. NASA-TLX as the first empirical instrument, with broader technical import
   evidence; and
4. the proposed name and link-safe migration sequence.

After approval: produce low-fidelity wireframes, test the stage sequence with two
researchers, implement the wizard with state regression tests, repeat the technical
validation matrix, then run the approved formative pilot.
