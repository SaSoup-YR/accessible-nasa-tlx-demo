# Supervisor update trace: 27 July 2026

## Provenance

The supervisor's commit is:

- commit: `6e055e2a01231479ac9014d3eb35ae0fd6c77c83`
- author: Mark Colley
- commit message: `update`
- merged into the project through pull request 22

The commit remains an ancestor of the current Version 0.7 work. It has not been
deleted or reverted. Later commits extend its recovery controls and tests.

## What the update changed

### `integrations/qualtrics/qualtrics-question.js`

The update documented that `setJSEmbeddedData` stages values in the active browser
survey session and that `clickNextButton()` submits the Qualtrics page. It reduced the
post-receipt delay from eight seconds to a 1.5-second technical handoff, replaced the
false final wording with a keep-the-page-open instruction and restored native
Qualtrics navigation when staging fails.

The current code still uses all three decisions. It additionally starts a six-second
watchdog after `clickNextButton()`. If the page has not unloaded, the status explains
the failure and native navigation is restored.

### `source/src/accessible-nasa-tlx.ts`

The update:

- changed the in-frame heading to state that the study platform was still completing
  the response;
- kept JSON and CSV backup buttons available after parent acknowledgement;
- stored a completed local recovery copy for the Qualtrics route;
- preserved the in-progress copy when a completed backup could not be written.

The current code retains these controls. A later change moves the completed-backup
attempt before host contact, so an immediate close after acknowledgement still leaves
a same-device recovery route when browser storage permits it. The backup controls are
now described as emergency routes if automatic Qualtrics advancement does not occur;
they are not presented as a task that must be completed within 1.5 seconds.

## Evidence boundary

The commit and automated tests establish intended client-side behaviour. They do not
prove that the UCL Qualtrics tenant recorded a response. That requires a synthetic
preview/distribution run followed by inspection and export of the corresponding
Data & Analysis row.
