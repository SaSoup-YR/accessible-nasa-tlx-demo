# Version 0.8 technical risk register

Review date: 27 July 2026

## Status and claim boundary

This register separates software correctness from accessibility evidence. Automated
tests can establish deterministic state, scoring, validation and recovery behaviour in
the tested implementation. They cannot establish browser speech-recognition accuracy,
WebGazer accuracy, assistive-technology usability, psychometric equivalence or benefit
for people with impairments.

The current build is a release candidate. Recruitment remains blocked until the
supervisor reviews the re-tested prototype, the actual UCL Qualtrics survey records and
exports a complete synthetic response, and the approved protocol and data-management
route are in place.

## Current risks and controls

| ID | Risk and consequence | Current control | Evidence now | Remaining gate |
| --- | --- | --- | --- | --- |
| R1 | The four Qualtrics integration inputs are pasted into the wrong locations, producing a blank iframe or visible template tokens | The conductor generates four labelled, copyable installation blocks and rejects an unchanged placeholder URL | Component and template tests | Install in the UCL tenant from a blank survey and repeat the guide cold |
| R2 | A parent acknowledgement is mistaken for a server-recorded Qualtrics response | The interface distinguishes local backup, parent acknowledgement and recorded response; final wording is on the submitted End-of-Survey page | State and bridge tests | Observe and export one synthetic Data & Analysis row |
| R3 | The tab is closed after acknowledgement but before Qualtrics navigation completes | A complete local backup is attempted before host contact and remains discoverable on the same device | Component close/reopen test | Close immediately in the UCL survey and check the remote row separately |
| R4 | Network or parent failure loses answers or creates false completion | Failure returns to Review with focused error, retry, edit and JSON/CSV routes | Rejected-host and timeout tests | Interrupt the real network during a UCL preview run |
| R5 | Browser storage is blocked or full | Submission remains available in memory; no false local-save claim; downloads stay visible | Storage unit and component tests | Repeat in browser privacy/storage-restricted modes |
| R6 | Spoken landmark language changes a rating's meaning | Visible labels map to 0, 25, 50, 75 and 100; up to five ranked hypotheses may recover one consistent answer; exact `lo`/`hi`/`pour` homophones are bounded aliases; conflicts, negation and invalid values are rejected; confirmation is mandatory | Parser and component regression tests | Microphone test in each supported browser and accent context |
| R7 | The browser speech service is unavailable or transcribes inaccurately | Voice is optional; visible native controls and system voice control remain available; the prompt prioritises five numeric values; the chosen transcript and proposed answer are shown and announced before confirmation | Component tests | Record browser/device support, returned alternatives and observed transcripts |
| R8 | A missing Qualtrics iframe hides native navigation and traps the page | The bridge reports the missing iframe and leaves native navigation available; this must fail preflight | Executed bridge test | Confirm the UCL theme does not suppress the status or navigation |
| R9 | Literal Qualtrics piped-text tokens in the editing canvas are mistaken for participant output | Setup guidance distinguishes the editor from Preview and explains the conditional recorded-response summary | Documentation and generated-package checks | Confirm the live preview shows the iframe and a recorded response shows the summary |
| R10 | WebGazer is treated as accurate independent eye control | Gaze is labelled experimental, starts off by default and requires a separate confirmation | Mocked state tests and manual functional checks | Keep the result Partial unless target accuracy is measured with an approved protocol |
| R11 | Keyboard, screen reader, reflow, selection or focus behaves differently inside the Qualtrics iframe | Native controls, focus movement, status regions and exact iframe title are implemented; selected states persist with a check/label; control, selected, focus and gaze indicators use calculated ≥3:1 authored contrast; exact-origin reveal messages move the outer Qualtrics viewport for errors/recovery | Axe structural scans, interaction tests, parent-reveal bridge test and calculated contrast audit | NVDA/VoiceOver, forced colours, 200% zoom, 320 CSS-pixel reflow and mobile UCL-preview tests |
| R12 | Optional wording, smileys or input routes are described as psychometrically equivalent or more accessible without evidence | Definition capability gates preserve official items/scoring; support use is logged separately; SUS disables unsupported wording/smileys; claims are explicitly bounded | Definition/content/scoring tests and public documentation | Approved evaluation with appropriate outcomes and participants |
| R13 | Automatic built-in speech omits feedback or is cut off when Qualtrics replaces the iframe | New questions, Smiley values, selections, proposals, simpler help, recovery, errors and local completion are spoken; successful remote handoff uses a short automatic-finish phrase and persistent completion content is placed on the End-of-Survey page | Component audio tests and handoff documentation | Manual speech-synthesis test in each browser and the actual UCL Qualtrics iframe |
| R14 | Built-in speech sounds different or poor on a particular device | The application requests English at neutral rate/pitch/volume and no longer forces the first returned voice; external screen readers and visible text remain independent routes | Unit check that no enumerated voice is forced | Record the actual system voice, quality and volume on every supported device |
| R15 | Re-entering a participant code after a reload increases memory and task burden, or retaining it creates a shared-device privacy risk | When recovery is enabled, a valid pseudonymous code is held only in tab-scoped session storage; same-tab reload restores the code and focuses the Resume action, whose description includes saved count and choices; long-term local participant-code storage is not used | Component reload, focus, accessible-description and speech-route tests | Re-test browser session restore, iOS speech policy, shared-device procedure and participant wording |
| R16 | Questionnaire-independent is misreported as support for any questionnaire | Public scope lists only the integer single-choice profile, optional all-pairs stage and approved scorers; unsupported fields/types fail closed | Architecture document, JSON Schema and semantic rejection tests | Keep the dissertation and participant materials within the same claim boundary |
| R17 | A definition selects a scorer that does not match its items or scale | JSON cannot contain executable code; scorer names are allowlisted; NASA and SUS have instrument-specific semantic compatibility checks | Definition and scorer regression tests | Review every future scorer and source before registration |
| R18 | The participant runner supports a second instrument but Qualtrics silently stores only NASA fields | Version 0.8 uses generic `AQP_*` identity, answer, score, support and raw-record fields | Executed bridge test for generic fields | Observe/export both NASA and SUS rows in the UCL tenant |
| R19 | A Version 0.7 Qualtrics survey is reused with a Version 0.8 participant link, or blank new columns are mistaken for deleted old data | Migration guide requires replacement of all four integration inputs; Version 4/`AQP_*` records fail closed against old setup; the conductor explains that old rows remain under `ANTLX_*` and are not backfilled | Migration documentation, conductor warning and schema checks | Create a new/copy UCL survey, export and verify old fields, and archive the exact configuration |
| R20 | The child sends its first height before Qualtrics `addOnReady` installs the parent listener, leaving an inner scrollbar and no visible connection evidence | Two-way ready handshake, bounded retries, mutation/resize observers, a non-scrolling iframe and an eight-second visible connection failure path | Child/parent bridge regression tests and generated-template checks | Confirm one-scroll reflow and connected status in UCL Preview on desktop, phone and tablet |

## Required pre-recruitment decision

Treat an item as resolved only when its remaining gate has an observed result, date,
browser/device, frozen Git commit, Qualtrics survey version and supporting evidence.
Record Pass, Partial, Fail or Not supported. A passing automated test must not be
copied into the dissertation as participant evidence.
