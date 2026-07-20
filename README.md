# Accessible NASA-TLX Version 0.4

A public research prototype of an implementation-ready accessibility support layer for the full weighted NASA Task Load Index.

**[Open the hosted prototype](https://sasoup-yr.github.io/accessible-nasa-tlx-demo/)**

## What the prototype preserves

The prototype retains the official NASA-TLX factor definitions, 0–100 rating values, reversed Performance direction, fifteen pairwise comparisons, factor weighting and weighted-score calculation. Optional accessibility support is kept separate from the workload score.

## Optional accessibility support

- Adjustable text and larger controls
- Simpler explanations alongside the official wording
- Standard scale and experimental smiley landmarks
- Built-in spoken guidance
- Keyboard and external screen-reader operation
- Confirmed voice input
- Interruption recovery using local browser storage
- Experimental webcam-gaze input with conventional fallbacks

## Run and inspect

No build step is required. The hosted site serves the complete prototype directly from `index.html`.

For local inspection, serve the repository over HTTP rather than opening `index.html` as a `file://` URL. HTTPS or localhost is required for webcam access.

For the most complete technical test, use a recent version of Chrome or Microsoft Edge. Voice input depends on browser speech-recognition support. Gaze support downloads the pinned WebGazer 3.5.3 browser library from jsDelivr when that option is activated.

## Privacy

Questionnaire answers are not uploaded by this prototype. Progress is stored locally only when recovery support is enabled. Webcam video is processed in the browser and is not stored by the questionnaire. Activating gaze support requires downloading its browser library from jsDelivr.

## Evaluation status

This is a research prototype. Automated checks and researcher-led manual tests do not establish full WCAG conformance, psychometric equivalence, improved comprehension, effectiveness for a disability group or reliable independent gaze answering. Smiley and simpler-language presentations remain optional and are not validated replacements for the official scale.

See [TESTING.md](TESTING.md) for the technical test checklist.
