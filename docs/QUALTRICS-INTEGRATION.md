# UCL Qualtrics central-collection integration

Prototype: Accessible Questionnaire Platform Version 0.8

## Purpose and boundary

The participant answers the configured questionnaire inside one Qualtrics
Text/Graphic question. On submission, the GitHub Pages child sends one complete
pseudonymous Version 4 record to the exact configured Qualtrics origin. The parent
question validates and stages generic `AQP_*` Embedded Data, acknowledges the same
submission ID, then invokes Qualtrics native navigation. The researcher receives the
record through Qualtrics Data & Analysis.

The bridge supports every registered Version 0.8 definition because it stores
instrument identity, generic item/pair responses, scoring metadata and the lossless
raw record. It does not hard-code NASA dimension fields.

No token, password or database credential is placed in GitHub, the participant URL
or browser storage. A raw GitHub participant link cannot collect centrally.
Participants must receive the activated Qualtrics distribution link.

Use the integration only under the approved ethics, consent, retention and
information-governance plan. The supplied participant code is pseudonymous. Do not
add names, email addresses, diagnoses or highly confidential linked fields without
UCL information-governance approval. The supervisor must see the final frozen
prototype before participant recruitment.

## Installation inputs

The four files are separate copy-and-paste inputs, not files to upload:

| Content | Qualtrics location |
| --- | --- |
| Complete generated question HTML | One Text/Graphic question in HTML/source view |
| `embedded-data-fields.txt` | Embedded Data element near the beginning of Survey Flow; one line per unset field |
| `qualtrics-question.js` | JavaScript editor for the same Text/Graphic question, without `script` tags |
| `end-of-survey-message.txt` | Custom End of Survey message as ordinary text |

`study.html` generates all four labelled blocks for the chosen instrument and
configuration. Use those blocks rather than uploading repository files.

## One-time setup

1. Create a blank UCL Qualtrics survey.
2. Add the approved participant information and consent pages.
3. Put one Text/Graphic question on its own page.
4. Open `study.html`, choose the questionnaire, select UCL Qualtrics collection,
   paste the preview or active survey URL and complete the study fields.
5. Generate the configuration.
6. Open the Text/Graphic question's HTML/source view. Replace the whole body with
   Complete question HTML from the generated package. The static template is not
   usable unchanged because it contains a participant-URL placeholder.
7. Add an Embedded Data element before the questionnaire block. Declare every line
   of `embedded-data-fields.txt`, including `__js_`, and leave the values unset.
8. Replace the question's JavaScript with `qualtrics-question.js`.
9. Configure the custom End of Survey message from
   `end-of-survey-message.txt`. Do not add a redirect. If a Survey Flow End of
   Survey element overrides survey options, configure the same message there.
10. Save and Preview. Publish only after all checks below pass.

The JavaScript uses `setJSEmbeddedData` with names that omit `__js_`; Qualtrics maps
them to the prefixed Survey Flow fields. Do not remove the prefix in Survey Flow.
If custom HTML or JavaScript is unavailable in the UCL tenant, ask the administrator
instead of moving secrets into client code.

## What the editor and Preview should show

The editing canvas may display tokens such as
`${e://Field/__js_AQP_PARTICIPANT_CODE}` literally. That is expected because no
response exists in the editor.

In Preview before submission:

- the recorded-response summary is hidden;
- the configured participant page is visible in the iframe;
- the status states that the response will save to the current Qualtrics response.

If the raw summary is visible, repeat the HTML/source-view step. If the iframe is
blank, regenerate the complete HTML and confirm that the placeholder is absent.

## Handoff and data-loss protection

`setJSEmbeddedData` stages values in the current browser survey session; it does not
make them durable until the Qualtrics page is submitted. Version 0.8 therefore:

1. creates a complete local backup before contacting the parent;
2. sends the result only to the configured HTTPS origin;
3. requires a receipt with the same submission ID;
4. keeps JSON and CSV emergency buttons available;
5. starts native Qualtrics advancement after a 1.5-second technical handoff;
6. restores native navigation after a staging error or a failed-advance watchdog;
7. accepts only an exact-origin reveal request from its own iframe and moves the
   outer Qualtrics viewport to a newly focused error or recovery control.

The 1.5 seconds is not participant reading time. Increasing it enlarges the window
in which a participant can close the tab after seeing an acknowledgement but before
Qualtrics has submitted the page. Durable completion information belongs on the End
of Survey page, which remains visible.

The in-frame acknowledgement means that the parent staged the record, not that a
server-side response is already durable. A local backup is a recovery route, not
evidence of a Qualtrics row.

The conductor generates the persistent End of Survey text from the score-display
policy. It includes the instrument and score only when the conductor selected Show
score to participant. The repository text file contains a placeholder and is not a
ready-to-paste substitute for that generated block.

## Generic fields

The normalized fields include:

- submission, study, participant, timing and prototype identifiers;
- instrument ID, name, version and scoring strategy;
- score name, primary score and defined range;
- item and pair responses;
- configured/final support, support changes and input routes;
- raw JSON chunk count and 24 bounded chunks.

The normalized primary score is stored to two decimals for display and export. The
raw chunks retain the lossless record. Reconstruct it by concatenating
`__js_AQP_RAW_01` through the count in `__js_AQP_RAW_CHUNK_COUNT`.

The recorded-response/PDF view replaces the fresh iframe with a read-only generic
summary whenever `__js_AQP_ACCEPTED = 1`. The raw JSON and CSV export remain the
authoritative record.

## Mandatory synthetic verification

Use non-participant codes such as `TEST-NASA-001` and `TEST-SUS-001`.

### Normal paths

1. Complete a weighted NASA-TLX response through a Qualtrics Preview or anonymous
   distribution link on another browser/device.
2. Confirm automatic advancement and the persistent End of Survey page.
3. In Data & Analysis verify:
   - `__js_AQP_ACCEPTED = 1`;
   - matching submission ID;
   - instrument ID `nasa-tlx-weighted`;
   - six ratings, fifteen pair choices and the weighted score;
   - support configuration, final state and input routes;
   - a reconstructable raw record.
4. Repeat with SUS and verify:
   - instrument ID `system-usability-scale`;
   - ten 1–5 ratings;
   - empty pair responses;
   - the expected alternating SUS score.
5. Open View Response and an individual PDF. Confirm that the blank interactive
   iframe is replaced by the saved instrument, score and response summary.

### Adverse paths

6. Close immediately after the in-frame acknowledgement. Reopen the same configured
   link on the same device, enter the same synthetic code and confirm that the
   completed local backup is discoverable. Check Data & Analysis separately.
7. Disconnect the network at submission. Confirm that the questionnaire remains on
   Review, focuses the error summary and retains retry, answer-editing and backup
   routes. On a phone and tablet, confirm that both the iframe and outer Qualtrics
   viewport reveal the error rather than leaving it above the visible area.
8. Reload midway through a recovery-enabled questionnaire. Confirm that the saved
   session restores the exact next step after the pseudonymous code is re-entered.
   The Resume control must receive focus and expose the saved count and Resume/Erase
   choice to a screen reader. If automatic audio was previously enabled, confirm
   the attempted spoken message and the user-activated replay fallback.
9. Block or fill site storage. Confirm that submission does not crash, backup
   buttons remain available and the page does not claim a stored local copy.
10. Stage an invalid or oversized synthetic record. Confirm that Qualtrics navigation
    is restored and the record is not falsely acknowledged.
11. In a copied synthetic survey, block native advancement. Confirm that the
    six-second watchdog reports failure and restores Next.
12. Test voice input with `not low`, `low or high`, `twenty three`, `73` and two
    factor names. None may become a proposal. Test one consistent lower-ranked
    alternative and confirm that it remains an explicit proposal rather than an
    automatic answer.
13. Delete synthetic rows and local backups if the approved plan requires a clean
    dataset.

Record the survey ID, distribution URL, frozen Git commit, configuration JSON, date,
browser/device and exported rows in the study log.

## Migration warning

Version 0.7 used `__js_ANTLX_*` fields and a Version 3 result. A Version 0.7
Qualtrics question must be replaced with the complete Version 0.8 four-part package.
The change is not retroactive and old responses are not rewritten. See
`MIGRATION-V0.7-V0.8.md`.

## Participant preference policy

Prepared defaults with optional participant choice remains appropriate for a
formative accessibility evaluation:

- the conductor provides a usable starting configuration;
- the participant is not required to configure the instrument;
- permitted adjustments and their timestamps are recorded separately;
- adjustments never enter the instrument's scoring function.

Use Prepared settings only for a controlled measurement comparison when changing
presentation would introduce an uncontrolled condition. The protocol must choose
and justify one policy before recruitment.

## Claim boundary

Passing these checks shows that the software can collect complete cross-device
records. It does not show that the workflow is easier, that an accessibility support
improves outcomes, or that modified presentation is psychometrically equivalent.
Those require an approved evaluation and pre-specified outcomes.

## Platform sources

- [UCL Research Information Governance FAQs](https://www.ucl.ac.uk/advanced-research-computing/platforms-services/information-governance-advisory-service/research-information-governance-faqs)
- [UCL forms and survey tools accessibility guidance](https://www.ucl.ac.uk/isd/services/digital-accessibility-services/creating-accessible-content/forms-and-survey-tools)
- [Qualtrics: Add JavaScript](https://www.qualtrics.com/support/survey-platform/survey-module/question-options/add-javascript/)
- [Qualtrics: Embedded Data](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/standard-elements/embedded-data/)
- [Qualtrics: End of Survey](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/standard-elements/end-of-survey-element/)
- [Qualtrics: Export response data](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/data/download-data/export-data-overview/)
- [Qualtrics: Recorded responses](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/data/recorded-responses/)
