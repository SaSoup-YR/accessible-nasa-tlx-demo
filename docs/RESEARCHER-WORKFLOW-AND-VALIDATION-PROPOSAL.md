# Accessible Questionnaire Platform: researcher workflow and validation proposal

Status: proposal for supervisor review. It does not change the released
`v0.8.0-rc.4` participant or researcher implementation.

Evidence baseline: the published immutable tag `v0.8.0-rc.4` points to
`5a79e39`. Its release record documents 181 passing tests, 12 automated axe
structural scans across 12 explicitly named UI states, the release build and
manual browser checks. The number 181 describes that tagged release; later
candidates must report their own full-suite result.

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

The participant answering flow is retained. The main redesign target is the
researcher setup page.

On 2 August 2026, the deployed rc.4 page was measured in Chrome at 1363 × 936 CSS
pixels. The blank setup state was 4,532 pixels high (4.8 viewports) and exposed
21 interactive controls. Opening **Add your own questionnaire**, before any
import review, increased this to 9,263 pixels (9.9 viewports) and 55 controls.
After importing the supervisor-supplied `limesurvey_survey_578216.lss` and
selecting the five-item **Spatial Presence (VR)** group, the rendered import
review contained five imported items, eight confirmation findings and no
unsupported blocks. The same page measured 14,612 pixels (15.6 viewports) and
86 controls. This third state directly matches the reported problem: items,
labels, values, scoring and findings are visible in one document.
The measurements use `document.documentElement.scrollHeight` and
`document.querySelectorAll('input, select, textarea, button')`.

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

| Stage | Task | Continue when |
| ---: | --- | --- |
| 1 | Choose source | Exactly one source route is selected. |
| 2 | Upload and select scope | File type and size pass validation, parsing succeeds, and any required group or rating set is selected. |
| 3 | Review items | Item IDs, count, order and exact wording are confirmed against the source. |
| 4 | Review answers | Response-label order and numeric values are confirmed. |
| 5 | Resolve findings | No blocking finding remains and every non-blocking warning is acknowledged. |
| 6 | Confirm scoring | Scoring rule, reverse-scored items and expected range are confirmed. |
| 7 | Enter study details | Study ID, title and task label pass validation. |
| 8 | Set participant support | Text size, spoken guidance and interruption-recovery defaults are selected. |
| 9 | Set input policy | Confirmed voice and participant-choice policy is selected. Experimental gaze remains default-off and outside the core evaluation. |
| 10 | Choose collection | One route is selected; a Qualtrics URL must pass exact-origin validation. |
| 11 | Review and generate | The summary is approved, generation succeeds and one synthetic response completes. |

Built-in instruments and validated AQP definitions skip stages 2–5, giving a
seven-stage route. Imported source files use all eleven. The displayed total must
match the active route. Eleven is retained as the longest route because collection
security and final acceptance are separate decisions; merging them only to reduce
the number would hide a release gate.

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

For the supported QSF, LSS, LSG and LSQ test set:

1. Record the source-platform screenshot or report, file hash, language, scope,
   item IDs, item order, exact wording, response labels, numeric values and scoring
   rule.
2. Create the expected record independently from the importer. For one canonical
   case per format, enter the source information twice at least 24 hours apart,
   compare both entries and resolve every difference against the source. Report
   the discrepancy count and the number of fields compared. This is a descriptive
   same-person transcription-consistency check, not inter-rater reliability.
   Record other files once and perform targeted checks against their source.
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

The default-off experimental gaze feature is outside the core validation claim.
It must not be presented as evidence of accessibility or user benefit unless it
receives a separate approved evaluation.

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

Evaluation build: participant-side sessions use the immutable rc.4 participant
flow, which the researcher redesign does not change. The researcher-side
walkthrough uses the new wizard only after implementation and technical
validation. If the wizard is not ready for the evaluation window, report the
researcher workflow as a design rationale rather than an evaluated outcome.

Before recruitment or data collection, confirm in writing whether the current
UCL ethics approval covers target-user recruitment, access needs, compensation,
think-aloud or observation, any recording and the selected data route. If no
approval exists or an amendment is required, recruitment must not begin; the
review time may itself trigger the decision point below.

Decision point: if approval and eligible target-user participants are not
confirmed by **12 August 2026**, remove target-user empirical claims from the
current dissertation plan and use the remaining time for expert evaluation,
technical validation and reporting. Non-disabled participants simulating
assistive technology may find basic defects but must not be presented as evidence
of disabled-user usability or benefit. Formal score equivalence can be future
work with a separate approved design.

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

Planning checkpoints: check the ethics scope immediately and request the design
decision by 6 August; complete wireframes and internal cognitive walkthroughs by
10 August; apply the approval and recruitment decision point on 12 August;
implement the wizard and state tests by 16 August; repeat the technical matrix by
20 August; run a researcher walkthrough on 21–22 August only if the wizard has
passed those gates; complete the approved evaluation and analysis by 24 August;
reserve 25–27 August for final quality checks and submission. Approved participant
sessions may use rc.4 independently of wizard development. Internal walkthroughs
use synthetic data and do not replace target-user evidence.
