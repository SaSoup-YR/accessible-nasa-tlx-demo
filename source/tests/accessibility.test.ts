// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import '../src/accessible-nasa-tlx';
import '../src/study-conductor';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import { buildParticipantUrl, createStudyConfig } from '../src/study';

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component;
}

async function scan(component: AccessibleNasaTlx) {
  return axe.run(component, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
}

function checkbox(component: AccessibleNasaTlx, text: string) {
  const label = [...component.querySelectorAll<HTMLLabelElement>('label')].find((item) =>
    item.textContent?.includes(text),
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
  window.history.replaceState({}, '', '/');
});

describe('automated structural accessibility scan', () => {
  it('finds no detectable violations on the introduction', async () => {
    const component = await renderComponent();
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations on a rating with configurable support active', async () => {
    const component = await renderComponent();
    checkbox(component, 'Show simpler explanations')!.click();
    component.querySelector<HTMLInputElement>('input[value="smiley"]')!.click();
    component.querySelector('.text-size-control input[value="large"]')!.dispatchEvent(
      new Event('change', { bubbles: true }),
    );
    checkbox(component, 'Save progress and show a return summary')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the six ratings'))!
      .click();
    await component.updateComplete;

    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations on the study-conductor setup page', async () => {
    const conductor = document.createElement('study-conductor-app') as any;
    document.body.append(conductor);
    await conductor.updateComplete;
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the configured presentation-only preference route', async () => {
    const config = createStudyConfig({
      studyId: 'A11Y-01',
      studyTitle: 'Accessibility route check',
      taskLabel: 'the test task',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'presentation-only',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
    });
    const url = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', url.pathname + url.hash);
    const component = await renderComponent();
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });
});
