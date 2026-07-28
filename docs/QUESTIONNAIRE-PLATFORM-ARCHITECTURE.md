# Questionnaire-independent platform architecture

Prototype: Accessible Questionnaire Platform Version 0.8

Decision date: 27 July 2026

## Decision

Version 0.8 is questionnaire-independent within an explicitly supported
declarative profile. It is not described as supporting every questionnaire.

The same conductor, participant runner, support controls, interruption recovery,
input-route provenance, result schema and Qualtrics bridge now run two registered
instruments:

| Definition | Response structure | Scoring strategy | Pairwise stage |
| --- | --- | --- | --- |
| Weighted NASA-TLX | six integer ratings, 0–100 in steps of 5 | weighted pairwise NASA-TLX | all 15 pairs |
| System Usability Scale | ten integer ratings, 1–5 | standard alternating SUS rule | none |

This contrast is deliberate. Re-running the same six-item workflow under another
title would not demonstrate separation. SUS changes the item count, response range,
navigation length and scoring rule, and it removes the pairwise stage.

## Why the scope is constrained

The phrase any questionnaire is not technically or methodologically defensible.
Questionnaires may use free text, dates, multiple selection, ranking, matrices,
branching, adaptive logic, semantic differentials, repeated groups, multimedia,
clinical safety rules and proprietary scoring. A runner that supports two numeric
rating profiles cannot claim those capabilities.

Version 0.8 therefore supports:

- one required integer single-choice response per page;
- a uniform bounded scale defined by minimum, maximum and step;
- optional five-landmark presentation where the definition explicitly permits it;
- optional all-pairs comparisons;
- an allowlisted and tested scoring strategy;
- versioned item, source and scoring metadata in every result.

It does not currently support:

- free-text, multiple-answer, matrix, ranking or date items;
- display or skip logic;
- arbitrary JavaScript supplied by a definition;
- an unreviewed scoring expression;
- automatic psychometric equivalence between an official item and an optional
  accessibility presentation;
- arbitrary remote definition URLs.

Refusing unsupported definitions is part of the research contribution. Silent
approximation could alter an instrument while still producing a plausible score.

## Architectural boundary

### 1. Definition layer

Files matching `source/instruments/*.questionnaire.json` are discovered at build
time. Each file contains identity, version, source, items, scale, optional
pairwise behavior, capability flags and the name of an approved scorer.

`questionnaire-definition.schema.json` publishes the structural contract.
`validateQuestionnaireDefinition` repeats validation at runtime and adds semantic
checks that are difficult to express in JSON Schema, such as the exact item order
required by the SUS scorer.

Definitions are data, not executable extensions. Unknown fields and scorer names
are rejected.

### 2. Runner layer

`accessible-nasa-tlx.ts` retains its historical filename for traceability, but its
active `<accessible-questionnaire>` component obtains its item count, wording,
scale, anchors, pairwise stage and score label from the selected definition. The
legacy `<accessible-nasa-tlx>` custom-element name remains as a bounded migration
alias.

### 3. Accessibility-support layer

Large text, spoken guidance, confirmed voice input, interruption recovery, gaze
input, keyboard operation and screen-reader structure are runner capabilities.
They do not enter a questionnaire score.

Measurement-adjacent supports require a definition capability:

- NASA-TLX currently permits optional simpler explanations and experimental
  smiley landmarks. Their use is logged separately and no psychometric-equivalence
  claim is made.
- SUS disables both. A facial-valence scale is not an agreement scale, and changing
  validated SUS statements would require separate evidence.

### 4. Scoring layer

`scoring.ts` is an executable allowlist. A JSON file may select an existing
strategy but cannot provide code.

- `nasa-tlx-weighted-v1` requires six 0–100 items, 5-point increments and all
  pairs.
- `sus-standard-v1` requires the ordered `sus01`–`sus10` items, a 1–5 scale and no
  pairs.

A genuinely new scoring rule requires reviewed code and tests. This is intentional:
scoring is part of instrument validity, not ordinary presentation configuration.

### 5. Record and collection layer

Result schema Version 4 stores:

- questionnaire ID, name, version, definition schema and scoring strategy;
- item responses and any pairwise choices;
- primary score, declared range and strategy-specific details;
- configured support, final support state, changes and input routes;
- timing, pseudonymous participant code and submission ID.

The Qualtrics bridge uses generic `AQP_*` Embedded Data fields and stores the full
record in bounded raw JSON chunks. It no longer assumes six NASA dimensions.
Exact-origin messaging, a matching submission receipt, local backup before the
handoff and navigation recovery are retained from the supervisor-reviewed Version
0.7 implementation.

## Relationship to mature systems

The separation follows established patterns without copying an implementation:

- HL7 FHIR separates a reusable
  [Questionnaire](https://hl7.org/fhir/questionnaire.html) definition from a
  [QuestionnaireResponse](https://hl7.org/fhir/questionnaireresponse.html).
- SurveyJS represents survey structure as a
  [JSON model](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey)
  that a common runner renders.
- [JSON Schema 2020-12](https://json-schema.org/specification) provides a
  machine-readable vocabulary for constraining JSON data.

FHIR and SurveyJS are much broader than this dissertation prototype. They support
the architectural separation, not a claim of feature parity.

## Evidence supplied by Version 0.8

Automated evidence must show more than successful rendering:

1. both JSON definitions pass structural and semantic validation;
2. executable fields and incompatible scorer/scale combinations are rejected;
3. NASA-TLX produces 21 rating values, 15 pairs and its weighted result;
4. SUS produces five response values, no pair page and its alternating result;
5. the same conductor creates a participant configuration for either instrument;
6. the same participant element completes both workflows;
7. the same Version 4 record and Qualtrics bridge preserve either result;
8. accessibility checks run on both representative workflows.

These tests establish architectural reuse and data integrity. They do not establish
that either optional support improves accessibility or preserves psychometric
properties. Those are evaluation questions.

## Extension path

UEQ-S is a useful next case because its bipolar semantic-differential response
type is not represented by the current low/high numeric profile. Implementing it
should begin by adding an explicit semantic-differential item type and a reviewed
UEQ-S scorer, not by forcing its items into the current schema.

Raw TLX could reuse the NASA item definition with a different approved scoring
strategy and without pairwise weighting. A custom scale should be accepted only
after its response type and scorer are represented explicitly. This incremental
extension policy gives each new capability a testable boundary.
