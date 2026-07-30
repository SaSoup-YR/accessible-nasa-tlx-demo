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

## Why AQP JSON is a separate import

The conductor offers three different routes:

| Route | Input | Purpose |
| --- | --- | --- |
| Qualtrics/LimeSurvey import | `.qsf` or `.lss` | Review and convert an external source-platform export |
| AQP definition reuse | `.json` downloaded from this platform | Reproduce an already converted and validated questionnaire |
| Manual builder | Form fields | Create a small questionnaire without a source export |

The JSON input is not a second way to import Qualtrics or LimeSurvey. It is the
portable output of the conversion process. Keeping it allows another researcher
or browser to reproduce the same items, values and scoring decision without
repeating the conversion.

## Supported conversion profile

All converted items must be required, ordered rating questions that share one
increasing whole-number scale from 0 to 100 with a constant step.

Qualtrics support:

- one active ordinary block in one simple block flow;
- `Multiple Choice` with `Single Answer, Vertical` (`MC` / `SAVR`);
- single-answer Likert matrices when row order, answer order and numeric recodes
  are explicit; each row becomes one item;
- explicit `ChoiceOrder` or `AnswerOrder`; and
- explicit whole-number `RecodeValues`, or an omitted recode table only when the
  file explicitly orders unchanged default choice IDs `1` through `N`. The
  researcher must confirm that default-value conversion.

LimeSurvey support:

- one base language and one question group. If the LSS also contains additional
  languages, only the declared base language is proposed and the omission is
  shown for explicit confirmation;
- mandatory `List (Radio)` (`L`) questions with explicit increasing numeric
  answer codes or assessment values, or current default `A001` through `A00N`
  codes converted to ordered positions `1` through `N` after confirmation;
- mandatory `5 Point Choice` (`5`) questions.

Empty and known inert/default LimeSurvey question attributes are reported for
confirmation but do not block conversion. Active or unknown validation,
randomisation, timing, visibility or presentation attributes still block it.

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
- mixed item scales, missing order, unsafe recodes or non-default opaque answer
  codes;
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
2. Under **1. Import a Qualtrics or LimeSurvey export**, leave **Detect from
   file** selected unless format checking is part of the test.
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

## Release-candidate acceptance test

Use synthetic data only and record the browser, operating system, tested commit,
expected result, observed result and Pass/Partial/Fail.

### 1. Known-file check

Run the two sanitised files included with the automated tests:

- [`qualtrics-rating.qsf`](../source/tests/fixtures/qualtrics-rating.qsf)
- [`limesurvey-rating.lss`](../source/tests/fixtures/limesurvey-rating.lss)
- [`limesurvey-current-rating.lss`](../source/tests/fixtures/limesurvey-current-rating.lss)

For each file:

1. Open the versioned conductor page in a new private window.
2. Select **Add your own questionnaire**.
3. Under **1. Import a Qualtrics or LimeSurvey export**, leave **Detect from
   file** selected and choose the fixture.
4. Confirm that the review receives keyboard focus and shows:
   - source format detected correctly;
   - two safely imported items in this order: `CLARITY`, then `CONTROL`;
   - values `1, 2, 3, 4, 5` in order;
   - labels from **Strongly disagree** to **Strongly agree**;
   - zero unsupported items.
5. For the current LimeSurvey fixture, also confirm that the English base
   language, omitted additional language, default question attributes and
   positional conversion of `A001`–`A005` are all reported rather than hidden.
6. Choose **Agreement**, **Mean of reviewed item values**, no reverse-scored
   items, select the final confirmation checkbox, then convert.
7. Confirm that the page moves to the green **Questionnaire ready** summary.
8. Generate a local study, answer `4` and `2`, submit, and confirm a primary
   score of `3.00`.
9. Export the result and confirm the two raw answers, primary score, instrument
   definition and source labels are present.

### 2. AQP JSON reproduction

1. Download the current questionnaire definition after either conversion.
2. Open a new private window and select **Add your own questionnaire**.
3. Under **2. Reuse an AQP questionnaire definition**, choose the downloaded
   `.json` file.
4. Confirm that the same name, two items, 1–5 labels, mean rule and source
   information are selected without a QSF/LSS conversion review.
5. Generate and complete the same `4`, `2` local test. The score must again be
   `3.00`.

### 3. Fresh real-export check

The sanitised fixtures prove deterministic behavior against known structures.
They do not prove compatibility with the current files exported by the user's
actual Qualtrics and LimeSurvey accounts.

1. Create the same two-item, required, single-choice 1–5 questionnaire in
   Qualtrics and export a fresh QSF.
2. Create the same questionnaire in LimeSurvey and export a fresh LSS survey
   structure.
3. Import both files separately.
4. Compare the source and review line by line: title, item count, item order,
   wording, answer order, displayed labels and numeric values.
5. Complete one local result from each converted definition.
6. Install each generated study in a copied UCL Qualtrics collection survey and
   verify a newly dated accepted row and CSV export.

A different item count, reordered wording or labels, changed numeric value,
unreported unsupported content, partial conversion, wrong score, missing result
field or failed JSON reproduction is a release blocker.

### 4. Automated gate

From the repository:

```bash
cd source
npm ci
npm test
npm run build:release
```

All checks must pass on the same commit used for the candidate tag. The existing
published tag must not be moved.

## What the importer does not establish

A structurally valid conversion does not establish permission to use an
instrument, measurement validity, population suitability, psychometric
equivalence or complete accessibility. These remain research decisions.
