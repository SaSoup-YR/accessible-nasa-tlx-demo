# Qualtrics integration files

- `question-html-template.html` is a reference template. Use the complete generated
  HTML from `study.html`, which replaces the participant-URL placeholder. It shows
  the live iframe during collection and a generic read-only summary in a recorded
  response or individual PDF.
- `qualtrics-question.js` belongs in that question's JavaScript editor. It validates
  a Version 4 record, stages `AQP_*` fields with `setJSEmbeddedData`, acknowledges a
  matching submission ID, starts native Qualtrics advancement and handles bounded
  exact-origin requests to reveal a focused error/recovery target in the outer
  survey viewport.
  Bridge build `0.8.1-q1` also keeps the participant iframe hidden until the
  exact-origin handshake succeeds and removes Qualtrics width caps on the bridge
  page so the outer survey owns the only scrollbar.
- `embedded-data-fields.txt` lists the 60 fields to declare near the start of Survey
  Flow. Keep `__js_` in Survey Flow; JavaScript calls intentionally omit it.
- `end-of-survey-message.txt` is ordinary text for a custom End of Survey message.
  It is the persistent completion page after the Qualtrics response has been
  submitted.

Use the complete setup and adverse-test procedure in
[`../../docs/QUALTRICS-INTEGRATION.md`](../../docs/QUALTRICS-INTEGRATION.md).
Participants receive the activated Qualtrics distribution link, not the raw GitHub
participant URL. Do not place an API token or password in these files.
