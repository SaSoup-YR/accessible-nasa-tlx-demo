# Version 0.7 to Version 0.8 migration

Version 0.8 changes the result and Qualtrics schemas because the runner now records
the selected questionnaire definition.

## Preserved behavior

- Version 0.7 study links are decoded as weighted NASA-TLX configurations.
- The legacy `<accessible-nasa-tlx>` element and completion event remain available.
- The supervisor-reviewed local-first backup, exact-origin receipt, short Qualtrics
  handoff and failed-navigation recovery logic are retained.
- `source/demo/accessible-nasa-tlx-v0.7.html` remains as the frozen baseline.

## Required Qualtrics change

An existing Version 0.7 Qualtrics question must not be reused unchanged. Version
0.8 uses generic `__js_AQP_*` fields and Version 4 result records.

This does not delete or rename a recorded Version 0.7 value. Existing rows keep
their `__js_ANTLX_*` values. Because those rows pre-date the Version 0.8 fields,
their new `__js_AQP_*` cells are expected to be blank. Use Qualtrics Column chooser
or a full data export to inspect the old `__js_ANTLX_*` columns, and keep those
fields until the old rows have been exported and verified.

Generate a new installation package from `study.html`, then replace:

1. the Text/Graphic question HTML;
2. the Embedded Data manifest;
3. the question JavaScript;
4. the End of Survey message.

Run the synthetic and adverse tests in `QUALTRICS-INTEGRATION.md` before recruitment.
The migration deliberately fails closed rather than writing Version 4 records into
unverified Version 0.7 fields.

For the first migration test, copy the survey and use only synthetic responses.
Confirm that the question status says the iframe is connected, that only the outer
Qualtrics page scrolls, and that one completed row has `__js_AQP_ACCEPTED = 1`.

## Removed current-tree files

Standalone Version 0.5 and 0.6 files were removed from the active tree because Git
history preserves them and multiple runnable candidates caused ambiguity. No
implementation evidence was erased from repository history. Version 0.7 is retained
as the direct supervisor baseline.
