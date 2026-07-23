# Remote collection and participant-permission decision

Decision date: 23 July 2026  
Prototype: Accessible NASA-TLX Version 0.7 release candidate

## Decision

Version 0.7 selects UCL Qualtrics as the default remote collection route for a pseudonymous study that does not collect highly confidential data. REDCap in the Data Safe Haven remains the required alternative if the approved protocol links identities, diagnoses or other highly confidential information.

This is not a generic upload endpoint. The participant page is embedded inside one Qualtrics response and sends the complete record only to the exact HTTPS Qualtrics origin saved by the conductor. The Qualtrics page validates the GitHub origin, stores analysis fields and a lossless chunked JSON record, returns a receipt for the same submission ID and advances the survey. A failed receipt keeps the participant on Review for retry.

The selected participant policy for a formative accessibility evaluation is **prepared defaults with optional participant choice**:

- the conductor supplies a complete and usable starting configuration;
- no participant must discover or configure support before answering;
- the participant may voluntarily change optional support if it helps;
- every change and every answer route is exported separately from the NASA-TLX calculation;
- a controlled study can instead lock all settings or allow presentation-only preferences.

## Why Qualtrics is preferred here

UCL's Research Information Governance FAQ allows staff and students to use Qualtrics for information that is not highly confidential and directs highly confidential information to REDCap in the Data Safe Haven. UCL's accessibility guidance states that a Qualtrics survey can be created to be accessible and has an accessibility checker, while noting that REDCap has many accessibility issues.

The prototype requests a study-issued pseudonymous code and does not request a name, email address or diagnosis. This supports, but does not determine, the Qualtrics route. The final classification must include recruitment, linkage, consent and support-use metadata. Even pseudonymised data remains personal data when a separate re-identification key exists.

## Options compared

| Option | Benefit | Critical limitation | Decision |
| --- | --- | --- | --- |
| Participant downloads and sends JSON | No platform integration | Creates an additional participant task, uncontrolled copies and avoidable transfer errors | Rejected as the normal route |
| Public database endpoint in GitHub code | Immediate central storage | Exposes destination/credentials and creates an unapproved data service | Rejected |
| REDCap client API call | Central research platform | A browser cannot safely hold a REDCap API token; UCL also reports accessibility limitations | Retain only through an approved server-side/DSH workflow |
| Qualtrics iframe plus parent bridge | Central UCL account, no client secret, participant remains in one survey | Requires UCL custom JavaScript/HTML permission and a verified survey setup | Selected |

## Receipt and failure semantics

One stable `submissionId` is created when the participant first submits. Qualtrics accepts fields into the current response and returns `qualtrics-accepted-{submissionId}`. The participant page completes only for a receipt containing the same ID. Timeout, origin mismatch, invalid record or Qualtrics rejection returns the participant to Review with the answers retained. Repeating Submit reuses the same ID, allowing the host to identify duplicates.

The bridge receipt is acceptance into the active Qualtrics response, not independent proof of long-term server retention. Before recruitment, the researcher must complete a synthetic response from another device and confirm that the row appears in Data & Analysis and exports correctly.

## Participant adjustment policy

### Why optional choice is not the same as making the participant configure the study

The conductor chooses and distributes complete defaults. The Start control remains available without opening the optional preferences. A participant who needs no change does nothing. A participant who discovers a barrier may change support before or during completion.

This distinction resolves two competing risks:

- requiring adjustment shifts implementation work to the person encountering the barrier;
- prohibiting benign adjustment can preserve an avoidable barrier and prevents the study from observing which support is actually selected.

W3C cognitive-accessibility guidance supports personalization while requiring the default presentation to remain usable. It also stresses that needs vary: a presentation that helps one cognitive profile can obstruct another. This supports prepared defaults plus voluntary choice; it does not support making configuration a prerequisite.

For the formative accessibility study, the second risk is more important because the research objective includes support usefulness and preference. For a controlled comparison of NASA-TLX scores, the answer presentation and wording support should be locked because changing them can introduce an uncontrolled source of variation. Text size, audio and recovery may remain adjustable only if the protocol defines them as non-instrument presentation preferences.

### Recorded provenance

The complete result contains:

- the conductor's starting configuration;
- final simpler-language, answer-mode, text, audio and recovery state;
- a chronological change log with setting, before/after value, questionnaire stage and timestamp;
- the input route for every rating and pair;
- read-aloud, interruption summary and gaze-use metadata.

These values support process analysis and fidelity checks. They do not prove why a participant made a change or that the change improved accessibility.

## Security and privacy controls

- exact-origin `postMessage` in both directions;
- exact iframe source-window check in the Qualtrics parent;
- no names, emails, answers, API tokens or passwords in the participant URL;
- no wildcard message destination;
- one accepted submission ID per Qualtrics page;
- raw JSON split into 900-character fields with a fixed maximum;
- local fallback only when the conductor explicitly selects local mode;
- IP recording disabled unless the approved protocol requires it;
- participant code-to-identity mapping kept outside this prototype.

## Activation gate

Before any participant data collection:

1. obtain supervisor review of this frozen prototype;
2. confirm ethics and information-governance requirements;
3. create the UCL Qualtrics survey and install [`QUALTRICS-INTEGRATION.md`](QUALTRICS-INTEGRATION.md);
4. complete and export a synthetic cross-device response;
5. freeze the Git commit, configuration JSON, survey version and test evidence;
6. define access, retention, withdrawal and deletion procedures.

## Claim boundary

Version 0.7 implements a testable cross-device collection architecture and auditable support-choice policy. The feature strengthens implementation readiness, reproducibility and alignment with the supervisor's export/saving question. It does not itself demonstrate that the questionnaire is more accessible. A claim of improved accessibility requires relevant participants, defined outcomes and analysis.

## Authoritative sources

- [UCL Research Information Governance FAQs](https://www.ucl.ac.uk/advanced-research-computing/platforms-services/information-governance-advisory-service/research-information-governance-faqs)
- [UCL forms and survey tools accessibility guidance](https://www.ucl.ac.uk/isd/services/digital-accessibility-services/creating-accessible-content/forms-and-survey-tools)
- [W3C: Support adaptation and personalization](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o8-personalization/)
- [W3C: Support a personalized and familiar interface](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o8p04-interface/)
- [W3C: Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/)
- [Qualtrics: Add JavaScript](https://www.qualtrics.com/support/survey-platform/survey-module/question-options/add-javascript/)
- [Qualtrics: Embedded Data](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/standard-elements/embedded-data/)
- [Qualtrics: Export response data](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/data/download-data/export-data-overview/)
- [ICO: Data protection by design and by default](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/)
