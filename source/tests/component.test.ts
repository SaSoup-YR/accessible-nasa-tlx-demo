// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/accessible-nasa-tlx';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component;
}

async function startRatings(component: AccessibleNasaTlx) {
  const start = [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
    button.textContent?.includes('Start the six ratings'),
  );
  start!.click();
  await component.updateComplete;
}

async function completeRatings(component: AccessibleNasaTlx) {
  for (let index = 0; index < 6; index += 1) {
    component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!.click();
    await component.updateComplete;
    const next = [...component.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.includes(index === 5 ? 'Continue to comparisons' : 'Next question'),
    );
    next!.click();
    await component.updateComplete;
  }
}

async function completeComparisons(component: AccessibleNasaTlx) {
  for (let index = 0; index < 15; index += 1) {
    component.querySelector<HTMLInputElement>('.choice-card input')!.click();
    await component.updateComplete;
    const next = [...component.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.includes(index === 14 ? 'Review responses' : 'Next question'),
    );
    next!.click();
    await component.updateComplete;
  }
}

function inputByValue(component: AccessibleNasaTlx, value: string) {
  return component.querySelector<HTMLInputElement>(`.support-settings input[value="${value}"]`);
}

function checkboxByLabel(component: AccessibleNasaTlx, labelText: string) {
  const label = [...component.querySelectorAll<HTMLLabelElement>('.support-settings label')].find(
    (candidate) => candidate.textContent?.includes(labelText),
  );
  return label?.querySelector<HTMLInputElement>('input');
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
  delete window.webgazer;
  delete (window as any).speechSynthesis;
  delete (globalThis as any).SpeechSynthesisUtterance;
  vi.restoreAllMocks();
});

describe('corrected NASA-TLX task flow', () => {
  it('starts with magnitude ratings before pairwise comparisons', async () => {
    const component = await renderComponent();
    await startRatings(component);

    expect(component.querySelector('.step-label')?.textContent).toContain('Rating 1 of 6');
    expect(component.querySelector('#rating-heading')?.textContent).toBe('Mental Demand');
    expect(component.querySelector('.choice-fieldset')).toBeNull();
  });

  it('moves to a clearly explained comparison after all six ratings', async () => {
    const component = await renderComponent();
    await startRatings(component);
    await completeRatings(component);

    expect(component.querySelector('.step-label')?.textContent).toContain('Comparison 1 of 15');
    expect(component.querySelector('.pair-instruction')?.textContent).toContain('not a Low-to-High rating');
    const choiceText = component.querySelector('.choice-fieldset')?.textContent ?? '';
    expect(choiceText).not.toContain('Low to High');
    expect(choiceText).not.toContain('Good to Poor');
  });
});

describe('reading and answer presentation', () => {
  it('keeps optional support off and the simpler explanation collapsed by default', async () => {
    const component = await renderComponent();
    await startRatings(component);

    const explanation = component.querySelector<HTMLDetailsElement>('.optional-explanation');
    expect(explanation).not.toBeNull();
    expect(explanation!.open).toBe(false);
    expect(component.querySelector('.simple-language-panel')).toBeNull();
    expect(component.querySelectorAll('.rating-option')).toHaveLength(21);
  });

  it('shows one official definition and a non-duplicating simpler explanation', async () => {
    const component = await renderComponent();
    checkboxByLabel(component, 'Show simpler explanations')!.click();
    await component.updateComplete;
    await startRatings(component);

    expect(component.querySelectorAll('.official-definition')).toHaveLength(1);
    expect(component.querySelector('.simple-language-panel')?.textContent).toContain('Simpler explanation');
    expect(component.querySelector('.simple-language-panel')?.textContent).not.toContain('Official definition');
  });

  it('lets the respondent choose large text and reverse it', async () => {
    const component = await renderComponent();
    const textControls = component.querySelector('.text-size-control')!;
    textControls.querySelector<HTMLInputElement>('input[value="large"]')!.click();
    await component.updateComplete;
    expect(component.querySelector('main')?.classList.contains('large-text')).toBe(true);

    textControls.querySelector<HTMLInputElement>('input[value="standard"]')!.click();
    await component.updateComplete;
    expect(component.querySelector('main')?.classList.contains('large-text')).toBe(false);
  });

  it('shows one primary smiley route and keeps the precise scale collapsed', async () => {
    const component = await renderComponent();
    inputByValue(component, 'smiley')!.click();
    await component.updateComplete;
    await startRatings(component);

    expect(component.querySelectorAll('.smiley-option')).toHaveLength(5);
    const smileyRadios = [...component.querySelectorAll<HTMLInputElement>('.smiley-option input[type="radio"]')];
    expect(smileyRadios).toHaveLength(5);
    expect(new Set(smileyRadios.map((radio) => radio.name))).toHaveProperty('size', 1);
    expect(component.querySelector('.smiley-option button')).toBeNull();
    const precision = component.querySelector<HTMLDetailsElement>('.precision-scale');
    expect(precision).not.toBeNull();
    expect(precision!.open).toBe(false);
    expect(precision!.querySelectorAll('.rating-option')).toHaveLength(21);
    expect(component.querySelectorAll(':scope > .rating-fieldset')).toHaveLength(0);
  });

  it('lets a precise value replace a smiley landmark without a second response field', async () => {
    const component = await renderComponent();
    inputByValue(component, 'smiley')!.click();
    await component.updateComplete;
    await startRatings(component);

    component.querySelectorAll<HTMLInputElement>('.smiley-option input')[2].click();
    await component.updateComplete;
    const precision = component.querySelector<HTMLDetailsElement>('.precision-scale')!;
    precision.open = true;
    precision.querySelector<HTMLInputElement>('input[value="55"]')!.click();
    await component.updateComplete;

    expect(component.querySelector<HTMLInputElement>('input[value="55"]')?.checked).toBe(true);
    expect(
      [...component.querySelectorAll<HTMLInputElement>('.smiley-option input')].every(
        (radio) => !radio.checked,
      ),
    ).toBe(true);
  });
});

describe('interruption recovery', () => {
  it('saves an incomplete session only after explicit opt-in and restores the exact next step', async () => {
    const component = await renderComponent();
    checkboxByLabel(component, 'Save progress and show a return summary')!.click();
    await component.updateComplete;
    await startRatings(component);
    component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Next question'))!
      .click();
    await component.updateComplete;
    component.remove();

    const restored = await renderComponent();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await restored.updateComplete;
    expect(restored.querySelector('.saved-session')?.textContent).toContain('1 of 21');

    restored.querySelector<HTMLButtonElement>('.saved-session .primary-button')!.click();
    await restored.updateComplete;
    expect(restored.querySelector('.resume-summary')?.textContent).toContain('Rating 2 of 6: Physical Demand');
    expect(restored.querySelector('.resume-summary')?.textContent).toContain('Mental Demand rating');
  });
});

describe('speech support integration', () => {
  it('produces audible browser speech when built-in audio guidance is enabled', async () => {
    const spoken: string[] = [];
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
        cancel: vi.fn(),
        resume: vi.fn(),
        speak: (utterance: FakeUtterance) => spoken.push(utterance.text),
        getVoices: () => [],
      },
    });
    (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;

    const component = await renderComponent();
    const summaryButton = [...component.querySelectorAll<HTMLButtonElement>('.audio-guidance button')][0];
    expect(summaryButton.textContent?.trim()).toBe('Hear a summary of this step');
    const audio = [...component.querySelectorAll<HTMLLabelElement>('label')].find((label) =>
      label.textContent?.includes('Automatically read new questions'),
    )!.querySelector<HTMLInputElement>('input')!;
    audio.click();
    await component.updateComplete;
    expect(spoken.at(-1)).toContain('Built-in audio guidance is on');

    await startRatings(component);
    await component.updateComplete;
    expect(spoken.at(-1)).toContain('Rating 1 of 6. Mental Demand');

    component.querySelector<HTMLInputElement>('.rating-option input[value="70"]')!.click();
    expect(spoken.at(-1)).toContain('Mental Demand, 70, selected');
  });

  it('requires confirmation before a recognised voice rating becomes an answer', async () => {
    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        this.onresult?.({
          results: { 0: { 0: { transcript: 'fifty five' }, length: 1 }, length: 1 },
        });
      }
      stop() {}
    }
    window.webkitSpeechRecognition = FakeRecognition as any;

    const component = await renderComponent();
    await startRatings(component);
    const startVoice = [...component.querySelectorAll<HTMLButtonElement>('.voice-input button')].find(
      (button) => button.textContent?.includes('Start voice input'),
    )!;
    startVoice.click();
    await component.updateComplete;

    expect(component.querySelector('.voice-confirmation')?.textContent).toContain('55 for Mental Demand');
    expect(component.querySelector<HTMLInputElement>('input[value="55"]')?.checked).toBe(false);

    component.querySelector<HTMLButtonElement>('.voice-confirmation .primary-button')!.click();
    await component.updateComplete;
    expect(component.querySelector<HTMLInputElement>('input[value="55"]')?.checked).toBe(true);
  });
});

describe('review and experimental gaze route', () => {
  it('uses the ordered-list marker only once in the comparison review', async () => {
    const component = await renderComponent();
    await startRatings(component);
    await completeRatings(component);
    await completeComparisons(component);

    const first = component.querySelector('.review-list li')!.textContent!.trim();
    expect(first).not.toMatch(/^1\.\s/);
  });

  it('requires calibration, a target dwell and a separate confirmation dwell', async () => {
    const fake = {
      params: { faceMeshSolutionPath: '' },
      begin: vi.fn(async () => fake),
      clearData: vi.fn(async () => undefined),
      clearGazeListener: vi.fn(() => fake),
      detectCompatibility: vi.fn(() => true),
      end: vi.fn(() => fake),
      pause: vi.fn(() => fake),
      recordScreenPosition: vi.fn(() => fake),
      removeMouseEventListeners: vi.fn(() => fake),
      resume: vi.fn(async () => fake),
      saveDataAcrossSessions: vi.fn(() => fake),
      setGazeListener: vi.fn(() => fake),
      showFaceFeedbackBox: vi.fn(() => fake),
      showFaceOverlay: vi.fn(() => fake),
      showPredictionPoints: vi.fn(() => fake),
      showVideoPreview: vi.fn(() => fake),
      stopVideo: vi.fn(() => fake),
    };
    window.webgazer = fake;

    const component = await renderComponent();
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start camera and calibration'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;
    expect(component.querySelector('.gaze-positioning')).not.toBeNull();
    expect(component.querySelector('.gaze-calibration')).toBeNull();
    expect(fake.showVideoPreview).toHaveBeenCalledWith(true);
    expect(fake.showPredictionPoints).toHaveBeenCalledWith(false);

    component.querySelector<HTMLButtonElement>('.gaze-positioning .primary-button')!.click();
    await component.updateComplete;
    expect(component.querySelector('.gaze-calibration')).not.toBeNull();
    expect(component.querySelector('.gaze-camera-preview-slot')).toBeNull();
    expect(fake.showVideoPreview).toHaveBeenCalledWith(false);
    expect(fake.showFaceOverlay).toHaveBeenCalledWith(false);
    expect(fake.showFaceFeedbackBox).toHaveBeenCalledWith(false);
    expect(component.querySelector('.calibration-point')?.getAttribute('style')).toContain('clamp(3rem');

    for (let sample = 0; sample < 27; sample += 1) {
      component.querySelector<HTMLButtonElement>('.calibration-point')!.click();
      await component.updateComplete;
    }
    expect(fake.removeMouseEventListeners).toHaveBeenCalledTimes(1);
    expect(fake.recordScreenPosition).toHaveBeenCalledTimes(27);
    expect(component.textContent).toContain('Calibration complete');
    expect(fake.showPredictionPoints).toHaveBeenCalledWith(true);

    await startRatings(component);
    const answer = component.querySelector<HTMLElement>('.rating-option[data-gaze-label="50 for Mental Demand"]')!;
    let hit: HTMLElement = answer;
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => hit });
    const now = vi.spyOn(performance, 'now');
    now.mockReturnValueOnce(0).mockReturnValueOnce(1000);
    (component as any).handleGazePoint({ x: 10, y: 10 });
    (component as any).handleGazePoint({ x: 10, y: 10 });
    await component.updateComplete;
    expect(component.querySelector('.gaze-confirmation')?.textContent).toContain('50 for Mental Demand');
    expect(component.querySelector<HTMLInputElement>('input[value="50"]')?.checked).toBe(false);

    hit = component.querySelector<HTMLElement>('[data-gaze-confirm]')!;
    now.mockReturnValueOnce(1001).mockReturnValueOnce(2201);
    (component as any).handleGazePoint({ x: 10, y: 10 });
    (component as any).handleGazePoint({ x: 10, y: 10 });
    await component.updateComplete;
    expect(component.querySelector<HTMLInputElement>('input[value="50"]')?.checked).toBe(true);
  });
});

