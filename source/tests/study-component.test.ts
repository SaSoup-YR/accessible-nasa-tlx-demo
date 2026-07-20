// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../src/accessible-nasa-tlx';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import { buildParticipantUrl, createStudyConfig, loadCompletedResults, type StudyResultRecord } from '../src/study';

async function renderConfiguredComponent() {
  const config = createStudyConfig(
    {
      studyId: 'STUDY-01',
      studyTitle: 'Configured NASA-TLX study',
      taskLabel: 'the route-planning task',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: true,
        answerMode: 'standard',
        largeText: true,
        audioGuidance: false,
        recoveryEnabled: true,
        allowParticipantChanges: false,
        voiceInputAvailable: false,
        gazeInputAvailable: false,
      },
    },
    { configId: 'config-study-01', createdAt: '2026-07-20T12:00:00.000Z' },
  );
  const url = buildParticipantUrl(window.location.href, config);
  window.history.replaceState({}, '', new URL(url).pathname + new URL(url).hash);
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component;
}

async function completeQuestionnaire(component: AccessibleNasaTlx) {
  const code = component.querySelector<HTMLInputElement>('#participant-code')!;
  code.value = 'P-007';
  code.dispatchEvent(new Event('input', { bubbles: true }));
  await component.updateComplete;
  [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Start the six ratings'))!.click();
  await component.updateComplete;
  for (let index = 0; index < 6; index += 1) {
    component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes(index === 5 ? 'Continue to comparisons' : 'Next question'),
    )!.click();
    await component.updateComplete;
  }
  for (let index = 0; index < 15; index += 1) {
    component.querySelector<HTMLInputElement>('.choice-card input')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes(index === 14 ? 'Review responses' : 'Next question'),
    )!.click();
    await component.updateComplete;
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('study-conductor and participant separation', () => {
  it('applies a locked configuration and requires a pseudonymous participant code', async () => {
    const component = await renderConfiguredComponent();
    expect(component.textContent).toContain('Configured NASA-TLX study');
    expect(component.textContent).toContain('the route-planning task');
    expect(component.querySelector('main')?.classList.contains('large-text')).toBe(true);
    expect(component.querySelector('.support-settings')).toBeNull();
    expect(component.textContent).toContain('Experimental gaze input not included');

    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Start the six ratings'))!.click();
    await component.updateComplete;
    expect(component.querySelector('#error-summary')?.textContent).toContain('pseudonymous participant code');
    expect(component.querySelector('.step-label')).toBeNull();
  });

  it('stores the complete record locally, emits the host event and hides the score when configured', async () => {
    const component = await renderConfiguredComponent();
    const emitted: StudyResultRecord[] = [];
    component.addEventListener('nasa-tlx-complete', (event) => { emitted.push((event as CustomEvent<StudyResultRecord>).detail); });
    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Calculate and submit'))!.click();
    await component.updateComplete;

    const stored = loadCompletedResults();
    expect(stored).toHaveLength(1);
    expect(stored[0].participantCode).toBe('P-007');
    expect(stored[0].responses.pairPresentationOrder).toHaveLength(15);
    expect(stored[0].result.ratings.mental).toBe(50);
    expect(emitted[0].submissionId).toBe(stored[0].submissionId);
    expect(component.querySelector('.save-status')?.textContent).toContain('stored only in this browser');
    expect(component.querySelector('.score')).toBeNull();
    expect(component.textContent).toContain('Download CSV backup');
  });
});
