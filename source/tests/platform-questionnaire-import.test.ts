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

function mixedLimeSurveyRatingSets() {
  let lss = fixture('limesurvey-current-rating.lss');
  for (let index = 1; index <= 5; index += 1) {
    lss = lss.replace(
      `<qid><![CDATA[202]]></qid><code><![CDATA[A00${index}]]></code>`,
      `<qid><![CDATA[202]]></qid><code><![CDATA[${index * 10}]]></code>`,
    );
  }
  return lss
    .replace(
      '  </rows>\n </questions>',
      '   <row><qid><![CDATA[203]]></qid><parent_qid><![CDATA[0]]></parent_qid><sid><![CDATA[100001]]></sid><gid><![CDATA[10]]></gid><type><![CDATA[T]]></type><title><![CDATA[NOTES]]></title><other><![CDATA[N]]></other><mandatory><![CDATA[N]]></mandatory><question_order><![CDATA[3]]></question_order><relevance><![CDATA[1]]></relevance></row>\n  </rows>\n </questions>',
    )
    .replace(
      '  </rows>\n </question_l10ns>',
      '   <row><qid><![CDATA[203]]></qid><question><![CDATA[Optional notes for the source survey.]]></question><help/><script/><language><![CDATA[en]]></language></row>\n  </rows>\n </question_l10ns>',
    );
}

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

  it('imports a LimeSurvey LSG single-row array group without discarding its condition silently', () => {
    const review = reviewQuestionnaireExport(
      fixture('limesurvey-group-rating.lsg'),
      'task-support.lsg',
    );

    expect(review.source).toBe('limesurvey-lsg');
    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.name).toBe('Task support');
    expect(review.draft?.items.map(({ name, prompt }) => ({ name, prompt }))).toEqual([
      { name: 'CLARITY', prompt: 'The task instructions were clear.' },
      { name: 'CONTROL', prompt: 'I felt in control.' },
    ]);
    expect(review.draft?.items[0].responseLabels).toEqual({
      1: 'Strongly disagree',
      2: '2',
      3: '3',
      4: '4',
      5: 'Strongly agree',
    });
    expect(review.confirmations.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'limesurvey-group-relevance-not-retained',
        'limesurvey-single-row-array-expanded',
        'limesurvey-blank-scale-labels',
      ]),
    );
  });

  it('imports a LimeSurvey LSQ question while making the missing survey context explicit', () => {
    const review = reviewQuestionnaireExport(
      fixture('limesurvey-question-rating.lsq'),
      'clarity.lsq',
    );

    expect(review.source).toBe('limesurvey-lsq');
    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.name).toBe('CLARITY');
    expect(review.draft?.items.map(({ name, prompt }) => ({ name, prompt }))).toEqual([
      { name: 'CLARITY', prompt: 'The task instructions were clear.' },
    ]);
    expect(review.draft?.items[0].responseLabels?.['5']).toBe('Strongly agree');
    expect(review.confirmations.map(({ code }) => code)).toContain(
      'limesurvey-question-context-not-retained',
    );
  });

  it('requires an explicit group choice for a multi-group LSS before reviewing one group', () => {
    const lss = fixture('limesurvey-group-rating.lsg')
      .replace('<LimeSurveyDocType>Group</LimeSurveyDocType>', '<LimeSurveyDocType>Survey</LimeSurveyDocType>')
      .replace(
        '</rows>\n </groups>',
        '<row><gid>20</gid><group_order>2</group_order><randomization_group/><grelevance>1</grelevance></row></rows>\n </groups>',
      )
      .replace(
        '</rows>\n </group_l10ns>',
        '<row><gid>20</gid><group_name>Other content</group_name><description/><language>en</language></row></rows>\n </group_l10ns>',
      );

    const initial = reviewQuestionnaireExport(lss, 'multi-group.lss');
    expect(initial.requiresGroupSelection).toBe(true);
    expect(initial.canConvert).toBe(false);
    expect(initial.groupOptions?.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: '10', name: 'Task support' },
      { id: '20', name: 'Other content' },
    ]);

    const selected = reviewQuestionnaireExport(lss, 'multi-group.lss', 'auto', '10');
    expect(selected.canConvert).toBe(true);
    expect(selected.unsupported).toEqual([]);
    expect(selected.draft?.items).toHaveLength(2);
    expect(selected.confirmations.map(({ code }) => code)).toContain(
      'limesurvey-selected-group-only',
    );
  });

  it('asks the researcher to choose one compatible rating set instead of mixing scales', () => {
    const initial = reviewQuestionnaireExport(
      mixedLimeSurveyRatingSets(),
      'mixed-rating-sets.lss',
    );

    expect(initial.requiresRatingSetSelection).toBe(true);
    expect(initial.canConvert).toBe(false);
    expect(initial.ratingSetOptions?.map((option) => ({
      id: option.id,
      items: option.itemCount,
      values: option.responseValues,
    }))).toEqual([
      { id: 'values-1-2-3-4-5', items: 1, values: [1, 2, 3, 4, 5] },
      { id: 'values-10-20-30-40-50', items: 1, values: [10, 20, 30, 40, 50] },
    ]);

    const fivePoint = reviewQuestionnaireExport(
      mixedLimeSurveyRatingSets(),
      'mixed-rating-sets.lss',
      'auto',
      '10',
      'values-1-2-3-4-5',
    );
    expect(fivePoint.canConvert).toBe(true);
    expect(fivePoint.unsupported).toEqual([]);
    expect(fivePoint.draft?.items.map(({ name }) => name)).toEqual(['CLARITY']);
    expect(fivePoint.draft?.minimum).toBe(1);
    expect(fivePoint.draft?.maximum).toBe(5);
    expect(fivePoint.confirmations.find(
      ({ code }) => code === 'limesurvey-selected-rating-set-only',
    )?.detail).toContain('CONTROL [type L], NOTES [type T]');

    const tenPointSteps = reviewQuestionnaireExport(
      mixedLimeSurveyRatingSets(),
      'mixed-rating-sets.lss',
      'auto',
      '10',
      'values-10-20-30-40-50',
    );
    expect(tenPointSteps.canConvert).toBe(true);
    expect(tenPointSteps.draft?.items.map(({ name }) => name)).toEqual(['CONTROL']);
    expect(tenPointSteps.draft?.minimum).toBe(10);
    expect(tenPointSteps.draft?.maximum).toBe(50);
    expect(tenPointSteps.draft?.step).toBe(10);
  });

  it('converts the rating set while explicitly reporting optional text left in LimeSurvey', () => {
    const oneScaleWithText = mixedLimeSurveyRatingSets().replace(
      /<row><aid><!\[CDATA\[106\]\]><\/aid><qid><!\[CDATA\[202\]\]><\/qid>[\s\S]*?<row><aid><!\[CDATA\[110\]\]><\/aid><qid><!\[CDATA\[202\]\]><\/qid>.*?<\/row>\n/,
      '',
    );
    const review = reviewQuestionnaireExport(oneScaleWithText, 'rating-and-notes.lss');

    expect(review.canConvert).toBe(true);
    expect(review.draft?.items.map(({ name }) => name)).toEqual(['CLARITY']);
    expect(review.confirmations.map(({ code }) => code)).toContain(
      'limesurvey-selected-rating-set-only',
    );
    expect(review.unsupported).toEqual([]);
  });

  it('accepts a required LimeSurvey dropdown list as an ordered single-choice scale', () => {
    const dropdown = fixture('limesurvey-current-rating.lss')
      .replaceAll('<type><![CDATA[L]]></type>', '<type><![CDATA[!]]></type>');
    const review = reviewQuestionnaireExport(dropdown, 'dropdown-rating.lss');

    expect(review.canConvert).toBe(true);
    expect(review.unsupported).toEqual([]);
    expect(review.draft?.items.map(({ name }) => name)).toEqual([
      'CLARITY',
      'CONTROL',
    ]);
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

  it('explains unsupported platform file categories instead of guessing', () => {
    expect(() => reviewQuestionnaireExport('archive', 'study.lsa')).toThrow(
      /may contain responses, tokens and participant data/i,
    );
    expect(() => reviewQuestionnaireExport('labels', 'scale.lsl')).toThrow(
      /contains only a reusable label set/i,
    );
    expect(() => reviewQuestionnaireExport('responses', 'results.csv')).toThrow(
      /ambiguous table formats/i,
    );
    expect(() => reviewQuestionnaireExport('document', 'survey.docx')).toThrow(
      /not an unambiguous native structure export/i,
    );
    expect(() => reviewQuestionnaireExport('template', 'survey.txt')).toThrow(
      /not an unambiguous native structure export/i,
    );
    expect(() => reviewQuestionnaireExport('workbook', 'survey.xlsx')).toThrow(
      /ambiguous table formats/i,
    );
    expect(() => reviewQuestionnaireExport('responses', 'results.sav')).toThrow(
      /response-data format/i,
    );
    expect(() => reviewQuestionnaireExport('{"responses":[]}', 'results.json')).toThrow(
      /not a Qualtrics QSF/i,
    );
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
