// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/accessible-nasa-tlx';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import {
  buildParticipantUrl,
  createStudyConfig,
  loadCompletedResults,
  type ParticipantAdjustmentPolicy,
  type StudyResultRecord,
} from '../src/study';

async function renderConfiguredComponent(
  participantAdjustmentPolicy: ParticipantAdjustmentPolicy = 'locked',
) {
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
        participantAdjustmentPolicy,
        voiceInputAvailable: false,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
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
  delete (window as any).speechSynthesis;
  delete window.accessibleNasaTlxResultSink;
  delete (globalThis as any).SpeechSynthesisUtterance;
  vi.restoreAllMocks();
});

describe('study-conductor and participant separation', () => {
  it('speaks the configured task on the first participant-page request without pre-cancelling speech', async () => {
    const spoken: string[] = [];
    const cancel = vi.fn();
    class FakeUtterance {
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    }
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speaking: false,
        pending: false,
        paused: false,
        cancel,
        speak: (utterance: FakeUtterance) => spoken.push(utterance.text),
        getVoices: () => [],
      },
    });
    (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;

    const component = await renderConfiguredComponent();
    const summary = [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Hear a summary of this step'),
    )!;
    summary.click();
    await component.updateComplete;

    expect(spoken[0]).toContain('Think about the route-planning task');
    expect(cancel).not.toHaveBeenCalled();
    expect(component.querySelector('.audio-status')?.textContent).toContain('Playing a spoken summary');
  });

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

  it('allows only presentation preferences when the conductor permits participant personalisation', async () => {
    const component = await renderConfiguredComponent('presentation-only');
    const settings = component.querySelector('.participant-support-setup .support-settings')!;

    expect(settings.textContent).toContain('Text size');
    expect(settings.textContent).toContain('Save progress and show a return summary');
    expect(settings.textContent).not.toContain('Show simpler explanations');
    expect(settings.textContent).not.toContain('Smiley landmarks');
    expect(component.textContent).toContain('answer presentation and simpler-explanation setting remain fixed');
    expect(component.querySelector('.audio-guidance-toggle')).not.toBeNull();
  });

  it('starts from prepared defaults, allows optional support choice and exports every participant change', async () => {
    const component = await renderConfiguredComponent('participant-choice');
    const settings = component.querySelector('.participant-support-setup .support-settings')!;
    expect(settings.textContent).toContain('Show simpler explanations');
    expect(settings.textContent).toContain('Smiley landmarks');
    expect(component.textContent).toContain('You do not need to change anything before starting');

    const simpler = settings.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    simpler.click();
    const smiley = [...settings.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
      .find((input) => input.value === 'smiley')!;
    smiley.click();
    await component.updateComplete;

    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await component.updateComplete;

    const [stored] = loadCompletedResults();
    expect(stored.configuration.showSimpleLanguage).toBe(true);
    expect(stored.supportMetadata.simplerExplanationsShownAtSubmission).toBe(false);
    expect(stored.supportMetadata.answerModeAtSubmission).toBe('smiley');
    expect(stored.supportMetadata.supportChanges.map(({ setting }) => setting)).toEqual([
      'simpler-explanations',
      'answer-mode',
    ]);
    expect(stored.supportMetadata.supportChanges.every(({ stage }) => stage === 'intro')).toBe(true);
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

  it('uses an approved host sink for cross-device collection and does not duplicate the record locally', async () => {
    const component = await renderConfiguredComponent();
    const submitted: StudyResultRecord[] = [];
    window.accessibleNasaTlxResultSink = {
      name: 'UCL approved test platform',
      async submit(record) {
        submitted.push(record);
        return {
          accepted: true,
          submissionId: record.submissionId,
          receiptId: 'receipt-001',
        };
      },
    };

    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    expect(submitted).toHaveLength(1);
    expect(loadCompletedResults()).toEqual([]);
    expect(component.querySelector('.save-status')?.textContent).toContain('UCL approved test platform');
    expect(component.querySelector('.save-status')?.textContent).toContain('receipt-001');
    expect(component.querySelector('.save-status')?.textContent).toContain(
      'Scheduled for automatic completion',
    );
    expect(component.querySelector('.save-status')?.textContent).toContain(
      'No further action is required.',
    );
    expect(component.querySelector('.save-status')?.textContent).toContain(
      'Please keep this page open',
    );
    expect(component.querySelector('.save-status')?.textContent).toContain(
      'The final page will confirm when it has been recorded.',
    );
    expect(component.textContent).not.toContain('Submitted to the study platform');
    expect(component.textContent).not.toContain('Download JSON backup');
  });

  it('keeps answers on the review page when the approved host sink does not confirm receipt', async () => {
    const component = await renderConfiguredComponent();
    window.accessibleNasaTlxResultSink = {
      name: 'Unavailable platform',
      async submit() {
        throw new Error('The platform is unavailable.');
      },
    };

    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    expect(component.querySelector('#review-heading')).not.toBeNull();
    expect(component.querySelector('#error-summary')?.textContent).toContain('answers remain on this page');
    expect(document.activeElement).toBe(component.querySelector('#error-summary'));
    expect(loadCompletedResults()).toEqual([]);
  });
});
