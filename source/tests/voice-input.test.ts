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

  it('accepts exact imported response labels without accepting partial labels', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Imported agreement check';
    draft.shortName = 'IAC';
    draft.items = [
      createCustomItemDraft({
        name: 'Clarity',
        prompt: 'The instructions were clear.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
        responseLabels: {
          1: 'Strongly disagree',
          2: 'Disagree',
          3: 'Neither agree nor disagree',
          4: 'Agree',
          5: 'Strongly agree',
        },
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const values = buildRatingValues(definition);
    const item = definition.items[0];

    expect(parseRatingTranscript('agree', item, values, [])).toBe(4);
    expect(parseRatingTranscript('neither agree nor disagree', item, values, [])).toBe(3);
    expect(parseRatingTranscript('I choose strongly agree', item, values, [])).toBe(5);
    expect(parseRatingTranscript('strongly', item, values, [])).toBeNull();
    expect(parseRatingTranscript('not agree', item, values, [])).toBeNull();
  });

  it('accepts exact non-English labels while preserving safe exact-match behaviour', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'de';
    draft.name = 'German agreement check';
    draft.shortName = 'GAC';
    draft.items = [
      createCustomItemDraft({
        name: 'Realismus',
        prompt: 'Das Szenario war realistisch.',
        lowAnchor: 'Stimme überhaupt nicht zu',
        highAnchor: 'Stimme vollkommen zu',
        responseLabels: {
          1: 'Stimme überhaupt nicht zu',
          2: 'Stimme nicht zu',
          3: 'Stimme weder zu noch nicht zu',
          4: 'Stimme zu',
          5: 'Stimme vollkommen zu',
        },
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const values = buildRatingValues(definition);
    const item = definition.items[0];

    expect(parseRatingTranscript('Stimme überhaupt nicht zu', item, values, [])).toBe(1);
    expect(parseRatingTranscript('stimme vollkommen zu', item, values, [])).toBe(5);
    expect(parseRatingTranscript('stimme zu', item, values, [])).toBe(4);
    expect(parseRatingTranscript('zwei', item, values, [])).toBe(2);
    expect(parseRatingTranscript('fünf', item, values, [])).toBe(5);
    expect(parseRatingTranscript('vollkommen', item, values, [])).toBeNull();
    expect(parseRatingTranscript('stimme', item, values, [])).toBeNull();
    expect(parseRatingTranscript('nicht zwei', item, values, [])).toBeNull();
  });

  it('matches exact visible labels across scripts without language-specific dictionaries', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'zh-CN';
    draft.name = 'Multilingual response check';
    draft.shortName = 'MRC';
    draft.items = [
      createCustomItemDraft({
        name: '清晰度',
        prompt: '说明很清楚。',
        lowAnchor: '非常不同意',
        highAnchor: '非常同意',
        responseLabels: {
          1: '非常不同意',
          2: '不同意',
          3: '既不同意也不赞同',
          4: '同意',
          5: '非常同意',
        },
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const values = buildRatingValues(definition);
    const item = definition.items[0];

    expect(parseRatingTranscript('非常同意', item, values, [])).toBe(5);
    expect(parseRatingTranscript('非 常 同 意', item, values, [])).toBe(5);
    expect(parseRatingTranscript('「非常同意」', item, values, [])).toBe(5);
    expect(parseRatingTranscript('同意', item, values, [])).toBe(4);
    expect(parseRatingTranscript('非常', item, values, [])).toBeNull();
  });

  it('handles diacritics and right-to-left labels but rejects collapsed-label ambiguity', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'ar';
    draft.name = 'Arabic response check';
    draft.shortName = 'ARC';
    draft.items = [
      createCustomItemDraft({
        name: 'الوضوح',
        prompt: 'كانت التعليمات واضحة.',
        lowAnchor: 'لا أوافق',
        highAnchor: 'أوافق تمامًا',
        responseLabels: {
          1: 'لا أوافق',
          2: 'لا أوافق قليلًا',
          3: 'محايد',
          4: 'أوافق',
          5: 'أوافق تمامًا',
        },
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const values = buildRatingValues(definition);
    const item = definition.items[0];

    expect(parseRatingTranscript('أوافق تماماً', item, values, [])).toBe(5);
    expect(parseRatingTranscript('أوافق', item, values, [])).toBe(4);

    item.responseLabels = { 1: 'A B', 2: 'AB', 3: 'C', 4: 'D', 5: 'E' };
    expect(parseRatingTranscript('ab', item, values, [])).toBeNull();
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
