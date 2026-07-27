# Failure and recovery verification

Prototype: Accessible NASA-TLX Version 0.7 release candidate

## Purpose and claim boundary

These checks test whether foreseeable failures remain detectable and recoverable. They
do not prove that Qualtrics has stored a response, that the interface is accessible to
a disability group, or that participant data are safe to collect. A recorded
Qualtrics row must be verified in Data & Analysis, and participant recruitment remains
blocked until the supervisor approves the frozen prototype and protocol.

The submission states are deliberately separated:

1. **Prepared locally** — a complete record exists in browser storage or remains
   available in memory for JSON/CSV export.
2. **Acknowledged by the parent** — Qualtrics has staged Embedded Data in its current
   browser session.
3. **Recorded remotely** — Qualtrics has submitted the page and a response row can be
   inspected and exported.

Only the third state supports a claim of central collection. The 1.5-second handoff is
a short technical interval, not participant reading time. Reading and final
confirmation belong on the persistent End-of-Survey page.

## Adverse-path matrix

| Case | Action with synthetic data | Required observable outcome | Automated evidence | Manual evidence still required |
| --- | --- | --- | --- | --- |
| Close after acknowledgement | Close the result page immediately, reopen the same configured link on the same device and enter the same code | A completed backup is discoverable and downloadable; wording states that it does not prove remote recording | Component test verifies backup creation before host submission and post-close discovery | Check separately whether a Qualtrics row exists |
| Network interruption | Disconnect immediately before Calculate and submit | Focus moves to the error summary; Review, retry, answer editing and JSON/CSV remain available | Rejected-host component test | Real UCL Qualtrics/browser run |
| Mid-questionnaire reload | Enable recovery, answer at least one item and reload | Saved-session offer reports the exact completed count and next step | Component reload/recreation test | Screen-reader announcement and browser-specific storage behaviour |
| Storage blocked or full | Block site storage or simulate quota exhaustion before submission | No crash or false local-save claim; in-memory JSON/CSV remain available; any existing progress copy is not deliberately cleared | Storage unit and component tests | Browser privacy mode and quota test |
| Parent staging failure | Send an invalid or oversized synthetic record | Qualtrics navigation is restored and an error receipt is returned | Executed bridge test | Qualtrics editor and survey-theme interaction |
| Return after failed save | After host failure, return and edit an answer | The stale completed backup is removed; a retry must be recalculated from the edited answer | Component and storage tests | End-to-end exported-row comparison |
| Negated speech | Say `not low` or `not good` | No proposal and no selected answer | Parser and component tests | Browser recognition accuracy with microphone |
| Ambiguous speech | Say `low or high`, two factor names, `twenty three` or `73` | No proposal and no selected answer | Parser and component tests | Browser recognition transcript and screen-reader feedback |
| Valid speech | Say `seventy`, `seven zero` or a valid factor name | Exact proposed answer is announced; the named confirmation control receives focus; nothing is selected before confirmation | Parser and component tests | NVDA/VoiceOver run |

## Why these behaviours were selected

- A host acknowledgement is weaker than durable remote storage. The interface must
  not erase its only recoverable copy at that point.
- Error recovery must preserve more than answers. It must expose a route to retry,
  edit or export without requiring the participant to search the page.
- Speech recognition is probabilistic. Rejecting an uncertain answer has a lower
  research-integrity cost than converting negation or an illegal value into a valid
  NASA-TLX score.
- A focus indicator must be visible on adjacent surfaces. The implementation uses a
  dark 3-pixel outline with contrast above 3:1 on tested light surfaces and retains a
  yellow outer halo for salience.
- Local storage is a recovery aid, not the research database. Its failure is reported
  honestly and does not remove the in-memory export route.

## Evidence record for the dissertation

For every manual run, record:

- frozen Git commit and deployed GitHub Pages commit;
- UCL Qualtrics survey version and synthetic participant code;
- browser, operating system, device and assistive technology;
- test precondition, action, expected result and observed result;
- Pass, Partial, Fail or Not supported;
- screenshot or exported synthetic record where appropriate;
- whether the issue concerns software correctness, workflow usability, assistive
  technology interoperability or participant accessibility.

Do not convert a passing technical check into a claim that the questionnaire is more
accessible. That requires an approved evaluation design and relevant participants.
