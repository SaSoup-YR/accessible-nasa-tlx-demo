# Standalone participant files

- `accessible-questionnaire-platform-v0.8.html` is the active self-contained
  participant runner. It defaults to the registered NASA-TLX definition when it
  is opened without a conductor configuration.
- `accessible-nasa-tlx-v0.7.html` is the frozen supervisor-reviewed baseline.
  It is retained as implementation evidence and is not the active release.

Version 0.5 and 0.6 copies were removed from the current tree because Git history
already preserves them and presenting four runnable files created avoidable version
ambiguity. The complete hosted workflow has two entry points built from one source tree:

| Role | Readable source | Hosted output |
| --- | --- | --- |
| Study conductor | `../study.html` and `../src/study-conductor.ts` | repository-root `study.html` |
| Participant | `../index.html`, the validated files in `../instruments/`, and `../src/accessible-nasa-tlx.ts` | repository-root `index.html` |

The conductor is intentionally not packaged into the standalone file. A page
opened through `file://` cannot create a reliable public participant URL, use the
Qualtrics parent bridge, or share same-origin browser result storage with the hosted
conductor. Use the hosted `study.html` route for study configuration and collection.
