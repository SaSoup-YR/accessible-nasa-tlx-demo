# Researcher setup wizard

Status: post-`v0.8.0-rc.4` candidate for formative evaluation

## Purpose

The researcher page no longer presents the complete setup as one crowded visual
task. It uses one task per screen, a visible progress indicator, guarded
navigation and a final review. This is an interface change for the study
conductor; it does not change participant questionnaire items, response values,
scoring functions, result schemas or the Qualtrics bridge.

## Routes

The first screen asks how the questionnaire will be supplied.

### Ready-made or saved AQP definition: six screens

1. Choose the questionnaire source.
2. Confirm the questionnaire version, scale and scoring.
3. Enter study details.
4. Set participant support.
5. Choose result collection.
6. Review and generate.

The source screen contains the built-in registry plus the bounded manual builder
and AQP-definition JSON import. Source-platform conversion is deliberately kept
out of this route.

### Qualtrics or LimeSurvey export: ten screens

1. Choose the questionnaire source.
2. Upload the file and choose the relevant group or rating set.
3. Review every imported question and its order.
4. Review answer labels and stored numeric values.
5. Resolve and acknowledge import findings.
6. Confirm the scoring rule and any reverse-scored items.
7. Enter study details.
8. Set participant support.
9. Choose result collection.
10. Review and generate.

Unsupported selected content remains a blocking finding on the upload screen.
The platform does not create a partial questionnaire. A supported import is not
activated until the scoring confirmation on screen 6 succeeds.

## Navigation and recovery

- `Continue` validates the current task before advancing.
- `Back` and browser Back/Forward change one setup screen at a time.
- After navigation, focus moves to the new screen heading.
- Errors move focus to a summary and keep the researcher on the incomplete step.
- A draft is stored in `sessionStorage`, so a reload in the same tab restores the
  route, step and entered settings.
- Raw source-file contents are not stored. If a reload interrupts LimeSurvey
  group/rating-set selection, the researcher is asked to select the file again.
- The generated participant link and configuration retain the existing schema;
  no participant identity or answer is added to the researcher draft.

## Verification

The post-`rc.4` candidate passes 183 automated tests in 18 files, including 12
representative axe structural scans, plus TypeScript and the production build.
New tests cover the 6/10 route split, step guards, focus movement, browser history
and same-tab draft restoration.

This evidence establishes deterministic workflow behaviour and detectable
structure. It does not establish that the wizard is easier for novice
researchers. That requires the planned formative researcher task.

