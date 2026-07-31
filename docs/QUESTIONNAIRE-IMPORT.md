# Importing a Qualtrics or LimeSurvey questionnaire

The conductor can convert a bounded structured survey export into the platform's
validated `QuestionnaireDefinition`. Conversion happens locally in the browser.
The selected file is not uploaded.

## Accepted source files

- **Qualtrics:** a `.qsf` survey export. Qualtrics documents QSF as its survey
  project format containing survey structure and settings, without response
  data: <https://www.qualtrics.com/support/survey-platform/survey-module/survey-tools/import-and-export-surveys/>
- **LimeSurvey survey:** an `.lss` XML survey-structure export. A survey with
  several groups requires the researcher to choose one group for review.
- **LimeSurvey question group:** an `.lsg` XML question-group export. This is the
  preferred input when one questionnaire is stored as one group inside a larger
  LimeSurvey survey. LimeSurvey documents LSS/LSG structure exports as containing
  groups, questions, subquestions, answers and conditions, without response data:
  <https://www.limesurvey.org/manual/Display/Export_survey/en>

Do not rename a response-data export to `.qsf`, `.lss` or `.lsg`. Do not hand-edit the
source export to make it pass.

LimeSurvey also uses `.lsq` for one question and `.lsa` for a survey archive. They
are intentionally not accepted here: an LSQ does not preserve a complete
questionnaire-group context, while an LSA may include participant responses.
Export the containing group as LSG or survey as LSS instead. Printable HTML is not
a complete structured definition. For Qualtrics, QSF is the supported
survey-structure export; response CSV, SPSS and similar files contain answers
rather than a reusable survey definition.

## Why AQP JSON is a separate import

The conductor offers three different routes:

| Route | Input | Purpose |
| --- | --- | --- |
| Qualtrics/LimeSurvey import | `.qsf`, `.lss` or `.lsg` | Review and convert an external source-platform export |
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

- one base language and one explicitly selected question group. A multi-group
  LSS first presents the group names, source question counts and type codes. It
  does not flatten the survey automatically. An LSG selects its one group;
- when a selected group contains more than one compatible numeric scale, a second
  review step lists the rating sets separately. The researcher chooses one set;
  questions using another scale or a non-rating type remain in LimeSurvey and are
  named in the confirmation panel. They are never silently merged into one score;
- if the export also contains additional languages, only the declared base
  language is proposed and the omission is shown for explicit confirmation;
- mandatory `List (Radio)` (`L`) and `Dropdown list` (`!`) questions with explicit increasing numeric
  answer codes or assessment values, or current default `A001` through `A00N`
  codes converted to ordered positions `1` through `N` after confirmation;
- mandatory `5 Point Choice` (`5`) questions; and
- mandatory numeric `Array` (`F`) rating rows with one shared ordered scale.
  Each row becomes one item. A one-row Array becomes one rating item. Blank
  intermediate scale labels are displayed as their reviewed numeric values.

Empty and known inert/default LimeSurvey question attributes do not block
conversion. Group relevance, omitted survey groups, Array expansion, blank
intermediate labels, the selected rating-set boundary and platform presentation
settings are reported for explicit confirmation. Active or unknown validation,
question-level branching, randomisation, timing, visibility or presentation
attributes still block an item selected for conversion.

The source question order, response order, displayed labels and accepted numeric
values are preserved. Imported response labels remain visible in the participant
interface and can be used as exact confirmed voice answers.

## Content that blocks conversion

The importer does not silently drop or approximate active content. Conversion is
blocked when the export contains unsupported items or behaviour, including:

- free text, multiple answers, ranking or unsupported matrix types selected for
  conversion;
- optional rating questions or “Other” free-text answers selected for conversion;
- branching, skip/display/relevance logic, randomisation or carry-forward;
- question help or group text that would otherwise be lost;
- mixed item scales when no compatible set can be selected, missing order, unsafe
  recodes or non-default opaque answer codes;
- custom JavaScript, executable markup, event handlers, JavaScript URLs,
  expression text or arbitrary formulas;
- participant-visible media, tables or interactive controls embedded in item
  text;
- unsupported LimeSurvey subquestion structures, assessments, default answers,
  quotas or active question attributes; or
- more than 20 supported items or an export larger than 2 MB.

Source-platform theme, navigation, publication and notification settings are
reported as not imported. Questions in an explicit Qualtrics Trash block are
reported and excluded.

## Review and conversion

1. Open `study.html` and choose **Add your own questionnaire**.
2. Under **1. Import a Qualtrics or LimeSurvey export**, leave **Detect from
   file** selected unless format checking is part of the test.
3. Select one `.qsf`, `.lss` or `.lsg` export.
4. The page moves keyboard focus to the import review. If an LSS contains
   several groups, choose one group and select **Review selected group**. If that
   group contains different numeric scales, choose one compatible rating set and
   select **Review selected rating set**.
5. Check all three review sections:
   - **Imported safely** lists every accepted item and its ordered values.
   - **Requires researcher confirmation** lists transformations and decisions
     that cannot be inferred safely.
   - **Unsupported content** lists every detected blocker.
   Confirm that every source question outside the selected rating set is named in
   **Requires researcher confirmation**. Those questions remain in the source
   survey and are not part of the converted standalone questionnaire.
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
- [`limesurvey-group-rating.lsg`](../source/tests/fixtures/limesurvey-group-rating.lsg)

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
   For the LSG fixture, confirm the one-row Array expansion, blank numeric scale
   labels and source group condition are all reported for confirmation.
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
   information are selected without a QSF/LSS/LSG conversion review.
5. Generate and complete the same `4`, `2` local test. The score must again be
   `3.00`.

### 3. Fresh real-export check

The sanitised fixtures prove deterministic behavior against known structures.
They do not prove compatibility with the current files exported by the user's
actual Qualtrics and LimeSurvey accounts.

1. Create the same two-item, required, single-choice 1–5 questionnaire in
   Qualtrics and export a fresh QSF.
2. Create the same questionnaire as one LimeSurvey group and export both a fresh
   LSG question-group structure and, if available, the containing LSS survey
   structure.
3. Import the QSF and LSG separately. Import the LSS and confirm that the same
   group must be selected before its review appears.
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
