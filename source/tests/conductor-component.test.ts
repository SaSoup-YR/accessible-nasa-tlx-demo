// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildQualtricsEndOfSurveyMessage,
  buildQualtricsQuestionHtml,
} from '../src/study-conductor';
import { readStudyConfigFromHash } from '../src/study';

async function renderConductor() {
  const component = document.createElement('study-conductor-app');
  document.body.append(component);
  await (component as any).updateComplete;
  return component;
}

function inputFor(component: HTMLElement, labelText: string) {
  return [...component.querySelectorAll<HTMLLabelElement>('label')]
    .find((label) => label.textContent?.includes(labelText))!
    .querySelector<HTMLInputElement>('input')!;
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/study.html');
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('study conductor defaults and guidance', () => {
  it('separates participant identity and starts with optional participant choice for an accessibility evaluation', async () => {
    const component = await renderConductor();
    expect(component.textContent).toContain('This researcher page generates a separate participant page');
    expect(component.textContent).toContain('Current Qualtrics generator: 0.8.2-q2');
    expect(component.querySelector<HTMLAnchorElement>(
      'a[href="study.html?package=0.8.2-q2"]',
    )).not.toBeNull();
    expect(component.textContent).toContain('P-001');
    expect(inputFor(component, 'Study ID').placeholder).toBe('ACCESS-TECH-01');
    expect(inputFor(component, 'Study title').placeholder).toBe('Route-planning interface study');
    expect(inputFor(component, 'Task label').placeholder).toContain('planning a route');

    const questionnaireDefinition = component.querySelector<HTMLSelectElement>('select')!;
    expect(questionnaireDefinition.value).toBe('nasa-tlx-weighted');
    expect(questionnaireDefinition.selectedOptions[0]?.textContent).toContain(
      'NASA Task Load Index',
    );
    expect(component.querySelector('.definition-summary')?.textContent).toContain(
      'Weighted workload score',
    );

    const participantChoice = inputFor(component, 'Prepared defaults with optional participant choice');
    expect(participantChoice.checked).toBe(true);
  });

  it('generates a separate local participant link with prepared defaults and optional participant choice', async () => {
    const component = await renderConductor();
    const values = [
      ['Study ID', 'TLX-TECH-01'],
      ['Study title', 'Route-planning workload study'],
      ['Task label', 'planning a route from A to B using the prototype'],
    ] as const;
    for (const [label, value] of values) {
      const input = inputFor(component, label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await (component as any).updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await (component as any).updateComplete;

    const link = component.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    const config = readStudyConfigFromHash(new URL(link).hash);
    expect(config?.support.participantAdjustmentPolicy).toBe('participant-choice');
    expect(config?.collection.mode).toBe('local');
    expect(new URL(link).pathname).toMatch(/index\.html$/);
    expect(component.textContent).toContain('Configuration ready');
  });

  it('generates an origin-bound Qualtrics iframe configuration without placing an account token in the link', async () => {
    const component = await renderConductor();
    inputFor(component, 'UCL Qualtrics central collection').click();
    await (component as any).updateComplete;

    const qualtricsUrl = component.querySelector<HTMLInputElement>('input[placeholder*="qualtrics.com"]')!;
    qualtricsUrl.value = 'https://ucl-example.eu.qualtrics.com/jfe/form/SV_TEST';
    qualtricsUrl.dispatchEvent(new Event('input', { bubbles: true }));
    const values = [
      ['Study ID', 'TLX-REMOTE-01'],
      ['Study title', 'Remote workload study'],
      ['Task label', 'completing the route-planning task'],
    ] as const;
    for (const [label, value] of values) {
      const input = inputFor(component, label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await (component as any).updateComplete;

    const participantUrl = component.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    const config = readStudyConfigFromHash(new URL(participantUrl).hash);
    expect(config?.collection).toEqual({
      mode: 'qualtrics',
      parentOrigin: 'https://ucl-example.eu.qualtrics.com',
    });
    expect(participantUrl).not.toContain('SV_TEST');
    const setupAssets = [
      ...component.querySelectorAll<HTMLTextAreaElement>('[data-qualtrics-asset]'),
    ];
    expect(setupAssets).toHaveLength(4);
    const questionHtml = component.querySelector<HTMLTextAreaElement>('[data-qualtrics-asset="question-html"]')!.value;
    expect(questionHtml).toContain('id="accessible-questionnaire-frame"');
    expect(questionHtml).toContain('id="accessible-questionnaire-recorded-summary"');
    expect(questionHtml).toContain('style="display:none"');
    expect(questionHtml).toContain('data-recorded="${e://Field/__js_AQP_ACCEPTED}"');
    expect(questionHtml).toContain(
      '#accessible-questionnaire-recorded-summary[data-recorded="1"] + #accessible-questionnaire-live-question',
    );
    expect(questionHtml).toContain('${e://Field/__js_AQP_PARTICIPANT_CODE}');
    expect(questionHtml).toContain('${e://Field/__js_AQP_PRIMARY_SCORE}');
    expect(questionHtml).toContain(participantUrl);
    expect(questionHtml).not.toContain('PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE');
    expect(questionHtml).toContain('data-aqp-package-build="0.8.2-q2"');
    expect(questionHtml).toBe(buildQualtricsQuestionHtml(participantUrl));
    expect(questionHtml).toBe(
      readFileSync(
        resolve(process.cwd(), '../integrations/qualtrics/question-html-template.html'),
        'utf8',
      )
        .trim()
        .replace('PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE', participantUrl),
    );
    const embeddedFields = component.querySelector<HTMLTextAreaElement>(
      '[data-qualtrics-asset="embedded-data"]',
    )!.value;
    expect(embeddedFields.trim().split(/\r?\n/)).toHaveLength(60);
    expect(embeddedFields).toContain('__js_AQP_ACCEPTED');
    expect(component.querySelector<HTMLTextAreaElement>(
      '[data-qualtrics-asset="question-javascript"]',
    )!.value).toContain('Qualtrics.SurveyEngine.addOnReady');
    expect(component.querySelector<HTMLTextAreaElement>(
      '[data-qualtrics-asset="end-message"]',
    )!.value).toContain('Questionnaire complete');
    expect(component.textContent).toContain('Do not upload these repository files to Qualtrics');
    expect(component.textContent).toContain('Copy complete question HTML');
    expect(component.textContent).toContain('Copy Embedded Data field list');
    expect(component.textContent).toContain('Copy complete question JavaScript');
    expect(component.textContent).toContain('Copy End of Survey message');
    expect(component.textContent).toContain('Qualtrics bridge 0.8.2-q2');
    expect(component.textContent).toContain('__js_AQP_ACCEPTED = 1');
    expect(component.textContent).toContain('participant application must fill the browser viewport');

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Copy complete question HTML')!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;
    expect(writeText).toHaveBeenCalledWith(questionHtml);
    expect(component.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Question HTML copied.',
    );
  });

  it('refuses to build Qualtrics question HTML without a generated participant URL', () => {
    expect(() => buildQualtricsQuestionHtml('')).toThrow(/generated participant URL/i);
    expect(() =>
      buildQualtricsQuestionHtml('PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE'),
    ).toThrow(/generated participant URL/i);
  });

  it('keeps the persistent Qualtrics completion message aligned with score-display policy', () => {
    const hidden = buildQualtricsEndOfSurveyMessage(false);
    expect(hidden).toContain('Your questionnaire responses have been recorded successfully.');
    expect(hidden).not.toContain('__js_AQP_PRIMARY_SCORE');
    expect(hidden).not.toContain('{{OPTIONAL_SCORE_BLOCK}}');

    const shown = buildQualtricsEndOfSurveyMessage(true);
    expect(shown).toContain('${e://Field/__js_AQP_INSTRUMENT_NAME}');
    expect(shown).toContain('${e://Field/__js_AQP_SCORE_NAME}');
    expect(shown).toContain('${e://Field/__js_AQP_PRIMARY_SCORE}');
    expect(shown).not.toContain('{{OPTIONAL_SCORE_BLOCK}}');
  });

  it('identifies a result export as the wrong file type and moves focus to the import error', async () => {
    const component = await renderConductor();
    const fileInput = component.querySelector<HTMLInputElement>('input[type="file"]')!;
    const resultExport = {
      schemaVersion: 2,
      study: { studyId: 'TLX-TECH-01' },
      responses: { ratings: {} },
      result: { weightedScore: 50 },
    };
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ text: async () => JSON.stringify(resultExport) }],
    });

    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    expect(component.querySelector('#conductor-error')?.textContent).toContain('completed result file');
    expect(document.activeElement).toBe(component.querySelector('#conductor-error'));
  });
});
