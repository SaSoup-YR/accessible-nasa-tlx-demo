// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../src/accessible-nasa-tlx';
import '../src/study-conductor';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import type { StudyConductorApp } from '../src/study-conductor';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
} from '../src/custom-questionnaire';
import {
  buildParticipantUrl,
  createStudyConfig,
  loadCompletedResults,
  readStudyConfigFromHash,
  resultsToCsv,
  type StudyResultRecord,
} from '../src/study';
import { reviewQuestionnaireExport } from '../src/platform-questionnaire-import';

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/index.html');
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
  window.history.replaceState({}, '', '/');
});

describe('instrument-independent questionnaire workflow', () => {
  it('runs a researcher-supplied definition through the same participant, result and recovery model', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Work Assistance Inventory';
    draft.shortName = 'WAI';
    draft.items = [
      createCustomItemDraft({
        name: 'Clarity',
        prompt: 'The instructions were clear.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
      }),
      createCustomItemDraft({
        name: 'Difficulty',
        prompt: 'The task was difficult.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
        reverseScored: true,
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'CUSTOM-PLATFORM-01',
      studyTitle: 'Custom questionnaire evaluation',
      taskLabel: 'using the route-planning system',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    let completed: StudyResultRecord | null = null;
    component.addEventListener('questionnaire-complete', (event) => {
      completed = (event as CustomEvent<StudyResultRecord>).detail;
    });
    document.body.append(component);
    await component.updateComplete;

    expect(component.querySelector('h1')?.textContent).toBe('Work Assistance Inventory');
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-CUSTOM-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 2 items'))!
      .click();
    await component.updateComplete;

    for (const value of ['5', '1']) {
      component.querySelector<HTMLInputElement>(
        `.rating-option input[value="${value}"]`,
      )!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) =>
          button.textContent?.includes(value === '1' ? 'Review responses' : 'Next question'))!
        .click();
      await component.updateComplete;
    }
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    expect(completed).not.toBeNull();
    expect((completed as unknown as StudyResultRecord).instrument.id).toBe('custom-wai');
    expect((completed as unknown as StudyResultRecord).instrument.definition).toEqual(
      definition,
    );
    expect((completed as unknown as StudyResultRecord).result.primaryScore).toBe(5);
    expect(component.textContent).toContain('Questionnaire score');
    expect(component.textContent).toContain('5.00');
  });

  it('uses one English voice control and accepts an exact visible English answer label', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'en-GB';
    draft.name = 'Task Support Check';
    draft.shortName = 'TSC';
    draft.items = [
      createCustomItemDraft({
        name: 'clarity',
        prompt: 'The task instructions were clear.',
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
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'IMPORTED-EN-VOICE-01',
      studyTitle: 'Imported English questionnaire',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        expect(this.lang).toBe('en-GB');
        this.onresult?.({
          results: {
            0: { 0: { transcript: 'Strongly agree' }, length: 1 },
            length: 1,
          },
        });
      }
      stop() {}
    }
    window.webkitSpeechRecognition = FakeRecognition as any;

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-EN-VOICE-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 1 item'))!
      .click();
    await component.updateComplete;

    expect(component.querySelectorAll('[data-voice-start]')).toHaveLength(1);
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')?.textContent).toContain(
      'Strongly agree, value 5, for clarity',
    );
    component.querySelector<HTMLButtonElement>('[data-voice-confirm]')!.click();
    await component.updateComplete;
    expect(component.querySelector<HTMLInputElement>('input[value="5"]')?.checked).toBe(true);
  });

  it('rejects non-English labels but keeps one English numeric route for an imported questionnaire', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'de';
    draft.name = 'Realismus';
    draft.shortName = 'REAL';
    draft.items = [createCustomItemDraft({
      name: 'real2',
      prompt: 'Die Umgebung entsprach einer echten Einsatzstelle.',
      lowAnchor: 'Stimme überhaupt nicht zu',
      highAnchor: 'Stimme vollkommen zu',
      responseLabels: {
        1: 'Stimme überhaupt nicht zu',
        2: '2',
        3: '3',
        4: '4',
        5: 'Stimme vollkommen zu',
      },
    })];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'IMPORTED-DE-NUMBER-01',
      studyTitle: 'Imported German questionnaire',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    let transcript = 'Stimme vollkommen zu';
    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        expect(this.lang).toBe('en-GB');
        this.onresult?.({ results: { 0: { 0: { transcript }, length: 1 }, length: 1 } });
      }
      stop() {}
    }
    window.webkitSpeechRecognition = FakeRecognition as any;

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-DE-NUMBER-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 1 item'))!
      .click();
    await component.updateComplete;

    expect(component.querySelectorAll('[data-voice-start]')).toHaveLength(1);
    expect(component.querySelector('.voice-input-content > p')?.textContent).not.toContain('answer label');
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')).toBeNull();
    expect(component.querySelector('[role="status"]')?.textContent).toContain('No answer was selected');
    expect(component.textContent).not.toContain('Voice answer not accepted');

    transcript = 'five';
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')?.textContent).toContain(
      'Stimme vollkommen zu, value 5, for real2',
    );
  });

  it('runs an imported QSF definition through participant completion and result export', async () => {
    const qsf = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    );
    const review = reviewQuestionnaireExport(qsf, 'task-support.qsf');
    const definition = createCustomQuestionnaireDefinition(review.draft!);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'QSF-IMPORT-01',
      studyTitle: 'Imported questionnaire evaluation',
      taskLabel: 'using the route-planning system',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);
    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;

    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-QSF-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 2 items'))!
      .click();
    await component.updateComplete;
    expect(component.textContent).toContain('Neither agree nor disagree');

    for (const [index, value] of ['4', '2'].entries()) {
      component.querySelector<HTMLInputElement>(
        `.rating-option input[value="${value}"]`,
      )!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(
          index === 1 ? 'Review responses' : 'Next question',
        ))!
        .click();
      await component.updateComplete;
    }
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    const records = loadCompletedResults();
    expect(records).toHaveLength(1);
    expect(records[0].instrument.definition).toEqual(definition);
    expect(records[0].result.primaryScore).toBe(3);
    const csv = resultsToCsv(records);
    expect(csv).toContain('custom-tsc');
    expect(csv).toContain('P-QSF-01');
    expect(csv).toContain('Strongly agree');
  });

  it('renders expanded Qualtrics matrix rows as accessible sequential items and completes scoring', async () => {
    const qsf = JSON.parse(readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    ));
    const matrix = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CLARITY',
    );
    matrix.Payload.QuestionType = 'Matrix';
    matrix.Payload.Selector = 'Likert';
    matrix.Payload.SubSelector = 'SingleAnswer';
    matrix.Payload.QuestionText = 'Rate each statement.';
    matrix.Payload.Choices = {
      2: { Display: 'I felt in control.' },
      1: { Display: 'The instructions were clear.' },
    };
    matrix.Payload.ChoiceOrder = [1, 2];
    matrix.Payload.Answers = {
      1: { Display: 'Strongly disagree' },
      2: { Display: 'Disagree' },
      3: { Display: 'Neither agree nor disagree' },
      4: { Display: 'Agree' },
      5: { Display: 'Strongly agree' },
    };
    matrix.Payload.AnswerOrder = [1, 2, 3, 4, 5];

    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'matrix.qsf');
    expect(review.confirmations.map(({ code }) => code)).toContain(
      'qualtrics-matrix-expanded',
    );
    const definition = createCustomQuestionnaireDefinition(review.draft!);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'QSF-MATRIX-01',
      studyTitle: 'Expanded matrix evaluation',
      taskLabel: 'using the route-planning system',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);
    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;

    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-MATRIX-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 3 items'))!
      .click();
    await component.updateComplete;

    expect(component.querySelector('.step-label')?.textContent).toContain('Rating 1 of 3');
    expect(component.querySelector('#rating-heading')?.textContent).toBe(
      'The instructions were clear.',
    );
    expect(component.querySelector('.rating-fieldset')).not.toBeNull();
    expect(component.querySelector('.rating-fieldset legend')?.textContent).toContain(
      'Strongly disagree',
    );
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input')).toHaveLength(5);
    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="5"]')
        ?.getAttribute('aria-label'),
    ).toBe('5, Strongly agree, for The instructions were clear.');

    for (const [index, value] of ['5', '4', '3'].entries()) {
      component.querySelector<HTMLInputElement>(
        `.rating-option input[value="${value}"]`,
      )!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(
          index === 2 ? 'Review responses' : 'Next question',
        ))!
        .click();
      await component.updateComplete;
      if (index === 0) {
        expect(component.querySelector('.step-label')?.textContent).toContain('Rating 2 of 3');
        expect(component.querySelector('#rating-heading')?.textContent).toBe('I felt in control.');
      }
    }

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    const [record] = loadCompletedResults();
    expect(record.instrument.definition?.items.map(({ name }) => name)).toEqual([
      'The instructions were clear.',
      'I felt in control.',
      'CONTROL',
    ]);
    expect(record.result.primaryScore).toBe(4);
  });

  it('runs SUS through the same participant component without NASA comparison logic', async () => {
    const config = createStudyConfig({
      instrumentId: 'system-usability-scale',
      studyId: 'SUS-PLATFORM-01',
      studyTitle: 'System evaluation',
      taskLabel: 'using the route-planning system',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    let completed: StudyResultRecord | null = null;
    component.addEventListener('questionnaire-complete', (event) => {
      completed = (event as CustomEvent<StudyResultRecord>).detail;
    });
    document.body.append(component);
    await component.updateComplete;

    expect(component.querySelector('h1')?.textContent).toBe('System Usability Scale');
    expect(component.textContent).not.toContain('Smiley landmarks');
    expect(component.textContent).toContain('no reworded item support');

    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-SUS-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 10 items'))!
      .click();
    await component.updateComplete;

    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="1"]')
        ?.getAttribute('aria-label'),
    ).toBe('1, Strongly disagree, for Item 1');
    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="3"]')
        ?.getAttribute('aria-label'),
    ).toBe('3 for Item 1');
    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="5"]')
        ?.getAttribute('aria-label'),
    ).toBe('5, Strongly agree, for Item 1');
    expect(component.textContent).toContain('exact visible endpoint label');
    expect(component.textContent).not.toContain('Neutral');

    for (let index = 0; index < 10; index += 1) {
      const expectedValue = index % 2 === 0 ? '5' : '1';
      const options = component.querySelectorAll<HTMLInputElement>('.rating-option input');
      expect(options).toHaveLength(5);
      component.querySelector<HTMLInputElement>(`.rating-option input[value="${expectedValue}"]`)!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(index === 9 ? 'Review responses' : 'Next question'))!
        .click();
      await component.updateComplete;
    }

    expect(component.querySelector('.choice-fieldset')).toBeNull();
    expect(component.textContent).not.toContain('Pairwise comparisons');
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    expect(component.textContent).toContain('SUS score');
    expect(component.textContent).toContain('100.00');
    expect(completed).not.toBeNull();
    expect((completed as unknown as StudyResultRecord).instrument.id).toBe('system-usability-scale');
    expect((completed as unknown as StudyResultRecord).result.strategy).toBe('sus-standard-v1');
    expect((completed as unknown as StudyResultRecord).responses.pairPresentationOrder).toEqual([]);
  });

  it('generates a SUS participant configuration from the shared conductor', async () => {
    window.history.replaceState({}, '', '/study.html');
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;

    const select = conductor.querySelector<HTMLSelectElement>('select')!;
    select.value = 'system-usability-scale';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await conductor.updateComplete;
    expect(conductor.textContent).toContain('Smiley landmarks are disabled');

    const byLabel = (text: string) =>
      [...conductor.querySelectorAll<HTMLLabelElement>('label')]
        .find((label) => label.textContent?.includes(text))!
        .querySelector<HTMLInputElement>('input')!;
    for (const [label, value] of [
      ['Study ID', 'SUS-PLATFORM-02'],
      ['Study title', 'System evaluation'],
      ['Task label', 'using the route-planning system'],
    ]) {
      const input = byLabel(label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    [...conductor.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await conductor.updateComplete;

    const link = conductor.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    expect(readStudyConfigFromHash(new URL(link).hash)?.instrumentId).toBe('system-usability-scale');
  });

  it.each([
    {
      instrumentId: 'nasa-tlx-raw',
      participantCode: 'P-RAW-01',
      values: [0, 20, 40, 60, 80, 100],
      expectedScore: 50,
      expectedStrategy: 'nasa-tlx-raw-v1',
      expectedTitle: 'Raw NASA Task Load Index',
    },
    {
      instrumentId: 'user-experience-questionnaire-short',
      participantCode: 'P-UEQS-01',
      values: [7, 7, 7, 7, 1, 1, 1, 1],
      expectedScore: 0,
      expectedStrategy: 'ueqs-standard-v1',
      expectedTitle: 'User Experience Questionnaire Short',
    },
  ])(
    'runs $instrumentId through the same rating-only participant workflow',
    async ({
      instrumentId,
      participantCode,
      values,
      expectedScore,
      expectedStrategy,
      expectedTitle,
    }) => {
      const config = createStudyConfig({
        instrumentId,
        studyId: 'PLATFORM-MULTI-01',
        studyTitle: 'Questionnaire platform evaluation',
        taskLabel: 'using the route-planning system',
        showScoreToParticipant: true,
        support: {
          showSimpleLanguage: false,
          answerMode: 'standard',
          largeText: false,
          audioGuidance: false,
          recoveryEnabled: true,
          participantAdjustmentPolicy: 'participant-choice',
          voiceInputAvailable: true,
          gazeInputAvailable: false,
        },
        collection: { mode: 'local' },
      });
      const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
      window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

      const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
      let completed: StudyResultRecord | null = null;
      component.addEventListener('questionnaire-complete', (event) => {
        completed = (event as CustomEvent<StudyResultRecord>).detail;
      });
      document.body.append(component);
      await component.updateComplete;

      expect(component.querySelector('h1')?.textContent).toBe(expectedTitle);
      const code = component.querySelector<HTMLInputElement>('#participant-code')!;
      code.value = participantCode;
      code.dispatchEvent(new Event('input', { bubbles: true }));
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(`Start the ${values.length} items`))!
        .click();
      await component.updateComplete;

      for (let index = 0; index < values.length; index += 1) {
        component.querySelector<HTMLInputElement>(
          `.rating-option input[value="${values[index]}"]`,
        )!.click();
        await component.updateComplete;
        [...component.querySelectorAll<HTMLButtonElement>('button')]
          .find((button) =>
            button.textContent?.includes(index === values.length - 1
              ? 'Review responses'
              : 'Next question'))!
          .click();
        await component.updateComplete;
      }

      expect(component.querySelector('.choice-fieldset')).toBeNull();
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes('Calculate and submit responses'))!
        .click();
      await component.updateComplete;

      expect(completed).not.toBeNull();
      expect((completed as unknown as StudyResultRecord).instrument.id).toBe(instrumentId);
      expect((completed as unknown as StudyResultRecord).result.strategy).toBe(expectedStrategy);
      expect((completed as unknown as StudyResultRecord).result.primaryScore).toBe(expectedScore);
    },
  );
});
