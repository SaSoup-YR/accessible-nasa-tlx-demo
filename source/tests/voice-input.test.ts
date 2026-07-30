import { describe, expect, it } from 'vitest';
import { dimensions } from '../src/nasa-tlx';
import {
  buildRatingValues,
  getQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
} from '../src/custom-questionnaire';
import {
  parsePairAlternatives,
  parsePairTranscript,
  parseRatingAlternatives,
  parseRatingTranscript,
} from '../src/voice-input';

describe('voice-answer parsing', () => {
  it('accepts only valid NASA-TLX rating increments', () => {
    expect(parseRatingTranscript('fifty five', dimensions[0])).toBe(55);
    expect(parseRatingTranscript('I choose 70', dimensions[0])).toBe(70);
    expect(parseRatingTranscript('seven zero', dimensions[0])).toBe(70);
    expect(parseRatingTranscript('one zero zero', dimensions[0])).toBe(100);
    expect(parseRatingTranscript('I choose 73', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('twenty three', dimensions[0])).toBeNull();
  });

  it('recognises an exact whole-number value when a custom scale displays it', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Custom magnitude check';
    draft.shortName = 'CMC';
    draft.scaleType = 'magnitude';
    draft.minimum = 0;
    draft.maximum = 30;
    draft.step = 1;
    draft.items = [
      createCustomItemDraft({
        name: 'Amount',
        prompt: 'Choose an amount.',
        lowAnchor: 'None',
        highAnchor: 'Maximum',
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const values = buildRatingValues(definition);
    expect(parseRatingTranscript('twenty three', definition.items[0], values, [])).toBe(23);
    expect(parseRatingTranscript('two three', definition.items[0], values, [])).toBe(23);
    expect(parseRatingTranscript('thirty one', definition.items[0], values, [])).toBeNull();
  });

  it('rejects negated or ambiguous anchors instead of guessing', () => {
    expect(parseRatingTranscript('not low', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('anything but low', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('other than high', dimensions[0])).toBeNull();
    expect(parseRatingTranscript("don't choose low", dimensions[0])).toBeNull();
    expect(parseRatingTranscript('low or high', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('fifty or sixty', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('maybe high', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('closer to low or high', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('closer to low 100', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('twenty-three percent', dimensions[0])).toBeNull();
  });

  it('maps the five visible smiley labels to their displayed values', () => {
    expect(parseRatingTranscript('low', dimensions[0])).toBe(0);
    expect(parseRatingTranscript('close to low', dimensions[0])).toBe(25);
    expect(parseRatingTranscript('closer to low', dimensions[0])).toBe(25);
    expect(parseRatingTranscript('middle', dimensions[0])).toBe(50);
    expect(parseRatingTranscript('closer to high', dimensions[0])).toBe(75);
    expect(parseRatingTranscript('close to high', dimensions[0])).toBe(75);
    expect(parseRatingTranscript('high', dimensions[0])).toBe(100);
    expect(parseRatingTranscript('lo', dimensions[0])).toBe(0);
    expect(parseRatingTranscript('hi', dimensions[0])).toBe(100);
    expect(parseRatingTranscript('I choose hi', dimensions[0])).toBe(100);
    expect(parseRatingTranscript('closer too high', dimensions[0])).toBe(75);
    expect(parseRatingTranscript('closer to hi', dimensions[0])).toBe(75);
    expect(parseRatingTranscript('closer to high 75', dimensions[0])).toBe(75);
    expect(parseRatingTranscript('hello', dimensions[0])).toBe(0);
    expect(parseRatingTranscript('say hello', dimensions[0])).toBeNull();
  });

  it('respects the reversed Performance anchors without accepting a negation', () => {
    const performance = dimensions.find((dimension) => dimension.id === 'performance')!;
    expect(parseRatingTranscript('good', performance)).toBe(0);
    expect(parseRatingTranscript('closer to good', performance)).toBe(25);
    expect(parseRatingTranscript('middle', performance)).toBe(50);
    expect(parseRatingTranscript('closer to poor', performance)).toBe(75);
    expect(parseRatingTranscript('closer to pour', performance)).toBe(75);
    expect(parseRatingTranscript('poor', performance)).toBe(100);
    expect(parseRatingTranscript('pour', performance)).toBe(100);
    expect(parseRatingTranscript('closer to pool', performance)).toBeNull();
    expect(parseRatingTranscript('not good', performance)).toBeNull();
    expect(parseRatingTranscript('closer to good or poor', performance)).toBeNull();
  });

  it('accepts one visible factor name and rejects ambiguous comparison speech', () => {
    expect(parsePairTranscript('Mental Demand', ['mental', 'physical'])).toBe('mental');
    expect(parsePairTranscript('mental or physical', ['mental', 'physical'])).toBeNull();
    expect(parsePairTranscript('not physical demand', ['mental', 'physical'])).toBeNull();
    expect(parsePairTranscript('frustration', ['mental', 'physical'])).toBeNull();
  });

  it('uses a consistent lower-ranked hypothesis without guessing across conflicts or negation', () => {
    expect(parseRatingAlternatives(['hello', 'low'], dimensions[0])).toEqual({
      transcript: 'hello',
      value: 0,
    });
    expect(parseRatingAlternatives(['high', 'high rating'], dimensions[0])).toEqual({
      transcript: 'high',
      value: 100,
    });
    expect(parseRatingAlternatives(['low', 'high'], dimensions[0])).toBeNull();
    expect(parseRatingAlternatives(['not low', 'low'], dimensions[0])).toBeNull();
    expect(parseRatingAlternatives(['hello', 'not high', 'high'], dimensions[0])).toBeNull();
    expect(parsePairAlternatives(['fiscal demand', 'physical demand'], ['mental', 'physical'])).toEqual({
      transcript: 'physical demand',
      value: 'physical',
    });
    expect(parsePairAlternatives(['mental demand', 'physical demand'], ['mental', 'physical'])).toBeNull();
  });

  it('accepts only exact official SUS endpoint labels and numeric response positions', () => {
    const definition = getQuestionnaireDefinition('system-usability-scale')!;
    const item = definition.items[0];
    const values = buildRatingValues(definition);

    expect(parseRatingTranscript('strongly disagree', item, values, [])).toBe(1);
    expect(parseRatingTranscript('I choose strongly agree', item, values, [])).toBe(5);
    expect(parseRatingTranscript('3', item, values, [])).toBe(3);
    expect(parseRatingTranscript('agree', item, values, [])).toBeNull();
    expect(parseRatingTranscript('neutral', item, values, [])).toBeNull();
    expect(parseRatingTranscript('not strongly agree', item, values, [])).toBeNull();
  });

  it('accepts exact official UEQ-S endpoints without misreading its negative endpoint', () => {
    const definition = getQuestionnaireDefinition('user-experience-questionnaire-short')!;
    const values = buildRatingValues(definition);
    const firstItem = definition.items[0];
    const interestItem = definition.items[5];

    expect(parseRatingTranscript('obstructive', firstItem, values, [])).toBe(1);
    expect(parseRatingTranscript('I select supportive', firstItem, values, [])).toBe(7);
    expect(parseRatingTranscript('not interesting', interestItem, values, [])).toBe(1);
    expect(parseRatingTranscript('interesting', interestItem, values, [])).toBe(7);
    expect(parseRatingTranscript('not interesting or interesting', interestItem, values, [])).toBeNull();
    expect(parseRatingTranscript('middle', firstItem, values, [])).toBeNull();
    expect(parseRatingAlternatives(
      ['not interesting', 'interesting'],
      interestItem,
      values,
      [],
    )).toBeNull();
  });
});
