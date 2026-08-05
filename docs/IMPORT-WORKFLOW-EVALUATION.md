# Structured-import workflow evaluation

## Evaluation claim

A researcher can import an existing questionnaire within the supported
Qualtrics QSF or LimeSurvey LSS/LSG/LSQ profile, review the conversion, configure
accessibility support and prepare a study without rebuilding the questionnaire
or editing source code.

This is a researcher-workflow claim. It is separate from any claim that disabled
participants find a questionnaire more accessible.

## Fixed tasks

Each researcher receives:

- the same release tag and clean browser;
- the same supported QSF, LSS, LSG or LSQ file;
- the public import guide;
- a study ID, study title and task label; and
- a request to import, review, configure, generate, test and download the
  resulting definition.

At least one separate fault task uses an export containing a clearly unsupported
question. The expected result is a correct blocked conversion, not a partial
study.

## Measures defined before testing

| Measure | Definition |
| --- | --- |
| Task completion | All required outputs are produced and match the source; pass/fail |
| Setup time | Time from opening the conductor page to a generated testable study |
| Manual corrections | Count of changes made during import review before conversion |
| Errors | Count of incorrect actions, invalid outputs or source/converted mismatches |
| Help requests | Count and reason; distinguish guide use from facilitator help |
| Warning understanding | Researcher explains what was unsupported and what action is safe |
| Successful study generation | Generated participant page opens and accepts a complete synthetic response |
| Reproduction | Downloaded definition JSON re-imports with the same items, values and scoring |
| Confidence | Single post-task rating plus a short explanation |
| Qualitative feedback | Confusing wording, missing guidance, trusted checks and improvement suggestions |

## Evidence captured

For a written asynchronous task, testers record start/end times, errors, help
requests and final artifacts in the supplied form; there is no live observation
or recording. Compare the source export with the converted definition using a
fixed checklist:

- questionnaire name and version;
- item count and order;
- exact participant-visible wording;
- response label order;
- numeric response values;
- score calculation and reverse-scored items;
- generated study configuration; and
- completed synthetic result and export.

Report every denominator and raw count. For a small formative sample, use
descriptive summaries and qualitative themes. Do not use the results to claim
universal usability, universal accessibility or psychometric equivalence.
