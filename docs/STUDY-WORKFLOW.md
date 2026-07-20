# Version 0.5 study-conductor, participant and data-boundary decision

Decision date: 20 July 2026

## Trigger

Supervisor feedback identified three unresolved questions in Version 0.4:

1. Is the interface for the study conductor or the participant?
2. Why must a participant with an impairment configure the questionnaire before answering?
3. How are the configuration and answers exported and where are answers saved?

The feedback exposed an architecture problem rather than a missing download button. Version 0.4 combined study setup, participant support choices, questionnaire completion and result display in one interface. It saved only opted-in incomplete progress in `localStorage`, removed that progress at submission and displayed the final calculation without a download or host-integration route.

## Decision

Version 0.5 uses two pages backed by one tested source codebase:

- `study.html` is the **study-conductor page**. It records study context, prepares starting support, generates a participant link, exports the configuration and manages results stored in the same browser.
- `index.html` is the **participant page**. It validates and applies the link configuration before answering, asks only for a pseudonymous study code and records the actual support/input routes separately from the NASA-TLX result.

This is role separation, not questionnaire duplication. Both pages import the same instrument, scoring, configuration and result types. The private `accessible-hci-questionnaire-library` repository remains the canonical implementation/evidence source. The public `accessible-nasa-tlx-demo` repository is a generated GitHub Pages deployment and is not a second independently edited codebase.

## Options considered

| Option | Benefit | Critical problem | Decision |
|---|---|---|---|
| Keep one mixed page and add CSV/JSON buttons | Small code change | Does not resolve who configures the study; participant still carries setup and data-handoff burden | Rejected |
| Put conductor and participant applications in separate repositories | Strong visible separation | Duplicates instrument/scoring logic, increases drift and weakens one evidence chain | Rejected |
| Two pages in one canonical codebase, plus a generated public deployment | Clear roles, shared measurement contract, testable configuration and export | Requires explicit local/remote storage boundary | Selected |
| Add a custom public database/API now | Remote collection could be automatic | Expands security, authentication, hosting, data-controller and ethics scope before the study route is approved | Deferred |
| Ask remote participants to download and email results | No backend | Adds an inaccessible participant task and creates uncontrolled copies and transfer risk | Rejected as the normal procedure |

## End-to-end workflow

### Study conductor

1. Enter a non-identifying study ID, participant-facing study title and exact task label.
2. Select starting support. Standard rating presentation is the recommended default; WebGazer is off by default because current accuracy evidence is Partial.
3. Keep participant support changes locked by default. Enable optional changes only when personalisation is part of the approved protocol. This policy affects interface support only; it never unlocks official wording, response values, pairs or scoring.
4. Generate a versioned configuration with a unique configuration ID and creation timestamp.
5. Download the configuration JSON as part of the protocol/freeze package.
6. Give the generated link to the participant. No participant identifier or answer is placed in the link.

### Participant

1. Open the generated link. The configuration is applied before the questionnaire starts.
2. Enter the pseudonymous code supplied by the study conductor; no name or email is requested.
3. Complete six ratings, fifteen comparisons, review and deliberate submission.
4. The same official scoring function calculates ratings, weights, weighted products and weighted score.
5. One versioned record is created, locally saved in same-device mode and emitted through the `nasa-tlx-complete` host event.

### Study conductor after completion

1. Return to `study.html` in the same browser.
2. Check the study ID, participant code, completion time and score in the local result table.
3. Export all records as JSON and CSV.
4. Verify the files and transfer them through the approved data-management route.
5. Only then erase the local browser copy.

## Configuration design

The participant link uses a URL fragment containing Base64URL-encoded UTF-8 JSON. A fragment is appropriate for a static prototype because it is interpreted in the browser and is not part of the resource request to GitHub Pages. It must still contain no identity, secret or answer because it remains visible in browser history and can be shared.

The validated configuration contains:

- schema, prototype and configuration versions;
- study ID, title and task label;
- score-display policy;
- simpler-explanation, rating-presentation, text-size, spoken-guidance and recovery defaults;
- participant-adjustment policy;
- voice and experimental-gaze availability.

The JSON export and participant link represent the same configuration ID. Re-importing the JSON regenerates the same link and supports a reproducible prototype freeze.

## Participant autonomy and study control

Preconfiguration removes an avoidable setup task, but completely removing personal adjustment can also create barriers. W3C cognitive-accessibility guidance treats different user needs and personalisation as important beyond minimum WCAG conformance. Version 0.5 therefore separates two decisions:

- the conductor defines the starting study condition and whether experimental routes are available;
- participant changes are locked by default, while a protocol can explicitly allow optional changes after opening; the final state and actual input route are recorded.

This does not solve the possible psychometric effect of simpler explanations or smiley presentation. If a study compares NASA-TLX scores, measurement-adjacent support should be fixed or analysed as a prespecified condition. If the study evaluates technical implementation routes, optional changes can be allowed but must not be treated as evidence that one interface suits every impairment.

## Result record

JSON is the authoritative, lossless record. CSV is a flattened analysis/export representation. They are outputs, not the researcher/participant role split.

| Area | Fields |
|---|---|
| Identity boundary | pseudonymous participant code only; no name or email |
| Study provenance | study ID, configuration ID, title, task label |
| Timing | questionnaire start and completion timestamps |
| Version provenance | schema and prototype version, submission ID |
| Official answers | six ratings and fifteen pairwise choices |
| Presentation provenance | actual randomized pair presentation order |
| Calculation | six weights, six weighted ratings and weighted score |
| Configured support | complete starting support policy |
| Actual support | final simpler-language, answer-mode, text, audio and recovery state |
| Actual input routes | per-rating and per-pair route, gaze use/count and read-aloud use |

Support metadata is never entered into the NASA-TLX calculation. Recording configuration and actual use allows route analysis without changing the workload construct.

## Saving and export boundary

GitHub documents Pages as a static hosting service for HTML, CSS and JavaScript. It does not provide the authenticated research-data service required for central participant records. Version 0.5 therefore has two explicit modes:

### Implemented local same-device mode

- incomplete progress is namespaced by configuration ID and participant code;
- completion first creates and saves the full record, then removes incomplete progress;
- completed records remain in same-origin browser storage until conductor export/erasure;
- JSON and CSV backup downloads are available;
- storage failure is shown explicitly rather than presenting a false success.

This mode supports technical demonstration and a researcher-controlled same-device procedure. It is vulnerable to browser-data clearing, device loss and same-origin access and is not described as secure long-term research storage.

### Remote participant mode

Remote devices do not share browser storage with the conductor. The participant must not be made responsible for routine result transfer. The `nasa-tlx-complete` event exposes the exact versioned record to an approved host adapter. UCL's current information-governance guidance identifies Qualtrics for information that is not highly confidential and REDCap/Data Safe Haven routes for higher-confidentiality work. The final platform depends on the approved data classification, procedure and ethics/data-management documents.

No API key or arbitrary upload URL is embedded in the participant link. Client-side secrets would not be secret, and an unrestricted destination would permit answer exfiltration.

## Privacy and governance reasoning

The design follows data minimisation and pseudonymisation principles:

- collect only a study-issued code in the questionnaire;
- keep any code-to-identity list outside this prototype and separate from responses;
- do not place names, emails, disability labels or answers in the URL;
- record support use because it is analytically relevant, while recognising that it may itself reveal disability-related information and therefore needs the approved protection level;
- make retention and deletion an explicit conductor action after verified export.

Pseudonymised data remains personal data when it can be linked through separate information. Local saving and a technical export do not themselves constitute ethics approval or an adequate data-management plan.

## Repository decision

### Canonical private repository: `accessible-hci-questionnaire-library`

Keep:

- TypeScript source, tests and build scripts;
- measurement and configuration contracts;
- Version 1 and earlier Version 2 evidence;
- decisions, limitations, evaluation and dissertation traceability;
- archived Version 0.2–0.4 demonstrations.

All implementation changes start and pass tests here.

### Public deployment repository: `accessible-nasa-tlx-demo`

Publish:

- production participant page;
- production study-conductor page;
- hashed JavaScript/CSS assets;
- public README, testing instructions and build provenance.

Do not manually develop a divergent copy here. The stable public URL already supplied to the supervisor is preserved.

## Verification added

Version 0.5 adds automated checks for:

- UTF-8 configuration encode/decode and exact-link regeneration;
- invalid study identifiers;
- complete local record saving and duplicate submission protection;
- stable CSV columns for ratings, weights, pairs and routes;
- configured participant-code gate and locked support;
- conductor guidance, separate participant-link generation and locked-by-default support;
- first-request spoken summary without an unnecessary speech-queue cancellation;
- configured task wording in the participant introduction summary;
- complete-answer local saving and host-event emission;
- hidden participant score policy;
- structural axe scans of the study-conductor page;
- Version 0.5 standalone syntax and boot.

At this decision point, 47 tests across ten files and both production builds pass. The clean-clone standalone build now creates its output directory when absent. Manual browser, keyboard, screen-reader, reflow, contrast, cross-device and storage-clearance checks remain necessary before a freeze.

## Authoritative external guidance used

- [GitHub Pages is static site hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
- [UCL Research Information Governance FAQ: Qualtrics and REDCap/Data Safe Haven routes](https://www.ucl.ac.uk/advanced-research-computing/platforms-services/information-governance-advisory-service/research-information-governance-faqs).
- [UCL data storage guidance](https://library-guides.ucl.ac.uk/research-data-management/data-storage-ucl).
- [UCL responsibilities after ethical approval and amendment route](https://www.ucl.ac.uk/research-innovation-services/compliance-and-assurance/research-ethics-service/responsibilities-after-ethical-approval).
- [ICO data protection by design and by default](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/).
- [ICO pseudonymisation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/).
- [W3C Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/).

## Claim boundary

Version 0.5 demonstrates role separation, reproducible configuration, complete result construction, same-device saving/export and a host-integration contract. It does not demonstrate secure remote collection, approved research-data governance, participant usability, accessibility for a disability group, psychometric equivalence or improved comprehension. Participant involvement remains gated by supervisor review of the frozen prototype and the applicable ethics/data-protection route.
