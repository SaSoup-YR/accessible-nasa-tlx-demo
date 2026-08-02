# Structured-import workflow evaluation

## Evaluation claim

A researcher can import a questionnaire within the supported Qualtrics QSF or
LimeSurvey LSS/LSG/LSQ profile, identify unsupported content, verify the
conversion and prepare a testable study without editing source code.

This is a researcher-workflow and technical-integrity claim. It is separate from
disabled-participant usability, psychometric equivalence and complete
accessibility claims.

## Task design

Use a route-aware staged workflow rather than one long page or an arbitrary fixed
number of screens. Import review stages map to fidelity properties that can fail
independently: items, response options and values, unsupported findings, and
scoring. Internal settings are grouped by one decision purpose; participant
support and input policy remain separate to avoid another crowded settings page.

Each researcher receives:

- the same frozen candidate, clean browser and public guide;
- one supported QSF, LSS, LSG or LSQ source file;
- a study ID, title and task label; and
- a request to import, review, prepare, generate and run one synthetic response.

Use a separate fault task containing one clearly unsupported active question.
The correct outcome is a blocked conversion with a useful explanation, not a
partial questionnaire.

## Measures defined before testing

| Measure | Definition |
| --- | --- |
| Task completion | Required outputs produced and verified against the source; pass/fail |
| Setup time | Opening the conductor to a generated testable study |
| Errors | Incorrect actions, unsafe continuation attempts or source/output mismatches |
| Help requests | Count and reason; guide use is separate from facilitator help |
| Warning understanding | Researcher explains what is unsupported and the safe next action |
| Recovery | Correct draft after Back, reload or tab closure |
| Confidence | One post-task rating with a short explanation |
| Qualitative feedback | Confusing wording, missing guidance, trusted checks and suggested changes |

Report raw counts and denominators. For a small formative sample, use descriptive
summaries and qualitative themes rather than inferential claims.

## Independent source-to-output check

Before running the importer, build an expected record from the source-platform
screenshot or report and the untouched export. Record file hash, language, scope,
item IDs and order, exact wording, response labels and order, numeric values,
scoring and reverse-scored items.

For one canonical case per supported format, enter this source information twice
at least 24 hours apart, compare both entries and resolve every difference against
the source. Report the discrepancy count and number of fields compared as a
descriptive same-person transcription-consistency check; do not call it inter-rater
reliability. Record additional files once and perform targeted source checks. The
importer output must then match the resolved expected record field by field. A
synthetic response must also match an independently recalculated score and export.

Silent omission, changed order or wording, wrong values, wrong scoring or an
unblocked unsupported item is a failure.

## Separate round-trip property

Download the reviewed AQP definition, re-import it through **Reuse an AQP
questionnaire definition**, and compare the normalised AQP definition field by
field. This tests AQP JSON portability only. It must not be described as an
independent check of the original QSF/LSS/LSG/LSQ conversion.

## Research boundary

Do not compare repeated answers to the same short questionnaire as evidence of
score equivalence. Memory can increase agreement, and counterbalancing does not
remove recall. The feasible study is formative usability with researchers and
users of the relevant access methods. If eligible target users are not confirmed
under the approved study procedure by 12 August 2026, limit the evidence to expert
evaluation and technical validation and reduce the dissertation claim.

The full design rationale, wizard state risks and repository migration sequence
are recorded in
[`RESEARCHER-WORKFLOW-AND-VALIDATION-PROPOSAL.md`](RESEARCHER-WORKFLOW-AND-VALIDATION-PROPOSAL.md).
