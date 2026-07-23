# Remote collection and participant-permission decision

Decision date: 23 July 2026  
Prototype: Accessible NASA-TLX Version 0.6 final-candidate

## Decision summary

Two independent problems must not be collapsed:

1. A static participant page needs an approved study platform to store results from different devices.
2. A prepared questionnaire must not require a participant with an impairment to configure the study condition, while optional personal preferences must not be removed without reason.

Version 0.6 therefore implements:

- a host-owned result-sink contract with an idempotent submission ID, positive receipt, retry-safe failure state and no client-side secret;
- prepared settings as the default;
- a conductor-selected `locked` or `presentation-only` participant policy;
- fixed simpler-explanation and standard/smiley presentation settings in every configured study;
- optional participant control of text size, automatic spoken guidance and interruption recovery only when the approved protocol permits it;
- conductor-controlled availability of voice and experimental gaze, with the participant choosing among permitted answer routes during completion.

## Why GitHub Pages cannot centrally collect results

GitHub describes Pages as static hosting for repository HTML, CSS and JavaScript. Browser `localStorage` is isolated by origin and browser profile; it is not synchronised between a participant's device and a conductor's device. Adding a public database URL or API credential to the participant code would introduce an uncontrolled data destination and would expose any client-side secret.

The questionnaire therefore does not claim that the raw GitHub Pages link is a research database. Local saving remains an explicit technical-demonstration and same-device route.

## Approved-host result contract

An approved host page can install the following runtime object before submission:

```ts
window.accessibleNasaTlxResultSink = {
  name: 'Approved study platform',
  async submit(record) {
    const receipt = await saveThroughApprovedPlatform(record);
    return {
      accepted: true,
      submissionId: record.submissionId,
      receiptId: receipt.id,
    };
  },
};
```

The concrete `saveThroughApprovedPlatform` implementation belongs to the selected UCL data-collection platform. It must not place a Qualtrics, REDCap or other service credential in the public browser bundle.

The questionnaire:

1. creates one versioned record and stable submission ID;
2. calls the host sink only when the host explicitly installed it;
3. accepts completion only when the receipt contains the same submission ID;
4. avoids a second local completed-record copy after a confirmed host save;
5. retains the record on the review page when the host rejects, times out or returns an invalid receipt;
6. permits a retry with the same submission ID so the host can de-duplicate it;
7. still emits the versioned `nasa-tlx-complete` event after confirmed completion.

This contract is implemented in `source/src/result-sink.ts` and covered by unit and component tests. It is provider-neutral because the approved platform has not yet been selected.

## Platform activation boundary

UCL's Research Information Governance FAQ states that staff and students can use Qualtrics for information that is not highly confidential, while highly confidential information should use REDCap in the Data Safe Haven. The final choice depends on the actual fields, linkage, recruitment method, disability-related data and approved data-management plan.

Before remote recruitment, the study needs:

- supervisor confirmation of the platform and whether support-route metadata is treated as disability-related or special-category data;
- the required ethics approval and data-protection registration;
- an approved participant information sheet, consent flow, retention period and withdrawal procedure;
- a platform-side result adapter that validates the Version 0.6 record and returns a receipt;
- an end-to-end test from a second device into the researcher's restricted account;
- a frozen commit, configuration JSON and test record retained with the protocol.

Until those conditions are met, a remote GitHub completion is deliberately described as local rather than falsely reported as centrally collected.

## Permission options considered

| Option | Benefit | Main risk | Decision |
|---|---|---|---|
| Participant can change every support setting | Maximum apparent flexibility | Makes the participant configure the instrument; can alter wording support and response presentation after condition assignment | Rejected for configured studies |
| Conductor locks every support and interaction preference | Strong condition consistency | Can prevent an individual from changing benign presentation preferences needed to complete the task | Available as the default policy |
| Conductor fixes measurement-adjacent support; optional presentation-only personalisation | Preserves a reproducible study condition while retaining limited autonomy | Protocol must state which preferences are allowed and analysis must record actual use | Selected optional policy |

### Fixed by the conductor

- official wording, six factors, values, anchors, pairs and scoring;
- whether simpler explanations are shown;
- standard or experimental smiley rating presentation;
- whether built-in voice and experimental gaze routes are available;
- whether the score is shown to the participant.

Simpler explanations and smileys are fixed because they can influence interpretation or the response interface. They should be prespecified as a condition rather than changed ad hoc by a participant during the study.

### Optionally adjustable by the participant

- standard or large text;
- automatic spoken guidance;
- interruption recovery.

These controls change presentation or continuity without replacing official response values or scoring. They are still preconfigured by the conductor, so no adjustment is required. The conductor can leave the policy locked when strict control is necessary.

### Chosen during answering

- visible buttons and keyboard;
- built-in confirmed voice when available;
- experimental gaze when available.

These are input routes, not questionnaire-configuration duties. The actual route is recorded independently for each answer.

## Claim boundary

Version 0.6 demonstrates a tested storage boundary, provider-neutral host contract and reproducible permission policy. It does not demonstrate that Qualtrics or REDCap integration has been activated, that remote data governance has been approved, or that the interface is more accessible for a disability group. Those claims require the selected platform, approved study documents and participant evidence.

## Authoritative sources

- [GitHub: What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [UCL Research Information Governance FAQs](https://www.ucl.ac.uk/advanced-research-computing/platforms-services/information-governance-advisory-service/research-information-governance-faqs)
- [UCL: Do I need ethical approval?](https://www.ucl.ac.uk/research-innovation-services/compliance-and-assurance/research-ethics-service/do-i-need-ethical-approval)
- [UCL student ethics guidance: data storage and access](https://www.ucl.ac.uk/ioe/research/research-ethics/ethics-applications-ioe-students/student-ethics-application-guidance)
- [W3C WAI: Involving Users in Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/involving-users/)
