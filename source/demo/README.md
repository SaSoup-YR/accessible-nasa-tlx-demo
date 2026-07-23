# Standalone participant file

`accessible-nasa-tlx-v0.6.html` is a self-contained **participant questionnaire** for offline code inspection and a single-browser technical demonstration. It is not the Version 0.6 study-conductor page.

The complete hosted workflow has two entry points built from one source tree:

| Role | Readable source | Hosted output |
| --- | --- | --- |
| Study conductor | `../study.html` and `../src/study-conductor.ts` | repository-root `study.html` |
| Participant | `../index.html` and `../src/accessible-nasa-tlx.ts` | repository-root `index.html` |

The conductor is intentionally not packaged into this standalone file. A page opened through `file://` cannot create a reliable public participant URL or share same-origin browser result storage with the hosted conductor. Use the hosted `study.html` route for configuration generation and same-device export.
