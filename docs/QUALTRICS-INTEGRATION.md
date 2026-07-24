# UCL Qualtrics central-collection integration

Prototype: Accessible NASA-TLX Version 0.7 release candidate

## What this integration changes

The participant still answers the Accessible NASA-TLX interface hosted on GitHub Pages. The interface is placed inside one Qualtrics question. On submission, the child page sends the complete pseudonymous record to that exact Qualtrics origin with `window.postMessage`. The Qualtrics question stores the record as Embedded Data, acknowledges the same submission ID and advances the survey. The researcher then receives the response centrally in Qualtrics Data & Analysis.

No Qualtrics API token, password or database credential is placed in GitHub, the participant link or browser storage. A raw GitHub participant link cannot collect centrally; participants must receive the activated Qualtrics distribution link.

## Data-governance decision before setup

Use UCL Qualtrics only when the approved fields are not highly confidential. The supplied workflow uses a pseudonymous participant code and does not request a name, email address or diagnosis. Disable IP-address recording unless the approved protocol requires it. If recruitment identifiers, disability diagnoses or other highly confidential data will be linked in the same system, stop and obtain UCL information-governance advice; REDCap in the Data Safe Haven may be required.

The supervisor must review the final prototype before any participant data are collected.

## One-time Qualtrics setup

1. Sign in through the UCL Qualtrics route and create a blank survey.
2. Add the participant information and consent pages required by the approved protocol.
3. Add one Text/Graphic question on its own page for the Accessible NASA-TLX.
4. Open the study-conductor page and select **UCL Qualtrics central collection**.
5. Paste the active or preview Qualtrics URL, complete the study settings and generate the configuration.
6. In the Qualtrics question's HTML view, paste the generated iframe HTML. The static template is also in [`integrations/qualtrics/question-html-template.html`](../integrations/qualtrics/question-html-template.html).
7. Add an Embedded Data element near the start of Survey Flow. Declare every field in [`integrations/qualtrics/embedded-data-fields.txt`](../integrations/qualtrics/embedded-data-fields.txt), including the `__js_` prefix, and leave the values unset. The JavaScript deliberately passes names without that prefix to `setJSEmbeddedData`; Qualtrics maps those calls to the prefixed Survey Flow fields.
8. Open the question's JavaScript editor and replace its contents with [`integrations/qualtrics/qualtrics-question.js`](../integrations/qualtrics/qualtrics-question.js).
9. At the bottom of the Survey editor, open **End of Survey**. Under **Messaging**,
   select **Custom**, create a message and paste the ordinary text from
   [`integrations/qualtrics/end-of-survey-message.txt`](../integrations/qualtrics/end-of-survey-message.txt)
   into the message box. The template contains no HTML. Select that saved message
   and do not configure a redirect.
   If Survey Flow contains a separate End of Survey element that overrides the survey
   options, apply the same custom message there instead.
10. Publish the survey only after the checks below pass.

The UCL Qualtrics licence must permit custom JavaScript and HTML. If either control is unavailable, ask the UCL Qualtrics administrator rather than moving a token or confidential value into client code.

## Mandatory synthetic end-to-end check

Use a non-participant code such as `TEST-001`.

1. Open the Qualtrics preview or anonymous distribution link in a different browser or device.
2. Complete all six ratings and fifteen comparisons.
3. Confirm that the participant page displays the calculated result without
   requiring another button press, remains visible for approximately five minutes
   and then advances automatically.
4. Confirm that the final page:
   - shows the current participant's score with two decimal places and `/100`;
   - states that the response has been recorded;
   - remains visible until the participant closes the page.
5. In Data & Analysis, verify one response with:
   - `__js_ANTLX_ACCEPTED = 1`;
   - the same `__js_ANTLX_SUBMISSION_ID` across the exported row;
   - six ratings and six weights;
   - fifteen pair choices in `__js_ANTLX_PAIR_CHOICES_JSON`;
   - the expected participant code and weighted score;
   - the configured support, final support state and support-change count.
6. Export the response and reconstruct the lossless JSON by concatenating `__js_ANTLX_RAW_01` through the number in `__js_ANTLX_RAW_CHUNK_COUNT`.
7. Retry once with the network interrupted at submission. The questionnaire must remain on Review and allow retry instead of reporting a false completion.
8. Delete the synthetic response before recruitment if the approved plan requires a clean dataset.

Record the survey ID, activated distribution URL, frozen Git commit, configuration JSON, test date, browser/device and exported synthetic row in the study log.

After the embedded prototype validates the record and calculates the score, the
Qualtrics navigation button remains hidden. The participant has no additional
completion action. The result stays visible for five minutes and the page then
advances automatically to the custom End of Survey confirmation.

The receipt displayed inside the embedded prototype means that the parent Qualtrics
page has acknowledged and staged the record. The response becomes a completed
Qualtrics record when the five-minute timer advances the page. Closing the browser
during that review period can leave the response incomplete. The custom End of Survey
message is therefore the authoritative final confirmation: it appears after completion,
repeats the score and remains visible until the participant closes the page.

The normalized `__js_ANTLX_WEIGHTED_SCORE` field is stored to two decimal places for
participant display and convenient export. The lossless raw JSON chunks retain the
unrounded numeric result.

Existing responses and old unprefixed fields are not populated retroactively. After
changing the Survey Flow, publish it and create a new synthetic response. If an export
must use headings without `__js_`, either rename the columns after export or add a
second Embedded Data element after the NASA-TLX block that pipes each prefixed value
into a separate unprefixed field.

## Participant preference policy

For this project's formative accessibility evaluation, the recommended setting is **Prepared defaults with optional participant choice**:

- the conductor supplies usable defaults, so no participant must configure the questionnaire;
- the participant may change simpler explanations, standard/smiley presentation, text size, automatic audio or recovery if helpful;
- each change records the setting, old value, new value, questionnaire stage and timestamp;
- input routes are recorded per answer;
- official NASA-TLX dimensions, anchors, values, pairs and scoring never change.

This decision follows W3C cognitive-accessibility guidance that supports user-selected presentation preferences while requiring a readable default. It is an evaluation design choice, not evidence that every option improves accessibility.

Use **Prepared settings only** for a controlled measurement comparison. Changing wording support or answer presentation during a controlled condition can introduce an uncontrolled source of variation. The protocol must state which policy is used and why.

## Claim boundary

Passing this integration test establishes that the implementation can collect complete cross-device records through Qualtrics. It does not establish that the prototype is more accessible. That claim requires an approved evaluation with relevant participants and appropriate accessibility outcomes.

## Authoritative platform sources

- [UCL Research Information Governance FAQs](https://www.ucl.ac.uk/advanced-research-computing/platforms-services/information-governance-advisory-service/research-information-governance-faqs)
- [UCL forms and survey tools accessibility guidance](https://www.ucl.ac.uk/isd/services/digital-accessibility-services/creating-accessible-content/forms-and-survey-tools)
- [W3C: Support adaptation and personalization](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o8-personalization/)
- [W3C: Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/)
- [Qualtrics: Add JavaScript](https://www.qualtrics.com/support/survey-platform/survey-module/question-options/add-javascript/)
- [Qualtrics: Embedded Data](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/standard-elements/embedded-data/)
- [Qualtrics: Editing the End of the Survey](https://www.qualtrics.com/support/survey-platform/survey-module/survey-options/survey-termination/)
- [Qualtrics: Piped Text](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/piped-text/piped-text-overview/)
- [Qualtrics: Export response data](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/data/download-data/export-data-overview/)
