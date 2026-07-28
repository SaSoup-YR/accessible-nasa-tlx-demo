# Instrument definition guide

Version 0.8 loads registered files from:

`source/instruments/*.questionnaire.json`

## Adding a registered instrument

1. Confirm that its use, wording and scoring are permitted and cite the primary
   source in the definition.
2. Copy the structural pattern described by
   `questionnaire-definition.schema.json`.
3. Give the instrument and every item stable IDs and a version.
4. Select only an existing scorer whose semantic requirements the instrument
   satisfies. Do not place JavaScript or a formula string in the JSON.
5. Enable simpler explanations or smiley landmarks only when instrument-specific
   evidence and the evaluation protocol justify them.
6. Run `npm test` and `npm run build:release`.
7. Add an end-to-end test showing the item count, response scale, stage transitions,
   score and exported record.
8. Re-test the generated Qualtrics package before collecting data.

## Current definition profile

Required content:

- definition schema version, ID, instrument version and names;
- description, participant introduction and content-integrity notice;
- primary HTTPS source;
- declared magnitude, agreement or semantic-differential scale type, with integer
  minimum, maximum and step;
- one or more single-choice items;
- allowlisted scoring strategy and result range;
- capability flags.

Optional content:

- exactly five labelled landmarks;
- an all-pairs comparison stage;
- simpler explanatory text and voice endpoint aliases.

## Validation behavior

Both the published JSON Schema and runtime semantic validator are intentional.
JSON Schema catches structural errors. Runtime validation additionally checks
scorer compatibility, HTTPS sources, unique item IDs, scale divisibility,
landmark positions and capability dependencies.

The current registry includes weighted NASA-TLX, Raw TLX, SUS and UEQ-S. These
exercise an optional comparison stage, three scale semantics and four reviewed
scoring strategies.

The runner fails closed. An unknown property, scorer or incompatible definition
stops the build or registration instead of being ignored.

## Current extension limit

Definitions are separate JSON files but are registered into the published build;
the public site does not fetch an arbitrary remote URL or accept executable code.
Adding a definition that uses an existing response type but a new scoring rule
still requires a reviewed scorer in `source/src/scoring.ts`. Adding a new response
type also requires runner and schema work. This is why the public claim is
questionnaire-independent within the supported profile rather than compatible
with any questionnaire.
