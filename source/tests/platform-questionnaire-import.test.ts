// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCustomQuestionnaireDefinition } from '../src/custom-questionnaire';
import { reviewQuestionnaireExport } from '../src/platform-questionnaire-import';
import { validateQuestionnaireDefinition } from '../src/questionnaire-definition';
import { scoreQuestionnaire } from '../src/scoring';

const fixture = (name: string) =>
  readFileSync(resolve(import.meta.dirname, 'fixtures', name), 'utf8');

describe('structured questionnaire export import', () => {
  it('imports ordered Qualtrics QSF choices and requires scoring confirmation', () => {
    const review = reviewQuestionnaireExport(
      fixture('qualtrics-rating.qsf'),
      'task-support.qsf',
    );

    expect(review.source).toBe('qualtrics-qsf');
    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.items.map(({ name, prompt }) => ({ name, prompt }))).toEqual([
      { name: 'CLARITY', prompt: 'The instructions were clear.' },
      { name: 'CONTROL', prompt: 'I felt in control.' },
    ]);
    expect(review.draft?.items[0].responseLabels).toEqual({
      1: 'Strongly disagree',
      2: 'Disagree',
      3: 'Neither agree nor disagree',
      4: 'Agree',
      5: 'Strongly agree',
    });
    expect(review.confirmations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'plain-text-normalisation',
        'review-scoring',
        'review-scale-type',
      ]),
    );
  });

  it('imports a current Qualtrics QSF that omits unchanged default recodes', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    qsf.SurveyElements
      .filter((element: any) => element.Element === 'SQ')
      .forEach((element: any) => {
        delete element.Payload.RecodeValues;
      });

    const review = reviewQuestionnaireExport(
      JSON.stringify(qsf),
      'current-task-support.qsf',
    );

    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.minimum).toBe(1);
    expect(review.draft?.maximum).toBe(5);
    expect(review.confirmations.map(({ code }) => code)).toContain(
      'qualtrics-default-recodes',
    );
  });

  it('does not infer Qualtrics values from non-default choice IDs', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    const question = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CONTROL',
    );
    delete question.Payload.RecodeValues;
    question.Payload.Choices['7'] = question.Payload.Choices['5'];
    delete question.Payload.Choices['5'];
    question.Payload.ChoiceOrder = [1, 2, 3, 4, 7];

    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'unsafe-values.qsf');

    expect(review.canConvert).toBe(false);
    expect(review.unsupported.map(({ code }) => code)).toContain(
      'qualtrics-missing-scale',
    );
  });

  it('imports ordered LimeSurvey LSS questions and answer labels', () => {
    const review = reviewQuestionnaireExport(
      fixture('limesurvey-rating.lss'),
      'task-support.lss',
    );

    expect(review.source).toBe('limesurvey-lss');
    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.items.map(({ name }) => name)).toEqual([
      'CLARITY',
      'CONTROL',
    ]);
    expect(review.draft?.minimum).toBe(1);
    expect(review.draft?.maximum).toBe(5);
    expect(review.draft?.step).toBe(1);
    expect(review.draft?.items[1].responseLabels?.['4']).toBe('Agree');
  });

  it('imports the current LimeSurvey base-language, localisation and default-code shape', () => {
    const review = reviewQuestionnaireExport(
      fixture('limesurvey-current-rating.lss'),
      'current-task-support.lss',
    );

    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.items.map(({ name, prompt }) => ({ name, prompt }))).toEqual([
      { name: 'CLARITY', prompt: 'The task instructions were clear.' },
      { name: 'CONTROL', prompt: 'I felt in control while completing the task.' },
    ]);
    expect(review.draft?.items[0].responseLabels?.['5']).toBe('Strongly agree');
    expect(review.confirmations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'limesurvey-base-language-only',
        'limesurvey-default-question-attributes',
        'limesurvey-positional-values',
      ]),
    );
  });

  it('still blocks active LimeSurvey attributes and scripts', () => {
    const lss = fixture('limesurvey-current-rating.lss')
      .replace(
        '<attribute><![CDATA[answer_order]]></attribute><value><![CDATA[normal]]></value>',
        '<attribute><![CDATA[random_group]]></attribute><value><![CDATA[group-a]]></value>',
      )
      .replace('<script/>', '<script><![CDATA[alert(1)]]></script>');

    const review = reviewQuestionnaireExport(lss, 'unsafe-current.lss');

    expect(review.canConvert).toBe(false);
    expect(review.unsupported.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'limesurvey-question-attributes',
        'limesurvey-question-script',
      ]),
    );
  });

  it('expands an explicitly ordered Qualtrics single-answer Likert matrix', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    const question = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CLARITY',
    );
    question.Payload.QuestionType = 'Matrix';
    question.Payload.Selector = 'Likert';
    question.Payload.SubSelector = 'SingleAnswer';
    question.Payload.QuestionText = 'Rate each statement.';
    question.Payload.Choices = {
      2: { Display: 'I felt in control.' },
      1: { Display: 'The instructions were clear.' },
    };
    question.Payload.ChoiceOrder = [1, 2];
    question.Payload.Answers = {
      1: { Display: 'Strongly disagree' },
      2: { Display: 'Disagree' },
      3: { Display: 'Neither agree nor disagree' },
      4: { Display: 'Agree' },
      5: { Display: 'Strongly agree' },
    };
    question.Payload.AnswerOrder = [1, 2, 3, 4, 5];

    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'matrix.qsf');
    expect(review.canConvert).toBe(true);
    expect(review.draft?.items.map(({ name }) => name)).toEqual([
      'The instructions were clear.',
      'I felt in control.',
      'CONTROL',
    ]);
    expect(review.confirmations.map(({ code }) => code)).toContain(
      'qualtrics-matrix-expanded',
    );
  });

  it('converts a reviewed import into a valid definition that survives JSON re-import', () => {
    const review = reviewQuestionnaireExport(
      fixture('qualtrics-rating.qsf'),
      'task-support.qsf',
    );
    const draft = structuredClone(review.draft!);
    draft.aggregation = 'mean';
    draft.items[1].reverseScored = true;
    const definition = createCustomQuestionnaireDefinition(draft);
    const reImported = validateQuestionnaireDefinition(
      JSON.parse(JSON.stringify(definition)),
    );

    expect(reImported).toEqual(definition);
    expect(scoreQuestionnaire(definition, {
      'item-01': 5,
      'item-02': 1,
    }).primaryScore).toBe(5);
  });

  it('rejects malformed and mismatched files without guessing', () => {
    expect(() => reviewQuestionnaireExport('{bad', 'bad.qsf')).toThrow(
      /not valid JSON/i,
    );
    expect(() => reviewQuestionnaireExport('<document>', 'bad.lss')).toThrow(
      /not valid XML/i,
    );
    expect(() =>
      reviewQuestionnaireExport(
        fixture('qualtrics-rating.qsf'),
        'task-support.qsf',
        'limesurvey-lss',
      )).toThrow(/not the chosen format/i);
  });

  it('blocks unsupported question types instead of silently dropping them', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    const question = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CONTROL',
    );
    question.Payload.Selector = 'MAVR';
    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'unsupported.qsf');

    expect(review.canConvert).toBe(false);
    expect(review.unsupported.map(({ code }) => code)).toContain(
      'qualtrics-unsupported-question',
    );
    expect(review.imported).toHaveLength(1);
  });

  it('blocks branching and executable or dynamic content', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    const block = qsf.SurveyElements.find((element: any) => element.Element === 'BL');
    block.Payload[0].BlockElements[0].SkipLogic = [{ Condition: 'Selected' }];
    const question = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CONTROL',
    );
    question.Payload.QuestionText = '<script>alert(1)</script>I felt in control.';

    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'unsafe.qsf');
    expect(review.canConvert).toBe(false);
    expect(review.unsupported.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'qualtrics-question-logic',
        'unsafe-dynamic-content',
      ]),
    );
  });

  it('blocks participant-visible media instead of flattening it to incomplete text', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    const question = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CONTROL',
    );
    question.Payload.QuestionText =
      '<img src="https://example.test/task.png" alt="Task diagram">Rate this diagram.';
    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'media.qsf');

    expect(review.canConvert).toBe(false);
    expect(review.unsupported.map(({ code }) => code)).toContain(
      'unsupported-structured-content',
    );
  });

  it('blocks mixed response scales rather than approximating values', () => {
    const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
    const question = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CONTROL',
    );
    question.Payload.RecodeValues['5'] = '6';
    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'mixed.qsf');

    expect(review.canConvert).toBe(false);
    expect(review.unsupported.map(({ code }) => code)).toContain(
      'mixed-response-scales',
    );
  });

  it('rejects oversized files before parsing', () => {
    expect(() =>
      reviewQuestionnaireExport(
        `{"SurveyElements":[],"padding":"${'x'.repeat(2_000_000)}"}`,
        'large.qsf',
      )).toThrow(/larger than the 2 MB/i);
  });
});
