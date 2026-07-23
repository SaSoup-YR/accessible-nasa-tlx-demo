// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../src/study-conductor';
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
});

describe('study conductor defaults and guidance', () => {
  it('separates participant identity and starts with optional participant choice for an accessibility evaluation', async () => {
    const component = await renderConductor();
    expect(component.textContent).toContain('This researcher page generates a separate participant page');
    expect(component.textContent).toContain('P-001');
    expect(inputFor(component, 'Study ID').placeholder).toBe('TLX-TECH-01');
    expect(inputFor(component, 'Study title').placeholder).toBe('Route-planning workload study');
    expect(inputFor(component, 'Task label').placeholder).toContain('planning a route');

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
    expect(component.querySelector<HTMLTextAreaElement>('.qualtrics-setup textarea')!.value)
      .toContain('id="accessible-nasa-tlx-frame"');
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
