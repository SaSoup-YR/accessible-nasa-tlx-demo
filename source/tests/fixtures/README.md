# External questionnaire import fixtures

These fixtures preserve the documented structure of real survey exports while
using short, synthetic questionnaire content.

- `qualtrics-rating.qsf` follows the `SurveyEntry` and `SurveyElements`
  structure found in a public Qualtrics QSF export. It contains one block and
  two required `MC` / `SAVR` questions with explicit choice order and recodes.
- `limesurvey-rating.lss` follows LimeSurvey's XML survey-structure export
  (`LimeSurveyDocType` `Survey`, database version 350). It contains one
  language, one group and two mandatory `List (Radio)` questions.
- `limesurvey-current-rating.lss` is a sanitised current-export regression
  fixture. It stores wording in localisation tables, declares an incomplete
  additional language, emits inert default question attributes and uses
  LimeSurvey's default `A001`–`A005` answer codes.

The fixtures contain no participant responses, credentials, tokens or
identifying information.
