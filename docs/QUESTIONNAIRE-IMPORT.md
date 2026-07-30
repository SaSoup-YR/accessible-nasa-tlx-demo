# Importing a Qualtrics or LimeSurvey questionnaire

The conductor can convert a bounded structured survey export into the platform's
validated `QuestionnaireDefinition`. Conversion happens locally in the browser.
The selected file is not uploaded.

## Accepted source files

- **Qualtrics:** a `.qsf` survey export. Qualtrics documents QSF as its survey
  project format containing survey structure and settings, without response
  data: <https://www.qualtrics.com/support/survey-platform/survey-module/survey-tools/import-and-export-surveys/>
- **LimeSurvey:** an `.lss` XML survey-structure export. LimeSurvey documents LSS
  as containing groups, questions, subquestions, answers and conditions, without
  response data: <https://www.limesurvey.org/manual/Display/Export_survey/en>

Do not rename a response-data export to `.qsf` or `.lss`. Do not hand-edit the
source export to make it pass.

## Supported conversion profile

All converted items must be required, ordered rating questions that share one
increasing whole-number scale from 0 to 100 with a constant step.

Qualtrics support:

- one active ordinary block in one simple block flow;
- `Multiple Choice` with `Single Answer, Vertical` (`MC` / `SAVR`);
- single-answer Likert matrices when row order, answer order and numeric recodes
  are explicit; each row becomes one item;
- explicit `ChoiceOrder` or `AnswerOrder`; and
- explicit whole-number `RecodeValues`.

LimeSurvey support:

- one language and one question group;
- mandatory `List (Radio)` (`L`) questions with explicit increasing numeric
  answer codes or assessment values; and
- mandatory `5 Point Choice` (`5`) questions.

The source question order, response order, displayed labels and accepted numeric
values are preserved. Imported response labels remain visible in the participant
interface and can be used as exact confirmed voice answers.

## Content that blocks conversion

The importer does not silently drop or approximate active content. Conversion is
blocked when the export contains unsupported items or behaviour, including:

- free text, multiple answers, ranking or unsupported matrix types;
- optional questions or “Other” free-text answers;
- branching, skip/display/relevance logic, randomisation or carry-forward;
- question help or group text that would otherwise be lost;
- mixed item scales, missing order or missing/unsafe numeric recodes;
- custom JavaScript, executable markup, event handlers, JavaScript URLs,
  expression text or arbitrary formulas;
- participant-visible media, tables or interactive controls embedded in item
  text;
- LimeSurvey subquestions, assessments, default answers, quotas or active
  question attributes; or
- more than 20 supported items or an export larger than 2 MB.

Source-platform theme, navigation, publication and notification settings are
reported as not imported. Questions in an explicit Qualtrics Trash block are
reported and excluded.

## Review and conversion

1. Open `study.html` and choose **Add your own questionnaire**.
2. Under **Import from Qualtrics or LimeSurvey**, leave **Detect from file**
   selected unless format checking is part of the test.
3. Select one `.qsf` or `.lss` export.
4. The page moves keyboard focus to the import review.
5. Check all three review sections:
   - **Imported safely** lists every accepted item and its ordered values.
   - **Requires researcher confirmation** lists transformations and decisions
     that cannot be inferred safely.
   - **Unsupported content** lists every detected blocker.
6. If conversion is blocked, correct the source questionnaire and export it
   again. No partial definition is created.
7. If conversion is available, compare the item wording, order, labels and values
   with the source platform.
8. Select the reviewed scale description and mean or sum scoring rule.
9. Select reverse-scored items only when the questionnaire's authoritative
   scoring instructions require them.
10. Select the final confirmation checkbox and then **Convert and use this
    questionnaire**.
11. The page moves to the green **Questionnaire ready** confirmation.
12. Download the current definition JSON, generate a local study and verify a
    complete response before installing it in a copied Qualtrics collection
    survey.

## What the importer does not establish

A structurally valid conversion does not establish permission to use an
instrument, measurement validity, population suitability, psychometric
equivalence or complete accessibility. These remain research decisions.
