import { describe, expect, it } from 'vitest';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
  validateCustomQuestionnaireDefinition,
} from '../src/custom-questionnaire';
import {
  MAX_EMBEDDED_DEFINITION_BYTES,
  questionnaireDefinitionSize,
  resolveQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import { scoreQuestionnaire } from '../src/scoring';

function customDraft() {
  const draft = createCustomQuestionnaireDraft();
  return {
    ...draft,
    name: 'Work Assistance Inventory',
    shortName: 'WAI',
    description: 'Two items about assistance during the completed task.',
    sourceLabel: 'Researcher-authored pilot instrument',
    items: [
      createCustomItemDraft({
        name: 'Clarity',
        prompt: 'The instructions were clear.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
        simpleExplanation: 'How clear were the instructions?',
      }),
      createCustomItemDraft({
        name: 'Difficulty',
        prompt: 'The task was difficult.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
        simpleExplanation: 'How difficult was the task?',
        reverseScored: true,
      }),
    ],
  };
}

describe('researcher-supplied questionnaire definitions', () => {
  it('builds a bounded data-only definition and reverse-scores a reviewed mean', () => {
    const definition = createCustomQuestionnaireDefinition(customDraft());
    expect(definition.id).toBe('custom-wai');
    expect(definition.language).toBe('en-GB');
    expect(definition.items.map(({ id }) => id)).toEqual(['item-01', 'item-02']);
    expect(definition.scoring).toEqual({
      strategy: 'mean-v1',
      scoreName: 'Questionnaire score',
      minimum: 1,
      maximum: 5,
      reverseItemIds: ['item-02'],
    });
    expect(definition.supports.simplerExplanations).toBe(true);
    expect(definition.source.url).toBeUndefined();

    const result = scoreQuestionnaire(definition, {
      'item-01': 5,
      'item-02': 1,
    });
    expect(result.primaryScore).toBe(5);
    expect(result.details).toEqual({
      kind: 'generic-aggregate',
      aggregation: 'mean',
      contributions: { 'item-01': 2.5, 'item-02': 2.5 },
      adjustedRatings: { 'item-01': 5, 'item-02': 5 },
      reversedItemIds: ['item-02'],
    });
  });

  it('calculates the declared range and adjusted contribution for a sum', () => {
    const draft = customDraft();
    draft.aggregation = 'sum';
    draft.items[1].reverseScored = false;
    const definition = createCustomQuestionnaireDefinition(draft);
    expect(definition.scoring.minimum).toBe(2);
    expect(definition.scoring.maximum).toBe(10);
    expect(scoreQuestionnaire(definition, {
      'item-01': 2,
      'item-02': 4,
    }).primaryScore).toBe(6);
  });

  it('rejects executable fields, built-in ID replacement and unsupported scorers', () => {
    const definition = createCustomQuestionnaireDefinition(customDraft()) as any;
    definition.execute = 'return window.localStorage';
    expect(() => validateCustomQuestionnaireDefinition(definition)).toThrow(
      /unsupported field/i,
    );

    const builtInReplacement = createCustomQuestionnaireDefinition(customDraft()) as any;
    builtInReplacement.id = 'system-usability-scale';
    expect(() => validateCustomQuestionnaireDefinition(builtInReplacement)).toThrow(
      /cannot replace a built-in/i,
    );

    const unreviewedScorer = createCustomQuestionnaireDefinition(customDraft()) as any;
    unreviewedScorer.scoring.strategy = 'formula-from-text';
    expect(() => validateCustomQuestionnaireDefinition(unreviewedScorer)).toThrow(
      /allowlist/i,
    );
  });

  it('rejects unsupported custom IDs, pairwise stages and smiley presentations', () => {
    const wrongId = createCustomQuestionnaireDefinition(customDraft()) as any;
    wrongId.id = 'research-wai';
    expect(() => validateCustomQuestionnaireDefinition(wrongId)).toThrow(
      /start with custom-/i,
    );

    const pairwise = createCustomQuestionnaireDefinition(customDraft()) as any;
    pairwise.pairwise = {
      mode: 'all-pairs',
      prompt: 'Choose one.',
      instruction: 'Choose the more important item.',
      simplePrompt: 'Which mattered more?',
    };
    expect(() => validateCustomQuestionnaireDefinition(pairwise)).toThrow(
      /do not support pairwise/i,
    );

    const smiley = createCustomQuestionnaireDefinition(customDraft()) as any;
    smiley.landmarks = [
      { value: 1, cue: '1', position: 'low' },
      { value: 2, cue: '2', position: 'closer-low' },
      { value: 3, cue: '3', position: 'middle' },
      { value: 4, cue: '4', position: 'closer-high' },
      { value: 5, cue: '5', position: 'high' },
    ];
    smiley.supports.smileyLandmarks = true;
    expect(() => validateCustomQuestionnaireDefinition(smiley)).toThrow(
      /do not support smiley/i,
    );
  });

  it('resolves an embedded snapshot by exact ID and refuses an oversized definition', () => {
    const definition = createCustomQuestionnaireDefinition(customDraft());
    expect(resolveQuestionnaireDefinition(definition.id, definition)).toEqual(definition);
    expect(resolveQuestionnaireDefinition('custom-other', definition)).toBeNull();

    const oversized = structuredClone(definition);
    oversized.description = 'x'.repeat(MAX_EMBEDDED_DEFINITION_BYTES);
    expect(questionnaireDefinitionSize(oversized)).toBeGreaterThan(
      MAX_EMBEDDED_DEFINITION_BYTES,
    );
    expect(resolveQuestionnaireDefinition(oversized.id, oversized)).toBeNull();
  });

  it('rejects a scale that cannot be represented exactly', () => {
    const draft = customDraft();
    draft.minimum = 1;
    draft.maximum = 6;
    draft.step = 2;
    expect(() => createCustomQuestionnaireDefinition(draft)).toThrow(
      /range divisible/i,
    );
  });

  it('preserves a valid source language and rejects an invalid language tag', () => {
    const draft = customDraft();
    draft.language = 'de-DE';
    expect(createCustomQuestionnaireDefinition(draft).language).toBe('de-DE');

    draft.language = 'German language';
    expect(() => createCustomQuestionnaireDefinition(draft)).toThrow(/language/i);
  });
});
