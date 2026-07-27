# Version 0.7 technical risk register

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
| R6 | Spoken landmark language changes a rating's meaning | Visible labels map to 0, 25, 50, 75 and 100; up to five ranked hypotheses may recover one consistent answer; conflicts, negation and invalid values are rejected; confirmation is mandatory | Parser and component regression tests | Microphone test in each supported browser and accent context |
| R7 | The browser speech service is unavailable or transcribes inaccurately | Voice is optional; visible native controls and system voice control remain available; zero/one-hundred endpoint fallbacks are prompted; the chosen transcript and proposed answer are shown and announced before confirmation | Component tests | Record browser/device support, returned alternatives and observed transcripts |
| R8 | A missing Qualtrics iframe hides native navigation and traps the page | The bridge reports the missing iframe and leaves native navigation available; this must fail preflight | Executed bridge test | Confirm the UCL theme does not suppress the status or navigation |
| R9 | Literal Qualtrics piped-text tokens in the editing canvas are mistaken for participant output | Setup guidance distinguishes the editor from Preview and explains the conditional recorded-response summary | Documentation and generated-package checks | Confirm the live preview shows the iframe and a recorded response shows the summary |
| R10 | WebGazer is treated as accurate independent eye control | Gaze is labelled experimental, starts off by default and requires a separate confirmation | Mocked state tests and manual functional checks | Keep the result Partial unless target accuracy is measured with an approved protocol |
| R11 | Keyboard, screen reader, reflow or focus behaves differently inside the Qualtrics iframe | Native controls, focus movement, status regions, exact iframe title and visible-focus styling are implemented | Axe structural scans, interaction tests and calculated focus contrast | NVDA/VoiceOver, 200% zoom, 320 CSS-pixel reflow and mobile UCL-preview tests |
| R12 | Optional wording, smileys or input routes are described as psychometrically equivalent or more accessible without evidence | Official NASA-TLX content and scoring remain authoritative; support use is logged separately; claims are explicitly bounded | Schema/content/scoring tests and public documentation | Approved evaluation with appropriate outcomes and participants |
| R13 | Automatic built-in speech omits feedback or is cut off when Qualtrics replaces the iframe | New questions, Smiley values, selections, proposals, simpler help, recovery, errors and local completion are spoken; successful remote handoff uses a short keep-open phrase and persistent completion content is placed on the End-of-Survey page | Component audio tests and handoff documentation | Manual speech-synthesis test in each browser and the actual UCL Qualtrics iframe |

## Required pre-recruitment decision

Treat an item as resolved only when its remaining gate has an observed result, date,
browser/device, frozen Git commit, Qualtrics survey version and supporting evidence.
Record Pass, Partial, Fail or Not supported. A passing automated test must not be
copied into the dissertation as participant evidence.
