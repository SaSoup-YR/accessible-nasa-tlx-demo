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
  it('separates participant identity and locks participant adjustments by default', async () => {
    const component = await renderConductor();
    expect(component.textContent).toContain('This researcher page generates a separate participant page');
    expect(component.textContent).toContain('P-001');
    expect(inputFor(component, 'Study ID').placeholder).toBe('TLX-TECH-01');
    expect(inputFor(component, 'Study title').placeholder).toBe('Route-planning workload study');
    expect(inputFor(component, 'Task label').placeholder).toContain('planning a route');

    const adjustment = inputFor(component, 'Allow optional participant adjustments');
    expect(adjustment.checked).toBe(false);
  });

  it('generates a separate participant link with the prepared support locked', async () => {
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
    expect(config?.support.allowParticipantChanges).toBe(false);
    expect(new URL(link).pathname).toMatch(/index\.html$/);
    expect(component.textContent).toContain('Configuration ready');
  });

  it('identifies a result export as the wrong file type and moves focus to the import error', async () => {
    const component = await renderConductor();
    const fileInput = component.querySelector<HTMLInputElement>('input[type="file"]')!;
    const resultExport = {
      schemaVersion: 1,
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
