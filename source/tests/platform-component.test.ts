// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../src/accessible-nasa-tlx';
import '../src/study-conductor';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import type { StudyConductorApp } from '../src/study-conductor';
import {
  buildParticipantUrl,
  createStudyConfig,
  readStudyConfigFromHash,
  type StudyResultRecord,
} from '../src/study';

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
  window.history.replaceState({}, '', '/');
});

describe('instrument-independent questionnaire workflow', () => {
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
});
